import { HeroFxFrame, HeroWordSvg } from "./goalherobw";
import { heroBase } from "./goalheroshadow";
import type { RenderData } from "./types";

/**
 * Goal hero · half — the goal-hero layout on a ground split horizontally: off-white above, the club colour below
 * from about his chest line down. Logo, name and the club-colour word sit on the light upper part (so does his
 * face); he stands across the split, his lower body on the colour, fading slightly into it at the very bottom.
 */
export function Goalherohalf({ data }: { data: RenderData }) {
  const b0 = heroBase(data);
  const { H, story, head } = b0;
  const chin = head.cy + head.h * 0.5;
  // About the chest line: ~0.9 face-heights under the chin, never above the chin + half a face (the face stays
  // on the light part), never so low the colour is a thin strip.
  const split = Math.round(Math.min(H - (story ? 520 : 380), Math.max(chin + head.h * 0.9, b0.baseline + 120, chin + head.h * 0.5)));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 300 : 220)}px, rgba(0,0,0,0.0) ${H - (story ? 20 : 0)}px)`;
  const b = { ...b0, fade };
  return (
    <HeroFxFrame
      data={data}
      b={b}
      glow={false}
      under={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: split, background: "radial-gradient(80% 70% at 50% 70%, #ffffff, transparent 75%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: split, bottom: 0, background: b.club }} />
        </>
      }
      word={<HeroWordSvg b={b} fill={b.club} />}
    />
  );
}
