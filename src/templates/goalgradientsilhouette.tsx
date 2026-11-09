import { GradientSilhouette } from "./gradientsilhouette";
import type { RenderData } from "./types";

/** Goal gradient silhouette: the celebrating player in natural colour on a deep club-tone ground, beside him a twin of his silhouette in a smooth club-colour gradient, brightest at the raised fist / head and fading out by the waist. "GOAL" small at the top; his name and the fixture (home first, never the score) small at the foot. Flips with params.side. */
export function Goalgradientsilhouette({ data }: { data: RenderData }) {
  return <GradientSilhouette data={data} goal />;
}
