// Real stadium photos for games already in the database (new games get them during sync):
//  1. finds the ground of every game of the last 60 days and the upcoming ones, with its photos;
//  2. drops club stadium photos that aren't views from inside the ground (facades, car parks);
//  3. links edits made before this existed to their game, by opponent and score.
// npx tsx scripts/photos/venues.mts
import fs from "node:fs";
import { db } from "../../src/lib/db";
import { listClubs, listFixtures, listMatches, listPlayers, setClubDetails } from "../../src/lib/repo";
import { zzGameId } from "../../src/lib/sources/zerozero";
import { absPath } from "../../src/lib/storage";
import { backdropScore, resolveGameVenue, venuesForGames } from "../../src/lib/venues";

const recent = (d: string) => Date.now() - new Date(d).getTime() < 60 * 86400_000;

for (const p of listPlayers()) {
  const urls = [...listMatches(p.id, 30).filter((m) => recent(m.date)).map((m) => m.match_url), ...listFixtures(p.id).slice(0, 6).map((f) => f.match_url)];
  for (const u of urls) await resolveGameVenue(u).catch((e) => console.log("  falhou", u, e instanceof Error ? e.message : e));
}
for (const v of db().prepare("SELECT name, images FROM venues ORDER BY name").all() as { name: string; images: string }[]) {
  console.log(`${v.name}: ${JSON.parse(v.images).length} foto(s)`);
}

for (const c of listClubs()) {
  const files: string[] = c.stadium_images ? JSON.parse(c.stadium_images) : [];
  const keep: string[] = [];
  for (const f of files) {
    if (fs.existsSync(absPath(f)) && (await backdropScore(fs.readFileSync(absPath(f)))) != null) keep.push(f);
  }
  if (keep.length !== files.length) {
    setClubDetails(c.id, { stadium_images: JSON.stringify(keep) });
    console.log(`${c.name}: fotos do estádio ${files.length} → ${keep.length}`);
  }
}

let linked = 0;
for (const e of db().prepare("SELECT id, player_id, content FROM edits").all() as { id: string; player_id: string; content: string }[]) {
  const c = JSON.parse(e.content);
  if (c.gameId || !c.homeTeam || !c.awayTeam) continue;
  const teams = [c.homeTeam, c.awayTeam].map((t: string) => t.toLowerCase());
  const game =
    listMatches(e.player_id, 100).find(
      (m) =>
        teams.includes(m.opponent.toLowerCase()) &&
        String(m.home ? m.goals_for : m.goals_against) === String(c.homeGoals) &&
        String(m.home ? m.goals_against : m.goals_for) === String(c.awayGoals),
    )?.match_url ?? listFixtures(e.player_id, true).find((f) => teams.includes(f.opponent.toLowerCase()))?.match_url;
  const gameId = zzGameId(game);
  if (!gameId) continue;
  await resolveGameVenue(game).catch(() => {});
  c.gameId = gameId;
  db().prepare("UPDATE edits SET content = ? WHERE id = ?").run(JSON.stringify(c), e.id);
  linked++;
  const v = venuesForGames([gameId])[gameId];
  console.log(`edit ${e.id} → ${v?.name ?? "?"} (${v?.images.length ?? 0} foto(s))`);
}
console.log(`${linked} edits ligadas ao seu jogo`);
