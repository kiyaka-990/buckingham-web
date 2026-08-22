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

/**
 * The kennel sells puppies only.
 *
 * The adult dogs are the breeding programme — they are shown so buyers can see
 * the parents behind a litter, never priced and never added to a cart. Every
 * price surface in the app gates on this.
 */
export const isForSale = (dog: Pick<Dog, "category">) => dog.category === "puppy";

/** The floor the kennel advertises on puppies. */
export const PUPPY_PRICE_FLOOR = 1600;

const categoryLabels: Record<Category, string> = {
  puppy: "Puppies for Sale",
  adult: "Our Adults",
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

/** Age in whole months/years from a date of birth on the dog's vaccination card. */
function ageFrom(iso: string) {
  const born = new Date(`${iso}T00:00:00Z`);
  const now = new Date();
  let months =
    (now.getUTCFullYear() - born.getUTCFullYear()) * 12 + (now.getUTCMonth() - born.getUTCMonth());
  if (now.getUTCDate() < born.getUTCDate()) months -= 1;
  if (months < 24) return `${months} months`;
  const years = Math.floor(months / 12);
  return `${years} years`;
}

const bornLabel = (iso: string) =>
  `Born ${new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })}`;

type Seed = {
  name: string;
  breedSlug: string;
  category: Category;
  sex: "Male" | "Female";
  /** Date of birth off the dog's own papers. Drives the age shown on site. */
  born?: string;
  ageLabel?: string;
  color: string;
  /** Puppies only. Adults are breeding stock and carry no price. */
  price?: number;
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
  const forSale = seed.category === "puppy";
  const traits = seed.born ? [bornLabel(seed.born), ...seed.traits] : seed.traits;
  return {
    id: `BK-${String(1000 + i)}`,
    slug,
    name: seed.name,
    breedSlug: seed.breedSlug,
    breedName,
    category: seed.category,
    sex: seed.sex,
    ageLabel: seed.ageLabel ?? (seed.born ? ageFrom(seed.born) : ""),
    color: seed.color,
    // Breeding stock carries no price at all — 0 is the sentinel, and every
    // price surface gates on isForSale() rather than on the number.
    price: forSale ? (seed.price ?? PUPPY_PRICE_FLOOR) : 0,
    compareAt: forSale ? seed.compareAt : undefined,
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
    traits,
    description:
      seed.description ??
      (forSale
        ? `${seed.name} is a ${seed.color.toLowerCase()} ${breedName} puppy from our own Buckingham lines, raised underfoot at the Webuye kennel with early neurological stimulation and daily handling. ${seed.sex === "Male" ? "He" : "She"} leaves us fully vaccinated, dewormed, microchipped and health-guaranteed, with pedigree papers in hand.`
        : `${seed.name} is one of our ${breedName}s and part of the Buckingham breeding programme. ${seed.sex === "Male" ? "He" : "She"} is not for sale — ${seed.sex === "Male" ? "he" : "she"} is here so you can see the parent behind the litter. Puppies from this line start at $${PUPPY_PRICE_FLOOR.toLocaleString()}.`),
    location: seed.location ?? kenyaCounties[i % kenyaCounties.length],
  };
}

/**
 * The seed list.
 *
 * Adults first, breed by breed, in register order — these are the dogs the
 * cover page names. Puppies follow, and they are the only priced listings.
 */
const seeds: Seed[] = [
  /* ---- Caucasian Shepherd — breeding stock --------------------- */
  {
    name: "Rocco", breedSlug: "caucasian-shepherd", category: "elite", sex: "Male",
    born: "2024-10-10", color: "Tri-colour", featured: true, weightKg: 72,
    hipScore: "OFA Good", guarantee: 36,
    traits: ["Estate guardian", "Enormous bone", "Foundation sire"],
    champions: ["Imported — Republic of South Africa"],
    images: pics("caucasian", "adult", 1, 2, 3),
    description:
      "Rocco is our foundation Caucasian Ovcharka male and the single most imposing dog on our grounds — unhurried, deeply bonded to his handlers and entirely uninterested in strangers, which is exactly what the breed is supposed to be. He is not for sale. He is here because every Caucasian puppy we place traces back to him.",
  },
  {
    name: "Maya", breedSlug: "caucasian-shepherd", category: "adult", sex: "Female",
    born: "2024-10-19", color: "Typical Brown", featured: true, weightKg: 60,
    traits: ["Foundation dam", "Composed", "Livestock safe"],
    champions: ["Imported — Republic of South Africa"],
    images: pics("caucasian", "adult", 4, 5, 6),
    description:
      "Maya is our foundation Caucasian dam — heavy, quiet and completely settled around stock and children, with the flat, unbothered temperament we breed for. She is not for sale. Her litters with Rocco are, and they start at $1,600.",
  },
  {
    name: "Kazbek", breedSlug: "caucasian-shepherd", category: "trained", sex: "Male",
    ageLabel: "20 months", color: "Red Fawn", weightKg: 70,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Perimeter trained", "Night patrol", "Steady nerves"],
    images: pics("caucasian", "adult", 7, 8, 9),
  },
  {
    name: "Lada", breedSlug: "caucasian-shepherd", category: "adult", sex: "Female",
    ageLabel: "3 years", color: "Fawn", weightKg: 58,
    traits: ["Family guardian", "Patient with children", "Quiet"],
    images: pics("caucasian", "adult", 10, 11),
  },

  /* ---- White Long Coat Swiss Shepherd — breeding stock ---------- */
  {
    name: "Alba", breedSlug: "white-swiss-shepherd", category: "adult", sex: "Female",
    ageLabel: "2 years", color: "Pure White", featured: true, weightKg: 32,
    traits: ["Gentle with children", "Therapy temperament", "Foundation dam"],
    images: pics("white-shepherd", "adult", 2, 1, 3),
  },
  {
    name: "Aspen", breedSlug: "white-swiss-shepherd", category: "trained", sex: "Male",
    ageLabel: "18 months", color: "Pure White", weightKg: 38,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Obedience titled", "Off-lead reliable", "Foundation sire"],
    images: pics("white-shepherd", "adult", 4, 5, 6),
  },
  {
    name: "Neve", breedSlug: "white-swiss-shepherd", category: "adult", sex: "Female",
    ageLabel: "16 months", color: "Cream White", weightKg: 30,
    traits: ["Soft natured", "Great with kids", "Young dam"],
    images: pics("white-shepherd", "adult", 7, 8, 9),
  },

  /* ---- Royal Black German Shepherd — breeding stock ------------- */
  {
    name: "Kaiser", breedSlug: "royal-black-shepherd", category: "elite", sex: "Male",
    ageLabel: "2 years", color: "Solid Black, Long Coat",
    featured: true, weightKg: 40, hipScore: "OFA Excellent", guarantee: 36,
    traits: ["Solid black long coat", "Straight back", "Head stud"],
    champions: ["Working Line Sieger 2025", "Best of Breed — Nairobi"],
    images: pics("gsd-black", "adult", 1, 2, 3, 7),
    description:
      "Kaiser is the dog people ring us about. A solid-black long-coated German Shepherd of genuinely royal stamp — heavy bone, level topline, and the calm, switched-on temperament that separates a working shepherd from a nervous one. He is our head stud and the reference point for every black litter we plan, and he is not for sale.",
  },
  {
    name: "Felly Atlas", breedSlug: "royal-black-shepherd", category: "trained", sex: "Female",
    born: "2024-09-21", color: "Solid Black", featured: true, weightKg: 32,
    hipScore: "OFA Excellent", guarantee: 24,
    traits: ["Level II obedience", "Family protection", "Foundation dam"],
    champions: ["Imported — Republic of South Africa"],
    images: pics("gsd-black", "adult", 4, 5, 6),
    description:
      "Felly Atlas is our solid-black German Shepherd dam, imported as a puppy and raised here through her obedience work. She is handler-focused, level under pressure and outstanding with children. She is not for sale — her litters with Kaiser are, and they start at $1,600.",
  },

  /* ---- American Akita — breeding stock -------------------------- */
  {
    name: "Kenji", breedSlug: "american-akita", category: "elite", sex: "Male",
    ageLabel: "2 years", color: "Brindle & White", featured: true, weightKg: 52,
    hipScore: "OFA Excellent", guarantee: 36,
    traits: ["Bear-head type", "Heavy coat", "Foundation sire"],
    champions: ["Best of Breed — East Africa 2025"],
    images: pics("akita", "adult", 2, 1, 3),
  },
  {
    name: "Yuki", breedSlug: "american-akita", category: "adult", sex: "Female",
    ageLabel: "22 months", color: "White & Fawn", weightKg: 42,
    traits: ["Dignified", "Silent guardian", "Foundation dam"],
    images: pics("akita", "adult", 4, 5, 6),
  },

  /* ---- Kangal — breeding stock ---------------------------------- */
  {
    name: "Sivas", breedSlug: "kangal", category: "elite", sex: "Male",
    ageLabel: "2 years", color: "Fawn with Black Mask",
    featured: true, weightKg: 62, hipScore: "OFA Good", guarantee: 36,
    traits: ["Turkish import type", "Livestock guardian", "Foundation sire"],
    champions: ["Sivas Regional Type — 2025"],
    images: pics("kangal", "adult", 1),
    description:
      "Sivas is a true Turkish-type Kangal — heavy fawn coat, the deep black mask the breed is judged on, and the high-set curled tail carried over the back. Long-legged and built to cover a boundary all night, he is unhurried with stock and children and completely immovable at a gate. Our foundation Kangal sire, and not for sale.",
  },
  {
    name: "Aslan", breedSlug: "kangal", category: "trained", sex: "Male",
    ageLabel: "2 years", color: "Fawn with Black Mask", weightKg: 58,
    hipScore: "OFA Good", guarantee: 24,
    traits: ["Night patrol", "Stock-safe", "Composed with strangers"],
    images: pics("kangal", "adult", 2),
    description:
      "Photographed on the range he was raised to work, Aslan is a full-size Kangal male trained to hold a perimeter and to leave livestock, children and invited guests entirely alone. He is our working demonstration dog — come and meet him, but he is not for sale.",
  },

  /* ================================================================
     PUPPIES — the only listings we sell. From $1,600.
     ================================================================ */
  {
    name: "Nyota", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Female",
    ageLabel: "10 weeks", color: "Solid Black", price: 1600, bestseller: true, weightKg: 7,
    traits: ["Kaiser × Felly Atlas litter", "Confident", "Early socialised"],
    images: pics("gsd-black", "pup", 4, 5, 6),
  },
  {
    name: "Obsidian", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Male",
    ageLabel: "10 weeks", color: "Solid Black", price: 1700, featured: true, weightKg: 8,
    traits: ["Kaiser × Felly Atlas litter", "Long coat carrier", "ENS raised"],
    images: pics("gsd-black", "pup", 1, 2, 3),
  },
  {
    name: "Malkia", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Female",
    ageLabel: "12 weeks", color: "Solid Black", price: 1800, status: "reserved", weightKg: 9,
    traits: ["Show prospect", "Sweet natured", "Excellent pigment"],
    images: pics("gsd-black", "pup", 10, 11, 12),
  },
  {
    name: "Shujaa", breedSlug: "royal-black-shepherd", category: "puppy", sex: "Male",
    ageLabel: "12 weeks", color: "Solid Black, Plush Coat", price: 1900, weightKg: 10,
    traits: ["Plush coat", "Bold", "Protection prospect"],
    images: pics("gsd-black", "pup", 7, 8, 9),
  },
  {
    name: "Bora", breedSlug: "kangal", category: "puppy", sex: "Male",
    ageLabel: "10 weeks", color: "Fawn with Black Mask", price: 2100, weightKg: 11,
    traits: ["Sivas son", "Heavy bone", "Steady temperament"],
    images: pics("kangal", "pup", 2),
  },
  {
    name: "Elif", breedSlug: "kangal", category: "puppy", sex: "Female",
    ageLabel: "13 weeks", color: "Fawn with Black Mask", price: 2200, weightKg: 14,
    traits: ["Guardian line", "Calm", "Excellent with stock"],
    images: pics("kangal", "pup", 1),
  },
  {
    name: "Grom", breedSlug: "caucasian-shepherd", category: "puppy", sex: "Male",
    ageLabel: "11 weeks", color: "Fawn & White", price: 2400, featured: true, weightKg: 14,
    traits: ["Rocco × Maya litter", "Giant frame", "Guardian line"],
    images: pics("caucasian", "pup", 1, 2),
  },
];

export const dogs: Dog[] = seeds.map((s, i) => build(s, i));

export const getDog = (slug: string) => dogs.find((d) => d.slug === slug);
export const featuredDogs = dogs.filter((d) => d.featured);
export const bestsellers = dogs.filter((d) => d.bestseller);
export const puppies = dogs.filter((d) => d.category === "puppy");
/** The parent dogs — shown, named, never priced. */
export const breedingStock = dogs.filter((d) => !isForSale(d));
export const availableCount = dogs.filter((d) => d.status === "available").length;

export function relatedDogs(dog: Dog, count = 4) {
  return dogs
    .filter((d) => d.slug !== dog.slug && (d.breedSlug === dog.breedSlug || d.category === dog.category))
    .slice(0, count);
}

/** Only puppies carry a price, so only puppies define the range. */
export const priceRange = {
  min: Math.min(...puppies.map((d) => d.price)),
  max: Math.max(...puppies.map((d) => d.price)),
};
