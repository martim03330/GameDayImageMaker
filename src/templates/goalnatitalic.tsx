/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Barlow Condensed ExtraBold Italic: cap height / ascender (em) and the slant's overhang at the top right. */
const CAP = 0.72;
const DESC = 0.06;

/** Rough advance of a word in Barlow Condensed 800 italic at 1px. */
function condEm(text: string): number {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) {
    if (/[MW]/.test(ch)) em += 0.66;
    else if (/[A-Z]/.test(ch)) em += 0.48;
    else if (/[mw]/.test(ch)) em += 0.7;
    else if (/[iljtf!.,']/.test(ch)) em += 0.24;
    else if (/[a-z0-9]/.test(ch)) em += 0.46;
    else if (ch === " ") em += 0.2;
    else em += 0.3;
  }
  return em;
}

/** "GOAL" (or the kicker as typed) in sentence case with an exclamation mark: "Goal!". */
function bangWord(kicker: string | undefined): string {
  const raw = (kicker || "Goal").replace(/’/g, "'").trim().replace(/[.!]+$/, "");
  const low = raw === raw.toUpperCase() ? raw.toLowerCase() : raw;
  return `${low.charAt(0).toUpperCase()}${low.slice(1)}!`;
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

/**
 * Natural goal · italic: his real celebration photo full-bleed (real grass, stands, light — light grade only)
 * and one idea: "Goal!" in a big heavy condensed sans ITALIC (Barlow Condensed ExtraBold Italic), pure white
 * with the natural looks' double shadow, over the clear upper area on the left margin; under it, small, his
 * full name (same italic) and his club's exact name. No score. His face below the word (his hair never under
 * it), the NEYOD logo alone at the foot. No headroom in the photo: the type goes to the lower-left over the
 * grass and the logo to the top corner away from his head.
 */
export function Goalnatitalic({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 76 : 66;
  const maxW = CANVAS_W - 2 * M;

  const word = bangWord(content.kicker);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();

  /* ---- the word as big as the band allows; the small lines fitted to the width ---- */
  const size = Math.min((story ? 360 : 290) * ts, (maxW - 20) / Math.max(1, condEm(word)));
  const nameEm = condEm(name) + [...name].length * 0.05;
  const lines = [
    { text: name, px: Math.min(36 * k * ts, maxW / Math.max(1, nameEm)), font: CONDENSED, weight: 700, tracking: 0.05, italic: true, opacity: 1 },
    { text: club, px: Math.min(19 * k * ts, maxW / Math.max(1, capsEm(club, 0.22))), font: SANS, weight: 700, tracking: 0.22, italic: false, opacity: 0.92 },
  ].filter((l) => l.text);
  const gap = 12 * k;
  const under = 26 * k;
  const linesH = lines.reduce((h, l, i) => h + l.px + (i ? gap : 0), 0);
  const blockH = size * (CAP + DESC) + (lines.length ? under + linesH : 0);

  /* ---- upper layout: type at the top, his face below it ---- */
  const topCap = (story ? STORY_TOP + 8 : 80) - (params.textY ?? 0);
  const fs = story ? 236 : 150;
  const fx0 = params.side === "left" ? 430 : params.side === "right" ? 650 : 540;
  const place: NatPlace = natPlace(data, CANVAS_W, H, { fx: fx0, fy: Math.max(story ? 690 : 500, topCap + blockH + 56 + fs * 0.75), fs });
  const hairTop = place.fy - place.fs * 0.8;
  const upper = hairTop >= topCap + blockH + 24;

  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);
  const capTop = upper ? topCap : footBottom - blockH;
  const baseline = capTop + size * CAP;
  let y = baseline + size * DESC + under;
  const placed = lines.map((l) => {
    const top = y;
    y += l.px + gap;
    return { ...l, top };
  });
  const typeBottom = capTop + blockH;

  const logoTop = upper ? (story ? STORY_BOTTOM - logoH : CANVAS_H - 50 - logoH) - (params.logoY ?? 0) : (story ? STORY_TOP : 50) - (params.logoY ?? 0);
  const logoLeft = upper ? (CANVAS_W - logoW) / 2 : place.fx > CANVAS_W / 2 ? M : CANVAS_W - M - logoW;

  const typeShade = upper
    ? { top: 0, height: typeBottom + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,.24) 55%, rgba(0,0,0,0))" }
    : { bottom: 0, height: H - capTop + (story ? 260 : 200), background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,.3) 50%, rgba(0,0,0,0))" };
  const logoShade = upper
    ? { bottom: 0, height: H - logoTop + (story ? 200 : 140), background: "linear-gradient(to top, rgba(0,0,0,.3), rgba(0,0,0,0))" }
    : { top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" };
  const fid = story ? "gni-soft-s" : "gni-soft";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, ...typeShade }} />
      <div style={{ position: "absolute", left: 0, right: 0, ...logoShade }} />

      <svg width={CANVAS_W} height={size * 1.3} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={fid} x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text x={M - size * 0.03} y={size} filter={`url(#${fid})`} style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: size, letterSpacing: "-0.01em", fill: "#ffffff" }}>
          {word}
        </text>
      </svg>

      {placed.map((l) => (
        <div
          key={l.text}
          style={{ position: "absolute", left: M + 4 * k, top: l.top, fontFamily: l.font, fontWeight: l.weight, fontStyle: l.italic ? "italic" : "normal", fontSize: l.px, lineHeight: 1, letterSpacing: `${l.tracking}em`, whiteSpace: "nowrap", opacity: l.opacity, color: "#ffffff", textShadow: SMALL_SHADOW }}
        >
          {l.text}
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
