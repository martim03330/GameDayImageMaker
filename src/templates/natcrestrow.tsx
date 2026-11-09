/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest row" natural looks: his real photo full-bleed; at the foot two crests at the
 * ends of a long hairline (one crest on goals, at the line's left), the word small and bold in the middle of
 * the line on a gap; under it one small line of exact names. The NEYOD logo alone at the top.
 */
function NatCrestrowFrame({ data, word, line, left, right }: { data: RenderData; word: string; line: string; left: string | null; right: string | null }) {
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
  const M = 60;
  const C = 66 * k;
  const wPx = 20 * k * ts;
  const lPx = Math.min(15 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.22)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const rowY = lineTop - 30 * k - C / 2;
  const wW = capsEm(word, 0.3) * wPx + 40 * k;
  const x0 = M + (left ? C + 18 * k : 0);
  const x1 = CANVAS_W - M - (right ? C + 18 * k : 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const crest = (url: string | null, side: "left" | "right") =>
    url ? <img src={url} alt="" style={{ position: "absolute", [side]: M, top: rowY - C / 2, width: C, height: C, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: rowY - C - 180 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      {crest(left, "left")}
      {crest(right, "right")}
      <div style={{ position: "absolute", left: x0, width: (x1 - x0 - wW) / 2, top: rowY - 0.75, height: 1.5, background: OFF_WHITE, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: x0 + (x1 - x0 + wW) / 2, width: (x1 - x0 - wW) / 2, top: rowY - 0.75, height: 1.5, background: OFF_WHITE, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: rowY - wPx / 2, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.3em", paddingLeft: "0.3em", lineHeight: 1 }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · fila de emblemas (matchday): home crest —— MATCHDAY —— away crest; HOME V AWAY · date · time under it. */
export function Natcrestrow({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCrestrowFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} left={fx.homeCrest} right={fx.awayCrest} />;
}

/** Natural goal · fila de emblemas: his crest —— GOAL ——; his name · his club's exact name under it. No score. */
export function Goalnatcrestrow({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCrestrowFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} left={data.content.home === false ? fx.awayCrest : fx.homeCrest} right={null} />;
}
