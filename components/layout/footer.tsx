import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ShieldCheck, Truck, HeartHandshake } from "lucide-react";
import { site } from "@/lib/site";
import { breeds } from "@/lib/data/breeds";
import { NewsletterForm } from "./newsletter-form";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon } from "@/components/ui/social-icons";

const trustBadges = [
  { icon: ShieldCheck, label: "Health Guaranteed" },
  { icon: Truck, label: "Global Delivery" },
  { icon: HeartHandshake, label: "Lifetime Support" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-navy-950 text-navy-50">
      <div className="aurora pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        {/* Trust row */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trustBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl glass p-4">
              <b.icon className="text-gold-400" />
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/brand/logo.png" alt={site.name} width={56} height={56} className="h-14 w-14 rounded-full ring-1 ring-gold-400/40" />
              <span>
                <span className="block font-display text-lg font-bold">Buckingham Kennel</span>
                <span className="text-xs uppercase tracking-[0.3em] text-gold-400">Limited</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-navy-100/80">{site.description}</p>
            <p className="text-xs text-navy-100/60">Reg. No. {site.registration}</p>
            <div className="flex gap-2">
              {[FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-full glass transition hover:text-gold-400">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Explore" links={[
            { label: "Shop All Dogs", href: "/shop" },
            { label: "Available Puppies", href: "/puppies" },
            { label: "3D Showroom", href: "/showroom" },
            { label: "Gallery", href: "/gallery" },
            { label: "About Us", href: "/about" },
          ]} />

          <FooterCol title="Breeds" links={breeds.slice(0, 6).map((b) => ({ label: b.name, href: `/breeds/${b.slug}` }))} />

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-gold-400">Get in touch</h4>
            <a href={`tel:${site.contact.phone}`} className="flex items-center gap-2 text-sm text-navy-100/80 hover:text-gold-400">
              <Phone size={14} /> {site.contact.phoneDisplay}
            </a>
            <a href={`mailto:${site.contact.email}`} className="flex items-start gap-2 text-sm text-navy-100/80 hover:text-gold-400">
              <Mail size={14} className="mt-0.5" /> <span className="break-all">{site.contact.email}</span>
            </a>
            <p className="flex items-start gap-2 text-sm text-navy-100/80">
              <MapPin size={14} className="mt-0.5 shrink-0" /> {site.contact.address.building}, {site.contact.address.county}, {site.contact.address.country}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-navy-100/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold-400">Privacy</Link>
            <Link href="/terms" className="hover:text-gold-400">Terms</Link>
            <Link href="/contact" className="hover:text-gold-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="font-display font-semibold text-gold-400">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-navy-100/80 transition hover:text-gold-400">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
