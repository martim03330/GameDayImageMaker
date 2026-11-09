/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GOLD = "#e9b872";
const SHADOW = "0 1px 3px rgba(40,14,0,.45), 0 2px 18px rgba(40,14,0,.35)";

export type SandLine = { text: string; size: number; small?: boolean };

/**
 * The shared frame of the "golden" natural looks (reference: the warm "CAVS vs BUCKS" game-day poster):
 * his real photo with the SURROUNDINGS washed in a warm gold (soft-light + colour layers on the ground
 * only) while he keeps the photo's own colours on the sharp figure layer — he pops out of a sunset. On the
 * side away from him, stacked tall condensed light caps (HOME / vs / AWAY, or GOAL / his name), a small
 * gold label and date line on top, a gold hairline and the venue at the foot. The NEYOD logo alone.
 */
export function NatSandFrame({ data, label, sub, big, foot }: { data: RenderData; label: string; sub: string; big: SandLine[]; foot: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 72 : 64;
  // He stands on one side, the type on the other (params.side = the side HE is on).
  const heLeft = params.side === "left";
  const place = natPlace(data, CANVAS_W, H, { fx: heLeft ? 360 : 720, fy: story ? 700 : 470, fs: story ? 210 : 158 });
  // The type stops short of his body (≈ 2.3 face-widths from his face's centre), never over him.
  const room = Math.max(320, Math.min(520 * k, heLeft ? CANVAS_W - M - (place.fx + 2.3 * place.faceW) : place.fx - 2.3 * place.faceW - M));
  const x0 = heLeft ? CANVAS_W - M - room : M;
  const align = heLeft ? "right" : "left";

  const top = (story ? STORY_TOP : 78) - (params.textY ?? 0);
  const labelPx = 22 * k * ts;
  const subPx = Math.min(19 * k * ts, room / Math.max(1, capsEm(sub, 0.22)));
  // Tall condensed caps: Barlow Condensed is ~0.46em per capital.
  const fitted = big
    .filter((l) => l.text)
    .map((l) => ({ ...l, px: Math.min(l.size * k * ts, room / Math.max(1, l.text.length * (l.small ? 0.5 : 0.47))) }));
  const bigTop = top + labelPx + subPx + 70 * k;
  let y = bigTop;
  const lines = fitted.map((l) => {
    const t = y;
    y += l.px * (l.small ? 1.05 : 0.9);
    return { ...l, top: t };
  });

  const footY = (story ? STORY_BOTTOM : H - 64) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);
  const text = (t: string, topY: number, px: number, extra: CSSProperties) => (
    <div key={t + topY} style={{ position: "absolute", left: x0, width: room, top: topY, textAlign: align, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, ...extra }}>
      {t}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#3a1c08", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {/* The gold wash: on the ground only — he is redrawn untouched on top. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #f6a24a, #c8561c)", mixBlendMode: "soft-light", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "#e88a3c", mixBlendMode: "color", opacity: 0.42 }} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean />
      {/* A warm shade on the type's side so the light caps read on bright grass and sky. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${heLeft ? "left" : "right"}, rgba(60,22,4,.55), rgba(60,22,4,.25) 45%, rgba(60,22,4,0) 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 420 : 300, background: "linear-gradient(to top, rgba(50,18,2,.6), rgba(50,18,2,0))" }} />

      {text(label, top, labelPx, { fontFamily: SANS, fontWeight: 700, letterSpacing: "0.3em", color: GOLD, ...(align === "right" ? { marginRight: "-0.3em" } : {}) })}
      {text(sub, top + labelPx + 14 * k, subPx, { fontFamily: SANS, fontWeight: 600, letterSpacing: "0.22em", opacity: 0.92 })}
      {lines.map((l) =>
        text(l.text, l.top, l.px, {
          fontFamily: CONDENSED,
          fontWeight: 500,
          fontStyle: l.small ? "italic" : "normal",
          letterSpacing: l.small ? "0.04em" : "-0.005em",
          color: l.small ? GOLD : OFF_WHITE,
        }),
      )}

      {/* Foot: a gold hairline across the type's side, the venue above it, the logo under it. */}
      <div style={{ position: "absolute", left: x0, width: room, top: footY - logoH - 30 * k, height: 1.5, background: GOLD, opacity: 0.85 }} />
      {foot && text(foot, footY - logoH - 30 * k - 32 * k, Math.min(17 * k * ts, room / Math.max(1, capsEm(foot, 0.26))), { fontFamily: SANS, fontWeight: 600, letterSpacing: "0.26em", opacity: 0.9 })}
      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: heLeft ? x0 + room - logoW : x0, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: heLeft ? "right top" : "left top" }}
      />
    </div>
  );
}

/**
 * Natural · dourado (matchday): his real photo, the surroundings washed in warm gold while he keeps his own
 * colours. Beside him, tall light condensed caps HOME / vs / AWAY (exact names, home first), "MATCHDAY" in
 * small gold tracked caps with date · kick-off above, and "AT VENUE" over a gold hairline at the foot.
 */
export function Natsand({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatSandFrame
      data={data}
      label={(data.content.kicker || "Matchday").toUpperCase()}
      sub={[fx.date, fx.kickoff].filter(Boolean).join("   ·   ")}
      big={[
        { text: fx.homeName.toUpperCase(), size: 118 },
        { text: "vs", size: 54, small: true },
        { text: fx.awayName.toUpperCase(), size: 118 },
      ]}
      foot={fx.venue ? `AT  ${fx.venue.toUpperCase()}` : ""}
    />
  );
}
