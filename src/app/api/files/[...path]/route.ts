import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { absPath } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

/**
 * Stored files. `?w=1200` serves a copy no wider/taller than that (kept in data/files/_resized): CSS masks
 * built from a huge cutout (e.g. 2653×5258, 23 MB) fail silently in Chromium and then hide whatever they
 * mask (the welcome post's black-and-white photo vanished in the export).
 */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.join("/");
  const ext = path.extname(rel).toLowerCase();
  const w = Number(new URL(req.url).searchParams.get("w"));
  try {
    let buf: Buffer;
    if (w >= 64 && w <= 4000 && (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp")) {
      const cached = absPath(path.posix.join("_resized", `${rel.replace(/[\\/]/g, "_")}_${Math.round(w)}${ext}`));
      try {
        buf = await fs.readFile(cached);
      } catch {
        const img = sharp(absPath(rel)).resize(Math.round(w), Math.round(w), { fit: "inside", withoutEnlargement: true });
        buf = await (ext === ".png" ? img.png({ compressionLevel: 8 }) : img.jpeg({ quality: 88 })).toBuffer();
        await fs.mkdir(path.dirname(cached), { recursive: true });
        await fs.writeFile(cached, buf);
      }
    } else buf = await fs.readFile(absPath(rel));
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
