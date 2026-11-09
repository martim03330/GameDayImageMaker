import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "colour chip" natural looks (a swatch label): his real photo full-bleed; at the foot-left a
 * small square chip of his club's colour with his club's exact name beside it in small caps, then the word big in
 * bold below and one line. The NEYOD logo alone at the top.
 */
function NatChipFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const C = 26 * k;
  const cPx = 15 * k * ts;
  const wPx = Math.min(90 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.64));
  const lPx = 18 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 16 * k - wPx;
  const chipTop = wTop - 22 * k - C;
  const colour = params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: chipTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: chipTop, display: "flex", alignItems: "center", gap: 14 * k }}>
        <span style={{ width: C, height: C, background: colour, border: `2px solid ${OFF_WHITE}`, boxSizing: "border-box" }} />
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: cPx, letterSpacing: "0.22em", whiteSpace: "nowrap" }}>{ourClub(data).toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M + 2, right: M, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.92 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · pastilha de cor (matchday): a chip of his club's colour + its exact name, "Matchday", Home v Away · date · time. */
export function Natchip({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatChipFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · pastilha de cor: the colour chip + his club's exact name, "Goal" and his name under his celebration. No score. */
export function Goalnatchip({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  return <NatChipFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[data.content.firstName, data.content.lastName].filter(Boolean).join(" ")} />;
}
