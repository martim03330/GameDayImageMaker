/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · word behind (matchday): his own match photo full-bleed — real grass, stands and light, only a
 * light grade — with "MATCHDAY" huge in off-white set between the photo's background and him: the photo,
 * then the word, then the sharp cutout laid exactly over his figure, so the top of his head overlaps the lower
 * third of the letters (the word always stays readable). At the foot, over a soft local shade on the grass, a quiet fixture line: crests either side of
 * HOME v AWAY (exact names), then date · kick-off · venue. The NEYOD logo alone at the top.
 */
export function Natword({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  /* ---- the photo, his face placed ---- */
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 700 : 540,
    fs: story ? 262 : 158,
  });

  /* ---- the word, pinned to the width, his head over its lower half ---- */
  const face = FACES.anton;
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const size = Math.min((CANVAS_W - 70) / Math.max(0.5, wordEm(face, word)), (story ? 300 : 250) / face.cap) * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  // The word stays readable: it sits above his head, which only overlaps its lower third (the hair's top is
  // ~0.75 face-heights above the face centre). Never closer to the logo than its clear space.
  const hairTop = place.fy - place.fs * 0.75;
  const baseline = Math.max(hairTop + size * face.cap * 0.34, logoTop + (story ? 88 : 52) + 60 + size * face.cap) + (params.textY ?? 0);

  /* ---- the foot, bottom-up ---- */
  const fx_ = natFixture(data);
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 50;
  const lineSize = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(fx_.line, 0.24)));
  const lineTop = footBottom - lineSize;
  const crest = Math.round(44 * k);
  const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
  const fixSize = Math.min(20 * k * ts, (CANVAS_W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
  const rowTop = lineTop - (fx_.line ? 20 * k : 0) - crest;
  const shadeTop = rowTop - (story ? 320 : 250);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* The word, behind him. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="nw-soft" x="-10%" y="-40%" width="120%" height="180%">
            {/* A tight shadow that outlines the letters and a wide soft one: the word stands out on light grounds too. */}
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text x={CANVAS_W / 2} y={size} textAnchor="middle" filter="url(#nw-soft)" style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "#ffffff" }}>
          {word}
        </text>
      </svg>

      {/* He steps in front of it: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* Soft local shade where the type sits — top for the logo, foot for the fixture. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 260 : 190), background: "linear-gradient(to bottom, rgba(0,0,0,.32), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.42) 40%, rgba(6,10,6,.7) 75%, rgba(6,10,6,.74))" }} />

      {/* The fixture foot. */}
      <div style={{ position: "absolute", left: 50, right: 50, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
        {crestImg(fx_.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,.45)" }}>
          {fx_.homeName.toUpperCase()}
          <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
          {fx_.awayName.toUpperCase()}
        </div>
        {crestImg(fx_.awayCrest)}
      </div>
      {fx_.line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", opacity: 0.9, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
          {fx_.line}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
