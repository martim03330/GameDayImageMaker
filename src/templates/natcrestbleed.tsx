/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest bleed" natural looks: his real photo full-bleed and his club's crest in its
 * own colours, huge, in the lower corner away from him and running off the canvas edges (only part of it
 * shows), in front of the ground but behind him. Just above it, on the same side, the word and one line
 * (the other side is his). The NEYOD logo alone at the top.
 */
function NatCrestBleedFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right"; // the crest bleeds off the side away from him
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 470 : 610, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const D = story ? 760 : 620;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const M = 64;
  const wPx = Math.min(72 * k * ts, 520 / Math.max(1, word.length * 0.62));
  const lPx = 17 * k * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  // The type sits on the crest's side, just above it: the other side is his.
  const textSide = right ? { right: M } : { left: M };
  const crestTop = H - D * 0.72;
  const lineTop = Math.min(bottom - lPx, crestTop - 24 * k - lPx);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", [right ? "right" : "left"]: -D * 0.32, top: crestTop, width: D, height: D, objectFit: "contain", opacity: 0.92, filter: "drop-shadow(0 10px 30px rgba(0,0,0,.35))" }} />}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", [right ? "right" : "left"]: 0, top: lineTop - wPx - 260 * k, width: CANVAS_W * 0.7, height: wPx + lPx + 420 * k, background: `radial-gradient(100% 70% at ${right ? "100%" : "0%"} 60%, rgba(0,0,0,.55), rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", ...textSide, top: lineTop - 14 * k - wPx, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", textAlign: right ? "right" : "left" }}>{word}</div>
      <div style={{ position: "absolute", ...textSide, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9, textAlign: right ? "right" : "left" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · emblema cortado (matchday): his club's crest huge, bleeding off the corner; "Matchday" and Home v Away · date · time. */
export function Natcrestbleed({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return (
    <NatCrestBleedFrame
      data={data}
      word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}
      line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · emblema cortado: his crest bleeding off the corner behind his celebration; "Goal" and his name · his club's exact name. No score. */
export function Goalnatcrestbleed({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCrestBleedFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
