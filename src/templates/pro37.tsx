/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { isoFromShortDate } from "@/lib/timezone";
import { DMSERIF } from "./fx";
import { ourClub } from "./goalnatcaption";
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

/* Round 50 · new pro families (Pinterest "football poster editorial serif 2025", "matchday poster premier league 2026 behance"). */

const W = CANVAS_W;
const isCut = (d: RenderData) => (d.cut?.bottom ?? 0) > 0;
const fullName = (d: RenderData) => [d.content.firstName, d.content.lastName].filter(Boolean).join(" ");

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

/* ================= 1 · Arched window (matchday) — editorial arch-framed portrait ================= */

/**
 * Janela em arco (matchday): his colour portrait in a tall arched window set off-centre to the left on a paper ground; an
 * editorial caption in the right column — MATCHDAY in serif, his full name, the fixture, date · ground and the flags
 * clock under thin rules.
 */
export function Proarchwindow({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const aw = W * 0.56;
  const al = M;
  const at = top + 40 * k;
  const ab = lt - 70 * k;
  const r = aw / 2;
  const cx = al + aw + 34 * k;
  const cw = W - M - cx;
  const vs = vsLines(d, 22 * k * ts, cw, 12 * k);
  const nl = lines3(fullName(d).toUpperCase(), 28 * k * ts, cw, 0.02, 14 * k);
  const clip = `inset(${at}px ${W - al - aw}px ${H - ab}px ${al}px round ${r}px ${r}px 0px 0px)`;
  return (
    <Page d={d} bg="#efe9df" light>
      <div style={{ position: "absolute", left: al, top: at, width: aw, height: ab - at, borderRadius: `${r}px ${r}px 0 0`, background: t.ink }} />
      {s && <Portrait s={s} cx={al + aw / 2} cy={at + r + 120 * k} fh={240 * k} mode="color" style={{ clipPath: clip }} />}
      <div style={{ position: "absolute", left: al - 12 * k, top: at - 12 * k, width: aw + 24 * k, height: ab - at + 12 * k, borderRadius: `${r + 12 * k}px ${r + 12 * k}px 0 0`, border: `${2 * k}px solid #16181c`, borderBottom: "none" }} />
      <div style={{ position: "absolute", left: cx, top: at + r * 0.9, width: cw, display: "flex", flexDirection: "column", gap: 12 * k }}>
        <div style={{ fontFamily: DMSERIF, fontSize: 78 * k, lineHeight: 0.95, color: t.ink }}>Match&shy;day</div>
        <div style={caps(15 * k, 0.3, 800, "#6b6f78")}>{roundTitle(d)}</div>
        <div style={{ borderTop: `${2 * k}px solid #16181c`, paddingTop: 12 * k }}>
          {nl.lines.map((l, i) => (
            <div key={i} style={caps(nl.px, 0.02, 900, "#16181c")}>{l}</div>
          ))}
        </div>
        <div style={{ borderTop: `${2 * k}px solid #16181c`, paddingTop: 12 * k }}>
          {vs.lines.map((l, i) => (
            <div key={i} style={caps(vs.px, 0.04, 800, "#16181c")}>{l}</div>
          ))}
        </div>
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 28 * k * ts, color: "#33363c" }}>{dateVenue(d)}</div>
        <FlagClock d={d} px={22 * k * ts} color="#16181c" gap={12 * k} dir="column" />
      </div>
    </Page>
  );
}

/* ================= 2 · Two bands (matchday) — close-up band + action band ================= */

/**
 * Duas faixas (matchday): two wide horizontal photo bands — his colour close-up on top, his real action photo with its
 * own surroundings below — with a club-colour MATCHDAY bar between them; the fixture card at the foot.
 */
