import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { cutoutPhoto } from "./cutout";
import * as repo from "./repo";
import { fetchImage } from "./sources";
import { fetchText } from "./sources/http";
import { absPath } from "./storage";
import type { PhotoMeta, Player } from "./types";

const run = promisify(execFile);
const PYTHON = path.join(process.cwd(), "services/cutout/.venv/bin/python");
const FACES = path.join(process.cwd(), "services/cutout/faces.py");

/** SFace cosine similarity; 0.363 is the model's own threshold, we are a bit stricter. */
const SAME_PERSON = 0.4;
const MIN_SIDE = 600; // news photos are usually 1200×675; the upscaler takes it from there
const MAX_ARTICLES = 25;

const log = (...a: unknown[]) => console.log("[fotos]", ...a);

/** Recent news articles mentioning the player (Bing News RSS; links are direct publisher URLs). */
async function newsArticles(p: Player): Promise<string[]> {
  const club = repo.getClub(p.club_id)?.name;
  const queries = [`"${p.first_name} ${p.last_name}"`, club && `"${p.first_name} ${p.last_name}" ${club}`].filter(Boolean) as string[];
  let text = "";
  for (const q of queries) {
    for (const lang of ["pt-PT", "en-GB"]) {
      text += (await fetchText(`https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setlang=${lang}`).catch(() => ({ text: "" }))).text;
    }
  }
  const urls = [...text.matchAll(/<link>([^<]+)<\/link>/g)]
    .map((m) => m[1].replace(/&amp;/g, "&"))
    .map((l) => {
      const u = l.match(/[?&]url=([^&]+)/)?.[1];
      return u ? decodeURIComponent(u) : null;
    })
    .filter((u): u is string => !!u && u.startsWith("http"));
  return [...new Set(urls)].slice(0, MAX_ARTICLES);
}

/**
 * Image search (Bing Images): pictures of him on club sites, regional press and public pages — where the
 * lower leagues actually are, as the national news rarely covers them. Name + club keeps homonyms down; the
 * face check below throws out the rest. Returns the direct image URLs.
 */
async function imageSearch(p: Player): Promise<string[]> {
  const club = repo.getClub(p.club_id)?.name ?? "";
  const q = `"${p.first_name} ${p.last_name}" ${club}`.trim();
  const { text } = await fetchText(`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2`).catch(() => ({ text: "" }));
  const urls = [...text.matchAll(/m="(\{[^"]*\})"/g)]
    .map((m) => {
      try {
        return (JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")) as { murl?: string }).murl ?? null;
      } catch {
        return null;
      }
    })
    // His zerozero portrait is the reference itself, not a new photo.
    .filter((u): u is string => !!u && u.startsWith("http") && !/zerozero\.pt|staticzz\.com/.test(u));
  return [...new Set(urls)].slice(0, MAX_ARTICLES);
}

/** Largest shared image of an article (og:image / twitter:image). */
async function articleImage(url: string): Promise<string | null> {
  const { text } = await fetchText(url);
  const m =
    text.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ??
    text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ??
    text.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  return m ? new URL(m[1].replace(/&amp;/g, "&"), url).toString() : null;
}

/** Reference faces: the player's own photos (originals) plus the zerozero / Transfermarkt portrait. */
async function references(p: Player): Promise<string[]> {
  const refs = repo
    .listPhotos(p.id, "player")
    .filter((ph) => ph.source === "upload")
    .map((ph) => absPath(ph.file));
  if (p.photo_url) {
    try {
      const rel = path.posix.join("refs", `${p.id}.jpg`);
      await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
      await sharp(await fetchImage(p.photo_url)).jpeg().toFile(absPath(rel));
      refs.push(absPath(rel));
    } catch {
      /* no portrait available */
    }
  }
  return refs;
}

/** 64-bit difference hash: near-identical photos (same shot, other crop/compression) differ in few bits. */
async function dhash(file: string): Promise<boolean[]> {
  const px = await sharp(file).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  const bits: boolean[] = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits.push(px[y * 9 + x] > px[y * 9 + x + 1]);
  return bits;
}

