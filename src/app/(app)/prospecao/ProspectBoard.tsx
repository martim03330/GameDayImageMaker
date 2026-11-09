"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  collegeScanStateAction,
  followUpProspectAction,
  igCandidateAction,
  igSearchAction,
  igSearchStateAction,
  saveBraveKeyAction,
  setBraveLimitAction,
  prospectSampleAction,
  prospectSampleStateAction,
  prospectScanStateAction,
  saveProspectSettingsAction,
  scanCollegeAction,
  scanProspectsAction,
  updateProspectAction,
} from "@/app/actions";
import { LANG_LABEL, LANGS, SPORT_LABEL, SPORTS, fillTemplate, langOf, sportOf, type Lang, type Sport, type Templates } from "@/lib/prospect-lang";
import type { Prospect } from "@/lib/prospects";
import { copyText } from "@/lib/clipboard";

type Row = Prospect & { opponent: string };
type Scan = { running: boolean; done: number; total: number; error: string | null; finished: string | null };
type CollegeScan = { running: boolean; sport: Sport; stage: string; done: number; total: number; players: number; error: string | null; finished: string | null };
/** Every message, per sport and language. */
type AllTemplates = Record<Sport, Record<Lang, Templates>>;
type IgState = { running: boolean; done: number; total: number; found: number; error: string | null };

const STATUSES = ["novo", "contactado", "respondeu", "cliente", "sem interesse"];
const SHOWN = 150;
const BUSY = ["a sincronizar"];
const DAILY = 20;
const FOLLOW_DAYS = 3;

/** The search found an account for him and the user has not confirmed or rejected it yet. */
const hasSuggestion = (p: Prospect) => !p.instagram && (p.ig_candidates ?? "[]") !== "[]";

/** Contacted ≥ 3 days ago, no answer recorded and no follow-up sent yet. */
const needsFollowUp = (p: Prospect) =>
  p.status === "contactado" && !!p.contacted_at && !p.followed_up_at && Date.now() - new Date(p.contacted_at).getTime() >= FOLLOW_DAYS * 864e5;

/**
 * Puts the message on the clipboard FIRST (while this page still has focus), then opens his Instagram
 * conversation: the user pastes it and presses Enter himself (nothing is ever sent by the app).
 */
function openConversation(handle: string, text: string) {
  copyText(text);
  window.open(`https://ig.me/m/${handle}`, "_blank", "noopener");
}

/** The language his messages go out in: chosen by hand, else from his nationality. */
const langFor = (p: Prospect): Lang => langOf(p.nationality ?? "", p.lang ?? "");

/** One of the three messages for one player, in his sport and language, with his first name, club and next opponent. */
function personalise(all: AllTemplates, kind: keyof Templates, p: Row): string {
  return fillTemplate(all[sportOf(p.sport)][langFor(p)][kind], { nome: p.name.split(" ")[0], clube: p.club, adversario: p.opponent }, p.id);
}

