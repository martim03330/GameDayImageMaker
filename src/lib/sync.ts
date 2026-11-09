import { ensureCareer } from "./career";
import { collegeGender, fetchBoxScore, fetchCollegeSchedule, isCollegeSource } from "./college";
import { collegeSportOf, sameName } from "./sources/college";
import { instantIn, PORTUGAL_TZ, wallClock } from "./timezone";
import { fetchZerozeroUpcoming } from "./sources/zerozero";
import { crestColors, localCrest, storeRemoteImage } from "./crest";
import { huntPhotos } from "./photo-hunt";
import * as repo from "./repo";
import { clearSourceCache, fetchCity, fetchCityPhotos, fetchImage, fetchZerozeroLive, fetchMatches, fetchProfile, fetchTransfermarktClubColors, fetchUpcoming, fetchZerozeroClubInfo } from "./sources";
import type { ExternalMatch, ExternalProfile } from "./sources/types";
import type { Club, Match, Player } from "./types";
import { backdropScore, resolveGameVenue } from "./venues";

const log = (...a: unknown[]) => console.log("[sync]", ...a);

/** Kit colours: Transfermarkt's official "club colours" first, crest colours as fallback. */
async function clubColors(tmClubUrl: string | undefined, crest: Buffer | null): Promise<[string, string]> {
  if (tmClubUrl) {
    const official = await fetchTransfermarktClubColors(tmClubUrl).catch(() => []);
    if (official.length) {
      // Put the most colourful one first so backgrounds are not plain white.
      const sorted = [...official].sort((a, b) => Number(isNeutral(a)) - Number(isNeutral(b)));
      return [sorted[0], sorted[1] ?? "#ffffff"];
    }
  }
  return crest ? crestColors(crest) : ["#0b3d91", "#ffffff"];
}

function isNeutral(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return Math.max(r, g, b) - Math.min(r, g, b) < 25;
}

/** Finds or creates the club, downloading its crest and taking its colours. */
async function ensureClub(p: ExternalProfile, league: string, tmClubUrl?: string): Promise<string | null> {
  if (!p.clubName) return null;
  const existing = repo.findClub(p.clubName, p.clubUrl);
  if (existing) {
    if (p.clubUrl && !existing.crest && p.clubCrestUrl) {
      const buf = await fetchImage(p.clubCrestUrl);
      const [primary, secondary] = await clubColors(tmClubUrl, buf);
      repo.saveClub({ ...existing, crest: await storeRemoteImage(buf, "crests"), primary_color: primary, secondary_color: secondary });
    }
    if (league && !existing.league) repo.saveClub({ ...existing, league });
    return existing.id;
  }
  let crest: string | null = null;
  let buf: Buffer | null = null;
  if (p.clubCrestUrl) {
    try {
      buf = await fetchImage(p.clubCrestUrl);
      crest = await storeRemoteImage(buf, "crests");
    } catch (e) {
      log("crest download failed", e);
    }
  }
  const colors = await clubColors(tmClubUrl, buf);
  const id = repo.saveClub({ name: p.clubName, league, crest, primary_color: colors[0], secondary_color: colors[1] });
  if (p.clubUrl) repo.setClubSource(id, p.clubUrl);
  return id;
}

const opp = (m: { opponent: string }) => m.opponent;

/** Suggestions triggered by a newly seen match. */
function suggestForMatch(player: Player, m: Match) {
  // College box scores often give no minutes: a goal or an assist proves he played.
  if (m.minutes <= 0 && m.goals + m.assists === 0) return;
  const vs = `vs ${opp(m)}`;
  if (m.goals >= 1) {
    const word = m.goals >= 3 ? "Hat-trick" : m.goals === 2 ? "Bis" : "Golo";
    repo.addSuggestion({
      player_id: player.id,
      post_type: "goal",
      title: `${word} de ${player.first_name} ${vs}`,
      reason: `${m.goals} golo(s)${m.assists ? ` e ${m.assists} assistência(s)` : ""} · ${m.date}`,
      match_id: m.id,
      fixture_id: null,
      dedupe_key: `goal:${m.external_id ?? m.id}`,
    });
  }
  const contributions = m.goals + m.assists;
  const won = m.goals_for > m.goals_against;
  if (m.assists >= 1 || contributions >= 2 || m.motm) {
    repo.addSuggestion({
      player_id: player.id,
      post_type: "result",
      title: `${won ? "Vitória" : m.goals_for === m.goals_against ? "Empate" : "Jogo"} ${m.goals_for}-${m.goals_against} ${vs}`,
      reason: `${m.goals} G · ${m.assists} A · ${m.minutes}' — boa exibição para destacar`,
      match_id: m.id,
      fixture_id: null,
      dedupe_key: `result:${m.external_id ?? m.id}`,
    });
  }
}

