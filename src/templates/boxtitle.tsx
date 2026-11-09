/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, BEBAS, CONDENSED } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { mix } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
/** White type on pale fog: a wide, faint grey halo is enough to lift it. */
const HALO = "0 0 1px rgba(20,24,30,.55), 0 1px 4px rgba(20,24,30,.45), 0 2px 22px rgba(20,24,30,.3)";

/** Bebas Neue: average advance of its capitals, relative to the size. */
const BEBAS_RATIO = 0.4;

/** Face height for photos cut at the legs, by framing. */
const FACE_H: Record<string, number> = { full: 120, knees: 130, waist: 150, chest: 175 };

/**
 * Fog and frame (Lallana "MATCHDAY"): a soft misty light-grey sky with drifting clouds; a thin white
 * rectangle in the middle holding one huge condensed white word, a tiny spaced motto along its top
 * ("THE [CLUB] SPIRIT"); the player runs in front of it, crossing the frame, and splashes onto a calm
 * sheet of water that mirrors him in rippled, fading reflection. The teams in spaced caps under the frame,
 * the crests and competition quietly at the top, the agency mark small at the bottom left.
 */
export function Boxtitle({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 71;
  const r = rng(seed);
  const id = `bx-${seed % 997}`;
  const left = params.side === "left";
  const ts = params.textScale ?? 1;

  // A breath of the club colour in the grey, never enough to colour it.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.8) club = vivid(params.accent);
  const g = (grey: string, t = 0.05) => mix(grey, club, t);
  const skyTop = g("#c3c5c8", 0.05);
  const skyMid = g("#cfd1d3", 0.04);
  const haze = g("#e8e9ea", 0.02);
  const deep = g("#a9aeb3", 0.08);

  // ---- the player: running across the frame, feet on the water line ----
  const floor = 1092;
  const cx = 540 + (left ? -1 : 1) * (70 + r() * 50);
  const headTop = 250 + r() * 30;
  let box = standing(data, { cx, headTop, floor, maxFace: 128 });
  if (!box.feet) {
    // Cut at the legs: no water to stand in, so he comes closer, face high and the body running off the bottom,
    // further to the side so his wider body leaves the word readable.
    const cx2 = 540 + (left ? -1 : 1) * (150 + r() * 40);
    const p = placeFace(data, cx2, headTop + 40, FACE_H[params.framing ?? "waist"] ?? 150);
    box = { ...p, feet: false, faceCx: cx2 + (params.playerX ?? 0), faceTop: headTop + 40 + (params.playerY ?? 0), faceH: p.faceH };
  }
  const reflect = box.feet && !!data.photoUrl;
  const faceBottom = box.faceTop + box.faceH;

  // ---- the frame and its word ----
  const raw = content.kicker.toUpperCase().replace(/’/g, "'").trim();
  const word = raw.replace(/\s+/g, "").length <= 10 ? raw.replace(/\s+/g, "") : raw;
  const n = [...word].length;
  const pad = 58;
  const maxTextW = 820 * ts;
  const size = Math.min(236 * ts, maxTextW / (n * BEBAS_RATIO));
  const natural = Math.min(maxTextW, n * BEBAS_RATIO * size);
  // Short words ("GOAL") are spread out, so the frame keeps its width and his body never hides the whole word.
  const spread = natural < 560 * ts;
  const textW = spread ? 560 * ts : natural;
  const cap = size * 0.7;
  const frameW = textW + pad * 2;
  const mottoGap = 58;
  const frameH = cap + mottoGap + 58;
  // The frame sits on the chest or lower: the head always stays clear above it.
  const frameTop = Math.min(1060 - frameH - 110, Math.max(500, faceBottom + box.faceH * 0.7));
  const frameL = 540 - frameW / 2;
  const baseline = frameTop + mottoGap + cap + 6;

  const clubName = (data.club?.name ?? "").toUpperCase();
  const motto = clubName ? `THE ${clubName} SPIRIT` : "ONE CLUB · ONE SPIRIT";
  // The motto sits in the part of the frame his body leaves free (shrunk to fit it), else centred.
  const bodyL = box.faceCx - box.faceH * 1.7;
  const bodyR = box.faceCx + box.faceH * 1.7;
  const freeL = bodyL - frameL - 24;
  const freeR = frameL + frameW - bodyR - 24;
  const free = Math.max(freeL, freeR);
  const mottoLen = Math.max(1, [...motto].length * 1.3);
  const inFree = free / mottoLen >= 10.5;
  const mottoSize = Math.min(15, (inFree ? free : frameW - 80) / mottoLen);
  const mottoHalf = (mottoLen * mottoSize) / 2;
  // Centred behind his body it would be lost: then it is left out.
  const mottoOn = inFree || bodyR < 540 - mottoHalf || bodyL > 540 + mottoHalf;
  const mottoCx = !inFree ? 540 : freeL >= freeR ? frameL + 24 + freeL / 2 : bodyR + freeR / 2;

  // ---- the lines under the frame ----
  const f = matchFacts(data);
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const score = postType !== "matchday" ? scoreOf(data, "–") : "";
  const teams = home && away ? [home, away] : [];
  const teamsLen = teams.length ? teams.join("").length + (score ? score.length + 4 : 3) : 0;
  const teamsSize = Math.min(46, 940 / Math.max(1, teamsLen * 0.55)) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const info =
    postType === "matchday"
      ? [f.longDate || f.date, f.time, f.venue].filter(Boolean).join("   ·   ")
      : postType === "goal"
        ? name
        : [name, "FULL TIME"].filter(Boolean).join("   ·   ");
  const infoSize = Math.min(21, 900 / Math.max(1, [...info].length * 0.72));
  const teamsTop = frameTop + frameH + 30;

  // ---- top: crests and the competition ----
  const crests = crestsOf(data);
  const topLine = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const topSize = Math.min(19, 760 / Math.max(1, [...topLine].length * 0.8));
  // Kept above the hair: pushed up if a tight framing brings the head high.
  const hairTop = box.faceTop - box.faceH * 0.55;
  const crestSize = Math.max(46, Math.min(70, hairTop - 150));

  const img: CSSProperties = { position: "absolute", maxWidth: "none" };
  const water = floor - 6;
  const reflH = CANVAS_H - water;
  const reflFade = `linear-gradient(to bottom, rgba(0,0,0,.9) 0px, rgba(0,0,0,.55) ${reflH * 0.4}px, transparent ${reflH * 0.95}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: skyMid, color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={`${id}-cloud`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0028 0.0065" numOctaves={5} seed={seed % 50} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.1 0 0 0 -0.82" />
          </filter>
          <filter id={`${id}-ripple`} x="-10%" y="0" width="120%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.09" numOctaves={2} seed={(seed % 40) + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={26} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation="2.4 1" />
          </filter>
          <filter id={`${id}-waves`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.07" numOctaves={3} seed={(seed % 30) + 9} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 1.9 0 0 -0.95" />
          </filter>
        </defs>
      </svg>

      {/* Sky: grey fog, brightest in a band of haze where it meets the water. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 42%, ${haze} ${((water - 40) / CANVAS_H) * 100}%, ${mix(haze, deep, 0.3)} ${((water + 10) / CANVAS_H) * 100}%, ${deep} 100%)` }} />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, opacity: 0.75 }} aria-hidden>
        <defs>
          <linearGradient id={`${id}-cm`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.8} />
            <stop offset={(water / CANVAS_H).toFixed(3)} stopColor="#fff" stopOpacity={1} />
            <stop offset={((water + 1) / CANVAS_H).toFixed(3)} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <mask id={`${id}-cmask`}>
            <rect width={CANVAS_W} height={CANVAS_H} fill={`url(#${id}-cm)`} />
          </mask>
        </defs>
        <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-cloud)`} mask={`url(#${id}-cmask)`} />
      </svg>
      {/* Soft light behind the frame. */}
      <div style={{ position: "absolute", left: 540 - 620, top: frameTop - 360, width: 1240, height: frameH + 720, background: "radial-gradient(closest-side, rgba(255,255,255,.34), rgba(255,255,255,0))" }} />

      {/* The frame, its motto and its word: all behind the player. */}
      <div style={{ position: "absolute", left: frameL, top: frameTop, width: frameW, height: frameH, border: `${Math.max(5, size * 0.028)}px solid ${WHITE}`, boxSizing: "border-box", boxShadow: "0 4px 26px rgba(40,46,56,.12), inset 0 4px 26px rgba(40,46,56,.08)" }} />
      {mottoOn && <div style={{ position: "absolute", left: mottoCx - 400, width: 800, top: frameTop + 22, textAlign: "center", fontFamily: CONDENSED, fontWeight: 500, fontSize: mottoSize, letterSpacing: "0.72em", paddingLeft: "0.72em", color: WHITE, opacity: 0.85, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(40,46,56,.2)" }}>
        {motto}
      </div>}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(0 6px 22px rgba(40,46,56,.22))" }} aria-hidden>
        <text x={540 - textW / 2} y={baseline} textLength={textW} lengthAdjust={spread ? "spacing" : "spacingAndGlyphs"} fill={WHITE} style={{ fontFamily: BEBAS, fontSize: size }}>
          {word}
        </text>
      </svg>

      {/* Water: darker grey, fine horizontal ripples catching the light. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: water, bottom: 0, background: `linear-gradient(to bottom, ${mix(haze, deep, 0.35)}, ${deep})` }} />
      <svg width={CANVAS_W} height={reflH} style={{ position: "absolute", left: 0, top: water, opacity: 0.4, mixBlendMode: "screen" }} aria-hidden>
        <rect width={CANVAS_W} height={reflH} filter={`url(#${id}-waves)`} />
      </svg>

      {/* His reflection: flipped at the feet, rippled, soft and fading into the water. */}
      {reflect && (
        <div style={{ position: "absolute", left: box.left - 60, top: water, width: box.width + 120, height: reflH, overflow: "hidden", WebkitMaskImage: reflFade, maskImage: reflFade, opacity: 0.8 }}>
          <div style={{ position: "absolute", left: 60, top: floor - water - 4, width: box.width, height: box.height, filter: `url(#${id}-ripple) saturate(.8) brightness(.95)` }}>
            <img src={data.photoUrl!} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", transform: "scaleY(-1)" }} />
          </div>
        </div>
      )}
      {/* The haze line where sky meets water. */}
      <div style={{ position: "absolute", left: -100, right: -100, top: water - 70, height: 110, background: `radial-gradient(60% 50% at 50% 60%, ${haze}, transparent)`, opacity: 0.9 }} />

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(40,46,56,.25))" }}>
          <img src={data.photoUrl} alt="" style={{ ...img, left: box.left, top: box.top, width: box.width, height: box.height, filter: "contrast(1.05) saturate(1.06)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* The letters his body hides still show through faintly. */}
      <svg
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          opacity: 0.3,
          mixBlendMode: "difference",
          pointerEvents: "none",
          ...(data.photoUrl
            ? {
                WebkitMaskImage: `url("${data.photoUrl}")`,
                maskImage: `url("${data.photoUrl}")`,
                WebkitMaskPosition: `${box.left}px ${box.top}px`,
                maskPosition: `${box.left}px ${box.top}px`,
                WebkitMaskSize: `${box.width}px ${box.height}px`,
                maskSize: `${box.width}px ${box.height}px`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }
            : { display: "none" }),
        }}
        aria-hidden
      >
        <text x={540 - textW / 2} y={baseline} textLength={textW} lengthAdjust={spread ? "spacing" : "spacingAndGlyphs"} fill={WHITE} style={{ fontFamily: BEBAS, fontSize: size }}>
          {word}
        </text>
      </svg>
      {/* Contact: a little splash of light where the feet touch the water. */}
      {reflect && <div style={{ position: "absolute", left: box.faceCx - 190, top: floor - 22, width: 380, height: 44, background: "radial-gradient(closest-side, rgba(255,255,255,.45), transparent)", filter: "blur(4px)" }} />}
      {/* Photos cut at the legs sink into the fog instead. */}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, top: water - 180, bottom: 0, background: `linear-gradient(to bottom, transparent, ${haze}cc 42%, ${mix(haze, deep, 0.5)} 100%)` }} />}

      {/* Teams under the frame (in front of him, like the reference). */}
      {teams.length > 0 && (
        <div style={{ position: "absolute", left: 40, right: 40, top: teamsTop, textAlign: "center", fontFamily: BEBAS, fontSize: teamsSize, lineHeight: 1, letterSpacing: "0.14em", paddingLeft: "0.14em", color: WHITE, whiteSpace: "nowrap", textShadow: HALO }}>
          {teams[0]}
          <span style={{ margin: "0 0.45em", opacity: score ? 1 : 0.9 }}>{score || "V"}</span>
          {teams[1]}
        </div>
      )}
      {info && (
        <div style={{ position: "absolute", left: 40, right: 40, top: teamsTop + (teams.length ? teamsSize + 18 : 0), textAlign: "center", fontFamily: CONDENSED, fontWeight: 700, fontSize: infoSize, letterSpacing: "0.32em", paddingLeft: "0.32em", color: WHITE, whiteSpace: "nowrap", textShadow: HALO }}>
          {info}
        </div>
      )}

      {/* Top: the crests, quietly, and the competition. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 58, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          {crests.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {i > 0 && <div style={{ width: 1.5, height: crestSize * 0.6, background: WHITE, opacity: 0.8 }} />}
              <img src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 4px 12px rgba(40,46,56,.25))" }} />
            </div>
          ))}
        </div>
      )}
      {topLine && (
        <div style={{ position: "absolute", left: 40, right: 40, top: crests.length ? 58 + crestSize + 20 : 70, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: topSize, letterSpacing: "0.34em", paddingLeft: "0.34em", color: WHITE, whiteSpace: "nowrap", textShadow: HALO }}>
          {topLine}
        </div>
      )}

      {/* On the water; in the top corner when his legs run off the bottom. */}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", maxWidth: "none", left: 44, ...(box.feet ? { bottom: 40 } : { top: 44 }), color: WHITE, opacity: 0.9, filter: "drop-shadow(0 1px 6px rgba(40,46,56,.3))" }} />
      {/* Fine grain so the fog does not band. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
          )}")`,
        }}
      />
    </div>
  );
}
