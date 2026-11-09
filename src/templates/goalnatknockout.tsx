/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatKnockoutFrame } from "./natknockout";
import type { RenderData } from "./types";

/**
 * Natural goal · knockout: his real celebration photo full-bleed and a solid white band across the clear area
 * (above him, or at the foot when there is no headroom) with "GOAL" knocked out of it in heavy Anton caps —
 * the photo shows through the letters. Small dark ink on the band: his full name · his club's exact name.
 * No score. The NEYOD logo alone at the free end.
 */
export function Goalnatknockout({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (content.kicker || "Goal").replace(/’/g, "'").trim().replace(/[.!]+$/, "");
  return <NatKnockoutFrame data={data} word={word} info={[name, ourClub(data).toUpperCase()]} />;
}
