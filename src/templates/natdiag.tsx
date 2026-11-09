import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "diagonal" natural looks: his real photo full-bleed and two text blocks on
 * opposite corners — top-left a small label (the word and a detail), bottom-right the big figure (the
 * kick-off time / the surname) with one line under it — so the eye runs across the photo through him. The
 * NEYOD logo bottom-left. Soft shades only in those two corners.
 */
function NatDiagFrame({ data, label, sub, big, under }: { data: RenderData; label: string; sub: string; big: string; under: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 740 : 540,
    fs: story ? 245 : 155,
  });
  const M = 64;
  const top = (story ? STORY_TOP : 60) - (params.textY ?? 0);
  const bottom = story ? STORY_BOTTOM : H - 60;
  const lPx = 30 * k * ts;
  const sPx = 17 * k * ts;
  const bPx = Math.min(140 * k * ts, 560 / Math.max(1, big.length * 0.6));
  const uPx = 18 * k * ts;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W * 0.75, height: top + 260 * k, background: "radial-gradient(120% 100% at 0% 0%, rgba(0,0,0,.5), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", right: 0, bottom: 0, width: CANVAS_W, height: H - bottom + bPx + 300 * k, background: "radial-gradient(100% 100% at 100% 100%, rgba(0,0,0,.62), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: SANS, fontWeight: 800, fontSize: lPx, letterSpacing: "0.1em", lineHeight: 1 }}>{label}</div>
      <div style={{ position: "absolute", left: M, top: top + lPx + 12 * k, fontFamily: SANS, fontWeight: 500, fontSize: sPx, lineHeight: 1.3, opacity: 0.88, whiteSpace: "nowrap" }}>{sub}</div>
      <div style={{ position: "absolute", right: M, top: bottom - uPx - 14 * k - bPx * 0.9, textAlign: "right", fontFamily: SANS, fontWeight: 800, fontSize: bPx, letterSpacing: "-0.04em", lineHeight: 0.9, whiteSpace: "nowrap" }}>{big}</div>
      <div style={{ position: "absolute", right: M, top: bottom - uPx, textAlign: "right", fontFamily: SANS, fontWeight: 500, fontSize: uPx, lineHeight: 1, opacity: 0.9, whiteSpace: "nowrap" }}>{under}</div>
      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: M, top: bottom - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

/** Natural · diagonal (matchday): MATCHDAY and the date top-left; the kick-off time big bottom-right, "Home v Away" under it. */
export function Natdiag({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatDiagFrame data={data} label={word} sub={[fx.date, fx.ptTime, fx.venue].filter(Boolean).join(" · ")} big={fx.time || fx.date} under={`${fx.homeName} v ${fx.awayName}`} />;
}

/** Natural goal · diagonal: GOAL and his club's exact name top-left; his surname big bottom-right, his first name under it. No score. */
export function Goalnatdiag({ data }: { data: RenderData }) {
  return <NatDiagFrame data={data} label={(data.content.kicker || "GOAL").toUpperCase()} sub={ourClub(data)} big={data.content.lastName ?? ""} under={data.content.firstName ?? ""} />;
}
