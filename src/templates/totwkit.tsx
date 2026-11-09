/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { SANS, ringSize } from "./shared";
import type { RenderData } from "./types";

/* Helpers shared by the minimal Team-of-the-Week looks (totwcallout, totwsplit, totwstack). */

export const INK = "#22201d";
export const SOFT = "#77726b";
export const PAPER = "#ece9e4";

/** League lineup graphics are tall portraits (~0.69); layout assumes this, the drawing never does. */
export const ASSUMED_ASPECT = 0.69;

/** Width and height a graphic of the assumed aspect takes inside maxW × maxH. */
export function fitGraphic(maxW: number, maxH: number): { w: number; h: number } {
  const w = Math.min(maxW, maxH * ASSUMED_ASPECT);
  return { w, h: w / ASSUMED_ASPECT };
}

/** The club colour, guarded against white / yellow / near-black. */
export function totwTone(data: RenderData): string {
  const p = data.params;
  let c = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  if (luminance(c) > 0.45) c = vivid(p.accent);
  if (luminance(c) > 0.45) c = shade(c, -0.45);
  if (luminance(c) < 0.03) c = shade(c, 0.25);
  return c;
}

/** "TEAM OF THE WEEK" → "Team of the Week"; mixed-case text stays as typed. */
export function totwTitle(kicker: string): string {
  const k = (kicker || "Team of the Week").replace(/’/g, "'").trim();
  if (k !== k.toUpperCase()) return k;
  return k
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && /^(of|the|and|a)$/.test(w) ? w : /^(xi|totw|u\d+)$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function fullName(data: RenderData): string {
  return [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
}

/** DM Serif Display italic: advance widths per 100px (measured in the browser). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
export const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
/** Inter 500 caps, roughly, with tracking added per glyph. */
export const capsEm = (t: string, tracking: number) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.4 : c === "M" || c === "W" ? 0.95 : 0.7) + tracking, 0);

/** Small spaced caps. */
export function caps(size: number, color = INK, tracking = 0.24): CSSProperties {
  return { fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${tracking}em`, textTransform: "uppercase", color, lineHeight: 1.2, whiteSpace: "nowrap" };
}

/**
 * The official league graphic with the player's highlight ring, like shared.tsx ContentBlock: the wrapper
 * shrinks to the image, so the ring's % position always lands on his circle whatever the graphic's aspect.
 * `children` are drawn inside that wrapper (in its coordinates), for leader lines that start at the ring.
 * No graphic yet → a quiet dashed placeholder of the box size.
 */
export function LeagueGraphic({
  data,
  maxW,
  maxH,
  ring,
  accent,
  style,
  imgStyle,
  children,
}: {
  data: RenderData;
  maxW: number;
  maxH: number;
  /** Ring diameter in px. */
  ring: number;
  accent: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  children?: ReactNode;
}) {
  const hl = data.content.insetHighlight;
  if (!data.insetUrl) {
    const { w, h } = fitGraphic(maxW, maxH);
    return (
      <div
        style={{
          width: w,
          height: h,
          border: `2px dashed rgba(120,115,108,.55)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...caps(15, SOFT, 0.3),
          ...style,
          position: style?.position ?? "relative",
        }}
      >
        League graphic
      </div>
    );
  }
  return (
    <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom", lineHeight: 0, ...style }}>
      <img src={data.insetUrl} alt="" style={{ maxWidth: maxW, maxHeight: maxH, display: "block", ...imgStyle }} />
      {hl && (
        <div
          style={{
            position: "absolute",
            left: `${hl.x}%`,
            top: `${hl.y}%`,
            width: ringSize(hl, ring),
            aspectRatio: "1",
            boxSizing: "border-box",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `${Math.max(3, Math.round(ring * 0.035))}px solid ${accent}`,
            boxShadow: `0 0 0 2px rgba(255,255,255,.95), 0 0 ${Math.round(ring * 0.28)}px ${Math.round(ring * 0.06)}px color-mix(in srgb, ${accent} 70%, #fff), inset 0 0 0 2px rgba(255,255,255,.9)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
