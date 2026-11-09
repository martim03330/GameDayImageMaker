import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "header box" natural looks: his real photo full-bleed; at the top a thin hairline box
 * across the width enclosing the NEYOD logo at the left and the word in bold tracked caps at the right, like a
 * site header; at the foot one quiet line of details. He stands below the header, untouched.
 */
function NatHeaderboxFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 560,
    fs: story ? 245 : 155,
  });
  const M = 48;
  const top = (story ? STORY_TOP - 20 : 40) - (params.textY ?? 0);
  const boxH = (story ? 88 : 52) + 36 * k;
  const wPx = Math.min(24 * k * ts, 420 / Math.max(1, capsEm(word, 0.3)));
  const bottom = story ? STORY_BOTTOM : H - 56;
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + boxH + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, height: boxH, border: `1.5px solid rgba(244,241,234,.8)`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", right: M + 24 * k, top: top + (boxH - wPx) / 2, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: M + 24 * k, top: top + 18 * k - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/** Natural · cabeçalho em caixa (matchday): a hairline header box with the logo and MATCHDAY; HOME v AWAY · date · time at the foot. */
export function Natheaderbox({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatHeaderboxFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · cabeçalho em caixa: the header box reads GOAL over his celebration; his name · his club's exact name at the foot. No score. */
export function Goalnatheaderbox({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatHeaderboxFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
