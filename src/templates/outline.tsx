/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade, vivid } from "@/lib/color";
import { ARCHIVO, cutMask, DELA, Film, type Box } from "./fx";
import { rng } from "./kit";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- small helpers shared by the 2026-09-21 looks (outline, glow, headline) ---------- */

/** Face height on the canvas for each framing: tighter framings bring the player closer. */
const FACE_H: Record<string, number> = { chest: 240, waist: 170, knees: 128, full: 100 };

/**
 * Places the cutout by its face: the face's centre at `faceX`, its top at `faceTop`, the body always
 * running off the bottom edge. Honours framing, scale and the edit's nudges; never blows a small face
 * up far beyond its real resolution.
 */
export function placeByFace(data: RenderData, faceX: number, faceTop: number, sizes: Record<string, number> = FACE_H): Box & { faceH: number } {
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let faceH = (sizes[p.framing ?? "waist"] ?? sizes.waist ?? 170) * (p.playerScale ?? 1);
  // Exported at 2x: past ~2.4x the real face pixels the face goes soft.
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  const h = Math.max(faceH / face[3], ((data.canvasH ?? CANVAS_H) + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return {
    left: faceX - w * (face[0] + face[2] / 2) + (p.playerX ?? 0),
    top: faceTop - h * face[1] + (p.playerY ?? 0),
    width: w,
    height: h,
    faceH: face[3] * h,
  };
}

/** The final or live score, "" when the post has none. */
export function scoreOf(data: RenderData, dash = "-"): string {
  const c = data.content;
  return c.homeGoals != null && c.awayGoals != null && String(c.homeGoals) !== "" && String(c.awayGoals) !== "" ? `${c.homeGoals}${dash}${c.awayGoals}` : "";
}

/** Home and away crests (ours standing in for a missing home crest). */
export function crestsOf(data: RenderData): string[] {
  const c = data.content;
  return [c.homeCrest ?? (c.awayCrest ? null : data.club?.crestUrl), c.awayCrest].filter(Boolean) as string[];
}

/** The competition alone ("LIGA 3 · MATCHDAY 5" → "LIGA 3"), never the "VS …" part. */
export function competitionOf(data: RenderData): string {
  const parts = data.content.subline.split("·").map((s) => s.trim()).filter((s) => s && !/^VS\b/i.test(s));
  return (parts[0] ?? "").toUpperCase();
}

/** The whole caption without the opponent, e.g. "LIGA 3 · MATCHDAY 5". */
export function roundOf(data: RenderData): string {
  return data.content.subline
    .split("·")
    .map((s) => s.trim())
    .filter((s) => s && !/^VS\b/i.test(s))
    .join(" · ")
    .toUpperCase();
}

/** Scenery behind the player: the real ground first, then generated backdrops; null when there is none. */
export function sceneOf(data: RenderData): string | null {
  return data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? null;
}

/** The player's own photo, always heavily blurred (club photos carry their own graphics). */
export function OwnPhotoBlur({ data, blur = 34, style }: { data: RenderData; blur?: number; style?: CSSProperties }) {
  if (!data.bgPhotoUrl) return null;
  return (
    <img
      src={data.bgPhotoUrl}
      alt=""
      style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CANVAS_H + 180, maxWidth: "none", objectFit: "cover", filter: `blur(${blur}px) saturate(1.1)`, ...style }}
    />
  );
}

/* ---------- the look ---------- */

const WHITE = "#ffffff";
const TIGHT = "0 2px 12px rgba(0,0,0,.5)";
const LIFT = "drop-shadow(0 6px 16px rgba(0,0,0,.35))";
const SMALL: CSSProperties = { fontFamily: ARCHIVO, fontWeight: 600, fontSize: 19, letterSpacing: "0.3em", color: WHITE, textShadow: TIGHT, whiteSpace: "nowrap", textTransform: "uppercase" };

/** Small spaced caps shrunk to stay inside ~400px. */
const fit = (t: string) => Math.min(19, 400 / Math.max(1, [...t].length * 0.95));

/** Dela Gothic One: average advance of its capitals, relative to the font size. */
const DELA_RATIO = 0.9;

/** Single words that read better broken in two when stacked. */
const COMPOUNDS: [RegExp, number][] = [
  [/^(MATCH|GAME)DAY$/, 5],
  [/^FULLTIME$/, 4],
  [/^HAT-?TRICK$/, 3],
];

/**
 * A line of outline-only lettering, stretched to exactly `width` (SVG textLength), so a word always
 * spans the same measure whatever its length.
 */
