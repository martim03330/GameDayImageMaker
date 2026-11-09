/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { longDate } from "./superscript";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f0ede7";
const INK = "#141518";
const GREY = "rgba(20,21,24,.56)";

/** Inter 700: advance per 100px (measured in the browser; capitals and the usual lower case). */
const I700: Record<string, number> = { a: 58, b: 63, c: 58.9, d: 63, e: 59.6, f: 38.3, g: 63.2, h: 62.5, i: 27.3, j: 27.3, k: 58.3, l: 27.3, m: 91.5, n: 62.5, o: 61.4, p: 63, q: 63, r: 41.3, s: 56.2, t: 36.5, u: 62.5, v: 60.1, w: 85.1, x: 58, y: 60.4, z: 57.3, A: 75.5, B: 66.2, C: 74.1, D: 72.2, E: 60.8, F: 58.7, G: 75.1, H: 74.7, I: 28.2, J: 58.5, K: 72, L: 56.5, M: 93.2, N: 76.2, O: 77.1, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 75.5, W: 105, X: 74, Y: 73.3, Z: 66.5, "'": 34 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Width of `t` in Inter 700 per 1px of font size, with the title's tracking. */
const w700 = (t: string, track: number) => plain(t).reduce((a, c) => a + (I700[c] ?? 62) / 100 + track, 0) - track;

/** Tracking of the big word (em). */
const TRACK = -0.045;
/** The enlarged hyphen, in em of the title: its length, thickness, gap before it and height of its centre over the baseline. */
const HY = { w: 0.6, t: 0.14, gap: 0.05, mid: 0.31 };

/** "Matchday" → ["Match", "day"]; "Gameday" → ["Game", "day"]; "Hat-trick" → ["Hat", "trick"]; else a break near the middle. */
function breakWord(word: string): [string, string] {
  if (word.includes("-")) {
    const i = word.indexOf("-");
    return [word.slice(0, i), word.slice(i + 1)];
  }
  const m = /^(.{3,})(day)$/i.exec(word);
  if (m) return [m[1], m[2]];
  const words = word.split(/\s+/);
  if (words.length > 1) {
    const h = Math.ceil(words.length / 2);
    return [words.slice(0, h).join(" "), words.slice(h).join(" ")];
  }
  const i = Math.max(2, Math.ceil(word.length / 2));
  return [word.slice(0, i), word.slice(i)];
}

/**
 * Hyphen: one typographic idea. "Match-" / "day" broken over two lines in big Inter Bold, as if the word had
 * been hyphenated on purpose, and the hyphen itself drawn larger and set in the club colour — the only accent.
 * Under it, small: the fixture (home first, names as stored), date · kick-off, and the ground. Pale ground,
 * the player big on the other side, the NEYOD logo at the foot.
 */
export function Hyphen({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the broken word ---- */
  const word = sentenceCase(content.kicker || "Matchday").replace(/[.!]+$/, "");
  const [a, rawB] = breakWord(word);
  const b2 = rawB;
  const M = story ? 84 : 72;
  // The post sets the word on the free side; the story across the top, the player under it.
  const room = story ? CANVAS_W - 2 * M : 560;
  const line1Em = w700(a, TRACK) + HY.gap + HY.w;
  const line2Em = w700(b2, TRACK);
  const size = Math.min((story ? 250 : 168) * ts, room / Math.max(line1Em, line2Em, 1));
  const lead = size * 0.9;
  const titleTop = (story ? STORY_TOP : 92) - size * 0.2 + (params.textY ?? 0); // the cap line sits on the band's top
  const base1 = titleTop + size * 0.2 + size * 0.728; // Inter capitals: 0.728em tall
  const base2 = base1 + lead;
  const colLeft = right ? M : CANVAS_W - M - Math.max(line1Em, line2Em) * size;

  /* ---- the small type ---- */
  const teams = teamsOf(data);
  const fixture = teams.join(" v ");
  const when = [longDate(content.date), f.time].filter(Boolean).join(" · ");
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const infoW = story ? CANVAS_W - 2 * M : 560;
  const fixSize = Math.max(15, Math.min(26 * q * ts, infoW / Math.max(1, titleW(fixture, 1) * 1.03)));
  const smallSize = Math.max(14, Math.min(22 * q * ts, infoW / Math.max(1, bodyW(when, 1) * 1.03, bodyW(venue, 1) * 1.03)));
  const infoTop = base2 + size * 0.21 + 46 * q; // under the descender of "day"
  const infoBottom = infoTop + fixSize * 1.3 + (when ? smallSize * 1.45 : 0) + (venue ? smallSize * 1.45 : 0);

  /* ---- the player, big, on his side ---- */
  const faceX = right ? (story ? 720 : 780) : story ? 360 : 300;
  const faceTop = story ? Math.max(infoBottom + 170, 860) : 236;
  let box = placeByFace(data, faceX, faceTop, story ? { chest: 360, waist: 292, knees: 230, full: 180 } : { chest: 262, waist: 214, knees: 168, full: 132 });
  // The small lines sit beside his shoulders in the post: on the left they hang from the word's edge, on the
  // right they are set flush right; a figure that would run under them steps away a little.
  const infoTextW = Math.max(fixture ? titleW(fixture, fixSize) : 0, when ? bodyW(when, smallSize) : 0, venue ? bodyW(venue, smallSize) : 0);
  if (!story) {
    // His shoulders reach about 1.5 face-widths either side of the face's centre.
    const fc = data.face ?? [0.38, 0.08, 0.24, 0.12];
    const cx = box.left + (fc[0] + fc[2] / 2) * box.width;
    const reach = 1.5 * fc[2] * box.width;
    const near = right ? colLeft + infoTextW + 28 - (cx - reach) : cx + reach + 28 - (CANVAS_W - M - infoTextW);
    const step = Math.max(0, Math.min(80, near));
    box = { ...box, left: box.left + (right ? step : -step) };
  }

  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const big: CSSProperties = { position: "absolute", fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: `${TRACK}em`, color: INK, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 70 : 30}% 55%, ${shade(PAPER, 0.4)}, ${PAPER} 62%, ${shade(PAPER, -0.05)} 100%)` }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}

      {/* The word, broken on purpose; the hyphen the one accent. */}
      <div style={{ ...big, left: colLeft, top: base1 - size * 0.865 }}>
        {a}
        <span
          style={{
            display: "inline-block",
            width: HY.w * size,
            height: HY.t * size,
            marginLeft: (HY.gap - TRACK) * size,
            background: club,
            verticalAlign: "baseline",
            position: "relative",
            top: -(HY.mid - HY.t / 2) * size,
          }}
        />
      </div>
      <div style={{ ...big, left: colLeft, top: base2 - size * 0.865 }}>{b2}</div>

      {/* Fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", top: infoTop, ...(right || story ? { left: colLeft, textAlign: "left" } : { right: M, textAlign: "right" }), width: Math.min(infoW, CANVAS_W - M - colLeft), whiteSpace: "nowrap" }}>
        {fixture && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: fixSize, lineHeight: 1.3, letterSpacing: "-0.01em", color: INK }}>{fixture}</div>}
        {when && <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: smallSize, lineHeight: 1.45, color: GREY }}>{when}</div>}
        {venue && <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: smallSize, lineHeight: 1.45, color: GREY }}>{venue}</div>}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 22}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
