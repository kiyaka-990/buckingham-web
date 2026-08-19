import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "brass" | "forest" | "outline" | "ghost" | "glass" | "gradient";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  brass: "btn-brass",
  forest: "bg-forest-800 text-white hover:bg-forest-700 dark:bg-forest-600 dark:hover:bg-forest-500",
  gradient:
    "bg-[linear-gradient(120deg,var(--color-forest-800),var(--color-forest-600)_45%,var(--color-brass-500))] bg-[length:200%_auto] bg-left text-white hover:bg-right transition-[background-position] duration-500 shadow-soft",
  outline:
    "border border-brass-400/60 text-foreground hover:bg-brass-400/10 hover:border-brass-400",
  ghost: "text-foreground hover:bg-foreground/5",
  glass: "glass text-foreground hover:bg-foreground/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] whitespace-nowrap";

export function Button({
  variant = "brass",
  size = "md",
  className,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function ButtonLink({
  variant = "brass",
  size = "md",
  className,
  href,
  ...props
}: BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
