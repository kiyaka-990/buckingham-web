"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { breeds } from "@/lib/data/breeds";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/puppies");
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
}

const defaultPedigree = {
  sire: "Ch. Baron von Buckingham",
  dam: "Ch. Duchess of Webuye",
  grandSire: "GCh. Apollo vom Königshaus",
  grandDam: "Ch. Luna Royal Line",
  champions: ["Best of Breed"],
  generations: 5,
  registry: "KUC / FCI Registered",
  inbreedingCoefficient: "3.0%",
};
const defaultHealth = {
  vaccinated: true, dewormed: true, vetChecked: true, microchipped: true,
  healthGuaranteeMonths: 24, hipScore: "OFA Good",
};

function parseForm(fd: FormData) {
  const breedSlug = String(fd.get("breedSlug") || "german-shepherd");
  const breed = breeds.find((b) => b.slug === breedSlug);
  const image = String(fd.get("image") || "").trim() || "/media/gsd-black/adult-01.jpg";
  const traits = String(fd.get("traits") || "").split(",").map((t) => t.trim()).filter(Boolean);
  return {
    name: String(fd.get("name") || "Unnamed").trim(),
    breedSlug,
    breedName: breed?.name ?? "Dog",
    category: String(fd.get("category") || "puppy"),
    sex: String(fd.get("sex") || "Male"),
    ageLabel: String(fd.get("ageLabel") || "10 weeks").trim(),
    color: String(fd.get("color") || "").trim() || "Standard",
    price: Number(fd.get("price") || 1600),
    compareAt: fd.get("compareAt") ? Number(fd.get("compareAt")) : null,
    status: String(fd.get("status") || "available"),
    stock: Number(fd.get("stock") || 1),
    featured: fd.get("featured") === "on" || fd.get("featured") === "true",
    bestseller: fd.get("bestseller") === "on" || fd.get("bestseller") === "true",
    weightKg: Number(fd.get("weightKg") || 10),
    location: String(fd.get("location") || "Nairobi").trim(),
    description: String(fd.get("description") || "").trim() || "A wonderful Buckingham companion.",
    images: JSON.stringify([image]),
    traits: JSON.stringify(traits.length ? traits : ["Loyal", "Healthy"]),
  };
}

export async function createDog(fd: FormData) {
  await requireAdmin();
  const data = parseForm(fd);
  const baseSlug = `${slugify(data.name)}-${data.breedSlug}`;
  let slug = baseSlug;
  if (await db.dog.findUnique({ where: { slug } })) slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  await db.dog.create({
    data: {
      id: `BK-${Date.now().toString(36).toUpperCase()}`,
      slug,
      ...data,
      rating: 4.8,
      reviews: 0,
      pedigree: JSON.stringify(defaultPedigree),
      health: JSON.stringify(defaultHealth),
    },
  });
  revalidateStore();
}

export async function updateDog(id: string, fd: FormData) {
  await requireAdmin();
  const data = parseForm(fd);
  await db.dog.update({ where: { id }, data });
  revalidateStore();
  revalidatePath(`/dogs/${data.name}`);
}

export async function deleteDog(id: string) {
  await requireAdmin();
  await db.dog.delete({ where: { id } });
  revalidateStore();
}

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  await db.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function toggleMessageRead(id: string, unread: boolean) {
  await requireAdmin();
  await db.message.update({ where: { id }, data: { unread } });
  revalidatePath("/admin/messages");
}

export async function saveSetting(key: string, value: string) {
  await requireAdmin();
  await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/admin/settings");
}
