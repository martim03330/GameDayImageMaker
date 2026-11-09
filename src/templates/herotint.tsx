/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroName } from "./goalherosplit";
import { heroLogo, heroPlayer, matchWord, spacedName } from "./heroghost";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Hero, tinted (matchday) — goalherotint carried to matchday: the ground a very pale wash of the club colour
 * instead of the off-white, the NEYOD logo small at the top, the spaced name, the kicker ("MATCHDAY") enormous
 * in the deep club colour at the exact canvas width, the player big underneath fading into the tint, and the
 * quiet fixture foot: crests either side of "HOME v AWAY" (exact names), then date · kick-off · ground.
 */
const FACE = FACES.barlow;
const INK = "#1b1d22";

/** Mixes `b` into `a` by t (0..1). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/** heroghost's fixture foot, its wash in the tinted ground. */
function tintFoot(data: RenderData, club: string, ground: string) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const f = matchFacts(data);
  const M = 80;
  const k = story ? 1.36 : 1;
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 54;
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = Math.min(15.5 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, line.length * 0.92));
  const lineTop = bottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(50 * k);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const fixAvail = CANVAS_W - 2 * 60 - 2 * (crest + 22 * k);
  const fixSize = Math.min(21 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = lineTop - (line ? 22 * k : 0) - crest;
  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, flexShrink: 0 }} />;

  const node = (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop - (story ? 200 : 150), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e0 ${story ? 150 : 115}px, ${ground})` }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
        {crestImg(homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: INK, whiteSpace: "nowrap" }}>
          {homeName}
          {homeName && awayName && <span style={{ color: club, fontWeight: 500, margin: "0 0.45em" }}>v</span>}
          {awayName}
        </div>
        {crestImg(awayCrest)}
      </div>
      {line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "rgba(27,29,34,.66)", whiteSpace: "nowrap" }}>{line}</div>
      )}
    </>
  );
  return { top: rowTop, bottom, node };
}

/**
 * heroPlayer's cutout, drawn again with a cropped photo edge docked to the canvas edge (a side cut left floating
 * mid-canvas reads as a hard vertical seam); his face moves at most ~200px and stays well inside.
 */
export function dockedPlayer(data: RenderData, p: ReturnType<typeof heroPlayer>, footTop: number, footBottom: number) {
  if (!data.photoUrl) return null;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const { box } = p;
  const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceL = box.left + f[0] * box.width;
  const faceR = faceL + f[2] * box.width;
  let dx = 0;
  if ((data.cut?.left ?? 0) > 0 && box.left > 0) dx = -box.left;
  else if ((data.cut?.right ?? 0) > 0 && box.left + box.width < CANVAS_W) dx = CANVAS_W - box.left - box.width;
  dx = Math.max(-200, Math.min(200, dx));
  if (faceL + dx < 120) dx = Math.min(0, 120 - faceL) + Math.max(0, dx);
  if (faceR + dx > CANVAS_W - 120) dx = Math.max(0, CANVAS_W - 120 - faceR) + Math.min(0, dx);
  const fadeFrom = Math.max(p.faceTop + box.faceH * 1.6, footTop - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${footBottom - 20}px, transparent ${Math.min(H, footBottom + 60)}px)`;
  return (
    <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
      <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left + dx, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
    </div>
  );
}

export function Herotint({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const face = FACE;

  const raw = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  let club = raw;
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  // The word is the deep club colour: dark enough to read on the tint whatever the club colour is.
  let deep = club;
  for (let i = 0; i < 6 && luminance(deep) > 0.1; i++) deep = shade(deep, -0.14);

  // The ground: ~9% of the club hue in the off-white; light hues (yellow) need more to show at all.
  const paper = "#f5f4f0";
  const hueSrc = luminance(raw) > 0.02 ? raw : club;
  const ground = mix(paper, hueSrc, luminance(hueSrc) > 0.4 ? 0.16 : luminance(hueSrc) > 0.2 ? 0.11 : 0.09);
  const glow = mix(ground, "#ffffff", 0.45);
  const M = 80;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const word = matchWord(data);
  const wordW = CANVAS_W - 2 * M - (face.italic ? 40 : 0); // italics overhang their advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 34 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  const foot = tintFoot(data, deep, ground);
  const p = heroPlayer(data, baseline + (story ? 26 : 18), foot.top, foot.bottom);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% 55%, ${glow}, transparent 75%)` }} />

      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + size * face.cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: face.italic ? "italic" : "normal", fontSize: size, fill: deep, letterSpacing: `${face.tracking ?? 0}em` }}
        >
          {word}
        </text>
      </svg>

      {dockedPlayer(data, p, foot.top, foot.bottom)}
      {foot.node}
      {spacedName(name, nameTop, nameSize, deep)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
