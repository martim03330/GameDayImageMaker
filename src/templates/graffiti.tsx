/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { competitionOf, crestsOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour } from "./wall";

/* ---------- a blocky techno pixel font (5 rows; M and W are wider) ---------- */

const GLYPHS: Record<string, string[]> = {
  A: ["#####", "#...#", "#####", "#...#", "#...#"],
  B: ["####.", "#...#", "#####", "#...#", "####."],
  C: ["#####", "#....", "#....", "#....", "#####"],
  D: ["####.", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "####.", "#....", "#####"],
  F: ["#####", "#....", "####.", "#....", "#...."],
  G: ["#####", "#....", "#..##", "#...#", "#####"],
  H: ["#...#", "#...#", "#####", "#...#", "#...#"],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  J: ["....#", "....#", "....#", "#...#", "#####"],
  K: ["#..##", "#.##.", "###..", "#.##.", "#..##"],
  L: ["#....", "#....", "#....", "#....", "#####"],
  M: ["#######", "#..#..#", "#..#..#", "#..#..#", "#..#..#"],
  N: ["#####", "#...#", "#...#", "#...#", "#...#"],
  O: ["#####", "#...#", "#...#", "#...#", "#####"],
  P: ["#####", "#...#", "#####", "#....", "#...."],
  Q: ["#####", "#...#", "#...#", "#..##", "#####"],
  R: ["#####", "#...#", "####.", "#..#.", "#...#"],
  S: ["#####", "#....", "#####", "....#", "#####"],
  T: ["#####", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#####"],
  V: ["#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#..#..#", "#..#..#", "#..#..#", "#..#..#", "#######"],
  X: ["##.##", ".###.", "..#..", ".###.", "##.##"],
  Y: ["#...#", "#...#", "#####", "..#..", "..#.."],
  Z: ["#####", "...##", "..#..", "##...", "#####"],
  "0": ["#####", "#..##", "#.#.#", "##..#", "#####"],
  "1": ["##.", ".#.", ".#.", ".#.", "###"],
  "2": ["#####", "....#", "#####", "#....", "#####"],
  "3": ["#####", "....#", ".####", "....#", "#####"],
  "4": ["#...#", "#...#", "#####", "....#", "....#"],
  "5": ["#####", "#....", "#####", "....#", "#####"],
  "6": ["#####", "#....", "#####", "#...#", "#####"],
  "7": ["#####", "....#", "...#.", "..#..", "..#.."],
  "8": ["#####", "#...#", "#####", "#...#", "#####"],
  "9": ["#####", "#...#", "#####", "....#", "#####"],
  "/": ["...##", "..##.", ".##..", "##...", "#...."],
  "-": ["...", "...", "###", "...", "..."],
  "–": ["....", "....", "####", "....", "...."],
  ":": [".", "#", ".", "#", "."],
  ".": [".", ".", ".", ".", "#"],
  "'": ["#", "#", ".", ".", "."],
  "!": ["#", "#", "#", ".", "#"],
  " ": ["...", "...", "...", "...", "..."],
};

const glyphOf = (c: string) => GLYPHS[c] ?? GLYPHS[c.normalize("NFD").replace(/\p{M}/gu, "")] ?? GLYPHS[" "];

/** Width of a pixel line in cells (1-cell gap between glyphs). */
export function pixelCells(text: string): number {
  const chars = [...text.toUpperCase()];
  return chars.reduce((a, c) => a + glyphOf(c)[0].length, 0) + Math.max(0, chars.length - 1);
}

/** Rects of a pixel line: runs merged per row, rows overlapping a hair so no seams show. */
export function pixelRects(text: string, cell: number, ratio = 1.18): { x: number; y: number; w: number; h: number }[] {
  const out: { x: number; y: number; w: number; h: number }[] = [];
  const ch = cell * ratio;
  let x = 0;
  for (const c of [...text.toUpperCase()]) {
    const g = glyphOf(c);
    g.forEach((row, ry) => {
      let run = -1;
      for (let i = 0; i <= row.length; i++) {
        const on = row[i] === "#";
        if (on && run < 0) run = i;
        if (!on && run >= 0) {
          out.push({ x: x + run * cell, y: ry * ch, w: (i - run) * cell, h: ch + (ry < 4 ? 0.6 : 0) });
          run = -1;
        }
      }
    });
    x += (g[0].length + 1) * cell;
  }
  return out;
}

/** Pixel text with a red / cyan chromatic split, as if shot off a screen. */
function PixelText({ text, cell, x, y, color, split = 3, align = "left" }: { text: string; cell: number; x: number; y: number; color: string; split?: number; align?: "left" | "right" | "center" }) {
  const w = pixelCells(text) * cell;
  const h = 5 * cell * 1.18;
  const left = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
  const rects = pixelRects(text, cell);
  const draw = (fill: string, dx: number, dy: number, opacity: number, blend?: "multiply") => (
    <g transform={`translate(${dx} ${dy})`} fill={fill} opacity={opacity} style={blend ? { mixBlendMode: blend } : undefined}>
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
      ))}
    </g>
  );
  return (
    <svg width={w + 20} height={h + 20} style={{ position: "absolute", left: left - 10, top: y - 10, overflow: "visible" }} aria-hidden>
      <g transform="translate(10 10)">
        {draw("#00c2ff", -split, 0, 0.8, "multiply")}
        {draw("#ff2a3c", split, 0, 0.8, "multiply")}
        <g style={{ filter: `blur(${Math.max(0.6, cell * 0.05)}px)` }}>{draw(color, 0, 0, 1)}</g>
      </g>
    </svg>
  );
}

