"use client";
/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { HorizonLine } from "./nathorizon";
import type { RenderData } from "./types";

/**
 * Natural goal · horizon: his real celebration photo full-bleed (light grade only) with small wide-spaced
 * caps sitting ON the pitch's horizon behind him — "GOAL · HIS NAME" on one side of his legs, his club's
 * exact name on the other — so he stands over the line. The NEYOD logo alone at the top. No score.
 */
export function Goalnathorizon({ data }: { data: RenderData }) {
  const { content } = data;
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  return <HorizonLine data={data} left={[kicker + (name ? "  ·  " : ""), name].filter(Boolean)} right={[club].filter(Boolean)} />;
}
