"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Short clip of a breed, shot at the kennel.
 *
 * Deliberately click-to-play and muted by default: these sit partway down a
 * breed page, and autoplaying sound at a visitor is the fastest way to lose
 * them. The poster is a still of the same dogs, so the block reads as content
 * rather than an empty player before anyone presses anything.
 */
export function BreedVideo({
  src,
  poster,
  caption,
  breedName,
}: {
  src: string;
  poster: string;
  caption: string;
  breedName: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <figure className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="group relative aspect-video bg-forest-950">
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted={muted}
          playsInline
          loop
          preload="none"
          aria-label={`Video of ${breedName} at Buckingham Kennel`}
          onEnded={() => setPlaying(false)}
          onClick={toggle}
          className="h-full w-full cursor-pointer object-cover"
        />

        {/* Play overlay — only while paused, so it never covers the footage */}
        {!playing && (
          <button
            onClick={toggle}
            aria-label={`Play video of ${breedName}`}
            className="absolute inset-0 grid place-items-center bg-forest-950/35 transition group-hover:bg-forest-950/45"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full btn-brass shadow-lift transition group-hover:scale-105">
              <Play size={24} className="ml-1 fill-current" />
            </span>
          </button>
        )}

        {/* Controls */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {playing && (
            <button
              onClick={toggle}
              aria-label="Pause video"
              className="grid h-9 w-9 place-items-center rounded-full glass-strong text-foreground transition hover:scale-105"
            >
              <Pause size={15} />
            </button>
          )}
          <button
            onClick={toggleSound}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full glass-strong text-foreground transition hover:scale-105"
            )}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      <figcaption className="px-5 py-3 text-sm text-muted">{caption}</figcaption>
    </figure>
  );
}