export function Protwobands({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const b1t = top;
  const barH = 130 * k;
  const avail = ft - 40 * k - b1t - barH;
  const b1b = b1t + avail * 0.42;
  const b2t = b1b + barH;
  const b2b = ft - 40 * k;
  const g = standAt(d, 540, b2t + (b2b - b2t) * 0.3, 150);
  const shift = Math.max(0, b2t + g.fs * 1.9 - g.fy);
  return (
    <Page d={d} bg="#0b0c10">
      {s && <Portrait s={s} cx={W / 2} cy={b1t + (b1b - b1t) * 0.5} fh={(b1b - b1t) * 0.55} mode="color" style={{ clipPath: `inset(${b1t}px 0px ${H - b1b}px 0px)` }} />}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${b2t}px 0px ${H - b2b}px 0px)` }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}>
          <NatGround place={g} W={W} H={H} />
          <NatFigure data={d} place={g} W={W} H={H} clean />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: b1b, height: barH, background: t.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 96 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        <div style={caps(15 * k, 0.4, 800, "rgba(255,255,255,.85)")}>{roundTitle(d)}</div>
      </div>
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Corner letters (matchday) — Pinterest "FUL / CHE" ================= */

/** The short code of a club: its first three letters of the most distinctive word. */
function code(name: string) {
  const skip = /^(sc|fc|cf|cd|ad|gd|ud|sl|ac|as|sd|cs|sk|fk|pfc|pfk|nk|desp\.?|desportivo|sporting|club|clube|university|of|at|the)$/i;
  const w = name.split(/\s+/).find((x) => !skip.test(x) && /\p{L}{3}/u.test(x)) ?? name;
  return [...w.normalize("NFC").replace(/[^\p{L}]/gu, "")].slice(0, 3).join("").toUpperCase();
}

/**
 * Letras nos cantos (matchday): the home club's short code spread wide across the top, the away code across the foot
 * (three letters each, tracked to the edges), him full-body in front between them; the exact names, date and flags
 * clock in a small card.
 */
export function Procorners({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const hc = code(fx.homeName);
  const ac = code(fx.awayName);
  const px = 300 * k;
  const yA = lt - 200 * k - px * 0.86;
  const vs = vsLines(d, 20 * k * ts, W - 2 * M - 40 * k, 12 * k);
  const row = (c: string, y: number, col: string) => (
    <div style={{ position: "absolute", left: M, right: M, top: y, display: "flex", justifyContent: "space-between", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.86, color: col }}>
      {[...c].map((ch, i) => (
        <span key={i}>{ch}</span>
      ))}
    </div>
  );
  const p = isCut(d) ? bustAt(d, 540, top + px + 220 * k, 120 * k) : stripFigure(d, 12, W - 12, yA + px * 0.6, Math.min(1150 * k / 1.3, yA + px * 0.6 - top - px * 0.4), top + px * 0.5, 140 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.7)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.25)}, ${shade(t.ink, -0.85)})` }} />
      {row(hc, top, "#fff")}
      {row(ac, yA, shade(t.ink, 0.35))}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: yA + px * 0.86 + 14 * k, padding: `${12 * k}px ${16 * k}px`, borderRadius: 12 * k, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * k }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(13 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{`MATCHDAY · ${dateVenue(d)}`}</div>
        <FlagClock d={d} px={20 * k * ts} color="#fff" gap={14 * k} />
      </div>
    </Page>
  );
}

/* ================= 4 · Spotlight plate (matchday) — a club-colour disc under his feet ================= */

/**
 * Prato de luz (matchday): him full-body standing on a flat club-colour ellipse plate (no glow), the fixture running
 * round the plate's front rim; MATCHDAY huge at the top; date · ground and the flags clock under the plate.
 */
export function Proplate({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const ey = lt - 270 * k;
  const rx = 440 * k;
  const ry = 120 * k;
  const ring = `${fx.homeName}  ✕  ${fx.awayName}`.toUpperCase();
  const arc = Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 0.95;
  const rPx = Math.min(30 * k, arc / Math.max(1, ring.length * 0.7));
  const path = `M ${W / 2 - rx * 0.98} ${ey} A ${rx * 0.98} ${ry * 0.98} 0 0 0 ${W / 2 + rx * 0.98} ${ey}`;
  const p = isCut(d) ? bustAt(d, 540, top + 520 * k, 120 * k) : stripFigure(d, 12, W - 12, ey + 10 * k, Math.min(1150 * k / 1.3, ey + 10 * k - top - 140 * k), H * 0.38);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.45)}, ${shade(t.ink, -0.85)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="pro-plate" d={path} />
        </defs>
        <ellipse cx={W / 2} cy={ey} rx={rx + 26 * k} ry={ry + 14 * k} fill={shade(t.ink, -0.4)} />
        <ellipse cx={W / 2} cy={ey} rx={rx} ry={ry} fill={t.ink} stroke="#fff" strokeWidth={3 * k} />
      </svg>
      <Front d={d} p={p} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text style={{ fontFamily: DISPLAY, fontSize: rPx, letterSpacing: "0.08em" }} fill="#fff" dy={rPx * 0.35}>
          <textPath href="#pro-plate" startOffset="50%" textAnchor="middle">
            {ring}
          </textPath>
        </text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 126 * k, textAlign: "center", ...caps(18 * k, 0.4, 800, "rgba(255,255,255,.85)") }}>{roundTitle(d)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: ey + ry + 50 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k }}>
        <div style={caps(16 * k * ts, 0.14, 700, "#fff")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={24 * k * ts} color="#fff" gap={20 * k} />
      </div>
    </Page>
  );
}

/* ================= 5 · Issue spine (matchday) — editorial magazine spine ================= */

/**
 * Lombada (matchday): a club-colour magazine spine down the left edge — the issue (the round), MATCHDAY and the season
 * set vertically with the crest at its head; his real photo with its own surroundings filling the cover; a serif cover
 * title with his surname and the fixture card at the foot.
 */
