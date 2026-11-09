import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "numbered list" natural looks (an index): his real photo full-bleed; on the side
 * away from him at the foot, the word in bold over the facts as a numbered list — 01, 02, 03 in small mono
 * figures in his club's colour (list positions, not data), each fact beside its number. The NEYOD logo at the top.
 */
function NatNumberedFrame({ data, word, items }: { data: RenderData; word: string; items: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 460 * k;
  const its = items.filter(Boolean);
  const nPx = 13 * k * ts;
  const iPx = Math.min(19 * k * ts, ...its.map((t) => (colW - 50 * k) / Math.max(1, t.length * 0.56)));
  const rowH = iPx * 1.6;
  const wPx = Math.min(54 * k * ts, colW / Math.max(1, word.length * 0.66));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const listTop = bottom - its.length * rowH;
  const wTop = listTop - 16 * k - wPx * 0.86;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      {its.map((t, i) => (
        <div key={t} style={{ position: "absolute", [edge]: M, width: colW, top: listTop + i * rowH, height: rowH, display: "flex", flexDirection: left ? "row" : "row-reverse", alignItems: "center", gap: 16 * k, lineHeight: 1 }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: nPx, color: colour, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: iPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</span>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · lista numerada (matchday): MATCHDAY over 01 Home v Away / 02 date · time / 03 venue (exact names). */
export function Natnumbered({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatNumberedFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} items={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · "), fx.venue]} />;
}

/** Natural goal · lista numerada: GOAL over 01 his name / 02 his club's exact name. No score. */
export function Goalnatnumbered({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatNumberedFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} items={[name, ourClub(data)]} />;
}
