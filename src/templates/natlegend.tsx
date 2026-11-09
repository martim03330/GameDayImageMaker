import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "legend" natural looks: his real photo full-bleed inside a thin off-white rule
 * inset from the edges; the rule opens at the top for the word in serif (like a form's legend) and at the
 * foot for one line of small caps. The NEYOD logo sits in the bottom opening's line, after the text.
 */
function NatLegendFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 580,
    fs: story ? 250 : 160,
  });
  const I = 44;
  const top = (story ? STORY_TOP + 20 : 90) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM - 60 : H - 90;
  const wPx = Math.min(84 * k * ts, (CANVAS_W - 2 * I - 160) / Math.max(1, word.length * 0.55));
  const wW = word.length * wPx * 0.55 + 44 * k; // the gap the word opens in the top rule
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 2 * I - 120) / Math.max(1, capsEm(line, 0.24)));
  const lW = capsEm(line, 0.24) * lPx + 40 * k;
  const rule = OFF_WHITE;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.36), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 180 * k, background: "linear-gradient(to top, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />
      {/* The rule: two top pieces either side of the word, the sides, two bottom pieces either side of the line. */}
      <div style={{ position: "absolute", left: I, top, width: (CANVAS_W - 2 * I - wW) / 2, height: 2, background: rule }} />
      <div style={{ position: "absolute", right: I, top, width: (CANVAS_W - 2 * I - wW) / 2, height: 2, background: rule }} />
      <div style={{ position: "absolute", left: I, top, width: 2, height: bottom - top, background: rule }} />
      <div style={{ position: "absolute", right: I, top, width: 2, height: bottom - top, background: rule }} />
      <div style={{ position: "absolute", left: I, top: bottom, width: (CANVAS_W - 2 * I - lW) / 2, height: 2, background: rule }} />
      <div style={{ position: "absolute", right: I, top: bottom, width: (CANVAS_W - 2 * I - lW) / 2, height: 2, background: rule }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: top - wPx * 0.56, textAlign: "center", fontFamily: SERIF, fontSize: wPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>{word}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - lPx * 0.55, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", lineHeight: 1, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom + 34 * k - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · legenda (matchday): "Matchday" in serif opening the top rule; HOME v AWAY · date · time opening the bottom one. */
export function Natlegend({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatLegendFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · legenda: "Goal" in serif opening the top rule over his celebration; his name · his club's exact name at the foot. No score. */
export function Goalnatlegend({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLegendFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
