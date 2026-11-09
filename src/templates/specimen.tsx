/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { mix, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Bodoni Moda 500: advance widths per 100px (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.4, d: 61.7, e: 52.6, f: 35.4, g: 60.3, h: 60.4, i: 31, j: 31.3, k: 61.6, l: 35.7, m: 86.9, n: 60.4, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 59.3, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, A: 78.4, B: 67.1, C: 71.8, D: 73.8, E: 62.6, F: 60.4, G: 74.7, H: 77.4, I: 39.9, J: 47.7, K: 72.6, L: 61.1, M: 88.4, N: 77.6, O: 75.7, P: 65.2, Q: 75.7, R: 73.1, S: 57.5, T: 68.1, U: 73, V: 78.2, W: 103.7, X: 77.8, Y: 74.6, Z: 59.5, " ": 25, ".": 21.6, ",": 23.2, "-": 35.9, "'": 21.6, "/": 40, ":": 22, "&": 80, "!": 30, "?": 45 };
export const bodEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BOD_W[c] ?? (/\d/.test(c) ? 56 : 60)) / 100, 0);
/** Bodoni Moda metrics (em): with line-height 1 the baseline sits 0.865em below the box top. */
export const BOD = { base: 0.865, cap: 0.75, x: 0.46 };
/** JetBrains Mono: every glyph is 0.6em; `track` em of letter-spacing per glyph. */
export const monoW = (t: string, size: number, track: number) => [...t].length * size * (0.6 + track);

export type Meta = { label: string; value: string };

/** "SC Vianense SAD" → "SC VIANENSE SAD"; values in caps, as stored otherwise. */
export const caps = (t: string) => t.toUpperCase();

/** The metadata lines of a specimen sheet: hairline, LABEL — VALUE in mono caps, hairline… */
export function MetaRows({ rows, x, y, w, size, rowH, ink, dim, rule }: { rows: Meta[]; x: number; y: number; w: number; size: number; rowH: number; ink: string; dim: string; rule: string }) {
  const track = 0.08;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: 1, background: rule }} />
      {rows.map((r, i) => {
        const text = `${r.label} — ${r.value}`;
        const s = Math.max(size * 0.62, Math.min(size, w / Math.max(1, monoW(text, 1, track))));
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x, top: y + i * rowH, height: rowH, display: "flex", alignItems: "center", fontFamily: MONO, fontWeight: 500, fontSize: s, letterSpacing: `${track}em`, whiteSpace: "nowrap", color: ink }}>
              <span style={{ color: dim }}>{r.label} —&nbsp;</span>
              {r.value}
            </div>
            <div style={{ position: "absolute", left: x, top: y + (i + 1) * rowH, width: w, height: 1, background: rule }} />
          </div>
        );
      })}
    </>
  );
}

/** Guide lines across a big Bodoni sample (cap height, x-height, baseline) with tiny mono labels at their ends. */
export function Guides({ x, w, top, size, rule, dim, label, xLine = true, labelLeft = false }: { x: number; w: number; top: number; size: number; rule: string; dim: string; label: number; xLine?: boolean; labelLeft?: boolean }) {
  const base = top + BOD.base * size;
  const lines = [
    { y: base - BOD.cap * size, t: "CAP" },
    ...(xLine ? [{ y: base - BOD.x * size, t: "X" }] : []),
    { y: base, t: "BASE" },
  ];
  return (
    <>
      {lines.map((l) => (
        <div key={l.t}>
          <div style={{ position: "absolute", left: x, top: l.y, width: w, height: 1, background: rule }} />
          <div style={{ position: "absolute", left: labelLeft ? x : x + w - monoW(l.t, label, 0.12), top: l.y - label * 1.5, fontFamily: MONO, fontWeight: 500, fontSize: label, lineHeight: 1, letterSpacing: "0.12em", color: dim, whiteSpace: "nowrap" }}>{l.t}</div>
        </div>
      ))}
    </>
  );
}

/** A horizontal mask (in the figure's own box) fading him out towards the type column. */
export function specimenFade(left: number, width: number, colX: number, colW: number, playerLeft: boolean, soft = 70): string {
  const pct = (x: number) => `${(((x - left) / width) * 100).toFixed(2)}%`;
  return playerLeft
    ? `linear-gradient(to right, #000 ${pct(colX - 24 - soft)}, transparent ${pct(colX - 24)})`
    : `linear-gradient(to right, transparent ${pct(colX + colW + 24)}, #000 ${pct(colX + colW + 24 + soft)})`;
}

const PAPER = "#f2f0ea";
const INK = "#1d1c1a";
const DIM = "rgba(29,28,26,.46)";
const RULE = "rgba(29,28,26,.22)";

/**
 * Specimen: a foundry type-specimen sheet. On pale paper, one column: a mono caps header over a hairline,
 * a huge Bodoni "Aa" with its cap-height, x-height and baseline guides, the sample word "Matchday", the
 * character set in two cases and figures, then the specimen metadata in tiny mono caps between hairlines
 * (FIXTURE — SC VIANENSE SAD V LEIXÕES, DATE, KICK-OFF, GROUND). The player stands on the other side, big
 * and in natural colour.
 */
