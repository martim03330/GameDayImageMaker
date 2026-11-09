import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Five more natural looks on the natmarks2 layout (word in bold + two quiet lines on the side away from him,
 * NEYOD logo at the top), each with its own small mark in his club's colour:
 *
 *   dotgrid  a 3×3 grid of small dots before the word       square  a small hollow square before the word
 *   dashes   three short dashes ( — — — ) above the word     tilde   a thin wavy "~" before the word
 *   arc      a thin arc above the word, as wide as it
 */
type Mark = "dotgrid" | "square" | "dashes" | "tilde" | "arc";

function NatMark3Frame({ data, mark, word, lines }: { data: RenderData; mark: Mark; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = Math.min(500 * k, CANVAS_W * 0.52);
  const ls = lines.filter(Boolean);
  const lead = mark === "dotgrid" || mark === "square" || mark === "tilde";
  const wPx = Math.min(58 * k * ts, (colW - (lead ? 70 * k : 0)) / Math.max(1, word.length * 0.66));
  const wW = Math.min(colW, word.length * 0.66 * wPx);
  const lPx = 18 * k * ts;
  const above = mark === "dashes" || mark === "arc" ? 26 * k : 0;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 18 * k - wPx * 0.86;
  const markTop = wTop - 12 * k - above;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const T = 2.5 * k;
  const S = wPx * 0.62;

  let ornament: ReactNode = null;
  if (mark === "dotgrid")
    ornament = (
      <span style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: S * 0.16, width: S, height: S, flexShrink: 0 }}>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ borderRadius: "50%", background: i === 4 ? OFF_WHITE : colour }} />
        ))}
      </span>
    );
  else if (mark === "square") ornament = <span style={{ width: S * 0.8, height: S * 0.8, border: `${T}px solid ${colour}`, boxSizing: "border-box", flexShrink: 0 }} />;
  else if (mark === "tilde")
    ornament = (
      <svg width={S * 1.3} height={S * 0.6} viewBox="0 0 26 12" style={{ flexShrink: 0 }}>
        <path d="M2 8 C 7 1, 11 1, 13 6 S 19 11, 24 4" fill="none" stroke={colour} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  else if (mark === "dashes")
    ornament = (
      <div style={{ position: "absolute", [edge]: M, top: markTop + above / 2 - T / 2, display: "flex", gap: 10 * k, flexDirection: left ? "row" : "row-reverse" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 26 * k, height: T, background: i === 0 ? colour : OFF_WHITE, opacity: i === 0 ? 1 : 0.7 }} />
        ))}
      </div>
    );
  else if (mark === "arc")
    ornament = (
      <svg width={wW} height={above} viewBox={`0 0 ${wW} ${above}`} style={{ position: "absolute", [edge]: M, top: markTop, overflow: "visible" }}>
        <path d={`M ${T} ${above - T} Q ${wW / 2} ${-above * 0.6} ${wW - T} ${above - T}`} fill="none" stroke={colour} strokeWidth={T} strokeLinecap="round" />
      </svg>
    );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - above - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      {!lead && ornament}
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, height: wPx, display: "flex", flexDirection: left ? "row" : "row-reverse", alignItems: "center", gap: 16 * k, whiteSpace: "nowrap" }}>
        {lead && ornament}
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1 }}>{word}</span>
      </div>
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
  return <NatMark3Frame data={data} mark={mark} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
};
// Goals: his celebration, the word, his name and his club's exact name. No score.
const goal = (data: RenderData, mark: Mark) => {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatMark3Frame data={data} mark={mark} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
};

export const Natdotgrid9 = ({ data }: { data: RenderData }) => matchday(data, "dotgrid");
export const Goalnatdotgrid9 = ({ data }: { data: RenderData }) => goal(data, "dotgrid");
export const Natsquaremark = ({ data }: { data: RenderData }) => matchday(data, "square");
export const Goalnatsquaremark = ({ data }: { data: RenderData }) => goal(data, "square");
export const Natdashes = ({ data }: { data: RenderData }) => matchday(data, "dashes");
export const Goalnatdashes = ({ data }: { data: RenderData }) => goal(data, "dashes");
export const Nattilde = ({ data }: { data: RenderData }) => matchday(data, "tilde");
export const Goalnattilde = ({ data }: { data: RenderData }) => goal(data, "tilde");
export const Natarcmark = ({ data }: { data: RenderData }) => matchday(data, "arc");
export const Goalnatarcmark = ({ data }: { data: RenderData }) => goal(data, "arc");
