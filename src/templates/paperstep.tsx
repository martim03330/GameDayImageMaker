/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { GiantShape } from "./giantsilhouette";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, mix, PaperTooth, paperTones } from "./paperecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import type { Box } from "./typesilhouette";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/**
 * The shared body of the paper step looks: stepsilhouette on warm off-white paper. The player in natural colour
 * and behind him three crisp, flat copies of his silhouette stepping back diagonally to the free side, as tints
 * of the club colour that grow paler towards the paper the further they step away — cut-paper layers. He melts
 * into the paper above the foot. Matchday: the title small at the top, crests, fixture and date · kick-off ·
 * ground at the foot. Goal: "GOAL" at the top, his name and the fixture (never the score) at the foot. Ink
 * type, dark NEYOD logo. Flips with params.side.
 */
export function PaperStepSilhouette({ data, goal }: { data: RenderData; goal?: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? (goal ? 61 : 59));
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const dir = onLeft ? 1 : -1; // the steps go towards +x when he stands on the left

  /* ---- tones: paper → club in three tints (nearest strongest) ---- */
  const { club, paper, light, edge, ink } = paperTones(data);
  // A very light club colour (yellow) is deepened so the tints still read on paper.
  const hue = luminance(club) > 0.3 ? shade(club, -0.3) : club;
  const steps = [mix(paper, hue, 0.14), mix(paper, hue, 0.28), mix(paper, hue, 0.46)]; // farthest → nearest

  /* ---- title ---- */
  const title = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'");
  const T_TRACK = goal ? 0.6 : 0.55;
  const tSize = Math.max(13 * k, Math.min((goal ? 24 : story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + (story ? 44 : 30);

  /* ---- foot ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const fixture = teams.join("   v   ").toUpperCase() || (goal ? "" : (f.comp || "").toUpperCase());
  const F_TRACK = goal ? 0.28 : 0.3;
  const fixSize = Math.max(goal ? 11 : 12, Math.min((goal ? 15 : 17) * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = goal ? "" : [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const name = goal ? [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ").toUpperCase() : "";
  const N_TRACK = 0.22;
  const nameSize = Math.max(16, Math.min(28 * k, 860 / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const crests = goal ? [] : ((content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]);
  const CR = 40 * k;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  let fixTop: number, whenTop = 0, nameTop = 0, crestTop = 0;
  if (goal) {
    fixTop = logoTop - 64 - fixSize - (params.textY ?? 0);
    nameTop = fixTop - 22 * k - nameSize;
  } else {
    whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
    fixTop = whenTop - fixSize - 22 * k;
    crestTop = fixTop - CR - 26 * k;
  }
  const footTop = goal ? (name ? nameTop : fixTop) : crests.length ? crestTop : fixTop;

  /* ---- the player and his steps ---- */
  const sx = (goal ? (story ? 50 : 42) : story ? 56 : 48) * dir;
  const sy = -(story ? 22 : 18);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const sizes = goal
    ? story ? { chest: 360, waist: 290, knees: 220, full: 166 } : { chest: 262, waist: 206, knees: 156, full: 120 }
    : story ? { chest: 420, waist: 330, knees: 240, full: 180 } : { chest: 290, waist: 228, knees: 170, full: 128 };
  // The group (him + three steps, ~150px wide) is centred: he stands that much towards his own side.
  let box: Box = placeByFace(data, 540 - dir * (story ? 84 : 72), story ? 360 : 260, sizes);
  // A wide celebration (a raised fist beyond his own edge of the canvas): shrink him around his face first
  // (never below 78%), unless the photo frame itself cut him there.
  {
    const frameCut = (onLeft ? data.cut?.left : data.cut?.right) ?? 0;
    const outer = onLeft ? 20 - box.left - box.width * 0.01 : box.left + box.width * 0.99 - (CANVAS_W - 20);
    if (!frameCut && outer > 90) {
      const fx = box.left + (face[0] + face[2] / 2) * box.width;
      const fy = box.top + face[1] * box.height;
      const reach = onLeft ? fx - box.left : box.left + box.width - fx;
      const sc = Math.max(0.78, (reach - outer + 90) / reach);
      box = { left: fx - (fx - box.left) * sc, top: fy - (fy - box.top) * sc, width: box.width * sc, height: box.height * sc };
    }
  }
  // The farthest step's head (or a raised fist, for a goal) stays clear under the title.
  {
    const head = goal ? box.top : box.top + Math.max(0, face[1] - face[3]) * box.height;
    const need = clipTop + (story ? 30 : 22) - (head + 3 * sy);
    if (need > 0) box = { ...box, top: box.top + need };
  }
  // His outer edge (a raised arm) stays on the canvas where the photo frame didn't cut him: nudge him in.
  {
    const frameCut = (onLeft ? data.cut?.left : data.cut?.right) ?? 0;
    const outer = onLeft ? 20 - box.left - box.width * 0.01 : box.left + box.width * 0.99 - (CANVAS_W - 20);
    if (!frameCut && outer > 0) box = { ...box, left: box.left + dir * Math.min(outer, 90) };
  }
  // The farthest step stays (nearly) whole on the free side: slide the group back, as far as his own side allows.
  {
    const far = dir > 0 ? box.left + box.width * 0.99 + 3 * sx - (CANVAS_W - 16) : 16 - (box.left + box.width * 0.01 + 3 * sx);
    const frameCut = (onLeft ? data.cut?.left : data.cut?.right) ?? 0;
    const room = frameCut ? 999 : dir > 0 ? box.left + box.width * 0.01 - 16 : CANVAS_W - 16 - (box.left + box.width * 0.99);
    const slide = Math.max(0, Math.min(far, room, story ? 110 : 90));
    if (slide > 0) box = { ...box, left: box.left - dir * slide };
  }
  // Everything melts into the paper above the foot.
  const fadeTo = footTop - (story ? 50 : 34);
  const fadeFrom = fadeTo - (story ? 420 : 300);
  const fade: [number, number] = [fadeFrom, fadeTo];
  const imgFade = `linear-gradient(to bottom, #000 ${Math.round(fadeFrom - box.top)}px, transparent ${Math.round(fadeTo - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center", ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 56% at ${50 + dir * 8}% 40%, ${light}, ${paper} 62%, ${edge})` }} />

      {/* Three flat tints of his silhouette, farthest (palest) first. */}
      {data.photoUrl && (
        <div data-bleed style={{ position: "absolute", inset: 0, clipPath: `inset(${clipTop}px 0 0 0)` }} aria-hidden>
          {steps.map((c, i) => {
            const n = 3 - i;
            return <GiantShape key={i} id={`paperstep-${goal ? "g" : "m"}${n}`} url={data.photoUrl!} box={{ ...box, left: box.left + sx * n, top: box.top + sy * n }} H={H} color={c} close={5} fade={fade} />;
          })}
        </div>
      )}

      <ContactShade box={box} H={H} bottom={fadeTo} ink={ink} toLeft={!onLeft} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: imgFade, maskImage: imgFade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: goal ? "contrast(1.03) saturate(1.03)" : "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, goal ? 400 : 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR + 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nameSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK, 500, goal ? { opacity: 0.78 } : undefined) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: ink, opacity: 0.72 }}>{when}</div>}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <PaperTooth />
    </div>
  );
}

/**
 * Paper steps: stepsilhouette on warm off-white paper — the player in natural colour and behind him three flat
 * copies of his silhouette stepping back diagonally to the free side, tints of the club colour growing paler
 * towards the paper. The title small in ink at the top; crests, fixture (home first, names exactly as stored)
 * and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Paperstep({ data }: { data: RenderData }) {
  return <PaperStepSilhouette data={data} />;
}
