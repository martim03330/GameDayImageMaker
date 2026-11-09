/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatTurfFrame } from "./natturf";
import type { RenderData } from "./types";

/**
 * Natural goal · turf: his real celebration photo full-bleed and "GOAL" painted on the grass in perspective
 * at his feet like a pitch-side turf logo, behind him (flat over the foot when the photo has no grass below
 * his knees). At the top, small: his full name and his club's exact name. No score. The NEYOD logo above.
 */
export function Goalnatturf({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  return (
    <NatTurfFrame
      data={data}
      word={word}
      lines={[
        { text: name, size: 27, weight: 700, tracking: 0.1 },
        { text: ourClub(data).toUpperCase(), size: 18, weight: 700, tracking: 0.22, opacity: 0.92 },
      ]}
    />
  );
}
