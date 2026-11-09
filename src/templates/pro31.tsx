/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { NATION_ZONES, playerRefTag } from "@/lib/timezone";
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
import { CREST_HALO, Flag, FlagClock, Front, M, Page, Portrait, caps, dateVenue, portraitOf, vsLines } from "./prokit";
import { footH } from "./pro15";
import { bustAt, stripFigure } from "./pro19";

/* Round 47 · new pro families (Pinterest "matchday poster bundesliga 2026", "football poster photo manipulation clean"). */

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

/** Vertical caps on a bar: one line fitted to the bar's length. */
function BarText({ text, x, y, len, w, color }: { text: string; x: number; y: number; len: number; w: number; color: string }) {
  const px = Math.min(w * 0.72, len / Math.max(0.1, wordW(text, 1)));
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${x} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill={color}>
      {text}
    </text>
  );
}

/* ================= 1 · Side bars (matchday) — portraits framed by two vertical bars ================= */

/**
 * Barras laterais (matchday): his big colour portrait between two tall club-colour bars — MATCHDAY running up the left
 * bar, the round up the right bar; the fixture card at the foot.
 */
export function Prosidebars({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const bw = 130 * k;
  const bt = top;
  const bb = ft - 50 * k;
  const len = bb - bt - 60 * k;
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${shade(t.ink, -0.4)}, ${shade(t.ink, -0.85)} 75%)` }} />
      {s && <Portrait s={s} cx={W / 2} cy={bt + 420 * k} fh={290 * k} mode="color" fade={25} style={{ clipPath: `inset(0px ${M + bw + 10 * k}px 0px ${M + bw + 10 * k}px)` }} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={M} y={bt} width={bw} height={bb - bt} fill={t.ink} />
        <rect x={W - M - bw} y={bt} width={bw} height={bb - bt} fill={t.ink} />
        <BarText text="MATCHDAY" x={M + bw / 2} y={(bt + bb) / 2} len={len} w={bw} color="#fff" />
        <BarText text={roundTitle(d).toUpperCase()} x={W - M - bw / 2} y={(bt + bb) / 2} len={len} w={bw * 0.6} color="#fff" />
      </svg>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 2 · Huge word (matchday) — MATCHDAY up the canvas with him over one letter ================= */

/**
 * Palavra gigante (matchday): MATCHDAY set huge running up the left of the canvas in a lighter club shade; him full-body
 * in front, overlapping the word's letters on the right; the fixture card at the foot.
 */
export function Prohugeword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const len = ft - 40 * k - top;
  const px = Math.min(W * 0.6, len / Math.max(0.1, wordW("MATCHDAY", 1)));
  const x = M + px * 0.42;
  const y = top + len / 2;
  const p = isCut(d) ? bustAt(d, W * 0.62, top + 500 * k, 120 * k) : stripFigure(d, W * 0.3, W - 12, ft + 10 * k, Math.min(1150 * k / 1.3, ft + 10 * k - top - 80 * k), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.8)})` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${x} ${y})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill={shade(t.ink, 0.35)}>
          MATCHDAY
        </text>
      </svg>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", right: M, top, textAlign: "right", ...caps(18 * k, 0.4, 800, "#fff") }}>{roundTitle(d)}</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 3 · Panorama strip (matchday) — stadium strip across the middle ================= */

/**
 * Panorama (matchday): a wide strip across the middle showing his club's stadium (or the real ground from his photo);
 * him full-body in front, breaking out of the strip at the top and foot; MATCHDAY above it; the fixture card below.
 */
