/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance } from "@/lib/color";
import { NatGround, natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { BODONI, SERIF, Shell, caps, fit, frameOf, shade, small } from "./natref1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 54 · natural looks after ONE real reference each (Pinterest "matchday poster photo grain free minimal 2026");
 * his real photo with the background softly blurred, he stays sharp:
 *
 *   natrefmixed                    "MATCH day" (La Liga, Real Madrid v Barcelona) — big serif caps with an italic
 *                                  serif word in the club colour tucked under its right side, high, BEHIND his head;
 *                                  the competition tiny above; both crests, the date and the kick-off small at the
 *                                  lower right
 *   natrefnext                     "Next Match" (Man United v Leeds) — a small italic "Next" and a big italic
 *                                  "Match" low across the canvas; both clubs with their crests in one row under it;
 *                                  the date | kick-off and the ground small at the foot
 */

const W = CANVAS_W;
/** The light-leak colour: his club's accent when it is warm and bright enough to glow, else a warm orange. */
function leak(d: RenderData) {
  const c = d.params.accent && d.params.accent.toLowerCase() !== "#ffffff" ? d.params.accent : d.params.primary || "";
  if (!/^#[0-9a-f]{6}$/i.test(c)) return "#f07a24";
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  // Warm (red → yellow) and saturated enough to read as light; a dull or cool colour falls back to the reference's orange.
  const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(1, Math.max(r, g, b));
  return r >= b && sat > 0.55 && luminance(c) > 0.2 ? c : "#f07a24";
}

/** The reference's crests: soft white-grey marks that sit inside the black-and-white photo. */
const CREST_BW = "grayscale(1) brightness(1.15) contrast(1.05) drop-shadow(0 1px 4px rgba(0,0,0,.55))";

/* ===== "MATCH day" ===== */

function Mixed({ data, big, small: it, over, info, leaks = true }: { data: RenderData; big: string; small: string; over: string; info: string[]; leaks?: boolean }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 430 : 560, fy: story ? 760 : 560, fs: story ? 220 : 145 });
  const bPx = fit(230 * k * ts, W - 140, big.length, 0.76);
  const iPx = Math.min(bPx * 0.72, fit(170 * k * ts, W * 0.55, it.length, 0.42));
  // Cap line high under the logo band; it may run behind his head (only his head covers it), never into the logo.
  const top = Math.max(logoTop + (story ? 200 : 140), Math.min(place.fy - place.fs * 1.6 - bPx * 0.9, logoTop + 330 * k));
  const oPx = fit(17 * k * ts, W - 140, over.length, 0.7);
  const cs = 70 * k;
  const nPx = Math.min(...info.map((l) => fit(22 * k * ts, W * 0.42, l.length, 0.5)));
  const infoTop = bottom - info.length * nPx * 1.3 - cs - 20 * k;
  return (
    <Shell
      data={d}
      place={place}
      bg="#1a1a1a"
      // The reference's photo treatment: the whole photo black & white with a slight contrast lift, only he stays in
      // colour (the sharp figure on top is never graded); two soft warm light leaks in opposite corners.
      ground={
        <>
          {/* His own copy in the ground photo is cut out (and the hole filled with the blurred surroundings): the
              sharp figure on top is placed at its own scale, so the photo's copy of him would show as a grey ghost
              beside him (user, 2026-11-06). */}
          <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) contrast(1.12) brightness(.95)" }}>
            <Filled place={place} H={H} />
          </div>
        </>
      }
      back={
        <>
          {shade(0, top + bPx + iPx + 200 * k, "down", 0.3)}
          <div style={{ position: "absolute", left: 70, top: top - oPx * 1.6, ...caps(oPx, { fontFamily: BODONI, fontWeight: 500, letterSpacing: "0.06em" }) }}>{over}</div>
          <div style={{ position: "absolute", left: 66, top, fontFamily: BODONI, fontWeight: 500, fontSize: bPx, lineHeight: 0.9, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{big}</div>
          <div style={{ position: "absolute", right: 90, top: top + bPx * 0.78, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: iPx, lineHeight: 1, color: leak(d), whiteSpace: "nowrap" }}>{it}</div>
        </>
      }
      front={
        <>
          {shade(infoTop - 220 * k, H - infoTop + 220 * k, "up", 0.5)}
          {leaks && <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(circle at 100% 0%, ${leak(d)}d9 0%, ${leak(d)}66 20%, rgba(0,0,0,0) 44%), radial-gradient(circle at 0% 100%, ${leak(d)}ee 0%, ${leak(d)}77 18%, rgba(0,0,0,0) 42%)` }} />}
          <div style={{ position: "absolute", right: 70, top: infoTop, display: "flex", flexDirection: "column", alignItems: "center", textShadow: "0 1px 10px rgba(0,0,0,.55)" }}>
            <div style={{ display: "flex", gap: 14 * k, marginBottom: 16 * k }}>
              {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: CREST_BW }} />}
              {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: CREST_BW }} />}
            </div>
            {info.map((l) => (
              <div key={l} style={{ fontFamily: BODONI, fontWeight: 500, fontSize: nPx, lineHeight: 1.3, whiteSpace: "nowrap", textTransform: "uppercase" }}>{l}</div>
            ))}
          </div>
        </>
      }
    />
  );
}

function mixedProps(data: RenderData) {
  const fx = natFixture(data);
  const kick = (data.content.kicker || "").toUpperCase();
  const [big, it] = kick && kick !== "MATCHDAY" ? [kick, ""] : ["MATCH", "day"];
  return { big, small: it, over: (roundTitle(data) || "").toUpperCase(), info: [fx.date, fx.kickoff ? `K.O ${fx.kickoff}` : ""].filter(Boolean) };
}

export function Natrefmixed({ data }: { data: RenderData }) {
  return <Mixed data={data} {...mixedProps(data)} />;
}

/** The same "MATCH day" look without the corner light leaks: just the B&W photo with him in colour (user, 2026-11-06). */
export function Natrefmixedclean({ data }: { data: RenderData }) {
  return <Mixed data={data} {...mixedProps(data)} leaks={false} />;
}

/** A mask that keeps everything EXCEPT his silhouette (the cut-out's soft, grown matte, inverted). */
export function without(place: ReturnType<typeof natPlace>): CSSProperties {
  const fig = place.frame.fig;
  if (!fig) return {};
  const hole = `url(${fig}&soft=1)`;
  return { WebkitMaskImage: `linear-gradient(#000, #000), ${hole}`, maskImage: `linear-gradient(#000, #000), ${hole}`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskComposite: "xor", maskComposite: "exclude" } as CSSProperties;
}

/**
 * The ground with HIM removed: his silhouette cut out, the hole filled by the same cut ground heavily blurred (the
 * surroundings bleed in). Every zoom copy carries its own filled hole, so scaled copies show no edge or ring of him.
 */
export function Filled({ place, H }: { place: ReturnType<typeof natPlace>; H: number }) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, filter: "blur(34px) brightness(.92)" }}>
        <div style={{ position: "absolute", inset: 0, ...without(place) }}>
          <NatGround place={place} W={W} H={H} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, ...without(place) }}>
        <NatGround place={place} W={W} H={H} />
      </div>
    </>
  );
}

