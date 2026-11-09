/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { NAT_GRADE, NatFigure, NatGround, OFF_WHITE, facesInShot, natFixture, type NatPlace } from "./natkit";
import { LogoShade, frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { fullName, roundTitle, whenRows } from "./natfree9";
import { scoreOf } from "./outline";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, clubInk, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { lines3 } from "./natfree23";
import { CREST_HALO, fitCaps, heroPlace, linesOf, ourCrest, versusLines } from "./usgame1";

/*
 * Complex US gameday looks (round 30; research: scratchpad us-gameday-research.md, "how the complex ones are built").
 * Every look is a stack: a graded copy of his photo as the ground → framing behind him (slabs, x-only streaks, kit
 * band) → a huge headline with an outline echo (above his head, or vertical on the free side — never hidden by a high
 * head) → his cut-out redrawn sharp in full colour with a rim light → an angled two-tone info panel → the logo.
 */

export const M = 40;

/** The club's tones for a look: the ink, a deep shade for grounds, a light tint for highlights. */
export function tones(data: RenderData) {
  const ink = clubInk(data);
  const deep = shade(ink, -0.7);
  const glow = luminance(ink) < 0.15 ? shade(ink, 0.5) : luminance(ink) < 0.3 ? shade(ink, 0.3) : ink;
  let acc = vivid(data.params.accent);
  if (Math.abs(luminance(acc) - luminance(ink)) < 0.08 || acc === ink) acc = "#ffffff";
  return { ink, deep, glow, acc };
}

/** His photo duotoned in the club colour: grayscale, the colour laid over in "color" blend, deepened top and foot. */
export function DuoGround({ data, place, H, amount = 0.88 }: { data: RenderData; place: NatPlace; H: number; amount?: number }) {
  const t = tones(data);
  return (
    <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
      <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "grayscale(1) contrast(1.2) brightness(.92)" }} />
      <div style={{ position: "absolute", inset: 0, background: t.ink, mixBlendMode: "color", opacity: amount }} />
      <div style={{ position: "absolute", inset: 0, background: t.deep, mixBlendMode: "multiply", opacity: 0.45 }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${t.deep}d9 0%, ${t.deep}00 38%, ${t.deep}00 62%, ${t.deep}f0 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.45) 100%)" }} />
    </div>
  );
}

/** His cut-out over the graded ground, sharp and in full colour, with a rim light in the club colour. */
export function RimFigure({ data, place, H, color, strong = false }: { data: RenderData; place: NatPlace; H: number; color: string; strong?: boolean }) {
  const f = strong ? `drop-shadow(0 0 2px rgba(255,255,255,.95)) drop-shadow(0 0 14px ${color}) drop-shadow(0 0 34px ${color})` : `drop-shadow(0 0 1.5px rgba(255,255,255,.9)) drop-shadow(0 0 12px ${color}) drop-shadow(0 18px 30px rgba(0,0,0,.45))`;
  return <NatFigure data={data} place={place} W={CANVAS_W} H={H} clean style={{ filter: `${NAT_GRADE} ${f}` }} />;
}

/** Light streaks dragged along x only (a strong horizontal blur), in white and the club colour. */
export function Streaks({ k, ys, color, id }: { k: number; ys: number[]; color: string; id: string }) {
  const H = Math.max(...ys) + 100;
  return (
    <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={`${34 * k} 0.6`} />
        </filter>
      </defs>
      {ys.map((y, i) => (
        <rect key={i} x={[-80, 260, 40, 420, -20][i % 5]} y={y} width={[640, 520, 760, 480, 560][i % 5] * k} height={(i % 2 ? 7 : 12) * k} rx={6 * k} fill={i % 2 ? "#fff" : color} opacity={i % 2 ? 0.7 : 0.85} filter={`url(#${id})`} />
      ))}
    </svg>
  );
}

