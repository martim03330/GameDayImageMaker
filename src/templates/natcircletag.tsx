import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "ring" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, a thin ring in his club's colour holding one short fact (the kick-off time on matchday, the word on
 * goals), and beside it the word in bold over one quiet line. The NEYOD logo alone at the top.
 */
function NatCircletagFrame({ data, ring, word, line }: { data: RenderData; ring: string; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const D = 112 * k;
  const rPx = Math.min(24 * k * ts, (D - 26 * k) / Math.max(1, capsEm(ring, 0.04)));
  // Text beside the ring, kept in the free ~60 % of the width.
  const colW = Math.min(400 * k, CANVAS_W * 0.55 - (M + D + 24 * k));
  const wPx = Math.min(46 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - D;
  const textTop = top + (D - (wPx * 0.86 + 12 * k + lPx)) / 2;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", [edge]: M, top, width: D, height: D, borderRadius: "50%", border: `${2.5 * k}px solid ${colour}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: rPx, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>{ring}</div>
      <div style={{ position: "absolute", [edge]: M + D + 24 * k, width: colW, top: textTop, textAlign: edge, fontFamily: SANS, lineHeight: 1 }}>
        <div style={{ fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", whiteSpace: "nowrap", marginTop: -wPx * 0.12 }}>{word}</div>
        <div style={{ marginTop: 12 * k + wPx * 0.12, fontWeight: 500, fontSize: lPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.9 }}>{line}</div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · anel (matchday): the kick-off time in a thin club-colour ring; MATCHDAY and Home v Away · date beside it (exact names). */
export function Natcircletag({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCircletagFrame data={data} ring={fx.time || fx.date} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.time ? fx.date : "", fx.ptTime].filter(Boolean).join(" · ")} />;
}

/** Natural goal · anel: GOAL in the ring beside his celebration; his name in bold, his club's exact name below. No score. */
export function Goalnatcircletag({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCircletagFrame data={data} ring={(data.content.kicker || "GOAL").toUpperCase()} word={name} line={ourClub(data)} />;
}
