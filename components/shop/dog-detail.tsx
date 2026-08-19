"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, ShoppingBag, ShieldCheck, Syringe, Bug, Cpu, Stethoscope, MapPin,
  Check, Truck, Award, ChevronRight, Share2, Rotate3d, Expand,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Dog } from "@/lib/data/catalog";
import { formatPrice, usdToKes, cn } from "@/lib/utils";
import { useCart } from "@/lib/store/cart";
import { useWishlist } from "@/lib/store/wishlist";
import { Rating } from "@/components/ui/rating";
import { FadeImage } from "@/components/ui/fade-image";
import { Spin360 } from "@/components/shop/spin360";
import { Lightbox } from "@/components/shop/lightbox";
import { site } from "@/lib/site";

export function DogDetail({ dog }: { dog: Dog }) {
  const [activeImg, setActiveImg] = useState(0);
  const [spin, setSpin] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [tab, setTab] = useState<"overview" | "pedigree" | "health">("overview");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(dog.id));
  const soldOut = dog.status === "sold";

  const addToCart = () =>
    add({ id: dog.id, slug: dog.slug, name: dog.name, breedName: dog.breedName, price: dog.price, image: dog.images[0] });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative">
            {spin ? (
              <Spin360 images={dog.images} className={cn(soldOut && "grayscale")} />
            ) : (
              <motion.div
                key={activeImg}
                initial={{ opacity: 0.4, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setLightbox(true)}
                className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-3xl border border-border"
              >
                <FadeImage src={dog.images[activeImg]} alt={dog.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className={cn("object-cover duotone", soldOut && "grayscale")} />
                <span className="shine-hover absolute inset-0 z-10" />
                <span className="absolute left-4 top-4 rounded-full bg-forest-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white capitalize">
                  {dog.status}
                </span>
                <span className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  <Expand size={13} className="text-brass-400" /> Click to zoom
                </span>
              </motion.div>
            )}

            {/* Controls */}
            <div className="absolute right-4 top-4 z-20 flex gap-2">
              {!spin && (
                <button
                  onClick={() => setLightbox(true)}
                  className="grid h-9 w-9 place-items-center rounded-full glass-strong transition hover:text-brass-500"
                  aria-label="Open fullscreen"
                >
                  <Expand size={15} />
                </button>
              )}
              <button
                onClick={() => setSpin((s) => !s)}
                className="flex items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs font-semibold transition hover:text-brass-500"
                aria-pressed={spin}
              >
                <Rotate3d size={14} className="text-brass-500" /> {spin ? "Exit 360°" : "360° View"}
              </button>
            </div>
          </div>

          <Lightbox
            images={dog.images}
            index={activeImg}
            open={lightbox}
            onClose={() => setLightbox(false)}
            onIndexChange={setActiveImg}
            alt={dog.name}
          />

          <div className="mt-4 flex gap-3">
            {dog.images.map((src, i) => (
              <button
                key={i}
                onClick={() => { setSpin(false); setActiveImg(i); }}
                className={cn("relative h-20 w-20 overflow-hidden rounded-xl border-2 transition", !spin && activeImg === i ? "border-brass-400" : "border-transparent opacity-70 hover:opacity-100")}
              >
                <Image src={src} alt={`${dog.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Link href="/shop" className="hover:text-brass-500">Shop</Link>
            <ChevronRight size={12} />
            <Link href={`/breeds/${dog.breedSlug}`} className="hover:text-brass-500">{dog.breedName}</Link>
          </div>

          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl font-bold">{dog.name}</h1>
            <div className="flex gap-2">
              <button onClick={() => toggleWish(dog.id)} aria-label="Wishlist" className="grid h-11 w-11 place-items-center rounded-full border border-border transition hover:border-brass-400">
                <Heart size={18} className={cn(wished && "fill-red-500 text-red-500")} />
              </button>
              <button aria-label="Share" className="grid h-11 w-11 place-items-center rounded-full border border-border transition hover:border-brass-400">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Rating value={dog.rating} reviews={dog.reviews} />
            <span className="text-muted">·</span>
            <span className="flex items-center gap-1 text-sm text-muted"><MapPin size={14} className="text-brass-500" /> {dog.location}, Kenya</span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">ID {dog.id}</span>
          </div>

          {/* Price */}
          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-gradient-brass">{formatPrice(dog.price)}</span>
            {dog.compareAt && <span className="mb-1 text-lg text-muted line-through">{formatPrice(dog.compareAt)}</span>}
          </div>
          <p className="mt-1 text-sm text-muted">≈ KES {usdToKes(dog.price).toLocaleString()} · M-Pesa &amp; card accepted · Deposit reserves</p>

          {/* Quick specs */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Sex", value: dog.sex },
              { label: "Age", value: dog.ageLabel },
              { label: "Colour", value: dog.color },
              { label: "Weight", value: `${dog.weightKg} kg` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-3 text-center">
                <p className="text-[11px] uppercase tracking-wide text-muted">{s.label}</p>
                <p className="mt-0.5 text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Traits */}
          <div className="mt-5 flex flex-wrap gap-2">
            {dog.traits.map((t) => (
              <span key={t} className="rounded-full bg-brass-400/10 px-3 py-1 text-xs font-medium text-brass-600 dark:text-brass-400">{t}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={addToCart}
              disabled={soldOut}
              className="btn-brass flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-base disabled:cursor-not-allowed disabled:bg-forest-800 disabled:text-white/60"
            >
              <ShoppingBag size={20} /> {soldOut ? "Sold Out" : "Add to Cart"}
            </button>
            <button
              onClick={() => { if (!soldOut) { addToCart(); openCart(); } }}
              disabled={soldOut}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-brass-400 text-base font-semibold text-brass-600 transition hover:bg-brass-400/10 disabled:opacity-40 dark:text-brass-400"
            >
              Reserve Now
            </button>
          </div>
          <a
            href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(`Hi Buckingham Kennel, I'm interested in ${dog.name} (${dog.breedName}, ${dog.id}).`)}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium transition hover:border-brass-400"
          >
            Enquire on WhatsApp
          </a>

          {/* Assurance */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: ShieldCheck, t: `${dog.health.healthGuaranteeMonths}-month health guarantee` },
              { icon: Truck, t: "Safe nationwide & global delivery" },
              { icon: Award, t: dog.pedigree.registry },
              { icon: Check, t: "Full vet records & microchip" },
            ].map((a) => (
              <div key={a.t} className="flex items-center gap-2 text-muted">
                <a.icon size={16} className="text-brass-500" /> {a.t}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex gap-1 border-b border-border">
              {(["overview", "pedigree", "health"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn("relative px-4 py-3 text-sm font-medium capitalize transition", tab === t ? "text-brass-600 dark:text-brass-400" : "text-muted hover:text-foreground")}
                >
                  {t}
                  {tab === t && <motion.span layoutId="tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brass-400" />}
                </button>
              ))}
            </div>

            <div className="pt-5 text-sm leading-relaxed text-muted">
              {tab === "overview" && <p>{dog.description}</p>}

              {tab === "pedigree" && (
                <div className="space-y-4">
                  <p className="text-foreground">A verified {dog.pedigree.generations}-generation pedigree — {dog.pedigree.registry}. Inbreeding coefficient {dog.pedigree.inbreedingCoefficient}.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <PedigreeCard label="Sire" name={dog.pedigree.sire} sub={dog.pedigree.grandSire} />
                    <PedigreeCard label="Dam" name={dog.pedigree.dam} sub={dog.pedigree.grandDam} />
                  </div>
                  <div>
                    <p className="mb-2 font-semibold text-foreground">Titles &amp; Achievements</p>
                    <ul className="space-y-1">
                      {dog.pedigree.champions.map((c) => (
                        <li key={c} className="flex items-center gap-2"><Award size={14} className="text-brass-500" /> {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {tab === "health" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <HealthItem icon={Syringe} label="Vaccinated" ok={dog.health.vaccinated} />
                  <HealthItem icon={Bug} label="Dewormed" ok={dog.health.dewormed} />
                  <HealthItem icon={Stethoscope} label="Vet Checked" ok={dog.health.vetChecked} />
                  <HealthItem icon={Cpu} label="Microchipped" ok={dog.health.microchipped} />
                  <HealthItem icon={ShieldCheck} label={`${dog.health.healthGuaranteeMonths}-mo Guarantee`} ok />
                  <HealthItem icon={Award} label={`Hips: ${dog.health.hipScore}`} ok />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PedigreeCard({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-[11px] uppercase tracking-wide text-brass-500">{label}</p>
      <p className="mt-1 font-display font-semibold text-foreground">{name}</p>
      <p className="mt-1 text-xs text-muted">out of {sub}</p>
    </div>
  );
}

function HealthItem({ icon: Icon, label, ok }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
      <span className="flex items-center gap-2 text-foreground"><Icon size={16} className="text-brass-500" /> {label}</span>
      {ok && <Check size={16} className="text-emerald-500" />}
    </div>
  );
}
