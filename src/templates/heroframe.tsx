/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' ";
/** Anton advances per 100px (goalhero's table) plus its figures (heromatch's). */
const ANTON = FACES.anton.widths.split(" ").map(Number);
const ANTON_DIGITS = "49 33 49 49 49 49 49 49 49 49".split(" ").map(Number);
const adv = (c: string) => (/[0-9]/.test(c) ? ANTON_DIGITS[+c] : (ANTON[ORDER.indexOf(c)] ?? 48)) / 100;

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Hero frame — the hero family inside a hairline: a thin club-colour rectangle inset 70px on the off-white
 * ground, the player standing in it with his head and shoulders breaking out over its top edge (the line runs
 * behind him), and the kicker in Anton set letter by letter to the frame's exact inner width, resting on its
 * bottom edge over his faded legs. Matchday puts a quiet fixture foot under the word inside the frame; the
 * goal version is just the name, the frame, the celebrating player and the word.
 */
export function HeroFrameLook({ data, goal }: { data: RenderData; goal: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ink = "#1b1d22";
  const ground = "#f3f3f1";

  /* ---- the frame ---- */
  const FX = 70;
  const frameBottom = story ? STORY_BOTTOM : H - FX;
  const pad = story ? 34 : 28;
  const innerL = FX + pad;
  const innerW = CANVAS_W - 2 * (FX + pad);

  /* ---- the top: logo, name ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 32 : 26) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 112);

  /* ---- the foot (matchday): fixture row, then date · kick-off · ground, inside the frame's bottom ---- */
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = goal ? "" : [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = line ? Math.min(14.5 * k * ts, (innerW - 20) / Math.max(1, line.length * 0.92)) : 0;
  const footBottom = frameBottom - pad;
  const lineTop = footBottom - lineSize;
  const homeName = goal ? "" : (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = goal ? "" : (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const crest = goal || !fixture ? 0 : Math.round(44 * k);
  const fixAvail = innerW - 2 * (crest + 20 * k);
  const fixSize = Math.min(19 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = (line ? lineTop - 18 * k : footBottom) - crest;
  const footTop = crest ? rowTop : line ? lineTop : footBottom;

  /* ---- the word, on the bottom edge (over the foot in matchday) ---- */
  const word = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'").trim();
  const letters = [...word.normalize("NFD").replace(/\p{M}/gu, "")];
  const shown = [...word.normalize("NFC")];
  const n = letters.length;
  const glyphs = letters.reduce((a, c) => a + adv(c), 0);
  const cap = FACES.anton.cap;
  const maxCap = (goal ? (story ? 420 : 340) : story ? 300 : 230) * ts;
  let size = Math.min((innerW * ts) / Math.max(0.5, glyphs), maxCap / cap);
  // A short word capped in height is opened up with tracking until it fills the frame again.
  const track = n > 1 ? Math.max(0, Math.min(0.2, ((innerW * ts) / size - glyphs) / (n - 1))) : 0;
  const wordW = size * (glyphs + (n - 1) * track);
  const baseline = (goal || footTop === footBottom ? footBottom : footTop - (story ? 46 : 36)) + (params.textY ?? 0);
  const wordTop = baseline - size * cap;
  let x = innerL + (innerW - wordW) / 2;
  const xs = letters.map((c) => {
    const at = x;
    x += (adv(c) + track) * size;
    return at;
  });
  size = Math.round(size * 10) / 10;

  /* ---- the player: top just under the name, head and shoulders above the frame's top edge ---- */
  const base = goal
    ? story
      ? { chest: 250, waist: 230, knees: 190, full: 150 }
      : { chest: 230, waist: 200, knees: 160, full: 120 }
    : story
      ? { chest: 260, waist: 230, knees: 180, full: 140 }
      : { chest: 190, waist: 165, knees: 130, full: 100 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 40 : 0);
  const topLine = nameTop + nameSize + (story ? 40 : 30);
  let box = placeByFace(data, faceX, topLine + 200, base);
  let faceTop = topLine + 200;
  for (let shrink = 1; shrink > 0.5; shrink -= 0.08) {
    const sizes = Object.fromEntries(Object.entries(base).map(([nm, v]) => [nm, v * shrink]));
    faceTop = topLine + 200;
    // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
    for (let i = 0; i < 2; i++) faceTop += topLine - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    // His whole head stays well above the word, with room for his chest inside the frame.
    if (faceTop + (params.playerY ?? 0) + box.faceH * 3.2 < wordTop) break;
  }
  const faceY = faceTop + (params.playerY ?? 0);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  // The top edge crosses him at the chest: head and shoulders break out over it.
  const frameTop = Math.round(Math.min(faceY + box.faceH * 1.95, wordTop - (story ? 260 : 200)));
  const fadeFrom = Math.max(faceY + box.faceH * 2.4, wordTop - (story ? 260 : 200));
  const fadeEnd = goal ? frameBottom - pad : Math.min(baseline + 16, footTop - 10);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.3) ${wordTop + (baseline - wordTop) * 0.45}px, transparent ${fadeEnd}px)`;

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
  const hair = story ? 3 : 2;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The hairline frame, behind him. */}
      <div style={{ position: "absolute", left: FX, right: FX, top: frameTop, height: frameBottom - frameTop, border: `${hair}px solid ${club}`, boxSizing: "border-box" }} />

      {/* The player, breaking out over the frame's top edge, fading under the word. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The word, letter by letter, to the frame's inner width. */}
      <svg width={CANVAS_W} height={size * 1.2} style={{ position: "absolute", left: 0, top: wordTop - size * 0.1, overflow: "visible" }}>
        {shown.map((c, i) => (
          <text key={i} x={xs[i]} y={size * 0.1 + size * cap} style={{ fontFamily: FACES.anton.family, fontWeight: 400, fontSize: size, fill: club }}>
            {c}
          </text>
        ))}
      </svg>

      {name && <div style={spaced(nameSize, 0.5, { top: nameTop, fontWeight: 800, color: club })}>{name}</div>}

      {/* The fixture foot, inside the frame's bottom. */}
      {crest > 0 && (
        <div style={{ position: "absolute", left: innerL, width: innerW, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
          {crestImg(homeCrest)}
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: ink, whiteSpace: "nowrap" }}>
            {homeName}
            <span style={{ color: club, fontWeight: 500, margin: "0 0.45em" }}>v</span>
            {awayName}
          </div>
          {crestImg(awayCrest)}
        </div>
      )}
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

export function Heroframe({ data }: { data: RenderData }) {
  return <HeroFrameLook data={data} goal={false} />;
}
