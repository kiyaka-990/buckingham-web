/**
 * Buckingham Kennel breed register.
 *
 * The five breeds the kennel keeps and breeds from, in the order the owner
 * lists them. Adult dogs are never sold — they are the breeding programme —
 * so this register carries each breed's *residents*: the dogs on the ground,
 * under the birth names on their own papers.
 *
 * Where we hold a vaccination record for a dog, `born` is transcribed from it.
 * Dogs without a record on file carry a name only; we never invent a date.
 *
 * `mediaDir` points at the kennel's own photography under /public/media. We
 * never substitute stock imagery for the client's dogs.
 */

export type BreedGroup = "Estate Guardian" | "Working Shepherd" | "Spitz & Companion";

/** A dog living at the kennel, under the name on its papers. */
export type Resident = {
  name: string;
  sex: "Male" | "Female";
  /** ISO date, transcribed from the dog's own vaccination record. */
  born?: string;
  /** What the dog does here — sire, dam, guardian. */
  role: string;
};

export type Breed = {
  slug: string;
  name: string;
  shortName: string;
  group: BreedGroup;
  origin: string;
  size: "Medium" | "Large" | "Giant";
  lifespan: string;
  weight: string;
  height: string;
  temperament: string[];
  stats: { energy: number; trainability: number; family: number; guarding: number; shedding: number };
  tagline: string;
  description: string;
  care: string;
  /** The dogs of this breed we keep — shown by birth name on the cover page. */
  residents: Resident[];
  /** Folder under /public/media holding this breed's photography. */
  mediaDir: string;
  /** True when the kennel has not supplied photographs of this breed yet. */
  photoPending: boolean;
  heroImage: string;
  gallery: string[];
  /** Short clips of the dogs, shot at the kennel. Poster comes from the gallery. */
  video?: { src: string; poster: string; caption: string };
};

const m = (dir: string, file: string) => `/media/${dir}/${file}`;
const set = (dir: string, prefix: "adult" | "pup", count: number, from = 1) =>
  Array.from({ length: count }, (_, i) => m(dir, `${prefix}-${String(from + i).padStart(2, "0")}.jpg`));

/** Placeholder shown for breeds whose photo shoot is still outstanding. */
export const PHOTO_PENDING = "photo-pending";

