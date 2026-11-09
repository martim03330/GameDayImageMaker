import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "when / where" natural looks (an invitation): his real photo full-bleed; at the foot-left
 * the word in bold, and under it two or three label/value pairs on one grid — a narrow column of tiny tracked labels
 * (WHEN, WHERE…) and the values in medium weight beside them. The NEYOD logo alone at the top.
 */
function NatWhenwhereFrame({ data, word, rows }: { data: RenderData; word: string; rows: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const rs = rows.filter(([, v]) => v);
  const vPx = 21 * k * ts;
  const tPx = 12 * k * ts;
  const rowH = vPx * 1.55;
  const labelW = 120 * k;
  const wPx = Math.min(70 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.64));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const tTop = bottom - rs.length * rowH;
  const wTop = tTop - 22 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      {rs.map(([label, value], i) => (
        <div key={label} style={{ position: "absolute", left: M, right: M, top: tTop + i * rowH, height: rowH, display: "flex", alignItems: "baseline" }}>
          <span style={{ width: labelW, flexShrink: 0, fontFamily: SANS, fontWeight: 700, fontSize: tPx, letterSpacing: "0.26em", opacity: 0.7 }}>{label}</span>
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: vPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · quando e onde (matchday): "Matchday" over WHO / WHEN / WHERE rows (exact names). */
export function Natwhenwhere({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return (
    <NatWhenwhereFrame
      data={data}
      word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}
      rows={[
        ["WHO", `${fx.homeName} v ${fx.awayName}`],
        ["WHEN", [fx.date, fx.kickoff].filter(Boolean).join(" · ")],
        ["WHERE", fx.venue],
      ]}
    />
  );
}

/** Natural goal · quando e onde: "Goal" over WHO / FOR rows — his name and his club's exact name. No score. */
export function Goalnatwhenwhere({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  return (
    <NatWhenwhereFrame
      data={data}
      word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}
      rows={[
        ["WHO", [data.content.firstName, data.content.lastName].filter(Boolean).join(" ")],
        ["FOR", ourClub(data)],
      ]}
    />
  );
}
