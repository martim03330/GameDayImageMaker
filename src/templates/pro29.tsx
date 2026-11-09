/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
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
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, clocksOf, dateVenue, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure } from "./pro19";

/* Round 46 · new pro families (Pinterest "football player portrait poster typography", "matchday design la liga 2026"). */

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

/* ================= 1 · Offset halves (matchday) — Pinterest split-shift portraits ================= */

/**
 * Retrato desfasado (matchday): his big colour portrait cut horizontally into two halves at his collar line (below the
 * face, which stays whole) — the lower half shifted sideways with a thin white seam; MATCHDAY and the round at the top;
 * the fixture card at the foot.
 */
export function Prooffset({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const pfh = 280 * k;
  const pcy = top + 170 * k + pfh * 1.1;
  const seam = pcy + pfh * 0.85;
  const dx = 70 * k;
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.3)}, ${shade(t.ink, -0.85)})` }} />
      {s && <Portrait s={s} cx={W / 2} cy={pcy} fh={pfh} mode="color" style={{ clipPath: `inset(0px 0px ${H - seam}px 0px)` }} />}
      {s && <Portrait s={s} cx={W / 2 + dx} cy={pcy} fh={pfh} mode="color" fade={25} style={{ clipPath: `inset(${seam}px 0px 0px 0px)` }} />}
      {/* A club-colour wash on the shifted lower half. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: seam, bottom: 0, background: t.ink, mixBlendMode: "multiply", opacity: 0.55 }} />
      {/* The second scale: his whole figure small in front, lower right. */}
      <Front d={d} p={isCut(d) ? bustAt(d, W * 0.74, seam + 260 * k, 70 * k) : stripFigure(d, W * 0.52, W - 12, ft - 30 * k, Math.min(760 * k, ft - 30 * k - (pcy - pfh * 0.2)), seam - 120 * k, 90 * k)} />
      {/* His surname tracked along the seam, in a band. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: seam - 30 * k, height: 60 * k, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", borderTop: `${3 * k}px solid #fff`, borderBottom: `${3 * k}px solid #fff` }}>
        <div style={caps(Math.min(34 * k, (W - 2 * M) / Math.max(1, sur.length * 1.5)), 0.6, 900, "#fff")}>{sur}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 124 * k, textAlign: "center", ...caps(18 * k, 0.4, 800, "rgba(255,255,255,.85)") }}>{roundTitle(d)}</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 2 · Stadium window (matchday) — circle-window posters ================= */

/**
 * Janela do estádio (matchday): a big circular window in a club-colour field showing his club's stadium (or the real
 * ground from his photo when no stadium image exists), a thick white rim; him full-body in front of the window's foot;
 * MATCHDAY over it; the fixture card at the foot.
 */
export function Prostadiumwindow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const R = 430;
  const cx = W / 2;
  const cy = top + 170 * k + R;
  const stadium = d.club?.stadiumImages?.[0] ?? null;
  const g = standAt(d, 540, cy - R * 0.2, 150);
  const p = isCut(d) ? bustAt(d, 540, cy + R * 0.4, 110 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1100 * k / 1.3, ft + 10 * k - (cy - R * 0.4)), cy);
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.7)})` }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `circle(${R}px at ${cx}px ${cy}px)` }}>
        {stadium ? <img src={stadium} alt="" style={{ position: "absolute", left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, objectFit: "cover" }} /> : <NatGround place={g} W={W} H={H} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,.45))" }} />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#fff" strokeWidth={12 * k} />
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Cover story (matchday) — Pinterest "Ronaldo" magazine cover ================= */

/**
 * Reportagem de capa (matchday): a magazine cover — a serif masthead with his surname huge across the top, his colour
 * portrait filling the cover below it, cover lines down the left (the round, the fixture, date and the flags clock) on a
 * soft gradient; a thin rule and the club at the foot.
 */
export function Procoverstory({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const sur = d.content.lastName || d.content.firstName || "";
  const mPx = Math.min(240 * k, (W - 2 * M) / Math.max(0.1, wordW(sur, 1) * 1.08));
  const mB = top + mPx * 0.95;
  const vs = vsLines(d, 24 * k * ts, W * 0.42, 13 * k);
  const club = lines3(ourClub(d).toUpperCase(), 16 * k * ts, W - 2 * M, 0.3, 11 * k);
  return (
    <Page d={d} bg="#ece6dc" light>
      {s && <Portrait s={s} cx={W * 0.58} cy={mB + 330 * k} fh={300 * k} mode="color" fade={22} />}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DMSERIF, fontSize: mPx, lineHeight: 1, color: t.ink }}>{sur}</div>
      {/* Cover lines sit below his chin (never over the face). */}
      <div style={{ position: "absolute", left: M - 14 * k, bottom: H - (lt - 110 * k), width: W * 0.48, display: "flex", flexDirection: "column", gap: 10 * k, padding: `${16 * k}px ${14 * k}px`, borderRadius: 12 * k, background: "rgba(236,230,220,.92)" }}>
        <div style={caps(18 * k, 0.3, 900, t.ink)}>{roundTitle(d)}</div>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.02, 900, "#16181c")}>{l}</div>
        ))}
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 30 * k * ts, color: "#33363c" }}>{dateVenue(d)}</div>
        {clocksOf(d).length > 0 && <FlagClock d={d} px={24 * k * ts} color="#16181c" gap={14 * k} dir="column" />}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: lt - 90 * k, borderTop: `${2 * k}px solid #16181c`, paddingTop: 10 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {club.lines.map((l, i) => (
          <div key={i} style={caps(club.px, 0.3, 800, "#16181c")}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 4 · Kit hoops (matchday) — two-tone horizontal kit stripes ================= */

