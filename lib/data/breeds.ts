export type Breed = {
  slug: string;
  name: string;
  group: "Guardian & Protection" | "Family Companion" | "Working & Sport" | "Toy & Lap";
  origin: string;
  size: "Small" | "Medium" | "Large" | "Giant";
  lifespan: string;
  weight: string;
  height: string;
  temperament: string[];
  stats: { energy: number; trainability: number; family: number; guarding: number; shedding: number };
  tagline: string;
  description: string;
  care: string;
  heroImage: string;
};

const img = (n: number) => `/images/dog-${String(n).padStart(2, "0")}.jpg`;

export const breeds: Breed[] = [
  {
    slug: "german-shepherd",
    name: "German Shepherd",
    group: "Guardian & Protection",
    origin: "Germany",
    size: "Large",
    lifespan: "9–13 years",
    weight: "22–40 kg",
    height: "55–65 cm",
    temperament: ["Loyal", "Intelligent", "Courageous", "Confident"],
    stats: { energy: 5, trainability: 5, family: 4, guarding: 5, shedding: 4 },
    tagline: "The world's finest working guardian.",
    description:
      "The German Shepherd is the gold standard of protection and versatility — a fearless guardian, a devoted family member, and one of the most trainable breeds on earth. Our GSD line descends from proven European working stock with certified hips and rock-solid temperaments.",
    care: "Daily vigorous exercise and mental stimulation. Weekly brushing (daily during shedding season). Thrives on training and a job to do.",
    heroImage: img(3),
  },
  {
    slug: "belgian-malinois",
    name: "Belgian Malinois",
    group: "Working & Sport",
    origin: "Belgium",
    size: "Large",
    lifespan: "12–14 years",
    weight: "18–30 kg",
    height: "56–66 cm",
    temperament: ["Driven", "Alert", "Athletic", "Focused"],
    stats: { energy: 5, trainability: 5, family: 3, guarding: 5, shedding: 3 },
    tagline: "Elite drive. Unmatched agility.",
    description:
      "Chosen by elite military and police units worldwide, the Belgian Malinois is intensity in canine form. Lightning-fast, endlessly trainable and intensely bonded to their handler. Ideal for security, sport and experienced active owners.",
    care: "Serious daily exercise plus structured work. Short coat is low-maintenance. Needs an engaged, consistent handler.",
    heroImage: img(6),
  },
  {
    slug: "rottweiler",
    name: "Rottweiler",
    group: "Guardian & Protection",
    origin: "Germany",
    size: "Large",
    lifespan: "9–10 years",
    weight: "35–60 kg",
    height: "56–69 cm",
    temperament: ["Confident", "Devoted", "Calm", "Protective"],
    stats: { energy: 4, trainability: 4, family: 4, guarding: 5, shedding: 3 },
    tagline: "Steadfast strength, gentle heart.",
    description:
      "A calm, confident guardian that is deeply devoted to its family. The Rottweiler combines imposing presence with a surprisingly affectionate, level-headed nature when properly bred and socialised — exactly what our program prioritises.",
    care: "Daily exercise and early socialisation. Minimal grooming. Rewards firm, loving leadership.",
    heroImage: img(30),
  },
  {
    slug: "boerboel",
    name: "Boerboel",
    group: "Guardian & Protection",
    origin: "South Africa",
    size: "Giant",
    lifespan: "9–11 years",
    weight: "50–90 kg",
    height: "59–70 cm",
    temperament: ["Fearless", "Loyal", "Dominant", "Affectionate"],
    stats: { energy: 3, trainability: 4, family: 4, guarding: 5, shedding: 2 },
    tagline: "The African farm protector.",
    description:
      "Bred to guard the homestead against anything, the Boerboel is a giant of remarkable agility and devotion. Immensely powerful yet tender with its family, it is the ultimate estate and family guardian for the experienced owner.",
    care: "Moderate daily exercise and firm, early training. Very low grooming needs. Needs space and confident leadership.",
    heroImage: img(45),
  },
  {
    slug: "golden-retriever",
    name: "Golden Retriever",
    group: "Family Companion",
    origin: "Scotland",
    size: "Large",
    lifespan: "10–12 years",
    weight: "25–34 kg",
    height: "51–61 cm",
    temperament: ["Friendly", "Gentle", "Devoted", "Playful"],
    stats: { energy: 4, trainability: 5, family: 5, guarding: 2, shedding: 4 },
    tagline: "The heart of the family.",
    description:
      "Radiant, gentle and endlessly patient, the Golden Retriever — the very face of our kennel — is the quintessential family dog. Brilliant with children, eager to please and beautiful inside and out.",
    care: "Daily exercise and plenty of affection. Regular brushing for the flowing coat. Loves water, fetch and company.",
    heroImage: img(70),
  },
  {
    slug: "french-bulldog",
    name: "French Bulldog",
    group: "Toy & Lap",
    origin: "France",
    size: "Small",
    lifespan: "10–12 years",
    weight: "8–14 kg",
    height: "28–33 cm",
    temperament: ["Charming", "Playful", "Adaptable", "Affectionate"],
    stats: { energy: 2, trainability: 3, family: 5, guarding: 2, shedding: 2 },
    tagline: "Big personality, pint-sized.",
    description:
      "The irresistible Frenchie packs enormous character into a compact, apartment-friendly frame. Comic, affectionate and wonderfully low-energy, it is the perfect companion for city living and cuddles.",
    care: "Short walks and cool environments (sensitive to heat). Minimal grooming. Thrives on human company.",
    heroImage: img(78),
  },
  {
    slug: "british-bulldog",
    name: "British Bulldog",
    group: "Family Companion",
    origin: "England",
    size: "Medium",
    lifespan: "8–10 years",
    weight: "18–25 kg",
    height: "31–40 cm",
    temperament: ["Courageous", "Calm", "Friendly", "Dignified"],
    stats: { energy: 2, trainability: 3, family: 5, guarding: 3, shedding: 2 },
    tagline: "Dignity, courage and cuddles.",
    description:
      "A true British icon — solid, dignified and endlessly affectionate. The Bulldog is a gentle, loyal companion that adores its people and brings calm charm to any home.",
    care: "Gentle daily walks, weight management and cool conditions. Wrinkle care and light grooming.",
    heroImage: img(84),
  },
  {
    slug: "cane-corso",
    name: "Cane Corso",
    group: "Guardian & Protection",
    origin: "Italy",
    size: "Giant",
    lifespan: "10–12 years",
    weight: "40–50 kg",
    height: "60–70 cm",
    temperament: ["Majestic", "Protective", "Intelligent", "Composed"],
    stats: { energy: 4, trainability: 4, family: 4, guarding: 5, shedding: 2 },
    tagline: "The Roman guardian.",
    description:
      "Descended from Roman war dogs, the Cane Corso is a noble, muscular protector with deep devotion to its family. Composed and discerning, it is a magnificent estate guardian in capable hands.",
    care: "Daily exercise and consistent training from puppyhood. Low grooming. Needs firm, experienced leadership.",
    heroImage: img(52),
  },
  {
    slug: "doberman",
    name: "Doberman Pinscher",
    group: "Guardian & Protection",
    origin: "Germany",
    size: "Large",
    lifespan: "10–13 years",
    weight: "27–45 kg",
    height: "61–72 cm",
    temperament: ["Elegant", "Alert", "Fearless", "Loyal"],
    stats: { energy: 5, trainability: 5, family: 4, guarding: 5, shedding: 2 },
    tagline: "Sleek. Swift. Sentinel.",
    description:
      "Elegant and athletic, the Doberman is a lightning-fast, intensely loyal protector. Sensitive and deeply bonded to its family, it blends refined looks with world-class guarding instinct.",
    care: "Vigorous daily exercise and mental work. Minimal grooming. Wants to be close to its people.",
    heroImage: img(60),
  },
];

export const breedGroups = [
  "Guardian & Protection",
  "Working & Sport",
  "Family Companion",
  "Toy & Lap",
] as const;

export const getBreed = (slug: string) => breeds.find((b) => b.slug === slug);
