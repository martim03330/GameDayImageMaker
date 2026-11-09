"use server";

import { ensureCareer } from "@/lib/career";
import { revalidatePath } from "next/cache";
import { bestPhoto } from "@/lib/series";
import { renderContext } from "@/lib/render-data";
import { redirect } from "next/navigation";
import { aiEnabled, analyzeReference, editChat } from "@/lib/ai";
import { cutoutPhoto, detectPose, enhancePhoto } from "@/lib/cutout";
import { dismissInspiration, fetchInspiration } from "@/lib/inspiration";
import { searchPlayers } from "@/lib/sources";
import { syncAll, syncPlayer } from "@/lib/sync";
import * as repo from "@/lib/repo";
import { enqueueScenes, getSceneJob } from "@/lib/scenes";
import { copyEditToPlayer } from "@/lib/series";
import { absPath, fileUrl, saveUpload } from "@/lib/storage";
import { fetchArticle } from "@/lib/press";
import type { ChatMessage, EditContent, PressArticle, FeedbackTag, PhotoKind, PlayerPrefs, Pose, PostType, TemplateParams } from "@/lib/types";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => Number.parseInt(str(fd, k) || "0", 10) || 0;
const file = (fd: FormData, k: string) => {
  const f = fd.get(k);
  return f instanceof File && f.size > 0 ? f : null;
};

// ---------- inspiration ----------

/** Reads the Pinterest boards now instead of waiting for the daily check. */
export async function fetchInspirationAction() {
  const n = await fetchInspiration();
  revalidatePath("/inspiracao");
  return n;
}

export async function dismissInspirationAction(id: string) {
  dismissInspiration(id);
  revalidatePath("/inspiracao");
}

// ---------- clubs ----------

/** More generated scenery for a club (Definições): four new, varied scenes, ahead of the idle top-ups. */
export async function generateScenesAction(fd: FormData) {
  enqueueScenes(str(fd, "club_id"), 4, 3);
  revalidatePath("/definicoes");
}

/** A scene made only for this edit (≈2 min): the worker puts it in the edit when it's ready. */
export async function generateEditSceneAction(editId: string): Promise<string | null> {
  const edit = repo.getEdit(editId);
  const club = edit ? repo.getPlayer(edit.player_id)?.club_id : null;
  return club ? enqueueScenes(club, 1, 10, editId) : null;
}

export async function sceneJobAction(jobId: string): Promise<{ status: string; url: string | null; ahead: number }> {
  const job = getSceneJob(jobId);
  if (!job) return { status: "error", url: null, ahead: 0 };
  const file = job.result ? (JSON.parse(job.result) as string[])[0] : null;
  return { status: job.status, url: file ? fileUrl(file) : null, ahead: 0 };
}

/** Club colours / crest, edited from the player page (clubs are otherwise created by the sync). */
export async function saveClubAction(fd: FormData) {
  const existing = repo.getClub(str(fd, "id"));
  if (!existing) return;
  const crestFile = file(fd, "crest");
  repo.saveClub({
    ...existing,
    crest: crestFile ? await saveUpload(crestFile, "crests") : existing.crest,
    primary_color: str(fd, "primary_color") || existing.primary_color,
    secondary_color: str(fd, "secondary_color") || existing.secondary_color,
  });
  revalidatePath("/", "layout");
}

/** Adds the agency's own city photos to a club (used by the city looks), or clears them. */
export async function cityPhotosAction(fd: FormData) {
  const club = repo.getClub(str(fd, "id"));
  if (!club) return;
  const current: string[] = fd.get("clear") ? [] : club.city_images ? JSON.parse(club.city_images) : [];
  for (const f of fd.getAll("files")) {
    if (f instanceof File && f.size > 0) current.unshift(await saveUpload(f, "cities"));
  }
  repo.setClubDetails(club.id, { city_images: current.length ? JSON.stringify(current.slice(0, 8)) : null, city_image: current[0] ?? null });
  revalidatePath("/", "layout");
}

// ---------- players ----------

