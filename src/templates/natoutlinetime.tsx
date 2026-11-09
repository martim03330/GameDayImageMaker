import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "outlined figure" natural looks: his real photo full-bleed; at the foot the big figure
 * (the kick-off time on matchday, the word on goals) big and hollow — outline only — on the side away from him, with
 * the word small above it and one line below. The NEYOD logo alone at the top.
 */
function NatOutlinetimeFrame({ data, figure, word, line }: { data: RenderData; figure: string; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 650 : 430, fy: story ? 680 : 490, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 420 * k;
  const fPx = Math.min(130 * k * ts, colW / Math.max(1, figure.length * 0.66));
  const wPx = 16 * k * ts;
  const lPx = Math.min(15 * k * ts, colW / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const fTop = lineTop - 18 * k - fPx * 0.78;
  const wTop = fTop - 16 * k - wPx;
  const col = { position: "absolute" as const, [left ? "left" : "right"]: M, width: colW, textAlign: (left ? "left" : "right") as "left" | "right" };
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ ...col, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.3em", lineHeight: 1, opacity: 0.9 }}>{word}</div>
      <div style={{ ...col, top: fTop - fPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: fPx, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap", color: "transparent", WebkitTextStroke: `${Math.max(2, fPx * 0.018)}px ${OFF_WHITE}` }}>{figure}</div>
      <div style={{ ...col, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · hora em contorno (matchday): the kick-off time huge in outline; MATCHDAY · date above, HOME v AWAY below (exact names). */
export function Natoutlinetime({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatOutlinetimeFrame data={data} figure={fx.time || word} word={[word, fx.date.toUpperCase(), fx.ptTime].filter(Boolean).join("  ·  ")} line={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} />;
}

/** Natural goal · hora em contorno: GOAL huge in outline under his celebration; his name · his club's exact name. No score. */
export function Goalnatoutlinetime({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatOutlinetimeFrame data={data} figure={(data.content.kicker || "GOAL").toUpperCase()} word={ourClub(data).toUpperCase()} line={name.toUpperCase()} />;
}
