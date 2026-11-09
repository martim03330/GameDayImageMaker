import { NatBehind } from "./natbehind";
import type { RenderData } from "./types";

/** Natural goal · number behind: his shirt number huge behind him, the kicker small above it, his name at the foot; no score (see natbehind.tsx). */
export function Goalnatnumber({ data }: { data: RenderData }) {
  return <NatBehind data={data} kind="number" goal={true} />;
}
