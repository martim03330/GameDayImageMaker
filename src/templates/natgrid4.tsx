import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "2×2" natural looks (a spec card): his real photo full-bleed; at the foot-left a small
 * 2×2 grid of hairline-bordered cells, each with a tiny label and a bold value; the word in bold above the grid.
 * The NEYOD logo alone at the top.
 */
function NatGrid4Frame({ data, word, cells }: { data: RenderData; word: string; cells: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 620,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const cw = 270 * k;
  const ch = 84 * k;
  const tPx = 11 * k * ts;
  const vPx = 20 * k * ts;
  const wPx = Math.min(54 * k * ts, (2 * cw) / Math.max(1, word.length * 0.62));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const gTop = bottom - 2 * ch;
  const wTop = gTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, top: wTop - 200 * k, width: CANVAS_W * 0.8, bottom: 0, background: "radial-gradient(100% 90% at 0% 100%, rgba(0,0,0,.62), rgba(0,0,0,0) 72%)" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M, top: gTop, width: 2 * cw, height: 2 * ch, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", border: `1.5px solid rgba(244,241,234,.75)`, boxSizing: "border-box", background: "rgba(10,12,10,.42)", backdropFilter: "blur(2px)" }}>
        {cells.slice(0, 4).map(([l, v], i) => (
          <div key={i} style={{ borderRight: i % 2 === 0 ? "1.5px solid rgba(244,241,234,.75)" : undefined, borderBottom: i < 2 ? "1.5px solid rgba(244,241,234,.75)" : undefined, padding: `${12 * k}px ${16 * k}px`, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.75 }}>{l}</div>
            {/* Sized to its cell, never cut: club names must read in full (no ellipsis). */}
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: Math.min(vPx, (cw - 34 * k) / Math.max(1, (v || "—").length * 0.58)), lineHeight: 1, marginTop: 10 * k, whiteSpace: "nowrap" }}>{v || "—"}</div>
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · grelha 2×2 (matchday): MATCHDAY over HOME / AWAY / DATE / KICK-OFF cells (exact names). */
export function Natgrid4({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatGrid4Frame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      cells={[
        ["HOME", fx.homeName],
        ["AWAY", fx.awayName],
        ["DATE", fx.date],
        ["KICK-OFF", fx.kickoff],
      ]}
    />
  );
}

/** Natural goal · grelha 2×2: GOAL over PLAYER / CLUB (exact name) / DATE / V cells, on his celebration. No score. */
export function Goalnatgrid4({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatGrid4Frame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      cells={[
        ["PLAYER", [data.content.firstName, data.content.lastName].filter(Boolean).join(" ")],
        ["CLUB", ourClub(data)],
        ["DATE", fx.date],
        ["V", data.content.home === false ? fx.homeName : fx.awayName],
      ]}
    />
  );
}
