import { db } from "@/lib/db";
import * as repo from "@/lib/repo";
import { defaultContent, defaultStyle, renderContext } from "@/lib/render-data";
import { bestPhoto } from "@/lib/series";
import { fetchText } from "@/lib/sources/http";
import { syncPlayer } from "@/lib/sync";
import type { TemplateParams } from "@/lib/types";
import { TEMPLATES } from "@/templates";
import { parseAgencyPage, type RosterPlayer } from "./parse";
import { agencyLooks, rebookError, skipReason, spielerId } from "./rules";
import { getAgency } from "./store";
import { freeLooks, pickFixture, suggestLook, weekStart } from "./week";

/**
 * Client agencies (status teste / cliente): their players, the look of the week and the weekly batch.
 * A player of the agency may already exist (a NEYOD player, a prospect): he is linked as he is, never
 * duplicated and his role never changed. Only players created here get role "agency" (hidden from NEYOD's
 * lists). The agency's logo goes on the batch edits through params.agencyId (render-data).
 */

export const TRIAL_PLAYERS = 3;

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Every player on the agency's Transfermarkt page (all pages), with whether he already has a record / link. */
export async function fetchRoster(agencyId: string): Promise<(RosterPlayer & { playerId: string | null; linked: boolean })[]> {
  const a = getAgency(agencyId);
  if (!a) throw new Error("Agência não existe");
  const first = parseAgencyPage((await fetchText(a.tm_url)).text);
  const all = [...first.players];
  for (let page = 2; page <= first.lastPage; page++) all.push(...parseAgencyPage((await fetchText(`${a.tm_url}/page/${page}`)).text).players);
  const linked = new Set(db().prepare("SELECT player_id FROM agency_players WHERE agency_id = ?").pluck().all(agencyId) as string[]);
  return all.map((p) => {
    const playerId = playerForTm(p.tmUrl) ?? null;
    return { ...p, playerId, linked: !!playerId && linked.has(playerId) };
  });
}

/** Links roster players to the agency (creating hidden records for new ones, synced in turn). */
export async function linkPlayers(agencyId: string, players: { tmUrl: string; name: string }[]): Promise<{ linked: number }> {
  const a = getAgency(agencyId);
  if (!a) throw new Error("Agência não existe");
  const current = db().prepare("SELECT COUNT(*) FROM agency_players WHERE agency_id = ?").pluck().get(agencyId) as number;
  if (a.status === "teste" && current + players.length > TRIAL_PLAYERS) throw new Error(`No teste grátis são no máximo ${TRIAL_PLAYERS} jogadores`);
  const link = db().prepare("INSERT OR IGNORE INTO agency_players (agency_id, player_id) VALUES (?, ?)");
  let linked = 0;
  for (const p of players) {
    let id = playerForTm(p.tmUrl);
    if (!id) {
      const parts = p.name.trim().split(/\s+/);
      id = repo.createPlayer({ first_name: parts[0], last_name: parts.slice(1).join(" "), transfermarkt_url: p.tmUrl, role: "agency" });
      repo.savePlayerPrefs(id, { ...repo.getPlayer(id)!.prefs, hideAgency: true });
      const sync = await syncPlayer(id);
      if (sync.error) console.error("[agências] sync", p.name, sync.error);
    }
    linked += link.run(agencyId, id).changes;
  }
  return { linked };
}

export function unlinkPlayer(agencyId: string, playerId: string) {
  db().prepare("DELETE FROM agency_players WHERE agency_id = ? AND player_id = ?").run(agencyId, playerId);
}

export type AgencyPlayer = { id: string; name: string; club: string; photos: number; nextGame: string | null };

