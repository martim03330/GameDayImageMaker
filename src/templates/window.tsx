/* eslint-disable @next/next/no-img-element */
import { hueOf, shade, vivid } from "@/lib/color";
import { cutMask, Film, SelectiveColorDefs } from "./fx";
import { Paper, rng } from "./kit";
import { AgencyLogo, CONDENSED, Crest, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Block shirt digits as stroke skeletons on a 1 × 1.6 grid: drawn with a thick stroke and bevelled
 * joins they come out as the chamfered, octagonal numbers of American college kits.
 */
const DIGITS: Record<string, [number, number][][]> = {
  "0": [[[0, 0], [1, 0], [1, 1.6], [0, 1.6], [0, 0]]],
  "1": [[[0.25, 0.3], [0.62, 0], [0.62, 1.6]]],
  "2": [[[0, 0], [1, 0], [1, 0.8], [0, 0.8], [0, 1.6], [1, 1.6]]],
  "3": [[[0, 0], [1, 0], [1, 1.6], [0, 1.6]], [[0.3, 0.8], [1, 0.8]]],
  "4": [[[0, 0], [0, 0.85], [1, 0.85]], [[1, 0], [1, 1.6]]],
  "5": [[[1, 0], [0, 0], [0, 0.8], [1, 0.8], [1, 1.6], [0, 1.6]]],
  "6": [[[1, 0], [0, 0], [0, 1.6], [1, 1.6], [1, 0.8], [0, 0.8]]],
  "7": [[[0, 0], [1, 0], [1, 0.55], [0.55, 1.6]]],
  "8": [[[0, 0], [1, 0], [1, 1.6], [0, 1.6], [0, 0]], [[0, 0.8], [1, 0.8]]],
  "9": [[[1, 0.8], [0, 0.8], [0, 0], [1, 0], [1, 1.6], [0, 1.6]]],
};

/** SVG path for a shirt number, fitted into a box; returns the path and the stroke width that makes it solid. */
function numberPath(num: string, box: { x: number; y: number; w: number; h: number }): { d: string; stroke: number } {
  const digits = [...num].filter((c) => DIGITS[c]).slice(0, 2);
  if (!digits.length) digits.push("0");
  // Stroke ≈ 0.55 of a digit's width (chunky kit numbers); the skeleton sits inside by half a stroke.
  const gap = 0.35;
  const unitsW = digits.length + (digits.length - 1) * gap;
  const unit = Math.min(box.w / (unitsW + 0.55 * digits.length), box.h / (1.6 + 0.55));
  const stroke = unit * 0.55;
  const totalW = unit * unitsW;
  const x0 = box.x + (box.w - totalW) / 2;
  const y0 = box.y + (box.h - unit * 1.6) / 2;
  const d = digits
    .flatMap((c, i) =>
      DIGITS[c].map((line) => line.map(([x, y], j) => `${j ? "L" : "M"}${(x0 + (i * (1 + gap) + x) * unit).toFixed(1)} ${(y0 + y * unit).toFixed(1)}`).join(" ")),
    )
    .join(" ");
  return { d, stroke };
}

/**
 * The shirt number as a huge window onto the stadium in black and white, a big colour close-up of the
 * player in front of it, a second full-length pose small at his feet, all on light paper
 * (Temple Football player graphics).
 */
export function Window({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 13);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.35);
  // Colour pop on the club colour when the club has a real hue (not black & white).
  const hue = hueOf(params.primary === "#10131c" ? params.accent : params.primary);
  const pop = hue != null && r() < 0.75 ? "url(#win-pop)" : "";
  // Empty stands (generated for the club) read best inside the number; any stadium or city photo otherwise.
  // (An edit's own generated scene always wins: it is then the only stadium image.)
  const stands = (data.club?.stadiumImages ?? []).filter((u) => u.includes("/stands_") || data.params.scene === u);
  const scenes = stands.length ? stands : [...(data.club?.stadiumImages ?? []), ...(data.club?.cityImages ?? [])];
  const scene = scenes.length ? scenes[Math.floor(r() * scenes.length)] : data.bgPhotoUrl;
  const number = data.player.number || "10";
  const { d, stroke } = numberPath(number, { x: 120, y: 120, w: 840, h: 980 });

  // Big close-up: scaled from the face so the head sits in the top of the number, arms free around it.
  const face = data.face ?? [0.38, 0.06, 0.24, 0.1];
  const aspect = data.photoAspect ?? 0.6;
  const faceH = 210 * (params.playerScale ?? 1);
  const bigH = faceH / face[3];
  const bigW = bigH * aspect;
  const faceCx = face[0] + face[2] / 2;
  const big = {
    left: 540 - bigW * faceCx + (params.playerX ?? 0),
    top: 250 - bigH * face[1] + (params.playerY ?? 0),
    width: bigW,
    height: bigH,
  };
  const second = data.photo2Url;
  const at = (y: number) => `${Math.max(0, Math.min(100, ((y - big.top) / big.height) * 100)).toFixed(1)}%`;
  const fade = `linear-gradient(to bottom, #000 ${at(760)}, transparent ${at(980)})`;
  const year = new Date().getFullYear();
  const top = `${year} · ${data.club?.name ?? ""}`.toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: deep }}>
      <Paper color="#e8e7e4" strength={1.4} />
      {hue != null && <SelectiveColorDefs id="win-pop" hue={hue} />}

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="win-digit">
            <path d={d} fill="none" stroke="#fff" strokeWidth={stroke} strokeLinejoin="bevel" strokeLinecap="square" />
          </mask>
          <mask id="win-ring">
            <path d={d} fill="none" stroke="#fff" strokeWidth={stroke + 14} strokeLinejoin="bevel" strokeLinecap="square" />
            <path d={d} fill="none" stroke="#000" strokeWidth={stroke} strokeLinejoin="bevel" strokeLinecap="square" />
          </mask>
          <filter id="win-bw">
            {/* Out of focus, like a long lens shot: the player in front stays the only sharp thing. */}
            <feGaussianBlur stdDeviation={(data.club?.stadiumImages ?? []).length ? 3.5 : 14} />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.05" intercept="-0.12" />
              <feFuncG type="linear" slope="1.05" intercept="-0.12" />
              <feFuncB type="linear" slope="1.05" intercept="-0.12" />
            </feComponentTransfer>
          </filter>
        </defs>
        {/* The stadium, black and white, only inside the number. */}
        <g mask="url(#win-digit)">
          <rect width={CANVAS_W} height={CANVAS_H} fill="#cfcfcf" />
          {/* Anchored at the bottom so the stands (not the sky) fill the number. */}
          {scene && <image href={scene} x={-340} y={-900} width={CANVAS_W + 680} height={2200} preserveAspectRatio="xMidYMax slice" filter="url(#win-bw)" />}
        </g>
        {/* Thin club-colour outline around the number. */}
        <rect width={CANVAS_W} height={CANVAS_H} fill={accent} mask="url(#win-ring)" />
      </svg>

      {/* Big colour close-up, fading out towards the bottom behind the second pose. */}
      {data.photoUrl && (
        <div
          style={{
            position: "absolute",
            ...big,
            // Fades out between y≈760 and y≈980 of the canvas, whatever the photo's size.
            WebkitMaskImage: fade,
            maskImage: fade,
          }}
        >
          <img
            src={data.photoUrl}
            alt=""
            style={{ width: "100%", height: "100%", filter: `${pop} contrast(1.08) saturate(1.1) drop-shadow(0 20px 40px rgba(0,0,0,.25))`, ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Second pose, full length, standing on the paper with a soft shadow. */}
      {second && (
        <>
          <div style={{ position: "absolute", left: 540 - 200, width: 400, bottom: 92, height: 36, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.35), transparent)", filter: "blur(6px)" }} />
          <img src={second} alt="" style={{ position: "absolute", left: "50%", bottom: 104, height: 640, transform: "translateX(-50%)", maxWidth: "none", filter: `${pop} drop-shadow(0 16px 20px rgba(0,0,0,.28)) contrast(1.05)` }} />
        </>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 17, letterSpacing: "0.55em", color: "#8a8a8a" }}>{top}</div>

      {/* Name, bottom right: small spaced first name over the surname in club colour. */}
      <div style={{ position: "absolute", left: 720, bottom: 150, textAlign: "left" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, letterSpacing: "0.5em", color: "#9a9a9a", textTransform: "uppercase" }}>{content.firstName}</div>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 34, letterSpacing: "0.32em", color: accent, textTransform: "uppercase", lineHeight: 1.1 }}>{content.lastName}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, letterSpacing: "0.3em", color: "#9a9a9a", textTransform: "uppercase", marginTop: 8 }}>{content.kicker}</div>
      </div>

      {/* Torn club-colour corner with the crest. */}
      <svg width={260} height={220} style={{ position: "absolute", right: 0, bottom: 0 }}>
        <path d="M260 0 L260 220 L20 220 C 60 190, 90 196, 120 160 C 150 128, 170 140, 200 96 C 222 62, 236 58, 260 0 Z" fill={accent} />
      </svg>
      <Crest club={data.club} size={74} style={{ position: "absolute", right: 46, bottom: 38, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.25))" }} />
      <AgencyLogo data={data} onLight height={30} style={{ position: "absolute", left: 60, bottom: 50 }} />
      <Film strength={0.5} />
    </div>
  );
}
