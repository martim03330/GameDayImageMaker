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
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, frontFeet, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt } from "./pro19";

/* Round 40 · new pro families (Pinterest "football player poster editorial", "soccer win graphic college"). */

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

/* ================= 1 · Sliced number (matchday) — Pinterest Pogba "6" sliced numeral ================= */

/**
 * Número fatiado (matchday): a deep club-colour ground; his shirt number giant behind him, cut into five horizontal
 * slices shifted left and right; him full-body in front; MATCHDAY, the fixture and flags clock at the foot.
 */
export function Proslicednum({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || matchFacts(d).roundNo || "1";
  const fh = footH(d) + 90 * k;
  const ft = lt - 40 * k - fh;
  const nTop = top;
  const nH = ft - 40 * k - nTop;
  const px = Math.min(nH / 0.8, (W - 2 * M) / Math.max(0.1, wordW(num, 1)));
  const n = 5;
  const sh = (px * 0.8) / n;
  const shifts = [-40, 30, -20, 45, -30].map((v) => v * k);
  const p = frontFeet(d, 560, ft + 10 * k, 1150 * k / 1.3);
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, 0.05)}, ${shade(t.ink, -0.7)})` }} />
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: shifts[i], right: -shifts[i], top: nTop + i * sh, height: sh - 6 * k, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: -i * sh, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.8, color: "rgba(255,255,255,.9)", whiteSpace: "nowrap" }}>{num}</div>
        </div>
      ))}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 80 * k, bottom: 0, background: `linear-gradient(to bottom, transparent, ${shade(t.ink, -0.75)} 35%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft, textAlign: "center", fontFamily: DISPLAY, fontSize: 70 * k, lineHeight: 1, color: "#fff" }}>MATCHDAY</div>
      <Foot d={d} top={ft + 90 * k} />
    </Page>
  );
}

/* ================= 2 · Glossy floor (matchday) — Pinterest studio posters with a reflection ================= */

/**
 * Chão espelhado (matchday): a dark studio; him full-body standing on a glossy floor, his mirror image fading out below
 * his feet (a flipped copy under a gradient mask — never blurred); MATCHDAY in serif at the top with crests; the fixture
 * and flags clock at the foot.
 */
