/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** The burnt-in orange-red of a disposable camera's date imprint. */
export const STAMP = "#ff5a1e";

/* ------------------------------------------------------------------ */
/* Seven-segment glyphs, drawn as SVG (no LCD font in the repo).        */
/* ------------------------------------------------------------------ */

/** Segments a..g lit per glyph. */
const SEGS: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg",
  G: "acdef", O: "abcdef", A: "abcefg", L: "def", B: "cdefg", R: "eg", C: "adef", E: "adefg", H: "bcefg", T: "defg", I: "bc", K: "bcefg", P: "abefg", "-": "g",
  S: "afgcd", Y: "bcdfg", U: "bcdef", N: "ceg", F: "aefg", D: "bcdeg", J: "bcde", M: "aceg", W: "bdf", V: "bcdef", X: "bcefg", Z: "abged", Q: "abcfg",
};

/** Cell width of a glyph, in units of the glyph height. */
const cellW = (c: string) => (c === " " ? 0.36 : c === ":" || c === "'" || c === "." ? 0.24 : 0.56);
const GAP = 0.13;

/** Width of a seven-segment string at height h. */
export function segWidth(text: string, h: number) {
  const cs = [...text];
  return cs.reduce((a, c) => a + cellW(c) * h, 0) + Math.max(0, cs.length - 1) * GAP * h;
}

function glyph(c: string, x: number, h: number, key: number) {
  const t = h * 0.12;
  const g = t * 0.16;
  const w = 0.56 * h;
  const polys: string[] = [];
  const hor = (yc: number) => {
    const x1 = x + t / 2 + g;
    const x2 = x + w - t / 2 - g;
    return `${x1},${yc} ${x1 + t / 2},${yc - t / 2} ${x2 - t / 2},${yc - t / 2} ${x2},${yc} ${x2 - t / 2},${yc + t / 2} ${x1 + t / 2},${yc + t / 2}`;
  };
  const ver = (xc: number, y1: number, y2: number) =>
    `${xc},${y1} ${xc + t / 2},${y1 + t / 2} ${xc + t / 2},${y2 - t / 2} ${xc},${y2} ${xc - t / 2},${y2 - t / 2} ${xc - t / 2},${y1 + t / 2}`;
  if (c === ":") {
    const cx = x + 0.12 * h;
    return (
      <g key={key}>
        <rect x={cx - t / 2} y={h * 0.27} width={t} height={t} />
        <rect x={cx - t / 2} y={h * 0.63} width={t} height={t} />
      </g>
    );
  }
  if (c === "'") return <polygon key={key} points={`${x + 0.08 * h},0 ${x + 0.08 * h + t},0 ${x + 0.12 * h},${h * 0.3} ${x + 0.06 * h},${h * 0.3}`} />;
  if (c === ".") return <rect key={key} x={x + 0.12 * h - t / 2} y={h - t} width={t} height={t} />;
  const on = SEGS[c.toUpperCase()] ?? "";
  const L = x + t / 2;
  const R = x + w - t / 2;
  for (const s of on) {
    if (s === "a") polys.push(hor(t / 2));
    if (s === "g") polys.push(hor(h / 2));
    if (s === "d") polys.push(hor(h - t / 2));
    if (s === "f") polys.push(ver(L, t / 2 + g, h / 2 - g));
    if (s === "b") polys.push(ver(R, t / 2 + g, h / 2 - g));
    if (s === "e") polys.push(ver(L, h / 2 + g, h - t / 2 - g));
    if (s === "c") polys.push(ver(R, h / 2 + g, h - t / 2 - g));
  }
  return (
    <g key={key}>
      {polys.map((p, i) => (
        <polygon key={i} points={p} />
      ))}
    </g>
  );
}

