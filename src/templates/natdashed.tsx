import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "dashed" natural looks (a ticket's tear line): his real photo full-bleed; at the foot
 * a dashed line across the width with a small notch circle at each end, the word in bold above it and one small
 * line below it, like the stub of a ticket. The NEYOD logo alone at the top.
 */
function NatDashedFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const wPx = Math.min(58 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.62));
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const dashY = lineTop - 24 * k;
  const wTop = dashY - 24 * k - wPx;
  const R = 9 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M + R * 2, right: M + R * 2, top: dashY - 1, height: 2, backgroundImage: `linear-gradient(to right, ${OFF_WHITE} 0 14px, transparent 14px 24px)`, backgroundSize: "24px 2px", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: M, top: dashY - R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `2px solid ${OFF_WHITE}`, boxSizing: "border-box", opacity: 0.85 }} />
      <div style={{ position: "absolute", right: M, top: dashY - R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `2px solid ${OFF_WHITE}`, boxSizing: "border-box", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · tracejado (matchday): MATCHDAY over a dashed tear line; HOME v AWAY · date · time under it. */
export function Natdashed({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatDashedFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · tracejado: GOAL over the tear line under his celebration; his name · his club's exact name. No score. */
export function Goalnatdashed({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDashedFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