export const breeds: Breed[] = [
  {
    slug: "caucasian-shepherd",
    name: "Caucasian Shepherd",
    shortName: "Caucasian Shepherd",
    group: "Estate Guardian",
    origin: "Caucasus Mountains",
    size: "Giant",
    lifespan: "10–12 years",
    weight: "45–90 kg",
    height: "64–75 cm",
    temperament: ["Formidable", "Independent", "Protective", "Calm"],
    stats: { energy: 3, trainability: 3, family: 4, guarding: 5, shedding: 5 },
    tagline: "A mountain that decided to guard you.",
    description:
      "Bred for centuries in the Caucasus to face wolves alone through the night, the Ovcharka is the heaviest guardian we raise. It is slow to rouse and impossible to move — profoundly bonded to its own family, utterly indifferent to persuasion from anyone else. For a compound, a farm or a serious estate, nothing else reads the same at the gate.",
    care:
      "Steady daily walking rather than sprinting, plus early and continuous socialisation. Serious weekly grooming for the double coat. Needs secure fencing and an owner who is comfortable being the decision-maker.",
    residents: [
      { name: "Rocco", sex: "Male", born: "2024-10-10", role: "Foundation sire" },
      { name: "Maya", sex: "Female", born: "2024-10-19", role: "Foundation dam" },
    ],
    mediaDir: "caucasian",
    photoPending: false,
    heroImage: m("caucasian", "adult-04.jpg"),
    gallery: [...set("caucasian", "adult", 11), ...set("caucasian", "pup", 2)],
  },
  {
    slug: "white-swiss-shepherd",
    name: "White Long Coat Swiss Shepherd",
    shortName: "White Swiss Shepherd",
    group: "Working Shepherd",
    origin: "Switzerland",
    size: "Large",
    lifespan: "12–14 years",
    weight: "25–40 kg",
    height: "55–66 cm",
    temperament: ["Gentle", "Alert", "Sensitive", "Eager"],
    stats: { energy: 4, trainability: 5, family: 5, guarding: 3, shedding: 4 },
    tagline: "The shepherd, in snow.",
    description:
      "A softer, more sensitive cousin of the working shepherd — the same brain and biddability, noticeably lower sharpness, carried in the long white coat the breed is known for. The Berger Blanc Suisse is the line we recommend to families who want a shepherd's intelligence and loyalty around children without a hard protection edge. Ours are raised underfoot from birth.",
    care:
      "Daily exercise plus training games; they are quick to bore. Brush the white double coat twice weekly. Sensitive to harsh handling — rewards patience enormously.",
    residents: [{ name: "Simba", sex: "Male", role: "Foundation sire" }],
    mediaDir: "white-shepherd",
    photoPending: false,
    heroImage: m("white-shepherd", "adult-02.jpg"),
    gallery: set("white-shepherd", "adult", 9),
  },
  {
    slug: "royal-black-shepherd",
    name: "Royal Black German Shepherd",
    shortName: "Royal Black Shepherd",
    group: "Working Shepherd",
    origin: "Germany",
    size: "Large",
    lifespan: "9–13 years",
    weight: "26–42 kg",
    height: "55–65 cm",
    temperament: ["Regal", "Intelligent", "Courageous", "Loyal"],
    stats: { energy: 5, trainability: 5, family: 4, guarding: 5, shedding: 4 },
    tagline: "Solid black. Straight back. Pure presence.",
    description:
      "The solid black German Shepherd is the rarest and most striking expression of the breed — a recessive coat carried by both parents, paired here with straighter backs, heavy bone and the long plush coat our clients travel for. Every dog in this line comes from proven working stock with certified hips and the level, unshakeable temperament the breed is meant to have.",
    care:
      "Vigorous daily exercise and genuine mental work. Weekly brushing, daily through the seasonal coat blow. Thrives on structure, training and being close to its people.",
    residents: [{ name: "Felly Atlas", sex: "Female", born: "2024-09-21", role: "Foundation dam" }],
    mediaDir: "gsd-black",
    photoPending: false,
    heroImage: m("gsd-black", "adult-01.jpg"),
    gallery: [...set("gsd-black", "adult", 7), ...set("gsd-black", "pup", 12)],
  },
  {
    slug: "american-akita",
    name: "American Akita",
    shortName: "American Akita",
    group: "Spitz & Companion",
    origin: "Japan / United States",
    size: "Large",
    lifespan: "10–13 years",
    weight: "32–59 kg",
    height: "61–71 cm",
    temperament: ["Dignified", "Bold", "Reserved", "Devoted"],
    stats: { energy: 3, trainability: 3, family: 4, guarding: 4, shedding: 5 },
    tagline: "Quiet loyalty in a bear's coat.",
    description:
      "The American Akita is a large, powerfully built spitz with a plush double coat, a broad bear-like head and a famously silent devotion to its household. It does not fuss, bark or beg for strangers — it simply attaches itself to its family for life and stands between them and anything unfamiliar.",
    care:
      "Two solid walks a day and firm, respectful training from puppyhood. Heavy shedding twice a year needs committed brushing. Happiest as the only dog, at the centre of its family.",
    residents: [],
    mediaDir: "akita",
    photoPending: false,
    heroImage: m("akita", "adult-02.jpg"),
    gallery: set("akita", "adult", 6),
  },
  {
    slug: "kangal",
    name: "Kangal",
    shortName: "Kangal",
    group: "Estate Guardian",
    origin: "Sivas, Türkiye",
    size: "Giant",
    lifespan: "12–15 years",
    weight: "41–66 kg",
    height: "65–81 cm",
    temperament: ["Watchful", "Composed", "Independent", "Gentle at home"],
    stats: { energy: 3, trainability: 3, family: 4, guarding: 5, shedding: 4 },
    tagline: "Türkiye's shepherd of the high plains.",
    description:
      "The Kangal is the livestock guardian other guardians are measured against — famed for the strongest bite in the canine world and, far more importantly, for the judgement to almost never use it. Calm, patient and astonishingly gentle with children and stock, it patrols a boundary all night and sleeps at the door all day.",
    care:
      "Room to patrol and a boundary worth patrolling. Early socialisation matters more than obedience drilling. Weekly brushing; heavier during the seasonal moult.",
    residents: [],
    mediaDir: "kangal",
    photoPending: false,
    heroImage: m("kangal", "adult-01.jpg"),
    gallery: [...set("kangal", "adult", 2), ...set("kangal", "pup", 2)],
    video: {
      src: m("kangal", "clip-01.mp4"),
      poster: m("kangal", "adult-02.jpg"),
      caption: "Filmed on the range where our Kangals are raised.",
    },
  },
];

export const breedGroups: BreedGroup[] = [
  "Estate Guardian",
  "Working Shepherd",
  "Spitz & Companion",
];

export const getBreed = (slug: string) => breeds.find((b) => b.slug === slug);

/** Breeds the client still owes us photographs for — surfaced in the admin portal. */
export const breedsAwaitingPhotos = breeds.filter((b) => b.photoPending);

/** Every dog on the ground, breed by breed — this is the cover-page register. */
export const breedRegister = breeds.map((b) => ({
  slug: b.slug,
  name: b.name,
  shortName: b.shortName,
  tagline: b.tagline,
  group: b.group,
  heroImage: b.heroImage,
  residents: b.residents,
}));

/** "21 September 2024", from the ISO date on a vaccination record. */
export function formatBorn(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
