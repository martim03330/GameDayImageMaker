/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { ANTON, em } from "./mist";
import { competitionOf, roundOf, scoreOf } from "./outline";
import type { Box } from "./fx";
import { AgencyLogo, DISPLAY, GROTESK } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const BG = "#0a0b0e";
const LINE = "rgba(255,255,255,.11)";

/** Space Grotesk bold: average advance of its capitals relative to the font size (with the tracking used here). */
const GROTESK_W = 0.7;
/** Largest size (≤ max) at which `text` fits `width` in spaced Space Grotesk caps. */
export const fitGrotesk = (text: string, width: number, max: number, ratio = GROTESK_W) => Math.min(max, width / Math.max(1, [...text].length * ratio));

/**
 * Head-and-shoulders placement by the face (like outline's placeByFace) with a looser resolution cap:
 * these looks are only offered sharp photos ("magnifies"), so the face may reach ~3× its real pixels.
 * A photo that is not a cutout gets a soft oval mask around the face (a tight crop, never the whole frame).
 */
export function portraitBox(data: RenderData, faceX: number, faceTop: number, sizes: Record<string, number>, cap = 1.5, reach = true): Box & { faceH: number; faceCx: number; faceTop: number } {
  const p = data.params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let faceH = (sizes[p.framing ?? "waist"] ?? sizes.waist ?? 250) * (p.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(110, data.facePx * cap));
  let h = Math.max(faceH / face[3], reach ? (CANVAS_H + 30 - faceTop) / Math.max(0.2, 1 - face[1]) : 0);
  // A tight bust stretched to reach the bottom edge must still not blow the face past ~3.2× its pixels:
  // it then ends above the edge, where its cut fades out.
  if (data.facePx > 0) h = Math.min(h, Math.max(faceH, data.facePx * 1.6) / face[3]);
  const w = h * aspect;
  const left = faceX - w * (face[0] + face[2] / 2) + (p.playerX ?? 0);
  const top = faceTop - h * face[1] + (p.playerY ?? 0);
  return { left, top, width: w, height: h, faceH: face[3] * h, faceCx: left + w * (face[0] + face[2] / 2), faceTop: top + h * face[1] };
}

/** Mask for an original (non-cutout) photo: an oval around the head and shoulders, fading out. */
export function photoOval(box: Box & { faceH: number; faceCx: number; faceTop: number }): CSSProperties {
  const cx = box.faceCx - box.left;
  const cy = box.faceTop - box.top + box.faceH * 0.9;
  const m = `radial-gradient(${Math.round(box.faceH * 1.7)}px ${Math.round(box.faceH * 2.1)}px at ${Math.round(cx)}px ${Math.round(cy)}px, #000 55%, transparent 100%)`;
  return { WebkitMaskImage: m, maskImage: m };
}

/** Rounded hexagon, as a clip-path polygon (pointy sides left and right). */
const HEX = "polygon(25% 3%, 75% 3%, 98% 50%, 75% 97%, 25% 97%, 2% 50%)";

/** A crest on a dark bevelled hexagon plate (the "app card" crest of the reference); initials when there is no crest. */
function Plate({ src, name, size, glow }: { src?: string | null; name: string; size: number; glow: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]{2,3}$/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return (
    <div style={{ position: "relative", width: size * 1.1, height: size, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.6))" }}>
      <div style={{ position: "absolute", inset: 0, clipPath: HEX, background: "linear-gradient(160deg, #2a2d35, #121318 55%, #0d0e12)" }} />
      <div style={{ position: "absolute", inset: 3, clipPath: HEX, background: `radial-gradient(80% 70% at 50% 25%, ${glow}22, transparent 70%), linear-gradient(160deg, #1b1d23, #0f1014)` }} />
      {src ? (
        <img src={src} alt="" style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.66, height: size * 0.66, transform: "translate(-50%,-50%)", objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,.45))" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: size * 0.28, color: WHITE, letterSpacing: "0.04em" }}>{initials || "FC"}</div>
      )}
    </div>
  );
}

