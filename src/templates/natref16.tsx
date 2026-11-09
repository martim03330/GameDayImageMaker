/* eslint-disable @next/next/no-img-element */
import { natFixture, natPlace, pickTextSpot } from "./natkit";
import { dropped } from "./natfree26";
import { roundTitle } from "./natfree9";
import { Filled } from "./natref4";
import { BODONI, SERIF, Shell, fit, frameOf, shade } from "./natref1";
import { ARCHIVO_BLACK } from "./fx";
import { SANS } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 68 · natural MATCHDAY looks, each after ONE real reference captured this round (Pinterest), photo treatment
 * first. Photos only through the Shell and `Filled` (the graded ground with him removed, so no second copy of him
 * shows); he and his face stay sharp and in colour.
 *
 *   natrefwinegameday  "GAME DAY" (Strasbourg v Nice; Pinterest "matchday graphic editorial serif photo", row 1 col 5)
 *     treatment: deep wine shadows — the real photo darkened, its colour drained and pulled into a dark crimson, the
 *                edges sinking further; he stays in full colour and sharp
 *     type:      a light high-contrast serif word in two stacked caps lines, centred; both clubs tracked tiny above it,
 *                the ground | kick-off tracked tiny under it — the whole block on the quietest band (never his face)
 *
 *   natrefmistmatch    "It's match day" (Cracovia v Pogoń; Pinterest "matchday story typography italic serif",
 *                      row 1 col 5)
 *     treatment: cool mist — the real photo drained to a pale blue-grey, lower contrast, a soft haze lifted over the
 *                top; he stays in full colour and sharp
 *     type:      a small italic "It's", a heavy lowercase "match" BEHIND his head (his head and face always in front)
 *                and an italic "day" in the club colour tucked under its right side; the competition tracked tiny on
 *                top; at the foot both clubs tiny either side of the two crests, the kick-off under the crests and
 *                the ground tracked tiny along the very foot
 */

const W = CANVAS_W;

/** The kicker as stacked words ("MATCHDAY" → MATCH / DAY); no kicker → the reference's GAME / DAY. */
function stacked(kicker: string | undefined): string[] {
  const k = (kicker || "").trim().toUpperCase();
  if (!k) return ["GAME", "DAY"];
  const m = k.match(/^(MATCH|GAME)\s*(DAY)$/);
  if (m) return [m[1], m[2]];
  const words = k.split(/\s+/);
  return words.length === 2 ? words : [k];
}

/** Lines a tracked caps text of `len` chars at `px` takes in `w` (exact names wrap, never cut). */
const linesOf = (len: number, px: number, em: number, w: number) => Math.max(1, Math.ceil((len * px * em) / w));

/* ===== natrefwinegameday — "GAME DAY" on deep wine shadows ===== */

