import type { Metadata } from "next";
import { unsubscribeByToken } from "@/lib/leads";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/**
 * One-click opt-out, reached from the footer of every follow-up email.
 *
 * Deliberately a plain page with no confirmation step: making someone click
 * twice to stop hearing from you is a dark pattern, and the link is already
 * unguessable. Acting on GET is the right trade here — the only effect is to
 * stop email, which is what the person wants either way.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const done = t ? await unsubscribeByToken(t) : false;

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-6 py-24">
      <h1 className="font-display text-3xl font-semibold">
        {done ? "You're unsubscribed" : "Nothing to do"}
      </h1>
      <p className="mt-4 text-muted">
        {done
          ? "We won't email you about puppies again. If you'd still like to reach us, you're very welcome to call or write any time — this only stops us contacting you."
          : "That link has already been used, or it isn't one of ours. Either way you're not on our follow-up list."}
      </p>
      <p className="mt-6 text-sm text-muted">
        {site.contact.email}
      </p>
    </section>
  );
}
