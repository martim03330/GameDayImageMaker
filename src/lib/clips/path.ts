/**
 * The virtual camera of a goal / assist clip: where the crop window is centred in each frame.
 *
 * The detector (services/balltrack) gives, per frame, a few ball candidates — many are wrong (heads, ad
 * circles). Picking the nearest candidate frame by frame drifts after one bad pick, so the path is chosen
 * GLOBALLY per camera shot: dynamic programming over all candidates keeps the sequence that is most
 * confident AND physically possible (a ball moves at most ~5% of the frame width per frame). The user's
 * clicks (anchors) are points the path must pass through: the shot is solved in segments between them.
 * Gaps are interpolated into the ball's path. The camera then frames it like an operator would: smooth,
 * letting the ball move inside the middle of the window and drifting only when it nears the edge — chasing
 * every detection made the clip shake. Pure (no I/O): it runs on every click, in the server action.
 */

export type Cand = [number, number, number]; // x, y, confidence
export type Det = { fps: number; W: number; H: number; n: number; shots: [number, number][]; cands: Cand[][] };
export type Anchor = { f: number; x: number; y: number };

type Node = { f: number; x: number; y: number; conf: number; anchor?: boolean };

const SKIP = 0.08;

/** Best chain of candidates strictly between `start` and `end` (each may be a fixed anchor or null). */
function segment(det: Det, nodes: Node[], start: Node | null, end: Node | null): Node[] {
  const maxStep = 0.05 * det.W;
  const maxGap = Math.round(0.6 * det.fps);
  const all = [...(start ? [start] : []), ...nodes, ...(end ? [end] : [])];
  const score = new Array<number>(all.length).fill(-Infinity);
  const prev = new Array<number>(all.length).fill(-1);
  const first = all.length ? all[0].f : 0;
  for (let k = 0; k < all.length; k++) {
    const c = all[k];
    if (start && k === 0) {
      score[k] = 0;
      continue;
    }
    // Starting the chain here (only when the segment has no fixed start).
    let best = start ? -Infinity : c.conf - SKIP * 0.5 * (c.f - first);
    let arg = -1;
    for (let q = k - 1; q >= 0; q--) {
      const d = all[q];
      if (score[q] === -Infinity || d.f === c.f) continue;
      const gap = c.f - d.f;
      // Only a link between two of the user's clicks may break the speed limit (the user knows best);
      // a click linked to a detection obeys it like any other link, or a false ball sneaks in between clicks.
      const fixed = c.anchor && d.anchor;
      if (!fixed && gap > maxGap) continue;
      const dist = Math.hypot(c.x - d.x, c.y - d.y);
      if (!fixed && dist > maxStep * gap + 15) continue;
      const s = score[q] + c.conf + 0.3 - SKIP * (gap - 1) - 0.002 * dist;
      if (s > best) {
        best = s;
        arg = q;
      }
    }
    score[k] = best;
    prev[k] = arg;
  }
  if (!all.length) return [];
  let k: number;
  if (end) k = all.length - 1;
  else {
    k = -1;
    let best = -Infinity;
    for (let q = 0; q < all.length; q++) {
      if (score[q] > best) {
        best = score[q];
        k = q;
      }
    }
  }
  const chain: Node[] = [];
  while (k !== -1) {
    chain.push(all[k]);
    k = prev[k];
  }
  return chain.reverse().filter((n) => !n.anchor);
}

function gaussian(values: number[], sigma: number): number[] {
  if (sigma <= 0 || values.length < 2) return values.slice();
  const r = Math.ceil(3 * sigma);
  const w = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)));
  return values.map((_, i) => {
    let s = 0;
    let t = 0;
    for (let k = -r; k <= r; k++) {
      const j = Math.min(values.length - 1, Math.max(0, i + k));
      s += values[j] * w[k + r];
      t += w[k + r];
    }
    return s / t;
  });
}

/**
 * An operator's camera along one axis: it does NOT chase the ball. The ball may roam freely inside the
 * central 60% of the window ("dead zone"); the camera only drifts — slowly, on a ~1 s scale — when the ball
 * would leave that zone. Done offline (the whole clip is known): start from a heavily smoothed ball path,
 * then repeatedly add back, smoothed, only the part of the ball's offset that exceeds the dead zone.
 */
function operator(ball: number[], fps: number, windowSize: number, frameSize: number): number[] {
  const dead = 0.3 * windowSize;
  const lo = Math.min(windowSize / 2, frameSize / 2);
  const hi = Math.max(frameSize - windowSize / 2, frameSize / 2);
  const clamp = (v: number) => Math.min(hi, Math.max(lo, v));
  let c = gaussian(ball, 0.9 * fps).map(clamp);
  for (let it = 0; it < 40; it++) {
    const excess = ball.map((b, i) => {
      const d = b - c[i];
      return d > dead ? d - dead : d < -dead ? d + dead : 0;
    });
    if (excess.every((e) => Math.abs(e) < 0.5)) break;
    const push = gaussian(excess, 0.35 * fps);
    c = c.map((v, i) => clamp(v + push[i]));
  }
  // Ease in and out: at 0.15 s pans started and stopped with a jolt (a celebration pan jumped at its start).
  return gaussian(c, 0.3 * fps).map(clamp);
}

