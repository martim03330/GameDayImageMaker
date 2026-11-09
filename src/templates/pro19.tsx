/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { isoFromShortDate } from "@/lib/timezone";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, frontAt, frontFeet, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";

/* Round 41 · new pro families (Pinterest "matchday graphic primeira liga", "football player poster duotone behance"). */

const W = CANVAS_W;

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

/** A dark rounded card behind the foot text, so it stays clear of his feet / a ball / a waist cut. */
function FootCard({ d, top, fill = "rgba(6,8,12,.72)" }: { d: RenderData; top: number; fill?: string }) {
  const { k } = frameOf(d);
  return <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: top - 22 * k, height: footH(d) + 44 * k, borderRadius: 18 * k, background: fill }} />;
}

/**
 * A bust / waist-cut photo placed big and fully visible: face centre at (cx, cy) and the face size chosen so that the
 * cut lands exactly on the canvas foot (frontAt would otherwise slide a short bust down and hide it behind the foot).
 */
export function bustAt(d: RenderData, cx: number, cy: number, fh0: number) {
  const { H } = frameOf(d);
  const p0 = frontAt(d, cx, cy, fh0);
  if (!p0.img) return p0;
  const below = p0.img.top + p0.img.height - p0.fy;
  return below > 0 ? frontAt(d, cx, cy, fh0 * ((H + 4 - cy) / below)) : p0;
}

/**
 * frontFeet, kept inside the canvas: a wide pose (a running stride) is scaled down until its box fits the width, then
 * slid sideways so no edge crops him.
 */
export function feetInside(d: RenderData, cx: number, feetY: number, bodyH: number, pad = 12, minLeft = pad) {
  let h = bodyH;
  let p = frontFeet(d, cx, feetY, h);
  if (!p.img) return p;
  // The free band he may use: [minLeft, W - pad]. Too wide for it → scale down; then slide inside it.
  const room = W - pad - minLeft;
  if (p.img.width > room) {
    h *= room / p.img.width;
    p = frontFeet(d, cx, feetY, h);
  }
  if (!p.img) return p;
  const over = p.img.left + p.img.width - (W - pad);
  const under = minLeft - p.img.left;
  return over > 0 ? frontFeet(d, cx - over, feetY, h) : under > 0 ? frontFeet(d, cx + under, feetY, h) : p;
}

/**
 * Greedy word-wrap at a fixed size (tracked caps in the UI sans), shrinking only when `maxLines` are not enough and
 * never below `min` — long names wrap onto more lines instead of shrinking to nothing.
 */
export function wrapCaps(text: string, max: number, w: number, maxLines: number, min: number, tracking = 0.04) {
  const est = (s: string, px: number) => [...s].length * px * (0.66 + tracking);
  const words = text.split(/\s+/).filter(Boolean);
  for (let px = max; px >= min; px -= 1) {
    const lines: string[] = [];
    let cur = "";
    for (const wd of words) {
      const t = cur ? `${cur} ${wd}` : wd;
      if (est(t, px) <= w || !cur) cur = t;
      else {
        lines.push(cur);
        cur = wd;
      }
    }
    if (cur) lines.push(cur);
    if (lines.length <= maxLines && lines.every((l) => est(l, px) <= w)) return { lines, px };
  }
  const px = min;
  const lines: string[] = [];
  let cur = "";
  for (const wd of words) {
    const t = cur ? `${cur} ${wd}` : wd;
    if (est(t, px) <= w || !cur) cur = t;
    else {
      lines.push(cur);
      cur = wd;
    }
  }
  if (cur) lines.push(cur);
  return { lines, px };
}

/**
 * His figure for a vertical strip [x0, x1]: the full body when the pose fits the strip; a wide pose (a running stride)
 * is not shrunk to fit — it is framed waist-up instead, big, with his head at `waistTop` and the legs running off the
 * canvas foot, so he keeps about half the height.
 */
export function stripFigure(d: RenderData, x0: number, x1: number, feetY: number, bodyH: number, waistTop: number, faceH?: number) {
  const { k } = frameOf(d);
  if ((d.cut?.bottom ?? 0) > 0) return bustAt(d, (x0 + x1) / 2, waistTop + 110 * k, 110 * k);
  const p = frontFeet(d, (x0 + x1) / 2, feetY, bodyH);
  if (!p.img) return p;
  if (p.img.width <= x1 - x0) {
    const over = p.img.left + p.img.width - x1;
    const under = x0 - p.img.left;
    return over > 0 ? frontFeet(d, (x0 + x1) / 2 - over, feetY, bodyH) : under > 0 ? frontFeet(d, (x0 + x1) / 2 + under, feetY, bodyH) : p;
  }
  const fh = faceH ?? 120 * k;
  return frontAt(d, (x0 + x1) / 2, waistTop + fh * 0.92, fh);
}

