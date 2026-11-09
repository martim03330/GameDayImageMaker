import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const BODONI = "var(--font-bodoni), 'Didot', serif";

/**
 * The shared frame of the "initial" natural looks: his real photo full-bleed and one letter — the word's
 * initial (M for matchday, G for goal) — huge in Bodoni, white and translucent, set behind him, filling most
 * of the canvas height. At the foot the full word small in tracked caps and one line; the NEYOD logo at the top.
 */
function NatBigletterFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
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
  const letter = word.charAt(0).toUpperCase();
  const size = (story ? 1300 : 1000) * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const wPx = 30 * k * ts;
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const lineTop = bottom - lPx;
  const wTop = lineTop - 14 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: place.fy - size * 0.42, textAlign: "center", fontFamily: BODONI, fontWeight: 700, fontSize: size, lineHeight: 1, color: "#fff", opacity: 0.26, textShadow: "0 0 60px rgba(0,0,0,.35)" }}>{letter}</div>
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 180 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.64))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.32em", paddingLeft: "0.32em", lineHeight: 1 }}>{word.toUpperCase()}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · inicial (matchday): a huge translucent Bodoni "M" behind him; MATCHDAY and HOME v AWAY · date · time at the foot. */
export function Natbigletter({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBigletterFrame data={data} word={data.content.kicker || "MATCHDAY"} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · inicial: a huge translucent "G" behind his celebration; GOAL and his name · his club's exact name. No score. */
export function Goalnatbigletter({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBigletterFrame data={data} word={data.content.kicker || "GOAL"} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
