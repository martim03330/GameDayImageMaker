/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { clubInk } from "./column";
import { cutMask } from "./fx";
import { ANTON, em } from "./mist";
import { natFixture } from "./natkit";
import { clocksOf, emojiOf } from "./prokit";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/*
 * Agency matchday story (Maxime Dubosson, Étoile Carouge v Winterthur, liked 2026-11-07): a charcoal ground
 * where his surname repeats gigantic and vertical in the club's two colours, striped and faded, under a clean
 * crumpled-cling-film sheen; two slanted gold-framed crest panels in a wide band across the upper third with
 * the clubs' exact names over them; him big, front-on, chest up, in front of everything (his head over the
 * panels); his name in bevelled silver top left, the agency mark in a gold-ruled box top right, his full name
 * tracked tiny down the right edge; at the foot the venue's flag, the kick-off, a rule, the ground and the
 * competition. Drawn natively at 1080×1920.
 */

const WIDE = "var(--font-archivo-black), 'Arial Black', sans-serif";
const GOLD = "#b8955a";
const GOLD_EDGE = "linear-gradient(135deg, #f3dfa6 0%, #b8925a 28%, #6e5530 52%, #d9bd7f 74%, #7a5e33 100%)";
const SILVER = "linear-gradient(180deg, #ffffff 0%, #eef0f2 30%, #a9aeb6 50%, #d7dadf 64%, #f6f7f8 82%, #9ea3ab 100%)";

/** Archivo Black caps: rough advance relative to the size (it is a wide face). */
const wideEm = (t: string, tracking = 0) => [...t].reduce((a, c) => a + (/[MW]/.test(c) ? 1.02 : /[I1]/.test(c) ? 0.42 : c === " " ? 0.3 : /[:.·]/.test(c) ? 0.34 : 0.78), 0) + [...t].length * tracking;

/** Bevelled silver caps (gradient-clipped text with a hard dark lip under it). */
const silver = (px: number, extra?: CSSProperties): CSSProperties => ({
  fontFamily: WIDE,
  fontSize: px,
  lineHeight: 1.04,
  whiteSpace: "nowrap",
  backgroundImage: SILVER,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: `drop-shadow(0 ${Math.max(1, px * 0.035).toFixed(1)}px 0 rgba(0,0,0,.75)) drop-shadow(0 3px 8px rgba(0,0,0,.5))`,
  ...extra,
});

/** One line if it fits big enough, else two balanced lines — always the whole text, never cut. */
function fitLines(text: string, w: number, max: number, min: number, tracking = 0): { lines: string[]; px: number } {
  const one = Math.min(max, w / Math.max(1, wideEm(text, tracking)));
  const words = text.split(/\s+/).filter(Boolean);
  if (one >= min || words.length < 2) return { lines: [text], px: Math.max(8, one) };
  let best = { lines: [text], px: one };
  for (let i = 1; i < words.length; i++) {
    const ls = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const px = Math.min(max, ...ls.map((l) => w / Math.max(1, wideEm(l, tracking))));
    if (px > best.px) best = { lines: ls, px };
  }
  return best;
}

/** The second stripe colour: the club's accent, or a tan gold when the accent is white/black or too close. */
function stripeColours(data: RenderData): [string, string] {
  const a = clubInk(data);
  const acc = data.params.accent || GOLD;
  const la = luminance(acc);
  const near = Math.abs(luminance(a) - la) < 0.08;
  const b = la > 0.72 || la < 0.04 || near ? GOLD : acc;
  return [luminance(a) < 0.05 ? shade(a, 0.3) : a, b];
}

/** Where he goes: face big and centred, his hair just inside the crest band, the photo running off the foot. */
export function place(data: RenderData, H: number, hairTop: number) {
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const cap = Math.min(330, data.facePx > 0 ? data.facePx * 2.1 : 330);
  let faceH = Math.min(290, cap) * (data.params.playerScale ?? 1);
  let faceTop = hairTop + faceH * 0.4;
  let h = faceH / face[3];
  // A photo cut at the waist that would stop short of the foot: grow it (within the resolution cap) to reach it.
  for (let i = 0; i < 3; i++) {
    const reach = (H + 20 - faceTop) / Math.max(0.2, 1 - face[1]);
    if (h >= reach) break;
    h = Math.min(reach, cap / face[3]);
    faceH = h * face[3];
    faceTop = hairTop + faceH * 0.4;
  }
  const top = faceTop - face[1] * h + (data.params.playerY ?? 0);
  const w = h * aspect;
  const left = CANVAS_W / 2 - (face[0] + face[2] / 2) * w + (data.params.playerX ?? 0);
  return { left, top, width: w, height: h, short: top + h < H - 8, faceH };
}

