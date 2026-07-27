export const site = {
  name: "Buckingham Kennel Limited",
  shortName: "Buckingham Kennel",
  tagline: "Royalty in Every Paw",
  description:
    "Kenya's premier kennel for the breeding and sale of world-class dogs and puppies. Champion bloodlines, health-guaranteed, delivered with royal care.",
  quote: {
    text: "A dog is the only thing on earth that loves you more than you love yourself.",
    author: "Josh Billings",
  },
  registration: "PVT-8Z1ZR2E5",
  established: 2026,
  contact: {
    phone: "+254720332626",
    phoneDisplay: "+254 720 332 626",
    whatsapp: "254720332626",
    email: "buckinghamkennellltd@gmail.com",
    address: {
      building: "The Great Mini Mall, Webuye",
      street: "T-Junction, Lions Road",
      locality: "Webuye",
      county: "Bungoma",
      country: "Kenya",
      poBox: "P.O. Box 576, 50205 — Webuye",
    },
  },
  payments: {
    mpesaPaybill: "XXXXXX", // Owner to activate
    mpesaAccountPrefix: "BK",
    currency: "USD",
  },
  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    youtube: "https://youtube.com/",
  },
  admin: {
    demoEmail: "admin@buckinghamkennel.co.ke",
    demoPassword: "buckingham2026",
  },
} as const;

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop Dogs", href: "/shop" },
  { label: "Puppies", href: "/puppies" },
  { label: "Breeds", href: "/breeds" },
  { label: "Services", href: "/services" },
  { label: "3D Showroom", href: "/showroom" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
