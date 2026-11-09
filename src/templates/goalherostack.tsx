import { HeroStack } from "./herostack";
import type { RenderData } from "./types";

/**
 * Goal hero stack — herostack for goals: the goal word split over two enormous Anton lines ("GO" / "AL",
 * "HAT-" / "TRICK", "BRA" / "CE"), the celebrating player big on the other half, his head beside the stack,
 * the name spaced above it, the two clubs and the competition quietly at the foot. No score.
 */
export function Goalherostack({ data }: { data: RenderData }) {
  return <HeroStack data={data} goal />;
}
