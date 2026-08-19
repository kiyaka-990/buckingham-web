"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { dogs, isPhotoPending } from "@/lib/data/catalog";

const Showroom3D = dynamic(() => import("./showroom-3d"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[75vh] min-h-[520px] w-full place-items-center rounded-[2rem] border border-border bg-forest-950">
      <div className="flex flex-col items-center gap-3 text-white/70">
        <Loader2 className="animate-spin text-brass-400" size={32} />
        <p className="text-sm">Entering the 3D showroom…</p>
      </div>
    </div>
  ),
});

export function ShowroomLoader() {
  // Only dogs we actually hold photographs of can hang on a gallery wall —
  // a photo-pending listing has no texture to load.
  const showcase = dogs
    .filter((d) => d.status !== "sold" && !isPhotoPending(d))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price)
    .slice(0, 10);
  return <Showroom3D dogs={showcase} />;
}
