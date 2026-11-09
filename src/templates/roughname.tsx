/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { PRINT_GRAIN } from "./column";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, BEBAS, DISPLAY } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- helpers shared by roughname, infobox and condensed ---------- */

/** Bebas Neue advance widths (per 100px). */
const BEBAS_ADV: Record<string, number> = { A: 40.1, B: 40.4, C: 38.3, D: 40.6, E: 36.3, F: 34.4, G: 39.1, H: 42, I: 19.2, J: 26.5, K: 41.4, L: 34.4, M: 53.8, N: 42.7, O: 40, P: 38.6, Q: 40, R: 40.3, S: 37.2, T: 36.4, U: 40.2, V: 38.2, W: 55.7, X: 40.6, Y: 39.4, Z: 36.2, " ": 16, "'": 18.8, "-": 27, ".": 18.8, "/": 30, ":": 18.8, "·": 18.8, "(": 22, ")": 22 };

/** Width in em of a Bebas line (accents ignored), with extra tracking in em. */
export function bebasEm(t: string, tracking = 0): number {
  const chars = [...t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
  return chars.reduce((a, c) => a + (BEBAS_ADV[c.toUpperCase()] ?? (/\d/.test(c) ? 38 : 40)), 0) / 100 + tracking * Math.max(0, chars.length - 1);
}

/** Bebas size that fits `t` inside `width`, never above `max`. */
export const fitBebas = (t: string, width: number, max: number, tracking = 0) => Math.min(max, width / Math.max(0.5, bebasEm(t, tracking)));

/** Anton width in em (accents ignored). */
export const antonEm = (t: string) => em(t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(), ANTON, 44);

const MON: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** "SAT 10 OCT" → { dd: "10", mm: "10", yy: "26" } (year from the next fixture on that day, else this year). */
export function dateParts(data: RenderData): { dd: string; mm: string; yy: string; yyyy: string; dow: string } | null {
  const m = (data.content.date ?? "").toUpperCase().match(/^([A-Z]{3})\s+(\d{1,2})\s+([A-Z]{3})/);
  if (!m || !MON[m[3]]) return null;
  const dd = m[2].padStart(2, "0");
  const mm = MON[m[3]];
  const fx = data.fixtures?.find((f) => f.date.endsWith(`-${mm}-${dd}`));
  const yyyy = fx ? fx.date.slice(0, 4) : String(new Date().getFullYear());
  return { dd, mm, yy: yyyy.slice(2), yyyy, dow: m[1] };
}

/** Both team names, ours in its right place ("" parts dropped). */
export function teamsOf(data: RenderData): [string, string] {
  const c = data.content;
  const f = matchFacts(data);
  const ours = (data.club?.name ?? "").toUpperCase();
  let home = (c.homeTeam ?? "").toUpperCase().trim();
  let away = (c.awayTeam ?? "").toUpperCase().trim();
  if (!home && !away && f.opp) [home, away] = data.fixtures?.[0]?.home === false ? [f.opp, ours] : [ours, f.opp];
  return [home, away];
}

/** Home and away crests in match order (ours standing in when a side is missing). */
export function orderedCrests(data: RenderData): string[] {
  const c = data.content;
  const f = matchFacts(data);
  if (c.homeCrest || c.awayCrest) return [c.homeCrest ?? f.ourCrest, c.awayCrest ?? (c.homeCrest ? f.ourCrest : null)].filter((x, i, a) => x && a.indexOf(x) === i) as string[];
  const away = data.fixtures?.[0]?.home === false;
  return (away ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
}

/** Club colour that holds on off-white paper (light / neon colours deepened). */
export function paperInk(data: RenderData): string {
  const p = data.params;
  let c = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  if (luminance(c) > 0.62) c = vivid(p.accent);
  const l = luminance(c);
  if (l > 0.62) return "#1f2a3c";
  return l > 0.4 ? shade(c, -0.4) : l > 0.28 ? shade(c, -0.2) : c;
}

/**
 * Full-body action placement: hair at `headTop`, feet on `floor`, but a wide pose (a kick, a slide) is
 * shrunk so its width stays inside `maxW`, keeping the feet on the floor.
 */
export function actionBox(data: RenderData, o: { cx: number; headTop: number; floor: number; maxW: number; maxFace?: number }) {
  let b = standing(data, { cx: o.cx, headTop: o.headTop, floor: o.floor, maxFace: o.maxFace, framing: "full" });
  if (b.width > o.maxW) {
    const k = o.maxW / b.width;
    const bottom = b.feet ? b.top + b.height : CANVAS_H;
    const fx = (b.faceCx - b.left) / b.width;
    const h = b.height * k;
    const top = b.feet ? bottom - h : b.top; // cut photos keep the head where asked
    const left = b.faceCx - fx * b.width * k;
    b = { ...b, top, height: h, width: b.width * k, left, faceTop: top + (b.faceTop - b.top) * k, faceH: b.faceH * k };
    if (!b.feet) {
      // A photo cut at the legs must still reach the bottom edge.
      const need = CANVAS_H - (b.top + b.height);
      if (need > 0) b = { ...b, top: b.top + need, faceTop: b.faceTop + need };
    }
  }
  return b;
}

/** The shorter, punchier half of the player's name for a giant word. */
export function bigName(first: string, last: string): string {
  const f = first.trim().toUpperCase();
  const l = last.trim().toUpperCase().split(/\s+/).pop() ?? "";
  if (!l) return f;
  if (!f) return l;
  const pick = [...l].length <= 7 ? l : [...f].length < [...l].length ? f : l;
  // A giant accented capital reads worse than a plain one: take the unaccented half when it is also short enough.
  const other = pick === l ? f : l;
  if (hasMarks(pick) && !hasMarks(other) && [...other].length <= 9) return other;
  return pick;
}

/** True when the text carries accents or a cedilla. */
const hasMarks = (t: string) => /[\u0300-\u036f]/.test(t.normalize("NFD"));

/** A caps line kept whole when it fits `maxEm`, else broken into two balanced lines. */
export function splitTwo(v: string, maxEm: number, tracking = 0): string[] {
  if (!v) return [];
  if (bebasEm(v, tracking) <= maxEm) return [v];
  const w = v.split(/\s+/);
  let best = [v];
  let diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(" ");
    const b = w.slice(i).join(" ");
    const dd = Math.abs(bebasEm(a, tracking) - bebasEm(b, tracking));
    if (dd < diff) [diff, best] = [dd, [a, b]];
  }
  return best;
}

/* ---------- the look ---------- */

const PAPER_BG = "#ecebe7";
const DARK = "#26272a";

/**
 * Rough-edged ink: the letters' outline wobbles (low-frequency displacement), frays (fine displacement)
 * and loses small flecks of ink, like a dry roller print.
 */
function RoughDefs({ id, seed, ink }: { id: string; seed: number; ink: string }) {
  return (
    <defs>
      <filter id={id} x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
        {/* Wobble the whole outline a little. */}
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="w1" />
        <feDisplacementMap in="SourceGraphic" in2="w1" scale={14} xChannelSelector="R" yChannelSelector="G" result="d1" />
        {/* Fray the edges: soften the shape, add clumpy noise, cut it back to a hard edge. */}
        <feGaussianBlur in="d1" stdDeviation="3.2" result="b" />
        <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves={4} seed={seed + 3} result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na" />
        <feComposite in="b" in2="na" operator="arithmetic" k1={0} k2={1} k3={0.6} k4={-0.3} result="m" />
        <feComponentTransfer in="m" result="edge">
          <feFuncA type="linear" slope={16} intercept={-7.4} />
        </feComponentTransfer>
        {/* A few dry flecks inside the ink. */}
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={seed + 7} result="speck" />
        <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 30.5" result="holes" />
        <feComposite in="edge" in2="holes" operator="in" result="shape" />
        <feFlood floodColor={ink} />
        <feComposite in2="shape" operator="in" />
      </filter>
    </defs>
  );
}

/**
 * Ludogorets matchday (Nonato): grainy off-white paper, the player's name set gigantic and vertical in
 * rough, distressed condensed capitals of the club colour, grey crest watermarks cropped at two corners,
 * and the full-body player in action in front. Teams across the top in dark condensed caps, both crests
 * stacked on the left, and on the right a small competition mark over the date, ground and kick-off.
 */
export function Roughname({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 59;
  const r = rng(seed);
  const ink = paperInk(data);
  const facts = matchFacts(data);
  const left = params.side === "left";

  // ---- the giant vertical word ----
  const word = bigName(content.firstName, content.lastName) || (data.club?.name ?? "").toUpperCase();
  const wordTop = 214;
  const wordBottom = 1244;
  const maxLen = wordBottom - wordTop;
  const CAP = 0.735; // Anton cap height / size
  const nat = Math.max(1, antonEm(word));
  // Squeezed to a tall condensed cut (as in the reference) but never below 60% of its drawn width.
  // Room for accents above the capitals (left, once rotated) and a cedilla below (right), inside the same band.
  const nfd = word.normalize("NFD");
  const above = /[\u0300-\u0326\u0328-\u036f]/.test(nfd) ? 0.22 : 0;
  const below = /\u0327/.test(nfd) ? 0.2 : 0;
  const band = Math.min(420 * (params.textScale ?? 1), (maxLen * CAP) / (nat * 0.6));
  const capW = (band * CAP) / (CAP + above + below);
  const size = capW / CAP;
  const shift = ((above - below) * size) / 2;
  const len = Math.min(maxLen, nat * size * 1.05);
  const wx = 540 + (r() - 0.5) * 30;
  const wy = wordTop + maxLen / 2 + (maxLen - len) * (r() - 0.5) * 0.4;

  // ---- the player: full body, in front of the word ----
  const fig = actionBox(data, { cx: 540 + (left ? -40 : 40) + (r() - 0.5) * 30, headTop: 350 + r() * 50, floor: 1235, maxW: 1000, maxFace: 150 });

  // ---- corner texts ----
  const [home, away] = teamsOf(data);
  const score = scoreOf(data);
  let topLine = home && away ? `${home} VS ${away}` : home || away || (data.club?.name ?? "").toUpperCase();
  if (postType === "potm") topLine = content.kicker.toUpperCase();
  const topSize = fitBebas(topLine, 900, 74, 0.02);
  const crests = postType === "potm" ? ([facts.ourCrest].filter(Boolean) as string[]) : orderedCrests(data);
  const d = dateParts(data);
  const dateLine = d ? `${d.dd}.${d.mm}.${d.yy}` : (content.date ?? "").toUpperCase();

  const COLW = 250;
  const INFO: CSSProperties = { fontFamily: BEBAS, color: ink, lineHeight: 1, whiteSpace: "nowrap", textAlign: left ? "left" : "right" };
  const line = (t: string, max: number, key?: string | number) => (t ? <div key={key} style={{ ...INFO, fontSize: fitBebas(t, COLW, max, 0.02), letterSpacing: "0.02em" }}>{t}</div> : null);
  const venueLines = splitTwo(facts.venue, COLW / 40);
  const infoRight = !left;

  // Small competition mark: the competition in a thin framed block.
  const comp = facts.comp;
  const compMark = comp ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: left ? "flex-start" : "flex-end", gap: 6, marginBottom: 14 }}>
      <div style={{ width: 46, height: 5, background: ink }} />
      {splitTwo(comp, COLW / 24, 0.12).map((c, i, all) => (
        <div key={i} style={{ fontFamily: BEBAS, fontSize: Math.min(...all.map((x) => fitBebas(x, COLW, 26, 0.12))), letterSpacing: "0.12em", color: DARK, whiteSpace: "nowrap", lineHeight: 1 }}>{c}</div>
      ))}
      {facts.round && postType === "matchday" && <div style={{ fontFamily: BEBAS, fontSize: fitBebas(facts.round, COLW, 22, 0.12), letterSpacing: "0.12em", color: DARK, opacity: 0.7, whiteSpace: "nowrap" }}>{facts.round}</div>}
    </div>
  ) : null;

  let info: ReactNode;
  if ((postType === "result" || postType === "goal") && score) {
    info = (
      <>
        {compMark}
        <div style={{ ...INFO, fontFamily: DISPLAY, fontSize: score.length > 4 ? 96 : 124, lineHeight: 0.9, letterSpacing: "0.01em" }}>{score}</div>
        {line(postType === "goal" ? content.kicker.toUpperCase() : "FULL TIME", 44, "k")}
        {postType === "result" && line(content.kicker.toUpperCase(), 34, "m")}
        {line(dateLine, 34, "d")}
      </>
    );
  } else if (postType === "potm") {
    const stats = shortFacts(data, 3);
    info = (
      <>
        {content.subline && line(content.subline.toUpperCase(), 32, "s")}
        <div style={{ height: 10 }} />
        {stats.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: left ? "flex-start" : "flex-end", marginTop: i ? 12 : 0 }}>
            <div style={{ ...INFO, fontFamily: DISPLAY, fontSize: 84, lineHeight: 0.92 }}>{s.value}</div>
            <div style={{ ...INFO, color: DARK, fontSize: fitBebas(s.label.toUpperCase(), COLW, 28, 0.1), letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </>
    );
  } else {
    info = (
      <>
        {compMark}
        {postType === "goal" && line(content.kicker.toUpperCase(), 64, "g")}
        {line(dateLine, 44, "d")}
        {venueLines.map((v, i) => line(v, 40, `v${i}`))}
        {content.time && line(content.time, 44, "t")}
      </>
    );
  }

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const crestSize = crests.length > 1 ? 118 : 138;
  const crestShadow = "drop-shadow(0 6px 10px rgba(0,0,0,.18))";
  const mark = data.club?.crestUrl;
  const watermark = (style: CSSProperties) =>
    mark ? <img data-bleed src={mark} alt="" style={{ position: "absolute", objectFit: "contain", maxWidth: "none", filter: "grayscale(1) brightness(1.2) contrast(.5)", opacity: 0.3, mixBlendMode: "multiply", ...style }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER_BG }}>
      {/* Paper: a soft light fall-off and a coarse print grain. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 40%, #f5f4f1 0%, transparent 70%)" }} />
      {watermark({ right: -300 - r() * 40, top: -150 - r() * 60, width: 720, height: 720, transform: `rotate(${(r() * 10 - 5).toFixed(1)}deg)` })}
      {watermark({ left: -330 - r() * 40, bottom: -250 - r() * 60, width: 700, height: 700, transform: `rotate(${(r() * 10 - 5).toFixed(1)}deg)` })}

      {/* The giant rough name, reading bottom to top. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <RoughDefs id="rough-name" seed={seed % 97} ink={ink} />
        <g filter="url(#rough-name)">
          <text
            transform={`rotate(-90 ${wx.toFixed(1)} ${wy.toFixed(1)})`}
            x={wx}
            y={wy + capW / 2 + shift}
            textAnchor="middle"
            textLength={len}
            lengthAdjust="spacingAndGlyphs"
            fill={ink}
            stroke={ink}
            strokeWidth={size * 0.018}
            strokeLinejoin="round"
            style={{ fontFamily: DISPLAY, fontSize: size }}
          >
            {word}
          </text>
        </g>
      </svg>

      {/* Soft floor shadow and the player. */}
      {fig.feet && (
        <div style={{ position: "absolute", left: fig.left + fig.width * 0.08, width: fig.width * 0.84, top: fig.top + fig.height - 26, height: 50, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.34), rgba(0,0,0,.12) 60%, transparent)", filter: "blur(6px)" }} />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, filter: "drop-shadow(0 0 1.5px rgba(245,244,240,.9)) drop-shadow(0 18px 22px rgba(0,0,0,.22))" }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", filter: "contrast(1.05) saturate(1.05)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Teams across the top. */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 92, display: "flex", justifyContent: "center" }}>
        <div style={{ fontFamily: BEBAS, fontSize: topSize, letterSpacing: "0.02em", color: DARK, lineHeight: 1, whiteSpace: "nowrap" }}>{topLine}</div>
      </div>

      {/* Crests stacked on one side. */}
      <div style={{ position: "absolute", [infoRight ? "left" : "right"]: 70, top: 690, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: crestShadow }} />
        ))}
      </div>

      {/* Competition, date, ground, kick-off on the other. */}
      <div style={{ position: "absolute", [infoRight ? "right" : "left"]: 66, top: 262, width: COLW, display: "flex", flexDirection: "column", alignItems: infoRight ? "flex-end" : "flex-start", gap: 4, textShadow: "0 0 18px rgba(236,235,231,.9)" }}>
        {info}
      </div>

      {/* Foot: the full name, the agency. */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 46, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: BEBAS, fontSize: fitBebas(name, 380, 30, 0.06), letterSpacing: "0.06em", color: DARK, lineHeight: 1, whiteSpace: "nowrap" }}>
            {data.player.number ? `#${data.player.number}  ` : ""}
            {name}
          </div>
          <div style={{ height: 3, background: DARK, width: "100%" }} />
        </div>
        <AgencyLogo data={data} height={34} onLight style={{ color: DARK }} />
      </div>

      {/* Coarse grain over everything, as in a printed poster. */}
      <div data-bleed style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.2, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