export function Natrefwinegameday({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const left = d.params.side === "left";
  const ask = (x: number) => natPlace(d, W, H, { fx: x, fy: story ? 640 : 460, fs: story ? 240 : 160 });
  const place0 = ask(left ? 440 : 640);
  const words = stacked(d.content.kicker);
  const TR = 0.3;
  const tEm = 0.62 + TR;
  const over = `${fx.homeName} – ${fx.awayName}`.toUpperCase();
  const under = [d.content.venue || fx.venue, fx.kickoff].filter(Boolean).join(" | ").toUpperCase();
  const gap = 22 * k;
  /** The block laid out in a box `bw` wide: the word as big as the reference (~45% of the frame), tracked lines wrapping. */
  const lay = (bw: number) => {
    const bPx = fit(118 * k * ts, bw, Math.max(...words.map((w) => w.length)), 0.74);
    const tw = Math.max(bw, W * 0.5);
    const tPx = Math.max(12 * k, Math.min(...[over, under].filter(Boolean).map((l) => fit(16 * k * ts, tw, l.length, tEm))));
    const oL = linesOf(over.length, tPx, tEm, tw);
    const uL = under ? linesOf(under.length, tPx, tEm, tw) : 0;
    return { bPx, tPx, tw, h: oL * tPx * 1.5 + gap + words.length * bPx * 0.94 + (uL ? gap + uL * tPx * 1.5 : 0) };
  };
  // The reference: centred over his chest, mid-height. Centred bands first; when each of them sits on him, columns on
  // either side (the word fitted to the column) — the one clear of his face and least on his body wins.
  const cw = W * 0.6;
  const c = lay(cw);
  const ys = [0.44, 0.5, 0.56, 0.62, 0.38].map((f) => H * f).concat([logoTop + (story ? 170 : 120)]);
  const centred = ys.map((y) => ({ cx: W / 2, w: cw, L: c, y: Math.min(y, bottom - c.h) }));
  const colW = W * 0.46;
  const s2 = lay(colW);
  const cols = [0.26, 0.33, 0.4, 0.5, 0.6].flatMap((f) =>
    [W * 0.06 + colW / 2, W * 0.94 - colW / 2].map((cx) => ({ cx, w: colW, L: s2, y: Math.min(H * f, bottom - s2.h) })),
  );
  const rect = (b: (typeof centred)[number]) => ({ x0: b.cx - b.w / 2, y0: b.y, x1: b.cx + b.w / 2, y1: b.y + b.L.h });
  const first = pickTextSpot(place0, centred.map(rect));
  // Every centred band on him (he fills the middle): he is framed further to his side and the block takes a column
  // on the free side — the reference's quiet ground next to him, never on his face or shirt.
  const onHim = first.cost > 0.03;
  // Framed further to either side; the columns tried with each framing, the quietest wins (his own side first).
  // Framed against his side only with a real face found: from behind his box is an estimate, and the cost misleads.
  const hasFace = !!(d.face ?? d.cutouts.find((c) => c.url === d.photoUrl)?.face);
  const places = onHim ? [place0, ask(left ? 300 : 780), ...(hasFace ? [ask(left ? 780 : 300)] : [])] : [place0];
  const sides = places.map((p) => pickTextSpot(p, cols.map(rect)));
  const bi = sides.reduce((b, s, i) => (s.cost < sides[b].cost - 0.05 ? i : b), 0);
  const side = sides[bi];
  const useSide = onHim && side.cost < first.cost;
  const place = useSide ? places[bi] : place0;
  const at = useSide ? cols[side.index] : centred[first.index];
  const spot = useSide ? side : first;
  const { bPx, tPx, tw } = at.L;
  const top = at.y;
  const blockH = at.L.h;
  const glow = `0 2px 18px rgba(0,0,0,${spot.crowded ? 0.7 : 0.5})`;
  const track = { fontFamily: SANS, fontWeight: 500, fontSize: tPx, letterSpacing: `${TR}em`, lineHeight: 1.5, opacity: 0.82 } as const;
  return (
    <Shell
      data={d}
      place={place}
      bg="#1c0709"
      // The reference's photo treatment: deep wine shadows — the real photo darker and drained, pulled into a dark
      // crimson, the edges sinking further. He (the sharp figure on top) is never graded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.45) brightness(.46) contrast(1.18)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#6e1222", mixBlendMode: "color", opacity: 0.7 }} />
          <div style={{ position: "absolute", inset: 0, background: "#4a0c16", mixBlendMode: "multiply", opacity: 0.35 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 64% at 50% 42%, rgba(0,0,0,0) 35%, rgba(14,1,4,.75) 100%)",
            }}
          />
        </>
      }
      front={
        <>
          <div
            style={{
              position: "absolute",
              left: at.cx - W / 2,
              width: W,
              top: top - 160 * k,
              height: blockH + 320 * k,
              background: `radial-gradient(ellipse 55% 50% at 50% 50%, rgba(20,2,6,${spot.crowded ? 0.55 : 0.32}), rgba(0,0,0,0) 72%)`,
            }}
          />
          <div
            style={{ position: "absolute", left: at.cx - tw / 2, width: tw, top, textAlign: "center", color: "#f3ece6", textShadow: glow }}
          >
            <div style={{ ...track, paddingLeft: `${TR}em` }}>{over}</div>
            <div
              style={{
                marginTop: gap,
                fontFamily: BODONI,
                fontWeight: 400,
                fontSize: bPx,
                lineHeight: 0.94,
                letterSpacing: "0.005em",
                whiteSpace: "nowrap",
              }}
            >
              {words.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            {under && <div style={{ ...track, marginTop: gap, paddingLeft: `${TR}em` }}>{under}</div>}
          </div>
        </>
      }
    />
  );
}

