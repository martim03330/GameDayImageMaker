import { PatternSilhouette } from "./dotsilhouette";
import type { RenderData } from "./types";

/** Goal crest silhouette: the celebrating player beside a twin of his silhouette tiled with his own tiny club crest. "GOAL" small at the top; name and fixture (never the score) at the foot. Flips with params.side. */
export function Goalcrestsilhouette({ data }: { data: RenderData }) {
  return <PatternSilhouette data={data} fill="crest" goal />;
}
