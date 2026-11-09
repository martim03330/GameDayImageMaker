import { HeroFrameLook } from "./heroframe";
import type { RenderData } from "./types";

/**
 * Goal hero frame — the hairline frame for a goal: the celebrating player with his raised arms breaking out
 * over the frame's top edge, his name spaced above, the kicker enormous across the frame's bottom over his
 * faded legs. No score.
 */
export function Goalheroframe({ data }: { data: RenderData }) {
  return <HeroFrameLook data={data} goal />;
}
