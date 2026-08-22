export const revenueSeries = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  data: [9800, 12400, 18900, 15600, 24300, 28700, 31200],
};

export const trafficSources = [
  { label: "Organic Search", value: 42, color: "#c9972a" },
  { label: "Social Media", value: 28, color: "#4d68bd" },
  { label: "Direct", value: 18, color: "#e6c65a" },
  { label: "Referral", value: 12, color: "#7d95d6" },
];

export const funnel = [
  { stage: "Visitors", value: 12480 },
  { stage: "Viewed a dog", value: 5310 },
  { stage: "Added to cart", value: 1420 },
  { stage: "Checkout", value: 520 },
  { stage: "Purchased", value: 312 },
];

export const salesByCategory = [
  { label: "Puppies", value: 38, color: "#e6c65a" },
  { label: "Trained", value: 27, color: "#c9972a" },
  { label: "Elite", value: 21, color: "#4d68bd" },
  { label: "Adult", value: 14, color: "#7d95d6" },
];

export const geoSales = [
  { region: "Nairobi", value: 41 },
  { region: "Mombasa", value: 18 },
  { region: "Nakuru", value: 14 },
  { region: "Kisumu", value: 12 },
  { region: "Eldoret", value: 9 },
  { region: "Other", value: 6 },
];

export type Activity = { who: string; action: string; time: string; kind: "order" | "message" | "stock" | "review" };
export const activity: Activity[] = [
  { who: "David Kimani", action: "placed an order for Obsidian (Royal Black GSD puppy)", time: "12 min ago", kind: "order" },
  { who: "Aisha Mohammed", action: "sent a WhatsApp enquiry", time: "40 min ago", kind: "message" },
  { who: "System", action: "Nyota (Royal Black GSD puppy) marked delivered", time: "2 hrs ago", kind: "stock" },
  { who: "Grace Wanjiru", action: "left a 5★ review for Elif", time: "5 hrs ago", kind: "review" },
  { who: "Peter Mwangi", action: "started M-Pesa checkout for Bora", time: "8 hrs ago", kind: "order" },
  { who: "System", action: "Low stock alert: Kangal puppies", time: "1 day ago", kind: "stock" },
];

export type Message = {
  id: string;
  name: string;
  email: string;
  channel: "Web Form" | "WhatsApp" | "Email";
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
};

export const messages: Message[] = [
  { id: "m1", name: "Aisha Mohammed", email: "aisha.m@email.com", channel: "WhatsApp", subject: "Akita availability", preview: "Hi, do you have any American Akita puppies available this month? I'm in Mombasa…", time: "40 min ago", unread: true },
  { id: "m2", name: "Brian Ketto", email: "brian.k@email.com", channel: "Web Form", subject: "Protection dog for compound", preview: "Looking for a fully trained Kangal or black shepherd for a residential compound in Karen…", time: "2 hrs ago", unread: true },
  { id: "m3", name: "Njeri Kamau", email: "njeri@email.com", channel: "Email", subject: "Delivery to Kisumu", preview: "What are the delivery options and costs to Kisumu for a Caucasian Shepherd puppy?", time: "6 hrs ago", unread: true },
  { id: "m4", name: "Omar Said", email: "omar.s@email.com", channel: "WhatsApp", subject: "Kangal puppy price", preview: "Habari, bei ya Kangal puppy ni ngapi? Na mnakubali M-Pesa?", time: "1 day ago", unread: false },
  { id: "m5", name: "Cynthia Auma", email: "cynthia@email.com", channel: "Web Form", subject: "Stud service enquiry", preview: "I have a female Caucasian Shepherd and I'm interested in your stud services…", time: "2 days ago", unread: false },
];