const hamming = (a: boolean[], b: boolean[]) => a.reduce((n, bit, i) => n + (bit !== b[i] ? 1 : 0), 0);

async function isDuplicate(file: string, playerId: string): Promise<boolean> {
  const h = await dhash(file);
  for (const ph of repo.listPhotos(playerId, "player")) {
    try {
      if (hamming(h, await dhash(absPath(ph.file))) <= 10) return true;
    } catch {
      /* missing file */
    }
  }
  return false;
}

type Match = { width: number; height: number; best: number; face: number[] | null; faces: number };

/** Looks for new public photos of the player and adds the ones where his face is recognised. */
export async function huntPhotos(playerId: string, opts: { images?: boolean } = {}): Promise<number> {
  const p = repo.getPlayer(playerId);
  if (!p) return 0;
  const refs = await references(p);
  if (!refs.length) return 0;

  let added = 0;
  // News articles (their shared image), and with `images` also an image search (direct image URLs).
  const articles = await newsArticles(p).catch(() => []);
  const direct = opts.images ? await imageSearch(p).catch(() => []) : [];
  const sources = [...articles.map((url) => ({ url, direct: false })), ...direct.map((url) => ({ url, direct: true }))];
  for (const { url: article, direct: isImage } of sources) {
    if (repo.photoSeen(p.id, article)) continue;
    let status = "no-image";
    let score: number | null = null;
    try {
      const img = isImage ? article : await articleImage(article);
      if (img) {
        const buf = await fetchImage(img);
        const meta = await sharp(buf).metadata();
        status = "too-small";
        if (Math.min(meta.width ?? 0, meta.height ?? 0) >= MIN_SIDE) {
          const rel = path.posix.join("photos", `${nanoid(10)}.jpg`);
          await fs.mkdir(path.dirname(absPath(rel)), { recursive: true });
          await sharp(buf).rotate().jpeg({ quality: 95 }).toFile(absPath(rel));
          const { stdout } = await run(PYTHON, [FACES, absPath(rel), ...refs], { timeout: 120_000 });
          const m = JSON.parse(stdout.trim().split("\n").pop() ?? "{}") as Match;
          score = m.best;
          // The face must be his and large enough to make a usable cutout.
          if (m.best >= SAME_PERSON && m.face && m.face[3] * m.height >= 60 && (await isDuplicate(absPath(rel), p.id))) {
            await fs.rm(absPath(rel), { force: true });
            status = "duplicate";
          } else if (m.best >= SAME_PERSON && m.face && m.face[3] * m.height >= 60 && m.faces === 1) {
            const id = repo.insertPhoto({ player_id: p.id, kind: "player", file: rel, source: "auto", source_url: article });
            repo.setPhotoCutout(id, "pending");
            await cutoutPhoto(id);
            // Second check on the cutout: one person only, no team photos, no baked-in banners.
            const meta = JSON.parse(repo.getPhoto(id)?.meta ?? "{}") as PhotoMeta;
            if ((meta.people ?? 1) !== 1 || (meta.faces ?? 1) !== 1 || meta.width / meta.height > 1.25) {
              repo.deletePhoto(id);
              status = "rejected-group";
              log(`${p.first_name}: rejeitada (várias pessoas / foto de grupo) ${article}`);
            } else {
              added++;
              status = "added";
              log(`${p.first_name}: nova foto por aprovar (${m.best.toFixed(2)}) ${article}`);
            }
          } else {
            await fs.rm(absPath(rel), { force: true });
            status = "not-him";
          }
        }
      }
    } catch (e) {
      status = "error";
      log("erro", article, e instanceof Error ? e.message : e);
    }
    repo.markPhotoSeen(p.id, article, status, score);
  }
  repo.updatePlayer(p.id, { last_photo_hunt: new Date().toISOString() });
  return added;
}
