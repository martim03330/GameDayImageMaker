/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng, SCRIPT } from "./kit";
import { CAVEAT } from "./fx";
import { AgencyLogo, BEBAS, CONDENSED, factRows, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const INK = "#111214";
const PAPER = "#f4f4f3";

/** Face height on the canvas for each framing of the player in front. */
const FACE_H: Record<string, number> = { chest: 200, waist: 160, knees: 136, full: 120 };

/** Bebas Neue: average cap width and cap height relative to the font size. */
const BEBAS_W = 0.36;
const BEBAS_CAP = 0.7;

/** Where the cutout lands when its detected face is put at (faceX, faceTop) with a face height of faceH. */
function placeByFace(data: RenderData, faceX: number, faceTop: number, faceH: number, minBottom = CANVAS_H + 30) {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const h = Math.max(faceH / face[3], (minBottom - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  return {
    left: faceX - w * (face[0] + face[2] / 2) + (data.params.playerX ?? 0),
    top: faceTop - h * face[1] + (data.params.playerY ?? 0),
    width: w,
    height: h,
  };
}

/** Faint stadium roof over the light background: white truss lines converging on the pitch. */
function Roof() {
  const lines = Array.from({ length: 13 }, (_, i) => i);
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
      <g stroke="#ffffff" fill="none" strokeLinecap="round">
        <path d="M-60 250 Q540 110 1140 250" strokeWidth={5} opacity={0.9} />
        <path d="M-60 300 Q540 170 1140 300" strokeWidth={2} opacity={0.7} />
        <path d="M-60 520 Q540 430 1140 520" strokeWidth={2} opacity={0.55} />
        {lines.map((i) => {
          const x = -80 + i * 103;
          return <line key={i} x1={x} y1={-10} x2={540 + (x - 540) * 0.55} y2={250 - Math.abs(x - 540) * 0.05} strokeWidth={2.5} opacity={0.75} />;
        })}
        {lines.map((i) => {
          const x = -80 + i * 103;
          const y = 300 - Math.abs(x - 540) * 0.05 * 0.8;
          return <line key={`b${i}`} x1={540 + (x - 540) * 0.55} y1={y - 50} x2={540 + (x - 540) * 0.85} y2={y + 220} strokeWidth={1.5} opacity={0.45} />;
        })}
      </g>
    </svg>
  );
}

/**
 * Club celebration poster on white (OGC Nice "JOYEUX ANNIVERSAIRE MARIO"): the full name repeated faintly
 * as texture, crest and a small black caption, the first name gigantic in the club colour, a huge faded
 * greyscale ghost of the same player behind it, the player in front and a hand signature with his number.
 */
export function Ghost({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 23);
  const flip = params.side === "left";
  const sgn = flip ? -1 : 1;
  const club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // Bright club colours (lime, yellow, sky blue) wash out on white: deepen them until they hold.
  const red = luminance(club) > 0.3 ? shade(club, -0.35) : luminance(club) > 0.2 ? shade(club, -0.18) : club;
  const deep = shade(red, -0.35);
  const ts = params.textScale ?? 1;

  const first = (content.firstName || content.lastName || "").toUpperCase();
  const full = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kicker = content.kicker.toUpperCase();

  // Header: crest, caption, then the first name filling ~70% of the width (tall: Bebas stretched a little).
  const crest = data.club?.crestUrl;
  const kickTop = crest ? 164 : 96;
  const kickSize = Math.min(34, 900 / Math.max(1, kicker.length * 0.66));
  const stretch = 1.26;
  const nameSize = Math.min(430, 770 / (Math.max(4, first.length) * BEBAS_W)) * ts;
  // Accented capitals (É, Ã) need room under the caption.
  const nameTop = kickTop + kickSize + (/[À-ÝÃÕ]/.test(first) ? nameSize * 0.17 * stretch : 22);
  const capH = nameSize * BEBAS_CAP * stretch;
  // Bebas has an empty band above the caps (~0.12em): pull the box up so the caps start at nameTop.
  const nameBottom = nameTop + capH;

  // The player: head just under the name, his hair overlapping its lower edge.
  const faceH = (FACE_H[params.framing ?? "waist"] ?? 150) * (params.playerScale ?? 1);
  const faceX = 540 + sgn * (100 + r() * 30);
  const faceTop = nameBottom - faceH * 0.04;
  const box = placeByFace(data, faceX, faceTop, faceH);

  // The ghost: the same cutout ~2.5× bigger, but never magnified past what the photo can hold.
  const want = faceH * 2.6;
  const facePx = data.facePx || 0;
  const ghostH = facePx > 0 ? Math.min(want, Math.max(faceH * 1.9, facePx * 3.5)) : want;
  // Magnification of the original pixels in the 2× export: past ~3× the ghost goes softer instead of blocky.
  const mag = facePx > 0 ? (ghostH * 2) / facePx : 2;
  const ghostBlur = Math.min(8, Math.max(0.8, 0.8 + (mag - 3) * 1.1));
  const gFace = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const gAspect = data.photoAspect ?? 0.6;
  const gh = ghostH / gFace[3];
  const gw = gh * gAspect;
  const gcx = 540 - sgn * 250;
  const gcy = nameTop + capH * 0.62;
  const ghostFadeX = flip ? "to left" : "to right";
  // Head and a hint of shoulders only: a radial fade around the face, then towards the player.
  const ghostMask = `radial-gradient(${Math.round(ghostH * 1.25)}px ${Math.round(ghostH * 1.35)}px at ${Math.round(gcx)}px ${Math.round(gcy - ghostH * 0.1)}px, #000 45%, transparent 100%), linear-gradient(${ghostFadeX}, #000 34%, transparent 66%)`;

  // Texture: the full name, repeated in faint rows across the upper half.
  const rowSize = 86;
  const rows = Array.from({ length: 8 }, (_, i) => i);
  const rowText = Array.from({ length: 6 }, () => full).join("   ");

  // Side column, away from the player, just under the name: low enough to clear the ghost's face,
  // high enough to stay clear of arms and legs at the bottom of the frame.
  const facts = (postType === "potm" || postType === "goal" ? content.stats : factRows(data)).slice(0, 3);
  const colStyle: CSSProperties = flip ? { right: 60, alignItems: "flex-end", textAlign: "right" } : { left: 60, alignItems: "flex-start", textAlign: "left" };
  // Arms reach a good two face heights either side of the face.
  const colW = Math.max(240, Math.min(400, flip ? CANVAS_W - (faceX + faceH * 2.2) - 60 : faceX - faceH * 2.2 - 60));
  // Players sign with one short name: the first name, or the surname when that one is shorter.
  const firstWord = content.firstName.split(/\s+/)[0] ?? "";
  const lastWord = content.lastName.split(/\s+/).pop() ?? "";
  const sigWord = !lastWord || (firstWord && firstWord.length <= Math.max(8, lastWord.length)) ? firstWord : lastWord;
  const sigSize = Math.min(118, (colW * 1.15) / Math.max(3, (sigWord.length + (data.player.number ? 2.5 : 0)) * 0.36));
  const crests = [content.homeCrest ?? (postType === "matchday" ? data.club?.crestUrl : null), content.awayCrest].filter(Boolean) as string[];
  const when = [content.date, content.time].filter(Boolean).join(" · ").toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* High-key stadium: light grey at the top fading to white, white roof lines. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #dcdcde 0%, #e9e9ea 30%, #f4f4f3 58%, #fbfbfa 100%)" }} />
      <Roof />

      {/* The full name as a faint condensed texture. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          inset: 0,
          WebkitMaskImage: "linear-gradient(to bottom, #000 45%, transparent 72%)",
          maskImage: "linear-gradient(to bottom, #000 45%, transparent 72%)",
        }}
      >
        {rows.map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -((i * 173 + 60) % 420),
              top: 18 + i * (rowSize * 1.02),
              fontFamily: BEBAS,
              fontSize: rowSize,
              lineHeight: 1,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              color: "#000",
              opacity: 0.055,
            }}
          >
            {rowText}
          </div>
        ))}
      </div>

      {/* Ghost of the player: huge, greyscale, low contrast, dissolving into the white. */}
      {data.photoUrl && data.photoIsCutout && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: ghostMask, maskImage: ghostMask, WebkitMaskComposite: "source-in", maskComposite: "intersect" } as CSSProperties}>
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              width: gw,
              height: gh,
              left: gcx - (gFace[0] + gFace[2] / 2) * gw,
              top: gcy - (gFace[1] + gFace[3] / 2) * gh,
              maxWidth: "none",
              filter: `grayscale(1) contrast(.8) brightness(1.32) blur(${ghostBlur.toFixed(1)}px)`,
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {/* Top edge: thin club stripes (colour / black / colour). */}
      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 6, background: red }} />
        <div style={{ height: 4, background: INK }} />
        <div style={{ height: 6, background: red }} />
      </div>

      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 540 - 44, top: 54, width: 88, height: 88, objectFit: "contain" }} />}
      <div style={{ position: "absolute", left: 60, right: 60, top: kickTop, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: kickSize, lineHeight: 1, letterSpacing: "0.02em", color: INK, whiteSpace: "nowrap" }}>
        {kicker}
      </div>

      {/* The first name, gigantic, in the club colour. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: nameTop - nameSize * 0.13 * stretch,
          textAlign: "center",
          fontFamily: BEBAS,
          fontSize: nameSize,
          lineHeight: 1,
          letterSpacing: "0.005em",
          whiteSpace: "nowrap",
          color: red,
          transform: `scaleY(${stretch})`,
          transformOrigin: "50% 0",
          backgroundImage: `linear-gradient(to bottom, ${red} 55%, ${deep})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {first}
      </div>

      {/* The player in front, overlapping the bottom of the name. */}
      {data.photoUrl && (
        // Shadow on a wrapper: a mask on the same element would clip the shadow to a visible box on white.
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 22px 36px rgba(0,0,0,.2))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "contrast(1.05)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Side column: signature with the shirt number, then the facts. */}
      <div style={{ position: "absolute", top: Math.max(nameBottom + 110, 700), width: colW, display: "flex", flexDirection: "column", gap: 10, ...colStyle }}>
        <div style={{ fontFamily: SCRIPT, fontSize: sigSize, lineHeight: 1, color: INK, whiteSpace: "nowrap", transform: `rotate(${-7 + r() * 3}deg)`, transformOrigin: flip ? "100% 50%" : "0 50%", marginBottom: 18 }}>
          {sigWord}
          {data.player.number && <span style={{ marginLeft: "0.3em", fontFamily: CAVEAT, fontSize: "0.62em", verticalAlign: "0.2em" }}>{data.player.number}</span>}
        </div>
        {crests.length > 0 && (postType === "matchday" || postType === "goal") && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexDirection: flip ? "row-reverse" : "row" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 62, height: 62, objectFit: "contain" }} />
            ))}
          </div>
        )}
        {postType === "matchday" && when ? (
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: Math.min(30, colW / (when.length * 0.64)), letterSpacing: "0.12em", color: INK, whiteSpace: "nowrap" }}>{when}</div>
        ) : (
          facts.map((f, i) => {
            const v = String(f.value).toUpperCase();
            const label = String(f.label).toUpperCase();
            const vs = Math.min(62, (colW - Math.min(160, label.length * 11)) / Math.max(1, v.length * 0.44));
            return (
              // "3 GAMES", but "CONTRACT UNTIL 2027": numbers lead, words follow their label.
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 14, flexDirection: (/^[\d.,+-]+$/.test(v) ? !flip : flip) ? "row" : "row-reverse", whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: BEBAS, fontSize: vs, lineHeight: 0.9, color: red }}>{v}</span>
                <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", color: INK }}>{label}</span>
              </div>
            );
          })
        )}
      </div>

      <AgencyLogo data={data} onLight height={24} style={{ position: "absolute", bottom: 50, [flip ? "right" : "left"]: 60, opacity: 0.85, color: INK }} />
    </div>
  );
}
