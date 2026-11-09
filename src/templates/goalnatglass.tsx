/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatGlassFrame } from "./natglass";
import type { RenderData } from "./types";

/**
 * Natural goal · glass: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one idea: a frosted-glass card in the clear area holding a big "GOAL", then his full name and
 * his club's exact name. No score. The NEYOD logo alone with clear space.
 */
export function Goalnatglass({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim().toUpperCase();
  return (
    <NatGlassFrame
      data={data}
      word={word}
      lines={[
        { text: name, size: 27, weight: 700, tracking: 0.08 },
        { text: ourClub(data).toUpperCase(), size: 20, weight: 600, tracking: 0.16, opacity: 0.92 },
      ]}
    />
  );
}
