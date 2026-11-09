/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatQuadFrame } from "./natquad";
import type { RenderData } from "./types";

/**
 * Natural goal · four corners: his real celebration photo full-bleed — real grass, stands and light — framed
 * like a viewfinder: "GOAL" top-left, his club's exact name top-right, his first name bottom-left and his
 * last name bottom-right, all in the same small bold caps; the middle left to the photo. No score. The
 * NEYOD logo alone, top- or bottom-centre, whichever is clear of his head.
 */
export function Goalnatquad({ data }: { data: RenderData }) {
  const { content } = data;
  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim().toUpperCase();
  const first = (content.firstName || "").trim().toUpperCase();
  const last = (content.lastName || "").trim().toUpperCase();
  return (
    <NatQuadFrame
      data={data}
      tl={{ text: word }}
      tr={{ text: ourClub(data).toUpperCase() }}
      bl={{ text: first || last }}
      br={{ text: first ? last : "" }}
    />
  );
}
