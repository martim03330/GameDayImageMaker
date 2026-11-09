import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "four corners" natural looks: his real photo full-bleed and one short fact in each
 * corner, in two-line small caps (a tiny label over a bold value) — top-left, top-right, bottom-left,
 * bottom-right — with the NEYOD logo centred at the top (at the foot long team names ran into it). The middle
 * stays his. Corner shades only.
 */
function NatCorners4Frame({ data, cells }: { data: RenderData; cells: [string, string][] }) {
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
  const top = (story ? STORY_TOP : 56) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 56;
  const tPx = 12 * k * ts;
  const vPx = 24 * k * ts;
  const cellH = tPx + 10 * k + vPx;
  const spots: Record<number, React.CSSProperties> = {
    0: { left: M, top, textAlign: "left" },
    1: { right: M, top, textAlign: "right" },
    2: { left: M, top: bottom - cellH, textAlign: "left" },
    3: { right: M, top: bottom - cellH, textAlign: "right" },
  };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + cellH + 160 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + cellH + 180 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      {cells.slice(0, 4).map(([label, value], i) => value && (
        <div key={i} style={{ position: "absolute", ...spots[i], maxWidth: (CANVAS_W - 2 * M) / 2 - (i < 2 ? 120 : 10) }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.78 }}>{label}</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: vPx, letterSpacing: "-0.01em", lineHeight: 1, marginTop: 10 * k, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
        </div>
      ))}
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", top: top - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · quatro cantos (matchday): MATCHDAY / date · HOME team · AWAY team · KICK-OFF, one per corner (exact names). */
export function Natcorners4({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatCorners4Frame
      data={data}
      cells={[
        [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date],
        ["KICK-OFF", fx.kickoff],
        ["HOME", fx.homeName],
        ["AWAY", fx.awayName],
      ]}
    />
  );
}

/** Natural goal · quatro cantos: GOAL / date · FOR his club (exact name) · PLAYER · V the opponent. No score. */
export function Goalnatcorners4({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatCorners4Frame
      data={data}
      cells={[
        [(data.content.kicker || "GOAL").toUpperCase(), fx.date || ""],
        ["FOR", ourClub(data)],
        ["PLAYER", [data.content.firstName, data.content.lastName].filter(Boolean).join(" ")],
        ["V", (data.content.home === false ? fx.homeName : fx.awayName) || ""],
      ]}
    />
  );
}
