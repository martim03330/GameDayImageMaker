/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export type Tape = { text: string; /** The label tape ("MATCHDAY" / "GOAL"): larger. */ main?: boolean };

/** Tape type: size (post px) and tracking (em) — Barlow Condensed 800 caps. */
const MAIN = { size: 70, tracking: 0.12 };
const INFO = { size: 31, tracking: 0.14 };
/** Each tape's tilt (deg) and nudge right (post px): stuck on by hand, never quite straight. */
const TILT = [-2, 1.6, -1.2, 1.4];
const NUDGE = [0, 16, 6, 12];

/** Rough advance of caps in Barlow Condensed 800 at 1px (em), with tracking; a little generous on purpose. */
function tapeEm(text: string, tracking: number): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    em += /[MW]/.test(ch) ? 0.72 : /[I1]/.test(ch) ? 0.28 : ch === " " ? 0.22 : /[·.,:'’]/.test(ch) ? 0.24 : /[0-9]/.test(ch) ? 0.48 : 0.5;
  }
  return em + [...text].length * tracking;
}

/**
 * The shared frame of the natural Dymo looks: his photo full-bleed (real grass, stands, light) and one idea —
 * label-maker tape strips stuck on the photo: glossy black tape with slightly rounded ends, a soft top
 * highlight and a soft shadow, white embossed condensed caps, each strip tilted ±2°. A big tape with the
 * word, then one or two smaller ones with the info, stacked left in the clear upper area (his face below
 * them); with no headroom they go to the lower-left and the NEYOD logo to the top corner away from his head.
 */
