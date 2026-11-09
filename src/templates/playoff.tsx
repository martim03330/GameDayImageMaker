/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { RUBIKMONO } from "./fx";
import { rng } from "./kit";
import { sceneOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { bestLines, MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const BLACK = "#0c0c0d";
const WHITE = "#f4f2ec";

/** Rubik Mono One is monospaced: every glyph advances 0.85em; caps stand 0.72em tall. */
const MONO_EM = 0.85;
const CAP = 0.72;
const monoEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].length * MONO_EM;

/** The bright ink: the club colour pushed bright; a black, white or grey club prints in playoff yellow. */
function inkOf(primary: string, accent: string): string {
  const cands = [primary === "#10131c" ? accent : primary, accent].map((c) => vivid(c));
  let ink = cands.find((c) => hueOf(c) !== null && luminance(c) > 0.08) ?? cands.find((c) => hueOf(c) !== null) ?? "#f5c21b";
  for (let i = 0; i < 5 && luminance(ink) < 0.2; i++) ink = shade(ink, 0.14);
  if (luminance(ink) > 0.85) ink = "#f5c21b";
  return ink;
}

/** Photocopier streaks and dust: long thin lines down the sheet, white specks. */
const STREAKS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='540' height='675'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.7 0.0035' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -5.6'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;
const DUST = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='d'><feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='1' seed='11' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 16 -11.6'/></filter><rect width='100%' height='100%' filter='url(#d)'/></svg>`,
)}")`;
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;
/** Blotchy toner on the black: it never prints perfectly flat. */
const TONER = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='t'><feTurbulence type='fractalNoise' baseFrequency='0.006 0.02' numOctaves='5' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 -0.55'/></filter><rect width='100%' height='100%' filter='url(#t)'/></svg>`,
)}")`;

/** A ragged line across the canvas (torn paper edge), from left to right around height y. */
function tornEdge(r: () => number, y: number, amp: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let x = -20; x <= CANVAS_W + 20; x += 14 + r() * 22) pts.push([x, y + (r() - 0.5) * amp + Math.sin(x / 90) * amp * 0.3]);
  return pts;
}

/** A claw slash: a long tapered stroke, base (x, y), towards angle `a` (deg). */
function slash(x: number, y: number, a: number, w: number, len: number, r: () => number): string {
  const rad = (a * Math.PI) / 180;
  const [dx, dy, nx, ny] = [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad)];
  const n = 12;
  const side = (s: number) =>
    Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const half = (w / 2) * Math.sin(Math.PI * (0.08 + 0.92 * t)) ** 0.7 * (1 - t * 0.6) * (0.85 + r() * 0.3);
      return [x + dx * len * t + nx * half * s, y + dy * len * t + ny * half * s] as [number, number];
    });
  return "M" + [...side(1), ...side(-1).reverse()].map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join("L") + "Z";
}

/** An irregular ink blob around (x, y). */
function blob(x: number, y: number, rad: number, r: () => number): string {
  const n = 11;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = rad * (0.7 + r() * 0.55);
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
  });
  return "M" + pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join("L") + "Z";
}

/**
 * Photocopy playoff poster (Boston Bruins "ROUND ONE" / "GAME DAY"): black toner paper and one bright ink
 * (the club colour, pushed bright). A torn strip of the ground in duotone across the top, a huge extended
 * stacked title in the ink with a blurred motion ghost and worn holes, the player as a high-contrast B&W
 * photocopy cutout with a torn white rim and a rough ink border (his face kept clean), ink splatters and
 * claw slashes, and a column of small condensed caps: both crests as round badges, the competition, the
 * date, a big kick-off ringed by hand, the ground; the club and his name as a lockup at the foot.
 */
