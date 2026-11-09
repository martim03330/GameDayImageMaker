"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* A coarse read of the framed photo, in the browser: where the grass is, and where he is.          */
/* ------------------------------------------------------------------------------------------------ */

/** The framed photo and his figure layer, read at a coarse grid (SW columns, one row per SY canvas px). */
export type NatScan = {
  w: number;
  h: number;
  /** Canvas px per grid cell. */
  sx: number;
  sy: number;
  /** His figure's alpha (0..255), row by row. */
  alpha: Uint8Array;
  /** 1 where the photo is grass (green, saturated), row by row. */
  grass: Uint8Array;
  /** The photo's luminance (0..255), row by row. */
  lum: Uint8Array;
};

const SW = 216;
const SY = 4;
const scans = new Map<string, Promise<NatScan | null>>();

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, fail) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => ok(img);
    img.onerror = fail;
    img.src = src;
  });
}

function read(img: HTMLImageElement, w: number, h: number): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, w, h);
  return g.getImageData(0, 0, w, h).data;
}

async function scan(bg: string, fig: string, W: number, H: number): Promise<NatScan | null> {
  const [b, f] = await Promise.all([load(bg), load(fig)]);
  const w = SW;
  const h = Math.round(H / SY);
  const pb = read(b, w, h);
  const pf = read(f, w, h);
  const alpha = new Uint8Array(w * h);
  const grass = new Uint8Array(w * h);
  const lum = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    alpha[i] = pf[i * 4 + 3];
    const [r, g, bl] = [pb[i * 4], pb[i * 4 + 1], pb[i * 4 + 2]];
    lum[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * bl);
    const mx = Math.max(r, g, bl);
    const mn = Math.min(r, g, bl);
    // Green, even in shade (dark teal turf) or in hard sun; never a blue board, a grey track or white.
    grass[i] = g > 18 && g >= r * 0.97 && g >= bl * 1.02 && g - Math.min(r, bl) >= 6 && (mx - mn) / mx > 0.1 ? 1 : 0;
  }
  return { w, h, sx: W / w, sy: H / h, alpha, grass, lum };
}

/** The coarse scan of a natural look's framed photo — null until it is read (or without a framed photo). */
export function useNatScan(place: NatPlace, W: number, H: number): NatScan | null {
  const { bg, fig } = place.frame;
  const key = bg && fig ? `${bg}|${fig}|${W}|${H}` : "";
  const [state, setState] = useState<{ key: string; scan: NatScan | null } | null>(null);
  useEffect(() => {
    if (!key || !bg || !fig) return;
    let live = true;
    let job = scans.get(key);
    if (!job) {
      job = scan(bg, fig, W, H).catch(() => null);
      scans.set(key, job);
    }
    job.then((s) => live && setState({ key, scan: s }));
    return () => {
      live = false;
    };
  }, [key, bg, fig, W, H]);
  return state?.key === key ? state.scan : null;
}

/**
 * The pitch's horizon on the canvas: the top of the grass that runs up from the foot of the photo (where it
 * meets the boards / the stands), read only beside him. Null when the foot isn't grass, or the grass runs
 * up the whole frame (shot from above: no horizon).
 */
export function horizonOf(s: NatScan): number | null {
  const frac = new Float32Array(s.h).fill(-1);
  for (let r = 0; r < s.h; r++) {
    let n = 0;
    let gr = 0;
    for (let x = 0; x < s.w; x++) {
      const i = r * s.w + x;
      if (s.alpha[i] > 40) continue;
      n++;
      gr += s.grass[i];
    }
    if (n >= 12) frac[r] = gr / n;
  }
  // The foot must be grass (the last rows may sink into a dark vignette: look over the lowest 15%).
  let start = -1;
  for (let r = s.h - 1; r >= Math.round(s.h * 0.85); r--)
    if (frac[r] >= 0.5) {
      start = r;
      break;
    }
  if (start < 0) return null;
  let top = start;
  let miss = 0;
  for (let r = start; r >= 0; r--) {
    if (frac[r] < 0 || frac[r] >= 0.45) {
      if (frac[r] >= 0.45) top = r;
      miss = 0;
    } else if (++miss > 5) break;
  }
  if (top <= 2) return null;
  return top * s.sy;
}

