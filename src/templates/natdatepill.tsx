import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "date pill" natural looks: his real photo full-bleed; the NEYOD logo top-left and, in the
 * top-right corner, a small off-white pill with the date (or the club) in his club's colour; at the foot-left the
 * word in bold and one line. Type in two opposite corners, the middle his.
 */
function NatDatepillFrame({ data, pill, word, line }: { data: RenderData; pill: string; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: story ? 720 : 520,
    fs: story ? 245 : 155,
  });
  const ink = panelColour(params.primary, params.accent);
  const M = 56;
  const top = (story ? STORY_TOP : 50) - (params.textY ?? 0);
  const pPx = 17 * k * ts;
  const wPx = Math.min(76 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.64));
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.2)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      {pill && <div style={{ position: "absolute", right: M, top, padding: `${10 * k}px ${18 * k}px`, borderRadius: 999, background: OFF_WHITE, color: ink, fontFamily: SANS, fontWeight: 800, fontSize: pPx, letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", boxShadow: "0 6px 16px rgba(0,0,0,.25)" }}>{pill}</div>}
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: M, top: top - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/** Natural · data no canto (matchday): a date · time pill top-right; "Matchday" and HOME v AWAY at the foot-left (exact names). */
export function Natdatepill({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatDatepillFrame data={data} pill={[fx.date, fx.kickoff].filter(Boolean).join(" · ").toUpperCase()} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} />;
}

/** Natural goal · data no canto: a pill with his club's exact name top-right; "Goal" and his name at the foot-left. No score. */
export function Goalnatdatepill({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDatepillFrame data={data} pill={ourClub(data).toUpperCase()} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={name.toUpperCase()} />;
}