/* ---------- the spray tag ---------- */

type Pt = [number, number];

/** A flat-nib stroke along the points: each segment swept by a slanted nib, as a marker or a fat cap does. */
function nibPath(pts: Pt[], width: number, angle: number): string {
  const nx = (Math.cos(angle) * width) / 2;
  const ny = (Math.sin(angle) * width) / 2;
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    d += `M${(a[0] - nx).toFixed(1)} ${(a[1] - ny).toFixed(1)}L${(b[0] - nx).toFixed(1)} ${(b[1] - ny).toFixed(1)}L${(b[0] + nx).toFixed(1)} ${(b[1] + ny).toFixed(1)}L${(a[0] + nx).toFixed(1)} ${(a[1] + ny).toFixed(1)}Z`;
  }
  return d;
}

/** Letter skeletons of the tag in a unit box (x right, y down); several strokes per letter. */
const TAG_LETTERS: Pt[][][] = [
  [[[0, 1], [0.12, 0.02], [0.86, 0.98], [1, 0]]], // N
  [[[0, 0.95], [0.1, 0], [0.5, 0.72], [0.9, 0], [1, 0.95]]], // M
  [[[0.05, 0.1], [1, 0.02], [0, 0.98], [0.95, 0.9]]], // Z
  [[[0, 1], [0.5, 0], [1, 1]], [[0.2, 0.62], [0.85, 0.55]]], // A
  [[[0.2, 0], [0, 1], [0.85, 0.92]]], // L
  [[[0.95, 0.05], [0.1, 0.1], [0.3, 0.5], [0.9, 0.55], [0.6, 1], [0, 0.95]]], // S
  [[[0, 0], [0.12, 1], [0.55, 0.45], [0.95, 1], [1, 0]]], // W
];

