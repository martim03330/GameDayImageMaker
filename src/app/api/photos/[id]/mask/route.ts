import fs from "node:fs/promises";
import sharp from "sharp";
import { repairMask, separateMask } from "@/lib/cutout";
import { getPhoto, setPhotoCutout } from "@/lib/repo";
import { absPath } from "@/lib/storage";

/**
 * Hand touch-up of a photo's cutout (components/CutoutFixer). The cutout PNG keeps the photo's real colours
 * even where its alpha is 0, so fixing a hole only means switching those pixels back on (by hand, or from
 * SAM's proposal) — the colours never go through a model again.
 *
 *   GET ?part=rgb    the cutout's colours, opaque (JPEG) — a canvas would lose them under alpha 0
 *   GET ?part=alpha  the cutout's mask (greyscale PNG)
 *   GET ?part=repair the mask with its holes repaired by SAM ("Reparar com IA"): a proposal, nothing saved
 *   POST ?separate=1 {keep, drop}  only the clicked player left ("Separar jogador"): a proposal, nothing saved
 *   POST (image/png) the corrected mask, as the alpha of any PNG the cutout's size: written as a NEW cutout
 *                    file (the files route caches by name), the previous one kept for "repor"
 *   DELETE           back to the cutout before the last touch-up
 */
const noStore = { "Cache-Control": "no-store" };

function cutoutOf(id: string) {
  const photo = getPhoto(id);
  return photo?.cutout && photo.cutout_status === "done" ? photo : null;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const photo = cutoutOf((await params).id);
  if (!photo) return new Response("sem recorte", { status: 404 });
  const part = new URL(req.url).searchParams.get("part");
  if (part === "repair") {
    try {
      return new Response(new Uint8Array(await repairMask(photo.cutout!)), { headers: { "Content-Type": "image/png", ...noStore } });
    } catch (e) {
      console.error("cutout repair failed", e);
      return new Response("não foi possível reparar", { status: 500 });
    }
  }
  const img = sharp(absPath(photo.cutout!));
  if (part === "alpha") return new Response(new Uint8Array(await img.extractChannel(3).png().toBuffer()), { headers: { "Content-Type": "image/png", ...noStore } });
  return new Response(new Uint8Array(await img.removeAlpha().jpeg({ quality: 94 }).toBuffer()), { headers: { "Content-Type": "image/jpeg", ...noStore } });
}

/** Points the photo at another cutout file, keeping the stored alignment (same geometry) and the one it replaces. */
function applyCutout(photo: NonNullable<ReturnType<typeof cutoutOf>>, rel: string, prev: string | null) {
  const meta = photo.meta ? JSON.parse(photo.meta) : {};
  if (meta.nat_align?.cut === photo.cutout) meta.nat_align.cut = rel;
  if (prev) meta.cutout_prev = prev;
  else delete meta.cutout_prev;
  setPhotoCutout(photo.id, "done", rel, JSON.stringify(meta));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const photo = cutoutOf((await params).id);
  if (!photo) return new Response("sem recorte", { status: 404 });
  if (new URL(req.url).searchParams.get("separate")) {
    const body = (await req.json()) as { keep?: number[][]; drop?: number[][] };
    const pts = (v?: number[][]) => (v ?? []).filter((p) => p.length === 2 && p.every(Number.isFinite)).slice(0, 40);
    if (!pts(body.keep).length) return new Response("clica primeiro no jogador", { status: 400 });
    try {
      return new Response(new Uint8Array(await separateMask(photo.cutout!, { keep: pts(body.keep), drop: pts(body.drop) })), { headers: { "Content-Type": "image/png", ...noStore } });
    } catch (e) {
      console.error("cutout separate failed", e);
      return new Response("não foi possível separar", { status: 500 });
    }
  }
  const src = sharp(absPath(photo.cutout!));
  const { width, height } = await src.metadata();
  if (!width || !height) return new Response("recorte inválido", { status: 500 });
  const sent = Buffer.from(await req.arrayBuffer());
  const mask = await sharp(sent).ensureAlpha().extractChannel(3).resize(width, height, { fit: "fill" }).raw().toBuffer();
  const rgb = await src.removeAlpha().raw().toBuffer();
  const out = await sharp(rgb, { raw: { width, height, channels: 3 } })
    .joinChannel(mask, { raw: { width, height, channels: 1 } })
    .png({ compressionLevel: 8 })
    .toBuffer();
  const rel = photo.file.replace(/\.[^.]+$/, "") + `_cutout_fix${Date.now().toString(36)}.png`;
  await fs.writeFile(absPath(rel), out);
  // Only the original cutout is kept for "repor"; intermediate touch-ups are dropped.
  const meta = photo.meta ? JSON.parse(photo.meta) : {};
  const prev: string = meta.cutout_prev ?? photo.cutout!;
  if (meta.cutout_prev && photo.cutout !== meta.cutout_prev) await fs.rm(absPath(photo.cutout!), { force: true }).catch(() => null);
  applyCutout(photo, rel, prev);
  return Response.json({ cutout: rel });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const photo = cutoutOf((await params).id);
  if (!photo) return new Response("sem recorte", { status: 404 });
  const meta = photo.meta ? JSON.parse(photo.meta) : {};
  const prev: string | undefined = meta.cutout_prev;
  if (!prev) return new Response("nada para repor", { status: 409 });
  const current = photo.cutout!;
  applyCutout(photo, prev, null);
  await fs.rm(absPath(current), { force: true }).catch(() => null);
  return Response.json({ cutout: prev });
}
