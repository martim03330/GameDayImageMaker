/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatLitFrame } from "./natlit";
import type { RenderData } from "./types";

/**
 * Natural goal · spotlight: his real celebration photo with the surroundings sunk around him (NatSpot) and a
 * soft vignette, so he stands naturally lit. In the darkened area: "GOAL" in wide-tracked medium caps, a
 * hairline, then his full name and his club's exact name, small. No score. NEYOD logo alone.
 */
export function Goalnatlit({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  return (
    <NatLitFrame
      data={data}
      word={(content.kicker || "Goal").toUpperCase()}
      lines={[
        { text: name, size: 26, weight: 700, tracking: 0.12 },
        { text: ourClub(data).toUpperCase(), size: 19, weight: 600, tracking: 0.24, opacity: 0.92 },
      ]}
    />
  );
}
