/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest top" natural looks: his real photo full-bleed; at the top, centred under the NEYOD
 * logo, his club's crest small; at the foot the word in bold tracked caps and one line. Crest above, type below,
 * him in between.
 */
function NatCresttopFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
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
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const C = 70 * k;
  const cTop = logoTop + (story ? 88 : 52) + 28 * k;
  const wPx = Math.min(40 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(word, 0.3)));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 16 * k - wPx;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: cTop + C + 140 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: (CANVAS_W - C) / 2, top: cTop, width: C, height: C, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · emblema no topo (matchday): his club's crest under the logo; MATCHDAY and HOME v AWAY · date · time at the foot (exact names). */
export function Natcresttop({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCresttopFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · emblema no topo: his crest under the logo; GOAL and his name · his club's exact name at the foot. No score. */
export function Goalnatcresttop({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCresttopFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
