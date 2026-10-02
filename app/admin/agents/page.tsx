import { db } from "@/lib/db";
import { agentHealth } from "@/lib/agent/health";
import { ago, daysAgo, formatWhen, msSince } from "@/lib/time";

export const metadata = { title: "Agent activity · Admin" };
export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  done: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
  rejected: "bg-amber-500/15 text-amber-400",
  pending_approval: "bg-sky-500/15 text-sky-400",
};

const labels: Record<string, string> = {
  capture_lead: "Lead captured",
  book_viewing: "Viewing booked",
  hold_puppy: "Puppy held",
  start_reservation: "Reservation started",
  nurture_email: "Follow-up email sent",
  nurture_draft_failed: "Follow-up draft failed",
  abandoned_nudge: "Payment reminder sent",
  abandon_order: "Unpaid order closed",
  agent_unavailable: "Duke could not answer",
  cron_run: "Daily job ran",
};

export default async function AdminAgents() {
  const weekAgo = daysAgo(7);
  const [health, actions, grouped, chats, lastRun] = await Promise.all([
    agentHealth(),
    db.agentAction.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    db.agentAction.groupBy({ by: ["action", "status"], where: { createdAt: { gt: weekAgo } }, _count: { _all: true } }),
    db.chatSession.count({ where: { createdAt: { gt: weekAgo } } }),
    db.agentAction.findFirst({ where: { action: "cron_run" }, orderBy: { createdAt: "desc" } }),
  ]);

  const count = (action: string, status = "done") =>
    grouped.find((g) => g.action === action && g.status === status)?._count._all ?? 0;
  const failures = grouped.filter((g) => g.status === "failed").reduce((n, g) => n + g._count._all, 0);

  const tiles = [
    { label: "Conversations", value: chats },
    { label: "Leads captured", value: count("capture_lead") },
    { label: "Viewings booked", value: count("book_viewing") },
    { label: "Puppies held", value: count("hold_puppy") },
    { label: "Reservations started", value: count("start_reservation") },
    { label: "Follow-ups sent", value: count("nurture_email") },
    { label: "Failures", value: failures },
  ];

  // Honest about the one thing this page can't see: Vercel Cron never reached us.
  const lastRunAge = lastRun ? msSince(lastRun.createdAt) : Infinity;
  const cronStale = lastRunAge > 36 * 60 * 60_000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Agent activity</h1>
        <p className="mt-1 text-sm text-muted">
          Everything Duke (sales) and Ivy (follow-ups) did on the kennel&apos;s behalf. Last 7 days in the tiles; latest 100 actions below.
        </p>
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${health.healthy ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/40 bg-red-500/10"}`}>
        {health.healthy ? (
          <span><strong>Duke is answering.</strong> No AI failures in the last 24 hours.</span>
        ) : (
          <span><strong className="text-red-400">Duke is not answering.</strong> {health.reason}</span>
        )}
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${cronStale ? "border-amber-500/40 bg-amber-500/10" : "border-border bg-surface"}`}>
        {lastRun ? (
          <span>
            <strong>Daily follow-up job</strong> last ran {ago(lastRun.createdAt)} — {lastRun.summary}
            {cronStale && " That is overdue: check that CRON_SECRET is set on Vercel."}
          </span>
        ) : (
          <span>
            <strong>Daily follow-up job has not reported in yet.</strong> It runs once a day at 07:00 UTC. If this is still blank
            after a day, CRON_SECRET is probably missing on Vercel, and stale holds, payment reminders and lead follow-ups are not running.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-display text-2xl font-bold">{t.value}</p>
            <p className="text-xs text-muted">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">When (EAT)</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {actions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No agent activity recorded yet.</td></tr>
            )}
            {actions.map((a) => (
              <tr key={a.id} className="border-t border-border/60 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatWhen(a.createdAt)}</td>
                <td className="px-4 py-3 capitalize">{a.agent}</td>
                <td className="px-4 py-3">{labels[a.action] ?? a.action}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone[a.status] ?? statusTone.done}`}>{a.status.replace("_", " ")}</span>
                </td>
                <td className="max-w-[28rem] px-4 py-3 text-muted">
                  {a.summary}
                  {(a.contact || a.orderRef || a.dogSlug) && (
                    <span className="mt-0.5 block text-xs">
                      {[a.contact, a.orderRef, a.dogSlug].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