/** Splits "Moisés Conceição" into first name + the rest. */
function splitName(full: string): [string, string] {
  const parts = full.trim().split(/\s+/);
  return [parts[0] ?? "", parts.slice(1).join(" ")];
}

export async function searchPlayersAction(name: string) {
  if (name.trim().length < 3) return [];
  try {
    return await searchPlayers(name);
  } catch {
    return [];
  }
}

/** Creates a player from a name and zerozero / Transfermarkt links, then fetches everything. */
export async function createPlayerAction(fd: FormData) {
  const [first, last] = splitName(str(fd, "name"));
  const zz = str(fd, "zerozero_url") || null;
  const tm = str(fd, "transfermarkt_url") || null;
  // Same link or same name already registered (e.g. button pressed twice): open that player instead.
  const existing = repo
    .listPlayers()
    .find(
      (p) =>
        (zz && p.zerozero_url === zz) ||
        (tm && p.transfermarkt_url === tm) ||
        `${p.first_name} ${p.last_name}`.toLowerCase() === `${first} ${last}`.toLowerCase(),
    );
  if (existing) redirect(`/jogadores/${existing.id}`);
  const role = str(fd, "role") === "coach" ? "coach" : "player";
  const id = repo.createPlayer({ first_name: first, last_name: last, zerozero_url: zz, transfermarkt_url: tm, role });
  if (zz || tm) await syncPlayer(id);
  revalidatePath("/", "layout");
  redirect(`/jogadores/${id}`);
}

export async function savePlayerAction(fd: FormData) {
  const id = str(fd, "id");
  const before = repo.getPlayer(id);
  repo.updatePlayer(id, {
    first_name: str(fd, "first_name"),
    last_name: str(fd, "last_name"),
    notes: str(fd, "notes"),
    zerozero_url: str(fd, "zerozero_url") || null,
    transfermarkt_url: str(fd, "transfermarkt_url") || null,
  });
  // A new zerozero link: his last clubs (welcome post) come from it straight away.
  const zz = str(fd, "zerozero_url") || null;
  if (zz && zz !== before?.zerozero_url && before?.role !== "coach") await ensureCareer(id, true).catch(() => null);
  revalidatePath("/", "layout");
}

export async function syncPlayerAction(fd: FormData) {
  await syncPlayer(str(fd, "id"));
  revalidatePath("/", "layout");
}

export async function syncAllAction() {
  await syncAll();
  revalidatePath("/", "layout");
}

export async function savePrefsAction(fd: FormData) {
  const player = repo.getPlayer(str(fd, "id"));
  if (!player) return;
  repo.savePlayerPrefs(player.id, {
    ...player.prefs,
    side: (str(fd, "side") || "auto") as PlayerPrefs["side"],
    tone: (str(fd, "tone") || "club") as PlayerPrefs["tone"],
    hideAgency: !!fd.get("hide_agency"),
    refTz: str(fd, "ref_tz") || undefined,
  });
  revalidatePath(`/jogadores/${player.id}`);
}

/** Stores a reference edit the player likes and lets the AI turn it into style preferences. */
export async function uploadReferenceAction(fd: FormData) {
  const player = repo.getPlayer(str(fd, "player_id"));
  if (!player) return;
  for (const f of fd.getAll("files")) {
    if (!(f instanceof File) || f.size === 0) continue;
    const rel = await saveUpload(f, "references");
    repo.insertPhoto({ player_id: player.id, kind: "reference", file: rel });
    // The player's body pose in the reference edit (local, always): photos in that pose are then
    // preferred for this player, so his edits look like the ones he sent.
    const body = await detectPose(absPath(rel));
    if (body) {
      const fresh = repo.getPlayer(player.id)!;
      repo.savePlayerPrefs(player.id, { ...fresh.prefs, referencePoses: [...(fresh.prefs.referencePoses ?? []), body.pose as Pose].slice(-10) });
    }
    if (!aiEnabled()) continue;
    const a = await analyzeReference(rel).catch((e) => (console.error("reference analysis", e), null));
    if (!a) continue;
    const fresh = repo.getPlayer(player.id)!;
    const key = `${a.templateId}|${a.side}|${a.bgStyle}`;
    repo.savePlayerPrefs(player.id, {
      ...fresh.prefs,
      picks: { ...fresh.prefs.picks, [key]: (fresh.prefs.picks[key] ?? 0) + 2 },
      referenceNotes: [...(fresh.prefs.referenceNotes ?? []), a.notes].slice(-8),
    });
  }
  revalidatePath(`/jogadores/${player.id}`);
}

