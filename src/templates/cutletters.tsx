/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { opponentOf, rng } from "./kit";
import { competitionOf } from "./outline";
import { AgencyLogo, BEBAS, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Bebas Neue: average advance of its capitals and cap height, relative to the font size. */
const BEBAS_W = 0.4;
const BEBAS_CAP = 0.7;

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/**
 * Bruno Fernandes "BRUNO" poster: on pure black, the first name in giant ultra-condensed capitals
 * across the width; the letters are windows onto a huge, gritty close-up of his face in a club-colour
 * duotone. Below, crest and agency logo on the left, the full name stacked in white on the right with
 * two small lines (position, what the post is about).
 */
export function Cutletters({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 10);
  const sgn = params.side === "left" ? -1 : 1;
  const pick = [params.primary === "#10131c" ? params.accent : params.primary, params.accent, params.primary].find(
    (c) => c && hueOf(c) !== null,
  );
  const club = pick ? vivid(pick) : "#b8b8b8";
  // Light club colours (yellow, sky blue) would wash the face out: deepen them for the mid-tones.
  const mid = luminance(club) > 0.35 ? shade(club, -0.3) : club;

  /* ---------- the word ---------- */
  const firstWord = (content.firstName.trim().split(/\s+/)[0] ?? "").toUpperCase();
  const lastWord = (content.lastName.trim().split(/\s+/).pop() ?? "").toUpperCase();
  const word =
    !firstWord || (firstWord.length > 8 && lastWord && lastWord.length < firstWord.length) || (firstWord.length < 3 && lastWord.length >= 3)
      ? lastWord || firstWord
      : firstWord;
  const boxL = 56;
  const boxW = CANVAS_W - boxL * 2;
  const areaTop = 88;
  const areaH = 860;
  // Ultra-condensed: the word squeezed to the width, but never thinner than ~28% of its natural width.
  const natural = Math.max(3, [...word].length) * BEBAS_W;
  const accented = /[À-ÝÃÕ]/.test(word);
  const size = Math.min(accented ? (areaTop + areaH - 40) / (BEBAS_CAP + 0.2) : areaH / BEBAS_CAP, boxW / (natural * 0.28));
  const capH = size * BEBAS_CAP;
  // Accented capitals (É, Ã) climb ~0.2em above the caps: keep them on the canvas.
  const accent = accented ? size * 0.2 : 0;
  const baseline = Math.max(areaTop + (areaH + capH) / 2, 40 + accent + capH);
  const lettersTop = baseline - capH;

  /* ---------- the face behind the letters ---------- */
  const face = data.face ?? [0.38, 0.1, 0.24, 0.14];
  const aspect = data.photoAspect ?? 0.7;
  // Tight: the face fills most of the letters, unless the photo can't hold it (then a looser crop,
  // grain hides the softness).
  const want = capH * 0.64 * (params.playerScale ?? 1);
  const faceH = data.facePx > 0 ? Math.min(want, Math.max(capH * 0.5, data.facePx * 3.6)) : want;
  const h = faceH / face[3];
  const w = h * aspect;
  const cx = 540 + sgn * (r() - 0.3) * 40 + (params.playerX ?? 0);
  const cy = lettersTop + capH * (0.48 + (want - faceH) / capH / 6) + (params.playerY ?? 0);
  const box = { x: cx - (face[0] + face[2] / 2) * w, y: cy - (face[1] + face[3] / 2) * h, w, h };

  const id = `cut${hash(`${data.photoUrl}|${word}|${club}|${Math.round(size)}|${Math.round(cx)}`)}`;
  // Duotone ramp: near-black, deep club colour, club colour, pale highlight.
  const stops = ["#060303", shade(mid, -0.72), shade(mid, -0.25), mid, shade(club, 0.6)].map(rgb);
  const table = (i: number) => stops.map((c) => c[i].toFixed(3)).join(" ");

  /* ---------- the caption ---------- */
  const first = content.firstName.toUpperCase();
  const last = content.lastName.toUpperCase();
  const opp = opponentOf(data).toUpperCase();
  const kicker = content.kicker.toUpperCase();
  const position = (data.player.position || "").toUpperCase();
  const when = [content.date, content.time].filter(Boolean).join("  |  ").toUpperCase();
  let lines: string[];
  if (postType === "matchday") lines = [`${kicker}${opp ? ` V ${opp}` : ""}`, when || competitionOf(data)];
  else if (postType === "goal") lines = [position, `${kicker}${opp ? ` V ${opp}` : ""}`];
  else if (postType === "renewal") lines = [position, content.until ? `${kicker} UNTIL ${content.until}` : kicker];
  else if (postType === "transfer") lines = [position, data.fromClub ? `${kicker} FROM ${data.fromClub.name.toUpperCase()}` : kicker];
  else lines = [position, kicker];
  lines = lines.filter(Boolean);
  const nameSize = Math.min(86, 470 / Math.max(4, Math.max(first.length, last.length) * 0.42));
  const lineSize = (t: string) => Math.min(27, 480 / Math.max(8, t.length * 0.5));
  const crest = (postType === "transfer" ? (data.toClub ?? data.club) : data.club)?.crestUrl;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#000", color: WHITE }}>
      {/* data-bleed: the clip text is measured unsqueezed by the layout check; it is squeezed to the width. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id={`${id}c`}>
            <text
              x={boxL}
              y={baseline}
              textLength={boxW}
              lengthAdjust="spacingAndGlyphs"
              style={{ fontFamily: BEBAS, fontSize: size, letterSpacing: "0.02em" }}
            >
              {word}
            </text>
          </clipPath>
          <filter
            id={`${id}f`}
            x="0"
            y="0"
            width={CANVAS_W}
            height={CANVAS_H}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"
              result="g"
            />
            {/* Gritty: coarse grain mixed into the grey before the contrast curve. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed={Math.floor(r() * 100)} result="n" />
            <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="ng" />
            <feComposite in="g" in2="ng" operator="arithmetic" k1="0" k2="1" k3="0.28" k4="-0.14" result="gn" />
            <feComposite in="gn" in2="SourceAlpha" operator="in" result="gn2" />
            <feComponentTransfer in="gn2" result="curve">
              <feFuncR type="linear" slope="1.55" intercept="-0.1" />
              <feFuncG type="linear" slope="1.55" intercept="-0.1" />
              <feFuncB type="linear" slope="1.55" intercept="-0.1" />
            </feComponentTransfer>
            <feComponentTransfer in="curve">
              <feFuncR type="table" tableValues={table(0)} />
              <feFuncG type="table" tableValues={table(1)} />
              <feFuncB type="table" tableValues={table(2)} />
            </feComponentTransfer>
          </filter>
          <radialGradient id={`${id}g`} cx="50%" cy="45%" r="65%">
            <stop offset="0" stopColor="#5a5a5a" />
            <stop offset="1" stopColor="#262626" />
          </radialGradient>
        </defs>
        <g clipPath={`url(#${id}c)`}>
          {/* Graded as one: a dark grey ground (so letters never read as empty where the cutout ends) and the face. */}
          <g filter={`url(#${id}f)`}>
            <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={`url(#${id}g)`} />
            {data.photoUrl && <image href={data.photoUrl} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="none" />}
          </g>
        </g>
      </svg>
      {/* Grain over the letters only reads as print texture on black. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
          )}")`,
        }}
      />

      {/* Bottom left: crest and agency logo. */}
      <div style={{ position: "absolute", left: 76, top: baseline + 70, display: "flex", alignItems: "center", gap: 34 }}>
        {crest && <img src={crest} alt="" style={{ width: 104, height: 104, objectFit: "contain" }} />}
        <AgencyLogo data={data} height={46} style={{ color: WHITE }} />
      </div>

      {/* Bottom right: the name stacked, then two small lines. */}
      <div
        style={{
          position: "absolute",
          right: 64,
          top: baseline + 52,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          textAlign: "right",
        }}
      >
        {[first, last].filter(Boolean).map((t, i) => (
          <div
            key={i}
            style={{
              fontFamily: CONDENSED,
              fontWeight: 700,
              fontSize: nameSize,
              lineHeight: 0.92,
              letterSpacing: "0.005em",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </div>
        ))}
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {lines.map((t, i) => (
            <div
              key={i}
              style={{
                fontFamily: CONDENSED,
                fontWeight: 500,
                fontSize: lineSize(t),
                letterSpacing: "0.04em",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
                opacity: 0.95,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
