/* eslint-disable @next/next/no-img-element */
import { natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Filled } from "./natref4";
import { BODONI, Shell, fit, frameOf, shade } from "./natref1";
import { SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 64 · natural RESULT looks after ONE real reference each (photo treatment first). Photos only through
 * NatGround / NatFigure (the Shell, and `Filled` for a graded ground), so the "Brilho suave" finish keeps working; he
 * and his face stay sharp and in colour. Every graded ground has HIM cut out of it (`Filled`), so no grey or tinted
 * copy of him shows beside the sharp figure.
 *
 *   resultnatrefserif     "FULLTIME · VS LIVERPOOL · 2–1" (Chelsea; Pinterest "full time poster photo design", row 2
 *                         col 1)
 *     treatment: his real photo in colour, dimmed and cooled into a deep navy, darkest at the top behind the type
 *     type:      wide Didone caps "FULLTIME" across the top, a gold-ruled pill over its middle, the score big in gold
 *                Didone under it, small gold serif caps either side of the score; he stands below, head clear
 *
 *   resultnatrefvertical  "FULL TIME 0 · 1" (Spurs; same search, row 1 col 1)
 *     treatment: low-key — the ground pushed almost to black and drained of colour, he alone lit, in full colour
 *     type:      "FULL TIME" in white Didone caps running up the whole left edge, a hairline beside it, the two
 *                scores stacked in Didone with both crests small (grey) between them on a dotted rule
 *
 *   resultnatreffinal     "final score. 11-0" (Pinterest "final score graphic soccer instagram", row 1 col 1)
 *     treatment: his real photo in natural colour with a warm, slightly faded golden-hour grade
 *     type:      a heavy lowercase grotesque "final score." top left, the fixture with each side's goals small in
 *                bold italic under it, a giant heavy score at the lower left, the competition tiny at the foot and
 *                a small club-colour bar at the lower right
 */

const W = CANVAS_W;
const GOLD = "#e4c47c";
const NAVY = "11,19,44";

const goalsOf = (d: RenderData) => [d.content.homeGoals ?? "–", d.content.awayGoals ?? "–"].map((g) => String(g).trim() || "–");

/** His opponent, exactly as stored. */
function opponent(d: RenderData) {
  const fx = natFixture(d);
  return d.content.home === false ? fx.homeName : fx.awayName;
}

/** The competition alone (the subline's first part), else the round title. */
function competition(d: RenderData) {
  const s = (d.content.subline || "").split("·")[0].trim();
  return s || roundTitle(d) || "";
}

/* ===== resultnatrefserif — "FULLTIME" Didone, navy grade ===== */

export function Resultnatrefserif({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  const word = "FULLTIME";
  const band = logoTop + (story ? 160 : 115);
  const bPx = fit(200 * k * ts, W - 110, word.length, 0.74);
  const top = band;
  const pill = `VS ${opponent(d)}`.toUpperCase();
  // The pill covers the word's middle only (the reference: about half of it), so FULLTIME stays readable.
  const pPx = fit(bPx * 0.27, W * 0.46, pill.length, 0.72);
  const score = `${hg}–${ag}`;
  const sPx = bPx * 1.2;
  const sTop = top + bPx * 0.98;
  // The sides of the score: each team's exact name, in the reference's place for the scorers (two lines at most).
  const sideW = (W - 120 - score.length * sPx * 0.5) / 2 - 24 * k;
  const words = (s: string) => {
    const parts = s.split(" ");
    if (s.length <= 14 || parts.length < 2) return [s];
    const half = Math.ceil(parts.length / 2);
    return [parts.slice(0, half).join(" "), parts.slice(half).join(" ")];
  };
  const homeL = words(fx.homeName);
  const awayL = words(fx.awayName);
  const nPx = Math.min(...[...homeL, ...awayL].map((l) => fit(19 * k * ts, sideW, l.length, 0.72)));
  const sBottom = sTop + sPx * 0.9;
  // He stands under the score, his head clear of it. When his photo frames his head higher than that, the whole
  // framed photo (ground and figure together, as the "move player" nudge does) comes down; the navy above it is
  // the reference's dark top.
  const fs = story ? 190 : 135;
  const want = { fx: d.params.side === "left" ? 470 : 600, fy: story ? 860 : 620, fs };
  const p0 = natPlace(d, W, H, want);
  const clear = sBottom + 50 * k;
  const drop = Math.max(0, Math.min(story ? 700 : 480, clear - (p0.fy + (d.params.playerY ?? 0) - p0.fs * 1.05)));
  const dd = drop ? { ...d, params: { ...d.params, playerY: (d.params.playerY ?? 0) + drop } } : d;
  const place = drop ? natPlace(dd, W, H, want) : p0;
  const edgeY = Math.max(0, drop);
  const side = (lines: string[], align: "left" | "right") => (
    <div style={{ position: "absolute", top: sTop + sPx * 0.32, [align]: W / 2 + (score.length * sPx * 0.5) / 2 + 22 * k, width: sideW, textAlign: align, color: GOLD }}>
      {lines.map((l) => (
        <div key={l} style={{ fontFamily: BODONI, fontWeight: 500, fontSize: nPx, lineHeight: 1.25, letterSpacing: "0.03em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Shell
      data={dd}
      place={place}
      bg={`rgb(${NAVY})`}
      // The reference's photo treatment: the real photo dimmed and cooled into navy (deepest at the top, behind the
      // type); his sharp figure goes on top, ungraded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "brightness(.62) saturate(.62) contrast(1.06)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: `rgba(${NAVY},.42)`, mixBlendMode: "multiply" }} />
          {edgeY > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: edgeY + 260 * k, background: `linear-gradient(to bottom, rgb(${NAVY}) 0%, rgb(${NAVY}) ${(edgeY / (edgeY + 260 * k)) * 100}%, rgba(${NAVY},0) 100%)` }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(${NAVY},.9) 0%, rgba(${NAVY},.72) ${((sBottom + 60 * k) / H) * 100}%, rgba(${NAVY},.18) ${((sBottom + 420 * k) / H) * 100}%, rgba(${NAVY},.3) 100%)` }} />
        </>
      }
      front={
        <>
          {shade(H - 360 * k, 360 * k, "up", 0.35)}
          <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: bPx, lineHeight: 0.9, letterSpacing: "0.005em", whiteSpace: "nowrap", color: "#fff" }}>{word}</div>
          <div style={{ position: "absolute", left: "50%", top: top + bPx * 0.45 - pPx * 0.95, transform: "translateX(-50%)", padding: `${pPx * 0.32}px ${pPx * 0.9}px`, border: `${Math.max(2, 2 * k)}px solid ${GOLD}`, borderRadius: 999, background: `rgb(${NAVY})`, fontFamily: BODONI, fontWeight: 500, fontSize: pPx, lineHeight: 1.1, letterSpacing: "0.03em", whiteSpace: "nowrap", color: GOLD }}>{pill}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: sTop, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: sPx, lineHeight: 0.9, whiteSpace: "nowrap", color: GOLD }}>{score}</div>
          {side(homeL, "right")}
          {side(awayL, "left")}
        </>
      }
    />
  );
}

/* ===== resultnatrefvertical — "FULL TIME" up the left edge, low-key ===== */

export function Resultnatrefvertical({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  // The type column on the side away from him (the reference: left edge, he fills the right).
  const colRight = d.params.side === "left";
  const band = logoTop + (story ? 150 : 105);
  const word = "FULL TIME";
  const runTop = band - 40 * k;
  const runBottom = bottom + 30 * k;
  const runLen = runBottom - runTop;
  const wPx = Math.min(fit(300 * k * ts, runLen, word.length, 0.66), 300 * k);
  const capH = wPx * 0.7;
  const edge = 30;
  const ruleX = edge + capH + 26 * k;
  const dPx = wPx * 0.62;
  const cs = 46 * k;
  const colX = ruleX + 22 * k;
  const colW = dPx * 0.7 * Math.max(hg.length, ag.length);
  const midY = runTop + runLen * 0.36;
  const want = { fx: colRight ? Math.min(W - (colX + colW) - 300, 380) : Math.max(colX + colW + 300, 700), fy: story ? 640 : 460, fs: story ? 250 : 170 };
  const p0 = natPlace(d, W, H, want);
  // His whole figure clear of the type column (white type on a white shirt disappears): when the photo frames him
  // too close to it, the framed photo (ground and figure together, as the "move player" nudge does) slides away; the
  // gap it leaves is the reference's black edge.
  const b0 = p0.box;
  const colEdge = colX + colW + 40 * k;
  const need = colRight ? b0.left + b0.width * 0.94 - (W - colEdge) : colEdge - (b0.left + b0.width * 0.06);
  // Never so far that his face nears the far edge.
  const faceRoom = colRight ? p0.fx - p0.faceW * 0.8 - 50 : W - 50 - (p0.fx + p0.faceW * 0.8);
  const slide = Math.max(0, Math.min(380, need, faceRoom));
  const dd = slide ? { ...d, params: { ...d.params, playerX: (d.params.playerX ?? 0) + (colRight ? -slide : slide) } } : d;
  const place = slide ? natPlace(dd, W, H, want) : p0;
  const at = (x: number) => (colRight ? { right: x } : { left: x });
  return (
    <Shell
      data={dd}
      place={place}
      bg="#07080a"
      // The reference's photo treatment: low-key — the ground nearly black and drained, only he is lit and in colour.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "brightness(.27) saturate(.4) contrast(1.18)" }}>
            <Filled place={place} H={H} />
          </div>
          {slide > 0 && <div style={{ position: "absolute", top: 0, bottom: 0, [colRight ? "right" : "left"]: 0, width: slide + 200, background: `linear-gradient(to ${colRight ? "left" : "right"}, #07080a 0%, #07080a ${(slide / (slide + 200)) * 100}%, rgba(7,8,10,0) 100%)` }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${colRight ? "left" : "right"}, rgba(0,0,0,.72) 0%, rgba(0,0,0,.35) ${((colX + colW + 60) / W) * 100}%, rgba(0,0,0,0) 70%)` }} />
        </>
      }
      front={
        <>
          {shade(H - 300 * k, 300 * k, "up", 0.45)}
          {/* Vertical, read bottom to top (vertical-rl turned half a turn), the caps against the edge. */}
          <div style={{ position: "absolute", ...(colRight ? { right: edge } : { left: edge }), top: runTop, height: runLen, width: capH, display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: BODONI, fontWeight: 500, fontSize: wPx, lineHeight: 0.7, whiteSpace: "nowrap", color: "#fff", textAlign: "center" }}>{word}</div>
          </div>
          <div style={{ position: "absolute", ...at(ruleX), top: runTop + runLen * 0.18, width: Math.max(2, 1.5 * k), height: runLen * 0.62, background: "rgba(255,255,255,.85)" }} />
          <div style={{ position: "absolute", ...at(colX), top: midY - dPx * 1.05 - cs * 1.4, display: "flex", flexDirection: "column", alignItems: "center", color: "#fff", width: colW }}>
            <div style={{ fontFamily: BODONI, fontWeight: 500, fontSize: dPx, lineHeight: 1, whiteSpace: "nowrap" }}>{hg}</div>
            {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", marginTop: 16 * k, filter: "grayscale(1) brightness(1.25) contrast(1.05)" }} />}
            <div style={{ height: 90 * k, margin: `${14 * k}px 0`, borderLeft: `${Math.max(2, 2 * k)}px dotted rgba(255,255,255,.8)` }} />
            {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", marginBottom: 16 * k, filter: "grayscale(1) brightness(1.25) contrast(1.05)" }} />}
            <div style={{ fontFamily: BODONI, fontWeight: 500, fontSize: dPx, lineHeight: 1, whiteSpace: "nowrap" }}>{ag}</div>
          </div>
        </>
      }
    />
  );
}

/* ===== resultnatreffinal — "final score." warm natural ===== */

export function Resultnatreffinal({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  const band = logoTop + (story ? 165 : 115);
  const title = "final score.";
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 420 : 660, fy: story ? 820 : 590, fs: story ? 200 : 140 });
  const t1 = fit(150 * k * ts, W - 110, title.length, 0.56);
  // His head up at the title's height: the title takes two lines ("final / score.") in the free room beside his face;
  // with no room there either, it goes behind him (his head over the word, his face never covered).
  const nx = place.nudge?.x ?? 0;
  const ny = place.nudge?.y ?? 0;
  const atHead = band + t1 * 0.95 > place.fy + ny - place.fs * 1.05;
  const leftRoom = place.fx + nx - place.faceW * 0.9 - 76;
  const split = atHead && leftRoom >= 300 * k;
  const tPx = split ? Math.min(150 * k * ts, fit(170 * k * ts, leftRoom, 6, 0.56)) : t1;
  const tRows = split ? ["final", "score."] : [title];
  const behind = atHead && !split;
  const lines = [`${fx.homeName} ${hg}`, "x", `${fx.awayName} ${ag}`];
  const lPx = Math.min(...lines.map((l) => fit(30 * k * ts, W * 0.6, l.length, 0.56)));
  const linesTop = band + tPx * (tRows.length - 1) * 0.92 + tPx * 1.12 + 40 * k;
  const score = `${hg}-${ag}`;
  const sPx = fit(420 * k * ts, W - 110, score.length, 0.6);
  const foot = competition(d);
  const fPx = fit(19 * k * ts, W * 0.6, foot.length, 0.55);
  const footTop = bottom - fPx * 1.2;
  const sTop = footTop - 30 * k - sPx * 0.74;
  const ink = clubInk(d);
  const bold = (px: number) => ({ fontFamily: SANS, fontWeight: 800, fontSize: px, lineHeight: 0.92, letterSpacing: "-0.055em", whiteSpace: "nowrap" as const, color: "#fff", textShadow: "0 2px 22px rgba(0,0,0,.22)" });
  return (
    <Shell
      data={d}
      place={place}
      bg="#2a2a1e"
      // The reference's photo treatment: natural colour with a warm, slightly faded golden-hour grade (lifted blacks);
      // he stays as photographed, sharp on top.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "sepia(.24) saturate(1.12) contrast(.92) brightness(1.03)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,184,110,.16), rgba(255,150,80,.06) 55%, rgba(60,40,20,.12))", mixBlendMode: "screen" }} />
        </>
      }
      back={
        <>
          {shade(0, linesTop + 3 * lPx * 1.2 + 160 * k, "down", 0.32)}
          {behind && <div style={{ position: "absolute", left: 56, top: band, ...bold(tPx) }}>{title}</div>}
        </>
      }
      front={
        <>
          {shade(sTop - 200 * k, H - sTop + 200 * k, "up", 0.42)}
          {!behind && <div style={{ position: "absolute", left: 56, top: band }}>{tRows.map((r) => <div key={r} style={bold(tPx)}>{r}</div>)}</div>}
          <div style={{ position: "absolute", left: 62, top: linesTop, textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>
            {lines.map((l, i) => (
              <div key={i} style={{ fontFamily: SANS, fontWeight: 700, fontStyle: "italic", fontSize: lPx, lineHeight: 1.12, whiteSpace: "nowrap", color: "#fff" }}>{l}</div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 46, top: sTop, ...bold(sPx), lineHeight: 0.74 }}>{score}</div>
          {foot && <div style={{ position: "absolute", left: 62, top: footTop, fontFamily: SANS, fontWeight: 600, fontStyle: "italic", fontSize: fPx, lineHeight: 1.2, whiteSpace: "nowrap", color: "#fff", opacity: 0.9 }}>{foot}</div>}
          <div style={{ position: "absolute", right: 62, top: footTop + fPx * 0.25, width: 46 * k, display: "flex", flexDirection: "column" }}>
            <div style={{ height: 9 * k, background: ink }} />
            <div style={{ height: 9 * k, background: "#fff" }} />
          </div>
        </>
      }
    />
  );
}
