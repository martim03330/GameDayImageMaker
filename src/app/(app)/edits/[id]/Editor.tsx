"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chatEditAction, deleteEditAction, generateEditSceneAction, saveEditAction, sceneJobAction, setEditPostedAction, toggleLookAction } from "@/app/actions";
import { WelcomeControls } from "@/components/WelcomeControls";
import { FormControls } from "@/components/FormControls";
import { ContentFields, type ClubOption, type PhotoOption } from "@/components/ContentFields";
import { BackLink } from "@/components/BackLink";
import { CutoutFixer } from "@/components/CutoutFixer";
import { Preview } from "@/components/Preview";
import { ReportError } from "@/components/ReportError";
import { FINISHES, POST_TYPES, TITLE_FONTS, type ChatMessage, type Edit, type TemplateParams } from "@/lib/types";
import { snapToCircle } from "@/lib/snap-circle";
import { templatesFor } from "@/templates";
import { composeRenderData, type RenderContext } from "@/templates/compose";
import { Series } from "./Series";

const CHECKER = "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%) 50% / 12px 12px";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const nextBg = { rays: "pitch", pitch: "photo", photo: "rays" } as const;

const CHAT_IDEAS = ["Põe o jogador um bocadinho mais à direita", "Fundo mais escuro", "Nome maior", "Usa a outra foto"];

