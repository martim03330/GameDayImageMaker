import { StepSilhouette } from "./stepsilhouette";
import type { RenderData } from "./types";

/** Goal step silhouette: the celebrating player in natural colour on a deep club-tone ground, three crisp tonal copies of his silhouette stepping back diagonally behind him. "GOAL" small at the top; his name and the fixture (home first, never the score) small at the foot. Flips with params.side. */
export function Goalstepsilhouette({ data }: { data: RenderData }) {
  return <StepSilhouette data={data} goal />;
}
