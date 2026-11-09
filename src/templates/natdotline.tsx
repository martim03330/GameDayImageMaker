import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "timeline" natural looks: his real photo full-bleed; at the foot one thin line
 * across the width with a solid dot on it; above the dot the big label (the kick-off time / the word), under
 * it a small caption, and small labels at the line's two ends. The NEYOD logo alone at the top.
 */
function NatDotlineFrame({ data, big, caption, left, right }: { data: RenderData; big: string; caption: string; left: string; right: string }) {
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
  const M = 64;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const cPx = 17 * k * ts;
  const sPx = 13 * k * ts;
  const bPx = Math.min(64 * k * ts, 600 / Math.max(1, big.length * 0.6));
  const capTop = bottom - cPx;
  const lineY = capTop - 22 * k;
  const bigTop = lineY - 22 * k - bPx;
  const D = 16 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const end = { position: "absolute", top: lineY - sPx - 12 * k, fontFamily: SANS, fontWeight: 600, fontSize: sPx, letterSpacing: "0.2em", lineHeight: 1, opacity: 0.85, whiteSpace: "nowrap" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: bigTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, right: M, top: lineY - 1, height: 2, background: OFF_WHITE, opacity: 0.75 }} />
      <div style={{ position: "absolute", left: CANVAS_W / 2 - D / 2, top: lineY - D / 2, width: D, height: D, borderRadius: "50%", background: OFF_WHITE }} />
      <div style={{ ...end, left: M }}>{left}</div>
      <div style={{ ...end, right: M }}>{right}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bigTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: bPx, letterSpacing: "-0.02em", lineHeight: 1 }}>{big}</div>
      <div style={{ position: "absolute", left: M, right: M, top: capTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: cPx, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{caption}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linha do tempo (matchday): the kick-off time on the dot, MATCHDAY and the date at the line's ends, Home v Away under it. */
export function Natdotline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatDotlineFrame data={data} big={fx.time || word} caption={`${fx.homeName} v ${fx.awayName}`} left={fx.time ? word : ""} right={[fx.date.toUpperCase(), fx.ptTime].filter(Boolean).join(" · ")} />;
}

/** Natural goal · linha do tempo: "Goal" on the dot over his celebration, his name and his club's exact name at the line's ends. No score. */
export function Goalnatdotline({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDotlineFrame data={data} big={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} caption={name} left={ourClub(data).toUpperCase()} right={fx.date.toUpperCase()} />;
}
