import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "block shadow" natural looks: his real photo full-bleed; at the foot-left the word in heavy
 * caps inside a solid box of his club's colour, with a hard off-white offset shadow of the box behind it (down and
 * right, no blur); one small line under it. The NEYOD logo alone at the top.
 */
function NatBlockshadowFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
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
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const padX = 24 * k;
  const off = 10 * k;
  const wPx = Math.min(70 * k * ts, (CANVAS_W - 2 * M - 2 * padX - off) / Math.max(1, word.length * 0.72));
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const boxH = wPx * 1.2;
  const boxTop = lineTop - 24 * k - boxH - off;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: boxTop - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", left: M, top: boxTop, height: boxH, display: "inline-flex", alignItems: "center", padding: `0 ${padX}px`, background: colour, color: ink, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", boxShadow: `${off}px ${off}px 0 ${OFF_WHITE}` }}>{word}</div>
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · bloco com sombra (matchday): MATCHDAY in a box of his club's colour with a hard off-white shadow; HOME v AWAY · date · time. */
export function Natblockshadow({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatBlockshadowFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · bloco com sombra: GOAL in the shadowed box under his celebration; his name · his club's exact name. No score. */
export function Goalnatblockshadow({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBlockshadowFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
