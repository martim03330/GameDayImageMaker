import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "plus" natural looks (a registration cross): his real photo full-bleed; at the foot a
 * thin "+" of two hairlines, and one short fact in each of its four quadrants — small label over a bold value —
 * so the facts sit around the cross like a chart's legend. The NEYOD logo alone at the top.
 */
function NatPlusFrame({ data, cells }: { data: RenderData; cells: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 660 : 460,
    fs: story ? 240 : 150,
  });
  const tPx = 12 * k * ts;
  const vPx = 22 * k * ts;
  const cellH = tPx + 10 * k + vPx;
  const g = 26 * k; // gap from the cross
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const cy = bottom - cellH - g;
  const cx = CANVAS_W / 2;
  const arm = 360 * k;
  const armV = cellH + g + 10 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const cell = (i: number): React.CSSProperties => ({
    position: "absolute",
    top: i < 2 ? cy - g - cellH : cy + g,
    ...(i % 2 === 0 ? { right: CANVAS_W - cx + g, textAlign: "right" } : { left: cx + g, textAlign: "left" }),
    maxWidth: CANVAS_W / 2 - g - 50,
  });
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - armV - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: cx - arm, top: cy - 0.75, width: 2 * arm, height: 1.5, background: OFF_WHITE, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: cx - 0.75, top: cy - armV, width: 1.5, height: 2 * armV, background: OFF_WHITE, opacity: 0.8 }} />
      {cells.slice(0, 4).map(([label, value], i) =>
        value ? (
          <div key={i} style={cell(i)}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.78 }}>{label}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: vPx, lineHeight: 1, marginTop: 10 * k, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
          </div>
        ) : null,
      )}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · cruz (matchday): a hairline "+" with HOME, AWAY, the word · date and KICK-OFF in its quadrants (exact names). */
export function Natplus({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatPlusFrame
      data={data}
      cells={[
        ["HOME", fx.homeName],
        ["AWAY", fx.awayName],
        [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date],
        ["KICK-OFF", fx.kickoff],
      ]}
    />
  );
}

/** Natural goal · cruz: the "+" under his celebration with PLAYER, CLUB (exact name), GOAL · date and the opponent. No score. */
export function Goalnatplus({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatPlusFrame
      data={data}
      cells={[
        ["PLAYER", [data.content.firstName, data.content.lastName].filter(Boolean).join(" ")],
        ["CLUB", ourClub(data)],
        [(data.content.kicker || "GOAL").toUpperCase(), fx.date || "—"],
        ["V", (data.content.home === false ? fx.homeName : fx.awayName) || ""],
      ]}
    />
  );
}
