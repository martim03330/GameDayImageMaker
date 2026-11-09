import fs from "node:fs/promises";
import { exportClip } from "@/lib/clips/export";

export const runtime = "nodejs";
export const maxDuration = 600;

/** The video story of a goal / assist edit as an MP4 download (also saved in ~/Downloads/GameDay). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const url = new URL(req.url);
    const { file, savedTo, name } = await exportClip((await params).id, url.origin, url.searchParams.get("sharp") === "1");
    return new Response(new Uint8Array(await fs.readFile(file)), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${name}"`,
        ...(savedTo ? { "X-Saved-To": encodeURIComponent(savedTo) } : {}),
      },
    });
  } catch (e) {
    console.error("clip export failed", e);
    return new Response((e as Error).message, { status: 500 });
  }
}
