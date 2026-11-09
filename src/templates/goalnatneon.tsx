/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatNeonFrame, neonWord } from "./natneon";
import type { RenderData } from "./types";

/**
 * Natural goal · neon: his real celebration photo full-bleed, and one idea — "GOAL" as a neon sign (thin
 * rounded tube caps, white-hot core, club-accent glow) over the darker stands above him; under it, plain
 * sans, his full name and his club's exact name. No score. NEYOD logo alone at the foot.
 */
export function Goalnatneon({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  return (
    <NatNeonFrame
      data={data}
      word={neonWord(content.kicker, "Goal")}
      lines={[
        { text: name, size: 27, weight: 700, tracking: 0.1 },
        { text: ourClub(data).toUpperCase(), size: 20, weight: 700, tracking: 0.22, opacity: 0.92 },
      ]}
    />
  );
}
