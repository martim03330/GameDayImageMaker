/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "baseline" natural looks: his real photo full-bleed; at the foot the word in bold sits
 * on a long hairline that runs on across the width and ends in his club's crest at the right edge; one small
 * line under the hairline. The NEYOD logo alone at the top.
 */
function NatBaselineFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
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
  const M = 60;
  const crestS = 58 * k;
  const wPx = Math.min(76 * k * ts, (CANVAS_W - 2 * M - crestS - 60) / Math.max(1, word.length * 0.62));
  const lPx = 18 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const ruleY = lineTop - 18 * k;
  const wTop = ruleY - 14 * k - wPx * 0.95;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M + crestS + 18 * k, top: ruleY, height: 2, background: OFF_WHITE }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", right: M, top: ruleY - crestS / 2, width: crestS, height: crestS, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: M, right: M + crestS + 18 * k, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.92 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha de base (matchday): "Matchday" on a hairline ending in his club's crest; Home v Away · date · time under it. */
export function Natbaseline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatBaselineFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · linha de base: "Goal" on the hairline ending in his crest; his name · his club's exact name. No score. */
export function Goalnatbaseline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBaselineFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
