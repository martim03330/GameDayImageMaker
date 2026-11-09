/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { opponentOf, rng } from "./kit";
import { competitionOf, crestsOf, placeByFace, roundOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- helpers shared by the wall / graffiti / damask / diagonal looks ---------- */

export const INTER = "var(--font-inter), system-ui, sans-serif";

/** Inter at weight 900: advance widths per 100px, measured in the browser. */
const INTER900: Record<string, number> = { "0": 71.1, "1": 45.2, "2": 64.6, "3": 66.9, "4": 70.2, "5": 64.6, "6": 67.5, "7": 61.2, "8": 67.9, "9": 67.5, A: 80.8, B: 66.8, C: 74.8, D: 72.3, E: 61.3, F: 58.4, G: 75.4, H: 75, I: 29.1, J: 59.6, K: 75.9, L: 56.5, M: 95.6, N: 77, O: 77.5, P: 65.6, Q: 78.7, R: 66.8, S: 66.6, T: 68.7, U: 72.2, V: 80.8, W: 110, X: 78.6, Y: 77.5, Z: 69.4, " ": 19.9, "-": 47.5, "'": 37.2, ".": 37.3, ":": 37.3, "!": 38.1, "/": 41.2, "&": 69.5, "–": 50 };

/** Width in em of a line of Inter Black with the given tracking (em). */
export function interEm(text: string, tracking = 0): number {
  const chars = [...text.normalize("NFD").replace(/\p{M}/gu, "")];
  return chars.reduce((a, c) => a + (INTER900[c] ?? 72), 0) / 100 + tracking * Math.max(0, chars.length - 1);
}

/** Mixes two hex colours (t = share of b). */
export function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").padEnd(6, "0").slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** The club colour that carries the look (dark "no colour" clubs fall back to the accent). */
export function clubColour(data: RenderData): string {
  const p = data.params;
  let c = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  if (luminance(c) > 0.75) c = vivid(p.accent);
  return c;
}

const ACRONYMS = new Set(["UEFA", "FIFA", "FC", "SC", "CD", "CF", "AC", "SAD", "USC", "OAF", "AFC", "FK", "SK", "UD", "CA", "AD", "GD", "SL", "SD", "USA", "UK", "II", "III", "PL", "MLS", "NWSL", "EFL", "FA", "KO", "MVP", "U19", "U21", "U23"]);
const LOWER = new Set(["de", "da", "do", "dos", "das", "e", "of", "the", "and", "v", "vs"]);

/** "LIGA 3 PLACARD SÉRIE A" → "Liga 3 Placard Série A"; text typed in mixed case is left alone. */
export function titleCase(s: string): string {
  if (!s || s !== s.toUpperCase()) return s;
  return s
    .split(/(\s+|-)/)
    .map((w, i) => {
      if (!/\p{L}/u.test(w)) return w;
      if (/^\d+(ST|ND|RD|TH)$/.test(w)) return w.toLowerCase();
      // Acronyms, numbers and initials written with a slash ("AAC/OAF") stay as typed.
      if (ACRONYMS.has(w) || /\d/.test(w) || w.includes("/")) return w;
      const l = w.toLowerCase();
      if (i > 0 && LOWER.has(l)) return l;
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join("");
}

const MONTHS: Record<string, string> = { JAN: "January", FEB: "February", MAR: "March", APR: "April", MAY: "May", JUN: "June", JUL: "July", AUG: "August", SEP: "September", OCT: "October", NOV: "November", DEC: "December" };

/** "10 OCT" (or an old "SAT 10 OCT") → "10 October": never the day of the week. */
export function niceDate(d?: string): string {
  if (!d) return "";
  const m = d.toUpperCase().match(/^(?:[A-Z]{3}\s+)?(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${MONTHS[m[2]] ?? titleCase(m[2])}` : titleCase(d);
}

/** "15:00" → "3pm", "19:45" → "7.45pm". */
export function twelveHour(t?: string): string {
  const m = (t ?? "").match(/^(\d{1,2})[:hH.](\d{2})/);
  if (!m) return t ?? "";
  const h = Number(m[1]);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m[2] === "00" ? "" : "." + m[2]}${h >= 12 ? "pm" : "am"}`;
}

/** Crest drawn as a white monochrome mark: its shape solid white, dark ink details knocked back. */
export function MonoDefs({ id, ink = 0.6 }: { id: string; ink?: number }) {
  // alpha = 1 - ink · darkness, then cut to the crest's own shape.
  const k = (w: number) => (w * ink * 2).toFixed(3);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${k(0.3)} ${k(0.6)} ${k(0.1)} 0 ${(1 - ink * 1.3).toFixed(3)}`} result="ink" />
        <feComposite in="ink" in2="SourceAlpha" operator="in" />
      </filter>
    </svg>
  );
}

/** Kicker split into 1–3 lines so the block is as big as possible inside `width` × `height`. */
export function bestLines(kicker: string, width: number, height: number, opts: { tracking: number; pitch: number; cap: number; lastExtra?: number; maxSize: number; measure?: (t: string) => number }): { lines: string[]; size: number } {
  const measure = opts.measure ?? ((t: string) => interEm(t, opts.tracking));
  let k = kicker.toUpperCase().replace(/’/g, "'").trim();
  // "MATCHDAY" reads as "MATCH / DAY" when stacked.
  k = k.replace(/\b(MATCH|GAME)DAY\b/, "$1 DAY").replace(/\bFULLTIME\b/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  const extra = opts.lastExtra ?? 0;
  let best = { lines: [k], size: 0 };
  const tryLines = (lines: string[]) => {
    const w = Math.max(...lines.map((l, i) => measure(l) + (i === lines.length - 1 ? extra : 0)));
    const h = opts.cap + (lines.length - 1) * opts.pitch;
    const size = Math.min(opts.maxSize, width / w, height / h);
    // A small bonus for fewer lines: two strong lines read better than three thin ones.
    if (size * (1 + (3 - lines.length) * 0.04) > best.size * (1 + (3 - best.lines.length) * 0.04)) best = { lines, size };
  };
  tryLines([words.join(" ")]);
  for (let i = 1; i < words.length; i++) tryLines([words.slice(0, i).join(" "), words.slice(i).join(" ")]);
  for (let i = 1; i < words.length; i++) for (let j = i + 1; j < words.length; j++) tryLines([words.slice(0, i).join(" "), words.slice(i, j).join(" "), words.slice(j).join(" ")]);
  return best;
}

/* ---------- the look ---------- */

const WHITE = "#ffffff";

/**
 * Studio "MATCH DAY" (Swansea pre-season): the player big and close against a warm, textured stone wall
 * with faint layout guide lines; a huge heavy white grotesk kicker stacked on two lines, the two crests
 * as white marks beside the last word, and a quiet sentence-case info block bottom corner.
 */
export function Wall({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 18;
  const r = rng(seed);
  const right = params.side !== "left";
  const club = clubColour(data);
  const stones = ["#b8a48e", "#bfb09d", "#b39a80", "#a9a297"];
  const stone = mix(stones[Math.floor(r() * stones.length)], club, 0.05);
  const deep = mix(stone, "#2a1a0c", 0.55);

  // ---- The player: big, face in the upper part, off-centre. ----
  const faceX = right ? 700 + r() * 60 : 380 - r() * 60;
  const sizes = { chest: 300, waist: 245, knees: 190, full: 150 };
  let faceTop = 150 + r() * 36;
  let box = placeByFace(data, faceX, faceTop, sizes);
  // Hair stays inside the canvas.
  if (faceTop - box.faceH * 0.72 < 44) {
    faceTop = 44 + box.faceH * 0.72;
    box = placeByFace(data, faceX, faceTop, sizes);
  }
  const faceBottom = box.top + (data.face ? (data.face[1] + data.face[3]) * box.height : faceTop - box.top + box.faceH);

  // ---- What the title and the marks say. ----
  const score = scoreOf(data, "–");
  let marks: string[] = [];
  const kicker = content.kicker;
  if (postType === "matchday" || postType === "result") marks = crestsOf(data);
  else if (data.club?.crestUrl) marks = [data.club.crestUrl];
  const showScore = postType === "result" && !!score && marks.length === 2;

  const tracking = -0.045;
  const CAP = 0.727;
  const PITCH = 0.9;
  const X0 = 66;
  const maxW = CANVAS_W - 2 * X0;
  // Marks sit beside the last line, a cap-height tall.
  const markW = marks.length ? marks.length * CAP + (marks.length - 1) * CAP * 0.2 + CAP * 0.34 + (showScore ? interEm(score, -0.03) * 0.62 + CAP * 0.2 : 0) : 0;
  const baseLast = 880 + r() * 30;
  const room = Math.max(250, baseLast - Math.max(430, faceBottom + 70));
  const fit = bestLines(kicker, maxW, room, { tracking, pitch: PITCH, cap: CAP, lastExtra: markW, maxSize: kicker.trim().includes(" ") || /DAY$/i.test(kicker.trim()) ? 232 : 262 });
  const size = fit.size;
  const lines = fit.lines;
  const cap = size * CAP;
  const blockTop = baseLast - cap - (lines.length - 1) * size * PITCH;
  const crestH = cap * 1.0;
  const lineWidths = lines.map((l, i) => interEm(l, tracking) * size + (i === lines.length - 1 ? markW * size : 0));
  const blockW = Math.max(...lineWidths);

  // ---- The info block, sentence case. ----
  const opp = opponentOf(data);
  const comp = titleCase(competitionOf(data));
  const round = titleCase(roundOf(data).split(" · ").slice(1).join(" · "));
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  let info: { t: string; bold?: boolean; gap?: boolean }[] = [];
  if (postType === "matchday") {
    const when = [niceDate(content.date), content.time ? `${twelveHour(content.time)} KO` : ""].filter(Boolean).join(", ");
    info = [{ t: comp || round, bold: true }, { t: opp ? `v ${titleCase(opp)}` : "" }, { t: when, gap: true }, { t: titleCase(content.venue ?? "") }];
  } else if (postType === "result") {
    const line = content.homeTeam && content.awayTeam ? `${titleCase(content.homeTeam)} ${score || "v"} ${titleCase(content.awayTeam)}` : "";
    info = [{ t: comp || "Full time", bold: true }, { t: line }, { t: name, gap: true }, { t: round }];
  } else if (postType === "goal") {
    const line = content.homeTeam && content.awayTeam && score ? `${titleCase(content.homeTeam)} ${score} ${titleCase(content.awayTeam)}` : opp ? `v ${titleCase(opp)}` : "";
    info = [{ t: name, bold: true }, { t: line }, { t: comp, gap: true }, { t: round }];
  } else {
    const s = content.stats.filter((x) => x.value && x.value !== "0").slice(0, 3).map((x) => `${x.value} ${x.label.toLowerCase()}`).join(" · ");
    info = [{ t: titleCase(content.subline) || name, bold: true }, { t: content.subline ? name : "" }, { t: s, gap: true }, { t: data.club?.name ? titleCase(data.club.name) : "" }];
  }
  info = info.filter((i) => i.t);
  const infoLong = Math.max(1, ...info.map((i) => i.t.length));
  const infoSize = Math.min(29, 560 / (infoLong * 0.55));

  const shadow = "0 6px 34px rgba(58,36,16,.3), 0 2px 8px rgba(40,24,10,.22)";
  const align: CSSProperties = right ? { left: X0 } : { right: X0, textAlign: "right" };
  const markRow = (
    <div style={{ display: "flex", alignItems: "center", gap: cap * 0.2, marginRight: right ? cap * 0.34 : 0, marginLeft: right ? 0 : cap * 0.34 }}>
      {marks.map((m, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: cap * 0.2 }}>
          {i === 1 && showScore && (
            <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: size * 0.62, letterSpacing: "-0.03em", lineHeight: 1, color: WHITE, textShadow: shadow }}>{score}</span>
          )}
          <img src={m} alt="" style={{ width: crestH, height: crestH, objectFit: "contain", filter: "url(#wall-mono) drop-shadow(0 4px 16px rgba(58,36,16,.3))" }} />
        </div>
      ))}
    </div>
  );

  // Faint guide lines: the title's top and baseline, the text margin and the edge of the marks.
  const gx1 = right ? X0 - 2 : CANVAS_W - X0 + 2;
  const markEdge = right ? X0 + markW * size - cap * 0.17 : CANVAS_W - X0 - markW * size + cap * 0.17;
  const gridTop = blockTop - 18;
  const gridBot = baseLast + 16;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: stone }}>
      <MonoDefs id="wall-mono" />
      {/* The wall: warm light across the stone, plaster relief and mottled patches. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 62 : 38}% 34%, ${mix(stone, "#fff4e4", 0.34)}, ${stone} 58%, ${mix(stone, "#3a2614", 0.22)} 100%)` }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <filter id={`wall-relief-${seed}`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.0055" numOctaves={6} seed={seed % 97} result="n" />
            <feDiffuseLighting in="n" surfaceScale={7} diffuseConstant={1.15} lightingColor="#fff6ea" result="lit">
              <feDistantLight azimuth={right ? 230 : 310} elevation={52} />
            </feDiffuseLighting>
          </filter>
          <filter id={`wall-grain-${seed}`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.028 0.022" numOctaves={4} seed={(seed % 71) + 11} result="n" />
            <feDiffuseLighting in="n" surfaceScale={2.2} diffuseConstant={1.2} lightingColor="#fff6ea">
              <feDistantLight azimuth={right ? 230 : 310} elevation={58} />
            </feDiffuseLighting>
          </filter>
          <filter id={`wall-mottle-${seed}`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.003" numOctaves={4} seed={(seed % 89) + 3} result="n" />
            <feColorMatrix in="n" values={`0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0 0.07  2.4 0 0 0 -1.05`} />
          </filter>
          <filter id={`wall-speck-${seed}`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={(seed % 83) + 7} result="n" />
            <feColorMatrix in="n" values="0 0 0 0 0.2  0 0 0 0 0.13  0 0 0 0 0.06  -9 0 0 0 4.1" />
          </filter>
          <linearGradient id="wall-gh" x1="0" x2="1">
            <stop offset="0" stopColor={WHITE} stopOpacity={0} />
            <stop offset="0.12" stopColor={WHITE} stopOpacity={1} />
            <stop offset="0.88" stopColor={WHITE} stopOpacity={1} />
            <stop offset="1" stopColor={WHITE} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="wall-gv" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={WHITE} stopOpacity={0} />
            <stop offset="0.15" stopColor={WHITE} stopOpacity={1} />
            <stop offset="0.85" stopColor={WHITE} stopOpacity={1} />
            <stop offset="1" stopColor={WHITE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#wall-relief-${seed})`} style={{ mixBlendMode: "soft-light" }} opacity={0.95} />
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#wall-grain-${seed})`} style={{ mixBlendMode: "soft-light" }} opacity={0.7} />
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#wall-mottle-${seed})`} opacity={0.55} style={{ mixBlendMode: "multiply" }} />
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#wall-speck-${seed})`} opacity={0.1} />
        <g opacity={0.42} strokeWidth={1.5}>
          <line x1={0} x2={CANVAS_W} y1={gridTop} y2={gridTop} stroke="url(#wall-gh)" />
          <line x1={0} x2={CANVAS_W} y1={gridBot} y2={gridBot} stroke="url(#wall-gh)" />
          <line x1={gx1} x2={gx1 + 0.01} y1={0} y2={CANVAS_H} stroke="url(#wall-gv)" />
          {marks.length > 0 && <line x1={markEdge} x2={markEdge + 0.01} y1={0} y2={CANVAS_H} stroke="url(#wall-gv)" />}
        </g>
      </svg>

      {/* The player, with the soft shadow a studio light throws on the wall behind him. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(${right ? -26 : 26}px 26px 38px rgba(52,32,14,.38))` }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }}
          />
        </div>
      )}
      {/* Warm studio grade over everything but the text. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at ${right ? 65 : 35}% 30%, transparent 55%, ${deep}55 100%)` }} />

      {/* The title: huge heavy grotesk, marks beside the last word. */}
      <div style={{ position: "absolute", top: blockTop - size * 0.087, ...align, width: blockW + 20, color: WHITE, fontFamily: INTER, fontWeight: 900, fontSize: size, letterSpacing: `${tracking}em`, lineHeight: PITCH, textShadow: shadow }}>
        {lines.map((l, i) => {
          const last = i === lines.length - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: right ? "flex-start" : "flex-end", whiteSpace: "nowrap", height: size * PITCH }}>
              {last && marks.length > 0 && right && markRow}
              <span style={{ display: "block" }}>{l}</span>
              {last && marks.length > 0 && !right && markRow}
            </div>
          );
        })}
      </div>

      {/* Info, sentence case. */}
      <div style={{ position: "absolute", bottom: 86, ...align, color: WHITE, fontFamily: INTER, fontSize: infoSize, lineHeight: 1.28, letterSpacing: "-0.005em", textShadow: "0 2px 14px rgba(52,32,14,.45)", whiteSpace: "nowrap" }}>
        {info.map((i, k) => (
          <div key={k} style={{ fontWeight: i.bold ? 700 : 500, marginTop: i.gap ? infoSize * 0.7 : 0 }}>
            {i.t}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", top: 60, ...(right ? { left: X0 } : { right: X0 }), color: WHITE, opacity: 0.95, filter: "drop-shadow(0 1px 3px rgba(40,24,10,.45)) drop-shadow(0 2px 10px rgba(40,24,10,.3))" }} />
    </div>
  );
}
