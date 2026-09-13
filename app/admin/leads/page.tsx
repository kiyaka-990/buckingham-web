import { db } from "@/lib/db";
import { pipelineSummary } from "@/lib/agent/marketing-agent";
import { MAX_TOUCHES } from "@/lib/leads";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Leads · Admin" };

const stageTone: Record<string, string> = {
  hot: "bg-red-500/15 text-red-400",
  qualified: "bg-amber-500/15 text-amber-400",
  nurturing: "bg-sky-500/15 text-sky-400",
  new: "bg-slate-500/15 text-slate-400",
  won: "bg-emerald-500/15 text-emerald-400",
  lost: "bg-neutral-500/15 text-neutral-400",
  unsubscribed: "bg-neutral-500/15 text-neutral-400",
};

export default async function AdminLeads() {
  const [leads, summary] = await Promise.all([
    db.lead.findMany({ orderBy: [{ score: "desc" }, { createdAt: "desc" }], take: 200 }),
    pipelineSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Leads</h1>
        <p className="mt-1 text-sm text-muted">
          {summary.total} total · {summary.contactable} still contactable · Ivy follows up automatically,
          at most {MAX_TOUCHES} emails each.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(summary.byStage).map(([stage, count]) => (
          <span
            key={stage}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${stageTone[stage] ?? stageTone.new}`}
          >
            {stage} · {count}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Interest</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Touches</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  No leads yet. Duke creates one whenever a visitor gives their details.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3 text-muted">
                  <div>{l.email}</div>
                  {l.phone && <div className="text-xs">{l.phone}</div>}
                </td>
                <td className="max-w-[22rem] px-4 py-3 text-muted">{l.interest || "—"}</td>
                <td className="px-4 py-3 text-muted">{l.budgetUsd ? formatPrice(l.budgetUsd) : "—"}</td>
                <td className="px-4 py-3 tabular-nums">{l.score}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${stageTone[l.stage] ?? stageTone.new}`}>
                    {l.stage}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {l.touches}/{MAX_TOUCHES}
                  {l.unsubscribedAt && <span className="ml-2 text-xs">opted out</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
