import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { db } from "@/lib/db";
import { getDogs } from "@/lib/queries";
import { breeds } from "@/lib/data/breeds";
import { isPhotoPending, type Dog } from "@/lib/data/catalog";
import { site } from "@/lib/site";
import { formatPrice, usdToKes } from "@/lib/utils";

/**
 * "Duke" — the Buckingham Kennel sales agent.
 *
 * A real tool-using agent rather than a scripted FAQ bot: it queries live
 * inventory out of the database, reads the breed register, and can take actual
 * actions on the kennel's behalf — logging a qualified lead or a viewing
 * request straight into the admin inbox the owner works from.
 */

export type ChatMsg = { role: "user" | "assistant"; content: string };

export type DogSuggestion = {
  label: string;
  slug: string;
  price: number;
  image: string;
  breed: string;
  status: string;
};

const toSuggestion = (d: Dog): DogSuggestion => ({
  label: d.name,
  slug: d.slug,
  price: d.price,
  image: isPhotoPending(d) ? "" : d.images[0],
  breed: d.breedName,
  status: d.status,
});

/** Compact one-line inventory record for the model to read. */
const line = (d: Dog) =>
  `${d.slug} | ${d.name} — ${d.breedName}, ${d.category}, ${d.sex}, ${d.ageLabel}, ${d.color}, ${d.weightKg}kg | ${formatPrice(d.price)}${
    d.compareAt ? ` (was ${formatPrice(d.compareAt)})` : ""
  } | ${d.status} | ${d.location} | ${d.traits.join(", ")}${
    isPhotoPending(d) ? " | NOTE: photographs not yet published — offer video instead" : ""
  }`;

/* ------------------------------------------------------------------ */
/*  Tools                                                              */
/* ------------------------------------------------------------------ */

