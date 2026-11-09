import type { CSSProperties } from "react";
import { natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { Filled } from "./natref4";
import { Shell, fit, frameOf, shade } from "./natref1";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { ourClub } from "./goalnatcaption";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 74 · natural GOAL looks, each after ONE real reference captured this round (Pinterest), photo treatment first.
 * Photos only through the Shell and `Filled` (the graded ground with him removed, so no second copy of him shows);
 * he and his face stay sharp and in full colour; the big type never covers his face.
 *
 *   goalnatrefsplitgo   "GO / AL" (Ismaïla Sarr, Crystal Palace; Pinterest "goal graphic football 2026 design",
 *                       row 3 col 5)
 *     treatment: a close portrait crop; the surroundings drained of their own colour and washed into one deep petrol
 *                teal, a little darker at the edges; he stays as photographed, warm and saturated against it
 *     type:      the word split in two huge wide white halves over his body below the chin — "GO" from the left edge,
 *                "AL" lower, to the right edge — first name light and surname bold tiny above, his club (exact) under
 *                "GO", the competition and the opponent tiny at the foot
 *
 *   goalnatrefcover     "GOAL … GOAL / HIDDE TER AVEST" (Oxford United; Pinterest "first goal poster football
 *                       photo", row 1 col 3)
 *     treatment: a magazine cover on a mount — the photo inset in a pale, softly blurred grey margin of itself; inside,
 *                the surroundings sunk into a deep ink blue; he stays in full colour
 *     type:      a didone "GOAL" masthead across the top of the inset in the club colour, his head over it; the same
 *                word again, large, across his chest; his name tracked white under it and his club (exact) in a thin
 *                outlined box
 */

const W = CANVAS_W;
const WIDE = "var(--font-unbounded), var(--font-archivo-black), sans-serif";
const DIDONE = "var(--font-dmserif), var(--font-bodoni), Didot, serif";
const lit = "brightness(1.5) saturate(1.2)";

const wordOf = (d: RenderData) => (d.content.kicker || "GOAL").trim().toUpperCase() || "GOAL";
const names = (d: RenderData) => [(d.content.firstName || "").trim().toUpperCase(), (d.content.lastName || "").trim().toUpperCase()];

/** Competition (left) and "VS opponent" (right) for the foot, exact names, wrapped (never cut). */
function footLabels(d: RenderData) {
  const f = matchFacts(d);
  return [f.comp || "", f.opp ? `VS ${f.opp}` : ""].map((s) => s.trim().toUpperCase());
}

/* ===== goalnatrefsplitgo — "GO / AL" split over his body on a petrol ground ===== */

export function Goalnatrefsplitgo({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  // A close portrait, as in the reference (his face high, a little right of centre).
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 470 : 590, fy: story ? 640 : 400, fs: story ? 250 : 175 });
  const word = wordOf(d);
  const cut = Math.ceil(word.length / 2);
  const [a, b] = [word.slice(0, cut), word.slice(cut)];
  const px = fit(330 * k * ts, W * 0.6, Math.max(a.length, b.length, 2), 0.9);
  const lh = px * 0.78;
  const [first, last] = names(d);
  const club = ourClub(d).toUpperCase();
  const [comp, opp] = footLabels(d);
  const sPx = 15 * k * ts;
  const footH = comp || opp ? sPx * 1.4 * 2 + 30 * k : 0;
  // "GO" below his chin; "AL" a line lower. Both above the foot labels.
  const chin = place.fy + place.fs * 0.85;
  const span = lh * 2 + px * 0.12;
  const yMax = bottom - footH - span - sPx * 3;
  const yA = Math.max(chin, Math.min(H * 0.54, yMax));
  const yB = yA + lh + px * 0.12;
  const big: CSSProperties = { position: "absolute", fontFamily: WIDE, fontWeight: 600, fontSize: px, lineHeight: 0.78, letterSpacing: "-0.02em", color: "#fff", whiteSpace: "nowrap", textShadow: "0 4px 30px rgba(0,0,0,.18)" };
  const tiny: CSSProperties = { fontFamily: SANS, fontSize: sPx, lineHeight: 1.3, letterSpacing: "0.08em", color: "#fff", textShadow: "0 0 2px rgba(0,0,0,.55), 0 1px 4px rgba(0,0,0,.6), 0 2px 14px rgba(0,0,0,.5)" };
  return (
    <Shell
      data={d}
      place={place}
      bg="#1b4c56"
      // The reference's treatment: the surroundings drained and washed into one deep petrol teal (darker at the edges);
      // he (the sharp figure on top) keeps every colour.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.15) brightness(.86) contrast(.9) blur(2px)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#1b7d90", mixBlendMode: "color", opacity: 0.95 }} />
          <div style={{ position: "absolute", inset: 0, background: "#16505b", mixBlendMode: "multiply", opacity: 0.55 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 70% at 55% 40%, rgba(10,40,46,0), rgba(10,40,46,.55))" }} />
        </>
      }
      front={
        <>
          {shade(bottom - footH - 60 * k, footH + 200 * k, "up", 0.35)}
          {(first || last) && (
            <div style={{ position: "absolute", left: 60 * k, top: yA - sPx * 1.3 * 2 - 22 * k, ...tiny }}>
              {first && <div style={{ fontWeight: 400 }}>{first}</div>}
              {last && <div style={{ fontWeight: 800 }}>{last}</div>}
            </div>
          )}
          <div style={{ ...big, left: 16 * k, top: yA }}>{a}</div>
          {b && <div style={{ ...big, right: 16 * k, top: yB }}>{b}</div>}
          {club && <div style={{ position: "absolute", left: 60 * k, top: yA + lh + 18 * k, maxWidth: W * 0.4, ...tiny, fontWeight: 600, opacity: 0.85 }}>{club}</div>}
          {comp && <div style={{ position: "absolute", left: 60 * k, bottom: H - bottom, maxWidth: W * 0.3, ...tiny, fontWeight: 600, opacity: 0.85 }}>{comp}</div>}
          {opp && <div style={{ position: "absolute", right: 60 * k, bottom: H - bottom, maxWidth: W * 0.3, textAlign: "right", ...tiny, fontWeight: 600, opacity: 0.85 }}>{opp}</div>}
        </>
      }
    />
  );
}

/* ===== goalnatrefcover — a magazine cover: masthead behind his head, the word again across his chest ===== */

export function Goalnatrefcover({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom, logoTop } = frameOf(d);
  const ink = clubInk(d);
  const word = wordOf(d);
  // The mount: a pale margin around the inset photo.
  const mx = 44 * k;
  // The inset starts clear under the logo (at the top in this family).
  const mTop = logoTop + (story ? 150 : 90);
  const mBot = story ? 300 : 70;
  const innerW = W - mx * 2;
  const mPx = fit(330 * k * ts, innerW - 30 * k, word.length, 0.66);
  const mastTop = mTop + 14 * k;
  // His head over the lower half of the masthead, as in the reference.
  const fs = story ? 220 : 150;
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 500 : 580, fy: mastTop + mPx * 0.55 + fs * 0.95, fs });
  const gPx = fit(250 * k * ts, innerW - 90 * k, word.length, 0.66);
  const [first, last] = names(d);
  const full = [first, last].filter(Boolean).join(" ");
  const nPx = Math.max(12 * k, fit(26 * k * ts, innerW - 120 * k, full.length * 1.35, 0.7));
  const club = ourClub(d).toUpperCase();
  const cPx = Math.max(11 * k, fit(14 * k * ts, innerW - 200 * k, club.length * 1.15, 0.7));
  const blockH = gPx * 0.9 + 24 * k + nPx * 1.3 + 26 * k + cPx * 1.4 + 20 * k;
  const chin = place.fy + place.fs * 0.85;
  const inBot = H - mBot - 40 * k;
  const gTop = Math.max(chin, Math.min(H * 0.6, Math.min(inBot, bottom) - blockH));
  return (
    <Shell
      data={d}
      place={place}
      bg="#c9cacc"
      // He stays inside the inset at the sides and the foot (as in the reference); only his head may rise over its top.
      figureStyle={{ clipPath: `inset(0px ${mx}px ${mBot}px ${mx}px)` }}
      // The reference's treatment: a pale, softly blurred grey mount of the photo itself; inside it the surroundings
      // sunk into deep ink blue. He (the sharp figure on top) stays in full colour.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "blur(26px) saturate(.15) brightness(1.35) contrast(.7)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(214,216,220,.45)" }} />
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(${mTop}px ${mx}px ${mBot}px ${mx}px)`, boxShadow: "none" }}>
            <div style={{ position: "absolute", inset: 0, filter: "saturate(.3) brightness(.6) contrast(1.05)" }}>
              <Filled place={place} H={H} />
            </div>
            <div style={{ position: "absolute", inset: 0, background: "#1c2c5a", mixBlendMode: "color", opacity: 0.9 }} />
            <div style={{ position: "absolute", inset: 0, background: "#18234a", mixBlendMode: "multiply", opacity: 0.6 }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 60% at 50% 42%, rgba(8,12,30,0), rgba(8,12,30,.5))" }} />
          </div>
        </>
      }
      back={
        <div style={{ position: "absolute", left: mx, right: mx, top: mastTop, textAlign: "center", fontFamily: DIDONE, fontSize: mPx, lineHeight: 0.8, color: ink, filter: lit, whiteSpace: "nowrap" }}>{word}</div>
      }
      front={
        <>
          <div style={{ position: "absolute", left: mx, right: mx, top: gTop - 120 * k, height: blockH + 160 * k, background: "linear-gradient(to bottom, rgba(14,20,44,0), rgba(14,20,44,.5) 45%, rgba(14,20,44,.6))" }} />
          <div style={{ position: "absolute", left: mx, right: mx, top: gTop, textAlign: "center" }}>
            <div style={{ fontFamily: DIDONE, fontSize: gPx, lineHeight: 0.9, color: ink, filter: lit, whiteSpace: "nowrap", textShadow: "0 4px 24px rgba(0,0,0,.25)" }}>{word}</div>
            {full && <div style={{ marginTop: 24 * k, fontFamily: SANS, fontWeight: 600, fontSize: nPx, letterSpacing: "0.35em", lineHeight: 1.3, color: "#fff", paddingLeft: "0.35em" }}>{full}</div>}
            {club && (
              <div style={{ marginTop: 26 * k, display: "inline-block", maxWidth: innerW - 120 * k, border: `${Math.max(1.5, 1.5 * k)}px solid rgba(255,255,255,.8)`, padding: `${6 * k}px ${16 * k}px`, fontFamily: SANS, fontWeight: 700, fontSize: cPx, letterSpacing: "0.12em", lineHeight: 1.4, color: "#fff" }}>{club}</div>
            )}
          </div>
        </>
      }
    />
  );
}
