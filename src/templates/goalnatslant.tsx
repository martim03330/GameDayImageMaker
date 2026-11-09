/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatSlantFrame } from "./natslant";
import type { RenderData } from "./types";

/**
 * Natural goal · slant: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: a sports-broadcast sweep on a gentle −7° slant: "GOAL" in big bold
 * condensed caps, a thin rule, then his full name and his club's exact name small. No score. The NEYOD logo alone.
 */
export function Goalnatslant({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim().toUpperCase();
  return (
    <NatSlantFrame
      data={data}
      word={word}
      lines={[
        { text: name, size: 30, weight: 800, tracking: 0.1 },
        { text: ourClub(data).toUpperCase(), size: 22, weight: 700, tracking: 0.2, opacity: 0.92 },
      ]}
    />
  );
}
