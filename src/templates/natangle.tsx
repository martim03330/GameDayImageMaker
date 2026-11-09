import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "angle" natural looks (a set square): his real photo full-bleed; in the lower-left
 * corner a thick L in his club's colour — a vertical arm and a horizontal arm meeting at the corner — and in
 * the angle it makes, the word in bold and two small lines. The NEYOD logo alone at the top.
 */
function NatAngleFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 700 : 510,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const T = 14 * k; // arm thickness
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const ls = lines.filter(Boolean);
  const lPx = 19 * k * ts;
  const wPx = Math.min(78 * k * ts, 620 / Math.max(1, word.length * 0.62));
  const inner = 30 * k;
  const textBottom = bottom - T - inner;
  const linesTop = textBottom - ls.length * lPx * 1.35;
  const wTop = linesTop - 12 * k - wPx;
  const armV = bottom - (wTop - 30 * k);
  const armH = 420 * k;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.64))" }} />
      <div style={{ position: "absolute", left: M, top: bottom - armV, width: T, height: armV, background: colour }} />
      <div style={{ position: "absolute", left: M, top: bottom - T, width: armH, height: T, background: colour }} />
      <div style={{ position: "absolute", left: M + T + inner, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M + T + inner, right: M, top: linesTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.92 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · esquadro (matchday): "Matchday" in the angle of an L in his club's colour; Home v Away and date · time · venue. */
export function Natangle({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatAngleFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · esquadro: "Goal" in the L's angle under his celebration; his name and his club's exact name. No score. */
export function Goalnatangle({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatAngleFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}
