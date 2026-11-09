import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "bracket" natural looks: his real photo full-bleed; at the foot centre the word in
 * bold tracked caps held between two thin square brackets, one small line of details under it. The NEYOD
 * logo alone at the top. A soft shade only under the type.
 */
function NatBracketFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 700 : 520,
    fs: story ? 245 : 155,
  });
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const wPx = Math.min(54 * k * ts, (CANVAS_W - 260) / Math.max(1, capsEm(word, 0.2)));
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const lineTop = bottom - lPx;
  const bH = wPx * 1.7; // bracket height
  const bTop = lineTop - 26 * k - bH;
  const wW = capsEm(word, 0.2) * wPx;
  const gap = 34 * k;
  const arm = 18 * k;
  const bracket = (side: "left" | "right") => {
    const x = side === "left" ? (CANVAS_W - wW) / 2 - gap : (CANVAS_W + wW) / 2 + gap;
    const dir = side === "left" ? 1 : -1;
    return (
      <>
        <div style={{ position: "absolute", left: x - 1, top: bTop, width: 2.5, height: bH, background: OFF_WHITE }} />
        <div style={{ position: "absolute", left: dir > 0 ? x - 1 : x - arm + 1.5, top: bTop, width: arm, height: 2.5, background: OFF_WHITE }} />
        <div style={{ position: "absolute", left: dir > 0 ? x - 1 : x - arm + 1.5, top: bTop + bH - 2.5, width: arm, height: 2.5, background: OFF_WHITE }} />
      </>
    );
  };
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      {bracket("left")}
      {bracket("right")}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bTop + (bH - wPx) / 2, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.2em", paddingLeft: "0.2em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · parênteses (matchday): [ MATCHDAY ] at the foot; HOME v AWAY · date · time under it. */
export function Natbracket({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBracketFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · parênteses: [ GOAL ] under his celebration; his name · his club's exact name. No score. */
export function Goalnatbracket({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBracketFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
