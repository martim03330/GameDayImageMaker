/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** 1ST 2ND 3RD 4TH … 11TH 12TH 13TH … 21ST 22ND 23RD … */
export function ordinal(n: number): string {
  const t = n % 100;
  const suf = t >= 11 && t <= 13 ? "TH" : n % 10 === 1 ? "ST" : n % 10 === 2 ? "ND" : n % 10 === 3 ? "RD" : "TH";
  return `${n}${suf}`;
}

/** His goals this season (the season starts 1 July), counted from the newest match back; 0 when unknown. */
export function seasonGoals(data: RenderData): number {
  const ms = data.matches ?? [];
  const ref = ms[0]?.date;
  if (!ref || !/^\d{4}-\d{2}/.test(ref)) return 0;
  const y = Number(ref.slice(0, 4));
  const start = `${Number(ref.slice(5, 7)) >= 7 ? y : y - 1}-07-01`;
  return ms.filter((m) => m.date >= start).reduce((a, m) => a + (Number(m.goals) || 0), 0);
}

/**
 * Goal hero tally — the goal hero (`goalhero.tsx`) with one quiet fact: the off-white ground, the NEYOD logo
 * small at the top, the name in wide-spaced caps, the word ("GOAL") enormous in the club colour, then under it
 * a single line of small spaced caps — "6TH GOAL OF THE SEASON" — and the celebrating player big under that,
 * fading into the ground. No score, no underline. No count, no line.
 */
export function Goalherotally({ data }: { data: RenderData }) {
  const { params, content } = data;
  const face = FACES.barlow;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const M = 80;

  /* ---- the top: logo, name, word, the fact ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const wordW = CANVAS_W - 2 * M - (face.italic ? 40 : 0); // italics overhang their advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 34 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  const n = seasonGoals(data);
  const fact = n > 0 ? `${ordinal(n)} GOAL OF THE SEASON` : "";
  const factSize = Math.min((story ? 26 : 21) * ts, 820 / Math.max(1, fact.length * 1.1));
  const factTop = baseline + (story ? 34 : 26);
  const under = fact ? factTop + factSize : baseline;

  /* ---- the player: head just under the fact (or the word), big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = fact ? (story ? 30 : 22) : story ? 26 : 18;
  let faceTop = under + 200;
  for (let i = 0; i < 2; i++) faceTop += under + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 420 : 300)}px, transparent ${H - (story ? 70 : 10)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + size * face.cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: face.italic ? "italic" : "normal", fontSize: size, fill: club, letterSpacing: `${face.tracking ?? 0}em` }}
        >
          {word}
        </text>
      </svg>

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The one quiet fact. */}
      {fact && (
        <div style={{ position: "absolute", left: 0, right: 0, top: factTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: factSize, lineHeight: 1, letterSpacing: "0.42em", paddingLeft: "0.42em", color: club, whiteSpace: "nowrap" }}>{fact}</div>
      )}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: STORY_BOTTOM, bottom: 0, background: `linear-gradient(to bottom, transparent, ${ground})` }} />}
    </div>
  );
}
