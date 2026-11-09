/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { AgencyLogo, CONDENSED, Crest } from "./shared";
import { CANVAS_W, type RenderData } from "./types";
import { TITLE_FONTS, type TitleFont } from "@/lib/types";

/**
 * Video stories (post type "clip"): the play runs as a small video that follows the ball, inside the
 * element #clip-slot. Here the slot shows the clip's first frame (the preview); on export ffmpeg lays the
 * ball-following video exactly over that rectangle (lib/clips/export.ts reads its box), so nothing may be
 * drawn over the slot. Words inside the graphic are English (GOAL / ASSIST), like every edit.
 */

const BODONI = "var(--font-bodoni), 'Didot', serif";

function Slot({ data, x, y, w, h, style }: { data: RenderData; x: number; y: number; w: number; h: number; style?: CSSProperties }) {
  const id = data.params.clipId;
  return (
    <div id="clip-slot" style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", background: "#000", ...style }}>
      {id && <img src={`/api/files/clips/${id}/poster.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </div>
  );
}

const words = (data: RenderData) => ({
  kicker: (data.content.kicker || (data.content.clip?.kind === "assist" ? "ASSIST" : "GOAL")).toUpperCase(),
  name: [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase(),
  score: data.content.clip?.score ?? "",
});

/** Fits a single line of condensed caps into maxW (rough advance per character). */
const fit = (text: string, size: number, maxW: number, adv = 0.5) => Math.min(size, maxW / Math.max(1, text.length * adv));

/** The big words' typeface: the one picked in the editor, else the look's own. */
function titleFont(data: RenderData, own: TitleFont) {
  const f = TITLE_FONTS.find((t) => t.id === (data.params.font ?? own)) ?? TITLE_FONTS[0];
  return { fontFamily: f.family, fontWeight: f.weight, adv: f.adv };
}

/** Fine grain instead of hairline patterns: it hides banding in the gradients and survives video compression. */
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E")`;
/** The agency mark in the video looks: smaller than in the photo stories (the video is the hero), × the editor's size. */
const logoScale = (data: RenderData) => 0.72 * (data.params.logoScale ?? 1);

const Grain = ({ opacity = 0.07 }: { opacity?: number }) => <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity, mixBlendMode: "overlay" }} />;

/** Night: the club colour taken down to night tones, the word huge on top, the video in the middle, crest + name + score under it. */
export function Clipnight({ data }: { data: RenderData }) {
  const H = data.canvasH ?? 1920;
  const { kicker, name, score } = words(data);
  const slotW = 960;
  const slotH = 540;
  const slotY = Math.round(H * 0.33);
  const { adv, ...font } = titleFont(data, "anton");
  const k = fit(kicker, 290, 900, adv);
  const c = data.params.primary || "#18215a";
  const night = `radial-gradient(120% 60% at 50% 38%, color-mix(in srgb, ${c} 62%, #000) 0%, color-mix(in srgb, ${c} 30%, #000) 55%, color-mix(in srgb, ${c} 12%, #000) 100%)`;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: night, color: "#fff" }}>
      <Grain />
      <div style={{ position: "absolute", left: 0, right: 0, top: slotY - 80 - k * 0.92, textAlign: "center", ...font, fontSize: k, lineHeight: 1, letterSpacing: "0.01em" }}>{kicker}</div>
      <Slot data={data} x={(CANVAS_W - slotW) / 2} y={slotY} w={slotW} h={slotH} />
      <div style={{ position: "absolute", left: 0, right: 0, top: slotY + slotH + 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <Crest club={data.club} size={120} />
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fit(name, 76, 900, 0.46), lineHeight: 1, letterSpacing: "0.02em" }}>{name}</div>
        {score && <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 56, lineHeight: 1, opacity: 0.92 }}>{score}</div>}
      </div>
      <AgencyLogo data={data} height={44} style={{ position: "absolute", left: "50%", bottom: H - 1680, transform: `translateX(-50%) scale(${logoScale(data)})`, transformOrigin: "center bottom" }} />
    </div>
  );
}

/** Club: the club colour as ground, the word big top-left, the video full width, name + score bottom-left. */
export function Clipclub({ data }: { data: RenderData }) {
  const H = data.canvasH ?? 1920;
  const { kicker, name, score } = words(data);
  const primary = data.params.primary || "#12406b";
  const accent = data.params.accent || "#ffffff";
  const slotH = 608;
  const slotY = Math.round(H * 0.34);
  const { adv, ...font } = titleFont(data, "anton");
  const k = fit(kicker, 330, 960, adv);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: primary, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.45))" }} />
      <Grain />
      <div style={{ position: "absolute", left: 60, top: slotY - 90 - k * 0.92, ...font, fontSize: k, lineHeight: 1 }}>{kicker}</div>
      <div style={{ position: "absolute", left: 64, top: slotY - 40, width: 120, height: 8, background: accent }} />
      <Slot data={data} x={0} y={slotY} w={CANVAS_W} h={slotH} />
      <div style={{ position: "absolute", left: 64, top: slotY + slotH + 70, right: 260 }}>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fit(name, 92, 760, 0.46), lineHeight: 1 }}>{name}</div>
        {score && <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 64, lineHeight: 1, marginTop: 18, color: accent }}>{score}</div>}
      </div>
      <Crest club={data.club} size={170} style={{ position: "absolute", right: 64, top: slotY + slotH + 60 }} />
      <AgencyLogo data={data} height={44} style={{ position: "absolute", left: 64, bottom: H - 1680, transform: `scale(${logoScale(data)})`, transformOrigin: "left bottom" }} />
    </div>
  );
}

