/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f1efea";
const INK = "#141518";
const GREY = "#86847f";
const NB = "\u00a0";
/** Fluorescent yellow, for clubs whose colour is no good as a highlighter (black, white, grey). */
export const FLUO = "#f3fa3c";

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = {
  a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8,
  n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9,
  A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3,
  N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1,
  " ": 26.7, [NB]: 26.7, "'": 31.3, "-": 46.3, ".": 27, ",": 27, ":": 27, "–": 50, "·": 27, "&": 70,
};
/** Width in ems of Inter 500 text with `tracking` (em) per glyph. Accents are ignored. */
export const interEm = (t: string, tracking = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? (/\d/.test(c) ? 63 : 62)) / 100 + tracking, 0);

/**
 * The highlighter: the club colour as a light, saturated marker ink — fluorescent yellow when the club colour
 * is a neutral (black / white / grey) or the result would be too dark to read black type through.
 */
export function highlighter(primary: string, accent: string): string {
  const pick = primary === "#10131c" ? accent : primary;
  const cands = [pick, accent].filter((c) => hueOf(c) != null);
  if (!cands.length) return FLUO;
  let c = shade(vivid(cands[0]), 0.28);
  if (luminance(c) < 0.24) c = shade(c, 0.18);
  if (luminance(c) < 0.2 || luminance(c) > 0.85) return FLUO;
  return c;
}

/**
 * One rough highlighter swipe filling its box: a chisel-ended band with slightly wobbly edges, ink a little
 * heavier where the stroke starts and ends and faint dry streaks along its length. `w`/`h` only shape the
 * path (the SVG stretches to its box), so the band can wrap text whose width the browser measures.
 */
export function SwipeSvg({ w, h, color, seed }: { w: number; h: number; color: string; seed: number }) {
  const r = rng(seed * 7919 + 17);
  const j = (a: number) => (r() - 0.5) * 2 * a;
  const chisel = h * 0.22;
  const n = Math.max(4, Math.round(w / 90));
  const top: [number, number][] = [];
  const bot: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    top.push([chisel + t * (w - chisel), Math.max(0, h * 0.035 + j(h * 0.035))]);
    bot.push([t * (w - chisel), Math.min(h, h * 0.96 + j(h * 0.04))]);
  }
  const d = `M${[...top, ...bot.reverse()].map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" L")} Z`;
  const id = `hl${seed}_${Math.round(w)}_${Math.round(h)}`;
  // Streaks: tiny opacity bands along the stroke, as when the felt runs a little dry.
  const stops = [0, 0.14, 0.3, 0.46, 0.62, 0.8, 1].map((o, i) => ({ o, a: i === 0 || i === 6 ? 0.92 : 0.8 + j(0.1) }));
  const ty = top[n][1];
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1">
          {stops.map((s, i) => (
            <stop key={i} offset={s.o} stopColor={color} stopOpacity={Math.min(1, s.a)} />
          ))}
        </linearGradient>
        <filter id={`${id}f`} x="-5%" y="-30%" width="110%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.5" numOctaves="2" seed={seed % 97} />
          <feDisplacementMap in="SourceGraphic" scale={Math.max(3, h * 0.07)} />
        </filter>
      </defs>
      <g filter={`url(#${id}f)`}>
        <path d={d} fill={`url(#${id}v)`} />
        {/* Heavier ink where the felt touched down and lifted off. */}
        <path d={`M${chisel},${top[0][1]} L${chisel + h * 0.36},${top[0][1]} L${h * 0.36},${h * 0.96} L0,${h * 0.96} Z`} fill={color} opacity={0.28} />
        <path d={`M${w - h * 0.26},${ty} L${w},${ty} L${w - chisel},${h * 0.96} L${w - chisel - h * 0.26},${h * 0.96} Z`} fill={color} opacity={0.22} />
      </g>
    </svg>
  );
}

/** A word run with the highlighter drawn over it (multiply, so black ink stays black). Size in px of the type. */
export function Mark({ text, size, color, seed, tilt = 0, blend = "multiply", opacity = 0.85, cover = [0.17, 0.97], over = 0.14 }: { text: string; size: number; color: string; seed: number; tilt?: number; blend?: CSSProperties["mixBlendMode"]; opacity?: number; cover?: [number, number]; over?: number | [number, number] }) {
  const [oL, oR] = typeof over === "number" ? [over, over] : over;
  const h = size * (cover[1] - cover[0]);
  const w = Math.max(h * 1.5, interEm(text) * size + (oL + oR) * size);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {text}
      <span
        aria-hidden
        style={{ position: "absolute", left: -oL * size, right: -oR * size, top: size * cover[0], height: h, mixBlendMode: blend, opacity, transform: `rotate(${tilt}deg)`, pointerEvents: "none" }}
      >
        <SwipeSvg w={w} h={h} color={color} seed={seed} />
      </span>
    </span>
  );
}

