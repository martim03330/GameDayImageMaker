import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "brace" natural looks: his real photo full-bleed; at the foot-left the word in bold over a
 * stack of three short lines grouped by a thin square bracket on their left. The NEYOD logo alone at the top.
 */
function NatBracevFrame({ data, word, rows }: { data: RenderData; word: string; rows: string[] }) {
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
  const rPx = 22 * k * ts;
  const stackH = rs.length * rPx * 1.45;
  const wPx = Math.min(64 * k * ts, 620 / Math.max(1, word.length * 0.62));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const sTop = bottom - stackH;
  const wTop = sTop - 22 * k - wPx;
  const arm = 16 * k;
  const bx = M;
  const tx = M + arm + 18 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: bx, top: sTop, width: arm, height: stackH, borderLeft: `2px solid ${OFF_WHITE}`, borderTop: `2px solid ${OFF_WHITE}`, borderBottom: `2px solid ${OFF_WHITE}`, boxSizing: "border-box", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: tx, right: M, top: sTop, fontFamily: SANS, fontWeight: 600, fontSize: rPx, lineHeight: 1.45 }}>
        {rs.map((r) => (
          <div key={r} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {r}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · chaveta (matchday): "Matchday" over a bracketed stack — Home / v Away / date · time (exact names). */
export function Natbracev({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatBracevFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} rows={[fx.homeName, `v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · chaveta: "Goal" over a bracketed stack — first name / surname / club (exact name). No score. */
export function Goalnatbracev({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  return <NatBracevFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} rows={[data.content.firstName ?? "", data.content.lastName ?? "", ourClub(data)]} />;
}
