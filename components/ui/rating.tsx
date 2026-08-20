import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  reviews,
  size = 14,
  className,
}: {
  value: number;
  reviews?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i < Math.round(value) ? "fill-ochre-400 text-ochre-400" : "text-muted/40"
            )}
          />
        ))}
      </span>
      <span className="text-xs text-muted">
        {value.toFixed(1)}
        {reviews != null && ` (${reviews})`}
      </span>
    </span>
  );
}
