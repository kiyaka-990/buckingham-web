import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { getDogs } from "@/lib/queries";
import { isForSale, isPhotoPending, PUPPY_PRICE_CEILING, PUPPY_PRICE_FLOOR } from "@/lib/data/catalog";
import { phones, site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { dueForFollowUp, recordTouch, unsubscribeUrl, MAX_TOUCHES } from "@/lib/leads";
import { recordAgentAction } from "@/lib/agent/audit";
import { sendMarketingFollowUp } from "@/lib/email";

/**
 * "Ivy" — the follow-up half of the sales function.
 *
 * Duke works the visitor who is on the site right now. Ivy works the ones who
 * left: she reads a lead's actual conversation notes, checks what is still
 * available today, and writes one short, specific email to that person.
 *
 * She is deliberately not an autonomous mailer. She drafts; the code around her
 * decides who may be written to at all ({@link dueForFollowUp}), and refuses to
 * send anything she could not ground in live inventory. The failure mode being
 * designed against is the obvious one — an LLM cheerfully emailing a hundred
 * people about a puppy that sold last week.
 */

export type Draft = { subject: string; body: string };

/** Bounds on what a follow-up may be, enforced after generation. */
const MAX_SUBJECT = 120;
const MAX_BODY = 1800;

const inventoryLine = (d: { name: string; breedName: string; sex: string; ageLabel: string; price: number; slug: string }) =>
  `${d.slug} | ${d.name} — ${d.breedName}, ${d.sex}, ${d.ageLabel} | ${formatPrice(d.price)}`;

function systemPrompt(available: string) {
  return `You are Ivy, who follows up enquiries for ${site.name}, a kennel in ${site.contact.address.locality}, Kenya.

Someone contacted the kennel, gave their details and was not sold to. You write ONE short email to that person.

PUPPIES AVAILABLE TODAY — the only dogs you may mention by name:
${available}

HARD RULES
- Mention only puppies from the list above. If the one they asked about is not on it, say plainly that it has gone and offer the closest match that IS listed.
- Never invent a dog, a price, an age, a litter or a date. Every fact comes from the list.
- Prices run ${formatPrice(PUPPY_PRICE_FLOOR)}–${formatPrice(PUPPY_PRICE_CEILING)}. Never quote outside that, never offer a discount, never invent a deadline or a "special offer".
- The dogs are NOT Kennel Club registered and have NO pedigree papers. Never imply otherwise.
- Adults are breeding stock and are never for sale.
- A deposit reserves a puppy; the balance falls due on delivery.

TONE
- Write like a person at a small kennel, not a marketing department. Plain British English.
- 90-140 words. No bullet lists, no emoji, no exclamation marks, no "I hope this email finds you well", no "Just checking in!", no invented urgency.
- Refer to what they actually asked about. If they said it was for a farm, talk about the farm.
- One clear next step: reply to this email, call, or come and see the dogs.
- Do not write a subject line longer than 8 words.
- Sign off as Ivy at ${site.shortName}. Do not add a postscript, a signature block, contact details or an unsubscribe line — those are appended automatically.

Return your answer as JSON: {"subject": "...", "body": "..."} and nothing else.`;
}

function leadBrief(lead: {
  name: string; interest: string | null; breedSlug: string | null; dogSlug: string | null;
  budgetUsd: number | null; location: string | null; notes: string | null;
  touches: number; createdAt: Date;
}) {
  const daysAgo = Math.round((Date.now() - lead.createdAt.getTime()) / 86_400_000);
  return [
    `Name: ${lead.name}`,
    `First contacted us: ${daysAgo} day(s) ago`,
    `This is follow-up number ${lead.touches + 1} of at most ${MAX_TOUCHES}.`,
    lead.interest ? `What they asked about: ${lead.interest}` : null,
    lead.dogSlug ? `Specific puppy they were looking at: ${lead.dogSlug}` : null,
    lead.breedSlug ? `Breed of interest: ${lead.breedSlug}` : null,
    lead.budgetUsd ? `Budget mentioned: ${formatPrice(lead.budgetUsd)}` : null,
    lead.location ? `Where they are: ${lead.location}` : null,
    lead.notes ? `Notes from the conversation: ${lead.notes}` : null,
    lead.touches > 0
      ? `They did not reply to the previous email. Do not repeat it — take a different angle and be shorter.`
      : null,
  ].filter(Boolean).join("\n");
}

/** Strip anything the model may have wrapped the JSON in. */
function parseDraft(text: string): Draft | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as Partial<Draft>;
    const subject = String(raw.subject ?? "").trim().slice(0, MAX_SUBJECT);
    const body = String(raw.body ?? "").trim().slice(0, MAX_BODY);
    if (!subject || body.length < 40) return null;
    return { subject, body };
  } catch {
    return null;
  }
}