/* ===== natrefmistmatch — "It's match day" on a cool mist ===== */

/** The kicker as the reference's words: "MATCHDAY" / none → match + day; any other word stands alone. */
function mistWords(kicker: string | undefined): [string, string] {
  const k = (kicker || "").trim();
  const m = k.match(/^(match|game)\s*(day)$/i);
  if (!k) return ["match", "day"];
  return m ? [m[1].toLowerCase(), "day"] : [k.toLowerCase(), ""];
}

export function Natrefmistmatch({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  const ink = clubInk(d);
  const place = natPlace(d, W, H, { fx: d.params.side === "left" ? 470 : 610, fy: story ? 820 : 600, fs: story ? 240 : 165 });
  const [big, tail] = mistWords(d.content.kicker);
  const comp = (roundTitle(d) || "").toUpperCase();
  const cPx = fit(15 * k * ts, W - 200, comp.length, 0.62 + 0.45);
  const compY = logoTop + (story ? 150 : 105);
  const minTop = compY + (comp ? cPx * 2.4 : 0);
  // The heavy lowercase word as wide as the reference (~80% of the frame), its foot just into his hair: it runs
  // behind his head, so his head and face are always in front of it.
  const want = fit(330 * k * ts, W * 0.8, big.length, 0.66);
  let mPx = want;
  const headTop = place.fy + (place.nudge?.y ?? 0) - place.fs * 0.95;
  const foot = Math.min(headTop + place.fs * 0.35, place.fy + (place.nudge?.y ?? 0) - place.fs * 0.55);
  const X = 0.74; // ascender height of the lowercase, of the font size
  if (foot - mPx * X < minTop) mPx = (foot - minTop) / X;
  // The word's box (line-height 1): its baseline ~0.8 of the size down, its ascenders ~0.06 under the box top.
  let boxTop = Math.max(minTop - mPx * 0.06, foot - mPx * 0.8);
  // No room over his head (a tight photo, his head high): the word goes in FRONT, at the quietest band under his face
  // (never on it), a little smaller than the reference.
  const inFront = mPx < want * 0.75;
  if (inFront) {
    mPx = want * 0.85;
    const bands = [0.5, 0.58, 0.42, 0.66].map((f) => H * f);
    const spot = pickTextSpot(
      place,
      bands.map((y) => ({ x0: W * 0.1, y0: y, x1: W * 0.9, y1: y + mPx * 1.1 })),
    );
    boxTop = bands[spot.index];
  }
  const iPx = mPx * 0.34;
  const dPx = mPx * 0.5;
  // The foot: both clubs either side of the two crests, the kick-off under them, the ground along the very foot.
  const cs = 66 * k;
  const colW = (W - 2 * 64 - 2 * cs - 60 * k) / 2;
  const nEm = 0.62 + 0.18;
  const nPx = Math.max(12 * k, Math.min(...[fx.homeName, fx.awayName].map((n) => fit(16 * k * ts, colW, n.length, nEm))));
  const nL = Math.max(...[fx.homeName, fx.awayName].map((n) => linesOf(n.length, nPx, nEm, colW)));
  const venue = (d.content.venue || fx.venue || "").toUpperCase();
  const vPx = Math.max(11 * k, fit(14 * k * ts, W - 160, venue.length, 0.62 + 0.5));
  const vL = venue ? linesOf(venue.length, vPx, 0.62 + 0.5, W - 160) : 0;
  const kPx = fit(22 * k * ts, cs * 2 + 120 * k, fx.kickoff.length, 0.58);
  const rowH = Math.max(cs + 10 * k + kPx * 1.3, nL * nPx * 1.4);
  const vTop = bottom - vL * vPx * 1.5;
  const rowTop = vTop - (vL ? 40 * k : 0) - rowH;
  const crowded = pickTextSpot(place, [{ x0: 64, y0: rowTop, x1: W - 64, y1: rowTop + rowH }]).crowded;
  const glow = `0 1px 12px rgba(10,16,24,${crowded ? 0.7 : 0.5})`;
  const name = (n: string, align: "left" | "right") => (
    <div
      style={{
        width: colW,
        textAlign: align,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: nPx,
        letterSpacing: "0.18em",
        lineHeight: 1.4,
        textTransform: "uppercase",
      }}
    >
      {n}
    </div>
  );
  const wordEl = (
    <div style={{ position: "absolute", left: 0, right: 0, top: boxTop, textAlign: "center", color: "#fff" }}>
      <span
        style={{
          position: "relative",
          display: "inline-block",
          fontFamily: ARCHIVO_BLACK,
          fontWeight: 400,
          fontSize: mPx,
          lineHeight: 1,
          letterSpacing: "-0.045em",
          whiteSpace: "nowrap",
          textShadow: "0 4px 30px rgba(20,28,40,.25)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: -0.01 * mPx,
            top: 0.3 * mPx - iPx * 0.8,
            textShadow: "0 1px 10px rgba(20,28,40,.35)",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: iPx,
            letterSpacing: 0,
            lineHeight: 1,
          }}
        >
          It&apos;s
        </span>
        {big}
        {tail && (
          <span
            style={{
              position: "absolute",
              right: -0.1 * mPx,
              top: 0.66 * mPx,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: dPx,
              letterSpacing: 0,
              lineHeight: 1,
              color: ink,
            }}
          >
            {tail}
          </span>
        )}
      </span>
    </div>
  );
  return (
    <Shell
      data={d}
      place={place}
      bg="#8d98a3"
      // The reference's photo treatment: a cool mist — the real photo drained to a pale blue-grey, lower contrast,
      // a soft haze lifted over the top. He (the sharp figure on top) is never graded.
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, filter: "saturate(.28) contrast(.82) brightness(1.04)" }}>
            <Filled place={place} H={H} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "#5f7286", mixBlendMode: "color", opacity: 0.38 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(196,206,216,.5), rgba(196,206,216,.18) 45%, rgba(40,48,58,.0) 62%, rgba(22,28,36,.5) 100%)",
            }}
          />
        </>
      }
      back={
        <>
          {comp && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: compY,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: cPx,
                letterSpacing: "0.45em",
                paddingLeft: "0.45em",
                whiteSpace: "nowrap",
                color: "#fff",
                opacity: 0.85,
              }}
            >
              {comp}
            </div>
          )}
          {!inFront && wordEl}
        </>
      }
      front={
        <>
          {shade(rowTop - 320 * k, H - rowTop + 320 * k, "up", 0.5)}
          {inFront && wordEl}
          <div
            style={{
              position: "absolute",
              left: 64,
              right: 64,
              top: rowTop,
              height: rowH,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#fff",
              textShadow: glow,
            }}
          >
            {name(fx.homeName, "left")}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 22 * k }}>
                {fx.homeCrest && (
                  <img
                    src={fx.homeCrest}
                    alt=""
                    style={{ width: cs, height: cs, objectFit: "contain", filter: "drop-shadow(0 1px 6px rgba(0,0,0,.4))" }}
                  />
                )}
                {fx.awayCrest && (
                  <img
                    src={fx.awayCrest}
                    alt=""
                    style={{ width: cs, height: cs, objectFit: "contain", filter: "drop-shadow(0 1px 6px rgba(0,0,0,.4))" }}
                  />
                )}
              </div>
              {fx.kickoff && (
                <div
                  style={{
                    marginTop: 10 * k,
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: kPx,
                    lineHeight: 1.3,
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fx.kickoff}
                </div>
              )}
            </div>
            {name(fx.awayName, "right")}
          </div>
          {venue && (
            <div
              style={{
                position: "absolute",
                left: 80,
                right: 80,
                top: vTop,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: 500,
                fontSize: vPx,
                letterSpacing: "0.5em",
                paddingLeft: "0.5em",
                lineHeight: 1.5,
                color: "#fff",
                opacity: 0.8,
                textShadow: glow,
              }}
            >
              {venue}
            </div>
          )}
        </>
      }
    />
  );
}
