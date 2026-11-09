/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter 500 caps, roughly, with the tracking added per glyph (em). */
export const ringEm = (t: string, tracking: number) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d–-]/.test(c) ? 0.62 : c === "·" ? 0.3 : /[IJ.:]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** Mixes two colours, `t` of the second. */
export function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/**
 * How a run of text closes a circle of length `circ` evenly: the number of copies and the font size (the
 * rest is taken up by `textLength`, which spreads the letter-spacing so the last separator meets the first word).
 */
export function closeRing(copy: string, circ: number, size: number, tracking: number, min = 1) {
  const len = ringEm(copy, tracking) * size;
  const n = Math.max(min, Math.round(circ / len));
  const k = Math.max(0.82, Math.min(1.12, circ / (n * len)));
  return { n, size: size * k };
}

/** A full circle as an SVG path, clockwise from `start` radians (0 = 3 o'clock, -π/2 = 12 o'clock). */
export function circlePath(cx: number, cy: number, r: number, start: number): string {
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(start)} A ${r} ${r} 0 0 1 ${p(start + Math.PI)} A ${r} ${r} 0 0 1 ${p(start + 2 * Math.PI - 0.0001)}`;
}

/**
 * Circletext: pure typography on a quiet ground. One line of small tracked caps — "MATCHDAY · HOME V AWAY ·
 * DATE · KICK-OFF · GROUND ·", repeated just enough to close the circle evenly — set on a large circle
 * centred on the player's upper chest, wide around his head like a halo. The cutout stands in front, so his
 * shoulders and arms cut the lower turn of the line; nothing else but the NEYOD logo under him. No rule, no
 * crest: the circle is drawn by the words alone (unlike `orbit`, whose hairline ring carries two short runs).
 */
export function Circletext({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 11);
  const dark = r() < 0.35;

  const club = clubTone(data);
  // Pale: a breath of the club colour in warm paper, the words in a deep club ink. Dark: a deep club tone, white words.
  const ground = dark ? shade(club, -0.66) : mix("#f1eee8", club, 0.05);
  const ink = dark ? "rgba(255,255,255,.92)" : luminance(club) > 0.2 ? shade(club, -0.55) : shade(club, -0.3);

  /* ---- the words ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const score = scoreOf(data, "–");
  const isResult = postType === "result" && !!score;
  const fixture = teams.length === 2 ? `${teams[0]} ${isResult ? score : "v"} ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const kicker = (isResult ? "Full Time" : content.kicker || "Matchday").replace(/’/g, "'").trim();
  const items = [kicker, fixture, niceDate(content.date), isResult ? "" : f.time, titleCase(f.venue) || titleCase(f.comp || "")].filter(Boolean).map((s) => s.toUpperCase());
  const SEP = "  ·  ";
  const copy = items.join(SEP) + SEP;
  const TRACK = 0.3;

  /* ---- the ring and the player inside it ---- */
  const R = story ? 452 : 436;
  const ringTop = (story ? STORY_TOP + 64 : 104) + (params.textY ?? 0);
  const cy = ringTop + R;
  const cx = 540;
  const circ = 2 * Math.PI * R;
  const ring = closeRing(copy, circ, (story ? 21 : 16.5) * ts, TRACK, 2);

  const sizes = story ? { chest: 262, waist: 226, knees: 190, full: 150 } : { chest: 236, waist: 190, knees: 152, full: 118 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The head sits well inside the ring: hair ~0.45 face-heights under its top, the ring's centre on his chest.
  // The cutouts are cropped to the figure, so the box's top is roughly his hair: keep it clear of the words.
  const b0 = placeByFace(data, cx, 400, sizes);
  const hair = 400 - b0.top;
  let box = placeByFace(data, cx, ringTop + Math.max(0.85 * b0.faceH, 120, hair + (story ? 56 : 44)), sizes);
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const faceTop = box.top + face[1] * box.height;

  /* ---- the logo, with air above it; the player melts away before it ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 46) - (params.logoY ?? 0);
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 46 - 52;
  // Opaque wherever he stands in front of the ring, so the lower turn never ghosts through him.
  const fadeEnd = Math.max(faceTop + box.faceH * 3, logoTop - (story ? 70 : 44));
  const fadeLen = Math.max(140, Math.min(story ? 380 : 300, fadeEnd - (cy + R + 24)));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - fadeLen - box.top}px, transparent ${fadeEnd - box.top}px)`;

  // The first copy — the title and the fixture — is centred on 12 o'clock, over his head.
  const start = -Math.PI / 2 - Math.PI / ring.n;
  const firstLen = kicker.length;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: flat, the faintest light behind his head. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark
            ? `radial-gradient(55% 40% at 50% ${(cy / H) * 100}%, ${shade(club, -0.46)}, transparent 75%), linear-gradient(to bottom, transparent 60%, ${shade(club, -0.78)})`
            : `radial-gradient(55% 40% at 50% ${(cy / H) * 100}%, rgba(255,255,255,.7), transparent 75%), linear-gradient(to bottom, transparent 65%, ${mix(ground, "#000000", 0.05)})`,
        }}
      />

      {/* The circle of words, behind him. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <path id="circletext-ring" d={circlePath(cx, cy, R, start)} fill="none" />
        <text fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={500} fontSize={ring.size} letterSpacing={ring.size * TRACK} fill={ink}>
          <textPath href="#circletext-ring" textLength={circ - ring.size * TRACK} lengthAdjust="spacing">
            {Array.from({ length: ring.n }, (_, i) => (
              <tspan key={i}>
                <tspan fontWeight={700}>{copy.slice(0, firstLen)}</tspan>
                {copy.slice(firstLen)}
              </tspan>
            ))}
          </textPath>
        </text>
      </svg>

      {/* The player, natural colour, in front of the words, melting away above the logo. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <AgencyLogo
        data={data}
        onLight={!dark}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={dark ? 0.18 : 0.1} />
    </div>
  );
}
