import { ourClub } from "./goalnatcaption";
import { natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Filled } from "./natref4";
import { SERIF, Shell, fit, frameOf, shade } from "./natref1";
import { DISPLAY, SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 65 · natural matchday looks after ONE of the user's liked references each (scratchpad liked/), photo
 * treatment first. Photos only through NatGround / NatFigure (the Shell, and `Filled` for the graded ground), so the
 * "Brilho suave" finish keeps working; he and his face stay sharp and in colour, and the graded ground has HIM cut
 * out of it, so no second copy of him shows.
 *
 *   natrefsunlit   "MATCH / DAY" (Charles Henderson Boys Soccer v Dothan; liked12)
 *     treatment: his real photo in natural colour, sunlit and punchy — more saturation and contrast, a warm lift of
 *                the light from the top; the blurred real surroundings (grass, stands, trees) stay
 *     type:      the club's exact name tracked tiny on top, then two giant white heavy grotesque rows, "MATCH" and a
 *                much taller "DAY", both the full width, BEHIND him (he stands in front of DAY); "VS <opponent>" bold
 *                and the date – ground – kick-off small under DAY on his free side
 *
 *   natrefhighkey  "KO / VA / CIC." (Kovačić, Man City v Liverpool; liked01)
 *     treatment: high-key — the ground bleached almost to white (a faint grey ghost of the real stadium shows), a
 *                soft tint of his club's colour low on the free side; he stays in full colour
 *     type:      his surname stacked in giant condensed caps in the club colour (two or three letters a row, a full
 *                stop at the end) behind him on one side; both clubs' exact names in condensed caps at the top on
 *                the other side, a small italic "x" before the second; the date - kick-off widely tracked at the foot;
 *                thin club-colour edges at both sides
 */

const W = CANVAS_W;
const HEAVY = "var(--font-archivo-black), 'Arial Black', sans-serif";

/** Rough width of Archivo Black caps at 1px. */
function heavyEm(text: string) {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) em += /[MW]/.test(ch) ? 1.02 : /[I]/.test(ch) ? 0.42 : ch === " " ? 0.3 : /[J]/.test(ch) ? 0.66 : 0.82;
  return em;
}

/** His opponent, exactly as stored. */
function opponent(d: RenderData) {
  const fx = natFixture(d);
  return d.content.home === false ? fx.homeName : fx.awayName;
}

/* ===== natrefsunlit — "MATCH / DAY" over a sunlit photo ===== */

