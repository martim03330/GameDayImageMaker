/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { instantIn, isoFromShortDate, PORTUGAL_TZ, venueZone } from "@/lib/timezone";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
import { NatGround, natFixture } from "./natkit";
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
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, feetInside } from "./pro19";

/* Round 42 · new pro families (Pinterest "matchday poster championship league", "football graphic design editorial 2026"). */

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

/* ================= 1 · Frosted glass bars (matchday) — Pinterest "glass" matchday posters ================= */

/**
 * Vidro fosco (matchday): his big colour portrait on a deep club ground, crossed by horizontal tinted glass bars (flat
 * tinted overlays with a bright top edge — no blur anywhere) that skip the band of his face, so it stays clean and
 * sharp; MATCHDAY and the round over the bars; the fixture card at the foot.
 */
export function Proglassbars({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const wPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const pfh = 260 * k;
  const pcy = top + wPx + 90 * k + pfh * 1.05;
  // The face band stays clear of glass: bars run the full height above and below it.
  const free: [number, number] = [pcy - pfh * 1.0, pcy + pfh * 0.7];
  const barH = 58 * k;
  const gap = 26 * k;
  const bars: number[] = [];
  for (let y = 0; y < H; y += barH + gap) if (y + barH < free[0] || y > free[1]) bars.push(y);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.8)})` }} />
      {s && <Portrait s={s} cx={W / 2} cy={pcy} fh={pfh} mode="color" />}
      {bars.map((y, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: barH, background: `linear-gradient(90deg, ${t.ink}d9, ${shade(t.ink, 0.3)}99 50%, ${t.ink}d9)`, borderTop: `${2 * k}px solid rgba(255,255,255,.4)`, boxShadow: `inset 0 -${3 * k}px 0 ${shade(t.ink, -0.5)}66` }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: free[0] - 2, height: 4 * k, background: "#fff", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: free[1], height: 4 * k, background: "#fff", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.9, color: "#fff", textShadow: `0 6px 0 ${shade(t.ink, -0.6)}` }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + wPx * 0.92 + 8 * k, textAlign: "center", ...caps(20 * k, 0.4, 800, "#fff") }}>{roundTitle(d)}</div>
      <FootCard d={d} top={ft} fill={`${shade(t.ink, -0.75)}e6`} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 2 · Giant club word (matchday) — Pinterest "BENFICA" / "BRAGA" name-behind posters ================= */

/**
 * Nome do clube gigante (matchday): his club's exact name set giant in stacked caps across the top in a lighter club
 * shade (wrapped, never cut); him full-body in front with his head kept below the word block (type never sits behind his
 * face); the fixture and flags clock at the foot.
 */
export function Proclubword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const word = ourClub(d).toUpperCase();
  const wl = lines3(word, 300 * k, W - 2 * M, 0, 110 * k);
  const px = Math.min(wl.px, ...wl.lines.map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const blockB = top + wl.lines.length * px * 0.86;
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = isCut(d) ? bustAt(d, 540, blockB + 200 * k, 120 * k) : feetInside(d, 540, ft - 20 * k, Math.min(1150 * k / 1.3, ft - 20 * k - (blockB - px * 0.2)));
  return (
    <Page d={d} bg={shade(t.ink, -0.5)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.75)})` }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {wl.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: shade(t.ink, 0.35), whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
      <Front d={d} p={p} />
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Programme cover (matchday) — classic matchday programme covers ================= */

/**
 * Capa de programa (matchday): a cream programme cover — masthead with his club's crest, "OFFICIAL MATCHDAY PROGRAMME"
 * and the issue number (the round); his real photo with its own surroundings in a white-bordered frame; the fixture in a
 * big serif under it (exact names), date · ground and the flags clock.
 */
export function Proprogramme({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const crest = d.club?.crestUrl;
  const issue = mf.roundNo ? `Nº ${mf.roundNo}` : "";
  const hn = lines3(fx.homeName, 64 * k * ts, W - 2 * M, 0, 30 * k);
  const an = lines3(fx.awayName, 64 * k * ts, W - 2 * M, 0, 30 * k);
  const sPx = Math.min(hn.px, an.px);
  const textH = (hn.lines.length + an.lines.length) * sPx * 1.05 + 40 * k + 110 * k;
  const fTop = top + 120 * k;
  const fBot = lt - 50 * k - textH;
  const p = standAt(d, 540, fTop + (fBot - fTop) * 0.32, 150);
  return (
    <Page d={d} bg="#f1ece1" light>
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `${3 * k}px solid #16181c`, paddingBottom: 18 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * k }}>
          {crest && <img src={crest} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain" }} />}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={caps(15 * k, 0.3, 800, t.ink)}>OFFICIAL</div>
            <div style={caps(24 * k, 0.12, 900, "#16181c")}>MATCHDAY PROGRAMME</div>
          </div>
        </div>
        {issue && <div style={{ fontFamily: DMSERIF, fontSize: 58 * k, lineHeight: 1, color: "#16181c" }}>{issue}</div>}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: fTop, height: fBot - fTop, background: "#fff", boxShadow: "0 18px 40px rgba(0,0,0,.18)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${fTop + 16 * k}px ${M + 16 * k}px ${H - fBot + 16 * k}px ${M + 16 * k}px)` }}>
        <NatGround place={p} W={W} H={H} />
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: fBot + 34 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hn.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DMSERIF, fontSize: sPx, lineHeight: 1.05, color: "#16181c" }}>{l}</div>
        ))}
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 30 * k, lineHeight: 1.2, color: t.ink }}>versus</div>
        {an.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DMSERIF, fontSize: sPx, lineHeight: 1.05, color: "#16181c" }}>{l}</div>
        ))}
        <div style={{ height: 14 * k }} />
        <div style={caps(16 * k * ts, 0.16, 700, "#16181c")}>{dateVenue(d)}</div>
        <div style={{ height: 10 * k }} />
        <FlagClock d={d} px={22 * k * ts} color="#16181c" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 4 · Storyboard (matchday) — three-frame triptych posters ================= */