/**
 * Riscas horizontais (matchday): wide two-tone horizontal hoops from his kit (club colour and white, or its accent)
 * across the whole canvas; him full-body in front; MATCHDAY on a dark band at the top; the fixture card at the foot.
 */
export function Prohoops({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const two = t.acc === "#ffffff" ? "#f1f1ee" : t.acc;
  const hh = 120 * k;
  const n = Math.ceil(H / hh);
  const p = isCut(d) ? bustAt(d, 540, top + 520 * k, 120 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1150 * k / 1.3, ft + 10 * k - top - 160 * k), H * 0.4);
  return (
    <Page d={d} bg={t.ink}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * hh, height: hh, background: i % 2 ? two : t.ink }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,.55))" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 20 * k, height: 150 * k, background: "rgba(6,8,12,.78)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 104 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        <div style={caps(16 * k, 0.4, 800, "rgba(255,255,255,.85)")}>{roundTitle(d)}</div>
      </div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 5 · Fixture rows (matchday) — typographic rows with a crest column ================= */

/**
 * Linhas do jogo (matchday): the fixture set as bold stacked rows under thin rules — the home crest and exact name,
 * "versus", the away crest and exact name, the date, the kick-off flags clock, the ground — with the crests in their own
 * left column; him full-body on the right behind the rows' end.
 */
export function Procrestrows({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const cc = 110 * k;
  const tw = W * 0.66 - M - cc - 20 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 76 * k * ts, tw, 0, 30 * k);
  const an = lines3(fx.awayName.toUpperCase(), 76 * k * ts, tw, 0, 30 * k);
  const nPx = Math.min(hn.px, an.px, ...[...hn.lines, ...an.lines].map((l) => tw / Math.max(0.1, wordW(l, 1))));
  const rowsTop = top + 140 * k;
  const p = stripFigure(d, W * 0.5, W - 12, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - top - 100 * k), H * 0.4);
  const row = (crest: string | null, lines: string[], key: string) => (
    <div key={key} style={{ display: "flex", alignItems: "center", gap: 20 * k, borderTop: `${2 * k}px solid rgba(255,255,255,.5)`, padding: `${16 * k}px 0` }}>
      <div style={{ width: cc, display: "flex", justifyContent: "center" }}>{crest && <img src={crest} alt="" style={{ height: cc * 0.85, width: cc * 0.85, objectFit: "contain", filter: CREST_HALO }} />}</div>
      <div>{lines.map((l, i) => <div key={i} style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 0.92, color: "#fff", whiteSpace: "nowrap" }}>{l}</div>)}</div>
    </div>
  );
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.35)}, ${shade(t.ink, -0.85)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: rowsTop, width: W * 0.66 - M, display: "flex", flexDirection: "column" }}>
        {row(fx.homeCrest, hn.lines, "h")}
        <div style={{ borderTop: `${2 * k}px solid rgba(255,255,255,.5)`, padding: `${10 * k}px 0 ${10 * k}px ${cc + 20 * k}px`, fontFamily: DMSERIF, fontStyle: "italic", fontSize: 50 * k, color: t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.2) }}>versus</div>
        {row(fx.awayCrest, an.lines, "a")}
        <div style={{ borderTop: `${2 * k}px solid rgba(255,255,255,.5)`, padding: `${14 * k}px 0 ${14 * k}px ${cc + 20 * k}px`, ...caps(26 * k * ts, 0.06, 900, "#fff") }}>{(mf.longDate || mf.date).toUpperCase()}</div>
        {clocksOf(d).length > 0 && (
          <div style={{ borderTop: `${2 * k}px solid rgba(255,255,255,.5)`, padding: `${14 * k}px 0 ${14 * k}px ${cc + 20 * k}px` }}>
            <FlagClock d={d} px={28 * k * ts} color="#fff" gap={18 * k} />
          </div>
        )}
        {mf.venue && <div style={{ borderTop: `${2 * k}px solid rgba(255,255,255,.5)`, borderBottom: `${2 * k}px solid rgba(255,255,255,.5)`, padding: `${14 * k}px 0 ${14 * k}px ${cc + 20 * k}px`, ...caps(20 * k * ts, 0.1, 800, "rgba(255,255,255,.85)") }}>{mf.venue}</div>}
      </div>
    </Page>
  );
}

/* ================= 6 · Minimal bar (matchday) — Pinterest "SANÉ" single-bar posters ================= */

/**
 * Barra minimal (matchday): a white poster; MATCHDAY huge in black at the top; a single bold club-colour bar across the
 * lower third with the fixture, date · ground and flags clock in white inside it; him full-body standing on the bar.
 */
export function Prominimalbar({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const wPx = Math.min(240 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 14 * k);
  // The text sits in the bar's lower part: his feet (and a ball at them) stand on its top edge without covering it.
  const barH = 130 * k + vs.lines.length * vs.px * 1.2 + 80 * k;
  const barT = lt - 60 * k - barH;
  const p = isCut(d) ? bustAt(d, 540, top + wPx + 260 * k, 120 * k) : stripFigure(d, 12, W - 12, barT + 20 * k, Math.min(1150 * k / 1.3, barT + 20 * k - top - 34 * k - wPx * 0.6), H * 0.36);
  return (
    <Page d={d} bg="#f6f5f2" light>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(18 * k, 0.4, 800, t.ink) }}>{roundTitle(d)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 34 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.86, color: "#111" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: barT, height: barH, background: t.ink }} />
      <Front d={d} p={p} light />
      {isCut(d) && <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: barT + 90 * k, height: barH - 110 * k, borderRadius: 14 * k, background: `${shade(t.ink, -0.5)}e6` }} />}
      <div style={{ position: "absolute", left: M, right: M, top: barT + 110 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(16 * k * ts, 0.14, 700, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}
