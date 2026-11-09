/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { caps, CentreLogo, EchoLine, footTexts, goalBox, M } from "./goalechotitle";
import { clubTone } from "./notify";
import { capsEm } from "./rippleecho";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/**
 * A soft gradient map through the club's shades (as in goaltonal): the photo goes to luminance, a gentle
 * S-curve keeps the mid-tones apart, then every tone lands on a shade of the one club hue.
 */
function ToneMap({ id, stops, contrast, lift = 0 }: { id: string; stops: string[]; contrast: number; lift?: number }) {
  const c = stops.map(rgb);
  const table = (i: number) => c.map((s) => s[i].toFixed(3)).join(" ");
  const off = (0.5 - 0.5 * contrast + lift).toFixed(3);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.28 0.6 0.12 0 0  0.28 0.6 0.12 0 0  0.28 0.6 0.12 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={contrast} intercept={off} />
          <feFuncG type="linear" slope={contrast} intercept={off} />
          <feFuncB type="linear" slope={contrast} intercept={off} />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table(0)} />
          <feFuncG type="table" tableValues={table(1)} />
          <feFuncB type="table" tableValues={table(2)} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

/**
 * Goal echo tonal: echoline's celebrating player and hairline echo, graded the `tonal` way — the whole canvas
 * one deep club tone and the player mapped onto shades of the same hue (his face kept in natural colour,
 * feathered into the toned figure), so the echo, near-white, is the only bright line. "GOAL" in a lighter
 * tint of the tone, light and wide-tracked at the top; his name, the fixture (home first, names exactly as
 * stored, no score) and the competition small at the foot, in the same tints; the agency logo centred.
 */
export function Goalechotonal({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  const club = clubTone(data);
  const ground = shade(club, -0.7);
  const lift = shade(club, -0.5);
  const low = shade(club, -0.82);
  const tint = shade(club, 0.84);
  const soft = shade(club, 0.55);
  const echo = shade(club, 0.94);
  const stops = [shade(club, -0.9), shade(club, -0.7), shade(club, -0.42), shade(club, -0.1), shade(club, 0.24), shade(club, 0.5)];

  /* ---- the title, top ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.5;
  const titleSize = Math.min(64 * k, 880 / Math.max(1, capsEm(title, T_TRACK) * 0.92)) * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);
  const titleBottom = titleTop + titleSize * 0.74;

  /* ---- the foot: name, fixture, competition — the last line 64px above the logo ---- */
  const t = footTexts(data, k);
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (params.textY ?? 0);
  const compTop = lastBottom - t.compSize;
  const fixTop = (t.comp ? compTop - 18 * k : lastBottom) - t.fixSize;
  const nameTop = t.name ? fixTop - 22 * k - t.nameSize : fixTop;

  /* ---- the player and his echo ---- */
  const cx = 540 + (right ? 50 : -50);
  const box = goalBox(data, { faceX: cx, faceTop: titleBottom + (story ? 200 : 150), cx, maxW: story ? 900 : 920, story, minHead: titleBottom + (story ? 70 : 50) });
  const dx = (right ? -1 : 1) * 30 * k;
  const dy = -26 * k;
  const fc = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceMask = `radial-gradient(${fc[2] * box.width * 0.72}px ${fc[3] * box.height * 0.8}px at ${(fc[0] + fc[2] / 2) * box.width}px ${(fc[1] + fc[3] * 0.56) * box.height}px, #000 38%, transparent 100%)`;
  const img: CSSProperties = { width: "100%", height: "100%", display: "block", maxWidth: "none", ...cutMask(data.cut) };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: tint }}>
      <ToneMap id="goalechotonal-map" stops={stops} contrast={1.08} lift={0.04} />

      {/* One deep tone, a breath of light behind him, darker at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 48% at ${cx / 10.8}% ${story ? 38 : 40}%, ${lift}, ${ground} 76%)` }} />

      <EchoLine id="goalechotonal" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={titleBottom + (story ? 44 : 32)} color={echo} width={story ? 2.4 : 2} />

      {/* The player in the club's own hue; his face in natural colour, feathered into the toned figure. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height }}>
          <img src={data.photoUrl} alt="" style={{ ...img, filter: "url(#goalechotonal-map)" }} />
        </div>
      )}
      {data.photoUrl && data.face && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, opacity: 0.9, WebkitMaskImage: faceMask, maskImage: faceMask }}>
          <img src={data.photoUrl} alt="" style={{ ...img, filter: "contrast(1.02) saturate(.72) brightness(.92)" }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 560, background: story ? `linear-gradient(to bottom, transparent, ${low}e6 42%, ${low} 62%)` : `linear-gradient(to bottom, transparent, ${low}e6 50%, ${low} 74%)` }} />

      {/* Top: the title, a lighter tint of the tone. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(titleSize, T_TRACK, 200, { color: soft }) }}>{title}</div>

      {/* Foot. */}
      {t.name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(t.nameSize, t.N_TRACK, 500, { color: tint }) }}>{t.name}</div>}
      {t.fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(t.fixSize, t.F_TRACK, 400, { color: tint, opacity: 0.82 }) }}>{t.fixture}</div>}
      {t.comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...caps(t.compSize, t.F_TRACK, 500, { color: soft, opacity: 0.8 }) }}>{t.comp}</div>}

      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
