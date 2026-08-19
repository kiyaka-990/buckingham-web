"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { FadeImage } from "@/components/ui/fade-image";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Trash2, X, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import type { Dog } from "@/lib/data/catalog";
import type { Breed } from "@/lib/data/breeds";
import { formatPrice, cn } from "@/lib/utils";
import { createDog, updateDog, deleteDog } from "@/lib/actions/admin";

const statusStyles: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  reserved: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  sold: "bg-forest-500/15 text-forest-600 dark:text-forest-300",
};

export function InventoryManager({ dogs, breeds }: { dogs: Dog[]; breeds: Breed[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Dog | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();

  const list = dogs.filter((d) => `${d.name} ${d.breedName} ${d.id}`.toLowerCase().includes(q.toLowerCase()));

  const remove = (d: Dog) => {
    if (!confirm(`Delete ${d.name}? This cannot be undone.`)) return;
    start(async () => { await deleteDog(d.id); router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Inventory</h1>
          <p className="text-muted">{dogs.length} dogs in the kennel · saved to the database.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-brass flex h-11 items-center gap-2 rounded-full px-5 text-sm">
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
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-foreground/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FadeImage src={d.images[0]} alt={d.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                      <div><p className="font-medium">{d.name}</p><p className="text-xs text-muted">{d.id}</p></div>
                    </div>
                  </td>
                  <td className="hidden p-4 text-muted sm:table-cell">{d.breedName}</td>
                  <td className="hidden p-4 capitalize text-muted md:table-cell">{d.category}</td>
                  <td className="hidden p-4 text-muted lg:table-cell">{d.stock}</td>
                  <td className="p-4"><span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", statusStyles[d.status])}>{d.status}</span></td>
                  <td className="p-4 text-right font-semibold">{formatPrice(d.price)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/dogs/${d.slug}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-brass-400" aria-label="View"><Eye size={14} /></Link>
                      <button onClick={() => setEditing(d)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:border-brass-400" aria-label="Edit"><Pencil size={14} /></button>
                      <button onClick={() => remove(d)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-red-500 hover:border-red-400" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <DogModal
          dog={editing}
          breeds={breeds}
          pending={pending}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSubmit={(fd) => {
            start(async () => {
              if (editing) await updateDog(editing.id, fd);
              else await createDog(fd);
              setAdding(false); setEditing(null);
              router.refresh();
            });
          }}
        />
      )}
    </div>
  );
}

function DogModal({ dog, breeds, onClose, onSubmit, pending }: {
  dog: Dog | null; breeds: Breed[]; onClose: () => void; onSubmit: (fd: FormData) => void; pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{dog ? `Edit ${dog.name}` : "Add a Dog"}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/5"><X size={18} /></button>
        </div>
        <form action={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={dog?.name} required />
          <Select label="Breed" name="breedSlug" defaultValue={dog?.breedSlug} options={breeds.map((b) => ({ value: b.slug, label: b.name }))} />
          <Select label="Category" name="category" defaultValue={dog?.category} options={[["puppy", "Puppy"], ["adult", "Adult"], ["trained", "Trained"], ["elite", "Elite"]].map(([value, label]) => ({ value, label }))} />
          <Select label="Sex" name="sex" defaultValue={dog?.sex} options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} />
          <Field label="Age label" name="ageLabel" defaultValue={dog?.ageLabel} placeholder="10 weeks" />
          <Field label="Colour" name="color" defaultValue={dog?.color} />
          <Field label="Price (USD)" name="price" type="number" defaultValue={dog ? String(dog.price) : "1600"} required />
          <Field label="Compare-at (optional)" name="compareAt" type="number" defaultValue={dog?.compareAt ? String(dog.compareAt) : ""} />
          <Field label="Stock" name="stock" type="number" defaultValue={dog ? String(dog.stock) : "1"} />
          <Select label="Status" name="status" defaultValue={dog?.status} options={[["available", "Available"], ["reserved", "Reserved"], ["sold", "Sold"]].map(([value, label]) => ({ value, label }))} />
          <Field label="Weight (kg)" name="weightKg" type="number" defaultValue={dog ? String(dog.weightKg) : "10"} />
          <Field label="Location" name="location" defaultValue={dog?.location ?? "Nairobi"} />
          <Field label="Image path" name="image" defaultValue={dog?.images[0] ?? "/media/gsd-black/adult-01.jpg"} className="sm:col-span-2" />
          <Field label="Traits (comma separated)" name="traits" defaultValue={dog?.traits.join(", ")} className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea name="description" rows={3} defaultValue={dog?.description} className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-brass-400" />
          </div>
          <div className="flex gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={dog?.featured} className="h-4 w-4 accent-brass-400" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="bestseller" defaultChecked={dog?.bestseller} className="h-4 w-4 accent-brass-400" /> Bestseller</label>
          </div>
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={pending} className="btn-brass flex items-center gap-2 rounded-full px-6 py-2.5 text-sm">
              {pending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : dog ? "Save changes" : "Create dog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue, placeholder, required, className }: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-brass-400" />
    </div>
  );
}

function Select({ label, name, defaultValue, options }: {
  label: string; name: string; defaultValue?: string; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <select name={name} defaultValue={defaultValue} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brass-400">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