/** Streaks and monthly awards, computed over the whole match list. */
function suggestForForm(player: Player) {
  const matches = repo.listMatches(player.id, 30).filter((m) => m.minutes > 0);
  const last3 = matches.slice(0, 3);
  const ga = last3.reduce((a, m) => a + m.goals + m.assists, 0);
  if (last3.length === 3 && ga >= 3) {
    repo.addSuggestion({
      player_id: player.id,
      post_type: "stats",
      title: `${player.first_name} em grande forma: ${ga} participações em golos nos últimos 3 jogos`,
      reason: last3.map((m) => `${m.goals}G ${m.assists}A vs ${m.opponent}`).join(" · "),
      match_id: last3[0].id,
      fixture_id: null,
      dedupe_key: `form:${last3.map((m) => m.external_id ?? m.id).join(",")}`,
    });
  }

  const now = new Date();
  if (now.getDate() <= 7) {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const key = prev.toISOString().slice(0, 7);
    const month = matches.filter((m) => m.date.startsWith(key));
    const total = month.reduce((a, m) => a + m.goals + m.assists, 0);
    if (month.length >= 2 && total >= 3) {
      repo.addSuggestion({
        player_id: player.id,
        post_type: "potm",
        title: `Resumo do mês de ${player.first_name}: ${total} participações em golos`,
        reason: `${month.length} jogos em ${key}`,
        match_id: null,
        fixture_id: null,
        dedupe_key: `potm:${key}`,
      });
    }
  }
}