/** A glowing seven-segment line, slanted like an LCD and burnt into the film like a date imprint. */
export function Segments({ text, h, style }: { text: string; h: number; style?: CSSProperties }) {
  const cs = [...text];
  const w = segWidth(text, h);
  const pad = h * 0.3;
  let x = pad;
  const nodes = cs.map((c, i) => {
    const n = glyph(c, x, h, i);
    x += (cellW(c) + GAP) * h;
    return n;
  });
  const glow = Math.max(3, h * 0.16);
  return (
    <svg
      width={w + pad * 2}
      height={h + pad * 2}
      viewBox={`0 ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      style={{
        display: "block",
        overflow: "visible",
        filter: `blur(${Math.max(0.5, h * 0.012)}px) drop-shadow(0 0 1.5px rgba(70,12,0,.45)) drop-shadow(0 0 ${glow * 0.5}px rgba(255,110,40,.9)) drop-shadow(0 0 ${glow * 1.6}px rgba(255,70,20,.5))`,
        ...style,
      }}
    >
      <g transform={`skewX(-7) translate(${h * 0.06} 0)`} fill={STAMP}>
        {nodes}
      </g>
      {/* A hotter, paler core so the segments read as light, not paint. */}
      <g transform={`skewX(-7) translate(${h * 0.06} 0)`} fill="#ffc29a" opacity={0.35} style={{ filter: `blur(${h * 0.04}px)` }}>
        {nodes}
      </g>
    </svg>
  );
}

const MONTH_N: Record<string, number> = {
  JAN: 1, FEV: 2, FEB: 2, MAR: 3, ABR: 4, APR: 4, MAI: 5, MAY: 5, JUN: 6, JUL: 7, AGO: 8, AUG: 8, SET: 9, SEP: 9, OUT: 10, OCT: 10, NOV: 11, DEZ: 12, DEC: 12,
};

/** "19 SET" (or "SAT 19 SEP") + "17:00" → { date: "19 09 '26", time: "17:00" }; no date → today, like a camera would. */
export function stampOf(date?: string, time?: string): { date: string; time: string } {
  const now = new Date();
  const m = (date ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  let d = now.getDate();
  let mo = now.getMonth() + 1;
  let y = now.getFullYear();
  if (m && MONTH_N[m[2]]) {
    d = Number(m[1]);
    mo = MONTH_N[m[2]];
    // A January fixture listed in December belongs to next year; a stale one to this year.
    if (mo < now.getMonth() + 1 - 6) y += 1;
    else if (mo > now.getMonth() + 1 + 6) y -= 1;
  }
  const p2 = (n: number) => String(n).padStart(2, "0");
  const tm = (time ?? "").match(/^(\d{1,2})[:hH.](\d{2})/);
  return { date: `${p2(d)} ${p2(mo)} '${String(y).slice(2)}`, time: tm ? `${p2(Number(tm[1]))}:${tm[2]}` : "" };
}

/** Home team first, names exactly as stored. */
export function fixtureOf(data: RenderData) {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? c.homeTeam : c.awayTeam) || ours).trim();
  const oppName = ((weHost ? c.awayTeam : c.homeTeam) || f.opp || "").trim();
  const teams = (weHost ? [oursName, oppName] : [oppName, oursName]).filter(Boolean) as string[];
  return { f, teams, weHost };
}

/** Inter 500: advance widths per 100px. */
const INTER_W: Record<string, number> = {
  a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8,
  n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9,
  A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3,
  N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1,
  " ": 26.7, "'": 31.3, "-": 46.3, ".": 27, ":": 27, "–": 50, "·": 27,
};
export const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);
export const fitInter = (t: string, width: number, max: number, tracking = 0, min = 10) => Math.max(min, Math.min(max, width / Math.max(0.5, interEm(t, tracking))));

/**
 * Date stamp: the film-camera date-imprint trend. His own photo, softly graded warm like a disposable
 * camera print (blurred ground, the cutout sharp over it), and one typographic idea — the glowing
 * orange-red seven-segment date imprint in the bottom-right corner, kick-off time over it. Everything else
 * tiny in Inter in the top-left corner; the NEYOD mark bottom-left.
 */
