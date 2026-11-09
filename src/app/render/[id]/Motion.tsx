"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    /** Set by the video exporter: jump every animation to time `ms`. */
    __seek?: (ms: number) => void;
    __motionReady?: boolean;
    __motionDuration?: number;
  }
}

const EASE = "cubic-bezier(.2,.8,.2,1)";
const TOTAL = 3000;

/** The template's own root: walk down single-child wrappers (finish filters etc.). */
function layerRoot(el: Element): Element {
  let cur = el;
  while (cur.children.length === 1 && cur.firstElementChild) cur = cur.firstElementChild;
  return cur;
}

const isCutout = (el: Element) =>
  (el instanceof HTMLImageElement && el.src.includes("_cutout")) || !!el.querySelector?.('img[src*="_cutout"]') || (el as HTMLElement).style?.maskImage?.includes("_cutout");

const coversCanvas = (el: Element, root: Element) => {
  const a = el.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  return a.width >= b.width * 0.9 && a.height >= b.height * 0.9;
};

/**
 * Builds a 3-second motion-design intro for any look, from its layers:
 * background eases in with a slow push, graphic layers reveal in a stagger, the player rises in last,
 * then everything settles with a gentle zoom. The timeline is paused and driven by `window.__seek`
 * so every exported frame is exact.
 */
export function Motion() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((img) => (img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true })))),
      );
      if (cancelled) return;
      const post = document.getElementById("post");
      if (!post) return;
      // With a colour finish the look sits inside the filtered wrapper.
      const root = layerRoot(post.querySelector("[data-finish]") ?? post);
      const layers = Array.from(root.children);
      let textIndex = 0;

      // Whole post: settle from a slight zoom.
      post.animate([{ transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: TOTAL, easing: "cubic-bezier(.25,.1,.25,1)", fill: "both" });

      // Opacity is animated up to each layer's own opacity; movement is *added* to its own transform.
      const reveal = (el: HTMLElement, move: string, blur: number, delay: number, duration: number) => {
        const opacity = getComputedStyle(el).opacity;
        el.animate([{ opacity: 0 }, { opacity }], { delay, duration: duration * 0.6, easing: "ease-out", fill: "both" });
        el.animate(
          [
            { transform: move, filter: `blur(${blur}px)` },
            { transform: "translate(0,0) scale(1)", filter: "blur(0px)" },
          ],
          { delay, duration, easing: EASE, fill: "both", composite: "add" },
        );
      };

      layers.forEach((layer, i) => {
        const el = layer as HTMLElement;
        if (isCutout(el)) {
          reveal(el, "translateY(90px) scale(1.04)", 8, 520, 1100);
        } else if (i < 3 && coversCanvas(el, root)) {
          const opacity = getComputedStyle(el).opacity;
          el.animate([{ opacity: 0 }, { opacity }], { duration: 500, easing: "linear", fill: "both" });
        } else {
          reveal(el, textIndex % 2 === 0 ? "translateX(-60px)" : "translateY(50px)", 10, 250 + textIndex * 110, 800);
          textIndex++;
        }
      });

      const all = document.getAnimations();
      all.forEach((a) => a.pause());
      window.__seek = (ms: number) => all.forEach((a) => (a.currentTime = ms));
      window.__motionDuration = TOTAL;
      window.__seek(0);
      window.__motionReady = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
