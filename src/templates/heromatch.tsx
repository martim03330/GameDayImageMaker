/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

type Face = { family: string; weight: number; italic?: boolean; cap: number; widths: string; tracking?: number };

/** Digit and colon advances per 100px (measured in the browser; goalhero's tables stop at letters). */
const DIGITS: Partial<Record<keyof typeof FACES, string>> = {
  anton: "49 33 49 49 49 49 49 49 49 49 24",
  bebas: "40 40 40 40 40 40 40 40 40 40 19",
  barlow: "44 29 45 44 51 44 45 42 44 44 31",
};

/** wordEm, also knowing the figures and the colon. */
function textEm(key: keyof typeof FACES, text: string): number {
  const face: Face = FACES[key];
  const d = (DIGITS[key] ?? "").split(" ").map(Number);
  let em = 0;
  const letters = [...text];
  for (const ch of letters) em += /[0-9:]/.test(ch) && d.length === 11 ? d["0123456789:".indexOf(ch)] / 100 : wordEm(face, ch);
  return em + (letters.length - 1) * (face.tracking ?? 0);
}

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): [string, string] {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? [m[1], EN_MON[m[2]] ?? m[2]] : ["", ""];
}

export type HeroMode = "word" | "time" | "date";

/**
 * Hero matchday — goalhero carried to matchday: the off-white ground, the NEYOD logo small at the top, one
 * enormous club-colour element across the canvas (the kicker, the kick-off time or the date — one per look),
 * the big cutout right under it fading into the ground, and a quiet fixture foot over his faded body: crests
 * either side of "HOME v AWAY" (exact club names), then date · kick-off · ground in small spaced caps.
 */
