/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { LED_AMBER, LED_WHITE, NatLedFrame } from "./natled";
import type { RenderData } from "./types";

/**
 * Natural goal · LED board: his real celebration photo full-bleed, and a thin stadium LED strip — "GOAL" in
 * amber 5×7 dot-matrix with a faint glow, his SURNAME in warm-white dots under it (accents kept), and his
 * club's exact name in a clean sans line. No score. NEYOD logo alone, clear of his head.
 */
export function Goalnatled({ data }: { data: RenderData }) {
  const { content } = data;
  const word = (content.kicker || "GOAL").replace(/’/g, "'").trim();
  const surname = (content.lastName || content.firstName || "").trim();
  const club = ourClub(data).toUpperCase();
  return (
    <NatLedFrame
      data={data}
      rows={[
        { text: word, pitch: 15, color: LED_AMBER },
        { text: surname, pitch: 9.5, color: LED_WHITE },
      ]}
      line={{ text: club, node: club }}
    />
  );
}
