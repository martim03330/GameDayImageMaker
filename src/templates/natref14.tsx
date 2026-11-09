/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Filled } from "./natref4";
import { Shell, fit, frameOf, shade } from "./natref1";
import { CONDENSED, SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 66 · natural looks after ONE real reference each (Pinterest, captured this round), photo treatment first.
 * Photos only through NatGround / NatFigure (the Shell, and `Filled` for the graded ground, so no second copy of him
 * shows); he and his face stay sharp and in colour.
 *
 *   natrefpitchnumber     "KYLIAN MBAPPÉ · 10" (Pinterest "football player name poster photo minimal", row 2 col 5)
 *     treatment: a deep, muted pitch-green grade — the real photo darker and less saturated, a green cast over it and
 *                the corners sinking into shadow; he stays in full colour and sharp
 *     type:      his full name tracked tiny across the top; his shirt number giant in pale condensed figures BEHIND
 *                him, his head just over its foot; at the foot his first name tracked small over his surname in heavy
 *                caps on one side, the club, the opponent and the date - kick-off in three small lines on the other.
 *                No number stored: the kicker word (else MATCHDAY) in the number's place — never a fake number.
 *
 *   resultnatrefhalftime  "HALF-TIME 1-1" (Pinterest "matchday poster shirt number photo", row 3 col 1)
 *     treatment: natural and soft — the real photo a little muted and warm, lower contrast, the foot sinking into a
 *                long dark fade; he stays in full colour and sharp
 *     type:      low and centred: "FULL-TIME" widely tracked, the score big in light condensed figures with both
 *                crests small in grey either side; the ground, both clubs (exact names, wrapping, never cut) and the
 *                competition in three tiny tracked columns at the foot
 */

const W = CANVAS_W;

/** Rough width of Barlow Condensed figures / caps at 1px (bold). */
function condEm(text: string) {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) em += /[MW]/.test(ch) ? 0.66 : /[1I]/.test(ch) ? 0.3 : ch === " " ? 0.2 : /[-–]/.test(ch) ? 0.3 : 0.46;
  return em;
}

/** His opponent, exactly as stored. */
function opponent(d: RenderData) {
  const fx = natFixture(d);
  return d.content.home === false ? fx.homeName : fx.awayName;
}

/* ===== natrefpitchnumber — the giant number on a deep green photo ===== */

