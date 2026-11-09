import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "leaders" natural looks (a table of contents): his real photo full-bleed; at the foot the
 * word in bold, and under it a few rows each made of a small caps label at the left, a dotted leader line, and the
 * value at the right — the exact names on the right. The NEYOD logo alone at the top.
 */
function NatLeadersFrame({ data, word, rows }: { data: RenderData; word: string; rows: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 480,
    fs: story ? 240 : 150,
  });
  const M = 60;
  const rs = rows.filter(([, v]) => v);
  const rPx = 22 * k * ts;
  const rowH = rPx * 1.75;
  const wPx = Math.min(54 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.66));
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const tTop = bottom - rs.length * rowH;
  const wTop = tTop - 18 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55) 45%, rgba(0,0,0,.72))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      {rs.map(([label, value], i) => (
        <div key={label} style={{ position: "absolute", left: M, right: M, top: tTop + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: 12 * k, fontFamily: SANS, fontSize: rPx, lineHeight: 1 }}>
          <span style={{ fontWeight: 600, fontSize: rPx * 0.85, letterSpacing: "0.18em", opacity: 0.85, flexShrink: 0 }}>{label}</span>
          <span style={{ flex: 1, borderBottom: `${3 * k}px dotted rgba(244,241,234,.7)`, alignSelf: "center", marginTop: rPx * 0.3 }} />
          <span style={{ fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>{value}</span>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linhas pontilhadas (matchday): MATCHDAY over HOME ···· / AWAY ···· / KICK-OFF ···· rows (exact names). */
export function Natleaders({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatLeadersFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      rows={[
        ["HOME", fx.homeName],
        ["AWAY", fx.awayName],
        ["KICK-OFF", [fx.date, fx.kickoff].filter(Boolean).join(" · ")],
      ]}
    />
  );
}

/** Natural goal · linhas pontilhadas: GOAL over PLAYER ···· / CLUB ···· rows (exact club name). No score. */
export function Goalnatleaders({ data }: { data: RenderData }) {
  return (
    <NatLeadersFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      rows={[
        ["PLAYER", [data.content.firstName, data.content.lastName].filter(Boolean).join(" ")],
        ["CLUB", ourClub(data)],
      ]}
    />
  );
}
