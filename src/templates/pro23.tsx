/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
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
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, clocksOf, dateVenue, frontAt, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure, wrapCaps } from "./pro19";

/* Round 43 · new pro families (Pinterest "matchday graphic 2026", "soccer player poster blue"). */

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

/* ================= 1 · Pill (matchday) — Pinterest rounded-frame player posters ================= */

/**
 * Cápsula (matchday): his colour portrait held in a tall rounded pill on the right; MATCH and DAY wrap round it on the
 * left — MATCH crossing the pill's edge at the top, DAY lower down — with the fixture, date · ground and flags clock in
 * the left column under them.
 */
export function Propill({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const pw = 470;
  const pt = top + 40 * k;
  const pb = lt - 60 * k;
  const pl = W - M - pw;
  const r = pw / 2;
  const colW = pl - M + 60 * k;
  const mPx = Math.min(200 * k, colW / Math.max(0.1, wordW("MATCH", 1)));
  const vs = vsLines(d, 26 * k * ts, pl - M - 20 * k, 14 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.45)}, ${shade(t.ink, -0.8)})` }} />
      <div style={{ position: "absolute", left: pl, top: pt, width: pw, height: pb - pt, borderRadius: r, background: `linear-gradient(180deg, ${shade(t.ink, 0.15)}, ${shade(t.ink, -0.4)})` }} />
      {s && <Portrait s={s} cx={pl + pw / 2} cy={pt + (pb - pt) * 0.26} fh={200 * k} mode="color" style={{ clipPath: `inset(${pt}px ${W - pl - pw}px ${H - pb}px ${pl}px round ${r}px)` }} />}
      <div style={{ position: "absolute", left: pl, top: pt + (pb - pt) * 0.45, width: pw, height: (pb - pt) * 0.55, borderRadius: `0 0 ${r}px ${r}px`, background: `linear-gradient(180deg, ${t.ink}00, ${t.ink}f2 40%)` }} />
      {matchFacts(d).roundNo && <div style={{ position: "absolute", left: pl, width: pw, top: pt + (pb - pt) * 0.52, textAlign: "center", fontFamily: DISPLAY, fontSize: 380 * k, lineHeight: 0.86, color: "transparent", WebkitTextStroke: `${3 * k}px rgba(255,255,255,.55)` }}>{matchFacts(d).roundNo}</div>}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${pt}px ${W - pl - pw}px ${H - pb}px ${pl}px round ${r}px)` }}>
        <Front d={d} p={isCut(d) ? bustAt(d, pl + pw / 2, pt + (pb - pt) * 0.66, 70 * k) : stripFigure(d, pl + 20 * k, pl + pw - 20 * k, pb - 40 * k, (pb - pt) * 0.5, pt + (pb - pt) * 0.55)} />
      </div>
      <div style={{ position: "absolute", left: pl - 10 * k, top: pt - 10 * k, width: pw + 20 * k, height: pb - pt + 20 * k, borderRadius: r + 10 * k, border: `${3 * k}px solid rgba(255,255,255,.75)` }} />
      <div style={{ position: "absolute", left: M, top: pt + 40 * k, fontFamily: DISPLAY, fontSize: mPx, lineHeight: 0.86, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.35)" }}>MATCH</div>
      <div style={{ position: "absolute", left: M, top: pt + 40 * k + mPx * 0.9, fontFamily: DISPLAY, fontSize: mPx, lineHeight: 0.86, color: t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.25) }}>DAY</div>
      <div style={{ position: "absolute", left: M, top: pt + 80 * k + 2 * mPx * 0.9, width: pl - M - 20 * k, display: "flex", flexDirection: "column", gap: 10 * k }}>
        {lines3(roundTitle(d), 18 * k, pl - M - 20 * k, 0.4, 11 * k).lines.map((l, i) => (
          <div key={"r" + i} style={caps(lines3(roundTitle(d), 18 * k, pl - M - 20 * k, 0.4, 11 * k).px, 0.4, 800, "rgba(255,255,255,.8)")}>{l}</div>
        ))}
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(16 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <div style={{ height: 8 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={16 * k} dir="column" />
      </div>
    </Page>
  );
}

/* ================= 2 · Diagonal ribbon (matchday) — Pinterest Mbappé "10:30" diagonal band ================= */

/**
 * Faixa diagonal (matchday): a deep ground; him full-body; a wide club-colour ribbon crossing the canvas on a diagonal in
 * front of his legs with the fixture (exact names) and the date running along it; MATCHDAY at the top-left and the
 * kick-off with flags big at the bottom-left.
 */
export function Proribbon({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const by = H * 0.6;
  const len = W * 1.25;
  const txt = `${fx.homeName} X ${fx.awayName}`.toUpperCase();
  const rl = lines3(txt, 44 * k * ts, len - 280 * k, 0.04, 22 * k);
  const bandH = rl.lines.length * rl.px * 1.15 + 70 * k;
  const p = isCut(d) ? bustAt(d, 560, top + 470 * k, 120 * k) : stripFigure(d, 12, W - 12, by + 120 * k, Math.min(1150 * k / 1.3, by + 120 * k - top - 140 * k), H * 0.36);
  const wPx = Math.min(130 * k, (W * 0.62) / Math.max(0.1, wordW("MATCHDAY", 1)));
  return (
    <Page d={d} bg="#0b0d12">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 60% 35%, ${shade(t.ink, -0.3)}, #0b0d12 70%)` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: (W - len) / 2, width: len, top: by, height: bandH, background: t.ink, transform: "rotate(-9deg)", boxShadow: "0 20px 50px rgba(0,0,0,.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderTop: `${4 * k}px solid #fff`, borderBottom: `${4 * k}px solid #fff` }}>
        {rl.lines.map((l, i) => (
          <div key={i} style={caps(rl.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={{ ...caps(16 * k * ts, 0.3, 700, "rgba(255,255,255,.88)"), marginTop: 8 * k }}>{dateVenue(d)}</div>
      </div>
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: top + wPx * 0.92, ...caps(18 * k, 0.4, 800, "rgba(255,255,255,.8)") }}>{roundTitle(d)}</div>
      <div style={{ position: "absolute", left: M - 10 * k, top: lt - 150 * k, padding: `${14 * k}px ${18 * k}px`, borderRadius: 14 * k, background: "rgba(0,0,0,.55)" }}>
        <FlagClock d={d} px={44 * k * ts} color="#fff" gap={26 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Outline number (matchday) — Pinterest three-quarter crops with outline numerals ================= */

/**
 * Número em contorno (matchday): a three-quarter crop of him, big (waist-up, the legs off the canvas); a huge outline
 * numeral behind — his shirt number, else the round; MATCHDAY and the round at the top-left; the fixture card at the foot.
 */
export function Prooutline({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || matchFacts(d).roundNo || "";
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const nPx = Math.min(900 * k, (W + 60 * k) / Math.max(0.1, wordW(num || "0", 1)));
  const p = isCut(d) ? bustAt(d, W * 0.56, top + 520 * k, 130 * k) : frontAt(d, W * 0.56, top + 520 * k, 150 * k);
  const wPx = Math.min(120 * k, (W * 0.6) / Math.max(0.1, wordW("MATCHDAY", 1)));
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.75)})` }} />
      {num && <div style={{ position: "absolute", left: -30 * k, right: -30 * k, top: top + 60 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.8, color: "transparent", WebkitTextStroke: `${4 * k}px rgba(255,255,255,.7)`, whiteSpace: "nowrap" }}>{num}</div>}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 140 * k, bottom: 0, background: `linear-gradient(to bottom, ${shade(t.ink, -0.75)}00, ${shade(t.ink, -0.8)}f0 45%)` }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: top + wPx * 0.92, ...caps(18 * k, 0.4, 800, "rgba(255,255,255,.85)") }}>{roundTitle(d)}</div>
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 4 · Poster grid (matchday) — Swiss 12-column editorial posters ================= */

/**
 * Grelha editorial (matchday): an off-white Swiss poster on a visible 12-column grid of hairlines; MATCHDAY across all
 * columns; labelled data rows in columns 1–5 (home, away, date, kick-off, ground) under thin rules; him full-body in
 * colour across columns 6–12; the round number set big at the foot of column 1.
 */
export function Progrid({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const cw = (W - 2 * M) / 12;
  const colL = cw * 5 - 16 * k;
  const wPx = Math.min(220 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const rowsTop = top + wPx * 0.86 + 60 * k;
  const val = (v: string) => lines3(v.toUpperCase(), 34 * k * ts, colL, 0.02, 16 * k);
  const rows: [string, string][] = [
    ["Home", fx.homeName],
    ["Away", fx.awayName],
    ["Date", mf.longDate || mf.date],
    ["Ground", mf.venue],
  ].filter((r) => r[1]) as [string, string][];
  const p = stripFigure(d, M + cw * 5, W - 12, lt + 30 * k, Math.min(1250 * k / 1.3, lt + 30 * k - rowsTop), H * 0.4);
  return (
    <Page d={d} bg="#f3f2ee" light>
      {Array.from({ length: 13 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: M + i * cw, top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,.08)" }} />
      ))}
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top, fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.86, color: "#16181c" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: rowsTop, width: colL, display: "flex", flexDirection: "column" }}>
        {rows.map(([lab, v], i) => {
          const vl = val(v);
          return (
            <div key={i} style={{ borderTop: `${2 * k}px solid #16181c`, padding: `${10 * k}px 0 ${22 * k}px` }}>
              <div style={caps(17 * k, 0.3, 800, t.ink)}>{lab.toUpperCase()}</div>
              {vl.lines.map((l, j) => (
                <div key={j} style={{ ...caps(vl.px, 0.02, 900, "#16181c"), marginTop: 4 * k }}>{l}</div>
              ))}
            </div>
          );
        })}
        {clocksOf(d).length > 0 && <div style={{ borderTop: `${2 * k}px solid #16181c`, padding: `${10 * k}px 0` }}>
          <div style={caps(17 * k, 0.3, 800, t.ink)}>KICK-OFF</div>
          <div style={{ marginTop: 8 * k }}>
            <FlagClock d={d} px={32 * k * ts} color="#16181c" gap={12 * k} dir="column" />
          </div>
        </div>}
      </div>
      {mf.roundNo && <div style={{ position: "absolute", left: M, top: lt - 280 * k, fontFamily: DISPLAY, fontSize: 220 * k, lineHeight: 0.86, color: t.ink }}>{mf.roundNo.padStart(2, "0")}</div>}
    </Page>
  );
}

/* ================= 5 · Kit gradient (matchday) — Pinterest full-bleed colour posters ================= */

/**
 * Gradiente do equipamento (matchday): a full-bleed gradient in his kit colours (no blur); his colour portrait large at
 * the top fading into it; the kicker (or MATCHDAY) huge in a bold slanted italic across the middle; the fixture under it.
 */
export function Progradient({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Matchday").toUpperCase();
  const kPx = Math.min(230 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1) * 1.05));
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const ky = ft - 60 * k - kPx * 0.86;
  const two = t.acc === "#ffffff" ? shade(t.ink, 0.45) : t.acc;
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(200deg, ${two} 0%, ${t.ink} 45%, ${shade(t.ink, -0.7)} 100%)` }} />
      {s && <Portrait s={s} cx={W / 2} cy={top + 400 * k} fh={300 * k} mode="color" fade={35} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: ky, textAlign: "center", fontFamily: DISPLAY, fontSize: kPx, lineHeight: 0.86, color: "#fff", transform: "skewX(-10deg)", textShadow: "0 12px 34px rgba(0,0,0,.35)" }}>{word}</div>
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 6 · Card stack (matchday) — "who / what / when / where" info cards ================= */

/**
 * Quem · o quê · quando · onde (matchday): four clean white cards stacked down the left — WHO (his name and club), WHAT
 * (the fixture), WHEN (date and the flags clock), WHERE (the ground) — each with a club-colour label; him full-body on
 * the right in front of the cards' edge.
 */
export function Procardstack({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const cw = W * 0.58 - M;
  const iw = cw - 52 * k;
  const crest = d.club?.crestUrl;
  const who = lines3(fullName(d), 40 * k * ts, iw - 60 * k, 0.02, 20 * k);
  const what = wrapCaps(`${fx.homeName} X ${fx.awayName}`.toUpperCase(), 34 * k * ts, iw - 40 * k, 3, 22 * k * ts);
  const where = lines3((mf.venue || fx.venue || "").toUpperCase(), 30 * k * ts, iw - 40 * k, 0.04, 15 * k);
  const card = (label: string, body: React.ReactNode, i: number) => (
    <div key={label} style={{ background: "#fff", borderRadius: 18 * k, padding: `${20 * k}px ${26 * k}px`, boxShadow: "0 16px 40px rgba(0,0,0,.25)", marginLeft: i % 2 ? 26 * k : 0, display: "flex", flexDirection: "column", gap: 6 * k }}>
      <div style={caps(17 * k, 0.4, 900, t.ink)}>{label}</div>
      {body}
    </div>
  );
  const p = stripFigure(d, M + cw - 30 * k, W - 12, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - top - 120 * k), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.75)})` }} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: top + 140 * k, width: cw, display: "flex", flexDirection: "column", gap: 18 * k }}>
        {card(
          "WHO",
          <div style={{ display: "flex", alignItems: "center", gap: 12 * k }}>
            {crest && <img src={crest} alt="" style={{ height: 44 * k, width: 44 * k, objectFit: "contain" }} />}
            <div>{who.lines.map((l, j) => <div key={j} style={caps(who.px, 0.02, 900, "#16181c")}>{l}</div>)}</div>
          </div>,
          0,
        )}
        {card("WHAT", <div>{what.lines.map((l, j) => <div key={j} style={caps(what.px, 0.04, 900, "#16181c")}>{l}</div>)}</div>, 1)}
        {card(
          "WHEN",
          <>
            <div style={caps(32 * k * ts, 0.06, 900, "#16181c")}>{(mf.longDate || mf.date).toUpperCase()}</div>
            <FlagClock d={d} px={28 * k * ts} color="#16181c" gap={16 * k} />
          </>,
          0,
        )}
        {where.lines.length > 0 && card("WHERE", <div>{where.lines.map((l, j) => <div key={j} style={caps(where.px, 0.04, 900, "#16181c")}>{l}</div>)}</div>, 1)}
      </div>
      <Front d={d} p={p} />
      {fx.awayCrest && fx.homeCrest && (
        <div style={{ position: "absolute", right: M, top, display: "flex", gap: 12 * k }}>
          <img src={fx.homeCrest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />
          <img src={fx.awayCrest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />
        </div>
      )}
    </Page>
  );
}
