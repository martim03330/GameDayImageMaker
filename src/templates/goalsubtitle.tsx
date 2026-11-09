import { SubtitleFrame, sentence, teamsOf } from "./subtitle";
import { CANVAS_H, STORY_TOP, type RenderData } from "./types";

/**
 * Goal subtitle: the Subtitle film still for a goal — full-bleed, no letterbox, the celebrating player
 * framed tighter and graded warm (golden hour, amber highlights, umber shadows). Two lines of film
 * subtitles near the foot: "— Goal." / "Moisés Conceição. SC Vianense SAD v USC Paredes." Never the score.
 */
export function Goalsubtitle({ data }: { data: RenderData }) {
  const { content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const kick = (content.kicker || "GOAL").replace(/’/g, "'");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const teams = teamsOf(data);
  const line2 = [name, teams ? `${teams[0]} v ${teams[1]}` : ""].filter(Boolean).join(". ");

  return (
    <SubtitleFrame
      data={data}
      lines={[`— ${sentence(kick)}.`, line2 ? `${line2}.` : ""]}
      faceTop={story ? STORY_TOP + 150 : 180}
      sizes={story ? { chest: 260, waist: 230, knees: 190, full: 150 } : { chest: 200, waist: 176, knees: 146, full: 116 }}
      faceXs={[540, 500, 580]}
      grade={{
        ground: "blur(16px) saturate(.8) brightness(.58) contrast(1.12)",
        tint: "#7a4a1e",
        tintOpacity: 0.38,
        figure: "contrast(1.07) saturate(1.02) sepia(.14)",
        washFrom: "#3a2414",
        washTo: "#f0a24a",
        washOpacity: 0.5,
        base: "#2a1a10",
      }}
    />
  );
}
