"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { fetchArticleAction } from "@/app/actions";
import type { EditContent, PostType, PressArticle, StatItem } from "@/lib/types";
import { PhotoUploader } from "./PhotoUploader";

export type PhotoOption = { id: string; url: string; kind: string; status: string };
export type ClubOption = { id: string; name: string };

export function ContentFields({
  playerId,
  postType,
  content,
  onChange,
  insets,
  clubs,
  backdrops = [],
}: {
  playerId: string;
  postType: PostType;
  content: EditContent;
  onChange: (c: EditContent) => void;
  insets: PhotoOption[];
  clubs: ClubOption[];
  /** The player's photos, offered as the backdrop of a speed post. */
  backdrops?: PhotoOption[];
}) {
  const set = <K extends keyof EditContent>(k: K, v: EditContent[K]) => onChange({ ...content, [k]: v });
  const setStat = (i: number, patch: Partial<StatItem>) =>
    set(
      "stats",
      content.stats.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    );

  const showStats = postType === "potm" || postType === "stats" || postType === "result";
  const showInset = postType === "totw" || postType === "potm";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Primeiro nome" value={content.firstName} onChange={(v) => set("firstName", v)} />
        <Field label="Apelido" value={content.lastName} onChange={(v) => set("lastName", v)} />
      </div>
      <Field label="Título" value={content.kicker} onChange={(v) => set("kicker", v)} />
      <Field label="Subtítulo" value={content.subline} onChange={(v) => set("subline", v)} placeholder="LIGA 3 · JORNADA 5" />

      {showInset && (
        <div>
          <span className="label">{postType === "totw" ? "Gráfico oficial da liga" : "Gráfico (opcional)"}</span>
          <div className="grid grid-cols-3 gap-2">
            <PhotoUploader
              playerId={playerId}
              kind="inset"
              label="Carregar"
              multiple={false}
              onUploaded={(ids) => ids[0] && onChange({ ...content, insetPhotoId: ids[0], insetHighlight: null })}
            />
            {insets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ...content, insetPhotoId: content.insetPhotoId === p.id ? null : p.id, insetHighlight: null })}
                className={`aspect-square overflow-hidden rounded-lg border-2 ${content.insetPhotoId === p.id ? "border-blue-600" : "border-transparent"}`}
              >
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {showStats && (
        <div>
          <span className="label">Estatísticas (até 4)</span>
          <div className="space-y-1.5">
            {content.stats.map((s, i) => (
              <div key={i} className="flex gap-1.5">
                <input className="input w-20" value={s.value} onChange={(e) => setStat(i, { value: e.target.value })} placeholder="5" />
                <input className="input" value={s.label} onChange={(e) => setStat(i, { label: e.target.value })} placeholder="Golos" />
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() =>
                    set(
                      "stats",
                      content.stats.filter((_, j) => j !== i),
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}
            {content.stats.length < 4 && (
              <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => set("stats", [...content.stats, { label: "", value: "" }])}>
                + Adicionar estatística
              </button>
            )}
          </div>
        </div>
      )}

      {postType === "result" && (
        <div className="grid grid-cols-[1fr_56px_56px_1fr] gap-1.5">
          <Field label="Casa" value={content.homeTeam ?? ""} onChange={(v) => set("homeTeam", v)} />
          <Field label="" value={content.homeGoals ?? ""} onChange={(v) => set("homeGoals", v)} />
          <Field label="" value={content.awayGoals ?? ""} onChange={(v) => set("awayGoals", v)} />
          <Field label="Fora" value={content.awayTeam ?? ""} onChange={(v) => set("awayTeam", v)} />
        </div>
      )}

      {postType === "transfer" && (
        <div className="grid grid-cols-2 gap-2">
          <ClubSelect label="De" value={content.fromClubId} clubs={clubs} onChange={(v) => set("fromClubId", v)} />
          <ClubSelect label="Para" value={content.toClubId} clubs={clubs} onChange={(v) => set("toClubId", v)} />
        </div>
      )}

      {postType === "speed" && (
        <div className="space-y-3">
          <Field label="Velocidade máxima (km/h)" value={content.speed ?? ""} onChange={(v) => set("speed", v)} placeholder="36.1" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!content.speedOnly} onChange={(e) => set("speedOnly", e.target.checked)} />
            Só a velocidade (sem título, subtítulo nem nome)
          </label>
          {backdrops.length > 0 && (
            <div>
              <span className="label">Foto de fundo (opcional: uma foto tremida dá sensação de velocidade)</span>
              <div className="grid grid-cols-4 gap-2">
                {backdrops.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set("backdropPhotoId", content.backdropPhotoId === p.id ? null : p.id)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${content.backdropPhotoId === p.id ? "border-blue-600" : "border-transparent"}`}
                  >
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {postType === "welcome" && (
        <div className="space-y-3">
          {/* The two columns beside his head: free text, so "CENTRAL MIDFIELDER" can become "MIDFIELDER". */}
          {(
            [
              ["AGE", "Idade", "23 YEARS"],
              ["POSITION", "Posição", "MIDFIELDER"],
              ["NATIONALITY", "Nacionalidade", "PORTUGAL"],
            ] as const
          ).map(([key, label, ph]) => {
            const i = content.stats.findIndex((s) => s.label.toUpperCase() === key);
            return (
              <Field
                key={key}
                label={label}
                placeholder={ph}
                value={i >= 0 ? content.stats[i].value : ""}
                onChange={(v) =>
                  set(
                    "stats",
                    i >= 0 ? content.stats.map((s, j) => (j === i ? { ...s, value: v.toUpperCase() } : s)) : [...content.stats, { label: key, value: v.toUpperCase() }],
                  )
                }
              />
            );
          })}
          <div>
            <span className="label">Últimos clubes (do mais antigo para o atual)</span>
            <div className="space-y-1.5">
              {(content.career ?? []).map((c, i, all) => (
                <div key={i} className="flex items-center gap-1.5">
                  {c.crest ? <img src={c.crest} alt="" className="h-7 w-7 object-contain" /> : <span className="h-7 w-7" />}
                  <input className="input" value={c.name} onChange={(e) => set("career", all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <button type="button" className="btn" title="Mais para trás" disabled={i === 0} onClick={() => set("career", all.map((x, j) => (j === i - 1 ? all[i] : j === i ? all[i - 1] : x)))}>
                    ↑
                  </button>
                  <button type="button" className="btn-danger" title="Tirar" onClick={() => set("career", all.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </div>
              ))}
              {!(content.career ?? []).length && <p className="text-xs text-neutral-500">Sem clubes: vêm do zerozero quando o jogador tem o link.</p>}
            </div>
          </div>
        </div>
      )}

      {postType === "press" && <PressList articles={content.articles ?? []} onChange={(a) => set("articles", a)} />}

      {postType === "renewal" && <Field label="Contrato até" value={content.until ?? ""} onChange={(v) => set("until", v)} />}
    </div>
  );
}

/** Press post: the articles about him — paste a link to add one, then fix the outlet / headline / date by hand. */
function PressList({ articles, onChange }: { articles: PressArticle[]; onChange: (a: PressArticle[]) => void }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = async () => {
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    const r = await fetchArticleAction(url.trim());
    setBusy(false);
    if (!r.ok) return setError(r.error);
    onChange([...articles, r.article]);
    setUrl("");
  };
  const patch = (i: number, p: Partial<PressArticle>) => onChange(articles.map((a, j) => (j === i ? { ...a, ...p } : a)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= articles.length) return;
    const next = [...articles];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <span className="label">Notícias (a primeira é o destaque; até 6)</span>
      <div className="flex gap-1.5">
        <input
          className="input"
          value={url}
          placeholder="Colar o link da notícia"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void add();
            }
          }}
        />
        <button type="button" className="btn whitespace-nowrap" disabled={busy || !url.trim()} onClick={() => void add()}>
          {busy ? "A ler…" : "Adicionar"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">Não foi possível ler a notícia: {error}</p>}
      {articles.map((a, i) => (
        <div key={i} className="space-y-1.5 rounded-lg border border-neutral-200 p-2">
          <div className="flex items-center gap-1.5">
            {a.image && <img src={a.image} alt="" className="h-9 w-12 flex-shrink-0 rounded object-cover" />}
            <input className="input px-2.5 py-2" style={{ flex: "1 1 0", minWidth: 0, width: "auto" }} value={a.source} onChange={(e) => patch(i, { source: e.target.value })} placeholder="Jornal" />
            <input className="input px-2.5 py-2" style={{ width: 88, flexShrink: 0 }} value={a.date ?? ""} onChange={(e) => patch(i, { date: e.target.value })} placeholder="17 OCT" />
          </div>
          <textarea className="input min-h-[3.5rem] px-2.5 py-2" value={a.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Título (tal como foi publicado)" />
          <div className="flex items-center justify-end gap-1 text-sm">
            <button type="button" className="rounded-md px-2 py-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30" title="Subir" disabled={i === 0} onClick={() => move(i, -1)}>
              ↑ Subir
            </button>
            <button type="button" className="rounded-md px-2 py-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30" title="Descer" disabled={i === articles.length - 1} onClick={() => move(i, 1)}>
              ↓ Descer
            </button>
            <button type="button" className="btn-danger px-2 py-1" title="Remover" onClick={() => onChange(articles.filter((_, j) => j !== i))}>
              ✕ Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      {!label && <span className="label">&nbsp;</span>}
      <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ClubSelect({
  label,
  value,
  clubs,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  clubs: ClubOption[];
  onChange: (v: string | null) => void;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">—</option>
        {clubs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
