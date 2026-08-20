import Link from "next/link";
import { Crest } from "@/components/brand/crest";
import { Phone, Mail, MapPin, ShieldCheck, Truck, HeartHandshake } from "lucide-react";
import { secondaryNav, site } from "@/lib/site";
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
    <footer className="relative mt-24 border-t border-border bg-leaf-950 text-leaf-50">
      <div className="aurora pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        {/* Trust row */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trustBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 rounded-2xl glass p-4">
              <b.icon className="text-sun-400" />
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Crest tone="invert" className="h-14" />
              <span>
                <span className="block font-display text-lg font-bold">Buckingham Kennel</span>
                <span className="text-xs uppercase tracking-[0.3em] text-sun-400">Limited</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-leaf-100/80">{site.description}</p>
            <p className="text-xs text-leaf-100/60">Reg. No. {site.registration}</p>
            <div className="flex gap-2">
              {[FacebookIcon, InstagramIcon, YoutubeIcon, TiktokIcon].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="grid h-9 w-9 place-items-center rounded-full glass transition hover:text-sun-400">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* These three came off the main navigation; the footer keeps them reachable. */}
          <FooterCol title="Explore" links={[
            { label: "Shop All Dogs", href: "/shop" },
            { label: "Available Puppies", href: "/puppies" },
            { label: "About Us", href: "/about" },
            ...secondaryNav,
          ]} />

          <FooterCol title="Breeds" links={breeds.slice(0, 6).map((b) => ({ label: b.name, href: `/breeds/${b.slug}` }))} />

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sun-400">Get in touch</h4>
            <a href={`tel:${site.contact.phone}`} className="flex items-center gap-2 text-sm text-leaf-100/80 hover:text-sun-400">
              <Phone size={14} /> {site.contact.phoneDisplay}
            </a>
            <a href={`mailto:${site.contact.email}`} className="flex items-start gap-2 text-sm text-leaf-100/80 hover:text-sun-400">
              <Mail size={14} className="mt-0.5" /> <span className="break-all">{site.contact.email}</span>
            </a>
            <p className="flex items-start gap-2 text-sm text-leaf-100/80">
              <MapPin size={14} className="mt-0.5 shrink-0" /> {site.contact.address.building}, {site.contact.address.county}, {site.contact.address.country}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-leaf-100/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-sun-400">Privacy</Link>
            <Link href="/terms" className="hover:text-sun-400">Terms</Link>
            <Link href="/contact" className="hover:text-sun-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="font-display font-semibold text-sun-400">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-leaf-100/80 transition hover:text-sun-400">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
