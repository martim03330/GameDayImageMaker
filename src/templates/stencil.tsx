/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK } from "./fx";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Archivo Black: advance widths per 100px of font size (measured in the browser). */
const ARCHIVO_W: Record<string, number> = { A: 77.8, B: 77.8, C: 77.8, D: 77.8, E: 72.2, F: 66.7, G: 83.3, H: 83.3, I: 38.9, J: 66.7, K: 83.3, L: 66.7, M: 94.4, N: 83.3, O: 83.3, P: 72.2, Q: 83.3, R: 77.8, S: 72.2, T: 72.2, U: 83.3, V: 77.8, W: 100, X: 77.8, Y: 77.8, Z: 72.2, " ": 33.3, "-": 33.3, "'": 27.8, ".": 33.3, ":": 33.3, "/": 27.8, "&": 88.9 };
const archivoEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (ARCHIVO_W[c] ?? (/\d/.test(c) ? 66.7 : 80)) / 100 + tracking, -tracking);
const CAP = 0.688;

const MONTH3: Record<string, string> = { JANUARY: "JAN", FEBRUARY: "FEB", MARCH: "MAR", APRIL: "APR", MAY: "MAY", JUNE: "JUNE", JULY: "JULY", AUGUST: "AUG", SEPTEMBER: "SEPT", OCTOBER: "OCT", NOVEMBER: "NOV", DECEMBER: "DEC" };