function OutlineWord({ text, x, baseline, width, size, stroke = 4, fill = "none", style }: { text: string; x: number; baseline: number; width: number; size: number; stroke?: number; fill?: string; style?: CSSProperties }) {
  const pad = 20;
  return (
    <svg
      width={width + pad * 2}
      height={size * 1.2}
      style={{ position: "absolute", left: x - pad, top: baseline - size * 0.95, overflow: "visible", ...style }}
    >
      <text
        x={pad}
        y={size * 0.95}
        textLength={width}
        lengthAdjust="spacingAndGlyphs"
        style={{ fontFamily: DELA, fontSize: size }}
        fill={fill}
        stroke={WHITE}
        strokeWidth={stroke}
        strokeLinejoin="round"
      >
        {text}
      </text>
    </svg>
  );
}

/**
 * Minimal club "FULLTIME" post: a natural, warm photo of the player and one giant geometric word drawn
 * only as a thin white outline, crossing in front of his body; a tiny spaced line at the top
 * (club · crest · competition) and, bottom corner, the crests either side of the score (or the kick-off).
 * A second take stacks the word on two lines: the upper one behind his head, the lower one in front.
 */
export function Outline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 83);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const right = params.side !== "left";
  const roll = r();
  const scene = sceneOf(data);
  // Own photo blurred keeps the light of the cutout; a real ground photo when the seed says so.
  const useScene = !!scene && (!data.bgPhotoUrl || r() < 0.45);

  // ---- the title ----
  const raw = content.kicker.toUpperCase().trim();
  const words = raw.split(/\s+/).filter(Boolean);
  const joined = words.join("");
  // Stacked only for short titles: a long first line would lose whole letters behind the head.
  const stacked = roll < 0.4 && (words.length === 1 ? joined.length <= 10 : words.length === 2 && Math.max(...words.map((w) => w.length)) <= 8);
  let lines: string[];
  if (!stacked) {
    lines = joined.length <= 10 ? [joined] : [words.slice(0, -1).join(" "), words[words.length - 1]];
  } else if (words.length >= 2) {
    lines = joined.length <= 10 && words.length === 2 ? words : [words.slice(0, -1).join(" "), words[words.length - 1]];
  } else {
    const c = COMPOUNDS.find(([re]) => re.test(joined));
    lines = c ? [joined.slice(0, c[1]).replace(/-$/, ""), joined.slice(c[1]).replace(/^-/, "")] : [joined, (content.lastName || content.firstName).toUpperCase()];
  }
  lines = lines.filter(Boolean);
  const longest = Math.max(...lines.map((l) => [...l].length));
  const measure = 1000 * (params.textScale ?? 1);
  const size = Math.min(stacked ? 230 : 300, measure / (longest * DELA_RATIO));
  const widthOf = (l: string) => Math.min(measure, [...l].length * size * DELA_RATIO);
  const capH = size * 0.74;
  const gap = size * 0.3;

  // ---- the player ----
  const faceTop = stacked ? 300 + r() * 30 : 250 + r() * 40;
  const fig = placeByFace(data, 540 + (right ? -50 : 50), faceTop);
  const chin = faceTop + fig.faceH * 1.2;
  // Single line: the lower-middle third, well under the chin.
  const oneBaseline = Math.min(1010, Math.max(chin + 70 + capH, 800 + capH * 0.5));
  // Stacked: the first line's letters rise from behind the head (baseline near the mouth), the second follows.
  const firstBaseline = Math.max(170 + capH, faceTop + fig.faceH * 0.72);
  const baselines = stacked ? lines.map((_, i) => firstBaseline + i * (capH + gap)) : lines.map((_, i) => oneBaseline - (lines.length - 1 - i) * (capH + gap));

  const figure = data.photoUrl && (
    <img
      src={data.photoUrl}
      alt=""
      style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.04) drop-shadow(0 26px 44px rgba(0,0,0,.32))", ...cutMask(data.cut) }}
    />
  );
  const word = (i: number) => (
    <OutlineWord key={i} text={lines[i]} x={540 - widthOf(lines[i]) / 2} baseline={baselines[i]} width={widthOf(lines[i])} size={size} stroke={size > 200 ? 5 : 4} />
  );

  // ---- corner block: crests either side of the score / kick-off / numbers ----
  const score = scoreOf(data);
  const crests = crestsOf(data);
  const solidScore = r() < 0.6;
  const when = [content.date, content.time].filter(Boolean) as string[];
  // Only numbers worth showing: no zeros, no scores.
  const facts = content.stats.filter((s) => s.value && !/-/.test(s.value) && Number(s.value) !== 0).slice(0, 2);
  const crestImg = (src: string, key: number) => <img key={key} src={src} alt="" style={{ width: 92, height: 92, objectFit: "contain", filter: LIFT }} />;
  let middle: ReactNode = null;
  if ((postType === "result" || postType === "goal") && score) {
    const s = score.length > 5 ? 84 : 112;
    middle = solidScore ? (
      <div style={{ fontFamily: DELA, fontSize: s, lineHeight: 1, color: WHITE, textShadow: "0 8px 30px rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>{score}</div>
    ) : (
      <div style={{ fontFamily: DELA, fontSize: s, lineHeight: 1, color: "transparent", WebkitTextStroke: `3px ${WHITE}`, whiteSpace: "nowrap" }}>{score}</div>
    );
  } else if (postType === "matchday" && when.length) {
    middle = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {content.time && <div style={{ fontFamily: DELA, fontSize: 64, lineHeight: 1, color: WHITE, textShadow: "0 8px 30px rgba(0,0,0,.35)" }}>{content.time}</div>}
        {content.date && <div style={{ ...SMALL, fontSize: 18, letterSpacing: "0.24em" }}>{content.date}</div>}
      </div>
    );
  } else if (facts.length) {
    middle = (
      <div style={{ display: "flex", gap: 34 }}>
        {facts.map((f, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontFamily: DELA, fontSize: 88, lineHeight: 0.9, color: WHITE, textShadow: "0 8px 30px rgba(0,0,0,.35)" }}>{f.value}</div>
            <div style={{ ...SMALL, fontSize: 15 }}>{f.label}</div>
          </div>
        ))}
      </div>
    );
  }
  // Numbers without teams (player of the month) keep our crest on their left only.
  const cornerCrests = middle ? (postType === "potm" || postType === "stats" ? [data.club?.crestUrl].filter(Boolean) as string[] : crests) : crests;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const comp = competitionOf(data);
  // The competition already heads the post: the foot only adds the round ("MATCHDAY 5").
  const round = roundOf(data).split("·").slice(1).join("·").trim();
  const topRight = postType === "potm" ? content.subline.toUpperCase() : comp;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(accent, -0.6), color: WHITE }}>
      {useScene ? (
        <img src={scene!} alt="" style={{ position: "absolute", left: -40, top: -40, width: CANVAS_W + 80, height: CANVAS_H + 80, maxWidth: "none", objectFit: "cover", filter: "blur(9px) saturate(.9) brightness(.9)" }} />
      ) : (
        <OwnPhotoBlur data={data} blur={36} style={{ filter: "blur(36px) saturate(1.05) brightness(.95)" }} />
      )}
      {/* Natural, slightly warm late-afternoon grade over the whole scene. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(255,196,140,.35), rgba(255,170,110,.08) 45%, rgba(40,30,20,.2))", mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.34), transparent 16%, transparent 55%, rgba(0,0,0,.55) 88%, rgba(0,0,0,.7))" }} />

      {stacked && word(0)}
      {figure}
      {/* The same warm light over the player, so he sits in the photo. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(255,190,130,.22), transparent 50%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
      {lines.map((_, i) => (stacked && i === 0 ? null : word(i)))}

      {/* Sponsor-style top row. */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 50, display: "flex", alignItems: "center", justifyContent: "center", gap: 34 }}>
        <div style={{ ...SMALL, fontSize: fit(data.club?.name ?? ""), flex: 1, textAlign: "right" }}>{data.club?.name ?? ""}</div>
        {data.club?.crestUrl ? <img src={data.club.crestUrl} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: LIFT }} /> : <div style={{ width: 8, height: 8, borderRadius: 9, background: WHITE }} />}
        <div style={{ ...SMALL, fontSize: fit(topRight), flex: 1, textAlign: "left" }}>{topRight}</div>
      </div>

      {/* Bottom: name on one side, crests + score on the other. */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 62, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexDirection: right ? "row" : "row-reverse", gap: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 12, paddingBottom: 6, minWidth: 0, textAlign: right ? "left" : "right" }}>
          {data.player.number && <div style={{ fontFamily: DELA, fontSize: 30, lineHeight: 1, color: WHITE, textShadow: TIGHT }}>{data.player.number}</div>}
          <div style={{ ...SMALL, fontSize: Math.min(20, 430 / ([...name].length * 0.95)) }}>{name}</div>
          {postType !== "potm" && round && <div style={{ ...SMALL, fontSize: 14, opacity: 0.85, whiteSpace: "normal", lineHeight: 1.6, maxWidth: 420 }}>{round}</div>}
          <AgencyLogo data={data} height={24} style={{ opacity: 0.9, marginTop: 6 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, flexShrink: 0 }}>
          {cornerCrests[0] && crestImg(cornerCrests[0], 0)}
          {middle}
          {cornerCrests[1] && crestImg(cornerCrests[1], 1)}
        </div>
      </div>
      <Film strength={0.7} />
    </div>
  );
}
