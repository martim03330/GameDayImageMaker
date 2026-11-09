/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";
const SHADOW = "0 1px 2px rgba(0,0,0,.5), 0 1px 10px rgba(0,0,0,.35)";

/**
 * The shared frame of the "edge" natural looks (reference: the "pride." album poster — tiny caps running
 * round all four edges, one lowercase serif word with a full stop): his real photo, close and large, a soft
 * dark vignette; along the four edges tiny tracked caps (top and bottom left / centre / right, the two sides
 * set vertically); low on the side away from him one lowercase word in big white DM Serif with a full stop.
 * The NEYOD logo under it.
 */
export function NatEdgeFrame({ data, word, top, sides, bottom }: { data: RenderData; word: string; top: [string, string, string]; sides: [string, string]; bottom: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const E = story ? 44 : 34;
  const px = 12 * k;
  const heLeft = params.side === "left";
  const fs = story ? 270 : 210;
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 430 : 650, fy: story ? 600 : 420, fs });
  const topY = (story ? STORY_TOP - 60 : E) - (params.textY ?? 0);
  const botY = (story ? STORY_BOTTOM + 40 : H - E - px) - (params.textY ?? 0);
  const wPx = Math.min(130 * k * ts, 520 / Math.max(1, word.length * 0.5));
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const logoTop = botY - 36 * k - logoH - (params.logoY ?? 0);
  const wordTop = logoTop - 22 * k - wPx * 0.95;
  const M = story ? 80 : 74;
  const tiny = { fontFamily: SANS, fontWeight: 700, fontSize: px, letterSpacing: "0.2em", lineHeight: 1, whiteSpace: "nowrap" as const, color: OFF_WHITE, textShadow: SHADOW };
  const row = (cells: string[], y: number) =>
    cells.map((t, i) =>
      t ? (
        <div key={i + t} style={{ ...tiny, position: "absolute", top: y, left: E + 10, width: CANVAS_W - 2 * (E + 10), textAlign: (["left", "center", "right"] as const)[i], ...(i === 2 ? { marginRight: "-0.2em" } : {}) }}>
          {t}
        </div>
      ) : null,
    );
  const side = (t: string, left: boolean) =>
    t ? (
      <div style={{ ...tiny, position: "absolute", top: H / 2, [left ? "left" : "right"]: E + px / 2, transform: `translate(${left ? "-50%" : "50%"}, -50%) rotate(${left ? -90 : 90}deg)`, maxWidth: H * 0.7, overflow: "hidden" }}>
        {t}
      </div>
    ) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#120d0b", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.5) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 420, background: `linear-gradient(to ${heLeft ? "top left" : "top right"}, rgba(0,0,0,.6), rgba(0,0,0,0) 65%)` }} />
      {row(top, topY)}
      {row(bottom, botY)}
      {side(sides[0], true)}
      {side(sides[1], false)}
      <div style={{ position: "absolute", top: wordTop, ...(heLeft ? { right: M } : { left: M }), fontFamily: SERIF, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", textShadow: "0 2px 4px rgba(0,0,0,.4), 0 6px 30px rgba(0,0,0,.45)" }}>
        {word}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: heLeft ? CANVAS_W - M - logoW : M, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: heLeft ? "right top" : "left top" }} />
    </div>
  );
}

/**
 * Natural · bordas (matchday): his real photo, close and large; tiny tracked caps along all four edges (date ·
 * HOME V AWAY · kick-off on top, the two clubs down the sides, venue at the foot — exact names, home first);
 * "matchday." in big white lowercase DM Serif low on the free side; NEYOD logo under it.
 */
export function Natedge({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const match = fx.homeName && fx.awayName ? `${fx.homeName.toUpperCase()} V ${fx.awayName.toUpperCase()}` : "";
  const fits = (t: string) => (capsEm(t, 0.2) * 12 < 600 ? t : "");
  return (
    <NatEdgeFrame
      data={data}
      word={`${(data.content.kicker || "Matchday").toLowerCase()}.`}
      top={[fx.date, fits(match), fx.kickoff]}
      sides={[fx.homeName.toUpperCase(), fx.awayName.toUpperCase()]}
      bottom={[fx.date, fx.venue, fx.kickoff]}
    />
  );
}

/**
 * Natural goal · bordas: his real celebration photo, close; tiny caps along the edges (his name, his club's
 * exact name) and "goal." in big white lowercase DM Serif. No score.
 */
export function Goalnatedge({ data }: { data: RenderData }) {
  const { content } = data;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  return <NatEdgeFrame data={data} word={`${(content.kicker || "Goal").toLowerCase()}.`} top={[club, name, club]} sides={[name, name]} bottom={[club, "", club]} />;
}