/** Thin interface lines around the card: an inset frame with notched corners and a few loose rules. */
function UiLines({ seed }: { seed: number }) {
  const r = rng(seed);
  const y1 = 505 + Math.round(r() * 20);
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
      <g fill="none" stroke={LINE} strokeWidth={1.5}>
        <path d={`M40 90 V40 H${540 - 60} M${540 + 60} 40 H1040 V${y1 - 30}`} />
        <path d={`M40 130 V${y1} H240`} />
        <path d={`M1040 ${y1 + 40} V${y1 + 160}`} />
        <rect x={52} y={52} width={10} height={10} />
        <rect x={1018} y={52} width={10} height={10} />
        <path d={`M18 ${y1 - 180} H70 M18 ${y1 - 170} H48`} />
      </g>
      <g fill="rgba(255,255,255,.18)">
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={1000 - i * 14} cy={y1 + 10} r={2} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Wolves v Newcastle fixture card: near-black screen with thin UI lines; a small
 * "● COMPETITION | ROUND" line, both crests on dark hexagon plates either side of a glowing "VS" ring,
 * team names in wide caps and a "16:30 · VENUE" line; below, a big head-and-shoulders portrait
 * with a soft rim light, in front of giant white letters outlined in the club colour that run off the canvas.
 */
export function Versus({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 41);
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // A black or near-black club colour would give no glow at all: the accent lights the scene instead.
  const club = luminance(base) < 0.06 ? vivid(params.accent) : base;
  // Very dark club colours still need a visible glow.
  const glow = luminance(club) < 0.12 ? shade(club, 0.35) : club;
  const ts = params.textScale ?? 1;
  const score = scoreOf(data, "-");
  const isResult = postType === "result" && !!score;

  // ---- fixture card ----
  const crestSize = 190;
  const homeName = (content.homeTeam || (content.awayTeam ? data.club?.name : "") || "").toUpperCase();
  const awayName = (content.awayTeam || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home !== false ? data.club?.crestUrl : null);
  const awayCrest = content.awayCrest ?? (content.home === false ? data.club?.crestUrl : null);
  const twoTeams = !!(homeName || homeCrest) && !!(awayName || awayCrest);
  const comp = competitionOf(data);
  const round = roundOf(data).split("·").slice(1).join("·").trim();
  const topLine = [comp || (data.club?.name ?? "").toUpperCase(), round || content.kicker.toUpperCase()].filter(Boolean);
  const nameSize = Math.min(fitGrotesk(homeName, 380, 34), fitGrotesk(awayName, 380, 34));
  const info = [isResult ? "FULL TIME" : content.time, content.date, content.venue].filter(Boolean).map((s) => String(s).toUpperCase());
  const infoText = info.join(" · ");
  const infoSize = fitGrotesk(infoText, 860, 23, 0.66);

  // ---- the player: big head and shoulders, face in the lower half ----
  const shift = (r() - 0.5) * 70 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  const want = ({ chest: 330, waist: 290, knees: 250, full: 230 } as Record<string, number>)[params.framing ?? "waist"] ?? 290;
  const fig = portraitBox(data, 540 + shift, 540 + 0.3 * Math.min(want, data.facePx > 0 ? Math.max(110, data.facePx * 1.5) : want), { chest: 330, waist: 290, knees: 250, full: 230 });

  // ---- giant word behind him ----
  const kick = content.kicker.toUpperCase().replace(/^IT'S\s+/, "");
  const joined = kick.replace(/\s+/g, "");
  const word = (joined.length <= 10 ? joined : (content.lastName || kick.split(/\s+/).pop() || "").toUpperCase()).replace(/[^A-Z0-9ÀÁÂÃÉÊÍÓÔÕÚÇ'-]/g, "");
  // Wider than the canvas: the outer letters are cut by the edges, as in the reference.
  const bigSize = Math.min(500, (1420 * ts) / Math.max(1.2, em(word, ANTON, 44)));
  const bigW = em(word, ANTON, 44) * bigSize;
  // Cap tops level with his chin: the letters fill the space either side of his neck and shoulders.
  const chin = fig.faceTop + fig.faceH * 1.05;
  const bigTop = Math.min(930, Math.max(800, chin - 40));

  const bigText = (extra: CSSProperties) => (
    <div
      data-bleed
      style={{
        position: "absolute",
        left: 540 - bigW / 2,
        top: bigTop - bigSize * 0.12,
        fontFamily: DISPLAY,
        fontSize: bigSize,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...extra,
      }}
    >
      {word}
    </div>
  );

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameLine = [data.player.number ? `#${data.player.number}` : "", name].filter(Boolean).join("  ");

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: BG, color: WHITE }}>
      {/* Deep screen: a faint club-coloured haze behind the card, darker corners. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 30% at 50% 22%, ${club}1c, transparent 70%), radial-gradient(70% 45% at 50% 70%, #1a1c22, transparent 75%)` }} />
      <UiLines seed={(params.seed ?? 41) + 3} />

      {/* The giant word: a club-colour outline echo, then the solid white letters. */}
      {bigText({ color: "transparent", WebkitTextStroke: `3px ${glow}`, transform: "translate(-14px,-16px)", opacity: 0.95 })}
      {bigText({
        backgroundImage: "linear-gradient(to bottom, #ffffff 30%, #d9dbe0 75%, #b9bcc4)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      })}

      {/* Back light: a soft halo behind the head. */}
      <div style={{ position: "absolute", left: fig.faceCx - 420, top: fig.faceTop - 300, width: 840, height: 840, borderRadius: "50%", background: `radial-gradient(closest-side, ${glow}40, ${glow}10 55%, transparent)` }} />

      {/* The player, rim-lit: a thin white edge and a wide glow in the club colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 1.6px rgba(255,255,255,.75)) drop-shadow(0 0 22px ${glow}66) drop-shadow(0 30px 50px rgba(0,0,0,.6))` }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.02)", ...(data.photoIsCutout ? cutMask(data.cut) : photoOval(fig)) }} />
        </div>
      )}
      {/* Cool screen light from above, darker at the foot so the name reads. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 78%, rgba(5,6,8,.65) 100%)" }} />

      {/* ---- the card ---- */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 76, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: GROTESK, fontWeight: 500, fontSize: fitGrotesk(topLine.join(" | "), 820, 22, 0.66), letterSpacing: "0.1em", fontStyle: "italic", whiteSpace: "nowrap" }}>
        <div style={{ width: 11, height: 11, borderRadius: 9, background: glow, boxShadow: `0 0 10px ${glow}` }} />
        {topLine.map((t, i) => (
          <span key={i} style={{ display: "flex", gap: 14, opacity: i ? 0.8 : 1 }}>
            {i > 0 && <span style={{ opacity: 0.5 }}>|</span>}
            {t}
          </span>
        ))}
      </div>

      {twoTeams ? (
        <>
          {[
            { x: 270, src: homeCrest, n: homeName },
            { x: 810, src: awayCrest, n: awayName },
          ].map((t, i) => (
            <div key={i} style={{ position: "absolute", left: t.x - 220, width: 440, top: 138, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
              <Plate src={t.src} name={t.n} size={crestSize} glow={glow} />
              <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: nameSize, letterSpacing: "0.06em", whiteSpace: "nowrap", lineHeight: 1 }}>{t.n}</div>
            </div>
          ))}
          {/* The glowing ring: "VS", or the score after the game. */}
          <div
            style={{
              position: "absolute",
              left: 540 - (isResult ? 86 : 50),
              top: 233 - 50,
              width: isResult ? 172 : 100,
              height: 100,
              borderRadius: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 50% 35%, #1c1e24, #0b0c10 70%)",
              border: "2px solid rgba(255,255,255,.12)",
              borderBottomColor: glow,
              boxShadow: `0 14px 30px -4px ${glow}, 0 22px 60px ${glow}99, inset 0 -14px 18px -4px ${glow}cc`,
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: isResult ? 46 : 28,
              letterSpacing: isResult ? "0.02em" : "0.04em",
              lineHeight: 1,
            }}
          >
            {isResult ? score : "VS"}
          </div>
        </>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 138, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <Plate src={homeCrest ?? awayCrest ?? data.club?.crestUrl} name={homeName || awayName || data.club?.name || ""} size={crestSize} glow={glow} />
          <div style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: fitGrotesk(homeName || awayName || (data.club?.name ?? "").toUpperCase(), 800, 34), letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
            {homeName || awayName || (data.club?.name ?? "").toUpperCase()}
          </div>
        </div>
      )}

      {/* Divider and the kick-off line. */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 432, height: 1.5, background: "linear-gradient(to right, transparent, rgba(255,255,255,.28) 15%, rgba(255,255,255,.28) 85%, transparent)" }} />
      {infoText && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 458, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, fontFamily: GROTESK, fontSize: infoSize, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          {info.map((t, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: i === 0 ? 700 : 500, opacity: i === 0 ? 1 : 0.78 }}>
              {i > 0 && <span style={{ width: 4, height: 4, borderRadius: 4, background: glow, display: "inline-block" }} />}
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Foot: name and number, agency mark. */}
      <div style={{ position: "absolute", left: 60, bottom: 48, fontFamily: GROTESK, fontWeight: 700, fontSize: fitGrotesk(nameLine, 560, 22, 0.68), letterSpacing: "0.14em", whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>
        {nameLine}
      </div>
      <AgencyLogo data={data} height={26} style={{ position: "absolute", right: 60, bottom: 44, opacity: 0.9 }} />
      <Film strength={0.8} />
    </div>
  );
}
