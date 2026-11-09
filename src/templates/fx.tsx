/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import type { CutEdges } from "@/lib/types";
import type { RenderData } from "./types";
import { maskUrl } from "./maskurl";

/**
 * Pro finishing effects. They all work from the transparent cutout: its alpha is reused as a CSS mask,
 * so colour grades, textures and light only ever touch the player — never his face geometry.
 */

export type Box = { left: number; top: number; width: number; height: number };

/** Where the crop line of each framing falls, measured in face heights below the top of the face. */
const FRAMING_DEPTH: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };

/**
 * Where a bottom-anchored cutout of a given height ends up on the canvas (honours the edit's nudges).
 * With a tighter framing the same top position is kept and the player is scaled up so the crop line
 * (knees / waist / chest, from the detected face) lands on the bottom edge of the canvas.
 */
export function figureBox(data: RenderData, cx: number, bottom: number, height: number): Box {
  const p = data.params;
  let h = height * (p.playerScale ?? 1);
  let top = 1350 - bottom - h;
  const depth = p.framing && FRAMING_DEPTH[p.framing];
  const face = data.face;
  if (depth && face) {
    const crop = Math.min(0.98, face[1] + face[3] * depth);
    // Hair sits ~0.75 face heights above the face box; keep a 70px margin above it.
    const headTop = Math.max(0, face[1] - face[3] * 0.75);
    // Never shrink: a tighter crop only ever makes the player bigger.
    const needed = (1350 - Math.max(70, top)) / (crop - headTop);
    if (needed > h) {
      h = needed;
      top = Math.max(70, top) - headTop * h;
    }
  }
  const w = h * (data.photoAspect ?? 0.5);
  return { left: cx - w / 2 + (p.playerX ?? 0), top: top + (p.playerY ?? 0), width: w, height: h };
}

const maskOf = (url: string): CSSProperties => ({
  WebkitMaskImage: `url(${maskUrl(url)})`,
  maskImage: `url(${maskUrl(url)})`,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
});

const hex = (h: string) => {
  const s = h.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
};

/** SVG gradient-map filter: shadows → `dark`, highlights → `light` (Nike / Premier League duotone). */
export function GradientMapDefs({ id, dark, mid, light }: { id: string; dark: string; mid?: string; light: string }) {
  const stops = [hex(dark), ...(mid ? [hex(mid)] : []), hex(light)];
  const table = (i: number) => stops.map((c) => c[i].toFixed(3)).join(" ");
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" />
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
 * The player composited like a pro: colour-graded towards the scene, rim light on one side,
 * soft contact shadow, optional gradient map. Children render on top, clipped to the player.
 */
export function GradedFigure({
  data,
  box,
  grade,
  gradeStrength = 0.28,
  rim,
  rimSide = "left",
  gradientMap,
  shadow = true,
  src,
  children,
  style,
}: {
  data: RenderData;
  box: Box;
  /** Colour of the scene light; blended over the player in soft-light. */
  grade?: string;
  gradeStrength?: number;
  rim?: string;
  rimSide?: "left" | "right";
  /** id of a GradientMapDefs filter. */
  gradientMap?: string;
  shadow?: boolean;
  src?: string | null;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const url = src ?? data.photoUrl;
  if (!url) return null;
  const dx = rimSide === "left" ? -5 : 5;
  const cut = src && src !== data.photoUrl ? data.cutouts.find((c) => c.url === src)?.cut : data.cut;
  return (
    <div style={{ position: "absolute", ...box, ...style }}>
      <div style={{ position: "absolute", inset: 0, ...cutMask(cut) }}>
      {shadow && !(cut?.bottom ?? 0) && (
        <div
          style={{
            position: "absolute",
            left: "12%",
            right: "12%",
            bottom: -18,
            height: 46,
            borderRadius: "50%",
            background: "rgba(0,0,0,.55)",
            filter: "blur(18px)",
          }}
        />
      )}
      <img
        src={url}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter: [gradientMap && `url(#${gradientMap})`, rim && `drop-shadow(${dx * 0.6}px 0 0 ${rim}) drop-shadow(${dx}px 0 5px color-mix(in srgb, ${rim} 45%, transparent))`, "contrast(1.04)"]
            .filter(Boolean)
            .join(" "),
        }}
      />
      {grade && <div style={{ position: "absolute", inset: 0, background: grade, mixBlendMode: "soft-light", opacity: gradeStrength, ...maskOf(url) }} />}
      {/* Top light / bottom falloff, so the figure sits in the same light as the background. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(255,255,255,.08), transparent 35%, rgba(0,0,0,.35) 100%)",
          mixBlendMode: "multiply",
          ...maskOf(url),
        }}
      />
      {children && <div style={{ position: "absolute", inset: 0, ...maskOf(url) }}>{children}</div>}
      </div>
    </div>
  );
}

/** Motion trail: tinted copies of the silhouette streaking behind the player. */
export function Echo({ data, box, color, count = 5, dx = 70, dy = 0, src }: { data: RenderData; box: Box; color: string; count?: number; dx?: number; dy?: number; src?: string | null }) {
  const url = src ?? data.photoUrl;
  if (!url) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => count - i).map((k) => (
        <div
          key={k}
          style={{
            position: "absolute",
            ...box,
            left: box.left - dx * k,
            top: box.top - dy * k,
            background: color,
            opacity: 0.55 - k * (0.45 / count),
            filter: `blur(${k * 1.6}px)`,
            ...maskOf(url),
          }}
        />
      ))}
    </>
  );
}

