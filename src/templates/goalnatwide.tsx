/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WORD_SHADOW = "0 0 2px rgba(0,0,0,.4), 0 2px 5px rgba(0,0,0,.42), 0 6px 30px rgba(0,0,0,.45)";
const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";
/** At the foot (over his kit) the small lines get a denser halo. */
const FOOT_SHADOW = "0 0 3px rgba(0,0,0,.75), 0 1px 4px rgba(0,0,0,.7), 0 2px 18px rgba(0,0,0,.65)";
/** Inter cap height (em). */
const CAP = 0.73;

/**
 * Natural goal · wide: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: "G O A L" in a light Inter (weight 300) with very wide tracking, its
 * letters spread across ~90% of the width, in the clear area above him; his full name and his club's exact
 * name small, centred under it. When the photo has no headroom the word runs across the foot instead. No
 * score. The NEYOD logo alone.
 */
export function Goalnatwide({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 70 : 60;
  const maxW = CANVAS_W - 2 * M;

  const word = (content.kicker || "GOAL").toUpperCase().replace(/[’.!]/g, "").trim();
  const letters = [...word.replace(/\s+/g, "")];
  const spanW = CANVAS_W * 0.9;
  // Light caps, big enough to read at Instagram size; shrink for longer words so the letters keep air.
  const size = Math.min((story ? 190 : 150) * ts, (spanW / Math.max(1, letters.length)) * 0.95);
  const capH = size * CAP;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const smalls = [
    { text: name, size: 26, weight: 700, tracking: 0.16, opacity: 1 },
    { text: club, size: 20, weight: 600, tracking: 0.26, opacity: 0.92 },
  ]
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, maxW / Math.max(1, capsEm(l.text, l.tracking))) }));
  const gap = 12 * k;
  const under = 30 * k;
  const smallH = smalls.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = capH + (smalls.length ? under + smallH : 0);

  /* ---- his face below the type (hair ~0.8 face-heights above its centre) ---- */
  const topY = (story ? STORY_TOP + 10 : 84) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: Math.max(story ? 680 : 490, topY + blockH + 60 + fs * 0.75),
    fs,
  });
  const upper = place.fy - place.fs * 0.8 >= topY + blockH + 24;
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 54) - (params.textY ?? 0);
  const top = upper ? topY : footBottom - blockH;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = (upper ? (story ? STORY_BOTTOM : CANVAS_H - 50) - logoH : story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: top + blockH + (story ? 220 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,.22) 55%, rgba(0,0,0,0))" }
    : (() => {
        // At the foot the thin letters often cross his kit (white shorts): the shade stays dense over the
        // whole type block and only fades above it.
        const h = H - top + (story ? 260 : 200);
        const solid = Math.round(((H - top + 10) / h) * 100);
        return { bottom: 0, height: h, background: `linear-gradient(to top, rgba(0,0,0,.68), rgba(0,0,0,.56) ${solid}%, rgba(0,0,0,0))` };
      })();
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };

  let y = top + capH + under;
  const placed = smalls.map((l) => {
    const t = y;
    y += l.px + gap;
    return { ...l, top: t };
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* A soft local shade under the type and under the logo — nothing else touches the photo. */}
      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      {/* The word: light caps, letters spread edge to edge across ~90% of the width. */}
      <div
        style={{ position: "absolute", left: (CANVAS_W - spanW) / 2, width: spanW, top: top - size * (0.97 - CAP), height: size * 1.2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontFamily: SANS, fontWeight: 300, fontSize: size, lineHeight: 1.2, color: "#ffffff", textShadow: WORD_SHADOW }}
      >
        {letters.map((ch, i) => (
          <span key={i} style={{ display: "block" }}>
            {ch}
          </span>
        ))}
      </div>

      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: 0, right: 0, top: l.top, textAlign: "center", fontFamily: SANS, fontWeight: l.weight, fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, paddingLeft: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity, textShadow: upper ? SMALL_SHADOW : FOOT_SHADOW }}
        >
          {l.text}
        </div>
      ))}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: logoLeft, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}
