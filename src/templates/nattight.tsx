import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "tight" natural looks (sportswear-ad type): his real photo full-bleed; at the foot
 * the word huge in heavy lowercase Inter with very tight letter spacing, filling the width, a full stop at the
 * end; one small line above it at the left. The NEYOD logo alone at the top.
 */
function NatTightFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 660 : 470,
    fs: story ? 240 : 150,
  });
  const M = 48;
  const text = `${word}.`;
  // Heavy lowercase Inter at -0.07em tracking: ~0.5 em per letter.
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(1, text.length * 0.5), story ? 260 : 220) * ts;
  const bottom = (story ? STORY_BOTTOM : H - 50) - (params.textY ?? 0);
  const wTop = bottom - size * 0.82;
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.2)));
  const lineTop = wTop - 6 * k - lPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lineTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.62))" }} />
      <div style={{ position: "absolute", left: M + 6, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <div style={{ position: "absolute", left: M, top: wTop - size * 0.18, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: "-0.07em", lineHeight: 1, whiteSpace: "nowrap" }}>{text}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · apertado (matchday): "matchday." huge and tight at the foot; HOME v AWAY · date · time above it (exact names). */
export function Nattight({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatTightFrame data={data} word={(data.content.kicker || "matchday").toLowerCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · apertado: "goal." huge and tight under his celebration; his name · his club's exact name above it. No score. */
export function Goalnattight({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTightFrame data={data} word={(data.content.kicker || "goal").toLowerCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