/** RGB-split glitch copies of the silhouette (red / cyan), plus a few displaced slices. */
export function Glitch({ data, box, amount = 12 }: { data: RenderData; box: Box; amount?: number }) {
  const url = data.photoUrl;
  if (!url) return null;
  const slices = [0.18, 0.46, 0.71];
  return (
    <>
      <div style={{ position: "absolute", ...box, left: box.left - amount, background: "#ff2a55", mixBlendMode: "screen", opacity: 0.8, ...maskOf(url) }} />
      <div style={{ position: "absolute", ...box, left: box.left + amount, background: "#00e5ff", mixBlendMode: "screen", opacity: 0.8, ...maskOf(url) }} />
      {slices.map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...box,
            left: box.left + (i % 2 ? 26 : -34),
            clipPath: `inset(${y * 100}% 0 ${(1 - y - 0.035) * 100}% 0)`,
          }}
        >
          <img src={url} alt="" style={{ width: "100%", height: "100%" }} />
        </div>
      ))}
    </>
  );
}

/** A photo (city, stadium) visible only inside the player's silhouette — double exposure. */
export function DoubleExposure({ box, cutoutUrl, photoUrl, tint, opacity = 0.85 }: { box: Box; cutoutUrl: string; photoUrl: string; tint?: string; opacity?: number }) {
  return (
    <div style={{ position: "absolute", ...box, ...maskOf(cutoutUrl), opacity }}>
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.3) contrast(1.15)" }} />
      {tint && <div style={{ position: "absolute", inset: 0, background: tint, mixBlendMode: "color" }} />}
    </div>
  );
}

/**
 * Mask that hides a front layer around the player's head, so text drawn in front of the body
 * still passes *behind* the head. Returns CSS mask props for a canvas-sized layer.
 */
export function headHoleMask(data: RenderData, box: Box, grow = 1.9): CSSProperties {
  const [fx, fy, fw, fh] = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const cx = box.left + (fx + fw / 2) * box.width;
  const cy = box.top + (fy + fh / 2) * box.height;
  const rx = fw * box.width * grow * 0.5;
  const ry = fh * box.height * grow * 0.62;
  const g = `radial-gradient(${rx}px ${ry}px at ${cx}px ${cy}px, transparent 88%, #000 100%)`;
  // Everything above the chin is "behind the head" too, within the head's column.
  return { WebkitMaskImage: g, maskImage: g };
}

