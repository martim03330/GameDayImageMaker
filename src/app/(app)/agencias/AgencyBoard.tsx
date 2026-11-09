"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  agencyEmailSearchAction,
  agencyEmailSearchStateAction,
  agencyFollowUpAction,
  agencyScanAction,
  agencyScanStateAction,
  saveAgencyEmailTemplatesAction,
  saveAgencyTemplatesAction,
  updateAgencyAction,
} from "@/app/actions";
import { fillAgency, mailtoUrl, type AgencyEmailTemplates, type AgencyTemplates } from "@/lib/agencies/messages";
import type { Agency } from "@/lib/agencies/store";
import { copyText } from "@/lib/clipboard";

type Scan = { running: boolean; done: number; total: number; error: string | null; finished: string | null };

const STATUSES = ["novo", "contactado", "respondeu", "teste", "cliente", "sem interesse"];
const DESIGNER = ["por ver", "sem designer", "tem designer"];
const DAILY = 20;
const FOLLOW_DAYS = 3;
/** Emails get answered more slowly than Instagram messages. */
const EMAIL_FOLLOW_DAYS = 5;
const SHOWN = 150;

/** Portuguese for agencies based in Portugal, English otherwise. */
const langFor = (a: Agency): "pt" | "en" => (a.country === "Portugal" || !a.country ? "pt" : "en");
const message = (t: Record<"pt" | "en", AgencyTemplates>, kind: keyof AgencyTemplates, a: Agency) => fillAgency(t[langFor(a)][kind], { agencia: a.name, jogadores: a.players }, a.id);
const needsFollowUp = (a: Agency) =>
  a.status === "contactado" && !!a.contacted_at && !a.followed_up_at && Date.now() - new Date(a.contacted_at).getTime() >= (a.no_instagram ? EMAIL_FOLLOW_DAYS : FOLLOW_DAYS) * 864e5;

type EmailSearch = { running: boolean; done: number; total: number; found: number; error: string | null };

/** The management-offer email for one agency (subject + text), in its language. */
function email(t: Record<"pt" | "en", AgencyEmailTemplates>, a: Agency, followup = false): { subject: string; body: string } {
  const tpl = t[langFor(a)];
  const v = { agencia: a.name, jogadores: a.players };
  return { subject: fillAgency(followup ? tpl.followupSubject : tpl.subject, v, a.id), body: fillAgency(followup ? tpl.followup : tpl.body, v, a.id) };
}

/** Copies the message FIRST (while this page has focus), then opens the agency's Instagram conversation. */
function openConversation(handle: string, text: string) {
  copyText(text);
  window.open(`https://ig.me/m/${handle}`, "_blank", "noopener");
}

