"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { FadeImage } from "@/components/ui/fade-image";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dogs, isForSale, isPhotoPending } from "@/lib/data/catalog";
import { breeds, PHOTO_PENDING } from "@/lib/data/breeds";
import { useUI } from "@/lib/store/ui";
import { formatPrice } from "@/lib/utils";
import { matches, score } from "@/lib/search";

type IndexDog = {
  slug: string; name: string; breedName: string; breedSlug: string;
  color: string; category: string; ageLabel: string;
  price: number; status: string; forSale: boolean; image: string;
};

const trending = ["Puppies", "Kangal", "Caucasian Shepherd", "Royal Black Shepherd", "Akita"];

/** The bundled catalogue, used only until the live index arrives (or if it fails). */
const seedIndex: IndexDog[] = dogs.map((d) => ({
  slug: d.slug, name: d.name, breedName: d.breedName, breedSlug: d.breedSlug,
  color: d.color, category: d.category, ageLabel: d.ageLabel,
  price: d.price, status: d.status, forSale: isForSale(d),
  image: isPhotoPending(d) ? PHOTO_PENDING : d.images[0],
}));

export function SearchModal() {
  const { searchOpen, setSearch } = useUI();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<IndexDog[]>(seedIndex);
  const loaded = useRef(false);
  const router = useRouter();

  // Fetched once, the first time the modal opens — search must reflect what the
  // owner has actually listed, not what was in the bundle at build time.
  useEffect(() => {
    if (!searchOpen || loaded.current) return;
    loaded.current = true;
    fetch("/api/search")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.dogs?.length) setIndex(d.dogs as IndexDog[]); })
      .catch(() => { /* keep the bundled catalogue — stale beats broken */ });
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearch(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearch]);

  const results = useMemo(() => {
    if (!q.trim()) return { dogs: [], breeds: [] };
    const rank = (d: IndexDog) => score(`${d.name} ${d.breedName}`, q);
    return {
      // Puppies first: they are the only thing a visitor can actually buy.
      dogs: index
        .filter((d) => matches(`${d.name} ${d.breedName} ${d.color} ${d.category}`, q))
        .sort((a, b) => Number(b.forSale) - Number(a.forSale) || rank(b) - rank(a))
        .slice(0, 6),
      breeds: breeds.filter((b) => matches(b.name, q)).slice(0, 3),
    };
  }, [q, index]);

  const go = (href: string) => {
    setSearch(false);
    router.push(href);
  };

  /**
   * Enter used to send every query to /shop, which lists puppies only — so
   * searching for one of the parent dogs, or for a breed with no puppies in at
   * the moment, landed on an empty shop reading "no results" for a dog the
   * visitor had just seen listed. Go to the best actual match instead, and only
   * fall back to the shop when there is nothing to go to.
   */
  const submit = () => {
    if (results.dogs.length) return go(`/dogs/${results.dogs[0].slug}`);
    if (results.breeds.length) return go(`/breeds/${results.breeds[0].slug}`);
    go(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-graphite-950/60 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setSearch(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-3xl glass-strong shadow-soft"
          >
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search size={20} className="text-accent-ink" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search breeds, puppies, trained dogs…"
                className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
              <button onClick={() => setSearch(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3">
              {!q.trim() ? (
                <div className="p-2">
                  <p className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    <TrendingUp size={13} /> Trending
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {trending.map((t) => (
                      <button
                        key={t}
                        onClick={() => setQ(t)}
                        className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-volt-400 hover:text-accent-ink"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.dogs.length === 0 && results.breeds.length === 0 ? (
                <p className="p-6 text-center text-muted">No matches for “{q}”.</p>
              ) : (
                <div className="space-y-1">
                  {results.breeds.map((b) => (
                    <button key={b.slug} onClick={() => go(`/breeds/${b.slug}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-foreground/5">
                      <FadeImage src={b.heroImage} alt={b.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                      <span>
                        <span className="block font-medium">{b.name}</span>
                        <span className="text-xs text-muted">Breed · {b.group}</span>
                      </span>
                    </button>
                  ))}
                  {results.dogs.map((d) => (
                    <button key={d.slug} onClick={() => go(`/dogs/${d.slug}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-foreground/5">
                      <FadeImage src={d.image} alt={d.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="flex-1">
                        <span className="block font-medium">{d.name}</span>
                        <span className="text-xs text-muted">{d.breedName} · {d.ageLabel}</span>
                      </span>
                      <span className="font-display font-semibold text-accent-ink">
                        {d.forSale ? formatPrice(d.price) : "Not for sale"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
