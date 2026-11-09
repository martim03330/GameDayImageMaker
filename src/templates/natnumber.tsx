import { NatBehind } from "./natbehind";
import type { RenderData } from "./types";

/** Natural · number behind (matchday): his shirt number huge in white Anton behind him, head over its lower part; MATCHDAY tag + fixture foot (see natbehind.tsx). */
export function Natnumber({ data }: { data: RenderData }) {
  return <NatBehind data={data} kind="number" goal={false} />;
}
