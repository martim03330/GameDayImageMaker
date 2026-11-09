import { PatternSilhouette } from "./dotsilhouette";
import type { RenderData } from "./types";

/** Goal dot silhouette: the celebrating player in natural colour on a deep club-tone ground, beside him a dot-matrix twin of his own silhouette. "GOAL" small at the top; his name and the fixture (home first, never the score) small at the foot. Flips with params.side. */
export function Goaldotsilhouette({ data }: { data: RenderData }) {
  return <PatternSilhouette data={data} fill="dots" goal />;
}
