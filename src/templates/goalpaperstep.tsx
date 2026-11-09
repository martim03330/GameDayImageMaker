import { PaperStepSilhouette } from "./paperstep";
import type { RenderData } from "./types";

/**
 * Goal paper steps: the celebrating player in natural colour on warm off-white paper, three flat tints of his
 * silhouette stepping back diagonally behind him, paler towards the paper. "GOAL" small in ink at the top; his
 * name and the fixture (home first, names exactly as stored, never the score) small at the foot. Flips with
 * params.side.
 */
export function Goalpaperstep({ data }: { data: RenderData }) {
  return <PaperStepSilhouette data={data} goal />;
}
