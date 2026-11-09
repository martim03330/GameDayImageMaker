import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "solid box" natural looks: his real photo full-bleed; at the foot-left the word in heavy
 * caps in his club's colour inside a tight solid off-white box, and under it one small line in off-white on the
 * photo. The NEYOD logo alone at the top.
 */
function NatKnockboxFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
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
  const ink = panelColour(params.primary, params.accent);
  const M = 60;
  const padX = 22 * k;
  const wPx = Math.min(78 * k * ts, (CANVAS_W - 2 * M - 2 * padX) / Math.max(1, word.length * 0.72));
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const boxH = wPx * 1.1;
  const boxTop = lineTop - 20 * k - boxH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: boxTop - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.62))" }} />
      <div style={{ position: "absolute", left: M, top: boxTop, height: boxH, display: "inline-flex", alignItems: "center", padding: `0 ${padX}px`, background: OFF_WHITE, color: ink, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", boxShadow: "0 10px 26px rgba(0,0,0,.3)" }}>{word}</div>
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · caixa sólida (matchday): MATCHDAY in his club's colour in a solid off-white box; HOME v AWAY · date · time. */
export function Natknockbox({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatKnockboxFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · caixa sólida: GOAL in the solid box under his celebration; his name · his club's exact name. No score. */
export function Goalnatknockbox({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatKnockboxFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
