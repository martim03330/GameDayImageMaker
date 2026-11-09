"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { CANVAS_W } from "./types";

/**
 * The agency logo's size, the same for every look: the look is drawn with its logo as designed, then the
 * logo is scaled from its foot (centre, left or right foot, whichever side it sits on) and whatever sits just
 * above it — a name panel, a fixture line — moves up by exactly what the logo grew, so the gap between them
 * stays as designed. Blocks resting on those (date chips over a name) move with them. Then the logo alone is
 * moved by moveX / moveY (the text stays where it is), held inside the canvas. While it measures,
 * the wrapper carries data-logo-pending (the exporter waits for it to clear before the screenshot).
 */
export function LogoLift({ scale, moveX = 0, moveY = 0, children }: { scale: number; moveX?: number; moveY?: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    // Undo the previous pass: React keeps the same nodes between renders and never resets these properties.
    for (const t of touched.current) {
      t.style.translate = "";
      t.style.scale = "";
    }
    touched.current = [];
    const avoid = [...el.querySelectorAll<HTMLElement>("[data-logo-avoid]")].flatMap((a) =>
      (a.dataset.logoAvoid ?? "").split(";").filter(Boolean).map((r) => r.split(",").map(Number) as [number, number, number, number]),
    );
    if (scale === 1 && !moveX && !moveY && !avoid.length) {
      el.removeAttribute("data-logo-pending");
      return;
    }
    el.setAttribute("data-logo-pending", "");
    const logos = [...el.querySelectorAll<HTMLElement>("[data-agency-logo]")];
    const imgs = logos.flatMap((l) => (l instanceof HTMLImageElement ? [l] : [...l.querySelectorAll("img")]));
    Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => i.addEventListener("load", r, { once: true }))))).then(() => {
      if (cancelled) return;
      for (const logo of logos) {
        if (scale !== 1) lift(el, logo, scale, touched.current);
        if (moveX || moveY) move(el, logo, moveX, moveY, touched.current);
        if (avoid.length) dodge(el, logo, avoid, touched.current);
      }
      el.removeAttribute("data-logo-pending");
    });
    return () => {
      cancelled = true;
    };
  });

  // Never cut a name: a line set to end in "…" (text-overflow: ellipsis) that does not fit is shrunk until it
  // does, so club and player names always read in full. Runs once the fonts are in (their widths decide it).
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancelled = false;
    el.setAttribute("data-fit-pending", "");
    document.fonts.ready.then(() => {
      if (cancelled) return;
      for (const t of el.querySelectorAll<HTMLElement>("*")) {
        if (t.dataset.fitFont) t.style.fontSize = t.dataset.fitFont; // undo the previous pass
        if (getComputedStyle(t).textOverflow !== "ellipsis") continue;
        if (t.scrollWidth <= t.clientWidth + 1 || !t.clientWidth) continue;
        const size = parseFloat(getComputedStyle(t).fontSize);
        t.dataset.fitFont ??= t.style.fontSize || `${size}px`;
        t.style.fontSize = `${size * (t.clientWidth / t.scrollWidth) * 0.98}px`;
      }
      el.removeAttribute("data-fit-pending");
    });
    return () => {
      cancelled = true;
    };
  });

  return (
    <div ref={root} style={{ display: "contents" }}>
      {children}
    </div>
  );
}

type Box = { left: number; top: number; right: number; bottom: number };

function lift(root: HTMLElement, logo: HTMLElement, scale: number, touched: HTMLElement[]) {
  const canvas = root.firstElementChild as HTMLElement | null;
  if (!canvas) return;
  const c = canvas.getBoundingClientRect();
  const k = c.width / CANVAS_W || 1; // the editor preview is scaled down: work in canvas pixels
  const H = c.height / k;
  const box = (e: Element): Box => {
    const r = e.getBoundingClientRect();
    return { left: (r.left - c.left) / k, top: (r.top - c.top) / k, right: (r.right - c.left) / k, bottom: (r.bottom - c.top) / k };
  };
  const L = box(logo);
  const mid = (L.left + L.right) / 2;
  logo.style.transformOrigin = Math.abs(mid - CANVAS_W / 2) < 60 ? "center bottom" : mid < CANVAS_W / 2 ? "left bottom" : "right bottom";
  logo.style.scale = String(scale);
  touched.push(logo);
  const delta = (scale - 1) * (L.bottom - L.top);

  // Blocks above the logo, near it and over the same columns: the look's text and crests, not its grounds.
  const lifted: HTMLElement[] = [];
  const overlaps = (b: Box, x0: number, x1: number) => b.right > x0 && b.left < x1;
  const visit = (e: Element, test: (b: Box) => boolean) => {
    for (const child of e.children) {
      if (!(child instanceof HTMLElement) || lifted.includes(child)) continue;
      if (child.contains(logo)) {
        visit(child, test);
        continue;
      }
      const b = box(child);
      if (b.bottom - b.top > 0.6 * H || b.right - b.left > 0.98 * CANVAS_W) {
        // A ground, a shade or a wrapper as big as the canvas: what to move is inside it.
        if (!(child instanceof HTMLImageElement) && child.tagName !== "svg") visit(child, test);
        continue;
      }
      if (test(b)) lifted.push(child);
    }
  };
  visit(canvas, (b) => b.bottom <= L.top + 4 && b.bottom >= L.top - 0.3 * H && overlaps(b, L.left - 40, L.right + 40));
  // What rests on the moved blocks moves with them (stacked chips, a crest over a name).
  // Each moved block is tested on its own, so a soft shade behind a block cannot leave its title behind.
  for (let round = 0; round < 6 && lifted.length; round++) {
    const bs = lifted.map(box);
    const before = lifted.length;
    visit(canvas, (b) => bs.some((m) => b.bottom <= m.top + 4 && b.bottom >= m.top - 80 && overlaps(b, m.left, m.right)));
    if (lifted.length === before) break;
  }
  for (const e of lifted) {
    e.style.translate = `0 ${-delta}px`;
    touched.push(e);
  }
}

