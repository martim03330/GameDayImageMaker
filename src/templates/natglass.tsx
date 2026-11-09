/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Inter at line-height 1: where the cap top and the baseline fall inside the line box (em). */
const CAP_TOP = 0.137;
const BASE = 0.864;

export type GlassLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/** The frosted glass: the only blur in the edit, and only behind the card. */
const GLASS = {
  background: "linear-gradient(160deg, rgba(255,255,255,.18), rgba(255,255,255,.06) 60%, rgba(255,255,255,.04))",
  backdropFilter: "blur(18px) brightness(.6) contrast(.92) saturate(1.1)",
  WebkitBackdropFilter: "blur(18px) brightness(.6) contrast(.92) saturate(1.1)",
  border: "1.5px solid rgba(255,255,255,.42)",
  boxShadow: "0 12px 44px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.28)",
} as const;
const TEXT_SHADOW = "0 1px 2px rgba(0,0,0,.34), 0 2px 12px rgba(0,0,0,.24)";

/**
 * The shared frame of the natural glass looks: his photo full-bleed (real grass, stands, light, light grade
 * only) and one idea — a frosted-glass card (backdrop blur + light white tint + hairline border, rounded)
 * holding a big "MATCHDAY" / "GOAL" and the info lines under it. The card sits in the clear upper area,
 * left-aligned, his face below it (hair never under it). No headroom in the photo: the card goes to the
 * foot over the grass, on the side away from him, and the logo to the top corner away from his head. The
 * NEYOD logo always alone with clear space.
 */
export function NatGlassFrame({ data, word, lines }: { data: RenderData; word: string; lines: GlassLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 72 : 60;
  const maxW = CANVAS_W - 2 * M;
  const padX = Math.round(38 * k);
  const padY = Math.round(36 * k);
  const innerMax = maxW - 2 * padX;

  /* ---- the card's content ---- */
  const WORD_TRACK = 0.01;
  const wordEm = capsEm(word, WORD_TRACK) * 1.08;
  const size = Math.min((story ? 128 : 96) * ts, innerMax / Math.max(1, wordEm));
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, innerMax / Math.max(1, capsEm(l.text, l.tracking) * 1.04)) }));
  const wordW = size * wordEm;
  const linesW = Math.max(0, ...sized.map((l) => l.px * capsEm(l.text, l.tracking) * 1.04));
  const cardW = Math.round(Math.min(maxW, Math.max(wordW, linesW, story ? 520 : 400) + 2 * padX));
  const under = Math.round(26 * k);
  const gap = Math.round(13 * k);
  const capH = size * (BASE - CAP_TOP);
  const linesH = sized.reduce((h, l, i) => h + l.px * (BASE - CAP_TOP) + (i ? gap + l.px * 0.18 : 0), 0);
  const cardH = Math.round(padY * 2 + capH + (sized.length ? under + linesH : 0));

  /* ---- upper layout: card at the top, his face below it ---- */
  const top0 = (story ? STORY_TOP : 60) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, top0 + cardH + (story ? 130 : 72) + fs * 0.8), fs });
  const hairTop = place.fy - place.fs * 0.9;
  const upper = hairTop >= top0 + cardH + (story ? 44 : 32);

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  const cardTop = upper ? top0 : footBottom - cardH;
  // At the foot the card goes to the side away from him (more grass, less kit); at the top it hangs left.
  const cardLeft = upper || place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - cardW;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  /* ---- inside the card: cap tops laid out exactly ---- */
  let y = padY + capH + under;
  const placed = sized.map((l, i) => {
    if (i) y += gap + l.px * 0.18;
    const capTop = y;
    y += l.px * (BASE - CAP_TOP);
    return { ...l, top: capTop - l.px * CAP_TOP };
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <div style={{ position: "absolute", left: cardLeft, top: cardTop, width: cardW, height: cardH, borderRadius: Math.round(22 * (story ? 1.25 : 1)), overflow: "hidden", ...GLASS }}>
        <div
          style={{ position: "absolute", left: padX - size * 0.04, top: padY - size * CAP_TOP, fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: `${WORD_TRACK}em`, whiteSpace: "nowrap", color: "#ffffff", textShadow: TEXT_SHADOW }}
        >
          {word}
        </div>
        {placed.map((l) => (
          <div
            key={l.text}
            style={{ position: "absolute", left: padX, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", color: "#ffffff", opacity: l.opacity ?? 1, textShadow: TEXT_SHADOW }}
          >
            {l.text}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}

/**
 * Natural · glass (matchday): his own match photo full-bleed — real grass, stands and light, only the light
 * grade — and one idea: a frosted-glass card in the clear area holding a big "MATCHDAY", then HOME v AWAY
 * (exact names, home first), date · kick-off and the venue. The NEYOD logo alone with clear space.
 */
export function Natglass({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").replace(/’/g, "'").trim().toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <NatGlassFrame
      data={data}
      word={word}
      lines={[
        { text: match, size: 24, weight: 700, tracking: 0.08 },
        { text: when, size: 21, weight: 600, tracking: 0.16, opacity: 0.94 },
        { text: (fx.venue || "").toUpperCase(), size: 19, weight: 600, tracking: 0.14, opacity: 0.86 },
      ]}
    />
  );
}
