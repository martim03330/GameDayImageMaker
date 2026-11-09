/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { shade } from "@/lib/color";
import { NAT_GRADE, NatFigure, NatGround, facesInShot, natFixture, natPlace, type NatPlace } from "./natkit";
import { LogoShade, frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { roundTitle, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { Logo, logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { CREST_HALO, fitCaps, versusLines } from "./usgame1";
import { tones } from "./usgame4";

/*
 * Round 31: looks rebuilt from real Pinterest / Behance references (scratchpad refs-analysis.md). The signature
 * technique is the DEPTH INTERLEAVE: the headline is drawn twice — once behind him, once in front with his head cut
 * out of it — so his head sits in front of the word and the letters run over his body. A row his head would hide too
 * much of moves to the free side (or under his chin) instead.
 */

export const M = 44;

/** Anton caps advance, per 1px. */
export const wordW = (t: string, px: number) => [...t].reduce((a, c) => a + (c === " " ? 0.24 : /[MW]/.test(c) ? 0.6 : /[I1]/.test(c) ? 0.3 : 0.5), 0) * px;
/** The largest Anton size that fits `t` in `w`. */
export const fitWord = (t: string, w: number, max: number) => Math.min(max, w / Math.max(0.1, wordW(t, 1)));

/** He stands where asked (the "move text" nudge — dropped() — brings him down with the type). */
export function standAt(d: RenderData, fx: number, fy = 840, fs = 210): NatPlace {
  const { H, story } = frameOf(d);
  const nudge = -(d.params.textY ?? 0);
  return natPlace(d, CANVAS_W, H, { fx, fy: (story ? fy : fy - 250) + nudge, fs: story ? fs : fs * 0.74 });
}

/** His head on the canvas, generous (hair to neck). */
export function headBox(p: NatPlace) {
  const n = p.nudge ?? { x: 0, y: 0 };
  const cx = p.fx + n.x;
  const cy = p.fy + n.y;
  return { x0: cx - p.faceW * 1.15, x1: cx + p.faceW * 1.15, y0: cy - p.fs * 1.45, y1: cy + p.fs * 0.95 };
}

export type Row = { text: string; x: number; y: number; px: number; anchor: "start" | "middle" | "end" };

/**
 * A headline row (`y` = top of the caps). If his head would hide more than `max` of it, the row moves whole to the
 * free side beside his head (smaller), or — if that leaves it too small — just under his chin.
 */
export function safeRow(p: NatPlace, text: string, y: number, px: number, x0 = M, x1 = CANVAS_W - M, anchor: Row["anchor"] = "middle", max = 0.25, floor = Infinity): Row {
  const w = Math.min(wordW(text, px), x1 - x0);
  const ax = anchor === "start" ? x0 : anchor === "end" ? x1 : (x0 + x1) / 2;
  const rx0 = anchor === "start" ? x0 : anchor === "end" ? x1 - w : ax - w / 2;
  const h = headBox(p);
  const hitV = y < h.y1 && y + px * 0.8 > h.y0;
  const hidden = hitV ? Math.max(0, Math.min(rx0 + w, h.x1) - Math.max(rx0, h.x0)) / w : 0;
  if (hidden <= max) return { text, x: ax, y, px, anchor };
  // 1 · a little smaller, it fits whole above his head.
  const px3 = Math.min(px, (h.y0 - 12 - y) / 0.8);
  if (px3 >= px * 0.6) return { text, x: ax, y, px: px3, anchor };
  const left = h.x0 - x0 - 14;
  const right = x1 - h.x1 - 14;
  const free = Math.max(left, right);
  const px2 = fitWord(text, free, px);
  if (px2 >= px * 0.5) return left >= right ? { text, x: x0, y: y + (px - px2) * 0.8, px: px2, anchor: "start" } : { text, x: x1, y: y + (px - px2) * 0.8, px: px2, anchor: "end" };
  if (h.y1 + 10 + px * 0.8 <= floor) return { text, x: (x0 + x1) / 2, y: h.y1 + 10, px, anchor: "middle" };
  // Nowhere better: it stays, his head in front of part of it.
  return { text, x: ax, y, px, anchor };
}

/** A row's caps box. */
export const rowBox = (r: Row) => {
  const w = wordW(r.text, r.px);
  const x0 = r.anchor === "start" ? r.x : r.anchor === "end" ? r.x - w : r.x - w / 2;
  return { x0, x1: x0 + w, y0: r.y, y1: r.y + r.px * 0.8 };
};

/** Everything but his head (the front copy of the type). */
export const notHead = (p: NatPlace, H: number) => {
  const h = headBox(p);
  return `M0 0 H${CANVAS_W} V${H} H0 Z M${h.x0} ${h.y0} V${h.y1} H${h.x1} V${h.y0} Z`;
};
/** Everything below `y` (the front half of an interlocked word or number), his head always cut out. */
export const belowLine = (y: number, H: number, p?: NatPlace) => {
  const h = p ? headBox(p) : null;
  const hole = h && h.y1 > y ? ` M${h.x0} ${Math.max(y, h.y0)} V${h.y1} H${h.x1} V${Math.max(y, h.y0)} Z` : "";
  return `M0 ${y} H${CANVAS_W} V${H} H0 Z${hole}`;
};

/** One SVG layer of type rows, optionally clipped. `skew` slants the caps (italic) around each row's baseline. */
export function TypeLayer({ id, H, rows, clipD, skew = 0, paint }: { id: string; H: number; rows: Row[]; clipD?: string; skew?: number; paint: (r: Row) => SVGProps<SVGTextElement> }) {
  const t = Math.tan((skew * Math.PI) / 180);
  return (
    <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {clipD && (
        <defs>
          <clipPath id={id}>
            <path d={clipD} clipRule="evenodd" fillRule="evenodd" />
          </clipPath>
        </defs>
      )}
      <g clipPath={clipD ? `url(#${id})` : undefined}>
        {rows.map((r, i) => {
          const base = r.y + r.px * 0.8;
          return (
            <text key={i} x={r.x} y={base} textAnchor={r.anchor} transform={skew ? `translate(${base * t} 0) skewX(${-skew})` : undefined} style={{ fontFamily: DISPLAY, fontSize: r.px }} {...paint(r)}>
              {r.text}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

/** The canvas: ground, layers behind him, him, layers in front, the logo (dark or for a light ground). */
export function Frame({ d, bg, ground, behind, fig, front, light = false }: { d: RenderData; bg: string; ground?: ReactNode; behind?: ReactNode; fig: ReactNode; front?: ReactNode; light?: boolean }) {
  const { H } = frameOf(d);
  const lt = logoTopOf(d, H);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: bg }}>
      {ground}
      {behind}
      {fig}
      {front}
      {!light && <LogoShade top={lt} />}
      <Logo data={d} top={lt} onLight={light} />
    </div>
  );
}

/** His cut-out, sharp (optionally B&W), with a soft shadow on a light ground. */
export function Fig({ d, p, filter = "", light = false }: { d: RenderData; p: NatPlace; filter?: string; light?: boolean }) {
  const { H } = frameOf(d);
  const sh = light ? "drop-shadow(0 22px 26px rgba(0,0,0,.22)) drop-shadow(0 4px 6px rgba(0,0,0,.18))" : "drop-shadow(0 16px 30px rgba(0,0,0,.4))";
  return <NatFigure data={d} place={p} W={CANVAS_W} H={H} clean style={{ filter: `${NAT_GRADE} ${filter} ${sh}` }} />;
}

const capsLine = (px: number, tracking: number, weight: number, color: string): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: px, letterSpacing: `${tracking}em`, lineHeight: 1, whiteSpace: "nowrap", color });

/** The fixture block's sizes: crests "vs", round, HOME X AWAY (wrapped, never cut), date · kick-off · ground. */
export function infoOf(d: RenderData, w: number, scale = 1) {
  const { k, ts } = frameOf(d);
  const fx = natFixture(d);
  const cH = 64 * k * scale;
  const title = roundTitle(d);
  const tPx = fitCaps(title, 22 * k * ts * scale, w, 0.22);
  const vs = versusLines(d, 28 * k * ts * scale, w, 0.04, 18 * k);
  const rows = whenRows(d, 19 * k * ts * scale, w, 0.08);
  const wPx = Math.min(19 * k * ts * scale, ...rows.map((l) => fitCaps(l, 19 * k * ts * scale, w, 0.08)));
  const h = cH + 16 * k + tPx + 12 * k + vs.lines.length * (vs.px + 8 * k) + 4 * k + rows.length * (wPx + 8 * k);
  return { fx, cH, title, tPx, vs, rows, wPx, h, k };
}

export function Info({ i, x, y, w, color, accent, align = "flex-start" }: { i: ReturnType<typeof infoOf>; x: number; y: number; w: number; color: string; accent: string; align?: "flex-start" | "center" | "flex-end" }) {
  const { k } = i;
  const crest = (c: string | null) => (c ? <img src={c} alt="" style={{ height: i.cH, width: i.cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexDirection: "column", alignItems: align }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 * k, height: i.cH }}>
        {crest(i.fx.homeCrest)}
        <div style={{ fontFamily: DISPLAY, fontSize: 26 * k, color: accent, lineHeight: 1 }}>VS</div>
        {crest(i.fx.awayCrest)}
      </div>
      <div style={{ ...capsLine(i.tPx, 0.22, 800, accent), marginTop: 16 * k }}>{i.title}</div>
      {i.vs.lines.map((l, n) => (
        <div key={n} style={{ ...capsLine(i.vs.px, 0.04, 900, color), marginTop: n ? 8 * k : 12 * k }}>{l}</div>
      ))}
      {i.rows.map((l, n) => (
        <div key={"w" + n} style={{ ...capsLine(i.wPx, 0.08, 600, color), opacity: 0.88, marginTop: n ? 8 * k : 12 * k }}>{l}</div>
      ))}
    </div>
  );
}

/** The fixture block at the top, unless his head is up there — then just above the logo. */
export function infoY(d: RenderData, p: NatPlace, h: number, prefer: "top" | "bottom" = "bottom") {
  const { H, k, top } = frameOf(d);
  const bottom = logoTopOf(d, H) - 40 * k - h;
  if (prefer === "bottom") return bottom;
  return headBox(p).y0 > top + h + 24 * k ? top : bottom;
}

/** The faces of the other people in the shot (the type keeps off them where it can). */
const othersHit = (p: NatPlace, b: { x0: number; x1: number; y0: number; y1: number }) => facesInShot(p).slice(1).some((f) => f.x1 > b.x0 && f.x0 < b.x1 && f.y1 > b.y0 && f.y0 < b.y1);

/* ================= 1 · Stacked headline (matchday) — pin0 r1c4, r1c3, pin4 r1c1 ================= */

/**
 * Gameday · empilhado (matchday): his real photo; GAME / DAY stacked huge in white, left-aligned, with his head in
 * front of the letters and the rest of the word running over his body (depth interleave, free-side fallback); a
 * full-height strip in the club colour on the right; the round tracked small above; crests "vs", HOME X AWAY and
 * date | kick-off | ground at the foot.
 */
export function Usstackedword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const left = d.params.side === "left";
  const p = standAt(d, left ? 400 : 680, 880);
  const px = fitWord("GAME", CANVAS_W - 2 * M, 380 * k);
  const y1 = top + 56 * k;
  const w = CANVAS_W - 2 * M - 160 * k;
  const info = infoOf(d, w);
  const iy = infoY(d, p, info.h);
  const r1 = safeRow(p, "GAME", y1, px, M, CANVAS_W - M, left ? "end" : "start", 0.25, iy - 30 * k);
  const r2 = safeRow(p, "DAY", rowBox(r1).y1 + px * 0.06, px, M, CANVAS_W - M, left ? "end" : "start", 0.25, iy - 30 * k);
  const rows = [r1, r2];
  const strip = 150 * k;
  return (
    <Frame
      d={d}
      bg="#0c0f14"
      ground={
        <>
          <NatGround place={p} W={CANVAS_W} H={H} style={{ filter: "contrast(1.08) saturate(.92) brightness(.86)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.05) 42%, rgba(0,0,0,.1) 60%, rgba(0,0,0,.72))" }} />
        </>
      }
      behind={
        <>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: strip, [left ? "left" : "right"]: 0, background: t.ink, boxShadow: "0 0 40px rgba(0,0,0,.35)" }} />
          <TypeLayer id="stk-b" H={H} rows={rows} paint={(r) => ({ fill: "#fff", style: { fontFamily: DISPLAY, fontSize: r.px, filter: "drop-shadow(0 8px 24px rgba(0,0,0,.35))" } })} />
        </>
      }
      fig={<Fig d={d} p={p} />}
      front={
        <>
          <TypeLayer id="stk-f" H={H} rows={rows} clipD={notHead(p, H)} paint={() => ({ fill: "#fff" })} />
          <div style={{ position: "absolute", top: top + 10 * k, [left ? "right" : "left"]: M + 6 * k, ...capsLine(22 * k, 0.32, 800, "#fff") }}>{matchFacts(d).comp.toUpperCase() || roundTitle(d)}</div>
          <Info i={info} x={left ? CANVAS_W - M - w : M} y={iy} w={w} color="#fff" accent={t.glow} align={left ? "flex-end" : "flex-start"} />
        </>
      }
    />
  );
}

