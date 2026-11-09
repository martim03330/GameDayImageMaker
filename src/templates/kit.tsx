/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { cutMask, figureBox } from "./fx";
import { CONDENSED, DISPLAY, MONO, ringSize } from "./shared";
import type { RenderData } from "./types";

/** Building blocks for the "poster" family of templates (torn paper, brush strokes, close-ups…). */

export const SCRIPT = "var(--font-script), 'Brush Script MT', cursive";
export const PAPER = "#ebe9e4";
export const INK = "#121317";

/** Deterministic pseudo-random numbers, so a layout looks the same every render. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Jagged edge points from (x0,y) to (x1,y), in px. */
function jag(x0: number, x1: number, y: number, amp: number, seed: number, step = 14): [number, number][] {
  const r = rng(seed);
  const pts: [number, number][] = [];
  const n = Math.max(2, Math.round(Math.abs(x1 - x0) / step));
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const big = r() < 0.12 ? amp * 1.8 : amp;
    pts.push([x, y + (r() - 0.5) * 2 * big]);
  }
  return pts;
}

/** clip-path for a rectangle whose top and/or bottom edges are torn. */
export function tornRect(w: number, h: number, opts: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean; amp?: number; seed?: number } = {}) {
  const { top = true, bottom = true, amp = 10, seed = 7 } = opts;
  const pts: [number, number][] = [];
  pts.push(...(top ? jag(0, w, amp, amp, seed) : ([[0, 0], [w, 0]] as [number, number][])));
  if (opts.right) jag(amp, h - amp, w - amp, amp, seed + 3).forEach(([y, x]) => pts.push([x, y]));
  pts.push(...(bottom ? jag(w, 0, h - amp, amp, seed + 1) : ([[w, h], [0, h]] as [number, number][])));
  if (opts.left) jag(h - amp, amp, amp, amp, seed + 5).forEach(([y, x]) => pts.push([x, y]));
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}

const PAPER_TEX = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1400' height='1400'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.006' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.2 0.9'/></filter><rect width='100%' height='100%' filter='url(#p)'/></svg>`,
)}")`;

const FIBRES = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.06' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
)}")`;

/** Crumpled paper texture over a colour (works on light and dark). */
export function Paper({ color = PAPER, style, strength = 1 }: { color?: string; style?: CSSProperties; strength?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: color, ...style }}>
      {/* Very soft large-scale unevenness + fine fibres: reads as paper, never as stains. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_TEX, backgroundSize: "1400px 1400px", opacity: 0.08 * strength, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: FIBRES, opacity: 0.1 * strength, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.12) 100%)" }} />
    </div>
  );
}

/** A torn sheet: coloured (or paper) rectangle with rough edges and a soft shadow. */
export function TornSheet({
  x,
  y,
  w,
  h,
  color,
  rotate = 0,
  seed = 1,
  edges = { top: true, bottom: true },
  children,
  paper = true,
  shadow = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  rotate?: number;
  seed?: number;
  edges?: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
  children?: ReactNode;
  paper?: boolean;
  shadow?: boolean;
}) {
  const clip = tornRect(w, h, { ...edges, seed, amp: 9 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg)`,
        filter: shadow ? "drop-shadow(0 14px 22px rgba(0,0,0,.35))" : undefined,
      }}
    >
      <div style={{ position: "absolute", inset: 0, clipPath: clip, overflow: "hidden" }}>
        {paper ? <Paper color={color} strength={0.8} /> : <div style={{ position: "absolute", inset: 0, background: color }} />}
        {children}
      </div>
    </div>
  );
}

/** Rough paint strokes (SVG displacement), e.g. the Atlético By&For backgrounds. */
export function BrushStrokes({ colors, seed = 3, count = 9, opacity = 1 }: { colors: string[]; seed?: number; count?: number; opacity?: number }) {
  const r = rng(seed);
  const strokes = Array.from({ length: count }, (_, i) => ({
    x: -200 + r() * 1200,
    y: -100 + r() * 1400,
    w: 420 + r() * 760,
    h: 90 + r() * 170,
    a: -35 + r() * 25,
    c: colors[i % colors.length],
  }));
  return (
    <svg width={1080} height={1350} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <filter id={`rough-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves={4} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={55} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`dry-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.02" numOctaves={2} seed={seed + 1} result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.2" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
      </defs>
      {strokes.map((s, i) => (
        <g key={i} filter={`url(#rough-${seed})`} transform={`rotate(${s.a} ${s.x + s.w / 2} ${s.y + s.h / 2})`}>
          <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={s.c} filter={`url(#dry-${seed})`} />
        </g>
      ))}
    </svg>
  );
}

