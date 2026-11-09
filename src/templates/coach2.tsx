/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { coachRole } from "./coachhero";
import { FACES, wordEm } from "./goalhero";
import { natFixture, NatFigure, NatGround, natPlace, NatSpot } from "./natkit";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_W, type RenderData } from "./types";
import { frame, groundOf, Logo, wrapCaps } from "./usbold1";

/*
 * Round 2026-11-07 · four coach looks, each adapting ONE real head-coach graphic (public Pinterest grids), chosen
 * because their composition and photo treatment differ from the first coach set (all of which were a centred
 * cut-out bust under a big word on a flat ground):
 *   coachcard    — USC "Chad Savage" welcome card ("head coach matchday graphic", row 5 col 5)
 *   coachsheet   — Boston College "Head Coach Bill O'Brien" print sheet ("head coach matchday graphic", row 1 col 2)
 *   coachlowkey  — Swansea "Vítor Matos" low-key portrait ("head coach matchday graphic", row 2 col 3)
 *   coachmono    — Green Bay "COACH Matt LaFleur" ("coach gameday graphic design", row 1 col 1)
 * His photo is always his real one (natkit: the original's own surroundings, his sharp figure on top); his face
 * is never graded, blurred or drawn twice. Club names are printed whole.
 */

const SLAB = FACES.slab;
const W = CANVAS_W;

/** Home v away, exact names, the date · kick-off · venue line, the competition. */
function fixtureOf(data: RenderData) {
  const fx = natFixture(data);
  const md = matchFacts(data);
  const comp = [md.comp, md.round].filter(Boolean).join(" · ");
  return { fx, comp, kicker: (data.content.kicker || "MATCHDAY").toUpperCase().trim() };
}

/** His name as the profile has it (first / last), never shortened. */
function nameOf(data: RenderData) {
  const first = (data.content.firstName || "").trim();
  const last = (data.content.lastName || "").trim();
  return { first, last, full: [first, last].filter(Boolean).join(" ") };
}

/** His real photo framed in a box (the box's own size), surroundings and all; `ground` grades only the surroundings. */
function PhotoBox({ data, x, y, w, h, face, radius = 0, ground, spot, style }: { data: RenderData; x: number; y: number; w: number; h: number; face: { fx: number; fy: number; fs: number }; radius?: number; ground?: string; spot?: number; style?: CSSProperties }) {
  const place = natPlace(data, w, h, face);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: radius, background: "#cfc9bf", ...style }}>
      <NatGround place={place} W={w} H={h} style={ground ? { filter: ground } : undefined} />
      {spot ? <NatSpot place={place} W={w} H={h} amount={spot} color="#050505" /> : null}
      <NatFigure data={data} place={place} W={w} H={h} />
    </div>
  );
}

/** A club colour that reads on a light paper ground (light ones darkened). */
function inkOn(c: string) {
  return luminance(c) > 0.3 ? shade(c, -0.45) : c;
}

/** The second club colour for small type on a dark tab (falls back to a light tint of the first). */
function accentOn(data: RenderData, club: string) {
  const a = data.params.accent;
  return a && luminance(a) > 0.25 && a.toLowerCase() !== club.toLowerCase() ? a : shade(club, 0.55);
}

/* =============================================================================================================
 * 1 · Welcome card (USC football, "Chad Savage — Tight Ends / Inside Receivers Coach": Pinterest "head coach
 * matchday graphic", row 5 col 5). A warm cream page with the club colour as a band across the top and a thin
 * bar along the foot; his real photo in a big rounded card set to the left; two thin club-colour outline squares
 * offset from the card's corners; a dark name tab overlapping the card's right edge and running off the page —
 * first name small in the second colour, surname big in a slab serif, his role under it; the club crest on the
 * card's lower-left corner; the kicker in slab caps under the card and the fixture beside it.
 * ========================================================================================================== */
