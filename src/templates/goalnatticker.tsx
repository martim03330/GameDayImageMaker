import { ourClub } from "./goalnatcaption";
import { TickerLook, type TickerItem } from "./natticker";
import { CANVAS_H, type RenderData } from "./types";

/**
 * Natural goal · news ticker: his real celebration photo full-bleed, and a slim TV ticker band across the
 * foot — a solid "GOAL" label block, then "MOISÉS CONCEIÇÃO • SC VIANENSE SAD •" running and cut by the frame
 * edge (exact club name). No score. The NEYOD logo alone in a clear corner.
 */
export function Goalnatticker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const label = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const items: TickerItem[] = [{ text: name, strong: true }, { text: ourClub(data).toUpperCase() }];
  const want = { fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540, fy: story ? 640 : 440, fs: story ? 250 : 172 };
  return <TickerLook data={data} label={label} items={items} place={want} />;
}
