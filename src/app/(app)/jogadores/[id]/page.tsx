/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  approvePhotoAction,
  deleteMatchAction,
  deletePhotoAction,
  deletePlayerAction,
  enhancePhotoAction,
  retryCutoutAction,
  cityPhotosAction,
  saveClubAction,
  saveMatchAction,
  savePlayerAction,
  savePrefsAction,
  syncPlayerAction,
  uploadReferenceAction,
} from "@/app/actions";
import { AutoRefresh } from "@/components/AutoRefresh";
import { BackLink } from "@/components/BackLink";
import { ClipUpload } from "@/components/ClipUpload";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { PhotoUploader } from "@/components/PhotoUploader";
import { SubmitButton } from "@/components/SubmitButton";
import { aiEnabled } from "@/lib/ai";
import { getClub, getPlayer, listEdits, listFixtures, listMatches, listPhotos } from "@/lib/repo";
import { roundLabel } from "@/lib/render-data";
import { NATION_ZONES, playerRefTz, refTag } from "@/lib/timezone";
import { fileUrl } from "@/lib/storage";
import { POSE_LABELS, POST_TYPES } from "@/lib/types";
import { TEMPLATES } from "@/templates";
import { ResetLearning } from "./ResetLearning";

export const dynamic = "force-dynamic";

const CHECKER = "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%) 50% / 16px 16px";

