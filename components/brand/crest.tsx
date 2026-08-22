import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Buckingham Kennel mark.
 *
 * This is the kennel's own logo — the retriever head from the company mark —
 * recoloured from its original gold-and-navy into the site's Warm Clay browns
 * and cut out onto transparency, so it sits on cream, on clay and over
 * photographs without a plate behind it. Generated from `logo.png` at the
 * repository root; the wordmark version lives beside it as `logo-brown.png`.
 *
 * `tone` picks how it renders against its surroundings:
 *  - "brand"  → clay brown   (light surfaces)
 *  - "invert" → cream        (photos / dark surfaces)
 *  - "mono"   → clay brown, kept for API compatibility
 */
export function Crest({
  className,
  tone = "brand",
  title = "Buckingham Kennel Limited",
}: {
  className?: string;
  tone?: "brand" | "invert" | "mono";
  title?: string;
}) {
  return (
    <Image
      src={tone === "invert" ? "/brand/mark-cream.png" : "/brand/mark-brown.png"}
      alt={title}
      width={512}
      height={512}
      priority
      className={cn("h-9 w-auto object-contain", className)}
    />
  );
}

/**
 * Full lockup: mark + stacked wordmark. Used in the navbar and footer.
 */
export function Logo({
  className,
  tone = "brand",
  showWordmark = true,
}: {
  className?: string;
  tone?: "brand" | "invert" | "mono";
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Crest tone={tone} className="h-9 w-auto shrink-0" />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.0625rem] font-semibold tracking-tight">
            BUCKINGHAM
          </span>
          <span className="mt-[3px] text-[0.5rem] font-semibold uppercase tracking-[0.34em] text-accent-ink">
            Kennel Ltd
          </span>
        </span>
      )}
    </span>
  );
}
