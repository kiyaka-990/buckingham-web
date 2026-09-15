import { NextResponse } from "next/server";
import { getDogs } from "@/lib/queries";
import { isForSale, isPhotoPending } from "@/lib/data/catalog";
import { PHOTO_PENDING } from "@/lib/data/breeds";

export const runtime = "nodejs";

/**
 * The search index.
 *
 * The modal used to filter a static array compiled into the bundle, which
 * meant anything the owner changed in the admin — a new litter, a renamed dog,
 * one marked sold — was invisible to search until the next deploy. This reads
 * the same database every other listing on the site reads.
 *
 * Sent once when the modal first opens and then filtered in the browser, so
 * typing stays instant and we are not issuing a query per keystroke.
 *
 * No cache header is set below on purpose: next.config.ts puts a blanket
 * "no-store" on /api/:path* and that wins, so anything set here would be a
 * header the response never actually carries. It costs little — the modal
 * fetches this once per page load, not once per keystroke.
 */
export async function GET() {
  const dogs = await getDogs();

  return NextResponse.json({
    dogs: dogs.map((d) => ({
      slug: d.slug,
      name: d.name,
      breedName: d.breedName,
      breedSlug: d.breedSlug,
      color: d.color,
      category: d.category,
      ageLabel: d.ageLabel,
      price: d.price,
      status: d.status,
      forSale: isForSale(d),
      // The sentinel, not "" — FadeImage renders the crest plate for it, and
      // an empty src throws inside next/image.
      image: isPhotoPending(d) ? PHOTO_PENDING : d.images[0],
    })),
  });
}
