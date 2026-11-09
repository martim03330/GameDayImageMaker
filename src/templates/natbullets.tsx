import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "bullets" natural looks: his real photo full-bleed; at the foot-left the word in bold over
 * a short list — each line led by a small solid square bullet in his club's colour. The NEYOD logo alone at the top.
 */
function NatBulletsFrame({ data, word, rows }: { data: RenderData; word: string; rows: string[] }) {
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
  const rs = rows.filter(Boolean);
  const rPx = 21 * k * ts;
  const rowH = rPx * 1.55;
  const wPx = Math.min(66 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.64));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const listTop = bottom - rs.length * rowH;
  const wTop = listTop - 18 * k - wPx;
  const B = 10 * k;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      {rs.map((r, i) => (
        <div key={r} style={{ position: "absolute", left: M, right: M, top: listTop + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: 16 * k }}>
          <span style={{ width: B, height: B, background: colour, flexShrink: 0 }} />
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: rPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r}</span>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · lista com marcas (matchday): "Matchday" over a bulleted list — Home v Away, date · time, venue (exact names). */
export function Natbullets({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatBulletsFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} rows={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · "), fx.venue]} />;
}

/** Natural goal · lista com marcas: "Goal" over a bulleted list — his name, his club's exact name. No score. */
export function Goalnatbullets({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBulletsFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} rows={[name, ourClub(data)]} />;
}
