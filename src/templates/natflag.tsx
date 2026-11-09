/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "flag" natural looks: his real photo full-bleed above a band across the foot made
 * of his club's two colours, like a flag's stripes — the wide upper stripe in the primary colour holds the
 * crest, the word and the details; a narrow stripe of the second colour runs under it. The NEYOD logo at the
 * top over the photo.
 */
function NatFlagFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const primary = params.primary || "#12406b";
  const second = params.accent || "#ffffff";
  const ink = params.text || "#ffffff";
  const bandH = 150 * k;
  const stripe = 22 * k;
  const bandTop = (story ? STORY_BOTTOM + 40 : H) - bandH - stripe;
  const place = natPlace(data, CANVAS_W, bandTop, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: bandTop * 0.36,
    fs: story ? 240 : 155,
  });
  const M = 56;
  const crestS = 84 * k;
  const wPx = Math.min(50 * k * ts, 560 / Math.max(1, word.length * 0.64));
  const lPx = 17 * k * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: primary }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: bandTop, overflow: "hidden" }}>
        <NatGround place={place} W={CANVAS_W} H={bandTop} />
        <NatFigure data={data} place={place} W={CANVAS_W} H={bandTop} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, height: bandH, background: primary, color: ink, display: "flex", alignItems: "center", gap: 26 * k, padding: `0 ${M}px` }}>
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", flexShrink: 0 }} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.04em", lineHeight: 1 }}>{word}</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.2, marginTop: 10 * k, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop + bandH, height: stripe, background: second }} />
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: bandTop + bandH + stripe, bottom: 0, background: primary }} />}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · bandeira (matchday): a band in his club's two colours — crest, MATCHDAY, Home v Away · date · time (exact names). */
export function Natflag({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatFlagFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ")}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · bandeira: the band reads crest, GOAL, his name · his club's exact name, under his celebration. No score. */
export function Goalnatflag({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFlagFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ")} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