export function Prospine({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const mf = matchFacts(d);
  const sw = 120 * k;
  const crest = d.club?.crestUrl;
  const iso = isoFromShortDate(d.content.date) || "";
  const y = Number(iso.slice(0, 4)) || new Date().getFullYear();
  const mo = Number(iso.slice(5, 7)) || 9;
  const sy = mo >= 7 ? y : y - 1;
  const season = `${sy}/${String((sy + 1) % 100).padStart(2, "0")}`;
  const spine = `${mf.roundNo ? `ISSUE ${mf.roundNo}  ·  ` : ""}MATCHDAY  ·  ${season}`;
  const sur = d.content.lastName || d.content.firstName || "";
  const sPx = Math.min(170 * k, (W - sw - 2 * M) / Math.max(0.1, wordW(sur, 1) * 1.1));
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const g = standAt(d, sw + (W - sw) / 2, 820, 170);
  const cx = sw / 2;
  const cy = H / 2 + 60 * k;
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px 0px ${sw}px)` }}>
        <NatGround place={g} W={W} H={H} style={{ filter: "contrast(1.05) brightness(.88)" }} />
        <NatFigure data={d} place={g} W={W} H={H} clean />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,.7))" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: sw, background: t.ink }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: sw * 0.15, top: top, width: sw * 0.7, height: sw * 0.7, objectFit: "contain", filter: CREST_HALO }} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: 50 * k, letterSpacing: "0.12em" }} fill="#fff">
          {spine}
        </text>
      </svg>
      <div style={{ position: "absolute", left: sw, right: 0, top, textAlign: "center", fontFamily: DMSERIF, fontSize: sPx, lineHeight: 1, color: "#fff", textShadow: "0 8px 26px rgba(0,0,0,.45)" }}>{sur}</div>
      <div style={{ position: "absolute", left: sw + 16 * k, right: 16 * k, top: ft - 22 * k, height: fh + 44 * k, borderRadius: 18 * k, background: "rgba(6,8,12,.76)" }} />
      <div style={{ position: "absolute", left: sw, right: 0, top: ft }}>
        <div style={{ position: "relative", marginLeft: -M, marginRight: -M }}>
          <Foot d={d} top={0} />
        </div>
      </div>
    </Page>
  );
}

/* ================= 6 · Schedule (matchday) — his next fixtures ================= */

/**
 * Próximos jogos (matchday): a clean schedule card listing his next three games from his record — date, home/away, the
 * opponent's crest and exact name, the kick-off — with this game highlighted in the club colour; him full-body on the
 * right. With no upcoming games on record, the card shows this game alone.
 */
export function Proschedule({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const club = ourClub(d);
  const opp0 = club.toLowerCase() === fx.awayName.toLowerCase() ? fx.homeName : fx.awayName;
  const oppCrest0 = club.toLowerCase() === fx.awayName.toLowerCase() ? fx.homeCrest : fx.awayCrest;
  const mf = matchFacts(d);
  // This game first (highlighted), then his next fixtures after it from his record.
  const thisIso = isoFromShortDate(d.content.date) || "";
  const here = { date: thisIso, opp: opp0, crest: oppCrest0, home: d.content.home !== false, time: fx.time };
  const after = (d.fixtures ?? []).filter((f) => !thisIso || f.date > thisIso).slice(0, 2).map((f) => ({ date: f.date, opp: f.opponent, crest: f.opponentCrest, home: f.home, time: f.time }));
  const rows = after;
  const list = [here, ...after];
  const cw = W * 0.6 - M;
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const fmt = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]}` : iso);
  const p = isCut(d) ? bustAt(d, W * 0.78, top + 560 * k, 110 * k) : stripFigure(d, W * 0.5, W - 12, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - top), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.8)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: top + 110 * k, ...caps(16 * k, 0.4, 800, "rgba(255,255,255,.85)") }}>{rows.length ? "THIS WEEK & NEXT UP" : roundTitle(d) || mf.comp.toUpperCase()}</div>
      <div style={{ position: "absolute", left: M, top: top + 170 * k, width: cw, display: "flex", flexDirection: "column", gap: 14 * k }}>
        {list.map((r, i) => {
          const on = i === 0;
          const ol = lines3(r.opp.toUpperCase(), 26 * k * ts, cw - 190 * k, 0.02, 13 * k);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 * k, padding: `${18 * k}px ${20 * k}px`, borderRadius: 16 * k, background: on ? t.ink : "rgba(255,255,255,.95)", boxShadow: "0 14px 34px rgba(0,0,0,.3)" }}>
              <div style={{ width: 92 * k, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={caps(22 * k, 0.02, 900, on ? "#fff" : "#16181c")}>{fmt(r.date)}</div>
                <div style={caps(13 * k, 0.3, 800, on ? "rgba(255,255,255,.8)" : t.ink)}>{r.home ? "HOME" : "AWAY"}</div>
              </div>
              {r.crest ? <img src={r.crest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: 56 * k }} />}
              <div style={{ flex: 1 }}>
                {ol.lines.map((l, j) => (
                  <div key={j} style={caps(ol.px, 0.02, 900, on ? "#fff" : "#16181c")}>{l}</div>
                ))}
                {r.time && <div style={{ ...caps(16 * k, 0.1, 700, on ? "rgba(255,255,255,.85)" : "#6b6f78"), marginTop: 4 * k }}>{r.time}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 1 && (
        <div style={{ position: "absolute", left: M, top: top + 340 * k, width: cw }}>
          <FlagClock d={d} px={24 * k * ts} color="#fff" gap={18 * k} />
        </div>
      )}
    </Page>
  );
}

