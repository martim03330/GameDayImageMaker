/**
 * The one framing formula of the NATURAL looks, shared by natPlace (templates/natkit.tsx, which lays the type
 * out around his face) and /api/natframe (which draws the photo): both must land his face on the same pixel.
 */

/**
 * Where a cutout sits inside its original photo (from image matching, stored per photo as meta.nat_align):
 * the cutout's top-left (x, y) in original pixels, its scale k (cutout px per original px), the original's
 * size (w, h, EXIF-rotated) and the cutout's size (cw, ch).
 */
export type NatAlign = { x: number; y: number; k: number; w: number; h: number; cw: number; ch: number };

export type NatGeom = {
  /** Original px → canvas px. */
  S: number;
  /** The original's top-left on the canvas. */
  left: number;
  top: number;
  /** Where his face really lands: centre and height, and its width (px). */
  fx: number;
  fy: number;
  fs: number;
  faceW: number;
  /** The cutout's box on the canvas (rounded as the route draws it). */
  box: { left: number; top: number; width: number; height: number };
};

/**
 * Face centre at (fx, fy), fs px tall — but the photo never smaller than the canvas: the smallest zoom that
 * covers every side, then the photo slides (his face moves off the asked point if it must).
 */
export function natGeom(a: NatAlign, face: readonly number[], W: number, H: number, fx: number, fy: number, fs: number, nudge?: { x: number; y: number }): NatGeom {
  const fcx = a.x + ((face[0] + face[2] / 2) * a.cw) / a.k;
  const fcy = a.y + ((face[1] + face[3] / 2) * a.ch) / a.k;
  const fh = (face[3] * a.ch) / a.k;
  const S = Math.max(fs / fh, W / a.w, H / a.h) * 1.002;
  // The user's manual nudge (quick adjustments) moves the whole framed photo as it is — same size, same
  // framing, just shifted — even past the canvas edge; the route continues the photo's own edge into the gap.
  const left = Math.round(Math.min(0, Math.max(W - a.w * S, fx - fcx * S)) + (nudge?.x ?? 0));
  const top = Math.round(Math.min(0, Math.max(H - a.h * S, fy - fcy * S)) + (nudge?.y ?? 0));
  const box = {
    left: Math.round(left + a.x * S),
    top: Math.round(top + a.y * S),
    width: Math.round((a.cw / a.k) * S),
    height: Math.round((a.ch / a.k) * S),
  };
  return {
    S,
    left,
    top,
    fx: left + fcx * S,
    fy: top + fcy * S,
    fs: fh * S,
    faceW: (face[2] * a.cw * S) / a.k,
    box,
  };
}

/** The alignment as a URL parameter (and back), so the route draws with exactly the numbers natPlace used. */
export const natAlignParam = (a: NatAlign) => [a.x.toFixed(3), a.y.toFixed(3), a.k.toFixed(6), a.w, a.h, a.cw, a.ch].join(",");

export function parseNatAlign(s: string | null): NatAlign | null {
  if (!s) return null;
  const v = s.split(",").map(Number);
  if (v.length !== 7 || v.some((n) => !isFinite(n)) || v[2] <= 0 || v[3] < 1 || v[4] < 1 || v[5] < 1 || v[6] < 1) return null;
  return { x: v[0], y: v[1], k: v[2], w: Math.round(v[3]), h: Math.round(v[4]), cw: Math.round(v[5]), ch: Math.round(v[6]) };
}

/** Rounded the same way the URL carries it (natPlace computes from these values, the route parses them). */
export const roundNatAlign = (a: NatAlign): NatAlign => parseNatAlign(natAlignParam(a))!;
