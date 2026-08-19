import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function DogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <DogCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeroSkeleton() {
  return (
    <div className="relative flex min-h-[42vh] items-end overflow-hidden bg-forest-950">
      <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-28">
        <Skeleton className="mb-3 h-3 w-24 bg-white/10" />
        <Skeleton className="h-12 w-72 bg-white/10" />
      </div>
    </div>
  );
}
