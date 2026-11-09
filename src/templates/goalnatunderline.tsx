/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { UnderlineFrame, underWord } from "./natunderline";
import type { RenderData } from "./types";

/**
 * Natural goal · underline: his real celebration photo full-bleed — real grass, stands and light — and one idea:
 * "Goal" big in bold sans over the clear upper area with one thick bar under it in the club colour, then his full
 * name and his club's exact name small under the bar. No score. The NEYOD logo alone at the foot.
 */
export function Goalnatunderline({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  return (
    <UnderlineFrame
      data={data}
      word={underWord(content.kicker, "Goal")}
      lines={[
        { text: name, size: 28, weight: 700, tracking: 0.08 },
        { text: ourClub(data).toUpperCase(), size: 20, weight: 700, tracking: 0.2, opacity: 0.92 },
      ]}
    />
  );
}
