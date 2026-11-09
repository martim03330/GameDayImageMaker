import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "list" natural looks (an index): his real photo full-bleed; at the foot-left a short
 * numbered list — "01", "02", "03" in small mono, each followed by a line in bold sans, hairlines between —
 * like a programme's contents. The NEYOD logo alone at the top. A soft shade only under the list.
 */
function NatListFrame({ data, rows }: { data: RenderData; rows: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 700 : 500,
    fs: story ? 245 : 155,
  });
  const M = 64;
  const ls = rows.filter(Boolean);
  const rPx = 26 * k * ts;
  const rowH = rPx * 1.9;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const top = bottom - ls.length * rowH;
  const W = 620 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 45%, rgba(0,0,0,.68))" }} />
      {ls.map((r, i) => (
        <div key={r + i} style={{ position: "absolute", left: M, width: W, top: top + i * rowH, height: rowH, borderTop: `1px solid rgba(244,241,234,${i ? 0.4 : 0.8})`, display: "flex", alignItems: "center", gap: 22 * k }}>
          <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: rPx * 0.55, opacity: 0.75 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ fontFamily: SANS, fontWeight: i === 0 ? 800 : 600, fontSize: rPx, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r}</span>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · lista (matchday): 01 Matchday · 02 Home v Away · 03 date, time · 04 venue (exact names). */
export function Natlist({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatListFrame data={data} rows={[w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(), `${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(", "), fx.venue]} />;
}

/** Natural goal · lista: 01 Goal · 02 his name · 03 his club's exact name, over his celebration. No score. */
export function Goalnatlist({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatListFrame data={data} rows={[w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(), name, ourClub(data)]} />;
}
