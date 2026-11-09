/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const BAR = "#0a0a0b";
const INK = "#f1eee7";

/** Club names exactly as stored (only spaces tidied). */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/**
 * Goal widescreen: a film still. A 2.39:1 band across the middle holds the celebrating player over his
 * own photo, softly out of focus and graded; his head and raised fists may break out above the band into
 * the near-black letterbox. Upper bar: "GOAL", tiny and widely spaced. Lower bar: one subtitle line —
 * "Moisés Conceição — SC Vianense SAD v USC Paredes" — and the agency logo at the foot.
 */
export function Goalwidescreen({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const ts = params.textScale ?? 1;

  /* ---- the band: 2.39:1, full width ---- */
  // Story: a taller band (like widescreen) so the frame fills the canvas instead of floating in black.
  const bandH = story ? 860 : Math.round(CANVAS_W / 2.39);
  const bandTop = story ? 500 : 476;
  const bandBottom = bandTop + bandH;

  /* ---- the player: face high in the band, head and fists free to break above it ---- */
  const sizes = story ? { chest: 230, waist: 200, knees: 160, full: 130 } : { chest: 136, waist: 118, knees: 96, full: 80 };
  const faceX = 540 + (params.side === "left" ? -130 : params.side === "right" ? 130 : 0);
  let box = placeByFace(data, faceX, bandTop + (story ? 14 : 8), sizes);
  // A fist raised to one side: centre the figure a little rather than the face.
  if (!params.side) {
    const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
    box = { ...box, left: box.left + lean };
  }
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = box.top + face[1] * box.height;
  // What breaks out above the band fades into the bar well before the title (never over the head).
  const headTop = faceTop - box.faceH * 0.7;
  const fadeEnd = Math.min(headTop - 20, bandTop - 40);
  const fadeStart = fadeEnd - (story ? 200 : 150);
  const fade = `linear-gradient(to bottom, transparent ${fadeStart}px, #000 ${fadeEnd}px)`;

  /* ---- type ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase();
  const f = matchFacts(data);
  const ours = clean(data.club?.name ?? "");
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) !== lc(ours));
  const them = clean(typed ?? titleCase(f.opp ?? ""));
  const teams = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teams.join(" v ");
  const line = [name, fixture].filter(Boolean).join("  —  ");
  const plainLen = line.normalize("NFD").replace(/\p{M}/gu, "").length;
  const subSize = Math.max(16 * k, Math.min(30 * k * ts, (story ? 940 : 920) / Math.max(1, plainLen * 0.5)));
  const kickSize = 15 * k * ts;

  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  // Story: the subtitle sits ~64px above the 88px logo (STORY_BOTTOM − 88), not floating under the band.
  const subTop = (story ? STORY_BOTTOM - 88 - 64 - Math.round(subSize * 1.25) : bandBottom + 66) + (params.textY ?? 0);
  const kickTop = (story ? STORY_TOP + 40 : 132) + (params.textY ?? 0);

  const own = data.bgPhotoUrl ?? sceneOf(data);
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.62em", paddingLeft: "0.62em", whiteSpace: "nowrap", lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: BAR, color: INK }}>
      {/* The band: his own photo, out of focus and lightly graded, with a soft vignette. */}
      <div style={{ position: "absolute", left: 0, top: bandTop, width: CANVAS_W, height: bandH, overflow: "hidden", background: "#16181c" }}>
        {own && (
          <img
            src={own}
            alt=""
            style={{ position: "absolute", left: -80, top: -80, width: CANVAS_W + 160, height: bandH + 160, maxWidth: "none", objectFit: "cover", objectPosition: "50% 30%", filter: "blur(22px) saturate(.8) brightness(.72) contrast(1.05)" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(20,60,80,.22), rgba(0,0,0,0) 45%, rgba(120,70,20,.14))" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 120% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.5))" }} />
      </div>

      {/* The player: clipped at the band's lower edge, free above it (fading into the bar). */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: bandBottom, overflow: "hidden", WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: bandBottom - box.faceH * 1.2, width: box.width * 0.64, height: box.faceH * 2.4, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(50px)" }} />
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(.96)", ...cutMask(data.cut) }}
          />
        </div>
      )}
      {/* The lower edge of the frame: a hairline of shadow so the cut reads as the film's edge. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bandBottom - 26, height: 26, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />

      {/* Upper bar: the title, tiny and spaced. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: kickTop, textAlign: "center", ...caps, fontSize: kickSize, opacity: 0.88 }}>{kicker}</div>

      {/* Lower bar: the subtitle. */}
      {line && (
        <div style={{ position: "absolute", left: 48, right: 48, top: subTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: subSize, lineHeight: 1.2, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{line}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.24} />
    </div>
  );
}