export function Editor({
  edit,
  playerName,
  clubColors,
  aiOn,
  ctx,
  photos,
  clubs,
  hiddenLooks,
  otherPlayers,
}: {
  otherPlayers: { id: string; name: string; club: string }[];
  edit: Edit;
  playerName: string;
  clubColors: { primary: string; accent: string };
  aiOn: boolean;
  hiddenLooks: string[];
  ctx: RenderContext;
  photos: PhotoOption[];
  clubs: ClubOption[];
}) {
  const [posted, setPosted] = useState<string | null>(edit.posted_at ?? null);
  const [params, setParams] = useState(edit.params);
  // Looks removed with the little × (kept here too so they vanish at once).
  const [removed, setRemoved] = useState<string[]>(hiddenLooks);
  const [content, setContent] = useState(edit.content);
  const [photoId, setPhotoId] = useState(edit.photo_id);
  const router = useRouter();
  // The cutout touch-up (components/CutoutFixer) for the photo in use; the page reloads its data after a save.
  const [fixing, setFixing] = useState(false);
  // Welcome posts use three photos: the portrait, him playing (laid over it) and the black-and-white one.
  const welcome = edit.post_type === "welcome";
  const [status, setStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"image" | "video" | null>(null);
  const [lastFile, setLastFile] = useState<{ url: string; name: string } | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>(edit.chat);
  const [message, setMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  // A backdrop generated only for this edit: job id while the Mac is making it (~2 min).
  const [sceneJob, setSceneJob] = useState<string | null>(null);
  const [sceneMsg, setSceneMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!sceneJob) return;
    const t = setInterval(async () => {
      const r = await sceneJobAction(sceneJob);
      if (r.status === "done" && r.url) {
        setParams((cur) => ({ ...cur, scene: r.url! }));
        setSceneJob(null);
        setSceneMsg("Cenário novo aplicado ✓ — só esta edit o usa.");
      } else if (r.status === "error" || r.status === "done") {
        setSceneJob(null);
        setSceneMsg("Não foi possível gerar o cenário. Tenta outra vez.");
      }
    }, 5000);
    return () => clearInterval(t);
  }, [sceneJob]);

  async function newScene() {
    setSceneMsg("A gerar um cenário só para esta edit neste Mac (cerca de 2 minutos)… podes continuar a editar.");
    await save();
    setSceneJob(await generateEditSceneAction(edit.id));
  }

  useEffect(() => chatEnd.current?.scrollIntoView({ block: "nearest" }), [chat]);

  const patch = (p: Partial<TemplateParams>) => setParams((cur) => ({ ...cur, ...p }));
  const nudge = (k: "playerX" | "playerY", d: number) => patch({ [k]: clamp((params[k] ?? 0) + d, -400, 400) });
  const scale = (k: "playerScale" | "textScale", d: number) =>
    patch({
      [k]: clamp(Math.round(((params[k] ?? 1) + d) * 100) / 100, 0.6, 1.5),
    });

  const data = composeRenderData(ctx, {
    postType: edit.post_type,
    photoId,
    params,
    content,
  });
  // Form carousel: three slides, each with its own photo (slide 1 is the edit's main photo).
  const carousel = edit.post_type === "form";
  const slidePhotos = [photoId, content.slidePhotos?.[1] ?? photoId, content.slidePhotos?.[2] ?? photoId];
  const slideData = (i: number) => composeRenderData(ctx, { postType: edit.post_type, photoId: slidePhotos[i], params: { ...params, slide: (i + 1) as 1 | 2 | 3 }, content });
  /**
   * Exports the 3 slides in ONE download (a ZIP): browsers block a page's 2nd and 3rd automatic downloads, so
   * one-by-one only delivered the first. The server also saves the three JPEGs in Downloads/GameDay.
   */
  async function exportCarousel(format: "post" | "story" = "post") {
    if (exporting) return;
    setExporting("image");
    setStatus("A exportar o carrossel (3 imagens)…");
    try {
      await save();
      const res = await fetch(`/api/edits/${edit.id}/carousel?format=${format}`, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "carrossel.zip";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      const saved = decodeURIComponent(res.headers.get("X-Saved-To") ?? "");
      setStatus(`Carrossel pronto ✓ — as 3 imagens ${format === "story" ? "story (1080×1920)" : "(1080×1350)"} ${saved ? `estão em ${saved} (…-1de3, -2de3, -3de3)` : ""} e no ZIP ${name}. Publica-as por esta ordem.`);
    } catch (e) {
      setStatus(`Não foi possível exportar o carrossel (${e instanceof Error ? e.message : "erro"}). Tenta outra vez.`);
    } finally {
      setExporting(null);
    }
  }
  const insetUrl = content.insetPhotoId ? ctx.photos[content.insetPhotoId]?.url : null;
  // Removed looks stay out of the list, except the one this edit already uses.
  const looks = templatesFor(edit.post_type).filter((t) => !removed.includes(t.id) || t.id === params.templateId);
  const removeLook = (id: string, label: string) => {
    if (!confirm(`Retirar o estilo "${label}" de vez? Deixa de aparecer nas variantes e aqui. Pode repor-se no Catálogo.`)) return;
    setRemoved((r) => [...r, id]);
    void toggleLookAction(id);
  };

  const save = () =>
    saveEditAction({
      id: edit.id,
      player_id: edit.player_id,
      post_type: edit.post_type,
      photo_id: photoId,
      params,
      content,
    });

  async function exportFile(opts: { format?: "post" | "story"; video?: boolean; png?: boolean; pdf?: boolean } = {}) {
    const { format = "post", video = false, png = false, pdf = false } = opts;
    if (exporting) return;
    setExporting(video ? "video" : "image");
    setStatus(video ? "A gerar o vídeo em alta qualidade (cerca de 2 minutos)… não feches esta página." : "A exportar em alta qualidade…");
    try {
      await save();
      // Fetch the whole file first, then save it: a plain navigation could be cancelled by another click
      // or by leaving the page while the video was still being generated, and the download never appeared.
      const res = await fetch(`/api/edits/${edit.id}/export?format=${format}${video ? "&video=1" : ""}${png ? "&png=1" : ""}${pdf ? "&pdf=1" : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("ficheiro vazio");
      const savedTo = decodeURIComponent(res.headers.get("X-Saved-To") ?? "");
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `edit.${pdf ? "pdf" : video ? "mp4" : png ? "png" : "jpg"}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setLastFile((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url, name };
      });
      setStatus(
        `${pdf ? "PDF vetorial pronto ✓ (história 1080×1920: letras e logo sem pixelizar)" : video ? "Vídeo pronto ✓ (MP4, 3 s)" : png ? "PNG máximo ✓ (2160×2700, para arquivo)" : format === "story" ? "Story pronta ✓ (JPG 1080×1920 + PNG em alta qualidade)" : "Pronta ✓ (JPG 1080×1350 para o Instagram + PNG 2160×2700 em alta qualidade)"} — ${savedTo ? `guardado em ${savedTo}` : `guardado em Transferências como ${name}`}`,
      );
    } catch (e) {
      setStatus(`Não foi possível exportar (${e instanceof Error ? e.message : "erro"}). Tenta outra vez.`);
    } finally {
      setExporting(null);
    }
  }
  const exportPng = () => exportFile();

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    setThinking(true);
    setMessage("");
    setChat((c) => [...c, { role: "user", text }]);
    try {
      const out = await chatEditAction({
        editId: edit.id,
        message: text,
        params,
        content,
        photoId,
      });
      setParams(out.params);
      setContent(out.content);
      setPhotoId(out.photoId);
      setChat(out.chat.length ? out.chat : (c) => [...c, { role: "assistant", text: out.reply }]);
    } catch {
      setChat((c) => [...c, { role: "assistant", text: "Algo correu mal. Tenta outra vez." }]);
    } finally {
      setThinking(false);
    }
  }

  const Quick = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button type="button" onClick={onClick} className="rounded-lg bg-neutral-100 px-3 py-2 text-sm hover:bg-neutral-200">
      {label}
    </button>
  );

  return (
    <div>
      <BackLink fallback="/" />
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Stays in view while scrolling through the looks and nudges on the right. */}
        <section className="flex flex-col items-center gap-4 lg:sticky lg:top-24 lg:self-start">
          {carousel ? (
            <div className="grid w-full grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Preview data={slideData(i)} />
                  </div>
                  <p className="mt-1.5 text-center text-xs text-neutral-500">{i + 1} de 3</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-[620px] overflow-hidden rounded-xl shadow-xl lg:max-w-[min(620px,calc((100vh-10rem)*0.8))]">
              <Preview data={data} />
            </div>
          )}
          <Link href={`/criar?player=${edit.player_id}&type=${edit.post_type}`} className="muted hover:text-neutral-900">
            ← Ver outras variantes
          </Link>
        </section>

        <aside className="space-y-6">
          <div>
            <p className="muted">{POST_TYPES.find((t) => t.id === edit.post_type)?.label}</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              <Link href={`/jogadores/${edit.player_id}`} className="hover:underline">
                {playerName}
              </Link>
            </h1>
          </div>

          {carousel && (
            <div className="card space-y-3 p-5">
              <span className="label">Carrossel do Instagram</span>
              <div className="flex flex-wrap gap-2">
                <button className="btn flex-1 bg-neutral-900 text-white hover:bg-neutral-700" onClick={() => exportCarousel("post")} disabled={!!exporting}>
                  ⬇ Exportar as 3 imagens
                </button>
                <button className="btn-ghost" onClick={() => exportCarousel("story")} disabled={!!exporting}>
                  3 stories
                </button>
              </div>
              <FormControls
                photos={photos}
                slidePhotos={slidePhotos}
                onSlidePhoto={(i, id) => (i === 0 ? setPhotoId(id) : setContent({ ...content, slidePhotos: slidePhotos.map((x, j) => (j === i ? id : x)) }))}
                params={params}
                onParams={setParams}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button className="btn flex-1" onClick={exportPng} disabled={!!exporting}>
              {carousel ? "⬇ Só a capa" : "⬇ Exportar para Instagram"}
            </button>
            <button className="btn-ghost" onClick={() => exportFile({ png: true })} disabled={!!exporting} title="PNG 2160×2700, para arquivo ou impressão">
              PNG máximo
            </button>
            <button className="btn-ghost" onClick={() => exportFile({ format: "story", pdf: true })} disabled={!!exporting} title="História 1080×1920 em PDF: letras, logo e formas vetoriais (zoom sem pixelizar), para imprimir ou enviar">
              PDF vetorial
            </button>
            <button className="btn-ghost" onClick={() => exportFile({ format: "story" })} disabled={!!exporting}>
              Story
            </button>
            <button className="btn-ghost" onClick={() => exportFile({ video: true })} disabled={!!exporting}>
              ▶ Vídeo
            </button>
            <button className="btn-ghost" onClick={() => exportFile({ format: "story", video: true })} disabled={!!exporting}>
              ▶ Vídeo story
            </button>
            <button
              className="btn-ghost"
              onClick={async () => {
                await save();
                setStatus("Guardado ✓");
              }}
            >
              Guardar
            </button>
            <button
              className={posted ? "btn" : "btn-ghost"}
              title="Marca esta edit como a publicada: o estilo deixa de ser proposto para este jogador (recupera-se no Histórico)."
              onClick={async () => {
                if (!posted) await save();
                await setEditPostedAction(edit.id, !posted);
                setPosted(posted ? null : new Date().toISOString());
                setStatus(posted ? "Já não está marcada para o fim de semana." : "Escolhida para o fim de semana ✓ Este estilo não volta a aparecer para este jogador.");
              }}
            >
              {posted ? "✓ Escolhida para o fim de semana" : "Usar no fim de semana"}
            </button>
            <ReportError
              playerId={edit.player_id}
              editId={edit.id}
              photoId={photoId}
              postType={edit.post_type}
              params={params}
              content={content}
              onReported={() => setStatus("Obrigado! Este erro fica registado e o programa passa a evitá-lo.")}
            />
          </div>
          {status && <p className={`text-sm ${status.startsWith("Não foi") ? "text-red-700" : "text-green-700"}`}>{status}</p>}
          {lastFile && !exporting && (
            <a href={lastFile.url} download={lastFile.name} className="muted text-sm underline hover:text-neutral-900">
              Não apareceu? Descarregar outra vez ({lastFile.name})
            </a>
          )}

          <Series editId={edit.id} playerName={playerName} players={otherPlayers} save={save} />

          <div className="card space-y-4 p-5">
            <span className="label">Assistente</span>
            {!aiOn && (
              <p className="text-xs text-amber-700">
                O chat de IA liga-se quando a chave da API estiver configurada. Os botões em baixo funcionam sempre.
              </p>
            )}
            {chat.length > 0 && (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-xl px-3.5 py-2 text-sm ${m.role === "user" ? "ml-8 bg-neutral-900 text-white" : "mr-8 bg-neutral-100"}`}
                  >
                    {m.text}
                  </div>
                ))}
                {thinking && <div className="mr-8 rounded-xl bg-neutral-100 px-3.5 py-2 text-sm text-neutral-500">A pensar…</div>}
                <div ref={chatEnd} />
              </div>
            )}
            {chat.length === 0 && aiOn && (
              <div className="flex flex-wrap gap-1.5">
                {CHAT_IDEAS.map((t) => (
                  <button
                    key={t}
                    onClick={() => send(t)}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(message);
              }}
              className="flex gap-2"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!aiOn || thinking}
                className="input"
                placeholder="Ex.: põe o nome maior e o fundo mais escuro"
              />
              <button className="btn" disabled={!aiOn || thinking || !message.trim()}>
                Enviar
              </button>
            </form>
          </div>

          <div className="card space-y-4 p-5">
            <span className="label">Ajustes rápidos</span>
            <div className="flex flex-wrap gap-2">
              <Quick label="← Jogador" onClick={() => nudge("playerX", -40)} />
              <Quick label="Jogador →" onClick={() => nudge("playerX", 40)} />
              <Quick label="↑" onClick={() => nudge("playerY", -40)} />
              <Quick label="↓" onClick={() => nudge("playerY", 40)} />
              <Quick label="Jogador maior" onClick={() => scale("playerScale", 0.08)} />
              <Quick label="Jogador menor" onClick={() => scale("playerScale", -0.08)} />
              <Quick label="Nome maior" onClick={() => scale("textScale", 0.06)} />
              <Quick label="Nome menor" onClick={() => scale("textScale", -0.06)} />
              {/* The logo grows from its foot and the text above it moves up with it (templates/LogoLift). */}
              <Quick label="Logo maior" onClick={() => patch({ logoScale: Math.min(2, +((params.logoScale ?? 1) + 0.1).toFixed(2)) })} />
              <Quick label="Logo menor" onClick={() => patch({ logoScale: Math.max(0.5, +((params.logoScale ?? 1) - 0.1).toFixed(2)) })} />
              {/* The logo alone moves; the text stays. It never leaves the canvas (templates/LogoLift). */}
              <Quick label="Logo ← esquerda" onClick={() => patch({ logoMoveX: clamp((params.logoMoveX ?? 0) - 40, -480, 480) })} />
              <Quick label="Logo direita →" onClick={() => patch({ logoMoveX: clamp((params.logoMoveX ?? 0) + 40, -480, 480) })} />
              <Quick label="Logo ↑ cima" onClick={() => patch({ logoMoveY: clamp((params.logoMoveY ?? 0) - 40, -1900, 1900) })} />
              <Quick label="Logo ↓ baixo" onClick={() => patch({ logoMoveY: clamp((params.logoMoveY ?? 0) + 40, -1900, 1900) })} />
              {((params.logoScale ?? 1) !== 1 || params.logoMoveX || params.logoMoveY) && (
                <Quick label={`Logo ${Math.round((params.logoScale ?? 1) * 100)}% · repor`} onClick={() => patch({ logoScale: 1, logoMoveX: 0, logoMoveY: 0 })} />
              )}
              <Quick
                label="⇄ Trocar lado"
                onClick={() =>
                  patch({
                    side: params.side === "left" ? "right" : "left",
                    playerX: 0,
                  })
                }
              />
              <Quick label="Outro fundo" onClick={() => patch({ bgStyle: nextBg[params.bgStyle] })} />
              <Quick
                label="Cores do clube"
                onClick={() =>
                  patch({
                    primary: clubColors.primary,
                    accent: clubColors.accent,
                  })
                }
              />
              <Quick label="Versão escura" onClick={() => patch({ primary: "#10131c" })} />
              <button
                type="button"
                onClick={newScene}
                disabled={!!sceneJob}
                className="rounded-lg bg-neutral-100 px-3 py-2 text-sm hover:bg-neutral-200 disabled:opacity-50"
              >
                {sceneJob ? "A gerar cenário…" : "✦ Gerar cenário novo"}
              </button>
              {params.scene && !sceneJob && <Quick label="Cenários da biblioteca" onClick={() => patch({ scene: undefined })} />}
              <Quick
                label="Repor posição"
                onClick={() =>
                  patch({
                    playerX: 0,
                    playerY: 0,
                    playerScale: 1,
                    textScale: 1,
                  })
                }
              />
              {sceneMsg && <p className="w-full text-xs text-neutral-600">{sceneMsg}</p>}
            </div>
            <div>
              <span className="label">Estilo</span>
              <div className="flex flex-wrap gap-1.5">
                {looks.map((t) => (
                  <span
                    key={t.id}
                    className={`group inline-flex items-center rounded-full text-sm ${params.templateId === t.id ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
                  >
                    <button onClick={() => patch({ templateId: t.id })} className={`py-1 pl-3 ${params.templateId === t.id ? "pr-3" : "pr-1"}`}>
                      {t.label}
                    </button>
                    {/* The look in use can't be removed from here: pick another one first. */}
                    {params.templateId !== t.id && (
                      <button
                        onClick={() => removeLook(t.id, t.label)}
                        title="Retirar este estilo de vez"
                        aria-label={`Retirar o estilo ${t.label}`}
                        className="mr-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-neutral-400 hover:bg-neutral-200 hover:text-neutral-900"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="label">Acabamento</span>
              <div className="flex flex-wrap gap-1.5">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => patch({ finish: f.id })}
                    className={`rounded-full px-3 py-1 text-sm ${(params.finish ?? "none") === f.id ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {edit.post_type === "clip" && (
              <>
                <div>
                  <span className="label">Letra</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => patch({ font: undefined })}
                      className={`rounded-full px-3 py-1 text-sm ${!params.font ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
                    >
                      Do estilo
                    </button>
                    {TITLE_FONTS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => patch({ font: f.id })}
                        style={{ fontFamily: f.family, fontWeight: f.weight }}
                        className={`rounded-full px-3 py-1 text-sm ${params.font === f.id ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="label">Cores</span>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {(
                      [
                        ["primary", "Fundo"],
                        ["accent", "Destaque"],
                        ["text", "Texto"],
                      ] as const
                    ).map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2">
                        <input type="color" value={params[k] || "#ffffff"} onChange={(e) => patch({ [k]: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-neutral-200" />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-500">Mudar o estilo, a letra, as cores ou o logo não volta a processar o vídeo: a exportação seguinte demora segundos.</p>
                </div>
              </>
            )}
            <div>
              <span className="label">Enquadramento</span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["full", "Corpo inteiro"],
                    ["knees", "Joelhos"],
                    ["waist", "Cintura"],
                    ["chest", "Peito"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => patch({ framing: id })}
                    className={`rounded-full px-3 py-1 text-sm ${(params.framing ?? "full") === id ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <span className="label">{welcome ? "Fotos" : "Foto"}</span>
            {welcome && (
              <WelcomeControls photos={photos} mainId={photoId} onMain={setPhotoId} content={content} onContent={setContent} params={params} onParams={setParams} />
            )}
            {!welcome && <div className="grid grid-cols-4 gap-2">
              {photos
                .filter((p) => p.kind === "player")
                .map((p) => {
                  const tags = welcome
                    ? [photoId === p.id && "Principal", content.actionPhotoId === p.id && "A jogar", content.backdropPhotoId === p.id && "P/B"].filter(Boolean)
                    : [];
                  const active = photoId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPhotoId(p.id);
                      }}
                      className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 ${active ? "border-blue-600" : tags.length ? "border-neutral-400" : "border-transparent"}`}
                      style={{ background: CHECKER }}
                    >
                      <img src={p.url} alt="" className="h-full w-full object-contain" />
                      {tags.length > 0 && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/65 py-0.5 text-center text-[10px] text-white">{tags.join(" · ")}</span>
                      )}
                    </button>
                  );
                })}
            </div>}
            {photos.find((p) => p.id === photoId)?.status === "done" && (
              <button className="text-sm text-blue-700 underline" onClick={() => setFixing(true)}>
                ✂ Corrigir recorte desta foto
              </button>
            )}
            {fixing && photoId && <CutoutFixer photoId={photoId} onClose={() => setFixing(false)} onSaved={() => router.refresh()} />}
          </div>

          {insetUrl && (
            <div className="card space-y-3 p-5">
              <span className="label">Destacar o jogador no gráfico oficial</span>
              <p className="text-xs text-neutral-500">
                Clica em cima do jogador: o círculo encaixa sozinho à volta da foto e do nome. Com ⌥ (Alt) carregado, fica exatamente onde clicas.
              </p>
              <div className="relative cursor-crosshair">
                <img
                  src={insetUrl}
                  alt=""
                  className="w-full rounded-lg"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const fx = (e.clientX - r.left) / r.width;
                    const fy = (e.clientY - r.top) / r.height;
                    // Snap to his photo + name/club labels so the ring circles the whole block; ⌥-click places it by hand.
                    setContent({
                      ...content,
                      insetHighlight: e.altKey
                        ? { x: fx * 100, y: fy * 100, r: content.insetHighlight?.r ?? 12 }
                        : snapToCircle(e.currentTarget, fx, fy),
                    });
                  }}
                />
                {content.insetHighlight && (
                  <span
                    className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500 ${content.insetHighlight.r ? "aspect-square" : "h-8 w-8"}`}
                    style={{
                      left: `${content.insetHighlight.x}%`,
                      top: `${content.insetHighlight.y}%`,
                      width: content.insetHighlight.r ? `${content.insetHighlight.r * 2}%` : undefined,
                    }}
                  />
                )}
              </div>
              {content.insetHighlight && (
                <label className="flex items-center gap-3 text-xs text-neutral-600">
                  Tamanho do círculo
                  <input
                    type="range"
                    min={3}
                    max={25}
                    step={0.1}
                    value={content.insetHighlight.r ?? 8}
                    onChange={(e) => setContent({ ...content, insetHighlight: { ...content.insetHighlight!, r: Number(e.target.value) } })}
                    className="flex-1"
                  />
                </label>
              )}
            </div>
          )}

          <details className="card p-5">
            <summary className="cursor-pointer text-sm font-medium">Textos e dados</summary>
            <div className="mt-5">
              <ContentFields
                playerId={edit.player_id}
                postType={edit.post_type}
                content={content}
                onChange={setContent}
                insets={photos.filter((p) => p.kind === "inset")}
                clubs={clubs}
                backdrops={photos.filter((p) => p.kind === "player")}
              />
            </div>
          </details>

          <form action={deleteEditAction} className="flex justify-end">
            <input type="hidden" name="id" value={edit.id} />
            <button className="btn-danger">Apagar edit</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