/**
 * The player's face, big: positions the cutout so that its detected face box lands on (cx, cy)
 * with the given face width. Falls back to a typical head position when no face was detected.
 */
export function FaceCrop({
  data,
  cx,
  cy,
  faceWidth,
  style,
  imgStyle,
  src,
}: {
  data: RenderData;
  cx: number;
  cy: number;
  faceWidth: number;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  src?: string | null;
}) {
  const url = src ?? data.photoUrl;
  if (!url || !data.photoIsCutout) return null;
  const [fx, fy, fw, fh] = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const w = faceWidth / fw;
  const h = w / aspect;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <img
        src={url}
        alt=""
        style={{
          position: "absolute",
          width: w,
          height: h,
          left: cx - (fx + fw / 2) * w,
          top: cy - (fy + fh / 2) * h,
          maxWidth: "none",
          ...imgStyle,
        }}
      />
    </div>
  );
}

/** A full-body cutout placed by its bottom-centre point and height, honouring the edit's nudges. */
export function Figure({
  data,
  src,
  cx,
  bottom,
  height,
  style,
}: {
  data: RenderData;
  src?: string | null;
  cx: number;
  bottom: number;
  height: number;
  style?: CSSProperties;
}) {
  const url = src ?? data.photoUrl;
  const p = data.params;
  if (!url) {
    return (
      <div
        style={{
          position: "absolute",
          left: cx - height * 0.3,
          bottom,
          width: height * 0.6,
          height,
          border: "4px dashed rgba(127,127,127,.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: CONDENSED,
          fontWeight: 700,
          fontSize: 40,
          color: "rgba(127,127,127,.8)",
        }}
      >
        FOTO
      </div>
    );
  }
  const cut = src && src !== data.photoUrl ? data.cutouts.find((c) => c.url === src)?.cut : data.cut;
  // Same geometry as figureBox (framing crops included) for the main photo; other photos keep their size.
  const box = !src || src === data.photoUrl ? figureBox(data, cx, bottom, height) : null;
  const scale = p.playerScale ?? 1;
  return (
    <img
      src={url}
      alt=""
      style={{
        position: "absolute",
        maxWidth: "none",
        ...(box
          ? { left: box.left, top: box.top, width: box.width, height: box.height }
          : { height: height * scale, left: cx + (p.playerX ?? 0), bottom: bottom - (p.playerY ?? 0), transform: "translateX(-50%)" }),
        ...cutMask(cut),
        ...style,
      }}
    />
  );
}

/** Small spaced caps used for the "micro details" around the edges. */
export function Micro({ children, style, color }: { children: ReactNode; style?: CSSProperties; color: string }) {
  return (
    <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 15, letterSpacing: "0.22em", textTransform: "uppercase", color, whiteSpace: "nowrap", ...style }}>
      {children}
    </div>
  );
}

/** "MOISÉS CONCEIÇÃO · 007 · VIANENSE" style edge strip. */
export function EdgeStrip({ data, color, y }: { data: RenderData; color: string; y: number }) {
  const name = `${data.content.firstName} ${data.content.lastName}`;
  const num = data.player.number ? data.player.number.padStart(3, "0") : "";
  const place = data.club?.name ?? "";
  const bit = [name, num, place].filter(Boolean).join("   ·   ");
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", justifyContent: "space-between", opacity: 0.75 }}>
      <Micro color={color}>+ {bit}</Micro>
      <Micro color={color}>{num || "+"}</Micro>
    </div>
  );
}

