/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
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
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure } from "./pro19";

/* Round 49 · new pro families (Pinterest "soccer matchday poster 2026 dribbble", "football poster vertical typography"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;
const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ").toUpperCase();

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

/* ================= 1 · Ampersand (matchday) — Pinterest "Ajax / Chelsea" stacked names ================= */

/**
 * E comercial (matchday): the home name and the away name stacked huge (exact, wrapped) linked by a giant club-colour
 * serif ampersand; him full-body in front at the right; date · ground and the flags clock in a card at the foot.
 */
export function Proampersand({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const hn = lines3(fx.homeName.toUpperCase(), 190 * k, W - 2 * M, 0, 60 * k);
  const an = lines3(fx.awayName.toUpperCase(), 190 * k, W - 2 * M, 0, 60 * k);
  const px = Math.min(hn.px, an.px, ...[...hn.lines, ...an.lines].map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const aTop = top + hn.lines.length * px * 0.88 + 230 * k;
  const blockB = aTop + an.lines.length * px * 0.88;
  const p = isCut(d) ? bustAt(d, W * 0.66, blockB + 220 * k, 110 * k) : stripFigure(d, W * 0.3, W - 12, lt + 40 * k, Math.min(1100 * k / 1.3, lt + 40 * k - blockB + 150 * k), blockB);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.4)}, ${shade(t.ink, -0.85)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column" }}>
        {hn.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.88, color: "#fff", whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, top: top + hn.lines.length * px * 0.88 - 20 * k, fontFamily: DMSERIF, fontStyle: "italic", fontSize: 280 * k, lineHeight: 1, color: shade(t.ink, 0.3) }}>&amp;</div>
      <div style={{ position: "absolute", left: M, right: M, top: aTop, display: "flex", flexDirection: "column" }}>
        {an.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.88, color: "#fff", whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, top: lt - 160 * k, padding: `${14 * k}px ${18 * k}px`, borderRadius: 14 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={caps(18 * k, 0.3, 900, "#fff")}>{roundTitle(d)}</div>
        <div style={caps(15 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={18 * k} />
      </div>
    </Page>
  );
}

/* ================= 2 · Split kick-off (matchday) — Pinterest "10:30" time posters ================= */

/**
 * Hora dividida (matchday): the kick-off hour huge on top and the minutes huge at the foot (the date's day and month when
 * no time is on record), him full-body between the two lines; the fixture and the second clock in a strip.
 */
export function Prokickoffsplit({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const m = /^(\d{1,2}):(\d{2})$/.exec(fx.time);
  const a = m ? m[1].padStart(2, "0") : mf.day || "";
  const b = m ? `:${m[2]}` : (mf.mon || "").slice(0, 3).toUpperCase();
  const px = Math.min(520 * k, (W - 2 * M) / Math.max(0.1, Math.max(wordW(a, 1), wordW(b, 1))));
  const bTop = lt - 160 * k - px * 0.86;
  const vs = vsLines(d, 22 * k * ts, W - 2 * M, 13 * k);
  const p = isCut(d) ? bustAt(d, 540, top + px * 0.86 + 200 * k, 110 * k) : stripFigure(d, 12, W - 12, lt + 40 * k, Math.min(1300 * k / 1.3, lt + 40 * k - top - px * 0.35), top + px * 0.35, 160 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.3)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: shade(t.ink, 0.3) }}>{a}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: bTop, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: "#fff", textShadow: "0 14px 40px rgba(0,0,0,.4)" }}>{b}</div>
      {/* He stands in front of the minutes, big (about half the canvas). */}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 140 * k, padding: `${10 * k}px 0`, borderRadius: 14 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * k }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <FlagClock d={d} px={20 * k * ts} color="#fff" gap={18 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Nested frames (matchday) — frame within frame ================= */

/**
 * Moldura dupla (matchday): three nested club-colour rectangles stepping inward, the innermost showing the real ground
 * from his photo; him full-body in front breaking out of the frames at the top; MATCHDAY above; the fixture card below.
 */
export function Pronested({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const ft0 = top + 150 * k;
  const fb = ft - 50 * k;
  const g = standAt(d, 540, (ft0 + fb) / 2 - 80 * k, 140);
  const steps = [0, 34, 68].map((v) => v * k);
  const cols = [shade(t.ink, 0.2), t.ink, shade(t.ink, -0.4)];
  const inner = steps[2] + 20 * k;
  const p = isCut(d) ? bustAt(d, 540, ft0 + 200 * k, 120 * k) : stripFigure(d, 12, W - 12, fb - 30 * k, Math.min(1100 * k / 1.3, fb - 30 * k - top + 60 * k), ft0);
  return (
    <Page d={d} bg={shade(t.ink, -0.8)}>
      {steps.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: M + s, right: M + s, top: ft0 + s, height: fb - ft0 - 2 * s, background: cols[i], borderRadius: 10 * k }} />
      ))}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${ft0 + inner}px ${M + inner}px ${H - fb + inner}px ${M + inner}px round ${8 * k}px)` }}>
        <NatGround place={g} W={W} H={H} style={{ filter: "brightness(.85)" }} />
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 4 · Name marquee (matchday) — repeated vertical name strip ================= */

/**
 * Faixa do nome (matchday): a club-colour strip down the right edge with his surname repeated up it in alternating solid
 * and outline (static, clean); his real photo with its own surroundings filling the rest; MATCHDAY and the fixture in a
 * card at the foot.
 */
export function Promarquee({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const sw = 170 * k;
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const px = sw * 0.72;
  const unit = (wordW(sur, 1) + 0.6) * px;
  const n = Math.ceil(H / Math.max(1, unit)) + 1;
  const g = standAt(d, (W - sw) / 2, 760, 170);
  const vs = vsLines(d, 22 * k * ts, W - sw - 2 * M, 13 * k);
  const cx = W - sw / 2;
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px ${sw}px 0px 0px)` }}>
        <NatGround place={g} W={W} H={H} style={{ filter: "contrast(1.05) brightness(.9)" }} />
        <NatFigure data={d} place={g} W={W} H={H} clean />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,.75))" }} />
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: sw, background: t.ink }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: n }, (_, i) => {
          const y = H - i * unit - unit / 2;
          return (
            <text key={i} x={cx} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill={i % 2 ? "none" : "#fff"} stroke={i % 2 ? "#fff" : "none"} strokeWidth={2.5 * k}>
              {sur}
            </text>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: M - 10 * k, right: sw + 20 * k, top: lt - 250 * k, padding: `${16 * k}px ${18 * k}px`, borderRadius: 16 * k, background: "rgba(6,8,12,.78)", display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 80 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(14 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={22 * k * ts} color="#fff" gap={16 * k} />
      </div>
    </Page>
  );
}

/* ================= 5 · Crest circles (matchday) — two big crest discs over the player ================= */

/**
 * Emblemas em círculos (matchday): both crests in big white-rimmed club-colour circles side by side at the top with a
 * serif "vs" between; him full-body below them; the fixture card at the foot.
 */
export function Procrestcircles({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const R = 190 * k;
  const cy = top + 40 * k + R;
  const disc = (crest: string | null, cx: number, bg: string) => (
    <div style={{ position: "absolute", left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", background: bg, border: `${8 * k}px solid #fff`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>
      {crest && <img src={crest} alt="" style={{ width: R * 1.2, height: R * 1.2, objectFit: "contain", filter: CREST_HALO }} />}
    </div>
  );
  const ourHome = d.content.home !== false;
  const p = isCut(d) ? bustAt(d, 540, cy + R + 240 * k, 120 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1100 * k / 1.3, ft + 10 * k - cy), cy + R);
  return (
    <Page d={d} bg={shade(t.ink, -0.65)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.3)}, ${shade(t.ink, -0.85)})` }} />
      <Front d={d} p={p} />
      {disc(fx.homeCrest, M + R + 10 * k, ourHome ? t.ink : "#22252b")}
      {disc(fx.awayCrest, W - M - R - 10 * k, ourHome ? "#22252b" : t.ink)}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 60 * k, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: 110 * k, lineHeight: 1, color: "#fff" }}>vs</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 6 · Time of day (matchday) — "Tonight" headline ================= */

/** "TONIGHT" / "THIS AFTERNOON" / "THIS MORNING" from the kick-off hour; "MATCHDAY" when no time is on record. */
export function timeOfDay(time: string): string {
  const m = /^(\d{1,2}):\d{2}$/.exec(time);
  if (!m) return "MATCHDAY";
  const h = Number(m[1]);
  return h >= 18 ? "TONIGHT" : h >= 12 ? "THIS AFTERNOON" : "THIS MORNING";
}

/**
 * Esta noite (matchday): the time of day from the kick-off ("Tonight" from 18:00, "This afternoon", "This morning") set
 * as a big two-tone headline over his big colour portrait; the fixture, date · ground and flags clock in a card at the
 * foot. The headline is about the game's local kick-off time.
 */
export function Protimeofday({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const s = portraitOf(d);
  const head = timeOfDay(fx.time);
  const words = head.split(" ");
  const last = words.pop() || "";
  const first = words.join(" ");
  const lPx = Math.min(260 * k, (W - 2 * M) / Math.max(0.1, wordW(last, 1)));
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.25)}, ${shade(t.ink, -0.85)})` }} />
      {s && <Portrait s={s} cx={W / 2} cy={top + 600 * k} fh={300 * k} mode="color" fade={30} />}
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {first && <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 90 * k, lineHeight: 1, color: "#fff" }}>{first.charAt(0) + first.slice(1).toLowerCase()}</div>}
        <div style={{ fontFamily: DISPLAY, fontSize: lPx, lineHeight: 0.86, color: shade(t.ink, 0.35), textShadow: "0 10px 30px rgba(0,0,0,.35)" }}>{last}</div>
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: ft - 70 * k, textAlign: "center", ...caps(20 * k, 0.3, 800, "#fff") }}>{fullName(d)}</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}
