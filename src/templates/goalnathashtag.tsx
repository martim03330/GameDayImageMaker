/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { HashtagFrame, hashWord } from "./nathashtag";
import type { RenderData } from "./types";

/**
 * Natural goal · hashtag: his real celebration photo full-bleed — real grass, stands and light — and one idea:
 * "#GOAL" big in bold caps over the clear upper area (the # in the accent colour), with his full name and his
 * club's exact name small under it. No score. The NEYOD logo alone at the foot.
 */
export function Goalnathashtag({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  return (
    <HashtagFrame
      data={data}
      word={hashWord(content.kicker, "GOAL")}
      lines={[
        { text: name, size: 28, weight: 700, tracking: 0.08 },
        { text: ourClub(data).toUpperCase(), size: 20, weight: 700, tracking: 0.2, opacity: 0.92 },
      ]}
    />
  );
}