/** Thin crosshair circle behind the player (tech/poster detail). */
export function Crosshair({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <svg width={1080} height={1350} style={{ position: "absolute", inset: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity={0.55} />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="none" stroke={color} strokeWidth={1} opacity={0.35} strokeDasharray="4 8" />
      <line x1={cx - r - 40} y1={cy} x2={cx + r + 40} y2={cy} stroke={color} strokeWidth={1} opacity={0.4} />
      <line x1={cx} y1={cy - r - 40} x2={cx} y2={cy + r + 40} stroke={color} strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

/** Home crest "vs" away crest, from the edit content (matchday / result) or the club. */
export function VersusCrests({ data, size, color, gap = 34 }: { data: RenderData; size: number; color: string; gap?: number }) {
  const c = data.content;
  const home = c.homeCrest ?? data.club?.crestUrl;
  const away = c.awayCrest;
  const img = (src?: string | null) =>
    src ? (
      <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.3))" }} />
    ) : (
      <div style={{ width: size, height: size, borderRadius: "50%", border: `3px solid ${color}`, opacity: 0.4 }} />
    );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap }}>
      {img(home)}
      {away !== undefined && (
        <>
          <span style={{ fontFamily: SCRIPT, fontSize: size * 0.55, color, lineHeight: 1 }}>vs</span>
          {img(away)}
        </>
      )}
    </div>
  );
}

/** The official league graphic (Team of the Week), framed, with the player highlighted. */
export function InsetPanel({ data, width, height, accent, rotate = 0 }: { data: RenderData; width: number; height: number; accent: string; rotate?: number }) {
  const hl = data.content.insetHighlight;
  if (!data.insetUrl) {
    return (
      <div
        style={{
          width,
          height,
          transform: `rotate(${rotate}deg)`,
          border: `4px dashed ${accent}`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: CONDENSED,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 2,
          color: accent,
          background: "rgba(0,0,0,.25)",
          padding: 24,
        }}
      >
        GRÁFICO OFICIAL DA EQUIPA DA SEMANA
      </div>
    );
  }
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        transform: `rotate(${rotate}deg)`,
        border: `6px solid #fff`,
        boxShadow: `0 20px 50px rgba(0,0,0,.45), 0 0 0 3px ${accent}`,
      }}
    >
      <img src={data.insetUrl} alt="" style={{ maxWidth: width, maxHeight: height, display: "block" }} />
      {hl && (
        <div
          style={{
            position: "absolute",
            left: `${hl.x}%`,
            top: `${hl.y}%`,
            width: ringSize(hl, Math.min(width, height) * 0.24),
            aspectRatio: "1",
            boxSizing: "border-box",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `5px solid ${accent}`,
            boxShadow: `0 0 26px 6px ${accent}`,
          }}
        />
      )}
    </div>
  );
}

/** Kicker split in at most two lines, for stacked headlines ("GAME" / "DAY"). */
export function twoLines(text: string): string[] {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;
  if (words.length === 2) return words;
  const last = words.pop()!;
  return [words.join(" "), last];
}

/** Big display text with a solid 3D extrusion in `depthColor`. */
export function Extruded({ text, size, color, depthColor, depth = 16, style }: { text: string; size: number; color: string; depthColor: string; depth?: number; style?: CSSProperties }) {
  const shadow = Array.from({ length: depth }, (_, i) => `${i + 1}px ${i + 1}px 0 ${depthColor}`).join(",");
  return <div style={{ fontFamily: DISPLAY, fontSize: size, lineHeight: 0.9, color, textShadow: shadow, whiteSpace: "nowrap", ...style }}>{text}</div>;
}

/** Date / time / venue line for matchday posts. */
export function matchInfo(data: RenderData): { when: string; where: string; teams: string } {
  const c = data.content;
  return {
    when: [c.date, c.time].filter(Boolean).join("  |  "),
    where: c.venue || (c.home !== false ? data.club?.stadium : "") || "",
    teams: [c.homeTeam, c.awayTeam].filter(Boolean).join(" vs "),
  };
}

/** The other team's name (works for home and away games). */
export function opponentOf(data: RenderData): string {
  const c = data.content;
  const ours = (data.club?.name ?? "").toLowerCase();
  if (c.home === true) return c.awayTeam ?? "";
  if (c.home === false) return c.homeTeam ?? "";
  if ((c.homeTeam ?? "").toLowerCase() === ours) return c.awayTeam ?? "";
  if ((c.awayTeam ?? "").toLowerCase() === ours) return c.homeTeam ?? "";
  return c.awayTeam ?? c.homeTeam ?? "";
}