/** A few wild tag letters across the canvas plus loose flicks, all from the seed. */
function tagStrokes(seed: number, y0: number, y1: number): { d: string; drips: { x: number; y: number; len: number }[] } {
  const r = rng(seed * 7 + 3);
  const angle = -0.28 - r() * 0.2;
  let d = "";
  const drips: { x: number; y: number; len: number }[] = [];
  let x = -60 - r() * 60;
  const order = [0, 1, 0, 2, 6, 3, 5, 4].sort(() => r() - 0.5);
  let n = 0;
  while (x < CANVAS_W - 60) {
    const L = TAG_LETTERS[order[n % order.length]];
    const w = 250 + r() * 120;
    const top = y0 + r() * 110 - (n % 2) * 40;
    const h = y1 - top - r() * 60;
    const skew = 0.22 + r() * 0.12;
    const nib = 74 + r() * 24;
    for (const stroke of L) {
      const pts = stroke.map(([u, v]) => [x + u * w + (1 - v) * h * skew, top + v * h] as Pt);
      d += nibPath(pts, nib, angle);
      const low = pts.reduce((a, p) => (p[1] > a[1] ? p : a), pts[0]);
      if (r() < 0.35) drips.push({ x: low[0] + (r() - 0.5) * 30, y: low[1] + 8, len: 40 + r() * 120 });
    }
    x += w * (0.9 + r() * 0.3);
    n++;
  }
  // Loose flicks high on the side.
  const sx = CANVAS_W - 170 - r() * 120;
  for (let i = 0; i < 2 + Math.floor(r() * 2); i++) {
    const bx = sx + i * 62;
    const by = y0 - 120 + i * 26 + r() * 30;
    d += nibPath([[bx, by + 170 + r() * 60], [bx + 48 + r() * 20, by]], 42 + r() * 16, angle);
  }
  return { d, drips };
}

/* ---------- the look ---------- */

const INK = "#16171b";
/** A photo cut at the legs dissolves into the floor before the info row. */
const FLOOR_FADE = "linear-gradient(to bottom, #000 1080px, rgba(0,0,0,.4) 1180px, transparent 1240px)";

/** "2026/27": the season running now (it turns over in July). */
function season(): string {
  const d = new Date();
  const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, "0")}`;
}

/** "LIGA 3 PLACARD SÉRIE A" → "L3", "PREMIER LEAGUE" → "PL": a short code for the pixel line. */
function compCode(comp: string): string {
  const words = comp.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  if (words.join(" ").length <= 4) return words.join(" ");
  let code = "";
  for (const w of words) {
    code += /\d/.test(w) ? w : w[0];
    if (/\d/.test(w) || code.length >= 3) break;
  }
  return code.slice(0, 4);
}

/** "SAT 10 OCT" → "10/10"; with no year the month number comes from the name. */
function slashDate(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  if (!m) return (d ?? "").toUpperCase();
  const i = months.indexOf(m[2]);
  return i < 0 ? `${m[1]} ${m[2]}` : `${m[1].padStart(2, "0")}/${String(i + 1).padStart(2, "0")}`;
}

const LONG_MONTHS: Record<string, string> = { JAN: "JANUARY", FEB: "FEBRUARY", MAR: "MARCH", APR: "APRIL", MAY: "MAY", JUN: "JUNE", JUL: "JULY", AUG: "AUGUST", SEP: "SEPTEMBER", OCT: "OCTOBER", NOV: "NOVEMBER", DEC: "DECEMBER" };
function longDay(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${LONG_MONTHS[m[2]] ?? m[2]}` : (d ?? "").toUpperCase();
}

/** Corner brackets around a crest. */
function Brackets({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const k = s * 0.13;
  const c = [
    `M${x} ${y + k}V${y}H${x + k}`,
    `M${x + s - k} ${y}H${x + s}V${y + k}`,
    `M${x + s} ${y + s - k}V${y + s}H${x + s - k}`,
    `M${x + k} ${y + s}H${x}V${y + s - k}`,
  ];
  return (
    <>
      {c.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={2.2} />
      ))}
    </>
  );
}

/**
 * Street "MATCH" poster (Fulham): pale grey paper with soft geometric planes, the kicker in a blocky
 * pixel face with a red / cyan screen split, the competition code and season beneath it, a huge
 * spray-paint tag in the club colour behind the player in full action, framed crests and a tiny
 * spaced info row along the foot.
 */
