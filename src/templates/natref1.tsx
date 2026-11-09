/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Round 51 · natural looks, each a faithful adaptation of ONE real reference (Pinterest "matchday poster minimal
 * photo"): his real photo (background softly blurred by /api/natframe, he stays sharp), one quiet word, one small
 * fixture line. Same frame as natlayouts' `behind` family — the quality bar.
 *
 *   natrefserif   "Matchdag." (Malmö FF) — a title-case serif word with a full stop, centred on the free band,
 *                 the fixture tiny under it, the kick-off small near the foot
 *   natreffoot    "MATCHDAY" (Chelsea v Barça, UCL) — wide serif caps across the foot with both crests small over
 *                 them and the date | kick-off | ground line under
 */

const W = CANVAS_W;
export const SERIF = "var(--font-fraunces), Georgia, serif";
export const BODONI = "var(--font-bodoni), Didot, serif";

type Frame = { H: number; k: number; ts: number; story: boolean; logoTop: number; bottom: number };

export function frameOf(data: RenderData): Frame {
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = data.params.textScale ?? 1;
  return { H, k: story ? 1.3 : 1, ts, story, logoTop: (story ? STORY_TOP : 46) - (data.params.logoY ?? 0), bottom: (story ? STORY_BOTTOM : H - 60) - (data.params.textY ?? 0) };
}

/** The photo, his sharp figure, the type layers and the logo — exactly as natlayouts draws them. */
export function Shell({ data, place, back, front, ground, bg = "#2b3a2a", figureStyle }: { data: RenderData; place: ReturnType<typeof natPlace>; back?: ReactNode; front?: ReactNode; /** A treated ground (grade, zoom…) in place of the plain photo — his figure on top stays untouched. */ ground?: ReactNode; bg?: string; figureStyle?: CSSProperties }) {
  const { H, logoTop } = frameOf(data);
  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: bg, color: OFF_WHITE }}>
      {ground ?? <NatGround place={place} W={W} H={H} />}
      {back}
      <NatFigure data={data} place={place} W={W} H={H} style={figureStyle} />
      {front}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${data.params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

export const shade = (top: number, h: number, dir: "down" | "up", a = 0.5): ReactNode => (
  <div style={{ position: "absolute", left: 0, right: 0, top, height: h, background: dir === "down" ? `linear-gradient(to bottom, rgba(0,0,0,${a}), rgba(0,0,0,0))` : `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,${a}))` }} />
);
export const small = (px: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: px, lineHeight: 1.35, whiteSpace: "nowrap", ...extra });
export const caps = (px: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: 600, fontSize: px, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.35, whiteSpace: "nowrap", ...extra });
/** Fits a single line of `text` (em width `em`) into `w`. */
export const fit = (max: number, w: number, chars: number, em: number) => Math.min(max, w / Math.max(1, chars * em));

/* ===== natrefserif — "Matchdag." ===== */

