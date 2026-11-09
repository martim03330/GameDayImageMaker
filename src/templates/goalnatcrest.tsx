import { NatBehind } from "./natbehind";
import type { RenderData } from "./types";

/** Natural goal · crest behind: the club crest as a white silhouette behind him, the kicker small above it, name + crests at the foot; no score (see natbehind.tsx). */
export function Goalnatcrest({ data }: { data: RenderData }) {
  return <NatBehind data={data} kind="crest" goal={true} />;
}
