import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHero({
  title,
  subtitle,
  eyebrow,
  image = "/images/dog-31.jpg",
  crumbs = [],
}: {
  title: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  image?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="relative flex min-h-[42vh] items-end overflow-hidden">
      <Image src={image} alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-12 pt-28 text-white">
        <nav className="mb-4 flex items-center gap-1 text-xs text-white/70">
          <Link href="/" className="hover:text-gold-400">Home</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight size={12} />
              {c.href ? <Link href={c.href} className="hover:text-gold-400">{c.label}</Link> : <span className="text-gold-400">{c.label}</span>}
            </span>
          ))}
        </nav>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-bold sm:text-5xl md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}
