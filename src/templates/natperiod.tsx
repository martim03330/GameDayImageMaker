import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "full stop" natural looks: his real photo full-bleed; on the side away from him at
 * the foot, the word in lowercase DM Serif ended by a full stop in his club's colour — a calm statement — and
 * one small line under it. The NEYOD logo alone at the top.
 */
function NatPeriodFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 660 : 420, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 500 * k;
  const wPx = Math.min(96 * k * ts, colW / Math.max(1, (word.length + 1) * 0.5));
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const wTop = lineTop - 20 * k - wPx * 0.9;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right", lineHeight: 1, whiteSpace: "nowrap" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...side, top: wTop - wPx * 0.12, fontFamily: SERIF, fontSize: wPx, letterSpacing: "-0.01em" }}>
        {word}
        <span style={{ color: colour }}>.</span>
      </div>
      <div style={{ ...side, top: lineTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, opacity: 0.9, overflow: "hidden", textOverflow: "ellipsis" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · ponto final (matchday): "matchday." in serif, the full stop in his club's colour; Home v Away · date · time below (exact names). */
export function Natperiod({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatPeriodFrame data={data} word={(data.content.kicker || "matchday").toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · ponto final: "goal." in serif under his celebration; his name · his club's exact name. No score. */
export function Goalnatperiod({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatPeriodFrame data={data} word={(data.content.kicker || "goal").toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
