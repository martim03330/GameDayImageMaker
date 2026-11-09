/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { Paper, rng } from "./kit";
import { crestsOf, OwnPhotoBlur, placeByFace, sceneOf, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Inter advance widths at weight 700 (per 100px), measured in the browser. */
const INTER_700: Record<string, number> = {
  a: 58.1, b: 63, c: 58.8, d: 63, e: 59.6, f: 39.8, g: 63.2, h: 62.3, i: 27.1, j: 27.1, k: 58, l: 27.1, m: 91.2, n: 62.2, o: 61.3, p: 63, q: 63, r: 40.7, s: 56, t: 36.6, u: 62.3, v: 60, w: 85, x: 58, y: 60.2, z: 57.3,
  A: 74.7, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 74.7, W: 103.8, X: 73.8, Y: 73.1, Z: 66.4,
  "'": 33.9, "’": 33.9, " ": 23.7, "-": 46.8, "!": 33.8, ".": 28,
};
const plain = (c: string) => c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
/** Glyph advance of one character in Inter 700, per 1px of font size. */
const adv = (c: string) => (INTER_700[plain(c)] ?? (/\d/.test(c) ? 64 : 62)) / 100;
/** Tight tracking of the big caption, in em. */
const TRACK = -0.055;
/** Width of `text` set in Inter 700 at `size`, with `track` em of letter spacing. */
export function interWidth(text: string, size: number, track = TRACK): number {
  return [...text].reduce((a, c) => a + adv(c) + track, 0) * size;
}

/** Filter that turns a coloured crest into white line-art: dark / coloured parts white, white parts see-through. */
export function WhiteCrestDefs({ id }: { id: string }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.34 -0.62 -0.12 0 1.2" result="w" />
        <feComposite in="w" in2="SourceGraphic" operator="in" result="art" />
        {/* A thin outline keeps pale crests (white shields, gold) readable. */}
        <feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="fat" />
        <feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="thin" />
        <feComposite in="fat" in2="thin" operator="out" result="ring" />
        <feColorMatrix in="ring" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="ringW" />
        <feMerge>
          <feMergeNode in="art" />
          <feMergeNode in="ringW" />
        </feMerge>
      </filter>
    </svg>
  );
}

/** Words that stay small and tuck in between the big ones ("Player / of the / Match"). */
const SMALL_WORDS = new Set(["of", "the", "a", "an", "in", "on", "to", "for", "by", "at", "and", "&", "vs", "v", "x", "de", "da", "do"]);
/** Acronyms keep their capitals. */
const ACRONYMS = new Set(["MVP", "XI", "POTM", "POTY", "UCL", "PL", "OK"]);
/** Single words that read better broken in two: "Match / day". */
const COMPOUNDS: [RegExp, number][] = [
  [/^(MATCH|GAME)DAY$/, 5],
  [/^FULLTIME$/, 4],
  [/^HAT-?TRICK$/, 4],
  [/^GAMEWEEK$/, 4],
];

type Line = { text: string; small?: string };

/** The kicker as sentence-case lines, with the small linking words set aside to be tucked in. */
function captionLines(kicker: string): Line[] {
  let words = kicker.replace(/’/g, "'").trim().split(/\s+/).filter(Boolean);
  if (words.length > 1 && /^IT'S$/i.test(words[0])) words = words.slice(1);
  if (words.length === 1) {
    const c = COMPOUNDS.find(([re]) => re.test(words[0].toUpperCase()));
    if (c) words = [words[0].slice(0, c[1]).replace(/-$/, "") + (words[0][c[1]] === "-" ? "-" : ""), words[0].slice(c[1]).replace(/^-/, "")];
  }
  const lines: Line[] = [];
  let pending: string[] = [];
  words.forEach((w, i) => {
    const lower = w.toLowerCase();
    const acr = ACRONYMS.has(w.toUpperCase());
    if (i > 0 && SMALL_WORDS.has(lower) && i < words.length - 1) {
      pending.push(lower);
      return;
    }
    // Sentence case, except a noun after "of the" keeps its capital (Player of the Match).
    const text = acr ? w.toUpperCase() : i === 0 || pending.length ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : lower;
    lines.push({ text, small: pending.length ? pending.join(" ") : undefined });
    pending = [];
  });
  // More than three big lines: pair the words up so the block stays a block.
  while (lines.length > 3) {
    let best = 0;
    let bestW = Infinity;
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i + 1].small) continue;
      const w = interWidth(lines[i].text + " " + lines[i + 1].text, 100);
      if (w < bestW) [bestW, best] = [w, i];
    }
    if (bestW === Infinity) break;
    lines.splice(best, 2, { text: lines[best].text + " " + lines[best + 1].text, small: lines[best].small });
  }
  return lines;
}

