/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, cutMask, DMSERIF } from "./fx";
import { Paper, rng } from "./kit";
import { standing } from "./mist";
import { competitionOf, crestsOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#efeee9";
const INK = "#39393c";
const GREY = "#6c6c70";

/** DM Serif Display lowercase: advance per character relative to the font size (measured roughly). */
const SERIF_LC: Record<string, number> = { m: 0.83, w: 0.75, i: 0.29, l: 0.29, j: 0.29, t: 0.34, f: 0.33, r: 0.4, " ": 0.24, ".": 0.25, "?": 0.43, "'": 0.2, "-": 0.34 };
const serifEm = (t: string) => [...t].reduce((a, c) => a + (SERIF_LC[c] ?? (/\d/.test(c) ? 0.56 : 0.52)), 0);

/** Kicker → the two serif words of the corners ("match" / "day."). */
const PAIRS: [RegExp, [string, string]][] = [
  [/^(IT'?S\s+)?MATCH\s*DAY$/, ["match", "day."]],
  [/^(IT'?S\s+)?GAME\s*DAY$/, ["game", "day."]],
  [/^GOAL$/, ["what a", "goal."]],
  [/^BRACE$/, ["double", "strike."]],
  [/^HAT-?\s?TRICK$/, ["hat", "trick."]],
  [/^(MAN|PLAYER) OF THE MATCH$|^MVP$/, ["star", "man."]],
  [/^FULL\s*TIME$/, ["full", "time."]],
  [/^NEW SIGNING$/, ["new", "signing."]],
  [/^NEW DEAL$/, ["new", "deal."]],
];

function serifPair(kicker: string, fallbackTop: string): [string, string] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim();
  const hit = PAIRS.find(([re]) => re.test(k));
  if (hit) return hit[1];
  const words = k.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [fallbackTop.toLowerCase(), `${words[0] ?? ""}.`];
  // Balanced split, the full stop on the last word.
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [best, diff] = [i, d];
  }
  return [words.slice(0, best).join(" "), `${words.slice(best).join(" ")}.`];
}

/** Worn grey paint patches (speckled, hard-edged), bleeding off the corners of the sheet. */
function PaintMarks({ seed }: { seed: number }) {
  const r = rng(seed * 7 + 3);
  const spots = [
    { x: 1000 + r() * 80, y: 20 + r() * 40, rx: 170, ry: 110 },
    { x: -10, y: 380 + r() * 200, rx: 70, ry: 190 },
    { x: 40 + r() * 60, y: 1320, rx: 190, ry: 90 },
    { x: 1080, y: 760 + r() * 200, rx: 50, ry: 150 },
    { x: 20, y: 30, rx: 120, ry: 60 },
  ];
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
      <defs>
        <radialGradient id="bd-spot">
          <stop offset="0" stopColor="#000" stopOpacity={1} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
        <filter id="bd-worn" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={5} seed={seed} result="n" />
          <feComposite in="SourceGraphic" in2="n" operator="arithmetic" k1={2.2} k2={0} k3={0} k4={0} result="m" />
          <feComponentTransfer in="m" result="t">
            <feFuncA type="linear" slope={14} intercept={-7.5} />
          </feComponentTransfer>
          <feFlood floodColor="#8e8e90" />
          <feComposite in2="t" operator="in" />
        </filter>
      </defs>
      <g filter="url(#bd-worn)" opacity={0.5}>
        {spots.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill="url(#bd-spot)" />
        ))}
      </g>
    </svg>
  );
}

/**
 * The dry-brush smear behind the player: a few long rough strokes of dark grey paint, with a black & white,
 * blurred glimpse of his own photo inside the paint.
 */