/** A slanted dark panel with a thin bevelled gold frame (children are drawn upright). */
function Slant({ x, y, w, h, skew, border, fill, children, shadow = true }: { x: number; y: number; w: number; h: number; skew: number; border: number; fill: string; children?: React.ReactNode; shadow?: boolean }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `skewX(${skew}deg)`, background: GOLD_EDGE, padding: border, boxSizing: "border-box", boxShadow: shadow ? "0 14px 30px rgba(0,0,0,.55)" : undefined }}>
      <div style={{ position: "relative", width: "100%", height: "100%", background: fill, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.6), inset 0 0 30px rgba(0,0,0,.55)" }}>{children}</div>
    </div>
  );
}

export function Portraitstripes({ data }: { data: RenderData }) {
  const H = data.canvasH ?? CANVAS_H;
  const ts = data.params.textScale ?? 1;
  const fx = natFixture(data);
  const md = matchFacts(data);
  const [c1, c2] = stripeColours(data);
  const first = (data.content.firstName || "").toUpperCase().trim();
  const last = (data.content.lastName || "").toUpperCase().trim();
  const full = [first, last].filter(Boolean).join(" ");

  // ---- band geometry (story; a post squeezes it up) ----
  const story = H > 1400;
  const k = story ? 1 : 0.8;
  const topY = story ? 118 : 40;
  const bandTop = story ? 372 : 250;
  const namesH = 58;
  const boxH = Math.round(230 * k);
  const outer = { x: 70, y: bandTop + namesH, w: 940, h: boxH + 56 };
  const skew = -11;
  const inW = 392;
  const boxes = [
    { x: outer.x + 58, name: fx.homeName, crest: fx.homeCrest },
    { x: outer.x + outer.w - 58 - inW, name: fx.awayName, crest: fx.awayCrest },
  ];

  // ---- him ----
  const fig = data.photoUrl ? place(data, H, outer.y + 26) : null;
  const figMask = fig?.short ? (() => {
    const m = "linear-gradient(to top, transparent 0%, #000 22%)";
    return { WebkitMaskImage: m, maskImage: m } as CSSProperties;
  })() : cutMask({ ...data.cut, bottom: 0 }, 2.2);

  // ---- the giant vertical surname columns ----
  const word = (last || first || "MATCHDAY").replace(/\s+/g, " ");
  const colW = 380;
  const cols = 3;
  const colPx = colW / 0.86;
  const natural = em(word.normalize("NFD").replace(/\p{M}/gu, ""), ANTON, 46);
  const runLen = Math.max(H * 0.62, Math.min(H * 1.05, natural * colPx * 1.05));

  // ---- top left name ----
  const lastPx = Math.min(74 * ts, 430 / Math.max(1, wideEm(last)));
  const firstPx = Math.min(30 * ts, lastPx * 0.5);

  // ---- foot ----
  const clock = clocksOf(data)[0];
  const flag = clock ? emojiOf(clock.tag) : null;
  const venue = fitLines(fx.venue.toUpperCase(), 760, 34 * ts, 22);
  const comp = [md.comp, md.round].filter(Boolean).join(" · ").toUpperCase();
  const compPx = Math.min(21 * ts, 820 / Math.max(1, [...comp].length * 0.62));
  const footBottom = story ? 1772 : 1300;
  const timePx = 70 * ts;
  const blockH = (flag ? 66 : 0) + (fx.time ? timePx * 1.04 + 8 : 0) + 18 + venue.lines.length * venue.px * 1.08 + (comp ? 10 + compPx * 1.2 : 0);
  const footTop = footBottom - blockH;

  const scan = "repeating-linear-gradient(to bottom, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 1px, rgba(0,0,0,.22) 2px, rgba(0,0,0,.22) 4px)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0d0e10", color: "#fff" }}>
      {/* ground: charcoal with a soft lift behind the head */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 45% at 50% 34%, #26272b 0%, #151619 55%, #08090a 100%)" }} />

      {/* the surname, gigantic, vertical, striped in the two club colours */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {[c1, c2].map((c, i) => (
            <pattern key={i} id={`pst-stripe-${i}`} width={14} height={14} patternUnits="userSpaceOnUse">
              <rect width={14} height={14} fill={c} opacity={0.22} />
              <rect width={14} height={7} fill={c} opacity={0.9} />
            </pattern>
          ))}
          <linearGradient id="pst-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.95} />
            <stop offset="0.55" stopColor="#fff" stopOpacity={0.75} />
            <stop offset="0.92" stopColor="#fff" stopOpacity={0.12} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <mask id="pst-mask">
            <rect width={CANVAS_W} height={H} fill="url(#pst-fade)" />
          </mask>
        </defs>
        <g mask="url(#pst-mask)" opacity={0.5}>
          {Array.from({ length: cols }, (_, i) => {
            const x = -40 + i * (colW - 8);
            const c = i % 2;
            return [0, 1].map((r) => {
              // Two runs per column, the second starting where the first ends, so the word fills the height.
              const y0 = (i % 2 ? -runLen * 0.35 : -40) + r * (runLen + 30);
              return (
                <g key={`${i}-${r}`} transform={`translate(${x},${y0.toFixed(1)}) rotate(90)`}>
                  <text x={0} y={-colW * 0.08} textLength={runLen} lengthAdjust="spacingAndGlyphs" style={{ fontFamily: DISPLAY, fontSize: colPx }} fill={`url(#pst-stripe-${(c + r) % 2})`} stroke={(c + r) % 2 ? c2 : c1} strokeWidth={3} strokeOpacity={0.7}>
                    {word}
                  </text>
                </g>
              );
            });
          })}
        </g>
      </svg>

      {/* a smoky darkening low down and at the edges, so the type reads */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,9,10,.25) 0%, rgba(8,9,10,0) 22%, rgba(8,9,10,0) 50%, rgba(8,9,10,.55) 78%, rgba(8,9,10,.85) 100%)" }} />

      {/* clean cling-film sheen (background only): lit wrinkles plus a few soft streaks */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.42 }}>
        <defs>
          <filter id="pst-wrap" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.0018 0.0042" numOctaves={3} seed={7} result="n" />
            <feDiffuseLighting in="n" surfaceScale={9} diffuseConstant={1.1} lightingColor="#ffffff" result="lit">
              <feDistantLight azimuth={235} elevation={38} />
            </feDiffuseLighting>
            <feColorMatrix in="lit" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.4 2.4 2.4 0 -5.7" />
            <feGaussianBlur stdDeviation={2.2} />
          </filter>
          <linearGradient id="pst-streak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.5} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <filter id="pst-soft">
            <feGaussianBlur stdDeviation={3} />
          </filter>
        </defs>
        <g transform={`rotate(-62 ${CANVAS_W / 2} ${H / 2})`}>
          <rect x={-500} y={-500} width={CANVAS_W + 1000} height={H + 1000} filter="url(#pst-wrap)" />
        </g>
        <g filter="url(#pst-soft)" opacity={0.5}>
          {[
            [-120, 180, 760, 26, 0.6],
            [420, 120, 820, 16, 0.4],
            [-60, 760, 640, 20, 0.5],
            [620, 980, 680, 14, 0.35],
            [80, 1320, 520, 12, 0.3],
          ].map(([x, y, w, t, o], i) => (
            <rect key={i} x={x} y={y} width={w} height={t} fill="url(#pst-streak)" opacity={o} transform={`rotate(${i % 2 ? -58 : -64} ${x + w / 2} ${y})`} />
          ))}
        </g>
      </svg>

      {/* the crest band: one wide slanted frame holding two slanted crest panels */}
      <Slant x={outer.x} y={outer.y} w={outer.w} h={outer.h} skew={skew} border={4} fill="rgba(12,13,15,.82)" />
      {boxes.map((b, i) => (
        <Slant key={i} x={b.x} y={outer.y + 28} w={inW} h={boxH} skew={skew} border={4} fill="#0b0c0e" shadow={false}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 80% at 50% 50%, ${shade(i ? c2 : c1, -0.55)}, #060708 85%)` }} />
          {b.crest && (
            <div style={{ position: "absolute", inset: 0, transform: `skewX(${-skew}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={b.crest} alt="" style={{ width: inW * 0.62, height: boxH * 0.84, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.6))" }} />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, background: scan, mixBlendMode: "overlay", opacity: 0.8 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,255,255,.08), rgba(255,255,255,0) 35%, rgba(0,0,0,.25))" }} />
        </Slant>
      ))}
      {/* him: sharp, in colour, in front of everything */}
      {fig && data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 20px 34px rgba(0,0,0,.55))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...figMask }} />
        </div>
      )}

      {/* the clubs' exact names over the panels (in front of his hair, never cut) */}
      {boxes.map((b, i) => {
        const t = fitLines((b.name || "").toUpperCase(), inW - 10, 40 * ts, 24);
        return (
          <div key={i} style={{ position: "absolute", left: b.x + (boxH / 2 + 28) * Math.tan((-skew * Math.PI) / 180), top: bandTop + namesH - 10 - t.lines.length * t.px * 1.04, width: inW, textAlign: "center", transform: "skewX(-8deg)" }}>
            {t.lines.map((l, j) => (
              <div key={j} style={silver(t.px)}>
                {l}
              </div>
            ))}
          </div>
        );
      })}

      {/* the foot darkening over his shirt (below the face only) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 260, height: H - footTop + 260, background: "linear-gradient(to bottom, rgba(6,7,8,0), rgba(6,7,8,.55) 45%, rgba(6,7,8,.85))" }} />

      {/* top left: his name in bevelled silver, a thin rule under it */}
      <div style={{ position: "absolute", left: 40, top: topY, transform: "skewX(-9deg)", transformOrigin: "left bottom" }}>
        {first && last && <div style={silver(firstPx, { marginBottom: -firstPx * 0.08, marginLeft: 4 })}>{first}</div>}
        <div style={silver(lastPx)}>{last || first}</div>
      </div>
      <div style={{ position: "absolute", left: 40, top: topY + (first && last ? firstPx * 1.04 : 0) + lastPx * 1.08 + 12, width: 440, height: 2, background: "linear-gradient(to right, rgba(255,255,255,.85), rgba(255,255,255,.25))" }} />

      {/* top right: the agency mark in a thin gold-ruled dark box, flush to the edge */}
      <div style={{ position: "absolute", right: -4, top: topY - 22, padding: "3px 0 3px 3px", background: GOLD_EDGE, boxShadow: "0 10px 26px rgba(0,0,0,.5)" }}>
        {/* The shared logo pass (LogoLift) scales the mark 1.2× from its right foot and drops it by the agreed
            moveY on stories: the box leaves room for the growth and the mark is drawn that much higher, so it
            lands centred in the box. */}
        <div style={{ background: "linear-gradient(180deg, #17181b, #0b0c0e)", padding: story ? "30px 34px 16px 70px" : "14px 30px 14px 30px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.6)" }}>
          <div style={{ marginTop: -(data.params.logoMoveY ?? (story ? 50 : 0)), marginBottom: data.params.logoMoveY ?? (story ? 50 : 0), marginLeft: -(data.params.logoMoveX ?? 0), display: "flex" }}>
            <AgencyLogo data={data} height={story ? 22 : 18} />
          </div>
        </div>
      </div>

      {/* right edge: his full name, tiny and widely tracked, down the edge */}
      {full && (
        <div style={{ position: "absolute", right: 22, top: topY + 150, bottom: H - footBottom, width: 16, overflow: "hidden", display: "flex", flexDirection: "column", gap: 120 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} style={{ writingMode: "vertical-rl", fontFamily: CONDENSED, fontWeight: 600, fontSize: 13, letterSpacing: "0.9em", color: "rgba(255,255,255,.55)", whiteSpace: "nowrap" }}>
              {full}
            </div>
          ))}
        </div>
      )}

      {/* foot: flag, kick-off, rule, ground, competition */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {flag && <div style={{ fontSize: 58, lineHeight: 1, height: 66, fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.5))" }}>{flag}</div>}
        {fx.time && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
            <span style={silver(timePx, { lineHeight: 1.04 })}>{fx.time}</span>
            {fx.ptTime && <span style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 24 * ts, letterSpacing: "0.08em", color: "rgba(255,255,255,.75)" }}>({fx.ptTime})</span>}
          </div>
        )}
        <div style={{ width: 420, height: 2, background: `linear-gradient(to right, rgba(184,149,90,0), ${GOLD} 20%, #f0dca8 50%, ${GOLD} 80%, rgba(184,149,90,0))`, margin: "4px 0 14px" }} />
        {venue.lines.map((l, i) => (
          <div key={i} style={silver(venue.px, { lineHeight: 1.08 })}>
            {l}
          </div>
        ))}
        {comp && <div style={{ marginTop: 10, fontFamily: CONDENSED, fontWeight: 700, fontSize: compPx, lineHeight: 1.2, letterSpacing: "0.16em", whiteSpace: "nowrap", color: "rgba(226,229,233,.82)" }}>{comp}</div>}
      </div>
    </div>
  );
}
