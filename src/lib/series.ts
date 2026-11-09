import { flaggedPhotoIds, getClub, getEdit, getPlayer, saveEdit } from "./repo";
import { defaultContent, defaultStyle, renderContext } from "./render-data";
import type { Edit, TemplateParams } from "./types";
import { stripAgency } from "./agencies/rules";
import { poseFit, TEMPLATES } from "@/templates";
import type { RenderPhoto } from "@/templates/compose";

/**
 * "The same edit for every player": one look, layout and title copied onto other players, so the
 * agency's Instagram shows a consistent series. Each copy keeps the player's own name, game, crests
 * and best photo for that look; colours are either the same as the original or the player's club's.
 */
export function copyEditToPlayer(sourceId: string, playerId: string, opts: { sameColors: boolean }): string | null {
  const source = getEdit(sourceId);
  const player = getPlayer(playerId);
  if (!source || !player) return null;

  const content = defaultContent(player, source.post_type);
  // The title is part of the look (GAME DAY / MATCHDAY / …): every post in the series says the same.
  content.kicker = source.content.kicker;

  const ctx = renderContext(player.id);
  const photoId = bestPhoto(source, ctx.photos);
  const photo = photoId ? ctx.photos[photoId] : undefined;

  const club = defaultStyle(getClub(player.club_id));
  const def = TEMPLATES.find((t) => t.id === source.params.templateId);
  const params: TemplateParams = {
    // Never the agency-service branding: a copy is NEYOD's own edit.
    ...stripAgency(source.params),
    ...(opts.sameColors ? {} : { primary: club.primary, accent: club.accent, text: club.text }),
    // Nudges and a generated scene belong to the original photo / club, not to this player.
    playerX: undefined,
    playerY: undefined,
    playerScale: undefined,
    scene: undefined,
  };
  // Looks that can swap sides put the player looking into the picture, as the Criar page does.
  if (def?.flips && photo?.facing && photo.facing !== "front") params.side = photo.facing === "right" ? "left" : "right";
  // Tight crops enlarge the photo: step back to a wider framing when this player's photo would look soft.
  const px = photo?.facePx ?? 0;
  if (params.framing === "chest" && px < 160) params.framing = px >= 90 ? "waist" : "knees";
  if (params.framing === "waist" && px < 90) params.framing = "knees";

  return saveEdit({ player_id: player.id, post_type: source.post_type, photo_id: photoId, params, content });
}

/** The player's photo that suits the look best: right crop (body / bust / feet), clean, current kit, pose, then sharpest. */
export function bestPhoto(source: Pick<Edit, "params">, photos: Record<string, RenderPhoto>): string | null {
  const def = TEMPLATES.find((t) => t.id === source.params.templateId);
  const want = def?.photo ?? "full";
  const flagged = flaggedPhotoIds();
  const ready = Object.entries(photos).filter(([, p]) => p.kind === "player" && p.cutoutUrl);
  if (!ready.length) return null;
  const score = ([id, p]: [string, RenderPhoto]) =>
    (def?.feet ? Number(!p.bust && (p.cut?.bottom ?? 0) < 0.05) * 64 : 0) +
    (want === "any" || !!p.bust === (want === "bust") ? 32 : 0) +
    (!p.soft && !p.messy && !flagged.has(id) ? 16 : 0) +
    ((p.kit ?? 0.5) >= 0.5 ? 8 : 0) +
    (p.headOnly ? 0 : 4) +
    // Sharpness beats pose: a soft action shot looks worse than a crisp standing one.
    ((p.facePx ?? 0) >= 160 ? 4 : (p.facePx ?? 0) >= 90 ? 3 : 0) +
    (want !== "bust" && (p.cut?.bottom ?? 0) < 0.05 ? 2 : 0) +
    poseFit(source.params.templateId, p.pose) +
    Math.min(p.facePx ?? 0, 400) / 1000;
  return ready.sort((a, b) => score(b) - score(a))[0][0];
}
