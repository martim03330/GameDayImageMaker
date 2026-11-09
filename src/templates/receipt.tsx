/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* The thermal-paper strip, shared with goalreceipt.tsx.                                            */
/* ------------------------------------------------------------------------------------------------ */

/** One printed item of the receipt. */
export type Item =
  | { t: "crest"; url: string | null }
  | { t: "title"; text: string }
  | { t: "center"; text: string; dim?: boolean; bold?: boolean }
  | { t: "left"; text: string; bold?: boolean }
  | { t: "rule" }
  | { t: "row"; label: string; value: string; bold?: boolean }
  | { t: "space" }
  | { t: "barcode"; seed: number };

/** Characters per printed line: JetBrains Mono advances exactly 0.6em. */
export const COLS = 30;
const up = (s: string) => s.normalize("NFC").toUpperCase().replace(/\s+/g, " ").trim();

/** Words into lines of at most `n` characters (overlong words are cut hard). */
function wrap(text: string, n: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (let w of up(text).split(" ")) {
    while (w.length > n) {
      if (cur) out.push(cur), (cur = "");
      out.push(w.slice(0, n));
      w = w.slice(n);
    }
    if (!w) continue;
    if (!cur) cur = w;
    else if (cur.length + 1 + w.length <= n) cur += " " + w;
    else out.push(cur), (cur = w);
  }
  if (cur) out.push(cur);
  return out;
}

/** "GROUND ........ ESTÁDIO DR. JOSÉ" / "                       DE MATOS": label, dotted leader, value right. */
function rowLines(label: string, value: string): string[] {
  const L = up(label);
  const V = up(value.replace(/\n/g, " "));
  if (!V) return [L];
  if (L.length + 5 + V.length <= COLS) return [`${L} ${".".repeat(COLS - L.length - V.length - 2)} ${V}`];
  // "\n" in the value marks the preferred breaks (a club name stays whole); each piece is then wrapped
  // to the fewest lines, as even as possible ("ESTÁDIO DR." / "JOSÉ DE MATOS").
  const max = COLS - L.length - 5;
  const parts = value.split("\n").flatMap((piece) => {
    const n = wrap(piece, max).length;
    let v = max;
    while (v > 4 && wrap(piece, v - 1).length === n) v--;
    return wrap(piece, v);
  });
  return parts.map((p, i) => (i === 0 ? `${L} ${".".repeat(COLS - L.length - p.length - 2)} ${p}` : p.padStart(COLS, " ")));
}

type Line = { kind: "text" | "title" | "crest" | "barcode"; text?: string; h: number; bold?: boolean; dim?: boolean; align?: "center" | "left"; url?: string | null; seed?: number };

/** Lays the items out at font size `s`; heights are exact so the strip can be placed precisely. */
function layout(items: Item[], s: number): Line[] {
  const lh = s * 1.5;
  const out: Line[] = [];
  for (const it of items) {
    if (it.t === "crest") {
      if (it.url) out.push({ kind: "crest", url: it.url, h: s * 3.6 });
    } else if (it.t === "title") out.push({ kind: "title", text: up(it.text), h: s * 2.6 });
    else if (it.t === "center") for (const l of wrap(it.text, COLS)) out.push({ kind: "text", text: l, align: "center", h: lh, dim: it.dim, bold: it.bold });
    else if (it.t === "left") out.push({ kind: "text", text: up(it.text), align: "left", h: lh, bold: it.bold });
    else if (it.t === "rule") out.push({ kind: "text", text: "-".repeat(COLS), align: "left", h: lh, dim: true });
    else if (it.t === "row") for (const l of rowLines(it.label, it.value)) out.push({ kind: "text", text: l, align: "left", h: lh, bold: it.bold });
    else if (it.t === "space") out.push({ kind: "text", text: "", h: s * 0.7 });
    else if (it.t === "barcode") out.push({ kind: "barcode", seed: it.seed, h: s * 3.4 });
  }
  return out;
}

