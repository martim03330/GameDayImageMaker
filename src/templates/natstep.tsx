import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "stairs" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, three lines stepping in from the margin one indent at a time (the word in bold, then two quieter
 * facts), each step marked by a short hairline. The NEYOD logo alone at the top.
 */
function NatStepFrame({ data, lines }: { data: RenderData; lines: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const step = 44 * k;
  const colW = 460 * k;
  const sizes = [Math.min(54 * k * ts, colW / Math.max(1, lines[0].length * 0.66)), Math.min(22 * k * ts, (colW - step) / Math.max(1, lines[1].length * 0.56)), Math.min(17 * k * ts, (colW - 2 * step) / Math.max(1, lines[2].length * 0.56))];
  const gaps = [18 * k, 14 * k];
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const tops: number[] = [];
  let y = bottom;
  for (let i = 2; i >= 0; i--) {
    y -= sizes[i] * (i === 0 ? 0.86 : 1);
    tops[i] = y;
    if (i > 0) y -= gaps[i - 1];
  }
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: tops[0] - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      {lines.map((l, i) =>
        l ? (
          <div key={i}>
            {i > 0 && <div style={{ position: "absolute", [edge]: M + step * (i - 1) + 6 * k, top: tops[i] + sizes[i] / 2 - 0.75, width: step - 16 * k, height: 1.5, background: OFF_WHITE, opacity: 0.6 }} />}
            <div style={{ position: "absolute", [edge]: M + step * i, width: colW - step * i, top: tops[i] - (i === 0 ? sizes[i] * 0.12 : 0), textAlign: edge, fontFamily: SANS, fontWeight: [800, 600, 500][i], fontSize: sizes[i], letterSpacing: i === 0 ? "-0.02em" : "0", lineHeight: 1, whiteSpace: "nowrap", opacity: [1, 0.95, 0.85][i] }}>
              {l}
            </div>
          </div>
        ) : null,
      )}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · escada (matchday): MATCHDAY, then Home v Away one step in, then date · time another step in (exact names). */
export function Natstep({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatStepFrame data={data} lines={[(data.content.kicker || "MATCHDAY").toUpperCase(), `${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · escada: GOAL, then his name, then his club's exact name, each one step in. No score. */
export function Goalnatstep({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatStepFrame data={data} lines={[(data.content.kicker || "GOAL").toUpperCase(), name, ourClub(data)]} />;
}