/**
 * Per frame: the ball (bx, by — through the detections and the user's anchors) and the camera centre
 * (x, y — an operator's smooth framing that keeps the ball well inside the crop window at this zoom).
 */
export function cameraPath(det: Det, anchors: Anchor[], zoom = 1.6): { x: number[]; y: number[]; bx: number[]; by: number[]; used: boolean[] } {
  const x = new Array<number>(det.n).fill(det.W / 2);
  const y = new Array<number>(det.n).fill(det.H / 2);
  const bx = new Array<number>(det.n).fill(det.W / 2);
  const by = new Array<number>(det.n).fill(det.H / 2);
  const used = new Array<boolean>(det.n).fill(false);
  const z = Math.max(1, zoom);

  // A "cut" shorter than a quarter of a second is a flash (a transition, one odd frame): not a new shot.
  const shots: [number, number][] = [];
  for (const [a, b] of det.shots) {
    const last = shots[shots.length - 1];
    if (last && (b - a < 0.25 * det.fps || last[1] - last[0] < 0.25 * det.fps)) last[1] = b;
    else shots.push([a, b]);
  }

  for (const [a, b] of shots) {
    const fixed: Node[] = anchors
      .filter((p) => p.f >= a && p.f < b)
      .sort((p, q) => p.f - q.f)
      .map((p) => ({ f: p.f, x: p.x, y: p.y, conf: 10, anchor: true }));
    const anchorFrames = new Set(fixed.map((p) => p.f));
    const nodes: Node[] = [];
    for (let f = a; f < b; f++) {
      if (anchorFrames.has(f)) continue;
      for (const [cx, cy, conf] of det.cands[f] ?? []) nodes.push({ f, x: cx, y: cy, conf });
    }
    // Solve between consecutive anchors (before the first and after the last, the ends are free).
    const bounds = [null, ...fixed, null];
    const points: Node[] = [];
    for (let s = 0; s < bounds.length - 1; s++) {
      const st = bounds[s];
      const en = bounds[s + 1];
      const lo = st ? st.f : a - 1;
      const hi = en ? en.f : b;
      points.push(...segment(det, nodes.filter((n) => n.f > lo && n.f < hi), st, en));
      if (en) points.push(en);
    }
    if (!points.length) continue; // nothing at all: the shot stays centred
    points.sort((p, q) => p.f - q.f);
    for (const p of points) used[p.f] = true;

    // The ball: straight lines between the chosen points (exact at every anchor), held at the ends.
    const sx: number[] = [];
    const sy: number[] = [];
    let k = 0;
    for (let f = a; f < b; f++) {
      while (k < points.length - 1 && points[k + 1].f <= f) k++;
      const p = points[k];
      const q = points[Math.min(k + 1, points.length - 1)];
      const t = f <= p.f || q.f === p.f ? 0 : Math.min(1, (f - p.f) / (q.f - p.f));
      sx.push(f < points[0].f ? points[0].x : p.x + (q.x - p.x) * t);
      sy.push(f < points[0].f ? points[0].y : p.y + (q.y - p.y) * t);
    }
    // The camera: an operator's framing around it.
    const cx = operator(sx, det.fps, det.W / z, det.W);
    const cy = operator(sy, det.fps, det.H / z, det.H);
    for (let f = a; f < b; f++) {
      bx[f] = sx[f - a];
      by[f] = sy[f - a];
      x[f] = cx[f - a];
      y[f] = cy[f - a];
    }
  }
  return { x, y, bx, by, used };
}

/** The crop window around (cx, cy): 1/zoom of the frame (optionally narrowed to `aspect`), kept inside the frame. */
export function cropRect(cx: number, cy: number, W: number, H: number, zoom: number, aspect?: number): { x: number; y: number; w: number; h: number } {
  const z = Math.max(1, zoom);
  let w = Math.round(W / z);
  let h = Math.round(H / z);
  // Narrowed to the video slot's aspect, exactly as services/balltrack render does.
  if (aspect) {
    if (w / h > aspect) w = Math.round(h * aspect);
    else h = Math.round(w / aspect);
  }
  const x = Math.round(Math.min(Math.max(cx - w / 2, 0), W - w));
  const y = Math.round(Math.min(Math.max(cy - h / 2, 0), H - h));
  return { x, y, w, h };
}
