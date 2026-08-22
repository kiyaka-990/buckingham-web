"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { categoryList, isForSale, type Category, type Dog } from "@/lib/data/catalog";
import { breeds } from "@/lib/data/breeds";
import { DogCard } from "@/components/shop/dog-card";
import { formatPrice, cn } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "rating";

export function ShopView({ dogs, priceRange }: { dogs: Dog[]; priceRange: { min: number; max: number } }) {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [breed, setBreed] = useState<string>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [sort, setSort] = useState<Sort>("featured");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const c = params.get("category");
    const b = params.get("breed");
    const query = params.get("q");
    if (c && ["puppy", "adult", "trained", "elite"].includes(c)) setCategory(c as Category);
    if (b) setBreed(b);
    if (query) setQ(query);
  }, [params]);

  const filtered = useMemo(() => {
    // Only puppies carry a price, so the price slider only ever filters them —
    // the parent dogs are unpriced and must not be squeezed out by it.
    let list = dogs.filter((d) => !isForSale(d) || d.price <= maxPrice);
    if (breed !== "all") list = list.filter((d) => d.breedSlug === breed);
    if (category !== "all") list = list.filter((d) => d.category === category);
    if (availableOnly) list = list.filter((d) => d.status === "available");
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((d) => `${d.name} ${d.breedName} ${d.color} ${d.category}`.toLowerCase().includes(t));
    }
    // Unpriced dogs always sort last on a price sort rather than reading as free.
    const byPrice = (a: Dog, b: Dog, dir: 1 | -1) => {
      if (isForSale(a) !== isForSale(b)) return isForSale(a) ? -1 : 1;
      return (a.price - b.price) * dir;
    };
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => byPrice(a, b, 1)); break;
      case "price-desc": list = [...list].sort((a, b) => byPrice(a, b, -1)); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      default: list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured)); break;
    }
    return list;
  }, [dogs, q, breed, category, maxPrice, sort, availableOnly]);

  const reset = () => {
    setQ(""); setBreed("all"); setCategory("all"); setMaxPrice(priceRange.max); setAvailableOnly(false); setSort("featured");
  };

  const Filters = (
    <div className="space-y-7">
      <div>
        <label className="mb-2 block text-sm font-semibold">Search</label>
        <div className="flex items-center gap-2 rounded-full border border-border px-3">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, colour…" className="h-10 flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>

      <FilterGroup title="Category">
        <Pill active={category === "all"} onClick={() => setCategory("all")}>All</Pill>
        {categoryList.map((c) => (
          <Pill key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</Pill>
        ))}
      </FilterGroup>

      <FilterGroup title="Breed">
        <Pill active={breed === "all"} onClick={() => setBreed("all")}>All breeds</Pill>
        {breeds.map((b) => (
          <Pill key={b.slug} active={breed === b.slug} onClick={() => setBreed(b.slug)}>{b.name}</Pill>
        ))}
      </FilterGroup>

      <div>
        <label className="mb-2 block text-sm font-semibold">Max puppy price: {formatPrice(maxPrice)}</label>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-ochre-400"
        />
        <div className="flex justify-between text-xs text-muted">
          <span>{formatPrice(priceRange.min)}</span>
          <span>{formatPrice(priceRange.max)}</span>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} className="accent-ochre-400 h-4 w-4" />
        Available only
      </label>

      <button onClick={reset} className="text-sm text-accent-ink hover:underline">Reset filters</button>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-3xl border border-border bg-surface p-6">{Filters}</div>
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted"><span className="font-semibold text-foreground">{filtered.length}</span> dogs found</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileFilters(true)} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm lg:hidden">
              <SlidersHorizontal size={15} /> Filters
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-24 text-center text-muted">
            No dogs match your filters. <button onClick={reset} className="text-accent-ink hover:underline">Reset</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {filtered.map((dog, i) => (
              <DogCard key={dog.id} dog={dog} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-clay-950/60 backdrop-blur-sm" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Close"><X /></button>
            </div>
            {Filters}
            <button onClick={() => setMobileFilters(false)} className="btn-clay mt-6 h-12 w-full rounded-full">Show {filtered.length} results</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition",
        active ? "border-ochre-400 bg-ochre-400/10 text-accent-ink" : "border-border hover:border-ochre-400"
      )}
    >
      {children}
    </button>
  );
}