/** Transparent over him (his box, a little grown), opaque towards the edges. */
const zoomMask = (place: ReturnType<typeof natPlace>, H: number) => {
  const cx = (place.fx / W) * 100;
  const cy = ((place.fy + place.fs * 1.6) / H) * 100;
  return `radial-gradient(ellipse ${Math.max(30, (place.box.width / W) * 62)}% ${Math.max(28, (place.box.height / H) * 52)}% at ${cx}% ${cy}%, transparent 55%, #000 100%)`;
};

/* ===== "Next Match" ===== */

export function Natrefnext({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 430 : 600, fy: story ? 560 : 410, fs: story ? 230 : 150 });
  const k0 = (data.content.kicker || "").trim();
  const kick = !k0 || /^match\s*day$/i.test(k0) ? "Match" : k0.charAt(0).toUpperCase() + k0.slice(1).toLowerCase();
  // "Next" + the word fit the width together (Next is ~0.55 of the word's size).
  const mPx = fit(170 * k * ts, W - 160, kick.length + 4 * 0.55 + 1, 0.46);
  const xPx = mPx * 0.55;
  const cs = 84 * k;
  const nW = (W - 140 - 2 * cs - 60 * k) / 2;
  const nPx = Math.min(...[fx.homeName, fx.awayName].map((n) => fit(18 * k * ts, nW, n.length, 0.55)));
  const l1 = [fx.date, fx.kickoff].filter(Boolean).join("  |  ");
  const l2 = d.content.venue || fx.venue;
  const fPx = Math.min(...[l1, l2].filter(Boolean).map((l) => fit(17 * k * ts, W - 140, l.length, 0.55)));
  const footH = (l2 ? 2 : 1) * fPx * 1.4;
  const rowTop = bottom - footH - 30 * k - cs;
  const wTop = Math.max(place.fy + place.fs * 1.1, rowTop - 26 * k - mPx * 1.05);
  return (
    <Shell
      data={d}
      place={place}
      bg="#111"
      // The reference's photo treatment: a radial zoom burst of his own ground photo, centred on his torso (copies scaled
      // out 1.0 → 1.18 with falling opacity, a touch of blur); the sharp figure goes on top, so his face is never blurred.
      ground={
        <>
          {/* The surroundings only: his (grown, feathered) silhouette is cut out of every layer, so no blurred copy of
              him radiates around the sharp figure. Under the hole, the same cut ground heavily blurred fills it. */}
          <Filled place={place} H={H} />
          {/* The streaks live away from him (as in the reference: the centre stays calm, the burst grows outward), so the
              filled hole never echoes around his head. */}
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: zoomMask(place, H), maskImage: zoomMask(place, H) }}>
            {Array.from({ length: 9 }, (_, i) => 1.03 + i * 0.03).map((sc, i) => (
              <div key={sc} style={{ position: "absolute", inset: 0, transform: `scale(${sc})`, transformOrigin: `${place.fx}px ${place.fy + place.fs * 1.6}px`, opacity: 0.5 - i * 0.035, filter: "blur(1.5px) brightness(1.15)" }}>
                <Filled place={place} H={H} />
              </div>
            ))}
          </div>
        </>
      }
      front={
        <>
          {shade(0, 280 * k, "down", 0.35)}
          {shade(wTop - 300 * k, H - wTop + 300 * k, "up", 0.62)}
          <div style={{ position: "absolute", left: 0, right: 0, top: wTop, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 14 * k, textShadow: "0 2px 18px rgba(0,0,0,.45)" }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: xPx, lineHeight: 1 }}>Next</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: mPx, lineHeight: 1 }}>{kick}</span>
          </div>
          <div style={{ position: "absolute", left: 70, right: 70, top: rowTop, height: cs, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
            <div style={{ width: nW, textAlign: "right", ...small(nPx, { fontWeight: 600 }) }}>{fx.homeName}</div>
            {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} />}
            <div style={{ width: nW, textAlign: "left", ...small(nPx, { fontWeight: 600 }) }}>{fx.awayName}</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: bottom - footH, textAlign: "center" }}>
            <div style={small(fPx)}>{l1}</div>
            {l2 && <div style={small(fPx, { opacity: 0.85 })}>{l2}</div>}
          </div>
        </>
      }
    />
  );
}
