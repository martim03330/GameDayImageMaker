/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** DM Serif Display italic: advance widths per 100px (measured in the browser; as in goalheroserif.tsx). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, "!": 29.9, ".": 30.8, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
const CAP = 0.66;
const ASC = 0.7;
const XH = 0.5;
const inkTop = (t: string) => plain(t).reduce((a, c) => Math.max(a, /[A-Z0-9]/.test(c) ? CAP : /[bdfhklt!'ij]/.test(c) ? ASC : XH), 0);
const leftIn = (t: string) => (/^[GCOQ]/.test(plain(t)[0] ?? "") ? 0.048 : 0.005);
const RIGHT_OUT = 0.022;
/** "MATCHDAY" → "Matchday". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/** The hero word, described on its ink: width, side bearings, height above and below the baseline (all in em). */
export type HeroWord = {
  inkEm: number;
  leftIn: number;
  inkTop: number;
  descent: number;
  maxSize: number;
  render: (x: number, y: number, size: number, club: string) => ReactNode;
};

/**
 * The hero matchday shell (heromatch.tsx's layout with any measured word): the off-white ground, the NEYOD
 * logo small at the top, the name in wide-spaced caps, the word huge and exactly as wide as the canvas
 * allows, the big cutout right under it fading into the ground, and the quiet fixture foot: crests either
 * side of "HOME v AWAY" (exact club names), then date · kick-off · ground.
 */
export function HeroWordMatchday({ data, hero }: { data: RenderData; hero: (story: boolean) => HeroWord }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);
  const w = hero(story);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ink = "#1b1d22";
  const ground = "#f3f3f1";
  const M = 70;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const dateTxt = dayMonth(content.date);
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const nameSize = Math.min((story ? 34 : 28) * ts, 800 / Math.max(1, name.length * 1.1));
  const nameTop = logoTop + (story ? 150 : 106);
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, w.inkEm), w.maxSize) * ts;
  const inkTopY = nameTop + nameSize + (story ? 44 : 32) + (params.textY ?? 0);
  const baseline = inkTopY + w.inkTop * size;
  const x = (CANVAS_W - w.inkEm * size) / 2 - w.leftIn * size;

  /* ---- the foot, bottom-up ---- */
  const k = story ? 1.36 : 1;
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 54;
  const line = [dateTxt, time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = Math.min(15.5 * k * ts, (CANVAS_W - 2 * 80) / Math.max(1, line.length * 0.92));
  const lineTop = footBottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(50 * k);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const fixAvail = CANVAS_W - 2 * 60 - 2 * (crest + 22 * k);
  const fixSize = Math.min(21 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = lineTop - (line ? 22 * k : 0) - crest;
  const footTop = rowTop;

  /* ---- the player: his top just under the word, big, his face clear of the foot ---- */
  const base = story ? { chest: 420, waist: 360, knees: 260, full: 196 } : { chest: 300, waist: 260, knees: 190, full: 146 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  // A descender (the y's tail) runs down behind him: his top sits a little under the baseline.
  const gap = (story ? 22 : 16) + w.descent * size * 0.2;
  let box = placeByFace(data, faceX, baseline + 200, base);
  let faceTop = baseline + 200;
  for (let shrink = 1; shrink > 0.5; shrink -= 0.08) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    faceTop = baseline + 200;
    // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
    for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    if (faceTop + (params.playerY ?? 0) + box.faceH * 1.6 < footTop - 24) break;
  }
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeFrom = Math.max(faceTop + box.faceH * 1.6, footTop - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${footBottom - 20}px, transparent ${Math.min(H, footBottom + 60)}px)`;

  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, flexShrink: 0 }} />;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.4} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }}>
        {w.render(x, size, size, club)}
      </svg>

      {/* The player, in front of the word's foot, fading out under the fixture. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* A soft ground wash behind the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 200 : 150), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e0 ${story ? 150 : 115}px, ${ground})` }} />

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
      )}

      {/* The fixture foot. */}
      <div style={{ position: "absolute", left: 60, right: 60, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
        {crestImg(homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: ink, whiteSpace: "nowrap" }}>
          {homeName}
          <span style={{ color: club, fontWeight: 500, margin: "0 0.45em" }}>v</span>
          {awayName}
        </div>
        {crestImg(awayCrest)}
      </div>
      {line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "rgba(27,29,34,.62)", whiteSpace: "nowrap" }}>{line}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

/**
 * Hero serif — the matchday hero said elegantly: "Matchday" in sentence case, DM Serif Display italic, set
 * huge and exactly across the canvas in the club colour, the player big under it, the quiet fixture foot.
 */
export function Heroserif({ data }: { data: RenderData }) {
  const word = sentence(data.content.kicker || "MATCHDAY");
  return (
    <HeroWordMatchday
      data={data}
      hero={(story) => ({
        inkEm: Math.max(0.5, dmiEm(word)) - leftIn(word) + RIGHT_OUT,
        leftIn: leftIn(word),
        inkTop: inkTop(word),
        descent: /[gjpqy]/.test(word) ? 0.22 : 0,
        maxSize: story ? 620 : 500,
        render: (x, y, size, club) => (
          <text x={x} y={y} style={{ fontFamily: DMSERIF, fontWeight: 400, fontStyle: "italic", fontSize: size, fill: club }}>
            {word}
          </text>
        ),
      })}
    />
  );
}
