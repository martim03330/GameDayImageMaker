/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { NatFigure, NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { standAt, wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, fixtureLines, frontFeet, portraitOf, vsLines } from "./prokit";

/* Round 34 · new pro families (liked/ + Pinterest "liga portugal matchday design", "soccer goal celebration poster design"). */

const W = CANVAS_W;

/* ================= 1 · Diagonal split, two scales (matchday) — Pinterest "Portugal v Spain MATCHDAY Round of 16" ================= */

/**
 * Diagonal duas escalas (matchday): a bold diagonal split — the club colour above, a deep shade below, a white seam —
 * his big colour portrait in the top half, the same player full-body in front across the seam; MATCHDAY tracked wide
 * with the round under it in the lower half, crests left and right of it, HOME X AWAY and the flags clock.
 */
export function Prodiagonal({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const y0 = H * 0.5;
  const y1 = H * 0.68;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const wPx = Math.min(96 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1) * 1.5));
  const footH = wPx + 14 * k + 18 * k + 14 * k + vs.lines.length * (vs.px + 6 * k) + 14 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  const p = frontFeet(d, 560, footTop + 20 * k, 1000 * k / 1.3);
  const lowPoly = `polygon(0 ${y1}px, ${W}px ${y0}px, ${W}px ${H}px, 0 ${H}px)`;
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, 0.12)}, ${shade(t.ink, -0.2)})` }} />
      {s && <Portrait s={s} cx={W * 0.55} cy={top + 300 * k} fh={300 * k} mode="color" opacity={0.95} />}
      <div style={{ position: "absolute", inset: 0, clipPath: lowPoly, background: `linear-gradient(180deg, ${shade(t.ink, -0.55)}, ${shade(t.ink, -0.75)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={0} y1={y1} x2={W} y2={y0} stroke="#fff" strokeWidth={10 * k} />
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: wPx, letterSpacing: "0.12em", lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>MATCHDAY</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ height: 14 * k }} />
        <div style={caps(18 * k, 0.5, 700, "rgba(255,255,255,.8)")}>{roundTitle(d)}</div>
        <div style={{ height: 14 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 8 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 2 · Crest window (matchday) — Pinterest Celtic crest circle, Sporting crest ================= */

/**
 * Janela do emblema (matchday): a light ground; his club's crest drawn huge as a window — its silhouette filled with
 * his big black-and-white portrait, edged in the club colour; the same player full-body in colour in front; the
 * competition and HOME X AWAY at the top; date · ground and the flags clock at the foot.
 */
export function Procrestwindow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const crest = d.club?.crestUrl;
  const fx = natFixture(d);
  const cs = 900 * k;
  const cx = W / 2;
  const cy = top + 140 * k + cs * 0.42;
  const vs = vsLines(d, 26 * k * ts, W - 2 * M, 15 * k);
  const p = frontFeet(d, 600, lt - 120 * k, 1100 * k / 1.3);
  const mask = (u: string): CSSProperties => ({ WebkitMaskImage: `url(${u})`, maskImage: `url(${u})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" });
  const box: CSSProperties = { position: "absolute", left: cx - cs / 2, top: cy - cs / 2, width: cs, height: cs };
  return (
    <Page d={d} bg="#f1f1ef" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #ffffff, #e9e9e6 70%)" }} />
      {crest && (
        <>
          <div style={{ ...box, background: t.ink, transform: "scale(1.04)", ...mask(crest) }} />
          <div style={{ ...box, ...mask(crest), background: shade(t.ink, -0.5), overflow: "hidden" }}>
            {s && (
              <div style={{ position: "absolute", left: -(cx - cs / 2), top: -(cy - cs / 2), width: W, height: H }}>
                <Portrait s={s} cx={W / 2} cy={cy - 40 * k} fh={260 * k} mode="bw" />
              </div>
            )}
          </div>
        </>
      )}
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={caps(18 * k, 0.4, 800, t.ink)}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
        <div style={{ height: 10 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#16181c"), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 140 * k, height: 104 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.92)", boxShadow: "0 10px 30px rgba(0,0,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain" }} />}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
          <FlagClock d={d} px={24 * k * ts} color="#16181c" gap={18 * k} />
          <div style={caps(15 * k * ts, 0.18, 700, t.ink)}>{dateVenue(d)}</div>
        </div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain" }} />}
      </div>
    </Page>
  );
}

/* ================= 3 · Text ring (matchday) — Pinterest Celtic ring of text ================= */

/**
 * Anel de texto (matchday): a deep club-colour ground; a big circle behind him with the fixture written round it as a
 * ring of tracked caps (HOME X AWAY · DATE · GROUND, repeated); MATCHDAY across the circle; him full-body in front;
 * crests and the flags clock at the foot.
 */
export function Proring({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const R = 420 * k;
  const cx = W / 2;
  const wTop = top + 20 * k;
  const wPx0 = Math.min(150 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const cy = wTop + wPx0 * 0.82 + 40 * k + R;
  const ring = [fx.homeName && fx.awayName ? `${fx.homeName} X ${fx.awayName}` : "", roundTitle(d), dateVenue(d)].filter(Boolean).join("  •  ").toUpperCase();
  const circ = 2 * Math.PI * (R - 26 * k);
  // The ring text as big as one pass round the circle allows (32px on a phone-sized story), repeated to close it.
  const one = ring + "  •  ";
  const fPx = Math.min(34 * k, circ / Math.max(1, one.length * 0.86));
  const reps = Math.max(1, Math.floor(circ / Math.max(1, one.length * fPx * 0.86)));
  const txt = Array.from({ length: reps }, () => one).join("");
  const p = frontFeet(d, 560, lt - 100 * k, 1020 * k / 1.3);
  const path = `M ${cx} ${cy - (R - 30 * k)} a ${R - 30 * k} ${R - 30 * k} 0 1 1 -0.01 0`;
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.65)} 80%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="pro-ring" d={path} />
        </defs>
        <circle cx={cx} cy={cy} r={R} fill={t.ink} />
        <circle cx={cx} cy={cy} r={R - 64 * k} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={2 * k} />
        <text style={{ fontFamily: SANS, fontWeight: 800, fontSize: fPx, letterSpacing: "0.12em" }} fill="#fff">
          <textPath href="#pro-ring">{txt}</textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx0, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap" }}>MATCHDAY</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 120 * k, height: 90 * k, borderRadius: 18 * k, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <FlagClock d={d} px={28 * k * ts} color="#fff" gap={22 * k} />
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
    </Page>
  );
}

/* ================= 4 · Type grid (matchday) — Pinterest "ARS VS AVL" editorial grid ================= */

/**
 * Grelha tipográfica (matchday): a light editorial ground split in two — a portrait column with his photo in black and
 * white on the left, and on the right a typographic grid of the fixture: HOME / VS / AWAY in huge condensed caps with
 * hairline rules, crests, the date, the ground and the flags clock in labelled cells; him full-body in colour in front.
 */
export function Protypegrid({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const colW = W * 0.42;
  const gx = colW + 30 * k;
  const gw = W - M - gx;
  const fl = fixtureLines(d, gw, 120 * k * ts, 40 * k);
  const rule = (y: number) => <div style={{ position: "absolute", left: gx, width: gw, top: y, height: 2 * k, background: "#16181c", opacity: 0.85 }} />;
  const cond: CSSProperties = { fontFamily: DISPLAY, fontSize: fl.px, lineHeight: 0.9, color: "#16181c", whiteSpace: "nowrap" };
  const nH = (fl.home.length + fl.away.length) * fl.px * 0.9 + fl.px * 0.5;
  const y0 = top + 80 * k;
  const label = (s0: string) => <div style={caps(13 * k, 0.24, 700, t.ink)}>{s0}</div>;
  const p = frontFeet(d, colW * 0.42, lt + 60 * k, 1080 * k / 1.3);
  return (
    <Page d={d} bg="#f2f1ec" light>
      <div style={{ position: "absolute", left: 0, top: 0, width: colW, height: H, background: "#2a2c30", overflow: "hidden" }}>
        {s && <Portrait s={s} cx={colW * 0.55} cy={top + 360 * k} fh={260 * k} mode="bw" opacity={0.8} />}
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: gx, top: top - 10 * k, ...caps(16 * k, 0.32, 800, t.ink) }}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
      {rule(y0 - 16 * k)}
      <div style={{ position: "absolute", left: gx, top: y0, display: "flex", flexDirection: "column" }}>
        {fl.home.map((l, i) => (
          <div key={"h" + i} style={cond}>{l}</div>
        ))}
        <div style={{ ...cond, fontSize: fl.px * 0.5, color: t.ink, margin: `${4 * k}px 0` }}>VS</div>
        {fl.away.map((l, i) => (
          <div key={"a" + i} style={cond}>{l}</div>
        ))}
      </div>
      {rule(y0 + nH + 24 * k)}
      <div style={{ position: "absolute", left: gx, top: y0 + nH + 44 * k, width: gw, display: "flex", gap: 16 * k }}>
        {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
          <img key={i} src={u!} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain" }} />
        ))}
      </div>
      {rule(y0 + nH + 144 * k)}
      <div style={{ position: "absolute", left: gx, top: y0 + nH + 164 * k, width: gw, display: "flex", flexDirection: "column", gap: 8 * k }}>
        {label("DATE · GROUND")}
        {lines3(dateVenue(d), 22 * k * ts, gw, 0.04, 14 * k).lines.map((l, i) => (
          <div key={i} style={caps(22 * k * ts, 0.04, 800, "#16181c")}>{l}</div>
        ))}
        <div style={{ height: 12 * k }} />
        {label("KICK-OFF")}
        <FlagClock d={d} px={30 * k * ts} color="#16181c" gap={10 * k} dir="column" />
      </div>
    </Page>
  );
}

/* ================= 5 · Polaroid (matchday) — liked04 VakifBank ghost portrait, Pinterest instant-photo cards ================= */

/**
 * Foto instantânea (matchday): a club-colour ground; one big tilted instant-photo print — white frame with his
 * black-and-white portrait, MATCHDAY handwritten-style in a serif italic on its wide foot; him full-body in colour in
 * front; HOME X AWAY, date · ground and the flags clock at the foot. One print only — no collage.
 */
export function Propolaroid({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const pw = 720 * k;
  const ph = 860 * k;
  const px0 = (W - pw) / 2;
  const py0 = top + 40 * k;
  const pad = 30 * k;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const footH = vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 16 * k + 26 * k * ts;
  const p = frontFeet(d, 760, lt - footH - 40 * k, 1150 * k / 1.3);
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 35%, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.45)} 80%)` }} />
      <div style={{ position: "absolute", left: px0, top: py0, width: pw, height: ph, background: "#fbfaf7", transform: "rotate(-4deg)", boxShadow: "0 30px 60px rgba(0,0,0,.4)" }}>
        <div style={{ position: "absolute", left: pad, top: pad, width: pw - 2 * pad, height: ph - 2 * pad - 140 * k, overflow: "hidden", background: "#333" }}>
          {s && (
            <div style={{ position: "absolute", left: -(px0 + pad), top: -(py0 + pad), width: W, height: H }}>
              <Portrait s={s} cx={W / 2} cy={py0 + 320 * k} fh={280 * k} mode="bw" />
            </div>
          )}
        </div>
        <div style={{ position: "absolute", left: pad, right: pad, bottom: 34 * k, fontFamily: DMSERIF, fontStyle: "italic", fontSize: 76 * k, lineHeight: 1, color: "#1b1d22", textAlign: "left" }}>Matchday</div>
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - footH - 90 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.55) 30%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 40 * k - footH, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <div style={{ height: 16 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 6 · Stadium sky (matchday) — Pinterest "Budapest 2026 final" stadium backdrop ================= */

/**
 * Céu do estádio (matchday): a real photo of the ground (the stadium images on record; else his own photo) graded
 * dusk-dark, with the type in the sky — MATCHDAY huge, the crests and HOME X AWAY under it; him full-body in front, sharp,
 * low in the frame; date · ground and the flags clock at the foot.
 */
export function Prostadium({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const stadium = d.club?.stadiumImages?.[0] ?? d.bgPhotoUrl ?? null;
  const p = stadium ? frontFeet(d, 560, lt + 90 * k, 1100 * k / 1.3) : null;
  const pn = stadium ? null : standAt(d, 560, 1100, 170);
  const wPx = Math.min(220 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const vs = vsLines(d, 26 * k * ts, W - 2 * M, 15 * k);
  return (
    <Page d={d} bg="#0b0d12">
      {stadium ? <img src={stadium} alt="" style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", filter: "contrast(1.1) saturate(.85) brightness(.7)" }} /> : pn && <NatGround place={pn} W={W} H={H} style={{ filter: "contrast(1.1) brightness(.75)" }} />}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(t.ink, -0.6)}f0 0%, ${shade(t.ink, -0.5)}aa 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 85%)` }} />
      {p ? <Front d={d} p={p} /> : pn && <NatFigure data={d} place={pn} W={W} H={H} clean />}
      <div style={{ position: "absolute", left: M, right: M, top: top + 10 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={caps(18 * k, 0.4, 800, "rgba(255,255,255,.8)")}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
        <div style={{ height: 14 * k }} />
        <div style={{ fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(0,0,0,.45)" }}>MATCHDAY</div>
        <div style={{ height: 20 * k }} />
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 76 * k, width: 76 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 30 * k, color: "#fff" }}>VS</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 76 * k, width: 76 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ height: 14 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{l}</div>
        ))}
        <div style={{ height: 8 * k }} />
        <div style={caps(17 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

