import { CakeSlice, ShieldCheck, Syringe } from "lucide-react";
import { FadeImage } from "@/components/ui/fade-image";
import { Reveal } from "@/components/ui/reveal";
import { formatBorn } from "@/lib/data/breeds";
import { importCertificate, vaccinationRecords, type VaccinationRecord } from "@/lib/data/records";

/**
 * The vaccination cards themselves.
 *
 * Buyers ask for proof, so we show the documents rather than describing them:
 * each dog's own GetMeKnown card, front and opened, with the vet's dated
 * entries and vaccine batch stickers legible. Each frame links to the full
 * image so a serious buyer can read the small print.
 */
function RecordCard({ record }: { record: VaccinationRecord }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">{record.dog}</h3>
          <p className="text-sm text-muted">
            {record.breedLabel} · {record.sex}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <CakeSlice size={13} className="text-accent-ink" />
          Born {formatBorn(record.born)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        {record.frames.map((frame) => (
          <a
            key={frame.src}
            href={frame.src}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[4/5] overflow-hidden bg-surface"
          >
            <FadeImage
              src={frame.src}
              alt={`${record.dog} — ${frame.caption}`}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite-950/90 to-transparent p-3 text-[11px] leading-snug text-white">
              {frame.caption}
            </span>
          </a>
        ))}
      </div>

      <div className="space-y-3 px-5 py-4">
        <ul className="space-y-1.5">
          {record.vaccines.map((v) => (
            <li key={v} className="flex items-start gap-2 text-sm text-foreground">
              <Syringe size={14} className="mt-0.5 shrink-0 text-accent-ink" />
              {v}
            </li>
          ))}
        </ul>
        {record.nextDue && (
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">Next due:</span> {record.nextDue}
          </p>
        )}
        {record.notes && <p className="text-sm text-muted">{record.notes}</p>}
        {record.notes2 && (
          <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs leading-relaxed text-muted">
            {record.notes2}
          </p>
        )}
      </div>
    </article>
  );
}

export function HealthRecords({ records = vaccinationRecords }: { records?: VaccinationRecord[] }) {
  if (!records.length) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record, i) => (
          <Reveal key={record.dog} delay={i % 3}>
            <RecordCard record={record} />
          </Reveal>
        ))}
      </div>

      {/* The import paperwork. One document behind three of the dogs, so it sits
          on its own rather than being repeated in each card. */}
      <Reveal>
        <article className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-xl font-bold text-foreground">{importCertificate.title}</h3>
            <p className="text-sm text-muted">{importCertificate.caption}</p>
          </div>
          <div className="grid gap-px bg-border md:grid-cols-2">
            <a
              href={importCertificate.src}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[3/4] overflow-hidden bg-surface"
            >
              <FadeImage
                src={importCertificate.src}
                alt={importCertificate.title}
                fill
                sizes="(max-width:768px) 100vw, 40vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
            </a>
            <div className="bg-surface p-5">
              <p className="mb-3 text-sm text-muted">
                The dogs as the certificate records them — this is where their dates of birth and
                colours come from.
              </p>
              <ul className="space-y-2">
                {importCertificate.rows.map((row) => (
                  <li key={row.dog} className="text-sm">
                    <span className="font-semibold text-foreground">{row.dog}</span>
                    <span className="text-muted">
                      {" "}— {row.breed}, {row.sex}, born {row.born}, {row.colour}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </Reveal>

      {/* Buyers should know why parts of the scans are blacked out, so that a
          redaction never reads as something being hidden from them. */}
      <p className="mx-auto mt-8 flex max-w-2xl items-start gap-2 text-center text-xs leading-relaxed text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-accent-ink" />
        <span className="text-left">
          These are our dogs&rsquo; real vaccination cards. Microchip numbers and our
          veterinarian&rsquo;s signature, stamp and licence number are blacked out for the dogs&rsquo;
          security — every vaccine, batch number and date is left exactly as written. On the import
          certificate the certificate and permit numbers and the consignor and consignee details are
          blacked out for the same reason. Originals are shown to buyers on collection, and travel
          with every puppy. None of this is a pedigree: our dogs are not Kennel Club registered and
          hold no pedigree certificates.
        </span>
      </p>
    </>
  );
}
