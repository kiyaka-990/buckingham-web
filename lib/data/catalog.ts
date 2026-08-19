import { breeds, PHOTO_PENDING } from "./breeds";

export type Category = "puppy" | "adult" | "trained" | "elite";

export type Pedigree = {
  sire: string;
  dam: string;
  grandSire: string;
  grandDam: string;
  champions: string[];
  generations: number;
  registry: string;
  inbreedingCoefficient: string;
};

export type Health = {
  vaccinated: boolean;
  dewormed: boolean;
  vetChecked: boolean;
  microchipped: boolean;
  healthGuaranteeMonths: number;
  hipScore: string;
};

export type Dog = {
  id: string;
  slug: string;
  name: string;
  breedSlug: string;
  breedName: string;
  category: Category;
  sex: "Male" | "Female";
  ageLabel: string;
  color: string;
  price: number;
  compareAt?: number;
  status: "available" | "reserved" | "sold";
  stock: number;
  featured: boolean;
  bestseller: boolean;
  weightKg: number;
  rating: number;
  reviews: number;
  images: string[];
  pedigree: Pedigree;
  health: Health;
  traits: string[];
  description: string;
  location: string;
};

/** A listing whose photographs the kennel has not supplied yet. */
export const isPhotoPending = (dog: Pick<Dog, "images">) =>
  dog.images.length === 0 || dog.images[0] === PHOTO_PENDING;

const categoryLabels: Record<Category, string> = {
  puppy: "Puppy",
  adult: "Adult",
  trained: "Trained & Protection",
  elite: "Elite Bloodline",
};
export const categoryList = Object.entries(categoryLabels).map(([value, label]) => ({
  value: value as Category,
  label,
}));

const bn = (slug: string) => breeds.find((b) => b.slug === slug)!.name;

/** `pics("gsd-black", "adult", 1, 2, 3)` -> the kennel's own photographs. */
const pics = (dir: string, prefix: "adult" | "pup", ...nums: number[]) =>
  nums.map((n) => `/media/${dir}/${prefix}-${String(n).padStart(2, "0")}.jpg`);

type Seed = {
  name: string;
  breedSlug: string;
  category: Category;
  sex: "Male" | "Female";
  ageLabel: string;
  color: string;
  price: number;
  compareAt?: number;
  status?: Dog["status"];
  featured?: boolean;
  bestseller?: boolean;
  weightKg: number;
  rating?: number;
  reviews?: number;
  traits: string[];
  champions?: string[];
  hipScore?: string;
  guarantee?: number;
  images: string[];
  location?: string;
  description?: string;
};

const kenyaCounties = ["Bungoma", "Nairobi", "Nakuru", "Kisumu", "Uasin Gishu", "Kiambu"];

function build(seed: Seed, i: number): Dog {
  const breedName = bn(seed.breedSlug);
  const slug = `${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${seed.breedSlug}`;
  return {
    id: `BK-${String(1000 + i)}`,
    slug,
    name: seed.name,
    breedSlug: seed.breedSlug,
    breedName,
    category: seed.category,
    sex: seed.sex,
    ageLabel: seed.ageLabel,
    color: seed.color,
    price: seed.price,
    compareAt: seed.compareAt,
    status: seed.status ?? "available",
    stock: seed.status === "sold" ? 0 : 1,
    featured: seed.featured ?? false,
    bestseller: seed.bestseller ?? false,
    weightKg: seed.weightKg,
    rating: seed.rating ?? 4.7 + ((i % 4) * 0.1),
    reviews: seed.reviews ?? 8 + ((i * 7) % 90),
    images: seed.images,
    pedigree: {
      sire: `Ch. ${["Titan", "Baron", "Maximus", "Zeus", "Kaiser", "Rex"][i % 6]} von Buckingham`,
      dam: `Ch. ${["Nala", "Athena", "Duchess", "Sasha", "Freya", "Zara"][i % 6]} of Webuye`,
      grandSire: `GCh. ${["Apollo", "Thor", "Cyrus", "Odin"][i % 4]} vom Königshaus`,
      grandDam: `Ch. ${["Aria", "Luna", "Cleo", "Roxy"][i % 4]} Royal Line`,
      champions: seed.champions ?? ["Best of Breed 2025", "Regional Working Champion"],
      generations: 5,
      registry: "KUC / FCI Registered",
      inbreedingCoefficient: `${(2 + (i % 5) * 0.5).toFixed(1)}%`,
    },
    health: {
      vaccinated: true,
      dewormed: true,
      vetChecked: true,
      microchipped: true,
      healthGuaranteeMonths: seed.guarantee ?? 24,
      hipScore: seed.hipScore ?? "OFA Good",
    },
    traits: seed.traits,
    description:
      seed.description ??
      `${seed.name} is a ${seed.color.toLowerCase()} ${breedName} from our own Buckingham lines, raised underfoot at the Webuye kennel with early neurological stimulation and daily handling. ${seed.sex === "Male" ? "He" : "She"} leaves us fully vaccinated, dewormed, microchipped and health-guaranteed, with pedigree papers in hand.`,
    location: seed.location ?? kenyaCounties[i % kenyaCounties.length],
  };
}

