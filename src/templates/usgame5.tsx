/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { natFixture, NatGround, type NatPlace } from "./natkit";
import { frameOf } from "./natfree4";
import { placed, roundTitle } from "./natfree9";
import { dropped } from "./natfree26";
import { ORBITRON } from "./panelscript";
import { DISPLAY, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_W, type RenderData } from "./types";
import { CREST_HALO, fitCaps, heroPlace, linesOf } from "./usgame1";
import { BigWord, DuoGround, GoalSlab, InfoSlab, M, RimFigure, Stage, Streaks, goalSlabGeom, planWord, slabGeom, tones } from "./usgame4";

/*
 * Complex US gameday looks, part 2 (round 30). Same layer recipe as usgame4: graded ground → framing → headline with
 * echoes (above his head or up the free side) → him sharp with a rim light → info → logo.
 */

/**
 * A giant silhouette of him in the club colour behind him, scaled up from his own cut-out (a shape only — no face
 * detail, so nothing of his face is ever shown soft).
 */
function Clone({ place, H, color, scale = 1.55, opacity = 0.55 }: { place: NatPlace; H: number; color: string; scale?: number; opacity?: number }) {
  const fig = place.frame.fig;
  if (!fig) return null;
  const m = `url(${fig}&soft=1)`;
  const style: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: CANVAS_W,
    height: H,
    background: `linear-gradient(to bottom, ${color}, ${shade(color, -0.4)})`,
    opacity,
    WebkitMaskImage: m,
    maskImage: m,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    transform: `scale(${scale})`,
    transformOrigin: `${place.fx}px ${place.fy + place.fs * 1.2}px`,
  };
  return <div style={style} />;
}

/* ================= 6 · Stadium video board (matchday) ================= */

/**
 * Placar de estádio (matchday): the stadium's video board hung above his head — a dark glass board framed in the club
 * colour with a lit header (MATCHDAY 14), both crests big with the clubs' exact names, the kick-off in scoreboard
 * digits, date and ground under it; light streaks along x; his photo graded dark; him sharp with a rim light.
 */
