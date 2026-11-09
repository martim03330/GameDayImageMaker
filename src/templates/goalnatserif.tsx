/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatSerifFrame, sentenceWord } from "./natserif";
import type { RenderData } from "./types";

/**
 * Natural goal · serif: his real celebration photo full-bleed — real grass, stands and light, only the light
 * grade — and one typographic idea: "Goal." in a large elegant Didone serif (sentence case, full stop) over
 * the clear upper area, left-aligned; under it, small sans, his full name and his club's exact name. No
 * score. The NEYOD logo alone at the foot.
 */
export function Goalnatserif({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  return (
    <NatSerifFrame
      data={data}
      word={sentenceWord(content.kicker, "Goal")}
      lines={[
        { text: name, size: 26, weight: 700, tracking: 0.1 },
        { text: ourClub(data).toUpperCase(), size: 19, weight: 700, tracking: 0.22, opacity: 0.92 },
      ]}
    />
  );
}
