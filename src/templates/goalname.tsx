/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const MARGIN = 60;
const PAPER = "#ebe8e2";
const INK = "#24221f";

/** Bodoni Moda 500 lowercase: advance widths per 100px (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.5, d: 61.7, e: 52.6, f: 40.2, g: 60.8, h: 60.5, i: 31, j: 31.3, k: 61.6, l: 34.2, m: 87, n: 60.5, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 60.7, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, " ": 25, "-": 36, "'": 21.6 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const bodEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (BOD_W[c] ?? 58) / 100 + tracking, -tracking);
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/** Placed by its outline: the top of the cutout at `top`, centred, the body running off the foot. */
function outlineBox(data: RenderData, top: number, floor = CANVAS_H + 40, maxW = 920) {
  const p = data.params;
  const aspect = data.photoAspect ?? 0.6;
  const scale = p.playerScale ?? 1;
  let h = (floor - top) * scale;
  if (h * aspect > maxW * scale) h = (maxW * scale) / aspect;
  const w = h * aspect;
  return { left: 540 - w / 2 + (p.playerX ?? 0), top: top + (p.playerY ?? 0), width: w, height: h };
}

/**
 * Goalname: the goal version of Namefield — the celebrating player on a calm field (warm off-white or a
 * deep club tone, by seed), his surname enormous in a thin lowercase Bodoni behind his head (accents kept),
 * running off both edges, tone on tone so his face reads first. "GOAL" (the kicker) small at the top; crests,
 * the fixture (home first, "v", never a score) and competition · date small at the foot.
 *
 * (from Namefield: a head-and-shoulders portrait on a calm field (warm off-white or a deep club tone, by seed).
 * His surname set enormous in a thin lowercase Bodoni behind his head, running off both edges, barely
 * darker (or lighter) than the field — tone on tone, so his face reads first. The title small at the top,
 * crests and two quiet lines of fixture, date and ground at the foot.)
 */
export function Goalname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920) spreads the same design over the tall band (STORY_TOP..STORY_BOTTOM), type ~1.45× larger.
  const ts = (params.textScale ?? 1) * (story ? 1.45 : 1);
  // Width budgets: scaled with the type in the post, held to the canvas in the story.
  const wk = story ? (params.textScale ?? 1) * 1.08 : ts;
  const r = rng(params.seed ?? 1);
  const light = r() < 0.5;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);

  const field = light ? PAPER : shade(club, -0.66);
  const fieldHi = light ? "#f3f1ec" : shade(club, -0.5);
  const nameTone = light ? "#d9d4cb" : shade(club, -0.48);
  const ink = light ? INK : "#ffffff";
  const soft = light ? "#77726a" : "rgba(255,255,255,.7)";

  const f = matchFacts(data);

  /* ---- top: the title, small ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const TITLE_TRACK = 0.52;
  const titleSize = Math.max(12 * ts, Math.min(16 * ts * (story ? 1.1 : 1), (700 * wk) / Math.max(1, capsEm(title, TITLE_TRACK))));
  const titleTop = (story ? STORY_TOP : 66) + (params.textY ?? 0);

  /* ---- the bust ---- */
  const faceTop = story ? 515 : 330;
  const sizes: Record<string, number> = story ? { chest: 340, waist: 270, knees: 210, full: 170 } : { chest: 250, waist: 200, knees: 160, full: 130 };
  // A photo with no face found (from behind): placed by its outline, the top of it under the title.
  const noFace = !data.face || data.face[3] < 0.035;
  const box = noFace ? outlineBox(data, faceTop - 60, story ? H - 110 : CANVAS_H + 40, story ? 1040 : 920) : placeFace(data, 540, faceTop, sizes[params.framing ?? "chest"] ?? sizes.chest, story ? H - 110 : CANVAS_H + 30);
  const face = noFace ? [0.4, 0.04, 0.2, 0.14] : data.face!;
  const faceY = box.top + face[1] * box.height;
  const faceH = face[3] * box.height;

  /* ---- the surname behind his head ---- */
  const surname = (content.lastName || content.firstName || "").toLowerCase();
  const TRACK = -0.02;
  const nameSize = Math.min(440, (CANVAS_W * 1.16) / Math.max(1, bodEm(surname, TRACK))) * (params.textScale ?? 1);
  // Baseline a little below his chin: the x-height band sits across his face, ascenders above his head.
  const baseline = Math.min(faceY + faceH * 0.7, story ? 1180 : 860);
  const nameTop = baseline - nameSize * 0.98;

  /* ---- the foot ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 46) - (params.logoY ?? 0);
  const crestS = story ? 68 : 42;
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const oursName = data.club?.name ?? "";
  const ours = shortName(oursName);
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const pair = weHost ? [ours, opp] : [opp, ours];
  // Never a score on a goal post: the two clubs with a "v" between them.
  const fixture = opp && ours ? `${pair[0]}   v   ${pair[1]}` : [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const FIX_TRACK = 0.3;
  const fixSize = Math.max(11 * ts, Math.min(14 * ts, (860 * wk) / Math.max(1, capsEm(fixture, FIX_TRACK))));
  const when = [titleCase(f.comp || f.round || ""), niceDate(content.date)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14 * ts, Math.min(18 * ts, (900 * wk) / Math.max(1, when.length * 0.5)));
  const whenTop = story ? H - logoBottom - 108 - 44 - whenSize * 1.2 : CANVAS_H - logoBottom - 52 - 58 - whenSize * 1.2;
  const fixtureTop = whenTop - (story ? fixSize + 32 : 32);
  const crestTop = fixtureTop - (story ? crestS + 42 : 70);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor || light ? "none" : "url(#goalname-mono)";

  const fadeTo = crestTop - 30;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 300 - box.top}px, transparent ${fadeTo - box.top}px)`;
  const caps = (size: number, track: number, color = ink, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: field, color: ink }}>
      <MonoDefs id="goalname-mono" ink={0.5} />
      {/* The field: one calm tone, a little lighter behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% ${story ? 42 : 50}% at 50% ${story ? 38 : 40}%, ${fieldHi}, ${field} 100%)` }} />

      {/* The surname, tone on tone, running off both edges. */}
      <div
        data-bleed
        style={{ position: "absolute", left: -400, right: -400, top: nameTop, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: nameSize, lineHeight: 1.2, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", color: nameTone }}
      >
        {surname}
      </div>

      {/* The bust, natural colour, settling into the field above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Top: title, competition. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(titleSize, TITLE_TRACK) }}>{title}</div>

      {/* Foot: crests, fixture, date · kick-off · ground. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crestS + 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: fixtureTop, ...caps(fixSize, FIX_TRACK) }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: soft }}>{when}</div>
      )}

      <AgencyLogo
        data={data}
        onLight={light}
        height={story ? 24 : 18}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      {!light && <Film strength={0.2} />}
    </div>
  );
}