export function Propanorama({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const st = top + 260 * k;
  const sb = st + 560 * k;
  const stadium = d.club?.stadiumImages?.[0] ?? null;
  const g = standAt(d, 540, (st + sb) / 2, 130);
  const p = isCut(d) ? bustAt(d, 540, st + 80 * k, 110 * k) : stripFigure(d, 12, W - 12, ft - 20 * k, Math.min(1100 * k / 1.3, ft - 20 * k - top - 150 * k), st - 40 * k);
  return (
    <Page d={d} bg={shade(t.ink, -0.75)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.5)}, ${shade(t.ink, -0.85)})` }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${st}px 0px ${H - sb}px 0px)` }}>
        {stadium ? <img src={stadium} alt="" style={{ position: "absolute", left: 0, top: st, width: W, height: sb - st, objectFit: "cover" }} /> : <NatGround place={g} W={W} H={H} />}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${t.ink}55, rgba(0,0,0,0) 40%, rgba(0,0,0,.35))` }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: st - 3 * k, height: 6 * k, background: t.ink }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: sb - 3 * k, height: 6 * k, background: t.ink }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 4 · Player profile (matchday) — a clean data card ================= */

/**
 * Ficha do jogador (matchday): a clean profile card — his full name, the club, then labelled rows only for the data on
 * record (position, number, nationality with its round flag); MATCHDAY and the fixture at the top; him full-body in
 * colour on the right.
 */
export function Proprofile({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const cw = W * 0.56 - M;
  const nat0 = (d.player.nationality || "").trim();
  // The card is English: the stored (Portuguese) nationality mapped to its English name, else as stored.
  const nn = (x: string) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
  const nat = NATION_ZONES.find((z) => z.names.some((n) => nn(n) === nn(nat0)))?.en ?? nat0;
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const rows: [string, React.ReactNode][] = [];
  if (d.player.position) rows.push(["POSITION", d.player.position.toUpperCase()]);
  if (no) rows.push(["NUMBER", no]);
  if (nat)
    rows.push([
      "NATIONALITY",
      <span key="n" style={{ display: "flex", alignItems: "center", gap: 10 * k }}>
        <Flag tag={playerRefTag(null, nat0)} size={30 * k} />
        {nat.toUpperCase()}
      </span>,
    ]);
  const nl = lines3(fullName(d), 52 * k * ts, cw - 40 * k, 0.02, 24 * k);
  const cl = lines3(ourClub(d).toUpperCase(), 18 * k * ts, cw - 40 * k, 0.2, 11 * k);
  const vs = vsLines(d, 20 * k * ts, cw, 12 * k);
  const crest = d.club?.crestUrl;
  const cardTop = top + 200 * k + vs.lines.length * vs.px * 1.3;
  const p = isCut(d) ? bustAt(d, W * 0.78, top + 560 * k, 110 * k) : stripFigure(d, W * 0.5, W - 12, lt + 40 * k, Math.min(1250 * k / 1.3, lt + 40 * k - top - 60 * k), H * 0.4);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.2)}, ${shade(t.ink, -0.8)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column", gap: 6 * k, width: cw }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 100 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#fff")}>{l}</div>
        ))}
        <div style={caps(15 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={22 * k * ts} color="#fff" gap={16 * k} />
      </div>
      <div style={{ position: "absolute", left: M, top: cardTop, width: cw, background: "#fff", borderRadius: 20 * k, padding: `${24 * k}px ${22 * k}px`, boxShadow: "0 20px 50px rgba(0,0,0,.35)", display: "flex", flexDirection: "column", gap: 8 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * k }}>
          {crest && <img src={crest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain" }} />}
          <div style={caps(15 * k, 0.4, 900, t.ink)}>PLAYER PROFILE</div>
        </div>
        {nl.lines.map((l, i) => (
          <div key={i} style={caps(nl.px, 0.02, 900, "#16181c")}>{l}</div>
        ))}
        {cl.lines.map((l, i) => (
          <div key={"c" + i} style={caps(cl.px, 0.2, 700, t.ink)}>{l}</div>
        ))}
        <div style={{ height: 8 * k }} />
        {rows.map(([lab, v]) => (
          <div key={lab} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `${2 * k}px solid #e3e3e3`, padding: `${12 * k}px 0` }}>
            <div style={caps(14 * k, 0.3, 700, "#6b6f78")}>{lab}</div>
            <div style={{ ...caps(24 * k * ts, 0.04, 900, "#16181c"), display: "flex", alignItems: "center" }}>{v}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 5 · Circle halves (matchday) — Pinterest Frankfurt big circle ================= */

/**
 * Círculo dividido (matchday): a big circle split on a diagonal into his club's colour and near-black, a white seam; each
 * crest in its half; him full-body in front of the circle; MATCHDAY at the top; the fixture card at the foot.
 */
