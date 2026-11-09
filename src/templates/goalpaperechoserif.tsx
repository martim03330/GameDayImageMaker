import { DMSERIF } from "./fx";
import { serifEm, serifLines } from "./echoserif";
import { goalBox, M } from "./goalechotitle";
import { PaperTooth } from "./paperecho";
import { PaperFigure, PaperGround, paperGoalFoot, PaperLogo, paperSetup } from "./paperechoserif";
import { STORY_TOP, type RenderData } from "./types";

/**
 * Goal paper echo serif: goalechoserif on warm paper — the celebrating player, sharp and in natural colour, a
 * soft shade where he meets the paper and one hairline echo of his edge (deep club or ink) — and the kicker
 * ("Goal") set once in a calm, large italic serif in ink in the free top corner, his raised arm free to pass in
 * front of it. His name, the fixture (home first, names exactly as stored, no score) and the competition small
 * in ink at the foot.
 */
export function Goalpaperechoserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = paperSetup(data, true);
  const { story, k, right } = s;
  const foot = paperGoalFoot(data, s);

  /* ---- the title: one serif word (two lines for long kickers), in the free top corner ---- */
  const lines = serifLines(content.kicker || "GOAL");
  const widest = Math.max(1, ...lines.map(serifEm));
  const maxW = story ? 640 : 520;
  const size = Math.max(story ? 120 : 90, Math.min(story ? 250 : 190, maxW / widest)) * s.ts;
  const lead = size * 0.9;
  const titleTop = (story ? STORY_TOP : 80) + (params.textY ?? 0);
  const blockTop = titleTop - size * 0.2;
  const titleBottom = titleTop + size * 0.72 + lead * (lines.length - 1);
  const side = right ? { left: M - size * 0.04 } : { right: M };

  /* ---- the player, his head below the title's cap line ---- */
  const cx = story ? (right ? 600 : 480) : right ? 620 : 460;
  const faceTop = Math.max(story ? 470 : 330, titleBottom + (story ? 150 : 110));
  const box = goalBox(data, { faceX: cx, faceTop, cx, maxW: story ? 900 : 800, story, minHead: titleTop + 10 });
  const dx = (right ? 1 : -1) * 30 * k;
  const dy = -26 * k;
  const fadeEnd = foot.top - 26 * k;

  return (
    <div style={{ position: "relative", width: 1080, height: s.H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperGround s={s} at={[right ? 60 : 40, story ? 40 : 42]} />

      {/* The serif title, behind him: a raised arm may pass in front of it. */}
      <div style={{ position: "absolute", ...side, top: blockTop, textAlign: right ? "left" : "right", fontFamily: DMSERIF, fontStyle: "italic", fontSize: size, lineHeight: `${lead}px`, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: s.ink }}>
        {lines.map((l, i) => (
          <div key={i} style={{ height: lead }}>
            {l}
          </div>
        ))}
      </div>

      <PaperFigure data={data} s={s} box={box} id="goalpaperechoserif" dx={dx} dy={dy} clipTop={titleTop - 20} fadeEnd={fadeEnd} toLeft={!right} />

      {foot.el}
      <PaperLogo data={data} s={s} />
      <PaperTooth />
    </div>
  );
}
