/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { isoFromShortDate } from "@/lib/timezone";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { FlagClock, Front, M, Page, Portrait, caps, clocksOf, dateVenue, portraitOf, secondShot, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure } from "./pro19";

/* Round 48 · new pro families (Pinterest "matchday graphic serie a 2026 behance", "football poster grid layout"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;
const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const DOWS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

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

/* ================= 1 · L-frame (matchday) — corner block framing ================= */

/**
 * Moldura em L (matchday): a thick club-colour L-shaped block framing the lower-left corner, MATCHDAY running up its
 * vertical arm and the fixture along its foot; his big colour portrait filling the open corner; him full-body in front.
 */
export function Prolframe({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const aw = 190 * k;
  const fh = footH(d);
  const footTop = lt - 60 * k - fh - 40 * k;
  const len = footTop - top - 40 * k;
  const px = Math.min(aw * 0.78, len / Math.max(0.1, wordW("MATCHDAY", 1)));
  const x = aw / 2;
  const y = top + len / 2;
  const vs = vsLines(d, 24 * k * ts, W - aw - 2 * M, 14 * k);
  const p = isCut(d) ? bustAt(d, W * 0.6, top + 600 * k, 120 * k) : stripFigure(d, aw + 10 * k, W - 12, footTop + 20 * k, Math.min(1100 * k / 1.3, footTop + 20 * k - top - 100 * k), H * 0.38);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.45)}, ${shade(t.ink, -0.85)})` }} />
      {s && <Portrait s={s} cx={W * 0.6} cy={top + 360 * k} fh={260 * k} mode="bw" opacity={0.55} fade={40} />}
      <Front d={d} p={p} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`0,${top - 20 * k} ${aw},${top - 20 * k} ${aw},${footTop} ${W},${footTop} ${W},${H} 0,${H}`} fill={t.ink} />
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${x} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
          MATCHDAY
        </text>
      </svg>
      <div style={{ position: "absolute", left: aw + M, right: M, top: footTop + 30 * k, display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={caps(16 * k, 0.4, 800, "rgba(255,255,255,.85)")}>{roundTitle(d)}</div>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(15 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 2 · Calendar page (matchday) — the date as a giant page number ================= */

/**
 * Folha de calendário (matchday): a flat white calendar sheet — a club-colour header band with the month, the day
 * number huge in the middle, the weekday under it — leaning slightly on the left; him full-body on the right; the
 * fixture and flags clock at the foot.
 */
export function Procalendar({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const iso = isoFromShortDate(d.content.date);
  const day = iso ? String(Number(iso.slice(8, 10))) : "";
  const mon = iso ? MONTHS[Number(iso.slice(5, 7)) - 1] : "";
  const dow = iso ? DOWS[new Date(`${iso}T12:00:00Z`).getUTCDay()] : "";
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const cw = 520 * k;
  const ch = 640 * k;
  const p = isCut(d) ? bustAt(d, W * 0.74, top + 560 * k, 110 * k) : stripFigure(d, W * 0.45, W - 12, ft + 10 * k, Math.min(1150 * k / 1.3, ft + 10 * k - top - 60 * k), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.8)})` }} />
      <div style={{ position: "absolute", left: M, top: top + 160 * k, width: cw, height: ch, background: "#fff", borderRadius: 18 * k, overflow: "hidden", transform: "rotate(-4deg)", boxShadow: "0 30px 60px rgba(0,0,0,.4)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 120 * k, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", ...caps(40 * k, 0.2, 900, "#fff") }}>{mon || "MATCHDAY"}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 360 * k, lineHeight: 0.86, color: "#16181c" }}>{day || "—"}</div>
          <div style={{ ...caps(26 * k, 0.4, 800, t.ink), marginTop: 14 * k }}>{dow}</div>
        </div>
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Crest grid (matchday) — low-contrast repeated crest wall ================= */

/**
 * Parede de emblemas (matchday): his club's crest repeated in a clean, low-contrast grid over a club-colour ground (a
 * flat pattern, no texture); him full-body in front; MATCHDAY on a dark band at the top; the fixture card at the foot.
 */
