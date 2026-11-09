/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS, ringSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** DM Serif Display italic: rough advance per glyph in ems. */
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.22 : /[A-Z]/.test(c) ? 0.62 : /[ilj]/.test(c) ? 0.28 : /[mw]/.test(c) ? 0.8 : 0.5), 0);
/** Inter 500 caps with tracking. */
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[IJ·]/.test(c) ? 0.36 : c === "M" || c === "W" ? 0.95 : 0.7) + tracking, 0);

/** "TEAM OF THE WEEK" → "Team of the Week", "XI OF THE WEEK" → "XI of the Week". */
function titleOf(kicker: string): string {
  const words = (kicker || "Team of the week").replace(/’/g, "'").trim().split(/\s+/);
  return words
    .map((w, i) => {
      if (i === 0 && /^[IVXL]{1,4}$/i.test(w)) return w.toUpperCase();
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
function LeagueGraphic({ data, maxW, maxH, ring, radius }: { data: RenderData; maxW: number; maxH: number; ring: string; radius: number }) {
  const { insetUrl, content } = data;
  if (!insetUrl) {
    const h = Math.min(maxH, maxW / 0.69);
    return (
      <div style={{ width: h * 0.69, height: h, borderRadius: radius, border: "3px dashed rgba(255,255,255,.5)", background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(255,255,255,.7)", padding: 30 }}>
        Official league graphic
      </div>
    );
  }
  const hl = content.insetHighlight;
  const bw = Math.max(4, Math.round(maxW * 0.01));
  return (
    <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom", borderRadius: radius, overflow: "hidden" }}>
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
            boxShadow: `0 0 ${bw * 6}px ${bw}px color-mix(in srgb, ${ring} 75%, transparent), inset 0 0 ${bw * 4}px color-mix(in srgb, ${ring} 45%, transparent)`,
          }}
        />
      )}
    </div>
  );
}

/**
 * Team of the Week, as a card: a calm ground in soft club tones (his own photo melted to colour, as in
 * serene), the player large in natural colour, and the official league graphic laid over his side as a
 * slightly tilted card with rounded corners and a soft shadow pooling under its lower corner — his circle
 * ringed. Only a tiny title and his name above.
 */
export function Totwcard({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.35 : 1;
  const ts = params.textScale ?? 1;
  // The card sits on the side away from his face; params.side says where he stands.
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  let ring = vivid(params.accent === "#ffffff" ? params.primary : params.accent);
  if (luminance(ring) < 0.06) ring = shade(ring, 0.45);
  // A ring the colour of the purple-ish league graphic would vanish: lift dark rings to white-ish.
  if (luminance(ring) < 0.12) ring = "#ffffff";

  /* ---- type, top left (or right) ---- */
  const MARGIN = story ? 72 : 64;
  const title = titleOf(content.kicker);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const sub = content.subline.trim();
  const topY = (story ? STORY_TOP : 64) + (params.textY ?? 0);
  const tSize = Math.min(54 * S, (story ? 620 : 470) / Math.max(1, dmiEm(title))) * ts;
  const NAME_T = 0.22;
  const nSize = Math.max(13, Math.min(17 * S, (story ? 620 : 470) / Math.max(1, capsEm(name, NAME_T)))) * ts;
  const subSize = Math.max(12, Math.min(15 * S, (story ? 620 : 470) / Math.max(1, capsEm(sub, 0.16)))) * ts;
  const typeBottom = topY + tSize * 1.1 + 18 * S + nSize * 1.3 + (sub ? 10 * S + subSize * 1.3 : 0);

  /* ---- the player, large, on his side ---- */
  const faceX = right ? (story ? 680 : 690) : CANVAS_W - (story ? 680 : 690);
  const faceTop = story ? Math.max(typeBottom + 90, 470) : Math.max(typeBottom * 0.55 + 120, 250);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 360, waist: 300, knees: 240, full: 190 } : { chest: 270, waist: 220, knees: 175, full: 140 });
  const faceH = box.faceH;
  const faceBottom = faceTop + faceH;

  /* ---- the card: over his other side, below his face ---- */
  const gMaxW = story ? 570 : 470;
  const gMaxH = story ? 880 : 690;
  const radius = story ? 26 : 20;
  const tilt = (right ? -1 : 1) * 4.5;
  // The agency logo sits under the card, ~60px below its lowest corner.
  const cardBottom = (story ? STORY_BOTTOM - 88 - 64 : 1350 - 56 - 52 - 64) + (params.logoY ?? 0) * 0;
  const cardSide = story ? 84 : 80;
  // Never above his chin.
  const cardMaxH = Math.min(gMaxH, cardBottom - (faceBottom + 40));

  const own = data.bgPhotoUrl;
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.3)" };
  const side: CSSProperties = right ? { left: MARGIN } : { right: MARGIN };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.5), color: WHITE }}>
      {/* The ground: his photo melted to soft colour, washed in the club tone. */}
      {own && (
        <img src={own} alt="" style={{ position: "absolute", left: -160, top: -160, width: CANVAS_W + 320, height: H + 320, maxWidth: "none", objectFit: "cover", filter: "blur(60px) saturate(.6) brightness(.95)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(club, 0.18)} 0%, ${club} 45%, ${shade(club, -0.45)} 100%)`, opacity: own ? 0.78 : 1 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${right ? 64 : 36}% 32%, rgba(255,255,255,.2), transparent 70%)` }} />

      {/* The player, sharp, natural colour; a soft dark pool below him. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 360, background: `linear-gradient(to bottom, transparent, ${shade(club, -0.6)}aa)` }} />

      {/* The card. The shadow is a separate blurred shape under its lower corner, then a soft general lift. */}
      <div style={{ position: "absolute", bottom: H - cardBottom, ...(right ? { left: cardSide } : { right: cardSide }), transform: `rotate(${tilt}deg)`, transformOrigin: right ? "left bottom" : "right bottom" }}>
        <div style={{ position: "absolute", [right ? "left" : "right"]: -10, bottom: -26, width: "70%", height: 90, borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(34px)" }} />
        <div style={{ position: "relative", borderRadius: radius, boxShadow: "0 24px 60px -18px rgba(0,0,0,.55), 0 4px 14px rgba(0,0,0,.25)", outline: "1px solid rgba(255,255,255,.18)", outlineOffset: -1, lineHeight: 0 }}>
          <LeagueGraphic data={data} maxW={gMaxW} maxH={cardMaxH} ring={ring} radius={radius} />
        </div>
      </div>

      {/* Tiny title, his name, the round. */}
      <div style={{ position: "absolute", top: topY, ...side, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
        <div style={{ ...soft, fontFamily: DMSERIF, fontStyle: "italic", fontSize: tSize, lineHeight: 1.1, letterSpacing: "-0.005em" }}>{title}</div>
        <div style={{ ...soft, marginTop: 18 * S, fontFamily: SANS, fontWeight: 600, fontSize: nSize, letterSpacing: `${NAME_T}em`, lineHeight: 1.3 }}>{name}</div>
        {sub && <div style={{ ...soft, marginTop: 10 * S, fontFamily: SANS, fontWeight: 400, fontSize: subSize, letterSpacing: "0.16em", lineHeight: 1.3, textTransform: "uppercase", opacity: 0.82 }}>{sub}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", [right ? "left" : "right"]: cardSide, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.2} />
    </div>
  );
}
