/** Why a player gets no edit in this week's batch (null = he gets one). Pure, so it is tested. */
export function skipReason(p: { hasPhoto: boolean; fixture: object | null; done: boolean }): string | null {
  if (p.done) return "já feita";
  if (!p.hasPhoto) return "sem foto";
  if (!p.fixture) return "sem jogo esta semana";
  return null;
}

/** Looks that print NEYOD or an "edit by …" credit inside the image: never used for an agency. */
export const AGENCY_UNSAFE_LOOKS = ["filmframe", "pressphoto", "slats"];

/** The looks an agency can have: not hidden by the user, not unsafe. */
export function agencyLooks(ids: string[], hidden: string[]): string[] {
  const out = new Set([...hidden, ...AGENCY_UNSAFE_LOOKS]);
  return ids.filter((id) => !out.has(id));
}

/** The look params without the agency branding (copies of an agency edit are NEYOD's own edits). */
export function stripAgency<T extends { agencyId?: string; agencyWeek?: string }>(params: T): Omit<T, "agencyId" | "agencyWeek"> {
  const rest = { ...params };
  delete rest.agencyId;
  delete rest.agencyWeek;
  return rest;
}

/** Transfermarkt's player id ("…/profil/spieler/740856" → "740856"), the same whatever the slug or host. */
export function spielerId(url: string | null | undefined): string | null {
  return /transfermarkt\.[a-z.]+\/.*\/spieler\/(\d+)/.exec(url ?? "")?.[1] ?? null;
}

/** Why the week's look cannot be (re)booked, or null: never after the week's edits exist, only free looks. */
export function rebookError(p: { booked: string | null; look: string; weekEdits: number; free: string[] }): string | null {
  if (p.look === p.booked) return null;
  if (p.booked && p.weekEdits > 0) return "As edits desta semana já foram feitas com o estilo reservado";
  if (!p.free.includes(p.look)) return "Este estilo não está livre esta semana";
  return null;
}
