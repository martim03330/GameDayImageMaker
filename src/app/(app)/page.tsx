/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { dismissSuggestionAction, syncAllAction } from "@/app/actions";
import { AutoRefresh } from "@/components/AutoRefresh";
import { SubmitButton } from "@/components/SubmitButton";
import { getClub, getPlayer, listEdits, listFixtures, listPlayers, listSuggestions, pendingPhotos } from "@/lib/repo";
import { fileUrl } from "@/lib/storage";
import { POST_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPE_LABEL = Object.fromEntries(POST_TYPES.map((t) => [t.id, t.label]));

function Avatar({ url, crest, size = 44 }: { url?: string | null; crest?: string | null; size?: number }) {
  const src = url ?? fileUrl(crest);
  return src ? (
    <img src={src} alt="" className="shrink-0 rounded-full bg-neutral-100 object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="shrink-0 rounded-full bg-neutral-200" style={{ width: size, height: size }} />
  );
}

export default function Home() {
  // Live goals first, then everything else by date.
  const players = listPlayers();
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const pending = pendingPhotos();
  const suggestions = listSuggestions("new", 30).sort((a, b) => Number(b.dedupe_key.startsWith("live-")) - Number(a.dedupe_key.startsWith("live-")));
  // The agency's players and the user's own clients (Prospeção "cliente": hidden from listPlayers, looked up here).
  const fixtures = listFixtures()
    .map((f) => ({ f, p: byId[f.player_id] ?? getPlayer(f.player_id) }))
    .filter((x) => x.p)
    .slice(0, 10);
  const edits = listEdits(18);
  const lastSync = players.map((p) => p.last_sync).filter(Boolean).sort().pop();

  return (
    <div className="space-y-14">
      {/* Keeps the page fresh so live goals show up without reloading. */}
      <AutoRefresh active every={60_000} />
      {pending.length > 0 && (
        <div className="card flex items-center justify-between gap-4 border-amber-300 bg-amber-50 p-5">
          <div className="text-sm">
            <b>{pending.length} foto(s) nova(s) encontrada(s) nas notícias.</b> Confirma se servem antes de entrarem nas edits.
          </div>
          <div className="flex gap-2">
            {[...new Set(pending.map((p) => p.player_id))].map((pid) => {
              const pl = pid ? byId[pid] : null;
              return pl ? (
                <Link key={pid} href={`/jogadores/${pid}`} className="btn-ghost py-1.5">
                  {pl.first_name} {pl.last_name}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      )}
      <section>
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Sugestões de edits</h1>
            <p className="muted mt-1.5">
              Geradas automaticamente a partir dos jogos de cada jogador.
              {lastSync && ` Última atualização: ${new Date(lastSync).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}.`}
            </p>
          </div>
          <form action={syncAllAction}>
            <SubmitButton className="btn-ghost" pending="A atualizar…">
              ↻ Atualizar agora
            </SubmitButton>
          </form>
        </div>

        {suggestions.length === 0 ? (
          <div className="card text-sm text-neutral-600">
            Sem sugestões novas. Assim que um jogador marcar, assistir, tiver jogo nos próximos dias ou entrar em boa forma, aparece aqui.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {suggestions.map((s) => {
              const p = byId[s.player_id] ?? getPlayer(s.player_id);
              if (!p) return null;
              const club = getClub(p.club_id);
              const href = `/criar?player=${p.id}&type=${s.post_type}${s.match_id ? `&match=${s.match_id}` : ""}${s.fixture_id ? `&fixture=${s.fixture_id}` : ""}&suggestion=${s.id}`;
              return (
                <div key={s.id} className={`card flex flex-col gap-5 p-6 ${s.dedupe_key.startsWith("live-") ? "border-red-400 ring-2 ring-red-200" : ""}`}>
                  <div className="flex items-start gap-4">
                    <Avatar url={p.photo_url} crest={club?.crest} />
                    <div className="min-w-0 flex-1">
                      {s.dedupe_key.startsWith("live-") ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> AO VIVO
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">{TYPE_LABEL[s.post_type]}</span>
                      )}
                      <div className="mt-2 font-medium leading-snug">{s.title}</div>
                      <div className="muted mt-1">{s.reason}</div>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link href={href} className="btn flex-1">
                      Criar edit
                    </Link>
                    <form action={dismissSuggestionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn-ghost">Ignorar</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {fixtures.length > 0 && (
        <section>
          <h2 className="section-title mb-5">Próximos jogos</h2>
          <div className="card divide-y divide-neutral-100 p-0">
            {fixtures.map(({ f, p }) => {
              if (!p) return null;
              return (
                <div key={f.id} className="flex items-center gap-5 px-7 py-4">
                  <div className="w-28 text-sm font-medium">
                    {new Date(`${f.date}T12:00:00`).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" })}
                    <div className="muted">{f.time}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {p.first_name} {p.last_name}
                    </div>
                    <div className="muted">
                      {f.home ? "vs" : "@"} {f.opponent} · {f.competition}
                    </div>
                  </div>
                  <Link href={`/criar?player=${p.id}&type=matchday&fixture=${f.id}`} className="btn-ghost">
                    Edit de dia de jogo
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="section-title">Jogadores</h2>
          <Link href="/jogadores" className="muted hover:text-neutral-900">
            Gerir jogadores →
          </Link>
        </div>
        {players.length === 0 ? (
          <div className="card text-sm text-neutral-600">
            Ainda não há jogadores. <Link href="/jogadores" className="underline">Adiciona o primeiro</Link>: basta o nome e o link do zerozero ou Transfermarkt.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {players.map((p) => {
              const club = getClub(p.club_id);
              return (
                <Link key={p.id} href={`/jogadores/${p.id}`} className="card flex items-center gap-3.5 p-5 hover:border-neutral-400">
                  <Avatar url={p.photo_url} crest={club?.crest} size={40} />
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {p.first_name} {p.last_name}
                    </div>
                    <div className="truncate text-xs text-neutral-500">{club?.name ?? "Sem clube"}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-5">Edits recentes</h2>
        {edits.length === 0 ? (
          <p className="muted">Ainda não criaste nenhuma edit.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
            {edits.map((e) => (
              <Link key={e.id} href={`/edits/${e.id}`} className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200">
                  {e.output ? (
                    <img src={`${fileUrl(e.output)}?v=${encodeURIComponent(e.created_at)}`} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-500">Por exportar</div>
                  )}
                </div>
                <div className="mt-2 text-sm font-medium group-hover:underline">
                  {byId[e.player_id]?.first_name} {byId[e.player_id]?.last_name}
                </div>
                <div className="text-xs text-neutral-500">{TYPE_LABEL[e.post_type]}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
