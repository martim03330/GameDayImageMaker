import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "lower third" natural looks (a TV caption): his real photo full-bleed; in the lower
 * third at the left, a two-tier caption — a small tag in his club's colour with the word, and under it an
 * off-white bar holding the main line in bold dark text, then a dark slim bar with the details. The NEYOD logo
 * alone at the top.
 */
function NatLower3Frame({ data, tag, main, detail }: { data: RenderData; tag: string; main: string; detail: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const mPx = Math.min(36 * k * ts, 760 / Math.max(1, main.length * 0.56));
  const tPx = 15 * k * ts;
  const dPx = 16 * k * ts;
  const mH = mPx + 26 * k;
  const dH = dPx + 18 * k;
  const tH = tPx + 14 * k;
  const bottom = (story ? STORY_BOTTOM : H - 64) - (params.textY ?? 0);
  const dTop = bottom - dH;
  const mTop = dTop - mH;
  const tTop = mTop - tH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const bar = { position: "absolute", left: M, display: "inline-flex", alignItems: "center", fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1 } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ ...bar, top: tTop, height: tH, padding: `0 ${14 * k}px`, background: colour, color: ink, fontWeight: 800, fontSize: tPx, letterSpacing: "0.2em" }}>{tag}</div>
      <div style={{ ...bar, top: mTop, height: mH, padding: `0 ${20 * k}px`, background: OFF_WHITE, color: "#141414", fontWeight: 800, fontSize: mPx, letterSpacing: "-0.01em", boxShadow: "0 8px 20px rgba(0,0,0,.25)" }}>{main}</div>
      <div style={{ ...bar, top: dTop, height: dH, padding: `0 ${20 * k}px`, background: "rgba(16,16,16,.88)", color: OFF_WHITE, fontWeight: 500, fontSize: dPx }}>{detail}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · oráculo (matchday): a TV lower third — MATCHDAY tag, "Home v Away" bar, date · time · venue strip (exact names). */
export function Natlower3({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatLower3Frame data={data} tag={(data.content.kicker || "MATCHDAY").toUpperCase()} main={`${fx.homeName} v ${fx.awayName}`} detail={[fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ")} />;
}

/** Natural goal · oráculo: GOAL tag, his name on the bar, his club's exact name on the strip. No score. */
export function Goalnatlower3({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLower3Frame data={data} tag={(data.content.kicker || "GOAL").toUpperCase()} main={name} detail={ourClub(data)} />;
}
