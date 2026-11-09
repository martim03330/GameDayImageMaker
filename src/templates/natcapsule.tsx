/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "capsule" natural looks: his real photo full-bleed and, on the side away from him, a
 * tall narrow off-white capsule (fully rounded ends) standing at the foot: the crest at its top, the word
 * running up its length in bold caps in his club's colour. One small line at the foot on the other side; the
 * NEYOD logo at the top.
 */
function NatCapsuleFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right";
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 450 : 630, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const ink = panelColour(params.primary, params.accent);
  const W = 110 * k;
  const CH = (story ? 760 : 560) * Math.min(1, ts);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - CH;
  const crestS = 70 * k;
  const len = CH - crestS - 90 * k;
  const wPx = Math.min(54 * k * ts, len / Math.max(1, word.length * 0.7));
  const lPx = 17 * k * ts;
  const x = right ? CANVAS_W - 60 - W : 60;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 160 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: x, top, width: W, height: CH, borderRadius: W / 2, background: OFF_WHITE, boxShadow: "0 12px 30px rgba(0,0,0,.3)" }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: x + (W - crestS) / 2, top: top + 24 * k, width: crestS, height: crestS, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: x + W / 2, top: bottom - 40 * k, width: len, transformOrigin: "left top", transform: "rotate(-90deg) translateY(-50%)", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.08em", lineHeight: 1, color: ink, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [right ? "left" : "right"]: 60, top: bottom - lPx, fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cápsula (matchday): a tall capsule with his club's crest and MATCHDAY up it; Home v Away · date at the foot. */
export function Natcapsule({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCapsuleFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date].filter(Boolean).join(" · ")} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · cápsula: the capsule reads GOAL beside his celebration; his name · his club's exact name at the foot. No score. */
export function Goalnatcapsule({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCapsuleFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