function age(birth: string) {
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--;
  return `${a} anos`;
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const player = getPlayer((await params).id);
  if (!player) notFound();
  const club = getClub(player.club_id);
  const photos = listPhotos(player.id, "player");
  const references = listPhotos(player.id, "reference");
  const matches = listMatches(player.id);
  const fixtures = listFixtures(player.id).slice(0, 5);
  const edits = listEdits(12, player.id);
  const today = new Date().toISOString().slice(0, 10);
  const season = matches.filter((m) => m.minutes > 0);
  const totals = {
    jogos: season.length,
    golos: season.reduce((a, m) => a + m.goals, 0),
    assist: season.reduce((a, m) => a + m.assists, 0),
    minutos: season.reduce((a, m) => a + m.minutes, 0),
  };
  const learned = Object.entries(
    Object.entries(player.prefs.picks).reduce<Record<string, number>>((acc, [k, n]) => {
      const id = k.split("|")[0];
      acc[id] = (acc[id] ?? 0) + n;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const label = (id: string) => TEMPLATES.find((t) => t.id === id)?.label ?? id;
  const avatar = player.photo_url ?? fileUrl(club?.crest);

  return (
    <div className="space-y-10">
      <AutoRefresh active={photos.some((p) => p.cutout_status === "pending")} />
      {/* Clients from Prospeção are not agency players: their page leads back to Prospeção. */}
      {player.role === "prospect" ? <BackLink fallback="/prospecao" label="Prospeção · clientes" /> : <BackLink fallback="/jogadores" label="Jogadores" />}

      <div className="flex flex-wrap items-center gap-6">
        {avatar ? <img src={avatar} alt="" className="h-24 w-24 rounded-2xl bg-white object-cover shadow-sm" /> : <div className="h-24 w-24 rounded-2xl bg-neutral-200" />}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            {player.first_name} {player.last_name}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-neutral-600">
            {club?.crest && <img src={fileUrl(club.crest)!} alt="" className="h-6 w-6 object-contain" />}
            {[club?.name, club?.league, player.position].filter(Boolean).join(" · ") || "Sem clube"}
          </div>
          <div className="muted mt-1">
            {player.sync_error ? (
              <span className="text-red-600">Erro na última atualização: {player.sync_error}</span>
            ) : player.last_sync ? (
              `Dados atualizados em ${new Date(player.last_sync).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}`
            ) : (
              "Ainda não atualizado"
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <form action={syncPlayerAction}>
            <input type="hidden" name="id" value={player.id} />
            <SubmitButton className="btn-ghost" pending="A atualizar…">
              ↻ Atualizar dados
            </SubmitButton>
          </form>
          <Link href={`/criar?player=${player.id}`} className="btn">
            Criar edit
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="section-title mb-6">Perfil</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            <Fact label="Nome completo" value={player.full_name} />
            <Fact label="Idade" value={player.birth_date && `${age(player.birth_date)} (${player.birth_date})`} />
            <Fact label="Nacionalidade" value={player.nationality} />
            <Fact label="Posição" value={player.position} />
            <Fact label="Pé" value={player.foot} />
            <Fact label="Altura" value={player.height_cm && `${player.height_cm} cm`} />
            <Fact label="Número" value={player.number} />
            <Fact label="Valor de mercado" value={player.market_value} />
            <Fact label="Contrato até" value={player.contract_until} />
            <Fact label="Agente" value={player.agent} />
          </dl>
          <div className="mt-8 grid grid-cols-4 gap-4 rounded-xl bg-neutral-50 p-5 text-center">
            {Object.entries({ Jogos: totals.jogos, Golos: totals.golos, Assist: totals.assist, Minutos: totals.minutos }).map(([k, v]) => (
              <div key={k}>
                <div className="text-2xl font-semibold">{v}</div>
                <div className="text-xs tracking-wide text-neutral-500 uppercase">{k} esta época</div>
              </div>
            ))}
          </div>
          <details className="mt-8">
            <summary className="cursor-pointer text-sm font-medium text-neutral-600">Editar nome e links</summary>
            <form action={savePlayerAction} className="mt-5 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={player.id} />
              <input type="hidden" name="notes" value={player.notes} />
              <div>
                <label className="label">Primeiro nome (como aparece nas edits)</label>
                <input name="first_name" defaultValue={player.first_name} className="input" />
              </div>
              <div>
                <label className="label">Apelido</label>
                <input name="last_name" defaultValue={player.last_name} className="input" />
              </div>
              <div>
                <label className="label">Link zerozero</label>
                <input name="zerozero_url" defaultValue={player.zerozero_url ?? ""} className="input" />
              </div>
              <div>
                <label className="label">Link Transfermarkt</label>
                <input name="transfermarkt_url" defaultValue={player.transfermarkt_url ?? ""} className="input" />
              </div>
              <div className="md:col-span-2">
                <SubmitButton pending="A guardar…">Guardar</SubmitButton>
              </div>
            </form>
          </details>
        </div>

        <div className="card">
          <h2 className="section-title mb-6">Próximos jogos</h2>
          {fixtures.length === 0 ? (
            <p className="muted">Sem jogos marcados.</p>
          ) : (
            <ul className="space-y-4">
              {fixtures.map((f) => (
                <li key={f.id} className="flex items-center gap-3">
                  {f.opponent_crest ? <img src={f.opponent_crest} alt="" className="h-8 w-8 object-contain" /> : <div className="h-8 w-8" />}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {f.home ? "vs" : "@"} {f.opponent}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {new Date(`${f.date}T12:00:00`).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" })} {f.time} · {f.competition}
                    </div>
                  </div>
                  <Link href={`/criar?player=${player.id}&type=matchday&fixture=${f.id}`} className="text-xs text-blue-600 hover:underline">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="section-title">Preferências das edits</h2>
          <p className="muted mt-1.5 mb-6">As variantes seguem estas escolhas e aprendem com cada edit exportada.</p>
          <form action={savePrefsAction} className="grid gap-5 md:grid-cols-3">
            <input type="hidden" name="id" value={player.id} />
            <div>
              <label className="label">Lado da foto</label>
              <select name="side" defaultValue={player.prefs.side ?? "auto"} className="input">
                <option value="auto">Automático</option>
                <option value="left">Jogador à esquerda</option>
                <option value="right">Jogador à direita</option>
              </select>
            </div>
            <div>
              <label className="label">Tom</label>
              <select name="tone" defaultValue={player.prefs.tone ?? "club"} className="input">
                <option value="club">Cores do clube</option>
                <option value="dark">Escuro / preto</option>
              </select>
            </div>
            <div>
              <label className="label">Segunda hora (ao lado da hora local do jogo)</label>
              {/* Empty = automatic: his nationality's clock (Portugal when it is unknown). */}
              <select name="ref_tz" defaultValue={player.prefs.refTz ?? ""} className="input">
                <option value="">
                  Automático: nacionalidade ({player.nationality ? `${player.nationality} · ${refTag(playerRefTz(undefined, player.nationality))}` : "sem nacionalidade → PT"})
                </option>
                {NATION_ZONES.map((z) => (
                  <option key={z.names[0]} value={z.tz}>
                    {z.names[0]} ({z.tag})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="hide_agency" defaultChecked={!!player.prefs.hideAgency} />
                Sem logótipo da agência
              </label>
            </div>
            <div className="md:col-span-3">
              <SubmitButton pending="A guardar…">Guardar preferências</SubmitButton>
            </div>
          </form>
          <form action={savePlayerAction} className="mt-5">
            <input type="hidden" name="id" value={player.id} />
            <input type="hidden" name="first_name" value={player.first_name} />
            <input type="hidden" name="last_name" value={player.last_name} />
            <input type="hidden" name="zerozero_url" value={player.zerozero_url ?? ""} />
            <input type="hidden" name="transfermarkt_url" value={player.transfermarkt_url ?? ""} />
            <label className="label">Notas sobre o que ele gosta (a IA lê isto)</label>
            <div className="flex gap-2">
              <input name="notes" defaultValue={player.notes} className="input" placeholder="Ex.: gosta de fundos escuros, não gosta de neon, prefere fotos a celebrar" />
              <SubmitButton className="btn-ghost" pending="…">
                Guardar
              </SubmitButton>
            </div>
          </form>

          <div className="mt-8 rounded-xl bg-neutral-50 p-5">
            <div className="text-sm font-medium">O que a app já aprendeu</div>
            {learned.length === 0 ? (
              <p className="muted mt-1">Ainda nada. Exporta edits ou carrega edits de referência.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {learned.map(([id, n]) => (
                  <span key={id} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
                    {label(id)} <span className="text-neutral-400">×{n}</span>
                  </span>
                ))}
              </div>
            )}
            {(player.prefs.referenceNotes ?? []).length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-neutral-600">
                {player.prefs.referenceNotes!.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
            {learned.length > 0 && <ResetLearning playerId={player.id} />}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Edits de referência</h2>
          <p className="muted mt-1.5 mb-5">
            Edits antigas de que o jogador gosta. A app reconhece a pose do jogador em cada uma e passa a preferir fotos na mesma pose.{" "}
            {aiEnabled() ? "A IA analisa também o estilo." : "(A análise do estilo fica ativa quando ligares a IA.)"}
          </p>
          {(player.prefs.referencePoses ?? []).length > 0 && (
            <p className="mb-5 text-sm text-neutral-600">
              Poses reconhecidas: {[...new Set(player.prefs.referencePoses!)].map((p) => POSE_LABELS[p]).join(", ")}
            </p>
          )}
          <form action={uploadReferenceAction} className="flex gap-2">
            <input type="hidden" name="player_id" value={player.id} />
            <input type="file" name="files" accept="image/*" multiple className="min-w-0 flex-1 text-sm" />
            <SubmitButton className="btn-ghost" pending="A analisar…">
              Carregar
            </SubmitButton>
          </form>
          {references.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {references.map((r) => (
                <img key={r.id} src={fileUrl(r.file)!} alt="" className="aspect-[4/5] w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Vídeo · golo / assistência</h2>
        <p className="muted mt-1.5 mb-5">
          Carrega o vídeo do lance (de preferência o original, não o do WhatsApp). A app procura a bola em segundo plano (~1 min) e abre a story, onde
          podes corrigir o seguimento com um clique e exportar o MP4.
        </p>
        <ClipUpload playerId={player.id} />
      </div>

      <div className="card">
        <h2 className="section-title">Fotos</h2>
        <p className="muted mt-1.5 mb-6">
          Fotos pequenas são aumentadas com IA e o fundo sai automaticamente, sem mexer na cara. Todos os dias a app procura fotos novas nas notícias e
          confirma pela cara que é ele (marcadas com AUTO). Confirma os direitos de cada foto antes de publicar.
        </p>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-6">
          <PhotoUploader playerId={player.id} />
          {photos.map((ph) => (
            <div key={ph.id} className="space-y-2">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl" style={{ background: CHECKER }}>
                <img src={fileUrl(ph.cutout_status === "done" ? ph.cutout : ph.file)!} alt="" className="h-full w-full object-contain" />
                {ph.cutout_status === "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">A recortar…</div>
                )}
                {!ph.approved && ph.cutout_status === "done" && (
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/70 p-1.5">
                    <form action={approvePhotoAction} className="flex-1">
                      <input type="hidden" name="id" value={ph.id} />
                      <button className="w-full rounded bg-green-600 py-1 text-xs font-medium text-white">✓ Usar</button>
                    </form>
                    <form action={deletePhotoAction} className="flex-1">
                      <input type="hidden" name="id" value={ph.id} />
                      <button className="w-full rounded bg-white/20 py-1 text-xs font-medium text-white">✕ Não</button>
                    </form>
                  </div>
                )}
                {ph.source === "auto" && (
                  <a
                    href={ph.source_url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 left-2 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white"
                    title="Encontrada automaticamente: abrir a notícia de origem"
                  >
                    AUTO ↗
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={ph.cutout_status === "error" ? "text-red-600" : "text-neutral-500"}>
                  {{ none: "Original", pending: "A processar", done: "Recortada", error: "Falhou" }[ph.cutout_status]}
                </span>
                <div className="flex">
                  {ph.cutout_status !== "pending" && (
                    <form action={retryCutoutAction}>
                      <input type="hidden" name="id" value={ph.id} />
                      <button className="px-1.5 text-neutral-500 hover:text-neutral-900" title="Recortar outra vez">
                        ↻
                      </button>
                    </form>
                  )}
                  {ph.cutout_status !== "pending" && ph.kind === "player" && (
                    <form action={enhancePhotoAction}>
                      <input type="hidden" name="id" value={ph.id} />
                      <button className="px-1.5 text-neutral-500 hover:text-neutral-900" title="Melhorar com IA (foto desfocada): refaz a nitidez com Real-ESRGAN e recorta outra vez (~1–2 min)">
                        ✦
                      </button>
                    </form>
                  )}
                  <form action={deletePhotoAction}>
                    <input type="hidden" name="id" value={ph.id} />
                    <button className="px-1.5 text-red-500 hover:text-red-700" title="Apagar">
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="section-title">Jogos da época</h2>
            <p className="muted mt-1.5">Atualizados automaticamente a partir do {player.zerozero_url ? "zerozero" : player.transfermarkt_url ? "Transfermarkt" : "registo manual"}.</p>
          </div>
        </div>
        {matches.length === 0 ? (
          <p className="muted">Sem jogos registados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-neutral-500 uppercase">
                <tr className="border-b border-neutral-100">
                  <th className="py-3">Data</th>
                  <th>Competição</th>
                  <th>Adversário</th>
                  <th>Resultado</th>
                  <th>Min</th>
                  <th>Golos</th>
                  <th>Assist.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {matches.map((m) => {
                  const won = m.goals_for > m.goals_against;
                  const drew = m.goals_for === m.goals_against;
                  return (
                    <tr key={m.id}>
                      <td className="py-3 whitespace-nowrap">{m.date}</td>
                      <td>
                        {m.competition}
                        {m.matchday && ` · ${/^\d+$/.test(m.matchday) ? `J${m.matchday}` : roundLabel(m.matchday).toLowerCase()}`}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {m.opponent_crest && <img src={m.opponent_crest} alt="" className="h-5 w-5 object-contain" />}
                          {m.home ? "vs" : "@"} {m.opponent}
                        </div>
                      </td>
                      <td>
                        <span className={`rounded px-2 py-0.5 font-medium ${won ? "bg-green-100 text-green-800" : drew ? "bg-neutral-100" : "bg-red-100 text-red-800"}`}>
                          {m.goals_for}-{m.goals_against}
                        </span>
                      </td>
                      <td>{m.minutes}&apos;</td>
                      <td className={m.goals ? "font-semibold" : "text-neutral-400"}>{m.goals}</td>
                      <td className={m.assists ? "font-semibold" : "text-neutral-400"}>{m.assists}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {(m.goals > 0 || m.assists > 0) && (
                            <Link href={`/criar?player=${player.id}&type=${m.goals ? "goal" : "result"}&match=${m.id}`} className="text-xs text-blue-600 hover:underline">
                              Criar edit
                            </Link>
                          )}
                          {m.source === "manual" && (
                            <form action={deleteMatchAction}>
                              <input type="hidden" name="id" value={m.id} />
                              <input type="hidden" name="player_id" value={player.id} />
                              <button className="text-xs text-red-500">Apagar</button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-neutral-600">Adicionar jogo à mão</summary>
          <form action={saveMatchAction} className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 p-5 md:grid-cols-6 md:items-end">
            <input type="hidden" name="player_id" value={player.id} />
            <div>
              <label className="label">Data</label>
              <input type="date" name="date" defaultValue={today} required className="input" />
            </div>
            <div>
              <label className="label">Competição</label>
              <input name="competition" defaultValue={matches[0]?.competition ?? club?.league ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Jornada</label>
              <input name="matchday" className="input" />
            </div>
            <div>
              <label className="label">Adversário</label>
              <input name="opponent" required className="input" />
            </div>
            <div>
              <label className="label">Casa/Fora</label>
              <select name="home" className="input">
                <option value="1">Casa</option>
                <option value="0">Fora</option>
              </select>
            </div>
            <div>
              <label className="label">Resultado</label>
              <div className="flex items-center gap-1">
                <input name="goals_for" type="number" min={0} defaultValue={0} className="input px-2" />
                <span>-</span>
                <input name="goals_against" type="number" min={0} defaultValue={0} className="input px-2" />
              </div>
            </div>
            <div>
              <label className="label">Minutos</label>
              <input name="minutes" type="number" min={0} defaultValue={90} className="input" />
            </div>
            <div>
              <label className="label">Golos</label>
              <input name="goals" type="number" min={0} defaultValue={0} className="input" />
            </div>
            <div>
              <label className="label">Assist.</label>
              <input name="assists" type="number" min={0} defaultValue={0} className="input" />
            </div>
            <div>
              <label className="label">Nota</label>
              <input name="rating" inputMode="decimal" placeholder="7.5" className="input" />
            </div>
            <label className="flex items-center gap-2 pb-3 text-sm">
              <input type="checkbox" name="totw" /> Equipa da semana
            </label>
            <SubmitButton pending="…">Adicionar</SubmitButton>
          </form>
        </details>
      </div>

      {club && (
        <div className="card">
          <h2 className="section-title">Clube: {club.name}</h2>
          <p className="muted mt-1.5 mb-6">Emblema e cores detetados automaticamente. Corrige aqui se for preciso.</p>
          <form action={saveClubAction} className="flex flex-wrap items-end gap-6">
            <input type="hidden" name="id" value={club.id} />
            {club.crest && <img src={fileUrl(club.crest)!} alt="" className="h-16 w-16 object-contain" />}
            <div>
              <label className="label">Cor principal</label>
              <input type="color" name="primary_color" defaultValue={club.primary_color} className="h-10 w-16 cursor-pointer rounded-lg border border-neutral-300" />
            </div>
            <div>
              <label className="label">Cor secundária</label>
              <input type="color" name="secondary_color" defaultValue={club.secondary_color} className="h-10 w-16 cursor-pointer rounded-lg border border-neutral-300" />
            </div>
            <div>
              <label className="label">Trocar emblema</label>
              <input type="file" name="crest" accept="image/*" className="text-sm" />
            </div>
            <SubmitButton className="btn-ghost" pending="…">
              Guardar
            </SubmitButton>
          </form>

          <div className="mt-8">
            <div className="text-sm font-medium">Fotos da cidade{club.city ? ` (${club.city})` : ""}</div>
            <p className="muted mt-1 mb-4">Encontradas automaticamente no Wikimedia Commons. Podes juntar fotos vossas (ficam primeiro).</p>
            <div className="flex flex-wrap gap-3">
              {(club.city_images ? (JSON.parse(club.city_images) as string[]) : []).map((f) => (
                <img key={f} src={fileUrl(f)!} alt="" className="h-24 w-40 rounded-lg object-cover" />
              ))}
            </div>
            <form action={cityPhotosAction} className="mt-4 flex flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={club.id} />
              <input type="file" name="files" accept="image/*" multiple className="text-sm" />
              <SubmitButton className="btn-ghost" pending="A carregar…">
                Juntar fotos
              </SubmitButton>
            </form>
          </div>
        </div>
      )}

      {edits.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-6">Edits</h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {edits.map((e) => (
              <Link key={e.id} href={`/edits/${e.id}`} className="text-xs text-neutral-600 hover:underline">
                <div className="mb-1.5 aspect-[4/5] overflow-hidden rounded-lg bg-neutral-200">
                  {e.output && <img src={fileUrl(e.output)!} alt="" className="h-full w-full object-cover" />}
                </div>
                {POST_TYPES.find((t) => t.id === e.post_type)?.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <ConfirmDelete
          action={deletePlayerAction}
          id={player.id}
          label="Apagar jogador"
          question={`Apagar ${player.first_name} ${player.last_name}? Os jogos, fotos e edits dele também são apagados.`}
        />
      </div>
    </div>
  );
}
