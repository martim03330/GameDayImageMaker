/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { stackEm } from "./natstack";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Barlow Condensed 800: cap height (em). */
const CAP = 0.7;
/** The slant (degrees, counter-clockwise: the block rises to the right) and its sine / cosine / tangent. */
const ANGLE = -7;
const SIN = Math.sin((7 * Math.PI) / 180);
const COS = Math.cos((7 * Math.PI) / 180);
const TAN = SIN / COS;

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6), 0 2px 14px rgba(0,0,0,.5)";

export type SlantLine = { text: string; size: number; weight: number; tracking: number; opacity?: number };

/**
 * The shared frame of the natural slant looks: his photo full-bleed (real grass, stands, light) and one
 * typographic idea — a sports-broadcast sweep: the word in big bold condensed caps, a thin rule under it and
 * one or two small sans lines, the whole block set on a gentle slant (−7°, rising to the right), white with
 * the natural looks' double shadow. Upper layout: the block in the clear area above his head (its lower edge,
 * which climbs to the right, never over his hair). No headroom: the block goes to the lower-left over the
 * grass and the logo to the top corner away from his head. The NEYOD logo alone, upright.
 */
export function NatSlantFrame({ data, word, lines }: { data: RenderData; word: string; lines: SlantLine[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = (W - 2 * M) * 0.97;

  /* ---- the block (unrotated): word, rule, small lines ---- */
  const sized = lines
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const ruleGap = 20 * k;
  const ruleH = Math.max(3, Math.round(3 * k));
  const under = 22 * k;
  const gap = 12 * k;
  const linesH = sized.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const linesW = Math.max(0, ...sized.map((l) => capsEm(l.text, l.tracking) * l.px));
  const topCap = (story ? STORY_TOP + 8 : 70) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;

  /** The layout with the word at `want` px: rotated about its bottom-left corner the block rises by
   * blockW·sin to the right and leans blockH·sin left; upper = his hair stays clear of its lower edge. */
  const layout = (want: number) => {
    const size = Math.min(want * ts, maxW / Math.max(1, stackEm(word)));
    const wordW = stackEm(word) * size;
    const blockH = size * CAP + ruleGap + ruleH + (sized.length ? under + linesH : 0);
    const blockW = Math.max(wordW, linesW);
    const rise = blockH * COS + blockW * SIN;
    const left = M + blockH * SIN;
    const pivotUp = topCap + rise;
    // The block's lower edge over his hair's left side (x = fx − 0.6·fs) is higher than its pivot.
    const edgeAt = (x: number) => pivotUp - Math.max(0, Math.min(blockW, x - left)) * TAN;
    const fyWant = Math.max(story ? 690 : 500, edgeAt(fx0 - 0.6 * fs) + 48 + fs * 0.78);
    const place: NatPlace = natPlace(data, W, H, { fx: fx0, fy: fyWant, fs });
    const upper = place.fy - place.fs * 0.8 >= edgeAt(place.fx - 0.6 * place.fs) + 22;
    return { size, wordW, blockH, rise, left, pivotUp, place, upper };
  };
  // A short word ("GOAL") may go bigger; if that loses the headroom above him, the usual size gets a try first.
  const big = layout(story ? (word.length <= 5 ? 290 : 230) : word.length <= 5 ? 224 : 176);
  const base = big.upper || word.length > 5 ? big : layout(story ? 230 : 176);
  const { size, wordW, blockH, rise, left, pivotUp, place, upper } = base.upper ? base : big;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  // Foot: the pivot (bottom-left) sits on the foot line; the block climbs to the right over the grass.
  const pivotY = upper ? pivotUp : footBottom;
  const capTop = pivotY - blockH;
  const baseline = capTop + size * CAP;
  const ruleTop = baseline + ruleGap;
  let y = ruleTop + ruleH + under;
  const placed = sized.map((l) => {
    const top = y;
    y += l.px + gap;
    return { ...l, top };
  });

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (W - logoW) / 2 : place.fx > W / 2 ? M : W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: pivotY + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - (pivotY - rise) + (story ? 240 : 180), background: "linear-gradient(to top, rgba(0,0,0,.52), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  // Foot: a soft shade along the left too, where the small lines may cross a white kit.
  const sideShade = upper ? null : { top: pivotY - rise - (story ? 200 : 150), bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,.42), rgba(0,0,0,.18) 50%, rgba(0,0,0,0) 78%)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 45%)", maskImage: "linear-gradient(to bottom, transparent, #000 45%)" };
  const fid = story ? "nsl-soft-s" : "nsl-soft";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={W} H={H} />}

      {/* A soft local shade where the type sits and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      {sideShade && <div style={{ position: "absolute", left: 0, right: 0, ...sideShade }} />}
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The sweep: the whole block turned −7° about its bottom-left corner. */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `rotate(${ANGLE}deg)`, transformOrigin: `${left}px ${pivotY}px` }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
          <defs>
            <filter id={fid} x="-10%" y="-40%" width="120%" height="180%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
              <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
            </filter>
          </defs>
          <g filter={`url(#${fid})`} fill="#ffffff">
            <text x={left - size * 0.03} y={baseline} style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: size, letterSpacing: "0.005em" }}>
              {word}
            </text>
            <rect x={left} y={ruleTop} width={wordW} height={ruleH} />
          </g>
        </svg>
        {placed.map((l) => (
          <div
            key={l.text}
            style={{ position: "absolute", left: left + 2 * k, top: l.top, fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity ?? 1, color: "#ffffff", textShadow: SMALL_SHADOW }}
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
 * Natural · slant (matchday): his own match photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: a sports-broadcast sweep set on a gentle −7° slant: "MATCHDAY" in big
 * bold condensed caps, a thin rule, then HOME v AWAY (exact names, home first) and date · kick-off small.
 * The NEYOD logo alone.
 */
export function Natslant({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").replace(/’/g, "'").trim().toUpperCase();
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()}  v  ${fx.awayName.toUpperCase()}` : (fx.homeName || fx.awayName).toUpperCase();
  const pt = data.content.timePt && data.content.timePt !== fx.time ? `${data.content.timePt} ${data.content.timeRef || "PT"}` : "";
  const when = [fx.date, fx.time, pt].filter(Boolean).join("  ·  ");
  return (
    <NatSlantFrame
      data={data}
      word={word}
      lines={[
        { text: match, size: 28, weight: 800, tracking: 0.1 },
        { text: when, size: 23, weight: 700, tracking: 0.22, opacity: 0.92 },
      ]}
    />
  );
}
