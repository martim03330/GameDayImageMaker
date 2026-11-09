import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "diamonds" natural looks: his real photo full-bleed; at the foot one centred line of three
 * items in bold caps separated by small diamonds in his club's colour (the word in the middle, larger); nothing else
 * but the NEYOD logo at the top.
 */
function NatDiamondFrame({ data, items }: { data: RenderData; items: [string, string, string] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 710 : 520,
    fs: story ? 245 : 155,
  });
  const [a, b, c] = items;
  const sPx = 20 * k * ts;
  const bPx = 34 * k * ts;
  const D = 12 * k;
  const gap = 26 * k;
  const em = (capsEm(a, 0.16) + capsEm(c, 0.16)) * sPx + capsEm(b, 0.12) * bPx + 4 * gap + 2 * D;
  const f = Math.min(1, (CANVAS_W - 100) / Math.max(1, em));
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const dia = <span style={{ width: D * f, height: D * f, background: colour, transform: "rotate(45deg)", flexShrink: 0 }} />;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + bPx + 200 * k, background: "linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - bPx * f, height: bPx * f, display: "flex", alignItems: "center", justifyContent: "center", gap: gap * f, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1 }}>
        <span style={{ fontWeight: 700, fontSize: sPx * f, letterSpacing: "0.16em" }}>{a}</span>
        {dia}
        <span style={{ fontWeight: 800, fontSize: bPx * f, letterSpacing: "0.12em" }}>{b}</span>
        {dia}
        <span style={{ fontWeight: 700, fontSize: sPx * f, letterSpacing: "0.16em" }}>{c}</span>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · losangos (matchday): 25 OCT ◆ MATCHDAY ◆ 15:30 at the foot, diamonds in his club's colour. */
export function Natdiamond({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatDiamondFrame data={data} items={[(fx.date || fx.homeName).toUpperCase(), word, (fx.kickoff || fx.awayName).toUpperCase()]} />;
}

/** Natural goal · losangos: HIS NAME ◆ GOAL ◆ HIS CLUB (exact name) under his celebration. No score. */
export function Goalnatdiamond({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDiamondFrame data={data} items={[name.toUpperCase(), (data.content.kicker || "GOAL").toUpperCase(), ourClub(data).toUpperCase()]} />;
}
