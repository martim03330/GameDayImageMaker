/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "crest split" natural looks: his real photo full-bleed; at the foot his club's crest in
 * the middle between two hairline dividers, with text right-aligned to its left and left-aligned to its right (the
 * two teams on matchday, his first name and surname on goals); one small line under it. The NEYOD logo at the top.
 */
function NatCrestsplitFrame({ data, a, b, line, crest }: { data: RenderData; a: string; b: string; line: string; crest: string | null }) {
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
  const C = 76 * k;
  const gap = 28 * k;
  const half = CANVAS_W / 2 - C / 2 - gap - 50;
  const nPx = Math.min(30 * k * ts, half / Math.max(1, capsEm(a, 0.06)), half / Math.max(1, capsEm(b, 0.06)));
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.24)));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const rowMid = lineTop - 28 * k - C / 2;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const name = { position: "absolute", top: rowMid - nPx * 0.55, fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.06em", lineHeight: 1, whiteSpace: "nowrap" } as const;
  const div = (x: number) => <div style={{ position: "absolute", left: x, top: rowMid - C * 0.45, width: 1.5, height: C * 0.9, background: OFF_WHITE, opacity: 0.7 }} />;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: rowMid - C - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ ...name, right: CANVAS_W / 2 + C / 2 + gap, textAlign: "right" }}>{a}</div>
      {div(CANVAS_W / 2 - C / 2 - gap / 2)}
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: CANVAS_W / 2 - C / 2, top: rowMid - C / 2, width: C, height: C, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />}
      {div(CANVAS_W / 2 + C / 2 + gap / 2)}
      <div style={{ ...name, left: CANVAS_W / 2 + C / 2 + gap }}>{b}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", paddingLeft: "0.24em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · separador de emblema (matchday): HOME | crest | AWAY (exact names); MATCHDAY · date · time under it. */
export function Natcrestsplit({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const line = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff].filter(Boolean).join("  ·  ");
  return <NatCrestsplitFrame data={data} a={fx.homeName.toUpperCase()} b={fx.awayName.toUpperCase()} line={line} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · separador de emblema: FIRST NAME | his crest | SURNAME; GOAL · his club's exact name under it. No score. */
export function Goalnatcrestsplit({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const line = [(data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()].join("  ·  ");
  return <NatCrestsplitFrame data={data} a={(data.content.firstName ?? "").toUpperCase()} b={(data.content.lastName ?? "").toUpperCase()} line={line} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