export function Usscoreboard({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const fx = natFixture(d);
  const bw = CANVAS_W - 2 * M;
  const colW = (bw - 60 * k) / 3;
  const cH = 104 * k;
  const nameOf = (n: string) => linesOf(n.toUpperCase(), 22 * k * ts, colW, 0.04, 15 * k);
  const hn = nameOf(fx.homeName);
  const an = nameOf(fx.awayName);
  const nPx = Math.min(hn.px, an.px);
  const nl = Math.max(hn.lines.length, an.lines.length);
  const title = roundTitle(d);
  const hdr = 64 * k;
  const time = fx.time || "";
  const tPx = time ? Math.min(78 * k * ts, colW / Math.max(1, time.length * 0.82)) : 0;
  const sub = [fx.date, fx.ptTime].filter(Boolean).join("  ·  ").toUpperCase();
  const sPx = sub ? fitCaps(sub, 17 * k * ts, colW, 0.08) : 0;
  const venue = fx.venue.toUpperCase();
  const vPx = venue ? fitCaps(venue, 18 * k * ts, bw - 60 * k, 0.16) : 0;
  const body = Math.max(cH + 12 * k + nl * (nPx + 6 * k), tPx + 14 * k + sPx);
  const h = hdr + 26 * k + body + 22 * k + (venue ? vPx + 22 * k : 0);
  const { place, y } = placed(d, h + 30 * k, 300);
  const team = (c: string | null, n: ReturnType<typeof nameOf>) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {c && <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO }} />}
      {n.lines.map((l, i) => (
        <div key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.04em", whiteSpace: "nowrap", lineHeight: 1, color: "#fff", marginTop: i ? 6 * k : 12 * k }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Stage
      data={d}
      place={place}
      ground={
        <div style={{ position: "absolute", inset: 0 }}>
          <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "contrast(1.15) saturate(.85) brightness(.7)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${t.deep}ee 0%, ${t.deep}55 40%, ${t.deep}00 60%, ${t.deep}dd 100%)` }} />
        </div>
      }
      behind={<Streaks k={k} id="board-streak" color={t.glow} ys={[y + h + 40 * k, place.fy + place.fs * 1.6, place.fy + place.fs * 2.6]} />}
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <div style={{ position: "absolute", left: M, width: bw, top: y, height: h, borderRadius: 22 * k, background: "linear-gradient(180deg, rgba(14,17,23,.94), rgba(6,8,11,.96))", border: `${4 * k}px solid ${t.glow}`, boxShadow: `0 0 ${30 * k}px ${t.glow}66, 0 20px 50px rgba(0,0,0,.6)`, boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ height: hdr, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: Math.min(44 * k * ts, (bw - 80 * k) / Math.max(1, title.length * 0.5)), color: "#fff", letterSpacing: "0.06em", boxShadow: `inset 0 -${3 * k}px 0 rgba(255,255,255,.25)` }}>{title}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: hdr, bottom: 0, background: "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0, rgba(255,255,255,.035) 2px, transparent 2px, transparent 6px)" }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${26 * k}px ${30 * k}px 0`, height: body + 26 * k, boxSizing: "border-box" }}>
            {team(fx.homeCrest, hn)}
            <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>
              {time && <div style={{ fontFamily: ORBITRON, fontWeight: 900, fontSize: tPx, lineHeight: 1, color: t.glow, textShadow: `0 0 ${14 * k}px ${t.glow}` }}>{time}</div>}
              {sub && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: sPx, letterSpacing: "0.08em", whiteSpace: "nowrap", lineHeight: 1, color: "#fff", opacity: 0.85, marginTop: 14 * k }}>{sub}</div>}
            </div>
            {team(fx.awayCrest, an)}
          </div>
          {venue && <div style={{ position: "relative", textAlign: "center", marginTop: 22 * k, fontFamily: SANS, fontWeight: 700, fontSize: vPx, letterSpacing: "0.16em", whiteSpace: "nowrap", color: "#fff", opacity: 0.7 }}>{venue}</div>}
        </div>
      }
    />
  );
}

/* ================= 7 · Premium poster (matchday) ================= */

/**
 * Cartaz premium (matchday): his photo duotoned, a giant silhouette of him in the club colour rising behind him, a thin
 * poster frame with corner ticks and mono labels (round, date), MATCHDAY huge with outline echoes, him sharp with a rim
 * light, and the angled info panel.
 */
export function Usposter({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const slab = slabGeom(d);
  const word = (d.content.kicker || "Matchday").toUpperCase();
  const plan = planWord(d, place, word, slab.top - 30 * k);
  const fx = natFixture(d);
  const f = matchFacts(d);
  const inset = 30 * k;
  const tick = 46 * k;
  const label = (s: string, style: CSSProperties) => <div style={{ position: "absolute", fontFamily: MONO, fontSize: 18 * k, letterSpacing: "0.2em", color: "#fff", opacity: 0.85, whiteSpace: "nowrap", ...style }}>{s}</div>;
  const corner = (x: number, y: number, sx: number, sy: number) => <path d={`M ${x} ${y + sy * tick} L ${x} ${y} L ${x + sx * tick} ${y}`} fill="none" stroke="#fff" strokeWidth={4 * k} />;
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} amount={0.92} />}
      behind={
        <>
          <Clone place={place} H={H} color={t.glow} />
          <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <rect x={inset} y={top - 40 * k} width={CANVAS_W - 2 * inset} height={slab.top - top + 10 * k} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2 * k} />
            {corner(inset, top - 40 * k, 1, 1)}
            {corner(CANVAS_W - inset, top - 40 * k, -1, 1)}
          </svg>
          {plan.mode === "side" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
          {f.roundNo && label(`NO. ${f.roundNo.padStart(2, "0")}`, { left: inset + 18 * k, top: top - 74 * k })}
          {fx.date && label(fx.date.toUpperCase(), { right: inset + 18 * k, top: top - 74 * k })}
          <InfoSlab data={d} ink={t.ink} back={t.acc} />
        </>
      }
    />
  );
}

/* ================= 8 · Glass card (matchday) ================= */

/**
 * Gameday · vidro premium (matchday): the duotone ground, a giant silhouette of him behind, light streaks along x,
 * GAMEDAY with outline echoes, him sharp with a rim light, and the facts on a frosted-glass card (the photo — never
 * his face — blurred behind it) with a sheen and a club-colour edge.
 */
export function Usglass({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const slab = slabGeom(d);
  const plan = planWord(d, place, "GAMEDAY", slab.top - 30 * k);
  const s = slab.s;
  const crest = (c: string | null) => (c && s.cH ? <img src={c} alt="" style={{ height: s.cH, width: s.cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  const l = (px: number, tr: number, w = 800): CSSProperties => ({ fontFamily: SANS, fontWeight: w, fontSize: px, letterSpacing: `${tr}em`, whiteSpace: "nowrap", lineHeight: 1, color: "#fff" });
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} />}
      behind={
        <>
          <Clone place={place} H={H} color={t.glow} scale={1.45} opacity={0.4} />
          <Streaks k={k} id="glass-streak" color={t.glow} ys={[place.fy + place.fs * 0.6, place.fy + place.fs * 1.8]} />
          {plan.mode === "side" && <BigWord plan={plan} text="GAMEDAY" fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text="GAMEDAY" fill="#fff" echo={t.glow} />}
          <div style={{ position: "absolute", left: M, right: M, top: slab.top, height: slab.h, borderRadius: 28 * k, background: "linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08) 45%, rgba(255,255,255,.14))", backdropFilter: "blur(18px) saturate(1.2)", WebkitBackdropFilter: "blur(18px) saturate(1.2)", border: "1px solid rgba(255,255,255,.45)", borderBottom: `${6 * k}px solid ${t.glow}`, boxShadow: "0 20px 50px rgba(0,0,0,.45)", padding: `${slab.pad}px 0`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 * k, height: Math.max(s.tPx, s.cH) }}>
              {crest(s.fx.homeCrest)}
              <div style={{ fontFamily: DISPLAY, fontSize: s.tPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{s.title}</div>
              {crest(s.fx.awayCrest)}
            </div>
            <div style={{ height: 14 * k }} />
            {s.vs.lines.map((x, i) => (
              <div key={i} style={{ ...l(s.vs.px, 0.05), marginBottom: 8 * k }}>{x}</div>
            ))}
            <div style={{ height: 4 * k }} />
            {s.rows.map((x, i) => (
              <div key={i} style={{ ...l(s.wPx, 0.1, 600), opacity: 0.92, marginBottom: 8 * k }}>{x}</div>
            ))}
          </div>
        </>
      }
    />
  );
}

/* ================= 9 · Light burst (goal) ================= */

/**
 * Golo · clarão (goal): the duotone ground, a clean burst of light rays in the club colour fanning out from behind
 * him, a giant silhouette, GOAL huge with outline echoes, him sharp with a strong rim light, and the goal slab with his
 * crest, full name and club.
 */
export function Goalusflare({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const g = goalSlabGeom(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const plan = planWord(d, place, word, g.top - 30 * k, 0.52);
  const cx = place.fx;
  const cy = place.fy + place.fs * 0.6;
  const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} />}
      behind={
        <>
          <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <defs>
              <radialGradient id="flare-ray" cx={cx} cy={cy} r={H * 0.75} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
                <stop offset="0.25" stopColor={t.glow} stopOpacity={0.45} />
                <stop offset="1" stopColor={t.glow} stopOpacity={0} />
              </radialGradient>
            </defs>
            {rays.map((a) => {
              const r = H;
              const w = 5;
              const p = (deg: number) => `${cx + r * Math.cos((deg * Math.PI) / 180)},${cy + r * Math.sin((deg * Math.PI) / 180)}`;
              return <polygon key={a} points={`${cx},${cy} ${p(a - w)} ${p(a + w)}`} fill="url(#flare-ray)" />;
            })}
            <circle cx={cx} cy={cy} r={260 * k} fill={`url(#flare-ray)`} opacity={0.8} />
          </svg>
          <Clone place={place} H={H} color={t.glow} scale={1.35} opacity={0.35} />
          {plan.mode === "side" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} strong />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
          <GoalSlab data={d} ink={t.ink} back={t.acc} />
        </>
      }
    />
  );
}

