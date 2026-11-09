/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatSandFrame } from "./natsand";
import type { RenderData } from "./types";

/**
 * Natural goal · dourado: his real celebration photo, the surroundings washed in warm gold while he keeps
 * his own colours. Beside him "GOAL" in small gold tracked caps, his club's exact name under it, then his
 * first and last name in tall light condensed caps. No score. NEYOD logo alone at the foot.
 */
export function Goalnatsand({ data }: { data: RenderData }) {
  const { content } = data;
  return (
    <NatSandFrame
      data={data}
      label={(content.kicker || "Goal").toUpperCase()}
      sub={ourClub(data).toUpperCase()}
      big={[
        { text: (content.firstName || "").toUpperCase(), size: 118 },
        { text: (content.lastName || "").toUpperCase(), size: 118 },
      ]}
      foot=""
    />
  );
}
