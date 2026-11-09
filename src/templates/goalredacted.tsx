import { RedactedPage } from "./redacted";
import type { RenderData } from "./types";

/**
 * Goal redacted: the goal post of `redacted`. On a deep club-tone ground a short memo in JetBrains Mono, every
 * filler word covered by a neat white bar, only "GOAL.", his name and the fixture (home first, names as
 * stored, never a score) left readable. The celebrating player big on the other side.
 */
export function Goalredacted({ data }: { data: RenderData }) {
  return <RedactedPage data={data} mode="goal" />;
}
