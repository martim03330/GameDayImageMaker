/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const BODONI = "var(--font-bodoni), 'Didot', serif";

/**
 * The shared frame of the "mixed scale" natural looks (reference: Liga Portugal's "Homem do Jogo" — a small
 * italic serif over a huge one, the player's head over the title): his real photo full-bleed; "it's" in
 * small italic Bodoni, then the word huge in upright Bodoni caps, set between the photo and the sharp
 * cutout so his head overlaps the lower part of the letters (always readable). Goals set it in front of
 * him, low over the foot's shade: a raised fist covered the letters. At the foot two quiet lines
 * over a soft shade, the crest(s); the NEYOD logo at the top.
 */
function NatMixFrame({ data, small, word, lines, crests, overlap }: { data: RenderData; small: string; word: string; lines: string[]; crests: (string | null)[]; /** His head over the title; off for goals, where a raised fist covered the letters. */ overlap: boolean }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 590,
    fs: story ? 250 : 155,
  });
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  // Bodoni caps advance ~0.74 em: the word fills the width, never over ~280px tall.
  const size = Math.min((CANVAS_W - 90) / Math.max(1, word.length * 0.74), story ? 300 : 240) * ts;
  const hairTop = place.fy - place.fs * 0.75;
  const sPx = size * 0.3;
  const footBottom = story ? STORY_BOTTOM : H - 50;
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 160) / Math.max(1, ...lines.map((l) => capsEm(l, 0.2))));
  const crest = Math.round(46 * k);
  const linesH = lines.filter(Boolean).length * lPx * 1.6;
  const crestTop = footBottom - linesH - 18 * k - crest;
  // With overlap the title sits behind him, his head over its lower part; without (goals: a raised fist
  // covered the letters and his head was often already at the top) it sits in front, low, over the shade.
  const baseline =
    (overlap ? Math.max(hairTop + size * 0.3, logoTop + (story ? 88 : 52) + 70 + size * 0.95) : crestTop - 34 * k) + (params.textY ?? 0);
  const shadeTop = overlap ? crestTop - (story ? 260 : 200) : baseline - size * 1.5;
  const title = (
    <svg width={CANVAS_W} height={size * 1.5} style={{ position: "absolute", left: 0, top: baseline - size * 1.25, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="nmx-soft" x="-10%" y="-40%" width="120%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.32" />
            <feDropShadow dx="0" dy="8" stdDeviation="20" floodColor="#000" floodOpacity="0.38" />
          </filter>
        </defs>
        <g filter="url(#nmx-soft)" style={{ fill: "#ffffff" }}>
          <text x={CANVAS_W / 2} y={size * 0.25} textAnchor="middle" style={{ fontFamily: BODONI, fontStyle: "italic", fontWeight: 500, fontSize: sPx }}>
            {small}
          </text>
          <text x={CANVAS_W / 2} y={size * 1.25} textAnchor="middle" style={{ fontFamily: BODONI, fontWeight: 700, fontSize: size, letterSpacing: "-0.01em" }}>
            {word}
          </text>
        </g>
      </svg>
  );
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {overlap && title}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.5) 45%, rgba(6,10,6,.72))" }} />
      {!overlap && title}
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crest, display: "flex", justifyContent: "center", gap: 16 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ width: crest, height: crest, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: footBottom - linesH, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.6, letterSpacing: "0.2em", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
        {lines.filter(Boolean).map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · escala mista (matchday): "it's" small italic over "MATCHDAY" huge, his head over it; HOME v AWAY and date · time · venue at the foot, both crests. */
export function Natmix({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatMixFrame
      data={data}
      small="it's"
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      lines={[`${fx.homeName} v ${fx.awayName}`.toUpperCase(), fx.line.toUpperCase()]}
      crests={[fx.homeCrest, fx.awayCrest]}
      overlap
    />
  );
}

/** Natural goal · escala mista: "what a" small italic over "GOAL" huge, his celebrating head over it; his name and his club's exact name at the foot, his crest. No score. */
export function Goalnatmix({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatMixFrame
      data={data}
      small="what a"
      word={(data.content.kicker || "GOAL").toUpperCase()}
      lines={[name.toUpperCase(), ourClub(data).toUpperCase()]}
      crests={[data.content.home === false ? fx.awayCrest : fx.homeCrest]}
      overlap={false}
    />
  );
}
