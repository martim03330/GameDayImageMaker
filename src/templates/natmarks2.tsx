import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Five natural looks that share one layout and differ only in a small mark in his club's colour: his real photo
 * full-bleed; on the side away from him at the foot, the word in bold (with the mark), two quiet lines under
 * it; the NEYOD logo alone at the top.
 *
 *   chevrons  ››› before the word          slashes  // before the word (a code comment)
 *   plusline  a hairline under the word ending in a small + at each end
 *   bars      three short bars under the word, each shorter than the last (an equaliser)
 *   lcorner   one big L-shaped corner wrapping the block's outer bottom corner
 */
type Mark = "chevrons" | "slashes" | "plusline" | "bars" | "lcorner";

function NatMarkFrame({ data, mark, word, lines }: { data: RenderData; mark: Mark; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = mark === "lcorner" ? 84 : 56;
  const colW = Math.min(500 * k, CANVAS_W * 0.52);
  const ls = lines.filter(Boolean);
  const lead = mark === "chevrons" || mark === "slashes";
  const wPx = Math.min(58 * k * ts, (colW - (lead ? 70 * k : 0)) / Math.max(1, word.length * 0.66));
  const wW = Math.min(colW, word.length * 0.66 * wPx);
  const lPx = 18 * k * ts;
  const under = mark === "plusline" || mark === "bars" ? 26 * k : 0;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0) - (mark === "lcorner" ? 20 * k : 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const markTop = linesTop - 16 * k - under;
  const wTop = (under ? markTop - 12 * k : linesTop - 18 * k) - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const T = 2.5 * k;

  let ornament: ReactNode = null;
  if (mark === "chevrons" || mark === "slashes")
    ornament = (
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx * 0.8, color: colour, letterSpacing: mark === "chevrons" ? "-0.12em" : "-0.05em", lineHeight: 1 }}>{mark === "chevrons" ? (left ? "›››" : "‹‹‹") : "//"}</span>
    );
  else if (mark === "plusline") {
    const plus = (side: "left" | "right") => (
      <span style={{ position: "absolute", [side]: -7 * k, top: -6 * k, width: 14 * k, height: 14 * k }}>
        <span style={{ position: "absolute", left: 0, right: 0, top: 6 * k - T / 2 + 1, height: T, background: colour }} />
        <span style={{ position: "absolute", top: 0, bottom: 0, left: 7 * k - T / 2, width: T, background: colour }} />
      </span>
    );
    ornament = (
      <div style={{ position: "absolute", [edge]: M + 7 * k, top: markTop + under / 2, width: wW - 14 * k, height: 1.5, background: OFF_WHITE, opacity: 0.9 }}>
        {plus("left")}
        {plus("right")}
      </div>
    );
  } else if (mark === "bars")
    ornament = (
      <div style={{ position: "absolute", [edge]: M, top: markTop + 4 * k, display: "flex", flexDirection: "column", gap: 5 * k, alignItems: left ? "flex-start" : "flex-end" }}>
        {[1, 0.66, 0.36].map((f, i) => (
          <span key={i} style={{ width: wW * 0.5 * f, height: 3.5 * k, background: i === 0 ? colour : OFF_WHITE, opacity: i === 0 ? 1 : 0.75 - i * 0.15 }} />
        ))}
      </div>
    );
  else if (mark === "lcorner") {
    const L = 54 * k;
    ornament = (
      <>
        <div style={{ position: "absolute", [edge]: M - 26 * k, top: wTop - 6 * k, width: T, height: bottom + 18 * k - (wTop - 6 * k), background: colour }} />
        <div style={{ position: "absolute", [edge]: M - 26 * k, top: bottom + 18 * k - T, width: Math.max(L, wW * 0.6), height: T, background: colour }} />
      </>
    );
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, height: wPx, display: "flex", flexDirection: left ? "row" : "row-reverse", alignItems: "center", gap: 14 * k, whiteSpace: "nowrap" }}>
        {lead && ornament}
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1 }}>{word}</span>
      </div>
      {!lead && ornament}
      <div style={{ position: "absolute", [edge]: M, width: colW, top: linesTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const matchday = (data: RenderData, mark: Mark) => {
  const fx = natFixture(data);
  return <NatMarkFrame data={data} mark={mark} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
};
// Goals: his celebration, the word, his name and his club's exact name. No score.
const goal = (data: RenderData, mark: Mark) => {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatMarkFrame data={data} mark={mark} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
};

export const Natchevrons = ({ data }: { data: RenderData }) => matchday(data, "chevrons");
export const Goalnatchevrons = ({ data }: { data: RenderData }) => goal(data, "chevrons");
export const Natslashes = ({ data }: { data: RenderData }) => matchday(data, "slashes");
export const Goalnatslashes = ({ data }: { data: RenderData }) => goal(data, "slashes");
export const Natplusline = ({ data }: { data: RenderData }) => matchday(data, "plusline");
export const Goalnatplusline = ({ data }: { data: RenderData }) => goal(data, "plusline");
export const Natbars = ({ data }: { data: RenderData }) => matchday(data, "bars");
export const Goalnatbars = ({ data }: { data: RenderData }) => goal(data, "bars");
export const Natlcorner = ({ data }: { data: RenderData }) => matchday(data, "lcorner");
export const Goalnatlcorner = ({ data }: { data: RenderData }) => goal(data, "lcorner");
