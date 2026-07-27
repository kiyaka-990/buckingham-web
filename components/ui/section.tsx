import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={cn("space-y-3", center && "text-center mx-auto max-w-2xl", className)}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
          <span className="h-px w-6 bg-gold-400" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold">{title}</h2>
      {subtitle && <p className="text-muted text-base sm:text-lg leading-relaxed">{subtitle}</p>}
    </Reveal>
  );
}
