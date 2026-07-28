"use client";

import { useState } from "react";
import { Mail, MessageCircle, FileText, Reply, Archive, Search } from "lucide-react";
import { messages, type Message } from "@/lib/data/admin";
import { cn } from "@/lib/utils";

const channelIcon = { "Web Form": FileText, WhatsApp: MessageCircle, Email: Mail };

export default function MessagesPage() {
  const [selected, setSelected] = useState<Message>(messages[0]);
  const [q, setQ] = useState("");
  const [read, setRead] = useState<string[]>([]);

  const list = messages.filter((m) => `${m.name} ${m.subject} ${m.preview}`.toLowerCase().includes(q.toLowerCase()));
  const unreadCount = messages.filter((m) => m.unread && !read.includes(m.id)).length;

  const open = (m: Message) => {
    setSelected(m);
    if (!read.includes(m.id)) setRead((r) => [...r, m.id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Messages</h1>
          <p className="text-muted">{unreadCount} unread enquiries.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* List */}
        <div className="rounded-3xl border border-border bg-surface">
          <div className="border-b border-border p-3">
            <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3">
              <Search size={15} className="text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="h-full flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {list.map((m) => {
              const Icon = channelIcon[m.channel];
              const isUnread = m.unread && !read.includes(m.id);
              return (
                <li key={m.id}>
                  <button onClick={() => open(m)} className={cn("flex w-full gap-3 border-b border-border p-4 text-left transition hover:bg-foreground/[0.03]", selected.id === m.id && "bg-gold-400/5")}>
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-gold-500"><Icon size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate text-sm", isUnread ? "font-bold" : "font-medium")}>{m.name}</p>
                        <span className="shrink-0 text-[10px] text-muted">{m.time}</span>
                      </div>
                      <p className="truncate text-xs font-medium">{m.subject}</p>
                      <p className="truncate text-xs text-muted">{m.preview}</p>
                    </div>
                    {isUnread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Detail */}
        <div className="rounded-3xl border border-border bg-surface p-6">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-400/15 font-display text-lg font-bold text-gold-500">{selected.name.charAt(0)}</span>
              <div>
                <p className="font-semibold">{selected.name}</p>
                <p className="text-sm text-muted">{selected.email} · via {selected.channel}</p>
              </div>
            </div>
            <span className="text-xs text-muted">{selected.time}</span>
          </div>
          <h2 className="mt-4 font-display text-xl font-bold">{selected.subject}</h2>
          <p className="mt-3 leading-relaxed text-muted">{selected.preview} Lorem ipsum — full enquiry message would appear here with the customer&apos;s complete details, preferred breed and budget.</p>

          <div className="mt-6 rounded-2xl border border-border bg-background p-3">
            <textarea rows={3} placeholder={`Reply to ${selected.name}…`} className="w-full resize-none bg-transparent text-sm outline-none" />
            <div className="mt-2 flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm text-muted hover:text-foreground"><Archive size={15} /> Archive</button>
              <button className="btn-gold flex items-center gap-2 rounded-full px-5 py-2 text-sm"><Reply size={15} /> Send reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
