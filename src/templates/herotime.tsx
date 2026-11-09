import { HeroMatchday } from "./heromatch";
import type { RenderData } from "./types";

/** Hero time: the hero matchday with the kick-off time enormous in Anton, "MATCHDAY" small above, the name in the foot. */
export function Herotime({ data }: { data: RenderData }) {
  return <HeroMatchday data={data} mode="time" />;
}
