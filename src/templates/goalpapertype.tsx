import { PaperTypeSilhouette } from "./papertype";
import type { RenderData } from "./types";

/**
 * Goal paper type silhouette: the celebrating player in natural colour on warm off-white paper, and beside him
 * a twin of his celebration made only of tiny tracked caps repeating "GOAL · FIRST LAST · HOME V AWAY ·" in the
 * deep club colour (names exactly as stored, never the score). "GOAL" small in ink at the top; his name and
 * the fixture small at the foot. Flips with params.side.
 */
export function Goalpapertype({ data }: { data: RenderData }) {
  return <PaperTypeSilhouette data={data} goal />;
}