export function Datestamp({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const { f, teams } = fixtureOf(data);
  const st = stampOf(content.date, f.timeLocal || f.time);

  /* ---- the corner stamp, bottom-right ---- */
  const M = story ? 72 : 60;
  const dateH = (story ? 58 : 44) * ts;
  const timeH = dateH * 0.72;
  const stampBottom = story ? STORY_BOTTOM : CANVAS_H - 58;
  const pad = dateH * 0.3;

  /* ---- top-left info, tiny Inter ---- */
  const infoTop = (story ? STORY_TOP : 64) + ty;
  const title = (content.kicker || "MATCHDAY").toUpperCase();
  const tSize = 14 * S * ts;
  const fixture = teams.join("  v  ");
  const fixSize = fitInter(fixture, story ? 820 : 640, 24 * S * ts, 0, 13);
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ");
  const venue = titleCase(f.venue);
  const small = [comp, venue].filter(Boolean);
  const sSize = Math.min(...small.map((s) => fitInter(s, story ? 820 : 640, 15 * S * ts, 0, 11)), 15 * S * ts);
  const infoBottom = infoTop + tSize + 18 * S + fixSize * 1.15 + small.length * (sSize * 1.3 + 6 * S);

  /* ---- the player, big: the frame is about him ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const box = placeByFace(data, faceX, Math.max(infoBottom + (story ? 120 : 90), story ? 470 : 300), story ? { chest: 360, waist: 290, knees: 225, full: 180 } : { chest: 270, waist: 210, knees: 165, full: 130 });

  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,.45)" };
  // The warm disposable-camera grade, shared by ground and figure (light: the face stays natural and sharp).
  const grade = "sepia(.16) saturate(1.12) contrast(1.06) brightness(1.02)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.6), color: WHITE }}>
      {back ? (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: H + 180, maxWidth: "none", objectFit: "cover", filter: `blur(${story ? 26 : 22}px) ${grade} brightness(.9)` }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 42%, ${shade(club, 0.05)}, ${shade(club, -0.55)})` }} />
      )}
      {/* Warm cast + the slight flash fall-off of a cheap camera. */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,170,90,.10)", mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,214,160,.14), transparent 45%, rgba(40,10,0,.18))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 640 : 460, background: "linear-gradient(to bottom, rgba(0,0,0,.34), transparent)" }} />

      {/* Soft shade behind him, then the sharp figure. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: box.top + box.height * 0.2, width: box.width * 0.64, height: box.height * 0.7, borderRadius: "50%", background: "rgba(0,0,0,.24)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: grade, ...cutMask(data.cut) }} />
      )}
      {/* The flash vignette of a 35mm print. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(20,8,0,.42) 100%)" }} />

      {/* Top-left: the rest of the information, small and clean. */}
      <div style={{ position: "absolute", left: M, top: infoTop, ...soft }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tSize, letterSpacing: "0.32em", lineHeight: 1 }}>{title}</div>
        {fixture && <div style={{ marginTop: 18 * S, fontFamily: SANS, fontWeight: 500, fontSize: fixSize, letterSpacing: "-0.005em", lineHeight: 1.15 }}>{fixture}</div>}
        {small.map((s) => (
          <div key={s} style={{ marginTop: 6 * S, fontFamily: SANS, fontWeight: 400, fontSize: sSize, lineHeight: 1.3, color: "rgba(255,255,255,.78)" }}>{s}</div>
        ))}
      </div>

      {/* The date imprint, burnt into the bottom-right corner. */}
      <div style={{ position: "absolute", right: M - pad, bottom: H - stampBottom - pad, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: dateH * 0.04 }}>
        {st.time && <Segments text={st.time} h={timeH} />}
        <Segments text={st.date} h={dateH} />
      </div>

      <AgencyLogo
        data={data}
        height={story ? 24 : 20}
        style={{ position: "absolute", left: M, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.3} />
    </div>
  );
}