/** A line of the big type; `mark` is the part drawn under the highlighter. */
type Line = { before: string; mark?: string; after?: string };
const lineText = (l: Line) => l.before + (l.mark ?? "") + (l.after ?? "");

/**
 * Marker: someone went over the fixture with a highlighter. The match info set plainly in Inter 500 on a
 * pale paper ground — home team, "v" the other, date and kick-off — and a slightly irregular, translucent
 * marker swipe in the club colour (fluorescent yellow for neutral clubs) over just two things: the opponent
 * and the kick-off time. The player big on the other side in natural colour; "Matchday" and the competition
 * small at the top, crests small above the fixture, the NEYOD mark under it.
 */
export function Marker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const seed = params.seed ?? 0;
  const playerLeft = params.side === "left";
  const M = story ? 72 : 64;
  const hl = highlighter(params.primary, params.accent);

  /* ---- the fixture, home team first, names exactly as stored ---- */
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const oursName = ((weHost ? content.homeTeam : content.awayTeam) || ours).trim();
  const oppName = ((weHost ? content.awayTeam : content.homeTeam) || titleCase(f.opp)).trim();
  const date = niceDate(content.date);
  const time = f.time;

  const lines: Line[] = [];
  if (oursName && oppName) {
    if (weHost) lines.push({ before: oursName }, { before: "v ", mark: oppName });
    else lines.push({ before: "", mark: oppName }, { before: "v " + oursName });
  } else lines.push({ before: oursName || "Matchday" });
  const dateLine: Line | null = date || time ? (time ? { before: date ? `${date}, ` : "", mark: time } : { before: date }) : null;

  /* ---- type sizes: one size for the fixture, a step down for the date ---- */
  const T = -0.025;
  const colW = story ? 560 : 520;
  const bigMax = (story ? 82 : 66) * ts;
  const s = Math.max(34, Math.min(bigMax, ...lines.map((l) => colW / Math.max(1, interEm(lineText(l), T)))));
  const ds = dateLine ? Math.max(30, Math.min(s * 0.92, colW / Math.max(1, interEm(lineText(dateLine), T)))) : 0;
  const venue = ((content.venue ?? "").trim() || titleCase(f.venue)).trim();
  const vs = Math.max(14, Math.min(22 * k, colW / Math.max(1, interEm(venue) * 1.0))) * ts;
  const lead = s * 1.08;

  /* ---- the column, measured up from the logo ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const venueTop = venue ? logoTop - (story ? 68 : 50) - vs + ty : logoTop - (story ? 68 : 50) + ty;
  const dateTop = dateLine ? (venue ? venueTop - (story ? 26 : 20) : venueTop) - ds * 1.0 : venueTop;
  const fixTop = (dateLine ? dateTop - s * 0.42 : venueTop - (story ? 20 : 14)) - lead * lines.length;
  const crestSize = Math.round((story ? 64 : 48) * ts);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const crestTop = fixTop - (story ? 40 : 30) - crestSize;

  /* ---- the top row ---- */
  const kicker = (() => {
    const t = (content.kicker || "Matchday").replace(/’/g, "'").trim().toLowerCase();
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ");
  const topY = (story ? STORY_TOP : 64) + ty;
  const kSize = (story ? 36 : 28) * ts;
  const cSize = Math.max(13, Math.min((story ? 24 : 19) * ts, (story ? 640 : 520) / Math.max(1, interEm(comp))));

  /* ---- the player, big, on his side ---- */
  const faceX = playerLeft ? (story ? 330 : 300) : story ? 750 : 780;
  const sizes = story ? { chest: 300, waist: 236, knees: 196, full: 156 } : { chest: 220, waist: 176, knees: 142, full: 116 };
  const faceTop = story ? STORY_TOP + 250 : 190;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The type column's real width; his body keeps clear of it (a cutout's box has ~12% air at its sides).
  const textW = Math.max(...lines.map((l) => interEm(lineText(l), T) * s), dateLine ? interEm(lineText(dateLine), T) * ds : 0) + s * 0.15;
  const colRight = M + textW + (story ? 30 : 20);
  let box = placeByFace(data, faceX, faceTop, sizes);
  for (let i = 0; i < 6; i++) {
    const bodyL = box.left + box.width * 0.07;
    const bodyR = box.left + box.width * 0.93;
    const over = playerLeft ? bodyR - (CANVAS_W - colRight) : colRight - bodyL;
    if (over <= 0) break;
    // Slide him out first, as far as keeps his whole head on the canvas.
    const fL = box.left + face[0] * box.width;
    const fW = face[2] * box.width;
    const room = playerLeft ? fL - fW * 0.6 - 30 : CANVAS_W - 30 - (fL + fW * 1.6);
    const shift = Math.min(over, Math.max(0, room));
    box = { ...box, left: box.left + (playerLeft ? -shift : shift) };
    if (shift >= over) break;
    // Still in the way: a size down, his face kept where it was.
    const kk = 0.9 ** (i + 1);
    const fx = box.left + (face[0] + face[2] / 2) * box.width;
    box = placeByFace(data, fx - (params.playerX ?? 0), faceTop, Object.fromEntries(Object.entries(sizes).map(([key, v]) => [key, v * kk])));
  }
  const chin = box.top + (face[1] + face[3]) * box.height;
  // If he still reaches into the type (a cutout that must run to the foot can't shrink), he melts into the
  // paper above the crests instead, as in a magazine cut.
  const clash = playerLeft ? box.left + box.width * 0.93 > CANVAS_W - colRight : box.left + box.width * 0.07 < colRight;
  const bandY = crestTop - (story ? 40 : 30) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${bandY - (story ? 340 : 260)}px, transparent ${bandY}px)`;
  const edgeX = playerLeft ? CANVAS_W - colRight - box.left : colRight - box.left;
  const soft = story ? 260 : 200;
  const side = playerLeft
    ? `linear-gradient(to right, #000 0, #000 ${edgeX - soft}px, transparent ${edgeX + 10}px)`
    : `linear-gradient(to right, transparent 0, transparent ${edgeX - 10}px, #000 ${edgeX + soft}px)`;
  // Union of the two: he stays whole above the type and on the far side, and melts only towards the type.
  const armMask: CSSProperties = clash
    ? { WebkitMaskImage: `${fade}, ${side}`, maskImage: `${fade}, ${side}`, WebkitMaskComposite: "source-over", maskComposite: "add" }
    : {};

  const align: CSSProperties = playerLeft ? { right: M, textAlign: "right" } : { left: M, textAlign: "left" };
  const big = (size: number): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${T}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK });

  /** A line of type with its marked part under the highlighter. */
  const typed = (l: Line, size: number, n: number) => {
    const r = rng(seed * 31 + n * 7 + 3);
    return (
      <>
        {l.before}
        {l.mark && <Mark text={l.mark} size={size} color={hl} seed={seed * 13 + n + 1} tilt={-1.3 + r() * 1.5} />}
        {l.after}
      </>
    );
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.7), transparent 72%)` }} />

      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin, width: box.width * 0.6, height: clash ? Math.max(60, box.top + bandY - chin - 200) : box.width * 0.9, borderRadius: "50%", background: "rgba(40,34,28,.10)", filter: `blur(${story ? 70 : 56}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, ...armMask }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the kicker, the competition under it. */}
      <div style={{ position: "absolute", top: topY, ...align, ...big(kSize), fontWeight: 600, letterSpacing: "-0.01em" }}>{kicker}</div>
      {comp && <div style={{ position: "absolute", top: topY + kSize * 1.35, ...align, ...big(cSize), color: GREY, letterSpacing: "-0.005em" }}>{comp}</div>}

      {/* Crests, small, over the fixture. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: crestTop, ...align, display: "flex", gap: story ? 22 : 16, flexDirection: playerLeft ? "row-reverse" : "row" }}>
          {(playerLeft ? [...crests].reverse() : crests).map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* The fixture and the date in plain type, the highlighter over two runs. */}
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", top: fixTop + i * lead, ...align, ...big(s) }}>{typed(l, s, i)}</div>
      ))}
      {dateLine && <div style={{ position: "absolute", top: dateTop, ...align, ...big(ds) }}>{typed(dateLine, ds, 9)}</div>}
      {venue && <div style={{ position: "absolute", top: venueTop, ...align, ...big(vs), color: GREY, letterSpacing: "-0.005em" }}>{venue}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", bottom: logoBottom, [playerLeft ? "right" : "left"]: M, transform: `scale(${logoScale})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
