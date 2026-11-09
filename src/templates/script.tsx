/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure, HeadLayer } from "./fx";
import { matchInfo, rng, SCRIPT } from "./kit";
import { AgencyLogo, Crest, DISPLAY, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Block title in club colour behind the player's head, a white handwritten line sweeping across it,
 * blurred stadium behind (Ohio State "Wake Up It's Game Day", Cotton Bowl).
 */
export function Script({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 11);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const scenes = [...(data.club?.stadiumImages ?? []), ...(data.club?.cityImages ?? [])];
  const scene = scenes.length ? scenes[Math.floor(r() * scenes.length)] : data.bgPhotoUrl;
  const outline = r() < 0.35;
  const tilt = -8 - r() * 8;

  // Block: the title's words stacked in at most two lines, as big as the width allows.
  const words = content.kicker.toUpperCase().split(/\s+/).filter(Boolean);
  const lines = words.length > 2 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : words.length === 2 && words.join(" ").length > 9 ? words : [words.join(" ")];
  const longest = Math.max(...lines.map((l) => [...l].length));
  const size = Math.min(lines.length > 1 ? 300 : 380, 960 / (longest * 0.47));
  const blockTop = 170;
  const blockH = size * 0.9 * lines.length;
  // Anton is condensed: stretch it a little taller when there is room.
  const stretch = Math.min(1.35, 560 / blockH);

  const box = figureBox(data, 540, 0, 1060);
  const scriptText = content.firstName || content.lastName;
  const scriptSize = Math.min(190, 900 / Math.max(3, scriptText.length * 0.5));
  const info = matchInfo(data);
  // The name crosses the lower title, unless the face is there: then it passes just under the chin.
  let scriptTop = blockTop + blockH * stretch * 0.62;
  if (data.face) {
    const faceTop = box.top + box.height * data.face[1];
    const faceBottom = faceTop + box.height * data.face[3];
    if (scriptTop + scriptSize * 0.8 > faceTop && scriptTop < faceBottom) scriptTop = faceBottom + 10;
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(accent, -0.7), color: "#fff" }}>
      {scene && <img src={scene} alt="" style={{ position: "absolute", inset: -40, width: CANVAS_W + 80, height: CANVAS_H + 80, objectFit: "cover", filter: "blur(14px) saturate(.7) brightness(.55)" }} />}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(accent, -0.55)}cc, ${shade(accent, -0.75)}99 50%, ${shade(accent, -0.8)} 100%)` }} />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: blockTop,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: 0.9,
          whiteSpace: "nowrap",
          transform: `scaleY(${stretch})`,
          transformOrigin: "50% 0",
          color: outline ? "transparent" : accent,
          WebkitTextStroke: outline ? `4px ${accent}` : undefined,
          textShadow: outline ? undefined : `0 10px 40px ${shade(accent, -0.7)}`,
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      <GradedFigure data={data} box={box} grade={accent} gradeStrength={0.16} rim={shade(accent, 0.3)} />
      <HeadLayer data={data} box={box} />

      {/* Handwritten name across the block, in front of the player, low on the title so the face stays clear. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scriptTop,
          textAlign: "center",
          fontFamily: SCRIPT,
          fontSize: scriptSize,
          lineHeight: 1,
          color: "#fff",
          transform: `rotate(${tilt}deg)`,
          textShadow: "0 4px 18px rgba(0,0,0,.35)",
          whiteSpace: "nowrap",
        }}
      >
        {scriptText}
      </div>

      <Crest club={data.club} size={84} style={{ position: "absolute", top: 50, left: CANVAS_W / 2 - 42 }} />
      <AgencyLogo data={data} height={28} style={{ position: "absolute", top: 76, right: 60 }} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 54, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: "0.16em", textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>
        <span>{content.lastName}</span>
        <span style={{ fontWeight: 500, fontSize: Math.min(18, 600 / Math.max(1, (info.when || content.subline).length * 0.75)) }}>{info.when || content.subline}</span>
      </div>
      <Film strength={0.8} />
    </div>
  );
}
