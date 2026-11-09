import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "two columns" natural looks (an editorial footer): his real photo full-bleed; at the
 * foot a hairline across the width and, under it, two equal columns of left-aligned text — the left one the
 * word in bold over a line, the right one two lines of details. The NEYOD logo alone at the top.
 */
function NatFootcolsFrame({ data, word, sub, right }: { data: RenderData; word: string; sub: string; right: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const colW = (CANVAS_W - 2 * M - 40) / 2;
  const wPx = Math.min(44 * k * ts, colW / Math.max(1, word.length * 0.62));
  const lPx = 18 * k * ts;
  const rs = right.filter(Boolean);
  const blockH = Math.max(wPx + 10 * k + lPx, rs.length * lPx * 1.4);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - blockH;
  const ruleY = top - 22 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ruleY - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, right: M, top: ruleY, height: 1.5, background: OFF_WHITE, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: M, width: colW, top }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1, marginTop: 10 * k, opacity: 0.88, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
      <div style={{ position: "absolute", left: M + colW + 40, width: colW, top, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
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

/** Natural · duas colunas (matchday): MATCHDAY / date left; Home v Away and kick-off · venue right (exact names). */
export function Natfootcols({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatFootcolsFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} sub={fx.date} right={[`${fx.homeName} v ${fx.awayName}`, [fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · duas colunas: GOAL / date left; his name and his club's exact name right. No score. */
export function Goalnatfootcols({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFootcolsFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} sub={fx.date} right={[name, ourClub(data)]} />;
}
