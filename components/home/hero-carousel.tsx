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
 * Safety net for a video pane. A clip holds the reel until it ends, so there is
 * no fixed dwell to time out against — a longer film would simply be cut off.
 * Instead we watch the playhead: if it has not moved for this long the clip is
 * stuck (autoplay refused, the fetch died, the decoder gave up) and the reel
 * moves on. Long enough to ride out a stall on a slow connection.
 */
const VIDEO_STALL_MS = 12000;
/** How often the watchdog checks the playhead. */
const STALL_POLL_MS = 2000;

/**
 * The landing carousel.
 *
 * The copy sits on the page itself, on the left, and the media runs off the
 * right-hand edge of the screen — no scrim over the dogs, no full-bleed
 * rectangle behind the type.
 *
 * The media used to be masked so it dissolved into the page along its left
 * edge, and a bloom of the accent sat behind it. Both are gone: the client
 * wants the film shown clean, so nothing is painted over the picture and it
 * ends at its own edge. On a phone the media simply stacks above the copy.
 *
 * A video pane autoplays muted, which is the only form of autoplay browsers
 * allow and the only one that is not rude. It runs once, start to finish, and
 * then the reel moves on rather than looping. Sound is opt-in, the
 * rotation pauses on keyboard focus and while the tab is hidden, and it never
 * starts at all for a visitor who has asked for reduced motion or whose
 * connection is metered. Hover does not pause it — the reel runs on while the
 * cursor rests over it.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);
  /** Data Saver, or a 2G-class connection — see the effect below. */
  const [metered, setMetered] = useState(false);
  /** 0 at the top of the page, 1 once scrolled a screenful — drives the shadow. */
  const [lift, setLift] = useState(0);
  const videos = useRef(new Map<number, HTMLVideoElement>());

  const count = slides.length;
  // A boolean, not the slide itself: this feeds the rotation effect below, and
  // a fresh object in its deps would restart the timer on every scroll tick.
  const activeIsVideo = slides[index]?.kind === "video";
  /** A pane only holds for a film we are actually going to play. */
  const holdForFilm = activeIsVideo && !metered;
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

  // The film is several megabytes, and a good share of our buyers reach the
  // site on a phone over mobile data. If the browser says the visitor is
  // metered — Data Saver switched on, or a 2G-class connection — we do not
  // spend their bundle on autoplay. They get the poster frame, the pane keeps
  // the ordinary still's dwell, and the play control is still there if they
  // want the film. Desktop and anything decent is unaffected.
  useEffect(() => {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (!conn) return;
    const read = () =>
      setMetered(Boolean(conn.saveData) || /^(slow-)?2g$/.test(conn.effectiveType ?? ""));
    read();
    const target = conn as unknown as EventTarget;
    target.addEventListener?.("change", read);
    return () => target.removeEventListener?.("change", read);
  }, []);

  // Rotate, unless something has asked us not to.
  //
  // A still holds for AUTOPLAY_MS. A clip holds until it finishes and then
  // hands over (see `onEnded` below) — the kennel's film runs over a minute
  // and cutting it off after seven seconds, every time round, would mean no
  // visitor ever saw past its opening shot.
  //
  // So a video pane gets a watchdog rather than a deadline: we sample the
  // playhead, and only give up on a clip that has genuinely stopped moving.
  // That way the pane fits the film instead of the film being cut to fit a
  // constant, however long a clip the kennel sends next.
  useEffect(() => {
    if (paused || reduced || count < 2) return;

    if (!holdForFilm) {
      const t = setTimeout(next, AUTOPLAY_MS);
      return () => clearTimeout(t);
    }

    let lastTime = -1;
    let stalledFor = 0;
    const id = setInterval(() => {
      const v = videos.current.get(index);
      // No element yet, or it is buffering at the same frame as last check.
      if (v && v.currentTime !== lastTime) {
        lastTime = v.currentTime;
        stalledFor = 0;
        return;
      }
      stalledFor += STALL_POLL_MS;
      if (stalledFor >= VIDEO_STALL_MS) next();
    }, STALL_POLL_MS);
    return () => clearInterval(id);
  }, [paused, reduced, count, next, index, holdForFilm]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The carousel sits on its own layer, and scrolling lifts it: the shadow it
  // casts onto the section below deepens over the first screenful and then
  // holds. At rest at the top of the page there is no shadow at all, so the
  // hero still reads as flush with the header.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setLift(Math.min(window.scrollY / 320, 1));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Only the slide on screen plays; the rest rewind so they start from the top.
  // A reduced-motion visitor gets no playback at all — the poster frame stands
  // in, and the stills behind it hold still too.
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (i === index && !paused && !reduced && !metered) {
        void v.play().catch(() => {});
      } else {
        v.pause();
        if (i !== index) v.currentTime = 0;
      }
    });
  }, [index, paused, reduced, metered]);

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
      // Hovering no longer pauses — the client wants the reel to keep running
      // while the cursor sits over it. Keyboard focus still holds it, so a
      // visitor tabbing through the slide's link does not lose it mid-read.
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      // z-10 so the shadow paints over the section that follows; overflow-hidden
      // clips the children, not the element's own shadow.
      className="relative isolate z-10 overflow-hidden"
      style={{
        boxShadow: lift
          ? `0 ${Math.round(14 + 12 * lift)}px ${Math.round(28 + 26 * lift)}px -18px rgba(12, 13, 15, ${(0.44 * lift).toFixed(3)})`
          : undefined,
      }}
    >
      <span className="lattice" aria-hidden />

      {/* ---- The media. Stacked above the copy on a phone; from lg up it is
              pinned to the right and runs past the edge of the screen. ---- */}
      <div className="relative h-[52vw] max-h-[26rem] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:max-h-none lg:w-[56%]">
        <div className="feather-media relative h-full w-full">
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
                  playsInline
                  // No `loop`: the pane hands over when the clip ends, which
                  // it cannot do if the clip restarts itself instead.
                  onEnded={() => i === index && next()}
                  // A clip that will not load must not strand the reel on it.
                  onError={() => i === index && next()}
                  // `metadata` keeps the film off the critical path — play()
                  // starts the stream when the pane comes up, and the poster
                  // covers the gap. On a metered connection we fetch nothing
                  // at all until the visitor asks for it.
                  preload={metered ? "none" : "metadata"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FadeImage
                  src={s.src}
                  alt={s.title}
                  fill
                  priority={i === 0}
                  sizes="(max-width:1024px) 100vw, 56vw"
                  className={cn(
                    "object-cover",
                    // Alternate the pan so back-to-back stills move differently.
                    i === index && !reduced && (i % 2 ? "animate-ken-burns-alt" : "animate-ken-burns")
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Playback controls ride with the media, not the copy. */}
        <div className="absolute right-4 top-4 z-10 flex gap-2 sm:right-6 sm:top-6">
          {hasVideo && (
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="grid h-10 w-10 place-items-center rounded-full bg-graphite-950/45 text-white backdrop-blur transition hover:bg-graphite-950/70"
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          {count > 1 && (
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume carousel" : "Pause carousel"}
              className="grid h-10 w-10 place-items-center rounded-full bg-graphite-950/45 text-white backdrop-blur transition hover:bg-graphite-950/70"
            >
              {paused ? <Play size={16} className="ml-0.5" /> : <Pause size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ---- The copy, on the page background ---- */}
      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-8 lg:min-h-[38rem] lg:py-24 lg:pr-[52%]">
        <div key={index} className="max-w-xl">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-volt-400" />
            {active.eyebrow}
          </p>
          <h1 className="animate-fade-up mt-5 font-display text-4xl font-bold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
            {active.title}
          </h1>
          <p className="animate-fade-up mt-5 max-w-lg text-base leading-relaxed text-muted">
            {active.copy}
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={active.href}
              className="btn-accent inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold"
            >
              {active.cta} <ArrowRight size={17} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full border border-border px-7 text-sm font-semibold transition hover:bg-surface-2"
            >
              Talk to us
            </Link>
          </div>
        </div>

        {/* Arrows and the thumbnail rail sit under the copy, where there is
            room for them — never on top of a dog. */}
        {count > 1 && (
          <div className="mt-10 flex items-center gap-4">
            <div className="flex gap-2">
              <CarouselArrow side="left" onClick={prev} />
              <CarouselArrow side="right" onClick={next} />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {slides.map((s, i) => (
                <button
                  key={s.thumb + i}
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}: ${s.title}`}
                  aria-current={i === index}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-24",
                    i === index
                      ? "border-volt-400"
                      : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <FadeImage src={s.thumb} alt="" fill sizes="96px" className="object-cover" />
                  {s.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-graphite-950/30">
                      <Play size={14} className="fill-white text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CarouselArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-foreground transition hover:border-volt-400 hover:bg-surface-2"
    >
      <Icon size={19} />
    </button>
  );
}