/**
 * Três quadros (matchday): three tall frames side by side, each the same photo of him at a different scale — face
 * close-up, mid shot, full body — on a dark ground with thin white gaps; MATCHDAY above; the fixture and flags clock at
 * the foot.
 */
export function Prostoryboard({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const g = 12 * k;
  const pw = (W - 2 * M - 2 * g) / 3;
  const pTop = top + 150 * k;
  const pBot = ft - 50 * k;
  const ph = pBot - pTop;
  const xs = [0, 1, 2].map((i) => M + i * (pw + g));
  const clip = (x: number) => `inset(${pTop}px ${W - x - pw}px ${H - pBot}px ${x}px)`;
  const full = isCut(d) ? bustAt(d, xs[2] + pw / 2, pTop + ph * 0.3, pw * 0.22) : feetInside(d, xs[2] + pw / 2, pBot - 20 * k, ph * 0.88);
  const wPx = Math.min(140 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.6)}, #0b0c10)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      {xs.map((x, i) => (
        <div key={"b" + i} style={{ position: "absolute", left: x, top: pTop, width: pw, height: ph, background: i === 1 ? t.ink : shade(t.ink, -0.35) }} />
      ))}
      {s && <Portrait s={s} cx={xs[0] + pw / 2} cy={pTop + ph * 0.42} fh={pw * 0.8} mode="color" style={{ clipPath: clip(xs[0]) }} />}
      {s && <Portrait s={s} cx={xs[1] + pw / 2} cy={pTop + ph * 0.3} fh={pw * 0.38} mode="bw" style={{ clipPath: clip(xs[1]) }} />}
      <div style={{ position: "absolute", inset: 0, clipPath: clip(xs[2]) }}>
        <Front d={d} p={full} />
      </div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 5 · Round badge (matchday) — Pinterest circular player badges ================= */

/**
 * Emblema redondo (matchday): his colour portrait held in a big clean circle — a thick club-colour ring with a thin white
 * ring outside it; MATCHDAY above; his name big under it; the two crests either side of the fixture; the flags clock.
 */
