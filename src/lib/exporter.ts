import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type Page } from "playwright";
import sharp from "sharp";
import { getEdit, setEditOutput } from "./repo";
import { exportFinished, exportStarted, recordSceneUses } from "./scenes";
import { absPath } from "./storage";

/** Renders at 2× (2160×2700): kept as the master PNG; the Instagram JPEG is made from it. */
const EXPORT_SCALE = 2;
const FPS = 30;

export type Format = "post" | "story";
const SIZE: Record<Format, { width: number; height: number }> = { post: { width: 1080, height: 1350 }, story: { width: 1080, height: 1920 } };

const globalForBrowser = globalThis as unknown as { browser?: Promise<Browser> };

function browser(): Promise<Browser> {
  if (!globalForBrowser.browser) {
    globalForBrowser.browser = chromium.launch();
    globalForBrowser.browser.then(
      // If Chromium crashes or closes, launch a fresh one on the next export instead of failing forever.
      (b) => b.on("disconnected", () => (globalForBrowser.browser = undefined)),
      () => (globalForBrowser.browser = undefined),
    );
  }
  return globalForBrowser.browser;
}

async function waitForAssets(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) => (img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true })))),
    );
  });
  // The logo size and the no-cut text fit (templates/LogoLift) apply once the logo / fonts have loaded: wait.
  await page.waitForFunction(() => !document.querySelector("[data-logo-pending], [data-fit-pending]"), undefined, { timeout: 10_000 }).catch(() => null);
}

/** Screenshots /render/<id> (post 1080×1350 or story 1080×1920, rendered at 2×) and stores the PNG. */
export async function exportEdit(editId: string, baseUrl: string, format: Format = "post", slide?: number): Promise<{ rel: string; png: Buffer }> {
  const b = await browser();
  const page = await b.newPage({ viewport: SIZE[format], deviceScaleFactor: EXPORT_SCALE });
  exportStarted();
  try {
    await page.goto(`${baseUrl}/render/${editId}?format=${format}${slide ? `&slide=${slide}` : ""}`, { waitUntil: "networkidle" });
    await waitForAssets(page);
    // The generated backdrops this edit shows now count as used by the player (next edits pick others).
    const shown = await page.evaluate(() => [...document.querySelectorAll("img, image")].map((e) => e.getAttribute("src") ?? e.getAttribute("href") ?? ""));
    const playerId = getEdit(editId)?.player_id;
    if (playerId) recordSceneUses(playerId, shown);
    const png = await page.locator("#canvas").screenshot({ type: "png" });
    const rel = path.posix.join("exports", `${editId}${slide ? `_s${slide}` : ""}${format === "story" ? "_story" : ""}.png`);
    await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
    await fs.writeFile(absPath(rel), png);
    if (format === "post" && (!slide || slide === 1)) setEditOutput(editId, rel);
    return { rel, png };
  } finally {
    exportFinished();
    await page.close();
  }
}

/**
 * Vector PDF of the story (1080×1920 page) in two layers: underneath, the whole picture (photos, blur,
 * effects) as a 3× image without any type; on top, every text and the agency logo as vectors. It looks
 * exactly like the story, and the words and logo never pixelate when zoomed (print, roll-ups, the club).
 * (Chromium's own PDF of the page loses the blur/blend effects and turns soft text shadows into boxes.)
 */
