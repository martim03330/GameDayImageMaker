/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
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
import { CREST_HALO, Flag, FlagClock, Front, M, Page, Portrait, caps, clocksOf, dateVenue, frontFeet, portraitOf, vsLines } from "./prokit";

/* Round 36 · new pro families (Pinterest "college soccer media day graphic", "matchday graphic la liga"). */

const W = CANVAS_W;

/* ================= 1 · Kick-off hero (matchday) — Pinterest La Liga "10:30 PM Saturday" ================= */

/**
 * Hora gigante · bandeiras (matchday): a club-colour ground with his big colour portrait fading in from the top; the
 * kick-off huge in condensed type at the foot with its round flag, the second clock under it with its flag; the date and
 * ground beside; MATCH DAY, both crests and HOME X AWAY at the top right.
 */
export function Prokickoff({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const clocks = clocksOf(d);
  const main = clocks[0];
  const tPx = 250 * k * ts;
  const vs = vsLines(d, 22 * k * ts, W * 0.5, 14 * k);
  const footTop = lt - 50 * k - tPx * 0.82 - (clocks[1] ? 70 * k : 0);
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.65)})` }} />
      {s && <Portrait s={s} cx={W * 0.4} cy={top + 360 * k} fh={360 * k} mode="color" fade={40} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 200 * k, bottom: 0, background: `linear-gradient(to bottom, transparent, ${shade(t.ink, -0.7)} 45%)` }} />
      <div style={{ position: "absolute", left: W * 0.4, right: 0, top: 0, height: 560 * k, background: `linear-gradient(to left, ${shade(t.ink, -0.7)}e6, ${shade(t.ink, -0.7)}00)` }} />
      <div style={{ position: "absolute", right: M - 20 * k, top: top - 20 * k, width: W * 0.5 + 40 * k, height: 90 * k * 0.9 + 70 * k + 32 * k + vs.lines.length * (vs.px + 6 * k) + 40 * k, borderRadius: 18 * k, background: `${shade(t.ink, -0.7)}e8` }} />
      <div style={{ position: "absolute", right: M, top, width: W * 0.5, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 90 * k, lineHeight: 0.9, color: "#fff" }}>MATCH DAY</div>
        <div style={{ display: "flex", gap: 14 * k, margin: `${16 * k}px 0` }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO }} />
          ))}
        </div>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{l}</div>
        ))}
      </div>
      {main && (
        <div style={{ position: "absolute", left: M, top: footTop, display: "flex", alignItems: "flex-end", gap: 20 * k }}>
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap" }}>{main.time}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 * k, paddingBottom: 10 * k }}>
            <Flag tag={main.tag} size={54 * k} />
            <div style={caps(18 * k * ts, 0.14, 800, "#fff")}>{fx.date}</div>
            <div style={caps(15 * k * ts, 0.12, 600, "rgba(255,255,255,.8)")}>{lines3(fx.venue.toUpperCase(), 15 * k * ts, 300 * k, 0.12, 10 * k).lines.join(" ")}</div>
          </div>
        </div>
      )}
      {clocks[1] && (
        <div style={{ position: "absolute", left: M, top: footTop + tPx * 0.82 + 16 * k, display: "flex", alignItems: "center", gap: 12 * k }}>
          <Flag tag={clocks[1].tag} size={38 * k} />
          <div style={caps(36 * k * ts, 0.04, 800, "#fff")}>{clocks[1].time}</div>
        </div>
      )}
      {!main && <div style={{ position: "absolute", left: M, top: footTop, ...caps(30 * k, 0.1, 800, "#fff") }}>{dateVenue(d)}</div>}
    </Page>
  );
}

/* ================= 2 · Triptych (matchday) — Pinterest media-day photo strips ================= */

/**
 * Tríptico (matchday): three tall panels side by side, the same photo of him at three crops — his face close, his
 * upper body, and full length — divided by white gutters, the middle one in colour and the outer two in black and white;
 * MATCHDAY across the top, the fixture and flags clock on a club-colour band at the foot.
 */
export function Protriptych({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const g = 12 * k;
  const pw = (W - 2 * M - 2 * g) / 3;
  const wPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const pTop = top + wPx * 0.82 + 30 * k;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M - 40 * k, 15 * k);
  const bandH = 30 * k + vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 14 * k + 26 * k * ts + 30 * k;
  const bandTop = lt - 30 * k - bandH;
  const pBot = bandTop - 20 * k;
  const crops = [
    { fh: 340 * k, cy: pTop + (pBot - pTop) * 0.4, mode: "bw" as const },
    { fh: 200 * k, cy: pTop + (pBot - pTop) * 0.25, mode: "color" as const },
    { fh: 110 * k, cy: pTop + (pBot - pTop) * 0.12, mode: "bw" as const },
  ];
  return (
    <Page d={d} bg="#f4f3ef" light>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: t.ink, whiteSpace: "nowrap" }}>MATCHDAY</div>
      {s &&
        crops.map((c, i) => {
          const x = M + i * (pw + g);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: pTop, width: pw, height: pBot - pTop, overflow: "hidden", background: i === 1 ? shade(t.ink, -0.2) : "#2a2c30" }}>
              <div style={{ position: "absolute", left: -x, top: -pTop, width: W, height: H }}>
                <Portrait s={s} cx={x + pw / 2} cy={c.cy} fh={c.fh} mode={c.mode} />
              </div>
            </div>
          );
        })}
      <div style={{ position: "absolute", left: M, right: M, top: bandTop, height: bandH, background: t.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Ticket (matchday) — clean fixture ticket, Pinterest "Next Match Anfield 20:00" ================= */

/**
 * Bilhete · retrato (matchday): a dark ground; him full-body and sharp on the left; a tall clean ticket on the right —
 * a club-colour stub with the round, a perforated tear line, and the body with both crests, HOME / VS / AWAY, date,
 * kick-off with flags and the ground in labelled rows.
 */
export function Proticket({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const tw = 430 * k;
  const tx = W - M - tw;
  const tTop = top + 40 * k;
  const tBot = lt - 60 * k;
  const iw = tw - 60 * k;
  const h = lines3(fx.homeName.toUpperCase(), 40 * k * ts, iw, 0.02, 20 * k);
  const a = lines3(fx.awayName.toUpperCase(), 40 * k * ts, iw, 0.02, 20 * k);
  const nPx = Math.min(h.px, a.px);
  const venue = lines3(fx.venue.toUpperCase(), 20 * k * ts, iw, 0.04, 12 * k);
  const p = frontFeet(d, tx * 0.5, lt + 60 * k, 1300 * k / 1.3);
  const label = (s0: string) => <div style={caps(12 * k, 0.24, 700, t.ink)}>{s0}</div>;
  const stubH = 150 * k;
  const holes: CSSProperties = { position: "absolute", top: tTop + stubH - 16 * k, width: 32 * k, height: 32 * k, borderRadius: "50%", background: "#14161b" };
  return (
    <Page d={d} bg="#14161b">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 45%, ${shade(t.ink, -0.4)}, #0e0f13 75%)` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: tx, top: tTop, width: tw, height: tBot - tTop, borderRadius: 22 * k, overflow: "hidden", background: "#f7f5ef", boxShadow: "0 24px 60px rgba(0,0,0,.5)" }}>
        <div style={{ height: stubH, background: t.ink, display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${30 * k}px` }}>
          <div style={caps(14 * k, 0.3, 700, "rgba(255,255,255,.8)")}>{(matchFacts(d).comp || "MATCH").toUpperCase()}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 60 * k, lineHeight: 1, color: "#fff", marginTop: 8 * k }}>{roundTitle(d)}</div>
        </div>
        <div style={{ height: 0, borderTop: `${3 * k}px dashed rgba(0,0,0,.25)` }} />
        <div style={{ padding: `${30 * k}px`, display: "flex", flexDirection: "column", gap: 22 * k }}>
          <div style={{ display: "flex", gap: 16 * k }}>
            {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
              <img key={i} src={u!} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain" }} />
            ))}
          </div>
          <div>
            {h.lines.map((l, i) => (
              <div key={i} style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 1, color: "#111" }}>{l}</div>
            ))}
            <div style={{ ...caps(16 * k, 0.3, 800, t.ink), margin: `${8 * k}px 0` }}>VS</div>
            {a.lines.map((l, i) => (
              <div key={i} style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 1, color: "#111" }}>{l}</div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(0,0,0,.2)", paddingTop: 16 * k, display: "flex", flexDirection: "column", gap: 8 * k }}>
            {label("DATE")}
            <div style={caps(26 * k * ts, 0.04, 900, "#111")}>{fx.date}</div>
          </div>
          <div style={{ borderTop: "1px solid rgba(0,0,0,.2)", paddingTop: 16 * k, display: "flex", flexDirection: "column", gap: 8 * k }}>
            {label("KICK-OFF")}
            <FlagClock d={d} px={26 * k * ts} color="#111" gap={8 * k} dir="column" />
          </div>
          {venue.lines.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(0,0,0,.2)", paddingTop: 16 * k, display: "flex", flexDirection: "column", gap: 8 * k }}>
              {label("GROUND")}
              {venue.lines.map((l, i) => (
                <div key={i} style={caps(venue.px, 0.04, 800, "#111")}>{l}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ ...holes, left: tx - 16 * k }} />
      <div style={{ ...holes, left: tx + tw - 16 * k }} />
    </Page>
  );
}

/* ================= 4 · Name band (matchday) — Pinterest "GATORS" / "LAUREN ELDER" name over the top ================= */

/**
 * Faixa com o nome (matchday): his real photo; a club-colour band across the top third with his surname as a giant
 * watermark cut by the band's edges, the round and competition tracked over it; him sharp, his head breaking out of the
 * band; HOME X AWAY, date · ground and the flags clock on a dark fade at the foot.
 */
export function Pronameband({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const p = standAt(d, 540, 960, 175);
  // The band ends just above his head and the name sits whole inside it (it shrinks to fit the width and the band).
  const headTop = p.fy - p.fs * 1.5;
  const bandH = Math.max(380 * k, headTop - 10 * k);
  const px = Math.min((bandH - top - 60 * k) / 0.82, (W - 2 * M) / Math.max(0.1, wordW(sur, 1)));
  const vs = vsLines(d, 26 * k * ts, W - 2 * M, 15 * k);
  const footH = vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 14 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  return (
    <Page d={d} bg="#0e1014">
      <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.08) brightness(.85)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bandH, background: t.ink, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: bandH - px * 0.82 - 20 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.82, color: "rgba(255,255,255,.92)", whiteSpace: "nowrap" }}>{sur}</div>
        <div style={{ position: "absolute", left: M, top, ...caps(18 * k, 0.32, 800, "#fff") }}>{roundTitle(d)}</div>
        <div style={{ position: "absolute", right: M, top, ...caps(18 * k, 0.32, 800, "#fff") }}>{(matchFacts(d).comp || "").toUpperCase()}</div>
      </div>
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 100 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.78) 40%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 5 · This week (matchday) — Pinterest "Next Match" lists / schedule cards ================= */

/**
 * Esta semana (matchday): a deep club-colour ground; his big colour portrait on the right; THIS WEEK in condensed caps
 * at the top-left and the next games on record listed as rows — date, opponent crest and exact name, kick-off, H/A — the
 * first (this edit's game) highlighted; with no fixtures on record, this game alone.
 */
export function Proweek({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const rowsData = (d.fixtures ?? []).slice(0, 4).map((f) => ({ date: `${Number(f.date.slice(8, 10))} ${MON[Number(f.date.slice(5, 7)) - 1]}`, crest: f.opponentCrest, name: f.opponent, time: f.time, ha: f.home ? "H" : "A" }));
  const opp = d.content.home === false ? { name: fx.homeName, crest: fx.homeCrest } : { name: fx.awayName, crest: fx.awayCrest };
  const rows = rowsData.length ? rowsData : [{ date: fx.date, crest: opp.crest, name: opp.name, time: fx.time, ha: d.content.home === false ? "A" : "H" }];
  const cw = W - 2 * M;
  const rowH = 120 * k;
  const listTop = lt - 50 * k - rows.length * (rowH + 12 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.7)})` }} />
      {s && <Portrait s={s} cx={W * 0.62} cy={top + 360 * k} fh={330 * k} mode="color" fade={42} />}
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 150 * k, lineHeight: 0.84, color: "#fff" }}>
        THIS
        <br />
        WEEK
      </div>
      <div style={{ position: "absolute", left: M, top: top + 270 * k, ...caps(16 * k, 0.3, 700, "rgba(255,255,255,.8)") }}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
      {rows.map((r, i) => {
        const nm = lines3(r.name.toUpperCase(), 28 * k * ts, cw - 420 * k, 0.02, 15 * k);
        return (
          <div key={i} style={{ position: "absolute", left: M, width: cw, top: listTop + i * (rowH + 12 * k), height: rowH, borderRadius: 16 * k, background: i === 0 ? "#fff" : "rgba(255,255,255,.12)", display: "flex", alignItems: "center", gap: 20 * k, padding: `0 ${24 * k}px`, boxSizing: "border-box", color: i === 0 ? "#111" : "#fff" }}>
            <div style={{ width: 110 * k, ...caps(22 * k * ts, 0.04, 900, i === 0 ? t.ink : "#fff") }}>{r.date}</div>
            {r.crest ? <img src={r.crest} alt="" style={{ height: 66 * k, width: 66 * k, objectFit: "contain", filter: CREST_HALO }} /> : <div style={{ width: 66 * k }} />}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {nm.lines.map((l, j) => (
                <div key={j} style={caps(nm.px, 0.02, 900, i === 0 ? "#111" : "#fff")}>{l}</div>
              ))}
            </div>
            <div style={{ ...caps(24 * k * ts, 0.02, 900, i === 0 ? "#111" : "#fff"), width: 90 * k, textAlign: "right" }}>{r.time}</div>
            <div style={{ width: 44 * k, height: 44 * k, borderRadius: 10 * k, background: i === 0 ? t.ink : "rgba(255,255,255,.2)", color: "#fff", fontFamily: DISPLAY, fontSize: 26 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.ha}</div>
          </div>
        );
      })}
    </Page>
  );
}