/* ================= 10 · Glass goal (goal) ================= */

/**
 * Golo · vidro premium (goal): the duotone ground, a giant silhouette behind, streaks along x, GOAL with outline echoes,
 * him sharp with a rim light, and a frosted-glass card with his crest, full name, club and the score.
 */
export function Goalusglass({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const g = goalSlabGeom(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const plan = planWord(d, place, word, g.top - 30 * k, 0.52);
  const crest = natFixture(d);
  const ours = (d.content.home === false ? crest.awayCrest : crest.homeCrest) ?? d.club?.crestUrl ?? null;
  const l = (px: number, tr: number, w = 800): CSSProperties => ({ fontFamily: SANS, fontWeight: w, fontSize: px, letterSpacing: `${tr}em`, whiteSpace: "nowrap", lineHeight: 1, color: "#fff" });
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} />}
      behind={
        <>
          <Clone place={place} H={H} color={t.glow} scale={1.45} opacity={0.4} />
          <Streaks k={k} id="goalglass-streak" color={t.glow} ys={[place.fy + place.fs * 0.5, place.fy + place.fs * 1.5, g.top - 60 * k]} />
          {plan.mode === "side" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} italic />}
          <div style={{ position: "absolute", left: M, right: M, top: g.top, height: g.h, borderRadius: 28 * k, background: "linear-gradient(135deg, rgba(255,255,255,.26), rgba(255,255,255,.08) 45%, rgba(255,255,255,.14))", backdropFilter: "blur(18px) saturate(1.2)", WebkitBackdropFilter: "blur(18px) saturate(1.2)", border: "1px solid rgba(255,255,255,.45)", borderBottom: `${6 * k}px solid ${t.glow}`, boxShadow: "0 20px 50px rgba(0,0,0,.45)", display: "flex", alignItems: "center", gap: 26 * k, padding: `0 ${40 * k}px`, boxSizing: "border-box" }}>
            {ours && <img src={ours} alt="" style={{ height: g.cH, width: g.cH, objectFit: "contain", flexShrink: 0, filter: CREST_HALO }} />}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {g.name.lines.map((x, i) => (
                <div key={i} style={{ ...l(g.name.px, 0.03, 900), marginBottom: 8 * k }}>{x}</div>
              ))}
              {g.club.lines.map((x, i) => (
                <div key={"c" + i} style={{ ...l(g.club.px, 0.14, 700), opacity: 0.9, marginTop: i ? 0 : 4 * k, marginBottom: 6 * k }}>{x}</div>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
}