export function Playoff({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 29;
  const r = rng(seed);
  const right = params.side !== "left";
  const X = (x: number) => (right ? x : CANVAS_W - x);
  const ink = inkOf(params.primary, params.accent);
  const inkDeep = shade(ink, -0.35);
  const f = matchFacts(data);
  const score = scoreOf(data, "-");
  const scene = sceneOf(data);
  const id = `po${seed}`;

  /* ---- the torn strip of the ground across the top ---- */
  const stripH = scene ? 118 + r() * 20 : 0;
  const tear = tornEdge(r, stripH, 26);
  const tearRim = tear.map(([x, y]) => [x, y + 7 + r() * 6] as [number, number]);
  const poly = (pts: [number, number][]) => `polygon(0 0, ${CANVAS_W}px 0, ${pts.map(([x, y]) => `${x.toFixed(0)}px ${y.toFixed(0)}px`).reverse().join(", ")})`;

  /* ---- title: extended caps, stacked, as wide as the sheet ---- */
  const M = 50;
  const titleTop = (scene ? stripH + 48 : 96) + (params.textY ?? 0);
  const pitch = 0.86;
  const tb = bestLines(content.kicker || "MATCHDAY", CANVAS_W - M * 2, 420, { tracking: 0, pitch, cap: CAP, maxSize: 236, measure: monoEm });
  const size = tb.size * (params.textScale ?? 1);
  const titleBottom = titleTop + size * CAP + (tb.lines.length - 1) * size * pitch;
  const baseline = (i: number) => titleTop + size * CAP + i * size * pitch;

  /* ---- the player: big, low on his side, bleeding off the foot ---- */
  const want = ({ chest: 250, waist: 215, knees: 180, full: 150 } as Record<string, number>)[params.framing ?? "waist"] ?? 200;
  const faceTop = Math.max(titleBottom + 26, 470);
  const box = placeFace(data, X(742 + r() * 20), faceTop, want);
  const [fx, fy, fw, fh] = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + box.width * (fx + fw / 2);
  const faceCy = box.top + box.height * (fy + fh / 2);
  const faceR = box.height * fh;
  const img = data.photoUrl;

  /* ---- the info column on the free side ---- */
  const colW = Math.max(320, Math.min(420, (right ? faceCx - faceR * 1.7 : CANVAS_W - faceCx - faceR * 1.7) - M - 20));
  const colTop = titleBottom + 52;
  const align = right ? "flex-start" : "flex-end";
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const ours = (data.club?.name ?? "").toUpperCase();
  const names = f.opp ? (content.home === false ? [f.opp, ours] : [ours, f.opp]) : [];
  const fit = (t: string, room: number, max: number, per = 0.6) => Math.max(14, Math.min(max, room / Math.max(1, [...t].length * per)));
  const caps = (fs: number, color = WHITE, weight = 700): CSSProperties => ({ fontFamily: CONDENSED, fontWeight: weight, fontSize: fs, letterSpacing: "0.12em", lineHeight: 1.05, color, whiteSpace: "nowrap", textTransform: "uppercase" });
  const result = (postType === "result" || postType === "goal") && !!score;
  const big = result ? score : f.time || "";
  const bigLabel = result ? (postType === "result" ? "FULL TIME" : "THE SCORE") : f.time ? "KICK OFF" : "";
  const bigSize = Math.min(64, (colW - 60) / Math.max(1, monoEm(big)));
  const bigW = monoEm(big) * bigSize;
  const crestFilter = `${params.crestColor ? "" : `url(#${id}-mono) `}contrast(1.1)`;
  const tilt = () => (r() - 0.5) * 3.2;

  /* ---- footer lockup ---- */
  const last = (content.lastName || content.firstName || "").toUpperCase();
  const first = content.lastName ? (content.firstName ?? "").toUpperCase() : "";
  const nameSize = Math.min(56, colW / Math.max(1, monoEm(last)));

  /* ---- ink furniture ---- */
  // Accent claws to the right of the last title line (behind his head), grey ones low in the corner under the lockup.
  const lastW = monoEm(tb.lines[tb.lines.length - 1]) * size + M + (tb.lines.length > 1 ? size * 0.25 : 0);
  const clawX = Math.max(lastW + 40, CANVAS_W - 300);
  const clawTop = baseline(tb.lines.length - 1) - size * CAP - 10;
  const claws = clawX < CANVAS_W - 120 ? [0, 1, 2].map((i) => slash(X(clawX + i * 62 + (r() - 0.5) * 16), clawTop + i * 18, right ? 104 : 76, 30 - i * 3, 230 + r() * 90, r)) : [];
  const greyClaws = [0, 1, 2, 3].map((i) => slash(X(-60 + i * 70), CANVAS_H + 10 - i * 30, right ? -36 : -144, 40, 300 + r() * 120, r));
  const splat: { x: number; y: number; rad: number }[] = [];
  const blobs = [
    { x: faceCx + (right ? -1 : 1) * faceR * 1.9, y: faceCy - faceR * 1.2, n: 16 },
    { x: X(980), y: titleBottom + 30, n: 10 },
    { x: X(150), y: titleTop + 10, n: 8 },
  ];
  blobs.forEach((b) => {
    splat.push({ x: b.x, y: b.y, rad: 16 + r() * 14 });
    for (let i = 0; i < b.n; i++) {
      const a = r() * Math.PI * 2;
      const d = 30 + r() ** 1.6 * 150;
      splat.push({ x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d * 0.8, rad: 1.5 + r() ** 2.5 * 9 });
    }
  });

  const contrast = { slope: 1.75, intercept: -0.36 };
  const svgImg = (filter: string, mask?: string) =>
    img && <image href={img} x={box.left} y={box.top} width={box.width} height={box.height} preserveAspectRatio="none" filter={filter} mask={mask} />;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: BLACK, color: WHITE }}>
      <MonoDefs id={`${id}-mono`} ink={0.7} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: TONER, backgroundSize: "1100px 1100px", opacity: 0.09 }} />

      {/* Light rays fanning from behind the title, as in the reference. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id={`${id}-ray`} x1={right ? 0 : 1} x2={right ? 1 : 0} y1="0" y2="0">
            <stop offset="0" stopColor={WHITE} stopOpacity=".22" />
            <stop offset=".7" stopColor={WHITE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 34 }, (_, i) => {
          const a = ((-6 + i * 1.5 + r() * 0.8) * Math.PI) / 180;
          const ox = X(-60);
          const oy = titleBottom - 40;
          const len = 900;
          return <line key={i} x1={ox} y1={oy} x2={ox + (right ? 1 : -1) * Math.cos(a) * len} y2={oy + Math.sin(a) * len} stroke={`url(#${id}-ray)`} strokeWidth={1 + r() * 2.2} />;
        })}
        {greyClaws.map((d, i) => (
          <path key={i} d={d} fill="#9a9a9a" opacity={0.13 + r() * 0.08} filter={`url(#${id}-rough)`} />
        ))}
      </svg>

      {/* The ground, photocopied in black and the ink, torn off along the bottom. */}
      {scene && (
        <>
          <div style={{ position: "absolute", inset: 0, background: WHITE, clipPath: poly(tearRim) }} />
          <div data-bleed style={{ position: "absolute", inset: 0, clipPath: poly(tear), background: BLACK }}>
            <img src={scene} alt="" style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: stripH + 40, objectFit: "cover", objectPosition: "50% 70%", filter: "grayscale(1) contrast(1.9) brightness(1.05)" }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: stripH + 40, background: ink, mixBlendMode: "multiply" }} />
            <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: stripH + 40, backgroundImage: GRAIN, opacity: 0.4, mixBlendMode: "overlay" }} />
          </div>
        </>
      )}

      {/* Title + ink furniture. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={`${id}-rough`} x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={3} seed={seed} result="t" />
            <feDisplacementMap in="SourceGraphic" in2="t" scale={7} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves={3} seed={seed + 3} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -10 7.3" result="wear" />
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={seed + 4} result="n2" />
            <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -22 16.2" result="specks" />
            <feComposite in="d" in2="wear" operator="in" result="worn" />
            <feComposite in="worn" in2="specks" operator="in" />
          </filter>
          <filter id={`${id}-ghost`} x="-10%" y="-20%" width="120%" height="140%">
            <feGaussianBlur stdDeviation="9 4" />
          </filter>
        </defs>
        {claws.map((d, i) => (
          <path key={i} d={d} fill={ink} filter={`url(#${id}-rough)`} />
        ))}
        <g data-bleed style={{ fontFamily: RUBIKMONO, fontSize: size }} textAnchor={right ? "start" : "end"}>
          <g filter={`url(#${id}-ghost)`} opacity={0.55} transform={`translate(${right ? -22 : 22} 6)`}>
            {tb.lines.map((l, i) => (
              <text key={i} x={X(M)} y={baseline(i)} fill={ink}>
                {l}
              </text>
            ))}
          </g>
          <g filter={`url(#${id}-rough)`}>
            {tb.lines.map((l, i) => (
              <text key={i} x={X(M + (i % 2) * size * 0.25)} y={baseline(i)} fill={ink}>
                {l}
              </text>
            ))}
          </g>
        </g>
        <g filter={`url(#${id}-rough)`}>
          {splat.map((s, i) => (i % 9 === 0 ? <path key={i} d={blob(s.x, s.y, s.rad, r)} fill={ink} /> : <circle key={i} cx={s.x} cy={s.y} r={s.rad} fill={ink} />))}
        </g>
      </svg>

      {/* The player: a rough ink border, a torn white rim, then the photocopy (his face kept clean). */}
      {img && (
        <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <defs>
            <filter id={`${id}-border`} x="-15%" y="-15%" width="130%" height="130%">
              <feMorphology in="SourceAlpha" operator="dilate" radius={20} result="d" />
              <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves={3} seed={seed + 1} result="t" />
              <feDisplacementMap in="d" in2="t" scale={44} xChannelSelector="R" yChannelSelector="G" result="rough" />
              <feFlood floodColor={ink} />
              <feComposite in2="rough" operator="in" />
            </filter>
            <filter id={`${id}-rim`} x="-15%" y="-15%" width="130%" height="130%">
              <feMorphology in="SourceAlpha" operator="dilate" radius={6} result="d" />
              <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={2} seed={seed + 2} result="t" />
              <feDisplacementMap in="d" in2="t" scale={12} xChannelSelector="R" yChannelSelector="G" result="rough" />
              <feFlood floodColor={WHITE} />
              <feComposite in2="rough" operator="in" />
            </filter>
            <filter id={`${id}-copy`} colorInterpolationFilters="sRGB">
              <feColorMatrix in="SourceGraphic" type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" result="g" />
              <feComponentTransfer in="g" result="c">
                <feFuncR type="linear" slope={contrast.slope} intercept={contrast.intercept} />
                <feFuncG type="linear" slope={contrast.slope} intercept={contrast.intercept} />
                <feFuncB type="linear" slope={contrast.slope} intercept={contrast.intercept} />
              </feComponentTransfer>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed + 5} result="n" />
              <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="ng" />
              <feComposite in="c" in2="ng" operator="arithmetic" k1={0} k2={1} k3={0.75} k4={-0.37} result="m" />
              <feComponentTransfer in="m" result="th">
                <feFuncR type="linear" slope={2.6} intercept={-0.8} />
                <feFuncG type="linear" slope={2.6} intercept={-0.8} />
                <feFuncB type="linear" slope={2.6} intercept={-0.8} />
              </feComponentTransfer>
              <feComposite in="th" in2="SourceAlpha" operator="in" />
            </filter>
            <filter id={`${id}-clean`} colorInterpolationFilters="sRGB">
              <feColorMatrix in="SourceGraphic" type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" result="g" />
              <feComponentTransfer in="g">
                <feFuncR type="linear" slope={1.5} intercept={-0.2} />
                <feFuncG type="linear" slope={1.5} intercept={-0.2} />
                <feFuncB type="linear" slope={1.5} intercept={-0.2} />
              </feComponentTransfer>
            </filter>
            <radialGradient id={`${id}-headg`} cx={faceCx} cy={faceCy} r={faceR * 1.05} gradientUnits="userSpaceOnUse" gradientTransform={`translate(${faceCx} ${faceCy}) scale(0.85 1) translate(${-faceCx} ${-faceCy})`}>
              <stop offset="0.62" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <mask id={`${id}-head`} maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
              <rect width={CANVAS_W} height={CANVAS_H} fill={`url(#${id}-headg)`} />
            </mask>
          </defs>
          {svgImg(`url(#${id}-border)`)}
          {svgImg(`url(#${id}-rim)`)}
          {svgImg(`url(#${id}-copy)`)}
          {svgImg(`url(#${id}-clean)`, `url(#${id}-head)`)}
        </svg>
      )}

      {/* The column: crests, then the facts in small condensed caps. */}
      <div style={{ position: "absolute", top: colTop, [right ? "left" : "right"]: M, width: colW, display: "flex", flexDirection: "column", alignItems: align }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `rotate(${tilt()}deg)` }}>
            {crests.map((c, i) => (
              <div key={i} style={{ display: "contents" }}>
                {i > 0 && <span style={{ ...caps(26, ink, 800), letterSpacing: "0.04em" }}>VS</span>}
                <div style={{ width: 112, height: 112, borderRadius: "50%", background: "#1b1b1c", border: `3px solid ${WHITE}`, boxShadow: `0 0 0 5px ${BLACK}, 0 0 0 7px ${shade(WHITE, -0.4)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={c} alt="" style={{ width: 74, height: 74, objectFit: "contain", filter: crestFilter }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {names.length === 2 && (
          <div style={{ ...caps(fit(names.join(" VS "), colW, 21, 0.58), WHITE, 700), marginTop: 22, opacity: 0.9 }}>
            {names[0]} <span style={{ color: ink }}>VS</span> {names[1]}
          </div>
        )}

        <div style={{ marginTop: 42, display: "flex", flexDirection: "column", alignItems: align, gap: 10, transform: `rotate(${tilt()}deg)`, transformOrigin: right ? "left top" : "right top" }}>
          {f.comp && <div style={caps(fit(f.comp, colW, 24), ink, 800)}>{f.comp}</div>}
          {f.round && <div style={caps(fit(f.round, colW, 22), WHITE, 600)}>{f.round}</div>}
        </div>

        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: align, transform: `translateX(${(right ? 1 : -1) * 30}px) rotate(${tilt()}deg)`, transformOrigin: right ? "left top" : "right top" }}>
          {(result ? [f.longDate] : [f.longDate]).filter(Boolean).map((t, i) => (
            <div key={i} style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fit(t, colW - 30, 40, 0.52), letterSpacing: "0.1em", lineHeight: 1, whiteSpace: "nowrap" }}>
              {t}
            </div>
          ))}
          {big && (
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 36, flexDirection: right ? "row" : "row-reverse" }}>
              {bigLabel && <div style={{ ...caps(18, WHITE, 700), lineHeight: 1.1, whiteSpace: "normal", width: 60, textAlign: right ? "left" : "right" }}>{bigLabel}</div>}
              <div style={{ position: "relative", fontFamily: RUBIKMONO, fontSize: bigSize, lineHeight: 1, color: WHITE, whiteSpace: "nowrap", padding: "10px 6px" }}>
                {big}
                {/* Ringed by hand. */}
                <svg width={bigW + 70} height={bigSize + 70} style={{ position: "absolute", left: -32, top: -22, overflow: "visible" }} aria-hidden>
                  <path
                    d={`M ${bigW * 0.08 + 30} ${bigSize + 52} C ${-24} ${bigSize + 40}, ${-12} 16, ${bigW * 0.5 + 35} 10 S ${bigW + 86} ${bigSize * 0.6 + 20}, ${bigW * 0.7 + 35} ${bigSize + 54} S ${18} ${bigSize + 44}, ${30} ${bigSize * 0.25 + 18}`}
                    fill="none"
                    stroke={ink}
                    strokeWidth={3.4}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          )}
          {(result ? [f.venue] : [f.venue]).filter(Boolean).map((t, i) => (
            <div key={i} style={{ ...caps(fit(t, colW - 30, 21), WHITE, 600), marginTop: 22 }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Foot: the club and his name, as the reference's playoff lockup. */}
      <div style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: 132, width: colW, display: "flex", flexDirection: "column", alignItems: align }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: right ? "row" : "row-reverse" }}>
          {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 44, height: 44, objectFit: "contain", filter: crestFilter }} />}
          <span style={caps(fit(ours, colW - 60, 24, 0.6), ink, 900)}>{ours}</span>
        </div>
        {first && <div style={{ ...caps(fit(`${first}${data.player.number ? ` #${data.player.number}` : ""}`, colW, 20), WHITE, 700), marginTop: 12 }}>{first}{data.player.number ? <span style={{ color: ink }}> #{data.player.number}</span> : null}</div>}
        {last && <div style={{ fontFamily: RUBIKMONO, fontSize: nameSize, lineHeight: 1, marginTop: 6, color: WHITE, whiteSpace: "nowrap" }}>{last}</div>}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: 52 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }} />

      {/* Toner streaks, dust, grain, and the copier's dark edges. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: STREAKS, backgroundSize: "1080px 1350px", opacity: 0.11, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: DUST, backgroundSize: "700px 700px", opacity: 0.35, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 50%, transparent 60%, ${inkDeep}22 80%, rgba(0,0,0,.55) 100%)`, pointerEvents: "none" }} />
    </div>
  );
}
