/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · ghost (matchday) — goalheroghost carried to matchday: on the off-white ground the kicker ("MATCHDAY")
 * fills the canvas width as a pale tone-on-tone watermark (~14% club colour) behind his head and shoulders, a
 * small solid spaced kicker above the name keeps it legible, and a quiet fixture foot sits over his faded body:
 * crests either side of "HOME v AWAY" (exact names), then date · kick-off · ground.
 */
const FACE = FACES.anton;
export const HERO_GROUND = "#f3f3f1";
const INK = "#1b1d22";

/** `amount` of colour `a` mixed into `b` (hex). */
export function mix(a: string, b: string, amount: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.replace("#", "").padEnd(6, "0").slice(i - 1, i + 1), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v * amount + y[i] * (1 - amount)).toString(16).padStart(2, "0")).join("")}`;
}

export function matchWord(data: RenderData): string {
  return (data.content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
}

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/** The fixture foot (as heromatch), laid out bottom-up: its top, and the nodes to draw. */
export function heroFoot(data: RenderData, club: string): { top: number; bottom: number; node: ReactNode } {
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
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop - (story ? 200 : 150), bottom: 0, background: `linear-gradient(to bottom, ${HERO_GROUND}00, ${HERO_GROUND}e0 ${story ? 150 : 115}px, ${HERO_GROUND})` }} />
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
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "rgba(27,29,34,.62)", whiteSpace: "nowrap" }}>{line}</div>
      )}
    </>
  );
  return { top: rowTop, bottom, node };
}

/**
 * The cutout with its top at `aim`, as big as the family allows but shrunk until his whole head (face plus ~0.6
 * of its height) stays clear of the foot. Returns the box, the face top and the fade mask.
 */
export function heroPlayer(data: RenderData, aim: number, footTop: number, footBottom: number, faceX0 = 600) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const base = story ? { chest: 420, waist: 360, knees: 260, full: 196 } : { chest: 300, waist: 260, knees: 190, full: 146 };
  const faceX = faceX0 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  let faceTop = aim + 200;
  let box = placeByFace(data, faceX, faceTop, base);
  for (let shrink = 1; shrink > 0.5; shrink -= 0.08) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    faceTop = aim + 200;
    // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
    for (let i = 0; i < 3; i++) faceTop += aim - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    if (faceTop + (params.playerY ?? 0) + box.faceH * 1.6 < footTop - 24) break;
  }
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeFrom = Math.max(faceTop + (params.playerY ?? 0) + box.faceH * 1.6, footTop - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${footBottom - 20}px, transparent ${Math.min(H, footBottom + 60)}px)`;
  const img = data.photoUrl ? (
    <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
      <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
    </div>
  ) : null;
  return { box, faceTop: faceTop + (params.playerY ?? 0), img };
}

export function heroLogo(data: RenderData, top: number) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  return (
    <AgencyLogo
      data={data}
      height={story ? 26 : 24}
      onLight
      style={{ position: "absolute", left: "50%", top, transform: `translateX(-50%) scale(${data.params.logoScale ?? 1})`, transformOrigin: "center top" }}
    />
  );
}

export function spacedName(name: string, top: number, size: number, color: string) {
  return name ? (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color, whiteSpace: "nowrap" }}>{name}</div>
  ) : null;
}

export function Heroghost({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const tint = mix(club, HERO_GROUND, 0.14);
  const M = 40;

  /* ---- top: logo, kicker, name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const word = matchWord(data);
  const kickSize = Math.min((story ? 46 : 36) * ts, 900 / Math.max(1, wordEm(FACE, word) * 1.3 + word.length * 0.3));
  const kickTop = logoTop + (story ? 150 : 106);
  const name = heroName(data);
  const nameSize = Math.min((story ? 30 : 24) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = kickTop + kickSize + (story ? 22 : 16);
  const nameBottom = nameTop + nameSize;

  const foot = heroFoot(data, club);
  const p = heroPlayer(data, nameBottom + (story ? 56 : 40), foot.top, foot.bottom, 540);

  /* ---- the ghost word: full width, centred on his chin/neck, behind him ---- */
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(FACE, word)), (story ? 640 : 520) / FACE.cap) * ts;
  const cap = size * FACE.cap;
  const centre = p.faceTop + p.box.faceH * 0.75;
  const capTop = Math.min(foot.top - cap - (story ? 120 : 80), Math.max(nameBottom + (story ? 44 : 32), centre - cap / 2)) + (params.textY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={capTop + cap} textAnchor="middle" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: tint }}>
          {word}
        </text>
      </svg>
      {p.img}
      {foot.node}
      <div style={{ position: "absolute", left: 0, right: 0, top: kickTop, textAlign: "center", fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: club, whiteSpace: "nowrap" }}>{word}</div>
      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