export function Proreflect({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const floor = ft - 190 * k;
  const cut = (d.cut?.bottom ?? 0) > 0;
  // A bust / waist cut has no feet to stand on the floor: show him big from the chest up (the cut slides below the
  // canvas), no reflection, no scrim — the fixture sits in a compact card instead.
  const p = cut ? bustAt(d, 540, top + 430 * k, 125 * k) : frontFeet(d, 540, floor, Math.min(980 * k / 1.3, floor - top - 170 * k));
  const img = p.img;
  return (
    <Page d={d} bg="#08090c">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${shade(t.ink, -0.35)}, #07080a 70%)` }} />
      {!cut && <div style={{ position: "absolute", left: 0, right: 0, top: floor, bottom: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.55)}, #050608)` }} />}
      {img && p.shot && !cut && (
        <img
          src={p.shot.url}
          alt=""
          style={{ position: "absolute", left: img.left, top: img.top, width: img.width, height: img.height, maxWidth: "none", transform: "scaleY(-1)", transformOrigin: `50% ${floor - img.top}px`, opacity: 0.4, WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0) ${Math.max(0, floor - img.top - 260 * k)}px, #000 ${floor - img.top}px)`, maskImage: `linear-gradient(to bottom, rgba(0,0,0,0) ${Math.max(0, floor - img.top - 260 * k)}px, #000 ${floor - img.top}px)` }}
        />
      )}
      {!cut && <div style={{ position: "absolute", left: 0, right: 0, top: floor - 1, height: 2 * k, background: "rgba(255,255,255,.18)" }} />}
      <Front d={d} p={p} />
      {cut ? (
        <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: ft - 22 * k, height: fh + 44 * k, borderRadius: 18 * k, background: "rgba(5,6,8,.72)" }} />
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: ft - 90 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(5,6,8,0), rgba(5,6,8,.92) 40%)" }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ fontFamily: DMSERIF, fontSize: 110 * k, lineHeight: 1, color: "#fff" }}>Matchday</div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Type arc (matchday) — Pinterest Celtic "Bodø/Glimt vs Celtic" arc ================= */

/**
 * Arco de texto (matchday): a club-colour ground; HOME X AWAY set on a wide arc over his head in tracked caps, the round
 * small under the arc; him full-body in front; date · ground and the flags clock at the foot.
 */
export function Proarc({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const txt = (roundTitle(d) || "Matchday").toUpperCase();
  const vs = vsLines(d, 24 * k * ts, W - 2 * M - 40 * k, 14 * k);
  const R = 420;
  const cx = W / 2;
  const cy = top + 60 * k + R;
  const arcLen = Math.PI * R * 0.9;
  const fPx = Math.min(96 * k, arcLen / Math.max(1, txt.length * 0.85));
  const path = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const panelH = 90 * k + vs.lines.length * vs.px * 1.2;
  const p = frontFeet(d, 540, lt - 150 * k, Math.min(1080 * k / 1.3, lt - 150 * k - cy + R - 2 * fPx));
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${shade(t.ink, 0.12)}, ${shade(t.ink, -0.55)} 80%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="pro-arc" d={path} />
        </defs>
        <circle cx={cx} cy={cy} r={R + 40 * k} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={2 * k} />
        <text textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 900, fontSize: fPx, letterSpacing: "0.06em" }} fill="#fff">
          <textPath href="#pro-arc" startOffset="50%">
            {txt}
          </textPath>
        </text>
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 40 * k - panelH, height: panelH, borderRadius: 18 * k, background: "rgba(0,0,0,.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 * k }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(17 * k * ts, 0.14, 700, "#fff")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 4 · Line-up mini pitch (matchday) — clean data-driven line-up cards ================= */

const SPOT: { re: RegExp; x: number; y: number; tag: string }[] = [
  { re: /goal|keeper|gk|guarda|portero/i, x: 0.5, y: 0.92, tag: "GK" },
  { re: /centre.?back|center.?back|central def|cb|zagueiro|defesa central/i, x: 0.5, y: 0.76, tag: "CB" },
  { re: /left.?back|lb|lateral esq/i, x: 0.15, y: 0.72, tag: "LB" },
  { re: /right.?back|rb|lateral dir/i, x: 0.85, y: 0.72, tag: "RB" },
  { re: /def/i, x: 0.5, y: 0.76, tag: "DF" },
  { re: /defensive mid|dm|trinco|volante/i, x: 0.5, y: 0.6, tag: "DM" },
  { re: /attacking mid|am|10/i, x: 0.5, y: 0.38, tag: "AM" },
  { re: /left.?wing|lw|extremo esq/i, x: 0.18, y: 0.3, tag: "LW" },
  { re: /right.?wing|rw|extremo dir/i, x: 0.82, y: 0.3, tag: "RW" },
  { re: /wing|extremo/i, x: 0.82, y: 0.3, tag: "W" },
  { re: /mid|médio|medio/i, x: 0.5, y: 0.5, tag: "CM" },
  { re: /forward|striker|st|cf|avançado|ponta/i, x: 0.5, y: 0.16, tag: "ST" },
];

/**
 * Ficha de alinhamento (matchday): a dark ground; a clean vertical mini pitch in white lines on the right with a
 * club-colour dot at his position (from his profile; the centre when unknown) and his number; him full-body on the
 * left; his name and position, MATCHDAY, HOME X AWAY and the flags clock at the top-left.
 */
export function Prolineup({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const pos = d.player.position || "";
  const spot = SPOT.find((s) => s.re.test(pos)) ?? { x: 0.5, y: 0.5, tag: "" };
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const pw = 380 * k;
  const ph = 560 * k;
  const px0 = W - M - pw;
  const py0 = lt - 60 * k - ph;
  const vs = vsLines(d, 22 * k * ts, W - 2 * M, 14 * k);
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nl = lines3(name, 44 * k * ts, W * 0.55, 0.02, 24 * k);
  const p = frontFeet(d, 330, lt + 40 * k, 1200 * k / 1.3);
  const lw = 3 * k;
  return (
    <Page d={d} bg="#0e1014">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.35)}, #0b0c0f)` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={caps(18 * k, 0.4, 800, t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.3))}>{roundTitle(d)}</div>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
        {pos && <div style={caps(18 * k, 0.24, 700, "rgba(255,255,255,.75)")}>{pos.toUpperCase()}</div>}
        <div style={{ height: 14 * k }} />
        {vs.lines.map((l, i) => (
          <div key={"v" + i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(16 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <div style={{ height: 6 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={px0} y={py0} width={pw} height={ph} rx={10 * k} fill={shade(t.ink, -0.5)} fillOpacity={0.85} stroke="#fff" strokeOpacity={0.85} strokeWidth={lw} />
        <line x1={px0} y1={py0 + ph / 2} x2={px0 + pw} y2={py0 + ph / 2} stroke="#fff" strokeOpacity={0.85} strokeWidth={lw} />
        <circle cx={px0 + pw / 2} cy={py0 + ph / 2} r={56 * k} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={lw} />
        <rect x={px0 + pw * 0.22} y={py0} width={pw * 0.56} height={ph * 0.15} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={lw} />
        <rect x={px0 + pw * 0.22} y={py0 + ph * 0.85} width={pw * 0.56} height={ph * 0.15} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={lw} />
        <circle cx={px0 + pw * spot.x} cy={py0 + ph * spot.y} r={34 * k} fill={t.glow} stroke="#fff" strokeWidth={4 * k} />
        <text x={px0 + pw * spot.x} y={py0 + ph * spot.y + 12 * k} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: 34 * k }} fill="#fff">
          {no || spot.tag}
        </text>
      </svg>
    </Page>
  );
}

/* ================= 5 · Crests as half-circles (matchday) — Pinterest two-crest split posters ================= */

/**
 * Meios emblemas (matchday): two giant half-discs meeting at a vertical seam — the left in the home club's colour with
 * the home crest huge and cut by the seam, the right in charcoal with the away crest; him full-body in front at the seam;
 * MATCHDAY at the top and the fixture at the foot.
 */
export function Prohalfcrests({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const R = 470 * k;
  const cy = top + 180 * k + R;
  const p = frontFeet(d, 540, ft + 10 * k, 1080 * k / 1.3);
  const ourHome = d.content.home !== false;
  const leftC = ourHome ? t.ink : "#2a2d33";
  const rightC = ourHome ? "#2a2d33" : t.ink;
  const half = (left: boolean, c: string | null, col: string) => (
    <div style={{ position: "absolute", left: left ? W / 2 - R : W / 2, top: cy - R, width: R, height: 2 * R, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: left ? 0 : -R, top: 0, width: 2 * R, height: 2 * R, borderRadius: "50%", background: col, display: "flex", alignItems: "center", justifyContent: left ? "flex-start" : "flex-end" }}>
        {c && <img src={c} alt="" style={{ width: R * 0.9, height: R * 0.9, objectFit: "contain", margin: `0 ${R * 0.12}px`, opacity: 0.9 }} />}
      </div>
    </div>
  );
  return (
    <Page d={d} bg="#0f1115">
      {half(true, fx.homeCrest, leftC)}
      {half(false, fx.awayCrest, rightC)}
      <div style={{ position: "absolute", left: W / 2 - 3 * k, top: cy - R - 30 * k, width: 6 * k, height: 2 * R + 60 * k, background: "#fff" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 1, color: "#fff" }}>MATCHDAY</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 80 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.8) 35%)" }} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 6 · Serif date hero (matchday) — Pinterest "15.06.69" / editorial date posters ================= */

const DOW = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Data em destaque (matchday): a warm paper ground; the date set huge in a serif — the day number giant, the month in
 * italic, the weekday tracked — over a club-colour rule; his big portrait on the right; him full-body in front; the
 * fixture and flags clock at the foot.
 */
export function Prodatehero({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const iso = isoFromShortDate(d.content.date);
  const day = iso ? String(Number(iso.slice(8, 10))) : "";
  const month = iso ? MONTH[Number(iso.slice(5, 7)) - 1] : "";
  const dow = iso ? DOW[new Date(`${iso}T12:00:00Z`).getUTCDay()] : "";
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const mPx = Math.min(110 * k, (W * 0.5 - M) / Math.max(1, month.length * 0.48));
  const p = frontFeet(d, 760, ft + 10 * k, 1100 * k / 1.3);
  return (
    <Page d={d} bg="#f3eee4" light>
      {s && <Portrait s={s} cx={W * 0.72} cy={top + 360 * k} fh={260 * k} mode="bw" opacity={0.35} fade={45} />}
      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column" }}>
        <div style={caps(20 * k, 0.4, 800, t.ink)}>{dow}</div>
        <div style={{ fontFamily: DMSERIF, fontSize: 420 * k, lineHeight: 0.86, color: "#16181c" }}>{day || "—"}</div>
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: mPx, lineHeight: 1, color: t.ink }}>{month}</div>
        <div style={{ width: 360 * k, height: 8 * k, background: t.ink, marginTop: 24 * k }} />
        <div style={{ ...caps(18 * k, 0.3, 800, "#16181c"), marginTop: 18 * k }}>{roundTitle(d)}</div>
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft + fh, bottom: 0, background: "linear-gradient(to bottom, rgba(243,238,228,0), #f3eee4 45%)" }} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: ft - 16 * k, height: fh + 30 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.92)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
      <Foot d={d} top={ft} color="#16181c" sub={t.ink} />
    </Page>
  );
}
