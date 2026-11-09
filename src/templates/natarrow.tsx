import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "arrow" natural looks (wayfinding signage): his real photo full-bleed; at the foot,
 * a stadium-sign line — a bold arrow, then the word in heavy Inter — and under it, separated by a hairline,
 * one small line of details. The NEYOD logo alone at the top. A soft shade only under the sign.
 */
function NatArrowFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 700 : 500,
    fs: story ? 240 : 155,
  });
  const M = 64;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lPx = 18 * k * ts;
  const wPx = Math.min(100 * k * ts, (CANVAS_W - 2 * M - 140 * k) / Math.max(1, word.length * 0.62));
  const lineTop = bottom - lPx * 1.2;
  const ruleTop = lineTop - 22 * k;
  const wTop = ruleTop - 24 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const A = wPx * 0.8; // arrow size
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, height: wPx, display: "flex", alignItems: "center", gap: 26 * k }}>
        <svg width={A} height={A} viewBox="0 0 24 24" aria-hidden>
          <path d="M3 12h15M12 5l7 7-7 7" fill="none" stroke={OFF_WHITE} strokeWidth="3.2" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{word}</div>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: ruleTop, height: 2, background: OFF_WHITE, opacity: 0.6 }} />
      <div style={{ position: "absolute", left: M, right: M, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · seta (matchday): "→ Matchday" like a stadium sign; Home v Away · date · time · venue under it. */
export function Natarrow({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatArrowFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  ·  ")} />;
}

/** Natural goal · seta: "→ Goal" over his celebration; his name · his club's exact name under it. No score. */
export function Goalnatarrow({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatArrowFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ")} />;
}
