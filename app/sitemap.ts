import type { MetadataRoute } from "next";
import { dogs } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/shop", "/puppies", "/breeds", "/services", "/showroom", "/gallery", "/about", "/contact"].map(
    (r) => ({ url: `${base}${r}`, lastModified: new Date() })
  );
  const dogRoutes = dogs.map((d) => ({ url: `${base}/dogs/${d.slug}`, lastModified: new Date() }));
  const breedRoutes = breeds.map((b) => ({ url: `${base}/breeds/${b.slug}`, lastModified: new Date() }));
  return [...staticRoutes, ...breedRoutes, ...dogRoutes];
}
