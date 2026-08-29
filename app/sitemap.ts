import type { MetadataRoute } from "next";
import { dogs } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.buckinghamkennel.com";

  // Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/puppies",
    "/breeds",
    "/services",
    "/showroom",
    "/gallery",
    "/about",
    "/contact",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Breed Pages
  const breedRoutes: MetadataRoute.Sitemap = breeds.map((b) => ({
    url: `${base}/breeds/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Dynamic Individual Dog / Puppy Pages
  const dogRoutes: MetadataRoute.Sitemap = dogs.map((d) => ({
    url: `${base}/dogs/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...breedRoutes, ...dogRoutes];
}