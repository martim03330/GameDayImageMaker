import { HeroFrame, heroBase, wordStyle } from "./goalheroshadow";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · boxed — the goal-hero layout with the enormous club-colour word set inside a thin club-colour
 * hairline rectangle that hugs it with equal padding on every side, like a label. The celebrating player sits
 * under the box, fading into the off-white ground; logo small at the top, name wide-spaced, no score.
 */
export function Goalheroboxed({ data }: { data: RenderData }) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const pad = story ? 40 : 32;
  const stroke = story ? 3 : 2.5;
  // The box's top edge sits where the word's cap line would be: push the word down by the padding.
  const shifted = { ...data, params: { ...data.params, textY: (data.params.textY ?? 0) + pad } };
  const b = heroBase(shifted, { reserve: 2 * pad, drop: () => pad + stroke });
  const capH = b.size * b.face.cap;
  // Anton's advances carry a little side bearing (≈0.028em before the first letter, ≈0.005em after the last):
  // hug the ink, not the advance, so the padding reads equal on all four sides.
  const lsb = 0.028 * b.size;
  const boxW = b.wordW - lsb - 0.005 * b.size + 2 * pad;
  const x = (CANVAS_W - boxW) / 2;
  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <rect x={x + stroke / 2} y={b.capTop - pad + stroke / 2} width={boxW - stroke} height={capH + 2 * pad - stroke} fill="none" stroke={b.club} strokeWidth={stroke} />
          <text x={x + pad - lsb} y={b.baseline} style={{ ...wordStyle(b), fill: b.club }}>
            {b.word}
          </text>
        </svg>
      }
    />
  );
}
