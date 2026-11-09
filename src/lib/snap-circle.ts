/**
 * Snaps a click on the official league graphic to the player's photo circle.
 *
 * League lineups show each player as a round photo with a white edge on a coloured ground. From the
 * click we cast rays outwards, take the point on each ray where a white run meets the ground (the
 * circle's outer edge), and fit a circle through those points. The result is the circle's centre and
 * radius in % (x/y of the graphic, r of its width). The ring then grows to take in the name/club labels
 * under the photo, so it circles the whole player block.
 * If nothing circle-like is found (click on a name label, odd graphic), it falls back to the click point.
 */
export function snapToCircle(img: HTMLImageElement, fx: number, fy: number): { x: number; y: number; r?: number } {
  const fallback = { x: fx * 100, y: fy * 100 };
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  if (!W || !H) return fallback;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  ctx.drawImage(img, 0, 0);
  let px: Uint8ClampedArray;
  try {
    px = ctx.getImageData(0, 0, W, H).data;
  } catch {
    return fallback;
  }

  const at = (x: number, y: number) => {
    const i = (Math.round(y) * W + Math.round(x)) * 4;
    return [px[i], px[i + 1], px[i + 2]] as const;
  };
  const isWhite = (x: number, y: number) => {
    const [r, g, b] = at(x, y);
    return r > 205 && g > 205 && b > 205;
  };
  // Anything clearly not white and not a skin/photo-ish neutral: the graphic's coloured ground.
  const isGround = (x: number, y: number) => {
    const [r, g, b] = at(x, y);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max < 200 && max - min > 45;
  };

  const ox = fx * W;
  const oy = fy * H;
  const maxLen = W * 0.22;
  const hits: [number, number][] = [];
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let whiteRun = 0;
    for (let t = 2; t < maxLen; t++) {
      const x = ox + dx * t;
      const y = oy + dy * t;
      if (x < 1 || y < 1 || x > W - 2 || y > H - 2) break;
      if (isWhite(x, y)) {
        whiteRun++;
        continue;
      }
      if (whiteRun >= 2) {
        // The white run ends here; it is the circle's edge only if the ground follows right after.
        let ground = 0;
        for (let s = 0; s < 6; s++) if (isGround(x + dx * s, y + dy * s)) ground++;
        if (ground >= 4) {
          hits.push([x - dx, y - dy]);
          break;
        }
      }
      whiteRun = 0;
    }
  }
  if (hits.length < 16) return fallback;

  const fit = (pts: [number, number][]) => {
    // Kåsa least-squares circle fit.
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
    for (const [x, y] of pts) {
      const z = x * x + y * y;
      sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z;
    }
    const n = pts.length;
    const A = [
      [sxx, sxy, sx],
      [sxy, syy, sy],
      [sx, sy, n],
    ];
    const B = [sxz, syz, sz];
    const det = (m: number[][]) =>
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A);
    if (Math.abs(D) < 1e-9) return null;
    const col = (j: number) => A.map((row, i) => row.map((v, c) => (c === j ? B[i] : v)));
    const a = det(col(0)) / D;
    const b = det(col(1)) / D;
    const c = det(col(2)) / D;
    const cx = a / 2;
    const cy = b / 2;
    const r = Math.sqrt(c + cx * cx + cy * cy);
    return Number.isFinite(r) ? { cx, cy, r } : null;
  };

  let circle = fit(hits);
  if (!circle) return fallback;
  // Drop rays that hit something else (a name label, a neighbour) and refit on the true edge.
  const inliers = hits.filter(([x, y]) => Math.abs(Math.hypot(x - circle!.cx, y - circle!.cy) - circle!.r) < circle!.r * 0.08);
  if (inliers.length < 16) return fallback;
  circle = fit(inliers);
  if (!circle) return fallback;
  if (circle.r < W * 0.025 || circle.r > W * 0.16) return fallback;
  // The click must be inside (or right on) the circle it snapped to.
  if (Math.hypot(ox - circle.cx, oy - circle.cy) > circle.r * 1.25) return fallback;

  // Label pixels: the white club box/letters, or the name pill (a lighter, saturated tone of the ground).
  const isLabel = (x: number, y: number) => {
    if (isWhite(x, y)) return true;
    const [r, g, b] = at(x, y);
    return r > 85 && b > 110 && g < 80 && r > g * 2.5;
  };
  return enclose(circle, isLabel, W, H);
}

/**
 * Grows the ring from his photo circle to the whole player block: the photo plus the name and club
 * labels printed under it. The labels are found as rows of label pixels (the white club box, the
 * lighter name pill) right under the circle; the ring is the smallest circle around the photo and
 * that label box, with a little air. With no labels found it just hugs the photo.
 */
function enclose(
  c: { cx: number; cy: number; r: number },
  isLabel: (x: number, y: number) => boolean,
  W: number,
  H: number,
): { x: number; y: number; r: number } {
  const { cx, cy, r } = c;
  const x0 = Math.max(1, Math.round(cx - 1.6 * r));
  const x1 = Math.min(W - 2, Math.round(cx + 1.6 * r));
  let bottom = -1;
  let left = Infinity;
  let right = -Infinity;
  let gap = 0;
  for (let y = Math.round(cy + r + 4); y < Math.min(H - 2, cy + r * 2.4); y++) {
    // The label run through the photo's axis: grow left/right from cx while label pixels continue
    // (small gaps between letters allowed). Pitch lines crossing the whole row are ignored.
    const run = (dir: 1 | -1) => {
      let x = Math.round(cx);
      let last = isLabel(x, y) ? x : NaN;
      let miss = 0;
      while (x > x0 && x < x1 && miss <= r * 0.12) {
        x += dir;
        if (isLabel(x, y)) {
          last = x;
          miss = 0;
        } else miss++;
      }
      return last;
    };
    const rowL = run(-1);
    const rowR = run(1);
    const width = Number.isNaN(rowL) || Number.isNaN(rowR) ? 0 : rowR - rowL;
    const count = width > r * 3 ? 0 : width;
    if (count >= r * 0.3) {
      bottom = y;
      left = Math.min(left, rowL);
      right = Math.max(right, rowR);
      gap = 0;
    } else if (bottom > 0 && ++gap > r * 0.22) {
      break;
    } else if (bottom < 0 && y > cy + r * 1.45) {
      break; // nothing right under the photo: no labels
    }
  }

  const pad = r * 0.07;
  if (bottom < 0) {
    const R = r + pad;
    return { x: (cx / W) * 100, y: (cy / H) * 100, r: (R / W) * 100 };
  }
  // Labels are padded pills around the letters/box we saw.
  const top = cy - r;
  const bot = bottom + pad * 0.5;
  const half = Math.max(r, cx - (left - pad), right + pad - cx);
  // Centre on the vertical axis through the photo, placed so the top of the photo and the label's
  // bottom corners sit at the same distance (smallest circle around both).
  let yc = (half * half + bot * bot - top * top) / (2 * (bot - top));
  yc = Math.max(cy, Math.min(yc, bot));
  const R = Math.max(yc - top, Math.hypot(half, bot - yc)) + pad;
  return { x: (cx / W) * 100, y: (yc / H) * 100, r: (R / W) * 100 };
}
