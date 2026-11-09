/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "quiet" natural looks — the most minimal: his real photo full-bleed and almost
 * nothing else. At the foot centre a small crest and, under it, the word in small lowercase Inter with a
 * full stop; the NEYOD logo at the top. One soft shade under the word, so the photo does the talking.
 */
function NatQuietFrame({ data, word, sub, crest }: { data: RenderData; word: string; sub: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 540,
    fs: story ? 250 : 160,
  });
  const bottom = (story ? STORY_BOTTOM : H - 64) - (params.textY ?? 0);
  const wPx = 60 * k * ts;
  const sPx = 19 * k * ts;
  const crestS = 48 * k;
  const subTop = bottom - sPx * 1.2;
  const wTop = subTop - 10 * k - wPx;
  const crestTop = wTop - 16 * k - crestS;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 45%, rgba(0,0,0,.68))" }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: (CANVAS_W - crestS) / 2, top: crestTop, width: crestS, height: crestS, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.03em", textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{word}.</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: subTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: sPx, lineHeight: 1.2, opacity: 0.85, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{sub}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · silêncio (matchday): his club's crest, "matchday." and "home v away · date" in small lowercase. */
export function Natquiet({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatQuietFrame
      data={data}
      word={(data.content.kicker || "matchday").toLowerCase()}
      sub={[`${fx.homeName} v ${fx.awayName}`, fx.date.toLowerCase(), fx.kickoff].filter(Boolean).join(" · ")}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · silêncio: his crest, "goal." and his name in small type over his celebration. No score. */
export function Goalnatquiet({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatQuietFrame data={data} word={(data.content.kicker || "goal").toLowerCase()} sub={name} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
