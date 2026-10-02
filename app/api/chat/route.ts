import { NextResponse } from "next/server";
import { getDogs } from "@/lib/queries";
import { breeds } from "@/lib/data/breeds";
import { isForSale, isPhotoPending, PUPPY_PRICE_FLOOR, type Dog } from "@/lib/data/catalog";
import { phones, site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { runSalesAgent, type ChatMsg, type DogSuggestion } from "@/lib/agent/sales-agent";
import { rateLimit, clientKey, tooMany } from "@/lib/rate-limit";
import { captureLead } from "@/lib/leads";
import { logChat, validSessionId } from "@/lib/chat-log";

export const runtime = "nodejs";

/* ------------------------------------------------------------------ */
/*  Visitor gate                                                       */
/* ------------------------------------------------------------------ */

/**
 * How many questions a visitor gets before we ask who they are.
 *
 * Zero: everyone signs in (name + email, phone optional) before the first
 * message, so every conversation is attributable and shows up on the admin
 * dashboard. The widget asks up front; this constant is what the server
 * enforces for anyone who POSTs the endpoint directly.
 */
const FREE_TURNS = 0;

type Visitor = { name: string; email: string; phone: string | null };

/** Loose on purpose — this is a lead form, not an auth system. We only need
 *  enough structure that the address is plausibly deliverable. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readVisitor(raw: unknown): Visitor | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const name = String(v.name ?? "").trim().slice(0, 160);
  const email = String(v.email ?? "").trim().toLowerCase().slice(0, 160);
  if (name.length < 2 || !EMAIL_RE.test(email)) return null;
  // Optional. Keep only what a phone number can contain, and drop it if what is
  // left is too short to be one rather than failing the sign-in over it.
  const rawPhone = String(v.phone ?? "").replace(/[^\d+\s-]/g, "").trim().slice(0, 20);
  const phone = rawPhone.replace(/\D/g, "").length >= 7 ? rawPhone : null;
  return { name, email, phone };
}

/* ------------------------------------------------------------------ */
/*  Fallback: keyword matching over live inventory.                    */
/*  Used only when ANTHROPIC_API_KEY is unset or the API is down, so   */
/*  the widget still sells rather than apologising.                    */
/* ------------------------------------------------------------------ */

/** Only puppies can be suggested — the adults are the breeding programme. */
function matchDogs(query: string, pool: Dog[], max = 3): Dog[] {
  const q = query.toLowerCase();
  const sellable = pool.filter((d) => isForSale(d) && d.status !== "sold");
  const wantsGuardian = /train|guard|protect|security|police|patrol|farm|livestock/.test(q);
  const wantsFamily = /family|kid|child|gentle|home|companion/.test(q);
  const priceMatch = q.match(/(\d[\d,]{2,})/);
  const budget = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : undefined;

  let list = sellable;

  const breedHit = breeds.find(
    (b) =>
      q.includes(b.name.toLowerCase()) ||
      q.includes(b.shortName.toLowerCase()) ||
      q.includes(b.slug.replace(/-/g, " "))
  );
  if (breedHit) list = list.filter((d) => d.breedSlug === breedHit.slug);
  if (wantsGuardian)
    list = list.filter((d) => ["caucasian-shepherd", "kangal", "royal-black-shepherd"].includes(d.breedSlug));
  if (wantsFamily)
    list = list.filter((d) => ["white-swiss-shepherd", "american-akita", "royal-black-shepherd"].includes(d.breedSlug));
  if (budget) list = list.filter((d) => d.price <= budget);

  // Relax progressively rather than returning nothing, but never over-quote.
  if (list.length === 0) list = sellable.filter((d) => !budget || d.price <= budget);
  if (list.length === 0) list = sellable;

  return list
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    .slice(0, max);
}

function ruleReply(userText: string, pool: Dog[]): string {
  const q = userText.toLowerCase();
  const sellable = pool.filter((d) => isForSale(d) && d.status !== "sold");
  const min = sellable.length ? Math.min(...sellable.map((d) => d.price)) : PUPPY_PRICE_FLOOR;

  if (/adult|grown|full.?grown|big dog|parent|sire|dam|stud/.test(q))
    return `Our adult dogs are our breeding programme and none of them are for sale — they are on the site so you can see the parents behind a litter, and you are welcome to come and meet them. We sell puppies only, from ${formatPrice(min)}. Here is what is available:`;
  if (/deliver|ship|nairobi|mombasa|transport|abroad|export/.test(q))
    return `We deliver nationwide across Kenya and internationally — climate-controlled transport with all paperwork handled, arranged once a deposit is down. Whereabouts are you?`;
  // Registration is asked about often and the answer is no. It gets its own
  // branch, ahead of the health branch, so "papers" never lands on an answer
  // that lists what we do give and leaves the buyer to infer the rest.
  if (/pedigree|papers|paperwork|registrat|registered|kennel club|kc |eakc|certificate|certified|title|champion|show/.test(q))
    return `Straight answer: no. Our puppies are not Kennel Club registered and they do not come with a pedigree certificate. The parents were imported from overseas but arrived without pedigree certificates themselves, so there is no registered line to pass on. What you do get with every puppy is its vaccination record, deworming history, microchip, a vet check and a written health guarantee. If you specifically need a registered dog for showing or registered breeding, we are not the right kennel — I would rather tell you now.`;
  if (/health|vaccin|guarantee|sick|vet|microchip/.test(q))
    return `Every puppy leaves us vaccinated, dewormed, microchipped and vet-checked, with its full vaccination record and a written health guarantee of up to 36 months on hereditary conditions.`;
  if (/pay|mpesa|m-pesa|stripe|deposit|instal|card/.test(q))
    return `International cards through Stripe, or M-Pesa for local buyers. A deposit reserves the puppy and the balance falls due on delivery. Which one were you looking at?`;
  if (/\bservices?\b|what do you (offer|do)/.test(q))
    return `Besides puppies we offer dog training (obedience, family protection and personal-protection work), grooming, dog stands from KES 150,000, stud services and delivery across Kenya and abroad. Call or WhatsApp ${phones.map((p) => p.display).join(" or ")} for rates. You'll find the full list on our Services page.`;
  if (/groom|bath|de-?shed|spa\b/.test(q))
    return `Yes, we offer grooming — bathing, de-shedding, coat care and nail care by trained groomers. Call or WhatsApp ${phones.map((p) => p.display).join(" or ")} to book an appointment.`;
  if (/\bstands?\b/.test(q))
    return `We sell dog stands, from KES 150,000. For current availability, sizes and finish, WhatsApp ${phones[0].display} and the team will confirm the details.`;
  if (/(dog|obedience|handler).{0,20}train|train(ing|er)\b.{0,20}(service|program|course|class)|obedience/.test(q))
    return `Yes, we run dog training — obedience and house manners, family protection and advanced personal-protection work, led by our handlers. Call or WhatsApp ${phones.map((p) => p.display).join(" or ")} to discuss your dog.`;
  if (/train|guard|protect|security|police|patrol|farm|livestock/.test(q))
    return `For protection and estate work we'd point you at the Caucasian Shepherd and the Kangal; for handler-focused personal protection, the Royal Black German Shepherd. A few puppies worth seeing:`;
  if (/family|kid|child|gentle|companion/.test(q))
    return `For families we usually recommend the White Long Coat Swiss Shepherd — a shepherd's brain and loyalty without the hard edge — or a well-socialised black shepherd puppy. Have a look:`;
  if (/price|cost|how much|budget|cheap|afford/.test(q))
    return `Our puppies start at ${formatPrice(min)} and the price depends on the breed and the litter. Adults are not for sale at any price — they are our breeding stock. Tell me your budget and what you need the dog for and I'll narrow it down:`;
  if (/contact|call|phone|whatsapp|visit|address|location|where/.test(q))
    return `Call or WhatsApp ${phones.map((p) => p.display).join(" or ")}, or email ${site.contact.email}. Visits are by appointment at our ${site.contact.address.locality} facility — or walk the 3D showroom here first.`;
  if (/hello|hi\b|hey|greet|help/.test(q) || q.trim().length < 4)
    return `Welcome to Buckingham Kennel. We breed five guardian and working lines and sell the puppies, from ${formatPrice(min)}. Tell me what you need the dog for — family, farm or protection — and I'll match you.`;
  return `Here are the puppies I'd put in front of you first. Tell me your budget or the breed you had in mind and I'll refine it — or ask me about health, delivery or payment.`;
}

const toSuggestion = (d: Dog): DogSuggestion => ({
  label: d.name,
  slug: d.slug,
  price: d.price,
  image: isPhotoPending(d) ? "" : d.images[0],
  breed: d.breedName,
  status: d.status,
});

/* ------------------------------------------------------------------ */

/** Every turn is billed to us, so the transcript is bounded on both axes. */
const MAX_TURNS = 20;
const MAX_CHARS_PER_TURN = 2000;

export async function POST(req: Request) {
  // This endpoint spends money with every call. Without a ceiling it is a
  // free way to run up the kennel's model bill.
  const limit = await rateLimit("chat", clientKey(req), 30, 10 * 60_000);
  if (!limit.ok) return tooMany(limit, "You're sending messages very quickly. Please wait a moment.");

  let messages: ChatMsg[] = [];
  let visitor: Visitor | null = null;
  let sessionId: string | null = null;
  try {
    const body = (await req.json()) as { messages?: ChatMsg[]; visitor?: unknown; sessionId?: unknown };
    visitor = readVisitor(body.visitor);
    sessionId = validSessionId(body.sessionId) ? body.sessionId : null;
    messages = (Array.isArray(body.messages) ? body.messages.slice(-MAX_TURNS) : [])
      // Roles are whitelisted so a crafted transcript cannot smuggle in a
      // "system" turn and rewrite the agent's instructions.
      .filter((m) => m && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role, content: String(m.content ?? "").slice(0, MAX_CHARS_PER_TURN) }));
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages supplied" }, { status: 400 });
  }

  // The gate. Enforced here rather than in the widget, because a gate that
  // lives only in the browser is a suggestion: anyone can POST this endpoint
  // directly, and that is exactly what an abusive caller does.
  const userTurns = messages.filter((m) => m.role === "user").length;
  if (userTurns > FREE_TURNS && !visitor) {
    return NextResponse.json({
      gate: true,
      reply:
        "Before we start — may I take your name and email? It means I can send you the details of anything we talk about, and one of the team can follow up properly if I'm not enough. It takes a second and we won't pass it on to anyone.",
      suggestions: [],
    });
  }

  // First message of a signed-in conversation: put them in the pipeline.
  // Bounded to that one turn so we are not writing to the database on every
  // message of a long conversation. captureLead upserts on email, so a
  // returning visitor sharpens their existing record rather than duplicating it.
  if (visitor && userTurns === 1) {
    const interest = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    void captureLead({
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone,
      source: "chat",
      interest: interest.slice(0, 300),
      notes: "Signed in through the chat widget.",
      // Duke re-scores properly via capture_lead once he has qualified them;
      // this is only a floor so the lead is not sitting at zero.
      score: 25,
    }).catch((err) => console.error("[chat] captureLead failed", err));
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  /** Every answer is logged against the session before it is returned. */
  const respond = async (payload: { reply: string; suggestions: unknown[] }) => {
    if (sessionId && visitor) {
      await logChat({ sessionId, visitor, userMessage: lastUser, reply: payload.reply });
    }
    return NextResponse.json(payload);
  };

  const agent = await runSalesAgent(messages, visitor);
  if (agent) return respond(agent);

  // Fallback path.
  const pool = await getDogs();
  const suggestions = matchDogs(lastUser, pool);
  const showCards = /price|cost|budget|puppy|train|guard|family|breed|recommend|looking|want|show|buy|afford|dog|farm|protect/i.test(lastUser);

  return respond({
    reply: ruleReply(lastUser, pool),
    suggestions: showCards ? suggestions.map(toSuggestion) : [],
  });
}
