import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "lines" natural looks (an annotated print): his real photo full-bleed crossed by
 * three hairlines across the full width — near the top, at the middle of the foot, at the foot — each with a
 * tiny label sitting on it at the left and a value at the right, like the notes on a technical drawing. The
 * word is the top label, large. The NEYOD logo at the top-right corner.
 */
function NatLinesFrame({ data, word, rows }: { data: RenderData; word: string; rows: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 740 : 540,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const top = (story ? STORY_TOP : 64) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 56;
  const wPx = Math.min(44 * k * ts, 600 / Math.max(1, word.length * 0.66));
  const sPx = 15 * k * ts;
  const gap = 66 * k;
  const ys = rows.map((_, i) => bottom - (rows.length - 1 - i) * gap);
  const row = (y: number, l: string, r: string, big?: boolean) => (
    <>
      <div style={{ position: "absolute", left: M, right: M, top: y, height: 1.5, background: OFF_WHITE, opacity: 0.7 }} />
      <div style={{ position: "absolute", left: M, top: y - (big ? wPx : sPx) - 10 * k, fontFamily: SANS, fontWeight: big ? 800 : 600, fontSize: big ? wPx : sPx, letterSpacing: big ? "0.04em" : "0.2em", lineHeight: 1, textShadow: "0 1px 8px rgba(0,0,0,.45)" }}>{l}</div>
      <div style={{ position: "absolute", right: M, top: y - sPx - 10 * k, fontFamily: SANS, fontWeight: 500, fontSize: sPx, letterSpacing: "0.12em", lineHeight: 1, textAlign: "right", whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,.45)" }}>{r}</div>
    </>
  );
  const firstY = top + 110 * k + wPx;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: firstY + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ys[0] - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.64))" }} />
      {row(firstY, word, "", true)}
      {rows.map(([l, r], i) => (
        <div key={l + i}>{row(ys[i], l, r)}</div>
      ))}
      <AgencyLogo data={data} height={22} style={{ position: "absolute", right: M, top: top - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }} />
    </div>
  );
}

/** Natural · linhas (matchday): MATCHDAY on the top line; at the foot HOME / AWAY / KICK-OFF lines with the exact names and date · time. */
export function Natlines({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatLinesFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      rows={[
        ["HOME", fx.homeName.toUpperCase()],
        ["AWAY", fx.awayName.toUpperCase()],
        ["KICK-OFF", [fx.date.toUpperCase(), fx.kickoff].filter(Boolean).join(" · ")],
      ]}
    />
  );
}

/** Natural goal · linhas: GOAL on the top line over his celebration; PLAYER and CLUB lines at the foot (exact club name). No score. */
export function Goalnatlines({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatLinesFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      rows={[
        ["PLAYER", name.toUpperCase()],
        ["CLUB", ourClub(data).toUpperCase()],
      ]}
    />
  );
}
