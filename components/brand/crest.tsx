import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Buckingham Kennel mark.
 *
 * This is the kennel's own logo — the retriever head from the company mark —
 * cut out onto transparency and rendered in the neutral ink the rest of the
 * type uses, so it sits on white, on graphite and over photographs without a
 * plate behind it. The accent is rationed for things that mean something; a
 * logo is not one of them. Generated from `logo.png` at the repository root;
 * the wordmark version lives beside it as `logo-ink.png`.
 *
 * `tone` picks how it renders against its surroundings:
 *  - "brand"  → graphite ink (light surfaces)
 *  - "invert" → white        (photos / dark surfaces)
 *  - "mono"   → graphite ink, kept for API compatibility
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
  // "invert" is always the white cut-out — it is asked for by callers that
  // know they are on a photograph. Everything else follows the theme, because
  // graphite ink on a graphite surface is an invisible logo.
  if (tone === "invert") {
    return (
      <Image
        src="/brand/mark-white.png"
        alt={title}
        width={512}
        height={512}
        priority
        className={cn("h-9 w-auto object-contain", className)}
      />
    );
  }

  return (
    <>
      <Image
        src="/brand/mark-ink.png"
        alt={title}
        width={512}
        height={512}
        priority
        className={cn("h-9 w-auto object-contain dark:hidden", className)}
      />
      <Image
        src="/brand/mark-white.png"
        alt=""
        aria-hidden
        width={512}
        height={512}
        priority
        className={cn("hidden h-9 w-auto object-contain dark:block", className)}
      />
    </>
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
