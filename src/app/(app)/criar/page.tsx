import { ensureCareer } from "@/lib/career";
import Link from "next/link";
import { flaggedPhotoIds, getClub, getFixture, getPlayer, listClubs, listEdits, listFixtures, listPhotos, listPlayers, templatePenalties, hiddenLooks, postedLooks } from "@/lib/repo";
import { defaultContent, playerStyle, renderContext } from "@/lib/render-data";
import { fileUrl } from "@/lib/storage";
import { kitMatch } from "@/lib/color";
import { resolveGameVenue } from "@/lib/venues";
import { POST_TYPES, type EditContent, type PhotoMeta, type PostType } from "@/lib/types";
import { Creator } from "./Creator";

export const dynamic = "force-dynamic";

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ player?: string; type?: string; match?: string; fixture?: string; suggestion?: string }> }) {
  const sp = await searchParams;
  let player = sp.player ? getPlayer(sp.player) : null;
  // The welcome post shows his last clubs: fetched from zerozero the first time, then kept on the player.
  if (player && !player.career && player.zerozero_url && player.role !== "coach") {
    await ensureCareer(player.id).catch(() => null);
    player = getPlayer(player.id);
  }

  if (!player) {
    const players = listPlayers();
    return (
      <div className="space-y-4">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">Nova edit: escolhe o jogador</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {players.map((p) => (
            <Link key={p.id} href={`/criar?player=${p.id}`} className="card p-5 hover:border-neutral-400">
              <div className="font-medium">
                {p.first_name} {p.last_name}
              </div>
              <div className="text-xs text-neutral-500">{getClub(p.club_id)?.name}</div>
            </Link>
          ))}
          {players.length === 0 && (
            <p className="text-sm text-neutral-500">
              Primeiro <Link href="/jogadores" className="underline">adiciona um jogador</Link>.
            </p>
          )}
        </div>
      </div>
    );
  }

  const opts = { matchId: sp.match ?? null, fixtureId: sp.fixture ?? null };
  // The matchday ground, looked up now if no sync has found it yet (an edit never goes out without it).
  const fixture = (opts.fixtureId && getFixture(opts.fixtureId)) || listFixtures(player.id)[0];
  await resolveGameVenue(fixture?.match_url, { photos: false }).catch(() => null);
  const contents = Object.fromEntries(POST_TYPES.map((t) => [t.id, defaultContent(player, t.id, opts)])) as Record<PostType, EditContent>;
  // Photos in the current club's kit first (shirt colours vs club colours), newest first otherwise.
  const club = getClub(player.club_id);
  const photos = listPhotos(player.id)
    .filter((p) => p.approved || p.kind !== "player")
    .map((p) => {
      const kit = p.meta ? (JSON.parse(p.meta) as PhotoMeta).kit : undefined;
      return {
        id: p.id,
        url: fileUrl(p.cutout_status === "done" ? p.cutout : p.file)!,
        kind: p.kind,
        status: p.cutout_status,
        auto: p.source === "auto",
        match: club ? kitMatch(kit, club.primary_color, club.secondary_color) : 0.5,
      };
    })
    .sort((a, b) => Number(b.match > 0.72) - Number(a.match > 0.72));

  return (
    <Creator
      playerId={player.id}
      coach={player.role === "coach"}
      playerName={`${player.first_name} ${player.last_name}`}
      initialType={(POST_TYPES.some((t) => t.id === sp.type) ? sp.type : "totw") as PostType}
      contents={contents}
      style={playerStyle(player)}
      prefs={player.prefs}
      suggestionId={sp.suggestion ?? null}
      penalties={Object.fromEntries(POST_TYPES.map((t) => [t.id, templatePenalties(player.id, t.id)])) as Record<PostType, Record<string, number>>}
      flaggedPhotos={[...flaggedPhotoIds()]}
      recentTemplates={listEdits(8, player.id)
        .filter((e) => e.output)
        .map((e) => e.params.templateId)}
      recentPhotos={listEdits(16, player.id)
        .map((e) => e.photo_id)
        .filter((id): id is string => !!id)}
      agencyPicks={listPlayers().reduce<Record<string, number>>((acc, pl) => {
        for (const [k, n] of Object.entries(pl.prefs.picks)) acc[k.split("|")[0]] = (acc[k.split("|")[0]] ?? 0) + n;
        return acc;
      }, {})}
      usStyle={/^(America|Pacific)\//.test(club?.timezone ?? "") && /\/schedule\/?$/.test(club?.source_url ?? "")}
      ctx={renderContext(player.id)}
      photos={photos}
      clubs={listClubs().map((c) => ({ id: c.id, name: c.name }))}
      seed={Math.floor(Math.random() * 1e6)}
      // Looks already posted for this player stay out until recovered in Histórico.
      hiddenLooks={[...hiddenLooks(), ...postedLooks(player.id)]}
    />
  );
}