export function Probadge({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const s = portraitOf(d);
  const R = 360;
  const cx = W / 2;
  const cy = top + 150 * k + R;
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nl = lines3(name, 70 * k * ts, W - 2 * M, 0.02, 34 * k);
  const vs = vsLines(d, 22 * k * ts, W - 2 * M - 220 * k, 14 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.65)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 35%, ${shade(t.ink, -0.25)}, ${shade(t.ink, -0.8)} 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 96 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R + 18 * k} fill="none" stroke="#fff" strokeWidth={3 * k} />
        <circle cx={cx} cy={cy} r={R} fill={shade(t.ink, 0.1)} />
      </svg>
      {s && <Portrait s={s} cx={cx} cy={cy - R * 0.08} fh={R * 0.62} mode="color" style={{ clipPath: `circle(${R - 22 * k}px at ${cx}px ${cy}px)` }} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R - 11 * k} fill="none" stroke={t.ink} strokeWidth={22 * k} />
      </svg>
      <div style={{ position: "absolute", left: M, right: M, top: cy + R + 50 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#fff")}>{l}</div>
        ))}
        <div style={{ ...caps(16 * k, 0.4, 800, t.glow), marginTop: 8 * k }}>{roundTitle(d)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, marginTop: 30 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {vs.lines.map((l, i) => (
              <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 4 * k }}>{l}</div>
            ))}
          </div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ ...caps(16 * k * ts, 0.14, 600, "rgba(255,255,255,.85)"), marginTop: 14 * k }}>{dateVenue(d)}</div>
        <div style={{ height: 12 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 6 · Kick-off in X hours (matchday) — live "kick-off in" stories ================= */

/** Whole hours from now to kick-off (in the venue's / club's zone), or null when unknown or past. */
function hoursTo(d: RenderData): number | null {
  const iso = isoFromShortDate(d.content.date);
  const fx = natFixture(d);
  if (!iso || !/^\d{1,2}:\d{2}$/.test(fx.time)) return null;
  const tz = venueZone(d.content.venue, d.club?.timezone ?? undefined) ?? d.club?.timezone ?? PORTUGAL_TZ;
  const at = instantIn(iso, fx.time.padStart(5, "0"), tz);
  if (!at) return null;
  const h = (at.getTime() - Date.now()) / 3600000;
  return h > 0 ? Math.max(1, Math.round(h)) : null;
}

/**
 * Faltam X horas (matchday): a dark live-style card — a small pulsing-free club dot and "KICK-OFF IN", the hours left
 * huge ("5H", or "2 DAYS" beyond a day; just the kick-off time when it is unknown or past); the fixture and flags clock
 * under it on the left; him full-body on the right.
 */
export function Prokickhours({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const h = hoursTo(d);
  const mf = matchFacts(d);
  const big = h == null ? fx.time || [mf.day, mf.mon].filter(Boolean).join(" ").toUpperCase() || "MATCHDAY" : h < 24 ? `${h}H` : `${Math.round(h / 24)} DAYS`;
  const lead = h == null ? "KICK-OFF" : "KICK-OFF IN";
  const bPx = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(big, 1)));
  const vs = vsLines(d, 26 * k * ts, W * 0.5 - M, 15 * k);
  const colTop = top + 70 * k + bPx * 0.85 + 30 * k;
  const p = isCut(d) ? bustAt(d, W * 0.72, colTop + 260 * k, 110 * k) : feetInside(d, W * 0.72, lt + 40 * k, Math.min(1150 * k / 1.3, lt + 40 * k - colTop));
  return (
    <Page d={d} bg="#0b0c10">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 75% 70%, ${shade(t.ink, -0.35)}, #0b0c10 70%)` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, display: "flex", alignItems: "center", gap: 14 * k }}>
        <div style={{ width: 22 * k, height: 22 * k, borderRadius: "50%", background: t.glow, boxShadow: `0 0 0 ${8 * k}px ${t.glow}33` }} />
        <div style={caps(24 * k, 0.3, 900, "#fff")}>{lead}</div>
      </div>
      <div style={{ position: "absolute", left: M, top: top + 70 * k, fontFamily: DISPLAY, fontSize: bPx, lineHeight: 0.85, color: "#fff" }}>{big}</div>
      <div style={{ position: "absolute", left: M, top: colTop, width: W * 0.5 - M, display: "flex", flexDirection: "column", gap: 8 * k }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(16 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <div style={{ height: 6 * k }} />
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={18 * k} dir="column" />
      </div>
    </Page>
  );
}
