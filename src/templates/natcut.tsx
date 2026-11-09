import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "cut" natural looks: his real photo full-bleed; the word huge in Anton across the
 * whole width, sitting on the canvas's bottom edge so its lower third is cut off. It lies over his legs (in
 * front: set behind him, his legs broke the letters and "GOAL" read "GO I"), far from his face. One small
 * line of caps under the NEYOD logo at the top. Stories keep the cut at the foot of the safe area.
 */
function NatCutFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 640 : 470,
    fs: story ? 240 : 150,
  });
  // Anton caps advance ~0.45 em; the word spans the width edge to edge.
  const size = Math.min((CANVAS_W - 20) / Math.max(1, word.length * 0.45), story ? 520 : 420) * ts;
  const edge = story ? STORY_BOTTOM + 120 : H;
  const baseline = edge + size * 0.22; // cap height ~0.72 em: about a third of the letters below the edge
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.24)));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const lineTop = logoTop + (story ? 88 : 52) + 26 * k;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: baseline - size * 0.9 - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: edge, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: baseline - size * 0.93, textAlign: "center", fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: size, lineHeight: 1, color: OFF_WHITE, opacity: 0.94, whiteSpace: "nowrap" }}>{word}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: lineTop + lPx + (story ? 200 : 150), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.55)" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cortado (matchday): MATCHDAY cut by the bottom edge over his legs; HOME v AWAY · date · time under the logo. */
export function Natcut({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCutFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · cortado: GOAL cut by the bottom edge over his legs; his name · his club's exact name under the logo. No score. */
export function Goalnatcut({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCutFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
