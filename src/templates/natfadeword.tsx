import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "fading word" natural looks: his real photo full-bleed; at the foot-left the word in heavy
 * caps fading from solid off-white at its first letter to almost transparent at its last (a left-to-right alpha
 * ramp); one small line under it. The NEYOD logo alone at the top.
 */
function NatFadewordFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const wPx = Math.min(130 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.72));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx * 0.9;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const ramp = "linear-gradient(to right, #000 10%, rgba(0,0,0,.15) 100%)";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top: wTop - wPx * 0.08, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", WebkitMaskImage: ramp, maskImage: ramp }}>{word}</div>
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · palavra a esvanecer (matchday): MATCHDAY fading left to right; HOME v AWAY · date · time under it. */
export function Natfadeword({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFadewordFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · palavra a esvanecer: GOAL fading under his celebration; his name · his club's exact name. No score. */
export function Goalnatfadeword({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFadewordFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
