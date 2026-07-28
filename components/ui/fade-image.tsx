"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * next/image with a modern blur-up + fade-in load effect and a shimmer
 * placeholder while it decodes. Drop-in replacement for <Image>.
 */
export function FadeImage({ className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <span className="skeleton absolute inset-0 rounded-[inherit]" aria-hidden />}
      <Image
        {...props}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        className={cn("img-load", loaded && "is-loaded", className)}
      />
    </>
  );
}
