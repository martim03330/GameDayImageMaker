import { DMSERIF, Film } from "./fx";
import { serifEm, serifLines } from "./echoserif";
import { centredFoot, CentreLogo, EchoLine, echoTones, FootFade, goalBox, M, Player, WHITE } from "./goalechotitle";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo serif: the celebrating player, sharp and in natural colour, on echoline's deep club ground with one
 * hairline echo of his edge — and the kicker ("Goal") set once in a calm, large italic serif (DM Serif Display)
 * in the free top corner, his raised arm free to pass in front of it. His name, the fixture (home first, names
 * exactly as stored, no score) and the competition small at the foot.
 */
export function Goalechoserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo } = echoTones(data);
  const right = params.side !== "left";

  const foot = centredFoot(data, story, k);

  /* ---- the title: one serif word (two lines for long kickers), in the free top corner ---- */
  const lines = serifLines(content.kicker || "GOAL");
  const widest = Math.max(1, ...lines.map(serifEm));
  const maxW = story ? 640 : 520;
  const size = Math.max(story ? 120 : 90, Math.min(story ? 250 : 190, maxW / widest)) * ts;
  const lead = size * 0.9;
  const titleTop = (story ? STORY_TOP : 80) + (params.textY ?? 0);
  const blockTop = titleTop - size * 0.2;
  const titleBottom = titleTop + size * 0.72 + lead * (lines.length - 1);
  const side = right ? { left: M - size * 0.04 } : { right: M };

  /* ---- the player, centred in the space beside the title, his head below its cap line ---- */
  const cx = story ? (right ? 600 : 480) : right ? 620 : 460;
  const faceTop = Math.max(story ? 470 : 330, titleBottom + (story ? 150 : 110));
  const box = goalBox(data, { faceX: cx, faceTop, cx, maxW: story ? 900 : 800, story, minHead: titleTop + 10 });
  const dx = (right ? 1 : -1) * 30 * k;
  const dy = -26 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 48% at ${right ? 60 : 40}% ${story ? 40 : 42}%, ${lift}, ${deep} 82%)` }} />

      {/* The serif title, behind him: a raised arm may pass in front of it. */}
      <div style={{ position: "absolute", ...side, top: blockTop, textAlign: right ? "left" : "right", fontFamily: DMSERIF, fontStyle: "italic", fontSize: size, lineHeight: `${lead}px`, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: "rgba(255,255,255,.95)" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ height: lead }}>
            {l}
          </div>
        ))}
      </div>

      <EchoLine id="goalechoserif" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={titleTop - 20} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
