import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "timeline" natural looks: his real photo full-bleed; at the foot one thin line
 * across the canvas with a small dot per fact (the first in his club's colour), each fact's label under its
 * dot, and the word small above the line. The NEYOD logo alone at the top.
 */
function NatTimelineFrame({ data, word, stops }: { data: RenderData; word: string; stops: string[] }) {
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
  const M = 70;
  const ss = stops.filter(Boolean);
  // Each stop gets room in proportion to its label, so one long fixture does not shrink the short ones.
  const weight = ss.map((s) => Math.max(8, s.length) + 6);
  const total = weight.reduce((a, b) => a + b, 0) || 1;
  const slots = weight.map((w) => ((CANVAS_W - 2 * M) * w) / total);
  const starts = slots.map((_, i) => M + slots.slice(0, i).reduce((a, b) => a + b, 0));
  const lPx = Math.min(16 * k * ts, ...ss.map((s, i) => (slots[i] - 16) / Math.max(1, s.length * 0.56)));
  const wPx = 20 * k * ts;
  const D = 11 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const labelTop = bottom - lPx;
  const lineY = labelTop - 16 * k - D / 2;
  const wTop = lineY - 22 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55) 50%, rgba(0,0,0,.7))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.22em", lineHeight: 1 }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: lineY - 0.75, height: 1.5, background: OFF_WHITE, opacity: 0.7 }} />
      {ss.map((s, i) => {
        const slot = slots[i];
        const cx = starts[i] + slot / 2;
        return (
          <div key={s}>
            <span style={{ position: "absolute", left: cx - D / 2, top: lineY - D / 2, width: D, height: D, borderRadius: "50%", background: i === 0 ? colour : OFF_WHITE }} />
            <div style={{ position: "absolute", left: cx - slot / 2, width: slot, top: labelTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap" }}>{s}</div>
          </div>
        );
      })}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha do tempo (matchday): MATCHDAY over a line with date, kick-off and Home v Away as its points (exact names). */
export function Nattimeline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatTimelineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} stops={[fx.date, fx.kickoff, `${fx.homeName} v ${fx.awayName}`]} />;
}

/** Natural goal · linha do tempo: GOAL over a line with his name and his club's exact name as its points. No score. */
export function Goalnattimeline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTimelineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} stops={[name, ourClub(data)]} />;
}
