import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, PawPrint } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SuccessOrderId } from "./success-client";

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-32 text-center">
      <div className="relative rounded-3xl border border-border bg-surface p-10">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
          <CheckCircle2 size={44} />
        </div>
        <h1 className="font-display text-3xl font-bold">Thank you! 🐾</h1>
        <p className="mt-3 text-muted">
          Your reservation is confirmed. Your order reference is{" "}
          <Suspense fallback={<span className="font-semibold text-gold-500">…</span>}>
            <SuccessOrderId />
          </Suspense>
          . Our team will contact you within 24 hours to arrange health checks, paperwork and delivery.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/account">View My Orders</ButtonLink>
          <ButtonLink href="/shop" variant="outline">Continue Browsing</ButtonLink>
        </div>
        <Link href="/" className="mt-6 inline-flex items-center gap-1 text-sm text-muted hover:text-gold-500">
          <PawPrint size={14} /> Back to home
        </Link>
      </div>
    </div>
  );
}
