/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatStackFrame, kickerLines } from "./natstack";
import type { RenderData } from "./types";

/**
 * Natural goal · stack: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: a left-aligned stack of short bold condensed caps, like a poster index:
 * GOAL / MOISÉS / CONCEIÇÃO, with his club's exact name small under it. No score. The NEYOD logo alone.
 */
export function Goalnatstack({ data }: { data: RenderData }) {
  const { content } = data;
  return (
    <NatStackFrame
      data={data}
      lines={[...kickerLines(content.kicker, "GOAL"), (content.firstName ?? "").toUpperCase(), (content.lastName ?? "").toUpperCase()]}
      small={[{ text: ourClub(data).toUpperCase(), size: 26, weight: 700, tracking: 0.14 }]}
    />
  );
}
