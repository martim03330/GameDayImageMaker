import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "ruler" natural looks: his real photo full-bleed; along the very foot a row of thin
 * ruler ticks across the margins (every fifth one taller, the middle one in his club's colour), and just above
 * it, on the side away from him, the word in bold over one quiet line. The NEYOD logo alone at the top.
 */
function NatRulerFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const left = params.side !== "left";
  const colW = 520 * k;
  const wPx = Math.min(50 * k * ts, colW / Math.max(1, word.length * 0.66));
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const tickH = 22 * k;
  const ticksTop = bottom - tickH;
  const textBottom = ticksTop - 16 * k;
  const N = 41;
  const step = (CANVAS_W - 2 * M) / (N - 1);
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: textBottom - lPx - wPx - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", [left ? "left" : "right"]: M, width: colW, textAlign: left ? "left" : "right", top: textBottom - lPx - 14 * k - wPx * 0.86 - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [left ? "left" : "right"]: M, width: colW, textAlign: left ? "left" : "right", top: textBottom - lPx, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      {Array.from({ length: N }, (_, i) => {
        const mid = i === (N - 1) / 2;
        const tall = i % 5 === 0;
        const h = mid ? tickH : tall ? tickH * 0.7 : tickH * 0.38;
        return <span key={i} style={{ position: "absolute", left: M + i * step - (mid ? 1.5 : 0.75), top: bottom - h, width: mid ? 3 : 1.5, height: h, background: mid ? colour : OFF_WHITE, opacity: mid ? 1 : tall ? 0.85 : 0.55 }} />;
      })}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · régua (matchday): MATCHDAY over Home v Away · date · time on the free side, above a row of ruler ticks (exact names). */
export function Natruler({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatRulerFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · régua: GOAL over his name · his club's exact name, above the ruler ticks. No score. */
export function Goalnatruler({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatRulerFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