export function Graffiti({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 19;
  const r = rng(seed);
  const right = params.side !== "left";
  let paint = clubColour(data);
  if (luminance(paint) > 0.45) paint = shade(paint, -0.28);
  const paintDark = shade(paint, -0.45);
  const grey = "#dfe0e3";

  // ---- The kicker in pixels: one line if it stays big, else two. ----
  const k = content.kicker.toUpperCase().replace(/’/g, "'").trim();
  const words = k.split(/\s+/);
  const maxW = 820;
  const one = Math.min(26, maxW / pixelCells(k));
  let lines = [k];
  let cell = one;
  if (one < 17 && words.length > 1) {
    let best = { lines: [k], cell: one };
    for (let i = 1; i < words.length; i++) {
      const ls = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
      const c = Math.min(21, maxW / Math.max(...ls.map(pixelCells)));
      if (c > best.cell) best = { lines: ls, cell: c };
    }
    lines = best.lines;
    cell = best.cell;
  }
  cell = Math.floor(cell);
  const lineH = 5 * cell * 1.18;
  const kW = Math.max(...lines.map(pixelCells)) * cell;
  const kx = (CANVAS_W - kW) / 2;
  const ky = 92;
  const kBottom = ky + lines.length * lineH + (lines.length - 1) * cell * 1.6;

  const comp = competitionOf(data);
  const code = compCode(comp);
  const seasonTxt = season();
  const small = 6;
  const subY = kBottom + 26;

  // Tiny info lines under the code.
  const round = roundOf(data).split(" · ").slice(1).join(" · ");
  const venue = (content.venue ?? "").toUpperCase();
  const tiny: { t: string; strong?: boolean; gap?: boolean }[] = [];
  if (postType === "matchday") {
    tiny.push({ t: [slashDate(content.date), content.time].filter(Boolean).join(" - "), strong: true }, { t: round || comp }, { t: venue, strong: true, gap: true }, { t: comp && round ? comp : "" });
  } else {
    tiny.push({ t: postType === "result" ? "FULL TIME" : scoreOf(data, "-") ? `SCORE ${scoreOf(data, "-")}` : content.kicker.toUpperCase(), strong: true }, { t: round || comp }, { t: [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase(), strong: true, gap: true }, { t: data.player.number ? `NO. ${data.player.number}` : "" });
  }
  const tinyRows = tiny.filter((t) => t.t);

  // ---- The player, in full action, in front of the tag. ----
  const cx = right ? 620 + r() * 40 : 460 - r() * 40;
  const floor = 1150;
  const box = standing(data, { cx, headTop: Math.max(330, subY + 70) + 10, floor, maxFace: 190, framing: params.framing ?? "full" });
  // A photo cut at the legs sinks into the floor fade: lift it so the cut is hidden and the head rides higher.
  const headTop = Math.max(330, subY + 70);
  const lift = box.feet ? 0 : Math.min(100, Math.max(0, box.faceTop - box.faceH * 0.75 - headTop));
  box.top -= lift;
  box.faceTop -= lift;

  // ---- Tag ----
  const tag = tagStrokes(seed, 470, 900);

  // ---- Crests, framed, in the free bottom corner. ----
  const crests = postType === "matchday" || postType === "result" || postType === "goal" ? crestsOf(data) : data.club?.crestUrl ? [data.club.crestUrl] : [];
  const score = scoreOf(data, "-");
  const cs = 128;
  const cGap = score && postType !== "matchday" ? 150 : 84;
  const cY = 990;
  const cX0 = right ? 70 : CANVAS_W - 70 - (crests.length * cs + (crests.length - 1) * cGap);

  // ---- Bottom row ----
  const ours = (data.club?.name ?? "").toUpperCase();
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const teams: ReactNode =
    home && away ? (
      <>
        <span style={{ color: home === ours ? paint : INK }}>{home}</span>
        <span style={{ color: "#8a8c92" }}> VS </span>
        <span style={{ color: away === ours || home !== ours ? paint : INK }}>{away}</span>
      </>
    ) : (
      <span style={{ color: paint }}>{ours}</span>
    );
  const dateCell = postType === "matchday" ? [longDay(content.date), content.time].filter(Boolean).join(" - ") : postType === "result" ? `FULL TIME ${score}` : `${content.kicker.toUpperCase()} ${score}`;
  const cells: ReactNode[] = [dateCell, [code || comp, seasonTxt].filter(Boolean).join(" "), teams, round || comp];
  const rowLen = dateCell.length + (code || comp).length + 8 + home.length + away.length + 4 + (round || comp).length;
  const rowSize = Math.min(15, 900 / Math.max(1, rowLen * 0.78 + 36));

  const bg = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='${seed % 50}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0 0.32  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;

  // Soft geometric planes of light across the paper.
  const planes = Array.from({ length: 5 }, (_, i) => {
    const x = -200 + r() * 1300;
    const y = -100 + r() * 1300;
    const s = 380 + r() * 520;
    const a = r() * Math.PI;
    const pts = [0, 1, 2].map((j) => [x + Math.cos(a + (j * 2 * Math.PI) / 3 + r() * 0.5) * s, y + Math.sin(a + (j * 2 * Math.PI) / 3 + r() * 0.5) * s]);
    return { d: `M${pts.map((p) => p.map((v) => v.toFixed(0)).join(" ")).join("L")}Z`, light: i % 2 === 0 };
  });

  const fid = `gr-${seed}`;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: grey }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, #eeeff1 0%, ${grey} 55%, #cfd0d4 82%, #c3c4c8 100%)` }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden data-bleed>
        <defs>
          <filter id={`${fid}-soft`}>
            <feGaussianBlur stdDeviation={3} />
          </filter>
          <filter id={`${fid}-rough`} filterUnits="userSpaceOnUse" x={-100} y={0} width={CANVAS_W + 200} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed % 90} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={18} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves={2} seed={(seed % 90) + 2} result="n2" />
            <feDisplacementMap in="d" in2="n2" scale={5} xChannelSelector="R" yChannelSelector="G" result="d2" />
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.035" numOctaves={3} seed={(seed % 90) + 4} result="st" />
            <feColorMatrix in="st" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 0.42" result="stA" />
            <feComposite in="stA" in2="d2" operator="in" result="streaks" />
            <feMerge>
              <feMergeNode in="d2" />
              <feMergeNode in="streaks" />
            </feMerge>
          </filter>
          <filter id={`${fid}-spray`} filterUnits="userSpaceOnUse" x={-100} y={0} width={CANVAS_W + 200} height={CANVAS_H}>
            <feGaussianBlur stdDeviation={14} result="b" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={(seed % 90) + 9} result="n" />
            <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.2" result="dots" />
            <feComposite in="b" in2="dots" operator="in" />
          </filter>
          <linearGradient id={`${fid}-paint`} x1="0" y1="440" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={shade(paint, 0.16)} />
            <stop offset="0.45" stopColor={paint} />
            <stop offset="1" stopColor={paintDark} />
          </linearGradient>
        </defs>
        {planes.map((p, i) => (
          <path key={i} d={p.d} fill={p.light ? "#ffffff" : "#b9bbc1"} opacity={p.light ? 0.32 : 0.1} filter={`url(#${fid}-soft)`} />
        ))}
        {/* Floor line the player stands on. */}
        <rect x={0} y={floor - 30} width={CANVAS_W} height={CANVAS_H - floor + 30} fill="#b9bac0" opacity={0.28} filter={`url(#${fid}-soft)`} />
        {/* The tag: overspray, a pale rim where the can caught the light, then the paint. */}
        <path d={tag.d} fill={paint} opacity={0.35} filter={`url(#${fid}-spray)`} />
        <g filter={`url(#${fid}-rough)`}>
          <path d={tag.d} fill="#ffe7a6" transform="translate(-4 -3)" opacity={0.75} />
          <path d={tag.d} fill={`url(#${fid}-paint)`} />
          {tag.drips.map((q, i) => (
            <path key={i} d={`M${q.x - 6} ${q.y}L${q.x + 6} ${q.y}L${q.x + 3.5} ${q.y + q.len}Q${q.x} ${q.y + q.len + 9} ${q.x - 3.5} ${q.y + q.len}Z`} fill={paintDark} />
          ))}
        </g>
      </svg>

      {/* Kicker, code and season. */}
      {lines.map((l, i) => (
        <PixelText key={i} text={l} cell={cell} x={kx} y={ky + i * (lineH + cell * 1.6)} color={INK} split={Math.max(2, cell * 0.14)} />
      ))}
      {code && <PixelText text={code} cell={small} x={kx} y={subY} color={INK} split={1.5} />}
      <PixelText text={seasonTxt} cell={small} x={kx + kW} y={subY} color={INK} split={1.5} align="right" />

      {/* The player and his shadow on the floor. */}
      {data.photoUrl && box.feet && (
        <div style={{ position: "absolute", left: box.faceCx - box.width * 0.42, top: box.top + box.height - 26, width: box.width * 0.84, height: 44, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,42,48,.5), rgba(40,42,48,0))", filter: "blur(6px)" }} />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, ...(box.feet ? {} : { WebkitMaskImage: FLOOR_FADE, maskImage: FLOOR_FADE }) }}>
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 24px rgba(30,32,38,.28))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05)", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}

      {/* Tiny info lines, above the player so a raised arm never hides them. */}
      <div style={{ position: "absolute", left: kx, top: subY + 58, fontFamily: MONO, fontSize: 13, lineHeight: 1.45, letterSpacing: "0.06em", whiteSpace: "nowrap", textShadow: "0 0 5px rgba(236,237,240,.95), 0 0 12px rgba(236,237,240,.8)" }}>
        {tinyRows.map((t, i) => (
          <div key={i} style={{ color: t.strong ? "#2a2c31" : "#9a9ca2", fontWeight: t.strong ? 700 : 500, marginTop: t.gap ? 14 : 0 }}>
            {t.t}
          </div>
        ))}
      </div>
      {/* Framed crests, the score between them after the game. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
        {crests.map((_, i) => (
          <Brackets key={i} x={cX0 + i * (cs + cGap)} y={cY} s={cs} color={paint} />
        ))}
        {crests.length === 2 && (!score || postType === "matchday") && (
          <path d={`M${cX0 + cs + cGap / 2 - 7} ${cY + cs / 2}h14M${cX0 + cs + cGap / 2} ${cY + cs / 2 - 7}v14`} stroke="#9a9ca2" strokeWidth={1.6} />
        )}
      </svg>
      {crests.map((c, i) => (
        <img key={i} src={c} alt="" style={{ position: "absolute", left: cX0 + i * (cs + cGap) + cs * 0.14, top: cY + cs * 0.14, width: cs * 0.72, height: cs * 0.72, objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(30,32,38,.25))" }} />
      ))}
      {crests.length === 2 && score && postType !== "matchday" && <PixelText text={score} cell={9} x={cX0 + cs + cGap / 2} y={cY + cs / 2 - 26} color={INK} split={2} align="center" />}

      {/* Bottom info row. */}
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 44, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: ARCHIVO, fontWeight: 600, fontSize: rowSize, letterSpacing: "0.14em", color: "#6f7177", whiteSpace: "nowrap" }}>
        {cells.map((c, i) => (
          <div key={i} style={i === 2 ? { fontFamily: ARCHIVO_BLACK, fontWeight: 400, color: INK } : undefined}>
            {c}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={20} onLight style={{ position: "absolute", top: 40, ...(right ? { right: 56 } : { left: 56 }), color: INK, opacity: 0.8 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: bg, opacity: 0.16, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
