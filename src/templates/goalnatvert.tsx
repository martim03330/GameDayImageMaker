/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · vertical word: his real celebration photo as it is (light grade only), the kicker ("GOAL",
 * "BRACE", "HAT-TRICK") set huge and VERTICAL — rotated, read bottom-to-top — along the free side edge away
 * from his face, pure white with natword's tight + wide shadows, sitting between the photo and the sharp
 * figure layer so an arm crossing it stays in front. His name and two small crests with "v" at the foot on
 * the other side; the NEYOD logo at the top. No score.
 */
export function Goalnatvert({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const M = story ? 64 : 50;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? (story ? 330 : 400) : params.side === "right" ? (story ? 750 : 680) : story ? 660 : 600,
    fy: story ? 720 : 500,
    fs: story ? 190 : 168,
  });

  // His head's real span on the canvas (face box + a margin for hair and ears).
  const faceW = place.faceW;
  const headL = place.fx - faceW / 2 - place.fs * 0.32;
  const headR = place.fx + faceW / 2 + place.fs * 0.32;
  // The free side: whichever edge has more room beside his head.
  const wordLeft = headL > CANVAS_W - headR;

  /* ---- the logo, the foot ---- */
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const footBottom = (story ? STORY_BOTTOM : CANVAS_H - 50) - (params.textY ?? 0);

  /* ---- the vertical word: its length along the height, its cap height across the free side ---- */
  const face = FACES.anton;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const runTop = logoTop + logoH + (story ? 90 : 60);
  const lenFit = (footBottom - runTop) / Math.max(0.5, wordEm(face, word));
  const room = (wordLeft ? headL - M : CANVAS_W - M - headR) - 40;
  const capFit = Math.min(story ? 330 : 320, Math.max(story ? 220 : 170, room)) / face.cap;
  const size = Math.min(lenFit, capFit) * ts;
  const cap = size * face.cap;
  // The baseline runs along the inner side; the caps' tops point to the edge.
  const baseX = wordLeft ? M + cap : CANVAS_W - M;

  /* ---- the name + crests on the other side ---- */
  const fx = natFixture(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameRoom = CANVAS_W - 2 * M - cap - (story ? 60 : 44);
  const nameSize = Math.min(26 * k * ts, nameRoom / Math.max(1, capsEm(name, 0.14)));
  const crest = Math.round(44 * k);
  const crestTop = footBottom - crest;
  const nameTop = crestTop - (story ? 24 : 18) - nameSize;
  const side = wordLeft ? { right: M } : { left: M };
  const align = wordLeft ? "flex-end" : "flex-start";
  const blockW = Math.max(nameSize * capsEm(name, 0.14), crest * 2 + 40 * k);
  const shadow = "0 2px 6px rgba(0,0,0,.38), 0 8px 40px rgba(0,0,0,.42)";

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.45))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: "#ffffff" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />

      {/* The word, vertical, behind him. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="gnv-soft" x="-40%" y="-10%" width="180%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <g transform={`translate(${baseX} ${footBottom}) rotate(-90)`}>
          <text x={0} y={0} textAnchor="start" filter="url(#gnv-soft)" style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "#ffffff" }}>
            {word}
          </text>
        </g>
      </svg>

      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />

      {/* A breath of shade under the foot and the logo. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + logoH + (story ? 160 : 110), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      {/* Under the name: a soft local shade on its side only (the word stays pure white). */}
      <div
        style={{
          position: "absolute",
          ...(wordLeft ? { right: -160 } : { left: -160 }),
          width: blockW + 160 + M + 120,
          top: nameTop - (story ? 160 : 120),
          height: footBottom - nameTop + (story ? 320 : 240),
          background: `radial-gradient(closest-side at ${wordLeft ? "60%" : "40%"} 50%, rgba(5,8,5,.62), rgba(5,8,5,.38) 55%, rgba(5,8,5,0))`,
        }}
      />

      {/* His name, then the crests, on the side away from the word. */}
      <div style={{ position: "absolute", ...side, top: nameTop, fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.14em", marginRight: wordLeft ? "-0.14em" : 0, whiteSpace: "nowrap", textShadow: shadow }}>
        {name}
      </div>
      <div style={{ position: "absolute", ...side, top: crestTop, height: crest, display: "flex", alignItems: "center", justifyContent: align, gap: 14 * k }}>
        {crestImg(fx.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 16 * k * ts, lineHeight: 1, opacity: 0.85, textShadow: shadow }}>v</div>
        {crestImg(fx.awayCrest)}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
