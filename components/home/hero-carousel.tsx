"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  /** Photograph, or a clip shot at the kennel. */
  kind: "image" | "video";
  src: string;
  /** Still shown before a clip has buffered. */
  poster?: string;
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  /** Thumbnail for the rail — a still, even when the slide is a clip. */
  thumb: string;
};

const AUTOPLAY_MS = 7000;

/**
 * The shop front, as a carousel.
 *
 * Modelled on the AKC Marketplace layout the client pointed at: one full-bleed
 * pane of media at a time — footage where we have it, photography where we do
 * not — with the copy sitting on a scrim over it, a thumbnail rail along the
 * bottom and arrows either side.
 *
 * Video slides autoplay muted and looping, which is the only form of autoplay
 * browsers allow and the only one that is not rude. Sound is opt-in, the
 * rotation pauses on hover, on focus and while the tab is hidden, and it never
 * starts at all for a visitor who has asked for reduced motion.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);
  const videos = useRef(new Map<number, HTMLVideoElement>());

  const count = slides.length;
  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Honour the OS-level motion preference and the site's own a11y toggle.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () =>
      setReduced(mq.matches || document.documentElement.classList.contains("a11y-reduce-motion"));
    read();
    mq.addEventListener("change", read);
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mq.removeEventListener("change", read);
      obs.disconnect();
    };
  }, []);

  // Rotate, unless something has asked us not to.
  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const t = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [paused, reduced, count, next, index]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Only the slide on screen plays; the rest rewind so they start from the top.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (i === index && !paused) {
        void v.play().catch(() => {});
      } else {
        v.pause();
        if (i !== index) v.currentTime = 0;
      }
    });
  }, [index, paused]);

  useEffect(() => {
    videos.current.forEach((v) => {
      v.muted = muted;
    });
  }, [muted]);

  const active = slides[index];
  const hasVideo = slides.some((s) => s.kind === "video");

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Buckingham Kennel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative mx-auto mt-4 max-w-[1600px] overflow-hidden rounded-[2rem] bg-azure-950 px-0 sm:mt-6"
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]">
        {slides.map((s, i) => (
          <div
            key={s.src + i}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-estate",
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            {s.kind === "video" ? (
              <video
                ref={(el) => {
                  if (el) videos.current.set(i, el);
                  else videos.current.delete(i);
                }}
                src={s.src}
                poster={s.poster}
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                className="h-full w-full object-cover"
              />
            ) : (
              <FadeImage
                src={s.src}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="100vw"
                className={cn("object-cover", i === index && !reduced && "animate-ken-burns")}
              />
            )}
          </div>
        ))}

        {/* Scrim — dark enough at the foot for white type, clear at the top */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-azure-950 via-azure-950/55 to-azure-950/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-azure-950/85 via-transparent to-transparent" />

        {/* The copy */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <div className="max-w-2xl" key={index}>
            <p className="animate-fade-up text-[11px] font-bold uppercase tracking-[0.24em] text-volt-300">
              {active.eyebrow}
            </p>
            <h1 className="animate-fade-up mt-3 font-display text-3xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {active.title}
            </h1>
            <p className="animate-fade-up mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {active.copy}
            </p>
            <div className="animate-fade-up mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={active.href}
                className="btn-azure inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold"
              >
                {active.cta} <ArrowRight size={17} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-full border border-white/40 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>

        {/* Arrows */}
        {count > 1 && (
          <>
            <CarouselArrow side="left" onClick={prev} />
            <CarouselArrow side="right" onClick={next} />
          </>
        )}

        {/* Playback controls */}
        <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
          {hasVideo && (
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="grid h-10 w-10 place-items-center rounded-full bg-azure-950/50 text-white backdrop-blur transition hover:bg-azure-950/70"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          {count > 1 && (
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume carousel" : "Pause carousel"}
              className="grid h-10 w-10 place-items-center rounded-full bg-azure-950/50 text-white backdrop-blur transition hover:bg-azure-950/70"
            >
              {paused ? <Play size={16} className="ml-0.5" /> : <Pause size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Thumbnail rail — the AKC pattern: every pane visible at once */}
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-azure-950 p-3 no-scrollbar sm:gap-3 sm:p-4">
          {slides.map((s, i) => (
            <button
              key={s.thumb + i}
              onClick={() => go(i)}
              aria-label={`Show slide ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={cn(
                "group relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-36",
                i === index ? "border-volt-400" : "border-white/15 opacity-60 hover:opacity-100"
              )}
            >
              <FadeImage src={s.thumb} alt="" fill sizes="144px" className="object-cover" />
              {s.kind === "video" && (
                <span className="absolute inset-0 grid place-items-center bg-azure-950/35">
                  <Play size={16} className="fill-white text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CarouselArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={cn(
        "absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-azure-900 shadow-lift transition hover:scale-105 hover:bg-white",
        side === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5"
      )}
    >
      <Icon size={20} />
    </button>
  );
}
