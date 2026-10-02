import {
  Dog as DogIcon,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  Truck,
  Scissors,
  HeartHandshake,
  Users,
  Package,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  short: string;
  description: string;
  /** What is included — shown as a checklist on the services page. */
  highlights?: string[];
  /** Shown as a badge on the card. Only set where a price has been published. */
  price?: string;
  /** Pre-filled WhatsApp enquiry for services that are ordered directly. */
  enquiry?: string;
};

export const services: Service[] = [
  {
    slug: "breeding",
    icon: DogIcon,
    title: "Careful Breeding",
    short: "Limited litters from imported parent dogs you can come and meet.",
    description:
      "Our parent dogs were imported as puppies and are raised here. We breed a small number of litters a year, keep the mothers, and let you meet them before you choose. Our dogs are not Kennel Club registered and we make no pedigree claim.",
  },
  {
    slug: "protection-training",
    icon: ShieldCheck,
    title: "Dog Training",
    short: "Obedience, family protection and personal-protection programs.",
    description:
      "From basic manners to advanced personal-protection work, our certified handlers deliver structured, force-balanced training for you and your dog.",
    highlights: [
      "Obedience and house manners",
      "Family protection and guarding",
      "Advanced personal-protection work",
      "Handler-led sessions for you and your dog",
    ],
    enquiry: "Hello Buckingham Kennel, I'd like to enquire about dog training.",
  },
  {
    slug: "veterinary",
    icon: Stethoscope,
    title: "Veterinary & Health Care",
    short: "Full vaccination, deworming, microchipping and vet checks.",
    description:
      "Every Buckingham dog leaves fully vaccinated, dewormed, microchipped and vet-checked, with its vaccination record and our written health guarantee.",
  },
  {
    slug: "puppy-foundation",
    icon: GraduationCap,
    title: "Puppy Foundation & Socialisation",
    short: "Early handling, house manners and confidence work.",
    description:
      "Every litter is raised underfoot with early neurological stimulation, daily handling and exposure to household noise, stock and strangers, so a puppy arrives settled rather than starting from nothing.",
  },
  {
    slug: "delivery",
    icon: Truck,
    title: "Nationwide & Global Delivery",
    short: "Safe, climate-controlled delivery across Kenya and beyond.",
    description:
      "We arrange safe ground and air transport with all documentation, so your new companion arrives calm, healthy and on schedule.",
  },
  {
    slug: "grooming",
    icon: Scissors,
    title: "Grooming & Spa",
    short: "Full grooming, coat care and spa treatments.",
    description:
      "Keep your companion looking regal with our full grooming services, carried out by trained groomers.",
    highlights: ["Bathing and drying", "De-shedding", "Coat care", "Nail care"],
    enquiry: "Hello Buckingham Kennel, I'd like to book a grooming appointment.",
  },
  {
    slug: "dog-stands",
    icon: Package,
    title: "Dog Stands",
    short: "Dog stands, available to order from the kennel.",
    description:
      "Dog stands from Buckingham Kennel, made to the same standard as everything we put our name to. Message us for current availability, sizes and finish, and we will confirm every detail before you commit.",
    price: "From KES 150,000",
    enquiry: "Hello Buckingham Kennel, I'd like to order a dog stand. Please send me the details and availability.",
  },
  {
    slug: "stud",
    icon: HeartHandshake,
    title: "Stud Services",
    short: "Access to our imported stud dogs.",
    description:
      "Our imported, vet-checked studs are available to approved dams, with full support through mating and whelping. No pedigree certificate is issued — these are unregistered dogs.",
  },
  {
    slug: "mentorship",
    icon: Users,
    title: "Owner Mentorship",
    short: "Lifetime support and guidance for every owner.",
    description:
      "Buckingham owners join a lifetime support network — nutrition, training and health guidance for the life of your dog.",
  },
];

