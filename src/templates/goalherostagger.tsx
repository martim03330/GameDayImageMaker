import { wordEm } from "./goalhero";
import { HERO_FACE, HeroFrame, heroBase, wordStyle } from "./goalheroshadow";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · stagger — the goal-hero layout with the enormous word's letters on stepped baselines, each one
 * dropped a little more than the one before (a gentle staircase, about half a cap height in all), still one
 * exact-width word; the celebrating player under its lowest point, fading into the off-white ground.
 */
const STEP = 0.5; // total drop, in cap heights

export function Goalherostagger({ data }: { data: RenderData }) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const face = HERO_FACE;
  const b = heroBase(data, { drop: (s) => s * face.cap * STEP, maxCap: story ? 420 : 340 });
  const letters = [...b.word];
  const n = letters.length;
  const tr = face.tracking ?? 0;
  const drop = b.size * face.cap * STEP;
  // Capped by height, the word runs short of the margins: open the steps up so it spans the exact width again.
  const span = CANVAS_W - 2 * 80;
  const extra = n > 1 ? Math.max(0, Math.min(0.1 * b.size, (span - b.wordW) / (n - 1))) : 0;
  const left = (CANVAS_W - b.wordW - extra * (n - 1)) / 2;
  // Spaces carry no ink: step only on the letters.
  const inked = letters.filter((c) => c !== " ").length;
  let k = -1;
  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          {letters.map((c, i) => {
            if (c !== " ") k++;
            const x = left + extra * i + (i === 0 ? 0 : (wordEm(face, letters.slice(0, i).join("")) + tr) * b.size);
            const y = b.baseline + (inked > 1 ? (drop * k) / (inked - 1) : 0);
            return c === " " ? null : (
              <text key={i} x={x} y={y} style={{ ...wordStyle(b), letterSpacing: 0, fill: b.club }}>
                {c}
              </text>
            );
          })}
        </svg>
      }
    />
  );
}