function Smear({ data, cx, cy, len, angle, seed }: { data: RenderData; cx: number; cy: number; len: number; angle: number; seed: number }) {
  const r = rng(seed * 13 + 1);
  const strokes = Array.from({ length: 7 }, (_, i) => {
    const across = (i - 3) * 62 + (r() - 0.5) * 40;
    const core = Math.abs(i - 3) <= 1;
    const thick = core ? 120 + r() * 70 : 50 + r() * 80;
    const l = len * (core ? 0.85 + r() * 0.2 : 0.45 + r() * 0.4);
    const shift = (r() - 0.5) * len * 0.25;
    return { x: -l / 2 + shift, y: across - thick / 2, w: l, h: thick, o: core ? 1 : 0.6 + r() * 0.4 };
  });
  // Thin flicks outside the main mass.
  const flicks = Array.from({ length: 9 }, () => {
    const l = len * (0.15 + r() * 0.35);
    return { x: -len / 2 + r() * (len - l), y: (r() < 0.5 ? -1 : 1) * (250 + r() * 90), w: l, h: 4 + r() * 12 };
  });
  const id = `bd-${seed}`;
  const bg = data.bgPhotoUrl;
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
      <defs>
        <filter id={`${id}-rough`} x="-20%" y="-40%" width="140%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves={4} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={70} xChannelSelector="R" yChannelSelector="G" result="d" />
          {/* Bristle streaks along the stroke: noise stretched along x multiplies the paint, then a hard threshold
              leaves solid paint in the middle and dry, broken streaks where the stroke thins out. */}
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.2" numOctaves={3} seed={seed + 5} result="b" />
          <feComposite in="d" in2="b" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="p" />
          <feComponentTransfer in="p" result="t">
            <feFuncA type="linear" slope={5.5} intercept={-1.05} />
          </feComponentTransfer>
          <feFlood floodColor="#fff" />
          <feComposite in2="t" operator="in" />
        </filter>
        <linearGradient id={`${id}-fade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.18" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.8" stopColor="#fff" stopOpacity={1} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CANVAS_H}>
          <g transform={`translate(${cx} ${cy}) rotate(${angle})`} filter={`url(#${id}-rough)`}>
            {strokes.map((s, i) => (
              <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.h / 2} fill={`url(#${id}-fade)`} opacity={s.o} />
            ))}
            {flicks.map((s, i) => (
              <rect key={`f${i}`} x={s.x} y={s.y} width={s.w} height={s.h} fill={`url(#${id}-fade)`} opacity={0.8} />
            ))}
          </g>
        </mask>
        <filter id={`${id}-bw`} x="-10%" y="-10%" width="120%" height="120%">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncR type="linear" slope={1.25} intercept={-0.12} /><feFuncG type="linear" slope={1.25} intercept={-0.12} /><feFuncB type="linear" slope={1.25} intercept={-0.12} /></feComponentTransfer>
          <feGaussianBlur stdDeviation={12} />
        </filter>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <rect width={CANVAS_W} height={CANVAS_H} fill="#3b3b3e" />
        {bg && <image href={bg} x={-60} y={-60} width={CANVAS_W + 120} height={CANVAS_H + 120} preserveAspectRatio="xMidYMid slice" filter={`url(#${id}-bw)`} opacity={0.72} />}
      </g>
    </svg>
  );
}

