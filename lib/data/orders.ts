export type OrderStatus = "pending" | "confirmed" | "in-transit" | "delivered" | "cancelled";

export type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  location: string;
  items: { name: string; breed: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  payment: "Card (Stripe)" | "M-Pesa";
};

export const orders: Order[] = [
  { id: "BK-1042", date: "2026-07-24", customer: "David Kimani", email: "david.k@email.com", location: "Nairobi", items: [{ name: "Maximus", breed: "German Shepherd", qty: 1, price: 3200 }], total: 3200, status: "in-transit", payment: "Card (Stripe)" },
  { id: "BK-1041", date: "2026-07-22", customer: "Aisha Mohammed", email: "aisha.m@email.com", location: "Mombasa", items: [{ name: "Coco", breed: "French Bulldog", qty: 1, price: 3600 }], total: 3600, status: "confirmed", payment: "M-Pesa" },
  { id: "BK-1040", date: "2026-07-20", customer: "James Otieno", email: "james.o@email.com", location: "Kisumu", items: [{ name: "Kaiser", breed: "Belgian Malinois", qty: 1, price: 6500 }], total: 6500, status: "delivered", payment: "Card (Stripe)" },
  { id: "BK-1039", date: "2026-07-19", customer: "Grace Wanjiru", email: "grace.w@email.com", location: "Nakuru", items: [{ name: "Sunny", breed: "Golden Retriever", qty: 1, price: 1800 }], total: 1800, status: "delivered", payment: "M-Pesa" },
  { id: "BK-1038", date: "2026-07-18", customer: "Peter Mwangi", email: "peter.m@email.com", location: "Eldoret", items: [{ name: "Titan", breed: "Rottweiler", qty: 1, price: 3400 }], total: 3400, status: "pending", payment: "M-Pesa" },
  { id: "BK-1037", date: "2026-07-15", customer: "Linda Achieng", email: "linda.a@email.com", location: "Nairobi", items: [{ name: "Onyx", breed: "Doberman", qty: 1, price: 5600 }], total: 5600, status: "delivered", payment: "Card (Stripe)" },
  { id: "BK-1036", date: "2026-07-12", customer: "Samuel Kip", email: "sam.kip@email.com", location: "Nakuru", items: [{ name: "Pierre", breed: "French Bulldog", qty: 1, price: 4200 }], total: 4200, status: "cancelled", payment: "Card (Stripe)" },
  { id: "BK-1035", date: "2026-07-10", customer: "Fatuma Ali", email: "fatuma.a@email.com", location: "Mombasa", items: [{ name: "Belle", breed: "Golden Retriever", qty: 1, price: 1900 }], total: 1900, status: "delivered", payment: "M-Pesa" },
];

export const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  confirmed: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "in-transit": "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
};
