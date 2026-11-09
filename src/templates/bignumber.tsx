/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
/** Anton: advance of each glyph and cap height, per 1px of font size (measured in the browser). */
const ANTON_ADV: Record<string, number> = { "1": 0.331, "-": 0.311, "–": 0.311, ".": 0.22, "+": 0.45, "'": 0.214 };
const ANTON_DIGIT = 0.494;
const ANTON_CAP = 0.867;

/** The number of the post and what it counts, in English caps. */
export function bigNumberOf(data: RenderData): { value: string; caption: string } {
  const c = data.content;
  const t = data.postType;
  const stat = (re: RegExp) => {
    const s = c.stats.find((x) => re.test(x.label));
    const n = s ? Number(String(s.value).replace(",", ".")) : NaN;
    return s && Number.isFinite(n) && n > 0 ? { value: String(s.value), label: s.label.toUpperCase() } : null;
  };
  const opp = c.subline
    .split("·")
    .map((s) => s.trim())
    .find((s) => /^VS\b/i.test(s))
    ?.toUpperCase();
  const when = c.subline.toUpperCase().trim();
  // "GOALS IN THE LAST 5 GAMES", "GOALS IN SEPTEMBER 2026".
  const over = (label: string, value: string) => {
    const l = value === "1" ? label.replace(/S$/, "") : label;
    if (/^LAST\s/.test(when)) return `${l} IN THE ${when}`;
    if (when && t === "potm") return `${l} IN ${when}`;
    return when ? `${l} · ${when}` : l;
  };
  const score = scoreOf(data, "-");
  if (t === "stats" || t === "potm") {
    const s = stat(/rating/i) ?? stat(/^goals?$/i) ?? stat(/^assists?$/i) ?? (t === "stats" ? stat(/^minutes?$/i) : null) ?? stat(/^games?|apps|appearances$/i);
    if (s) return { value: s.value, caption: /rating/i.test(s.label) ? `AVERAGE RATING · ${when}` : over(s.label, s.value) };
  }
  if (t === "goal") {
    // A brace or more is the number; a single goal lets the final score speak.
    const g = stat(/^goals?$/i);
    if (g && Number(g.value) >= 2) return { value: g.value, caption: `GOALS${opp ? " " + opp : ""}` };
    if (score) return { value: score, caption: ["FULL TIME", opp].filter(Boolean).join(" ") };
    if (g) return { value: g.value, caption: `GOAL${opp ? " " + opp : ""}` };
  }
  if (t === "result" && score) return { value: score, caption: ["FULL TIME", opp].filter(Boolean).join(" ") };
  if (t === "renewal" && c.until) return { value: c.until, caption: "CONTRACT UNTIL" };
  const n = data.player.number || String(c.stats[0]?.value ?? "");
  return { value: n, caption: (data.player.position || c.kicker || "").toUpperCase() };
}

/** The leak's arc dies out before it reaches the right half. */
const ARC_FADE: CSSProperties = { WebkitMaskImage: "linear-gradient(to right, #000 55%, transparent 88%)", maskImage: "linear-gradient(to right, #000 55%, transparent 88%)" };

/** Natural width of a string in Anton, per 1px of font size. */
const antonWidth = (s: string) => [...s].reduce((a, ch) => a + (ANTON_ADV[ch] ?? (/\d/.test(ch) ? ANTON_DIGIT : 0.48)), 0);

/**
 * Milestone graphic (AFC Bournemouth "50 PL appearances"): a night stadium blurred to bokeh with a warm
 * red-orange light leak arcing in from the top left, one giant white rounded number in the middle and the
 * player running through it (the number drawn behind him, and again in front across his trailing leg);
 * his name in widely spaced thin caps above, what the number counts below.
 */