const cap: CSSProperties = { fontFamily: ARCHIVO, fontWeight: 400, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

/**
 * Editorial Man United "match day." poster: off-white paper worn with grey paint at the corners, a thin rule
 * frame, one huge lowercase Didone word top-left and its partner in the club colour bottom-right, the player
 * in action over a dry-brush smear of dark paint (his own photo, B&W and blurred, showing through), a vertical
 * rail on the right (venue, crests, kick-off) and the fixture in small grotesque caps bottom-left.
 */
export function Brushday({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 29;
  const r = rng(seed);
  let accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // A black club: its second colour when it has one, so the second word still stands apart from the first.
  if (luminance(accent) < 0.03 && hueOf(params.accent) != null) accent = vivid(params.accent);
  // Light or neon club colours still have to read on paper.
  if (luminance(accent) > 0.35) accent = shade(accent, -0.45);
  else if (luminance(accent) > 0.2) accent = shade(accent, -0.2);
  const ts = params.textScale ?? 1;

  // ---- the two serif words ----
  const [top, bottom] = serifPair(content.kicker, content.lastName || content.firstName);
  const topSize = Math.min(265, 860 / Math.max(1, serifEm(top))) * ts;
  const bottomSize = Math.min(265, 560 / Math.max(1, serifEm(bottom))) * ts;
  const topWidth = serifEm(top) * topSize;
  const topBase = 42 + topSize * 0.78;

  // ---- the player: centre of the sheet, in the space between the words ----
  const headTop = Math.max(230, topBase + 20) + r() * 20;
  let fig = standing(data, { cx: 505 + (r() - 0.5) * 30, headTop, floor: 1150, maxFace: 190 });
  const maxW = 800;
  if (fig.width > maxW) {
    // Too wide a pose: shrink around the floor (or the bottom edge when the legs are cut).
    const k = maxW / fig.width;
    const anchor = fig.feet ? fig.top + fig.height : CANVAS_H;
    const cx = fig.left + fig.width / 2;
    fig = { ...fig, width: fig.width * k, height: fig.height * k, left: cx - (fig.width * k) / 2, top: anchor - (anchor - fig.top) * k, faceTop: anchor - (anchor - fig.faceTop) * k, faceH: fig.faceH * k };
  }
  // A photo cut at the chest / waist: rather than a tiny figure sunk to the bottom, lift him so the head
  // meets its line; the cut then dissolves into the paint (cutMask).
  const head = fig.faceTop - fig.faceH * 0.6;
  if (!fig.feet && head > headTop + 40) fig = { ...fig, top: fig.top - (head - headTop - 40), faceTop: fig.faceTop - (head - headTop - 40) };
  // Keep him clear of the right rail.
  if (fig.left + fig.width > 950) fig = { ...fig, left: 950 - fig.width };
  if (fig.left < 30) fig = { ...fig, left: 30 };
  const bodyBottom = Math.min(CANVAS_H, fig.top + fig.height);
  const smearCy = fig.top + (Math.min(bodyBottom, 1250) - fig.top) * 0.5;
  const smearLen = Math.max(700, (Math.min(bodyBottom, 1250) - fig.top) * 1.05);

  // ---- rail texts ----
  const score = postType !== "matchday" ? scoreOf(data, "–") : "";
  const crests = crestsOf(data);
  const railBottom = (
    postType === "matchday" ? [content.time ? `${content.time.replace(/^(\d{1,2}):(\d{2})$/, "$1:$2H")}` : "", content.date].filter(Boolean).join("  ") : postType === "result" ? "FULL TIME" : content.date || [content.firstName, content.lastName].filter(Boolean).join(" ")
  ).toUpperCase();
  const railLen = 280;
  const railSize = (t: string) => Math.min(36, railLen / Math.max(1, t.length * 0.64));

  // ---- fixture caps ----
  const ours = (data.club?.name ?? "").toLowerCase();
  const home = content.homeTeam ?? data.club?.name ?? "";
  const away = content.awayTeam ?? "";
  const homeOurs = home.toLowerCase() === ours || !away;
  const line1 = home.toUpperCase();
  // The club's own ground only when the game is known to be there.
  const railTop = (content.venue || (homeOurs && content.home !== false && postType === "matchday" ? data.club?.stadium : "") || competitionOf(data) || "").toUpperCase();
  const line2 = away ? `VS ${away.toUpperCase()}` : competitionOf(data);
  const teamSize = (t: string, max: number) => Math.min(max, 420 / Math.max(1, t.length * 0.66));
  const bottomTop = CANVAS_H - 44 - bottomSize * 0.78;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      <Paper color={PAPER} strength={1.6} />
      <PaintMarks seed={seed} />

      {/* Rule frame: top (after the word), left, and the right rail drawn by the column below. */}
      <div style={{ position: "absolute", left: Math.max(420, 40 + topWidth + 26), right: 76, top: 48, height: 1.5, background: INK, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: 44, top: topBase + 40, height: Math.max(100, 1128 - topBase - 40), width: 1.5, background: INK, opacity: 0.8 }} />

      <Smear data={data} cx={fig.left + fig.width / 2} cy={smearCy} len={smearLen} angle={-66 + (r() - 0.5) * 12} seed={seed % 97} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, filter: "drop-shadow(0 14px 22px rgba(0,0,0,.22))" }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", display: "block", filter: "contrast(1.06) saturate(1.05)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* "match" */}
      <div style={{ position: "absolute", left: 34, top: topBase - topSize * 0.93, fontFamily: DMSERIF, fontSize: topSize, lineHeight: 1.1, letterSpacing: "-0.02em", color: INK, whiteSpace: "nowrap" }}>{top}</div>

      {/* Right rail. */}
      <div style={{ position: "absolute", right: 60, width: 110, marginRight: -40, top: 48, bottom: CANVAS_H - bottomTop + 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ flex: 0.5, minHeight: 36, width: 1.5, background: INK, opacity: 0.8 }} />
        {railTop && <div style={{ ...cap, fontSize: railSize(railTop), writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.02em" }}>{railTop}</div>}
        <div style={{ flex: 1, minHeight: 30, width: 1.5, background: INK, opacity: 0.8 }} />
        {crests.map((c, i) => (
          <div key={i} style={{ display: "contents" }}>
            {i === 1 && score && <div style={{ fontFamily: DMSERIF, fontSize: 58, lineHeight: 0.9, color: INK, whiteSpace: "nowrap" }}>{score}</div>}
            <img src={c} alt="" style={{ width: 92, height: 92, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.18))" }} />
          </div>
        ))}
        {!crests.length && score && <div style={{ fontFamily: DMSERIF, fontSize: 58, lineHeight: 0.9 }}>{score}</div>}
        <div style={{ flex: 1, minHeight: 30, width: 1.5, background: INK, opacity: 0.8 }} />
        {railBottom && <div style={{ ...cap, fontSize: railSize(railBottom), writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.02em" }}>{railBottom}</div>}
        <div style={{ flex: 0.25, minHeight: 20, width: 1.5, background: INK, opacity: 0.8 }} />
      </div>

      {/* Fixture, bottom-left. */}
      <div style={{ position: "absolute", left: 44, bottom: 64, display: "flex", flexDirection: "column", gap: 8, maxWidth: 440 }}>
        <AgencyLogo data={data} onLight height={24} style={{ opacity: 0.75, marginBottom: 18, alignSelf: "flex-start", color: INK }} />
        <div style={{ ...cap, fontWeight: 600, fontSize: teamSize(line1, 34), color: homeOurs ? accent : GREY }}>{line1}</div>
        {line2 && <div style={{ ...cap, fontSize: teamSize(line2, 32), color: homeOurs ? GREY : accent, fontWeight: homeOurs ? 400 : 600 }}>{line2}</div>}
      </div>

      {/* "day." */}
      <div style={{ position: "absolute", right: 40, top: CANVAS_H - 44 - bottomSize * 0.93, fontFamily: DMSERIF, fontSize: bottomSize, lineHeight: 1.1, letterSpacing: "-0.02em", color: accent, whiteSpace: "nowrap" }}>{bottom}</div>
    </div>
  );
}