/**
 * Draft one follow-up. Returns null rather than a generic email when anything
 * is off — silence is a better outcome than a bad email to a real customer.
 */
export async function draftFollowUp(
  lead: Parameters<typeof leadBrief>[0],
  availableLines: string
): Promise<Draft | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic();
  try {
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
      max_tokens: 1200,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: [{ type: "text", text: systemPrompt(availableLines), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: leadBrief(lead) }],
    });

    if (res.stop_reason === "refusal") {
      console.warn("[marketing-agent] draft refused for lead");
      return null;
    }

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return parseDraft(text);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.warn(`[marketing-agent] API error ${err.status}:`, err.message);
    } else {
      console.warn("[marketing-agent] unexpected failure:", err);
    }
    return null;
  }
}

export type NurtureReport = {
  considered: number;
  sent: number;
  skipped: number;
  reasons: string[];
};

/**
 * One nurture pass. Called by the daily cron.
 *
 * Who may be contacted is decided by dueForFollowUp() before Ivy sees anyone,
 * and a touch is only recorded when an email actually went out — a lead whose
 * send failed keeps its turn rather than silently burning one of three.
 */
export async function runNurturePass(limit = 25): Promise<NurtureReport> {
  const report: NurtureReport = { considered: 0, sent: 0, skipped: 0, reasons: [] };

  const leads = await dueForFollowUp(limit);
  report.considered = leads.length;
  if (leads.length === 0) return report;

  // One inventory read for the whole pass — it cannot change underneath us
  // mid-batch, and every draft is grounded in the same snapshot.
  const dogs = await getDogs();
  const sellable = dogs.filter((d) => isForSale(d) && d.status === "available" && !isPhotoPending(d));

  if (sellable.length === 0) {
    report.skipped = leads.length;
    report.reasons.push("no available puppies to write about");
    return report;
  }

  const availableLines = sellable.map(inventoryLine).join("\n");

  for (const lead of leads) {
    const draft = await draftFollowUp(lead, availableLines);
    if (!draft) {
      report.skipped += 1;
      report.reasons.push(`no draft for ${lead.email}`);
      await recordAgentAction({
        agent: "ivy",
        action: "nurture_draft_failed",
        status: "failed",
        contact: lead.email,
        summary: `Could not draft follow-up ${lead.touches + 1} for ${lead.name}.`,
        payload: { leadId: lead.id },
      });
      continue;
    }

    const { delivered } = await sendMarketingFollowUp({
      to: lead.email,
      name: lead.name,
      subject: draft.subject,
      body: draft.body,
      unsubscribeUrl: unsubscribeUrl(lead.optOutToken),
    });

    if (!delivered) {
      report.skipped += 1;
      report.reasons.push(`delivery failed for ${lead.email}`);
      continue;
    }

    // Only a real send costs the lead one of its three touches.
    await recordTouch(lead.id);
    report.sent += 1;

    await recordAgentAction({
      agent: "ivy",
      action: "nurture_email",
      contact: lead.email,
      dogSlug: lead.dogSlug,
      summary: `Follow-up ${lead.touches + 1}/${MAX_TOUCHES} to ${lead.name}: "${draft.subject}"`,
      payload: { leadId: lead.id, subject: draft.subject, body: draft.body },
    });
  }

  return report;
}

/** Quick pipeline snapshot for the admin dashboard. */
export async function pipelineSummary() {
  const rows = await db.lead.groupBy({ by: ["stage"], _count: { _all: true } });
  const byStage = Object.fromEntries(rows.map((r) => [r.stage, r._count._all]));
  return {
    byStage,
    total: rows.reduce((n, r) => n + r._count._all, 0),
    contactable: await db.lead.count({
      where: { unsubscribedAt: null, stage: { notIn: ["won", "lost", "unsubscribed"] } },
    }),
  };
}

export { phones };
