import {
  Dog as DogIcon,
  ShieldCheck,
  Stethoscope,
  GraduationCap,
  Truck,
  Scissors,
  HeartHandshake,
  Users,
} from "lucide-react";

export const services = [
  {
    slug: "breeding",
    icon: DogIcon,
    title: "Champion Breeding",
    short: "Ethical breeding from titled, health-tested bloodlines.",
    description:
      "Our breeding program pairs proven champions with rigorous health testing (hips, elbows, DNA) to produce sound, stable, world-class puppies.",
  },
  {
    slug: "protection-training",
    icon: ShieldCheck,
    title: "Protection & Obedience Training",
    short: "Personal protection, family guarding and obedience programs.",
    description:
      "From basic manners to advanced personal-protection work, our certified handlers deliver structured, force-balanced training for you and your dog.",
  },
  {
    slug: "veterinary",
    icon: Stethoscope,
    title: "Veterinary & Health Care",
    short: "Full vaccination, deworming, microchipping and vet checks.",
    description:
      "Every Buckingham dog leaves fully vaccinated, dewormed, microchipped and vet-certified, backed by our written health guarantee.",
  },
  {
    slug: "handling-showing",
    icon: GraduationCap,
    title: "Show Handling & Conformation",
    short: "Professional handling and show preparation.",
    description:
      "With extensive conformation experience, we prepare and present dogs in the show ring and mentor owners toward their own titles.",
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
      "Keep your companion looking regal with our full grooming services — bathing, de-shedding, nail and coat care by trained groomers.",
  },
  {
    slug: "stud",
    icon: HeartHandshake,
    title: "Stud Services",
    short: "Access to our proven, titled stud dogs.",
    description:
      "Our health-tested, titled studs are available to approved dams, with full support through mating and whelping.",
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
    text: "Buckingham delivered beyond every expectation. Maximus is confident, healthy and incredible with my children. The pedigree paperwork was immaculate.",
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
  { value: "5", label: "Elite Breeds" },
  { value: "$1,600", label: "Puppies From" },
  { value: "100%", label: "Health Guaranteed" },
];

export const faqs = [
  {
    q: "Do you sell adult dogs?",
    a: "No. Our adult dogs are our breeding programme and none of them are for sale — they are on the site so you can see the parents behind a litter and come and meet them. We sell puppies only, and prices start at $1,600.",
  },
  {
    q: "How much is a puppy?",
    a: "Puppies start at $1,600 and the exact price depends on the breed, the litter and the individual puppy. Every price on the site is the full price — vaccinations, deworming, microchip, vet check, pedigree papers and the health guarantee are all included.",
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