/** "MATCHDAY" → MATCH / DAY; otherwise at most two balanced lines. */
function twoLines(kicker: string): string[] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim().replace(/^(MATCH|GAME)DAY$/, "$1 DAY").replace(/^FULLTIME$/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words.length ? words : [""];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.max(archivoEm(words.slice(0, i).join(" ")), archivoEm(words.slice(i).join(" ")));
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Like placeFace, but a stencil hides upscaling: the face may grow to 3× its real pixels. */
function bigFace(data: RenderData, faceX: number, faceTop: number, faceH: number) {
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let fh = faceH * (p.playerScale ?? 1);
  if (data.facePx > 0) fh = Math.min(fh, Math.max(110, data.facePx * 3));
  const h = Math.max(fh / face[3], (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return { left: faceX - w * (face[0] + face[2] / 2) + (p.playerX ?? 0), top: faceTop - h * face[1] + (p.playerY ?? 0), width: w, height: h };
}

/** A discrete transfer table mapping grey (0..1) to three tones of one channel, thresholds t1 < t2. */
function tones(dark: number, mid: number, light: number, t1: number, t2: number, n = 40): string {
  return Array.from({ length: n }, (_, i) => {
    const v = (i + 0.5) / n;
    return (v < t1 ? dark : v < t2 ? mid : light).toFixed(3);
  }).join(" ");
}
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** Specks of ink across the ground, as on a worn print. */
function specksUrl(seed: number, color: string): string {
  const [r, g, b] = rgb(color);
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='540' height='540'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.16' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 -24 16.3'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
  )}")`;
}
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/**
 * Two-tone stencil poster (Washington State "PRO DAY 22 / ONE WEEK OUT."): a flat club-colour ground with
 * worn specks, the player turned into a hard threshold stencil — white highlights, a deep ink of the club
 * colour for the shadows and a darker club tone between — huge and bleeding off his side and the foot.
 * Top corner: a heavy title block between double rules (the title in the deep ink, the round or score
 * beside it in white, both crests as white marks on the top rule); at the foot on the free side a short
 * stack of heavy white caps (date / KICK OFF / time.) with the competition above it and the fixture below.
 */
export function Stencil({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 31;
  const r = rng(seed);
  const right = params.side !== "left";
  const X = (x: number) => (right ? x : CANVAS_W - x);
  const id = `st${seed}`;

  // Ground: the club colour, kept mid-deep so both white and the ink read on it.
  let ground = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(ground) > 0.4) ground = vivid(params.accent);
  for (let i = 0; i < 6 && luminance(ground) > 0.16; i++) ground = shade(ground, -0.12);
  if (luminance(ground) < 0.03) ground = shade(ground, 0.2);
  const ink = shade(ground, -0.8);
  const mid = shade(ground, -0.45);
  const tint = shade(ground, 0.55);

  const f = matchFacts(data);
  const score = scoreOf(data, "-");
  const result = (postType === "result" || postType === "goal") && !!score;

  /* ---- title block: kicker in ink, a white figure beside it ---- */
  const lines = twoLines(content.kicker || "MATCHDAY");
  const figure = postType === "result" ? "" : postType === "matchday" ? (f.roundNo ? f.roundNo.padStart(2, "0") : "") : data.player.number ? `#${data.player.number}` : "";
  const BX = 70;
  const tracking = -0.02;
  const kW = Math.max(...lines.map((l) => archivoEm(l, tracking)));
  // The figure stands as tall as the two lines together.
  const pitch = 0.98;
  const hRatio = (CAP + (lines.length - 1) * pitch) / CAP; // figure size / title size
  const figW = figure ? archivoEm(figure, -0.04) * hRatio + 0.12 : 0;
  const blockW = 520;
  const size = Math.min(figure ? 118 : 150, blockW / (kW + figW)) * (params.textScale ?? 1);
  const figSize = size * hRatio;
  const titleTop = 150 + (params.textY ?? 0);
  const blockH = size * (CAP + (lines.length - 1) * pitch);
  const realW = (kW + figW) * size;

  /* ---- the player: huge, off his side, cut by the foot ---- */
  const want = ({ chest: 360, waist: 320, knees: 270, full: 230 } as Record<string, number>)[params.framing ?? "waist"] ?? 290;
  const faceTop = Math.max(250, titleTop + blockH * 0.35) + r() * 30;
  const box = bigFace(data, X(765 + r() * 25), faceTop, want);
  const [fx, fy, fw, fh] = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + box.width * (fx + fw / 2);
  const faceCy = box.top + box.height * (fy + fh / 2);
  const faceR = box.height * fh;
  const img = data.photoUrl;

  /* ---- the stack at the foot ---- */
  const mon = MONTH3[f.longDate.split(" ")[1] ?? ""] ?? f.mon;
  const day = f.longDate.split(" ")[0] ?? "";
  const dateShort = day && mon ? `${day} ${mon}` : "";
  const stack = result
    ? ["FULL", "TIME", `${score}.`]
    : [dateShort, f.time ? "KICK OFF" : "", f.time ? `${f.time}.` : ""].filter(Boolean);
  if (!stack.length) stack.push(...(f.venue ? ["SEE YOU", "THERE."] : ["LET'S", "GO."]));
  const stackW = 440;
  const sTrack = -0.01;
  const sSize = Math.min(104, stackW / Math.max(...stack.map((t) => archivoEm(t, sTrack))));
  const sPitch = sSize * 0.93;
  const SB = 150;
  const stackTop = CANVAS_H - SB - (stack.length - 1) * sPitch - sSize * CAP;
  const above = [f.comp, f.round].filter(Boolean).join(" · ") || (result ? f.longDate : "");
  const ours = (data.club?.name ?? "").toUpperCase();
  const fixture = f.opp ? (content.home === false ? `${f.opp} V ${ours}` : `${ours} V ${f.opp}`) : ours;
  const below = [fixture, result ? "" : f.venue].filter(Boolean);
  const fit = (t: string, room: number, max: number, per = 0.56) => Math.max(14, Math.min(max, room / Math.max(1, [...t].length * per)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "drop-shadow(0 2px 6px rgba(0,0,0,.3))" : `url(#${id}-mono)`;
  const side: CSSProperties = right ? { left: BX } : { right: BX };
  const align = right ? "flex-start" : "flex-end";

  // The face has to read: its shadows a little lighter than the body's, so eyes and brows separate from skin.
  const [ir, ig, ib] = rgb(ink);
  const [mr, mg, mb] = rgb(mid);
  const t1 = 0.3;
  const t2 = 0.56;
  const stencilFilter = (fid: string, a: number, b: number, blur: number) => (
    <filter id={fid} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="s" />
      <feColorMatrix in="s" type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" result="g" />
      <feComponentTransfer in="g">
        <feFuncR type="discrete" tableValues={tones(ir, mr, 1, a, b)} />
        <feFuncG type="discrete" tableValues={tones(ig, mg, 1, a, b)} />
        <feFuncB type="discrete" tableValues={tones(ib, mb, 1, a, b)} />
        <feFuncA type="discrete" tableValues="0 0 1 1" />
      </feComponentTransfer>
    </filter>
  );

  const rule = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ height: 4, background: ink }} />
      <div style={{ height: 2, background: ink }} />
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id={`${id}-mono`} ink={0.62} />
      {/* The ground: flat ink, slightly mottled, with dark specks. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at ${right ? 30 : 70}% 20%, ${shade(ground, 0.08)}, ${ground} 55%, ${shade(ground, -0.18)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: specksUrl((seed % 40) + 3, ink), backgroundSize: "540px 540px", opacity: 0.7, WebkitMaskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.35) 45%, transparent 75%)", maskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.35) 45%, transparent 75%)" }} />

      {/* The stencil. */}
      {img && (
        <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <defs>
            {stencilFilter(`${id}-body`, t1, t2, 1.1)}
            {stencilFilter(`${id}-face`, t1 - 0.05, t2 + 0.07, 0.5)}
            <radialGradient id={`${id}-fg`} cx={faceCx} cy={faceCy} r={faceR * 0.95} gradientUnits="userSpaceOnUse">
              <stop offset="0.75" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <mask id={`${id}-fm`} maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
              <rect width={CANVAS_W} height={CANVAS_H} fill={`url(#${id}-fg)`} />
            </mask>
            <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="120%">
              <feColorMatrix in="SourceAlpha" type="matrix" values={`0 0 0 0 ${ir}  0 0 0 0 ${ig}  0 0 0 0 ${ib}  0 0 0 0.9 0`} />
              <feOffset dx={right ? -16 : 16} dy={10} />
            </filter>
          </defs>
          <image href={img} x={box.left} y={box.top} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-shadow)`} />
          <image href={img} x={box.left} y={box.top} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-body)`} />
          <image href={img} x={box.left} y={box.top} width={box.width} height={box.height} preserveAspectRatio="none" filter={`url(#${id}-face)`} mask={`url(#${id}-fm)`} />
        </svg>
      )}

      {/* Title block between double rules, crests as white marks on the top one. */}
      <div style={{ position: "absolute", top: titleTop - 64, ...side, width: realW, display: "flex", flexDirection: "column", alignItems: align }}>
        <div style={{ width: "100%", height: 50, display: "flex", alignItems: "center" }}>
          {rule}
          {crests.length > 0 && (
            <div style={{ display: "flex", gap: 12, padding: "0 16px" }}>
              {crests.map((c, i) => (
                <img key={i} src={c} alt="" style={{ width: 50, height: 50, objectFit: "contain", filter: crestFilter }} />
              ))}
            </div>
          )}
          {rule}
        </div>
      </div>
      <div data-bleed style={{ position: "absolute", top: titleTop - size * (1 - CAP) * 0.82, ...side, display: "flex", alignItems: "flex-start", gap: size * 0.1, flexDirection: right ? "row" : "row-reverse" }}>
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: size, lineHeight: `${size * pitch}px`, letterSpacing: `${tracking}em`, color: ink, whiteSpace: "nowrap", textAlign: right ? "left" : "right" }}>
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        {figure && (
          <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: figSize, lineHeight: 1, letterSpacing: "-0.04em", color: WHITE, whiteSpace: "nowrap", marginTop: -(figSize - size) * (1 - CAP) * 0.82 + 0 }}>
            {figure}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", top: titleTop + blockH + 22, ...side, width: realW }}>
        <div style={{ height: 2, background: ink }} />
        <div style={{ height: 4, background: ink, marginTop: 4 }} />
      </div>

      {/* The stack at the foot, on the free side. */}
      <div style={{ position: "absolute", top: stackTop - 52, ...side, width: stackW + 40, display: "flex", flexDirection: "column", alignItems: align }}>
        {above && <div style={{ fontFamily: CONDENSED, fontStyle: "italic", fontWeight: 800, fontSize: fit(above, stackW, 26), letterSpacing: "0.04em", lineHeight: 1, color: tint, whiteSpace: "nowrap", marginBottom: 22 }}>{above}</div>}
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: sSize, lineHeight: `${sPitch}px`, letterSpacing: `${sTrack}em`, color: WHITE, whiteSpace: "nowrap", textAlign: right ? "left" : "right", paintOrder: "stroke fill", WebkitTextStroke: `0px ${ink}`, textShadow: `0 0 1px ${ink}, 0 4px 18px ${ink}aa` }}>
          {stack.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, alignItems: align }}>
          {below.map((t, i) => (
            <div key={i} style={{ fontFamily: CONDENSED, fontWeight: i ? 600 : 800, fontSize: fit(t, stackW, i ? 20 : 24), letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap", color: i ? tint : WHITE, textShadow: `0 2px 8px ${ink}` }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", [right ? "right" : "left"]: 56, top: 44 + (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "right top" : "left top" }} />

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.18, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}