/** Paper: off-white editorial ground, the word in Bodoni, the video framed by a hairline, text in ink. */
export function Clippaper({ data }: { data: RenderData }) {
  const H = data.canvasH ?? 1920;
  const { kicker, name, score } = words(data);
  const slotW = 960;
  const slotH = 540;
  const slotY = Math.round(H * 0.37);
  const word = kicker.charAt(0) + kicker.slice(1).toLowerCase();
  // Bodoni italic is the look's own; a picked typeface replaces it (upright, fitted to the width).
  const picked = data.params.font ? titleFont(data, "bodoni") : null;
  const wordStyle: CSSProperties = picked
    ? { fontFamily: picked.fontFamily, fontWeight: picked.fontWeight, fontSize: fit(word + ".", 250, 960, picked.adv * 0.85) }
    : { fontFamily: BODONI, fontWeight: 600, fontStyle: "italic", fontSize: 250 };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#f2eee6", color: "#141414" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: slotY - 330, textAlign: "center", ...wordStyle, lineHeight: 1 }}>{word}.</div>
      <div style={{ position: "absolute", left: (CANVAS_W - slotW) / 2 - 14, top: slotY - 14, width: slotW + 28, height: slotH + 28, border: "2px solid #141414" }} />
      <Slot data={data} x={(CANVAS_W - slotW) / 2} y={slotY} w={slotW} h={slotH} />
      <div style={{ position: "absolute", left: 60, right: 60, top: slotY + slotH + 90, display: "flex", alignItems: "center", gap: 36 }}>
        <Crest club={data.club} size={130} />
        <div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fit(name, 72, 720, 0.46), lineHeight: 1, letterSpacing: "0.03em" }}>{name}</div>
          {score && <div style={{ fontFamily: BODONI, fontWeight: 500, fontSize: 60, lineHeight: 1, marginTop: 14 }}>{score}</div>}
        </div>
      </div>
      <AgencyLogo data={data} height={40} onLight style={{ position: "absolute", left: "50%", bottom: H - 1680, transform: `translateX(-50%) scale(${logoScale(data)})`, transformOrigin: "center bottom" }} />
    </div>
  );
}

/**
 * Bold: the club colour full bleed (deepened at the foot, fine grain), the crest and the club's name at the
 * top, the word huge over a full-width video sitting on a hairline of the accent; the first name small and
 * the surname big in the picked typeface (mixed scale), the score in an accent tab.
 */
export function Clipbold({ data }: { data: RenderData }) {
  const H = data.canvasH ?? 1920;
  const { kicker, score } = words(data);
  const primary = data.params.primary || "#c8102e";
  const accent = data.params.accent || "#ffffff";
  const ink = data.params.text || "#ffffff";
  const { adv, ...font } = titleFont(data, "bodoni");
  const slotH = 608;
  const slotY = Math.round(H * 0.33);
  const k = fit(kicker, 330, 952, adv);
  const first = (data.content.firstName ?? "").toUpperCase();
  const last = (data.content.lastName ?? "").toUpperCase();
  const s = fit(last, 170, 952, adv);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: primary, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 45% at 30% 18%, rgba(255,255,255,.16), transparent 70%), linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.38) 100%)" }} />
      <Grain opacity={0.09} />
      <div style={{ position: "absolute", left: 64, right: 64, top: 150, display: "flex", alignItems: "center", gap: 22 }}>
        <Crest club={data.club} size={92} />
        <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 34, letterSpacing: "0.2em", lineHeight: 1 }}>{(data.club?.name ?? "").toUpperCase()}</div>
      </div>
      <div style={{ position: "absolute", left: 60, top: slotY - 48 - k * 0.8, ...font, fontSize: k, lineHeight: 0.8, letterSpacing: "-0.01em" }}>{kicker}</div>
      <Slot data={data} x={0} y={slotY} w={CANVAS_W} h={slotH} />
      <div style={{ position: "absolute", left: 0, top: slotY + slotH, width: CANVAS_W, height: 10, background: accent }} />
      <div style={{ position: "absolute", left: 64, right: 64, top: slotY + slotH + 60 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 74 }}>
          <div style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: 46, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.92 }}>{first}</div>
          {score && (
            <div style={{ padding: "12px 26px 10px", background: accent, color: primary, fontFamily: CONDENSED, fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: "0.04em" }}>{score}</div>
          )}
        </div>
        <div style={{ ...font, fontSize: s, lineHeight: 0.9, marginTop: 12 }}>{last}</div>
      </div>
      <AgencyLogo data={data} height={44} style={{ position: "absolute", left: 64, bottom: H - 1700, transform: `scale(${logoScale(data)})`, transformOrigin: "left bottom" }} />
    </div>
  );
}