export function HeroMatchday({ data, mode, wordFace = "barlow" }: { data: RenderData; mode: HeroMode; wordFace?: keyof typeof FACES }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const tint = shade(club, 0.46);
  const ink = "#1b1d22";
  const ground = "#f3f3f1";
  const M = 80;

  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const [day, mon] = dayMonth(content.date);
  const dateTxt = [day, mon].filter(Boolean).join(" ");
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";

  /* ---- the hero element ---- */
  let key: keyof typeof FACES = wordFace;
  let hero = kicker;
  let heroMode = mode;
  if (mode === "time" && /^\d{1,2}[:h]\d{2}$/i.test(time)) {
    key = "anton";
    hero = time.replace(/h/i, ":");
  } else if (mode === "date" && day && mon) {
    key = "bebas";
    hero = `${day} ${mon}`;
  } else {
    if (mode !== "word") key = mode === "time" ? "anton" : "bebas";
    heroMode = "word";
  }
  const face: Face = FACES[key];
  // The top line: the name over the kicker word; the kicker (small) over a time or a date.
  const topLine = heroMode === "word" ? name : kicker;
  const footName = heroMode === "word" ? "" : name;

  /* ---- the top: logo, small line, hero ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const topSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, topLine.length * 1.05));
  const topTop = logoTop + (story ? 150 : 108);
  const heroW = CANVAS_W - 2 * M - (face.italic ? 40 : 0);
  const maxCap = (story ? (heroMode === "word" ? 460 : 420) : heroMode === "word" ? 380 : 300) * ts;
  const size = Math.min((heroW * ts) / Math.max(0.5, textEm(key, hero)), maxCap / face.cap);
  const capTop = topTop + topSize + (story ? 38 : 28) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  /* ---- the foot, bottom-up ---- */
  const k = story ? 1.36 : 1;
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 54;
  const lineBits = [heroMode === "date" ? "" : dateTxt, heroMode === "time" ? "" : time, pt, f.venue].filter(Boolean);
  const line = lineBits.join("  ·  ");
  const lineSize = Math.min(15.5 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, line.length * 0.92));
  const lineTop = footBottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(50 * k);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const fixAvail = CANVAS_W - 2 * 60 - 2 * (crest + 22 * k);
  const fixSize = Math.min(21 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = lineTop - (lineSize ? 22 * k : 0) - crest;
  const footNameSize = footName ? Math.min(19 * k * ts, 820 / Math.max(1, footName.length * 1.05)) : 0;
  const footNameTop = rowTop - (footName ? 22 * k + footNameSize : 0);
  const footTop = footName ? footNameTop : rowTop;

  /* ---- the player: his top just under the hero, big, his face clear of the foot ---- */
  const base = story ? { chest: 420, waist: 360, knees: 260, full: 196 } : { chest: 300, waist: 260, knees: 190, full: 146 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 26 : 18;
  let box = placeByFace(data, faceX, baseline + 200, base);
  let faceTop = baseline + 200;
  for (let shrink = 1; shrink > 0.5; shrink -= 0.08) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    faceTop = baseline + 200;
    // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
    for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    // The whole head (face plus ~0.6 of its height under the chin) stays above the foot.
    if (faceTop + (params.playerY ?? 0) + box.faceH * 1.6 < footTop - 24) break;
  }
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeFrom = Math.max(faceTop + box.faceH * 1.6, footTop - (story ? 220 : 170));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.25) ${footBottom - 20}px, transparent ${Math.min(H, footBottom + 60)}px)`;

  const spaced = (fs: number, sp: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: SANS,
    fontSize: fs,
    lineHeight: 1,
    letterSpacing: `${sp}em`,
    paddingLeft: `${sp}em`,
    whiteSpace: "nowrap",
    ...extra,
  });

  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, flexShrink: 0 }} />;

  const heroTop = capTop - size * (1 - face.cap) * 0.9;
  const heroY = size * (1 - face.cap) * 0.9 + size * face.cap;
  const heroStyle = { fontFamily: face.family, fontWeight: face.weight, fontStyle: face.italic ? "italic" : "normal", fontSize: size, letterSpacing: `${face.tracking ?? 0}em` } as const;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The hero element, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: heroTop, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={heroY} textAnchor="middle" style={{ ...heroStyle, fill: club }}>
          {heroMode === "date" ? (
            <>
              <tspan>{day}</tspan>
              <tspan fill={tint}>{` ${mon}`}</tspan>
            </>
          ) : (
            hero
          )}
        </text>
      </svg>

      {/* The player, in front of the hero's foot, fading out under the fixture. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* A soft ground wash behind the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 200 : 150), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e0 ${story ? 150 : 115}px, ${ground})` }} />

      {topLine && <div style={spaced(topSize, 0.55, { top: topTop, fontWeight: 800, color: club })}>{topLine}</div>}

      {/* The fixture foot. */}
      {footName && <div style={spaced(footNameSize, 0.55, { top: footNameTop, fontWeight: 800, color: club })}>{footName}</div>}
      <div style={{ position: "absolute", left: 60, right: 60, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
        {crestImg(homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: ink, whiteSpace: "nowrap" }}>
          {homeName}
          <span style={{ color: club, fontWeight: 500, margin: "0 0.45em" }}>v</span>
          {awayName}
        </div>
        {crestImg(awayCrest)}
      </div>
      {line && <div style={spaced(lineSize, 0.3, { top: lineTop, fontWeight: 600, color: "rgba(27,29,34,.62)" })}>{line}</div>}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

export function Heromatch({ data }: { data: RenderData }) {
  return <HeroMatchday data={data} mode="word" />;
}

/** The same matchday hero, the word set in the other faces of the goalhero family. */
export const Heromatchbodoni = ({ data }: { data: RenderData }) => <HeroMatchday data={data} mode="word" wordFace="bodoni" />;
export const Heromatchdela = ({ data }: { data: RenderData }) => <HeroMatchday data={data} mode="word" wordFace="dela" />;
export const Heromatchslab = ({ data }: { data: RenderData }) => <HeroMatchday data={data} mode="word" wordFace="slab" />;
export const Heromatchbebas = ({ data }: { data: RenderData }) => <HeroMatchday data={data} mode="word" wordFace="bebas" />;
export const Heromatcharchivo = ({ data }: { data: RenderData }) => <HeroMatchday data={data} mode="word" wordFace="archivo" />;
