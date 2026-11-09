import { HeroMatchday } from "./heromatch";
import type { RenderData } from "./types";

/** Hero date: the hero matchday with the date enormous in Bebas (the month in a lighter club tint), "MATCHDAY" small above. */
export function Herodate({ data }: { data: RenderData }) {
  return <HeroMatchday data={data} mode="date" />;
}