/** His figure's left / right edge (canvas px) between two heights, or null where he isn't. */
export function spanOf(s: NatScan, y0: number, y1: number): [number, number] | null {
  let lo = s.w;
  let hi = -1;
  for (let r = Math.max(0, Math.floor(y0 / s.sy)); r <= Math.min(s.h - 1, Math.ceil(y1 / s.sy)); r++)
    for (let x = 0; x < s.w; x++)
      if (s.alpha[r * s.w + x] > 60) {
        if (x < lo) lo = x;
        if (x > hi) hi = x;
      }
  return hi < 0 ? null : [lo * s.sx, (hi + 1) * s.sx];
}

/** Does his figure (measured, else his head guessed from the face) reach into a rectangle of the canvas? */
export function figureIn(s: NatScan | null, place: NatPlace, x0: number, y0: number, x1: number, y1: number): boolean {
  if (!s) {
    const hx0 = place.fx - place.faceW * 0.8;
    const hx1 = place.fx + place.faceW * 0.8;
    const hy0 = place.fy - place.fs * 0.85;
    const hy1 = place.fy + place.fs * 0.7;
    return hx1 > x0 && hx0 < x1 && hy1 > y0 && hy0 < y1;
  }
  let n = 0;
  for (let r = Math.max(0, Math.floor(y0 / s.sy)); r <= Math.min(s.h - 1, Math.ceil(y1 / s.sy)); r++)
    for (let x = Math.max(0, Math.floor(x0 / s.sx)); x <= Math.min(s.w - 1, Math.ceil(x1 / s.sx)); x++) if (s.alpha[r * s.w + x] > 60) n++;
  return n > 3;
}

/** Mean luminance (0..1) of the photo beside him (his figure left out) in a rectangle; null without a scan. */
export function lumIn(s: NatScan | null, x0: number, y0: number, x1: number, y1: number): number | null {
  if (!s) return null;
  let n = 0;
  let t = 0;
  for (let r = Math.max(0, Math.floor(y0 / s.sy)); r <= Math.min(s.h - 1, Math.ceil(y1 / s.sy)); r++)
    for (let x = Math.max(0, Math.floor(x0 / s.sx)); x <= Math.min(s.w - 1, Math.ceil(x1 / s.sx)); x++) {
      const i = r * s.w + x;
      if (s.alpha[i] > 60) continue;
      n++;
      t += s.lum[i];
    }
  return n ? t / n / 255 : null;
}

/**
 * Where the NEYOD logo goes along the top: centred, unless his head (or a raised arm) is there — then the
 * top corner away from him. `h` = the logo's real height, `M` the side margin.
 */
export function logoSpot(s: NatScan | null, place: NatPlace, W: number, top: number, h: number, M: number): "center" | "left" | "right" {
  const w = h * 3.2;
  const clear = (x0: number) => !figureIn(s, place, x0 - 30, top - 20, x0 + w + 30, top + h + 44);
  if (clear(W / 2 - w / 2)) return "center";
  const order: ("left" | "right")[] = place.fx >= W / 2 ? ["left", "right"] : ["right", "left"];
  for (const side of order) if (clear(side === "left" ? M : W - M - w)) return side;
  return "center";
}

/* ------------------------------------------------------------------------------------------------ */
/* The look                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

/** White type that holds on a light board or a bright sky too: a tight shade and a wide soft one. */
export const NAT_TEXT_SHADOW = "0 1px 3px rgba(0,0,0,.42), 0 2px 6px rgba(0,0,0,.3), 0 6px 30px rgba(0,0,0,.45)";

