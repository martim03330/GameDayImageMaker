/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "pennant" natural looks: his real photo full-bleed; from the top edge, on the side
 * away from him, hangs a narrow pennant in his club's colour (a long rectangle ending in a V-notch), the
 * crest at its head and the word running down it. At the foot one quiet line; the NEYOD logo under it.
 */
function NatPennantFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left"; // the pennant hangs away from him
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 620 : 460, fy: story ? 720 : 520, fs: story ? 245 : 155 });
  const W = 120 * k;
  const PH = (story ? 860 : 640) * Math.min(1, ts);
  const notch = W * 0.42;
  const x = left ? 70 : CANVAS_W - 70 - W;
  const colour = params.primary || "#e3001b";
  const textColour = params.text || "#ffffff";
  const crestS = 64 * k;
  const len = PH - (story ? STORY_TOP : 0) - crestS - 90 * k - notch;
  const wPx = Math.min(56 * k * ts, len / Math.max(1, word.length * 0.72));
  const bottom = story ? STORY_BOTTOM : H - 56;
  const logoH = story ? 88 : 52;
  const lPx = 15 * k * ts;
  const headTop = (story ? STORY_TOP - 30 : 0) + 30 * k;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 200 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: x, top: 0, width: W, height: PH, background: colour, clipPath: `polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - ${notch}px), 0 100%)`, boxShadow: "0 10px 30px rgba(0,0,0,.3)" }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: x + (W - crestS) / 2, top: headTop, width: crestS, height: crestS, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: x + W / 2, top: headTop + crestS + 40 * k, width: len, transformOrigin: "left top", transform: `rotate(90deg) translateY(-50%)`, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.12em", lineHeight: 1, color: textColour, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 64, right: 64, top: bottom - logoH - 26 * k - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.2em", paddingLeft: "0.2em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · galhardete (matchday): a pennant in his club's colour, crest and MATCHDAY down it; HOME v AWAY · date · time at the foot. */
export function Natpennant({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatPennantFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · galhardete: the pennant reads GOAL beside his celebration; his name · his club's exact name at the foot. No score. */
export function Goalnatpennant({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatPennantFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}
