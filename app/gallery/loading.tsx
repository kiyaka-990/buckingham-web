import { PageHeroSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const heights = ["h-56", "h-72", "h-64", "h-80", "h-52", "h-72", "h-60", "h-64"];
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className={`w-full ${heights[i % heights.length]}`} />
          ))}
        </div>
      </div>
    </>
  );
}
