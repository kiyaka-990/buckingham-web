import { breeds } from "./breeds";

/**
 * The kennel's own photography, catalogued.
 *
 * Everything the site displays comes from /public/media — the client's real
 * dogs, handlers and facility. There is no stock imagery anywhere in the app,
 * and nothing here should ever be replaced with any.
 */

const m = (dir: string, file: string) => `/media/${dir}/${file}`;

/** Kennel grounds, handling and the team — used for page headers and About. */
export const kennel = {
  facility: [m("kennel", "facility-01.jpg"), m("kennel", "facility-02.jpg"), m("kennel", "facility-03.jpg")],
  care: [m("kennel", "care-01.jpg"), m("kennel", "care-02.jpg"), m("kennel", "care-03.jpg")],
  team: [
    m("kennel", "team-01.jpg"),
    m("kennel", "team-02.jpg"),
    m("kennel", "team-03.jpg"),
    m("kennel", "team-04.jpg"),
    m("kennel", "team-05.jpg"),
  ],
} as const;

/** Every breed photograph we hold, in register order. */
export const breedGallery = breeds.flatMap((b) =>
  b.gallery.map((src) => ({ src, breed: b.name, breedSlug: b.slug }))
);

/** Full gallery feed: dogs first, then the grounds and the people. */
export const galleryImages = [
  ...breedGallery.map((g) => g.src),
  ...kennel.facility,
  ...kennel.care,
  ...kennel.team,
];

/** Captioned feed for the gallery grid. */
export const galleryItems = [
  ...breedGallery.map((g) => ({ src: g.src, caption: g.breed, href: `/breeds/${g.breedSlug}` })),
  ...kennel.facility.map((src) => ({ src, caption: "The Webuye kennel", href: "/about" })),
  ...kennel.care.map((src) => ({ src, caption: "Daily care & handling", href: "/services" })),
  ...kennel.team.map((src) => ({ src, caption: "Our handlers", href: "/about" })),
];

/** Sensible defaults for page headers, so no page ever falls back to stock. */
export const heroImages = {
  home: m("gsd-black", "adult-01.jpg"),
  shop: m("akita", "adult-02.jpg"),
  puppies: m("gsd-black", "pup-01.jpg"),
  breeds: m("kangal", "adult-01.jpg"),
  gallery: kennel.facility[2],
  about: kennel.team[0],
  services: kennel.care[1],
  contact: kennel.facility[1],
  legal: kennel.care[0],
  auth: m("white-shepherd", "adult-02.jpg"),
} as const;