export function Natrefpitchnumber({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const num = String(d.player?.number ?? "").trim().replace(/[^0-9]/g, "").slice(0, 3);
  const k0 = (d.content.kicker || "").trim().toUpperCase();
  const big = num || (k0 && k0.length <= 10 ? k0 : "MATCHDAY");
  const M = 64;
  const full = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const oPx = fit(17 * k * ts, W - 160, full.length * 1.5, 0.7);
  const nameY = logoTop + (story ? 150 : 105);
  const minTop = nameY + oPx * 2.6;
  // The figures as tall as the reference (about a quarter of the frame), never wider than ~70% of it.
  const capWant = Math.min((story ? 470 : 330) * ts, ((W * (num ? 0.66 : 0.86)) / condEm(big)) * 0.72);
  const fs0 = story ? 128 : 92;
  // He is asked low enough that his head sits just over the number's foot (the reference).
  const want = { fx: d.params.side === "left" ? 470 : 600, fy: Math.round(minTop + capWant * 0.86 + fs0 * 0.75), fs: fs0 };
  const place = natPlace(d, W, H, want);
  const headTop = place.fy + (place.nudge?.y ?? 0) - place.fs * 0.75;
  const faceX = place.fx + (place.nudge?.x ?? 0);
  // His face (forehead to chin, a little grown): the number may run behind his head top only, never his face.
  const faceR = { x0: faceX - place.faceW * 1.2, y0: headTop + place.fs * 0.2, x1: faceX + place.faceW * 1.2, y1: headTop + place.fs * 1.8 };
  const hit = (r: { x0: number; y0: number; x1: number; y1: number }) => Math.max(0, Math.min(r.x1, faceR.x1) - Math.max(r.x0, faceR.x0)) * Math.max(0, Math.min(r.y1, faceR.y1) - Math.max(r.y0, faceR.y0));
  // The reference: centred, its foot a little under his head top. When the photo frames him higher, it shrinks to
  // the room above him (never into the name line); with no room there it moves to his free side, at the top.
  const room = headTop + capWant * 0.14 - minTop;
  const cCap = Math.max(Math.min(capWant, room), Math.min(capWant, 260 * k));
  const cTop = Math.max(minTop, headTop + cCap * 0.14 - cCap);
  const cW = (cCap / 0.72) * condEm(big);
  const centred = { cap: cCap, top: cTop, x: W / 2 };
  // His free side: from his head to the canvas edge.
  const free = faceX > W / 2 ? [44, faceR.x0 - 24] : [faceR.x1 + 24, W - 44];
  const sideCap = Math.min(capWant, ((Math.min(W * 0.5, free[1] - free[0])) / condEm(big)) * 0.72);
  const sideX = (free[0] + free[1]) / 2;
  const sW = (sideCap / 0.72) * condEm(big);
  const cHit = hit({ x0: W / 2 - cW / 2, y0: cTop, x1: W / 2 + cW / 2, y1: cTop + cCap }) / Math.max(1, cW * cCap);
  const sHit = hit({ x0: sideX - sW / 2, y0: minTop, x1: sideX + sW / 2, y1: minTop + sideCap }) / Math.max(1, sW * sideCap);
  const at = cHit <= 0.03 || cHit <= sHit || sideCap < 200 * k ? centred : { cap: sideCap, top: minTop, x: sideX };
  const cap = at.cap;
  const nTop = at.top;
  const nPx = cap / 0.72;
  // The tiny name line on top only when his head is clear of it (it is repeated at the foot anyway).
  const nameFree = hit({ x0: 80, y0: nameY - 10, x1: W - 80, y1: nameY + oPx * 1.6 }) === 0 && headTop > nameY + oPx * 1.8;
  // The foot: his name on one side, the fixture on the other.
  const first = (d.content.firstName || "").toUpperCase();
  const sur = (d.content.lastName || "").toUpperCase();
  const colW = W * 0.4;
  const fPx = fit(18 * k * ts, colW, first.length * 1.5, 0.66);
  const sPx = fit(54 * k * ts, colW, sur.length, 0.78);
  const info = [ourClub(d), `VS ${opponent(d)}`, [fx.date, fx.kickoff].filter(Boolean).join(" - ")].filter((l) => l.trim()).map((l) => l.toUpperCase());
  // Club names exact and never cut: a long one wraps inside the column instead.
  const iPx = Math.max(13 * k, Math.min(17 * k * ts, ...info.map((l) => fit(17 * k * ts, colW, l.length, 0.66))));
  const iLines = info.reduce((n, l) => n + Math.ceil((l.length * iPx * 0.66) / colW), 0);
  const nameH = fPx * 1.6 + sPx * 1.0;
  const infoH = iLines * iPx * 1.45;
  const footH = Math.max(nameH, infoH);
  const footTop = bottom - footH - 20 * k;
  const nameLeft = d.params.side !== "left";
  const cands = [
    { x0: M, y0: footTop, x1: M + colW, y1: footTop + footH },
    { x0: W - M - colW, y0: footTop, x1: W - M, y1: footTop + footH },
  ];
  const crowded = pickTextSpot(place, cands).crowded;
  const glow = `0 1px 12px rgba(0,0,0,${crowded ? 0.65 : 0.45})`;
  const nameSide = nameLeft ? { left: M } : { right: M };
  const infoSide = nameLeft ? { right: M } : { left: M };
  return (
    <Shell
      data={d}
      place={place}
      bg="#1f2c1d"
      // The reference's photo treatment: deep, muted pitch green — the real photo darker and less saturated, a green
      // cast over it, the corners sinking into shadow. He (the sharp figure on top) is never graded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.7) contrast(1.06) brightness(.72)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#3f6a38", mixBlendMode: "color", opacity: 0.34 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 78% 62% at 50% 46%, rgba(0,0,0,0) 45%, rgba(6,14,6,.55) 100%)" }} />
        </>
      }
      back={
        <>
          <div style={{ position: "absolute", left: at.x - W, width: 2 * W, top: nTop - nPx * 0.14, textAlign: "center", fontFamily: CONDENSED, fontWeight: 700, fontSize: nPx, lineHeight: 1, letterSpacing: num ? "0.01em" : "0.02em", whiteSpace: "nowrap", color: "#dfe3d6", opacity: 0.8 }}>{big}</div>
        </>
      }
      front={
        <>
          {shade(footTop - 260 * k, H - footTop + 260 * k, "up", 0.45)}
          {nameFree && <div style={{ position: "absolute", left: 0, right: 0, top: nameY, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: oPx, letterSpacing: "0.5em", paddingLeft: "0.5em", whiteSpace: "nowrap", color: "#fff", opacity: 0.92 }}>{full}</div>}
          <div style={{ position: "absolute", ...nameSide, top: footTop + footH - nameH, width: colW, textAlign: nameLeft ? "left" : "right", color: "#fff", textShadow: glow }}>
            {first && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fPx, letterSpacing: "0.5em", lineHeight: 1.6, whiteSpace: "nowrap", opacity: 0.9 }}>{first}</div>}
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: sPx, lineHeight: 1, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{sur || first}</div>
          </div>
          <div style={{ position: "absolute", ...infoSide, top: footTop + footH - infoH, width: colW, textAlign: nameLeft ? "right" : "left", color: "#fff", textShadow: glow }}>
            {info.map((l) => (
              <div key={l} style={{ fontFamily: SANS, fontWeight: 600, fontSize: iPx, lineHeight: 1.45, letterSpacing: "0.08em" }}>{l}</div>
            ))}
          </div>
        </>
      }
    />
  );
}

/* ===== resultnatrefhalftime — the quiet "FULL-TIME" score low on a soft natural photo ===== */