/** The agency's players: name, club (exact), photos with a cutout, next game. */
export function agencyPlayers(agencyId: string): AgencyPlayer[] {
  const ids = db().prepare("SELECT player_id FROM agency_players WHERE agency_id = ?").pluck().all(agencyId) as string[];
  return ids
    .map((id) => repo.getPlayer(id))
    .filter((p) => !!p)
    .map((p) => {
      const f = repo.listFixtures(p.id)[0];
      return {
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(" "),
        // As the edits write it: the name the user chose (short_name, e.g. "SC Vianense SAD"), else zerozero's.
        club: (() => {
          const c = repo.getClub(p.club_id);
          return c ? c.short_name || c.name : "";
        })(),
        photos: db().prepare("SELECT COUNT(*) FROM photos WHERE player_id = ? AND kind = 'player' AND cutout IS NOT NULL").pluck().get(p.id) as number,
        nextGame: f ? `${f.date} · ${f.opponent}` : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Matchday looks an agency can have (not removed by the user, none that prints NEYOD or an editor credit). */
function matchdayLooks(): string[] {
  return agencyLooks(
    TEMPLATES.filter((t) => t.fits.includes("matchday")).map((t) => t.id),
    repo.hiddenLooks(),
  );
}

/** The player record for a Transfermarkt player, matched by Transfermarkt's player id (slug / host may differ). */
function playerForTm(tmUrl: string): string | undefined {
  const sid = spielerId(tmUrl);
  if (!sid) return undefined;
  return db().prepare("SELECT id FROM players WHERE transfermarkt_url LIKE ? ORDER BY role = 'agency'").pluck().get(`%/spieler/${sid}%`) as string | undefined;
}

/** The week's look: the one booked, the free ones (not another agency's, not used by NEYOD) and a suggestion. */
export function weekLook(agencyId: string, week = weekStart(todayISO())): { week: string; booked: string | null; free: string[]; suggested: string | null } {
  const booked = (db().prepare("SELECT look FROM agency_weeks WHERE agency_id = ? AND week = ?").pluck().get(agencyId, week) as string | undefined) ?? null;
  const others = db().prepare("SELECT look FROM agency_weeks WHERE week = ? AND agency_id != ?").pluck().all(week, agencyId) as string[];
  const end = new Date(new Date(`${week}T00:00:00Z`).getTime() + 7 * 864e5).toISOString().slice(0, 10);
  const neyod = (
    db()
      .prepare(
        `SELECT DISTINCT json_extract(e.params, '$.templateId') FROM edits e JOIN players p ON p.id = e.player_id
         WHERE p.role = 'player' AND json_extract(e.params, '$.agencyId') IS NULL
           AND ((e.created_at >= ? AND e.created_at < ?) OR (e.posted_at >= ? AND e.posted_at < ?))`,
      )
      .pluck()
      .all(week, end, week, end) as string[]
  ).filter(Boolean);
  const free = freeLooks(matchdayLooks(), others, neyod);
  return { week, booked, free, suggested: booked ?? suggestLook(free, `${agencyId}|${week}`) };
}

/** Reserves a look for the agency's week (refused when another agency has it that week). */
export function bookLook(agencyId: string, week: string, look: string) {
  const taken = db().prepare("SELECT agency_id FROM agency_weeks WHERE week = ? AND look = ?").pluck().get(week, look) as string | undefined;
  if (taken && taken !== agencyId) throw new Error("Este estilo já é de outra agência esta semana");
  const wl = weekLook(agencyId, week);
  const err = rebookError({ booked: wl.booked, look, weekEdits: weekEdits(agencyId, week).length, free: wl.free });
  if (err) throw new Error(err);
  db().prepare("INSERT INTO agency_weeks (agency_id, week, look) VALUES (?, ?, ?) ON CONFLICT(agency_id, week) DO UPDATE SET look = excluded.look").run(agencyId, week, look);
}

/** This week's edits of the agency (ids). */
export function weekEdits(agencyId: string, week: string): string[] {
  return db()
    .prepare("SELECT id FROM edits WHERE json_extract(params, '$.agencyId') = ? AND json_extract(params, '$.agencyWeek') = ? ORDER BY created_at")
    .pluck()
    .all(agencyId, week) as string[];
}

/** The weekly batch: one matchday edit per linked player, all in the agency's look of the week. */
export function runWeeklyBatch(agencyId: string, today = todayISO()): { created: string[]; skipped: { player: string; reason: string }[] } {
  const a = getAgency(agencyId);
  if (!a) throw new Error("Agência não existe");
  if (!a.logo) throw new Error("Carrega primeiro o logótipo da agência");
  const wl = weekLook(agencyId, weekStart(today));
  const look = wl.booked ?? wl.suggested;
  if (!look) throw new Error("Não há nenhum estilo livre esta semana");
  if (!wl.booked) bookLook(agencyId, wl.week, look);
  const doneFor = new Set(
    db()
      .prepare("SELECT player_id FROM edits WHERE json_extract(params, '$.agencyId') = ? AND json_extract(params, '$.agencyWeek') = ?")
      .pluck()
      .all(agencyId, wl.week) as string[],
  );
  const created: string[] = [];
  const skipped: { player: string; reason: string }[] = [];
  for (const p of agencyPlayers(agencyId)) {
    const player = repo.getPlayer(p.id)!;
    const fixture = pickFixture(repo.listFixtures(p.id), today);
    const params: TemplateParams = { ...defaultStyle(repo.getClub(player.club_id)), templateId: look as TemplateParams["templateId"], agencyId, agencyWeek: wl.week };
    const photoId = bestPhoto({ params }, renderContext(p.id).photos);
    const reason = skipReason({ hasPhoto: !!photoId, fixture, done: doneFor.has(p.id) });
    if (reason) {
      skipped.push({ player: p.name, reason });
      continue;
    }
    const content = defaultContent(player, "matchday", { fixtureId: fixture!.id });
    created.push(repo.saveEdit({ player_id: p.id, post_type: "matchday", photo_id: photoId, params, content }));
  }
  return { created, skipped };
}