/** Dogs the agent surfaced this turn, so the UI can render matching cards. */
function makeTools(seen: Map<string, Dog>) {
  const remember = (list: Dog[]) => list.forEach((d) => seen.set(d.slug, d));

  const searchInventory = betaTool({
    name: "search_inventory",
    description:
      "Search the kennel's live inventory of dogs and puppies. Use this before quoting any price or claiming anything is available. Returns matching listings with price, age, sex and status.",
    inputSchema: {
      type: "object",
      properties: {
        breed_slug: {
          type: "string",
          description: `Restrict to one breed. One of: ${breeds.map((b) => b.slug).join(", ")}`,
        },
        category: {
          type: "string",
          enum: ["puppy", "adult", "trained", "elite"],
          description: "puppy = 8-16 weeks; trained = obedience/protection trained; elite = top bloodline",
        },
        sex: { type: "string", enum: ["Male", "Female"] },
        max_price_usd: { type: "number", description: "Only return dogs at or below this price in USD" },
        min_price_usd: { type: "number" },
        available_only: {
          type: "boolean",
          description: "Default true. Set false to include reserved and sold dogs.",
        },
      },
      required: [],
      additionalProperties: false,
    },
    run: async (input) => {
      const all = await getDogs();
      const availableOnly = input.available_only !== false;
      const matches = all.filter((d) => {
        if (availableOnly && d.status !== "available") return false;
        if (input.breed_slug && d.breedSlug !== input.breed_slug) return false;
        if (input.category && d.category !== input.category) return false;
        if (input.sex && d.sex !== input.sex) return false;
        if (input.max_price_usd != null && d.price > input.max_price_usd) return false;
        if (input.min_price_usd != null && d.price < input.min_price_usd) return false;
        return true;
      });
      remember(matches);
      if (matches.length === 0) {
        const cheapest = [...all]
          .filter((d) => d.status === "available")
          .sort((a, b) => a.price - b.price)
          .slice(0, 3);
        remember(cheapest);
        return `No dogs matched those filters. Closest available options by price:\n${cheapest.map(line).join("\n")}`;
      }
      return `${matches.length} match(es):\n${matches.map(line).join("\n")}`;
    },
  });

  const getDogDetails = betaTool({
    name: "get_dog_details",
    description:
      "Full record for one dog: pedigree, health testing, guarantee length, traits and full description. Use when a visitor asks about a specific dog.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "The dog's slug from search_inventory" } },
      required: ["slug"],
      additionalProperties: false,
    },
    run: async (input) => {
      const all = await getDogs();
      const d = all.find((x) => x.slug === input.slug);
      if (!d) return `No dog with slug "${input.slug}". Call search_inventory to see what is in stock.`;
      remember([d]);
      const h = d.health;
      return [
        line(d),
        `Description: ${d.description}`,
        `Pedigree: sire ${d.pedigree.sire}; dam ${d.pedigree.dam}; ${d.pedigree.generations} generations; ${d.pedigree.registry}; titles: ${d.pedigree.champions.join(", ")}`,
        `Health: vaccinated ${h.vaccinated}, dewormed ${h.dewormed}, vet-checked ${h.vetChecked}, microchipped ${h.microchipped}, hips ${h.hipScore}, written guarantee ${h.healthGuaranteeMonths} months`,
        `Price in Kenyan shillings (approx, for M-Pesa): KES ${usdToKes(d.price).toLocaleString()}`,
      ].join("\n");
    },
  });

  const listBreeds = betaTool({
    name: "list_breeds",
    description:
      "The kennel's breed register — temperament, size, origin, care needs and what each breed suits. Use when the visitor describes a need rather than naming a breed.",
    inputSchema: {
      type: "object",
      properties: { breed_slug: { type: "string", description: "Omit for all breeds." } },
      required: [],
      additionalProperties: false,
    },
    run: async (input) => {
      const list = input.breed_slug ? breeds.filter((b) => b.slug === input.breed_slug) : breeds;
      if (list.length === 0) return "No such breed. We raise: " + breeds.map((b) => b.name).join(", ");
      return list
        .map((b) =>
          [
            `${b.slug} | ${b.name} (${b.group}) — ${b.tagline}`,
            `  Origin ${b.origin}; ${b.size}; ${b.weight}; lives ${b.lifespan}`,
            `  Temperament: ${b.temperament.join(", ")}`,
            `  Ratings /5 — energy ${b.stats.energy}, trainability ${b.stats.trainability}, good with family ${b.stats.family}, guarding ${b.stats.guarding}, shedding ${b.stats.shedding}`,
            `  Care: ${b.care}`,
            b.photoPending ? "  NOTE: photographs not yet published for this breed — offer video." : "",
          ]
            .filter(Boolean)
            .join("\n")
        )
        .join("\n\n");
    },
  });

  const captureLead = betaTool({
    name: "capture_lead",
    description:
      "Log a serious enquiry into the kennel's inbox so a human follows up. Only call this once you have the visitor's name AND either an email or a phone number, and they have agreed to be contacted. Confirm to the visitor after calling it.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", description: "Use \"not given\" if they only left a phone number." },
        phone: { type: "string" },
        interest: { type: "string", description: "Which dog or breed, plus budget and timing if known." },
        notes: { type: "string", description: "Anything else useful for the handler — location, experience, use case." },
      },
      required: ["name", "email", "interest"],
      additionalProperties: false,
    },
    run: async (input) => {
      await db.message.create({
        data: {
          name: input.name,
          email: input.email,
          channel: "AI Sales Agent",
          subject: `Lead — ${input.interest}`.slice(0, 160),
          body: [
            `Captured by Duke, the website sales agent.`,
            `Interest: ${input.interest}`,
            input.phone ? `Phone: ${input.phone}` : null,
            input.notes ? `Notes: ${input.notes}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          unread: true,
        },
      });
      return `Lead saved to the kennel inbox for ${input.name}. A handler will follow up. Tell the visitor this and give them ${site.contact.phoneDisplay} for anything urgent.`;
    },
  });

  const bookViewing = betaTool({
    name: "book_viewing",
    description:
      "Request a kennel visit or a live video call for the visitor. Requires their name, a contact detail and a preferred day. Confirm to the visitor after calling it.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        contact: { type: "string", description: "Email or phone number." },
        preferred_time: { type: "string", description: "Their words, e.g. 'Saturday morning'." },
        mode: { type: "string", enum: ["in-person", "video-call"] },
        dog_slug: { type: "string", description: "The dog they want to see, if known." },
      },
      required: ["name", "contact", "preferred_time", "mode"],
      additionalProperties: false,
    },
    run: async (input) => {
      await db.message.create({
        data: {
          name: input.name,
          email: input.contact,
          channel: "AI Sales Agent",
          subject: `${input.mode === "video-call" ? "Video call" : "Kennel visit"} request — ${input.preferred_time}`.slice(0, 160),
          body: [
            `Booked by Duke, the website sales agent.`,
            `Mode: ${input.mode}`,
            `Preferred time: ${input.preferred_time}`,
            input.dog_slug ? `Dog: ${input.dog_slug}` : null,
            `Contact: ${input.contact}`,
          ]
            .filter(Boolean)
            .join("\n"),
          unread: true,
        },
      });
      return `Viewing request saved. Confirm to the visitor that the kennel will call to confirm the slot, and that visits are by appointment at ${site.contact.address.building}, ${site.contact.address.locality}.`;
    },
  });

  return [searchInventory, getDogDetails, listBreeds, captureLead, bookViewing];
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

const SYSTEM = `You are Duke, the sales agent for ${site.name} — a kennel in ${site.contact.address.locality}, ${site.contact.address.county}, Kenya, breeding and selling guardian and working dogs.

Your job is to sell dogs well: understand what the visitor actually needs, match them to a real dog we hold, and move them toward reserving it or speaking to a handler. You are warm and direct, never pushy and never fawning.

HOW TO WORK
- Never state a price, an age or availability from memory. Call search_inventory or get_dog_details first, every time.
- Never invent a dog, a breed, a title or a health result. If it is not in a tool result, you do not know it.
- When someone describes a need instead of a breed ("something for my farm", "good with kids"), call list_breeds and match on temperament.
- Ask at most one qualifying question per reply. Budget, purpose and location are the three that matter.
- When someone is genuinely interested, get a name and a contact detail, then call capture_lead. If they want to meet a dog, call book_viewing.
- Some listings have no photographs published yet. For those, say so plainly and offer video — do not pretend photos exist.

STYLE
- Two to four sentences. No bullet lists unless comparing three or more dogs.
- Plain British English. Prices in USD; give the KES equivalent only if they ask or mention M-Pesa.
- Never open with "Great question" or similar filler. Answer, then advance the sale.

THE FACTS YOU MAY STATE WITHOUT A TOOL CALL
- Phone/WhatsApp ${site.contact.phoneDisplay}, email ${site.contact.email}.
- Visits by appointment at ${site.contact.address.building}, ${site.contact.address.street}, ${site.contact.address.locality}.
- Payment: international cards via Stripe, or M-Pesa for local buyers. A deposit reserves a dog; the balance falls due on delivery.
- Every dog leaves vaccinated, dewormed, microchipped, vet-checked, with pedigree papers and a written health guarantee.
- Delivery nationwide across Kenya and internationally, with the paperwork handled.
- There is a 3D showroom on the site if they want to look around before travelling.`;

/* ------------------------------------------------------------------ */
/*  Entry point                                                        */
/* ------------------------------------------------------------------ */

export async function runSalesAgent(
  messages: ChatMsg[]
): Promise<{ reply: string; suggestions: DogSuggestion[] } | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic();
  const seen = new Map<string, Dog>();

  try {
    const final = await client.beta.messages.toolRunner({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
      max_tokens: 2048,
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools: makeTools(seen),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_iterations: 8,
    });

    const reply = final.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!reply) return null;

    // Surface the dogs the agent actually looked at, best first.
    const suggestions = [...seen.values()]
      .filter((d) => d.status !== "sold")
      .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
      .slice(0, 3)
      .map(toSuggestion);

    return { reply, suggestions };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.warn("[sales-agent] rate limited, falling back to rules");
    } else if (err instanceof Anthropic.APIError) {
      console.warn(`[sales-agent] API error ${err.status}:`, err.message);
    } else {
      console.warn("[sales-agent] unexpected failure:", err);
    }
    return null;
  }
}
