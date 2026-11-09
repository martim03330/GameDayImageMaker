/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The engine of the four NATURAL "big element behind him" looks (natcrest / natnumber / goalnatcrest /
 * goalnatnumber), natword's structure: his own match photo full-bleed (light grade only), then ONE big
 * element in pure white with natword's tight + wide shadows — his club crest as a white silhouette, or his
 * shirt number in Anton — then the sharp cutout laid exactly over him, his head over the element's lower
 * part only. Matchday: a small spaced "MATCHDAY" tag over the fixture foot. Goal: the kicker small and
 * spaced above the element, his name (and, for the crest look, the two crests with "v") at the foot; no score.
 * No crest / no number → the word (MATCHDAY or the kicker) behind him, as natword.
 */

/** Anton advance widths of 0–9 per 100px (measured, as in heromatch.tsx). */
const DIGITS = "49 33 49 49 49 49 49 49 49 49".split(" ").map(Number);
const anton = FACES.anton;
function textEm(text: string): number {
  let em = 0;
  for (const ch of text) em += /[0-9]/.test(ch) ? DIGITS[Number(ch)] / 100 : wordEm(anton, ch);
  return em;
}

/** natword's shadows: a tight one that outlines the white and a wide soft one (reads on light grounds too). */
function Shadows({ id, opacity = 1 }: { id: string; opacity?: number }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
      {opacity < 1 && <feColorMatrix type="matrix" values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`} />}
      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
      <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
    </filter>
  );
}

/** natword's tight + wide shadows, for the small type over busy shirts and stands. */
const SH = "0 1px 3px rgba(0,0,0,.42), 0 4px 18px rgba(0,0,0,.5)";

export type BehindKind = "crest" | "number";

export function NatBehind({ data, kind, goal }: { data: RenderData; kind: BehindKind; goal: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const W = CANVAS_W;
  const uid = `nb-${kind}-${goal ? "g" : "m"}`;

  /* ---- what goes behind him ---- */
  const crestUrl = kind === "crest" ? (data.club?.crestUrl ?? null) : null;
  const number = kind === "number" ? (data.player?.number ?? "").replace(/\D/g, "").slice(0, 2) : "";
  const el: "crest" | "number" | "word" = crestUrl ? "crest" : number ? "number" : "word";
  const kicker = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'").trim();

  /* ---- the photo, his face placed ---- */
  const place = natPlace(data, W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: el === "word" ? (story ? 640 : 530) : story ? 900 : 630,
    fs: story ? 250 : 158,
  });

  /* ---- the top: logo, (goal) the kicker, then the element ---- */
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const kickSize = Math.min(22 * k * ts, 640 / Math.max(1, capsEm(kicker, 0.6)));
  const kickGap = story ? 34 : 24;
  const showKick = goal && el !== "word";
  const topLimit = logoTop + logoH + (story ? 70 : 56) + (showKick ? kickSize + kickGap : 0);
  // His head over the element's lower part only: its foot a little under his face's centre.
  const want = place.fy + place.fs * 0.18 + (params.textY ?? 0);
  const maxH = (el === "crest" ? (story ? 640 : 500) : story ? 660 : 500) * ts;
  const minH = (story ? 400 : 300) * ts;
  const elH = Math.max(minH, Math.min(maxH, want - topLimit));
  const bottom = Math.max(want, topLimit + elH);
  const top = bottom - elH;
  // Centred over his shoulders, kept inside the margins.
  const M = 60;

  // Crest: a square box (crests are stored ~square, transparent around).
  const crestS = elH;
  const crestL = Math.max(M, Math.min(W - M - crestS, place.fx - crestS / 2));
  // Number: Anton figures, cap height = elH (narrower canvas wins).
  const numEm = Math.max(0.3, textEm(number));
  const numSize = Math.min(elH / anton.cap, (W - 2 * M) / numEm);
  const numW = numSize * numEm;
  const numCx = Math.max(M + numW / 2, Math.min(W - M - numW / 2, place.fx));
  // Word fallback (natword): pinned to the width, his head over its lower half.
  const word = goal ? kicker : "MATCHDAY";
  const wSize = Math.min((W - 70) / Math.max(0.5, wordEm(anton, word)), (story ? 300 : 250) / anton.cap) * ts;
  const wBase = Math.max(place.fy + place.fs * 0.12, logoTop + logoH + 60 + wSize * anton.cap) + (params.textY ?? 0);

  const elCx = el === "crest" ? crestL + crestS / 2 : el === "number" ? numCx : W / 2;
  const elTop = el === "word" ? wBase - wSize * anton.cap : el === "number" ? bottom - numSize * anton.cap : top;

  /* ---- the foot, bottom-up ---- */
  const fx = natFixture(data);
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 50;
  let foot: ReactNode;
  let footTop: number;
  const crestImg = (url: string | null, s: number) =>
    url ? <img src={url} alt="" style={{ width: s, height: s, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  if (!goal) {
    const line = fx.line;
    const lineSize = Math.min(15 * k * ts, (W - 140) / Math.max(1, capsEm(line, 0.24)));
    const lineTop = footBottom - lineSize;
    const crest = Math.round(40 * k);
    const fixture = `${fx.homeName.toUpperCase()} v ${fx.awayName.toUpperCase()}`;
    const fixSize = Math.min(20 * k * ts, (W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
    const rowTop = (line ? lineTop - 20 * k : footBottom) - crest;
    const tagSize = 12.5 * k * ts;
    const showTag = el !== "word";
    const tagTop = rowTop - 22 * k - tagSize;
    footTop = showTag ? tagTop : rowTop;
    foot = (
      <>
        {showTag && (
          <div style={{ position: "absolute", left: 0, right: 0, top: tagTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k, textShadow: SH }}>
            <div style={{ width: 34 * k, height: 1.5 * k, background: OFF_WHITE, opacity: 0.7 }} />
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tagSize, lineHeight: 1, letterSpacing: "0.5em", paddingLeft: "0.5em", whiteSpace: "nowrap", opacity: 0.92 }}>{kicker}</div>
            <div style={{ width: 34 * k, height: 1.5 * k, background: OFF_WHITE, opacity: 0.7 }} />
          </div>
        )}
        <div style={{ position: "absolute", left: 50, right: 50, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
          {crestImg(fx.homeCrest, crest)}
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: SH }}>
            {fx.homeName.toUpperCase()}
            <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
            {fx.awayName.toUpperCase()}
          </div>
          {crestImg(fx.awayCrest, crest)}
        </div>
        {line && (
          <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", opacity: 0.9, textShadow: SH }}>
            {line}
          </div>
        )}
      </>
    );
  } else {
    // Goal: his name, then (crest look) the two crests with "v".
    const first = (content.firstName || "").toUpperCase().trim();
    const last = (content.lastName || "").toUpperCase().trim();
    const name = [first, last].filter(Boolean).join(" ");
    const nameSize = Math.min(30 * k * ts, (W - 140) / Math.max(1, capsEm(name, 0.22)));
    const withCrests = kind === "crest" && !!(fx.homeCrest || fx.awayCrest);
    const crest = Math.round(38 * k);
    const crestTop = footBottom - crest;
    const nameTop = (withCrests ? crestTop - 26 * k : footBottom) - nameSize;
    footTop = nameTop;
    foot = (
      <>
        {name && (
          <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.22em", paddingLeft: "0.22em", whiteSpace: "nowrap", textShadow: SH }}>
            {first && <span style={{ fontWeight: 400 }}>{first} </span>}
            <span style={{ fontWeight: 800 }}>{last}</span>
          </div>
        )}
        {withCrests && (
          <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
            {crestImg(fx.homeCrest, crest)}
            <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 16 * k * ts, lineHeight: 1, opacity: 0.85, textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>v</div>
            {crestImg(fx.awayCrest, crest)}
          </div>
        )}
      </>
    );
  }
  const shadeTop = footTop - (story ? 300 : 230);

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />

      {/* The element, behind him. */}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <Shadows id={`${uid}-sh`} />
          {/* The crest as a white silhouette (brightness(0) invert(1)) at ~0.9, then the shadows. */}
          <filter id={`${uid}-crest`} x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
            {/* White, with the crest's own drawing kept as a faint grey engraving (a plain white blob loses the club). */}
            <feColorMatrix in="SourceGraphic" type="matrix" values="0.025 0.086 0.009 0 0.88  0.025 0.086 0.009 0 0.88  0.025 0.086 0.009 0 0.88  0 0 0 0.92 0" />
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        {el === "crest" && <image href={crestUrl!} x={crestL} y={top} width={crestS} height={crestS} preserveAspectRatio="xMidYMax meet" filter={`url(#${uid}-crest)`} />}
        {el === "number" && (
          <text x={numCx} y={bottom} textAnchor="middle" filter={`url(#${uid}-sh)`} style={{ fontFamily: anton.family, fontWeight: anton.weight, fontSize: numSize, fill: "#ffffff" }}>
            {number}
          </text>
        )}
        {el === "word" && (
          <text x={W / 2} y={wBase} textAnchor="middle" filter={`url(#${uid}-sh)`} style={{ fontFamily: anton.family, fontWeight: anton.weight, fontSize: wSize, fill: "#ffffff" }}>
            {word}
          </text>
        )}
      </svg>

      {/* He steps in front of it: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={W} H={H} />

      {/* Soft local shade where the type sits — top for the logo, foot for the fixture / name. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 260 : 190), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.42) 40%, rgba(6,10,6,.68) 75%, rgba(6,10,6,.72))" }} />

      {/* Goal: the kicker, small and wide-spaced, above the element. */}
      {showKick && (
        <div style={{ position: "absolute", left: elCx - 400, width: 800, top: elTop - kickGap - kickSize, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.6em", paddingLeft: "0.6em", whiteSpace: "nowrap", textShadow: SH }}>
          {kicker}
        </div>
      )}

      {foot}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
