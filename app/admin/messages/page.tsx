import { db } from "@/lib/db";
import { MessagesManager, type AdminMessage } from "@/components/admin/messages-manager";

export const metadata = { title: "Messages · Admin" };

export default async function AdminMessages() {
  const rows = await db.message.findMany({ orderBy: { createdAt: "desc" } });
  const messages: AdminMessage[] = rows.map((m) => ({
    id: m.id, name: m.name, email: m.email, channel: m.channel,
    subject: m.subject, body: m.body, unread: m.unread,
    date: m.createdAt.toISOString().slice(0, 10),
  }));
  return <MessagesManager messages={messages} />;
}
