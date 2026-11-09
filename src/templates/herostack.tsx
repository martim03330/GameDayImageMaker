/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* Anton, measured in the browser: goalhero's advances, plus the left/right side bearings per 100px for A–Z and
   "-" so each line's INK starts exactly on the margin and the longer line's ink is exactly its share of the canvas. */
const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' ";
const ADV = FACES.anton.widths.split(" ").map(Number);
const BEAR = "1/1 4/2 3/2 4/3 4/2 4/2 3/3 4/4 3/3 2/3 4/-1 4/1 4/4 4/4 3/3 4/2 3/2 4/2 2/2 1/1 3/3 1/1 1/1 1/1 0/1 2/2 3/3"
  .split(" ")
  .map((s) => s.split("/").map(Number));
const CAP = FACES.anton.cap;
const plain = (s: string) => [...s.normalize("NFD").replace(/\p{M}/gu, "")];
const bear = (c: string | undefined, side: 0 | 1) => (BEAR[ORDER.indexOf(c ?? "")]?.[side] ?? 3) / 100;

/** A line's ink in ems, plus its first letter's left and last letter's right bearing. */
function ink(line: string): { em: number; lsb: number; rsb: number } {
  const l = plain(line);
  if (!l.length) return { em: 0, lsb: 0, rsb: 0 };
  const adv = l.reduce((a, c) => a + (ADV[ORDER.indexOf(c)] ?? 48) / 100, 0);
  const lsb = bear(l[0], 0);
  const rsb = bear(l[l.length - 1], 1);
  return { em: adv - lsb - rsb, lsb, rsb };
}

/**
 * The kicker in two lines: at a space (the most even split), after a hyphen ("HAT-" / "TRICK"), before a
 * trailing DAY/WEEK ("MATCH" / "DAY"), else in halves ("GO" / "AL", "BRA" / "CE").
 */
export function splitTwo(word: string): [string, string] {
  const w = word.trim().replace(/\s+/g, " ");
  const at = (i: number, keep = 0): [string, string] => [w.slice(0, i + keep).trim(), w.slice(i + (keep ? keep : 1)).trim()];
  const spaces = [...w].map((c, i) => (c === " " ? i : -1)).filter((i) => i > 0);
  if (spaces.length) {
    const best = spaces.reduce((b, i) => (Math.max(ink(w.slice(0, i)).em, ink(w.slice(i + 1)).em) < Math.max(ink(w.slice(0, b)).em, ink(w.slice(b + 1)).em) ? i : b));
    return at(best);
  }
  const hy = w.indexOf("-");
  if (hy > 0 && hy < w.length - 1) return at(hy, 1);
  const tail = w.match(/^(.{3,})(DAY|WEEK)$/);
  if (tail) return [tail[1], tail[2]];
  if (w.length < 3) return [w, ""];
  const cut = Math.ceil(w.length / 2);
  return [w.slice(0, cut), w.slice(cut)];
}

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Hero stack — the hero family turned sideways: the off-white ground, the kicker stacked in two enormous Anton
 * lines ("MATCH" / "DAY") flush to one margin, the player's name small and spaced above them, and the big cutout
 * on the other half with his head right beside the stack (never touching it). A quiet fixture foot sits under
 * the stack on the same margin. params.side puts the player left and the stack (mirrored, flush right) right.
 * Goal mode: the goal word split the same way, a celebrating player, no score, no date line.
 */
