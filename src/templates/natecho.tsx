import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "echo" natural looks: his real photo full-bleed; at the foot the word in big bold
 * caps, solid, with a hollow outlined copy of it set a little up and to the right behind it — one echo, no
 * more. One small line under it; the NEYOD logo alone at the top. A soft shade only under the type.
 */
function NatEchoFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
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
  const M = 64;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const wPx = Math.min(130 * k * ts, (CANVAS_W - 2 * M - 30) / Math.max(1, capsEm(word, -0.02)));
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const lineTop = bottom - lPx;
  const wTop = lineTop - 22 * k - wPx * 0.9;
  const off = wPx * 0.12;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const type = { position: "absolute", left: M, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 0.9, whiteSpace: "nowrap" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - off - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...type, top: wTop - off, marginLeft: off, color: "transparent", WebkitTextStroke: `${Math.max(1.5, wPx * 0.018)}px rgba(244,241,234,.7)` }}>{word}</div>
      <div style={{ ...type, top: wTop }}>{word}</div>
      <div style={{ position: "absolute", left: M + 2, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · eco (matchday): MATCHDAY solid with one outlined echo behind; HOME v AWAY · date · time under it. */
export function Natecho({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatEchoFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · eco: GOAL solid with its outlined echo under his celebration; his name · his club's exact name. No score. */
export function Goalnatecho({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatEchoFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
