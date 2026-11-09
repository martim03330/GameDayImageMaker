"use client";
/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { FACES, wordEm } from "./goalhero";
import { clearSpot, layPhoto, lumAt, originalOf, spanAt, useNatAlign, type NatAlign } from "./goalnatalign";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#f4f1ea";

/** Deep club colour for dark ink on a bright (studio) wall. */
export function deepClub(data: RenderData) {
  const p = data.params;
  let club = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  if (luminance(club) > 0.45) club = vivid(p.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  return club;
}

/** "Moisés Conceição" → "MOISÉS CONCEIÇÃO" (accents kept). */
export const nameOf = (data: RenderData) => [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();

/** Logo height on the canvas for an asked height (mirrors AgencyLogo). */
export const logoPx = (asked: number, story: boolean) => {
  const post = Math.max(52, Math.round(asked * (asked >= 40 ? 1.5 : 2)));
  return story ? Math.max(88, Math.round(post * 1.7)) : post;
};

/**
 * Natural goal · word behind — his own celebration photo, full-bleed and natural (real grass, stands,
 * light), with the kicker set huge in off-white BETWEEN the photo's background and him: the photo, then the
 * word, then his sharp cutout laid exactly over his figure, so his head and raised arms overlap the word.
 * His name small and spaced at the foot, the NEYOD logo under it. No score.
 */
export function Goalnatword({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const face = FACES.anton;
  const club = deepClub(data);
  const orig = originalOf(data);
  const { align } = useNatAlign(data);

  /* ---- the word, with his name small and spaced just above it ---- */
  const word = (data.content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const M = story ? 56 : 60;
  const size = Math.min((W - 2 * M) / Math.max(0.5, wordEm(face, word)), (story ? 440 : 340) / face.cap) * ts;
  const capH = size * face.cap;
  const name = nameOf(data);
  const nameSize = Math.min((story ? 32 : 24) * ts, 860 / Math.max(1, name.length * 1.12));
  const nameGap = story ? 40 : 30;
  // The word's cap line can't rise above this (room for the name over it).
  const minTop = (story ? STORY_TOP : 62) + (name ? nameSize + nameGap : 0);

  /* ---- the foot: the NEYOD logo alone ---- */
  const logoH = logoPx(story ? 26 : 24, story);
  const logoTop = (story ? STORY_BOTTOM : H - 46) - logoH - (params.logoY ?? 0);

  if (!align || !data.face || !orig) return <Fallback data={data} word={word} size={size} capH={capH} minTop={minTop} nameSize={nameSize} nameGap={nameGap} logoTop={logoTop} />;

  /* ---- the photo: his head overlapping the word's foot ---- */
  const faceH = (story ? 160 : 122) * (params.playerScale ?? 1);
  const side = params.side === "left" ? -70 : params.side === "right" ? 70 : 0;
  const want = minTop + capH - 0.1 * faceH;
  const lay = layPhoto(align, data.face, W, H, W / 2 + side + (params.playerX ?? 0), want + (params.playerY ?? 0), faceH, 2.6);
  // The word's baseline at his mouth (higher on a big studio face): the head covers its foot, never the
  // other way round.
  let baseline = lay.face.y + Math.min(lay.face.h * 0.6, faceH * 0.6);
  baseline = Math.max(minTop + capH, Math.min(baseline, minTop + capH + 240)) + (params.textY ?? 0);
  const capTop = baseline - capH;
  const ink = inkFor(align, lay, 0, capTop, W, baseline, club);
  // The name sits over the word, centred — or flush with the word's left or right edge when his head rises
  // into its line (a big studio face).
  let nameW = name.length * nameSize * 1.2;
  const nameTop = capTop - nameGap - nameSize;
  const wordL = W / 2 - (size * wordEm(face, word)) / 2;
  const nameXs = [W / 2 - nameW / 2, wordL, W - wordL - nameW];
  const nameSpot = name ? clearSpot(align, lay.fig, nameXs.map((x) => ({ x, y: nameTop, w: nameW, h: nameSize })), 10) : 0;
  // Still in his way: smaller, to fit beside his head.
  let nameFit = nameSize;
  if (name && nameSpot !== 0) {
    const [lo, hi] = spanAt(align, lay.fig, nameTop - 10, nameTop + nameSize + 10);
    const room = nameSpot === 1 ? lo - 24 - wordL : W - wordL - (hi + 24);
    if (room < nameW) {
      nameFit = Math.max(nameSize * 0.6, (nameSize * room) / nameW);
      nameW = name.length * nameFit * 1.2;
      nameXs[2] = W - wordL - nameW;
    }
  }
  const nameInk = ink !== INK ? club : inkFor(align, lay, 200, nameTop - 10, W - 200, nameTop + nameSize + 10, club);
  const footInk = inkFor(align, lay, 300, logoTop - 20, W - 300, logoTop + logoH + 20, club);
  const dark = footInk !== INK;

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#1b1d1a" }}>
      <img src={orig} alt="" style={photoStyle(lay, align, "contrast(1.04) saturate(1.04)")} />
      {/* Soft local shade where the logo sits. */}
      {!dark && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - logoTop + 140, background: "linear-gradient(to top, rgba(0,0,0,.42), rgba(0,0,0,.16) 55%, transparent)" }} />}

      <WordSvg word={word} size={size} capTop={capTop} fill={ink} shadow={ink === INK} />

      {/* His name, like the word, behind him: a raised head may overlap it, never the other way round. */}
      {nameSpot === 0 ? (
        <NameLine name={name} top={nameTop} size={nameSize} color={nameInk} />
      ) : (
        <NameLine name={name} top={nameTop + (nameSize - nameFit)} size={nameFit} color={nameInk} align="left" left={nameXs[nameSpot]} />
      )}

      {/* Him, sharp, exactly over his figure in the photo. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: lay.fig.x, top: lay.fig.y, width: lay.fig.w, height: lay.fig.h, maxWidth: "none", filter: "contrast(1.04) saturate(1.04)" }}
        />
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight={dark}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

type Lay = ReturnType<typeof layPhoto>;

export const photoStyle = (lay: Lay, a: NatAlign, filter?: string) =>
  ({ position: "absolute", left: lay.X, top: lay.Y, width: a.ow * lay.z, height: a.oh * lay.z, maxWidth: "none", filter }) as const;

/** Off-white on the photo, the deep club colour on a bright plain wall. */
export function inkFor(a: NatAlign, lay: Lay, x0: number, y0: number, x1: number, y1: number, club: string, light = INK) {
  const fx = (x: number) => (x - lay.X) / (a.ow * lay.z);
  const fy = (y: number) => (y - lay.Y) / (a.oh * lay.z);
  // A bright, colourless ground (a studio wall, a white sky) — not sunlit grass or a bright stand.
  const l = lumAt(a, fx(x0), fy(y0), fx(x1), fy(y1));
  const sat = lumAt(a, fx(x0), fy(y0), fx(x1), fy(y1), a.sat);
  return a.plain || (l > 0.7 && sat < 0.2) ? club : light;
}

function WordSvg({ word, size, capTop, fill, shadow }: { word: string; size: number; capTop: number; fill: string; shadow: boolean }) {
  const face = FACES.anton;
  return (
    <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
      <text
        x={CANVAS_W / 2}
        y={size * (1 - face.cap) * 0.9 + size * face.cap}
        textAnchor="middle"
        style={{
          fontFamily: face.family,
          fontWeight: face.weight,
          fontSize: size,
          fill,
          letterSpacing: "0em",
          filter: shadow ? "drop-shadow(0 6px 30px rgba(0,0,0,.28))" : undefined,
        }}
      >
        {word}
      </text>
    </svg>
  );
}

export function NameLine({ name, top, size, color, align = "center", left = 0 }: { name: string; top: number; size: number; color: string; align?: "center" | "left"; left?: number }) {
  if (!name) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: align === "center" ? 0 : left,
        right: align === "center" ? 0 : undefined,
        top,
        textAlign: align,
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.5em",
        paddingLeft: align === "center" ? "0.5em" : 0,
        color,
        whiteSpace: "nowrap",
        textShadow: color === INK ? "0 1px 3px rgba(0,0,0,.55), 0 2px 16px rgba(0,0,0,.45)" : undefined,
      }}
    >
      {name}
    </div>
  );
}

/**
 * Before the cutout is located in the photo (first paint) or when it can't be: the photo softly out of
 * focus as the ground, the word, him sharp in front — the same idea without the exact registration.
 */
function Fallback({ data, word, size, capH, minTop, nameSize, nameGap, logoTop }: { data: RenderData; word: string; size: number; capH: number; minTop: number; nameSize: number; nameGap: number; logoTop: number }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const bg = originalOf(data);
  const capTop = minTop + (params.textY ?? 0);
  const baseline = capTop + capH;
  const sizes = story ? { chest: 400, waist: 330, knees: 250, full: 190 } : { chest: 320, waist: 260, knees: 200, full: 150 };
  const fig = placeByFace(data, CANVAS_W / 2, baseline - (story ? 150 : 120), sizes);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1b1d1a" }}>
      {bg && <img src={bg} alt="" style={{ position: "absolute", inset: -40, width: CANVAS_W + 80, height: H + 80, maxWidth: "none", objectFit: "cover", objectPosition: "50% 30%", filter: "blur(16px) brightness(.8) saturate(1.05)" }} />}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - logoTop + 140, background: "linear-gradient(to top, rgba(0,0,0,.42), transparent)" }} />
      <WordSvg word={word} size={size} capTop={capTop} fill={INK} shadow />
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none" }} />}
      <NameLine name={nameOf(data)} top={capTop - nameGap - nameSize} size={nameSize} color={INK} />
      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