export function AgencyBoard(props: {
  agencies: Agency[];
  templates: Record<"pt" | "en", AgencyTemplates>;
  emailTemplates: Record<"pt" | "en", AgencyEmailTemplates>;
  emailSearch: EmailSearch;
  scan: Scan;
  contactedToday: number;
}) {
  const router = useRouter();
  const [scan, setScan] = useState(props.scan);
  const [q, setQ] = useState("");
  const [designer, setDesigner] = useState("");
  const [status, setStatus] = useState("");
  const [minPlayers, setMinPlayers] = useState(0);
  const [sending, setSending] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [editing, setEditing] = useState<"pt" | "en" | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [ig, setIg] = useState("");
  const [emailSearch, setEmailSearch] = useState(props.emailSearch);
  const [editingEmail, setEditingEmail] = useState<"pt" | "en" | null>(null);
  const [emailDraft, setEmailDraft] = useState<AgencyEmailTemplates>(props.emailTemplates.pt);
  const [draft, setDraft] = useState<AgencyTemplates>(props.templates.pt);

  useEffect(() => {
    if (!scan.running) return;
    const t = setInterval(async () => {
      const s = await agencyScanStateAction();
      setScan(s);
      if (!s.running) router.refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [scan.running, router]);

  // While the email search runs: poll it, refresh the list when it ends.
  useEffect(() => {
    if (!emailSearch.running) return;
    const t = setInterval(async () => {
      const s = await agencyEmailSearchStateAction();
      setEmailSearch(s);
      if (!s.running) router.refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [emailSearch.running, router]);
  const noEmail = props.agencies.filter((a) => a.no_instagram && !a.email).length;

  const shown = useMemo(
    () =>
      props.agencies.filter(
        (a) =>
          (!q || a.name.toLowerCase().includes(q.toLowerCase())) &&
          (!designer || a.designer === designer) &&
          (!status || (status === "seguimento" ? needsFollowUp(a) : a.status === status)) &&
          a.players >= minPlayers &&
          (!ig || (ig === "com" ? !!a.instagram : ig === "falta" ? !a.instagram && !a.no_instagram : !!a.no_instagram)),
      ),
    [props.agencies, q, designer, status, minPlayers, ig],
  );
  // Send queue: new, with an Instagram, not known to have a designer, biggest first.
  const queue = props.agencies.filter((a) => a.status === "novo" && a.instagram && a.designer !== "tem designer" && !skipped.includes(a.id));
  const current = queue[0];
  const left = Math.max(0, DAILY - props.contactedToday);
  const followUps = props.agencies.filter(needsFollowUp).length;

  async function patch(id: string, p: Parameters<typeof updateAgencyAction>[1]) {
    await updateAgencyAction(id, p);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn"
          disabled={scan.running}
          onClick={async () => {
            await agencyScanAction();
            setScan({ ...scan, running: true, done: 0, total: 0, error: null });
          }}
        >
          Atualizar lista
        </button>
        <span className="muted">
          {scan.error ??
            (scan.running
              ? `A ler o Transfermarkt ${scan.done}/${scan.total || "…"}`
              : scan.finished
                ? `${props.agencies.length} agências · atualizado em ${new Date(scan.finished).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}`
                : `${props.agencies.length} agências`)}
        </span>
        {followUps > 0 && (
          <button type="button" className="rounded-md bg-sky-100 px-2 py-1 text-xs text-sky-800 hover:bg-sky-200" onClick={() => setStatus("seguimento")}>
            {followUps} para seguimento →
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={() => (setEditing(editing ? null : "pt"), setDraft(props.templates.pt))}>
          {editing ? "Fechar mensagens" : "Editar mensagens"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => (setEditingEmail(editingEmail ? null : "pt"), setEmailDraft(props.emailTemplates.pt))}>
          {editingEmail ? "Fechar emails" : "Editar emails"}
        </button>
        {(noEmail > 0 || emailSearch.running || emailSearch.done > 0) && (
          <span className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ghost"
              disabled={emailSearch.running || noEmail === 0}
              title="Procura o email das agências marcadas sem Instagram (site e Transfermarkt)"
              onClick={async () => {
                await agencyEmailSearchAction();
                setEmailSearch({ running: true, done: 0, total: noEmail, found: 0, error: null });
              }}
            >
              Procurar emails ({noEmail})
            </button>
            {(emailSearch.running || emailSearch.done > 0) && (
              <span className="text-xs text-neutral-500">{emailSearch.error ?? `${emailSearch.running ? "A procurar" : "Procurados"} ${emailSearch.done}/${emailSearch.total} · ${emailSearch.found} encontrados`}</span>
            )}
          </span>
        )}
        <button type="button" className="btn-ghost ml-auto" onClick={() => setSending((v) => !v)}>
          {sending ? "Fechar modo envio" : `✉︎ Modo envio · ${left} hoje`}
        </button>
      </div>

      {editing && (
        <div className="card space-y-3">
          <div className="flex gap-2">
            {(["pt", "en"] as const).map((l) => (
              <button key={l} type="button" className={l === editing ? "btn px-3 py-1.5" : "btn-ghost px-3 py-1.5"} onClick={() => (setEditing(l), setDraft(props.templates[l]))}>
                {l === "pt" ? "Português" : "English"}
              </button>
            ))}
          </div>
          <p className="muted">
            {"{agencia}"} e {"{jogadores}"} são preenchidos por agência; {"{{a|b}}"} escolhe uma variação por agência, para as mensagens não saírem iguais.
          </p>
          <label className="label">Primeira mensagem</label>
          <textarea className="input h-56 font-mono text-xs" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
          <label className="label">Planos (quando responderem)</label>
          <textarea className="input h-40 font-mono text-xs" value={draft.plans} onChange={(e) => setDraft({ ...draft, plans: e.target.value })} />
          <label className="label">Seguimento</label>
          <textarea className="input h-24 font-mono text-xs" value={draft.followup} onChange={(e) => setDraft({ ...draft, followup: e.target.value })} />
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await saveAgencyTemplatesAction(editing, draft);
              router.refresh();
            }}
          >
            Guardar
          </button>
        </div>
      )}

      {editingEmail && (
        <div className="card space-y-3">
          <div className="flex gap-2">
            {(["pt", "en"] as const).map((l) => (
              <button key={l} type="button" className={l === editingEmail ? "btn px-3 py-1.5" : "btn-ghost px-3 py-1.5"} onClick={() => (setEditingEmail(l), setEmailDraft(props.emailTemplates[l]))}>
                {l === "pt" ? "Português" : "English"}
              </button>
            ))}
          </div>
          <p className="muted">Email para as agências sem Instagram: criação e gestão da conta. {"{agencia}"}, {"{jogadores}"} e {"{{a|b}}"} funcionam como nas mensagens.</p>
          <label className="label">Assunto</label>
          <input className="input" value={emailDraft.subject} onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })} />
          <label className="label">Email</label>
          <textarea className="input h-72 font-mono text-xs" value={emailDraft.body} onChange={(e) => setEmailDraft({ ...emailDraft, body: e.target.value })} />
          <label className="label">Assunto do seguimento</label>
          <input className="input" value={emailDraft.followupSubject} onChange={(e) => setEmailDraft({ ...emailDraft, followupSubject: e.target.value })} />
          <label className="label">Seguimento</label>
          <textarea className="input h-32 font-mono text-xs" value={emailDraft.followup} onChange={(e) => setEmailDraft({ ...emailDraft, followup: e.target.value })} />
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await saveAgencyEmailTemplatesAction(editingEmail, emailDraft);
              router.refresh();
            }}
          >
            Guardar
          </button>
        </div>
      )}

      {sending && (
        <div className="card space-y-4">
          {left === 0 ? (
            <p className="text-sm">Já enviaste {DAILY} mensagens hoje. Continua amanhã: assim a conta nunca é limitada.</p>
          ) : !current ? (
            <p className="text-sm">Não há agências &quot;novo&quot; com Instagram (e sem designer). Cola o @ de mais algumas na tabela.</p>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-lg font-semibold">{current.name}</div>
                  <div className="muted">
                    {current.players} jogadores · @{current.instagram} · designer: {current.designer}
                  </div>
                </div>
                <div className="text-sm text-neutral-500">
                  {queue.length} na fila · {props.contactedToday}/{DAILY} hoje
                </div>
              </div>
              <pre className="max-h-64 overflow-auto rounded-lg bg-neutral-50 p-4 text-[13px] whitespace-pre-wrap">{message(props.templates, "message", current)}</pre>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    openConversation(current.instagram, message(props.templates, "message", current));
                    await patch(current.id, { status: "contactado" });
                  }}
                >
                  Copiar e abrir conversa ↗
                </button>
                <a className="btn-ghost" href={`https://www.instagram.com/${current.instagram}/`} target="_blank" rel="noreferrer">
                  Ver perfil ↗
                </a>
                <button type="button" className="btn-ghost" onClick={() => setSkipped((s) => [...s, current.id])}>
                  Saltar
                </button>
              </div>
              <p className="muted">Na conversa que abre: cola (⌘V) e carrega em Enter. Se vires que já tem designer, marca-o na tabela e salta.</p>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input className="input max-w-60" placeholder="Procurar agência…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-48" value={designer} onChange={(e) => setDesigner(e.target.value)}>
          <option value="">Designer: todas</option>
          {DESIGNER.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select className="input max-w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos os estados</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option value="seguimento">para seguimento</option>
        </select>
        <select className="input max-w-48" value={minPlayers} onChange={(e) => setMinPlayers(Number(e.target.value))}>
          {[0, 5, 10, 20, 40].map((n) => (
            <option key={n} value={n}>
              {n ? `${n}+ jogadores` : "Qualquer tamanho"}
            </option>
          ))}
        </select>
        <select className="input max-w-52" value={ig} onChange={(e) => setIg(e.target.value)}>
          <option value="">Instagram: todas</option>
          <option value="com">Com Instagram</option>
          <option value="falta">Sem @ (por procurar)</option>
          <option value="sem">Não têm Instagram</option>
        </select>
        <span className="muted self-center">{shown.length} agências</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs tracking-wide text-neutral-500 uppercase">
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3">Agência</th>
              <th className="px-4 py-3">Jogadores</th>
              <th className="px-4 py-3">Instagram</th>
              <th className="px-4 py-3">Mensagens</th>
              <th className="px-4 py-3">Designer</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, SHOWN).map((a) => (
              <tr key={a.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">
                  <a href={a.tm_url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                    {a.name}
                  </a>
                  {a.website && (
                    <a href={a.website} target="_blank" rel="noreferrer" className="muted ml-2 hover:underline">
                      site ↗
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">{a.players}</td>
                <td className="px-4 py-3">
                  {a.no_instagram ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">Não tem Instagram</span>
                      <button type="button" className="text-xs text-neutral-500 hover:underline" onClick={() => patch(a.id, { no_instagram: 0 })}>
                        afinal tem
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      <input
                        key={a.instagram}
                        className="input py-1.5"
                        style={{ width: 170 }}
                        placeholder="@utilizador"
                        defaultValue={a.instagram ? `@${a.instagram}` : ""}
                        onBlur={(e) => e.target.value.replace(/^@/, "").trim() !== a.instagram && patch(a.id, { instagram: e.target.value })}
                      />
                      <div className="flex gap-3">
                        {a.instagram ? (
                          <a className="text-xs whitespace-nowrap text-blue-600 hover:underline" href={`https://ig.me/m/${a.instagram}`} target="_blank" rel="noreferrer" title="Abre a conversa no Instagram">
                            Mensagem ↗
                          </a>
                        ) : (
                          <>
                            <a
                              className="text-xs whitespace-nowrap text-blue-600 hover:underline"
                              href={`https://www.google.com/search?q=${encodeURIComponent(`"${a.name}" agência futebol instagram`)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Procura a conta da agência no Google: confirma que é mesmo ela antes de colar"
                            >
                              Procurar ↗
                            </a>
                            <button type="button" className="text-xs whitespace-nowrap text-neutral-500 hover:underline" title="Confirmaste que não tem Instagram: passa à proposta por email" onClick={() => patch(a.id, { no_instagram: 1 })}>
                              Não tem
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {a.no_instagram ? (
                    <div className="flex flex-col items-start gap-1.5">
                      <input
                        key={a.email}
                        className="input py-1.5"
                        style={{ width: 210 }}
                        placeholder="email da agência"
                        defaultValue={a.email}
                        title={a.email_source && a.email_source !== "manual" ? `Encontrado em ${a.email_source}` : undefined}
                        onBlur={(e) => e.target.value.trim().toLowerCase() !== a.email && patch(a.id, { email: e.target.value })}
                      />
                      <div className="flex gap-1.5">
                        <a
                          className={a.email ? "btn px-3 py-1.5" : "btn pointer-events-none px-3 py-1.5 opacity-40"}
                          href={a.email ? mailtoUrl(a.email, email(props.emailTemplates, a).subject, email(props.emailTemplates, a).body) : undefined}
                          title="Abre o teu programa de email com o email já escrito: revê e envia"
                          onClick={() => a.status === "novo" && patch(a.id, { status: "contactado" })}
                        >
                          Abrir email ↗
                        </a>
                        <button
                          type="button"
                          className="btn-ghost px-3 py-1.5"
                          title="Copia o assunto e o texto (para o Gmail no browser)"
                          onClick={() => {
                            const m = email(props.emailTemplates, a);
                            copyText(`${m.subject}\n\n${m.body}`);
                            setCopied(a.id + "e");
                            setTimeout(() => setCopied(null), 1500);
                          }}
                        >
                          {copied === a.id + "e" ? "Copiado ✓" : "Copiar"}
                        </button>
                        {needsFollowUp(a) && a.email && (
                          <a
                            className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
                            href={mailtoUrl(a.email, email(props.emailTemplates, a, true).subject, email(props.emailTemplates, a, true).body)}
                            title={`Sem resposta há ${EMAIL_FOLLOW_DAYS}+ dias: abre o email de seguimento`}
                            onClick={async () => {
                              await agencyFollowUpAction(a.id);
                              router.refresh();
                            }}
                          >
                            Seguimento ✉
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      {[
                        { key: "1", label: "1ª", kind: "message" as const, title: "Primeira mensagem: a proposta, com o teste grátis para 3 jogadores" },
                        { key: "2", label: "Planos", kind: "plans" as const, title: "Segunda mensagem: os planos e preços, quando responderem" },
                      ].map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          title={m.title}
                          className="btn-ghost px-3 py-1.5"
                          onClick={() => {
                            copyText(message(props.templates, m.kind, a));
                            setCopied(a.id + m.key);
                            setTimeout(() => setCopied(null), 1500);
                          }}
                        >
                          {copied === a.id + m.key ? "Copiada ✓" : m.label}
                        </button>
                      ))}
                      {needsFollowUp(a) && a.instagram && (
                        <button
                          type="button"
                          title={`Sem resposta há ${FOLLOW_DAYS}+ dias: abre a conversa com o seguimento copiado`}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
                          onClick={async () => {
                            openConversation(a.instagram, message(props.templates, "followup", a));
                            await agencyFollowUpAction(a.id);
                            router.refresh();
                          }}
                        >
                          Seguimento ↗
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select className="rounded border border-neutral-300 px-2 py-1 text-xs" value={a.designer} onChange={(e) => patch(a.id, { designer: e.target.value })}>
                    {DESIGNER.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select className="rounded border border-neutral-300 px-2 py-1 text-xs" value={a.status} onChange={(e) => patch(a.id, { status: e.target.value })}>
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input className="w-32 rounded border border-neutral-300 px-2 py-1 text-xs" defaultValue={a.note} onBlur={(e) => e.target.value !== a.note && patch(a.id, { note: e.target.value })} />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {(a.status === "teste" || a.status === "cliente") && (
                    <Link href={`/agencias/${a.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                      Abrir cliente →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length > SHOWN && <p className="muted px-4 py-3">A mostrar {SHOWN} de {shown.length}: usa os filtros.</p>}
      </div>
    </div>
  );
}
