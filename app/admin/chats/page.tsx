import { db } from "@/lib/db";
import { ago, daysAgo, formatWhen } from "@/lib/time";
import { site } from "@/lib/site";

export const metadata = { title: "Chats · Admin" };
export const dynamic = "force-dynamic";

type Turn = { role: "user" | "assistant"; content: string; at?: string };

function parse(raw: string): Turn[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as Turn[]) : [];
  } catch {
    return [];
  }
}

export default async function AdminChats() {
  const dayAgo = daysAgo(1);
  const [sessions, total, today] = await Promise.all([
    db.chatSession.findMany({ orderBy: { updatedAt: "desc" }, take: 200 }),
    db.chatSession.count(),
    db.chatSession.count({ where: { updatedAt: { gt: dayAgo } } }),
  ]);
  const people = new Set(sessions.map((s) => s.email).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Chats</h1>
        <p className="mt-1 text-sm text-muted">
          Every conversation with Duke, from visitors who signed in. {total} total · {today} active in the last 24 hours · {people} different people (latest 200 shown).
        </p>
      </div>

      {sessions.length === 0 && (
        <div className="rounded-2xl border border-border p-10 text-center text-muted">
          No conversations yet. They appear here as soon as a signed-in visitor sends their first message.
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((s) => {
          const turns = parse(s.transcript);
          const wa = s.phone ? `https://wa.me/${s.phone.replace(/\D/g, "")}` : null;
          return (
            <details key={s.id} className="group rounded-2xl border border-border bg-surface open:border-volt-400/50">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 p-4">
                <span className="min-w-[8rem] font-semibold">{s.name || "Anonymous"}</span>
                <span className="text-sm text-muted">{s.email || "no email"}</span>
                {s.phone && <span className="text-sm text-muted">{s.phone}</span>}
                <span className="ml-auto text-xs text-muted">
                  {s.turns} message{s.turns === 1 ? "" : "s"} · {ago(s.updatedAt)}
                </span>
                {s.lastUserMessage && (
                  <span className="w-full truncate text-sm text-muted">“{s.lastUserMessage}”</span>
                )}
              </summary>
              <div className="space-y-3 border-t border-border p-4">
                <div className="flex flex-wrap gap-3 text-xs">
                  {s.email && <a className="font-medium text-accent-ink hover:underline" href={`mailto:${s.email}`}>Email</a>}
                  {wa && <a className="font-medium text-accent-ink hover:underline" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                  <span className="text-muted">Started {formatWhen(s.createdAt)} (EAT)</span>
                </div>
                {turns.map((t, i) => (
                  <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div
                      className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
                        t.role === "user" ? "bg-graphite-800 text-white" : "bg-surface-2"
                      }`}
                    >
                      <span className="mb-0.5 block text-[10px] uppercase tracking-wide opacity-60">
                        {t.role === "user" ? (s.name?.split(" ")[0] || "Visitor") : "Duke"}
                        {t.at ? ` · ${formatWhen(new Date(t.at))}` : ""}
                      </span>
                      {t.content}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
      <p className="text-xs text-muted">Visitors are told chats are saved. To follow up, use the buttons above or call {site.contact.phoneDisplay}.</p>
    </div>
  );
}
