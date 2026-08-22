/**
 * The kennel's vaccination records, as published.
 *
 * These are photographs of the dogs' actual GetMeKnown vaccine cards — the
 * proof behind every health claim the site makes. Each dog has two frames: the
 * named front of the card, and the opened spread showing the vaccine stickers,
 * batch numbers and the vet's dated entries.
 *
 * The published images are redacted copies. Microchip numbers, the attending
 * veterinarian's signature, stamp and KVB licence number, and the export
 * certificate number are painted out before the file reaches /public — a
 * microchip number is an ownership credential and a published signature is
 * forgeable. Everything that evidences the vaccination itself is left legible.
 *
 * Dates and details here are transcribed from the cards. Where a card is
 * unclear we say less rather than guess; the image is always the authority.
 */

export type RecordFrame = {
  src: string;
  /** What this frame of the card shows. */
  caption: string;
};

export type VaccinationRecord = {
  /** The dog's name as written on its own card. */
  dog: string;
  /** Slug of the breed this dog belongs to, per the card's own Breed field. */
  breedSlug: string;
  breedLabel: string;
  sex: "Male" | "Female";
  /** ISO date, from the card's Birth Date field. */
  born: string;
  /** Vaccines recorded on the card, in the order they were given. */
  vaccines: string[];
  /** The card's own "Next vaccination due" entry, as written. */
  nextDue?: string;
  /** Medical-history notes written on the card. */
  notes?: string;
  frames: [RecordFrame, RecordFrame];
};

const r = (file: string) => `/media/records/${file}`;

export const vaccinationRecords: VaccinationRecord[] = [
  {
    dog: "Rocco",
    breedSlug: "caucasian-shepherd",
    breedLabel: "Caucasian Shepherd",
    sex: "Male",
    born: "2024-10-10",
    vaccines: ["Parvovirus (Vanguard Plus CPV) — 14/11/24", "Parvovirus (Vanguard Plus CPV) — 28/11/24"],
    nextDue: "28/12/24",
    notes: "Deworming 16/12/24",
    frames: [
      { src: r("rocco-card.jpg"), caption: "Rocco's vaccine record card" },
      { src: r("rocco-record.jpg"), caption: "Vaccination record — batch stickers and dated entries" },
    ],
  },
  {
    dog: "Maya",
    breedSlug: "caucasian-shepherd",
    breedLabel: "Caucasian Shepherd",
    sex: "Female",
    born: "2024-10-19",
    vaccines: ["Parvovirus (Vanguard Plus CPV) — 23/11/24", "Parvovirus (Vanguard Plus CPV) — 07/12/24"],
    nextDue: "07/01/25",
    frames: [
      { src: r("maya-card.jpg"), caption: "Maya's vaccine record card" },
      { src: r("maya-record.jpg"), caption: "Vaccination record — batch stickers and dated entries" },
    ],
  },
  {
    dog: "Felly Atlas",
    breedSlug: "royal-black-shepherd",
    breedLabel: "Royal Black German Shepherd",
    sex: "Female",
    born: "2024-09-21",
    vaccines: [
      "Parvovirus (Vanguard Plus CPV)",
      "Nobivac DHPPi boosters",
      "Rabies (Rabisin) with Nobivac DAPPv — 17/12/24",
    ],
    nextDue: "17/12/2025",
    notes: "Dewormed 05/10/24, 05/11/24 and 09/12/24",
    frames: [
      { src: r("felly-card.jpg"), caption: "Felly Atlas's vaccine record card" },
      { src: r("felly-record.jpg"), caption: "Vaccination record — rabies and DHPPi entries" },
    ],
  },
];

/** Records for one breed, for the breed detail page. */
export const recordsForBreed = (slug: string) =>
  vaccinationRecords.filter((v) => v.breedSlug === slug);
