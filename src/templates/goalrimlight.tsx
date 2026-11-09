import type { CSSProperties } from "react";
import { Film } from "./fx";
import { rng } from "./kit";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, withAlpha } from "./rippleecho";
import { BacklitPlayer, rimTones } from "./rimlight";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/**
 * Goal rim light: the celebrating player strongly backlit on a very dark ground — a thin bright rim of light
 * hugging his silhouette, brightest along the raised arm (the light sits high on that side, behind him) and
 * dying away across the body; he himself a little darker so the rim reads, his face still lit. "GOAL" small
 * and wide-tracked at the top; his name, the fixture (home first, names exactly as stored, no score) and the
 * competition small at the foot.
 */
export function Goalrimlight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 9);
  const warm = r() < 0.55;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const { ground, air, rim } = rimTones(data, warm);
  const f = matchFacts(data);

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(16 * k, Math.min(30 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player, the figure centred ---- */
  const sizes = story ? { chest: 310, waist: 252, knees: 200, full: 160 } : { chest: 222, waist: 180, knees: 142, full: 114 };
  const faceTop = story ? 470 : 316;
  let box = placeByFace(data, 540, faceTop, sizes);
  const wide = Math.min(1, (story ? 940 : 900) / box.width);
  if (wide < 1) box = placeByFace(data, 540, faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };

  // The raised arm is on the side of the cutout the face is NOT on (the arm adds width there).
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = face[0] + face[2] / 2;
  const armLeft = Math.abs(faceCx - 0.5) > 0.03 ? faceCx > 0.5 : params.side !== "right";
  const faceY = box.top + box.height * face[1];
  const hiX = armLeft ? box.left : box.left + box.width;
  const loX = armLeft ? box.left + box.width : box.left;
  const lowY = Math.min(H, box.top + box.height);
  const light = (
    <>
      <defs>
        <linearGradient id="goalrimlight-l" gradientUnits="userSpaceOnUse" x1={hiX} y1={faceY - box.faceH} x2={loX} y2={lowY}>
          <stop offset="0" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.3" stopColor="#fff" stopOpacity={0.8} />
          <stop offset="0.75" stopColor="#fff" stopOpacity={0.12} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={CANVAS_W + 400} height={H + 400} fill="url(#goalrimlight-l)" />
    </>
  );

  /* ---- foot ---- */
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
  // Story: the logo (~88px) top at 1592; the last line ends 64px above it.
  const lastBottom = story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150;
  const compTop = lastBottom - compSize;
  const fixTop = (comp ? compTop - 18 * k : lastBottom) - fixSize;
  const nameTop = fixTop - 22 * k - nameSize;

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center", ...extra });
  const srcX = ((armLeft ? box.left + box.width * 0.2 : box.left + box.width * 0.8) / CANVAS_W) * 100;
  const srcY = ((faceY - box.faceH * 0.2) / H) * 100;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The air behind him, faintly lit from the source behind the raised arm. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(56% 38% at ${srcX}% ${srcY}%, ${air}, ${ground} 85%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(26% 18% at ${srcX}% ${srcY}%, ${withAlpha(rim, 0.08)}, transparent 80%)` }} />

      <BacklitPlayer id="goalrimlight" data={data} box={box} H={H} clipTop={titleTop + kSize + 16 * k} rim={rim} light={light} width={1.8} glow={1.15} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 820 : 500, background: story ? `linear-gradient(to bottom, transparent, ${ground}e6 36%, ${ground} 58%)` : `linear-gradient(to bottom, transparent, ${ground}e0 55%, ${ground})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 500, { opacity: 0.86 }) }}>{fixture}</div>}
      {comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...caps(compSize, F_TRACK, 500, { opacity: 0.58 }) }}>{comp}</div>}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
