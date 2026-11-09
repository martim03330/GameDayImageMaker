/* eslint-disable @next/next/no-img-element */
import { isoFromShortDate } from "@/lib/timezone";
import { facesInShot, natFixture, natPlace } from "./natkit";
import { Filled } from "./natref4";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Shell, caps, fit, frameOf } from "./natref1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 60 · natural looks after ONE reference each (photo treatment first). Photos only through NatGround /
 * NatFigure, so the "Brilho suave" finish keeps working.
 *
 *   natrefnightlights  "FRIDAY NIGHT LIGHTS" (Pinterest "football matchday spotlight dark poster")
 *     treatment: night spotlight — the ground near-monochrome and dark, two floodlights blooming in the top corners
 *                blooming, a hazy glow behind him, everything else falling to black; he stays
 *                in colour, sharp
 *     type:      a tiny tracked caps tagline under the logo; WEEKDAY NIGHT LIGHTS (or MATCHDAY for a day game) in
 *                wide tracked bold caps low; the fixture tiny under it, both crests and the date
 *
 */

const W = CANVAS_W;
const DOW = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/* ===== natrefnightlights ===== */

/** Kickers the editor fills in by default: they are not a choice of the user, so the look's own word wins. */
const DEFAULT_KICKER = /^\s*(match\s*day|game\s*day|jornada|dia de jogo)\s*$/i;

/**
 * "FRIDAY NIGHT LIGHTS" for a kick-off at 18:00 or later (the local clock, the match's own day), else
 * "MATCHDAY". A kicker the user typed himself still wins; the default "MATCHDAY" every edit carries does not.
 * `time` is the local kick-off ("18:00", "18h00", "6:00 PM"); `date` the local match day ("7 NOV").
 */
export function nightWord(kicker: string | undefined, date: string | undefined, time: string): string {
  if (kicker && !DEFAULT_KICKER.test(kicker)) return kicker.toUpperCase();
  const m = /^\s*(\d{1,2})(?:[:h.](\d{2}))?\s*([ap]\.?m\.?)?/i.exec(time ?? "");
  let hour = m ? Number(m[1]) : NaN;
  if (m?.[3]) hour = (hour % 12) + (/^p/i.test(m[3]) ? 12 : 0);
  const iso = isoFromShortDate(date);
  if (Number.isNaN(hour) || hour < 18 || !iso) return "MATCHDAY";
  return `${DOW[new Date(`${iso}T12:00:00Z`).getUTCDay()]} NIGHT LIGHTS`;
}

export function Natrefnightlights({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: 540, fy: story ? 780 : 570, fs: story ? 200 : 135 });
  const word = nightWord(d.content.kicker, d.content.date, fx.time);
  const wPx = fit(64 * k * ts, W - 120, word.length, 0.78);
  const tag = (roundTitle(d) || "").toUpperCase();
  const tPx = fit(15 * k * ts, W - 200, tag.length, 0.85);
  const line = `${fx.homeName} v ${fx.awayName}`.toUpperCase();
  const lPx = fit(13 * k * ts, W - 140, line.length, 0.72);
  const cs = 50 * k;
  // The round tagline: under the logo band as in the reference, but only where it keeps clear of every face in the
  // shot (Arras's head sits right there, 2026-11-06); else it moves into the foot block, over the big word.
  const tagTop = logoTop + (story ? 150 : 100);
  const tagRect = { x0: (W - tag.length * tPx) / 2, y0: tagTop - 12 * k, x1: (W + tag.length * tPx) / 2, y1: tagTop + tPx * 1.35 + 12 * k };
  const tagHigh = !!tag && facesInShot(place).every((f) => f.x1 < tagRect.x0 || f.x0 > tagRect.x1 || f.y1 < tagRect.y0 || f.y0 > tagRect.y1);
  const blockH = wPx * 1.2 + lPx * 2 + cs + 70 * k + (tag && !tagHigh ? tPx * 1.35 + 10 * k : 0);
  const wTop = bottom - blockH;
  const lamp = (x: number) => `radial-gradient(circle at ${x}% 13%, rgba(255,255,252,1) 0%, rgba(250,250,245,.9) 3.5%, rgba(215,220,225,.45) 10%, rgba(150,155,160,.18) 22%, rgba(0,0,0,0) 38%)`;
  return (
    <Shell
      data={d}
      place={place}
      bg="#050506"
      ground={
        <>
          {/* His own copy is cut out of the graded ground (no grey ghost beside the sharp figure). */}
          <div style={{ position: "absolute", inset: 0, filter: "grayscale(.9) contrast(1.2) brightness(.45)" }}>
            <Filled place={place} H={H} />
          </div>
          {/* The corner floodlights blooming, a haze behind him, black falloff. */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `${lamp(10)}, ${lamp(90)}` }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(ellipse 55% 30% at 50% ${((place.fy + place.fs * 2) / H) * 100}%, rgba(190,195,200,.22), rgba(0,0,0,0) 70%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.85) 100%)" }} />
        </>
      }
      front={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 300 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(5,5,6,0), rgba(5,5,6,.85) 45%)" }} />
          {tagHigh && <div style={{ position: "absolute", left: 0, right: 0, top: tagTop, textAlign: "center", ...caps(tPx, { letterSpacing: "0.3em", fontWeight: 700, opacity: 0.9 }) }}>{tag}</div>}
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k }}>
            {tag && !tagHigh && <div style={caps(tPx, { letterSpacing: "0.3em", fontWeight: 700, opacity: 0.9 })}>{tag}</div>}
            <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: wPx, letterSpacing: "0.12em", paddingLeft: "0.12em", lineHeight: 1.1, whiteSpace: "nowrap" }}>{word}</div>
            <div style={caps(lPx, { letterSpacing: "0.14em", opacity: 0.8 })}>{line}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 * k, marginTop: 6 * k }}>
              {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: "grayscale(1) brightness(1.6)" }} />}
              <div style={caps(12 * k, { opacity: 0.7 })}>VS</div>
              {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: "grayscale(1) brightness(1.6)" }} />}
            </div>
            <div style={caps(18 * k * ts, { letterSpacing: "0.2em", fontWeight: 700 })}>{[fx.date, fx.kickoff].filter(Boolean).join(" · ")}</div>
          </div>
        </>
      }
    />
  );
}
