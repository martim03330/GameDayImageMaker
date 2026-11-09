/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { isoFromShortDate } from "@/lib/timezone";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, caps, clocksOf, dateVenue, portraitOf, shotBox, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure } from "./pro19";

/* Round 44 · new pro families (Pinterest "matchday poster minimal 2026", "soccer player graphic red"). */

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

/** The club's initial: the first letter of its most distinctive word (skipping SC / FC / CD / Desp. …). */
export function clubInitial(d: RenderData) {
  const skip = /^(sc|fc|cf|cd|ad|gd|ud|sl|ac|as|sd|cs|sk|fk|pfc|pfk|nk|kv|rc|rcd|club|clube|desp\.?|desportivo|sporting|associação|associacao|grupo|the|university|of|at)$/i;
  const words = ourClub(d).split(/\s+/).filter(Boolean);
  const w = words.find((x) => !skip.test(x) && /\p{L}/u.test(x)) ?? words[0] ?? "M";
  return [...w.normalize("NFC")][0].toUpperCase();
}

/* ================= 1 · Club initial (matchday) — Pinterest letter-clipped portraits ================= */

/**
 * Inicial do clube (matchday): his club's initial set giant across the canvas with his colour portrait held inside the
 * letter (a clip, the face sharp), a thin white outline on the letter; MATCHDAY and the round over it; the fixture card
 * at the foot.
 */
export function Proclubinitial({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const ch = clubInitial(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const lTop = top + 150 * k;
  const lH = ft - 60 * k - lTop;
  const px = Math.min(lH / 0.74, (W - 40 * k) / Math.max(0.1, wordW(ch, 1)));
  const base = lTop + px * 0.74;
  const b = s ? shotBox(s, W / 2, lTop + px * 0.3, px * 0.24) : null;
  // The letter carries a black-and-white fill of his photo; he stands in front of it in colour, so his face is never
  // cut by the letter's shape.
  const p = isCut(d) ? bustAt(d, 540, lTop + lH * 0.35, 110 * k) : stripFigure(d, 12, W - 12, ft - 30 * k, Math.min(1050 * k / 1.3, ft - 30 * k - lTop - 80 * k), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.65)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.8)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="pro-initial">
            <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }}>
              {ch}
            </text>
          </clipPath>
        </defs>
        <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill={t.ink}>
          {ch}
        </text>
        {s && b && <image href={s.url} x={b.left} y={b.top} width={b.width} height={b.height} preserveAspectRatio="none" clipPath="url(#pro-initial)" style={{ filter: "grayscale(1) contrast(1.1)", opacity: 0.55 }} />}
        <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke="#fff" strokeWidth={3 * k}>
          {ch}
        </text>
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 100 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 96 * k, textAlign: "center", ...caps(18 * k, 0.4, 800, "rgba(255,255,255,.85)") }}>{roundTitle(d)}</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 2 · Step through (matchday) — Pinterest Yamal "MATCH / DAY" ================= */

/**
 * Entre MATCH e DAY (matchday): MATCH and DAY stacked huge on a pale ground with a gap between them; him full-body
 * stepping through the gap in front of both words (his head overlaps only MATCH's foot, his feet DAY's top, the words
 * stay readable); the fixture and flags clock under DAY.
 */
export function Prostepthrough({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const px = Math.min(400 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCH", 1)));
  const y1 = top;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 14 * k);
  const infoH = vs.lines.length * vs.px * 1.2 + 90 * k;
  const y2 = lt - 40 * k - infoH - px * 0.86;
  const p = isCut(d) ? bustAt(d, 540, y1 + px * 0.86 + 80 * k, 110 * k) : stripFigure(d, 12, W - 12, y2 + px * 0.35, y2 + px * 0.35 - (y1 + px * 0.6), H * 0.4);
  return (
    <Page d={d} bg="#eeece7" light>
      <div style={{ position: "absolute", left: 0, right: 0, top: y1, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: "#16181c" }}>MATCH</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: y2, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: t.ink }}>DAY</div>
      <Front d={d} p={p} light />
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: M, top: y1 + px * 0.86 + 30 * k, height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", right: M, top: y1 + px * 0.86 + 30 * k, height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: y2 + px * 0.86 + 14 * k, padding: `${14 * k}px 0`, borderRadius: 14 * k, background: "rgba(238,236,231,.92)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#16181c")}>{l}</div>
        ))}
        <div style={caps(16 * k * ts, 0.14, 700, t.ink)}>{dateVenue(d)}</div>
        <FlagClock d={d} px={22 * k * ts} color="#16181c" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Horizon (matchday) — flat sunset posters ================= */

