import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "three columns" natural looks: his real photo full-bleed; at the foot three equal
 * columns divided by short vertical hairlines, each holding one centred item in small bold caps (two lines max),
 * the middle one the word. The NEYOD logo alone at the top.
 */
function NatCols3Frame({ data, items }: { data: RenderData; items: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 700 : 510,
    fs: story ? 245 : 155,
  });
  const M = 50;
  const colW = (CANVAS_W - 2 * M) / 3;
  const pPx = 25 * k * ts;
  const mPx = 34 * k * ts;
  const rowH = mPx * 2.4;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - rowH;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      {[1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: M + i * colW, top: top + rowH * 0.1, width: 1.5, height: rowH * 0.8, background: OFF_WHITE, opacity: 0.7 }} />
      ))}
      {items.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: M + i * colW + 14, width: colW - 28, top, height: rowH, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: i === 1 ? mPx : pPx, letterSpacing: i === 1 ? "0.12em" : "0.06em", lineHeight: 1.15 }}>
          {t}
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · três colunas (matchday): HOME | MATCHDAY | AWAY at the foot, hairlines between (exact names). */
export function Natcols3({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatCols3Frame data={data} items={[fx.homeName.toUpperCase(), (data.content.kicker || "MATCHDAY").toUpperCase(), fx.awayName.toUpperCase()]} />;
}

/** Natural goal · três colunas: HIS NAME | GOAL | HIS CLUB (exact name) under his celebration. No score. */
export function Goalnatcols3({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCols3Frame data={data} items={[name.toUpperCase(), (data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()]} />;
}
