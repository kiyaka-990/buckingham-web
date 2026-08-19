"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, FileText, Reply, Archive, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleMessageRead } from "@/lib/actions/admin";

export type AdminMessage = {
  id: string; name: string; email: string; channel: string;
  subject: string; body: string; unread: boolean; date: string;
};

const channelIcon: Record<string, React.ComponentType<{ size?: number; className?: string }>> = { "Web Form": FileText, WhatsApp: MessageCircle, Email: Mail };

export function MessagesManager({ messages }: { messages: AdminMessage[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<AdminMessage | null>(messages[0] ?? null);
  const [q, setQ] = useState("");
  const [, start] = useTransition();
  const [pending, setPending] = useState(false);

  const list = messages.filter((m) => `${m.name} ${m.subject} ${m.body}`.toLowerCase().includes(q.toLowerCase()));
  const unreadCount = messages.filter((m) => m.unread).length;

  const open = (m: AdminMessage) => {
    setSelected(m);
    if (m.unread) start(async () => { await toggleMessageRead(m.id, false); router.refresh(); });
  };

  const sendReply = () => {
    if (!selected) return;
    setPending(true);
    start(async () => { await toggleMessageRead(selected.id, false); setPending(false); router.refresh(); });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Messages</h1>
        <p className="text-muted">{unreadCount} unread enquiries · stored in the database.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-border bg-surface">
          <div className="border-b border-border p-3">
            <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3">
              <Search size={15} className="text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="h-full flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {list.map((m) => {
              const Icon = channelIcon[m.channel] ?? Mail;
              return (
                <li key={m.id}>
                  <button onClick={() => open(m)} className={cn("flex w-full gap-3 border-b border-border p-4 text-left transition hover:bg-foreground/[0.03]", selected?.id === m.id && "bg-brass-400/5")}>
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-brass-500"><Icon size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm", m.unread ? "font-bold" : "font-medium")}>{m.name}</p>
                        <span className="shrink-0 text-[10px] text-muted">{m.date}</span>
                      </div>
                      <p className="truncate text-xs font-medium">{m.subject}</p>
                      <p className="truncate text-xs text-muted">{m.body}</p>
                    </div>
                    {m.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brass-400" />}
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="p-6 text-center text-sm text-muted">No messages.</li>}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brass-400/15 font-display text-lg font-bold text-brass-500">{selected.name.charAt(0)}</span>
                  <div><p className="font-semibold">{selected.name}</p><p className="text-sm text-muted">{selected.email} · via {selected.channel}</p></div>
                </div>
                <span className="text-xs text-muted">{selected.date}</span>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">{selected.subject}</h2>
              <p className="mt-3 leading-relaxed text-muted">{selected.body}</p>
              <div className="mt-6 rounded-2xl border border-border bg-background p-3">
                <textarea rows={3} placeholder={`Reply to ${selected.name}…`} className="w-full resize-none bg-transparent text-sm outline-none" />
                <div className="mt-2 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm text-muted hover:text-foreground"><Archive size={15} /> Archive</button>
                  <button onClick={sendReply} disabled={pending} className="btn-brass flex items-center gap-2 rounded-full px-5 py-2 text-sm">
                    {pending ? <Loader2 size={15} className="animate-spin" /> : <Reply size={15} />} Send reply
                  </button>
                </div>
              </div>
            </>
          ) : <p className="text-muted">No message selected.</p>}
        </div>
      </div>
    </div>
  );
}
