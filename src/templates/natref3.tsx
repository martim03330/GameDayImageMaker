 
import { ourClub } from "./goalnatcaption";
import { natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { BODONI, SERIF, Shell, fit, frameOf, shade, small } from "./natref1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 53 · natural looks, each a faithful adaptation of ONE real reference (Pinterest "matchday story photo blur
 * typography"); his real photo with the background softly blurred, he stays sharp:
 *
 *   natrefvert / goalnatrefvert   "MATCHDAG" (Malmö FF v Växjö DFF) — the word running up the left edge, thin serif
 *                                 caps the full height of the canvas; home / away and ground | kick-off small beside
 *                                 its foot
 */

const W = CANVAS_W;

/* ===== "MATCHDAG" running up the left edge ===== */

function VertWord({ data, word, l1, l2, l3, behind = false }: { data: RenderData; word: string; l1: string; l2: string; l3: string; behind?: boolean }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  // He stands right of the word's column.
  const place = natPlace(d, W, H, { fx: 680, fy: story ? 640 : 470, fs: story ? 240 : 155 });
  const len = bottom - (logoTop + 150 * k);
  // Short words (GOAL) are tracked out to fill the same height as MATCHDAY; the size stays a column, not a slab.
  const px = Math.min(220 * k, len / Math.max(1, word.length * 0.66));
  const natural = word.length * px * 0.66;
  const stretch = natural < len * 0.92;
  const x = 40 + px * 0.42;
  const cy = logoTop + 150 * k + len / 2;
  const iw = W * 0.52;
  const nPx = Math.min(...[l1, l2].map((l) => fit(34 * k * ts, iw, l.length, 0.5)));
  const tPx = fit(15 * k * ts, iw, l3.length, 0.55);
  const iTop = bottom - nPx * 2.4 - tPx * 1.6;
  const wordLayer = (
    <>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: px * 1.6, background: "linear-gradient(to right, rgba(0,0,0,.4), rgba(0,0,0,0))" }} />
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <text {...(stretch ? { textLength: len * 0.96, lengthAdjust: "spacing" } : {})} x={x} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${x} ${cy})`} style={{ fontFamily: BODONI, fontWeight: 500, fontSize: px, letterSpacing: "0.01em" }} fill="#f3f1ec">
              {word}
            </text>
          </svg>
    </>
  );
  return (
    <Shell
      data={d}
      place={place}
      back={behind ? wordLayer : undefined}
      front={
        <>
          {shade(0, logoTop + 220 * k, "down", 0.4)}
          {shade(iTop - 240 * k, H - iTop + 240 * k, "up", 0.5)}
          {!behind && wordLayer}
          <div style={{ position: "absolute", left: px * 1.05 + 40, top: iTop, textShadow: "0 1px 10px rgba(0,0,0,.5)" }}>
            <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: nPx, lineHeight: 1.15, whiteSpace: "nowrap" }}>{l1}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: nPx, lineHeight: 1.15, whiteSpace: "nowrap" }}>{l2}</div>
            <div style={small(tPx, { opacity: 0.88, marginTop: 6 * k })}>{l3}</div>
          </div>
        </>
      }
    />
  );
}

export function Natrefvert({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <VertWord data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} l1={fx.homeName} l2={fx.awayName} l3={[fx.venue, fx.kickoff].filter(Boolean).join("  |  ")} />;
}

export function Goalnatrefvert({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <VertWord data={data} word={(data.content.kicker || "GOAL").toUpperCase()} l1={data.content.firstName || ""} l2={data.content.lastName || ""} l3={[ourClub(data), fx.date].filter(Boolean).join("  |  ")} behind />;
}
