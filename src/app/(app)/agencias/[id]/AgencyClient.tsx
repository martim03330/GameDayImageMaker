"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { agencyRosterAction, bookAgencyLookAction, linkAgencyPlayersAction, runAgencyBatchAction, unlinkAgencyPlayerAction, uploadAgencyLogoAction } from "@/app/actions";
import type { AgencyPlayer } from "@/lib/agencies/clients";

type Roster = Awaited<ReturnType<typeof agencyRosterAction>>;
type Week = { week: string; booked: string | null; free: { id: string; label: string }[]; suggested: string | null; bookedLabel: string | null; suggestedLabel: string | null };

export function AgencyClient(props: {
  agency: { id: string; name: string; status: string; instagram: string; players: number; logo: string | null; logoWhite: string | null };
  linked: AgencyPlayer[];
  trialLimit: number | null;
  week: Week;
  edits: string[];
}) {
  const router = useRouter();
  const { agency, week } = props;
  const [roster, setRoster] = useState<Roster | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [look, setLook] = useState(week.booked ?? week.suggested ?? "");
  const [result, setResult] = useState<{ created: string[]; skipped: { player: string; reason: string }[] } | null>(null);
  const [msg, setMsg] = useState("");

  async function run<T>(key: string, fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(key);
    setMsg("");
    try {
      return await fn();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function exportAll(format: "post" | "story") {
    await run(`export-${format}`, async () => {
      const res = await fetch(`/api/agencias/${agency.id}/export?week=${week.week}&format=${format}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "edits.zip";
      a.click();
      const saved = decodeURIComponent(res.headers.get("X-Saved-To") ?? "");
      setMsg(`Pronto ✓ — ZIP descarregado${saved ? ` e ficheiros (JPG + PNG) em ${saved}` : ""}.`);
    });
  }

  const linkedTm = new Set(props.linked.map((p) => p.id));
  const room = props.trialLimit ? props.trialLimit - props.linked.length : Infinity;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Link href="/agencias" className="muted hover:underline">
            ← Agências
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{agency.name}</h1>
          <p className="muted mt-1">
            {agency.status === "teste" ? `Teste grátis · até ${props.trialLimit} jogadores` : "Cliente"} · {agency.players} jogadores no Transfermarkt
            {agency.instagram && (
              <a className="ml-2 text-blue-600 hover:underline" href={`https://www.instagram.com/${agency.instagram}/`} target="_blank" rel="noreferrer">
                @{agency.instagram}
              </a>
            )}
          </p>
        </div>
      </div>
      {msg && <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">{msg}</div>}

      {/* Logo: shown on every edit of this agency (white version on dark looks). */}
      <div className="card flex flex-wrap items-center gap-6">
        <div>
          <h2 className="section-title">Logótipo da agência</h2>
          <p className="muted">Vai em todas as edits desta agência. Usa um PNG com fundo transparente: a app faz a versão branca para estilos escuros.</p>
        </div>
        {props.agency.logo && (
          <div className="flex gap-3">
            <div className="flex h-20 w-36 items-center justify-center rounded-lg bg-neutral-100 p-2">
              <img src={props.agency.logo} alt="" className="max-h-full max-w-full" />
            </div>
            <div className="flex h-20 w-36 items-center justify-center rounded-lg bg-neutral-900 p-2">
              <img src={props.agency.logoWhite ?? props.agency.logo} alt="" className="max-h-full max-w-full" />
            </div>
          </div>
        )}
        <form
          className="ml-auto flex items-center gap-3"
          action={async (fd) => {
            await run("logo", () => uploadAgencyLogoAction(agency.id, fd));
            router.refresh();
          }}
        >
          <input type="file" name="logo" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="text-sm" />
          <button className="btn" disabled={busy === "logo"}>
            {busy === "logo" ? "A carregar…" : "Carregar"}
          </button>
        </form>
      </div>

      {/* Players with the service. */}
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="section-title">Jogadores ({props.linked.length})</h2>
          <button
            type="button"
            className="btn-ghost ml-auto"
            disabled={busy === "roster"}
            onClick={async () => {
              const r = await run("roster", () => agencyRosterAction(agency.id));
              if (r) setRoster(r);
            }}
          >
            {busy === "roster" ? "A ler o Transfermarkt…" : "Importar jogadores do Transfermarkt"}
          </button>
        </div>
        {roster && (
          <div className="space-y-3 rounded-xl bg-neutral-50 p-4">
            <p className="muted">
              Escolhe os jogadores que entram no serviço{props.trialLimit ? ` (teste: no máximo ${props.trialLimit})` : ""}. Os que já existem na app são reaproveitados.
            </p>
            <div className="grid max-h-80 gap-1 overflow-auto sm:grid-cols-2">
              {roster.map((p) => (
                <label key={p.tmUrl} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={p.linked}
                    checked={p.linked || picked.includes(p.tmUrl)}
                    onChange={(e) => setPicked((s) => (e.target.checked ? [...s, p.tmUrl] : s.filter((u) => u !== p.tmUrl)))}
                  />
                  <span className="font-medium">{p.name}</span>
                  <span className="muted">
                    {p.club} · {p.position}
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn"
              disabled={!picked.length || busy === "link" || picked.length > room}
              onClick={async () => {
                const players = roster.filter((p) => picked.includes(p.tmUrl)).map((p) => ({ tmUrl: p.tmUrl, name: p.name }));
                const out = await run("link", () => linkAgencyPlayersAction(agency.id, players));
                if (out) {
                  setRoster(null);
                  setPicked([]);
                  setMsg(`${out.linked} jogador(es) ligados. Carrega agora as fotos de cada um na página dele.`);
                  router.refresh();
                }
              }}
            >
              {busy === "link" ? "A preparar os jogadores (sincroniza cada um)…" : `Ligar selecionados (${picked.length})`}
            </button>
          </div>
        )}
        {props.linked.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs tracking-wide text-neutral-500 uppercase">
              <tr className="border-b border-neutral-200">
                <th className="py-2">Jogador</th>
                <th className="py-2">Clube</th>
                <th className="py-2">Fotos</th>
                <th className="py-2">Próximo jogo</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {props.linked.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2">{p.club || "—"}</td>
                  <td className="py-2">
                    <Link href={`/jogadores/${p.id}`} target="_blank" className={p.photos ? "text-blue-600 hover:underline" : "font-medium text-amber-700 hover:underline"}>
                      {p.photos ? `${p.photos} ✓` : "Carregar foto →"}
                    </Link>
                  </td>
                  <td className="py-2">{p.nextGame ?? "—"}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={async () => {
                        await run(`unlink-${p.id}`, () => unlinkAgencyPlayerAction(agency.id, p.id));
                        router.refresh();
                      }}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {linkedTm.size === 0 && !roster && <p className="muted">Ainda não há jogadores: importa-os do Transfermarkt.</p>}
      </div>

      {/* This week: the agency's exclusive look, the batch and the export. */}
      <div className="card space-y-4">
        <h2 className="section-title">Esta semana · {new Date(`${week.week}T12:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm">Estilo {week.booked ? "reservado" : "sugerido"}:</span>
          <select className="input max-w-80" value={look} onChange={(e) => setLook(e.target.value)}>
            {week.booked && <option value={week.booked}>{week.bookedLabel}</option>}
            {week.free
              .filter((f) => f.id !== week.booked)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
          </select>
          <button
            type="button"
            className="btn-ghost"
            disabled={!look || look === week.booked || busy === "book"}
            onClick={async () => {
              await run("book", () => bookAgencyLookAction(agency.id, week.week, look));
              router.refresh();
            }}
          >
            Reservar
          </button>
          <span className="muted">Exclusivo desta agência esta semana (nenhuma outra o tem).</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn"
            disabled={busy === "batch" || !props.linked.length}
            onClick={async () => {
              const out = await run("batch", () => runAgencyBatchAction(agency.id));
              if (out) {
                setResult(out);
                router.refresh();
              }
            }}
          >
            {busy === "batch" ? "A fazer…" : "Fazer edits da semana"}
          </button>
          <button type="button" className="btn-ghost" disabled={!props.edits.length || !!busy} onClick={() => exportAll("post")}>
            {busy === "export-post" ? "A exportar…" : "Exportar todas (post)"}
          </button>
          <button type="button" className="btn-ghost" disabled={!props.edits.length || !!busy} onClick={() => exportAll("story")}>
            {busy === "export-story" ? "A exportar…" : "Exportar todas (story)"}
          </button>
        </div>
        {result && (
          <div className="text-sm">
            <p>{result.created.length} edit(s) feitas.</p>
            {result.skipped.length > 0 && (
              <ul className="muted mt-1 list-disc pl-5">
                {result.skipped.map((s) => (
                  <li key={s.player}>
                    {s.player}: {s.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {props.edits.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {props.edits.map((id) => (
              <Link key={id} href={`/edits/${id}`} target="_blank" className="block overflow-hidden rounded-lg border border-neutral-200">
                <iframe src={`/render/${id}`} title={id} className="pointer-events-none origin-top-left" style={{ width: 1080, height: 1350, transform: "scale(0.16)", marginBottom: -1134, marginRight: -907 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
