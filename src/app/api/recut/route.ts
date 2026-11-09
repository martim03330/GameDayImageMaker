// TEMPORARY (redo one cutout) — deleted right after use.
import { cutoutPhoto } from "@/lib/cutout";
export async function GET(req: Request) {
  await cutoutPhoto(new URL(req.url).searchParams.get("id") ?? "");
  return Response.json({ ok: true });
}
