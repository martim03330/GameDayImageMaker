/* eslint-disable @next/next/no-img-element */
import { luminance } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { fitAbove, natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { Shell, fit, frameOf, shade, small } from "./natref1";
import { CONDENSED, SANS } from "./shared";
import { clubInk } from "./trend2";
import { ourCrest } from "./usgame1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 63 · natural GOAL looks after ONE real reference each (photo treatment first). Photos only through
 * NatGround / NatFigure (the Shell), so the "Brilho suave" finish keeps working; he and his face stay sharp and in
 * colour, and the ground is never zoomed or shifted (no second him).
 *
 *   goalnatreffirst  "First / Goal" (Nico O'Reilly, Man City, UCL; Pinterest "goal poster player celebration
 *                    typography", col 2 last row)
 *     treatment: his real celebration photo in natural colour, untouched (night stadium, real crowd and grass), only
 *                a soft dark fall-off at the top and the foot for the type
 *     type:      two huge heavy white grotesque words in title case — one high by his head, "Goal" low across his
 *                legs — the club crest small at the top centre, one small caption sentence at the foot
 *
 *   goalnatrefpanel  "GOAL!" (Maximilian Beier, BVB v Bayern; Pinterest "goal celebration poster football design",
 *                    row 2 col 2)
 *     treatment: his real celebration photo in natural colour, untouched, on the right ~60%; a flat club-colour
 *                panel over the left ~40% (in the reference BVB yellow) with a faint tone-on-tone ghost of the word
 *     type:      a giant heavy condensed italic "GOAL!" running up the panel, both crests small at its top, his name
 *                in condensed italic at its foot
 */

const W = CANVAS_W;

/* ===== goalnatreffirst — "First / Goal" ===== */

const tc = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

export function Goalnatreffirst({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const left = d.params.side === "left";
  const place = natPlace(d, W, H, { fx: left ? 470 : 590, fy: story ? 860 : 600, fs: story ? 200 : 140 });
  const first = (d.content.firstName || "").trim();
  const last = (d.content.lastName || "").trim();
  const name = [first, last].filter(Boolean).join(" ");
  const k0 = (d.content.kicker || "").trim();
  const word2 = !k0 || /^goal$/i.test(k0) ? "Goal" : tc(k0);
  // The reference's first word is a qualifier ("First"): here his first name, title case.
  const word1 = tc(first || last);
  const club = ourClub(d);
  const caption = name ? `${name}'s goal${club ? ` for ${club}` : ""}` : club ? `A goal for ${club}` : "";
  // Heavy grotesque at ~0.6em per letter (tight tracking).
  const g2 = fit(330 * k * ts, W - 120, word2.length, 0.6);
  const g1 = fit(250 * k * ts, W - 120, word1.length, 0.6);
  const cPx = fit(19 * k * ts, W - 140, caption.length, 0.52);
  const crest = ourCrest(d);
  const cs = 64 * k;
  // Clear of the agency logo's band at the top (the agreed spot: scaled and moved down).
  const band = logoTop + (story ? 160 : 115);
  // Word one high: under the crest, above his head when it fits there (shrunk if need be, never over his face);
  // otherwise beside his head on the freer side, as the reference's "First" sits by the player's head — then the
  // crest goes over the word on that side, so it never lands on his face.
  const top1 = band + cs + 28 * k;
  // No face found (a photo from behind): his head's place is only a guess, so the word goes high only when it clears
  // the top of his whole figure (a raised fist included); otherwise the look keeps to "Goal" and the caption.
  const cut = d.cutouts.find((c) => c.url === d.photoUrl);
  const hasFace = !!(d.face ?? cut?.face);
  const blind = !hasFace && top1 + g1 * 0.95 * 0.6 > place.box.top - 30 * k;
  const sc = word1 && !blind ? (hasFace ? fitAbove(place, top1, g1 * 0.95, 0.6) : Math.min(1, (place.box.top - 30 * k - top1) / (g1 * 0.95))) : null;
  const above = sc !== null;
  const show1 = !!word1 && (hasFace || above);
  const roomL = place.fx - place.faceW * 0.95 - 100;
  const roomR = W - (place.fx + place.faceW * 0.95) - 100;
  const onLeft = roomL >= roomR;
  const w1Px = above ? g1 * (sc ?? 1) : Math.min(g1, fit(250 * k * ts, Math.max(160, onLeft ? roomL : roomR), word1.length, 0.62));
  const w1Top = above ? top1 : Math.max(band + cs + 24 * k, place.fy - place.fs * 0.85 + 10 * k);
  const crestAt = above ? { left: (W - cs) / 2, top: band } : { left: onLeft ? 50 : W - 50 - cs, top: w1Top - cs - 18 * k };
  const capTop = bottom - cPx * 1.4;
  const w2Top = capTop - 24 * k - g2 * 0.92;
  return (
    <Shell
      data={d}
      place={place}
      bg="#141a14"
      front={
        <>
          {shade(0, top1 + w1Px + 200 * k, "down", 0.42)}
          {shade(w2Top - 260 * k, H - w2Top + 260 * k, "up", 0.55)}
          {crest && show1 && <img src={crest} alt="" style={{ position: "absolute", left: crestAt.left, top: crestAt.top, width: cs, height: cs, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />}
          {show1 && (
            <div
              style={{
                position: "absolute",
                ...(above ? { left: 0, right: 0, textAlign: "center" as const } : onLeft ? { left: 50, textAlign: "left" as const } : { right: 50, textAlign: "right" as const }),
                top: w1Top,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: w1Px,
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                whiteSpace: "nowrap",
                color: "#fff",
                textShadow: "0 3px 24px rgba(0,0,0,.28)",
              }}
            >
              {word1}
            </div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, top: w2Top, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: g2, lineHeight: 0.95, letterSpacing: "-0.045em", whiteSpace: "nowrap", color: "#fff", textShadow: "0 3px 24px rgba(0,0,0,.28)" }}>{word2}</div>
          {caption && <div style={{ position: "absolute", left: 0, right: 0, top: capTop, textAlign: "center", ...small(cPx, { fontWeight: 600, letterSpacing: "-0.01em", textShadow: "0 1px 8px rgba(0,0,0,.6)" }) }}>{caption}</div>}
        </>
      }
    />
  );
}

/* ===== goalnatrefpanel — "GOAL!" up a club-colour panel ===== */

/** The panel colour: his club's own colour, bright as a flag (the reference's BVB yellow). */
function panelOf(d: RenderData) {
  const c = clubInk(d);
  return /^#[0-9a-f]{6}$/i.test(c) ? c : "#f4d900";
}

export function Goalnatrefpanel({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  // The panel on the side away from him: he stands in the photo's ~60%.
  const panelRight = d.params.side === "left";
  const pw = Math.round(W * 0.4);
  const place = natPlace(d, W, H, { fx: panelRight ? 380 : 700, fy: story ? 760 : 520, fs: story ? 210 : 150 });
  const fx = natFixture(d);
  const panel = panelOf(d);
  const ink = luminance(panel) > 0.45 ? "#111" : "#fff";
  const k0 = (d.content.kicker || "").trim().toUpperCase();
  const word = !k0 || k0 === "GOAL" ? "GOAL!" : k0;
  const first = (d.content.firstName || "").trim();
  const last = (d.content.lastName || "").trim();
  const club = ourClub(d);
  // The word runs up the panel: its length along the panel's height, its cap height across the panel.
  const cs = 66 * k;
  // Under the agency logo's band (it sits at the top centre, over the panel's inner edge).
  const crestTop = logoTop + (story ? 160 : 115);
  const runTop = crestTop + cs + 50 * k;
  const nPx = Math.min(fit(54 * k * ts, pw - 70, Math.max(first.length, last.length), 0.42), 54 * k * ts);
  const clPx = fit(17 * k * ts, pw - 70, club.length, 0.5);
  const footH = (first && last ? 2 : 1) * nPx * 1.0 + (club ? clPx * 1.6 : 0);
  const runBottom = bottom - footH - 40 * k;
  const runLen = runBottom - runTop;
  const wPx = Math.min(fit(pw * 1.05, runLen, word.length, 0.5), pw * 1.05);
  const px0 = panelRight ? W - pw : 0;
  return (
    <Shell
      data={d}
      place={place}
      bg="#111"
      // The reference's panel is a flat block BESIDE the photo (the photo shows only right of it): it sits over the
      // photo and over his figure, so the word is never hidden by him; his face is kept off it by his placement.
      front={
        <div style={{ position: "absolute", left: px0, top: 0, width: pw, height: H, color: ink, overflow: "hidden", background: panel }}>
          <div style={{ position: "absolute", left: pw * 0.5, top: runBottom + 120 * k, transformOrigin: "0 0", transform: "rotate(-90deg)", fontFamily: CONDENSED, fontWeight: 900, fontStyle: "italic", fontSize: wPx * 1.5, lineHeight: 0.8, whiteSpace: "nowrap", color: ink, opacity: 0.07 }}>{word.replace(/!$/, "")}</div>
          <div style={{ position: "absolute", left: 34, top: crestTop, display: "flex", gap: 14 * k }}>
            {[fx.homeCrest, fx.awayCrest].map((c, i) => (c ? <img key={i} src={c} alt="" style={{ width: cs, height: cs, objectFit: "contain" }} /> : null))}
          </div>
          {/* Rotated -90°: the baseline runs up the panel's right side, the letters read bottom to top. */}
          <div style={{ position: "absolute", left: pw / 2 - wPx * 0.36, top: runBottom, width: runLen, transformOrigin: "0 0", transform: "rotate(-90deg)", textAlign: "center", fontFamily: CONDENSED, fontWeight: 900, fontStyle: "italic", fontSize: wPx, lineHeight: 0.72, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>{word}</div>
          <div style={{ position: "absolute", left: 34, right: 30, top: bottom - footH }}>
            {[first, last].filter(Boolean).map((l) => (
              <div key={l} style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: nPx, lineHeight: 1.0, whiteSpace: "nowrap" }}>{l}</div>
            ))}
            {club && <div style={small(clPx, { fontWeight: 600, marginTop: clPx * 0.4, opacity: 0.85 })}>{club}</div>}
          </div>
        </div>
      }
    />
  );
}
