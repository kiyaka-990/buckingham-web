import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dogs, getDog, relatedDogs } from "@/lib/data/catalog";
import { DogDetail } from "@/components/shop/dog-detail";
import { DogCard } from "@/components/shop/dog-card";
import { SectionHeading } from "@/components/ui/section";

export function generateStaticParams() {
  return dogs.map((d) => ({ slug: d.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const dog = getDog(slug);
  if (!dog) return { title: "Dog not found" };
  return {
    title: `${dog.name} — ${dog.breedName}`,
    description: dog.description,
    openGraph: { images: [dog.images[0]] },
  };
}

export default async function DogPage({ params }: Params) {
  const { slug } = await params;
  const dog = getDog(slug);
  if (!dog) notFound();

  const related = relatedDogs(dog);

  return (
    <div className="pt-20">
      <DogDetail dog={dog} />

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <SectionHeading eyebrow="You may also love" title="Related Companions" className="mb-8" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((d, i) => (
              <DogCard key={d.id} dog={d} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
