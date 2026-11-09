/* eslint-disable @next/next/no-img-element */
import { luminance } from "@/lib/color";
import { NatGround, natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { Shell, caps, fit, frameOf, small } from "./natref1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 56 · natural look after ONE real reference (Pinterest "matchday poster photo grain free minimal 2026"):
 *
 *   natrefredlight  "MATCH DAY" (Arsenal v Chelsea)
 *     photo treatment: low-key monochrome — the whole frame (ground AND him) turned into a black → club-colour duotone,
 *                      a strong raking light in the club colour from his face side, the far side falling to black;
 *                      framed close (big face). Sharp — a colour grade, never a blur.
 *     type:            a small white condensed "MATCH / DAY" stacked on the free side at mid-height; both crests tiny at
 *                      the top centre; the fixture in the club colour and the date · kick-off in white, tiny, at the foot.
 */

const W = CANVAS_W;
const BARLOW = "var(--font-barlow), 'Arial Narrow', sans-serif";

/** A saturated club colour for the light: the primary, else the accent, else a red. */
function lightColour(d: RenderData) {
  const ok = (c?: string) => {
    if (!c || !/^#[0-9a-f]{6}$/i.test(c)) return false;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const mx = Math.max(r, g, b);
    return (mx - Math.min(r, g, b)) / Math.max(1, mx) > 0.5 && luminance(c) > 0.06;
  };
  return ok(d.params.primary) ? d.params.primary! : ok(d.params.accent) ? d.params.accent! : "#d0202a";
}

export function Natrefredlight({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const left = d.params.side === "left";
  const place = natPlace(d, W, H, { fx: left ? 420 : 640, fy: story ? 700 : 510, fs: story ? 320 : 210 });
  const col = lightColour(d);
  // The light comes from his face side (the side he is placed towards).
  const lightAt = place.fx > W / 2 ? "100%" : "0%";
  const word = (d.content.kicker || "").toUpperCase();
  const lines = !word || word === "MATCHDAY" ? ["MATCH", "DAY"] : [word];
  const colW = W * 0.4;
  const wPx = Math.min(...lines.map((l) => fit(92 * k * ts, colW, l.length, 0.42)));
  const blockH = lines.length * wPx * 0.9;
  const cands = [0.42, 0.5, 0.58].flatMap((f) => [{ x0: 60, y: H * f }, { x0: W - 60 - colW, y: H * f }]);
  const spot = pickTextSpot(place, cands.map((c) => ({ x0: c.x0, y0: c.y, x1: c.x0 + colW, y1: c.y + blockH })));
  const at = cands[spot.index];
  const cs = 52 * k;
  const l1 = `${fx.homeName} v ${fx.awayName}`;
  const l2 = [fx.date, fx.kickoff ? `Kick-off ${fx.kickoff}` : ""].filter(Boolean).join(" · ");
  const fPx = Math.min(...[l1, l2].filter(Boolean).map((l) => fit(17 * k * ts, W - 140, l.length, 0.55)));
  const mono = "grayscale(1) contrast(1.25) brightness(.8)";
  return (
    <Shell
      data={d}
      place={place}
      bg="#050505"
      ground={<NatGround place={place} W={W} H={H} style={{ filter: `${mono} brightness(.7)` }} />}
      figureStyle={{ filter: mono }}
      front={
        <>
          {/* The duotone (black → club colour) over the whole frame, then the raking light from his face side. */}
          <div style={{ position: "absolute", inset: 0, background: col, mixBlendMode: "multiply", opacity: 0.92 }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(ellipse 70% 60% at ${lightAt} 40%, ${col}aa, rgba(0,0,0,0) 70%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${lightAt === "100%" ? "right" : "left"}, rgba(0,0,0,.75), rgba(0,0,0,0) 55%)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + 260 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: bottom - 360 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.8) 60%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: logoTop + (story ? 110 : 76), display: "flex", justifyContent: "center", gap: 18 * k }}>
            {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
          </div>
          <div style={{ position: "absolute", left: at.x0, width: colW, top: at.y, textAlign: at.x0 < W / 2 ? "left" : "right", fontFamily: BARLOW, fontWeight: 700, fontSize: wPx, lineHeight: 0.9, color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.5)" }}>
            {lines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: bottom - fPx * 2.9, textAlign: "center" }}>
            <div style={caps(fPx, { color: col, fontWeight: 700, filter: "brightness(1.5)" })}>{l1}</div>
            {l2 && <div style={small(fPx, { opacity: 0.92 })}>{l2}</div>}
          </div>
        </>
      }
    />
  );
}
