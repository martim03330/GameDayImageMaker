/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { CinemaFrame, cinemaWord } from "./natcinema";
import type { RenderData } from "./types";

/**
 * Natural goal · cinema: a cinematic letterbox over his real celebration photo — "GOAL" wide-tracked in the
 * top bar, "MOISÉS CONCEIÇÃO · SC VIANENSE SAD" (exact club name) small in the bottom bar with the NEYOD logo
 * at its right end. No score.
 */
export function Goalnatcinema({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const club = ourClub(data).toUpperCase();
  const line = [name, club].filter(Boolean).join(" · ");
  return <CinemaFrame data={data} word={cinemaWord(content.kicker, "Goal")} line={line} alt={name && club ? [name, club] : undefined} />;
}
