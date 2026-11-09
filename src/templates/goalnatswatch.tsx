/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatSwatchFrame } from "./natswatch";
import type { RenderData } from "./types";

/**
 * Natural goal · swatch: his real celebration photo full-bleed, light grade only, and one idea: a
 * Pantone-style colour swatch card in the club colour stuck in a clear corner — "GOAL", "MOISÉS CONCEIÇÃO",
 * then his club's exact name. No score. The NEYOD logo alone.
 */
export function Goalnatswatch({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kick = (content.kicker || "Goal").replace(/[.!]+$/, "").trim().toUpperCase();
  return <NatSwatchFrame data={data} lines={[{ text: kick, main: true }, { text: name, wrap: true }, { text: ourClub(data).toUpperCase(), wrap: true }]} />;
}
