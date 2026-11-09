import { NatBehind } from "./natbehind";
import type { RenderData } from "./types";

/** Natural · crest behind (matchday): his club crest huge as a white silhouette behind him, head over its lower part; MATCHDAY tag + fixture foot (see natbehind.tsx). */
export function Natcrest({ data }: { data: RenderData }) {
  return <NatBehind data={data} kind="crest" goal={false} />;
}
