import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "header rule" natural looks (a newspaper's running head): his real photo full-bleed;
 * at the top, a thin hairline across the margins just under the NEYOD logo, with one small fact on its left and
 * one on its right; at the foot only the word in bold, on the side away from him.
 */
function NatHeaderlineFrame({ data, word, headLeft, headRight }: { data: RenderData; word: string; headLeft: string; headRight: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const M = 56;
  const half = (CANVAS_W - 2 * M) / 2 - 16;
  const hPx = Math.min(14 * k * ts, ...[headLeft, headRight].map((t) => half / Math.max(1, t.length * 0.62)));
  const wPx = Math.min(78 * k * ts, (520 * k) / Math.max(1, word.length * 0.66));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const ruleY = logoTop + (story ? 120 : 76);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const head = { position: "absolute" as const, top: ruleY + 12 * k, width: half, fontFamily: SANS, fontWeight: 600, fontSize: hPx, letterSpacing: "0.14em", lineHeight: 1, whiteSpace: "nowrap" as const, textShadow: "0 1px 6px rgba(0,0,0,.45)" };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: ruleY + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bottom - wPx - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 55%, rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", left: M, right: M, top: ruleY, height: 1.5, background: OFF_WHITE, opacity: 0.75 }} />
      <div style={{ ...head, left: M }}>{headLeft}</div>
      <div style={{ ...head, right: M, textAlign: "right" }}>{headRight}</div>
      <div style={{ position: "absolute", [left ? "left" : "right"]: M, top: bottom - wPx * 0.86 - wPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cabeçalho com fio (matchday): a hairline under the logo with HOME V AWAY left and date · time right; MATCHDAY at the foot (exact names). */
export function Natheaderline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatHeaderlineFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} headLeft={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} headRight={[fx.date, fx.kickoff].filter(Boolean).join(" · ").toUpperCase()} />;
}

/** Natural goal · cabeçalho com fio: his name left and his club's exact name right on the hairline; GOAL at the foot. No score. */
export function Goalnatheaderline({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatHeaderlineFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} headLeft={name.toUpperCase()} headRight={ourClub(data).toUpperCase()} />;
}