function toMatchRow(player: Player, m: ExternalMatch, prev: Match | null) {
  // Club set by hand and the source sees the game from the other side (zerozero lists him at the
  // opponent): flip it so it reads from his locked club's point of view.
  const lockedName = player.club_locked ? repo.getClub(player.club_id)?.name : undefined;
  const fold = (x: string | undefined) => (x ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (lockedName && fold(m.opponent) === fold(lockedName) && fold(m.team) !== fold(lockedName)) {
    m = { ...m, opponent: m.team ?? "", team: lockedName, home: !m.home, goalsFor: m.goalsAgainst, goalsAgainst: m.goalsFor, opponentCrestUrl: prev?.opponent_crest ?? m.opponentCrestUrl };
  }
  return {
    id: prev?.id,
    player_id: player.id,
    date: m.date,
    competition: m.competition,
    matchday: m.matchday.replace(/^J/i, ""),
    opponent: m.opponent,
    home: m.home ? 1 : 0,
    goals_for: m.goalsFor,
    goals_against: m.goalsAgainst,
    minutes: m.minutes,
    goals: m.goals,
    assists: m.assists,
    // Fields the sources don't provide are kept from manual edits.
    rating: prev?.rating ?? null,
    totw: prev?.totw ?? 0,
    motm: prev?.motm ?? 0,
    source: m.source,
    external_id: `${m.source}:${m.externalId}`,
    team: m.team,
    yellow: m.yellow,
    red: m.red,
    match_url: m.matchUrl ?? null,
    photos_url: m.photosUrl ?? null,
    opponent_crest: m.opponentCrestUrl ?? null,
  };
}

async function download(urls: string[], folder: string): Promise<string[]> {
  const stored: string[] = [];
  for (const u of urls) {
    try {
      stored.push(await storeRemoteImage(await fetchImage(u), folder, "jpeg"));
    } catch (e) {
      log("photo failed", u, e instanceof Error ? e.message : e);
    }
  }
  return stored;
}

/** Up to 8 skyline / landmark photos of the club's city and a few of its stadium (Wikimedia Commons), once. */
async function cityPhotos(clubId: string) {
  const club = repo.getClub(clubId);
  if (!club?.city) return;
  const current: string[] = club.city_images ? JSON.parse(club.city_images) : [];
  if (current.length < 6) {
    const stored = await download(await fetchCityPhotos(club.city).catch(() => []), "cities");
    const all = [...new Set([...current, ...stored])].slice(0, 10);
    if (all.length) repo.setClubDetails(clubId, { city_images: JSON.stringify(all), city_image: all[0] });
  }
  if ((!club.stadium_images || club.stadium_images === "[]") && club.stadium) {
    // "Estádio Dr. José de Matos Viana do Castelo" → search the distinctive part of the name.
    const name = club.stadium.replace(/^Est[áa]dio\s+/i, "").replace(new RegExp(`\\s*${club.city}$`, "i"), "").trim();
    const key = name.split(/\s+/).sort((a, b) => b.length - a.length)[0] ?? name;
    const urls = await fetchCityPhotos(name, 8, [`${name} stadium`, `Estádio ${name}`, `${name} ${club.city}`], key).catch(() => []);
    // Only views from inside the ground: facades and car parks make poor backdrops.
    const good: string[] = [];
    for (const u of urls) {
      const buf = await fetchImage(u).catch(() => null);
      if (buf && (await backdropScore(buf).catch(() => null)) != null) good.push(u);
    }
    const stored = await download(good.slice(0, 4), "stadiums");
    repo.setClubDetails(clubId, { stadium_images: JSON.stringify(stored) });
  }
}

/** City, founding year, stadium and a city photo for the club (once). */
async function enrichClub(clubId: string, zzClubUrl: string | undefined) {
  await enrichClubInfo(clubId, zzClubUrl);
  await cityPhotos(clubId);
}

async function enrichClubInfo(clubId: string, zzClubUrl: string | undefined) {
  const club = repo.getClub(clubId);
  if (!club || club.city || !zzClubUrl?.includes("zerozero")) return;
  const info = await fetchZerozeroClubInfo(zzClubUrl).catch(() => null);
  if (!info?.city) return;
  const city = await fetchCity(info.city).catch(() => null);
  let cityImage: string | null = null;
  if (city?.imageUrl) {
    try {
      cityImage = await storeRemoteImage(await fetchImage(city.imageUrl), "cities", "jpeg");
    } catch (e) {
      log("city image failed", e);
    }
  }
  repo.setClubDetails(clubId, {
    city: info.city,
    founded: info.founded ?? "",
    stadium: info.stadium ?? "",
    city_image: cityImage,
    city_lat: city?.lat ?? null,
    city_lon: city?.lon ?? null,
  });
}

export type SyncResult = { newMatches: number; fixtures: number; error?: string };

/**
 * Next games, the grounds of the last and next few weeks' games, and a matchday suggestion when one is
 * close. Shared by full syncs and by people with no link of their own (coaches), who follow their club.
 */
async function syncFixtures(player: Player, source: ReturnType<typeof fetchUpcoming>) {
  const upcoming = await source.catch(() => []);
  // Opponents' crests stored as our own files (remote hotlinks break), one download per crest ever.
  for (const f of upcoming) if (f.opponentCrestUrl) f.opponentCrestUrl = (await localCrest(f.opponentCrestUrl)) ?? undefined;
  const fixtures = repo.replaceFixtures(
    player.id,
    upcoming.map((f) => ({
      external_id: `${f.source}:${f.externalId}`,
      date: f.date,
      time: f.time ?? "",
      competition: f.competition,
      matchday: (f.matchday ?? "").replace(/^J/i, ""),
      team: f.team,
      opponent: f.opponent,
      home: f.home ? 1 : 0,
      match_url: f.matchUrl ?? null,
      opponent_crest: f.opponentCrestUrl ?? null,
      time_tz: f.timeZone ?? "",
      venue: f.venue ?? "",
    })),
  );
  // Grounds of the last and next few weeks' games, for the real stadium behind the player.
  const window = (d: string) => Math.abs(Date.now() - new Date(d).getTime()) < 30 * 86400_000;
  for (const url of [...repo.listMatches(player.id, 20).filter((m) => window(m.date)).map((m) => m.match_url), ...fixtures.filter((f) => window(f.date)).map((f) => f.match_url)]) {
    await resolveGameVenue(url).catch((e) => log("estádio", e instanceof Error ? e.message : e));
  }

  const soon = fixtures.find((f) => new Date(f.date).getTime() - Date.now() < 2 * 86400_000);
  if (soon) {
    repo.addSuggestion({
      player_id: player.id,
      post_type: "matchday",
      title: `${player.first_name} joga ${soon.home ? "em casa" : "fora"} vs ${soon.opponent}`,
      reason: `${soon.date}${soon.time ? ` às ${soon.time}` : ""} · ${soon.competition}`,
      match_id: null,
      fixture_id: soon.id,
      dedupe_key: `matchday:${soon.external_id}`,
    });
  }
  return fixtures;
}

const gcol = globalThis as unknown as { collegeChecked?: Set<string> };
/** Box scores already read where he did not appear: not fetched again (until the server restarts). */
const collegeChecked = (gcol.collegeChecked ??= new Set<string>());
const sameTeam = (a: string, b: string) => {
  const f = (x: string) => x.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]/g, "");
  return !!f(a) && !!f(b) && (f(a).includes(f(b)) || f(b).includes(f(a)));
};

