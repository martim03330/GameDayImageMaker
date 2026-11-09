import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "ends" natural looks: his real photo full-bleed, framed between two lines of big
 * bold caps — one at the very top, one at the very foot — with a small connecting word under the top one
 * (the "v", the kicker). The NEYOD logo small at the top-right corner. Soft shades only behind the two lines.
 */
function NatEndsFrame({ data, top: topText, mid, foot }: { data: RenderData; top: string; mid: string; foot: string }) {
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
  const M = 60;
  const size = (t: string) => Math.min(96 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, t.length * 0.66));
  const tPx = size(topText);
  const fPx = size(foot);
  const mPx = 16 * k * ts;
  const top = (story ? STORY_TOP : 60) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 60;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + tPx + mPx + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + fPx + 200 * k, background: "linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, top: top + logoH + 20 * k, fontFamily: SANS, fontWeight: 800, fontSize: tPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{topText}</div>
      <div style={{ position: "absolute", left: M + 4, top: top + logoH + 20 * k + tPx + 14 * k, fontFamily: SANS, fontWeight: 600, fontSize: mPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.85 }}>{mid}</div>
      <div style={{ position: "absolute", right: M, top: bottom - fPx, textAlign: "right", fontFamily: SANS, fontWeight: 800, fontSize: fPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{foot}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", right: M, top: top - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }} />
    </div>
  );
}

/** Natural · extremos (matchday): HOME team at the top, "V · date · time" under it, AWAY team at the foot (exact names). */
export function Natends({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const mid = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff, "V"].filter(Boolean).join("  ·  ");
  return <NatEndsFrame data={data} top={fx.homeName.toUpperCase()} mid={mid} foot={fx.awayName.toUpperCase()} />;
}

/** Natural goal · extremos: his first name at the top, "GOAL · club" under it, his surname at the foot. No score. */
export function Goalnatends({ data }: { data: RenderData }) {
  const mid = [(data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()].filter(Boolean).join("  ·  ");
  return <NatEndsFrame data={data} top={(data.content.firstName ?? "").toUpperCase()} mid={mid} foot={(data.content.lastName ?? "").toUpperCase()} />;
}
