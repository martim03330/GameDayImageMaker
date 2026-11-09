import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "thick line" natural looks: his real photo full-bleed with one thick band of his club's
 * colour running along the very foot across the full width; on the photo just above it, the word in bold at the left
 * and one line of details at the right. The NEYOD logo alone at the top.
 */
function NatThicklineFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const band = 22 * k;
  const bandTop = (story ? STORY_BOTTOM + 30 : H) - band - (params.textY ?? 0);
  const wPx = Math.min(70 * k * ts, 520 / Math.max(1, word.length * 0.66));
  const lPx = Math.min(19 * k * ts, 460 / Math.max(1, capsEm(line, 0.18)));
  const wTop = bandTop - 26 * k - wPx;
  const colour = params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.62))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, height: story ? H - bandTop : band, background: colour }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", right: M, top: wTop + wPx - lPx, textAlign: "right", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.18em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · faixa inferior (matchday): a thick band in his club's colour at the foot; "Matchday" and date · time above it. */
export function Natthickline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatThicklineFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={[fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase() || `${fx.homeName} v ${fx.awayName}`.toUpperCase()} />;
}

/** Natural goal · faixa inferior: the band at the foot of his celebration; "Goal" and his club's exact name above it. No score. */
export function Goalnatthickline({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  return <NatThicklineFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} line={ourClub(data).toUpperCase()} />;
}
