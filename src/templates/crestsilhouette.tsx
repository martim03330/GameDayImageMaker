import { PatternSilhouette } from "./dotsilhouette";
import type { RenderData } from "./types";

/** Crest silhouette: the player in natural colour on a deep club-tone ground, beside him a twin of his own silhouette filled with a tiny tiled pattern of his own club crest (greyed, tinted to the club colour). Dots when there is no crest. Flips with params.side. */
export function Crestsilhouette({ data }: { data: RenderData }) {
  return <PatternSilhouette data={data} fill="crest" />;
}
