import { CANVAS_W, type RenderData } from "./types";
import { HeroMatchFrame, heroMatchBase, heroMatchWordStyle } from "./herogradient";

/**
 * Hero · aura (matchday) — goalheroaura carried to matchday: the enormous club-colour kicker ("MATCHDAY")
 * across the off-white ground, the cutout big under it with a soft, capped, blurred club-colour glow behind his
 * head and shoulders so the figure lifts off the light ground, fading out under heromatch's fixture foot.
 * No outline, no rim; logo small at the top, name wide-spaced.
 */
export function Heroaura({ data }: { data: RenderData }) {
  const b = heroMatchBase(data);
  const r = Math.min(b.story ? 640 : 520, Math.max(b.story ? 480 : 380, b.head.h * 3.2));
  const cy = b.head.cy + Math.min(b.head.h * 1.1, r * 0.35); // between the head and the shoulders
  return (
    <HeroMatchFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={b.wordLeft} y={b.baseline} style={{ ...heroMatchWordStyle(b), fill: b.club }}>
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
