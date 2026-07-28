"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Rotate3d, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drag-to-rotate 360° turntable. Maps horizontal drag to the frame index
 * (looping in both directions) and gently auto-spins until the user interacts.
 */
export function Spin360({ images, className }: { images: string[]; className?: string }) {
  const [frame, setFrame] = useState(0);
  const [auto, setAuto] = useState(true);
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(0);
  const acc = useRef(0);
  const n = images.length;
  const sensitivity = 22; // px of drag per frame

  // gentle auto-rotate until first interaction
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % n), 600);
    return () => clearInterval(t);
  }, [auto, n]);

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    setAuto(false);
    lastX.current = e.clientX;
    acc.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    acc.current += e.clientX - lastX.current;
    lastX.current = e.clientX;
    while (acc.current > sensitivity) { setFrame((f) => (f + 1) % n); acc.current -= sensitivity; }
    while (acc.current < -sensitivity) { setFrame((f) => (f - 1 + n) % n); acc.current += sensitivity; }
  };
  const onUp = () => setDragging(false);

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className={cn(
        "relative aspect-[4/5] touch-none select-none overflow-hidden rounded-3xl border border-border",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`360° frame ${i + 1}`}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          priority={i === 0}
          className={cn("object-cover transition-opacity duration-150", i === frame ? "opacity-100" : "opacity-0")}
        />
      ))}

      {/* 360 badge */}
      <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-navy-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        <Rotate3d size={14} className="text-gold-400" /> 360°
      </span>

      {/* Hint */}
      <span className={cn("absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs text-white transition-opacity", dragging ? "opacity-0" : "opacity-100")}>
        <MousePointer2 size={13} className="text-gold-400" /> Drag to rotate
      </span>

      {/* Frame dots */}
      <div className="absolute bottom-4 right-4 flex gap-1">
        {images.map((_, i) => (
          <span key={i} className={cn("h-1.5 rounded-full transition-all", i === frame ? "w-4 bg-gold-400" : "w-1.5 bg-white/40")} />
        ))}
      </div>
    </div>
  );
}
