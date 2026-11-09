/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatPillFrame } from "./natpill";
import type { RenderData } from "./types";

/**
 * Natural goal · pills: his real celebration photo full-bleed, light grade only, and one idea: rounded chip
 * labels stacked left-aligned in a clear area — "GOAL", "MOISÉS CONCEIÇÃO", "SC VIANENSE SAD" (exact club
 * name). No score. The NEYOD logo alone, clear of them.
 */
export function Goalnatpill({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kick = (content.kicker || "Goal").replace(/[.!]+$/, "").trim().toUpperCase();
  return <NatPillFrame data={data} pills={[{ text: kick, main: true }, { text: name }, { text: ourClub(data).toUpperCase() }]} mainSize={42} />;
}