export async function deletePlayerAction(fd: FormData) {
  repo.deletePlayer(str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/jogadores");
}

export async function resetLearningAction(playerId: string) {
  const player = repo.getPlayer(playerId);
  if (!player) return;
  repo.savePlayerStyle(playerId, null);
  repo.savePlayerPrefs(playerId, { ...player.prefs, picks: {}, referenceNotes: [] });
  revalidatePath(`/jogadores/${playerId}`);
}

// ---------- suggestions ----------

export async function dismissSuggestionAction(fd: FormData) {
  repo.setSuggestionStatus(str(fd, "id"), "dismissed");
  revalidatePath("/");
}

// ---------- matches ----------

export async function saveMatchAction(fd: FormData) {
  const playerId = str(fd, "player_id");
  const rating = str(fd, "rating").replace(",", ".");
  repo.saveMatch({
    id: str(fd, "id") || undefined,
    player_id: playerId,
    date: str(fd, "date"),
    competition: str(fd, "competition"),
    matchday: str(fd, "matchday"),
    opponent: str(fd, "opponent"),
    home: str(fd, "home") === "0" ? 0 : 1,
    goals_for: int(fd, "goals_for"),
    goals_against: int(fd, "goals_against"),
    minutes: int(fd, "minutes"),
    goals: int(fd, "goals"),
    assists: int(fd, "assists"),
    rating: rating ? Number.parseFloat(rating) : null,
    totw: fd.get("totw") ? 1 : 0,
    motm: fd.get("motm") ? 1 : 0,
  });
  revalidatePath(`/jogadores/${playerId}`);
}

export async function deleteMatchAction(fd: FormData) {
  repo.deleteMatch(str(fd, "id"));
  revalidatePath(`/jogadores/${str(fd, "player_id")}`);
}

// ---------- photos ----------

/** Stores uploaded photos; player photos get their background removed in the background. */
export async function uploadPhotosAction(fd: FormData): Promise<string[]> {
  const playerId = str(fd, "player_id") || null;
  const kind = (str(fd, "kind") || "player") as PhotoKind;
  const ids: string[] = [];
  for (const f of fd.getAll("files")) {
    if (!(f instanceof File) || f.size === 0) continue;
    const rel = await saveUpload(f, kind === "inset" ? "insets" : "photos");
    const id = repo.insertPhoto({ player_id: playerId, kind, file: rel });
    ids.push(id);
    if (kind === "player") {
      repo.setPhotoCutout(id, "pending");
      void cutoutPhoto(id);
    }
  }
  revalidatePath("/", "layout");
  return ids;
}

export async function approvePhotoAction(fd: FormData) {
  repo.approvePhoto(str(fd, "id"));
  revalidatePath("/", "layout");
}

export async function retryCutoutAction(fd: FormData) {
  void cutoutPhoto(str(fd, "id"));
  revalidatePath("/", "layout");
}

/** "Melhorar com IA": rebuilds a soft photo with Real-ESRGAN and cuts it out again (in the photo queue). */
export async function enhancePhotoAction(fd: FormData) {
  void enhancePhoto(str(fd, "id"));
  revalidatePath("/", "layout");
}

/** Deletes a photo (and its cutout) from the Criar page. */
export async function removePhotoAction(id: string) {
  repo.deletePhoto(id);
  revalidatePath("/criar");
}

/**
 * "It is him, use it": clears the automatic flags on a photo (another player in the cutout, blurred),
 * so it goes back into the automatic picks.
 */
export async function approveCutoutAction(id: string) {
  const photo = repo.getPhoto(id);
  if (!photo?.meta) return;
  repo.setPhotoCutout(id, photo.cutout_status, photo.cutout, JSON.stringify({ ...JSON.parse(photo.meta), approved_by_user: true }));
  revalidatePath("/criar");
}

/**
 * "It's his club" / "another club": overrules the kit-colour match on a photo (an alternate or third kit
 * looks like another team to the colour check), so it goes back into, or out of, the edit suggestions.
 */
export async function setPhotoKitAction(id: string, club: boolean | null) {
  const photo = repo.getPhoto(id);
  if (!photo?.meta) return;
  const meta = JSON.parse(photo.meta);
  if (club == null) delete meta.kit_club;
  else meta.kit_club = club;
  repo.setPhotoCutout(id, photo.cutout_status, photo.cutout, JSON.stringify(meta));
  revalidatePath("/", "layout");
}

export async function deletePhotoAction(fd: FormData) {
  repo.deletePhoto(str(fd, "id"));
  revalidatePath("/", "layout");
}

export async function photoStatusAction(ids: string[]) {
  return ids.map((id) => repo.getPhoto(id)?.cutout_status ?? "error");
}

// ---------- edits ----------

export async function saveEditAction(e: {
  id?: string;
  player_id: string;
  post_type: PostType;
  photo_id: string | null;
  params: TemplateParams;
  content: EditContent;
  suggestion_id?: string | null;
}): Promise<string> {
  const { suggestion_id, ...edit } = e;
  // Never save a player look without a photo (it renders an empty ground): take his best photo for it.
  if (!edit.photo_id && edit.post_type !== "totw") edit.photo_id = bestPhoto(edit, renderContext(edit.player_id).photos);
  const id = repo.saveEdit(edit);
  if (suggestion_id) repo.setSuggestionStatus(suggestion_id, "done");
  revalidatePath("/", "layout");
  return id;
}

/** One message to the AI design assistant; returns the updated edit state. */
export async function chatEditAction(input: {
  editId: string;
  message: string;
  params: TemplateParams;
  content: EditContent;
  photoId: string | null;
}): Promise<{ reply: string; params: TemplateParams; content: EditContent; photoId: string | null; chat: ChatMessage[] }> {
  const edit = repo.getEdit(input.editId);
  if (!edit) throw new Error("Edit não existe");
  const player = repo.getPlayer(edit.player_id)!;
  if (!aiEnabled()) {
    return { ...input, reply: "O assistente de IA ainda não está ligado (falta a chave da API).", chat: edit.chat };
  }
  const photos = repo.listPhotos(player.id, "player").map((p, i) => ({ id: p.id, label: `foto ${i + 1}` }));
  const out = await editChat({
    message: input.message,
    history: edit.chat,
    params: input.params,
    content: input.content,
    photoId: input.photoId,
    photos,
    playerNotes: [player.notes, ...(player.prefs.referenceNotes ?? [])].filter(Boolean).join(" "),
  });
  const chat: ChatMessage[] = [...edit.chat, { role: "user", text: input.message }, { role: "assistant", text: out.reply }];
  repo.saveEdit({ id: edit.id, player_id: edit.player_id, post_type: edit.post_type, photo_id: out.photoId, params: out.params, content: out.content });
  repo.setEditChat(edit.id, chat);
  return { ...out, chat };
}

/** "Mesma edit para outros jogadores": the same look and title for each chosen player, with their own game and photo. */
export async function copyEditAction(input: { editId: string; playerIds: string[]; sameColors: boolean }): Promise<{ id: string; playerId: string }[]> {
  const out = input.playerIds
    .map((playerId) => ({ playerId, id: copyEditToPlayer(input.editId, playerId, { sameColors: input.sameColors }) }))
    .filter((e): e is { id: string; playerId: string } => !!e.id);
  revalidatePath("/", "layout");
  return out;
}

export async function deleteEditAction(fd: FormData) {
  repo.deleteEdit(str(fd, "id"));
  revalidatePath("/", "layout");
  redirect("/");
}

// ---------- feedback ----------

/** "Tem erros": stores what was wrong with a look so variants stop proposing it. */
export async function reportErrorAction(input: {
  playerId: string;
  editId?: string | null;
  photoId: string | null;
  postType: PostType;
  params: TemplateParams;
  content: EditContent;
  tags: FeedbackTag[];
  note: string;
}) {
  repo.addFeedback({
    player_id: input.playerId,
    edit_id: input.editId ?? null,
    photo_id: input.photoId,
    post_type: input.postType,
    template_id: input.params.templateId,
    params: input.params,
    content: input.content,
    tags: input.tags,
    note: input.note.trim(),
  });
  revalidatePath("/", "layout");
}

export async function resolveFeedbackAction(fd: FormData) {
  repo.resolveFeedback(str(fd, "id"));
  revalidatePath("/erros");
}

// ---------- settings ----------

/** Removes a look for good (or brings it back): it stops appearing in variants and in the editor. */
/** "Usar no fim de semana": marks the edit as posted (its look is then not repeated for this player). */
export async function setEditPostedAction(id: string, posted: boolean) {
  repo.setEditPosted(id, posted);
  revalidatePath("/", "layout");
}

/** Histórico → Recuperar: the look can be proposed again for that player. */
export async function setEditReleasedAction(id: string, released: boolean) {
  repo.setEditReleased(id, released);
  revalidatePath("/", "layout");
}

export async function toggleLookAction(id: string) {
  const hidden = new Set(repo.hiddenLooks());
  if (hidden.has(id)) hidden.delete(id);
  else hidden.add(id);
  repo.setSetting("hidden_looks", JSON.stringify([...hidden]));
  revalidatePath("/", "layout");
}

export async function saveSettingsAction(fd: FormData) {
  repo.setSetting("agency_name", str(fd, "agency_name") || "NEYOD");
  repo.setSetting("pinterest_boards", str(fd, "pinterest_boards"));
  repo.setSetting("scenes_paused", fd.get("scenes_paused") ? "1" : "");
  const logo = file(fd, "agency_logo");
  if (logo) repo.setSetting("agency_logo", await saveUpload(logo, "branding"));
  if (fd.get("remove_logo")) repo.setSetting("agency_logo", null);
  revalidatePath("/", "layout");
}

// ---------- press ----------

/** Press post: reads a news article from its link (headline, outlet, date, lead image). */
export async function fetchArticleAction(url: string): Promise<{ ok: true; article: PressArticle } | { ok: false; error: string }> {
  try {
    return { ok: true, article: await fetchArticle(url) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------- prospeção ----------

/** Reads the Liga 3 / Campeonato de Portugal squads from zerozero (in the background, ~2 min). */
export async function scanProspectsAction() {
  const { startScan } = await import("@/lib/prospects");
  startScan();
}

/** Reads the international players of NCAA soccer (D1 / D2) or basketball (D1) from the schools' roster pages (background). */
export async function scanCollegeAction(sport: string = "soccer") {
  const { startCollegeScan } = await import("@/lib/prospects");
  void startCollegeScan(sport === "basketball" ? "basketball" : "soccer");
}

export async function collegeScanStateAction() {
  const { collegeScanState } = await import("@/lib/prospects");
  return collegeScanState();
}

export async function prospectScanStateAction() {
  const { scanState } = await import("@/lib/prospects");
  return scanState();
}

export async function updateProspectAction(id: string, patch: { instagram?: string; status?: string; note?: string; lang?: string }) {
  const { updateProspect, STATUSES } = await import("@/lib/prospects");
  const status = STATUSES.find((s) => s === patch.status);
  updateProspect(id, { ...patch, status });
  revalidatePath("/prospecao");
}

/** Starts the sample matchday for one prospect (sync → photo hunt → copy of the model look). */
export async function prospectSampleAction(id: string, again = false) {
  const { resetSample, startSample } = await import("@/lib/prospects");
  if (again) resetSample(id);
  startSample(id);
}

export async function prospectSampleStateAction(ids: string[]) {
  const { getProspect } = await import("@/lib/prospects");
  return ids.map((id) => {
    const p = getProspect(id);
    return { id, sample_status: p?.sample_status ?? "", sample_edit_id: p?.sample_edit_id ?? null, player_id: p?.player_id ?? null };
  });
}

export async function saveProspectSettingsAction(lang: string, t: { message: string; plans: string; followup: string }, sampleEditId: string, sport: string = "soccer") {
  const { saveProspectSettings } = await import("@/lib/prospects");
  const { LANGS, sportOf } = await import("@/lib/prospect-lang");
  const l = LANGS.find((x) => x === lang) ?? "pt";
  saveProspectSettings(l, t, sampleEditId, sportOf(sport));
  revalidatePath("/prospecao");
}

/** The follow-up message was sent (copied and the conversation opened). */
export async function followUpProspectAction(id: string) {
  const { markFollowedUp } = await import("@/lib/prospects");
  markFollowedUp(id);
  revalidatePath("/prospecao");
}

/** Starts / stops the background search for the players' Instagram accounts (suggestions only). */
export async function igSearchAction(division = "") {
  const { igSearchState, startIgSearch, stopIgSearch } = await import("@/lib/prospects");
  if (igSearchState().running) stopIgSearch();
  else startIgSearch(division);
  // Give a just-stopped loop a moment to notice, then report what is really happening.
  await new Promise((r) => setTimeout(r, 300));
  const st = igSearchState();
  return { ...st, running: st.running && !(globalThis as unknown as { igSearch?: { stop: boolean } }).igSearch?.stop };
}

export async function igSearchStateAction() {
  const { igSearchState } = await import("@/lib/prospects");
  return igSearchState();
}

/** Confirms (ok) or rejects one suggested Instagram account. */
export async function igCandidateAction(id: string, handle: string, ok: boolean) {
  const { confirmInstagram, rejectInstagram } = await import("@/lib/prospects");
  if (ok) confirmInstagram(id, handle);
  else rejectInstagram(id, handle);
  revalidatePath("/prospecao");
}

export async function saveBraveKeyAction(key: string) {
  const { saveBraveKey } = await import("@/lib/prospects");
  saveBraveKey(key);
  revalidatePath("/prospecao");
}

export async function setBraveLimitAction(limit: number) {
  const { setBraveLimit } = await import("@/lib/prospects");
  setBraveLimit(limit);
  revalidatePath("/prospecao");
}

/** Opens a client's own page (photos, data) or Criar: his internal player is created on first use. */
export async function clientPlayerAction(prospectId: string): Promise<string | null> {
  const { ensureProspectPlayer } = await import("@/lib/prospects");
  return ensureProspectPlayer(prospectId);
}

/* ---------------- Agências (the user's own service; never NEYOD) ---------------- */

export async function agencyScanAction() {
  const { startAgencyScan } = await import("@/lib/agencies/store");
  startAgencyScan();
}

export async function agencyScanStateAction() {
  const { agencyScanState } = await import("@/lib/agencies/store");
  return agencyScanState();
}

export async function updateAgencyAction(id: string, patch: { instagram?: string; designer?: string; status?: string; note?: string; no_instagram?: number; email?: string }) {
  if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email.trim())) throw new Error("Email inválido");
  const { updateAgency, AGENCY_STATUSES, DESIGNER } = await import("@/lib/agencies/store");
  if (patch.status && !(AGENCY_STATUSES as readonly string[]).includes(patch.status)) throw new Error("Estado inválido");
  if (patch.designer && !(DESIGNER as readonly string[]).includes(patch.designer)) throw new Error("Valor inválido");
  updateAgency(id, patch as Parameters<typeof updateAgency>[1]);
  revalidatePath("/agencias", "layout");
}

export async function agencyEmailSearchAction() {
  const { startEmailSearch } = await import("@/lib/agencies/store");
  startEmailSearch();
}

export async function agencyEmailSearchStateAction() {
  const { emailSearchState } = await import("@/lib/agencies/store");
  return emailSearchState();
}

export async function saveAgencyEmailTemplatesAction(lang: "pt" | "en", t: { subject: string; body: string; followupSubject: string; followup: string }) {
  const { saveAgencyEmailTemplates } = await import("@/lib/agencies/store");
  saveAgencyEmailTemplates(lang, t);
  revalidatePath("/agencias");
}

export async function agencyFollowUpAction(id: string) {
  const { markAgencyFollowedUp } = await import("@/lib/agencies/store");
  markAgencyFollowedUp(id);
  revalidatePath("/agencias");
}

export async function saveAgencyTemplatesAction(lang: "pt" | "en", t: { message: string; plans: string; followup: string }) {
  const { saveAgencyTemplates } = await import("@/lib/agencies/store");
  saveAgencyTemplates(lang, t);
  revalidatePath("/agencias");
}

export async function uploadAgencyLogoAction(id: string, fd: FormData) {
  const file = fd.get("logo");
  if (!(file instanceof File) || !file.size) throw new Error("Escolhe um ficheiro");
  const { saveAgencyLogo } = await import("@/lib/agencies/store");
  await saveAgencyLogo(id, file);
  revalidatePath(`/agencias/${id}`);
}

export async function agencyRosterAction(id: string) {
  const { fetchRoster } = await import("@/lib/agencies/clients");
  return fetchRoster(id);
}

export async function linkAgencyPlayersAction(id: string, players: { tmUrl: string; name: string }[]) {
  const { linkPlayers } = await import("@/lib/agencies/clients");
  const out = await linkPlayers(id, players);
  revalidatePath(`/agencias/${id}`);
  return out;
}

export async function unlinkAgencyPlayerAction(id: string, playerId: string) {
  const { unlinkPlayer } = await import("@/lib/agencies/clients");
  unlinkPlayer(id, playerId);
  revalidatePath(`/agencias/${id}`);
}

export async function bookAgencyLookAction(id: string, week: string, look: string) {
  const { bookLook } = await import("@/lib/agencies/clients");
  bookLook(id, week, look);
  revalidatePath(`/agencias/${id}`);
}

export async function runAgencyBatchAction(id: string) {
  const { runWeeklyBatch } = await import("@/lib/agencies/clients");
  const out = runWeeklyBatch(id);
  revalidatePath(`/agencias/${id}`);
  return out;
}

/* ---------------- Video stories (goal / assist clips) ---------------- */

/** Uploads a goal / assist video for a player and opens its story edit (tracking starts in the background). */
export async function createClipAction(playerId: string, fd: FormData) {
  const file = fd.get("video");
  if (!(file instanceof File) || !file.size) throw new Error("Escolhe o vídeo");
  if (!/\.(mp4|mov|m4v|webm)$/i.test(file.name)) throw new Error("O vídeo tem de ser MP4 ou MOV");
  const kind = fd.get("kind") === "assist" ? "assist" : "goal";
  const { createClip } = await import("@/lib/clips/store");
  const editId = await createClip(playerId, file, kind, String(fd.get("score") ?? ""));
  redirect(`/edits/${editId}`);
}

/** The clip's tracking status and, once ready, its camera path. */
export async function clipStateAction(id: string) {
  const { getClip, clipPath, clipAnchors } = await import("@/lib/clips/store");
  const c = getClip(id);
  if (!c) return null;
  return { status: c.status, progress: c.progress, anchors: clipAnchors(c), zoom: c.zoom, trim_start: c.trim_start, trim_end: c.trim_end, path: c.status === "pronto" ? await clipPath(id) : null };
}

/** Saves anchors / zoom / trim and returns the recomputed camera path. */
export async function saveClipAction(id: string, patch: { anchors?: { f: number; x: number; y: number }[]; zoom?: number; trim_start?: number; trim_end?: number | null }) {
  const { saveClipSettings } = await import("@/lib/clips/store");
  return saveClipSettings(id, patch);
}