/**
 * Horizonte (matchday): a flat club-colour disc low on a horizon line (a solid circle, no glow), the sky above in a deep
 * club shade, the ground below darker; him full-body standing on the horizon in front of the disc; MATCHDAY at the top;
 * the fixture at the foot.
 */
export function Prohorizon({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const hy = ft - 120 * k;
  const R = 380;
  const sun = t.acc === "#ffffff" ? shade(t.ink, 0.35) : t.acc;
  const p = isCut(d) ? bustAt(d, 540, top + 520 * k, 120 * k) : stripFigure(d, 12, W - 12, hy + 20 * k, Math.min(1050 * k / 1.3, hy + 20 * k - top - 150 * k), H * 0.38);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: hy, background: `linear-gradient(180deg, ${shade(t.ink, -0.7)}, ${shade(t.ink, -0.25)})` }} />
      <div style={{ position: "absolute", left: W / 2 - R, top: hy - R * 1.25, width: 2 * R, height: 2 * R, borderRadius: "50%", background: sun, clipPath: `inset(0 0 ${2 * R - R * 1.25}px 0)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hy, bottom: 0, background: shade(t.ink, -0.82) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hy - 2 * k, height: 4 * k, background: "#fff" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 124 * k, textAlign: "center", ...caps(18 * k, 0.4, 800, "rgba(255,255,255,.85)") }}>{roundTitle(d)}</div>
      <FootCard d={d} top={ft} fill="rgba(0,0,0,.5)" />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 4 · A vs B (matchday) — Pinterest "FRANCE VS SPAIN" ================= */

/**
 * A vs B (matchday): the home name huge at the top and the away name huge at the bottom (exact, wrapped), a giant serif
 * italic "vs" across the middle; him full-body behind the "vs" (the "vs" in front of him); date · ground and the flags
 * clock in a strip.
 */
export function Proversus({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const hn = lines3(fx.homeName.toUpperCase(), 170 * k, W - 2 * M, 0, 60 * k);
  const an = lines3(fx.awayName.toUpperCase(), 170 * k, W - 2 * M, 0, 60 * k);
  const px = Math.min(hn.px, an.px, ...[...hn.lines, ...an.lines].map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const hH = hn.lines.length * px * 0.88;
  const aH = an.lines.length * px * 0.88;
  const infoTop = lt - 130 * k;
  const aTop = infoTop - 30 * k - aH;
  const hB = top + hH;
  const vy = (hB + aTop) / 2;
  const p = isCut(d) ? bustAt(d, 540, hB + 160 * k, 110 * k) : stripFigure(d, 12, W - 12, aTop + aH * 0.5, aTop + aH * 0.5 - hB + 40 * k, hB);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.8)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hn.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.88, color: "#fff", whiteSpace: "nowrap", textShadow: "0 8px 26px rgba(0,0,0,.35)" }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: vy - 130 * k, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: 260 * k, lineHeight: 1, color: t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.2), textShadow: "0 10px 30px rgba(0,0,0,.4)" }}>vs</div>
      <div style={{ position: "absolute", left: M, right: M, top: aTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {an.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.88, color: "#fff", whiteSpace: "nowrap", textShadow: "0 8px 26px rgba(0,0,0,.35)" }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: infoTop, height: 96 * k, borderRadius: 14 * k, background: "rgba(0,0,0,.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 * k }}>
        <div style={caps(16 * k * ts, 0.14, 700, "#fff")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={22 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 5 · Shirt back print (matchday) — Pinterest Chelsea "24" back-print ================= */

/**
 * Costas da camisola (matchday): a tall club-colour panel set like the back of his shirt — his surname tracked in caps
 * over his number set huge (pure type, no back photo); him full-body in colour in front of the panel's lower right;
 * MATCHDAY over the panel; the fixture card at the foot.
 */
export function Projersey({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const pl = M;
  const pw = W * 0.7;
  const pt = top + 140 * k;
  const pb = ft - 60 * k;
  const sPx = Math.min(90 * k, (pw - 80 * k) / Math.max(0.1, wordW(sur, 1) * 1.25));
  const nPx = Math.min(640 * k, (pw - 80 * k) / Math.max(0.1, wordW(num || "0", 1)));
  const fg = t.glow === "#ffffff" || t.acc === "#ffffff" ? "#fff" : t.acc;
  const p = isCut(d) ? bustAt(d, W * 0.72, pt + (pb - pt) * 0.5, 110 * k) : stripFigure(d, W * 0.45, W - 12, ft + 10 * k, Math.min(1050 * k / 1.3, ft + 10 * k - pt), H * 0.42);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.55)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", left: pl, top: pt, width: pw, height: pb - pt, borderRadius: `${60 * k}px ${60 * k}px ${24 * k}px ${24 * k}px`, background: `linear-gradient(180deg, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.25)})`, boxShadow: "0 24px 60px rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", left: pl, width: pw, top: pt + 70 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: sPx, lineHeight: 1, letterSpacing: "0.12em", color: fg }}>{sur}</div>
      {num && <div style={{ position: "absolute", left: pl, width: pw, top: pt + 90 * k + sPx, textAlign: "center", fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.86, color: fg }}>{num}</div>}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 6 · Week timeline (matchday) — weekly schedule stories ================= */

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/**
 * Semana (matchday): a vertical Mon–Sun timeline of the game's week down the left — each day with its date, muted, and
 * the game day picked out in a club-colour pill with MATCHDAY and the kick-off flags clock; him full-body on the right;
 * the fixture over the timeline.
 */
export function Proweekline({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const iso = isoFromShortDate(d.content.date);
  const g = iso ? new Date(`${iso}T12:00:00Z`) : null;
  const dow = g ? (g.getUTCDay() + 6) % 7 : -1;
  const days = DAYS.map((name, i) => {
    const dt = g ? new Date(g.getTime() + (i - dow) * 86400000) : null;
    return { name, n: dt ? dt.getUTCDate() : null, game: i === dow };
  });
  const colW = W * 0.5 - M;
  const vs = vsLines(d, 26 * k * ts, colW, 14 * k);
  const listTop = top + 40 * k + vs.lines.length * vs.px * 1.2 + 60 * k;
  const rowH = Math.min(150 * k, (lt - 60 * k - listTop) / 7.6);
  const hasClock = clocksOf(d).length > 0;
  const p = stripFigure(d, W * 0.5, W - 12, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - top), H * 0.4);
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.45)}, #0b0c10)` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, width: colW, display: "flex", flexDirection: "column", gap: 6 * k }}>
        <div style={caps(18 * k, 0.4, 800, t.glow)}>{roundTitle(d)}</div>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M + 14 * k, top: listTop, width: 3 * k, height: rowH * 7, background: "rgba(255,255,255,.25)" }} />
      {days.map((x, i) => (
        <div key={x.name} style={{ position: "absolute", left: M, top: listTop + i * rowH, height: rowH, width: x.game ? colW + 40 * k : colW, display: "flex", alignItems: "center", gap: 18 * k }}>
          <div style={{ width: 30 * k, height: 30 * k, borderRadius: "50%", background: x.game ? t.glow : "#2a2e36", border: `${3 * k}px solid ${x.game ? "#fff" : "rgba(255,255,255,.3)"}`, flexShrink: 0 }} />
          {x.game ? (
            <div style={{ flex: 1, background: t.ink, borderRadius: 16 * k, padding: `${12 * k}px ${18 * k}px`, display: "flex", flexDirection: "column", gap: 4 * k, boxShadow: "0 14px 34px rgba(0,0,0,.4)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 * k }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 56 * k, lineHeight: 1, color: "#fff" }}>{x.name}</div>
                {x.n != null && <div style={{ fontFamily: DISPLAY, fontSize: 56 * k, lineHeight: 1, color: "rgba(255,255,255,.7)" }}>{x.n}</div>}
              </div>
              <div style={caps(16 * k, 0.3, 900, "#fff")}>MATCHDAY</div>
              {hasClock && <FlagClock d={d} px={22 * k * ts} color="#fff" gap={14 * k} />}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 * k }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 40 * k, lineHeight: 1, color: "rgba(255,255,255,.45)" }}>{x.name}</div>
              {x.n != null && <div style={{ fontFamily: DISPLAY, fontSize: 40 * k, lineHeight: 1, color: "rgba(255,255,255,.3)" }}>{x.n}</div>}
            </div>
          )}
        </div>
      ))}
    </Page>
  );
}
