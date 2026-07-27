import { breeds } from "./breeds";

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

const img = (n: number) => `/images/dog-${String(n).padStart(2, "0")}.jpg`;

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

let cursor = 1;
const nextImgs = (count = 3) => {
  const arr: string[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(img(((cursor - 1) % 90) + 1));
    cursor++;
  }
  return arr;
};

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
  imgCount?: number;
  description?: string;
};

const kenyaCounties = ["Nairobi", "Bungoma", "Nakuru", "Kisumu", "Mombasa", "Eldoret"];

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
    stock: seed.status === "sold" ? 0 : seed.status === "reserved" ? 1 : 1 + (i % 3),
    featured: seed.featured ?? false,
    bestseller: seed.bestseller ?? false,
    weightKg: seed.weightKg,
    rating: seed.rating ?? 4.7 + ((i % 4) * 0.1),
    reviews: seed.reviews ?? 12 + ((i * 7) % 140),
    images: nextImgs(seed.imgCount ?? 3),
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
      `${seed.name} is a stunning ${seed.color.toLowerCase()} ${breedName} from our champion Buckingham bloodline. Raised underfoot with early neurological stimulation, ${seed.sex === "Male" ? "he" : "she"} comes fully vaccinated, health-guaranteed and ready to become the pride of your home.`,
    location: kenyaCounties[i % kenyaCounties.length],
  };
}