const goalsOf = (d: RenderData) => [d.content.homeGoals ?? "–", d.content.awayGoals ?? "–"].map((g) => String(g).trim() || "–");

/** The competition alone (the subline's first part), else the round title. */
function competition(d: RenderData) {
  const s = (d.content.subline || "").split("·")[0].trim();
  return s || roundTitle(d) || "";
}

/** The reference's crests: small soft-grey marks beside the score. */
const CREST_GREY = "grayscale(1) brightness(1.25) contrast(.9) drop-shadow(0 1px 4px rgba(0,0,0,.5))";

export function Resultnatrefhalftime({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const [hg, ag] = goalsOf(d);
  const score = `${hg}-${ag}`;
  const k0 = (d.content.kicker || "").trim().toUpperCase();
  // The kicker only when it names the moment (a time / final word); anything else keeps the reference's label.
  const word = k0 && k0.length <= 14 && /TIME|FINAL|INTERVALO|RESULT/.test(k0) ? k0 : "FULL-TIME";
  const M = 56;
  // The foot: three tiny tracked columns (ground · both clubs · competition); exact names wrap, never cut.
  const colW = (W - 2 * M) / 3 - 16 * k;
  const cols = [d.content.venue || fx.venue || "", `${fx.homeName} v ${fx.awayName}`, competition(d)].map((c) => c.toUpperCase());
  const cPx = Math.max(12 * k, Math.min(14 * k * ts, ...cols.filter(Boolean).map((c) => fit(14 * k * ts, colW, c.length * 1.12, 0.62))));
  const cLines = Math.max(1, ...cols.map((c) => Math.ceil((c.length * cPx * 0.62 * 1.12) / colW)));
  const footH = cLines * cPx * 1.4;
  const footTop = bottom - footH;
  const sPx = fit((story ? 230 : 180) * ts, W * 0.42, score.length, 0.46);
  const cs = sPx * 0.36;
  const wPx = fit(26 * k * ts, W - 200, word.length * 1.5, 0.66);
  const blockH = wPx * 1.4 + 12 * k + sPx * 0.82;
  // The reference's place: the label and the score low, a short gap over the foot columns.
  const lowTop = footTop - (story ? 120 : 80) * k - blockH;
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 470 : 600, fy: story ? 600 : 420, fs: story ? 210 : 150 });
  // Never over his face: when the photo frames his face down there, the block goes high under the logo instead.
  const face = place.fy + (place.nudge?.y ?? 0);
  const high = face + place.fs * 0.9 > lowTop - 30 * k;
  const bTop = high ? logoTop + (story ? 170 : 120) : lowTop;
  // On his body (a tight photo), the block gets a soft dark backing so the score reads over the shirt.
  const onHim = pickTextSpot(place, [{ x0: W * 0.25, y0: bTop, x1: W * 0.75, y1: bTop + blockH }]).crowded;
  const glow = `0 2px 18px rgba(0,0,0,${onHim ? 0.6 : 0.45})`;
  return (
    <Shell
      data={d}
      place={place}
      bg="#2c3326"
      // The reference's photo treatment: natural and soft — the real photo a little muted and warm, lower contrast;
      // the foot sinks into a long dark fade. He (the sharp figure on top) is never graded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.86) contrast(.93) brightness(.95) sepia(.08)" }}>
            <Filled place={place} H={H} />
          </div>
        </>
      }
      front={
        <>
          {shade(0, 300 * k, "down", 0.28)}
          {shade(Math.min(bTop, footTop) - 380 * k, H - Math.min(bTop, footTop) + 380 * k, "up", 0.66)}
          {(high || onHim) && <div style={{ position: "absolute", left: 0, right: 0, top: bTop - 120 * k, height: blockH + 240 * k, background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,${onHim ? 0.5 : 0.35}), rgba(0,0,0,0) 72%)` }} />}
          <div style={{ position: "absolute", left: 0, right: 0, top: bTop, textAlign: "center", color: "#fff", textShadow: glow }}>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: wPx, letterSpacing: "0.42em", paddingLeft: "0.42em", lineHeight: 1.4, whiteSpace: "nowrap", opacity: 0.92 }}>{word}</div>
            <div style={{ marginTop: 12 * k, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 * k, height: sPx * 0.82 }}>
              {fx.homeCrest ? <img src={fx.homeCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: CREST_GREY }} /> : <div style={{ width: cs }} />}
              <div style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: sPx, lineHeight: 0.82, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{score}</div>
              {fx.awayCrest ? <img src={fx.awayCrest} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: CREST_GREY }} /> : <div style={{ width: cs }} />}
            </div>
          </div>
          <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", justifyContent: "space-between", alignItems: "flex-start", color: "#fff", opacity: 0.86 }}>
            {cols.map((c, i) => (
              <div key={i} style={{ width: colW, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right", fontFamily: SANS, fontWeight: 500, fontSize: cPx, letterSpacing: "0.12em", lineHeight: 1.4 }}>{c}</div>
            ))}
          </div>
        </>
      }
    />
  );
}
