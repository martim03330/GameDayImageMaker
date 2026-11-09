/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { ARCHIVO, ARCHIVO_BLACK, cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { competitionOf, crestsOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, mix } from "./wall";

/** Archivo Black advance widths per 100px (measured). */
const AB: Record<string, number> = { A: 77.8, B: 77.8, C: 77.8, D: 77.8, E: 72.2, F: 66.7, G: 83.3, H: 83.3, I: 38.9, J: 66.7, K: 83.3, L: 66.7, M: 94.4, N: 83.3, O: 83.3, P: 72.2, Q: 83.3, R: 77.8, S: 72.2, T: 72.2, U: 83.3, V: 77.8, W: 100, X: 77.8, Y: 77.8, Z: 72.2, " ": 33.3, "-": 33.3, "'": 27.8, ".": 33.3, ":": 33.3, "/": 27.8, "&": 88.9 };
export const abEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase()].reduce((a, c) => a + (AB[c] ?? (/\d/.test(c) ? 66.7 : 78)), 0) / 100;

type Pt = [number, number];

/** A torn-paper edge from a to b: jagged points with a few bigger bites. */
function tornEdge(a: Pt, b: Pt, seed: number, amp = 9, step = 11): Pt[] {
  const r = rng(seed);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(4, Math.round(len / step));
  const [nx, ny] = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
  let drift = 0;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    drift = drift * 0.8 + (r() - 0.5) * amp * 1.4;
    const j = (i === 0 || i === n ? 0 : drift + (r() - 0.5) * amp + (r() < 0.07 ? amp * 2.2 : 0)) + Math.sin(t * Math.PI) * amp * 3;
    pts.push([a[0] + (b[0] - a[0]) * t + nx * j, a[1] + (b[1] - a[1]) * t + ny * j]);
  }
  return pts;
}

