/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatBoxedFrame } from "./natboxed";
import type { RenderData } from "./types";

/**
 * Natural goal · boxed: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one idea: "GOAL" in medium-weight, wide-tracked caps inside a thin white rectangle outline,
 * centred above his head (across the foot when there is no headroom); his full name and his club's exact
 * name small under the box. No score. The NEYOD logo alone.
 */
export function Goalnatboxed({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const word = (content.kicker || "GOAL").toUpperCase().replace(/[’.!]/g, "").trim();
  return (
    <NatBoxedFrame
      data={data}
      word={word}
      lines={[
        { text: name, size: 26, weight: 700, tracking: 0.16 },
        { text: ourClub(data).toUpperCase(), size: 20, weight: 600, tracking: 0.26, opacity: 0.92 },
      ]}
    />
  );
}
