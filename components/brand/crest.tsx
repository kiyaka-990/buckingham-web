import { cn } from "@/lib/utils";

/**
 * Buckingham Kennel shield crest.
 *
 * Heraldic shield + shepherd-head silhouette, echoing the crest the
 * kennel's handlers wear on their caps and overalls. Drawn as a single
 * vector so it stays crisp from 16px (favicon) to hero scale.
 *
 * `tone` picks how it renders against its surroundings:
 *  - "brand"  → forest shield, brass hairline, bone dog  (light surfaces)
 *  - "invert" → bone shield, brass hairline, forest dog  (photos / dark)
 *  - "mono"   → inherits currentColor entirely           (footers, print)
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
  const shield =
    tone === "brand"
      ? "var(--color-forest-700)"
      : tone === "invert"
        ? "var(--color-bone-100)"
        : "currentColor";
  const hairline = tone === "mono" ? "currentColor" : "var(--color-brass-400)";
  const dog =
    tone === "brand"
      ? "var(--color-bone-100)"
      : tone === "invert"
        ? "var(--color-forest-700)"
        : "currentColor";

  return (
    <svg
      viewBox="0 0 64 72"
      className={cn("h-9 w-auto", className)}
      role="img"
      aria-label={title}
      fill="none"
    >
      <title>{title}</title>

      {/* Shield body */}
      <path
        d="M32 3 L59 12.5 V37 C59 53 46.5 64.8 32 69 C17.5 64.8 5 53 5 37 V12.5 Z"
        fill={shield}
        opacity={tone === "mono" ? 0.12 : 1}
      />

      {/* Brass hairline, inset */}
      <path
        d="M32 8.4 L54.4 16.3 V36.8 C54.4 50 44 60.2 32 64.1 C20 60.2 9.6 50 9.6 36.8 V16.3 Z"
        stroke={hairline}
        strokeWidth="1.1"
        fill="none"
      />

      {/* Shepherd head, in profile */}
      <path
        d="M23 30
           C21.5 34 21 39.5 21.3 44.5
           C21.5 47.5 22 49.3 23.2 50.6
           C26.5 50.4 30.8 49.4 34.8 46.6
           L38.4 44.6
           L47.2 41.4
           C48.6 40.9 49.8 40.4 49.8 39.4
           C49.8 38.4 48.8 37.9 47.6 37.5
           L40.2 34.6
           C39.2 32.6 37.8 30.9 36 29.6
           L35.4 28.4
           L33.2 15.6
           L29.4 26.2
           C28.7 26.3 28 26.5 27.4 26.7
           L19.6 17.2
           Z"
        fill={dog}
      />
    </svg>
  );
}

/**
 * Full lockup: crest + stacked wordmark. Used in the navbar and footer.
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
          <span className="mt-[3px] text-[0.5rem] font-semibold uppercase tracking-[0.34em] text-brass-600 dark:text-brass-300">
            Kennel Ltd
          </span>
        </span>
      )}
    </span>
  );
}
