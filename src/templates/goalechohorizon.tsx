import { clearFor, FixtureRow, freeBeside, HangingLabels, horizonGeometry, HorizonLogo, HorizonStage, horizonTitle } from "./echohorizon";
import { Film } from "./fx";
import { echoTones, goalBox } from "./goalechotitle";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Goal echo horizon: the celebrating player, sharp and in natural colour, with echoline's one hairline echo
 * of his edge on the deep club ground — and horizon's single line across the canvas at his hips, where he
 * melts into a darker floor. "Goal" sits on the line on the free side; his name and the competition hang
 * from ticks under it, the fixture (crests either side, home first, no score) runs centred below.
 */
export function Goalechohorizon({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const { deep, lift, echo } = echoTones(data);
  const f = matchFacts(data);
  const g = horizonGeometry(data, story, k);

  /* ---- the celebrating player, a little towards his side ---- */
  const cx = story ? (right ? 580 : 500) : right ? 610 : 470;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const kicker = content.kicker || "GOAL";
  const base = goalBox(data, {
    faceX: cx,
    faceTop: story ? 330 : 236,
    cx,
    maxW: story ? 940 : 900,
    story,
    minHead: story ? 150 : 70,
    sizes: story ? { chest: 330, waist: 272, knees: 214, full: 170 } : { chest: 236, waist: 194, knees: 152, full: 122 },
  });
  const box = clearFor(base, kicker, right, story ? 100 : 76, ts, face);
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;

  /* ---- "Goal" on the line, the labels under it ---- */
  const t = horizonTitle(kicker, { story, ts, hz: g.hz, freeW: freeBeside(box, right), right, max: story ? 100 : 76 });
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const labels = [name, niceDate(content.date), titleCase(f.comp || f.round || "")].filter(Boolean);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: "#ffffff" }}>
      <HorizonStage
        data={data}
        id="goalechohorizon"
        box={box}
        hz={g.hz}
        H={H}
        deep={deep}
        lift={lift}
        echo={echo}
        light={[(fCx / CANVAS_W) * 100, story ? 36 : 38]}
        dx={(right ? -1 : 1) * 30 * k}
        dy={-26 * k}
        clipTop={0}
        fadeLen={story ? 320 : 240}
      />
      {t.node}
      {labels.length > 0 && <HangingLabels labels={labels} hz={g.hz} tick={g.tick} size={g.labSize} first={!!name} />}
      <FixtureRow data={data} top={g.rowTop} CR={g.CR} k={k} />
      <HorizonLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
