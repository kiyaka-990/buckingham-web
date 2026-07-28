import { PageHeroSkeleton, DogGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-7xl px-6 py-14">
        <DogGridSkeleton count={8} />
      </div>
    </>
  );
}
