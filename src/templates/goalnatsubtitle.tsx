/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { keep } from "./natcaption";
import { SubtitleFrame, subWord } from "./natsubtitle";
import type { RenderData } from "./types";

/**
 * Natural goal · subtitle: his real celebration photo almost untouched and two film-subtitle lines near the
 * foot — "Goal." / "Moisés Conceição, SC Vianense SAD." (exact club name). The NEYOD logo small at the top
 * centre. No score.
 */
export function Goalnatsubtitle({ data }: { data: RenderData }) {
  const { content } = data;
  const name = keep([content.firstName, content.lastName].filter(Boolean).join(" "));
  const club = ourClub(data);
  const l2 = [name, club ? keep(club) : ""].filter(Boolean).join(", ");
  return <SubtitleFrame data={data} lines={[`${subWord(content.kicker, "Goal")}.`, l2 ? `${l2}.` : ""]} />;
}
