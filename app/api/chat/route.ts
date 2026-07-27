import { NextResponse } from "next/server";
import { dogs } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";

type ChatMsg = { role: "user" | "assistant"; content: string };

function pickSuggestions(query: string, max = 3) {
  const q = query.toLowerCase();
  const wantsPuppy = /pupp/.test(q);
  const wantsTrained = /train|guard|protect|security|police/.test(q);
  const wantsFamily = /family|kid|child|gentle|home/.test(q);
  const priceMatch = q.match(/(\d[\d,]{2,})/);
  const budget = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : undefined;

  let pool = dogs.filter((d) => d.status !== "sold");
  const breedHit = breeds.find((b) => q.includes(b.name.toLowerCase()) || q.includes(b.slug.replace("-", " ")));
  if (breedHit) pool = pool.filter((d) => d.breedSlug === breedHit.slug);
  if (wantsPuppy) pool = pool.filter((d) => d.category === "puppy");
  if (wantsTrained) pool = pool.filter((d) => d.category === "trained" || d.category === "elite");
  if (wantsFamily) pool = pool.filter((d) => ["golden-retriever", "french-bulldog", "british-bulldog"].includes(d.breedSlug) || d.category === "puppy");
  if (budget) pool = pool.filter((d) => d.price <= budget);
  if (pool.length === 0) {
    // Relax breed/category but keep budget so we never over-quote.
    pool = dogs.filter((d) => d.status !== "sold" && (!budget || d.price <= budget));
  }
  if (pool.length === 0) pool = dogs.filter((d) => d.status !== "sold");

  return pool
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    .slice(0, max)
    .map((d) => ({ label: d.name, slug: d.slug, price: d.price, image: d.images[0], breed: d.breedName }));
}

function ruleReply(userText: string): string {
  const q = userText.toLowerCase();
  if (/deliver|ship|nairobi|mombasa|transport|abroad|export/.test(q))
    return `Yes! We deliver nationwide across Kenya and internationally with safe, climate-controlled ground and air transport — all paperwork handled. Delivery is arranged at checkout after a deposit. Where are you located?`;
  if (/health|vaccin|guarantee|sick|vet|microchip/.test(q))
    return `Every Buckingham dog leaves fully vaccinated, dewormed, microchipped and vet-checked, with a written health guarantee of up to 36 months on hereditary conditions. You also get the full pedigree and KUC/FCI registration papers.`;
  if (/pay|mpesa|stripe|deposit|installment|card/.test(q))
    return `We accept international cards via Stripe and M-Pesa Paybill for local payments. A deposit reserves your dog and the balance is due on delivery. Ready to reserve one?`;
  if (/price|cost|how much|budget|cheap|afford/.test(q))
    return `Our puppies start from ${formatPrice(1800)}, with elite bloodlines and fully-trained protection dogs ranging higher. Tell me your budget and what you need the dog for, and I'll match you perfectly. Here are a few great options:`;
  if (/contact|call|phone|whatsapp|visit|address|location/.test(q))
    return `You can reach us on ${site.contact.phoneDisplay} (call/WhatsApp) or email ${site.contact.email}. Visits are by appointment at our Webuye facility — or explore our 3D showroom online any time.`;
  if (/train|guard|protect|security|police|malinois/.test(q))
    return `For protection we recommend the German Shepherd, Belgian Malinois, Doberman, Rottweiler, Cane Corso or Boerboel. We offer dogs at various training levels from green to fully titled personal-protection. Here are some strong candidates:`;
  if (/family|kid|child|gentle|apartment|small/.test(q))
    return `For families we love the Golden Retriever (our signature breed), French & British Bulldogs, and well-socialised GSD puppies. Gentle, loyal and wonderful with children. Take a look:`;
  if (/hello|hi |hey|greet|help/.test(q) || q.trim().length < 4)
    return `Welcome to Buckingham Kennel! 👑 I can help you find the perfect dog — just tell me the breed, your budget, or whether you need a family companion or a protector.`;
  return `Great question! Based on that, here are a few of our finest available dogs. Tell me your budget or preferred breed and I'll refine the match — or ask me about health, delivery or payments.`;
}

async function claudeReply(messages: ChatMsg[], suggestions: ReturnType<typeof pickSuggestions>) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const catalogSummary = dogs
    .filter((d) => d.status !== "sold")
    .map((d) => `- ${d.name} (${d.breedName}, ${d.category}, ${d.sex}, ${d.ageLabel}): ${formatPrice(d.price)} — ${d.status}`)
    .join("\n");
  const breedSummary = breeds.map((b) => `- ${b.name}: ${b.group}, ${b.tagline}`).join("\n");

  const system = `You are "Duke", the warm, knowledgeable AI concierge for ${site.name}, a premium dog breeding & sales business in Webuye, Kenya.
Be concise (2-4 sentences), friendly and professional. Use the data below. Prices are USD. Encourage the visitor toward reserving a dog, and mention health guarantee, delivery or the 3D showroom when relevant. Never invent dogs not in the list.

CONTACT: ${site.contact.phoneDisplay} / ${site.contact.email}. Payments: Stripe cards + M-Pesa Paybill. Health guarantee up to 36 months. Delivery nationwide & international.

BREEDS:\n${breedSummary}

AVAILABLE DOGS:\n${catalogSummary}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",
        max_tokens: 400,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" ? text : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: ChatMsg[] };
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const suggestions = pickSuggestions(last);

  const ai = await claudeReply(messages, suggestions);
  const reply = ai ?? ruleReply(last);

  // Only attach product cards when the intent is discovery-related.
  const showCards = /price|cost|budget|puppy|train|guard|family|breed|recommend|looking|want|show|buy|afford|dog/i.test(last);

  return NextResponse.json({ reply, suggestions: showCards ? suggestions : [] });
}
