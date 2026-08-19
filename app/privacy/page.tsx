import { heroImages } from "@/lib/data/media";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" eyebrow="Legal" image={heroImages.legal} crumbs={[{ label: "Privacy" }]} />
      <article className="mx-auto max-w-3xl space-y-5 px-6 py-16 text-muted leading-relaxed">
        <p>Your privacy matters to {site.name}. This policy explains what we collect and how we use it.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Information we collect</h2>
        <p>We collect contact details you provide (name, email, phone, delivery address) when you enquire, register or place an order, plus basic analytics and cookie data to improve your experience.</p>
        <h2 className="font-display text-xl font-bold text-foreground">How we use it</h2>
        <p>To process reservations and deliveries, respond to enquiries, provide after-sale support, and (with consent) send updates about new litters and offers.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Payments</h2>
        <p>Card payments are processed securely by Stripe; M-Pesa payments by Safaricom. We never store your full card details.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Cookies</h2>
        <p>You control cookie preferences via our consent banner. Essential cookies keep your cart and session working.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Contact</h2>
        <p>Questions? Email {site.contact.email} or call {site.contact.phoneDisplay}.</p>
      </article>
    </>
  );
}
