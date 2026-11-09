/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { keepHead } from "./doubleline";
import { cutMask } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, PaperEdge, PaperTooth, paperTones } from "./paperecho";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/**
 * Goal paper echo: the celebrating player in natural colour on warm off-white paper (a faint club tint), a
 * soft shade where he meets it, and one hairline echo of his own edge offset behind him towards the free
 * side and up, in the deep club colour (or ink, by seed). "GOAL" small and wide-tracked in ink at the top; his
 * name, the fixture (home first, names exactly as stored, no score) and the competition small at the foot.
 */
export function Goalpaperecho({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const { paper, light, edge, ink, echo } = paperTones(data);
  const toLeft = params.side === "left";

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(15 * k, Math.min(26 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + 34 * k;

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

  /* ---- the player, centred; wide celebrations are scaled down so the echo stays in frame ---- */
  const dx = (toLeft ? -38 : 38) * k;
  const dy = -30 * k;
  const sizes = story ? { chest: 320, waist: 260, knees: 206, full: 162 } : { chest: 228, waist: 184, knees: 146, full: 118 };
  const faceTop = story ? 440 : 300;
  let box = placeByFace(data, 540, faceTop, sizes);
  const wide = Math.min(1, (story ? 900 : 860) / box.width);
  if (wide < 1) box = placeByFace(data, 540, faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2)) - dx * 0.4;
  // His raised hands, and the echo's (higher by dy), stay under the title.
  box = keepHead(data, { ...box, left: box.left + lean }, clipTop + (story ? 28 : 20) - dy, true);
  // He melts into the paper above his name.
  const fadeEnd = nameTop - 26 * k;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - (story ? 380 : 300) - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 54% at 50% ${story ? 40 : 42}%, ${light}, ${paper} 62%, ${edge})` }} />

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={toLeft} />

      {data.photoUrl && <PaperEdge id="goalpaperecho" url={data.photoUrl} box={box} H={H} dx={dx} dy={dy} color={echo} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd} width={story ? 2.2 : 1.8} />}

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
