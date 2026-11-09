/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { standAt, wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, caps, clocksOf, dateVenue, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure } from "./pro19";

/* Round 45 · new pro families (Pinterest "matchday poster 2026 behance", "final score poster design"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;

function Foot({ d, top, color = "#fff", sub = "rgba(255,255,255,.88)" }: { d: RenderData; top: number; color?: string; sub?: string }) {
  const { k, ts } = frameOf(d);
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {vs.lines.map((l, i) => (
        <div key={i} style={{ ...caps(vs.px, 0.04, 900, color), marginBottom: 6 * k }}>{l}</div>
      ))}
      <div style={{ height: 6 * k }} />
      <div style={caps(17 * k * ts, 0.14, 600, sub)}>{dateVenue(d)}</div>
      <div style={{ height: 14 * k }} />
      <FlagClock d={d} px={26 * k * ts} color={color} gap={22 * k} />
    </div>
  );
}

function FootCard({ d, top, fill = "rgba(6,8,12,.74)" }: { d: RenderData; top: number; fill?: string }) {
  const { k } = frameOf(d);
  return <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: top - 22 * k, height: footH(d) + 44 * k, borderRadius: 18 * k, background: fill }} />;
}

/* ================= 1 · Letterbox (matchday) — cinema-bar posters ================= */

/**
 * Cinema (matchday): his real photo with its own surroundings in a wide letterbox band across the middle, black cinema
 * bars above and below; MATCHDAY and the round in the top bar, the fixture, date · ground and flags clock in the bottom
 * bar.
 */