export function Procirclehalves({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const fh = footH(d);
  const ft = lt - 40 * k - fh;
  const R = 460;
  const cx = W / 2;
  const cy = top + 170 * k + R;
  const ourHome = d.content.home !== false;
  const a = ourHome ? t.ink : "#1b1e24";
  const b = ourHome ? "#1b1e24" : t.ink;
  const dx = R * Math.cos(Math.PI / 4);
  const p = isCut(d) ? bustAt(d, 540, cy + R * 0.3, 120 * k) : stripFigure(d, 12, W - 12, ft + 10 * k, Math.min(1100 * k / 1.3, ft + 10 * k - (cy - R * 0.6)), cy - R * 0.3);
  return (
    <Page d={d} bg={shade(t.ink, -0.8)}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="pro-ch">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>
        <g clipPath="url(#pro-ch)">
          <polygon points={`${cx - R},${cy - R} ${cx + R},${cy - R} ${cx - R},${cy + R}`} fill={a} />
          <polygon points={`${cx + R},${cy - R} ${cx + R},${cy + R} ${cx - R},${cy + R}`} fill={b} />
          <line x1={cx + dx} y1={cy - dx} x2={cx - dx} y2={cy + dx} stroke="#fff" strokeWidth={6 * k} />
        </g>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3 * k} />
      </svg>
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: cx - R * 0.72, top: cy - R * 0.62, height: 150 * k, width: 150 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", left: cx + R * 0.72 - 150 * k, top: cy + R * 0.1, height: 150 * k, width: 150 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: 130 * k, lineHeight: 0.9, color: "#fff" }}>MATCHDAY</div>
      <FootCard d={d} top={ft} />
      <Foot d={d} top={ft} />
    </Page>
  );
}

/* ================= 6 · Page number (matchday) — editorial page with a caption ================= */

/**
 * Número de página (matchday): an editorial page on paper — a giant serif page number (the round) in the top-right
 * corner, a framed real photo of him with its own surroundings, a short photo caption under it (his full name, the
 * fixture, the date), and the kick-off flags clock.
 */
export function Propagenumber({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const mf = matchFacts(d);
  const num = mf.roundNo || "";
  const nPx = 300 * k;
  const fTop = top + (num ? nPx * 0.72 : 120 * k);
  const fBot = lt - 260 * k;
  const g = standAt(d, 540, fTop + (fBot - fTop) * 0.3, 150);
  const shift = Math.max(0, fTop + g.fs * 1.9 - g.fy);
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ");
  const date = mf.longDate ? mf.longDate.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()) : "";
  const cap = `${name} — ${fx.homeName} v ${fx.awayName}${date ? `, ${date}` : ""}.`;
  return (
    <Page d={d} bg="#f1ece2" light>
      <div style={{ position: "absolute", left: M, top: top + 10 * k, ...caps(18 * k, 0.4, 800, t.ink) }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: M, top: top + 40 * k, ...caps(14 * k, 0.3, 700, "#6b6f78") }}>{roundTitle(d)}</div>
      {num && <div style={{ position: "absolute", right: M - 6 * k, top: top - 70 * k, fontFamily: DMSERIF, fontSize: nPx, lineHeight: 1, color: t.ink }}>{num}</div>}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${fTop}px ${M}px ${H - fBot}px ${M}px)` }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${shift}px)` }}>
          <NatGround place={g} W={W} H={H} />
          <NatFigure data={d} place={g} W={W} H={H} clean />
        </div>
      </div>
      <div style={{ position: "absolute", left: M, top: fBot + 18 * k, width: W - 2 * M, fontFamily: DMSERIF, fontStyle: "italic", fontSize: 30 * k * ts, lineHeight: 1.3, color: "#33363c" }}>{cap}</div>
      <div style={{ position: "absolute", left: M, top: lt - 100 * k, borderTop: `${2 * k}px solid #16181c`, paddingTop: 12 * k, width: W - 2 * M }}>
        <FlagClock d={d} px={24 * k * ts} color="#16181c" gap={20 * k} />
      </div>
    </Page>
  );
}