export function Coachcard({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const { club } = groundOf(data);
  const story = H > 1400;
  const paper = "#f1ece2";
  const ink = "#1c1b1a";
  const dark = luminance(club) < 0.06 ? shade(club, 0.08) : "#1d1d20";
  const { fx, comp, kicker } = fixtureOf(data);
  const n = nameOf(data);
  const role = coachRole(data);

  const top = story ? 230 : 96;
  const cardX = 64;
  const cardW = 770;
  const footRoom = story ? 340 : 250;
  const cardH = logoTop - footRoom - top + (story ? 70 : 60);
  const card = { fx: cardW * 0.46, fy: cardH * 0.3, fs: cardH * 0.25 };

  // ---- the name tab: from the card's right third off the page ----
  const tabX = cardX + cardW * 0.62;
  const tabW = W - tabX + 40;
  const innerW = W - tabX - 70;
  const lastPx = Math.min(96 * ts, innerW / Math.max(1, wordEm(SLAB, n.last.toUpperCase()) + 0.05));
  const firstPx = Math.min(34 * ts, innerW / Math.max(1, [...n.first].length * 0.75));
  const rolePx = Math.min(21 * ts, innerW / Math.max(1, [...role].length * 0.58));
  const tabH = firstPx * 1.2 + lastPx * 0.95 + rolePx * 1.4 + 74;
  const tabY = top + cardH * 0.62;

  // ---- under the card: the kicker, the fixture ----
  const footY = top + cardH + (story ? 54 : 40);
  const kickPx = Math.min(54 * ts, 500 / Math.max(1, wordEm(SLAB, kicker)));
  const colX = cardX + 4;
  const colW = W - 2 * colX;
  const vs = wrapCaps(`${fx.homeName} v ${fx.awayName}`.toUpperCase(), colW, 26 * ts, 16, 0.08, 2, 0.6);
  const sq = story ? 210 : 170;

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 60% at 40% 40%, #f7f3ea, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top - (story ? 70 : 44), background: `linear-gradient(to bottom, ${shade(club, -0.15)}, ${club})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 26 : 16, background: club }} />

      {/* the outline squares behind the card's corners */}
      <div style={{ position: "absolute", left: cardX + cardW - sq * 0.55, top: top - sq * 0.32, width: sq, height: sq, border: `3px solid ${club}`, borderRadius: 34, opacity: 0.75 }} />
      <div style={{ position: "absolute", left: W - sq * 0.75, top: tabY + tabH - sq * 0.2, width: sq, height: sq, border: `3px solid ${club}`, borderRadius: 34, opacity: 0.75 }} />

      <PhotoBox data={data} x={cardX} y={top} w={cardW} h={cardH} face={card} radius={38} style={{ boxShadow: "0 24px 50px rgba(40,30,20,.22)" }} />

      {fx.homeCrest || data.club?.crestUrl ? (
        <img src={(data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? ""} alt="" style={{ position: "absolute", left: cardX + 30, top: top + cardH - 62, width: 104, height: 104, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.35))" }} />
      ) : null}

      <div style={{ position: "absolute", left: tabX, top: tabY, width: tabW, height: tabH, background: dark, borderRadius: "30px 0 0 30px", boxShadow: "0 18px 36px rgba(0,0,0,.28)" }}>
        <div style={{ position: "absolute", left: 38, top: 34, fontFamily: SLAB.family, fontSize: firstPx, lineHeight: 1, letterSpacing: "0.04em", color: accentOn(data, club), whiteSpace: "nowrap" }}>{n.first.toUpperCase()}</div>
        <div style={{ position: "absolute", left: 34, top: 34 + firstPx * 1.2, fontFamily: SLAB.family, fontSize: lastPx, lineHeight: 0.95, color: "#fff", whiteSpace: "nowrap" }}>{n.last.toUpperCase()}</div>
        <div style={{ position: "absolute", left: 38, top: 34 + firstPx * 1.2 + lastPx * 0.95 + 14, fontFamily: SANS, fontSize: rolePx, fontWeight: 500, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>{role}</div>
      </div>

      <div style={{ position: "absolute", left: colX, top: footY, fontFamily: SLAB.family, fontSize: kickPx, lineHeight: 1, color: ink, whiteSpace: "nowrap" }}>{kicker}</div>
      <div style={{ position: "absolute", left: colX, top: footY + kickPx * 1.25, width: colW }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 700, fontSize: vs.px, letterSpacing: "0.08em", lineHeight: 1.3, whiteSpace: "nowrap", color: inkOn(club) }}>
            {l}
          </div>
        ))}
        <div style={{ marginTop: 8, fontFamily: SANS, fontWeight: 500, fontSize: Math.min(20 * ts, colW / Math.max(1, fx.line.length * 0.62)), letterSpacing: "0.1em", color: "#6b655c", whiteSpace: "nowrap", textTransform: "uppercase" }}>{fx.line}</div>
        {comp && <div style={{ marginTop: 6, fontFamily: SANS, fontWeight: 500, fontSize: Math.min(17 * ts, colW / Math.max(1, comp.length * 0.62)), letterSpacing: "0.1em", color: "#8d877d", whiteSpace: "nowrap", textTransform: "uppercase" }}>{comp}</div>}
      </div>

      <Logo data={data} top={logoTop} onLight />
    </div>
  );
}

