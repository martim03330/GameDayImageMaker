import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "overprint" natural looks (a screen print): his real photo full-bleed and the word
 * huge in his club's colour, blended into the ground behind him (multiply, so the grass and stands show
 * through the ink); he stands in front of it, untouched. One small line at the foot; the NEYOD logo at the top.
 */
function NatOverprintFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
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
  const colour = params.primary || "#e3001b";
  // Anton caps ~0.56 em with its spacing: one line across the width, centred on his chest, never above the logo's clear space.
  const size = Math.min((CANVAS_W - 80) / Math.max(1, word.length * 0.56), story ? 560 : 440) * ts;
  const logoFoot = (story ? STORY_TOP : 46) + (story ? 88 : 52) + 40;
  const top = Math.max(logoFoot, place.fy + place.fs * 0.6 - size * 0.5);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top, textAlign: "center", fontFamily: "var(--font-anton), Impact, sans-serif", fontSize: size, lineHeight: 1, color: colour, mixBlendMode: "multiply", opacity: 0.92, whiteSpace: "nowrap" }}>
        {word}
      </div>
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 180 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · sobreimpressão (matchday): MATCHDAY huge in his club's colour printed into the ground behind him; HOME v AWAY · date · time. */
export function Natoverprint({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatOverprintFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · sobreimpressão: GOAL printed in his club's colour behind his celebration; his name · his club's exact name. No score. */
export function Goalnatoverprint({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatOverprintFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
