"use client";

import { useEffect, useRef, useState } from "react";
import { EditCanvas } from "@/templates";
import { CANVAS_H, CANVAS_W, type RenderData } from "@/templates/types";

/** The 1080×1350 canvas scaled to fill its container's width. */
export function Preview({ data }: { data: RenderData }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / CANVAS_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}>
      {scale > 0 && (
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
          <EditCanvas data={data} />
        </div>
      )}
    </div>
  );
}