/**
 * A player at a US college: his club's source is the school's schedule page (lib/college.ts). Next games
 * come from it with the kick-off in the school's own zone (fixtures.time_tz); after each game, the result and
 * his goals / assists come from the box score, matched by name. Same suggestions as zerozero players:
 * matchday 2 days before, goal / result after. Exhibitions are left out.
 */
/** A schedule row whose "opponent" is really an event or a placeholder (bracket not drawn yet). */
export function tbdOpponent(name: string | undefined): boolean {
  const n = (name ?? "").trim();
  return !n || /\b(championship|tournament|semifinal|semi-final|quarterfinal|quarter-final|first round|second round|final four|playoffs?|tba|tbd)\b/i.test(n) || /^(final|finals)$/i.test(n);
}

async function syncCollegePlayer(player: Player, club: Club): Promise<SyncResult> {
  try {
    const src = club.source_url!;
    const tz = club.timezone || "America/New_York";
    // Soccer or basketball, from the schedule page's path (basketball box scores give no goals / assists).
    const sport = collegeSportOf(src);
    const { games, zone } = await fetchCollegeSchedule(src, tz, collegeGender(src));
    if (!games.length) throw new Error("Não encontrei o calendário no site da universidade");
    // The school's own home games showed its real zone (split states): keep it on the club.
    if (zone !== club.timezone) repo.setClubTimezone(club.id, zone);
    const today = wallClock(new Date(), tz).date;
    const host = new URL(src).host.replace(/^www\./, "");
    const competition = (g: (typeof games)[number]) => g.competition || club.league || "NCAA";
    const fixtures = await syncFixtures(
      player,
      Promise.resolve(
        games
          .filter((g) => !g.result && !g.boxscoreUrl && !g.exhibition && g.date >= today)
          .map((g) => ({
            source: "college" as const,
            externalId: `${host}:${g.id}`,
            date: g.date,
            time: g.time,
            // A tournament slot whose opponent isn't drawn yet lists the event as the "opponent"
            // ("Southwestern Athletic Conference Championship", "Final"): the event is the competition then,
            // and the opponent is "TBD" — never shown as if it were a team.
            competition: tbdOpponent(g.opponent) ? g.opponent.replace(/^final$/i, competition(g)) : competition(g),
            team: club.name,
            opponent: tbdOpponent(g.opponent) ? "TBD" : g.opponent,
            home: g.home,
            matchUrl: src,
            opponentCrestUrl: g.opponentLogo || undefined,
            timeZone: tz,
            venue: g.venue,
          })),
      ),
    );

    const firstSync = !player.last_sync;
    const name = `${player.first_name} ${player.last_name}`;
    let newMatches = 0;
    for (const g of games) {
      if (g.exhibition || !g.boxscoreUrl || g.date > today) continue;
      const extId = `${host}:${g.id}`;
      const prev = repo.findMatchByExternal(player.id, `college:${extId}`);
      // Read once; the last 3 days again (box scores get corrected after the game).
      const recent = Date.now() - Date.parse(`${g.date}T12:00:00Z`) < 3 * 864e5;
      if ((prev || collegeChecked.has(`${player.id}:${extId}`)) && !recent) continue;
      const box = await fetchBoxScore(g.boxscoreUrl, sport);
      if (!box) continue;
      let result = g.result;
      // WMT lists no score: the box score's score table gives it (ours = the row that is not the opponent).
      if (!result && box.totals.length >= 2) {
        const them = box.totals.find((t) => sameTeam(t.team, g.opponent));
        const us = box.totals.find((t) => t !== them);
        if (them && us) result = { us: us.total, them: them.total };
      }
      const line = box.players.find((p) => sameName(p.name, name));
      const goals = sport === "basketball" ? 0 : line ? line.goals : box.scorers.filter((x) => sameName(x.name, name)).length;
      const assists = sport === "basketball" ? 0 : line ? line.assists : box.scorers.filter((x) => x.assist && sameName(x.assist, name)).length;
      // Only games he is seen in (in the player table, or scoring / assisting when the page has none).
      if (!result || !(line || goals + assists > 0)) {
        collegeChecked.add(`${player.id}:${extId}`);
        continue;
      }
      const m: ExternalMatch = {
        source: "college",
        externalId: extId,
        date: g.date,
        competition: competition(g),
        matchday: "",
        team: club.name,
        opponent: g.opponent,
        home: g.home,
        goalsFor: result.us,
        goalsAgainst: result.them,
        minutes: line?.minutes ?? 0,
        goals,
        assists,
        yellow: 0,
        red: 0,
        matchUrl: g.boxscoreUrl,
        opponentCrestUrl: g.opponentLogo || undefined,
        participation: "played",
        time: g.time,
      };
      if (m.opponentCrestUrl) m.opponentCrestUrl = (await localCrest(m.opponentCrestUrl)) ?? undefined;
      const id = repo.saveMatch(toMatchRow(player, m, prev));
      if (!prev) {
        newMatches++;
        if (!firstSync || recent) suggestForMatch(player, repo.getMatch(id)!);
      }
    }
    suggestForForm(player);
    repo.updatePlayer(player.id, { last_sync: new Date().toISOString(), sync_error: null });
    log(`${player.first_name} ${player.last_name} (college): ${newMatches} novos jogos, ${fixtures.length} próximos`);
    return { newMatches, fixtures: fixtures.length };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    repo.updatePlayer(player.id, { sync_error: error, last_sync: new Date().toISOString() });
    log("erro", player.first_name, error);
    return { newMatches: 0, fixtures: 0, error };
  }
}

