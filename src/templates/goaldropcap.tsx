import { DropcapPage } from "./dropcap";
import type { RenderData } from "./types";

/**
 * Goal dropcap: the goal post of `dropcap`. On a deep club-tone ground a huge DM Serif "G" in a light tint of
 * the club colour, "OAL." in spaced small caps, then one sentence — "Moisés Conceição scores for SC Vianense
 * SAD against Leixões." (names as stored, never the score). The celebrating player big on the other side.
 */
export function Goaldropcap({ data }: { data: RenderData }) {
  return <DropcapPage data={data} mode="goal" />;
}