/** Moves the logo by (dx, dy) canvas px, but never past a 24px margin inside the canvas. */
function move(root: HTMLElement, logo: HTMLElement, dx: number, dy: number, touched: HTMLElement[]) {
  const canvas = root.firstElementChild as HTMLElement | null;
  if (!canvas) return;
  const c = canvas.getBoundingClientRect();
  const k = c.width / CANVAS_W || 1;
  const H = c.height / k;
  const r = logo.getBoundingClientRect(); // already scaled
  const left = (r.left - c.left) / k;
  const top = (r.top - c.top) / k;
  const w = r.width / k;
  const h = r.height / k;
  const M = 24;
  const x = Math.min(Math.max(dx, M - left), CANVAS_W - M - w - left);
  const y = Math.min(Math.max(dy, M - top), H - M - h - top);
  logo.style.translate = `${x}px ${y}px`;
  if (!touched.includes(logo)) touched.push(logo);
}

/**
 * The logo never sits on a face (his or another player's, from the photo's detection — `faces` in canvas px):
 * if it covers one, it slides to the nearest free spot — sideways first, then up or down, a step at a time —
 * at the same size. Stays inside a 24px margin; with no free spot within reach it stays where it was.
 */
function dodge(root: HTMLElement, logo: HTMLElement, faces: [number, number, number, number][], touched: HTMLElement[]) {
  const canvas = root.firstElementChild as HTMLElement | null;
  if (!canvas) return;
  const c = canvas.getBoundingClientRect();
  const k = c.width / CANVAS_W || 1;
  const H = c.height / k;
  const r = logo.getBoundingClientRect();
  const L = { left: (r.left - c.left) / k, top: (r.top - c.top) / k, w: r.width / k, h: r.height / k };
  const best = dodgeOffset(L, faces, CANVAS_W, H);
  if (!best || (!best[0] && !best[1])) return;
  const [tx, ty] = (logo.style.translate || "0px 0px").split(" ").map((v) => parseFloat(v) || 0);
  logo.style.translate = `${tx + best[0]}px ${(ty || 0) + best[1]}px`;
  if (!touched.includes(logo)) touched.push(logo);
}

/**
 * Where the logo box `L` (canvas px) must move so it covers none of `faces` (16px clear of each): [0, 0] when it
 * is clear already, else the nearest free spot — sideways first (it stays on the agreed foot line), then down or
 * up by half as much — inside a 24px margin; null when nothing within 900px is free.
 */
export function dodgeOffset(L: { left: number; top: number; w: number; h: number }, faces: [number, number, number, number][], W: number, H: number): [number, number] | null {
  const PAD = 16;
  const M = 24;
  const hits = (dx: number, dy: number) =>
    faces.some(([x0, y0, x1, y1]) => L.left + dx < x1 + PAD && L.left + dx + L.w > x0 - PAD && L.top + dy < y1 + PAD && L.top + dy + L.h > y0 - PAD);
  if (!hits(0, 0)) return [0, 0];
  const inside = (dx: number, dy: number) => L.left + dx >= M && L.left + dx + L.w <= W - M && L.top + dy >= M && L.top + dy + L.h <= H - M;
  for (let step = 20; step <= 900; step += 20) {
    for (const [dx, dy] of [[-step, 0], [step, 0], [0, step / 2], [0, -step / 2]] as const) {
      if (inside(dx, dy) && !hits(dx, dy)) return [dx, dy];
    }
  }
  return null;
}