/* =============================================================================================================
 * 2 · Print sheet (Boston College football, "Head Coach — HC Bill O'Brien": Pinterest "head coach matchday
 * graphic", row 1 col 2). An uncoated off-white sheet; his real photo as a plate inside a hairline frame with a
 * paper margin, a touch muted like print; under it a ruled information block — the crest in its own cell on
 * the left, on the right a small caption, the role big in serif, a rule, "HC" and his full name, a rule — and a
 * row of three fine-print cells along the foot (kicker · fixture · date, kick-off and ground).
 * ========================================================================================================== */
export function Coachsheet({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > 1400;
  const paper = "#ebe8e1";
  const ink = "#1e1d1b";
  const rule = "rgba(30,29,27,.55)";
  const { fx, comp, kicker } = fixtureOf(data);
  const n = nameOf(data);
  const role = coachRole(data).toUpperCase();

  const M = 58;
  const top = story ? 200 : 60;
  const blockH = story ? 420 : 330;
  const bottom = logoTop - (story ? 10 : 24);
  const plateH = bottom - blockH - top - 26;
  const plateW = W - 2 * M;
  const inner = 14;
  const pw = plateW - 2 * inner;
  const ph = plateH - 2 * inner;

  const bY = top + plateH + 26;
  const crestW = story ? 230 : 190;
  const rx = M + crestW + 28;
  const rw = W - M - rx;
  const capPx = Math.min(17 * ts, rw / Math.max(1, (comp || fx.line).length * 0.6));
  const rolePx = Math.min((story ? 92 : 74) * ts, rw / Math.max(1, [...role].length * 0.68));
  const namePx = Math.min((story ? 44 : 36) * ts, (rw - 70) / Math.max(1, [...n.full].length * 0.62));
  const cellH = story ? 92 : 74;
  const cellY = bY + blockH - cellH;
  const cells = [kicker, `${fx.homeName} v ${fx.awayName}`, fx.line];
  const cellW = [0.18, 0.46, 0.36].map((r) => r * plateW);
  const crest = (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(100% 70% at 50% 35%, #f3f1ec, transparent 75%)" }} />

      {/* the plate */}
      <div style={{ position: "absolute", left: M, top, width: plateW, height: plateH, border: `2px solid ${ink}` }} />
      <PhotoBox data={data} x={M + inner} y={top + inner} w={pw} h={ph} face={{ fx: pw * 0.5, fy: ph * 0.3, fs: ph * 0.2 }} ground="contrast(1.03) saturate(.86) brightness(1.01) sepia(.06)" />

      {/* the information block */}
      <div style={{ position: "absolute", left: M, top: bY, width: plateW, height: 2, background: ink }} />
      <div style={{ position: "absolute", left: M, top: bY + 10, width: crestW, height: cellY - bY - 20, border: `1.5px solid ${rule}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {crest && <img src={crest} alt="" style={{ width: crestW * 0.7, height: crestW * 0.7, objectFit: "contain" }} />}
      </div>
      <div style={{ position: "absolute", left: rx, top: bY + 18, fontFamily: SANS, fontSize: capPx, fontWeight: 500, letterSpacing: "0.06em", color: "#5b5850", whiteSpace: "nowrap", textTransform: "uppercase" }}>{comp || fx.line}</div>
      <div style={{ position: "absolute", left: rx - 2, top: bY + 18 + capPx * 1.6, fontFamily: SANS, fontSize: rolePx, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em", color: ink, whiteSpace: "nowrap" }}>{role}</div>
      {(() => {
        const ry = bY + 18 + capPx * 1.6 + rolePx * 1.12;
        return (
          <>
            <div style={{ position: "absolute", left: rx, width: rw, top: ry, height: 1.5, background: rule }} />
            <div style={{ position: "absolute", left: rx, top: ry + 14, display: "flex", alignItems: "baseline", gap: 22, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: namePx * 0.5, letterSpacing: "0.12em" }}>HC</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: namePx, lineHeight: 1, letterSpacing: "-0.01em" }}>{n.full.toUpperCase()}</span>
            </div>
            <div style={{ position: "absolute", left: rx, width: rw, top: ry + 14 + namePx * 1.25, height: 1.5, background: rule }} />
          </>
        );
      })()}

      {/* the fine-print row */}
      <div style={{ position: "absolute", left: M, top: cellY, width: plateW, height: cellH, borderTop: `1.5px solid ${rule}`, borderBottom: `2px solid ${ink}`, display: "flex" }}>
        {cells.map((c, i) => {
          const px = Math.min((story ? 19 : 16) * ts, (cellW[i] - 30) / Math.max(1, c.length * 0.72));
          return (
            <div key={i} style={{ width: cellW[i], borderLeft: i ? `1.5px solid ${rule}` : "none", display: "flex", alignItems: "center", padding: "0 14px", fontFamily: SANS, fontWeight: i === 0 ? 700 : 500, fontSize: px, letterSpacing: "0.08em", whiteSpace: "nowrap", textTransform: "uppercase" }}>
              {c}
            </div>
          );
        })}
      </div>

      <Logo data={data} top={logoTop} onLight />
    </div>
  );
}

/* =============================================================================================================
 * 3 · Low-key portrait (Swansea City, "Vítor Matos — Head Coach": Pinterest "head coach matchday graphic", row 2
 * col 3). His real photo with the surroundings taken down to near-black around him (his own pixels untouched, so
 * the light seems to fall on him alone), head and shoulders big in the upper two thirds; low over his chest his
 * name in two weights — first name in a thin wide sans, surname heavy — and a tiny caption row at the foot.
 * ========================================================================================================== */
export function Coachlowkey({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > 1400;
  const { fx, kicker } = fixtureOf(data);
  const n = nameOf(data);
  const role = coachRole(data).toUpperCase();
  const fs = story ? 400 : 300;
  const fy = story ? 640 : 440;

  const M = 80;
  const w = W - 2 * M;
  const firstPx = Math.min(104 * ts, w / Math.max(1, [...n.first].length * 0.7));
  const lastPx = Math.min(132 * ts, w / Math.max(1, [...n.last].length * 0.74));
  const nameTop = logoTop - (story ? 240 : 200) - firstPx - lastPx;
  const capPx = Math.min((story ? 17 : 15) * ts, (w / 3 - 20) / 18);
  const caps = [kicker, `${fx.homeName} v ${fx.awayName}`.toUpperCase(), [fx.date, fx.time].filter(Boolean).join(" · ")];
  const capTop = nameTop + firstPx * 1.05 + lastPx + (story ? 58 : 44);

  const place = natPlace(data, W, H, { fx: W / 2, fy, fs });
  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#060606", color: "#fff" }}>
      <NatGround place={place} W={W} H={H} style={{ filter: "contrast(1.08) saturate(.9) brightness(.7)" }} />
      <NatSpot place={place} W={W} H={H} amount={0.93} color="#060606" />
      <NatFigure data={data} place={place} W={W} H={H} style={{ filter: "contrast(1.06) saturate(1.02)" }} />
      {/* the light falls off down his body; his face stays the photo's own */}
      <div style={{ position: "absolute", left: 0, right: 0, top: place.fy + place.fs * 1.1, bottom: 0, background: "linear-gradient(to bottom, rgba(6,6,6,0), rgba(6,6,6,.55) 30%, rgba(6,6,6,.9) 62%, #060606 85%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 70% at 50% 30%, transparent 55%, rgba(0,0,0,.55))" }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop - (story ? 46 : 36), textAlign: "center", fontFamily: SANS, fontSize: 16 * ts, fontWeight: 500, letterSpacing: "0.4em", color: "rgba(255,255,255,.55)" }}>{role}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 200, fontSize: firstPx, lineHeight: 1.05, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{n.first.toUpperCase()}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop + firstPx * 1.05, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: lastPx, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{n.last.toUpperCase()}</div>
      <div style={{ position: "absolute", left: M, right: M, top: capTop, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: capPx, fontWeight: 500, letterSpacing: "0.14em", color: "rgba(255,255,255,.62)", whiteSpace: "nowrap" }}>
        {caps.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}

/* =============================================================================================================
 * 4 · "COACH" (Green Bay Packers, "Matt LaFleur — Head Coach": Pinterest "coach gameday graphic design", row 1
 * col 1). The top of the page his real photo with the surroundings graded to a deep black-and-white (he stays in
 * colour — the reference's colour accent is his own clothing), fading down into a white page; the last word of
 * his role gigantic in heavy italic condensed caps across his chest, white with a dark edge; on the white under
 * it his name small on the left and his role small on the right; the fixture and both crests quietly below.
 * (The reference's small second full-length figure is left out: he is never drawn twice.)
 * ========================================================================================================== */
export function Coachmono({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > 1400;
  const { fx, comp } = fixtureOf(data);
  const n = nameOf(data);
  const role = coachRole(data).toUpperCase();
  const word = role.split(/\s+/).pop() || "COACH";
  const F = FACES.barlow;
  const white = "#f5f5f3";

  const fs = story ? 250 : 190;
  const fy = story ? 470 : 300;
  const photoEnd = story ? 1180 : 860;
  const place = natPlace(data, W, H, { fx: W * 0.47, fy, fs });

  const size = Math.min((W - 70) / Math.max(0.5, wordEm(F, word)), (story ? 330 : 260) / F.cap) * ts;
  const base = photoEnd - (story ? 10 : 6);
  const capTop = base - size * F.cap;
  const lineY = base + (story ? 30 : 22);
  const smallPx = Math.min(19 * ts, 440 / Math.max(1, n.full.length * 0.66));
  const vs = `${fx.homeName} v ${fx.awayName}`.toUpperCase();
  const vsPx = Math.min((story ? 30 : 24) * ts, (W - 300) / Math.max(1, vs.length * 0.62));
  const fxTop = lineY + (story ? 150 : 90);
  const crestS = story ? 92 : 72;
  const grey = "#55524d";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: white, color: "#141414" }}>
      <NatGround place={place} W={W} H={H} style={{ filter: "grayscale(1) contrast(1.35) brightness(.36)" }} />
      <NatFigure data={data} place={place} W={W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: photoEnd - (story ? 360 : 260), height: story ? 360 : 260, background: `linear-gradient(to bottom, rgba(245,245,243,0), rgba(245,245,243,.7) 55%, ${white})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: photoEnd, bottom: 0, background: white }} />

      <svg width={W} height={size * 1.3} style={{ position: "absolute", left: 0, top: capTop - size * 0.3, overflow: "visible" }}>
        <text
          x={W / 2}
          y={size * 0.3 + size * F.cap}
          textAnchor="middle"
          style={{ fontFamily: F.family, fontWeight: F.weight, fontStyle: "italic", fontSize: size, letterSpacing: `${F.tracking ?? 0}em`, paintOrder: "stroke", stroke: "#141414", strokeWidth: size * 0.014, strokeLinejoin: "round", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))" }}
          fill="#ffffff"
        >
          {word}
        </text>
      </svg>

      <div style={{ position: "absolute", left: 60, top: lineY, fontFamily: SANS, fontSize: smallPx, fontWeight: 700, letterSpacing: "0.18em", whiteSpace: "nowrap" }}>{n.full.toUpperCase()}</div>
      <div style={{ position: "absolute", right: 60, top: lineY, fontFamily: SANS, fontSize: smallPx, fontWeight: 700, letterSpacing: "0.18em", whiteSpace: "nowrap" }}>{role}</div>

      <div style={{ position: "absolute", left: 0, right: 0, top: fxTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: vsPx, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{vs}</div>
          <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 500, fontSize: Math.min(17 * ts, 560 / Math.max(1, fx.line.length * 0.62)), letterSpacing: "0.14em", color: grey, whiteSpace: "nowrap", textTransform: "uppercase" }}>{fx.line}</div>
          {comp && <div style={{ marginTop: 6, fontFamily: SANS, fontWeight: 500, fontSize: Math.min(15 * ts, 560 / Math.max(1, comp.length * 0.62)), letterSpacing: "0.14em", color: "#86827b", whiteSpace: "nowrap", textTransform: "uppercase" }}>{comp}</div>}
        </div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
      </div>

      <Logo data={data} top={logoTop} onLight />
    </div>
  );
}
