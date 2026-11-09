import { CAP, STRETCH, thinEm, TRACK, WideText } from "./echowidetitle";
import { goalBox } from "./goalechotitle";
import { PaperTooth } from "./paperecho";
import { PaperFigure, PaperGround, paperGoalFoot, PaperLogo, paperSetup } from "./paperechoserif";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

const M = 60;

/**
 * Goal paper echo wide: goalechowide on warm paper — the celebrating player, sharp and in natural colour, a soft
 * shade where he meets the paper and one hairline echo of his edge (deep club or ink) — and "GOAL" whole, in
 * ultra-thin extended capitals margin to margin across the top in the deep club colour, his raised fist and
 * head rising to just under it (the echo stops below the word). Name, fixture (home first, no score) and the
 * competition small in ink at the foot.
 */
export function Goalpaperechowide({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = paperSetup(data, true);
  const { story, k, right, H } = s;

  /* ---- the word, whole, across the top ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const span = CANVAS_W - 2 * M;
  const chars = [...kicker].length;
  const em = (thinEm(kicker) + Math.max(0, chars - 1) * TRACK) * STRETCH;
  const size = Math.min((story ? 230 : 172) * s.ts, span / Math.max(1, em));
  const capH = size * CAP;
  const top = (story ? STORY_TOP : 70) + (params.textY ?? 0);
  const base = top + capH;
  const width = Math.min(span, Math.max(em * size, chars <= 6 ? span : 0));
  const x = (CANVAS_W - width) / 2;

  /* ---- the celebrating player: his highest point just under the word ---- */
  const foot = paperGoalFoot(data, s);
  const gap = story ? 40 : 30;
  const box = goalBox(data, {
    faceX: 540 + (right ? 30 : -30),
    faceTop: story ? 380 : 230,
    cx: 540,
    maxW: story ? 920 : 960,
    story,
    minHead: base + gap,
    sizes: story ? { chest: 300, waist: 250, knees: 200, full: 160 } : { chest: 236, waist: 192, knees: 152, full: 122 },
  });
  const dx = (right ? -1 : 1) * 30 * k;
  const dy = -26 * k;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fTop = box.top + face[1] * box.height;
  const fadeEnd = foot.top - 26 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperGround s={s} at={[(fCx / CANVAS_W) * 100, (fTop / H) * 100 + 4]} />

      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <WideText x={x} y={base} width={width} size={size} fill={s.clubInk} text={kicker} />
      </svg>

      <PaperFigure data={data} s={s} box={box} id="goalpaperechowide" dx={dx} dy={dy} clipTop={base + gap * 0.45} fadeEnd={fadeEnd} toLeft={!right} />

      {foot.el}
      <PaperLogo data={data} s={s} />
      <PaperTooth />
    </div>
  );
}
