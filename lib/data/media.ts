import { breeds } from "./breeds";

/**
 * The kennel's own photography, catalogued.
 *
 * Everything the site displays comes from /public/media — the client's real
 * dogs. There is no stock imagery anywhere in the app, and nothing here should
 * ever be replaced with any.
 *
 * The kennel folder — staff portraits, handlers holding puppies and the
 * line-ups on the lawn — was withdrawn at the client's request: the site shows
 * dogs, not employees. Those files are archived outside the repo at
 * ../removed-photos/kennel. Page headers therefore draw on the breed
 * photography, which is what the pages are about anyway.
 */

const m = (dir: string, file: string) => `/media/${dir}/${file}`;

/** Every breed photograph we hold, in register order. */
export const breedGallery = breeds.flatMap((b) =>
  b.gallery.map((src) => ({ src, breed: b.name, breedSlug: b.slug }))
);

/** Full gallery feed. */
export const galleryImages = breedGallery.map((g) => g.src);

/** Captioned feed for the gallery grid. */
export const galleryItems = breedGallery.map((g) => ({
  src: g.src,
  caption: g.breed,
  href: `/breeds/${g.breedSlug}`,
}));

/** Page headers. Each one is a dog-only frame — no handlers in shot. */
export const heroImages = {
  home: m("gsd-black", "adult-01.jpg"),
  shop: m("gsd-black", "pup-01.jpg"),
  puppies: m("gsd-sable", "pup-05.jpg"),
  breeds: m("white-shepherd", "adult-01.jpg"),
  gallery: m("akita", "adult-01.jpg"),
  about: m("white-shepherd", "adult-03.jpg"),
  services: m("gsd-black", "pup-04.jpg"),
  contact: m("white-shepherd", "adult-08.jpg"),
  legal: m("gsd-black", "pup-02.jpg"),
  auth: m("white-shepherd", "adult-02.jpg"),
} as const;