const gsync = globalThis as unknown as { syncing?: Map<string, Promise<SyncResult>> };
const syncing = (gsync.syncing ??= new Map());

/** One sync per player at a time: a second call (scheduler, page button, new client) joins the running one. */
export function syncPlayer(playerId: string): Promise<SyncResult> {
  const running = syncing.get(playerId);
  if (running) return running;
  const run = syncPlayerNow(playerId).finally(() => syncing.delete(playerId));
  syncing.set(playerId, run);
  return run;
}

async function syncPlayerNow(playerId: string): Promise<SyncResult> {
  const player = repo.getPlayer(playerId);
  if (!player) return { newMatches: 0, fixtures: 0, error: "Jogador não existe" };
  // A college player (no zerozero / Transfermarkt page): his school's schedule and box scores.
  const ownClub = repo.getClub(player.club_id);
  if (!player.zerozero_url && !player.transfermarkt_url && ownClub && isCollegeSource(ownClub.source_url)) return syncCollegePlayer(player, ownClub);
  const main = player.zerozero_url || player.transfermarkt_url;
  if (!main) {
    // No link of his own (usually a coach): his club's zerozero page still gives the games and grounds.
    const club = repo.getClub(player.club_id);
    if (!club?.source_url?.includes("zerozero")) return { newMatches: 0, fixtures: 0, error: "Sem link do zerozero ou Transfermarkt" };
    const fixtures = await syncFixtures(player, fetchZerozeroUpcoming(club.source_url, { url: club.source_url, name: club.name }));
    repo.updatePlayer(player.id, { last_sync: new Date().toISOString(), sync_error: null });
    log(`${player.first_name} ${player.last_name} (pelo clube): ${fixtures.length} próximos`);
    return { newMatches: 0, fixtures: fixtures.length };
  }

  try {
    // Profile: zerozero for personal data, Transfermarkt for value/contract/agent.
    const zz = player.zerozero_url ? await fetchProfile(player.zerozero_url).catch(() => null) : null;
    const tm = player.transfermarkt_url ? await fetchProfile(player.transfermarkt_url).catch(() => null) : null;
    const defined = (o: object | null) => Object.fromEntries(Object.entries(o ?? {}).filter(([, v]) => v != null && v !== ""));
    // zerozero wins for personal data; Transfermarkt only fills the gaps (and owns contract / agent).
    const prof = { ...defined(tm), ...defined(zz), source: (zz ?? tm)?.source ?? "zerozero", url: main } as ExternalProfile;
    if (tm?.contractUntil) prof.contractUntil = tm.contractUntil;
    if (tm?.agent) prof.agent = tm.agent;

    // Only games actually played (Transfermarkt also lists unused-sub / not-in-squad games).
    const external = (await fetchMatches(main)).filter((m) => m.minutes > 0 || m.participation === "played");
    const league = external.find((m) => m.competition)?.competition ?? "";
    const firstSync = !player.last_sync;
    const locked = !!player.club_locked && !!player.club_id;
    const clubId = locked ? player.club_id : await ensureClub(prof, league, tm?.clubUrl);
    if (clubId) await enrichClub(clubId, zz?.clubUrl);

    if (clubId && player.club_id && clubId !== player.club_id && !firstSync) {
      repo.addSuggestion({
        player_id: player.id,
        post_type: "transfer",
        title: `${player.first_name} mudou para ${prof.clubName}`,
        reason: "Detetado na sincronização",
        match_id: null,
        fixture_id: null,
        dedupe_key: `transfer:${clubId}`,
      });
    }

    repo.updatePlayer(player.id, {
      full_name: prof.fullName ?? player.full_name,
      birth_date: prof.birthDate ?? player.birth_date,
      nationality: prof.nationality ?? player.nationality,
      position: prof.position ?? player.position,
      foot: prof.foot ?? player.foot,
      height_cm: prof.heightCm ?? player.height_cm,
      number: prof.shirtNumber ?? player.number,
      market_value: prof.marketValue ?? player.market_value,
      contract_until: prof.contractUntil ?? player.contract_until,
      agent: prof.agent ?? player.agent,
      photo_url: prof.photoUrl ?? player.photo_url,
      club_id: clubId ?? player.club_id,
    });

    let newMatches = 0;
    for (const m of external) {
      const extId = `${m.source}:${m.externalId}`;
      const prev = repo.findMatchByExternal(player.id, extId);
      if (m.opponentCrestUrl) m.opponentCrestUrl = (await localCrest(m.opponentCrestUrl)) ?? undefined;
      const id = repo.saveMatch(toMatchRow(player, m, prev));
      if (!prev) {
        newMatches++;
        // On the first sync only the most recent games are worth suggesting.
        const recent = Date.now() - new Date(m.date).getTime() < 4 * 86400_000;
        if (!firstSync || recent) suggestForMatch(player, repo.getMatch(id)!);
      }
    }
    suggestForForm(player);

    const lockedClub = locked ? repo.getClub(player.club_id) : null;
    const fixtures = await syncFixtures(
      player,
      lockedClub?.source_url?.includes("zerozero")
        ? fetchZerozeroUpcoming(lockedClub.source_url, { url: lockedClub.source_url, name: lockedClub.name })
        : fetchUpcoming(main),
    );

    // His last clubs (welcome post), only while still empty — a list fixed by hand is never overwritten.
    if (!player.career && player.role !== "coach") await ensureCareer(player.id).catch(() => null);
    repo.updatePlayer(player.id, { last_sync: new Date().toISOString(), sync_error: null });
    log(`${player.first_name} ${player.last_name}: ${newMatches} novos jogos, ${fixtures.length} próximos`);
    return { newMatches, fixtures: fixtures.length };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    repo.updatePlayer(player.id, { sync_error: error, last_sync: new Date().toISOString() });
    log("erro", player.first_name, error);
    return { newMatches: 0, fixtures: 0, error };
  }
}

