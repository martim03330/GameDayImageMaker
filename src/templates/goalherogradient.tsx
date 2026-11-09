import { shade } from "@/lib/color";
import { HeroFrame, heroBase, wordStyle } from "./goalheroshadow";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · gradient — the goal-hero layout with the enormous word filled top-to-bottom from the deep club
 * colour at the cap line to a lighter tint at the baseline (crisp edges, no blur); the celebrating player
 * under it fading into the off-white ground. Logo small at the top, name wide-spaced, no score.
 */
export function Goalherogradient({ data }: { data: RenderData }) {
  const b = heroBase(data);
  const deep = shade(b.club, -0.3);
  const light = shade(b.club, 0.55);
  const id = "ghg-fill";
  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={b.capTop} x2={0} y2={b.baseline}>
              <stop offset="0" stopColor={deep} />
              <stop offset="0.35" stopColor={b.club} />
              <stop offset="1" stopColor={light} />
            </linearGradient>
          </defs>
          <text x={b.wordLeft} y={b.baseline} style={{ ...wordStyle(b), fill: `url(#${id})` }}>
            {b.word}
          </text>
        </svg>
      }
    />
  );
}