export function Bignumber({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 50);
  const ts = params.textScale ?? 1;
  const { value, caption } = bigNumberOf(data);

  // ---- the number: tall, condensed, white; width by its digits ----
  const numTop = 330;
  const numH0 = 700; // cap height
  const nat = antonWidth(value);
  // Squeezed a little, like a condensed rounded display face; never wider than the canvas allows.
  let size = numH0 / ANTON_CAP;
  // One digit alone stands wider, so it still reads around the player.
  let squeeze = [...value].length === 1 ? 1.05 : 0.78;
  const maxW = 900;
  if (nat * size * squeeze > maxW) squeeze = Math.max(0.62, maxW / (nat * size));
  if (nat * size * squeeze > maxW) size = maxW / (nat * squeeze);
  size *= ts;
  const numW = nat * size * squeeze;
  const capH = size * ANTON_CAP;
  const baseline = numTop + (numH0 + capH) / 2;

  // ---- the player: whole body, running across the number ----
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  // Always the whole figure: a photo cut at the legs stands as if whole and dissolves into the pitch
  // above the caption, instead of growing into a close-up that hides the number.
  const framing = params.framing === "knees" ? "knees" : "full";
  const single = [...value].length === 1;
  const faceIn = data.face ? data.face[0] + data.face[2] / 2 : 0.5;
  // He looks / runs towards the side his face leans to; the number's other half is in front of his trailing leg.
  const runsRight = params.side === "left" ? false : params.side === "right" ? true : faceIn >= 0.5;
  const whole = cutBottom && framing === "full" ? { ...data, cut: { ...data.cut, bottom: 0 } } : data;
  const offset = single ? 190 : 30;
  const fig = standing(whole, { cx: 540 + (runsRight ? -offset : offset) + (r() - 0.5) * 40, headTop: 250 + r() * 30, floor: cutBottom ? 1110 : 1085, maxFace: 150, framing });
  const bodyCx = fig.left + fig.width / 2;
  const waist = fig.faceTop + fig.faceH * 3.4;

  // Front copy of the number: only its lower half on his trailing side.
  const split = runsRight ? Math.min(bodyCx, fig.faceCx) - fig.faceH * 0.2 : Math.max(bodyCx, fig.faceCx) + fig.faceH * 0.2;
  const band = runsRight ? `polygon(0 ${waist}px, ${split}px ${waist}px, ${split}px ${CANVAS_H}px, 0 ${CANVAS_H}px)` : `polygon(${split}px ${waist}px, ${CANVAS_W}px ${waist}px, ${CANVAS_W}px ${CANVAS_H}px, ${split}px ${CANVAS_H}px)`;

  const number = (id: string) => (
    // Fitted with textLength: always inside the canvas (the text range reports the unfitted width).
    <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#f3f1ee" />
          <stop offset="1" stopColor="#dcd8d3" />
        </linearGradient>
      </defs>
      <text
        x={540}
        y={baseline}
        textAnchor="middle"
        textLength={numW}
        lengthAdjust="spacingAndGlyphs"
        style={{ fontFamily: DISPLAY, fontSize: size }}
        fill={`url(#${id}-g)`}
        stroke={`url(#${id}-g)`}
        strokeWidth={size * 0.045}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {value}
      </text>
    </svg>
  );

  // ---- scenery: a real ground first, blurred to a night bokeh ----
  const scene = params.scene ?? data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? null;
  const bg = scene ?? data.bgPhotoUrl;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const spaced = (text: string, max: number, width: number): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: 300,
    fontSize: Math.min(max, width / Math.max(1, [...text].length * 1.12)) * ts,
    letterSpacing: "0.55em",
    paddingLeft: "0.55em",
    lineHeight: 1.2,
    color: WHITE,
    whiteSpace: "nowrap",
    textAlign: "center",
    textShadow: "0 2px 18px rgba(0,0,0,.5)",
  });
  const motionId = `bignumber-motion-${params.seed ?? 0}`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#0d0b0c", color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <filter id={motionId} x="-30%" y="-5%" width="160%" height="110%">
          <feGaussianBlur stdDeviation="26 0" />
        </filter>
      </svg>
      {bg && (
        <img
          src={bg}
          alt=""
          style={{ position: "absolute", left: -70, top: -70, width: CANVAS_W + 140, height: CANVAS_H + 140, maxWidth: "none", objectFit: "cover", filter: `blur(${scene ? 16 : 40}px) saturate(1.15) brightness(.5) contrast(1.1)` }}
        />
      )}
      {/* Night: dark sky, a greener, lit pitch at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(6,6,10,.75), rgba(6,6,10,.25) 45%, rgba(20,40,10,.15) 70%, rgba(0,0,0,.55))" }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: 900, height: 600, background: "radial-gradient(closest-side, rgba(120,170,70,.35), transparent)", mixBlendMode: "screen" }} />

      {/* Warm light leak arcing in from the top left, a red glow down the left edge. */}
      <div data-bleed style={{ position: "absolute", left: -1150, top: -1300, width: 2100, height: 2100, borderRadius: "50%", border: "70px solid rgba(255,70,40,.85)", filter: "blur(38px)", mixBlendMode: "screen", ...ARC_FADE }} />
      <div data-bleed style={{ position: "absolute", left: -1080, top: -1230, width: 1960, height: 1960, borderRadius: "50%", border: "26px solid rgba(255,190,90,.7)", filter: "blur(16px)", mixBlendMode: "screen", ...ARC_FADE }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 45% at 0% 0%, rgba(255,60,30,.55), transparent 70%), radial-gradient(40% 50% at 0% 75%, rgba(230,30,40,.5), transparent 75%)", mixBlendMode: "screen" }} />

      {number("bn-back")}

      {/* Motion trail, then the player. */}
      {data.photoUrl && (
        <>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: fig.left + (runsRight ? -40 : 40), top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: `url(#${motionId})`, opacity: 0.45 }}
          />
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.08) drop-shadow(0 20px 40px rgba(0,0,0,.45))", ...cutMask(data.cut, cutBottom && framing === "full" ? 2.2 : 1) }}
          />
        </>
      )}

      {/* The number again, in front of his trailing leg only: he runs through it. */}
      <div style={{ position: "absolute", inset: 0, clipPath: band, WebkitClipPath: band }}>{number("bn-front")}</div>

      {/* Warm spill over everything, so number and player share the light. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(55% 40% at 0% 0%, rgba(255,90,50,.35), transparent 70%)", mixBlendMode: "screen", pointerEvents: "none" }} />

      <div style={{ position: "absolute", left: 40, right: 40, top: 205, ...spaced(name, 34, 900) }}>{name}</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1150, ...spaced(caption, 32, 900) }}>{caption}</div>

      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 540 - 26, top: 70, width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.4))" }} />}
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 56, opacity: 0.8 }} />
      <Film strength={0.9} />
    </div>
  );
}