export function Procrestgrid({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const cs = 150 * k;
  const cols = Math.ceil(W / cs) + 1;
  const rows = Math.ceil(H / cs) + 1;
  const p = isCut(d) ? bustAt(d, 540, top + 520 * k, 120 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1150 * k / 1.3, ft + 10 * k - top - 160 * k), H * 0.4);
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.7)})` }} />
      {crest &&
        Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => (
            <img key={`${r}-${c}`} src={crest} alt="" style={{ position: "absolute", left: c * cs + (r % 2 ? cs / 2 : 0) - cs / 2, top: r * cs, width: cs * 0.55, height: cs * 0.55, objectFit: "contain", opacity: 0.12, filter: "grayscale(1) brightness(2)" }} />
          )),
        )}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 20 * k, height: 150 * k, background: "rgba(6,8,12,.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 104 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        <div style={caps(16 * k, 0.4, 800, "rgba(255,255,255,.85)")}>{roundTitle(d)}</div>
      </div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 4 · Spotlight duo (matchday) — two photos with a central title column ================= */

/**
 * Dupla em destaque (matchday): two tall photo panels of him left and right (his main photo and a second one when he
 * has it, else a black-and-white crop) with a narrow central column carrying MATCHDAY vertically and the round; the
 * fixture card at the foot.
 */
export function Prospotduo({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const s2 = secondShot(d) ?? s;
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const cw = 150 * k;
  const pw = (W - 2 * M - cw - 20 * k) / 2;
  const pt = top;
  const pb = ft - 50 * k;
  const xl = M;
  const xr = W - M - pw;
  const clip = (x: number) => `inset(${pt}px ${W - x - pw}px ${H - pb}px ${x}px round ${16 * k}px)`;
  const len = pb - pt - 40 * k;
  const px = Math.min(cw * 0.75, len / Math.max(0.1, wordW("MATCHDAY", 1)));
  const cx = W / 2;
  const cy = (pt + pb) / 2;
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.5)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", left: xl, top: pt, width: pw, height: pb - pt, borderRadius: 16 * k, background: shade(t.ink, -0.2) }} />
      <div style={{ position: "absolute", left: xr, top: pt, width: pw, height: pb - pt, borderRadius: 16 * k, background: shade(t.ink, -0.35) }} />
      {s && <Portrait s={s} cx={xl + pw / 2} cy={pt + 300 * k} fh={200 * k} mode="color" style={{ clipPath: clip(xl) }} />}
      {s2 && <Portrait s={s2} cx={xr + pw / 2} cy={pt + (pb - pt) * 0.55} fh={200 * k} mode={s2 === s ? "bw" : "color"} style={{ clipPath: clip(xr) }} />}
      <div style={{ position: "absolute", left: cx - cw / 2, top: pt, width: cw, height: pb - pt, background: t.ink, borderRadius: 16 * k }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
          MATCHDAY
        </text>
      </svg>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 5 · Two-colour names (matchday) — HOME / AWAY in each club's colour ================= */

/**
 * Casa e fora a cores (matchday): the home name huge in the home side's colour and the away name huge in the other's
 * (his club's colour on his side, white on the opponent's), stacked with a small serif "vs"; him full-body in front at
 * the right; date, ground and flags clock at the foot.
 */
export function Protwocolour({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const ourHome = d.content.home !== false;
  const club = shade(t.ink, 0.25);
  const hc = ourHome ? club : "#f2f2f2";
  const ac = ourHome ? "#f2f2f2" : club;
  const hn = lines3(fx.homeName.toUpperCase(), 200 * k, W - 2 * M, 0, 60 * k);
  const an = lines3(fx.awayName.toUpperCase(), 200 * k, W - 2 * M, 0, 60 * k);
  const px = Math.min(hn.px, an.px, ...[...hn.lines, ...an.lines].map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const blockB = top + (hn.lines.length + an.lines.length) * px * 0.88 + 80 * k;
  const p = isCut(d) ? bustAt(d, W * 0.66, blockB + 230 * k, 110 * k) : stripFigure(d, W * 0.3, W - 12, lt + 40 * k, Math.min(1100 * k / 1.3, lt + 40 * k - blockB + 200 * k), blockB);
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.55)}, #0b0c10)` }} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", flexDirection: "column" }}>
        {hn.lines.map((l, i) => (
          <div key={"h" + i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.88, color: hc, whiteSpace: "nowrap" }}>{l}</div>
        ))}
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 60 * k, lineHeight: 1.1, color: "rgba(255,255,255,.75)" }}>vs</div>
        {an.lines.map((l, i) => (
          <div key={"a" + i} style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 0.88, color: ac, whiteSpace: "nowrap" }}>{l}</div>
        ))}
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, top: lt - 160 * k, padding: `${14 * k}px ${18 * k}px`, borderRadius: 14 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={caps(18 * k, 0.3, 900, "#fff")}>{roundTitle(d)}</div>
        <div style={caps(15 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={18 * k} />
      </div>
    </Page>
  );
}

/* ================= 6 · Ladder (matchday) — vertical info ladder with rules ================= */

/**
 * Escada (matchday): a clean vertical ladder of the game's facts down the left — round, date, kick-off with flags,
 * ground — each step a big value over a small label, joined by a club-colour rail with round stops; MATCHDAY at the top;
 * him full-body on the right.
 */
export function Proladder({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const mf = matchFacts(d);
  const colW = W * 0.5 - M;
  const vs = vsLines(d, 24 * k * ts, colW, 13 * k);
  const steps: { lab: string; node: React.ReactNode }[] = [];
  steps.push({ lab: "FIXTURE", node: <div>{vs.lines.map((l, i) => <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>)}</div> });
  if (roundTitle(d)) steps.push({ lab: "ROUND", node: <div style={caps(30 * k * ts, 0.04, 900, "#fff")}>{roundTitle(d)}</div> });
  if (mf.longDate || mf.date) steps.push({ lab: "DATE", node: <div style={caps(30 * k * ts, 0.04, 900, "#fff")}>{(mf.longDate || mf.date).toUpperCase()}</div> });
  if (clocksOf(d).length) steps.push({ lab: "KICK-OFF", node: <FlagClock d={d} px={30 * k * ts} color="#fff" gap={16 * k} dir="column" /> });
  if (mf.venue) steps.push({ lab: "GROUND", node: <div style={caps(Math.min(26 * k * ts, colW / Math.max(1, mf.venue.length * 0.7)), 0.04, 900, "#fff")}>{mf.venue}</div> });
  const p = stripFigure(d, W * 0.5, W - 12, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - top), H * 0.4);
  const lt0 = top + 150 * k;
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.4)}, #0b0c10)` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M + 14 * k, top: lt0 + 10 * k, width: 4 * k, height: lt - 120 * k - lt0, background: t.glow }} />
      <div style={{ position: "absolute", left: M, top: lt0, width: colW, display: "flex", flexDirection: "column", gap: 40 * k }}>
        {steps.map((st) => (
          <div key={st.lab} style={{ display: "flex", gap: 24 * k }}>
            <div style={{ width: 32 * k, height: 32 * k, borderRadius: "50%", background: t.glow, border: `${4 * k}px solid #fff`, flexShrink: 0, marginTop: 4 * k }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 * k }}>
              <div style={caps(14 * k, 0.4, 800, "rgba(255,255,255,.6)")}>{st.lab}</div>
              {st.node}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