const seeds: Seed[] = [
  { name: "Maximus", breedSlug: "german-shepherd", category: "elite", sex: "Male", ageLabel: "14 weeks", color: "Black & Tan", price: 3200, compareAt: 3800, featured: true, bestseller: true, weightKg: 12, traits: ["Protection prospect", "Confident", "Titled parents"], champions: ["IPO3 Sire", "National Sieger Line"], hipScore: "OFA Excellent", guarantee: 36 },
  { name: "Athena", breedSlug: "german-shepherd", category: "puppy", sex: "Female", ageLabel: "9 weeks", color: "Sable", price: 2400, featured: true, weightKg: 7, traits: ["Family & guard", "Gentle", "ENS raised"] },
  { name: "Kaiser", breedSlug: "belgian-malinois", category: "trained", sex: "Male", ageLabel: "11 months", color: "Fawn / Black Mask", price: 6500, compareAt: 7200, featured: true, bestseller: true, weightKg: 26, traits: ["Level II obedience", "Bite work", "Handler-focused"], champions: ["PSA Sport Line", "Police K9 Prospect"], hipScore: "OFA Excellent", guarantee: 24 },
  { name: "Freya", breedSlug: "belgian-malinois", category: "puppy", sex: "Female", ageLabel: "10 weeks", color: "Mahogany", price: 2600, weightKg: 6, traits: ["High drive", "Athletic", "Sport prospect"] },
  { name: "Titan", breedSlug: "rottweiler", category: "elite", sex: "Male", ageLabel: "16 weeks", color: "Black & Mahogany", price: 3400, featured: true, weightKg: 16, traits: ["Massive bone", "Calm guardian", "German type"], champions: ["ADRK Bloodline", "Best of Breed 2025"], hipScore: "OFA Good", guarantee: 36 },
  { name: "Duchess", breedSlug: "rottweiler", category: "adult", sex: "Female", ageLabel: "2 years", color: "Black & Tan", price: 2900, status: "reserved", weightKg: 42, traits: ["Proven dam", "Family protector", "Composed"] },
  { name: "Zeus", breedSlug: "boerboel", category: "trained", sex: "Male", ageLabel: "14 months", color: "Fawn", price: 5200, featured: true, weightKg: 62, traits: ["Estate guardian", "Obedience trained", "Fearless"], hipScore: "OFA Good", guarantee: 24 },
  { name: "Nala", breedSlug: "boerboel", category: "puppy", sex: "Female", ageLabel: "12 weeks", color: "Brindle", price: 2200, weightKg: 11, traits: ["Loyal", "Confident", "Family guardian"] },
  { name: "Sunny", breedSlug: "golden-retriever", category: "puppy", sex: "Male", ageLabel: "9 weeks", color: "Golden", price: 1800, featured: true, bestseller: true, weightKg: 6, traits: ["Family favourite", "Gentle", "Great with kids"] },
  { name: "Belle", breedSlug: "golden-retriever", category: "puppy", sex: "Female", ageLabel: "10 weeks", color: "Cream", price: 1900, weightKg: 6, traits: ["Sweet natured", "Therapy prospect", "Playful"] },
  { name: "Pierre", breedSlug: "french-bulldog", category: "elite", sex: "Male", ageLabel: "12 weeks", color: "Blue Fawn", price: 4200, compareAt: 4800, featured: true, weightKg: 4, traits: ["Rare colour", "Compact", "Charming"], guarantee: 24 },
  { name: "Coco", breedSlug: "french-bulldog", category: "puppy", sex: "Female", ageLabel: "11 weeks", color: "Pied", price: 3600, bestseller: true, weightKg: 4, traits: ["City companion", "Low energy", "Affectionate"] },
  { name: "Winston", breedSlug: "british-bulldog", category: "puppy", sex: "Male", ageLabel: "12 weeks", color: "Fawn & White", price: 3200, weightKg: 8, traits: ["Dignified", "Calm", "Great character"] },
  { name: "Rome", breedSlug: "cane-corso", category: "elite", sex: "Male", ageLabel: "15 weeks", color: "Black", price: 3800, featured: true, weightKg: 15, traits: ["Noble guardian", "Massive", "Composed"], champions: ["ICCF Bloodline"], hipScore: "OFA Excellent", guarantee: 36 },
  { name: "Isla", breedSlug: "cane-corso", category: "adult", sex: "Female", ageLabel: "18 months", color: "Grey Brindle", price: 3300, weightKg: 40, traits: ["Guardian", "Trainable", "Devoted"] },
  { name: "Onyx", breedSlug: "doberman", category: "trained", sex: "Male", ageLabel: "13 months", color: "Black & Rust", price: 5600, featured: true, bestseller: true, weightKg: 34, traits: ["Personal protection", "Elegant", "Fast"], hipScore: "OFA Excellent", guarantee: 24 },
  { name: "Vela", breedSlug: "doberman", category: "puppy", sex: "Female", ageLabel: "10 weeks", color: "Red & Rust", price: 2700, weightKg: 6, traits: ["Sleek", "Alert", "Loyal"] },
  { name: "Bruno", breedSlug: "german-shepherd", category: "trained", sex: "Male", ageLabel: "12 months", color: "Bi-colour", price: 5800, weightKg: 33, traits: ["Family protection", "Obedience titled", "Steady nerves"], hipScore: "OFA Good", guarantee: 24 },
  { name: "Sasha", breedSlug: "german-shepherd", category: "adult", sex: "Female", ageLabel: "2 years", color: "Black & Red", price: 3100, status: "sold", weightKg: 30, traits: ["Proven dam", "Loving", "Protective"] },
  { name: "Rex", breedSlug: "rottweiler", category: "puppy", sex: "Male", ageLabel: "11 weeks", color: "Black & Tan", price: 2600, weightKg: 9, traits: ["Blocky head", "Confident", "Guardian line"] },
  { name: "Milo", breedSlug: "golden-retriever", category: "adult", sex: "Male", ageLabel: "3 years", color: "Golden", price: 2400, weightKg: 32, traits: ["Trained gundog", "Gentle giant", "Obedient"] },
  { name: "Ruby", breedSlug: "french-bulldog", category: "puppy", sex: "Female", ageLabel: "12 weeks", color: "Lilac", price: 4600, featured: true, weightKg: 4, traits: ["Ultra-rare colour", "Tiny", "Sweet"], guarantee: 24 },
  { name: "Baron", breedSlug: "boerboel", category: "elite", sex: "Male", ageLabel: "16 weeks", color: "Red Fawn", price: 3600, weightKg: 18, traits: ["Giant guardian", "Champion sire", "Devoted"], hipScore: "OFA Good", guarantee: 36 },
  { name: "Cleo", breedSlug: "doberman", category: "adult", sex: "Female", ageLabel: "2 years", color: "Black & Rust", price: 3400, status: "reserved", weightKg: 32, traits: ["Sentinel", "Refined", "Bonded"] },
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