const poly = (pts: Pt[]) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}Z`;

/** Half of the damask ornament (right of the axis x = 0), drawn once and mirrored. */
const HALF = [
  // central flame
  "M0 -128 C 22 -100 34 -64 20 -30 C 12 -12 4 -2 0 6 Z",
  // curling scroll
  "M4 10 C 48 4 92 -34 84 -80 C 80 -104 54 -112 44 -94 C 36 -80 50 -66 60 -74 C 64 -60 50 -30 4 -8 Z",
  // lower bulb
  "M0 22 C 30 30 52 62 40 98 C 30 124 10 136 0 146 Z",
  // side leaf
  "M30 40 C 74 20 124 42 128 92 C 100 84 70 76 30 40 Z",
  // little bud up top
  "M0 -150 C 10 -160 14 -172 0 -186 Z",
  // outer tendril
  "M88 -20 C 120 -30 142 -8 134 22 C 128 40 108 40 106 26 C 104 14 116 10 120 18 C 124 2 110 -10 88 -20 Z",
];

function Motif({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      {HALF.map((d, i) => (
        <path key={i} d={d} />
      ))}
      <g transform="scale(-1 1)">
        {HALF.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}

/** "SAT 10 OCT" → "10.10.26" (year of the next such date). */
function dotDate(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  if (!m || months.indexOf(m[2]) < 0) return (d ?? "").toUpperCase();
  const mo = months.indexOf(m[2]);
  const now = new Date();
  const y = mo < now.getMonth() - 2 ? now.getFullYear() + 1 : now.getFullYear();
  return `${m[1].padStart(2, "0")}.${String(mo + 1).padStart(2, "0")}.${String(y % 100).padStart(2, "0")}`;
}

/** A small white football, the stand-in for a competition's mark. */
function BallMark({ size }: { size: number }) {
  const r = size / 2;
  const pent = (cx: number, cy: number, rr: number, rot: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = rot + (i * 2 * Math.PI) / 5;
      return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={r} cy={r} r={r - 1.5} fill="#fff" />
      <polygon points={pent(r, r, r * 0.3, -Math.PI / 2)} fill="currentColor" />
      {Array.from({ length: 5 }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        return <polygon key={i} points={pent(r + Math.cos(a) * r * 0.86, r + Math.sin(a) * r * 0.86, r * 0.22, a + Math.PI)} fill="currentColor" />;
      })}
    </svg>
  );
}

const WHITE = "#ffffff";
const PAPER = "#ecebe7";

/**
 * Ornamental playoff poster (Albacete v Levante): the club colour deep and rich, a distressed damask
 * pattern over it and a giant silhouette of the crest; torn white paper at two corners; a widely spaced
 * kicker on top, the competition mark and the two teams stacked left, the full-body player in the
 * middle, and the crests with date, venue and kick-off stacked on the right.
 */
export function Damask({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 20;
  const r = rng(seed);
  const right = params.side !== "left";
  let c = clubColour(data);
  if (luminance(c) > 0.4) c = shade(c, -0.3);
  // Black / grey clubs: graphite, so the ornament and the crest still show.
  if (luminance(c) < 0.03) c = "#4b4e57";
  const mid = shade(c, -0.18);
  const deep = shade(c, -0.62);
  const ink = shade(c, -0.78);
  const fid = `dm-${seed}`;

  // ---- The player, full body, centre. ----
  const cx = 540 + (right ? 1 : -1) * (40 + r() * 20);
  const floor = 1165;
  const box = standing(data, { cx, headTop: 318, floor, maxFace: 190, framing: params.framing ?? "full" });

  // ---- Text ----
  const kicker = content.kicker.toUpperCase();
  const kSize = Math.min(46, 860 / Math.max(1, kicker.length * 1.12));
  const comp = competitionOf(data);
  const round = roundOf(data).split(" · ").slice(1).join(" · ");
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).map((s) => s.toUpperCase());
  const stack = postType === "goal" || !home || !away ? name : [home, away];
  const stackW = 330;
  const stackSize = Math.min(58, ...stack.map((s) => stackW / Math.max(1, abEm(s))));
  const crests = postType === "goal" && !home ? (data.club?.crestUrl ? [data.club.crestUrl] : []) : crestsOf(data);
  const score = scoreOf(data, "-");
  const facts: string[] =
    postType === "matchday"
      ? [dotDate(content.date), (content.venue ?? "").toUpperCase(), content.time ?? ""]
      : [postType === "result" ? "FULL TIME" : "", score, round || comp];
  // Long lines (the venue) break into two balanced lines.
  const shown = facts.filter(Boolean).flatMap((f) => {
    if (abEm(f) * 25 <= 240) return [f];
    const w = f.split(" ");
    let best = [f];
    let bestW = Infinity;
    for (let i = 1; i < w.length; i++) {
      const pair = [w.slice(0, i).join(" "), w.slice(i).join(" ")];
      const m = Math.max(...pair.map(abEm));
      if (m < bestW) [best, bestW] = [pair, m];
    }
    return best;
  });
  const factSize = Math.max(17, Math.min(27, 240 / Math.max(1, ...shown.map(abEm))));

  // Left block and right column never sit on the face.
  const faceBottom = box.faceTop + box.faceH;
  const leftTop = Math.max(236, Math.min(340, box.faceTop - 40));
  // The column keeps clear of the torn corner below it.
  const colH = crests.length * 122 + 10 + shown.length * factSize * 1.05 + (postType !== "matchday" && score ? factSize : 0);
  const colTop = Math.min(Math.max(faceBottom + 60, 600), 1000 - colH);

  // Torn corners.
  const tl = tornEdge([0, 330 + r() * 70], [300 + r() * 80, 0], seed + 1);
  const br = tornEdge([CANVAS_W, 1010 + r() * 60], [790 + r() * 60, CANVAS_H], seed + 2);
  const tlPoly = poly([[0, 0], ...tl]);
  const brPoly = poly([[CANVAS_W, CANVAS_H], ...br]);
  const tlRim = poly([[0, 0], ...tl.map(([x, y]) => [x - 6, y - 6] as Pt)]);
  const brRim = poly([[CANVAS_W, CANVAS_H], ...br.map(([x, y]) => [x + 6, y + 6] as Pt)]);

  const crestUrl = data.club?.crestUrl;
  const crestMask: CSSProperties = crestUrl
    ? { WebkitMaskImage: `url(${crestUrl})`, maskImage: `url(${crestUrl})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }
    : {};
  const bigS = 1250;

  const side = (pos: number): CSSProperties => (right ? { left: pos } : { right: pos });
  const other = (pos: number): CSSProperties => (right ? { right: pos } : { left: pos });
  const TXT = "0 2px 4px rgba(0,0,0,.35), 0 4px 22px rgba(0,0,0,.45)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: deep }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at 50% 48%, ${mid} 0%, ${shade(c, -0.4)} 60%, ${deep} 100%)` }} />
      {/* The giant crest, a lighter plane of the club colour. */}
      {crestUrl && (
        <div
          data-bleed
          style={{ position: "absolute", left: 540 - bigS / 2 + (r() - 0.5) * 120, top: 120 + r() * 60, width: bigS, height: bigS, background: `linear-gradient(to bottom, ${shade(c, 0.06)}, ${mid} 70%)`, opacity: 0.8, ...crestMask }}
        />
      )}
      {/* Damask, distressed. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <pattern id={`${fid}-p`} width={230} height={310} patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
            <Motif x={115} y={160} s={0.72} fill={ink} />
            <Motif x={0} y={5} s={0.4} fill={ink} />
            <Motif x={230} y={5} s={0.4} fill={ink} />
            <Motif x={0} y={315} s={0.4} fill={ink} />
            <Motif x={230} y={315} s={0.4} fill={ink} />
          </pattern>
          <filter id={`${fid}-worn`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={seed % 80} result="big" />
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={2} seed={(seed % 80) + 5} result="fine" />
            <feComposite in="big" in2="fine" operator="arithmetic" k2={0.7} k3={0.5} k4={-0.1} result="mixn" />
            <feColorMatrix in="mixn" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.1" result="m" />
            <feComposite in="SourceGraphic" in2="m" operator="in" />
          </filter>
          <filter id={`${fid}-grunge`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves={5} seed={(seed % 80) + 9} />
            <feColorMatrix values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.2`} />
          </filter>
          <filter id={`${fid}-paper`} filterUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={4} seed={(seed % 80) + 13} result="n" />
            <feDiffuseLighting in="n" surfaceScale={1.6} lightingColor="#fff" result="l">
              <feDistantLight azimuth={225} elevation={60} />
            </feDiffuseLighting>
            <feComposite in="l" in2="SourceAlpha" operator="in" />
          </filter>
          <filter id={`${fid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={9} />
          </filter>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} fill={`url(#${fid}-p)`} opacity={0.38} filter={`url(#${fid}-worn)`} />
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${fid}-grunge)`} opacity={0.28} style={{ mixBlendMode: "multiply" }} />
      </svg>

      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 45%, transparent 55%, ${mix(deep, "#000", 0.5)}88 100%)` }} />
      {/* The player on his shadow. */}
      {data.photoUrl && box.feet && (
        <div style={{ position: "absolute", left: box.faceCx - box.width * 0.5, top: box.top + box.height - 30, width: box.width, height: 56, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.6), rgba(0,0,0,0))", filter: "blur(6px)" }} />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 22px 34px rgba(0,0,0,.45))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Torn paper corners. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden data-bleed>
        <path d={tlPoly} fill="rgba(0,0,0,.5)" transform="translate(6 10)" filter={`url(#${fid}-shadow)`} />
        <path d={brPoly} fill="rgba(0,0,0,.5)" transform="translate(-6 -4)" filter={`url(#${fid}-shadow)`} />
        <path d={tlPoly} fill="#fbfaf7" />
        <path d={tlRim} fill={PAPER} />
        <path d={brPoly} fill="#fbfaf7" />
        <path d={brRim} fill={PAPER} />
        <path d={tlRim} fill="#000" filter={`url(#${fid}-paper)`} opacity={0.12} style={{ mixBlendMode: "multiply" }} />
        <path d={brRim} fill="#000" filter={`url(#${fid}-paper)`} opacity={0.12} style={{ mixBlendMode: "multiply" }} />
      </svg>

      {/* Kicker, widely spaced. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 118, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 400, fontSize: kSize, letterSpacing: "0.42em", paddingLeft: "0.42em", color: WHITE, textShadow: TXT, whiteSpace: "nowrap" }}>
        {kicker}
      </div>

      {/* Competition mark and the two teams. */}
      <div style={{ position: "absolute", top: leftTop, ...side(46), width: stackW + 20, display: "flex", flexDirection: "column", alignItems: "center", color: WHITE, textShadow: TXT }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: shade(c, -0.1) }}>
          <BallMark size={58} />
          {comp && <div style={{ fontFamily: ARCHIVO, fontWeight: 600, fontSize: Math.min(18, 260 / Math.max(1, comp.length * 0.62)), letterSpacing: "0.04em", color: WHITE, whiteSpace: "nowrap" }}>{comp}</div>}
        </div>
        <div style={{ marginTop: 24, fontFamily: ARCHIVO_BLACK, fontSize: stackSize, lineHeight: 0.98, textAlign: "center", whiteSpace: "nowrap", letterSpacing: "0.005em" }}>
          {stack.map((s, i) => (
            <div key={i}>{s}</div>
          ))}
        </div>
      </div>

      {/* Crests stacked, then the facts. */}
      <div style={{ position: "absolute", top: colTop, ...other(48), width: 240, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {crests.map((s, i) => (
          <img key={i} src={s} alt="" style={{ width: 104, height: 104, objectFit: "contain", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.4))" }} />
        ))}
        <div style={{ marginTop: 10, width: 240, fontFamily: ARCHIVO_BLACK, fontSize: factSize, lineHeight: 1.02, textAlign: "center", color: WHITE, textShadow: TXT, whiteSpace: "nowrap" }}>
          {shown.map((f, i) => (
            <div key={i} style={f === score && postType !== "matchday" ? { fontSize: factSize * 1.9, lineHeight: 1.05 } : undefined}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Agency mark, framed, bottom corner on the red. */}
      <div style={{ position: "absolute", bottom: 40, left: 40, padding: "10px 12px", border: "1.5px solid rgba(255,255,255,.75)", color: WHITE, display: "flex", alignItems: "center" }}>
        <AgencyLogo data={data} height={20} style={{ color: WHITE }} />
      </div>
    </div>
  );
}
