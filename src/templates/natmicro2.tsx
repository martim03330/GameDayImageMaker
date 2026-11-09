import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "micro" natural looks — almost nothing on the photo: his real photo full-bleed and,
 * at the very foot, tiny mono caps like the caption strip of a contact sheet: the middle item over a hairline,
 * the two others under it at the left and right. The NEYOD logo at the top. A thin shade only under the strip.
 */
function NatMicro2Frame({ data, l, c, r }: { data: RenderData; l: string; c: string; r: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 720 : 520,
    fs: story ? 250 : 160,
  });
  const M = 48;
  const bottom = (story ? STORY_BOTTOM : H - 44) - (params.textY ?? 0);
  const px = 14 * k * ts;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const cell = { position: "absolute", top: bottom - px, fontFamily: MONO, fontWeight: 500, fontSize: px, letterSpacing: "0.12em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 1px 6px rgba(0,0,0,.6)" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + 170 * k, background: "linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0))" }} />
      {/* The middle item on its own line above the rule: on one line it ran into the right-hand one. */}
      <div style={{ ...cell, top: bottom - px * 2 - 32 * k, left: 0, width: CANVAS_W, textAlign: "center" }}>{c}</div>
      <div style={{ position: "absolute", left: M, right: M, top: bottom - px - 16 * k, height: 1, background: OFF_WHITE, opacity: 0.5 }} />
      <div style={{ ...cell, left: M }}>{l}</div>
      <div style={{ ...cell, right: M, textAlign: "right" }}>{r}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · micro (matchday): MATCHDAY · HOME V AWAY · date time in tiny mono at the foot (exact names). */
export function Natmicro2({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatMicro2Frame data={data} l={(data.content.kicker || "MATCHDAY").toUpperCase()} c={`${fx.homeName} v ${fx.awayName}`.toUpperCase()} r={[fx.date, fx.kickoff].filter(Boolean).join(" ").toUpperCase()} />;
}

/** Natural goal · micro: GOAL · his name · his club's exact name in tiny mono under his celebration. No score. */
export function Goalnatmicro2({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatMicro2Frame data={data} l={(data.content.kicker || "GOAL").toUpperCase()} c={name.toUpperCase()} r={ourClub(data).toUpperCase()} />;
}