export type WordPlan = { mode: "above"; px: number; top: number } | { mode: "side"; px: number; cx: number; top: number; bottom: number };

/**
 * Where the big headline goes: above his head when the sky allows a real size; else vertical on the free side (a
 * column clear of his face and of the other players' faces); else above at whatever size fits. Never behind his head.
 */
export function planWord(d: RenderData, place: NatPlace, text: string, bottomLimit: number, em = 0.5): WordPlan {
  const { top, k } = frameOf(d);
  const faceTop = place.fy - place.fs * 0.95;
  const room = faceTop - 24 * k - top;
  const wide = (CANVAS_W - 2 * M) / Math.max(1, text.length * em);
  const above = Math.min(wide, room / 0.88);
  if (above >= 150 * k) return { mode: "above", px: above, top };
  const left = place.fx - place.faceW * 1.3 - M;
  const right = CANVAS_W - M - (place.fx + place.faceW * 1.3);
  const freeW = Math.max(left, right);
  const len = bottomLimit - top;
  const side = Math.min(freeW / 0.95, len / Math.max(1, text.length * em));
  const cx = left >= right ? M + Math.min(freeW, side * 0.95) / 2 : CANVAS_W - M - Math.min(freeW, side * 0.95) / 2;
  const col = { x0: cx - side * 0.48, x1: cx + side * 0.48, y0: top, y1: bottomLimit };
  const blocked = facesInShot(place)
    .slice(1)
    .some((f) => f.x1 > col.x0 && f.x0 < col.x1 && f.y1 > col.y0 && f.y0 < col.y1);
  if (side >= 140 * k && !blocked) return { mode: "side", px: side, cx, top, bottom: bottomLimit };
  return { mode: "above", px: Math.max(90 * k, Math.min(wide, room / 0.88)), top };
}

/**
 * The big headline with its outline echoes: the solid word on top, two stroke-only copies offset behind it in the club
 * colour and white. Horizontal above his head, or rotated up the free side.
 */