/** A run's possible line sets: on one line, or broken in two after any of its parts (joiners trimmed). */
function lineSets(parts: string[]): string[][] {
  const clean = (t: string) => t.replace(/[\s·]+$/u, "").replace(/^\s+/, "");
  const sets = [[clean(parts.join(""))]];
  for (let i = 1; i < parts.length; i++) sets.push([clean(parts.slice(0, i).join("")), clean(parts.slice(i).join(""))]);
  return sets.filter((s) => s.every(Boolean));
}

type Block = { side: "left" | "right"; lines: string[] };

/**
 * The horizon line shared by nathorizon / goalnathorizon: his real photo full-bleed and small, wide-spaced
 * caps set ON the pitch's horizon (where the grass meets the boards behind him, read from the photo) — one
 * run from the left margin towards his legs, the other from his legs to the right margin — behind the sharp
 * cutout, so he stands over the line. Where he fills the line, a run breaks in two (its last line still on
 * the horizon) or both runs share the roomier side. The NEYOD logo alone at the top.
 * `left` / `right`: the two runs, as parts that keep their joiners ("MATCHDAY  ·  ", "25 OCT  ·  15:00").
 */
export function HorizonLine({ data, left, right }: { data: RenderData; left: string[]; right: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const W = CANVAS_W;
  const M = story ? 70 : 62;

  const place = natPlace(data, W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 640 : 440,
    fs: story ? 230 : 150,
  });
  const scanned = useNatScan(place, W, H);

  /* ---- the line: on the horizon, else a little under his waist ---- */
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoAt = logoSpot(scanned, place, W, logoTop, story ? 88 : 52, M);
  const lo = place.fy + place.fs * 1.9; // never higher than his chest
  const hi = story ? STORY_BOTTOM - 10 : H - 74;
  const measured = scanned ? horizonOf(scanned) : null;
  const horizon = Math.round(Math.min(hi, Math.max(lo, measured ?? place.fy + place.fs * 3.6)));

  /* ---- the runs, fitted beside him ---- */
  const tr = 0.3;
  const s0 = 16 * k * ts;
  const sMin = 11.5 * k * ts;
  const lead = 1.9;
  const pad = 36 * k;
  const em = (lines: string[]) => Math.max(...lines.map((l) => capsEm(l, tr)), 0.1);
  const setsL = lineSets(left);
  const setsR = lineSets(right);
  const options: Block[][] = [];
  for (const a of setsL)
    for (const b of setsR)
      options.push(
        [{ side: "left", lines: a }, { side: "right", lines: b }],
        [{ side: "right", lines: a }, { side: "left", lines: b }],
      );
  // Both runs on one side, stacked (at most three lines).
  for (const side of ["left", "right"] as const)
    for (const a of setsL) for (const b of setsR) if (a.length + b.length <= 3) options.push([{ side, lines: [...a, ...b] }]);
  /** The best layout with its last baseline at y: the runs beside him (the measured figure over the block's
   *  height, else a guess from his face), as large as the room allows (≤ s0). */
  const fitAt = (y: number) => {
    let best = { fit: 0, score: -1, blocks: options[0] };
    for (const blocks of options) {
      const rows = Math.max(...blocks.map((b) => b.lines.length));
      const [l, r] = (scanned && spanOf(scanned, y - s0 * (0.9 + (rows - 1) * lead) - 8, y + 6)) ?? [place.fx - place.faceW * 1.4, place.fx + place.faceW * 1.4];
      const room = { left: Math.max(0, l - pad - M), right: Math.max(0, W - M - r - pad) };
      const fit = Math.min(s0, ...blocks.map((b) => room[b.side] / em(b.lines)));
      // The line proper — one run either side of him, each on one line — whenever it is legible; else a
      // little bias for fewer lines and for the split across the width.
      const line = rows === 1 && blocks.length === 2 && fit >= sMin * 1.08;
      const score = line ? 1000 + fit : fit * (rows === 1 ? 1.08 : 1) * (blocks.length === 2 ? 1.04 : 1) * (rows === 3 ? 0.94 : 1);
      if (score > best.score) best = { fit, score, blocks };
    }
    return best;
  };
  // On the horizon when it has room; where he fills it (arms out, a bust), the line steps down onto the
  // grass until it fits beside him; failing that, the smallest legible size, set in front of him.
  let lineY = horizon;
  let pick = fitAt(horizon);
  if (pick.fit < sMin) {
    if (measured !== null) {
      for (let y = horizon + 12 * k; y <= hi; y += 12 * k) {
        const t = fitAt(y);
        if (t.fit >= sMin * 1.08) {
          lineY = y;
          pick = t;
          break;
        }
      }
    } else {
      // No horizon in the photo (crowd, wall): the line may sit anywhere between his chest and the foot —
      // wherever there is most room beside him.
      for (let y = lo; y <= hi; y += 12 * k) {
        const t = fitAt(y);
        if (t.fit > pick.fit + 0.5) {
          lineY = y;
          pick = t;
        }
      }
    }
  }
  const front = pick.fit < sMin;
  const size = Math.max(pick.fit, sMin);
  const blocks = pick.blocks;
  const rows = Math.max(...blocks.map((b) => b.lines.length));
  const baseline = lineY - Math.round(size * 0.18) - (params.textY ?? 0);

  const block = (b: Block) => (
    <div
      key={b.side}
      style={{
        position: "absolute",
        top: baseline - size * 0.865 - (b.lines.length - 1) * size * lead,
        ...(b.side === "left" ? { left: M } : { right: M }),
        marginRight: b.side === "right" ? `-${tr}em` : 0,
        textAlign: b.side,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: size,
        lineHeight: lead,
        letterSpacing: `${tr}em`,
        whiteSpace: "nowrap",
        color: OFF_WHITE,
        textShadow: NAT_TEXT_SHADOW,
        zIndex: front ? 2 : 0,
      }}
    >
      {b.lines.map((l, i) => (
        <div key={i} style={{ height: i === b.lines.length - 1 ? size : size * lead, lineHeight: 1 }}>
          {l}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE, isolation: "isolate" }}>
      <NatGround place={place} W={W} H={H} />

      {/* A breath of shade at the top for the logo, and a soft band along the horizon for the line. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.22), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: baseline - size - (rows - 1) * size * lead - 70 * k,
          height: size + (rows - 1) * size * lead + 140 * k,
          background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.2) 40%, rgba(0,0,0,.2) 60%, rgba(0,0,0,0))",
        }}
      />

      {/* The line on the horizon, behind him. */}
      {blocks.map(block)}

      {/* He stands over it: the sharp cutout exactly over his figure. */}
      <NatFigure data={data} place={place} W={W} H={H} style={{ zIndex: 1 }} />

      <AgencyLogo
        data={data}
        height={24}
        style={{
          position: "absolute",
          top: logoTop,
          zIndex: 3,
          ...(logoAt === "center"
            ? { left: "50%", transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }
            : logoAt === "left"
              ? { left: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }
              : { right: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }),
        }}
      />
    </div>
  );
}

/**
 * Natural · horizon (matchday): his own match photo full-bleed (real grass, boards and light, light grade
 * only) with one line of small wide-spaced caps sitting ON the pitch's horizon behind him —
 * "MATCHDAY · 25 OCT · 15:00" on one side of his legs, "HOME v AWAY" (exact names) on the other — so he
 * stands over the line. The NEYOD logo alone at the top.
 */
export function Nathorizon({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const kicker = (data.content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const when = [fx.date, fx.kickoff].filter(Boolean).join("  ·  ");
  const left = [kicker + (when ? "  ·  " : ""), when].filter(Boolean);
  const right = fx.homeName && fx.awayName ? [`${fx.homeName.toUpperCase()}  `, `v  ${fx.awayName.toUpperCase()}`] : [(fx.homeName || fx.awayName).toUpperCase()];
  return <HorizonLine data={data} left={left} right={right} />;
}
