/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
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
import { CREST_HALO, Flag, FlagClock, Front, M, Page, Portrait, caps, clocksOf, dateVenue, frontFeet, portraitOf, vsLines } from "./prokit";

/* Round 38 · new pro families (Pinterest "matchday graphic mls", "soccer result graphic instagram"). */

const W = CANVAS_W;

/** The foot block most looks share: HOME X AWAY, date · ground, flags clock. */
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
const footH = (d: RenderData) => {
  const { k, ts } = frameOf(d);
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  return vs.lines.length * (vs.px + 6 * k) + 6 * k + 17 * k * ts + 14 * k + 26 * k * ts;
};

/* ================= 1 · Mirror (matchday) — Pinterest mirrored double portraits ================= */

/**
 * Espelho (matchday): two copies of his portrait facing each other across a white seam — the left mirrored in black and
 * white on charcoal, the right in colour on the club colour; MATCHDAY across the seam at the top; crests in the two top
 * corners; the fixture and flags clock at the foot over a dark fade.
 */
export function Promirror({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const wPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const half = (right: boolean) => (
    <div style={{ position: "absolute", left: right ? W / 2 : 0, top: 0, width: W / 2, height: H, overflow: "hidden", background: right ? `linear-gradient(180deg, ${shade(t.ink, 0.05)}, ${shade(t.ink, -0.5)})` : "linear-gradient(180deg, #2c2e33, #0f1012)" }}>
      {s && (
        <div style={{ position: "absolute", left: right ? -W / 2 : 0, top: 0, width: W, height: H, transform: right ? undefined : "scaleX(-1)", transformOrigin: `${W / 4}px 50%` }}>
          <Portrait s={s} cx={right ? W * 0.72 : W * 0.28} cy={top + 520 * k} fh={300 * k} mode={right ? "color" : "bw"} fade={30} />
        </div>
      )}
    </div>
  );
  return (
    <Page d={d} bg="#111">
      {half(false)}
      {half(true)}
      <div style={{ position: "absolute", left: W / 2 - 3 * k, top: 0, width: 6 * k, height: H, background: "#fff", opacity: 0.85 }} />
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: M, top, height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", right: M, top, height: 80 * k, width: 80 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 110 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.5)" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 120 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.75) 35%)" }} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 2 · Gradient orb (matchday) — Pinterest "Matchdag." blue glow ================= */

/**
 * Orbe de cor (matchday): a near-black ground with a huge soft orb of the club colour glowing behind him (a radial
 * gradient, not a blur of anything); "Matchday." in a light serif tracked over the orb's top; him full-body and sharp in
 * front; the fixture and flags clock at the foot.
 */
export function Proorb({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = frontFeet(d, 540, ft - 10 * k, 1050 * k / 1.3);
  const R = 560 * k;
  const cy = top + 220 * k + R * 0.6;
  return (
    <Page d={d} bg="#07080b">
      <div style={{ position: "absolute", left: W / 2 - R * 1.3, top: cy - R * 1.3, width: R * 2.6, height: R * 2.6, borderRadius: "50%", background: `radial-gradient(circle, ${t.glow} 0%, ${shade(t.ink, -0.2)}cc 30%, ${shade(t.ink, -0.6)}55 55%, rgba(0,0,0,0) 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DMSERIF, fontSize: 130 * k, lineHeight: 1, color: "#fff", letterSpacing: "0.01em" }}>Matchday.</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 150 * k, textAlign: "center", ...caps(16 * k, 0.5, 700, "rgba(255,255,255,.8)") }}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 60 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.85) 30%)" }} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Opponent name crossed by VS (matchday) — Pinterest "ARS VS AVL" ================= */

/**
 * Nome do adversário (matchday): a light ground; the opponent's exact name huge and stacked in outline caps across the
 * canvas, crossed by a club-colour "VS" bar; him full-body in front; his club's crest and name small at the top; date,
 * ground and the flags clock at the foot.
 */
export function Prooppname({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const weAway = d.content.home === false;
  const opp = (weAway ? fx.homeName : fx.awayName).toUpperCase();
  const oppCrest = weAway ? fx.homeCrest : fx.awayCrest;
  const ours = weAway ? fx.awayCrest : fx.homeCrest;
  const ol = lines3(opp, 300 * k, W - 2 * M, 0, 90 * k);
  const px = Math.min(ol.px, ...ol.lines.map((l) => (W - 2 * M) / Math.max(0.1, wordW(l, 1))));
  const y0 = top + 140 * k;
  const blockH = ol.lines.length * px * 0.86;
  const barY = y0 + blockH + 10 * k;
  const feet = lt - 170 * k;
  const p = frontFeet(d, 700, feet, Math.max(700 * k / 1.3, Math.min(1200 * k / 1.3, (feet - (barY + 120 * k)) / 0.97)));
  return (
    <Page d={d} bg="#f2f1ed" light>
      <div style={{ position: "absolute", left: M, top, display: "flex", alignItems: "center", gap: 14 * k }}>
        {ours && <img src={ours} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain" }} />}
        <div style={caps(18 * k, 0.3, 800, "#111")}>{roundTitle(d)}</div>
      </div>
      {oppCrest && <img src={oppCrest} alt="" style={{ position: "absolute", right: M, top, height: 70 * k, width: 70 * k, objectFit: "contain" }} />}
      {ol.lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y0 + i * px * 0.86, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.82, color: "transparent", WebkitTextStroke: `${3 * k}px #111`, whiteSpace: "nowrap" } as CSSProperties}>{l}</div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: barY, height: 100 * k, background: t.ink, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: M + 20 * k, boxSizing: "border-box", transform: "rotate(-3deg)" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 80 * k, color: "#fff", letterSpacing: "0.3em", paddingLeft: "0.3em" }}>VS</div>
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 150 * k, height: 110 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.94)", boxShadow: "0 12px 34px rgba(0,0,0,.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 * k }}>
        <div style={caps(17 * k * ts, 0.14, 700, t.ink)}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#111" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 4 · Stadium roof lines (matchday) — Pinterest Old Trafford roof posters ================= */

/**
 * Linhas da cobertura (matchday): the stadium photo on record (else his own photo's ground) cropped to its roof and
 * stands, in black and white under a club-colour wash, with a pattern of the roof's lines echoed as thin white
 * diagonals; MATCH DAY across the top; him full-body in colour in front; the fixture at the foot.
 */
export function Proroof({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const stadium = d.club?.stadiumImages?.[0] ?? null;
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const p = frontFeet(d, 560, ft - 10 * k, 1050 * k / 1.3);
  const pn = stadium ? null : standAt(d, 560, 900, 175);
  const wPx = Math.min(200 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCH DAY", 1)));
  return (
    <Page d={d} bg="#111">
      {stadium ? <img src={stadium} alt="" style={{ position: "absolute", left: 0, top: 0, width: W, height: H * 0.62, objectFit: "cover", objectPosition: "50% 20%", filter: "grayscale(1) contrast(1.25) brightness(.85)" }} /> : pn && <NatGround place={pn} W={W} H={H} style={{ filter: "grayscale(1) contrast(1.2) brightness(.7)" }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.62, background: t.ink, mixBlendMode: "multiply", opacity: 0.75 }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={-200 + i * 90 * k} y1={0} x2={-200 + i * 90 * k + 500 * k} y2={H * 0.62} stroke="#fff" strokeWidth={2 * k} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.62, bottom: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.55)}, #0b0c0f)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.45)" }}>MATCH DAY</div>
      {p.shot ? <Front d={d} p={p} /> : pn && <NatFigure data={d} place={pn} W={W} H={H} clean />}
      <div style={{ position: "absolute", left: 0, right: 0, top: ft - 60 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.6) 35%)" }} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 5 · Window + data sidebar (matchday) — Pinterest "GAME" rounded window (Fc Metz) ================= */

/**
 * Janela e dados (matchday): a dark ground; his big colour portrait inside a tall rounded-rect window in the club colour;
 * a slim sidebar down the window's left edge with both crests and labelled data (round, date, ground); him full-body in
 * front breaking out of the window's foot; GAME DAY huge across the foot with the flags clock.
 */
export function Prowindow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const wx = M + 150 * k;
  const ww = W - M - wx;
  const wTop = top;
  const wBot = lt - 330 * k;
  const p = frontFeet(d, wx + ww * 0.55, wBot + 120 * k, 1050 * k / 1.3);
  const gPx = Math.min(200 * k, (W - 2 * M) / Math.max(0.1, wordW("GAME DAY", 1)));
  const cell = (l: string, v: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 * k, marginBottom: 18 * k }}>
      <div style={caps(11 * k, 0.24, 700, "rgba(255,255,255,.65)")}>{l}</div>
      {lines3(v.toUpperCase(), 16 * k * ts, 130 * k, 0, 10 * k).lines.map((x, i) => (
        <div key={i} style={caps(lines3(v.toUpperCase(), 16 * k * ts, 130 * k, 0, 10 * k).px, 0, 800, "#fff")}>{x}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg="#0e1014">
      <div style={{ position: "absolute", left: wx, top: wTop, width: ww, height: wBot - wTop, borderRadius: 40 * k, overflow: "hidden", background: `linear-gradient(170deg, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.4)})` }}>
        {s && (
          <div style={{ position: "absolute", left: -wx, top: -wTop, width: W, height: H }}>
            <Portrait s={s} cx={wx + ww / 2} cy={wTop + 380 * k} fh={300 * k} mode="color" fade={30} />
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: M, top: wTop, width: 130 * k, display: "flex", flexDirection: "column" }}>
        {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
          <img key={i} src={u!} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain", marginBottom: 16 * k, filter: CREST_HALO }} />
        ))}
        <div style={{ height: 10 * k }} />
        {cell("ROUND", roundTitle(d))}
        {fx.date && cell("DATE", fx.date)}
        {fx.venue && cell("GROUND", fx.venue)}
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wBot + 40 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.8) 25%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - 110 * k - gPx * 0.82 - 50 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff" }}>GAME DAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - 90 * k, display: "flex", justifyContent: "center" }}>
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 6 · Away day (matchday) — the flags clock as the hero ================= */

/**
 * Jogo fora · dois fusos (matchday): for an away game abroad — two big clocks side by side, each under its round flag
 * (the local kick-off and the time back home), joined by a dashed route line; AWAY DAY on top with both crests and the
 * ground; his big portrait at the foot. At home (one clock) it reads MATCHDAY with the single clock.
 */
export function Proawayday({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const clocks = clocksOf(d);
  const away = d.content.home === false;
  const head = away ? "AWAY DAY" : "MATCHDAY";
  const hPx = Math.min(180 * k, (W - 2 * M) / Math.max(0.1, wordW(head, 1)));
  const cy = top + hPx * 0.82 + 260 * k;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const colW = (W - 2 * M) / Math.max(1, clocks.length);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.15)}, ${shade(t.ink, -0.72)})` }} />
      {s && <Portrait s={s} cx={W / 2} cy={lt - 260 * k} fh={300 * k} mode="color" fade={30} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: lt - 600 * k, height: 300 * k, background: `linear-gradient(to bottom, ${shade(t.ink, -0.6)}, transparent)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: hPx, lineHeight: 0.82, color: "#fff" }}>{head}</div>
      <div style={{ position: "absolute", left: M, right: M, top: top + hPx * 0.82 + 20 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={caps(17 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
      </div>
      {clocks.length > 1 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={M + colW / 2 + 90 * k} y1={cy} x2={W - M - colW / 2 - 90 * k} y2={cy} stroke="#fff" strokeOpacity={0.6} strokeWidth={4 * k} strokeDasharray={`${14 * k} ${12 * k}`} />
        </svg>
      )}
      <div style={{ position: "absolute", left: M, right: M, top: cy - 90 * k, display: "flex" }}>
        {clocks.map((c, i) => (
          <div key={i} style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
            <Flag tag={c.tag} size={86 * k} />
            <div style={{ fontFamily: DISPLAY, fontSize: 120 * k * ts, lineHeight: 0.9, color: "#fff" }}>{c.time}</div>
            <div style={caps(15 * k, 0.3, 700, "rgba(255,255,255,.75)")}>{i === 0 ? "LOCAL" : "AT HOME"}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}
