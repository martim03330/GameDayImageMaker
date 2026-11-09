/* eslint-disable @next/next/no-img-element */
import { luminance } from "@/lib/color";
import { isoFromShortDate } from "@/lib/timezone";
import { natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { Shell, caps, fit, frameOf, small } from "./natref1";
import { Filled } from "./natref4";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 62 · natural looks after ONE reference each (photo treatment first). Photos only through NatGround /
 * NatFigure (via Filled), so the "Brilho suave" finish keeps working; he and his face stay sharp and in colour,
 * and his own copy is cut out of the graded ground (never a second him).
 *
 *   natrefsunset  "MATCHDAY" (Colombia v Costa Rica, Copa América; Pinterest "matchday poster sunset grade")
 *     treatment: a sunset sky grade — the top of the photo burnt red-brown, glowing orange then gold towards the
 *                horizon behind him, the ground below kept natural but warm (golden grass)
 *     type:      a wide heavy italic MATCHDAY high (MATCH white, DAY gold), three tiny label / value columns under it
 *                (STADIUM · TIME · DATE); both crests on small white tiles flush with one edge
 */

const W = CANVAS_W;
const WIDE = "var(--font-unbounded), sans-serif";
const DOW = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "28 JUN" → "FRIDAY, 28 JUN" (the weekday from the match's ISO day), else the date as is. */
function longDate(date: string, iso?: string) {
  if (!iso) return date;
  const t = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(t.getTime()) ? date : `${DOW[t.getUTCDay()]}, ${t.getUTCDate()} ${MON[t.getUTCMonth()]}`;
}

/** The reference's gold for "DAY": his club's accent when it is warm and bright, else the reference's yellow. */
function gold(d: RenderData) {
  const c = d.params.accent && d.params.accent.toLowerCase() !== "#ffffff" ? d.params.accent : d.params.primary || "";
  if (!/^#[0-9a-f]{6}$/i.test(c)) return "#f6c33a";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return r > 180 && g > 120 && b < 120 && luminance(c) > 0.35 ? c : "#f6c33a";
}

/** Head-room logic: the block's scale above his face, or null when it belongs at the foot. */
function room(place: ReturnType<typeof natPlace>, top: number, h: number, k: number, min = 0.55) {
  const r = place.fy - place.fs * 0.85 - 30 * k - top;
  return r >= h ? 1 : r >= h * min ? r / h : null;
}

/* ===== natrefsunset ===== */

export function Natrefsunset({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 460 : 560, fy: story ? 900 : 640, fs: story ? 185 : 130 });
  const k0 = (d.content.kicker || "").trim().toUpperCase();
  const custom = k0 && !/^(MATCH|GAME)\s*DAY$/.test(k0);
  const [w1, w2] = custom ? [k0, ""] : [k0.startsWith("GAME") ? "GAME" : "MATCH", "DAY"];
  const word = w1 + w2;
  const g0 = fit(118 * k * ts, W - 150, word.length, 0.92);
  const cols = [
    ["STADIUM", fx.venue],
    ["TIME", fx.kickoff],
    ["DATE", longDate(fx.date, isoFromShortDate(d.content.date) ?? undefined)],
  ].filter(([, v]) => v) as [string, string][];
  const colW = (W - 150) / Math.max(1, cols.length);
  const c0 = Math.min(...cols.map(([, v]) => fit(15 * k * ts, colW - 16 * k, v.length, 0.62)), 15 * k * ts);
  const h0 = g0 * 1.0 + 18 * k + c0 * 2.8;
  const top0 = logoTop + (story ? 190 : 130);
  const sc = room(place, top0, h0, k);
  const high = sc !== null;
  const s = sc ?? 1;
  const gPx = g0 * s;
  const cPx = c0 * Math.max(0.85, s);
  const blockH = gPx + 18 * k + cPx * 2.8;
  const top = high ? top0 : bottom - blockH;
  // The crest tiles: flush with the free edge, mid-height (the reference's right edge), never over his face.
  const tile = 104 * k;
  const spots = [0.46, 0.38, 0.56].flatMap((f) => [
    { x0: W - tile, y0: H * f, x1: W, y1: H * f + tile * 2 + 6 * k },
    { x0: 0, y0: H * f, x1: tile, y1: H * f + tile * 2 + 6 * k },
  ]);
  const spot = pickTextSpot(place, spots).rect;
  const horizon = Math.min(70, Math.max(30, ((place.fy + place.fs * 0.6) / H) * 100));
  return (
    <Shell
      data={d}
      place={place}
      bg="#2a1206"
      // The reference's treatment: a sunset sky grade. The ground (him cut out) a touch warmer, multiplied by a vertical
      // sky ramp — burnt red-brown at the top, orange, gold at the horizon behind him, then near white so the grass
      // stays natural — a soft golden glow screened in at the horizon, a warm soft-light over the ground.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "sepia(.18) saturate(1.15) contrast(1.06)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", background: `linear-gradient(to bottom, #7a2408 0%, #b23e10 ${horizon * 0.3}%, #e0661f ${horizon * 0.62}%, #f7b25a ${horizon * 0.88}%, #ffe2b8 ${horizon + 8}%, #fff4e6 ${horizon + 22}%, #ffffff 100%)` }} />
          {/* The sky glows rather than burns: an orange lift over the top, fading out at the horizon. */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `linear-gradient(to bottom, rgba(255,105,30,.34) 0%, rgba(255,140,50,.22) ${horizon * 0.7}%, rgba(255,140,50,0) ${horizon + 6}%)` }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(ellipse 75% 16% at ${(place.fx / W) * 100}% ${horizon}%, rgba(255,176,70,.42) 0%, rgba(255,120,40,.16) 55%, rgba(0,0,0,0) 100%)` }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", background: `linear-gradient(to bottom, rgba(255,140,50,0) ${horizon}%, rgba(255,160,70,.45) 100%)` }} />
        </>
      }
      front={
        <>
          {!high && <div style={{ position: "absolute", left: 0, right: 0, top: top - 260 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(42,14,4,0), rgba(42,14,4,.78) 40%)" }} />}
          <div style={{ position: "absolute", left: 75, right: 75, top, textShadow: "0 2px 16px rgba(60,15,0,.45)" }}>
            <div style={{ textAlign: "center", fontFamily: WIDE, fontWeight: 800, fontStyle: "italic", fontSize: gPx, lineHeight: 1, letterSpacing: "-0.035em", whiteSpace: "nowrap", transform: "skewX(-8deg)" }}>
              <span>{w1}</span>
              {w2 && <span style={{ color: gold(d) }}>{w2}</span>}
            </div>
            <div style={{ display: "flex", marginTop: 18 * k, paddingLeft: 6 * k }}>
              {cols.map(([l, v]) => (
                <div key={l} style={{ width: colW, paddingRight: 16 * k }}>
                  <div style={caps(cPx, { fontWeight: 700, letterSpacing: "0.06em", lineHeight: 1.3 })}>{l}</div>
                  <div style={small(cPx, { fontWeight: 400, lineHeight: 1.3, opacity: 0.92, textTransform: "uppercase", overflow: "hidden", textOverflow: "clip" })}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", left: spot.x0, top: spot.y0, display: "flex", flexDirection: "column", gap: 6 * k }}>
            {[fx.homeCrest, fx.awayCrest].map((c, i) =>
              c ? (
                <div key={i} style={{ width: tile, height: tile, background: "#f7f3ea", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(40,10,0,.3)" }}>
                  <img src={c} alt="" style={{ width: tile * 0.74, height: tile * 0.74, objectFit: "contain" }} />
                </div>
              ) : null,
            )}
          </div>
        </>
      }
    />
  );
}
