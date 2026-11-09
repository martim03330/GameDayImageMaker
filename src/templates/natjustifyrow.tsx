import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "spread row" natural looks: his real photo full-bleed; along the very foot one row
 * of small tracked caps spread across the free side (first item at the margin, last at the row's end, the rest between),
 * a hairline above it, and the main line in bold above the hairline on the side away from him. NEYOD at the top.
 */
function NatJustifyrowFrame({ data, main, items }: { data: RenderData; main: string; items: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const its = items.filter(Boolean).map((t) => t.toUpperCase());
  const em = its.reduce((a, t) => a + capsEm(t, 0.18), 0);
  // Spread over the free part of the canvas only (in a story he reaches the foot of the frame).
  const rowW = CANVAS_W * 0.6 - M;
  const iPx = Math.min(15 * k * ts, (rowW - 30 * k * (its.length - 1)) / Math.max(1, em));
  const colW = Math.min(520 * k, CANVAS_W * 0.54);
  const mPx = Math.min(52 * k * ts, colW / Math.max(1, main.length * 0.64));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const rowTop = bottom - iPx;
  const ruleTop = rowTop - 16 * k;
  const mTop = ruleTop - 18 * k - mPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: mTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.7))" }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: mTop - mPx * 0.12, textAlign: edge, fontFamily: SANS, fontWeight: 800, fontSize: mPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{main}</div>
      <div style={{ position: "absolute", [edge]: M, width: rowW, top: ruleTop, height: 1.5, background: `linear-gradient(to ${left ? "right" : "left"}, ${colour} 0, ${colour} 12%, rgba(255,255,255,.6) 12%)` }} />
      <div style={{ position: "absolute", [edge]: M, width: rowW, top: rowTop, display: "flex", justifyContent: its.length > 1 ? "space-between" : "center", fontFamily: SANS, fontWeight: 600, fontSize: iPx, letterSpacing: "0.18em", lineHeight: 1, whiteSpace: "nowrap" }}>
        {its.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha espalhada (matchday): Home v Away in bold; MATCHDAY · date · time · venue spread across the foot (exact names). */
export function Natjustifyrow({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatJustifyrowFrame data={data} main={`${fx.homeName} v ${fx.awayName}`} items={[data.content.kicker || "MATCHDAY", fx.date, fx.kickoff, fx.venue]} />;
}

/** Natural goal · linha espalhada: his name in bold; GOAL · his club's exact name spread across the foot. No score. */
export function Goalnatjustifyrow({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatJustifyrowFrame data={data} main={name} items={[data.content.kicker || "GOAL", ourClub(data)]} />;
}
