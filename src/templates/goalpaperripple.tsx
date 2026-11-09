/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { keepHead } from "./doubleline";
import { cutMask } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, PaperTooth, paperTones } from "./paperecho";
import { cleanRipples, fadeMask, paperDeep } from "./paperripple";
import { capsEm, SilhouetteFx, withAlpha } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/**
 * Goal paper ripple: goalrippleecho on light warm paper — the celebrating player, sharp and in natural colour,
 * centred, a soft shade where he meets the paper, and four hairline echoes of his silhouette spreading outward
 * around him: the innermost in near-black ink, the outer ones in the deep club colour, ever fainter. "GOAL"
 * small and wide-tracked in ink at the top; his name, the fixture (home first, names exactly as stored, no
 * score) and the competition small at the foot.
 */
export function Goalpaperripple({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const { paper, light, edge, ink } = paperTones(data);
  const deep = paperDeep(data);

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(16 * k, Math.min(28 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + 36 * k;

  /* ---- foot ---- */
  const f = matchFacts(data);
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : "";
  const comp = (f.comp || "").trim().toUpperCase();
  const N_TRACK = 0.24;
  const F_TRACK = 0.3;
  const nameSize = Math.max(16, Math.min(28 * k, 860 / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const fixSize = Math.max(11, Math.min(15 * k, 860 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const compSize = Math.max(10, Math.min(12 * k, 860 / Math.max(1, capsEm(comp, F_TRACK)))) * ts;
  // Story: the logo (~88px) ends at STORY_BOTTOM, top at 1592; the last line ends 64px above it.
  const lastBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (params.textY ?? 0);
  const compTop = lastBottom - compSize;
  const fixTop = (comp ? compTop - 18 * k : lastBottom) - fixSize;
  const nameTop = fixTop - 22 * k - nameSize;

  /* ---- the player, centred; wide celebrations are scaled down to keep the rings in frame ---- */
  const RS = story ? [20, 46, 80, 124] : [16, 36, 62, 96];
  const sizes = story ? { chest: 300, waist: 244, knees: 196, full: 156 } : { chest: 214, waist: 172, knees: 138, full: 112 };
  const faceTop = story ? 470 : 316;
  let box = placeByFace(data, 540, faceTop, sizes);
  const wide = Math.min(1, (story ? 860 : 820) / box.width);
  if (wide < 1) box = placeByFace(data, 540, faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  // Centre the figure (not the face): his raised arms balance around the middle; his hands stay under the title.
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = keepHead(data, { ...box, left: box.left + lean }, clipTop + RS[1] * 0.6, true);
  // He and his ripples melt into the paper above his name.
  const fadeEnd = nameTop - 26 * k;
  const span = story ? 400 : 300;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - span - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 54% at 50% ${story ? 40 : 42}%, ${light}, ${paper} 62%, ${edge})` }} />

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={false} />

      {/* Four ripples of his edge spreading outward; the first in ink, the rest in the deep club colour. */}
      {data.photoUrl && (
        <SilhouetteFx id="goalpaperripple" url={data.photoUrl} box={box} H={H} clipTop={clipTop} cut={data.cut} pad={RS[3] + 40} mask={fadeMask("goalpaperripple", clipTop, fadeEnd, span, H)}>
          {cleanRipples(
            [
              { r: RS[0], color: withAlpha(ink, 0.85), w: story ? 1.8 : 1.5 },
              { r: RS[1], color: withAlpha(deep, 0.7), w: story ? 1.5 : 1.25 },
              { r: RS[2], color: withAlpha(deep, 0.42), w: story ? 1.5 : 1.25 },
              { r: RS[3], color: withAlpha(deep, 0.22), w: story ? 1.5 : 1.25 },
            ],
            story ? 56 : 44,
          )}
        </SilhouetteFx>
      )}

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 500, { opacity: 0.82 }) }}>{fixture}</div>}
      {comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...caps(compSize, F_TRACK, 500, { opacity: 0.56 }) }}>{comp}</div>}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <PaperTooth />
    </div>
  );
}
