import { expect, test } from "vitest";
import { cameraPath, cropRect, type Det } from "./path";

/** A ball moving right 4 px per frame along y=200, one detection per frame. */
function line(n: number, extra: (i: number) => [number, number, number][] = () => []): Det {
  return {
    fps: 50,
    W: 800,
    H: 450,
    n,
    shots: [[0, n]],
    cands: Array.from({ length: n }, (_, i) => [[100 + 4 * i, 200, 0.5] as [number, number, number], ...extra(i)]),
  };
}

/** The ball (bx, by) is inside the crop window the camera (x, y) gives at frame f. */
function ballInWindow(det: Det, p: ReturnType<typeof cameraPath>, f: number, zoom = 1.6) {
  const r = cropRect(p.x[f], p.y[f], det.W, det.H, zoom);
  return p.bx[f] >= r.x && p.bx[f] <= r.x + r.w && p.by[f] >= r.y && p.by[f] <= r.y + r.h;
}

test("a far-away false positive does not pull the ball path", () => {
  const det = line(100, (i) => (i === 50 ? [[700, 40, 0.9]] : []));
  const p = cameraPath(det, []);
  expect(Math.abs(p.bx[50] - (100 + 4 * 50))).toBeLessThan(5);
  expect(Math.abs(p.by[50] - 200)).toBeLessThan(5);
});

test("the ball path passes through an anchor and the camera keeps it in view", () => {
  const det = line(100);
  const p = cameraPath(det, [{ f: 60, x: 500, y: 300 }]);
  expect(Math.abs(p.bx[60] - 500)).toBeLessThan(1);
  expect(Math.abs(p.by[60] - 300)).toBeLessThan(1);
  expect(ballInWindow(det, p, 60)).toBe(true);
});

test("a jittery detection does not shake the camera", () => {
  // The ball stays around x=400 but the detector wobbles ±30 px every frame.
  const det: Det = { fps: 50, W: 800, H: 450, n: 100, shots: [[0, 100]], cands: Array.from({ length: 100 }, (_, i) => [[400 + (i % 2 ? 30 : -30), 225, 0.6] as [number, number, number]]) };
  const p = cameraPath(det, []);
  const steps = p.x.slice(1).map((v, i) => Math.abs(v - p.x[i]));
  expect(Math.max(...steps)).toBeLessThan(0.5);
});

test("the camera moves smoothly while following a moving ball", () => {
  // 150 frames: the ball crosses most of the 800 px frame (100 → 696) and stays inside it.
  const det = line(150);
  const p = cameraPath(det, []);
  const acc = p.x.slice(2).map((v, i) => Math.abs(v - 2 * p.x[i + 1] + p.x[i]));
  expect(Math.max(...acc)).toBeLessThan(0.5);
  for (let f = 0; f < 150; f++) expect(ballInWindow(det, p, f)).toBe(true);
});

test("no smoothing across a real camera cut", () => {
  const n = 80;
  const det: Det = {
    fps: 50,
    W: 800,
    H: 450,
    n,
    shots: [
      [0, 40],
      [40, 80],
    ],
    cands: Array.from({ length: n }, (_, i) => [[i < 40 ? 100 : 700, 200, 0.6] as [number, number, number]]),
  };
  const p = cameraPath(det, []);
  expect(Math.abs(p.x[40] - p.x[39])).toBeGreaterThan(250);
  expect(ballInWindow(det, p, 39)).toBe(true);
  expect(ballInWindow(det, p, 40)).toBe(true);
});

test("a 'cut' shorter than a quarter of a second is not a cut", () => {
  const det: Det = {
    fps: 50,
    W: 800,
    H: 450,
    n: 100,
    shots: [
      [0, 1],
      [1, 100],
    ],
    cands: Array.from({ length: 100 }, (_, i) => (i === 0 ? [[50, 50, 0.9] as [number, number, number]] : [[300, 225, 0.6] as [number, number, number]])),
  };
  const p = cameraPath(det, []);
  expect(Math.abs(p.x[1] - p.x[0])).toBeLessThan(1);
});

test("a shot without detections stays centred", () => {
  const det: Det = { fps: 50, W: 800, H: 450, n: 30, shots: [[0, 30]], cands: Array.from({ length: 30 }, () => []) };
  const p = cameraPath(det, []);
  expect(p.x.every((x) => x === 400)).toBe(true);
  expect(p.y.every((y) => y === 225)).toBe(true);
});

test("crop window keeps the frame's aspect and stays inside it", () => {
  expect(cropRect(10, 10, 800, 450, 2)).toEqual({ x: 0, y: 0, w: 400, h: 225 });
  expect(cropRect(790, 440, 800, 450, 2)).toEqual({ x: 400, y: 225, w: 400, h: 225 });
  expect(cropRect(400, 225, 800, 450, 1)).toEqual({ x: 0, y: 0, w: 800, h: 450 });
});

test("crop window can take the video slot's aspect (as the renderer does)", () => {
  // 832×480 source, slot 16:9, zoom 2 → 416×240 window narrowed to 16:9 = 416×234.
  expect(cropRect(416, 240, 832, 480, 2, 16 / 9)).toEqual({ x: 208, y: 123, w: 416, h: 234 });
});

test("between two anchors, a far-away false detection is not used", () => {
  // Anchors 6 frames apart (the user clicks every ~0.1 s) on the true line; in between the detector only
  // sees a confident false ball 250 px away.
  const det = line(100, () => []);
  for (let f = 41; f < 46; f++) det.cands[f] = [];
  det.cands[43] = [[100 + 4 * 43, 450, 0.95]];
  const p = cameraPath(det, [
    { f: 40, x: 100 + 4 * 40, y: 200 },
    { f: 46, x: 100 + 4 * 46, y: 200 },
  ]);
  expect(Math.abs(p.by[43] - 200)).toBeLessThan(10);
});
