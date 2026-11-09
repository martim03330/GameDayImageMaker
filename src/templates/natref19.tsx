/* eslint-disable @next/next/no-img-element */
import { natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { Filled } from "./natref4";
import { Shell, fit, frameOf } from "./natref1";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 73 · natural looks, each after ONE real reference captured this round (Pinterest), photo treatment first.
 * Photos only through the Shell and `Filled` (the graded ground with him removed, so no second copy of him shows);
 * he and his face stay sharp and in colour; the big type never covers his face.
 *
 *   resultnatrefstackscore  "2 / FULL-TIME / 0" (Hull City v Man Utd; Pinterest "full time poster photo club",
 *                           row 2 col 5)
 *     treatment: soft matte daylight — the real photo in natural colour, the stand softly out of focus, the
 *                shadows lifted a touch and the contrast eased (a gentle print-like fade); he stays as photographed
 *     type:      the score stacked huge down the side away from him (over the photo, as in the reference; his face always clear) in an off-white geometric sans (home goals over
 *                away goals, each about a sixth of the frame tall), the home crest small above, the away crest
 *                small below, "FULL-TIME" tracked tiny between the numbers on a hairline cross; four tiny labels
 *                spread across the foot (competition · opponent · date · venue)
 *
 *   natreftiltmatch         "MATCH / DAY" (Man City; Pinterest "matchday graphic photo poster 2026", row 4 col 5)
 *     treatment: night stadium, natural colour — the stand far out of focus and dimmed into deep shadow (darkest at
 *                the top), the pitch green kept; he stays as photographed
 *     type:      a giant white condensed "MATCH" over "DAY", tilted a few degrees, filling the middle of the frame
 *                BEHIND him; at the foot both crests small in thin rings, the date left, the venue right and the
 *                kick-off centred in a thin outlined pill
 */

const W = CANVAS_W;
const INK = "#f2eee6";

const goalsOf = (d: RenderData) => [d.content.homeGoals ?? "–", d.content.awayGoals ?? "–"].map((g) => String(g).trim() || "–");

/** A crest, or — with no crest — the club's exact name, wrapped (never cut). */
function CrestOr({ src, name, size, px }: { src: string | null; name: string; size: number; px: number }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain" }} />;
  return <div style={{ maxWidth: size * 2.6, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: px, lineHeight: 1.15, letterSpacing: "0.06em", textTransform: "uppercase", color: INK }}>{name}</div>;
}

/* ===== resultnatrefstackscore — the score stacked huge down the side ===== */

export function Resultnatrefstackscore({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  // The stack on the side away from him (the reference: the numbers at the left, the players right of centre).
  const left = d.params.side !== "left";
  const want = { fx: left ? 680 : 400, fy: story ? 700 : 500, fs: story ? 220 : 150 };
  const p0 = natPlace(d, W, H, want);
  // The column: about 30% of the frame wide, the numbers as big as that allows (a sixth of the frame tall).
  const colW = W * 0.34;
  const nLen = Math.max(hg.length, ag.length, 1);
  const nPx = Math.min(fit(330 * k * ts, colW, nLen, 0.66), 330 * k * ts);
  const cs = 76 * k;
  const tPx = 17 * k * ts;
  const gap = 26 * k;
  const numH = nPx * 0.74;
  const stackH = cs + gap + numH + gap * 1.6 + tPx + gap * 1.6 + numH + gap + cs;
  const top = Math.round(H * (story ? 0.5 : 0.52) - stackH / 2);
  // His face must stay clear of the column: when the photo frames him into it, the framed photo slides away.
  const colX0 = left ? 40 * k : W - 40 * k - colW;
  const colX1 = colX0 + colW;
  const nx0 = p0.nudge?.x ?? 0;
  const faceL = p0.fx + nx0 - p0.faceW * 0.9;
  const faceR = p0.fx + nx0 + p0.faceW * 0.9;
  const need = left ? colX1 + 30 * k - faceL : faceR - (colX0 - 30 * k);
  // Most of his body clear of the numbers too (as far as the frame lets his face stay well inside it).
  const b0 = p0.box;
  const bodyNeed = left ? colX1 - (b0.left + nx0 + b0.width * 0.22) : b0.left + nx0 + b0.width * 0.78 - colX0;
  const room = left ? W - 50 - faceR : faceL - 50;
  const slide = Math.max(0, Math.min(380, Math.max(need, Math.min(bodyNeed, room))));
  const dd = slide ? { ...d, params: { ...d.params, playerX: (d.params.playerX ?? 0) + (left ? slide : -slide) } } : d;
  const place = slide ? natPlace(dd, W, H, want) : p0;
  const cx = (colX0 + colX1) / 2;
  const num = { fontFamily: SANS, fontWeight: 650, fontSize: nPx, lineHeight: 0.74, letterSpacing: "-0.04em", whiteSpace: "nowrap" as const, color: INK, textAlign: "center" as const, textShadow: "0 2px 6px rgba(0,0,0,.22), 0 6px 40px rgba(0,0,0,.28)" };
  const labels = [matchFacts(d).comp || "", `VS ${d.content.home === false ? fx.homeName : fx.awayName}`, fx.date, fx.venue].map((s) => String(s || "").trim().toUpperCase()).filter(Boolean);
  const lPx = fit(13 * k * ts, (W - 100) / Math.max(1, labels.length) - 16, Math.max(1, ...labels.map((l) => l.length)), 0.7);
  const hair = "rgba(242,238,230,.55)";
  return (
    <Shell
      data={dd}
      place={place}
      bg="#4a5a3c"
      // The reference's photo treatment: soft matte daylight — natural colour, contrast eased, the shadows lifted a
      // touch. Ground only; his sharp figure goes on top, ungraded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "contrast(.9) saturate(.94) brightness(1.03)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "rgba(236,228,214,.09)" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(40,44,36,.12)", mixBlendMode: "lighten" }} />
          {/* A whisper of shade behind the column so the off-white reads on a bright stand. */}
          <div style={{ position: "absolute", top: top - 160 * k, height: stackH + 320 * k, left: cx - colW, width: colW * 2, background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(20,22,18,.26), rgba(20,22,18,0) 100%)" }} />
        </>
      }
      front={
        <>
        <div style={{ position: "absolute", left: colX0, width: colW, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <CrestOr src={fx.homeCrest} name={fx.homeName} size={cs} px={tPx} />
          <div style={{ height: gap }} />
          <div style={{ ...num, height: numH }}>{hg}</div>
          <div style={{ height: gap * 1.6 }} />
          {/* "FULL-TIME" on a hairline cross. */}
          <div style={{ position: "relative", width: colW, height: tPx, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: tPx / 2, height: 1.5 * k, background: hair }} />
            <div style={{ position: "absolute", left: "50%", top: -gap * 1.2, bottom: -gap * 1.2, width: 1.5 * k, background: hair }} />
            <div style={{ position: "relative", padding: `0 ${14 * k}px`, fontFamily: SANS, fontWeight: 600, fontSize: tPx, lineHeight: 1, letterSpacing: "0.16em", whiteSpace: "nowrap", color: INK, background: "transparent", textShadow: "0 1px 10px rgba(0,0,0,.35)" }}>FULL-TIME</div>
          </div>
          <div style={{ height: gap * 1.6 }} />
          <div style={{ ...num, height: numH }}>{ag}</div>
          <div style={{ height: gap }} />
          <CrestOr src={fx.awayCrest} name={fx.awayName} size={cs} px={tPx} />
        </div>
        <div style={{ position: "absolute", left: 50, right: 50, top: bottom - lPx * 1.4, display: "flex", justifyContent: "space-between" }}>
          {labels.map((l, i) => (
            <div key={i} style={{ fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.4, letterSpacing: "0.1em", whiteSpace: "nowrap", color: INK, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>{l}</div>
          ))}
        </div>
        </>
      }
    />
  );
}

/* ===== natreftiltmatch — "MATCH / DAY" tilted, giant, behind him ===== */

export function Natreftiltmatch({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, bottom } = frameOf(d);
  const fx = natFixture(d);
  // He a little right of centre (the reference: his body across the middle-right), so "DAY" reads on the free side.
  const freeLeft = d.params.side !== "left";
  const want = { fx: freeLeft ? 650 : 430, fy: story ? 700 : 490, fs: story ? 175 : 125 };
  const place = natPlace(d, W, H, want);
  // Two rows as in the reference: "MATCH" over "DAY" (a one-word "MATCHDAY" / "GAMEDAY" splits before DAY).
  const kicker = (d.content.kicker || "MATCH DAY").trim().toUpperCase();
  const split = /^(\S{3,})(DAY|DAG|DIA)$/.exec(kicker);
  const words = split ? [split[1], split[2]] : kicker.split(/\s+/);
  const rows = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : words;
  // Each row as wide as the frame allows (Anton caps ~0.5em wide), the cap line very tall, as in the reference.
  const rPx = rows.map((r) => Math.min(fit(460 * k * ts, W * 0.7, r.length, 0.5), 460 * k * ts));
  const lead = 0.86;
  const blockH = rPx.reduce((h, p) => h + p * lead, 0);
  const mid = story ? H * 0.47 : H * 0.48;
  const top0 = mid - blockH / 2;
  const cs = 58 * k;
  const sPx = 15 * k * ts;
  const ringOf = (src: string | null) => (
    <div style={{ width: cs + 22 * k, height: cs + 22 * k, borderRadius: "50%", border: `${1.5 * k}px solid rgba(255,255,255,.7)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {src ? <img src={src} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} /> : null}
    </div>
  );
  const foot = { fontFamily: SANS, fontWeight: 600, fontSize: sPx, lineHeight: 1.3, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,.6)" };
  const pillY = bottom - sPx * 2.2;
  const ringY = pillY - 28 * k - (cs + 22 * k);
  const names = !fx.homeCrest || !fx.awayCrest;
  return (
    <Shell
      data={d}
      place={place}
      bg="#10151a"
      // The reference's photo treatment: night stadium in natural colour — the stand dimmed into deep shadow (darkest
      // at the top), the pitch green kept. Ground only; his sharp figure goes on top, ungraded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "brightness(.66) saturate(1.02) contrast(1.06) blur(6px)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(6,10,16,.72) 0%, rgba(6,10,16,.38) 34%, rgba(6,10,16,.12) 62%, rgba(6,10,16,.3) 100%)" }} />
          {/* A low shade at the foot (ground only) so the small lines read on the pitch. */}
          <div style={{ position: "absolute", left: 0, right: 0, top: ringY - 160 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5))" }} />
        </>
      }
      back={
        <div style={{ position: "absolute", left: 0, right: 0, top: top0, transform: "rotate(9deg)", transformOrigin: "50% 50%" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ fontFamily: DISPLAY, fontSize: rPx[i], lineHeight: lead, letterSpacing: "0.01em", whiteSpace: "nowrap", color: "#fff", textAlign: (i === 0) === freeLeft ? "right" : "left", padding: `0 ${W * 0.12}px` }}>{r}</div>
          ))}
        </div>
      }
      front={
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: ringY, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * k }}>
            {ringOf(fx.homeCrest)}
            {ringOf(fx.awayCrest)}
          </div>
          {names && <div style={{ position: "absolute", left: 60, right: 60, top: ringY - sPx * 2.6, textAlign: "center", ...foot, whiteSpace: "normal" }}>{`${fx.homeName} × ${fx.awayName}`}</div>}
          <div style={{ position: "absolute", left: 50, right: 50, top: pillY, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 * k }}>
            <div style={{ ...foot, flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{fx.date}</div>
            {fx.kickoff && <div style={{ ...foot, whiteSpace: "nowrap", border: `${1.5 * k}px solid rgba(255,255,255,.75)`, borderRadius: 999, padding: `${8 * k}px ${22 * k}px` }}>{fx.kickoff}</div>}
            <div style={{ ...foot, flex: 1, textAlign: "right", whiteSpace: "normal" }}>{fx.venue}</div>
          </div>
        </>
      }
    />
  );
}
