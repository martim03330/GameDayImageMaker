/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* Inter 200, measured in the browser: advances per 100px for A–Z, "-", "!", "'", space; then the left/right
   side bearings per 100px for A–Z and "-" (so the INK of the word, not its advance box, spans the canvas). */
const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' ";
const ADV = "66 64 73 72 59 59 74 74 26 56 62 56 90 77 75 62 75 62 62 63 73 66 95 64 65 61 45 28 28 28".split(" ").map(Number);
const BEAR = "3/3 10/7 7/7 10/7 10/7 10/7 7/7 10/10 10/10 7/9 10/3 10/6 10/10 10/10 7/7 10/7 7/7 10/4 7/7 6/6 9/9 3/3 3/3 3/3 3/3 7/7 8/8"
  .split(" ")
  .map((s) => s.split("/").map(Number));
const CAP = 0.728;
const LIGHT = { family: SANS, weight: 200 };

/** The word's ink width in ems at `track` em letter-spacing, and its first letter's left bearing. */
function inkEm(word: string, track: number): { em: number; lsb: number } {
  const letters = [...word.normalize("NFD").replace(/\p{M}/gu, "")];
  const adv = letters.reduce((a, c) => a + (ADV[ORDER.indexOf(c)] ?? 66) / 100, 0) + (letters.length - 1) * track;
  const lsb = (BEAR[ORDER.indexOf(letters[0])]?.[0] ?? 7) / 100;
  const rsb = (BEAR[ORDER.indexOf(letters[letters.length - 1])]?.[1] ?? 7) / 100;
  return { em: Math.max(0.5, adv - lsb - rsb), lsb };
}

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Hero caps — the hero family's counterpoint to the heavy word: the off-white ground, the NEYOD logo small at
 * the top, the player's name in heavy spaced caps, then the kicker ("MATCHDAY") set across the whole canvas in
 * a hairline Inter 200 with airy 0.3em tracking (its ink, not its advance box, pinned to the margins), the big
 * cutout right under it fading into the ground, and heromatch's quiet fixture foot.
 */
export function Herocaps({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ink = "#1b1d22";
  const ground = "#f3f3f1";
  const M = 72;

  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  /* ---- the top: logo, name, the light word ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const nameSize = Math.min((story ? 32 : 26) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const track = 0.3;
  const { em, lsb } = inkEm(word, track);
  const wordW = (CANVAS_W - 2 * M) * ts;
  const size = Math.min(wordW / em, ((story ? 300 : 240) * ts) / CAP);
  const capTop = nameTop + nameSize + (story ? 46 : 34) + (params.textY ?? 0);
  const baseline = capTop + size * CAP;
  const wordX = (CANVAS_W - em * size) / 2 - lsb * size;

  /* ---- the foot, bottom-up (as heromatch) ---- */
  const k = story ? 1.36 : 1;
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 54;
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
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
  const rowTop = lineTop - (line ? 22 * k : 0) - crest;
  const footTop = rowTop;

  /* ---- the player: his top just under the word, big, his head clear of the foot ---- */
  const base = story ? { chest: 430, waist: 370, knees: 266, full: 200 } : { chest: 316, waist: 272, knees: 198, full: 150 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 30 : 22;
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

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The light word, its ink pinned to the margins. */}
      <svg width={CANVAS_W} height={size * 1.3} style={{ position: "absolute", left: 0, top: capTop - size * 0.3, overflow: "visible" }}>
        <text x={wordX} y={size * 0.3 + size * CAP} style={{ fontFamily: LIGHT.family, fontWeight: LIGHT.weight, fontSize: size, letterSpacing: `${track}em`, fill: club, fontKerning: "none" }}>
          {word}
        </text>
      </svg>

      {/* The player, in front of the word's foot, fading out under the fixture. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* A soft ground wash behind the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 200 : 150), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}e0 ${story ? 150 : 115}px, ${ground})` }} />

      {name && <div style={spaced(nameSize, 0.55, { top: nameTop, fontWeight: 800, color: club })}>{name}</div>}

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
