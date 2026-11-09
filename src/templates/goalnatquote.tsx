/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natPlace, type NatPlace } from "./natkit";
import { NAT_SERIF, sentenceWord, serifEm } from "./natserif";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** DM Serif Display: cap height and descender (em). */
const CAP = 0.7;
const DESC = 0.24;
/** The opening quote mark's ink in DM Serif Display: top and bottom above the baseline (em). */
const Q_TOP = 0.72;
const Q_BOT = 0.45;

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

/** Serif text over the photo in white with the natural looks' double shadow. */
function SerifText({ text, size, x, baseline, id, opacity = 1 }: { text: string; size: number; x: number; baseline: number; id: string; opacity?: number }) {
  return (
    <svg width={CANVAS_W} height={size * 1.4} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
      <defs>
        <filter id={id} x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.34" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>
      <text x={x} y={size} filter={`url(#${id})`} style={{ fontFamily: NAT_SERIF, fontWeight: 400, fontSize: size, letterSpacing: "-0.01em", fill: "#ffffff", fillOpacity: opacity }}>
        {text}
      </text>
    </svg>
  );
}

/**
 * Natural goal · quote: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one editorial idea: a pull-quote. A huge serif opening quote mark (DM Serif Display, white at
 * 85%), then "Goal." in the same serif, big, and under it, small sans, the attribution "— Moisés Conceição,
 * SC Vianense SAD" (exact club name). In the clear upper area, left-aligned; his face below it. No score. The
 * NEYOD logo alone at the foot (or the top corner when the quote has to drop to the foot).
 */
export function Goalnatquote({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  const word = sentenceWord(content.kicker, "Goal");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const club = ourClub(data);
  const attrib = `— ${[name, club].filter(Boolean).join(", ")}`;

  /* ---- sizes: quote mark ~300px, the word big, the attribution small; his face below the quote ---- */
  const topInk = (story ? STORY_TOP + 8 : 70) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const layout = (sc: number, fixed?: NatPlace) => {
    const q = (story ? 380 : 300) * ts * sc;
    const size = Math.min((story ? 250 : 200) * ts * sc, (maxW + 8) / Math.max(1, serifEm(word)));
    // Inter 600 sentence case ≈ 0.55em per character.
    const ap = Math.min((story ? 36 : 28) * ts, maxW / Math.max(1, [...attrib].length * 0.55));
    const qInk = q * (Q_TOP - Q_BOT);
    const qGap = 22 * k * sc;
    const under = 26 * k;
    /** Quote ink top to the attribution's bottom. */
    const blockH = qInk + qGap + size * (CAP + DESC) + under + ap;
    const place: NatPlace = fixed ?? natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 720 : 520, topInk + blockH + 56 + fs * 0.75), fs });
    const upper = place.fy - place.fs * 0.8 >= topInk + blockH + 44 * k;
    return { q, size, ap, qInk, qGap, under, blockH, place, upper };
  };
  /* ---- full size at the top; a little smaller (same photo framing) when his head is high; else the full quote at the foot ---- */
  const big = layout(1);
  const smaller = [0.9, 0.8, 0.72].map((sc) => (big.upper ? big : layout(sc, big.place))).find((l) => l.upper);
  const { q, size, ap, qInk, qGap, under, blockH, place, upper } = smaller ?? big;

  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const inkTop = upper ? topInk : footBottom - blockH;
  const qBase = inkTop + q * Q_TOP;
  const capTop = inkTop + qInk + qGap;
  const baseline = capTop + size * CAP;
  const attribTop = baseline + size * DESC + under;
  const typeBottom = inkTop + blockH;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - inkTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <SerifText text={"“"} size={q} x={M - q * 0.04} baseline={qBase} opacity={0.85} id={story ? "nq-mark-s" : "nq-mark"} />
      <SerifText text={word} size={size} x={M} baseline={baseline} id={story ? "nq-word-s" : "nq-word"} />
      <div style={{ position: "absolute", left: M + 4 * k, top: attribTop, fontFamily: SANS, fontWeight: 600, fontSize: ap, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap", color: "#ffffff", textShadow: SMALL_SHADOW }}>
        {attrib}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}