const ASCENDERS = /[A-Z0-9bdfhijklt'!ÀÁÂÃÉÊÍÓÔÕÚÇ]/;
const DESCENDERS = /[gjpqyç]/;

/** x-ranges (from the line's left edge) of the glyphs matching `re`. */
function ranges(text: string, size: number, re: RegExp): [number, number][] {
  const out: [number, number][] = [];
  let x = 0;
  for (const c of text) {
    const w = (adv(c) + TRACK) * size;
    if (re.test(c)) out.push([x - size * 0.03, x + w + size * 0.03]);
    x += w;
  }
  return out;
}

/** First x where a `width`-wide slot fits between `blocked` ranges inside [from, to], or null. */
function slot(blocked: [number, number][], width: number, from: number, to: number): number | null {
  const bs = [...blocked].sort((a, b) => a[0] - b[0]);
  let x = from;
  for (const [a, b] of bs) {
    if (b <= x) continue;
    if (a - x >= width) return x;
    x = Math.max(x, b);
  }
  return to - x >= width ? x : null;
}

const WHITE = "#ffffff";
const PAPER = "#ece8df";
const TEXT_SHADOW = "0 6px 40px rgba(0,0,0,.28)";

/** Short line of match / deal info for the corner, sentence case. */
function infoLines(data: RenderData): string[] {
  const c = data.content;
  const t = data.postType;
  const score = scoreOf(data, "–");
  // The competition as the club writes it ("Taça de Portugal"), never the "VS …" part.
  const comp = (c.subline.split("·")[0] ?? "").trim();
  const title = (s: string) => s.toLowerCase().replace(/(^|[\s.-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
  if (t === "result" || t === "goal") {
    const teams = c.homeTeam && c.awayTeam ? `${c.homeTeam} ${score || "v"} ${c.awayTeam}` : score;
    return [teams, /[a-z]/.test(comp) ? comp : title(comp)].filter(Boolean);
  }
  if (t === "matchday") {
    return [[c.homeTeam, c.awayTeam].filter(Boolean).join(" v "), [title(c.date ?? ""), c.time].filter(Boolean).join(" · ")].filter(Boolean);
  }
  if (t === "renewal") return [c.until ? `Contract until ${c.until}` : "", data.club?.name ?? ""].filter(Boolean);
  if (t === "transfer") {
    const to = (data.toClub ?? data.club)?.name;
    return [data.fromClub ? `From ${data.fromClub.name}` : "", to ? `To ${to}` : ""].filter(Boolean);
  }
  return [title(c.subline)].filter(Boolean);
}

/** Thin crease across the print: a light line with a dark shadow beside it, wandering a little. */
function creases(r: () => number, n: number): string[] {
  const out: string[] = [];
  for (let k = 0; k < n; k++) {
    const vertical = r() < 0.5;
    // Near the edges of the print, never across the face or the caption.
    const span = vertical ? CANVAS_W : CANVAS_H;
    const edge = 30 + r() * (vertical ? 150 : 180);
    const start = r() < 0.5 ? edge : span - edge;
    const pts: [number, number][] = [];
    const steps = 7 + Math.floor(r() * 5);
    const len = (vertical ? CANVAS_H : CANVAS_W) * (0.25 + r() * 0.5);
    const from = r() < 0.5 ? 0 : (vertical ? CANVAS_H : CANVAS_W) - len;
    let off = start;
    for (let i = 0; i <= steps; i++) {
      const along = from + (len * i) / steps;
      off += (r() - 0.5) * 26;
      pts.push(vertical ? [off, along] : [along, off]);
    }
    out.push("M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L"));
  }
  return out;
}

/**
 * Printed "Player of the Match" photo (Nottingham Forest): the player big, waist up, over his own photo
 * blurred into bokeh; a thin worn off-white paper frame with creases and tick marks; the caption at the
 * bottom left in huge, tightly set sentence-case grotesk, its small linking words ("of the") tucked in
 * between the big ones; the crests bottom right as white line-art with two small stars.
 */
export function Caption({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 71);
  const right = params.side !== "left";
  const sgn = right ? 1 : -1;
  const club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const ts = params.textScale ?? 1;

  const B = 22; // frame
  const BB = 34; // frame at the foot (ticks)
  const inner = { left: B, top: B, width: CANVAS_W - 2 * B, height: CANVAS_H - B - BB };

  // ---- the player: big, face high in the frame ----
  const faceX = 540 + sgn * (30 + r() * 40);
  const faceTop = 150 + r() * 40;
  const fig = placeByFace(data, faceX, faceTop, { chest: 290, waist: 220, knees: 160, full: 125 });

  // ---- the caption ----
  const lines = captionLines(content.kicker || "Player of the match");
  const left = 64;
  const bottomLine = CANVAS_H - BB - 96; // last baseline
  const crests = postType === "matchday" || postType === "result" || postType === "goal" ? crestsOf(data) : postType === "transfer" ? ([data.fromClub?.crestUrl, (data.toClub ?? data.club)?.crestUrl].filter(Boolean) as string[]) : ([data.club?.crestUrl].filter(Boolean) as string[]);
  const crestH = crests.length > 1 ? 112 : 132;
  const crestBlock = crests.length ? crests.length * crestH * 0.9 + (crests.length - 1) * 26 + 70 : 0;
  // Every line fills the width; the last one stops short of the crests.
  const lastMax = CANVAS_W - left - 60 - crestBlock;
  const fullMax = CANVAS_W - left - 70;
  let big = (lines.length === 1 ? 290 : 225) * ts;
  lines.forEach((l, i) => {
    const max = i === lines.length - 1 ? lastMax : fullMax;
    big = Math.min(big, max / Math.max(0.5, interWidth(l.text, 1)));
  });
  big = Math.max(70, big);
  const small = big * 0.36;
  const lead = big * 0.9;
  const baselines = lines.map((_, i) => bottomLine - (lines.length - 1 - i) * lead);

  // Small words: in the gap over the next line's x-height, clear of ascenders above and descenders
  // of the line before; otherwise they trail the previous line, sitting on its baseline.
  type Small = { text: string; x: number; baseline: number };
  const smalls: Small[] = [];
  lines.forEach((l, i) => {
    if (!l.small || i === 0) return;
    const sw = interWidth(l.small, small, -0.02);
    const prev = lines[i - 1];
    const blocked = [...ranges(l.text, big, ASCENDERS), ...ranges(prev.text, big, DESCENDERS)];
    const x = slot(blocked, sw + big * 0.04, big * 0.02, Math.min(interWidth(l.text, big), fullMax));
    if (x != null) smalls.push({ text: l.small, x: left + x + big * 0.02, baseline: baselines[i] - big * 0.6 });
    else smalls.push({ text: l.small, x: left + interWidth(prev.text, big) + big * 0.1, baseline: baselines[i - 1] });
  });

  // ---- corner info, opposite the player's shift ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").replace(/(^|\s)(\p{Ll})/gu, (_, a, b) => a + b.toUpperCase());
  const info = infoLines(data);
  const infoSide: CSSProperties = right ? { left: 62, alignItems: "flex-start", textAlign: "left" } : { right: 62, alignItems: "flex-end", textAlign: "right" };
  const nameSize = Math.min(34, 330 / Math.max(1, interWidth(name, 1, -0.02)));

  // The scene: his own photo, heavily blurred (bokeh); a ground photo when there is none.
  const scene = sceneOf(data);
  const creaseLines = creases(r, 3);
  const ticks = Array.from({ length: 8 }, (_, i) => 70 + i * 134 + (r() - 0.5) * 10);
  const starX = right ? 210 + r() * 120 : CANVAS_W - 330 - r() * 120;

  const filterId = `caption-white-${params.seed ?? 0}`;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: WHITE, fontFamily: SANS }}>
      <WhiteCrestDefs id={filterId} />
      <Paper color={PAPER} strength={1.4} />

      {/* The print. */}
      <div style={{ position: "absolute", ...inner, overflow: "hidden", background: shade(club, -0.55) }}>
        <div style={{ position: "absolute", left: -B, top: -B, width: CANVAS_W, height: CANVAS_H }}>
          {data.bgPhotoUrl ? (
            <OwnPhotoBlur data={data} blur={46} style={{ filter: "blur(46px) saturate(1.25) brightness(.9)", transform: "scale(1.12)" }} />
          ) : scene ? (
            <img src={scene} alt="" style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: CANVAS_H + 120, maxWidth: "none", objectFit: "cover", filter: "blur(30px) saturate(1.1) brightness(.85)" }} />
          ) : null}
          {/* Club colour pushed into the bokeh, darker at the edges. */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at ${right ? 60 : 40}% 40%, transparent 30%, ${shade(club, -0.35)}aa 100%)`, mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, background: club, opacity: 0.18, mixBlendMode: "color" }} />

          {data.photoUrl && (
            <img
              src={data.photoUrl}
              alt=""
              style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05) drop-shadow(0 30px 60px rgba(0,0,0,.35))", ...cutMask(data.cut) }}
            />
          )}
          {/* Foot of the print darkens under the caption. */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.28), transparent 18%, transparent 55%, rgba(0,0,0,.42) 85%, rgba(0,0,0,.5))" }} />

          {/* Caption: huge, tight, sentence case, in front of the body. */}
          {lines.map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top: baselines[i] - big * 0.97,
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: big,
                lineHeight: 1.2,
                letterSpacing: `${TRACK}em`,
                whiteSpace: "nowrap",
                color: "#f7f5f0",
                textShadow: TEXT_SHADOW,
              }}
            >
              {l.text}
            </div>
          ))}
          {smalls.map((s, i) => (
            <div
              key={`s${i}`}
              style={{ position: "absolute", left: s.x, top: s.baseline - small * 0.97, fontFamily: SANS, fontWeight: 700, fontSize: small, lineHeight: 1.2, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: "#f7f5f0", textShadow: TEXT_SHADOW }}
            >
              {s.text}
            </div>
          ))}

          {/* Crests as white line-art, stars above the first. */}
          {crests.length > 0 && (
            <div style={{ position: "absolute", right: 66, top: bottomLine - crestH + 4, display: "flex", alignItems: "flex-end", gap: 26 }}>
              {crests.map((c, i) => (
                <div key={i} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {i === 0 && <div style={{ position: "absolute", top: -32, fontSize: 20, letterSpacing: "0.12em", color: WHITE, opacity: 0.95 }}>★★</div>}
                  <img src={c} alt="" style={{ height: crestH, width: crestH * 0.9, objectFit: "contain", filter: `url(#${filterId}) drop-shadow(0 2px 10px rgba(0,0,0,.25))`, opacity: 0.95 }} />
                </div>
              ))}
            </div>
          )}

          {/* Corner: stars, name, the facts of the post. */}
          <div style={{ position: "absolute", top: 70, display: "flex", flexDirection: "column", gap: 8, maxWidth: 360, ...infoSide }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: nameSize, letterSpacing: "-0.02em", lineHeight: 1.05, textShadow: "0 2px 16px rgba(0,0,0,.45)" }}>{name}</div>
            {info.map((t, i) => (
              <div key={i} style={{ fontFamily: SANS, fontWeight: 500, fontSize: Math.min(21, 360 / Math.max(1, interWidth(t, 1, 0))), lineHeight: 1.25, opacity: 0.92, textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: starX, top: 290 + r() * 60, fontSize: 13, letterSpacing: "0.14em", opacity: 0.75 }}>★★</div>
          <AgencyLogo data={data} height={24} style={{ position: "absolute", top: 72, [right ? "right" : "left"]: 62, opacity: 0.9 }} />
        </div>
        <Film strength={0.9} />
        {/* Worn print: a soft inner edge. */}
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.25), inset 0 0 26px rgba(0,0,0,.35)" }} />
      </div>

      {/* Creases over paper and print alike. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} data-bleed>
        {creaseLines.map((d, i) => (
          <g key={i} fill="none" strokeLinejoin="round">
            <path d={d} stroke="rgba(0,0,0,.22)" strokeWidth={1.6} transform="translate(1.2 1.2)" />
            <path d={d} stroke="rgba(255,255,255,.34)" strokeWidth={1.1} />
          </g>
        ))}
        {/* Tick marks on the foot of the frame. */}
        {ticks.map((x, i) => (
          <line key={i} x1={x} x2={x} y1={CANVAS_H - BB - 12} y2={CANVAS_H - BB + 12} stroke={i % 2 ? "rgba(255,255,255,.85)" : "rgba(30,28,26,.7)"} strokeWidth={2} />
        ))}
      </svg>
    </div>
  );
}