export function HeroStack({ data, goal = false }: { data: RenderData; goal?: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);
  const flip = params.side === "left"; // the player on the left, the stack on the right

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const inkC = "#1b1d22";
  const ground = "#f3f3f1";
  const M = 80;
  const k = story ? 1.36 : 1;

  /* ---- the stack ---- */
  const kicker = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'");
  const lines = splitTwo(kicker).filter(Boolean);
  const inks = lines.map(ink);
  const longest = Math.max(...inks.map((i) => i.em), 0.5);
  const share = story ? 0.66 : 0.6;
  const maxCap = (goal ? (story ? 480 : 400) : story ? 320 : 260) * ts;
  const size = Math.min((CANVAS_W * share * ts) / longest, maxCap / CAP);
  const cap = size * CAP;
  const lead = size * 0.075;
  const stackW = longest * size;
  const stackH = lines.length * cap + (lines.length - 1) * lead;
  const edge = flip ? CANVAS_W - M : M; // the margin the stack is flush to
  const stackNear = flip ? CANVAS_W - M - stackW : M + stackW; // its edge facing the player

  /* ---- the foot, bottom-up, on the stack's margin ---- */
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 56;
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = (goal ? [f.comp] : [dayMonth(content.date), time, pt, f.venue]).filter(Boolean).join("  ·  ").toUpperCase();
  const footW = CANVAS_W - 2 * M;
  const lineSize = line ? Math.min(15 * k * ts, footW / Math.max(1, line.length * 0.86)) : 0;
  const lineTop = footBottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(46 * k);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const fixAvail = footW - 2 * (crest + 18 * k);
  const fixSize = Math.min(20 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = lineTop - (line ? 20 * k : 0) - crest;
  const footTop = rowTop;

  /* ---- the top: logo, then name + stack centred (optically high) in what is left ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const logoH = story ? 88 : 52;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSp = 0.5;
  const nameSize = name ? Math.min((story ? 30 : 23) * ts, Math.max(stackW, 420) / Math.max(1, name.length * (0.78 + nameSp))) : 0;
  const nameGap = name ? (story ? 44 : 34) : 0;
  const block = nameSize + nameGap + stackH;
  const free = footTop - (logoTop + logoH);
  const blockTop = logoTop + logoH + Math.max(story ? 120 : 60, (free - block) * (story ? 0.36 : 0.32)) + (params.textY ?? 0);
  const nameTop = blockTop;
  const capTop = nameTop + nameSize + nameGap; // cap line of the first stack line

  /* ---- the player: big, on the other half, his face beside the first line ---- */
  const base = goal
    ? story ? { chest: 360, waist: 320, knees: 240, full: 190 } : { chest: 280, waist: 250, knees: 186, full: 146 }
    : story ? { chest: 360, waist: 320, knees: 240, full: 190 } : { chest: 290, waist: 256, knees: 190, full: 146 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const py = params.playerY ?? 0;
  const wall = story ? 44 : 26; // the head's clearance from the canvas side
  let box = placeByFace(data, CANVAS_W / 2, capTop, base);
  let faceTop = capTop;
  let faceX = CANVAS_W / 2;
  for (let shrink = 1; shrink > 0.45; shrink -= 0.06) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    const probe = placeByFace(data, CANVAS_W / 2, capTop, sizes);
    const faceH = probe.faceH;
    const faceW = face[2] * probe.width;
    // The face sits in the first line's cap height (a big face centred on it, never above the name).
    faceTop = capTop + (cap - faceH) / 2 - (goal ? 0 : cap * 0.08);
    faceTop = Math.max(faceTop, nameTop - faceH * 0.1);
    const clear = faceW * 0.22 + (story ? 30 : 24); // hair and ears past the face box, plus air
    const lo = flip ? wall + faceW * 0.62 : stackNear + clear + faceW / 2;
    const hi = flip ? stackNear - clear - faceW / 2 : CANVAS_W - wall - faceW * 0.62;
    faceX = flip ? Math.max(lo, hi - 8) : Math.min(hi, lo + 8);
    box = placeByFace(data, faceX, faceTop, sizes); // (adds the manual playerX/playerY nudges)
    if (lo <= hi) break;
  }
  const fadeFrom = Math.max(faceTop + py + box.faceH * 1.6, footTop - (story ? 260 : 190));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.22) ${footBottom - 10}px, transparent ${Math.min(H, footBottom + 70)}px)`;

  const align: React.CSSProperties = flip ? { right: M, textAlign: "right" } : { left: M, textAlign: "left" };
  const crestImg = (url: string | null | undefined) => (url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : null);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${flip ? 30 : 70}% 50%, #ffffff, transparent 75%)` }} />

      {/* The player, behind the stack (his head sits beside it), fading out at the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The stack over his body, each line's ink flush to the margin. */}
      <svg width={CANVAS_W} height={capTop + stackH + size * 0.3} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {lines.map((l, i) => (
          <text
            key={i}
            x={flip ? edge + inks[i].rsb * size : edge - inks[i].lsb * size}
            y={capTop + i * (cap + lead) + cap}
            textAnchor={flip ? "end" : "start"}
            style={{ fontFamily: FACES.anton.family, fontWeight: FACES.anton.weight, fontSize: size, fill: club, fontKerning: "none" }}
          >
            {l}
          </text>
        ))}
      </svg>

      {/* A soft ground wash behind the foot. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 190 : 140), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}d8 ${story ? 140 : 105}px, ${ground})` }} />

      {/* The name, small and spaced, on the stack's margin. */}
      {name && (
        <div style={{ position: "absolute", ...align, top: nameTop, fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: `${nameSp}em`, marginRight: flip ? `-${nameSp}em` : 0, color: club, whiteSpace: "nowrap" }}>
          {name}
        </div>
      )}

      {/* The fixture foot: crests and the two clubs, then one quiet line. */}
      {/* Flipped (flush right) the crests follow the names, still home then away. */}
      <div style={{ position: "absolute", ...align, top: rowTop, height: crest, display: "flex", alignItems: "center", gap: 18 * k }}>
        {!flip && crestImg(homeCrest)}
        {!flip && crestImg(awayCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: inkC, whiteSpace: "nowrap", marginLeft: flip ? 0 : 4 * k, marginRight: flip ? 4 * k : 0 }}>
          {homeName}
          <span style={{ color: club, fontWeight: 500, margin: "0 0.45em" }}>v</span>
          {awayName}
        </div>
        {flip && crestImg(homeCrest)}
        {flip && crestImg(awayCrest)}
      </div>
      {line && (
        <div style={{ position: "absolute", ...align, top: lineTop, fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.28em", marginRight: flip ? "-0.28em" : 0, color: "rgba(27,29,34,.62)", whiteSpace: "nowrap" }}>
          {line}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", ...(flip ? { right: M } : { left: M }), top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: flip ? "right top" : "left top" }}
      />
    </div>
  );
}

export function Herostack({ data }: { data: RenderData }) {
  return <HeroStack data={data} />;
}
