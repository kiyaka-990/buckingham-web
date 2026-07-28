import { PageHeroSkeleton, DogGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
        <div className="hidden h-96 rounded-3xl border border-border bg-surface lg:block skeleton" />
        <DogGridSkeleton count={9} />
      </div>
    </>
  );
}
