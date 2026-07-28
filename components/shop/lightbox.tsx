"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MIN = 1;
const MAX = 4;
const clamp = (v: number, lo = MIN, hi = MAX) => Math.min(hi, Math.max(lo, v));

export function Lightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
  alt = "",
}: {
  images: string[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  alt?: string;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const swipe = useRef<{ x: number } | null>(null);

  const reset = useCallback(() => { setScale(1); setTx(0); setTy(0); }, []);

  // reset transform whenever the image or open-state changes
  useEffect(() => { reset(); }, [index, open, reset]);

  const go = useCallback(
    (dir: number) => onIndexChange((index + dir + images.length) % images.length),
    [index, images.length, onIndexChange]
  );

  // keyboard controls
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "+" || e.key === "=") setScale((s) => clamp(s + 0.5));
      else if (e.key === "-") setScale((s) => { const n = clamp(s - 0.5); if (n === 1) { setTx(0); setTy(0); } return n; });
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose, go]);

  const dist = () => {
    const p = [...pointers.current.values()];
    return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      pinch.current = { dist: dist(), scale };
      pan.current = null;
      swipe.current = null;
    } else if (scale > 1) {
      pan.current = { x: e.clientX, y: e.clientY, tx, ty };
    } else {
      swipe.current = { x: e.clientX };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const next = clamp((dist() / pinch.current.dist) * pinch.current.scale);
      setScale(next);
      if (next === 1) { setTx(0); setTy(0); }
    } else if (pan.current && scale > 1) {
      const lim = (scale - 1) * 260;
      setTx(clamp(pan.current.tx + (e.clientX - pan.current.x), -lim, lim));
      setTy(clamp(pan.current.ty + (e.clientY - pan.current.y), -lim, lim));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // swipe to change image when not zoomed
    if (swipe.current && scale === 1 && pointers.current.size === 1) {
      const dx = e.clientX - swipe.current.x;
      if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
    }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) { pan.current = null; swipe.current = null; }
  };

  const dblClick = () => {
    if (scale > 1) reset();
    else setScale(2.4);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex flex-col bg-navy-950/95 backdrop-blur-sm"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
            <span className="rounded-full glass px-3 py-1 text-sm">{index + 1} / {images.length}</span>
            <div className="flex items-center gap-2">
              <IconBtn label="Zoom out" onClick={() => setScale((s) => { const n = clamp(s - 0.5); if (n === 1) reset(); return n; })}><ZoomOut size={18} /></IconBtn>
              <span className="w-12 text-center text-sm tabular-nums">{Math.round(scale * 100)}%</span>
              <IconBtn label="Zoom in" onClick={() => setScale((s) => clamp(s + 0.5))}><ZoomIn size={18} /></IconBtn>
              <IconBtn label="Close" onClick={onClose}><X size={20} /></IconBtn>
            </div>
          </div>

          {/* Stage */}
          <div
            className={cn("relative flex-1 touch-none select-none overflow-hidden", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={dblClick}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center p-4 sm:p-10"
              >
                <div
                  className="relative h-full w-full"
                  style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transition: pan.current || pinch.current ? "none" : "transform 0.18s ease-out" }}
                >
                  <Image src={images[index]} alt={alt} fill sizes="100vw" className="object-contain" priority draggable={false} />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {images.length > 1 && (
              <>
                <NavBtn side="left" onClick={() => go(-1)}><ChevronLeft size={24} /></NavBtn>
                <NavBtn side="right" onClick={() => go(1)}><ChevronRight size={24} /></NavBtn>
              </>
            )}

            {scale === 1 && (
              <span className="pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-white">
                <Maximize2 size={12} className="text-gold-400" /> Pinch, scroll or double-tap to zoom
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  className={cn("relative h-14 w-14 overflow-hidden rounded-lg border-2 transition", i === index ? "border-gold-400" : "border-transparent opacity-50 hover:opacity-100")}
                >
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full glass text-white transition hover:bg-white/15">
      {children}
    </button>
  );
}

function NavBtn({ side, onClick, children }: { side: "left" | "right"; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={cn("absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full glass text-white transition hover:bg-white/15", side === "left" ? "left-3" : "right-3")}
    >
      {children}
    </button>
  );
}
