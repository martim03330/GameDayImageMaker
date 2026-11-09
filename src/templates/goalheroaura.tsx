import { HeroFrame, heroBase, wordStyle } from "./goalheroshadow";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · aura — the goal-hero layout (enormous club-colour word, celebrating player under it fading into
 * the off-white ground) with a soft, large, blurred club-colour glow behind his head and shoulders, so the
 * figure lifts off the light ground. No outline, no rim; logo small at the top, name wide-spaced, no score.
 */
export function Goalheroaura({ data }: { data: RenderData }) {
  const b = heroBase(data);
  const r = Math.min(b.story ? 640 : 520, Math.max(b.story ? 480 : 380, b.head.h * 3.2));
  const cy = b.head.cy + Math.min(b.head.h * 1.1, r * 0.35); // between the head and the shoulders
  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={b.wordLeft} y={b.baseline} style={{ ...wordStyle(b), fill: b.club }}>
            {b.word}
          </text>
        </svg>
      }
      behindPlayer={
        <div
          style={{
            position: "absolute",
            left: b.head.cx - r,
            top: cy - r,
            width: 2 * r,
            height: 2 * r,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${b.club} 0%, ${b.club} 30%, transparent 100%)`,
            opacity: 0.18,
            filter: "blur(40px)",
          }}
        />
      }
    />
  );
}