export function ProspectBoard(props: { prospects: Row[]; models: { id: string; label: string }[]; modelId: string | null; templates: AllTemplates; scan: Scan; college: CollegeScan; ig: IgState; hasBraveKey: boolean; braveUsage: { count: number; limit: number }; contactedToday: number }) {
  const router = useRouter();
  const [scan, setScan] = useState(props.scan);
  const [college, setCollege] = useState(props.college);
  // All three messages in every sport and language; the editor shows one sport and language at a time.
  const [templates, setTemplates] = useState(props.templates);
  const [editLang, setEditLang] = useState<Lang>("pt");
  const [editSport, setEditSport] = useState<Sport>("soccer");
  const shown = templates[editSport][editLang];
  const edit = (kind: keyof Templates, v: string) =>
    (setTemplates((t) => ({ ...t, [editSport]: { ...t[editSport], [editLang]: { ...t[editSport][editLang], [kind]: v } } })), setSaved(false));
  const rtl = editLang === "ar";
  const [sending, setSending] = useState(false);
  const [ig, setIg] = useState(props.ig);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [modelId, setModelId] = useState(props.modelId ?? "");
  const [saved, setSaved] = useState(false);
  const [q, setQ] = useState("");
  const [division, setDivision] = useState("");
  const [club, setClub] = useState("");
  const [status, setStatus] = useState("");
  const [samples, setSamples] = useState<Record<string, { sample_status: string; sample_edit_id: string | null; player_id: string | null }>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // While the list is being read from zerozero, follow its progress.
  useEffect(() => {
    if (!scan.running) return;
    const t = setInterval(async () => {
      const s = await prospectScanStateAction();
      setScan(s);
      if (!s.running) router.refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [scan.running, router]);

  // The US college rosters (~1,000 schools, 20–40 min): same follow-up, a little slower.
  useEffect(() => {
    if (!college.running) return;
    let n = 0;
    const t = setInterval(async () => {
      const s = await collegeScanStateAction();
      setCollege(s);
      if (!s.running || ++n % 20 === 0) router.refresh();
    }, 5000);
    return () => clearInterval(t);
  }, [college.running, router]);

  // While the Instagram search runs, follow it (and refresh now and then so new suggestions show up).
  useEffect(() => {
    if (!ig.running) return;
    let n = 0;
    const t = setInterval(async () => {
      const s = await igSearchStateAction();
      setIg(s);
      if (!s.running || ++n % 6 === 0) router.refresh();
    }, 5000);
    return () => clearInterval(t);
  }, [ig.running, router]);

  const rows = props.prospects.map((p) => ({ ...p, ...(samples[p.id] ?? {}) }));
  // Samples in progress: poll their state until they finish.
  const pending = rows.filter((p) => BUSY.includes(p.sample_status)).map((p) => p.id);
  const pendingKey = pending.join(",");
  useEffect(() => {
    if (!pendingKey) return;
    const t = setInterval(async () => {
      const states = await prospectSampleStateAction(pendingKey.split(","));
      setSamples((s) => ({ ...s, ...Object.fromEntries(states.map((x) => [x.id, x])) }));
      if (states.every((x) => !BUSY.includes(x.sample_status))) router.refresh();
    }, 4000);
    return () => clearInterval(t);
  }, [pendingKey, router]);

  const divisions = useMemo(() => [...new Set(props.prospects.map((p) => p.division))], [props.prospects]);
  const clubs = useMemo(() => [...new Set(props.prospects.filter((p) => !division || p.division === division).map((p) => p.club))].sort(), [props.prospects, division]);
  const filtered = rows.filter(
    (p) =>
      (!division || p.division === division) &&
      (!club || p.club === club) &&
      (!status || (status === "seguimento" ? needsFollowUp(p) : status === "sugestao" ? hasSuggestion(p) : p.status === status)) &&
      (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  // Send mode: today's queue — new players with an Instagram, in the current filters, up to the daily limit.
  const left = Math.max(0, DAILY - props.contactedToday);
  const queue = filtered.filter((p) => p.status === "novo" && p.instagram && !skipped.includes(p.id)).slice(0, left);
  const current = queue[0];
  const followUps = rows.filter(needsFollowUp).length;
  const suggestions = rows.filter(hasSuggestion).length;

  return (
    <div className="space-y-6">
      {/* The message and the model look. */}
      <div className="card grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {/* Each player gets the messages of his sport (basketball: "your next game", no football words)… */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="label mb-0 mr-2">Desporto</span>
            {SPORTS.map((sp) => (
              <button key={sp} type="button" onClick={() => setEditSport(sp)} className={sp === editSport ? "btn px-3 py-1.5" : "btn-ghost px-3 py-1.5"}>
                {sp === "basketball" ? "🏀 " : "⚽ "}
                {SPORT_LABEL[sp]}
              </button>
            ))}
          </div>
          {/* …in his language (from his nationality, or chosen in his row). */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="label mb-0 mr-2">Mensagens em</span>
            {LANGS.map((l) => (
              <button key={l} type="button" onClick={() => setEditLang(l)} className={l === editLang ? "btn px-3 py-1.5" : "btn-ghost px-3 py-1.5"}>
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
          <div>
            <label className="label">1ª mensagem · primeiro contacto ({"{nome}"}, {"{clube}"}, {"{adversario}"} são trocados pelos dados de cada jogador; o que está entre [[ ]] só aparece se o adversário for conhecido; {"{{a|b|c}}"} = variações, cada jogador recebe uma, para as mensagens não saírem todas iguais)</label>
            <textarea dir={rtl ? "rtl" : "ltr"} className="input min-h-44 font-mono text-[13px]" value={shown.message} onChange={(e) => edit("message", e.target.value)} />
          </div>
          <div>
            <label className="label">2ª mensagem · os planos, quando ele responder</label>
            <textarea dir={rtl ? "rtl" : "ltr"} className="input min-h-72 font-mono text-[13px]" value={shown.plans} onChange={(e) => edit("plans", e.target.value)} />
          </div>
          <div>
            <label className="label">Seguimento · {FOLLOW_DAYS} dias sem resposta</label>
            <textarea dir={rtl ? "rtl" : "ltr"} className="input min-h-28 font-mono text-[13px]" value={shown.followup} onChange={(e) => edit("followup", e.target.value)} />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Estilo de partida</label>
            <select className="input" value={modelId} onChange={(e) => (setModelId(e.target.value), setSaved(false))}>
              {props.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="muted mt-1.5">Quando ele te mandar a foto, &quot;Preparar edit&quot; cria o Matchday do próximo jogo dele com este estilo (nome, emblemas e cores do clube, sem logo da NEYOD). Depois carregas a foto e, no editor, escolhes o estilo que lhe fica melhor.</p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await saveProspectSettingsAction(editLang, shown, modelId, editSport);
              setSaved(true);
            }}
          >
            {saved ? "Guardado ✓" : `Guardar (${SPORT_LABEL[editSport]} · ${LANG_LABEL[editLang]})`}
          </button>
        </div>
      </div>

      {/* The list. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn"
          disabled={scan.running}
          onClick={async () => {
            await scanProspectsAction();
            setScan({ running: true, done: 0, total: 0, error: null, finished: null });
          }}
        >
          ⟳ {props.prospects.length ? "Atualizar lista do zerozero" : "Ir buscar os jogadores ao zerozero"}
        </button>
        <span className="text-sm text-neutral-600">
          {scan.running
            ? `A ler os plantéis… ${scan.done}/${scan.total || "?"} clubes`
            : scan.error
              ? `Erro: ${scan.error}`
              : `${props.prospects.length} jogadores · ${props.contactedToday} contactados hoje`}
        </span>
        <button
          type="button"
          className="btn-ghost"
          disabled={college.running}
          title="Jogadores internacionais (de fora dos EUA) das equipas de futebol masculino e feminino da NCAA Divisão I e II, lidos dos plantéis no site de cada universidade. Demora 20–40 minutos."
          onClick={async () => {
            await scanCollegeAction("soccer");
            setCollege({ running: true, sport: "soccer", stage: "a ler a lista da NCAA", done: 0, total: 0, players: 0, error: null, finished: null });
          }}
        >
          🇺🇸 {college.running && college.sport === "soccer" ? "College (EUA)…" : "College (EUA)"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={college.running}
          title="Jogadores internacionais (de fora dos EUA) das equipas de basquetebol masculino e feminino da NCAA Divisão I, lidos dos plantéis no site de cada universidade. Demora 15–30 minutos."
          onClick={async () => {
            await scanCollegeAction("basketball");
            setCollege({ running: true, sport: "basketball", stage: "a ler a lista da NCAA", done: 0, total: 0, players: 0, error: null, finished: null });
          }}
        >
          🏀 {college.running && college.sport === "basketball" ? "Basquetebol (EUA)…" : "Basquetebol (EUA)"}
        </button>
        {(college.running || college.error) && (
          <span className="text-sm text-neutral-600">
            {college.error
              ? `College: erro — ${college.error}`
              : `College ${college.sport === "basketball" ? "basquetebol" : "futebol"}: ${college.stage} ${college.done}/${college.total || "?"} universidades · ${college.players} internacionais`}
          </span>
        )}
        {props.contactedToday >= DAILY && <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800">Já vais em {DAILY} hoje: o Instagram pode limitar a conta se continuares.</span>}
        <button
          type="button"
          className="btn-ghost"
          disabled={!props.prospects.length}
          onClick={async () => {
            // The server decides (start if stopped, stop if running) and answers with the real state: the
            // page's own idea of it could be stale (a search stopped elsewhere still showed "Parar").
            setIg(await igSearchAction(division));
          }}
          title={division ? `Procura só os jogadores de: ${division}` : "Procura todos os jogadores sem Instagram (escolhe uma divisão no filtro para procurar só essa)"}
        >
          {ig.running ? "■ Parar procura" : division ? `◎ Procurar Instagrams · ${division}` : "◎ Procurar Instagrams"}
        </button>
        <input
          type="password"
          className="input py-1.5 text-xs"
          style={{ width: 230 }}
          placeholder={props.hasBraveKey ? "Chave Brave API ✓ (guardada)" : "Chave Brave API (opcional)"}
          title="Com uma chave gratuita da Brave Search API (api-dashboard.search.brave.com) a procura faz ~1 jogador por segundo, sem pausas. Sem chave, vai devagar e faz pausas quando o Brave limita."
          onBlur={async (e) => {
            if (e.target.value.trim()) {
              await saveBraveKeyAction(e.target.value);
              e.target.value = "";
              router.refresh();
            }
          }}
        />
        {props.hasBraveKey && (
          <span className="flex items-center gap-1 text-xs text-neutral-500" title="Pesquisas na API do Brave este mês / limite. A procura pára sozinha no limite, para nunca passares do crédito gratuito.">
            API {props.braveUsage.count}/
            <input
              type="number"
              min={0}
              defaultValue={props.braveUsage.limit}
              className="w-16 rounded border border-neutral-300 px-1 py-0.5 text-xs"
              onBlur={async (e) => {
                const v = Number(e.target.value);
                if (v >= 0 && v !== props.braveUsage.limit) {
                  await setBraveLimitAction(v);
                  router.refresh();
                }
              }}
            />
            este mês
          </span>
        )}
        {(ig.running || ig.done > 0 || ig.error) && (
          <span className="text-xs text-neutral-500">
            {ig.error ?? `${ig.running ? "A procurar" : "Procurados"} ${ig.done}/${ig.total} · ${ig.found} com sugestão`}
          </span>
        )}
        {suggestions > 0 && (
          <button type="button" className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200" onClick={() => (setStatus("sugestao"), setDivision(""), setClub(""), setQ(""))}>
            {suggestions} Instagram por confirmar →
          </button>
        )}
        {followUps > 0 && (
          <button type="button" className="rounded-md bg-sky-100 px-2 py-1 text-xs text-sky-800 hover:bg-sky-200" onClick={() => setStatus("seguimento")}>
            {followUps} para seguimento →
          </button>
        )}
        <button type="button" className="btn-ghost ml-auto" disabled={!props.prospects.length} onClick={() => setSending((v) => !v)}>
          {sending ? "Fechar modo envio" : `✉︎ Modo envio · ${left} hoje`}
        </button>
      </div>

      {/* Send mode: one player at a time, one click opens his conversation with the message ready to paste. */}
      {sending && (
        <div className="card space-y-4">
          {left === 0 ? (
            <p className="text-sm">Já enviaste {DAILY} mensagens hoje. Continua amanhã: assim a conta nunca é limitada.</p>
          ) : !current ? (
            <p className="text-sm">
              Não há jogadores &quot;novo&quot; com Instagram nos filtros atuais. Cola o @ de mais alguns na tabela (botão &quot;Procurar ↗&quot;) e eles entram na fila.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {current.thumb_url && <img src={current.thumb_url} alt="" className="h-14 w-14 rounded-full bg-neutral-100 object-cover" />}
                <div className="flex-1">
                  <div className="text-lg font-semibold">{current.name}</div>
                  <div className="muted">
                    {current.club} · {current.position} · @{current.instagram} · {LANG_LABEL[langFor(current)]}
                  </div>
                </div>
                <div className="text-sm text-neutral-500">
                  {queue.length} na fila · {props.contactedToday}/{DAILY} hoje
                </div>
              </div>
              <pre dir={langFor(current) === "ar" ? "rtl" : "ltr"} className="max-h-56 overflow-auto rounded-lg bg-neutral-50 p-4 text-[13px] whitespace-pre-wrap">{personalise(templates, "message", current)}</pre>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    openConversation(current.instagram, personalise(templates, "message", current));
                    await updateProspectAction(current.id, { status: "contactado" });
                    router.refresh();
                  }}
                >
                  Copiar e abrir conversa ↗
                </button>
                <button type="button" className="btn-ghost" onClick={() => setSkipped((s) => [...s, current.id])}>
                  Saltar
                </button>
              </div>
              <p className="muted">Na conversa que abre: cola (⌘V) e carrega em Enter. Ele fica marcado como contactado e aparece o seguinte.</p>
            </>
          )}
        </div>
      )}

      {props.prospects.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <input className="input max-w-60" placeholder="Procurar nome…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input max-w-56" value={division} onChange={(e) => (setDivision(e.target.value), setClub(""))}>
            <option value="">Todas as divisões</option>
            {divisions.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className="input max-w-56" value={club} onChange={(e) => setClub(e.target.value)}>
            <option value="">Todos os clubes</option>
            {clubs.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select className="input max-w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os estados</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option value="sugestao">Instagram por confirmar</option>
            <option value="seguimento">precisa de seguimento</option>
          </select>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs tracking-wide text-neutral-500 uppercase">
              <tr>
                <th className="px-4 py-3">Jogador</th>
                <th className="px-4 py-3">Clube</th>
                <th className="px-4 py-3">Instagram</th>
                <th className="px-4 py-3">Edit</th>
                <th className="px-4 py-3">Mensagem</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, SHOWN).map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 align-middle last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      {p.thumb_url ? <img src={p.thumb_url} alt="" className="h-10 w-10 rounded-full bg-neutral-100 object-cover" /> : <div className="h-10 w-10 rounded-full bg-neutral-100" />}
                      <div>
                        <a href={p.zz_url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                          {p.name}
                        </a>
                        <div className="text-xs text-neutral-500">
                          {p.position}
                          {p.age && ` · ${p.age}`}
                          {p.nationality && ` · ${p.nationality}`}
                        </div>
                        <select
                          title="Língua das mensagens dele (escolhida pela nacionalidade; muda aqui se for outra)"
                          className="mt-0.5 rounded border border-neutral-200 bg-white px-1 py-0.5 text-[11px] text-neutral-600"
                          value={langFor(p)}
                          onChange={async (e) => {
                            await updateProspectAction(p.id, { lang: e.target.value });
                            router.refresh();
                          }}
                        >
                          {LANGS.map((l) => (
                            <option key={l} value={l}>
                              {LANG_LABEL[l]}
                            </option>
                          ))}
                        </select>
                        <div className="hidden">
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div>{p.club}</div>
                    <div className="text-xs text-neutral-500">
                      {p.sport === "basketball" && (
                        <span className="mr-1 rounded bg-orange-100 px-1 py-px text-[10px] font-medium text-orange-800" title="Basquetebol: recebe as mensagens de basquetebol">
                          🏀
                        </span>
                      )}
                      {p.division}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        className="input w-40 py-1.5"
                        placeholder="@utilizador"
                        defaultValue={p.instagram ? `@${p.instagram}` : ""}
                        onBlur={async (e) => {
                          if (e.target.value.replace(/^@/, "") !== p.instagram) {
                            await updateProspectAction(p.id, { instagram: e.target.value });
                            router.refresh();
                          }
                        }}
                      />
                      {!p.instagram && <Suggestion p={p} onPick={async (h, ok) => (await igCandidateAction(p.id, h, ok), router.refresh())} />}
                      {p.instagram ? (
                        <a className="text-xs text-blue-600 hover:underline" href={`https://ig.me/m/${p.instagram}`} target="_blank" rel="noreferrer" title="Abre a conversa no Instagram">
                          Mensagem ↗
                        </a>
                      ) : (
                        <a
                          className="text-xs text-blue-600 hover:underline"
                          href={`https://www.google.com/search?q=${encodeURIComponent(`"${p.name}" ${p.club} instagram`)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Procura a conta dele no Google: confirma que é mesmo ele antes de colar"
                        >
                          Procurar ↗
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Sample p={p} onStart={(again) => (setSamples((s) => ({ ...s, [p.id]: { sample_status: "a sincronizar", sample_edit_id: null, player_id: p.player_id } })), prospectSampleAction(p.id, again))} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      {[
                        { key: "1", label: "1ª", kind: "message" as const, title: "Primeira mensagem: oferta de uma edição para o fim de semana, pede-lhe uma foto" },
                        { key: "2", label: "Planos", kind: "plans" as const, title: "Segunda mensagem: os planos, quando ele responder" },
                      ].map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          title={m.title}
                          className="btn-ghost px-3 py-1.5"
                          onClick={async () => {
                            copyText(personalise(templates, m.kind, p));
                            setCopied(p.id + m.key);
                            setTimeout(() => setCopied(null), 1500);
                          }}
                        >
                          {copied === p.id + m.key ? "Copiada ✓" : m.label}
                        </button>
                      ))}
                      {needsFollowUp(p) && p.instagram && (
                        <button
                          type="button"
                          title={`Sem resposta há ${FOLLOW_DAYS}+ dias: abre a conversa com o seguimento copiado`}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
                          onClick={async () => {
                            openConversation(p.instagram, personalise(templates, "followup", p));
                            await followUpProspectAction(p.id);
                            router.refresh();
                          }}
                        >
                          Seguimento ↗
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      className="input w-36 py-1.5"
                      value={p.status}
                      onChange={async (e) => {
                        await updateProspectAction(p.id, { status: e.target.value });
                        router.refresh();
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > SHOWN && <p className="muted px-4 py-3">A mostrar {SHOWN} de {filtered.length}: usa os filtros para ver os outros.</p>}
        </div>
      )}
    </div>
  );
}

/** The sample matchday cell: make it, follow it, open it (to check and export) or say why there is none. */
function Sample({ p, onStart }: { p: Row; onStart: (again: boolean) => void }) {
  const s = p.sample_status;
  if (BUSY.includes(s)) return <span className="text-xs text-neutral-500">{s}…</span>;
  if (s === "pronta" && p.sample_edit_id)
    return (
      <div className="flex items-center gap-2">
        <Link href={`/edits/${p.sample_edit_id}`} target="_blank" className="text-xs font-medium text-blue-600 hover:underline">
          Ver e exportar ↗
        </Link>
        {p.player_id && (
          <Link href={`/jogadores/${p.player_id}`} target="_blank" className="text-xs text-blue-600 hover:underline" title="Quando ele te mandar a foto: carrega-a aqui e escolhe-a na edit">
            foto dele ↗
          </Link>
        )}
        <button type="button" className="text-xs text-neutral-500 hover:underline" onClick={() => onStart(true)}>
          refazer
        </button>
      </div>
    );
  return (
    <div className="text-xs">
      {s.startsWith("erro") && <div className="mb-1 max-w-48 text-red-600">{s}</div>}
      <button type="button" className="btn-ghost py-1.5" onClick={() => onStart(!!s)}>
        Preparar edit
      </button>
    </div>
  );
}

/** The best Instagram account the search found for him: open it to check, ✓ to keep it, ✗ for the next one. */
function Suggestion({ p, onPick }: { p: Row; onPick: (handle: string, ok: boolean) => void }) {
  const c = (JSON.parse(p.ig_candidates || "[]") as { h: string; s: number }[])[0];
  if (!c) return p.ig_checked_at ? <span className="text-xs text-neutral-400" title="A procura não encontrou nenhuma conta com o nome dele">—</span> : null;
  return (
    <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs">
      <a href={`https://www.instagram.com/${c.h}/`} target="_blank" rel="noreferrer" className="text-amber-900 hover:underline" title="Abre o perfil para confirmares que é ele">
        @{c.h}?
      </a>
      <button type="button" title="É ele" className="px-1 text-green-700 hover:bg-green-100" onClick={() => onPick(c.h, true)}>
        ✓
      </button>
      <button type="button" title="Não é ele" className="px-1 text-red-600 hover:bg-red-100" onClick={() => onPick(c.h, false)}>
        ✗
      </button>
    </span>
  );
}
