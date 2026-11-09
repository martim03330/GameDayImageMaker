import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "marks" natural looks (a print proof): his real photo full-bleed, and four thin
 * L-shaped crop marks inset at the corners. In the corners, small caps: the word top-left, a detail
 * top-right, another bottom-left; the NEYOD logo bottom-right. Nothing crosses the middle — he stays clear.
 */
function NatMarksFrame({ data, word, tr, bl }: { data: RenderData; word: string; tr: string; bl: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 760 : 560,
    fs: story ? 250 : 160,
  });
  const I = 48; // inset of the marks
  const top = (story ? STORY_TOP - 40 : I) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM + 40 : H - I;
  const L = 46 * k;
  const wPx = 34 * k * ts;
  const sPx = 14 * k * ts;
  const logoH = story ? 88 : 52;
  const mark = (x: number, y: number, dx: 1 | -1, dy: 1 | -1) => (
    <>
      <div style={{ position: "absolute", left: dx > 0 ? x : x - L, top: y - 1, width: L, height: 2, background: OFF_WHITE }} />
      <div style={{ position: "absolute", left: x - 1, top: dy > 0 ? y : y - L, width: 2, height: L, background: OFF_WHITE }} />
    </>
  );
  const pad = I + 22 * k;
  const small = { fontFamily: SANS, fontWeight: 600, fontSize: sPx, letterSpacing: "0.2em", lineHeight: 1.5, textShadow: "0 1px 8px rgba(0,0,0,.5)" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 200 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + 220 * k, background: "linear-gradient(to top, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      {mark(I, top, 1, 1)}
      {mark(CANVAS_W - I, top, -1, 1)}
      {mark(I, bottom, 1, -1)}
      {mark(CANVAS_W - I, bottom, -1, -1)}
      <div style={{ position: "absolute", left: pad, top: top + 20 * k, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.08em", lineHeight: 1, textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{word}</div>
      <div style={{ position: "absolute", right: pad, top: top + 20 * k, textAlign: "right", ...small, whiteSpace: "pre" }}>{tr}</div>
      <div style={{ position: "absolute", left: pad, bottom: H - bottom + 20 * k, maxWidth: CANVAS_W / 2, ...small, whiteSpace: "pre" }}>{bl}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", right: pad, top: bottom - 20 * k - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }} />
    </div>
  );
}

/** Natural · marcas (matchday): MATCHDAY top-left; date and kick-off top-right; HOME v AWAY and the venue bottom-left. */
export function Natmarks({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatMarksFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      tr={[fx.date, fx.kickoff].filter(Boolean).join("\n").toUpperCase()}
      bl={[`${fx.homeName} v ${fx.awayName}`, fx.venue].filter(Boolean).join("\n").toUpperCase()}
    />
  );
}

/** Natural goal · marcas: GOAL top-left of his celebration photo; his name and his club's exact name bottom-left. No score. */
export function Goalnatmarks({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatMarksFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} tr={fx.date.toUpperCase()} bl={[name, ourClub(data)].filter(Boolean).join("\n").toUpperCase()} />;
}
