/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatDymoFrame } from "./natdymo";
import type { RenderData } from "./types";

/**
 * Natural goal · Dymo: his real celebration photo full-bleed, light grade only, and one idea: label-maker
 * tape strips stuck on the photo — a big "GOAL" tape, then "MOISÉS CONCEIÇÃO" and his club's exact name on
 * smaller tapes. No score. The NEYOD logo alone, clear of them.
 */
export function Goalnatdymo({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kick = (content.kicker || "Goal").replace(/[.!]+$/, "").trim().toUpperCase();
  return <NatDymoFrame data={data} tapes={[{ text: kick, main: true }, { text: name }, { text: ourClub(data).toUpperCase() }]} mainSize={80} />;
}
