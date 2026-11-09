import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "breakout" natural looks: his real photo full-bleed; a thin off-white rectangle
 * drawn between the photo and him, its top edge crossing just under his chin, so his head breaks out over
 * the frame. Under the frame the word in bold caps and one small line; the NEYOD logo alone at the top.
 */
function NatBreakoutFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 520,
    fs: story ? 245 : 155,
  });
  const M = 80;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const wPx = Math.min(64 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(word, 0.12)));
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const lineTop = bottom - lPx;
  const wTop = lineTop - 18 * k - wPx;
  const frameTop = place.fy + place.fs * 0.62; // just under his chin
  const frameBottom = wTop - 34 * k;
  const B = 3 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: M, right: M, top: frameTop, height: Math.max(120, frameBottom - frameTop), border: `${B}px solid ${OFF_WHITE}`, boxShadow: "0 0 18px rgba(0,0,0,.25)" }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 180 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.12em", paddingLeft: "0.12em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · fora da moldura (matchday): his head breaks out over a thin frame; MATCHDAY and HOME v AWAY · date · time under it. */
export function Natbreakout({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBreakoutFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · fora da moldura: his celebrating head and fist break out over the frame; GOAL and his name · his club's exact name. No score. */
export function Goalnatbreakout({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBreakoutFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