/** Big display text filled with a photo (background-clip: text). */
export function PhotoText({ text, photoUrl, size, font, style }: { text: string; photoUrl: string; size: number; font: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        lineHeight: 0.85,
        whiteSpace: "nowrap",
        backgroundImage: `url(${photoUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {text}
    </div>
  );
}

/** Volumetric light: soft cone from the top plus floating dust. */
export function LightCone({ x, color, angle = 0, width = 700, opacity = 0.5 }: { x: number; color: string; angle?: number; width?: number; opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: -200,
        width,
        height: 1700,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "50% 0",
        background: `linear-gradient(to bottom, ${color}, transparent 75%)`,
        clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
        filter: "blur(40px)",
        opacity,
        mixBlendMode: "screen",
      }}
    />
  );
}

/** Fine film grain + slight vignette over the whole canvas (keeps gradients from banding). */
export function Film({ strength = 1 }: { strength?: number }) {
  const noise = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundImage: noise, opacity: 0.07 * strength, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 95% at 50% 45%, transparent 60%, rgba(0,0,0,.35) 100%)", pointerEvents: "none" }} />
    </>
  );
}

export const DMSERIF = "var(--font-dmserif), Georgia, serif";
export const ARCHIVO_BLACK = "var(--font-archivo-black), 'Arial Black', sans-serif";
export const ARCHIVO = "var(--font-archivo), system-ui, sans-serif";

/** Barcode strip (page furniture). */
export function Barcode({ width = 170, height = 26, color }: { width?: number; height?: number; color: string }) {
  return (
    <div
      style={{
        width,
        height,
        background: `repeating-linear-gradient(90deg, ${color} 0 2px, transparent 2px 4px, ${color} 4px 5px, transparent 5px 9px, ${color} 9px 12px, transparent 12px 14px)`,
      }}
    />
  );
}

/** Editorial page furniture: city / founding / coordinates block, barcode, motto, season. */
export function Furniture({ data, color, accent, top = 36 }: { data: RenderData; color: string; accent: string; top?: number }) {
  const c = data.club;
  const small: CSSProperties = { fontFamily: "var(--font-mono), monospace", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", lineHeight: 1.45, color };
  const season = (() => {
    const d = new Date();
    const y = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
    return `${String(y).slice(2)}/${String(y + 1).slice(2)}`;
  })();
  return (
    <div style={{ position: "absolute", left: 56, right: 56, top, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={small}>
        <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 22, letterSpacing: "0.04em" }}>{(c?.name ?? "").toUpperCase()}</div>
        <div>{data.content.subline}</div>
        <div>{c?.founded ? `EST. ${c.founded}` : ""}</div>
        <div style={{ marginTop: 6 }}>
          <Barcode color={color} />
        </div>
      </div>
      <div style={{ ...small, textAlign: "right" }}>
        <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 22, letterSpacing: "0.04em", color: accent }}>{data.content.kicker}</div>
        <div>{c?.name ?? ""}</div>
        <div>ÉPOCA {season}</div>
        <div>{data.agency.name} · SPORTS MANAGEMENT</div>
      </div>
    </div>
  );
}

/** Deterministic QR-like block (decorative). */
export function PseudoQR({ size = 90, color, seed = 1 }: { size?: number; color: string; seed?: number }) {
  let a = seed * 9301 + 49297;
  const r = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  const n = 17;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (r() > 0.55) cells.push([x, y]);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={5} height={5} fill={color} />
      <rect x={x + 1} y={y + 1} width={3} height={3} fill="none" stroke="#0000" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      {cells.filter(([x, y]) => !((x < 6 && y < 6) || (x > 10 && y < 6) || (x < 6 && y > 10))).map(([x, y]) => (
        <rect key={`${x}_${y}`} x={x} y={y} width={1} height={1} fill={color} />
      ))}
      {[finder(0, 0), finder(12, 0), finder(0, 12)]}
    </svg>
  );
}

/** Only the player's head (and hair), drawn on top of everything: text then passes *between* head and body. */
export function HeadLayer({ data, box, src, grow = 1.7, style }: { data: RenderData; box: Box; src?: string | null; grow?: number; style?: CSSProperties }) {
  const url = src ?? data.photoUrl;
  if (!url) return null;
  const [fx, fy, fw, fh] = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const cx = (fx + fw / 2) * 100;
  const cy = (fy + fh * 0.42) * 100;
  const rx = fw * grow * 50;
  const ry = fh * grow * 58;
  const m = `radial-gradient(${rx}% ${ry}% at ${cx}% ${cy}%, #000 78%, transparent 100%)`;
  return <img data-head src={url} alt="" style={{ position: "absolute", ...box, maxWidth: "none", WebkitMaskImage: m, maskImage: m, ...style }} />;
}

export const SLAB = "var(--font-slab), Rockwell, serif";
export const RUBIKMONO = "var(--font-rubikmono), monospace";
export const DELA = "var(--font-dela), 'Arial Black', sans-serif";
export const BARCODE = "var(--font-barcode), monospace";

/** SVG filter turning a cutout into a single flat ink (dark = more ink), with risograph grain. */
export function InkDefs({ id, ink, grain = true }: { id: string; ink: string; grain?: boolean }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.45 -0.9 -0.2 0 1.35" result="darkness" />
        <feComposite in="darkness" in2="SourceAlpha" operator="in" result="inkAlpha" />
        {grain && (
          <>
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={1} seed={3} result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.5 2.1" result="grainMask" />
            <feComposite in="inkAlpha" in2="grainMask" operator="in" result="inkGrain" />
          </>
        )}
        <feFlood floodColor={ink} result="flood" />
        <feComposite in="flood" in2={grain ? "inkGrain" : "inkAlpha"} operator="in" />
      </filter>
    </svg>
  );
}

/** Three-letter code for a city/club, boarding-pass style ("Viana do Castelo" → "VIA", "Valletta" → "VAL"). */
export function cityCode(name: string | undefined): string {
  if (!name) return "---";
  const words = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .split(/[\s-]+/)
    .filter((w) => w && !/^(FC|SC|CF|CD|AC|SAD|UD|GD|AD|CA|SL|FK|SK|AFC|USC|OAF)$/.test(w));
  return (words[0] ?? "---").slice(0, 3);
}

/**
 * CSS mask that dissolves the edges where the original photo cut the player (legs at the bottom,
 * an arm at the side), so the cut reads as a soft fade instead of a hard, "pasted" edge.
 */
export function cutMask(cut: CutEdges | undefined, strength = 1): CSSProperties {
  if (!cut) return {};
  const layers: string[] = [];
  const fade = (dir: string, amount: number) => `linear-gradient(${dir}, transparent 0%, #000 ${Math.round(amount * 100)}%)`;
  if ((cut.bottom ?? 0) > 0) layers.push(fade("to top", 0.16 * strength));
  if ((cut.top ?? 0) > 0) layers.push(fade("to bottom", 0.07 * strength));
  if ((cut.left ?? 0) > 0) layers.push(fade("to right", 0.12 * strength));
  if ((cut.right ?? 0) > 0) layers.push(fade("to left", 0.12 * strength));
  if (!layers.length) return {};
  const m = layers.join(", ");
  return {
    WebkitMaskImage: m,
    maskImage: m,
    WebkitMaskComposite: layers.length > 1 ? "source-in" : undefined,
    maskComposite: layers.length > 1 ? "intersect" : undefined,
  } as CSSProperties;
}

export const GOTHIC = "var(--font-gothic), 'Old English Text MT', serif";
export const MARKER = "var(--font-marker), 'Comic Sans MS', cursive";

/** Mown grass: two-tone stripes + fine blade texture. */
export function Grass({ base = "#2f6b2a", stripes = true }: { base?: string; stripes?: boolean }) {
  const blades = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.35' numOctaves='3' seed='5'/><feColorMatrix values='0 0 0 0 0.05  0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 1.1 -0.2'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;
  return (
    <div style={{ position: "absolute", inset: 0, background: base }}>
      {stripes && (
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 135px, rgba(0,0,0,.05) 135px 270px)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, backgroundImage: blades, opacity: 0.55, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: blades, backgroundPosition: "150px 90px", opacity: 0.25, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 40%, transparent 50%, rgba(0,0,0,.35) 100%)" }} />
    </div>
  );
}

/** A cutout's shadow cast on the ground (long, skewed away from the light). */
export function CastShadow({ box, url, skew = -55, length = 0.4, opacity = 0.45 }: { box: Box; url: string; skew?: number; length?: number; opacity?: number }) {
  return (
    <img
      src={url}
      alt=""
      style={{
        position: "absolute",
        ...box,
        maxWidth: "none",
        filter: "brightness(0) blur(5px)",
        opacity,
        transformOrigin: "50% 100%",
        transform: `skewX(${skew}deg) scaleY(${length})`,
      }}
    />
  );
}

export const BANGERS = "var(--font-bangers), Impact, sans-serif";
export const CAVEAT = "var(--font-caveat), cursive";

/**
 * Selective colour: everything black and white except colours near `hue` (the club colour), which
 * stay in full colour — skin, grass and stands go grey, the shirt pops (college "colour pop" look).
 * The club hue is rotated to red, then "how red" becomes the mask that brings the colour back.
 */
export function SelectiveColorDefs({ id, hue }: { id: string; hue: number }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="hueRotate" values={String(-hue)} result="rot" />
        {/* Alpha = redness after rotation: strong for the club hue, zero for neutrals and other hues. */}
        <feColorMatrix in="rot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 -1.3 -1.3 0 -0.08" result="sel" />
        <feGaussianBlur in="sel" stdDeviation="1.2" result="selSoft" />
        <feComposite in="SourceGraphic" in2="selSoft" operator="in" result="colour" />
        <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="grey" />
        <feComponentTransfer in="grey" result="greyC">
          <feFuncR type="linear" slope="1.12" intercept="-0.03" />
          <feFuncG type="linear" slope="1.12" intercept="-0.03" />
          <feFuncB type="linear" slope="1.12" intercept="-0.03" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="greyC" />
          <feMergeNode in="colour" />
        </feMerge>
        {/* Keep the cutout's own transparency. */}
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}
