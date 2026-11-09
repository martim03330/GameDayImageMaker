import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "justified block" natural looks: his real photo full-bleed; on the side away from
 * him at the foot, three lines in bold caps each sized so they all end at the same width — a solid little
 * block of type (short lines come out big, long ones small). The NEYOD logo alone at the top.
 */
function NatJustifyFrame({ data, lines }: { data: RenderData; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 400 * k * Math.min(1.15, ts);
  const ls = lines.filter(Boolean).map((l) => l.toUpperCase());
  // Every line fills the column exactly; the cap keeps a very short word from turning giant.
  const sizes = ls.map((l) => Math.min(110 * k, colW / Math.max(1, capsEm(l, 0.02))));
  const gap = 8 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const tops: number[] = [];
  let y = bottom;
  for (let i = ls.length - 1; i >= 0; i--) {
    y -= sizes[i] * 0.74;
    tops[i] = y;
    y -= gap;
  }
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: (tops[0] ?? bottom) - 220 * k, bottom: 0, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.58), rgba(0,0,0,0) 70%)`, WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 40%)", maskImage: "linear-gradient(to bottom, transparent, #000 40%)" }} />
      {ls.map((l, i) => (
        <div key={i} style={{ position: "absolute", [left ? "left" : "right"]: M, top: tops[i] - sizes[i] * 0.13, fontFamily: SANS, fontWeight: 800, fontSize: sizes[i], letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>
          {l}
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · bloco justificado (matchday): MATCHDAY / Home v Away / date · time, each line set to the same width (exact names). */
export function Natjustify({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatJustifyFrame data={data} lines={[data.content.kicker || "MATCHDAY", `${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · bloco justificado: GOAL / his name / his club's exact name, each line set to the same width. No score. */
export function Goalnatjustify({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatJustifyFrame data={data} lines={[data.content.kicker || "GOAL", name, ourClub(data)]} />;
}