const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();

/* ================= 1 · Chevron (matchday) — Pinterest Doué / Ajax shape-framed portraits ================= */

/**
 * Chevron do clube (matchday): a deep ground; a giant downward club-colour chevron (a thick "V") with his colour portrait
 * held inside it, a thin white edge on the V; MATCHDAY above; the fixture and flags clock in a card at the foot.
 */
export function Prochevron({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const vt = top + 150 * k;
  const vb = ft - 60 * k;
  const pts = `0,${vt} ${W},${vt} ${W / 2},${vb}`;
  const clip = `polygon(0px ${vt}px, ${W}px ${vt}px, ${W / 2}px ${vb}px)`;
  const wPx = Math.min(130 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const fp = (d.cut?.bottom ?? 0) > 0 ? bustAt(d, W * 0.5, vt + (vb - vt) * 0.62, 70 * k) : feetInside(d, W * 0.5, ft - 30 * k, Math.min(760 * k / 1.3, (vb - vt) * 0.62));
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.55)}, ${shade(t.ink, -0.8)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={pts} fill={t.ink} />
      </svg>
      {s && <Portrait s={s} cx={W / 2} cy={vt + (vb - vt) * 0.3} fh={(vb - vt) * 0.26} mode="bw" opacity={0.9} style={{ clipPath: clip }} />}
      <div style={{ position: "absolute", inset: 0, clipPath: clip, background: `linear-gradient(to bottom, ${t.ink}00 30%, ${t.ink}cc)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={pts} fill="none" stroke="#fff" strokeWidth={5 * k} strokeLinejoin="miter" />
        <polygon points={`${W * 0.16},${vt} ${W * 0.84},${vt} ${W / 2},${vt + (vb - vt) * 0.68}`} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2 * k} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <Front d={d} p={fp} />
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 2 · Tricolour bands (matchday) — Pinterest Mbappé "équipe de France" bands ================= */

/**
 * Bandeira tricolor (matchday): three tall vertical bands in his kit's colours (club colour · white · accent / deep)
 * fading into a dark foot; him full-body in front at the centre band; his name letter-spaced under him, then the fixture
 * and flags clock.
 */
export function Protricolour({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const name = fullName(d);
  const nl = lines3(name.split("").join(" ").replace(/ {3}/g, "   "), 24 * k * ts, W - 2 * M, 0.3, 14 * k);
  const nameTop = ft - 30 * k - nl.lines.length * nl.px * 1.3;
  const third = t.acc === "#ffffff" ? shade(t.ink, -0.45) : t.acc;
  const bands = [t.ink, "#f2f1ec", third];
  const bw = 230 * k;
  const p = frontFeet(d, 540, nameTop - 50 * k, Math.min(1120 * k / 1.3, nameTop - 50 * k - top - 60 * k));
  return (
    <Page d={d} bg="#0b0d12">
      {bands.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: W / 2 - 1.5 * bw + i * bw, width: bw, top: top - 60 * k, height: nameTop - top + 60 * k, background: `linear-gradient(to bottom, ${c} 0%, ${c} 55%, ${c}00 100%)` }} />
      ))}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop - 40 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(11,13,18,0), #0b0d12 30%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: nameTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={{ ...caps(nl.px, 0.3, 800, "#fff"), whiteSpace: "pre", marginBottom: nl.px * 0.3 }}>{l}</div>
        ))}
      </div>
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Round medallion (matchday) — Pinterest "10" medallions / round badges ================= */

/**
 * Medalhão da jornada (matchday): a big club-colour medallion with the round number set huge in its centre and the
 * fixture running round its ring (exact names, sized to fit the circle); him full-body in front of its lower edge;
 * date · ground and the flags clock at the foot.
 */
export function Promedallion({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const num = mf.roundNo || (d.player.number || "").replace(/\D/g, "").slice(0, 2) || "VS";
  const R = 400;
  const cx = W / 2;
  const cy = top + 40 * k + R;
  const ring = `${fx.homeName}  ✕  ${fx.awayName}  ·  `.toUpperCase();
  const rr = R - 46 * k;
  const circ = 2 * Math.PI * rr;
  const fit1 = circ / Math.max(1, ring.length * 0.74);
  const twice = fit1 / 2 >= 26 * k;
  const rPx = Math.min(40 * k, twice ? fit1 / 2 : fit1);
  const path = `M ${cx} ${cy - rr} a ${rr} ${rr} 0 1 1 -0.01 0`;
  const nPx = Math.min(380 * k, (R * 1.15) / Math.max(0.1, wordW(num, 1)));
  const panelTop = lt - 40 * k - 70 * k - 20 * k * ts;
  const p = (d.cut?.bottom ?? 0) > 0 ? bustAt(d, 540, cy + R * 0.72, 110 * k) : frontFeet(d, 540, panelTop, Math.min(1050 * k / 1.3, panelTop - (cy + R * 0.25)));
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${shade(t.ink, -0.3)}, ${shade(t.ink, -0.8)} 75%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="pro-ring" d={path} />
        </defs>
        <circle cx={cx} cy={cy} r={R} fill={t.ink} stroke="#fff" strokeWidth={4 * k} />
        <circle cx={cx} cy={cy} r={R - 92 * k} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={2 * k} />
        <text style={{ fontFamily: SANS, fontWeight: 900, fontSize: rPx, letterSpacing: "0.08em" }} fill="#fff" dominantBaseline="central">
          <textPath href="#pro-ring">{twice ? ring + ring : ring}</textPath>
        </text>
        <text x={cx} y={cy - nPx * 0.08} textAnchor="middle" dominantBaseline="central" style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff">
          {num}
        </text>
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: panelTop - 10 * k, height: 70 * k + 20 * k * ts + 30 * k, borderRadius: 18 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 * k }}>
        <div style={caps(17 * k * ts, 0.14, 700, "#fff")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 4 · Split portrait (matchday) — Pinterest Ajax "MATCHDAY" close-up + full body ================= */

/**
 * Retrato duplo (matchday): the canvas split in two — on the left his colour close-up cropped by the seam, on the right a
 * club-colour panel with him full-body; MATCHDAY runs up the right edge; the fixture and flags clock in a card at the foot.
 */
export function Prosplitportrait({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const seam = W * 0.52;
  const vPx = Math.min(130 * k, (W - seam - 60 * k) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const p = frontFeet(d, seam + (W - seam) * 0.5, ft - 30 * k, Math.min(1000 * k / 1.3, ft - 30 * k - top - vPx - 60 * k));
  return (
    <Page d={d} bg="#0d0f13">
      {s && <Portrait s={s} cx={seam * 0.5} cy={top + 430 * k} fh={300 * k} mode="color" style={{ clipPath: `inset(0px ${W - seam}px 0px 0px)` }} />}
      <div style={{ position: "absolute", left: 0, width: seam, top: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,.75))" }} />
      <div style={{ position: "absolute", left: seam, right: 0, top: 0, bottom: 0, background: `linear-gradient(170deg, ${shade(t.ink, 0.05)}, ${shade(t.ink, -0.6)})` }} />
      <div style={{ position: "absolute", left: seam, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: vPx, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: seam, right: 0, top: top + vPx * 0.9 + 10 * k, textAlign: "center", ...caps(16 * k, 0.3, 800, "rgba(255,255,255,.85)") }}>{roundTitle(d)}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: seam - 3 * k, width: 6 * k, top: 0, bottom: 0, background: "#fff" }} />
      <FootCard d={d} top={ft} fill="rgba(6,8,12,.8)" />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 5 · Editorial pull-quote (matchday) — Pinterest editorial magazine posters ================= */

/**
 * Citação editorial (matchday): a warm paper ground; a big serif pull-quote of his role this season (“Central
 * midfielder, 2026/27.”) in italic with a giant open-quote mark in the club colour; attribution in tracked caps; him
 * full-body on the right; the fixture card at the foot.
 */
export function Proquote({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const iso = isoFromShortDate(d.content.date) || "";
  const y = Number(iso.slice(0, 4)) || new Date().getFullYear();
  const mo = Number(iso.slice(5, 7)) || 9;
  const sy = mo >= 7 ? y : y - 1;
  const season = `${sy}/${String((sy + 1) % 100).padStart(2, "0")}`;
  const pos = (d.player.position || "").trim();
  const role = pos ? pos.charAt(0).toUpperCase() + pos.slice(1).toLowerCase() : "Matchday";
  const quote = `${role}, ${season}.`;
  const qw = W * 0.6 - M;
  const qPx = Math.min(108 * k, qw / Math.max(1, Math.max(...quote.split(" ").map((w) => w.length)) * 0.5));
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const p = feetInside(d, 790, ft + 10 * k, 1120 * k / 1.3, 12, W * 0.5);
  return (
    <Page d={d} bg="#f2ede3" light>
      <div style={{ position: "absolute", left: M - 6 * k, top: top - 70 * k, fontFamily: DMSERIF, fontSize: 380 * k, lineHeight: 1, color: t.ink, opacity: 0.9 }}>“</div>
      <div style={{ position: "absolute", left: M, top: top + 170 * k, width: qw, fontFamily: DMSERIF, fontStyle: "italic", fontSize: qPx, lineHeight: 1.04, color: "#16181c" }}>{quote}</div>
      <div style={{ position: "absolute", left: M, top: top + 190 * k + qPx * 3.3, display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={{ width: 90 * k, height: 6 * k, background: t.ink }} />
        <div style={caps(20 * k * ts, 0.2, 800, "#16181c")}>{`— ${fullName(d)}${no ? ` · #${no}` : ""}`}</div>
        <div style={caps(16 * k, 0.3, 700, t.ink)}>{roundTitle(d)}</div>
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: ft - 16 * k, height: fh + 30 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.92)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
      <Foot d={d} top={ft} color="#16181c" sub={t.ink} />
    </Page>
  );
}

/* ================= 6 · Home vs away split (matchday) — Pinterest diagonal two-colour derby posters ================= */

/**
 * Casa e fora (matchday): the canvas cut on a diagonal — the upper-left in his club's colour with the home name running
 * up the left edge, the lower-right in near-black with the away name running down the right edge (exact, wrapped); both
 * crests on their side; him full-body across the cut; MATCHDAY, date and the flags clock at the top-right.
 */
export function Prokitsplit({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const ourHome = d.content.home !== false;
  const upC = ourHome ? t.ink : "#1b1e24";
  const loC = ourHome ? "#1b1e24" : t.ink;
  const yL = H * 0.78;
  const yR = H * 0.3;
  // One line along each edge when it fits at a readable size; wrapped (exact, never cut) only when it does not.
  const edge = (name: string, len: number) => {
    const one = Math.min(80 * k, len / Math.max(0.1, wordW(name, 1)));
    return one >= 34 * k ? { lines: [name], px: one } : lines3(name, 80 * k, len, 0.02, 30 * k);
  };
  const hn = edge(fx.homeName.toUpperCase(), yL - 60 * k - (top + 120 * k));
  const an = edge(fx.awayName.toUpperCase(), lt - 40 * k - (yR + 60 * k));
  const nPx = Math.min(hn.px, an.px);
  const p = (d.cut?.bottom ?? 0) > 0 ? bustAt(d, 540, top + 520 * k, 110 * k) : frontFeet(d, 540, lt + 40 * k, 1150 * k / 1.3);
  const vLine = (lines: string[], x: number, y: number, rot: number, anchor: "start" | "end") => (
    <text transform={`translate(${x} ${y}) rotate(${rot})`} textAnchor={anchor} style={{ fontFamily: DISPLAY, fontSize: nPx }} fill="#fff" fillOpacity={0.92}>
      {lines.map((l, i) => (
        <tspan key={i} x={0} dy={i === 0 ? 0 : nPx * 1.08}>{l}</tspan>
      ))}
    </text>
  );
  return (
    <Page d={d} bg={loC}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`0,0 ${W},0 ${W},${yR} 0,${yL}`} fill={upC} />
        <line x1={0} y1={yL} x2={W} y2={yR} stroke="#fff" strokeWidth={5 * k} />
      </svg>
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: M + nPx * 1.3 + (hn.lines.length - 1) * nPx, top: yL - 300 * k, height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", right: M + nPx * 1.3 + (an.lines.length - 1) * nPx, top: yR + 180 * k, height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <Front d={d} p={p} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {vLine(hn.lines, M + nPx * 0.8, yL - 60 * k, -90, "start")}
        {vLine(an.lines, W - M - nPx * 0.8 - (an.lines.length - 1) * nPx * 1.08, yR + 60 * k, 90, "start")}
      </svg>
      <div style={{ position: "absolute", right: M, top, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 * k }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 96 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        <div style={caps(17 * k * ts, 0.14, 700, "#fff")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}