export function Specimen({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.22 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";

  /* ---- the column ---- */
  const colW = story ? 548 : 520;
  const colX = playerLeft ? CANVAS_W - 64 - colW : 64;

  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* header */
  const hSize = 13 * k;
  const top0 = (story ? STORY_TOP : 64) + (params.textY ?? 0);
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const left = "TYPE SPECIMEN";
  const compSize = Math.min(hSize, (colW - monoW(left, hSize, 0.14) - 40) / Math.max(1, monoW(comp, 1, 0.14)));
  const hRule = top0 + hSize + 16 * k;

  /* the metadata, anchored above the logo */
  const [home, away] = teamsOf(data);
  const venue = (content.venue ?? "").trim() || f.venue;
  const rows = [
    ...(home ? [{ label: "FIXTURE", value: caps(away ? `${home} v ${away}` : home) }] : []),
    ...(f.day ? [{ label: "DATE", value: `${f.day} ${f.mon}`.trim() }] : []),
    ...(f.time ? [{ label: "KICK-OFF", value: f.time }] : []),
    ...(venue ? [{ label: "GROUND", value: caps(venue) }] : []),
  ];
  const rowH = 44 * k;
  const mSize = 14.5 * k;
  const rowsTop = logoTop - (story ? 64 : 60) - rows.length * rowH;

  /* the big "Aa" */
  const aSize = Math.min(story ? 470 : 380, (colW - 64 * k) / bodEm("Aa"));
  const aTop = hRule + 14 * k;
  const aBase = aTop + BOD.base * aSize;

  /* the sample word and the character set, shared out between "Aa" and the metadata */
  const word = sentenceCase(content.kicker || "Matchday");
  const wSize = Math.min(130 * k, colW / Math.max(1, bodEm(word)));
  const set = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "0123456789&?!"];
  const sSize = Math.min(44 * k, ...set.map((t) => (colW * 0.92) / bodEm(t)));
  const sLead = sSize * 1.16;
  const wordH = wSize * 1.02;
  const setH = set.length * sLead;
  const free = rowsTop - aBase - wordH - setH;
  const gap = free / 3.4;
  const wordTop = aBase + gap * 1.2 - wSize * 0.12;
  const setTop = wordTop + wordH + gap;
  const showSet = free > 90 * k;

  /* ---- the player ---- */
  const faceX = playerLeft ? (story ? 250 : 255) : CANVAS_W - (story ? 250 : 255);
  const sizes = story ? { chest: 300, waist: 240, knees: 188, full: 150 } : { chest: 236, waist: 188, knees: 148, full: 118 };
  const pb = placeByFace(data, faceX, story ? STORY_TOP + 140 : 160, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = pb.top + face[1] * pb.height + pb.faceH;

  // Whatever of him reaches towards the column melts away before it, so the type never sits on his kit.
  const sideFade = specimenFade(pb.left, pb.width, colX, colW, playerLeft, story ? 150 : 90);

  const paper = mix(PAPER, club, 0.03);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 45% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.6), transparent 75%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 100% at 50% 40%, transparent 60%, rgba(70,62,50,.1))" }} />

      {/* The player, a soft shade behind his shoulders. */}
      <div style={{ position: "absolute", left: faceX - pb.faceH * 2, top: chin + pb.faceH * 0.4, width: pb.faceH * 4, height: pb.faceH * 6, borderRadius: "50%", background: "rgba(40,34,26,.13)", filter: `blur(${story ? 80 : 60}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: pb.left, top: pb.top, width: pb.width, height: pb.height, WebkitMaskImage: sideFade, maskImage: sideFade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Header */}
      <div style={{ position: "absolute", left: colX, top: top0, fontFamily: MONO, fontWeight: 500, fontSize: hSize, lineHeight: 1, letterSpacing: "0.14em", color: INK, whiteSpace: "nowrap" }}>{left}</div>
      {comp && <div style={{ position: "absolute", left: colX + colW - monoW(comp, compSize, 0.14), top: top0 + (hSize - compSize), fontFamily: MONO, fontWeight: 500, fontSize: compSize, lineHeight: 1, letterSpacing: "0.14em", color: DIM, whiteSpace: "nowrap" }}>{comp}</div>}
      <div style={{ position: "absolute", left: colX, top: hRule, width: colW, height: 1, background: INK, opacity: 0.8 }} />

      {/* The big sample with its guides. */}
      <Guides x={colX} w={colW} top={aTop} size={aSize} rule={RULE} dim={DIM} label={10 * k} />
      <div style={{ position: "absolute", left: colX - aSize * 0.01, top: aTop, fontFamily: BODONI, fontWeight: 500, fontSize: aSize, lineHeight: 1, color: INK, whiteSpace: "nowrap" }}>Aa</div>

      {/* The sample word and the character set. */}
      <div style={{ position: "absolute", left: colX - wSize * 0.02, top: wordTop, fontFamily: BODONI, fontWeight: 500, fontSize: wSize, lineHeight: 1, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap" }}>{word}</div>
      {showSet &&
        set.map((t, i) => (
          <div key={t} style={{ position: "absolute", left: colX, top: setTop + i * sLead, fontFamily: BODONI, fontWeight: 500, fontSize: sSize, lineHeight: 1, letterSpacing: "0.02em", color: i < 2 ? INK : "rgba(29,28,26,.78)", whiteSpace: "nowrap" }}>{t}</div>
        ))}

      <MetaRows rows={rows} x={colX} y={rowsTop} w={colW} size={mSize} rowH={rowH} ink={INK} dim={DIM} rule={RULE} />

      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", left: colX, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "left bottom" }} />
      <Film strength={0.1} />
    </div>
  );
}
