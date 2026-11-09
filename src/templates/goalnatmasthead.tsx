/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatMastheadFrame } from "./natmasthead";
import type { RenderData } from "./types";

/**
 * Natural goal · masthead: his real celebration photo full-bleed, light grade only, and one idea: a
 * newspaper masthead across the top — "Goal" in a big centred Didone serif, then between thin double rules
 * a small caps dateline "SC VIANENSE SAD · MOISÉS CONCEIÇÃO" (exact club name). No score. The NEYOD logo
 * alone at the foot.
 */
export function Goalnatmasthead({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const raw = (content.kicker || "Goal").replace(/[.!]+$/, "").trim();
  const title = raw === raw.toUpperCase() ? raw.charAt(0) + raw.slice(1).toLowerCase() : raw;
  return <NatMastheadFrame data={data} title={title} dateline={[club, name].filter(Boolean).join("  ·  ")} split={[name, club]} max={190} />;
}