function SerifWord({ data, word, sub, foot }: { data: RenderData; word: string; sub: string; foot: string }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 400 : 680, fy: story ? 640 : 470, fs: story ? 235 : 150 });
  // Candidate boxes over the blurred background: the free side as a column (left / right, high to low) and full-width
  // bands; each sized for the word at that width. The quietest one wins — the box clear of his body when one exists.
  const M = 60;
  const cands = [
    ...[0.24, 0.36, 0.48, 0.6].flatMap((f) => [
      { x0: M, x1: W * 0.5, y: H * f, align: "left" as const },
      { x0: W * 0.5, x1: W - M, y: H * f, align: "right" as const },
    ]),
    ...[0.5, 0.6, 0.68].map((f) => ({ x0: M, x1: W - M, y: H * f, align: "center" as const })),
  ].map((c) => {
    const wPx = fit(150 * k * ts, c.x1 - c.x0, word.length, 0.5);
    const sPx = fit(22 * k * ts, c.x1 - c.x0, sub.length, 0.55);
    return { ...c, wPx, sPx, h: wPx * 1.05 + sPx * 1.6 };
  });
  // Too small a word (a long kicker in a half column) does not count as a spot.
  const ok = cands.filter((c) => c.wPx >= 70 * k);
  const spot = pickTextSpot(place, ok.map((c) => ({ x0: c.x0, y0: c.y, x1: c.x1, y1: c.y + c.h })));
  const at = ok[spot.index];
  const { wPx, sPx, h: blockH, y } = at;
  const fPx = 18 * k * ts;
  return (
    <Shell
      data={d}
      place={place}
      front={
        <>
          {shade(0, 300 * k, "down", 0.35)}
          <div style={{ position: "absolute", left: at.x0 - 120 * k, width: at.x1 - at.x0 + 240 * k, top: y - 160 * k, height: blockH + 320 * k, background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,${spot.crowded ? 0.5 : 0.3}), rgba(0,0,0,0) 70%)` }} />
          <div style={{ position: "absolute", left: at.x0, width: at.x1 - at.x0, top: y, textAlign: at.align, textShadow: "0 2px 18px rgba(0,0,0,.55)" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: wPx, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{word}</div>
            <div style={small(sPx, { marginTop: sPx * 0.3 })}>{sub}</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: bottom - fPx * 2.8, textAlign: "center", ...small(fit(fPx, W - 120, Math.max(...foot.split("\n").map((l) => l.length)), 0.55), { opacity: 0.9, whiteSpace: "pre", textShadow: "0 1px 8px rgba(0,0,0,.6)" }) }}>{foot}</div>
        </>
      }
    />
  );
}

export function Natrefserif({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = data.content.kicker ? data.content.kicker.charAt(0).toUpperCase() + data.content.kicker.slice(1).toLowerCase() : "Matchday";
  return <SerifWord data={data} word={`${word}.`} sub={`${fx.homeName} / ${fx.awayName}`} foot={[roundTitle(data), [fx.date, fx.kickoff].filter(Boolean).join(" · ")].filter(Boolean).join("\n")} />;
}

/** The same reference for a goal: "Goal." with his name and his club's exact name; no score. */
export function Goalnatrefserif({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const word = data.content.kicker ? data.content.kicker.charAt(0).toUpperCase() + data.content.kicker.slice(1).toLowerCase() : "Goal";
  return <SerifWord data={data} word={`${word}.`} sub={name} foot={ourClub(data)} />;
}

/* ===== natreffoot — "MATCHDAY" across the foot ===== */

export function Natreffoot({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 430 : 650, fy: story ? 620 : 450, fs: story ? 250 : 160 });
  const word = (d.content.kicker || "MATCHDAY").toUpperCase();
  const wPx = fit(170 * k * ts, W - 70, word.length, 0.74);
  const l1 = [fx.date, fx.kickoff, fx.venue].filter(Boolean).join("  |  ").toUpperCase();
  const l2 = (roundTitle(d) || "").toUpperCase();
  const lPx = fit(18 * k * ts, W - 100, Math.max(l1.length, l2.length), 0.66);
  const linesH = (l2 ? 2 : 1) * lPx * 1.4;
  const wTop = bottom - linesH - 10 * k - wPx * 0.95;
  const cs = 64 * k;
  return (
    <Shell
      data={d}
      place={place}
      front={
        <>
          {shade(0, 260 * k, "down", 0.3)}
          {shade(wTop - cs - 300 * k, H - wTop + cs + 300 * k, "up", 0.62)}
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop - cs - 18 * k, display: "flex", justifyContent: "center", gap: 18 * k }}>
            {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: wPx, lineHeight: 0.95, letterSpacing: "-0.01em" }}>{word}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: bottom - linesH, textAlign: "center" }}>
            <div style={caps(lPx, { fontWeight: 600 })}>{l1}</div>
            {l2 && <div style={caps(lPx, { opacity: 0.85 })}>{l2}</div>}
          </div>
        </>
      }
    />
  );
}
