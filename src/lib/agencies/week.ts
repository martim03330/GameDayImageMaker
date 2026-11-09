/**
 * The weekly rules of the agency service: a week runs Monday–Sunday; each player gets one matchday edit
 * a week (his first game Friday–Monday, else his next game within 7 days); a look belongs to one agency
 * per week and is never one NEYOD used that week. Pure, on "YYYY-MM-DD" strings (UTC arithmetic).
 */

const DAY = 864e5;
const toDate = (d: string) => new Date(`${d}T00:00:00Z`);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** The Monday of the week of `date`. */
export function weekStart(date: string): string {
  const d = toDate(date);
  return iso(d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY);
}

/** This week's game: the first one Friday–Monday, else the next one within 7 days of `today`. */
export function pickFixture<F extends { id: string; date: string }>(fixtures: F[], today: string): F | null {
  const sorted = fixtures.filter((f) => f.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const mon = toDate(weekStart(today)).getTime();
  const fri = iso(mon + 4 * DAY);
  const nextMon = iso(mon + 7 * DAY);
  const weekend = sorted.find((f) => f.date >= fri && f.date <= nextMon);
  if (weekend) return weekend;
  const limit = iso(toDate(today).getTime() + 7 * DAY);
  return sorted.find((f) => f.date <= limit) ?? null;
}

/** Looks nobody else has this week. */
export function freeLooks(all: string[], takenByAgencies: string[], takenByNeyod: string[]): string[] {
  const taken = new Set([...takenByAgencies, ...takenByNeyod]);
  return all.filter((l) => !taken.has(l));
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A free look for the week, the same for the same seed (agency id + week). */
export function suggestLook(free: string[], seed: string): string | null {
  return free.length ? free[hash(seed) % free.length] : null;
}
