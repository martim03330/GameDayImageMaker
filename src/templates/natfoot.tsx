import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "footnote" natural looks (editorial): his real photo full-bleed; at the top-left
 * the word in serif with a superscript ¹, and at the foot, after a short rule, the footnote it points to —
 * "¹" then one line of small text. The NEYOD logo at the top-right. Soft shades only where the type sits.
 */
function NatFootFrame({ data, word, note }: { data: RenderData; word: string; note: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: story ? 780 : 600,
    fs: story ? 250 : 160,
  });
  const M = 64;
  const top = (story ? STORY_TOP : 56) - (params.textY ?? 0);
  const wPx = Math.min(96 * k * ts, (CANVAS_W - 2 * M - 300) / Math.max(1, word.length * 0.5));
  const bottom = story ? STORY_BOTTOM : H - 56;
  const nPx = Math.min(18 * k * ts, (CANVAS_W - 2 * M - 30) / Math.max(1, capsEm(note, 0) * 0.82));
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + wPx + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.38), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + 200 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: SERIF, fontWeight: 600, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.3)" }}>
        {word}
        <sup style={{ fontFamily: SANS, fontWeight: 600, fontSize: wPx * 0.32, verticalAlign: "top", marginLeft: "0.08em", position: "relative", top: wPx * 0.02 }}>1</sup>
      </div>
      <div style={{ position: "absolute", left: M, top: bottom - nPx * 1.3 - 18 * k, width: 120 * k, height: 2, background: OFF_WHITE, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: M, right: M, top: bottom - nPx * 1.3, fontFamily: SANS, fontWeight: 400, fontSize: nPx, lineHeight: 1.3, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
        <span style={{ fontWeight: 700, marginRight: "0.5em" }}>1</span>
        {note}
      </div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", right: M, top: top - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }} />
    </div>
  );
}

/** Natural · nota (matchday): "Matchday¹" top-left; the footnote reads "Home v Away, date, kick-off, venue." (exact names). */
export function Natfoot({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  const note = `${fx.homeName} v ${fx.awayName}${[fx.date, fx.kickoff, fx.venue].filter(Boolean).map((s) => `, ${s}`).join("")}.`;
  return <NatFootFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} note={note} />;
}

/** Natural goal · nota: "Goal¹" over his celebration; the footnote reads "Name, for Club." (exact club name). No score. */
export function Goalnatfoot({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFootFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} note={`${name}, for ${ourClub(data)}.`} />;
}
