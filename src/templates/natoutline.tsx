/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · outline (matchday): his own match photo full-bleed — real grass, stands and light, only a light
 * grade — with "MATCHDAY" across the stands above him as OUTLINE-only letters (a thin white stroke, no fill),
 * set between the photo and him: his sharp cutout in front overlaps only the word's lower edge, so it always
 * reads. At the foot, over a soft local shade on the grass, a quiet fixture: crests either side of
 * HOME v AWAY (exact names), then date · kick-off · venue, and the NEYOD logo under it.
 */
export function Natoutline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  /* ---- the photo, his face placed ---- */
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 640 : 540,
    fs: story ? 262 : 158,
  });

  /* ---- the foot, bottom-up: the NEYOD logo, then the fixture above it ---- */
  const fx_ = natFixture(data);
  const logoAsk = 24;
  const logoPost = Math.max(52, Math.round(logoAsk * 2)); // as AgencyLogo draws it
  const logoPx = story ? Math.max(88, Math.round(logoPost * 1.7)) : logoPost;
  const logoTop = (story ? STORY_BOTTOM : CANVAS_H - 44) - logoPx - (params.logoY ?? 0);
  const lineSize = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(fx_.line, 0.24)));
  const lineTop = logoTop - (story ? 64 : 56) - lineSize;
  const crest = Math.round(44 * k);
  const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
  const fixSize = Math.min(20 * k * ts, (CANVAS_W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
  const rowTop = (fx_.line ? lineTop - 20 * k : lineTop + lineSize) - crest;
  const shadeTop = rowTop - (story ? 300 : 230);

  /* ---- the word, across the top, his head over its lower edge only ---- */
  const face = FACES.anton;
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const em = Math.max(0.5, wordEm(face, word));
  const M = 46;
  let size = Math.min((CANVAS_W - 2 * M) / em, (story ? 300 : 250) / face.cap) * ts;
  const minTop = story ? STORY_TOP : 64;
  // Generous for full hair: the top of his head is ~0.95 face-heights above the face centre. He may cover
  // at most the lower quarter of the letters.
  const hairTop = place.fy - place.fs * 0.95;
  const over = 0.25;
  let anchor: "middle" | "start" | "end" = "middle";
  let x = CANVAS_W / 2;
  let baseline = hairTop + size * face.cap * over;
  if (baseline < minTop + size * face.cap) {
    // His head rides high: a smaller word still fits above it…
    const fit = (hairTop - minTop) / (face.cap * (1 - over));
    if (fit >= size * 0.62) {
      size = fit;
      baseline = minTop + size * face.cap;
    } else {
      // …or else the word moves beside his head, on the wider side, at the top.
      const headL = place.fx - place.faceW * 1.35;
      const headR = place.fx + place.faceW * 1.35;
      const left = headL - 30 - M;
      const right = CANVAS_W - M - (headR + 30);
      const room = Math.max(left, right);
      size = Math.min(size, room / em);
      baseline = minTop + size * face.cap;
      if (left >= right) {
        anchor = "end";
        x = headL - 30;
      } else {
        anchor = "start";
        x = headR + 30;
      }
    }
  }
  baseline += params.textY ?? 0;

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* The word, outline only, behind him. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="no-soft" x="-10%" y="-40%" width="120%" height="180%">
            {/* A tight shadow that outlines the letters and a wide soft one: the word stands out on light grounds too. */}
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text
          x={x}
          y={size}
          textAnchor={anchor}
          filter="url(#no-soft)"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "none", stroke: "#ffffff", strokeWidth: story ? 3.6 : 3, strokeLinejoin: "round" }}
        >
          {word}
        </text>
      </svg>

      {/* He steps in front of it: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* Soft local shade where the type sits — behind the word, and the foot for the fixture and logo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: baseline + 60, background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,.14) 60%, rgba(0,0,0,0))" }} />
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
