/** Admin-facing timestamps, in the kennel's own timezone. */
const TZ = "Africa/Nairobi";

export const formatWhen = (d: Date) =>
  d.toLocaleString("en-GB", { timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

export function ago(d: Date, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** A point in time `n` days back. Lives here so server pages stay free of Date.now(). */
export const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60_000);

/** Milliseconds since `d`. */
export const msSince = (d: Date) => Date.now() - d.getTime();
