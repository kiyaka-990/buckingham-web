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

  { id: "BK-1042", date: "2026-08-14", customer: "David Kimani", email: "david.k@email.com", location: "Nairobi", items: [{ name: "Obsidian", breed: "Royal Black German Shepherd", qty: 1, price: 1700 }], total: 1700, status: "in-transit", payment: "Card (Stripe)" },
  { id: "BK-1041", date: "2026-08-12", customer: "Aisha Mohammed", email: "aisha.m@email.com", location: "Mombasa", items: [{ name: "Nyota", breed: "Royal Black German Shepherd", qty: 1, price: 1600 }], total: 1600, status: "confirmed", payment: "M-Pesa" },
  { id: "BK-1040", date: "2026-08-10", customer: "James Otieno", email: "james.o@email.com", location: "Kisumu", items: [{ name: "Grom", breed: "Caucasian Shepherd", qty: 1, price: 2400 }], total: 2400, status: "delivered", payment: "Card (Stripe)" },
  { id: "BK-1039", date: "2026-08-08", customer: "Grace Wanjiru", email: "grace.w@email.com", location: "Nakuru", items: [{ name: "Elif", breed: "Kangal", qty: 1, price: 2200 }], total: 2200, status: "delivered", payment: "M-Pesa" },
  { id: "BK-1038", date: "2026-08-06", customer: "Peter Mwangi", email: "peter.m@email.com", location: "Uasin Gishu", items: [{ name: "Bora", breed: "Kangal", qty: 1, price: 2100 }], total: 2100, status: "pending", payment: "M-Pesa" },
  { id: "BK-1037", date: "2026-08-03", customer: "Linda Achieng", email: "linda.a@email.com", location: "Nairobi", items: [{ name: "Shujaa", breed: "Royal Black German Shepherd", qty: 1, price: 1900 }], total: 1900, status: "delivered", payment: "Card (Stripe)" },
  { id: "BK-1036", date: "2026-07-30", customer: "Samuel Kip", email: "sam.kip@email.com", location: "Nakuru", items: [{ name: "Malkia", breed: "Royal Black German Shepherd", qty: 1, price: 1800 }], total: 1800, status: "cancelled", payment: "Card (Stripe)" },
  { id: "BK-1035", date: "2026-07-27", customer: "Fatuma Ali", email: "fatuma.a@email.com", location: "Mombasa", items: [{ name: "Grom", breed: "Caucasian Shepherd", qty: 1, price: 2400 }], total: 2400, status: "delivered", payment: "M-Pesa" },
];

export const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  confirmed: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "in-transit": "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
};
