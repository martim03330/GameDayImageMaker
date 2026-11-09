import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "location" natural looks: his real photo full-bleed; at the foot-left a small map-pin
 * icon in his club's colour followed by the place (the venue / his club's exact name) in bold, the word above it
 * small in tracked caps, and one line of details under it. The NEYOD logo alone at the top.
 */
function NatPinFrame({ data, word, place: where, line }: { data: RenderData; word: string; place: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const pl = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const pPx = Math.min(44 * k * ts, 760 / Math.max(1, where.length * 0.58));
  const wPx = 16 * k * ts;
  const lPx = 17 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const pTop = lineTop - 16 * k - pPx;
  const wTop = pTop - 14 * k - wPx;
  const I = pPx * 1.05;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={pl} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={pl} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M + 2, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.28em", lineHeight: 1, opacity: 0.85 }}>{word}</div>
      <svg width={I * 0.75} height={I} viewBox="0 0 36 48" style={{ position: "absolute", left: M, top: pTop + (pPx - I) / 2 }} aria-hidden>
        <path d="M18 2C9.2 2 2 9 2 17.6 2 29.4 18 46 18 46s16-16.6 16-28.4C34 9 26.8 2 18 2z" fill={colour} stroke={OFF_WHITE} strokeWidth="2.5" />
        <circle cx="18" cy="17.5" r="6" fill={OFF_WHITE} />
      </svg>
      <div style={{ position: "absolute", left: M + I * 0.75 + 16 * k, right: M, top: pTop, fontFamily: SANS, fontWeight: 800, fontSize: pPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{where}</div>
      <div style={{ position: "absolute", left: M + 2, right: M, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.92 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · localização (matchday): a map pin and the venue in bold, MATCHDAY over it, Home v Away · date · time under it (exact names). */
export function Natpin({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatPinFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} place={fx.venue || fx.homeName} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · localização: GOAL over a pin and his club's exact name; his name under it. No score. */
export function Goalnatpin({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatPinFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} place={ourClub(data)} line={name} />;
}