/** The player's game currently being played or just ended (kick-off -15 min → +3h), if any. */
function liveFixture(playerId: string, now = new Date()) {
  return repo.listFixtures(playerId, true).find((f) => {
    // Kick-off in its own zone (college games are in the school's; zerozero's are Portugal's).
    const start = instantIn(f.date, f.time || "15:00", f.time_tz || PORTUGAL_TZ) ?? new Date(`${f.date}T${f.time || "15:00"}:00`);
    const ms = now.getTime() - start.getTime();
    return ms >= -15 * 60_000 && ms <= 3 * 3600_000;
  });
}
const inMatchWindow = (playerId: string) => !!liveFixture(playerId);

const zzPlayerId = (url: string | null) => url?.match(/zerozero\.[a-z.]+\/jogador\/[^/]+\/(\d+)/)?.[1];

/** During a game: read the live score and raise an instant "GOLO" suggestion for each new goal. */
export async function checkLive(playerId: string): Promise<void> {
  const player = repo.getPlayer(playerId);
  const f = liveFixture(playerId);
  const zzId = zzPlayerId(player?.zerozero_url ?? null);
  if (!player || !f?.match_url || !zzId || !f.match_url.includes("zerozero")) return;
  clearSourceCache();
  const live = await fetchZerozeroLive(f.match_url, zzId).catch(() => null);
  if (!live) return;
  repo.setFixtureLive(f.id, live.homeGoals, live.awayGoals, live.goals.length);
  live.goals.forEach((minute, i) => {
    const n = i + 1;
    const created = repo.addSuggestion({
      player_id: player.id,
      post_type: "goal",
      title: `⚽ AO VIVO: ${n >= 3 ? "Hat-trick" : n === 2 ? "Bis" : "Golo"} de ${player.first_name} (${minute}) vs ${f.opponent}`,
      reason: `Resultado neste momento: ${live.homeGoals}-${live.awayGoals} · ${f.competition}`,
      match_id: null,
      fixture_id: f.id,
      dedupe_key: `live-goal:${f.external_id}:${n}`,
    });
    if (created) log(`golo ao vivo: ${player.first_name} ${minute}`);
  });
}

