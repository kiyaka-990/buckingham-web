"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Crest } from "@/components/brand/crest";
import { PHOTO_PENDING } from "@/lib/data/breeds";
import { cn } from "@/lib/utils";

/**
 * Branded plate shown wherever the kennel has not supplied photography yet.
 * Every breed in the register is photographed today, but new litters arrive
 * ahead of their photo shoot. We never fill those slots with stock imagery —
 * these are the client's own dogs or nothing.
 */
export function PhotoPending({
  className,
  style,
  label = "Photography in progress",
  compact = false,
  fill = true,
}: {
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  compact?: boolean;
  /** `false` renders a sized block instead of filling a positioned parent. */
  fill?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label={`${label} — no photograph available yet`}
      style={style}
      className={cn(
        "flex flex-col items-center justify-center gap-3 overflow-hidden bg-deep text-center",
        fill ? "absolute inset-0" : "relative",
        className
      )}
    >
      <span className="aurora opacity-40" aria-hidden />
      <Crest tone="invert" className={cn("relative", compact ? "h-2/3 max-h-8" : "h-14")} />
      {!compact && (
        <span className="relative max-w-[85%] px-3">
          <span className="block font-display text-sm text-cream-100">{label}</span>
          <span className="mt-1 block text-[11px] leading-snug text-cream-100/60">
            Ask us for video — we send footage the same day.
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * next/image with a shimmer placeholder and a fade-in on decode. Drop-in
 * replacement for <Image>, with one extra behaviour: a `src` of
 * {@link PHOTO_PENDING} renders the branded crest plate instead.
 */
export function FadeImage({ className, onLoad, src, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (src === PHOTO_PENDING) {
    const sized = !props.fill && (props.width != null || props.height != null);
    return (
      <PhotoPending
        fill={!sized}
        compact={sized || Number(props.height ?? 0) < 120}
        label={typeof alt === "string" && alt ? alt : undefined}
        className={cn("rounded-[inherit]", sized && className)}
        style={sized ? { width: props.width, height: props.height } : undefined}
      />
    );
  }

  return (
    <>
      {!loaded && <span className="skeleton absolute inset-0 rounded-[inherit]" aria-hidden />}
      <Image
        {...props}
        src={src}
        alt={alt}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        className={cn("img-load", loaded && "is-loaded", className)}
      />
    </>
  );
}
