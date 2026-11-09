import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "double rule" natural looks (a newspaper masthead): his real photo full-bleed; at the
 * foot the word in a big serif between two double hairlines (a thick and a thin line, above and below) spanning
 * the width; one small tracked line under the lower rule. The NEYOD logo alone at the top.
 */
function NatDoubleruleFrame({ data, word, line }: { data: RenderData; word: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const wPx = Math.min(104 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.55));
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(line, 0.24)));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const lineTop = bottom - lPx;
  const lowRule = lineTop - 20 * k;
  const wTop = lowRule - 16 * k - wPx;
  const upRule = wTop - 18 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const rule = (y: number, flip: boolean) => (
    <>
      <div style={{ position: "absolute", left: M, right: M, top: flip ? y + 5 * k : y, height: 3 * k, background: OFF_WHITE }} />
      <div style={{ position: "absolute", left: M, right: M, top: flip ? y : y + 6 * k, height: 1, background: OFF_WHITE }} />
    </>
  );
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: upRule - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      {rule(upRule, false)}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: wTop, textAlign: "center", fontFamily: SERIF, fontSize: wPx, lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      {rule(lowRule, true)}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.24em", paddingLeft: "0.24em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.9 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha dupla (matchday): "The Matchday" masthead between double rules; HOME v AWAY · date · time under it (exact names). */
export function Natdoublerule({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatDoubleruleFrame data={data} word={`The ${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}`} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · linha dupla: "The Goal" between double rules under his celebration; his name · his club's exact name. No score. */
export function Goalnatdoublerule({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDoubleruleFrame data={data} word={`The ${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}`} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
