/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural · vertical (matchday): his own match photo as it is (real grass, stands and light, light grade
 * only), "MATCHDAY" set vertically — turned 90°, reading bottom-to-top — huge along the free side edge (the
 * side away from his face), pure white with natword's two shadows, as long as the canvas allows; the sharp
 * cutout laid over him so a stray arm or shoulder passes in front of the letters. On the other side, at the
 * foot, the fixture small (crests, HOME v AWAY with exact names, date · kick-off · venue); NEYOD logo heading the word's column.
 */
const face = FACES.anton;

export function Natvert({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  /* ---- the word runs up the side away from his face ---- */
  const wordLeft = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, {
    fx: wordLeft ? 660 : 420,
    fy: story ? 780 : 520,
    fs: story ? 230 : 160,
  });

  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const em = Math.max(0.5, wordEm(face, word));
  const M = story ? 44 : 38;
  // Along the height: the post's full height less margins, the story's safe band.
  // The NEYOD logo heads the column; the word runs from under it to the foot.
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoH = (story ? 88 : 52) * (params.logoScale ?? 1);
  const spanTop = (story ? STORY_TOP : 46) + logoH + (story ? 60 : 44);
  const spanBottom = story ? STORY_BOTTOM : H - M;
  const span = spanBottom - spanTop;
  const size = Math.min(span / em, (story ? 330 : 275) / face.cap) * ts;
  const cap = size * face.cap;
  // Rotated -90°: the letters' tops face the edge, the baseline runs inward.
  const baseX = wordLeft ? M + cap : CANVAS_W - M;
  const startY = spanBottom + (params.textY ?? 0);

  /* ---- the foot on his side ---- */
  const fx_ = natFixture(data);
  const pad = 56;
  const inner = wordLeft ? { left: M + cap + 50, right: CANVAS_W - pad } : { left: pad, right: CANVAS_W - M - cap - 50 };
  const avail = inner.right - inner.left;
  const align = wordLeft ? "flex-end" : "flex-start";
  const bottom = story ? STORY_BOTTOM : H - 52;
  const lineSize = Math.min(14 * k * ts, avail / Math.max(1, capsEm(fx_.line, 0.2)));
  const lineTop = bottom - lineSize;
  const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
  const fixSize = Math.min(19 * k * ts, avail / Math.max(1, capsEm(fixture, 0.08)));
  const fixTop = (fx_.line ? lineTop - 16 * k : bottom) - fixSize;
  const crest = Math.round(34 * k);
  const crestTop = fixTop - 18 * k - crest;
  const shadeTop = crestTop - (story ? 280 : 210);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.35))" }} /> : null;
  const shadow = "0 1px 3px rgba(0,0,0,.55), 0 0 14px rgba(0,0,0,.4)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* The word, up the free edge. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="nv-soft" x="-40%" y="-10%" width="180%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <g filter="url(#nv-soft)">
          <text transform={`translate(${baseX} ${startY}) rotate(-90)`} x={0} y={0} style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "#ffffff" }}>
            {word}
          </text>
        </g>
      </svg>

      {/* He passes in front of it: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* Soft local shades: under the logo, and on his side of the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 240 : 170), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: shadeTop,
          bottom: 0,
          background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.4) 45%, rgba(6,10,6,.62))",
          WebkitMaskImage: `linear-gradient(to ${wordLeft ? "right" : "left"}, rgba(0,0,0,.35), #000 45%)`,
          maskImage: `linear-gradient(to ${wordLeft ? "right" : "left"}, rgba(0,0,0,.35), #000 45%)`,
        }}
      />

      {/* The fixture, small, at the foot on his side. */}
      <div style={{ position: "absolute", left: inner.left, width: avail, top: crestTop, height: crest, display: "flex", justifyContent: align, gap: 12 * k }}>
        {crestImg(fx_.homeCrest)}
        {crestImg(fx_.awayCrest)}
      </div>
      <div style={{ position: "absolute", left: inner.left, width: avail, top: fixTop, textAlign: wordLeft ? "right" : "left", fontFamily: SANS, fontWeight: 700, fontSize: fixSize, lineHeight: 1, letterSpacing: "0.08em", whiteSpace: "nowrap", textShadow: shadow }}>
        {fx_.homeName.toUpperCase()}
        <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.45em" }}>v</span>
        {fx_.awayName.toUpperCase()}
      </div>
      {fx_.line && (
        <div style={{ position: "absolute", left: inner.left, width: avail, top: lineTop, textAlign: wordLeft ? "right" : "left", fontFamily: SANS, fontWeight: 500, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.2em", whiteSpace: "nowrap", opacity: 0.88, textShadow: shadow }}>
          {fx_.line}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: wordLeft ? M + cap / 2 : CANVAS_W - M - cap / 2, top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