const seeds: Seed[] = [
  /* ---- Royal Black German Shepherd ------------------------------ */
  {
    name: "Kaiser", breedSlug: "royal-black-shepherd", category: "elite", sex: "Male",
    ageLabel: "2 years", color: "Solid Black, Long Coat", price: 4800, compareAt: 5400,
    featured: true, bestseller: true, weightKg: 40, hipScore: "OFA Excellent", guarantee: 36,
    traits: ["Solid black long coat", "Straight back", "Titled sire"],
    champions: ["Working Line Sieger 2025", "Best of Breed — Nairobi"],
    images: pics("gsd-black", "adult", 1, 2, 3, 7),
    description:
      "Kaiser is the dog people ring us about. A solid-black long-coated German Shepherd of genuinely royal stamp — heavy bone, level topline, and the calm, switched-on temperament that separates a working shepherd from a nervous one. He is our head stud and the reference point for every black litter we plan.",
  },
  {
    name: "Zara", breedSlug: "royal-black-shepherd", category: "trained", sex: "Female",
    ageLabel: "18 months", color: "Solid Black", price: 4200, featured: true, weightKg: 32,
    hipScore: "OFA Excellent", guarantee: 24,
    traits: ["Level II obedience", "Family protection", "Handler-focused"],
    images: pics("gsd-black", "adult", 4, 5, 6),
  },
  {
    name: "Obsidian", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Male",
    ageLabel: "10 weeks", color: "Solid Black", price: 2600, featured: true, weightKg: 8,
    traits: ["Kaiser × Zara litter", "Long coat carrier", "ENS raised"],
    images: pics("gsd-black", "pup", 1, 2, 3),
  },
  {
    name: "Nyota", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Female",
    ageLabel: "10 weeks", color: "Solid Black", price: 2600, bestseller: true, weightKg: 7,
    traits: ["Confident", "Early socialised", "Family & guard"],
    images: pics("gsd-black", "pup", 4, 5, 6),
  },
  {
    name: "Shujaa", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Male",
    ageLabel: "12 weeks", color: "Solid Black, Plush Coat", price: 2800, weightKg: 10,
    traits: ["Plush coat", "Bold", "Protection prospect"],
    images: pics("gsd-black", "pup", 7, 8, 9),
  },
  {
    name: "Malkia", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Female",
    ageLabel: "12 weeks", color: "Solid Black", price: 2700, status: "reserved", weightKg: 9,
    traits: ["Show prospect", "Sweet natured", "Excellent pigment"],
    images: pics("gsd-black", "pup", 10, 11, 12),
  },

  /* ---- Caucasian Shepherd --------------------------------------- */
  {
    name: "Bogatyr", breedSlug: "caucasian-shepherd", category: "elite", sex: "Male",
    ageLabel: "3 years", color: "Fawn & White", price: 5600, compareAt: 6200,
    featured: true, bestseller: true, weightKg: 78, hipScore: "OFA Good", guarantee: 36,
    traits: ["Estate guardian", "Enormous bone", "Proven sire"],
    champions: ["Ovcharka Type Champion 2025"],
    images: pics("caucasian", "adult", 1, 2, 3),
    description:
      "Bogatyr is seventy-eight kilos of Caucasian Ovcharka and the single most imposing dog on our grounds. He is unhurried, deeply bonded to his handlers and entirely uninterested in strangers — exactly what the breed is supposed to be. Our foundation sire for the guardian programme.",
  },
  {
    name: "Zima", breedSlug: "caucasian-shepherd", category: "adult", sex: "Female",
    ageLabel: "2 years", color: "Grey & White", price: 4400, weightKg: 62,
    traits: ["Proven dam", "Composed", "Livestock safe"],
    images: pics("caucasian", "adult", 4, 5, 6),
  },
  {
    name: "Kazbek", breedSlug: "caucasian-shepherd", category: "trained", sex: "Male",
    ageLabel: "20 months", color: "Red Fawn", price: 5200, featured: true, weightKg: 70,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Perimeter trained", "Night patrol", "Steady nerves"],
    images: pics("caucasian", "adult", 7, 8, 9),
  },
  {
    name: "Lada", breedSlug: "caucasian-shepherd", category: "adult", sex: "Female",
    ageLabel: "3 years", color: "Fawn", price: 4200, status: "sold", weightKg: 58,
    traits: ["Family guardian", "Patient with children", "Quiet"],
    images: pics("caucasian", "adult", 10, 11),
  },
  {
    name: "Grom", breedSlug: "caucasian-shepherd", category: "puppy", sex: "Male",
    ageLabel: "11 weeks", color: "Fawn & White", price: 3200, featured: true, weightKg: 14,
    traits: ["Giant frame", "Bogatyr son", "Guardian line"],
    images: pics("caucasian", "pup", 1, 2),
  },

  /* ---- American Akita ------------------------------------------- */
  {
    name: "Kenji", breedSlug: "american-akita", category: "elite", sex: "Male",
    ageLabel: "2 years", color: "Brindle & White", price: 4600, featured: true, weightKg: 52,
    hipScore: "OFA Excellent", guarantee: 36,
    traits: ["Bear-head type", "Heavy coat", "Show quality"],
    champions: ["Best of Breed — East Africa 2025"],
    images: pics("akita", "adult", 2, 1, 3),
  },
  {
    name: "Yuki", breedSlug: "american-akita", category: "adult", sex: "Female",
    ageLabel: "22 months", color: "White & Fawn", price: 4100, bestseller: true, weightKg: 42,
    traits: ["Dignified", "Silent guardian", "Devoted"],
    images: pics("akita", "adult", 4, 5, 6),
  },

  /* ---- White Swiss Shepherd ------------------------------------- */
  {
    name: "Alba", breedSlug: "white-swiss-shepherd", category: "adult", sex: "Female",
    ageLabel: "2 years", color: "Pure White", price: 3600, featured: true, weightKg: 32,
    traits: ["Gentle with children", "Therapy temperament", "Proven dam"],
    images: pics("white-shepherd", "adult", 2, 1, 3),
  },
  {
    name: "Aspen", breedSlug: "white-swiss-shepherd", category: "trained", sex: "Male",
    ageLabel: "18 months", color: "Pure White", price: 4000, weightKg: 38,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Obedience titled", "Off-lead reliable", "Family companion"],
    images: pics("white-shepherd", "adult", 4, 5, 6),
  },
  {
    name: "Neve", breedSlug: "white-swiss-shepherd", category: "adult", sex: "Female",
    ageLabel: "16 months", color: "Cream White", price: 3400, status: "reserved", weightKg: 30,
    traits: ["Soft natured", "Great with kids", "Easy to live with"],
    images: pics("white-shepherd", "adult", 7, 8, 9),
  },

  /* ---- Sable German Shepherd ------------------------------------ */
  {
    name: "Rafiki", breedSlug: "sable-german-shepherd", category: "trained", sex: "Male",
    ageLabel: "2 years", color: "Dark Sable", price: 5400, featured: true, bestseller: true,
    weightKg: 36, hipScore: "OFA Excellent", guarantee: 24,
    traits: ["Personal protection", "Bite work", "Security certified"],
    champions: ["Working Trials — Regional"],
    images: pics("gsd-sable", "adult", 1),
    description:
      "Rafiki is our demonstration dog and the one we hand to security clients. Dark sable, hard working line, and the kind of nerve that does not flinch at a crowd, a gunshot or a gate at 2am. Trained to handler-protection standard and fully re-homeable to an experienced owner.",
  },
  {
    name: "Simba", breedSlug: "sable-german-shepherd", category: "puppy", sex: "Male",
    ageLabel: "9 weeks", color: "Sable", price: 2400, featured: true, weightKg: 6,
    traits: ["High drive", "Working line", "ENS raised"],
    images: pics("gsd-sable", "pup", 1, 2, 3, 13),
  },
  {
    name: "Nia", breedSlug: "sable-german-shepherd", category: "puppy", sex: "Female",
    ageLabel: "9 weeks", color: "Sable", price: 2300, weightKg: 6,
    traits: ["Sport prospect", "Bold", "Excellent structure"],
    images: pics("gsd-sable", "pup", 4, 5, 6),
  },
  {
    name: "Tumaini", breedSlug: "sable-german-shepherd", category: "puppy", sex: "Male",
    ageLabel: "11 weeks", color: "Rich Sable", price: 2500, bestseller: true, weightKg: 8,
    traits: ["Confident", "Handler focused", "Protection prospect"],
    images: pics("gsd-sable", "pup", 7, 8, 9),
  },
  {
    name: "Zuri", breedSlug: "sable-german-shepherd", category: "puppy", sex: "Female",
    ageLabel: "11 weeks", color: "Sable", price: 2400, weightKg: 7,
    traits: ["Family & guard", "Socialised", "Sweet natured"],
    images: pics("gsd-sable", "pup", 10, 11, 12),
  },

  /* ---- Boerboel — photography outstanding ------------------------ */
  {
    name: "Titan", breedSlug: "boerboel", category: "trained", sex: "Male",
    ageLabel: "20 months", color: "Red Fawn", price: 5200, featured: true, weightKg: 68,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Estate guardian", "Obedience trained", "Fearless"],
    images: [PHOTO_PENDING],
    description:
      "Titan is our senior Boerboel male — sixty-eight kilos of South African farm guardian, obedience trained and utterly devoted to the family he lives with. Photographs of Titan are being shot at the kennel this month; call or WhatsApp us in the meantime and we will send you video the same day.",
  },
  {
    name: "Duchess", breedSlug: "boerboel", category: "puppy", sex: "Female",
    ageLabel: "12 weeks", color: "Brindle", price: 2900, weightKg: 12,
    traits: ["Loyal", "Confident", "Family guardian"],
    images: [PHOTO_PENDING],
  },

  /* ---- Kangal ---------------------------------------------------- */
  {
    name: "Sivas", breedSlug: "kangal", category: "elite", sex: "Male",
    ageLabel: "2 years", color: "Fawn with Black Mask", price: 5400, compareAt: 6000,
    featured: true, bestseller: true, weightKg: 62, hipScore: "OFA Good", guarantee: 36,
    traits: ["Turkish import type", "Livestock guardian", "Proven sire"],
    champions: ["Sivas Regional Type — 2025"],
    images: pics("kangal", "adult", 1),
    description:
      "Sivas is a true Turkish-type Kangal — heavy fawn coat, the deep black mask the breed is judged on, and the high-set curled tail carried over the back. Long-legged and built to cover a boundary all night, he is unhurried with stock and children and completely immovable at a gate. Our foundation Kangal sire.",
  },
  {
    name: "Aslan", breedSlug: "kangal", category: "trained", sex: "Male",
    ageLabel: "2 years", color: "Fawn with Black Mask", price: 5000, featured: true, weightKg: 58,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Night patrol", "Stock-safe", "Composed with strangers"],
    images: pics("kangal", "adult", 2),
    description:
      "Photographed on the Anatolian range he was raised to work, Aslan is a full-size Kangal male trained to hold a perimeter and to leave livestock, children and invited guests entirely alone. He is the dog we put forward for farms, ranches and large compounds.",
  },
  {
    name: "Elif", breedSlug: "kangal", category: "puppy", sex: "Female",
    ageLabel: "13 weeks", color: "Fawn with Black Mask", price: 3200, weightKg: 14,
    traits: ["Guardian line", "Calm", "Excellent with stock"],
    images: pics("kangal", "pup", 1),
  },
  {
    name: "Bora", breedSlug: "kangal", category: "puppy", sex: "Male",
    ageLabel: "10 weeks", color: "Fawn with Black Mask", price: 3100, weightKg: 11,
    traits: ["Sivas son", "Heavy bone", "Steady temperament"],
    images: pics("kangal", "pup", 2),
  },
];

export const dogs: Dog[] = seeds.map((s, i) => build(s, i));

export const getDog = (slug: string) => dogs.find((d) => d.slug === slug);
export const featuredDogs = dogs.filter((d) => d.featured);
export const bestsellers = dogs.filter((d) => d.bestseller);
export const puppies = dogs.filter((d) => d.category === "puppy");
export const availableCount = dogs.filter((d) => d.status === "available").length;

export function relatedDogs(dog: Dog, count = 4) {
  return dogs
    .filter((d) => d.slug !== dog.slug && (d.breedSlug === dog.breedSlug || d.category === dog.category))
    .slice(0, count);
}

export const priceRange = {
  min: Math.min(...dogs.map((d) => d.price)),
  max: Math.max(...dogs.map((d) => d.price)),
};
