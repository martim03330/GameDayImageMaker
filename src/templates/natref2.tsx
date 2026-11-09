/* eslint-disable @next/next/no-img-element */
import { natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Shell, caps, fit, frameOf, shade, small } from "./natref1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 52 · natural looks, each a faithful adaptation of ONE real reference (his real photo, background softly blurred
 * by /api/natframe, he stays sharp):
 *
 *   natrefthinbold "MATCH DAY" (Arsenal v Aston Villa, Pinterest "football matchday poster depth of field") — MATCH
 *                  light and DAY heavy in one condensed line at the foot; crests, ground and kick-off small in the
 *                  top-right corner under a hairline
 *   resultnatquiet "HALF-TIME 1-1" (Pinterest "football matchday poster depth of field") — FULL-TIME tracked tiny, the
 *                  score medium between both crests on the blurred grass, the ground / fixture / competition tiny at
 *                  the foot
 */

const W = CANVAS_W;
const BARLOW = "var(--font-barlow), 'Arial Narrow', sans-serif";

/* ===== natrefthinbold — "MATCH DAY" light + heavy ===== */

export function Natrefthinbold({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: 540, fy: story ? 700 : 500, fs: story ? 230 : 150 });
  const kick = (d.content.kicker || "").toUpperCase();
  const [a, b] = kick && kick !== "MATCHDAY" ? [kick, ""] : ["MATCH", "DAY"];
  const wPx = fit(210 * k * ts, W - 140, (a + b).length, 0.42);
  const wTop = bottom - wPx * 0.95;
  // The info block: top-right corner, under a hairline — crests, the ground, the kick-off.
  const cs = 54 * k;
  const iw = 330 * k;
  const ground = fx.venue || roundTitle(d);
  const iPx = fit(17 * k * ts, iw, Math.max(ground.length, fx.kickoff.length), 0.55);
  return (
    <Shell
      data={d}
      place={place}
      front={
        <>
          {shade(0, logoTop + 520 * k, "down", 0.38)}
          {shade(wTop - 300 * k, H - wTop + 300 * k, "up", 0.6)}
          <div style={{ position: "absolute", right: 60, top: logoTop + (story ? 150 : 100), width: iw, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 * k, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
            <div style={{ display: "flex", gap: 12 * k }}>
              {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
              {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            </div>
            <div style={{ width: "100%", height: 1.5 * k, background: "rgba(255,255,255,.7)" }} />
            {ground && <div style={small(iPx, { opacity: 0.92 })}>{ground}</div>}
            <div style={{ width: "100%", height: 1.5 * k, background: "rgba(255,255,255,.7)" }} />
            {fx.kickoff && <div style={small(iPx, { fontWeight: 700 })}>{fx.kickoff}</div>}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop, textAlign: "center", fontFamily: BARLOW, fontSize: wPx, lineHeight: 0.95, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
            <span style={{ fontWeight: 500 }}>{a}</span>
            {b && <span style={{ fontWeight: 800, marginLeft: wPx * 0.1 }}>{b}</span>}
          </div>
        </>
      }
    />
  );
}

/* ===== resultnatquiet — "HALF-TIME 1-1" ===== */

export function Resultnatquiet({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 430 : 650, fy: story ? 600 : 440, fs: story ? 240 : 155 });
  const score = `${d.content.homeGoals ?? "–"}-${d.content.awayGoals ?? "–"}`;
  const sPx = 150 * k * ts;
  const cs = 70 * k;
  const blockH = 30 * k + sPx;
  // On the blurred grass beside him: centred when that is free, else centred on the free half.
  const cands = [0.62, 0.68, 0.56].flatMap((f) => [W / 2, W * 0.27, W * 0.73].map((cx) => ({ cx, y: H * f })));
  const spot = pickTextSpot(place, cands.map((c) => ({ x0: c.cx - 250, y0: c.y, x1: c.cx + 250, y1: c.y + blockH })));
  // No free spot beside him (his body everywhere): a band low at the foot over a soft foot shade, as the reference sits
  // on empty grass below the action.
  const low = spot.crowded;
  const cx = low ? W / 2 : cands[spot.index].cx;
  const y = low ? bottom - 13 * k * ts * 3.4 - 30 * k - blockH : cands[spot.index].y;
  const third = (W - 120) / 3;
  const foot = [d.content.venue || fx.venue, `${fx.homeName} v ${fx.awayName}`, roundTitle(d) || ""].map((s) => (s || "").toUpperCase());
  const fPx = Math.min(13 * k * ts, ...foot.filter(Boolean).map((s) => fit(13 * k * ts, third, s.length, 0.68)));
  return (
    <Shell
      data={d}
      place={place}
      front={
        <>
          {shade(0, 280 * k, "down", 0.3)}
          {shade(y - 260 * k, H - y + 260 * k, "up", low ? 0.72 : 0.55)}
          <div style={{ position: "absolute", left: cx - 300, width: 600, top: y, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 2px 14px rgba(0,0,0,.45)" }}>
            <div style={caps(17 * k * ts, { letterSpacing: "0.5em", paddingLeft: "0.5em", fontWeight: 500 })}>FULL-TIME</div>
            <div style={{ display: "flex", alignItems: "center", gap: 26 * k, marginTop: 6 * k }}>
              {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
              <div style={{ fontFamily: BARLOW, fontWeight: 600, fontSize: sPx, lineHeight: 1 }}>{score}</div>
              {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            </div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: bottom - fPx * 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {foot.map((s, i) => (
              <div key={i} style={{ width: third, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right", ...caps(fPx, { opacity: 0.85, whiteSpace: "normal" }) }}>{s}</div>
            ))}
          </div>
        </>
      }
    />
  );
}

