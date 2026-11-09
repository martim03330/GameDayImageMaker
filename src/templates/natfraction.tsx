import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "fraction" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, two names stacked like a fraction — one over a short bar in his club's colour, the other under it —
 * the word small above and a quiet line below. The NEYOD logo alone at the top.
 */
function NatFractionFrame({ data, word, over, under, line }: { data: RenderData; word: string; over: string; under: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 660 : 420, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 470 * k;
  const nPx = Math.min(36 * k * ts, colW / Math.max(1, Math.max(over.length, under.length) * 0.6));
  const wPx = 15 * k * ts;
  const lPx = 16 * k * ts;
  const barW = Math.min(colW, Math.max(over.length, under.length) * 0.6 * nPx);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const underTop = lineTop - 22 * k - nPx;
  const barTop = underTop - 12 * k - 3 * k;
  const overTop = barTop - 12 * k - nPx;
  const wTop = overTop - 18 * k - wPx;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right", lineHeight: 1, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...side, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.24em", opacity: 0.9 }}>{word}</div>
      <div style={{ ...side, top: overTop, fontFamily: SANS, fontWeight: 800, fontSize: nPx }}>{over}</div>
      <div style={{ position: "absolute", [left ? "left" : "right"]: M, width: barW, top: barTop, height: 3 * k, background: colour }} />
      <div style={{ ...side, top: underTop, fontFamily: SANS, fontWeight: 800, fontSize: nPx }}>{under}</div>
      {line && <div style={{ ...side, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, opacity: 0.85 }}>{line}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · fração (matchday): Home over a bar over Away (exact names); MATCHDAY above, date · time below. */
export function Natfraction({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFractionFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} over={fx.homeName} under={fx.awayName} line={[fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · fração: his name over a bar over his club's exact name; GOAL above. No score. */
export function Goalnatfraction({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFractionFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} over={name} under={ourClub(data)} line="" />;
}
