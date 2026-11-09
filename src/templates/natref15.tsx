import { natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { Filled } from "./natref4";
import { Shell, fit, frameOf, shade } from "./natref1";
import { CONDENSED, SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 67 · a natural GOAL look after ONE real reference (Pinterest, captured this round), photo treatment first.
 * Photos only through the Shell and `Filled` (the graded ground with him removed, so no second copy of him shows);
 * he and his face stay sharp and in colour.
 *
 *   goalnatrefvictoire  "VICTOIRE 4 | 2" (ASSE v Quevilly; Pinterest "goal celebration graphic photo poster",
 *                       row 5 col 5)
 *     treatment: muted and overcast — the real photo drained of most of its colour, a touch cool, the lower part
 *                sinking into a deep charcoal; he stays in full colour and sharp
 *     type:      low and centred: one bold condensed word inside a thin outline box, the two clubs tiny and tracked
 *                with "VS" in the club colour, then the reference's two-part score line with its thin divider. Goal
 *                posts never show the score (the user's rule), so that line carries his name instead: first name in
 *                the club colour (the reference's own side's figure), surname in white.
 */

const W = CANVAS_W;

export function Goalnatrefvictoire({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 480 : 600, fy: story ? 700 : 470, fs: story ? 200 : 140 });
  const word = (d.content.kicker || "GOAL").trim().toUpperCase();
  const wPx = fit(64 * k * ts, W - 260, word.length, 0.5);
  const home = fx.homeName.toUpperCase();
  const away = fx.awayName.toUpperCase();
  // Both clubs exact; a long pair shrinks to a floor, then wraps (never cut).
  const tPx = Math.max(12 * k, fit(15 * k * ts, W - 140, (home.length + away.length + 6) * 1.25, 0.66));
  const tLines = Math.ceil(((home.length + away.length + 6) * tPx * 0.66 * 1.25) / (W - 140));
  const first = (d.content.firstName || "").trim().toUpperCase();
  const last = (d.content.lastName || "").trim().toUpperCase();
  // The score line's two halves, bold, sized so both fit the width with the divider between.
  const halves = [first, last].filter(Boolean);
  const nChars = halves.reduce((n, h) => n + h.length, 0) + (halves.length > 1 ? 3 : 0);
  const nPx = fit(96 * k * ts, W - 140, nChars, 0.66);
  const blockH = wPx * 1.3 + 2 * wPx * 0.12 + 14 * k + tLines * tPx * 1.5 + (halves.length ? 34 * k + nPx * 0.9 : 0);
  const bTop = bottom - blockH;
  const onHim = pickTextSpot(place, [{ x0: W * 0.22, y0: bTop, x1: W * 0.78, y1: bTop + blockH }]).crowded;
  const lit = "brightness(1.5) saturate(1.2)";
  return (
    <Shell
      data={d}
      place={place}
      bg="#17191b"
      // The reference's treatment: muted, overcast — most colour drained, a touch cool, the lower part sinking into
      // deep charcoal. He (the sharp figure on top) keeps his colour.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.22) contrast(1.04) brightness(.84)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#7d8a92", mixBlendMode: "soft-light", opacity: 0.45 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.48, bottom: 0, background: "linear-gradient(to bottom, rgba(22,24,26,0), rgba(22,24,26,.86) 55%, rgba(22,24,26,.94))" }} />
        </>
      }
      front={
        <>
          {shade(bTop - 240 * k, H - bTop + 240 * k, "up", onHim ? 0.62 : 0.45)}
          {onHim && <div style={{ position: "absolute", left: 0, right: 0, top: bTop - 100 * k, height: blockH + 200 * k, background: "radial-gradient(ellipse 70% 56% at 50% 50%, rgba(16,18,20,.8), rgba(16,18,20,.35) 60%, rgba(16,18,20,0) 82%)" }} />}
          <div style={{ position: "absolute", left: 0, right: 0, top: bTop, textAlign: "center", color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>
            <div style={{ display: "inline-block", border: `${Math.max(2, 2 * k)}px solid rgba(255,255,255,.85)`, padding: `${wPx * 0.12}px ${wPx * 0.32}px`, fontFamily: CONDENSED, fontWeight: 700, fontSize: wPx, lineHeight: 1.05, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{word}</div>
            <div style={{ marginTop: 14 * k, padding: "0 70px", fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.18em", lineHeight: 1.5, opacity: 0.85 }}>
              {home} <span style={{ color: ink, filter: lit }}>VS</span> {away}
            </div>
            {halves.length > 0 && (
              <div style={{ marginTop: 34 * k, display: "flex", justifyContent: "center", alignItems: "center", gap: 34 * k, fontFamily: SANS, fontWeight: 800, fontSize: nPx, lineHeight: 0.9, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                <span style={{ color: ink, filter: lit }}>{halves[0]}</span>
                {halves[1] && (
                  <>
                    <span style={{ width: Math.max(2, 2 * k), height: nPx * 0.6, background: "rgba(255,255,255,.7)" }} />
                    <span>{halves[1]}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      }
    />
  );
}
