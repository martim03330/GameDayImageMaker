import { TextsquarePage } from "./textsquare";
import type { RenderData } from "./types";

/**
 * Goal text square: the goal post of `textsquare`. A perfect justified square of small tracked caps repeating
 * "GOAL · MOISÉS CONCEIÇÃO · SC VIANENSE SAD V LEIXÕES ·" (no score), white-ish on a deep club tone, every
 * "GOAL" (or the kicker: BRACE, HAT-TRICK) bright and bold. The celebrating player big on the other side.
 */
export function Goaltextsquare({ data }: { data: RenderData }) {
  return <TextsquarePage data={data} mode="goal" />;
}
