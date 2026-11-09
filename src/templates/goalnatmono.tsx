/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatMonoFrame, monoWord } from "./natmono";
import type { RenderData } from "./types";

/**
 * Natural goal · mono: his real celebration photo full-bleed, light grade only, and one techy idea: "GOAL_"
 * in a big typewriter mono, white with the double shadow over the clear upper area; under it, small mono,
 * "> MOISÉS CONCEIÇÃO" and "> SC VIANENSE SAD" (exact club name). No score. The NEYOD logo alone at the foot.
 */
export function Goalnatmono({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  return (
    <NatMonoFrame
      data={data}
      word={monoWord(content.kicker, "Goal")}
      lines={[
        { text: name ? `> ${name}` : "", size: 28, weight: 700 },
        { text: club ? `> ${club}` : "", size: 22, weight: 500, opacity: 0.92 },
      ]}
    />
  );
}
