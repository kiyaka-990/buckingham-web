"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { dogs } from "@/lib/data/catalog";

const Showroom3D = dynamic(() => import("./showroom-3d"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[75vh] min-h-[520px] w-full place-items-center rounded-[2rem] border border-border bg-navy-950">
      <div className="flex flex-col items-center gap-3 text-white/70">
        <Loader2 className="animate-spin text-gold-400" size={32} />
        <p className="text-sm">Entering the 3D showroom…</p>
      </div>
    </div>
  ),
});

export function ShowroomLoader() {
  const showcase = dogs.filter((d) => d.status !== "sold").slice(0, 10);
  return <Showroom3D dogs={showcase} />;
}