/* ================= 2 · Giant number, light (matchday) — pin2 r3c4, pin3 r2c5, r1c3 ================= */

/**
 * Número gigante · estúdio (matchday): a light studio ground; his shirt number (or the round) giant in the club
 * colour with a small "#", standing behind him — and its lower half drawn in front of his legs (interlock); a soft
 * floor shadow; the fixture block in dark ink at the top (or the foot when his head is up there).
 */
export function Usbignumber({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const p = standAt(d, 540, 900, 205);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || matchFacts(d).roundNo || "1";
  const w = CANVAS_W - 2 * M;
  const info = infoOf(d, w);
  const iy = infoY(d, p, info.h, "top");
  const atTop = iy === top;
  const nTop = atTop ? iy + info.h + 30 * k : top + 20 * k;
  const nBottom = atTop ? logoTopOf(d, H) - 60 * k : iy - 30 * k;
  const px = Math.min((nBottom - nTop) / 0.8, (CANVAS_W - 2 * M - 60 * k) / Math.max(0.1, num.length * 0.56));
  // Centred behind him; when his head would cover much of it, the number moves to the side away from his face.
  const h = headBox(p);
  const nw = wordW(num, px) * 1.12;
  const cover = Math.max(0, Math.min(CANVAS_W / 2 + nw / 2, h.x1) - Math.max(CANVAS_W / 2 - nw / 2, h.x0)) / nw;
  const sideL = p.fx > CANVAS_W / 2;
  const freeW = sideL ? h.x0 - M - 70 * k : CANVAS_W - M - h.x1;
  const pxS = Math.min(px, freeW / Math.max(0.1, num.length * 0.56 * 1.12));
  const move = cover > 0.35 && h.y1 > nTop && pxS >= px * 0.5;
  const nwS = wordW(num, pxS) * 1.12;
  const row: Row = move ? { text: num, x: sideL ? M + 70 * k + nwS / 2 : CANVAS_W - M - nwS / 2, y: nTop + (px - pxS) * 0.4, px: pxS, anchor: "middle" } : { text: num, x: CANVAS_W / 2 + 20 * k, y: nTop, px, anchor: "middle" };
  const b = rowBox(row);
  const line = Math.max(p.fy + p.fs * 2.4, b.y0 + (b.y1 - b.y0) * 0.55);
  const ink = t.ink;
  return (
    <Frame
      d={d}
      light
      bg="#f1f0ed"
      ground={
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #ffffff 0%, #f1f0ed 55%, #dedcd6 100%)" }} />
          <div style={{ position: "absolute", left: "15%", right: "15%", top: b.y1 - 40 * k, height: 90 * k, background: "radial-gradient(closest-side, rgba(0,0,0,.18), rgba(0,0,0,0))" }} />
        </>
      }
      behind={
        <>
          <TypeLayer id="num-b" H={H} rows={[row]} paint={() => ({ fill: ink })} />
          <div style={{ position: "absolute", left: b.x0 - 70 * k, top: b.y0 + 10 * k, fontFamily: DISPLAY, fontSize: row.px * 0.22, lineHeight: 1, color: ink }}>#</div>
        </>
      }
      fig={<Fig d={d} p={p} light />}
      front={
        <>
          <TypeLayer id="num-f" H={H} rows={[row]} clipD={belowLine(line, H, p)} paint={() => ({ fill: ink })} />
          <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: iy - 22 * k, height: info.h + 44 * k, borderRadius: 20 * k, background: "rgba(255,255,255,.88)", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }} />
          <Info i={info} x={M} y={iy} w={w} color="#15171b" accent={shade(ink, -0.1)} align="center" />
        </>
      }
    />
  );
}

