import { heroImages } from "@/lib/data/media";
import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms & Conditions" eyebrow="Legal" image={heroImages.legal} crumbs={[{ label: "Terms" }]} />
      <article className="mx-auto max-w-3xl space-y-5 px-6 py-16 text-muted leading-relaxed">
        <p>These terms govern the sale of dogs and services by {site.name} (Reg. {site.registration}).</p>
        <h2 className="font-display text-xl font-bold text-foreground">Reservations & deposits</h2>
        <p>A non-refundable deposit (typically 30%) reserves your chosen dog. The balance is due on or before delivery/collection.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Health guarantee</h2>
        <p>Every dog is sold vaccinated, dewormed, microchipped and vet-checked, with a written health guarantee against specified hereditary conditions for the stated period.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Delivery</h2>
        <p>Delivery is arranged at cost using safe, vetted transport. Timelines are estimates and may vary with location and readiness of the dog.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Responsible ownership</h2>
        <p>Buyers agree to provide appropriate care, nutrition, veterinary attention and training. Our lifetime support is here to help.</p>
        <h2 className="font-display text-xl font-bold text-foreground">Contact</h2>
        <p>For any questions about these terms, contact {site.contact.email}.</p>
      </article>
    </>
  );
}