export async function exportPdf(editId: string, baseUrl: string): Promise<Buffer> {
  const b = await browser();
  const page = await b.newPage({ viewport: SIZE.story, deviceScaleFactor: 3 });
  exportStarted();
  try {
    await page.goto(`${baseUrl}/render/${editId}?format=story`, { waitUntil: "networkidle" });
    await waitForAssets(page);
    // 0. Type that something sits on top of (a giant word behind the player) must stay where it is, in
    //    the picture: only type nothing covers is lifted into vectors.
    await page.evaluate(() => {
      const canvas = document.getElementById("canvas")!;
      for (const el of canvas.querySelectorAll<HTMLElement | SVGElement>("*")) {
        if (el.closest("#story-bg") || el.closest("[data-agency-logo]")) continue;
        const ownText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
        if (!ownText && el.tagName.toLowerCase() !== "text") continue;
        const r = el.getBoundingClientRect();
        let covered = false;
        for (let i = 1; i <= 7 && !covered; i++)
          for (let j = 1; j <= 3 && !covered; j++) {
            const top = document.elementFromPoint(r.left + (r.width * i) / 8, r.top + (r.height * j) / 4);
            if (top && top !== el && !el.contains(top) && !top.contains(el)) covered = true;
          }
        if (covered) {
          el.setAttribute("data-covered", "");
          el.querySelectorAll("*").forEach((c) => c.setAttribute("data-covered", ""));
        }
      }
    });
    // 1. The picture without its type: text made transparent (its shadows stay), logo hidden.
    const hide = await page.addStyleTag({
      content:
        "#canvas *:not(#story-bg *):not([data-covered]) { color: transparent !important; -webkit-text-fill-color: transparent !important; -webkit-text-stroke-color: transparent !important }" +
        " #canvas text:not(#story-bg *):not([data-covered]), #canvas tspan:not(#story-bg *):not([data-covered]) { fill: transparent !important; stroke: transparent !important }" +
        // (the blurred frame of non-native stories keeps its own blurred copy of the type and logo)
        " [data-agency-logo]:not(#story-bg *) { visibility: hidden !important }",
    });
    const picture = await page.locator("#canvas").screenshot({ type: "jpeg", quality: 93 });
    await hide.evaluate((el) => (el as Element).remove());
    // 2. Only the type and the logo stay live, over that picture.
    await page.evaluate(async (src) => {
      const canvas = document.getElementById("canvas")!;
      for (const el of canvas.querySelectorAll<HTMLElement | SVGElement>("*")) {
        const ownText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
        // The blurred frame of non-native stories is a copy of the post: its type stays in the picture.
        if (el.closest("#story-bg") || el.hasAttribute("data-covered")) continue;
        if (ownText || el.closest("[data-agency-logo]") || el.tagName.toLowerCase() === "text") el.setAttribute("data-vec", "");
      }
      const img = new Image();
      img.src = src;
      await img.decode();
      img.setAttribute("data-bg", "");
      img.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:0";
      canvas.prepend(img);
    }, `data:image/jpeg;base64,${picture.toString("base64")}`);
    await page.emulateMedia({ media: "screen" });
    await page.addStyleTag({
      content:
        "@page { size: 1080px 1920px; margin: 0 } html, body { margin: 0; padding: 0; background: #000 }" +
        " #canvas * { visibility: hidden !important } #canvas img[data-bg], #canvas [data-vec], #canvas [data-vec] * { visibility: visible !important }" +
        // Backgrounds / boxes are already in the picture; soft text shadows would print as dark boxes.
        " #canvas [data-vec]:not([data-agency-logo] *) { background: transparent !important; box-shadow: none !important; border-color: transparent !important }" +
        " #canvas [data-vec]:not([data-keep-shadow]) { text-shadow: none !important }",
    });
    return await page.pdf({ width: "1080px", height: "1920px", printBackground: true, pageRanges: "1", preferCSSPageSize: true });
  } finally {
    exportFinished();
    await page.close();
  }
}

/**
 * Ready-to-post JPEG at exactly the size Instagram shows (1080×1350 post / 1080×1920 story), made from
 * the 2× render: a careful Lanczos downscale plus a light output sharpen, sRGB, 4:4:4 colour. Instagram
 * then only re-compresses it instead of resizing it with its own (softer) scaler.
 */
export async function instagramJpeg(png: Buffer, format: Format = "post"): Promise<Buffer> {
  const { width, height } = SIZE[format];
  return sharp(png)
    .resize(width, height, { kernel: "lanczos3", fit: "fill" })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.2 })
    .toColourspace("srgb")
    .withIccProfile("srgb")
    .jpeg({ quality: 95, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
}

/**
 * The story's blurred backdrop never moves, but headless Chromium (software rendering) recomputes its
 * 70px blur on every screenshot: ~2 s per frame. Capture it once, then show that capture as a plain image.
 */
async function freezeStoryBackground(page: Page) {
  // Native stories have no blurred frame to freeze.
  if (!(await page.locator("#story-bg").count())) return;
  const canvas = page.locator("#canvas");
  await page.evaluate(() => (document.getElementById("post")!.parentElement!.style.visibility = "hidden"));
  const bg = await canvas.screenshot({ type: "png" });
  await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    img.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    document.getElementById("story-bg")!.replaceWith(img);
    document.getElementById("post")!.parentElement!.style.visibility = "";
  }, `data:image/png;base64,${bg.toString("base64")}`);
}

