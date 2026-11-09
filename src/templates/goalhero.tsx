/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal hero — the agency's favourite goal post: a clean off-white ground, the NEYOD logo small at the top,
 * then (no name: the agency wants the word alone) the kicker ("GOAL") set enormous across the canvas in the
 * club colour, and the celebrating player big underneath, his head just under the word, fading into the
 * ground at the foot. No underline, no score. One look per display face, everything else identical.
 */
type Face = {
  family: string;
  weight: number;
  italic?: boolean;
  /** Cap height / font size (measured in the browser). */
  cap: number;
  /** Advance widths per 100px for A–Z then - ! ' and space (measured in the browser). */
  widths: string;
  tracking?: number;
};

const ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-!' ";
export const FACES = {
  barlow: { family: "var(--font-barlow), 'Arial Narrow', sans-serif", weight: 900, italic: true, cap: 0.7, tracking: -0.01, widths: "52 47 46 47 43 42 46 47 23 46 50 43 55 51 47 47 46 48 45 48 47 50 70 49 49 41 33 29 20 19" },
  anton: { family: "var(--font-anton), Impact, sans-serif", weight: 400, cap: 0.859, widths: "48 48 47 49 41 40 48 50 23 47 47 40 75 50 49 47 49 48 46 40 47 47 71 48 45 41 31 23 21 23" },
  archivo: { family: "var(--font-archivo-black), 'Arial Black', sans-serif", weight: 400, cap: 0.688, tracking: -0.03, widths: "78 78 78 78 72 67 83 83 39 67 83 67 94 83 83 72 83 78 72 72 83 78 100 78 78 72 33 33 28 33" },
  dela: { family: "var(--font-dela), 'Arial Black', sans-serif", weight: 400, cap: 0.726, tracking: -0.04, widths: "94 89 94 89 87 86 92 92 66 88 92 80 109 92 97 89 97 88 92 94 92 90 110 88 94 86 49 31 29 20" },
  slab: { family: "var(--font-slab), Rockwell, serif", weight: 400, cap: 0.778, tracking: -0.01, widths: "81 78 72 80 71 63 78 84 42 67 84 65 114 94 79 74 81 80 67 78 78 79 121 80 78 69 39 34 19 30" },
  bodoni: { family: "var(--font-bodoni), 'Didot', serif", weight: 700, italic: true, cap: 0.75, tracking: -0.02, widths: "80 71 72 77 64 62 77 81 43 55 78 63 91 78 77 69 77 76 60 70 74 80 112 81 75 62 36 38 26 25" },
  bebas: { family: "var(--font-bebas), Impact, sans-serif", weight: 400, cap: 0.7, tracking: 0.005, widths: "40 40 38 41 36 34 39 42 19 26 41 34 54 43 40 39 40 40 37 36 40 38 56 41 39 36 27 21 19 16" },
} satisfies Record<string, Face>;

/** The word's width in ems: its letters' advances plus the tracking between them. */
export function wordEm(face: Face, word: string): number {
  const w = face.widths.split(" ").map(Number);
  const letters = [...word.normalize("NFD").replace(/\p{M}/gu, "")];
  return letters.reduce((a, c) => a + (w[ORDER.indexOf(c)] ?? 60) / 100, 0) + (letters.length - 1) * (face.tracking ?? 0);
}

function GoalHero({ data, face }: { data: RenderData; face: Face }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);

  const ground = "#f3f3f1";
  const M = 80;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 30) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 108);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const wordW = CANVAS_W - 2 * M - (face.italic ? 40 : 0); // italics overhang their advance
  const size = Math.min(wordW / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const wordTop = nameTop + nameSize + (story ? 34 : 26) + (params.textY ?? 0);
  const capTop = wordTop; // cap line of the word
  const baseline = capTop + size * face.cap;

  /* ---- the player: head just under the word, big, fading into the ground ---- */
  const sizes = story ? { chest: 440, waist: 380, knees: 270, full: 200 } : { chest: 340, waist: 290, knees: 210, full: 156 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  // The cutout is trimmed to him: its top (hair, or a raised fist) sits just under the word's foot.
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
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

      {/* The player, in front of the word's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Name, wide-spaced, in the club colour. */}
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

export const Goalherobarlow = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.barlow} />;
export const Goalheroanton = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.anton} />;
export const Goalheroarchivo = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.archivo} />;
export const Goalherodela = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.dela} />;
export const Goalheroslab = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.slab} />;
export const Goalherobodoni = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.bodoni} />;
export const Goalherobebas = ({ data }: { data: RenderData }) => <GoalHero data={data} face={FACES.bebas} />;