export function NatDymoFrame({ data, tapes, mainSize = MAIN.size }: { data: RenderData; tapes: Tape[]; /** The label tape's type size in the post (px). */ mainSize?: number }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const k = story ? 1.3 : 1;
  const M = story ? 76 : 62;
  const maxW = W - 2 * M - 30 * k;

  /* ---- tapes: type size, padding, height and the extra height their tilt takes ---- */
  const strips = tapes
    .filter((t) => t.text)
    .map((t, i) => {
      const s = t.main ? { ...MAIN, size: mainSize } : INFO;
      const want = s.size * k * ts;
      const padX = want * (t.main ? 0.42 : 0.62);
      const px = Math.max(Math.min(want, (maxW - 2 * padX) / Math.max(1, tapeEm(t.text, s.tracking))), want * 0.62);
      const pX = px * (t.main ? 0.42 : 0.62);
      const h = px * (t.main ? 1.18 : 1.42);
      const w = tapeEm(t.text, s.tracking) * px + 2 * pX;
      const tilt = TILT[i % TILT.length];
      const lift = (Math.abs(Math.sin((tilt * Math.PI) / 180)) * w) / 2;
      return { ...t, ...s, px, padX: pX, h, w, tilt, lift, nudge: NUDGE[i % NUDGE.length] * k };
    });
  const gap = 14 * k;
  const blockH = strips.reduce((sum, s, i) => sum + s.h + 2 * s.lift + (i ? gap : 0), 0);

  /* ---- upper layout: tapes at the top-left, his face below them ---- */
  const topCap = (story ? STORY_TOP : 64) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const frameAt = (f: number): NatPlace => natPlace(data, W, H, { fx: fx0, fy: Math.max(story ? 700 : 500, topCap + blockH + 64 + f * 0.75), fs: f });
  const roomy = (p: NatPlace) => p.fy - p.fs * 0.8 >= topCap + blockH + 28;
  // No headroom at full size: try him a little smaller (the tapes read best up top) before falling to the foot.
  let place = frameAt(fs);
  if (!roomy(place)) {
    const smaller = frameAt(fs * 0.8);
    if (roomy(smaller)) place = smaller;
  }
  const upper = roomy(place);

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  // Story with no room for the whole stack above his hair: the word tape alone up top, the info tapes down at
  // the foot (the story's title-top / info-foot rhythm) — when the word tape fits above him.
  const hairTop = place.fy - place.fs * 0.8;
  const headH = strips.length ? strips[0].h + 2 * strips[0].lift : 0;
  const split = story && !upper && strips.length > 1 && hairTop >= topCap + headH + 28;
  const restH = blockH - headH - gap;
  const top = upper ? topCap : footBottom - blockH;
  let y = split ? footBottom - restH : top;
  const placed = strips.map((s, i) => {
    if (split && i === 0) return { ...s, top: topCap + s.lift };
    const t = y + s.lift;
    y += s.h + 2 * s.lift + gap;
    return { ...s, top: t };
  });

  /* ---- the NEYOD logo alone, clear of the tapes and his figure ---- */
  const { box } = place;
  const boxRight = box.left + box.width;
  const footLogoTop = (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0);
  const topLogoTop = (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const rightX = W - M - logoW;
  let logoTop: number;
  let logoLeft: number;
  if (upper) {
    // At the foot, in the corner away from him (his legs ≈ 1.4 face-heights each side of his face line);
    // centred only when he fills the whole foot.
    const legL = Math.max(box.left, place.fx - 1.4 * place.fs);
    const legR = Math.min(boxRight, place.fx + 1.4 * place.fs);
    const leftFree = legL >= M + logoW + 24;
    const rightFree = legR <= rightX - 24;
    const far = place.fx < W / 2 ? (rightFree ? rightX : leftFree ? M : null) : leftFree ? M : rightFree ? rightX : null;
    [logoTop, logoLeft] = [footLogoTop, far ?? (W - logoW) / 2];
  } else if (split) {
    // Word tape top-left, info foot-left: the logo top-right when the word tape and his head leave it clear,
    // else at the foot on the right when his legs leave it clear, else top-right regardless.
    const s0 = placed[0];
    const tapeClear = M + s0.nudge + s0.w + 56 <= rightX;
    const headClear = hairTop >= topLogoTop + logoH + 48 || place.fx + 0.8 * place.fs < rightX - 24;
    const legR = Math.min(boxRight, place.fx + 1.4 * place.fs);
    if (tapeClear && headClear) [logoTop, logoLeft] = [topLogoTop, rightX];
    else if (legR <= rightX - 24) [logoTop, logoLeft] = [footLogoTop, rightX];
    else [logoTop, logoLeft] = [topLogoTop, rightX];
  } else {
    // Tapes at the foot: the logo up in the corner away from his head.
    [logoTop, logoLeft] = [topLogoTop, place.fx > W / 2 ? M : rightX];
  }
  const logoAtFoot = logoTop > H / 2;
  const logoShade = logoAtFoot
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {placed.map((s) => (
        <div
          key={s.text}
          style={{
            position: "absolute",
            left: M + s.nudge,
            top: s.top,
            height: s.h,
            boxSizing: "border-box",
            padding: `0 ${s.padX - s.tracking * s.px}px 0 ${s.padX}px`,
            display: "flex",
            alignItems: "center",
            borderRadius: s.h * 0.16,
            transform: `rotate(${s.tilt}deg)`,
            transformOrigin: "left center",
            // Glossy black vinyl: a lighter top edge falling into deep black, a hairline highlight on top.
            background: "linear-gradient(to bottom, #3b3e44 0%, #1b1c20 14%, #0e0f12 52%, #070708 100%)",
            boxShadow: [
              "inset 0 1.5px 0 rgba(255,255,255,.26)",
              "inset 0 -1.5px 0 rgba(0,0,0,.7)",
              "inset 0 0 0 1px rgba(255,255,255,.05)",
              "0 2px 3px rgba(0,0,0,.35)",
              `0 ${8 * k}px ${22 * k}px rgba(0,0,0,.32)`,
            ].join(", "),
            fontFamily: CONDENSED,
            fontWeight: 800,
            fontSize: s.px,
            lineHeight: 1,
            letterSpacing: `${s.tracking}em`,
            whiteSpace: "nowrap",
            color: "#f3f2ee",
            // Embossed: the raised letters catch light on top and cast a hair of shadow below.
            textShadow: "0 -1px 0 rgba(255,255,255,.35), 0 1.5px 0 rgba(0,0,0,.75), 0 0 1px rgba(255,255,255,.25)",
            overflow: "hidden",
          }}
        >
          {/* The gloss: a soft sheen across the tape's upper third. */}
          <div style={{ position: "absolute", left: 0, right: 0, top: "6%", height: "34%", background: "linear-gradient(to bottom, rgba(255,255,255,.13), rgba(255,255,255,0))", pointerEvents: "none" }} />
          <span style={{ position: "relative", top: s.px * 0.04 }}>{s.text}</span>
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · Dymo (matchday): his own match photo full-bleed, light grade only, and one idea: label-maker tape
 * strips stuck on the photo — a big "MATCHDAY" tape, then HOME v AWAY (exact names, home first) and
 * "25 OCT · 15:00" on smaller tapes. The NEYOD logo alone, clear of them.
 */
export function Natdymo({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const kick = (data.content.kicker || "Matchday").trim().toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join(" · ").toUpperCase();
  return <NatDymoFrame data={data} tapes={[{ text: kick, main: true }, { text: match }, { text: when }]} />;
}
