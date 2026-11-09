import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "ellipse" natural looks: his real photo full-bleed; on the side away from him at the
 * foot, the word in tracked caps circled by one thin hand-drawn-feeling ellipse in his club's colour (slightly
 * tilted, a little wider than the word), one quiet line under it. The NEYOD logo alone at the top.
 */
function NatEllipseFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const track = 0.12;
  const wPx = Math.min(40 * k * ts, (400 * k) / Math.max(1, capsEm(word, track)));
  const wW = capsEm(word, track) * wPx;
  const eW = wW + 70 * k;
  const eH = wPx * 2.1;
  const lPx = Math.min(17 * k * ts, (480 * k) / Math.max(1, line.length * 0.56));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const eTop = lineTop - 20 * k - eH;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const ex = left ? M : CANVAS_W - M - eW;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: eTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: ex, top: eTop, width: eW, height: eH, border: `${2.5 * k}px solid ${colour}`, borderRadius: "50%", transform: "rotate(-4deg)" }} />
      <div style={{ position: "absolute", left: ex, width: eW, top: eTop + (eH - wPx) / 2 + wPx * 0.04, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: `${track}em`, paddingLeft: `${track}em`, boxSizing: "border-box", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", [left ? "left" : "right"]: M, width: 480 * k, top: lineTop, textAlign: left ? "left" : "right", fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · elipse (matchday): MATCHDAY circled by a thin club-colour ellipse; Home v Away · date · time below (exact names). */
export function Natellipse({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatEllipseFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join(" · ")} />;
}

/** Natural goal · elipse: GOAL circled under his celebration; his name · his club's exact name. No score. */
export function Goalnatellipse({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatEllipseFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join(" · ")} />;
}
