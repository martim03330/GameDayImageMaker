/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest ring" natural looks: his real photo full-bleed; at the foot, centred, his
 * club's crest inside a thin off-white ring, the word in bold tracked caps under it and one small line. The
 * NEYOD logo alone at the top. A soft shade only under the block.
 */
function NatCrestringFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 480,
    fs: story ? 240 : 150,
  });
  const R = 64 * k;
  const wPx = Math.min(34 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(word, 0.3)));
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.24)));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 14 * k - wPx;
  const cy = wTop - 22 * k - R;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - R - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 45%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: CANVAS_W / 2 - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `${2 * k}px solid ${OFF_WHITE}`, boxSizing: "border-box", background: "rgba(0,0,0,.18)" }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: CANVAS_W / 2 - R * 0.62, top: cy - R * 0.62, width: R * 1.24, height: R * 1.24, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", paddingLeft: "0.24em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · emblema em círculo (matchday): his club's crest in a thin ring, MATCHDAY, HOME v AWAY · date · time (exact names). */
export function Natcrestring({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCrestringFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · emblema em círculo: his crest in the ring under his celebration; GOAL and his name · his club's exact name. No score. */
export function Goalnatcrestring({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCrestringFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
