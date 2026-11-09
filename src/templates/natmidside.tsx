import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "mid side" natural looks: his real photo full-bleed; the text block sits at mid-height on
 * the side away from him (not at the foot) — a short rule, the word in bold, two small lines — beside his torso, his
 * face clear. The NEYOD logo at the foot centre.
 */
function NatMidsideFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 660 : 420, fy: story ? 600 : 420, fs: story ? 240 : 150 });
  const M = 60;
  const W = 380 * k;
  const wPx = Math.min(58 * k * ts, W / Math.max(1, word.length * 0.64));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const blockH = 6 * k + 18 * k + wPx + 14 * k + ls.length * lPx * 1.4;
  const top = Math.max(place.fy + place.fs * 1.4, H * 0.5) - blockH / 2 - (params.textY ?? 0);
  const side = left ? { left: M, textAlign: "left" as const } : { right: M, textAlign: "right" as const };
  const bottom = story ? STORY_BOTTOM : H - 56;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", top: top - 220 * k, height: blockH + 440 * k, [left ? "left" : "right"]: 0, width: W + 2 * M + 160, background: `radial-gradient(90% 60% at ${left ? "0%" : "100%"} 50%, rgba(0,0,0,.55), rgba(0,0,0,0) 72%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + logoH + 120 * k, background: "linear-gradient(to top, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", ...side, top, width: W }}>
        <div style={{ width: 60 * k, height: 6 * k, background: OFF_WHITE, marginLeft: left ? 0 : "auto" }} />
        <div style={{ marginTop: 18 * k, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ marginTop: 14 * k, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, opacity: 0.92 }}>
          {ls.map((l) => (
            <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: bottom - logoH - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · meio lateral (matchday): the block at mid-height beside him — rule, "Matchday", Home / v Away · date (exact names). */
export function Natmidside({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatMidsideFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[fx.homeName, `v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · meio lateral: the block beside his celebration — rule, "Goal", his name, his club's exact name. No score. */
export function Goalnatmidside({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  return <NatMidsideFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[data.content.firstName ?? "", data.content.lastName ?? "", ourClub(data)]} />;
}
