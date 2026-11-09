import { HeroFrame, heroBase, wordStyle } from "./goalheroshadow";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · fill — the goal-hero layout with the enormous word filled with his own photo (the original, with
 * its background), darkened a touch so the letters read on the off-white ground, and edged with a thin
 * club-colour outline. The celebrating cutout sits under it, fading into the ground; logo small, no score.
 */
export function Goalherofill({ data }: { data: RenderData }) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const stroke = story ? 3 : 2.5;
  const b = heroBase(data, { drop: () => stroke });
  const src = data.bgPhotoUrl ?? data.photoUrl;
  const capH = b.size * b.face.cap;
  const id = `ghfill-${story ? "s" : "p"}`;
  const pad = 20;
  const box = { x: b.wordLeft - pad, y: b.capTop - pad, w: b.wordW + 2 * pad, h: capH + 2 * pad };
  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <clipPath id={id}>
              <text x={b.wordLeft} y={b.baseline} style={wordStyle(b)}>
                {b.word}
              </text>
            </clipPath>
          </defs>
          <g clipPath={`url(#${id})`}>
            <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={b.club} />
            {/* The image frame reaches far above the word, so the letters show the photo's lower part (kit, body,
                pitch) and his face, high in the frame, stays out of the letters: the only face is the sharp cutout. */}
            {src && <image href={src} x={box.x} y={box.y - box.h * 1.2} width={box.w} height={box.h * 2.2} preserveAspectRatio="xMidYMid slice" />}
            <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={b.club} opacity={0.4} style={{ mixBlendMode: "multiply" }} />
            <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="#000" opacity={0.2} />
          </g>
          <text x={b.wordLeft} y={b.baseline} style={{ ...wordStyle(b), fill: "none", stroke: b.club, strokeWidth: stroke, strokeLinejoin: "round" }}>
            {b.word}
          </text>
        </svg>
      }
    />
  );
}
