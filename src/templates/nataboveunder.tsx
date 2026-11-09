import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "between rules" natural looks: his real photo full-bleed; on the side away from him
 * at the foot, the word in tracked caps held between two hairlines exactly its width (one above, one below),
 * a small fact on each rule's far end, one quiet line under it all. The NEYOD logo alone at the top.
 */
function NatAboveunderFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = Math.min(500 * k, CANVAS_W * 0.52);
  const track = 0.12;
  const wPx = Math.min(56 * k * ts, colW / Math.max(1, capsEm(word, track)));
  const wW = capsEm(word, track) * wPx;
  const lPx = Math.min(17 * k * ts, colW / Math.max(1, line.length * 0.56));
  const pad = 14 * k;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const rule2 = lineTop - 18 * k;
  const wTop = rule2 - pad - wPx * 0.74;
  const rule1 = wTop - pad;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: rule1 - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", [edge]: M, top: rule1, width: wW, height: 2.5 * k, background: colour }} />
      <div style={{ position: "absolute", [edge]: M, top: wTop - wPx * 0.13, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [edge]: M, top: rule2, width: wW, height: 1.5, background: OFF_WHITE, opacity: 0.8 }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: lineTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · entre fios (matchday): MATCHDAY between a club-colour rule and a white one; Home v Away · date · time below (exact names). */
export function Nataboveunder({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatAboveunderFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · entre fios: GOAL between the rules; his name · his club's exact name below. No score. */
export function Goalnataboveunder({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatAboveunderFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