/* ================= 3 · Light editorial MATCH DAY (matchday) — pin0 r3c2, pin7 r3c4 ================= */

/**
 * Editorial · match day (matchday): a white editorial ground; MATCH / DAY in near-black italic condensed caps,
 * staggered (MATCH left, DAY right), interlocked with him (his head in front); one club-colour rule running out from
 * DAY to the edge; him sharp with a soft shadow; crests and the fixture small in the lower-left corner.
 */
export function Useditorialmd({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const p = standAt(d, 560, 900, 205);
  const px = fitWord("MATCH", CANVAS_W - 2 * M - 40 * k, 300 * k);
  const w = 440 * k;
  const info = infoOf(d, w, 0.92);
  const iy = logoTopOf(d, H) - 60 * k - info.h;
  const r1 = safeRow(p, "MATCH", top + 60 * k, px, M, CANVAS_W - M - 60 * k, "start", 0.25, iy - 60 * k);
  const r2 = safeRow(p, "DAY", rowBox(r1).y1 + px * 0.06, px, M + 80 * k, CANVAS_W - M, "end", 0.25, iy - 60 * k);
  const rows = [r1, r2];
  const ruleY = rowBox(r2).y1 + 22 * k;
  const INK = "#121418";
  return (
    <Frame
      d={d}
      light
      bg="#f7f7f5"
      ground={<div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #ffffff 0%, #f3f3f1 60%, #e6e6e2 100%)" }} />}
      behind={
        <>
          <TypeLayer id="ed-b" H={H} rows={rows} skew={10} paint={() => ({ fill: INK })} />
          <div style={{ position: "absolute", left: M, right: 0, top: ruleY, height: 10 * k, background: t.ink }} />
        </>
      }
      fig={<Fig d={d} p={p} light />}
      front={
        <>
          <TypeLayer id="ed-f" H={H} rows={rows} skew={10} clipD={notHead(p, H)} paint={() => ({ fill: INK })} />
          <div style={{ position: "absolute", left: M - 12 * k, top: iy - 20 * k, width: w + 30 * k, height: info.h + 40 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.9)", boxShadow: "0 10px 30px rgba(0,0,0,.12)" }} />
          <Info i={info} x={M} y={iy} w={w} color={INK} accent={t.ink} />
        </>
      }
    />
  );
}

/* ================= 4 · Vertical band, light (matchday) — pin0 r4c2, pin6 r2c3 ================= */

/**
 * Faixa vertical · it's gameday (matchday): a light ground, a full-height band in the club colour down the right; IT'S
 * in a small accent box and GAMEDAY rotated up the band in white (in front of him except his head); him in black and
 * white (face sharp), overlapping the band's edge; the fixture in the band's foot.
 */
export function Usbandvertical({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const bw = 300 * k;
  const bx = CANVAS_W - bw;
  const p = standAt(d, 430, 880, 205);
  const iw = bw - 44 * k;
  const info = infoOf(d, iw, 0.85);
  const iy = logoTopOf(d, H) - 40 * k - info.h;
  // GAMEDAY rotated: its length runs down the band from the top to just above the fixture.
  const len = iy - 50 * k - (top + 80 * k);
  const px = Math.min((bw - 60 * k) / 0.8, len / Math.max(0.1, wordW("GAMEDAY", 1)));
  const cx = bx + bw / 2;
  const cy = top + 80 * k + len / 2;
  const word = (clip?: string, id = "band-b") => (
    <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {clip && (
        <defs>
          <clipPath id={id}>
            <path d={clip} clipRule="evenodd" fillRule="evenodd" />
          </clipPath>
        </defs>
      )}
      <g clipPath={clip ? `url(#${id})` : undefined}>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
          GAMEDAY
        </text>
      </g>
    </svg>
  );
  return (
    <Frame
      d={d}
      light
      bg="#f2f2f0"
      ground={<div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 35% 40%, #ffffff, #ecebe8 70%, #dfded9)" }} />}
      behind={
        <>
          <div style={{ position: "absolute", left: bx, top: 0, width: bw, height: H, background: t.ink }} />
          {word()}
        </>
      }
      fig={<Fig d={d} p={p} light filter="grayscale(1) contrast(1.12)" />}
      front={
        <>
          {word(notHead(p, H), "band-f")}
          <div style={{ position: "absolute", left: bx - 90 * k, top: top + 40 * k, padding: `${10 * k}px ${18 * k}px`, background: t.acc === "#ffffff" ? "#15171b" : t.acc, color: "#fff", fontFamily: DISPLAY, fontSize: 48 * k, lineHeight: 1, transform: "rotate(-6deg)", boxShadow: "0 8px 20px rgba(0,0,0,.25)" }}>IT&apos;S</div>
          <Info i={info} x={bx + 22 * k} y={iy} w={iw} color="#fff" accent="#fff" align="flex-end" />
        </>
      }
    />
  );
}

/* ================= 5 · One gold word (matchday) — pin0 r2c1 HOSTING ================= */

/**
 * Palavra dourada (matchday): his photo graded dark and contrasty; one wide word (MATCHDAY) in polished gold across
 * his chest, its top running behind his chin and shoulders, the rest in front (interlock), kept off the other players'
 * faces; a thin club-colour rule under it; crests "vs", the fixture and kick-off at the top (or the foot).
 */
export function Usgoldword({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k } = frameOf(d);
  const t = tones(d);
  const p = standAt(d, d.params.side === "left" ? 460 : 620, 800, 205);
  const word = (d.content.kicker || "Matchday").toUpperCase();
  const px = fitWord(word, CANVAS_W - 2 * M, 300 * k);
  const h = headBox(p);
  const cands = [h.y1 - px * 0.28, h.y1 + px * 0.15, h.y1 + px * 0.6, h.y1 + px * 1.1];
  const lt = logoTopOf(d, H);
  const w = CANVAS_W - 2 * M;
  const info = infoOf(d, w);
  const iy = infoY(d, p, info.h, "top");
  const floor = iy > frameOf(d).top ? iy - 40 * k : lt - 60 * k;
  const ys = cands.filter((y) => y + px * 0.8 + 30 * k < floor);
  const pick = ys.find((y) => !othersHit(p, { x0: M, x1: CANVAS_W - M, y0: y, y1: y + px * 0.8 })) ?? ys[0] ?? Math.min(cands[0], floor - 30 * k - px * 0.8);
  const row: Row = { text: word, x: CANVAS_W / 2, y: pick, px, anchor: "middle" };
  const gold = (id: string) => ({ fill: `url(#${id})`, stroke: "#6b4a06", strokeWidth: px * 0.012 });
  const grad = (id: string) => (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.45" stopColor="#f3c63a" />
          <stop offset="0.55" stopColor="#d9a01a" />
          <stop offset="1" stopColor="#a8760c" />
        </linearGradient>
      </defs>
    </svg>
  );
  return (
    <Frame
      d={d}
      bg="#0c0f14"
      ground={
        <>
          <NatGround place={p} W={CANVAS_W} H={H} style={{ filter: "contrast(1.18) saturate(.85) brightness(.66)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(0,0,0,.55) 100%)" }} />
        </>
      }
      behind={
        <>
          {grad("gold-a")}
          <TypeLayer id="gold-b" H={H} rows={[row]} paint={(q) => ({ ...gold("gold-a"), style: { fontFamily: DISPLAY, fontSize: q.px, filter: "drop-shadow(0 10px 24px rgba(0,0,0,.5))" } })} />
        </>
      }
      fig={<Fig d={d} p={p} />}
      front={
        <>
          {grad("gold-c")}
          <TypeLayer id="gold-f" H={H} rows={[row]} clipD={notHead(p, H)} paint={() => gold("gold-c")} />
          <div style={{ position: "absolute", left: CANVAS_W / 2 - 160 * k, width: 320 * k, top: pick + px * 0.8 + 22 * k, height: 8 * k, background: t.glow }} />
          <Info i={info} x={M} y={iy} w={w} color="#fff" accent="#f3c63a" align="center" />
        </>
      }
    />
  );
}
