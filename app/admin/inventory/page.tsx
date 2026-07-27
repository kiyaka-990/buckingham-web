"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, Eye } from "lucide-react";
import { dogs } from "@/lib/data/catalog";
import { formatPrice, cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  reserved: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  sold: "bg-navy-500/15 text-navy-600 dark:text-navy-300",
};

export default function AdminInventory() {
  const [q, setQ] = useState("");
  const list = dogs.filter((d) => `${d.name} ${d.breedName} ${d.id}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Inventory</h1>
          <p className="text-muted">{dogs.length} dogs in the kennel.</p>
        </div>
        <button className="btn-gold flex h-11 items-center gap-2 rounded-full px-5 text-sm">
          <Plus size={16} /> Add Dog
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 sm:w-72">
        <Search size={16} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search inventory…" className="h-10 flex-1 bg-transparent text-sm outline-none" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2/50 text-left text-muted">
                <th className="p-4 font-medium">Dog</th>
                <th className="hidden p-4 font-medium sm:table-cell">Breed</th>
                <th className="hidden p-4 font-medium md:table-cell">Category</th>
                <th className="hidden p-4 font-medium lg:table-cell">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right font-medium">Price</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Image src={d.images[0]} alt={d.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-muted">{d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden p-4 text-muted sm:table-cell">{d.breedName}</td>
                  <td className="hidden p-4 capitalize text-muted md:table-cell">{d.category}</td>
                  <td className="hidden p-4 text-muted lg:table-cell">{d.stock}</td>
                  <td className="p-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", statusStyles[d.status])}>{d.status}</span></td>
                  <td className="p-4 text-right font-semibold">{formatPrice(d.price)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/dogs/${d.slug}`} className="inline-grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-gold-400" aria-label="View">
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