/** Strip geometry for an outer width `w`. */
export function paperMetrics(w: number) {
  const tooth = w / Math.round(w / 22);
  const depth = tooth * 0.42;
  const padX = w * 0.075;
  const s = (w - 2 * padX) / (0.6 * COLS);
  const padY = depth + s * 1.5;
  return { tooth, depth, padX, s, padY };
}

export function paperHeight(items: Item[], w: number) {
  const m = paperMetrics(w);
  return Math.round(2 * m.padY + layout(items, m.s).reduce((a, l) => a + l.h, 0));
}

/** A zigzag-torn top and bottom edge as a clip-path polygon. */
function torn(w: number, h: number, tooth: number, depth: number) {
  const n = Math.round(w / tooth);
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i * tooth).toFixed(1)}px ${i % 2 ? 0 : depth.toFixed(1)}px`);
  for (let i = n; i >= 0; i--) pts.push(`${(i * tooth).toFixed(1)}px ${(h - (i % 2 ? 0 : depth)).toFixed(1)}px`);
  return `polygon(${pts.join(",")})`;
}

function Bars({ w, h, seed, ink }: { w: number; h: number; seed: number; ink: string }) {
  const r = rng(seed || 7);
  const bars: ReactNode[] = [];
  let x = 0;
  let i = 0;
  const unit = w / 150;
  while (x < w - unit * 4) {
    const bw = unit * (1 + Math.floor(r() * 3));
    const gap = unit * (1 + Math.floor(r() * 2.4));
    bars.push(<div key={i++} style={{ position: "absolute", left: x, top: 0, width: bw, height: h, background: ink }} />);
    x += bw + gap;
  }
  return <div style={{ position: "relative", width: x, height: h, margin: "0 auto" }}>{bars}</div>;
}

/**
 * The receipt: an off-white thermal strip with zigzag-torn ends, monospaced print slightly faded,
 * a soft shadow under it. `x`/`y` place its top-left corner; `rotate` tilts it about its centre.
 */
export function Paper({ items, x, y, w, rotate = 0, shadow = "rgba(0,0,0,.32)" }: { items: Item[]; x: number; y: number; w: number; rotate?: number; shadow?: string }) {
  const m = paperMetrics(w);
  const lines = layout(items, m.s);
  const h = paperHeight(items, w);
  const ink = "#2b2925";
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: rotate ? `rotate(${rotate}deg)` : undefined, filter: `drop-shadow(0 ${m.s * 0.9}px ${m.s * 1.6}px ${shadow}) drop-shadow(0 2px 3px rgba(0,0,0,.18))` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: torn(w, h, m.tooth, m.depth),
          background: "linear-gradient(to bottom, #fbf9f4 0%, #f4f1ea 55%, #efebe2 100%)",
        }}
      >
        {/* A faint fold/curl highlight down the middle of the paper. */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,.035), transparent 18%, transparent 82%, rgba(0,0,0,.045))" }} />
        <div style={{ position: "absolute", left: m.padX, right: m.padX, top: m.padY, fontFamily: MONO, fontWeight: 500, fontSize: m.s, color: ink }}>
          {lines.map((l, i) => {
            if (l.kind === "crest")
              return (
                <div key={i} style={{ height: l.h, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                  <img src={l.url!} alt="" style={{ height: l.h * 0.78, width: l.h * 0.78, objectFit: "contain", filter: "grayscale(1) contrast(1.25) brightness(.9)", mixBlendMode: "multiply", opacity: 0.85 }} />
                </div>
              );
            if (l.kind === "title")
              return (
                <div key={i} style={{ height: l.h, display: "flex", justifyContent: "center", alignItems: "flex-start", fontWeight: 700, fontSize: m.s * 2.05, lineHeight: 1, letterSpacing: "0.16em", paddingLeft: "0.16em", whiteSpace: "nowrap" }}>
                  {l.text}
                </div>
              );
            if (l.kind === "barcode")
              return (
                <div key={i} style={{ height: l.h, paddingTop: m.s * 0.6 }}>
                  <Bars w={(w - 2 * m.padX) * 0.78} h={l.h - m.s * 0.6} seed={l.seed ?? 1} ink={ink} />
                </div>
              );
            return (
              <div key={i} style={{ height: l.h, lineHeight: `${l.h}px`, whiteSpace: "pre", textAlign: l.align, fontWeight: l.bold ? 700 : 500, opacity: l.dim ? 0.55 : 0.9 }}>
                {l.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** A stable number from a string (for the barcode). */
export const hash = (s: string) => [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 17);

/* ------------------------------------------------------------------------------------------------ */

/**
 * Receipt: the matchday printed on a till receipt. A clean club-colour ground; the player cutout big on
 * one side in natural colour; on the other an off-white thermal strip with torn ends — the crest in grey,
 * "MATCHDAY", the competition, a dashed rule, HOME / AWAY / DATE / KICK-OFF / GROUND with dotted leaders,
 * "TOTAL ..... 90 MIN", "THANK YOU FOR COMING" and a barcode. The NEYOD mark under the strip.
 */
export function Receipt({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = clubTone(data);
  const f = matchFacts(data);
  const [home, away] = teamsOf(data);
  const left = params.side === "left"; // player on the left, strip on the right

  /* ---- the strip ---- */
  const venue = (content.venue ?? "").trim() || f.venue;
  const items: Item[] = [
    { t: "crest", url: f.ourCrest },
    { t: "title", text: content.kicker || "Matchday" },
    ...(f.comp ? [{ t: "center", text: f.comp, dim: true } as Item] : []),
    ...(f.round ? [{ t: "center", text: f.round, dim: true } as Item] : []),
    { t: "rule" },
    ...(home ? [{ t: "row", label: "Home", value: home } as Item] : []),
    ...(away ? [{ t: "row", label: "Away", value: away } as Item] : []),
    ...(content.date ? [{ t: "row", label: "Date", value: [f.day, f.mon].filter(Boolean).join(" ") || niceDate(content.date) } as Item] : []),
    ...(f.time ? [{ t: "row", label: "Kick-off", value: f.time } as Item] : []),
    ...(venue ? [{ t: "row", label: "Ground", value: venue } as Item] : []),
    { t: "rule" },
    { t: "row", label: "Total", value: "90 min", bold: true },
    { t: "rule" },
    { t: "space" },
    { t: "center", text: "Thank you for coming" },
    { t: "barcode", seed: hash(content.gameId ?? home + away) },
  ];
  const ts = params.textScale ?? 1;
  const w = Math.round((story ? 560 : 430) * ts);
  const h = paperHeight(items, w);
  const M = story ? 64 : 64;

  /* ---- the logo under the strip, the strip ~64px above it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const py = Math.max(story ? STORY_TOP : 60, H - logoBottom - logoH - (story ? 66 : 60) - h) + (params.textY ?? 0);
  const px = left ? CANVAS_W - M - w : M;
  const colCx = px + w / 2;

  /* ---- the player, big, on the other side ---- */
  const faceX = left ? (story ? 330 : 320) : CANVAS_W - (story ? 330 : 320);
  const sizes = story ? { chest: 330, waist: 270, knees: 210, full: 170 } : { chest: 250, waist: 200, knees: 156, full: 124 };
  const box = placeByFace(data, faceX, story ? STORY_TOP + 120 : 150, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.3) }}>
      {/* A clean ground: the club colour with a soft light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(club, -0.32)}, ${shade(club, -0.66)})` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 40% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.16), transparent 75%)` }} />
      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2, top: chin + box.faceH * 0.4, width: box.faceH * 4, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.22)", filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 360, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.28))" }} />

      <Paper items={items} x={px} y={py} w={w} />

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: colCx, bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.12} />
    </div>
  );
}
