import { Skeleton, DogGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="min-h-[60vh] bg-navy-950" />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-80 rounded-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-20">
        <DogGridSkeleton count={4} />
      </div>
    </>
  );
}
