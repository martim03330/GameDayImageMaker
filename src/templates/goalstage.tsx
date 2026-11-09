/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { standing } from "./mist";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
/** The warm light of the goal: a soft tungsten white. */
const WARM = "#ffe6c4";

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
  return (s || n).toUpperCase();
}

/** standing() for the 9:16 story: a cropped photo reaches down to the floor (not the post's 1350) before it fades. */
function standStory(data: RenderData, o: { cx: number; headTop: number; floor: number; maxFace: number }) {
  const fig = standing(data, { ...o, framing: "full" });
  if (fig.feet) return fig;
  const p = data.params;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  const depth: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
  const framing = p.framing ?? "full";
  const crop = Math.min(1, depth[framing] ? face[1] + face[3] * depth[framing] : 1);
  let h = (o.floor + 30 - o.headTop) / Math.max(0.2, crop - hair);
  const cap = Math.min(o.maxFace * 1.25, data.facePx > 0 ? data.facePx * 2.1 : 400);
  if (h * face[3] > cap) h = cap / face[3];
  h *= p.playerScale ?? 1;
  const top = o.floor + 30 - (crop - hair) * h - hair * h + (p.playerY ?? 0);
  const w = h * (data.photoAspect ?? 0.5);
  const fx = data.face ? face[0] + face[2] / 2 : 0.5;
  const left = o.cx - fx * w + (p.playerX ?? 0);
  return { left, top, width: w, height: h, feet: false, faceCx: left + (face[0] + face[2] / 2) * w, faceTop: top + face[1] * h, faceH: face[3] * h };
}

/**
 * Goal stage: the goal post of `stage`. The celebrating player alone in a pool of light on a dark floor,
 * the light a little warmer and brighter than the matchday stage. "GOAL" small and wide-tracked at the
 * top; his name and the fixture (never the score) small at the foot.
 */
export function Goalstage({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const black = shade(club, -0.93);
  const floorTint = shade(club, -0.8);

  const f = matchFacts(data);

  /* ---- the foot: name, then the fixture, measured from the bottom ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = shortName(oursName);
  const opp = f.opp ? shortName(typed ?? f.opp) : "";
  const pair = weHost ? [ours, opp] : [opp, ours];
  const fixture = ours && opp ? pair.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fSize = Math.max(11, Math.min(15 * k, 880 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.22;
  const nSize = Math.max(16, Math.min(30 * k, 860 / Math.max(1, capsEm(name, N_TRACK)))) * ts;

  const fixBottom = story ? STORY_BOTTOM - logoH - 62 : CANVAS_H - 44 - logoH - 30;
  const fixTop = fixBottom - fSize;
  const nameTop = fixTop - (story ? 26 : 20) - nSize;

  /* ---- the player on the floor ---- */
  const floor = (name ? nameTop : fixTop) - (story ? 110 : 84);
  const cx = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const fig = story ? standStory(data, { cx, headTop: STORY_TOP + 230, floor, maxFace: 175 }) : standing(data, { cx, headTop: 270, floor, maxFace: 130, framing: "full" });
  const feetY = fig.feet ? fig.top + fig.height : floor;
  const fade = fig.feet
    ? undefined
    : `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, floor - 260 - fig.top)}px, transparent ${floor + 10 - fig.top}px)`;

  /* ---- the light: warmer and a touch brighter than the matchday stage ---- */
  const poolW = Math.max(540, Math.min(780, fig.width * 0.95));
  const poolH = poolW * 0.2;
  const coneTop = story ? -60 : -160;
  const coneTopW = 160;

  /* ---- type ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.7;
  const tSize = Math.max(12, Math.min(17 * (story ? 1.5 : 1), 640 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });
  const pcx = fig.left + fig.width / 2;
  const lx = Math.max(300, Math.min(780, pcx));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: black, color: WHITE }}>
      {/* The floor: a faint club tint fading up into the dark. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: feetY - 260, bottom: 0, background: `linear-gradient(to bottom, ${black}, ${floorTint} 55%, ${black})` }} />

      {/* The warm cone from above. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, filter: "blur(40px)" }} aria-hidden>
        <defs>
          <linearGradient id="goalstage-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={WARM} stopOpacity=".26" />
            <stop offset=".55" stopColor={WARM} stopOpacity=".1" />
            <stop offset="1" stopColor={WARM} stopOpacity=".15" />
          </linearGradient>
        </defs>
        <polygon points={`${lx - coneTopW / 2},${coneTop} ${lx + coneTopW / 2},${coneTop} ${lx + poolW * 0.58},${feetY + 20} ${lx - poolW * 0.58},${feetY + 20}`} fill="url(#goalstage-cone)" />
      </svg>
      {/* A warm halo where the light gathers around him. */}
      <div style={{ position: "absolute", left: lx - 400, top: fig.faceTop - 160, width: 800, height: Math.max(440, feetY - fig.faceTop + 80), borderRadius: "50%", background: `radial-gradient(closest-side, ${WARM}26, ${shade(club, -0.45)}33 60%, transparent)`, filter: "blur(34px)" }} />

      {/* The pool of light on the floor. */}
      <div style={{ position: "absolute", left: lx - poolW / 2 - 70, top: feetY - poolH / 2 - 16, width: poolW + 140, height: poolH + 32, borderRadius: "50%", background: `radial-gradient(closest-side, ${WARM}55, transparent)`, filter: "blur(14px)" }} />
      <div style={{ position: "absolute", left: lx - poolW / 2, top: feetY - poolH / 2, width: poolW, height: poolH, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,240,220,.48), rgba(255,232,200,.16) 62%, transparent)", filter: "blur(6px)" }} />
      {fig.feet && <div style={{ position: "absolute", left: pcx - fig.width * 0.3, top: feetY - 18, width: fig.width * 0.6, height: 34, borderRadius: "50%", background: "rgba(0,0,0,.6)", filter: "blur(10px)" }} />}

      {/* The player, natural colour, warmed a touch by the light. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.06) brightness(1.02) sepia(.06) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* The dark closing in at the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(78% 70% at ${(lx / CANVAS_W) * 100}% 50%, transparent 56%, ${black}cc 100%)` }} />

      {/* Top: the title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK), opacity: 0.92 }}>{title}</div>

      {/* Foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: 50, right: 50, top: nameTop, ...caps(nSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: 50, right: 50, top: fixTop, ...caps(fSize, F_TRACK, 400), color: "rgba(255,255,255,.66)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.22} />
    </div>
  );
}
