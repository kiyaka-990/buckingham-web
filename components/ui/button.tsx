import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "gold" | "navy" | "outline" | "ghost" | "glass";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  gold: "btn-gold",
  navy: "bg-navy-800 text-white hover:bg-navy-700 dark:bg-navy-600 dark:hover:bg-navy-500",
  outline:
    "border border-gold-400/60 text-foreground hover:bg-gold-400/10 hover:border-gold-400",
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
  variant = "gold",
  size = "md",
  className,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function ButtonLink({
  variant = "gold",
  size = "md",
  className,
  href,
  ...props
}: BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
