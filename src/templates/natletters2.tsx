import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Five natural looks where the word itself carries the club colour (same layout as natmarks2: word in bold +
 * two quiet lines on the side away from him, NEYOD logo at the top):
 *
 *   firstfill  the word in outline, its first letter solid in his club's colour
 *   lastcolor  the word solid white, its last letter in his club's colour
 *   boxletter  the first letter reversed out of a square of his club's colour
 *   colorsub   the word white, a short rule in his club's colour and the two lines in a light tint of it
 *              (the pure colour is unreadable when the photo is the same colour: blue on blue)
 *   colorword  the whole word in his club's colour (a thin white edge keeps it readable on any photo)
 */
type Style = "firstfill" | "lastcolor" | "boxletter" | "colorsub" | "colorword";

function NatLetters2Frame({ data, style, word, lines }: { data: RenderData; style: Style; word: string; lines: string[] }) {
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
  const wPx = Math.min(64 * k * ts, colW / Math.max(1, (word.length + (style === "boxletter" ? 0.4 : 0)) * 0.68));
  const lPx = 18 * k * ts;
  const rule = style === "colorsub" ? 16 * k : 0;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const wTop = linesTop - 18 * k - rule - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  const stroke = `${Math.max(1.5, wPx * 0.022)}px`;
  const first = word.slice(0, 1);
  const rest = word.slice(1);
  const last = word.slice(-1);
  const head = word.slice(0, -1);

  let text: ReactNode = word;
  if (style === "firstfill")
    text = (
      <>
        <span style={{ color: colour }}>{first}</span>
        <span style={{ color: "transparent", WebkitTextStroke: `${stroke} ${OFF_WHITE}` }}>{rest}</span>
      </>
    );
  else if (style === "lastcolor")
    text = (
      <>
        {head}
        <span style={{ color: colour }}>{last}</span>
      </>
    );
  else if (style === "boxletter")
    text = (
      <>
        <span style={{ display: "inline-block", background: colour, padding: `0 ${wPx * 0.12}px`, marginRight: wPx * 0.08, lineHeight: 1.05 }}>{first}</span>
        {rest}
      </>
    );
  else if (style === "colorword") text = <span style={{ color: colour, WebkitTextStroke: `1px rgba(255,255,255,.85)` }}>{word}</span>;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: wTop - wPx * 0.12, textAlign: edge, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap" }}>{text}</div>
      {style === "colorsub" && <div style={{ position: "absolute", [edge]: M, top: linesTop - 10 * k - 3 * k, width: 40 * k, height: 3 * k, background: colour }} />}
      <div style={{ position: "absolute", [edge]: M, width: colW, top: linesTop, textAlign: edge, fontFamily: SANS, fontWeight: style === "colorsub" ? 600 : 500, fontSize: lPx, lineHeight: 1.4, color: style === "colorsub" ? `color-mix(in srgb, ${colour} 55%, white)` : OFF_WHITE, textShadow: style === "colorsub" ? "0 1px 6px rgba(0,0,0,.6)" : undefined }}>
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

const matchday = (data: RenderData, style: Style) => {
  const fx = natFixture(data);
  return <NatLetters2Frame data={data} style={style} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
};
// Goals: his celebration, the word, his name and his club's exact name. No score.
const goal = (data: RenderData, style: Style) => {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLetters2Frame data={data} style={style} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
};

export const Natfirstfill = ({ data }: { data: RenderData }) => matchday(data, "firstfill");
export const Goalnatfirstfill = ({ data }: { data: RenderData }) => goal(data, "firstfill");
export const Natlastcolor = ({ data }: { data: RenderData }) => matchday(data, "lastcolor");
export const Goalnatlastcolor = ({ data }: { data: RenderData }) => goal(data, "lastcolor");
export const Natboxletter = ({ data }: { data: RenderData }) => matchday(data, "boxletter");
export const Goalnatboxletter = ({ data }: { data: RenderData }) => goal(data, "boxletter");
export const Natcolorsub = ({ data }: { data: RenderData }) => matchday(data, "colorsub");
export const Goalnatcolorsub = ({ data }: { data: RenderData }) => goal(data, "colorsub");
export const Natcolorword = ({ data }: { data: RenderData }) => matchday(data, "colorword");
export const Goalnatcolorword = ({ data }: { data: RenderData }) => goal(data, "colorword");
