/**
 * Buckingham Kennel breed register.
 *
 * The five breeds the kennel actually sells, plus two lines it already keeps
 * on the ground (White Swiss Shepherd and the sable German Shepherd litters).
 *
 * `mediaDir` points at the kennel's own photography under /public/media.
 * One breed — the Boerboel — has no photographs supplied yet, so it
 * carries `photoPending` and renders a branded crest plate instead. We never
 * substitute stock imagery for the client's dogs.
 */

export type BreedGroup = "Estate Guardian" | "Working Shepherd" | "Spitz & Companion";

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
  /** Folder under /public/media holding this breed's photography. */
  mediaDir: string;
  /** True when the kennel has not supplied photographs of this breed yet. */
  photoPending: boolean;
  heroImage: string;
  gallery: string[];
};

const m = (dir: string, file: string) => `/media/${dir}/${file}`;
const set = (dir: string, prefix: "adult" | "pup", count: number, from = 1) =>
  Array.from({ length: count }, (_, i) => m(dir, `${prefix}-${String(from + i).padStart(2, "0")}.jpg`));

/** Placeholder shown for breeds whose photo shoot is still outstanding. */
export const PHOTO_PENDING = "photo-pending";

export const breeds: Breed[] = [
  {
    slug: "boerboel",
    name: "Boerboel",
    shortName: "Boerboel",
    group: "Estate Guardian",
    origin: "South Africa",
    size: "Giant",
    lifespan: "9–11 years",
    weight: "50–90 kg",
    height: "59–70 cm",
    temperament: ["Fearless", "Devoted", "Territorial", "Steady"],
    stats: { energy: 3, trainability: 4, family: 4, guarding: 5, shedding: 2 },
    tagline: "The African farm protector.",
    description:
      "Bred on the South African veld to hold a homestead against anything that came for it, the Boerboel is a giant of surprising agility and deep family devotion. Immense in the yard and tender in the house, it is the definitive estate guardian for an owner who can lead it.",
    care:
      "Moderate daily exercise, firm early training and real space to patrol. Almost no grooming. Wants a job, a boundary and a family to sit with at the end of it.",
    mediaDir: "boerboel",
    photoPending: true,
    heroImage: PHOTO_PENDING,
    gallery: [],
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
    mediaDir: "gsd-black",
    photoPending: false,
    heroImage: m("gsd-black", "adult-01.jpg"),
    gallery: [...set("gsd-black", "adult", 7), ...set("gsd-black", "pup", 12)],
  },
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
    mediaDir: "caucasian",
    photoPending: false,
    heroImage: m("caucasian", "adult-04.jpg"),
    gallery: [...set("caucasian", "adult", 11), ...set("caucasian", "pup", 2)],
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
    mediaDir: "kangal",
    photoPending: false,
    heroImage: m("kangal", "adult-01.jpg"),
    gallery: [...set("kangal", "adult", 2), ...set("kangal", "pup", 2)],
  },
  {
    slug: "white-swiss-shepherd",
    name: "White Swiss Shepherd",
    shortName: "White Shepherd",
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
      "A softer, more sensitive cousin of the working shepherd — same brain and biddability, noticeably lower sharpness. The Berger Blanc Suisse is the line we recommend to families who want a shepherd's intelligence and loyalty around children without a hard protection edge. Ours are raised underfoot from birth.",
    care:
      "Daily exercise plus training games; they are quick to bore. Brush the white double coat twice weekly. Sensitive to harsh handling — rewards patience enormously.",
    mediaDir: "white-shepherd",
    photoPending: false,
    heroImage: m("white-shepherd", "adult-02.jpg"),
    gallery: set("white-shepherd", "adult", 9),
  },
  {
    slug: "sable-german-shepherd",
    name: "Sable German Shepherd",
    shortName: "Sable Shepherd",
    group: "Working Shepherd",
    origin: "Germany",
    size: "Large",
    lifespan: "9–13 years",
    weight: "24–40 kg",
    height: "55–65 cm",
    temperament: ["Driven", "Confident", "Trainable", "Nervy-free"],
    stats: { energy: 5, trainability: 5, family: 4, guarding: 5, shedding: 4 },
    tagline: "The original working coat.",
    description:
      "Sable is the oldest coat pattern in the breed and still the one working kennels reach for. Our sable litters come from the same protection lines as our black dogs, with the drive, nerve strength and handler focus that make a shepherd worth owning. This is the line we put forward for security work and serious sport homes.",
    care:
      "High exercise and daily training — this coat comes with an engine. Weekly brushing. Needs a handler who will actually work the dog.",
    mediaDir: "gsd-sable",
    photoPending: false,
    heroImage: m("gsd-sable", "adult-01.jpg"),
    gallery: [...set("gsd-sable", "adult", 1), ...set("gsd-sable", "pup", 13)],
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