/**
 * 3-second animated version (MP4, H.264, 30 fps): the render page builds a paused animation timeline,
 * we seek it frame by frame, screenshot each frame and pipe the PNGs into ffmpeg.
 */
export async function exportVideo(editId: string, baseUrl: string, format: Format = "post"): Promise<Buffer> {
  const b = await browser();
  // Frames are rendered at 2× and scaled down by ffmpeg (Lanczos): crisp text and photo edges.
  const page = await b.newPage({ viewport: SIZE[format], deviceScaleFactor: 2 });
  const out = absPath(path.posix.join("exports", `${editId}${format === "story" ? "_story" : ""}.mp4`));
  // Encode to a temporary file and rename at the end, so a failed run never leaves a broken MP4 behind.
  const tmp = `${out}.${process.pid}.${Date.now()}.tmp.mp4`;
  await fs.mkdir(path.dirname(out), { recursive: true });
  let ffmpeg: ReturnType<typeof spawn> | null = null;
  exportStarted();
  try {
    await page.goto(`${baseUrl}/render/${editId}?format=${format}&motion=1`, { waitUntil: "networkidle" });
    await waitForAssets(page);
    await page.waitForFunction(() => window.__motionReady === true, null, { timeout: 30_000 });
    const duration = (await page.evaluate(() => window.__motionDuration)) ?? 3000;
    const frames = Math.round((duration / 1000) * FPS);
    if (format === "story") await freezeStoryBackground(page);

    const proc = (ffmpeg = spawn(process.env.FFMPEG_PATH || "ffmpeg", [
      "-y",
      "-f", "image2pipe",
      "-framerate", String(FPS),
      "-i", "-",
      "-vf", `scale=${SIZE[format].width}:${SIZE[format].height}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
      "-c:v", "libx264",
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      "-crf", "14",
      "-preset", "slow",
      // Tag the colours as standard HD video, so phones and Instagram don't shift the club colours.
      "-colorspace", "bt709",
      "-color_primaries", "bt709",
      "-color_trc", "bt709",
      "-color_range", "tv",
      "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
      "-movflags", "+faststart",
      tmp,
    ]));
    const done = new Promise<void>((resolve, reject) => {
      proc.on("error", reject);
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg saiu com código ${code}`))));
    });
    const canvas = page.locator("#canvas");
    for (let f = 0; f <= frames; f++) {
      await page.evaluate((ms) => window.__seek?.(ms), (f / FPS) * 1000);
      const png = await canvas.screenshot({ type: "png", animations: "allow" });
      if (!proc.stdin!.write(png)) await new Promise((r) => proc.stdin!.once("drain", r));
    }
    proc.stdin!.end();
    await done;
    ffmpeg = null;
    await fs.rename(tmp, out);
    return await fs.readFile(out);
  } finally {
    ffmpeg?.kill("SIGKILL");
    exportFinished();
    await fs.rm(tmp, { force: true });
    await page.close().catch(() => {});
  }
}

/**
 * Video stories: the look's static story (2×, scaled down by ffmpeg) and where its #clip-slot sits on the
 * 1080×1920 canvas — the ball-following video is laid exactly over that rectangle.
 */
export async function exportClipFrame(editId: string, baseUrl: string): Promise<{ png: Buffer; slot: { x: number; y: number; w: number; h: number } }> {
  const b = await browser();
  const page = await b.newPage({ viewport: SIZE.story, deviceScaleFactor: 2 });
  exportStarted();
  try {
    await page.goto(`${baseUrl}/render/${editId}?format=story`, { waitUntil: "networkidle" });
    await waitForAssets(page);
    const canvas = await page.locator("#canvas").boundingBox();
    const box = await page.locator("#clip-slot").boundingBox();
    if (!canvas || !box) throw new Error("Este estilo não tem espaço para o vídeo");
    const png = await page.locator("#canvas").screenshot({ type: "png" });
    const r = (v: number) => Math.round(v / 2) * 2; // even sizes / positions for H.264
    return { png, slot: { x: r(box.x - canvas.x), y: r(box.y - canvas.y), w: r(box.width), h: r(box.height) } };
  } finally {
    exportFinished();
    await page.close();
  }
}