export const testimonials = [
  {
    name: "David Kimani",
    location: "Nairobi, Kenya",
    dog: "Royal Black Shepherd — Maximus",
    rating: 5,
    text: "Buckingham delivered beyond every expectation. Maximus is confident, healthy and incredible with my children. The paperwork was immaculate.",
  },
  {
    name: "Aisha Mohammed",
    location: "Mombasa, Kenya",
    dog: "American Akita — Coco",
    rating: 5,
    text: "The whole process felt premium from the first message. Coco arrived vaccinated, microchipped and clearly loved. World-class service.",
  },
  {
    name: "Grace Wanjiru",
    location: "Nakuru, Kenya",
    dog: "White Swiss Shepherd — Sunny",
    rating: 5,
    text: "Sunny is the heart of our home now. The team's after-sale mentorship has been amazing — they answer every question.",
  },
  {
    name: "Peter Mwangi",
    location: "Eldoret, Kenya",
    dog: "Kangal — Titan",
    rating: 5,
    text: "Massive, calm and beautifully tempered. You can see the quality of the bloodline. Highly recommend Buckingham Kennel.",
  },
  {
    name: "Linda Achieng",
    location: "Nairobi, Kenya",
    dog: "Caucasian Shepherd — Bear",
    rating: 5,
    text: "Bear is enormous, watchful and utterly devoted to the family. Buying online felt effortless and safe from the first message to delivery.",
  },
];

export const stats = [
  { value: "500+", label: "Happy Families" },
  { value: "5", label: "Breeds We Keep" },
  { value: "$450", label: "Puppies From" },
  { value: "100%", label: "Health Guaranteed" },
];

export const faqs = [
  {
    q: "Do the puppies come with pedigree or Kennel Club papers?",
    a: "No, and we would rather say so plainly than have it come as a surprise. Our puppies are not registered with the East Africa Kennel Club or any other registry, and they are not sold with a pedigree certificate. The parents were imported from overseas, but they arrived without pedigree certificates of their own, so there is no registered line to pass on. What every puppy does come with is its vaccination record, deworming history, microchip, a vet check and our written health guarantee. If you need a registered, papered dog for showing or for a registered breeding programme, we are not the right kennel for you and we will say so.",
  },
  {
    q: "Are the parent dogs registered or titled?",
    a: "No. They were imported as puppies and we hold their import health certificates, microchip records and vaccination books — you are welcome to see all of it. None of them carries a pedigree certificate, none is registered with a kennel club, and none has been shown or titled. They are here as the dogs behind the litters, and you can come and meet them.",
  },
  {
    q: "Do you sell adult dogs?",
    a: "No. Our adult dogs are our breeding programme and none of them are for sale — they are on the site so you can see the parents behind a litter and come and meet them. We sell puppies only, and they are $450–$550.",
  },
  {
    q: "How much is a puppy?",
    a: "Puppies run from $450 to $550 — never more than $550 — and the exact price depends on the breed, the litter and the individual puppy. Every price on the site is the full price — vaccinations, deworming, microchip, vet check, the vaccination record and the health guarantee are all included. There is no pedigree certificate — our dogs are not registered.",
  },
  {
    q: "Are your puppies health guaranteed?",
    a: "Yes. Every puppy leaves fully vaccinated, dewormed, microchipped and vet-checked, backed by a written health guarantee of up to 36 months on hereditary conditions.",
  },
  {
    q: "Do you deliver outside Nairobi or Kenya?",
    a: "Absolutely. We arrange safe, climate-controlled ground and air transport nationwide and internationally, with all export documentation handled for you.",
  },
  {
    q: "How do I reserve a puppy?",
    a: "Add your chosen puppy to the cart and check out with a deposit via Stripe (card) or M-Pesa. The puppy is then marked reserved and we coordinate collection or delivery.",
  },
  {
    q: "Can I visit the kennel?",
    a: "Yes — visits are by appointment at our Webuye facility. You can also explore our 3D virtual showroom online any time.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept international cards through Stripe and M-Pesa Paybill for local Kenyan payments. A deposit reserves your dog; the balance is due on delivery.",
  },
];