export function Proletterbox({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const barT = top + 170 * k;
  const barB = lt - 70 * k - fh;
  const p = standAt(d, 540, barT + (barB - barT) * 0.3, 160);
  // Fixed cinema bars. A photo whose face sits high is shifted down inside the band (not cut): his head always lands
  // inside it; any gap the shift opens at the band's top edge falls into the black bar colour.
  const shift = Math.max(0, barT + p.fs * 1.9 - p.fy);
  return (
    <Page d={d} bg="#050505">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${barT}px 0px ${H - barB}px 0px)` }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}>
          <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.06) saturate(1.05)" }} />
          <NatFigure data={d} place={p} W={W} H={H} clean />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: barT - 2 * k, height: 2 * k, background: "rgba(255,255,255,.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: barB, height: 2 * k, background: "rgba(255,255,255,.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 0.9, color: "#fff", letterSpacing: "0.06em" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 116 * k, textAlign: "center", ...caps(18 * k, 0.5, 800, "rgba(255,255,255,.8)") }}>{roundTitle(d)}</div>
      <Foot d={d} top={barB + 40 * k} />
    </Page>
  );
}

/* ================= 2 · Name column (matchday) — Pinterest "ESTORIL" vertical-name column ================= */

/**
 * Coluna do nome (matchday): a narrow club-colour column down the left with his surname running up it huge in white;
 * his real photo with its own surroundings filling the rest; MATCHDAY over the photo; the fixture card at the foot.
 */
export function Procolumnname({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const cw = W * 0.22;
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const len = H - 2 * 60 * k;
  const nPx = Math.min(cw * 0.9, len / Math.max(0.1, wordW(sur, 1)));
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = standAt(d, cw + (W - cw) * 0.5, 760, 175);
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px 0px ${cw}px)` }}>
        <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.06) brightness(.9)" }} />
        <NatFigure data={d} place={p} W={W} H={H} clean />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,.7))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: cw, background: t.ink }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={cw / 2} y={H / 2} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cw / 2} ${H / 2})`} style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff">
          {sur}
        </text>
      </svg>
      {/* MATCHDAY sits in the foot card, never over his head (a high face would collide with a top title). */}
      <div style={{ position: "absolute", left: cw + 16 * k, right: 16 * k, top: ft - 150 * k, height: fh + 172 * k, borderRadius: 18 * k, background: "rgba(6,8,12,.76)" }} />
      <div style={{ position: "absolute", left: cw, right: 0, top: ft - 130 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: 96 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: cw + 30 * k, right: 30 * k, top: ft, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
        {vsLines(d, 22 * k * frameOf(d).ts, W - cw - 80 * k, 13 * k).lines.map((l, i) => (
          <div key={i} style={caps(vsLines(d, 22 * k * frameOf(d).ts, W - cw - 80 * k, 13 * k).px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(15 * k * frameOf(d).ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * frameOf(d).ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Zigzag versus (matchday) — two-colour split posters ================= */

/**
 * Ziguezague (matchday): the canvas split into his club's colour and a near-black half meeting in a clean vertical
 * zigzag seam (with a thin white edge); each crest on its side; him full-body in front at the seam; MATCHDAY at the top;
 * the fixture at the foot.
 */
export function Prozigzag({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const ourHome = d.content.home !== false;
  const lc = ourHome ? t.ink : "#1b1e24";
  const rc = ourHome ? "#1b1e24" : t.ink;
  const n = 9;
  const amp = 70 * k;
  const pts = Array.from({ length: n + 1 }, (_, i) => `${W / 2 + (i % 2 ? amp : -amp)},${(i * H) / n}`);
  const left = `0,0 ${pts.join(" ")} 0,${H}`;
  const p = isCut(d) ? bustAt(d, 540, top + 500 * k, 120 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1150 * k / 1.3, ft + 10 * k - top - 140 * k), H * 0.4);
  return (
    <Page d={d} bg={rc}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={left} fill={lc} />
        <polyline points={pts.join(" ")} fill="none" stroke="#fff" strokeWidth={4 * k} strokeLinejoin="miter" />
      </svg>
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: M, top: top + 200 * k, height: 170 * k, width: 170 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", right: M, top: top + 200 * k, height: 170 * k, width: 170 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 0.9, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.35)" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 4 · Shield number (matchday) — crest-shaped round badges ================= */

/**
 * Escudo da jornada (matchday): a big plain shield shape (the classic crest outline) in his club's colour with a white
 * rim, the round number set huge inside it (his shirt number when no round); him full-body in front of its foot;
 * MATCHDAY over it; the fixture card at the foot.
 */
export function Proshield({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const mf = matchFacts(d);
  const num = mf.roundNo || (d.player.number || "").replace(/\D/g, "").slice(0, 2) || "";
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const sw = 640;
  const sx = (W - sw) / 2;
  const sy = top + 150 * k;
  const sh = sw * 1.15;
  const path = `M ${sx} ${sy} L ${sx + sw} ${sy} L ${sx + sw} ${sy + sh * 0.52} Q ${sx + sw} ${sy + sh * 0.85} ${sx + sw / 2} ${sy + sh} Q ${sx} ${sy + sh * 0.85} ${sx} ${sy + sh * 0.52} Z`;
  const nPx = Math.min(520 * k, (sw * 0.8) / Math.max(0.1, wordW(num || "0", 1)));
  const p = isCut(d) ? bustAt(d, 540, sy + sh * 0.75, 110 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1000 * k / 1.3, ft + 10 * k - (sy + sh * 0.35)), sy + sh * 0.45);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 35%, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.85)} 75%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill={t.ink} stroke="#fff" strokeWidth={8 * k} />
        <path d={path} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2 * k} transform={`translate(${sw * 0.04 + sx * 0.08} ${sh * 0.04 + sy * 0.08}) scale(0.92)`} />
        {num && (
          <text x={W / 2} y={sy + sh * 0.43} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff">
            {num}
          </text>
        )}
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 5 · Drop cap (matchday) — editorial magazine openers ================= */

/**
 * Capitular (matchday): a warm paper ground set like a magazine opener — a giant serif drop cap of his first initial in
 * the club colour and, beside and under it, the fixture written as a short paragraph (who, against whom, where, when,
 * kick-off — all from the data); him full-body in colour on the right.
 */
export function Prodropcap({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ");
  const cap = [...(name || ourClub(d))][0]?.toUpperCase() || "M";
  const club = ourClub(d);
  const opp = club.toLowerCase() === fx.awayName.toLowerCase() ? fx.homeName : fx.awayName;
  const venue = (d.content.venue || "").trim();
  const date = mf.longDate ? mf.longDate.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()) : "";
  const clocks = clocksOf(d).map((c) => c.time + (c.tag ? ` ${c.tag}` : "")).join(" · ");
  // Short, clean English lines built from the data — his full name is never split; the drop cap is a separate ornament.
  const line1 = `${club} v ${opp}.`;
  const line2 = [venue, date].filter(Boolean).join(", ");
  const line3 = clocks ? `Kick-off ${clocks}.` : "";
  const colW = W * 0.6 - M;
  const cPx = 330 * k;
  const nl = lines3(name.toUpperCase(), 44 * k * ts, colW, 0.02, 22 * k);
  const tTop = top + 60 * k + cPx * 0.78 + 30 * k;
  const p = isCut(d) ? bustAt(d, W * 0.78, top + 560 * k, 110 * k) : stripFigure(d, W * 0.52, W - 12, lt + 30 * k, Math.min(1250 * k / 1.3, lt + 30 * k - top - 100 * k), H * 0.4);
  return (
    <Page d={d} bg="#f2ede3" light>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, top, ...caps(18 * k, 0.4, 800, t.ink) }}>{`MATCHDAY · ${roundTitle(d)}`.replace(/MATCHDAY · MATCHDAY/, "MATCHDAY")}</div>
      <div style={{ position: "absolute", left: M, top: top + 40 * k, width: cPx * 0.82, height: cPx * 0.82, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DMSERIF, fontSize: cPx * 0.7, lineHeight: 1, color: "#f2ede3" }}>{cap}</div>
      <div style={{ position: "absolute", left: M, top: tTop, width: colW, display: "flex", flexDirection: "column", gap: 10 * k }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#16181c")}>{l}</div>
        ))}
        <div style={{ width: 90 * k, height: 5 * k, background: t.ink, margin: `${8 * k}px 0` }} />
        <div style={{ fontFamily: DMSERIF, fontSize: 44 * k * ts, lineHeight: 1.2, color: "#16181c" }}>{line1}</div>
        {line2 && <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 34 * k * ts, lineHeight: 1.25, color: "#33363c" }}>{line2}</div>}
        {line3 && <div style={{ fontFamily: DMSERIF, fontSize: 34 * k * ts, lineHeight: 1.25, color: t.ink }}>{line3}</div>}
      </div>
    </Page>
  );
}

/* ================= 6 · Chevron stack (matchday) — club-stripe chevron posters ================= */

/**
 * Riscas em chevron (matchday): flat chevron stripes in his club's colours stacked down the canvas (wide V bands —
 * pure shape, no arrows); him full-body in front; MATCHDAY at the top in a dark band; the fixture card at the foot.
 */
export function Prochevronstack({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const bandH = 130 * k;
  const drop = 260 * k;
  const cols = [t.ink, shade(t.ink, -0.35), shade(t.ink, 0.25), shade(t.ink, -0.55)];
  const n = Math.ceil((H + drop) / bandH) + 1;
  const p = isCut(d) ? bustAt(d, 540, top + 520 * k, 120 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1150 * k / 1.3, ft + 10 * k - top - 150 * k), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n }, (_, i) => {
          const y = -drop + i * bandH;
          return <polygon key={i} points={`0,${y} ${W / 2},${y + drop} ${W},${y} ${W},${y + bandH} ${W / 2},${y + drop + bandH} 0,${y + bandH}`} fill={cols[i % cols.length]} />;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,.6))" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 20 * k, height: 150 * k, background: "rgba(6,8,12,.72)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 104 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        <div style={caps(16 * k, 0.4, 800, "rgba(255,255,255,.85)")}>{roundTitle(d)}</div>
      </div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

