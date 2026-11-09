/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, type Box } from "./fx";
import { AgencyLogo, SANS, ringSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const INK = "#24221f";
const SOFT = "#77726b";
const WALL_TOP = "#efece7";
const WALL_LOW = "#e6e2dc";
const FLOOR = "#d6d0c7";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** DM Serif Display (upright): rough advance per glyph in ems. */
const dmEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.24 : /[A-Z]/.test(c) ? 0.66 : /[il]/.test(c) ? 0.28 : /[mw]/.test(c) ? 0.82 : 0.52), 0);
/** Inter 400–500, rough advance per glyph in ems. */
const interEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[A-Z]/.test(c) ? 0.68 : /[il·]/.test(c) ? 0.26 : /[mw]/.test(c) ? 0.86 : 0.56), 0);

/** "TEAM OF THE WEEK" → "Team of the Week", "XI OF THE WEEK" → "XI of the Week". */
export function titleOf(kicker: string): string {
  const words = (kicker || "Team of the week").replace(/’/g, "'").trim().split(/\s+/);
  return words
    .map((w, i) => {
      if (/^[IVXL]+$/i.test(w) && w.length <= 4 && i === 0) return w.toUpperCase();
      const l = w.toLowerCase();
      if (i > 0 && /^(of|the|and|a)$/.test(l)) return l;
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(" ");
}

/**
 * The official league graphic with the player's circle ringed. The wrapper shrinks to the image, so the
 * highlight percentages land on the same spot as in the editor (as ContentBlock in shared.tsx does).
 */
function LeagueGraphic({ data, maxW, maxH, ring }: { data: RenderData; maxW: number; maxH: number; ring: string }) {
  const { insetUrl, content } = data;
  if (!insetUrl) {
    const h = Math.min(maxH, maxW / 0.69);
    return (
      <div style={{ width: h * 0.69, height: h, border: "3px dashed rgba(36,34,31,.35)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(36,34,31,.55)", padding: 30 }}>
        Official league graphic
      </div>
    );
  }
  const hl = content.insetHighlight;
  const bw = Math.max(4, Math.round(maxW * 0.01));
  return (
    <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom" }}>
      <img src={insetUrl} alt="" style={{ maxWidth: maxW, maxHeight: maxH, display: "block" }} />
      {hl && (
        <div
          style={{
            position: "absolute",
            left: `${hl.x}%`,
            top: `${hl.y}%`,
            width: ringSize(hl, "19%"),
            boxSizing: "border-box",
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `${bw}px solid ${ring}`,
            boxShadow: `0 0 ${bw * 6}px ${bw}px color-mix(in srgb, ${ring} 70%, transparent), inset 0 0 ${bw * 4}px color-mix(in srgb, ${ring} 45%, transparent)`,
          }}
        />
      )}
    </div>
  );
}

/** gallery.tsx's standing figure: feet on the floor, or a cropped figure reaching the bottom edge. */
function standingTo(data: RenderData, o: { cx: number; headTop: number; floor: number; maxFace?: number }, bottomEdge: number): Box & { feet: boolean; faceCx: number; faceTop: number; faceH: number } {
  const p = data.params;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  const framing = p.framing ?? "full";
  const depth: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  let h: number;
  let top: number;
  let feet = false;
  if (!cutBottom && framing === "full") {
    h = (o.floor - o.headTop) / (1 - hair);
    top = o.headTop - hair * h;
    feet = true;
  } else {
    const crop = Math.min(1, depth[framing] ? face[1] + face[3] * depth[framing] : 1);
    const bottom = crop >= 1 && cutBottom ? bottomEdge + 22 : bottomEdge;
    h = (bottom - o.headTop) / Math.max(0.2, crop - hair);
    top = o.headTop - hair * h;
  }
  const cap = Math.min(o.maxFace ?? 400, data.facePx > 0 ? data.facePx * 2.1 : 400);
  const edge = (y: number) => (feet ? y + h : bottomEdge);
  const resize = (nh: number) => {
    const b = edge(top);
    const frac = (b - top) / h;
    top = b - frac * nh;
    h = nh;
  };
  if (h * face[3] > cap) resize(cap / face[3]);
  if ((p.playerScale ?? 1) !== 1) resize(h * (p.playerScale ?? 1));
  const w = h * aspect;
  const fx = data.face ? face[0] + face[2] / 2 : 0.5;
  const left = o.cx - fx * w + (p.playerX ?? 0);
  top += p.playerY ?? 0;
  return { left, top, width: w, height: h, feet, faceCx: left + (face[0] + face[2] / 2) * w, faceTop: top + face[1] * h, faceH: face[3] * h };
}

/**
 * Team of the Week, hung in a gallery: the official league graphic framed like a print — a thin dark frame,
 * a white passe-partout, a soft wall shadow — on a pale wall, his circle ringed in club colour. The player
 * stands beside it on the gallery floor in natural colour, and a small museum label under the frame carries
 * the only type: his name, "Team of the Week" and the round.
 */
export function Totwgallery({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  let ring = vivid(params.accent === "#ffffff" ? params.primary : params.accent);
  if (luminance(ring) > 0.75) ring = vivid(params.primary);
  if (luminance(ring) < 0.04) ring = shade(ring, 0.4);
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.6) club = vivid(params.accent);

  /* ---- the floor line and the player ---- */
  const floorLine = story ? 1500 : 1150;
  const stand = (cx: number) => standingTo(data, { cx, headTop: story ? 520 : 250, floor: story ? 1610 : 1262, maxFace: story ? 240 : 210 }, H);
  let box = stand(right ? 848 : CANVAS_W - 848);
  // Keep his whole figure (raised fists too) on the canvas.
  if (right && box.left + box.width > CANVAS_W - 14) box = stand(848 - (box.left + box.width - (CANVAS_W - 14)));
  if (!right && box.left < 14) box = stand(CANVAS_W - 848 + (14 - box.left));
  const floorY = box.top + box.height;

  /* ---- the framed graphic, with the label under it ---- */
  const MARGIN = story ? 64 : 72;
  const mat = Math.round(28 * (story ? 1.15 : 1));
  const rim = 5;
  // Beside him: the frame runs up to his outline (a hand may just overlap the frame's edge).
  const bodyEdge = right ? box.left + box.width * 0.06 : CANVAS_W - (box.left + box.width * 0.94);
  const gMaxW = Math.max(400, Math.min(story ? 600 : 540, bodyEdge - MARGIN - 2 * (mat + rim)));
  const gMaxH = story ? 900 : 740;
  // Story: frame and label centred on the wall between STORY_TOP and the floor (graphic assumed ~0.69 wide).
  const estH = Math.min(gMaxH, gMaxW / 0.69) + 2 * (mat + rim) + 64 + 180;
  const frameTop = (story ? Math.max(STORY_TOP + 20, STORY_TOP + (floorLine - 40 - STORY_TOP - estH) / 2) : 108) + (params.textY ?? 0);

  /* ---- label ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const title = titleOf(content.kicker);
  const sub = content.subline.trim();
  const labelW = story ? 520 : 420;
  const nameSize = Math.min(34 * S, (labelW - 56) / Math.max(1, dmEm(name))) * ts;
  const subSize = Math.max(13, Math.min(17 * S, (labelW - 56) / Math.max(1, interEm(sub)))) * ts;

  const side: CSSProperties = right ? { left: MARGIN } : { right: MARGIN };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: WALL_LOW, color: INK }}>
      {/* The wall, lit from above, and the floor. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: floorLine, background: `linear-gradient(to bottom, ${WALL_TOP}, ${WALL_LOW})` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 40% at ${right ? 30 : 70}% 28%, rgba(255,255,255,.7), transparent 72%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: floorLine, bottom: 0, background: `linear-gradient(to bottom, ${shade(FLOOR, -0.04)}, ${FLOOR} 30%, ${shade(FLOOR, 0.05)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: floorLine - 1, height: 2, background: "rgba(60,50,40,.12)" }} />
      <div style={{ position: "absolute", inset: 0, background: club, opacity: 0.04, mixBlendMode: "color" }} />

      {/* The print and its label. */}
      <div style={{ position: "absolute", top: frameTop, ...side, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        <div
          style={{
            padding: mat,
            background: "#fbfaf8",
            border: `${rim}px solid #2b2825`,
            boxShadow: "0 2px 3px rgba(40,30,20,.18), 0 26px 50px -10px rgba(40,30,20,.32), 0 60px 90px -30px rgba(40,30,20,.22)",
            lineHeight: 0,
          }}
        >
          {/* A hair of bevel inside the mat. */}
          <div style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.08), inset 0 0 0 1px rgba(0,0,0,.05)" }}>
            <LeagueGraphic data={data} maxW={gMaxW} maxH={gMaxH} ring={ring} />
          </div>
        </div>

        <div
          style={{
            marginTop: story ? 64 : 46,
            width: labelW,
            padding: story ? "26px 30px 28px" : "20px 26px 22px",
            background: "#fbfaf8",
            boxShadow: "0 1px 2px rgba(40,30,20,.14), 0 8px 18px -6px rgba(40,30,20,.16)",
          }}
        >
          <div style={{ fontFamily: DMSERIF, fontSize: nameSize, lineHeight: 1.05, whiteSpace: "nowrap", color: INK }}>{name}</div>
          <div style={{ marginTop: 10 * S, fontFamily: SANS, fontWeight: 500, fontSize: 18 * S * ts, lineHeight: 1.2, color: INK, display: "flex", alignItems: "center", gap: 10 * S }}>
            <span style={{ width: 9 * S, height: 9 * S, borderRadius: "50%", background: ring, display: "inline-block" }} />
            {title}
          </div>
          {sub && <div style={{ marginTop: 6 * S, fontFamily: SANS, fontWeight: 400, fontSize: subSize, lineHeight: 1.25, color: SOFT, whiteSpace: "nowrap" }}>{sub}</div>}
        </div>
      </div>

      {/* Contact shadow, then the player in natural colour. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 230 * S, top: floorY - 26 * S, width: 460 * S, height: 52 * S, borderRadius: "50%", background: "rgba(40,32,24,.28)", filter: "blur(22px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 140 * S, top: floorY - 10 * S, width: 280 * S, height: 20 * S, borderRadius: "50%", background: "rgba(30,24,18,.42)", filter: "blur(8px)" }} />
        </>
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}
      {data.photoUrl && !box.feet && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 360 : 220, background: `linear-gradient(to bottom, ${FLOOR}00, ${FLOOR}e0 55%, ${FLOOR})` }} />
      )}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", ...side, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
    </div>
  );
}
