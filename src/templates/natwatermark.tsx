/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "watermark" natural looks: his real photo full-bleed, and his club's crest huge and
 * faint (white, low opacity, like a watermark), centred on the canvas behind his body, so he stands in
 * front of it.
 * At the foot the word in bold caps and one small line; the NEYOD logo at the top.
 */
function NatWatermarkFrame({ data, word, line, crest }: { data: RenderData; word: string; line: string; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 530,
    fs: story ? 250 : 160,
  });
  const D = story ? 1000 : 860;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const wPx = Math.min(72 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(word, 0.06)));
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {crest && (
        // The crest as a flat white mark (brightness 0 → black, invert → white), very faint, behind him.
        <img src={crest} alt="" style={{ position: "absolute", left: (CANVAS_W - D) / 2, top: (H - D) / 2 - 40 * k, width: D, height: D, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.2 }} />
      )}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.06em", lineHeight: 1 }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · marca de água (matchday): his club's crest huge and faint behind him; MATCHDAY and HOME v AWAY · date · time at the foot. */
export function Natwatermark({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatWatermarkFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · marca de água: his crest faint behind his celebration; GOAL and his name · his club's exact name. No score. */
export function Goalnatwatermark({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatWatermarkFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}
