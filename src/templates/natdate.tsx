/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · date behind (matchday): natword's structure with the DATE as the big element — his own match
 * photo full-bleed (real grass, stands and light, light grade only), "21 OCT" huge in off-white between the
 * photo's background and him, the sharp cutout laid exactly over his figure so his shoulders cross the
 * figures.
 * His head crosses only the lower third of the figures, so the date stays legible. At the foot,
 * over a soft local shade: "MATCHDAY" as a small spaced tag, the crests either side of HOME v AWAY (exact
 * names), then kick-off · venue. NEYOD logo alone at the top. No date known → the word is "MATCHDAY".
 */

/** Anton advance widths of 0–9 and the colon per 100px (measured, as in heromatch.tsx). */
const DIGITS = "49 33 49 49 49 49 49 49 49 49 24".split(" ").map(Number);
const face = FACES.anton;
function textEm(text: string): number {
  let em = 0;
  const letters = [...text];
  for (const ch of letters) em += /[0-9:]/.test(ch) ? DIGITS["0123456789:".indexOf(ch)] / 100 : wordEm(face, ch);
  return em;
}

export function Natdate({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  const fx_ = natFixture(data);
  const isDate = !!fx_.date;

  /* ---- the photo, his face placed ---- */
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 800 : 540,
    fs: story ? 250 : 158,
  });

  /* ---- the word: the date, as big as fits; his head in the day/month gap where it can be ---- */
  const word = isDate ? fx_.date : (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const em = Math.max(0.5, textEm(word));
  const M = 36;
  const capMax = (isDate ? (story ? 400 : 300) : story ? 300 : 250) / face.cap;
  const full = Math.min((CANVAS_W - 2 * M) / em, capMax);
  const size = full * ts;
  const left = (CANVAS_W - size * em) / 2;
  const cap = size * face.cap;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  // His head crosses only the lower third of the figures: the date stays legible above it.
  const headTop = place.fy - place.fs * 0.78;
  const baseline = Math.max(isDate ? headTop + cap * 0.36 : place.fy + place.fs * 0.12, logoTop + (story ? 88 : 52) + (story ? 70 : 56) + cap) + (params.textY ?? 0);

  /* ---- the foot, bottom-up ---- */
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 50;
  const line = (isDate ? fx_.line.split("  ·  ").filter((b) => b !== fx_.date) : fx_.line.split("  ·  ")).filter(Boolean).join("  ·  ");
  const lineSize = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.24)));
  const lineTop = footBottom - lineSize;
  const crest = Math.round(40 * k);
  const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
  const fixSize = Math.min(20 * k * ts, (CANVAS_W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
  const rowTop = (line ? lineTop - 20 * k : footBottom) - crest;
  const tagSize = 12.5 * k * ts;
  const tagTop = rowTop - 22 * k - tagSize;
  const shadeTop = tagTop - (story ? 300 : 230);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* The date, behind him. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="nd-soft" x="-10%" y="-30%" width="120%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="16" floodColor="#000" floodOpacity="0.22" />
          </filter>
        </defs>
        <text x={left} y={size} filter="url(#nd-soft)" style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: OFF_WHITE, opacity: 0.96, whiteSpace: "pre" }}>
          {word}
        </text>
      </svg>

      {/* He steps in front of it: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* Soft local shade where the type sits — top for the logo, foot for the fixture. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 260 : 190), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.42) 40%, rgba(6,10,6,.68) 75%, rgba(6,10,6,.72))" }} />

      {/* The fixture foot. */}
      {isDate && (
        <div style={{ position: "absolute", left: 0, right: 0, top: tagTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k, textShadow: "0 1px 6px rgba(0,0,0,.4)" }}>
          <div style={{ width: 34 * k, height: 1.5 * k, background: OFF_WHITE, opacity: 0.7 }} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tagSize, lineHeight: 1, letterSpacing: "0.5em", paddingLeft: "0.5em", whiteSpace: "nowrap", opacity: 0.92 }}>
            {(content.kicker || "MATCHDAY").toUpperCase()}
          </div>
          <div style={{ width: 34 * k, height: 1.5 * k, background: OFF_WHITE, opacity: 0.7 }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 50, right: 50, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
        {crestImg(fx_.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,.45)" }}>
          {fx_.homeName.toUpperCase()}
          <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
          {fx_.awayName.toUpperCase()}
        </div>
        {crestImg(fx_.awayCrest)}
      </div>
      {line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", opacity: 0.9, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
          {line}
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
