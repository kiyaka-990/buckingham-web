import { heroImages } from "@/lib/data/media";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/ui/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Buckingham Kennel Limited. Call, WhatsApp, email or visit us in Webuye, Kenya.",
};

export default function ContactPage() {
  const a = site.contact.address;
  return (
    <>
      <PageHero
        eyebrow="We'd Love to Hear From You"
        title="Contact Us"
        subtitle="Questions, visits or reservations — our team is here to help."
        image={heroImages.contact}
        crumbs={[{ label: "Contact" }]}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.2fr]">
        {/* Info */}
        <div className="space-y-4">
          <InfoCard icon={Phone} title="Call / WhatsApp" lines={[site.contact.phoneDisplay]} href={`tel:${site.contact.phone}`} />
          <InfoCard icon={Mail} title="Email" lines={[site.contact.email]} href={`mailto:${site.contact.email}`} />
          <InfoCard icon={MapPin} title="Visit Us" lines={[a.building, `${a.street}, ${a.locality}`, `${a.county}, ${a.country}`, a.poBox]} />
          <InfoCard icon={Clock} title="Hours" lines={["Mon–Sat: 8:00 – 18:00", "Sun: By appointment"]} />
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-semibold text-white transition hover:bg-emerald-600"
          >
            <MessageCircle size={20} /> Chat with us on WhatsApp
          </a>
        </div>

        {/* Form */}
        <ContactForm />
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="overflow-hidden rounded-[2rem] border border-border">
          <iframe
            title="Buckingham Kennel location"
            src="https://www.google.com/maps?q=Webuye,+Bungoma,+Kenya&output=embed"
            className="h-[420px] w-full"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}

function InfoCard({ icon: Icon, title, lines, href }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; lines: string[]; href?: string }) {
  const inner = (
    <div className="flex gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-ochre-400">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ochre-400/12 text-accent-ink">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-display font-semibold">{title}</p>
        {lines.map((l) => <p key={l} className="text-sm text-muted">{l}</p>)}
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
