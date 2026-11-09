import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, capsEm, natFixture, natPlace, OFF_WHITE } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "club word" natural looks: his real photo full-bleed; at the foot the word huge in his
 * club's colour with a thick off-white outline around each letter (paint + stroke, so it reads on any ground);
 * one small line under it. The NEYOD logo alone at the top.
 */
function NatClubwordFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const colour = params.primary || "#e3001b";
  const wPx = Math.min(140 * k * ts, (CANVAS_W - 100) / Math.max(1, word.length * 0.74));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx * 0.9;
  const stroke = Math.max(3, wPx * 0.05);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 140 * k, background: "linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop - wPx * 0.08, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", color: colour, WebkitTextStroke: `${stroke}px ${OFF_WHITE}`, paintOrder: "stroke fill" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.6)" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · palavra na cor do clube (matchday): MATCHDAY in his club's colour, outlined off-white; HOME v AWAY · date · time. */
export function Natclubword({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatClubwordFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · palavra na cor do clube: GOAL in his club's colour under his celebration; his name · his club's exact name. No score. */
export function Goalnatclubword({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatClubwordFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
