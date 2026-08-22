import { NextResponse } from "next/server";
import { getDogs } from "@/lib/queries";
import { breeds } from "@/lib/data/breeds";
import { isForSale, isPhotoPending, PUPPY_PRICE_FLOOR, type Dog } from "@/lib/data/catalog";
import { phones, site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { runSalesAgent, type ChatMsg, type DogSuggestion } from "@/lib/agent/sales-agent";

export const runtime = "nodejs";

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
  if (/health|vaccin|guarantee|sick|vet|microchip|papers/.test(q))
    return `Every puppy leaves us vaccinated, dewormed, microchipped and vet-checked, with pedigree papers and a written health guarantee of up to 36 months on hereditary conditions.`;
  if (/pay|mpesa|m-pesa|stripe|deposit|instal|card/.test(q))
    return `International cards through Stripe, or M-Pesa for local buyers. A deposit reserves the puppy and the balance falls due on delivery. Which one were you looking at?`;
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

export async function POST(req: Request) {
  let messages: ChatMsg[] = [];
  try {
    const body = (await req.json()) as { messages?: ChatMsg[] };
    messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages supplied" }, { status: 400 });
  }

  const agent = await runSalesAgent(messages);
  if (agent) return NextResponse.json(agent);

  // Fallback path.
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const pool = await getDogs();
  const suggestions = matchDogs(last, pool);
  const showCards = /price|cost|budget|puppy|train|guard|family|breed|recommend|looking|want|show|buy|afford|dog|farm|protect/i.test(last);

  return NextResponse.json({
    reply: ruleReply(last, pool),
    suggestions: showCards ? suggestions.map(toSuggestion) : [],
  });
}
