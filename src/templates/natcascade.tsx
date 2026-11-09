import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "cascade" natural looks: his real photo full-bleed; at the foot, on the side away
 * from him, three lines flush to that edge, each one smaller and lighter than the one above (the word, then
 * the main fact, then the small one). The NEYOD logo alone at the top.
 */
function NatCascadeFrame({ data, lines }: { data: RenderData; lines: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 660 : 420, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 470 * k;
  const sizes = [64, 26, 17].map((s, i) => Math.min(s * k * ts, colW / Math.max(1, lines[i].length * [0.64, 0.56, 0.56][i])));
  const weights = [800, 600, 400];
  const gaps = [14 * k, 10 * k];
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const tops: number[] = [];
  let y = bottom;
  for (let i = 2; i >= 0; i--) {
    y -= sizes[i];
    tops[i] = y;
    if (i > 0) y -= gaps[i - 1];
  }
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: tops[0] - 220 * k, bottom: 0, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.55), rgba(0,0,0,0) 70%)`, WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 40%)", maskImage: "linear-gradient(to bottom, transparent, #000 40%)" }} />
      {lines.map((l, i) =>
        l ? (
          <div key={i} style={{ position: "absolute", [left ? "left" : "right"]: M, width: colW, top: tops[i], textAlign: left ? "left" : "right", fontFamily: SANS, fontWeight: weights[i], fontSize: sizes[i], letterSpacing: i === 0 ? "-0.02em" : "0.01em", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: [1, 0.95, 0.8][i] }}>
            {l}
          </div>
        ) : null,
      )}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cascata (matchday): MATCHDAY, then Home v Away, then date · time · venue, each smaller (exact names). */
export function Natcascade({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCascadeFrame data={data} lines={[(data.content.kicker || "MATCHDAY").toUpperCase(), `${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · cascata: GOAL, then his name, then his club's exact name, each smaller. No score. */
export function Goalnatcascade({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCascadeFrame data={data} lines={[(data.content.kicker || "GOAL").toUpperCase(), name, ourClub(data)]} />;
}