export function Natrefsunlit({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const k0 = (d.content.kicker || "").trim().toUpperCase();
  const rows = !k0 || /^MATCH\s*DAY$/.test(k0) ? ["MATCH", "DAY"] : k0.split(/\s+/).length === 2 ? k0.split(/\s+/) : [k0];
  const M = 64;
  const rowW = W - 2 * M;
  // Every row spans the full width (the reference: MATCH and DAY end on the same edges, so DAY is much taller).
  const px = rows.map((r) => Math.min(rowW / heavyEm(r), (story ? 520 : 400) * ts));
  const capOf = (p: number) => p * 0.74;
  const over = ourClub(d).toUpperCase();
  const oPx = fit(16 * k * ts, W - 160, over.length * 1.5, 0.7);
  const band = logoTop + (story ? 150 : 105);
  const minTop = band + oPx * 2.4;
  const gap = 22 * k;
  const last = rows.length - 1;
  const stackH = rows.reduce((h, _, i) => h + capOf(px[i]) + (i ? gap : 0), 0);
  // He is asked small and low so his head can sit inside the last (tallest) row, a third down, as in the reference
  // (he stands in front of it). The framed photo may still grow or move him: the rows are then laid out from where
  // his head REALLY lands — between the club line and the fixture, never above the club line.
  const want = { fx: d.params.side === "left" ? 470 : 600, fy: Math.round(minTop + stackH - capOf(px[last]) * 0.66), fs: story ? 118 : 84 };
  const place = natPlace(d, W, H, want);
  const headY = place.fy + (place.nudge?.y ?? 0);
  const maxTop = bottom - stackH - 260 * k;
  // A tight crop puts his face up in the first row: behind him the words would lose letters to his head, so the
  // rows then come IN FRONT of him, under his chin (his face stays clear, the words stay whole).
  const inFront = headY < minTop + capOf(px[0]) * 0.6;
  const chin = headY + place.fs * 0.8;
  const r0Top = inFront ? Math.max(minTop, Math.min(maxTop, chin + oPx * 2.4 + 20 * k)) : Math.max(minTop, Math.min(maxTop, headY + capOf(px[last]) * 0.66 - stackH));
  const overTop = inFront ? r0Top - oPx * 2.4 : band;
  const tops = rows.reduce<number[]>((acc, _, i) => [...acc, i ? acc[i - 1] + capOf(px[i - 1]) + gap : r0Top], []);
  const lastBottom = tops[last] + capOf(px[last]);
  // The fixture under the big word, on his free side (the reference: left, beside his legs).
  const vs = `VS ${opponent(d)}`.toUpperCase();
  const infoW = W * 0.44;
  const vOne = fit(44 * k * ts, infoW, heavyEm(vs), 1);
  const vWrap = vOne < 28 * k;
  const vPx = vWrap ? fit(44 * k * ts, infoW, heavyEm(vs) * 0.56, 1) : vOne;
  // The reference's "RIP HEWES STADIUM – 7:15PM": the ground and the kick-off; the date on its own line above.
  const lines = [[fx.date, fx.kickoff].filter(Boolean).join(" – "), d.content.venue || fx.venue].filter(Boolean).map((l) => l.toUpperCase());
  const lPx = Math.min(17 * k * ts, ...lines.map((l) => fit(17 * k * ts, infoW, l.length, 0.66)));
  const infoH = vPx * (vWrap ? 2.1 : 1.05) + lPx * 1.4 * lines.length + 8 * k;
  const infoTop = Math.min(lastBottom + 26 * k, bottom - infoH - 40 * k);
  // Under the big word on his free side (the reference's place); when he and the others fill both sides there, the
  // same block low at the foot.
  const footY = bottom - infoH - 30 * k;
  const infoCands = [
    { x0: M, y0: infoTop, x1: M + infoW, y1: infoTop + infoH },
    { x0: W - M - infoW, y0: infoTop, x1: W - M, y1: infoTop + infoH },
    { x0: M, y0: footY, x1: M + infoW, y1: footY + infoH },
    { x0: W - M - infoW, y0: footY, x1: W - M, y1: footY + infoH },
  ];
  const spot = pickTextSpot(place, infoCands);
  const infoY = infoCands[spot.index].y0;
  const right = spot.index % 2 === 1;
  const soft = inFront ? "0 3px 30px rgba(0,0,0,.3)" : "0 2px 26px rgba(0,0,0,.16)";
  const words = (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: overTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: oPx, letterSpacing: "0.5em", paddingLeft: "0.5em", whiteSpace: "nowrap", color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>{over}</div>
      {rows.map((r, i) => (
        <div key={r + i} style={{ position: "absolute", left: 0, right: 0, top: tops[i] - px[i] * 0.13, textAlign: "center", fontFamily: HEAVY, fontSize: px[i], lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: "#fff", textShadow: soft }}>{r}</div>
      ))}
    </>
  );
  return (
    <Shell
      data={d}
      place={place}
      bg="#3d5a2a"
      // The reference's photo treatment: natural colour, sunlit and punchy (saturation + contrast up, a little
      // brighter), the light warm from the top; the real blurred surroundings stay.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(1.3) contrast(1.1) brightness(1.05)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,214,150,.20), rgba(255,200,130,.07) 50%, rgba(0,0,0,0) 75%)", mixBlendMode: "screen" }} />
        </>
      }
      back={
        <>
          {shade(0, lastBottom + 120 * k, "down", 0.16)}
          {!inFront && words}
        </>
      }
      front={
        <>
          {inFront && words}
          <div style={{ position: "absolute", ...(right ? { right: M } : { left: M }), top: infoY, width: infoW, textAlign: right ? "right" : "left", color: "#fff", textShadow: `0 1px 12px rgba(0,0,0,${spot.crowded ? 0.6 : 0.42})` }}>
            <div style={{ fontFamily: HEAVY, fontSize: vPx, lineHeight: 1.02, whiteSpace: vWrap ? "normal" : "nowrap" }}>{vs}</div>
            <div style={{ marginTop: 8 * k }}>
              {lines.map((l) => (
                <div key={l} style={{ fontFamily: SANS, fontWeight: 700, fontSize: lPx, letterSpacing: "0.04em", lineHeight: 1.4, whiteSpace: "nowrap" }}>{l}</div>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}

/* ===== natrefhighkey — the stacked surname over a bleached photo ===== */

/** "KOVACIC" → ["KO", "VA", "CIC."]: two to four rows, the longer rows last, a full stop at the end. */
function stack(name: string): string[] {
  const s = [...name.replace(/\s+/g, "")];
  const n = s.length <= 3 ? 1 : s.length <= 5 ? 2 : s.length <= 9 ? 3 : 4;
  const base = Math.floor(s.length / n);
  const extra = s.length - base * n;
  const rows: string[] = [];
  let at = 0;
  for (let i = 0; i < n; i++) {
    const len = base + (i >= n - extra ? 1 : 0);
    rows.push(s.slice(at, at + len).join(""));
    at += len;
  }
  rows[n - 1] += ".";
  return rows;
}

/** Rough width of Anton caps at 1px. */
function antonEm(text: string) {
  let em = 0;
  for (const ch of text.normalize("NFD").replace(/\p{M}/gu, "")) em += /[MW]/.test(ch) ? 0.66 : /[I.]/.test(ch) ? 0.27 : ch === " " ? 0.2 : 0.52;
  return em;
}

export function Natrefhighkey({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const sur = (d.content.lastName || d.content.firstName || "").trim().toUpperCase();
  const rows = stack(sur || "MATCHDAY");
  // He stands on the right (or left) of centre; the surname column on the other side, behind him.
  const lettersLeft = d.params.side !== "left";
  const M = 70;
  const colW = W * 0.6;
  const top = logoTop + (story ? 250 : 170);
  const foot = [fx.date, fx.kickoff].filter(Boolean).join("  -  ");
  const fPx = fit(30 * k * ts, W - 200, foot.length * 1.6, 0.62);
  const footTop = bottom - fPx * 1.3;
  const room = footTop - 60 * k - top;
  const rPx = Math.min(...rows.map((r) => colW / antonEm(r)), room / (rows.length * 0.86), (story ? 470 : 340) * ts);
  const rowH = rPx * 0.86;
  const place = natPlace(d, W, H, { fx: lettersLeft ? 640 : 440, fy: story ? 820 : 600, fs: story ? 190 : 135 });
  // Both clubs on the other side at the top, exact names; a long one wraps, never cut.
  const names = [fx.homeName, fx.awayName].map((n) => n.toUpperCase());
  const nW = W * 0.38;
  const nOne = Math.min(...names.map((n) => fit(62 * k * ts, nW, antonEm(n), 1)));
  const nWrap = nOne < 40 * k;
  const nPx = nWrap ? Math.min(...names.map((n) => fit(62 * k * ts, nW, antonEm(n) * 0.58, 1))) : nOne;
  const comp = (roundTitle(d) || "").toUpperCase();
  const cPx = fit(15 * k * ts, nW, comp.length * 1.3, 0.66);
  const side = lettersLeft ? { right: M } : { left: M };
  const nameLines = names.reduce((n, nm) => n + (antonEm(nm) * nPx > nW ? 2 : 1), 0);
  // The reference's foot line (date - kick-off widely tracked) under his feet; when he fills the foot, it moves
  // into the clubs block instead (never over his legs).
  const footFree = !pickTextSpot(place, [{ x0: W * 0.12, y0: footTop, x1: W * 0.88, y1: footTop + fPx * 1.3 }]).crowded;
  const dPx = fit(17 * k * ts, nW, foot.length * 1.4, 0.62);
  const nH = (comp ? cPx * 1.4 + 10 * k : 0) + nPx * 0.98 * nameLines + (footFree || !foot ? 0 : dPx * 1.4 + 16 * k);
  // The clubs block on the side away from the surname: at the top as in the reference, or lower on that side when
  // his head is up there: under the surname column first, else low on the far side. Never over his face.
  const nX0 = lettersLeft ? W - M - nW : M;
  const lowY = footTop - nH - 50 * k;
  const underY = top + rows.length * rowH + 30 * k;
  const cands = [
    { x0: nX0, y0: logoTop + (story ? 230 : 150), x1: nX0 + nW, y1: logoTop + (story ? 230 : 150) + nH, side },
    { x0: lettersLeft ? M : W - M - nW, y0: underY, x1: (lettersLeft ? M : W - M - nW) + nW, y1: underY + nH, side: lettersLeft ? { left: M } : { right: M } },
    { x0: nX0, y0: lowY, x1: nX0 + nW, y1: lowY + nH, side },
  ].filter((c) => c.y1 < footTop - 20 * k);
  const pick = pickTextSpot(place, cands);
  const nb = cands[pick.index];
  const nTop = nb.y0;
  const nAlignRight = "right" in nb.side;
  return (
    <Shell
      data={d}
      place={place}
      bg="#f4f4f1"
      // The reference's photo treatment: high-key — the real ground bleached nearly white (only a faint grey ghost of
      // the stadium), a soft wash of his club's colour low on the free side; he alone in full colour.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) contrast(.62) brightness(1.42)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#f4f4f1", opacity: 0.8 }} />
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 55% 22% at ${lettersLeft ? 12 : 88}% 88%, ${ink}22, ${ink}00 70%)` }} />
        </>
      }
      back={
        <>
          <div style={{ position: "absolute", top, ...(lettersLeft ? { left: M } : { right: M }), width: colW, textAlign: lettersLeft ? "left" : "right" }}>
            {rows.map((r, i) => (
              <div key={r + i} style={{ height: rowH, fontFamily: DISPLAY, fontSize: rPx, lineHeight: 0.86, letterSpacing: "0.005em", whiteSpace: "nowrap", color: ink, opacity: 0.82 }}>{r}</div>
            ))}
          </div>
        </>
      }
      front={
        <>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 10 * k, background: ink }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 18 * k, background: ink }} />
          <div style={{ position: "absolute", top: nTop, ...nb.side, width: nW, textAlign: nAlignRight ? "right" : "left", color: ink }}>
            {comp && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.3em", whiteSpace: "nowrap", marginBottom: 10 * k, opacity: 0.85 }}>{comp}</div>}
            <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.98, whiteSpace: nWrap ? "normal" : "nowrap" }}>{names[0]}</div>
            <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.98, whiteSpace: nWrap ? "normal" : "nowrap" }}>
              <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: nPx * 0.7, marginRight: nPx * 0.12, opacity: 0.9 }}>x</span>
              {names[1]}
            </div>
            {!footFree && foot && <div style={{ marginTop: 16 * k, fontFamily: SANS, fontWeight: 600, fontSize: dPx, letterSpacing: "0.24em", whiteSpace: "nowrap" }}>{foot}</div>}
          </div>
          {footFree && foot && <div style={{ position: "absolute", left: 0, right: 0, top: footTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: fPx, letterSpacing: "0.32em", paddingLeft: "0.32em", whiteSpace: "nowrap", color: ink }}>{foot}</div>}
        </>
      }
    />
  );
}
