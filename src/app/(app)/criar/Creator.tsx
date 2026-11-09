"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { approveCutoutAction, removePhotoAction, saveEditAction, setPhotoKitAction } from "@/app/actions";
import { AutoRefresh } from "@/components/AutoRefresh";
import { WelcomeControls } from "@/components/WelcomeControls";
import { FORM_LOOKS, FormControls } from "@/components/FormControls";
import { ContentFields, type ClubOption, type PhotoOption } from "@/components/ContentFields";
import { PhotoUploader } from "@/components/PhotoUploader";
import { BackLink } from "@/components/BackLink";
import { ClipUpload } from "@/components/ClipUpload";
import { Preview } from "@/components/Preview";
import { ReportError } from "@/components/ReportError";
import { POSE_LABELS, POST_TYPES, variedContent, type EditContent, type Pose, type TemplateId, type PlayerPrefs, type PostType, type TemplateParams } from "@/lib/types";
import { COACH_LOOKS, generateVariants, poseFit, TEMPLATES } from "@/templates";
import { composeRenderData, type RenderContext } from "@/templates/compose";

const CHECKER = "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%) 50% / 12px 12px";

export function Creator(props: {
  playerId: string;
  playerName: string;
  initialType: PostType;
  contents: Record<PostType, EditContent>;
  style: TemplateParams;
  prefs: PlayerPrefs;
  suggestionId: string | null;
  penalties: Record<PostType, Record<string, number>>;
  flaggedPhotos: string[];
  recentTemplates: string[];
  /** Photos of the player's latest edits (newest first): used less, so posts don't keep the same photo. */
  recentPhotos: string[];
  /** Exports per look across every player (the agency's taste). */
  agencyPicks: Record<string, number>;
  /** He plays at a US school: loud gameday looks lead the grid. */
  usStyle?: boolean;
  ctx: RenderContext;
  photos: PhotoOption[];
  seed: number;
  /** Looks the user removed for good (Catálogo). */
  hiddenLooks: string[];
  clubs: ClubOption[];
  /** A coach profile: the coach looks get their own section, above the usual grid. */
  coach?: boolean;
}) {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>(props.initialType);
  const [contents, setContents] = useState(props.contents);
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const [reported, setReported] = useState<Record<string, number>>({});
  // A new random mix of looks every visit; "Baralhar" draws another one.
  const [seed, setSeed] = useState(props.seed);
  // Welcome post: one fixed look; the user picks and sizes its three photos here.
  const [wMain, setWMain] = useState<string | null>(null);
  const [wParams, setWParams] = useState<TemplateParams>({ ...props.style, templateId: "welcomeplay" as TemplateId });
  // Form carousel: its style, games counted and the photo of each of its 3 slides.
  const [fParams, setFParams] = useState<TemplateParams>({ ...props.style, templateId: (FORM_LOOKS[0]?.id ?? "formnatural") as TemplateId, formGames: 6, finish: undefined });
  const [fPhotos, setFPhotos] = useState<(string | null)[]>([null, null, null]);
  // "↓ História" straight from a thumbnail: which one is exporting, and the last message.
  const [storyBusy, setStoryBusy] = useState<number | null>(null);
  const [storyMsg, setStoryMsg] = useState<string | null>(null);

  // Opening an edit and coming back remounts this page: the photos picked by hand and the current shuffle
  // are kept for this player in the tab's session (sessionStorage), so the grid comes back as it was left —
  // not with every photo selected again and a new mix (user, 2026-11-06).
  const memKey = `criar:${props.playerId}`;
  const restored = useRef(false);
  useEffect(() => {
    try {
      const m = JSON.parse(sessionStorage.getItem(memKey) ?? "null") as { picked?: string[]; seeds?: Record<string, number> } | null;
      if (m?.picked?.length) setPicked(m.picked);
      const sd = m?.seeds?.[postType];
      if (typeof sd === "number") setSeed(sd);
    } catch {}
    restored.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try {
      const m = JSON.parse(sessionStorage.getItem(memKey) ?? "{}") as { picked?: string[]; seeds?: Record<string, number> };
      sessionStorage.setItem(memKey, JSON.stringify({ picked, seeds: { ...(m.seeds ?? {}), [postType]: seed } }));
    } catch {}
  }, [memKey, picked, seed, postType]);

  const playerPhotos = props.photos.filter((p) => p.kind === "player");
  const insets = props.photos.filter((p) => p.kind === "inset");
  const done = playerPhotos.filter((p) => p.status === "done");
  const info = (id: string) => props.ctx.photos[id];
  const current = (id: string) => (info(id)?.kit ?? 0.5) >= 0.5;
  // A reported photo only drops out when a clean one of the same kind (body / bust, current kit) remains.
  const ready = done.filter(
    (p) =>
      !props.flaggedPhotos.includes(p.id) ||
      !done.some((o) => o.id !== p.id && !props.flaggedPhotos.includes(o.id) && !!info(o.id)?.bust === !!info(p.id)?.bust && current(o.id)),
  );
  // Selected photos, or by default every ready cutout in the current kit, sharpest first.
  const chosen = picked.filter((id) => props.ctx.photos[id]);
  const currentKit = ready.filter((p) => current(p.id));
  const byQuality = (a: { id: string }, b: { id: string }) =>
    Number(props.flaggedPhotos.includes(a.id)) - Number(props.flaggedPhotos.includes(b.id)) || (info(b.id)?.facePx ?? 0) - (info(a.id)?.facePx ?? 0);
  // Blurred / far-away photos stay out of the automatic picks (they can still be chosen by hand).
  const clean = (id: string) => !info(id)?.soft && !info(id)?.messy;
  const crisp = (list: typeof ready) => (list.some((p) => clean(p.id)) ? list.filter((p) => clean(p.id)) : list);
  const candidates = [...crisp(currentKit.length ? currentKit : ready)].sort(byQuality);
  // One of each pose first (the best of it), then the next sharpest: variety of poses, not six alike.
  const byPose = new Map<string, string>();
  for (const p of candidates) if (!byPose.has(info(p.id)?.pose ?? "unknown")) byPose.set(info(p.id)?.pose ?? "unknown", p.id);
  // Every clean photo takes part (not only the ten sharpest): the grid spreads them out below.
  const photoIds = chosen.length ? chosen : [...new Set([...byPose.values(), ...candidates.map((p) => p.id)])];

  /** Face size in the original photo: 160px+ survives close-ups, 90px+ a waist crop. */
  const sharp = (id: string | null, min: number) => !!id && (info(id)?.facePx ?? 0) >= min;

  /** Full-length photo where the feet are in the frame (nothing cut at the bottom). */
  function hasFeetPhoto(id: string) {
    const p = props.ctx.photos[id];
    return !!p && !p.bust && (p.cut?.bottom ?? 0) < 0.05;
  }

  /**
   * Picks the photo for each look of the grid. The pose still counts (a back shot never goes into a face
   * close-up), but variety counts more: a photo already used in this grid, or in the player's latest
   * posts, steps back, and a random draw per shuffle breaks the ties — before, the "perfect pose" filter
   * left one or two photos for almost every look (one of Moisés' 24 photos was in 45 edits).
   */
  const usedInGrid: Record<string, number> = {};
  const recentUse = (id: string) => Math.min(2.5, props.recentPhotos.reduce((a, x, i) => a + (x === id ? 1 - i * 0.04 : 0), 0) * 0.6);
  const jitter = (key: string) => {
    let h = seed ^ 0x9e3779b9;
    for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 2654435761);
    return ((h >>> 0) % 1000) / 1000;
  };
  function photoFor(templateId: string): string | null {
    if (!photoIds.length) return null;
    const def = TEMPLATES.find((t) => t.id === templateId);
    const want = def?.photo ?? "full";
    const kind = def?.feet
      ? photoIds.filter((id) => hasFeetPhoto(id))
      : want === "any"
        ? photoIds
        : photoIds.filter((id) => !!props.ctx.photos[id]?.bust === (want === "bust"));
    // Head-only photos (cut under the chin) only suit the face close-ups.
    const faceLooks = ["closeup", "gaze", "portrait", "memory", "smear"];
    const body = faceLooks.includes(templateId) ? kind : kind.filter((id) => !info(id)?.headOnly);
    const shaped = body.length ? body : kind;
    const suits = def?.magnifies ? shaped.filter((id) => sharp(id, 160)) : shaped;
    const pool = suits.length ? suits : shaped.length ? shaped : photoIds;
    // Poses seen in the reference edits this player sent count as an extra point.
    const liked = new Set(props.prefs.referencePoses ?? []);
    const fit = (id: string) => poseFit(templateId as TemplateId, info(id)?.pose) + (liked.has(info(id)?.pose as Pose) ? 1 : 0);
    // A wrong pose (0) only when nothing else is left.
    // A goal is celebrated: only photos of him celebrating (a serious face makes no sense on a goal post).
    // Without any, the action shots stand in (the panel asks for a celebration photo).
    const party = postType === "goal" ? pool.filter((id) => info(id)?.pose === "celebrate") : [];
    const action = postType === "goal" ? pool.filter((id) => info(id)?.pose === "action") : [];
    const goalPool = party.length ? party : action.length ? action : pool;
    const ok = goalPool.some((id) => fit(id) > 0) ? goalPool.filter((id) => fit(id) > 0) : goalPool;
    const score = (id: string) => fit(id) * 0.7 - (usedInGrid[id] ?? 0) * 2 - recentUse(id) + jitter(`${templateId}|${id}`) * 1.6;
    const pick = ok.reduce((a, b) => (score(b) > score(a) ? b : a));
    usedInGrid[pick] = (usedInGrid[pick] ?? 0) + 1;
    return pick;
  }

  const content = contents[postType];
  const learned = Object.values(props.prefs.picks).reduce((a, n) => a + n, 0) > 0;
  const penalties = { ...props.penalties[postType] };
  for (const [id, n] of Object.entries(reported)) penalties[id] = (penalties[id] ?? 0) + n;
  // Close-up looks need a sharp photo; without one they are left out rather than shown pixelated.
  if (!photoIds.some((id) => sharp(id, 160))) for (const t of TEMPLATES) if (t.magnifies) penalties[t.id] = 99;
  // Full-body looks with only head-and-shoulders photos put the face over their text: left out too.
  if (photoIds.length && photoIds.every((id) => props.ctx.photos[id]?.bust)) for (const t of TEMPLATES) if ((t.photo ?? "full") === "full") penalties[t.id] = 99;
  for (const id of props.hiddenLooks) penalties[id] = 99;
  // Coach looks never mix into the usual grid; coaches see them in their own section.
  for (const id of COACH_LOOKS) penalties[id] = 99;
  const poses = [...new Set(photoIds.map((id) => info(id)?.pose).filter((p): p is Pose => !!p))];
  const toVariant = (raw: TemplateParams) => {
    const photoId = photoFor(raw.templateId);
    // Looks that can swap sides put the player looking into the picture, towards the text.
    const facing = photoId ? info(photoId)?.facing : undefined;
    const flips = TEMPLATES.find((t) => t.id === raw.templateId)?.flips;
    const params = flips && facing && facing !== "front" ? { ...raw, side: facing === "right" ? ("left" as const) : ("right" as const) } : raw;
    // Tight crops enlarge the photo: step back to a wider framing when it would look soft.
    let framing = params.framing;
    if (framing === "chest" && !sharp(photoId, 160)) framing = sharp(photoId, 90) ? "waist" : "knees";
    if (framing === "waist" && !sharp(photoId, 90)) framing = "knees";
    return { params: { ...params, framing }, photoId, content: variedContent(content, postType, params.seed) };
  };
  const variants = generateVariants(props.style, postType, props.prefs, 12, penalties, props.recentTemplates, photoIds.some(hasFeetPhoto), seed, poses, props.agencyPicks, props.usStyle).map(toVariant);
  // Every coach look for this post, side by side, so the best ones for him are easy to compare.
  const coachVariants = props.coach
    ? TEMPLATES.filter((t) => COACH_LOOKS.has(t.id) && t.fits.includes(postType) && !props.hiddenLooks.includes(t.id)).map((t) => toVariant({ ...props.style, templateId: t.id, seed }))
    : [];

  // Welcome builder defaults: the sharpest front-facing portrait in the middle, another portrait in black and
  // white on the left, and an action shot for the photo of him playing.
  const welcomeBuilder = postType === "welcome" && !props.coach;
  const byFace = [...candidates].sort(byQuality).map((p) => p.id);
  const pose = (id: string) => info(id)?.pose;
  const portraits = byFace.filter((id) => ["bust", "standing"].includes(pose(id) ?? "") && pose(id) !== "back");
  const mainDefault = portraits[0] ?? byFace[0] ?? null;
  const wMainId = wMain ?? mainDefault;
  const wContent: EditContent = {
    ...content,
    backdropPhotoId: content.backdropPhotoId ?? portraits.find((id) => id !== wMainId) ?? byFace.find((id) => id !== wMainId) ?? null,
    actionPhotoId: content.actionPhotoId ?? byFace.find((id) => pose(id) === "action" && id !== wMainId) ?? byFace.find((id) => id !== wMainId && !info(id)?.bust) ?? null,
  };
  // Form carousel defaults: a front-facing shot on the cover, an action / back shot for the record, a
  // celebration for the numbers — three different photos when there are three.
  const formBuilder = postType === "form";
  const pick = (want: string[], not: (string | null)[]) => byFace.find((id) => want.includes(pose(id) ?? "") && !not.includes(id)) ?? byFace.find((id) => !not.includes(id)) ?? byFace[0] ?? null;
  const f1 = fPhotos[0] ?? pick(["standing", "action", "bust"], []);
  const f2 = fPhotos[1] ?? pick(["action", "back", "open"], [f1]);
  const f3 = fPhotos[2] ?? pick(["celebrate", "open", "action"], [f1, f2]);
  const fSlides = [f1, f2, f3];
  const fContent: EditContent = { ...content, slidePhotos: fSlides };
  async function createForm() {
    setSaving(0);
    const id = await saveEditAction({ player_id: props.playerId, post_type: "form", photo_id: f1, params: fParams, content: fContent, suggestion_id: props.suggestionId });
    router.push(`/edits/${id}`);
  }

  async function createWelcome() {
    setSaving(0);
    const id = await saveEditAction({ player_id: props.playerId, post_type: "welcome", photo_id: wMainId, params: wParams, content: wContent, suggestion_id: props.suggestionId });
    router.push(`/edits/${id}`);
  }

  /** Saves the look as an edit and downloads it as a story (1080×1920 JPG + PNG), without opening the editor. */
  async function downloadStory(i: number) {
    if (storyBusy !== null) return;
    setStoryBusy(i);
    setStoryMsg("A exportar a história em alta qualidade…");
    try {
      const v = variants[i];
      const id = await saveEditAction({ player_id: props.playerId, post_type: postType, photo_id: v.photoId, params: v.params, content: v.content, suggestion_id: props.suggestionId });
      const res = await fetch(`/api/edits/${id}/export?format=story`, { cache: "no-store" });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("ficheiro vazio");
      const savedTo = decodeURIComponent(res.headers.get("X-Saved-To") ?? "");
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "story.jpg";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStoryMsg(`História pronta ✓ — ${savedTo ? `guardada em ${savedTo}` : `guardada em Transferências como ${name}`}`);
    } catch (e) {
      setStoryMsg(`Não foi possível exportar (${e instanceof Error ? e.message : "erro"}). Tenta outra vez.`);
    } finally {
      setStoryBusy(null);
    }
  }

  async function choose(i: number) {
    setSaving(i);
    const v = i >= 1000 ? coachVariants[i - 1000] : variants[i];
    const id = await saveEditAction({
      player_id: props.playerId,
      post_type: postType,
      photo_id: v.photoId,
      params: v.params,
      content: v.content,
      suggestion_id: props.suggestionId,
    });
    router.push(`/edits/${id}`);
  }

  return (
    <div>
      <BackLink fallback="/" />
      <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
        <AutoRefresh active={playerPhotos.some((p) => p.status === "pending")} />

        <aside className="space-y-6">
          <div>
            <p className="muted">Nova edit</p>
            <h1 className="text-3xl font-semibold tracking-tight">{props.playerName}</h1>
          </div>

          <div className="card space-y-3 p-5">
            <span className="label">Tipo de publicação</span>
            <div className="grid grid-cols-2 gap-2">
              {POST_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPostType(t.id)}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm ${postType === t.id ? "bg-neutral-900 text-white" : "bg-neutral-100 hover:bg-neutral-200"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-3 p-5">
            <span className="label">Fotos do jogador</span>
            <p className="text-xs text-neutral-500">Escolhe uma ou mais. Cada estilo usa a foto com a pose que lhe assenta melhor.</p>
            {postType === "goal" && !photoIds.some((id) => info(id)?.pose === "celebrate") && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Os golos usam só fotos dele a festejar e não há nenhuma. Por agora entram as fotos em ação; carrega uma foto a festejar para ficar melhor.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <PhotoUploader playerId={props.playerId} label="Carregar" />
              {playerPhotos.map((p) => {
                const on = photoIds.includes(p.id);
                const oldKit = (props.ctx.photos[p.id]?.kit ?? 0.5) < 0.5;
                const flagged = props.ctx.photos[p.id]?.soft || props.ctx.photos[p.id]?.messy;
                return (
                  <div key={p.id} className="group relative">
                  <button
                    type="button"
                    disabled={p.status === "pending"}
                    onClick={() => setPicked(on ? photoIds.filter((x) => x !== p.id) : [...photoIds, p.id])}
                    className={`relative aspect-[3/4] overflow-hidden rounded-lg border-2 ${on ? "border-blue-600" : "border-transparent"}`}
                    style={{ background: CHECKER }}
                  >
                    <img src={p.url} alt="" className="h-full w-full object-contain" />
                    {p.status === "pending" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] text-white">
                        A recortar…
                      </span>
                    )}
                    {p.status === "done" && (oldKit || props.ctx.photos[p.id]?.soft || props.ctx.photos[p.id]?.messy || props.ctx.photos[p.id]?.pose) && (
                      <span
                        className={`absolute inset-x-0 bottom-0 py-0.5 text-center text-[10px] text-white ${props.ctx.photos[p.id]?.soft || props.ctx.photos[p.id]?.messy || oldKit ? "bg-amber-700/85" : "bg-black/60"}`}
                      >
                        {props.ctx.photos[p.id]?.soft
                          ? "tremida / longe"
                          : props.ctx.photos[p.id]?.messy
                            ? "outra pessoa"
                            : oldKit
                              ? "outro clube"
                              : POSE_LABELS[props.ctx.photos[p.id]!.pose!]}
                      </span>
                    )}
                  </button>
                    {/* Remove the photo, or overrule the automatic flag when the app got it wrong. */}
                    <button
                      type="button"
                      title="Apagar esta foto"
                      onClick={async () => {
                        setPicked(photoIds.filter((x) => x !== p.id));
                        await removePhotoAction(p.id);
                        router.refresh();
                      }}
                      className="absolute -top-1.5 -right-1.5 hidden h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs text-white group-hover:flex"
                    >
                      ×
                    </button>
                    {flagged && p.status === "done" && (
                      <button
                        type="button"
                        title="A app acha que esta foto tem problemas; usar mesmo assim"
                        onClick={async () => {
                          await approveCutoutAction(p.id);
                          router.refresh();
                        }}
                        className="absolute -top-1.5 -left-1.5 hidden h-6 items-center justify-center rounded-full bg-emerald-700 px-2 text-[10px] text-white group-hover:flex"
                      >
                        é ele
                      </button>
                    )}
                    {/* The colour check took his club's alternate kit for another team (or the other way round). */}
                    {p.status === "done" && (oldKit || props.ctx.photos[p.id]?.kitByUser === true) && (
                      <button
                        type="button"
                        title={oldKit ? "Esta foto é com o equipamento do clube atual: usar nas sugestões" : "Afinal é de outro clube"}
                        onClick={async () => {
                          await setPhotoKitAction(p.id, oldKit ? true : null);
                          router.refresh();
                        }}
                        className={`absolute ${flagged ? "top-5" : "-top-1.5"} -left-1.5 hidden h-6 items-center justify-center rounded-full px-2 text-[10px] text-white group-hover:flex ${oldKit ? "bg-emerald-700" : "bg-neutral-700"}`}
                      >
                        {oldKit ? "é do clube" : "não é do clube"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500">Passa o rato por cima de uma foto para a apagar (×), para dizer &quot;é ele&quot; quando a app a marcou por engano, ou &quot;é do clube&quot; quando está marcada como outro clube mas é o equipamento alternativo.</p>
          </div>

          <details className="card p-5" open={postType === "totw" || postType === "speed" || postType === "welcome" || postType === "press"}>
            <summary className="cursor-pointer text-sm font-medium">Textos e dados</summary>
            <div className="mt-5">
              <ContentFields
                playerId={props.playerId}
                postType={postType}
                content={content}
                onChange={(c) => setContents({ ...contents, [postType]: c })}
                insets={insets}
                clubs={props.clubs}
                backdrops={playerPhotos}
              />
            </div>
          </details>
        </aside>

        {postType === "clip" ? (
          <section>
            <h2 className="section-title">Vídeo · golo / assistência</h2>
            <p className="mt-1.5 mb-5 text-xs text-neutral-500">
              Carrega o vídeo do lance (de preferência o original, não o do WhatsApp). A app procura a bola em segundo plano (~1 min) e abre a story,
              onde corriges o seguimento com um clique e exportas o MP4 a 60 fps.
            </p>
            <div className="card p-5">
              <ClipUpload playerId={props.playerId} />
            </div>
          </section>
        ) : formBuilder ? (
          <section>
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <div>
                <h2 className="section-title">Carrossel para o Instagram · 3 imagens</h2>
                <p className="text-xs text-neutral-500">Capa, registo dos jogos e números. Os números vêm sozinhos dos últimos jogos dele.</p>
              </div>
              <button type="button" onClick={createForm} disabled={saving !== null || !f1} className="btn bg-neutral-900 text-white hover:bg-neutral-700">
                {saving !== null ? "A abrir…" : "Criar carrossel"}
              </button>
            </div>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="grid grid-cols-3 gap-3">
                {fSlides.map((photoId, i) => (
                  <div key={i}>
                    <div className="overflow-hidden rounded-lg shadow-sm">
                      <Preview data={composeRenderData(props.ctx, { postType: "form", photoId, params: { ...fParams, slide: (i + 1) as 1 | 2 | 3 }, content: fContent })} />
                    </div>
                    <p className="mt-1.5 text-center text-xs text-neutral-500">{i + 1} de 3</p>
                  </div>
                ))}
              </div>
              <div className="card p-5">
                <FormControls
                  photos={playerPhotos}
                  slidePhotos={fSlides}
                  onSlidePhoto={(i, id) => setFPhotos(fSlides.map((x, j) => (j === i ? id : x)))}
                  params={fParams}
                  onParams={setFParams}
                />
              </div>
            </div>
          </section>
        ) : welcomeBuilder ? (
          <section>
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="section-title">Apresentação</h2>
              <button type="button" onClick={createWelcome} disabled={saving !== null || !wMainId} className="btn bg-neutral-900 text-white hover:bg-neutral-700">
                {saving !== null ? "A abrir…" : "Criar esta edit"}
              </button>
            </div>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-hidden rounded-xl shadow-sm">
                <Preview data={composeRenderData(props.ctx, { postType: "welcome", photoId: wMainId, params: wParams, content: wContent })} />
              </div>
              <div className="card space-y-4 p-5">
                <WelcomeControls
                  photos={playerPhotos}
                  mainId={wMainId}
                  onMain={setWMain}
                  content={wContent}
                  onContent={(c) => setContents({ ...contents, welcome: c })}
                  params={wParams}
                  onParams={setWParams}
                />
                <p className="text-xs text-neutral-500">Os clubes vêm do percurso dele no zerozero (o atual em último). Podes mudá-los em &quot;Textos e dados&quot;.</p>
              </div>
            </div>
          </section>
        ) : (
        <section>
          {coachVariants.length > 0 && (
            <div className="mb-12">
              <h2 className="section-title mb-1">Estilos para treinadores</h2>
              <p className="mb-5 text-xs text-neutral-500">Feitos para treinadores e só aparecem aqui. Todos lado a lado, para ver quais lhe ficam melhor.</p>
              <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
                {coachVariants.map((v, i) => (
                  <button
                    key={`coach-${v.params.templateId}`}
                    type="button"
                    onClick={() => choose(1000 + i)}
                    disabled={saving !== null}
                    className="group relative w-full overflow-hidden rounded-xl shadow-sm ring-offset-4 ring-offset-[#f4f5f7] hover:ring-2 hover:ring-blue-600 disabled:opacity-60"
                  >
                    <Preview data={composeRenderData(props.ctx, { postType, photoId: v.photoId, params: v.params, content: v.content })} />
                    <span className="absolute top-3 left-3 rounded-md bg-black/65 px-2.5 py-1 text-xs text-white">{TEMPLATES.find((t) => t.id === v.params.templateId)?.label}</span>
                    {saving === 1000 + i && <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">A abrir…</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="section-title">Escolhe a que gostas mais</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs text-neutral-500">
                {learned ? "Misturadas com o que este jogador costuma escolher" : "A app aprende com cada edit que exportares"}
              </span>
              <button type="button" onClick={() => setSeed((s) => s + 1 + Math.floor(Math.random() * 1e6))} className="btn">
                ⟳ Baralhar
              </button>
            </div>
          </div>
          {storyMsg && <p className="mb-4 text-sm text-neutral-600">{storyMsg}</p>}
          <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
            {variants.map((v, i) => (
              <div key={`${v.params.templateId}-${i}`} className="relative">
                <button
                  type="button"
                  onClick={() => choose(i)}
                  disabled={saving !== null}
                  className="group relative w-full overflow-hidden rounded-xl shadow-sm ring-offset-4 ring-offset-[#f4f5f7] hover:ring-2 hover:ring-blue-600 disabled:opacity-60"
                >
                  <Preview
                    data={composeRenderData(props.ctx, {
                      postType,
                      photoId: v.photoId,
                      params: v.params,
                      content: v.content,
                    })}
                  />
                  <span className="absolute top-3 left-3 rounded-md bg-black/65 px-2.5 py-1 text-xs text-white">
                    {TEMPLATES.find((t) => t.id === v.params.templateId)?.label}
                  </span>
                  {saving === i && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">A abrir…</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => downloadStory(i)}
                  disabled={storyBusy !== null || saving !== null}
                  title="Transferir já em formato história (1080×1920), sem abrir a edit"
                  className="absolute right-3 bottom-3 z-10 rounded-md bg-black/70 px-2.5 py-1 text-xs font-medium text-white hover:bg-black disabled:opacity-50"
                >
                  {storyBusy === i ? "A exportar…" : "↓ História"}
                </button>
                <ReportError
                  compact
                  playerId={props.playerId}
                  photoId={v.photoId}
                  postType={postType}
                  params={v.params}
                  content={v.content}
                  onReported={() => setReported((r) => ({ ...r, [v.params.templateId]: (r[v.params.templateId] ?? 0) + 1 }))}
                />
              </div>
            ))}
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
