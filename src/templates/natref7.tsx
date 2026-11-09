/* eslint-disable @next/next/no-img-element */
import { NatGround, natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Shell, caps, fit, frameOf, small } from "./natref1";
import { FlagClock } from "./prokit";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 58 · natural looks after ONE reference each (photo treatment first):
 *
 *   natrefbacklit  "MATCHDAY · Premier League" (Brentford v Leeds, Pinterest "matchday poster golden hour grade")
 *     treatment: a warm golden-hour backlight — the ground pushed to deep orange, a bright amber glow blooming behind
 *                his upper body, the corners falling to dark burnt orange; he stays in colour, sharp
 *     type:      a heavy white condensed sans MATCHDAY across the lower third, the competition small under it, both
 *                crests small under that; the date and kick-off tiny at the top
 *
 *   natrefsplit    "Hungary versus Netherlands" (Pinterest "soccer matchday cinematic grade teal orange")
 *     treatment: a teal / orange split tone — the ground graded into cool teal-blue shadows, a warm orange light
 *                rising from the lower corner on his side, a dark vignette; he stays in colour, sharp
 *     type:      tiny tracked caps at the top-left (HOME / VERSUS / AWAY), both crests small; the kick-off and ground
 *                tiny at the top-right
 */

const W = CANVAS_W;
const BARLOW = "var(--font-barlow), 'Arial Narrow', sans-serif";

/* ===== natrefbacklit — golden backlight ===== */

export function Natrefbacklit({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: 540, fy: story ? 640 : 470, fs: story ? 230 : 150 });
  const word = (d.content.kicker || "MATCHDAY").toUpperCase();
  const wPx = fit(190 * k * ts, W - 110, word.length, 0.45);
  const comp = roundTitle(d) || "";
  const cPx = fit(34 * k * ts, W - 160, comp.length, 0.5);
  const cs = 70 * k;
  const blockH = wPx * 0.95 + (comp ? cPx * 1.3 : 0) + cs + 30 * k;
  const wTop = bottom - blockH;
  const top = [fx.date, fx.kickoff].filter(Boolean).join("  |  ");
  const tPx = fit(15 * k * ts, W - 140, top.length, 0.6);
  const gx = (place.fx / W) * 100;
  const gy = ((place.fy + place.fs * 1.2) / H) * 100;
  return (
    <Shell
      data={d}
      place={place}
      bg="#2a0e02"
      ground={
        <>
          <NatGround place={place} W={W} H={H} style={{ filter: "grayscale(.6) contrast(1.05) brightness(.6)" }} />
          <div style={{ position: "absolute", inset: 0, background: "#e2570f", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(ellipse 55% 42% at ${gx}% ${gy}%, rgba(255,190,90,.95) 0%, rgba(255,120,30,.6) 40%, rgba(0,0,0,0) 80%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(40,10,0,.75) 100%)" }} />
        </>
      }
      front={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 240 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(40,10,0,0), rgba(40,10,0,.55) 45%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: logoTop + (story ? 150 : 100), textAlign: "center", ...caps(tPx, { opacity: 0.9 }) }}>{top}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 2px 16px rgba(0,0,0,.35)" }}>
            <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: wPx, lineHeight: 0.95, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{word}</div>
            {comp && <div style={{ fontFamily: BARLOW, fontWeight: 500, fontSize: cPx, lineHeight: 1.3, whiteSpace: "nowrap" }}>{comp}</div>}
            <div style={{ display: "flex", gap: 16 * k, marginTop: 14 * k }}>
              {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
              {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            </div>
          </div>
        </>
      }
    />
  );
}

/* ===== natrefsplit — teal / orange split tone ===== */

export function Natrefsplit({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop } = frameOf(d);
  const fx = natFixture(d);
  const left = d.params.side === "left";
  const place = natPlace(d, W, H, { fx: left ? 420 : 620, fy: story ? 760 : 560, fs: story ? 230 : 150 });
  // The warm light rises on his side, from the lower corner behind him.
  const lx = place.fx > W / 2 ? 100 : 0;
  const colW = W * 0.46;
  const rows = [fx.homeName.toUpperCase(), "VERSUS", fx.awayName.toUpperCase()];
  const rPx = Math.min(...rows.map((r) => fit(22 * k * ts, colW, r.length, 0.7)));
  const rt = [fx.kickoff ? `KICK OFF ${fx.kickoff}` : "", (d.content.venue || fx.venue || "").toUpperCase()].filter(Boolean);
  const tPx = Math.min(16 * k * ts, ...rt.map((r) => fit(16 * k * ts, W * 0.4, r.length, 0.68)));
  const cs = 52 * k;
  const y0 = logoTop + (story ? 150 : 100);
  return (
    <Shell
      data={d}
      place={place}
      bg="#06141c"
      ground={
        <>
          <NatGround place={place} W={W} H={H} style={{ filter: "grayscale(.85) contrast(1.15) brightness(.6)" }} />
          <div style={{ position: "absolute", inset: 0, background: "#0f4f63", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, background: "#1b6f86", mixBlendMode: "color", opacity: 0.5 }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(ellipse 85% 55% at ${lx}% 92%, rgba(255,150,60,1) 0%, rgba(245,100,25,.7) 35%, rgba(0,0,0,0) 75%), radial-gradient(ellipse 40% 30% at ${100 - lx}% 18%, rgba(255,130,40,.35), rgba(0,0,0,0) 70%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(2,8,12,.7) 100%)" }} />
        </>
      }
      front={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: y0 + 360 * k, background: "linear-gradient(to bottom, rgba(2,8,12,.6), rgba(2,8,12,0))" }} />
          <div style={{ position: "absolute", left: 60, top: y0, width: colW, display: "flex", flexDirection: "column", gap: 4 * k, textShadow: "0 1px 10px rgba(0,0,0,.5)" }}>
            {rows.map((r, i) => (
              <div key={i} style={caps(i === 1 ? rPx * 0.75 : rPx, { fontWeight: i === 1 ? 500 : 700, opacity: i === 1 ? 0.75 : 1, letterSpacing: "0.1em" })}>{r}</div>
            ))}
            <div style={{ display: "flex", gap: 12 * k, marginTop: 10 * k }}>
              {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
              {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            </div>
          </div>
          <div style={{ position: "absolute", right: 60, top: y0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 * k, textShadow: "0 1px 10px rgba(0,0,0,.5)" }}>
            {rt.map((r) => (
              <div key={r} style={caps(tPx, { fontWeight: 600 })}>{r}</div>
            ))}
            <div style={{ marginTop: 6 * k }}>
              <FlagClock d={d} px={16 * k * ts} color="#fff" gap={14 * k} />
            </div>
          </div>
          <div style={{ position: "absolute", right: 60, bottom: H - (frameOf(d).bottom), ...small(14 * k * ts, { opacity: 0.8 }) }}>{roundTitle(d)}</div>
        </>
      }
    />
  );
}