export function BigWord({ plan, text, fill, echo, italic = false }: { plan: WordPlan; text: string; fill: string; echo: string; italic?: boolean }) {
  const px = plan.px;
  const off = px * 0.045;
  const layers = (x: number, y: number, anchor: "middle" | "start") => (
    <>
      <text x={x + off * 2} y={y + off * 2} textAnchor={anchor} style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={px * 0.012}>
        {text}
      </text>
      <text x={x + off} y={y + off} textAnchor={anchor} style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke={echo} strokeWidth={px * 0.02}>
        {text}
      </text>
      <text x={x} y={y} textAnchor={anchor} style={{ fontFamily: DISPLAY, fontSize: px, filter: "drop-shadow(0 10px 26px rgba(0,0,0,.4))" }} fill={fill}>
        {text}
      </text>
    </>
  );
  const skew = italic ? "skewX(-8)" : "";
  if (plan.mode === "above") {
    const y = plan.top + px * 0.86;
    return (
      <svg width={CANVAS_W} height={plan.top + px * 1.1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        <g transform={italic ? `translate(${y * Math.tan((8 * Math.PI) / 180)} 0) ${skew}` : undefined}>{layers(CANVAS_W / 2, y, "middle")}</g>
      </svg>
    );
  }
  const mid = (plan.top + plan.bottom) / 2;
  return (
    <svg width={CANVAS_W} height={plan.bottom + 40} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <g transform={`rotate(-90 ${plan.cx} ${mid})`}>{layers(plan.cx, mid + px * 0.32, "middle")}</g>
    </svg>
  );
}

/** The frame every complex look shares: ground, layers behind him, him, layers in front, the logo. */
export function Stage({ data, ground, behind, hero, front }: { data: RenderData; place?: NatPlace; ground: ReactNode; behind?: ReactNode; hero: ReactNode; front?: ReactNode }) {
  const { H } = frameOf(data);
  const logoTop = logoTopOf(data, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0c0f14", color: OFF_WHITE }}>
      {ground}
      {behind}
      {hero}
      {front}
      <LogoShade top={logoTop} />
      <Logo data={data} top={logoTop} />
    </div>
  );
}

const line = (px: number, tracking: number, weight = 800): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", color: "#fff" });

/** The matchday info stack for a slab: crests, round, HOME X AWAY (wrapped), date · kick-off · ground; sizes first. */
export function infoOf(d: RenderData, iw: number) {
  const { k, ts } = frameOf(d);
  const fx = natFixture(d);
  const title = roundTitle(d);
  const cH = 78 * k;
  const tPx = Math.min(52 * k * ts, (iw - 2 * (cH + 24 * k)) / Math.max(1, title.length * 0.5));
  const vs = versusLines(d, 27 * k * ts, iw, 0.05, 21 * k);
  const rows = whenRows(d, 19 * k * ts, iw, 0.1);
  const wPx = Math.min(19 * k * ts, ...rows.map((l) => fitCaps(l, 19 * k * ts, iw, 0.1)));
  const h = Math.max(tPx, cH) + 14 * k + vs.lines.length * (vs.px + 8 * k) + 4 * k + rows.length * (wPx + 8 * k);
  return { fx, title, cH, tPx, vs, rows, wPx, h };
}

/**
 * The angled two-tone info panel at the foot: a white slab offset behind a slab in the club colour, both skewed; on it
 * crest · MATCHDAY 14 · crest, HOME X AWAY and date · kick-off · ground. Returns its top (for the layers above).
 */
export function slabGeom(d: RenderData) {
  const { H, k } = frameOf(d);
  const iw = CANVAS_W - 2 * M - 120 * k;
  const s = infoOf(d, iw);
  const pad = 26 * k;
  const h = s.h + 2 * pad;
  const bottom = logoTopOf(d, H) - 40 * k;
  return { s, h, top: bottom - h, pad, iw };
}

export function InfoSlab({ data, ink, back = "#fff" }: { data: RenderData; ink: string; back?: string }) {
  const { k } = frameOf(data);
  const { s, h, top, pad } = slabGeom(data);
  const crest = (c: string | null) => (c && s.cH ? <img src={c} alt="" style={{ height: s.cH, width: s.cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  return (
    <>
      <div style={{ position: "absolute", left: M + 18 * k, right: M - 18 * k, top: top + 16 * k, height: h, background: back, transform: "skewX(-10deg)", boxShadow: "0 16px 40px rgba(0,0,0,.45)" }} />
      <div style={{ position: "absolute", left: M, right: M, top, height: h, background: ink, transform: "skewX(-10deg)", boxShadow: "0 10px 28px rgba(0,0,0,.35)" }} />
      <div style={{ position: "absolute", left: M, right: M, top, height: h, padding: `${pad}px 0`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 * k, height: Math.max(s.tPx, s.cH) }}>
          {crest(s.fx.homeCrest)}
          <div style={{ fontFamily: DISPLAY, fontSize: s.tPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{s.title}</div>
          {crest(s.fx.awayCrest)}
        </div>
        <div style={{ height: 14 * k }} />
        {s.vs.lines.map((l, i) => (
          <div key={i} style={{ ...line(s.vs.px, 0.05), marginBottom: 8 * k }}>{l}</div>
        ))}
        <div style={{ height: 4 * k }} />
        {s.rows.map((l, i) => (
          <div key={i} style={{ ...line(s.wPx, 0.1, 600), opacity: 0.9, marginBottom: 8 * k }}>{l}</div>
        ))}
      </div>
    </>
  );
}

/** The goal info slab: crest, his full name (wrapped), his club's exact name, the score if on record. */
export function goalSlabGeom(d: RenderData) {
  const { H, k, ts } = frameOf(d);
  const cH = 92 * k;
  const iw = CANVAS_W - 2 * M - cH - 110 * k;
  const name = linesOf(fullName(d), 44 * k * ts, iw, 0.03, 30 * k);
  const club = linesOf(ourClub(d).toUpperCase(), 22 * k * ts, iw, 0.14, 17 * k);
  const pad = 26 * k;
  const h = Math.max(cH, name.lines.length * (name.px + 8 * k) + 4 * k + club.lines.length * (club.px + 6 * k)) + 2 * pad;
  const bottom = logoTopOf(d, H) - 40 * k;
  return { cH, name, club, pad, h, top: bottom - h };
}

export function GoalSlab({ data, ink, back = "#fff" }: { data: RenderData; ink: string; back?: string }) {
  const { k } = frameOf(data);
  const g = goalSlabGeom(data);
  const crest = ourCrest(data);
  return (
    <>
      <div style={{ position: "absolute", left: M + 18 * k, right: M - 18 * k, top: g.top + 16 * k, height: g.h, background: back, transform: "skewX(-10deg)", boxShadow: "0 16px 40px rgba(0,0,0,.45)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: g.top, height: g.h, background: ink, transform: "skewX(-10deg)" }} />
      <div style={{ position: "absolute", left: M + 50 * k, right: M + 40 * k, top: g.top, height: g.h, display: "flex", alignItems: "center", gap: 26 * k }}>
        {crest && <img src={crest} alt="" style={{ height: g.cH, width: g.cH, objectFit: "contain", flexShrink: 0, filter: CREST_HALO }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {g.name.lines.map((l, i) => (
            <div key={i} style={{ ...line(g.name.px, 0.03, 900), marginBottom: 8 * k }}>{l}</div>
          ))}
          {g.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...line(g.club.px, 0.14, 700), opacity: 0.9, marginTop: i ? 0 : 4 * k, marginBottom: 6 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ================= 1 · Duotone arena (matchday) ================= */

/**
 * Arena duotone (matchday): his photo duotoned in the club colour, x-only light streaks across it, GAMEDAY huge with
 * two outline echoes (above his head, or up the free side), him sharp in full colour with a rim light, and the angled
 * two-tone panel with crests, round, HOME X AWAY and the kick-off.
 */
export function Usduoarena({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const slab = slabGeom(d);
  const plan = planWord(d, place, "GAMEDAY", slab.top - 30 * k);
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} />}
      behind={
        <>
          <Streaks k={k} id="duo-streak" color={t.glow} ys={[place.fy - place.fs * 0.2, place.fy + place.fs * 0.9, place.fy + place.fs * 1.7, slab.top - 60 * k]} />
          {plan.mode === "side" && <BigWord plan={plan} text="GAMEDAY" fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text="GAMEDAY" fill="#fff" echo={t.glow} />}
          <InfoSlab data={d} ink={t.ink} back={t.acc} />
        </>
      }
    />
  );
}

/* ================= 2 · Goal duotone (goal) ================= */

/**
 * Golo · duotone (goal): his celebration duotoned in the club colour, light streaks along x, GOAL huge in italic with
 * outline echoes, him sharp with a strong rim light, and the two-tone slab with his crest, full name and club.
 */
export function Goalusduo({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const g = goalSlabGeom(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const plan = planWord(d, place, word, g.top - 30 * k, 0.52);
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} />}
      behind={
        <>
          <Streaks k={k} id="goalduo-streak" color={t.glow} ys={[place.fy + place.fs * 0.4, place.fy + place.fs * 1.4, g.top - 70 * k]} />
          {plan.mode === "side" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} strong />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} italic />}
          <GoalSlab data={d} ink={t.ink} back={t.acc} />
        </>
      }
    />
  );
}

/* ================= 3 · Result arena (result) ================= */

/**
 * Resultado · arena (result): the duotone ground, FINAL huge with outline echoes (above his head or up the free side),
 * light streaks, him sharp with a rim light, and the angled slab: home crest and name · the score huge · away crest and
 * name (exact names, up to three lines), the competition under it.
 */
export function Resultusduo({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const fx = natFixture(d);
  const score = scoreOf(d, "–") || "FT";
  const cH = 96 * k;
  const inner = CANVAS_W - 2 * M - 120 * k;
  const sPx = Math.min(130 * k * ts, (inner * 0.34) / Math.max(1, score.length * 0.55));
  const colW = (inner - inner * 0.34) / 2;
  const hn = lines3(fx.homeName.toUpperCase(), 22 * k * ts, colW, 0.04, 18 * k);
  const an = lines3(fx.awayName.toUpperCase(), 22 * k * ts, colW, 0.04, 18 * k);
  const nPx = Math.min(hn.px, an.px);
  const nl = Math.max(hn.lines.length, an.lines.length);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const cPx = comp ? fitCaps(comp, 18 * k * ts, inner, 0.16) : 0;
  const pad = 28 * k;
  const h = Math.max(cH + 12 * k + nl * (nPx + 6 * k), sPx) + (comp ? 18 * k + cPx : 0) + 2 * pad;
  const top = logoTopOf(d, H) - 40 * k - h;
  const plan = planWord(d, place, "FINAL", top - 30 * k);
  const side = (c: string | null, n: ReturnType<typeof linesOf>) => (
    <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {c && <img src={c} alt="" style={{ height: cH, width: cH, objectFit: "contain", filter: CREST_HALO }} />}
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...line(nPx, 0.04), marginTop: i ? 6 * k : 12 * k }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} />}
      behind={
        <>
          <Streaks k={k} id="resduo-streak" color={t.glow} ys={[place.fy + place.fs * 0.5, place.fy + place.fs * 1.5, top - 60 * k]} />
          {plan.mode === "side" && <BigWord plan={plan} text="FINAL" fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text="FINAL" fill="#fff" echo={t.glow} />}
          <div style={{ position: "absolute", left: M + 18 * k, right: M - 18 * k, top: top + 16 * k, height: h, background: t.acc, transform: "skewX(-10deg)", boxShadow: "0 16px 40px rgba(0,0,0,.45)" }} />
          <div style={{ position: "absolute", left: M, right: M, top, height: h, background: t.ink, transform: "skewX(-10deg)" }} />
          <div style={{ position: "absolute", left: M + 60 * k, right: M + 60 * k, top, height: h, padding: `${pad}px 0`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
              {side(fx.homeCrest, hn)}
              <div style={{ width: inner * 0.34, height: cH + 12 * k + nPx, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: sPx, lineHeight: 1, color: "#fff", whiteSpace: "nowrap", textShadow: "0 6px 20px rgba(0,0,0,.35)" }}>{score}</div>
              {side(fx.awayCrest, an)}
            </div>
            {comp && <div style={{ ...line(cPx, 0.16, 700), opacity: 0.85, marginTop: 18 * k }}>{comp}</div>}
          </div>
        </>
      }
    />
  );
}

/* ================= 4 · Angled panels (matchday) ================= */

/**
 * Painéis angulares (matchday): his photo graded cinematic (cool, contrasty, vignetted), three huge angled slabs in the
 * club colour, its accent and white slicing up behind him, the round number giant and outlined in the top slab, x-only
 * streaks, him sharp with a rim light, and the two-tone info panel.
 */
export function Usangled({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const slab = slabGeom(d);
  const no = matchFacts(d).roundNo || (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const faceTop = place.fy - place.fs * 0.95;
  const numPx = Math.min(520 * k, Math.max(160 * k, (faceTop - top) / 0.8));
  const numW = numPx * no.length * 0.55;
  // The number sits on the side away from his face, whole.
  const leftRoom = place.fx - place.faceW * 1.2 - M;
  const numX = leftRoom >= CANVAS_W - M - (place.fx + place.faceW * 1.2) ? M + numW / 2 : CANVAS_W - M - numW / 2;
  const numTop = Math.max(top - 20 * k, Math.min(faceTop - numPx * 0.8, slab.top - numPx));
  const panel = (y: number, h: number, c: string, o: number, x0: number) => <div style={{ position: "absolute", left: x0, width: CANVAS_W * 1.4, top: y, height: h, background: c, opacity: o, transform: "rotate(-14deg)", transformOrigin: "left top" }} />;
  return (
    <Stage
      data={d}
      place={place}
      ground={
        <div style={{ position: "absolute", inset: 0 }}>
          <NatGround place={place} W={CANVAS_W} H={H} style={{ filter: "contrast(1.18) saturate(.8) brightness(.82)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 40%, rgba(0,0,0,.6) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${t.deep}aa, ${t.deep}00 35%, ${t.deep}00 60%, ${t.deep}dd)` }} />
        </div>
      }
      behind={
        <>
          {panel(place.fy + place.fs * 0.2, 150 * k, t.ink, 0.92, -220)}
          {panel(place.fy + place.fs * 0.2 + 168 * k, 40 * k, t.acc, 0.9, -220)}
          {panel(place.fy + place.fs * 0.2 + 226 * k, 18 * k, "#fff", 0.8, -220)}
          <Streaks k={k} id="angled-streak" color={t.glow} ys={[place.fy - place.fs * 0.6, place.fy + place.fs * 2.4]} />
          {no && (
            <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
              <text x={numX + numPx * 0.05} y={numTop + numPx * 0.86 + numPx * 0.05} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: numPx }} fill="none" stroke={t.glow} strokeWidth={numPx * 0.02}>
                {no}
              </text>
              <text x={numX} y={numTop + numPx * 0.86} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: numPx }} fill="none" stroke="#fff" strokeWidth={numPx * 0.03}>
                {no}
              </text>
            </svg>
          )}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={<InfoSlab data={d} ink={t.ink} back="#fff" />}
    />
  );
}

/* ================= 5 · Kit band (matchday) ================= */

/**
 * Faixa do equipamento (matchday): the duotone ground, a wide diagonal band printed with the club's kit stripes (its
 * colour and accent) running behind his body, light streaks, MATCHDAY huge with outline echoes, him sharp with a rim
 * light, and the info panel.
 */
export function Uskitband({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const place = heroPlace(d);
  const slab = slabGeom(d);
  const word = (d.content.kicker || "Matchday").toUpperCase();
  const plan = planWord(d, place, word, slab.top - 30 * k, 0.5);
  const stripe = 46 * k;
  const bandY = place.fy + place.fs * 0.6;
  return (
    <Stage
      data={d}
      place={place}
      ground={<DuoGround data={d} place={place} H={H} amount={0.8} />}
      behind={
        <>
          <div style={{ position: "absolute", left: -300, width: CANVAS_W + 600, top: bandY, height: 360 * k, transform: "rotate(-9deg)", background: `repeating-linear-gradient(90deg, ${t.ink} 0, ${t.ink} ${stripe}px, ${t.acc} ${stripe}px, ${t.acc} ${stripe * 2}px)`, boxShadow: "0 0 0 8px rgba(255,255,255,.9), 0 20px 60px rgba(0,0,0,.5)", opacity: 0.95 }} />
          <Streaks k={k} id="kit-streak" color={t.glow} ys={[bandY - 60 * k, bandY + 420 * k]} />
          {plan.mode === "side" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
        </>
      }
      hero={<RimFigure data={d} place={place} H={H} color={t.glow} />}
      front={
        <>
          {plan.mode === "above" && <BigWord plan={plan} text={word} fill="#fff" echo={t.glow} />}
          <InfoSlab data={d} ink={shade(t.ink, -0.35)} back={t.ink} />
        </>
      }
    />
  );
}