const REGULAR_EVERY = 3 * 3600_000;
const MATCH_EVERY = 10 * 60_000;

/** Syncs whoever is due: every 10 min around their games, otherwise every 3 hours. Live scores every call. */
export async function syncDue(): Promise<void> {
  const now = Date.now();
  for (const p of repo.listSyncPlayers()) {
    if (!p.zerozero_url && !p.transfermarkt_url && !p.club_id) continue;
    if (inMatchWindow(p.id)) await checkLive(p.id);
    const age = p.last_sync ? now - new Date(p.last_sync).getTime() : Infinity;
    if (age >= (inMatchWindow(p.id) ? MATCH_EVERY : REGULAR_EVERY)) {
      if (inMatchWindow(p.id)) clearSourceCache();
      await syncPlayer(p.id);
    }
    const huntAge = p.last_photo_hunt ? now - new Date(p.last_photo_hunt).getTime() : Infinity;
    if (huntAge >= 24 * 3600_000 && !inMatchWindow(p.id)) {
      await huntPhotos(p.id).catch((e) => log("fotos", e));
    }
  }
}

let running: Promise<void> | null = null;

/** Syncs every player with a source link, one at a time. */
export function syncAll(): Promise<void> {
  running ??= (async () => {
    for (const p of repo.listSyncPlayers()) {
      if (p.zerozero_url || p.transfermarkt_url || p.club_id) await syncPlayer(p.id);
    }
  })().finally(() => (running = null));
  return running;
}
