/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { lift } from "./column";
import { ARCHIVO_BLACK } from "./fx";
import { splitTitle } from "./glow";
import { rng, SCRIPT } from "./kit";
import { standing } from "./mist";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { titleCase } from "./wall";

const WHITE = "#ffffff";

/** Archivo Black: average capital advance and cap height per 1px of font size (measured). */
const AB_W = 0.82;
const AB_H = 0.688;

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

const capsWidth = (t: string) => [...t].reduce((a, c) => a + (c === " " ? 0.3 : /[IJ1.,'!]/.test(c) ? 0.42 : /[MW]/.test(c) ? 1.08 : AB_W), 0);

/**
 * Beşiktaş "GAME Day": the whole background a blurred crowd / ground in black and white with heavy grain,
 * a giant outlined copy of the word bleeding off the top, the solid white wide word with a handwritten
 * script accent in the club colour sweeping across it, and the player standing whole in (slightly muted)
 * colour in the middle; at mid-height on one side the competition over the two crests, the ground and
 * the kick-off in small white italics under them.
 */
export function Greyday({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 46);
  const infoLeft = params.side === "left";
  const sgn = infoLeft ? -1 : 1;

  // ---- colour: one vivid club colour for the script, readable on grey ----
  // Black-and-white clubs: a black script with a thin white edge, so it reads on the word and on the grey.
  const coloured = (c: string) => hueOf(c) != null && luminance(c) < 0.8 && luminance(c) > 0.015;
  const cands = [params.primary === "#10131c" ? params.accent : params.primary, params.accent].map(vivid);
  const pick = cands.find(coloured);
  const mono = !pick;
  let ink = pick ?? "#121212";
  if (!mono && luminance(ink) < 0.05) ink = shade(ink, 0.35);

  // ---- scene: the ground (or his own photo, blurred), always in black and white ----
  const scene = params.scene ?? data.club?.stadiumImages?.[0] ?? null;
  const own = !scene && !!data.bgPhotoUrl;
  const bg = scene ?? data.bgPhotoUrl ?? data.club?.backdrops?.[0] ?? null;

  // ---- title ----
  const { big, accent } = splitTitle(content.kicker || "MATCHDAY", content.lastName || content.firstName);
  const measure = 800 * (params.textScale ?? 1);
  let size = 232;
  if (capsWidth(big) * size > measure) size = Math.max(110, measure / capsWidth(big));
  const bigW = Math.min(measure, capsWidth(big) * size);
  const capH = size * AB_H;
  const base = 160 + capH;
  const accText = accent ? accent.charAt(0).toUpperCase() + accent.slice(1) : "";
  const accSize = Math.min(205, 640 / Math.max(2, [...accText].length * 0.5));
  // The accent starts left of the middle and sweeps down across the word's lower half, below its baseline.
  const accW = [...accText].length * accSize * 0.5;
  const accX = Math.max(540 - bigW / 2 + 20, 560 - accW / 2 - bigW * 0.04 + r() * 30);
  const accBase = base + accSize * 0.3;
  // Watermark: the same word, much bigger, outlined, bleeding off the canvas.
  const wmSize = Math.min(560, 1500 / Math.max(2, capsWidth(big)));
  const wmBase = 70 + wmSize * AB_H;

  // ---- the player: whole, big, centred (a step away from the info side) ----
  const headTop = base - capH * 0.14 + r() * 16;
  const floor = 1300;
  const framing = params.framing ?? "full";
  const infoEdge = infoLeft ? 60 + 250 : CANVAS_W - 60 - 250;
  const place = (maxFace: number) => {
    let b = standing(data, { cx: 540, headTop, floor, maxFace, framing });
    // Push him off the info column when his body would run into it (never past a third of the width).
    const bodyEdge = infoLeft ? b.left + b.width * 0.18 : b.left + b.width * 0.82;
    const push = Math.max(0, Math.min(190, infoLeft ? infoEdge + 20 - bodyEdge : bodyEdge - (infoEdge - 20)));
    if (push) b = { ...b, left: b.left - sgn * push, faceCx: b.faceCx - sgn * push };
    const over = infoLeft ? infoEdge + 20 - (b.left + b.width * 0.05) : b.left + b.width * 0.95 - (infoEdge - 20);
    return { b, over };
  };
  const first = place(framing === "full" ? 150 : 210);
  let raw = first.b;
  // Wide poses (arms out, a stride) still reaching the column: draw him a little smaller.
  if (first.over > 0) raw = place(raw.faceH * Math.max(0.62, 1 - first.over / (raw.width * 0.5))).b;
  // A whole figure kept small by a low-resolution face stands higher up the pitch rather than far under the title.
  const gap = raw.faceTop - (headTop + raw.faceH * 0.6);
  const rise = raw.feet && gap > 0 ? Math.min(gap, 150) : 0;
  if (rise) raw = { ...raw, top: raw.top - rise, faceTop: raw.faceTop - rise };
  // A face capped by its resolution drops the head: lift it back under the title, the legs dissolving.
  // (A tighter framing may sit a little lower, closer to the camera.)
  const { box, style: fade } = lift(data, raw, framing === "full" ? headTop + raw.faceH * 0.6 : Math.max(headTop + raw.faceH * 0.6, 440));

  // ---- info column ----
  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  let crests: string[] = [];
  let lines: string[] = [];
  let strong = "";
  let label = f.comp;
  if (postType === "matchday") {
    crests = [f.ourCrest, f.oppCrest].filter(Boolean) as string[];
    if (content.home === false) crests.reverse();
    lines = [titleCase(f.venue), f.date ? titleCase(f.date) : ""].filter(Boolean);
    strong = f.time;
  } else if (postType === "result") {
    crests = [content.homeCrest, content.awayCrest].filter(Boolean) as string[];
    strong = score;
    lines = ["Full time", f.round ? titleCase(f.round) : ""].filter(Boolean);
  } else {
    // Goal: home and away crests, in the score's order.
    crests = crestsOf(data);
    strong = score;
    lines = [f.opp ? `vs ${titleCase(f.opp)}` : "", f.round ? titleCase(f.round) : ""].filter(Boolean);
    label = label || (data.club?.name ?? "").toUpperCase();
  }
  const crestS = crests.length > 1 ? 112 : 130;
  // The competition over the crests: one line, or two balanced ones when it is long.
  const lw = (t: string) => t.length * 0.66;
  let labelLines = label ? [label] : [];
  if (label && 250 / lw(label) < 15 && label.includes(" ")) {
    const w = label.split(" ");
    let best = 1;
    for (let i = 1; i < w.length; i++) if (Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length) < Math.abs(w.slice(0, best).join(" ").length - w.slice(best).join(" ").length)) best = i;
    labelLines = [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  }
  const labelSize = Math.min(18, ...labelLines.map((t) => 250 / Math.max(1, lw(t))));
  const colTop = 740 + r() * 40;
  const small: CSSProperties = { fontFamily: SANS, fontStyle: "italic", fontWeight: 500, color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,.6)", lineHeight: 1.3 };
  const fitSmall = (t: string, max: number) => Math.min(max, 250 / Math.max(1, [...t].length * 0.52));
  const number = data.player.number;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#2b2b2b", color: WHITE }}>
      {bg && (
        <img
          src={bg}
          alt=""
          style={{
            position: "absolute",
            left: -80,
            top: -80,
            width: CANVAS_W + 160,
            height: CANVAS_H + 160,
            maxWidth: "none",
            objectFit: "cover",
            filter: `grayscale(1) blur(${own ? 26 : 9}px) contrast(1.12) brightness(${own ? 0.72 : 0.74})`,
          }}
        />
      )}
      {/* Grey grade: lifted mid-tones at the top, a dark pitch at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,.05) 38%, rgba(0,0,0,.08) 60%, rgba(0,0,0,.55) 92%, rgba(0,0,0,.7))" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.45))" }} />

      {/* Watermark word. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0 }}>
        <text x={540 + sgn * 40} y={wmBase} textAnchor="middle" style={{ fontFamily: ARCHIVO_BLACK, fontSize: wmSize }} fill="none" stroke="rgba(255,255,255,.34)" strokeWidth={2.2}>
          {big}
        </text>
      </svg>

      {/* The solid word, then the script across it. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text
          x={540}
          y={base}
          textAnchor="middle"
          textLength={bigW}
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: ARCHIVO_BLACK, fontSize: size, filter: "drop-shadow(0 6px 24px rgba(0,0,0,.35))" }}
          fill="#f4f4f2"
        >
          {big}
        </text>
      </svg>
      {accText && (
        <div
          style={{
            position: "absolute",
            left: accX,
            top: accBase - accSize * 0.95,
            fontFamily: SCRIPT,
            fontSize: accSize,
            lineHeight: 1.2,
            color: ink,
            whiteSpace: "nowrap",
            transform: `rotate(${-8 - r() * 4}deg)`,
            transformOrigin: "left center",
            textShadow: mono ? "none" : "0 3px 14px rgba(0,0,0,.25)",
            ...(mono ? { WebkitTextStroke: "2px rgba(255,255,255,.9)", paintOrder: "stroke fill" } : {}),
            paddingRight: 20,
          }}
        >
          {accText}
        </div>
      )}

      {/* The player, in colour. */}
      {data.photoUrl && (
        <>
          {raw.feet && <div style={{ position: "absolute", left: box.left + box.width * 0.2, width: box.width * 0.6, top: floor - rise - 22, height: 40, borderRadius: "50%", background: "rgba(0,0,0,.5)", filter: "blur(16px)" }} />}
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.35))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "saturate(.8) contrast(1.06)", ...fade }} />
          </div>
        </>
      )}

      {/* Info column: competition, crests, ground and kick-off. */}
      <div style={{ position: "absolute", top: colTop, [infoLeft ? "left" : "right"]: 60, width: 250, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
        {labelLines.map((t, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: labelSize, letterSpacing: "0.06em", lineHeight: 1.2, color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,.5)", marginBottom: i === labelLines.length - 1 ? 6 : -8 }}>
            {t}
          </div>
        ))}
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: "drop-shadow(0 8px 16px rgba(0,0,0,.5))" }} />
            ))}
          </div>
        )}
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {strong && postType !== "matchday" && <div style={{ ...small, fontWeight: 800, fontSize: 44, lineHeight: 1.1, letterSpacing: "0.01em", marginBottom: 4 }}>{strong}</div>}
          {lines.map((t, i) => (
            <div key={i} style={{ ...small, fontSize: fitSmall(t, 22), opacity: i ? 0.85 : 1 }}>
              {t}
            </div>
          ))}
          {strong && postType === "matchday" && <div style={{ ...small, fontWeight: 800, fontSize: 30, letterSpacing: "0.01em", marginTop: 2 }}>{strong}</div>}
        </div>
      </div>

      {/* Foot: agency and the shirt number, small. */}
      <AgencyLogo data={data} height={34} style={{ position: "absolute", bottom: 52, [infoLeft ? "right" : "left"]: 60, opacity: 0.9, maxWidth: 170 }} />
      {number && (
        <div style={{ position: "absolute", bottom: 50, [infoLeft ? "left" : "right"]: 60, fontFamily: ARCHIVO_BLACK, fontSize: 40, lineHeight: 1, color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,.75)" }}>
          {number}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}
