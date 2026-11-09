/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";

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
 * Stage: the player alone in a soft pool of light on a dark, faintly club-tinted floor — a gentle cone
 * from above, an ellipse of light on the floor under him, everything else near-black. The title small and
 * wide-tracked at the top; the fixture and date · kick-off · ground small at the foot.
 */
export function Stage({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  // Native 9:16 story: title under the profile bar, the foot above the reply bar, a taller stage between.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const black = shade(club, -0.93);
  const floorTint = shade(club, -0.82);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the foot, measured from the bottom ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const whenTop = story ? STORY_BOTTOM - 108 - 44 - 27 : CANVAS_H - 44 - 52 - 34 - 18;
  const fixTop = whenTop - (story ? 50 : 36);

  /* ---- the player on the floor ---- */
  const floor = fixTop - (story ? 100 : 96);
  const cx = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const fig = story ? standStory(data, { cx, headTop: STORY_TOP + 150, floor, maxFace: 170 }) : standing(data, { cx, headTop: 250, floor, maxFace: 130, framing: "full" });
  const feetY = fig.feet ? fig.top + fig.height : floor;
  const fade = fig.feet
    ? undefined
    : `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, floor - 260 - fig.top)}px, transparent ${floor + 10 - fig.top}px)`;

  /* ---- the light ---- */
  const poolW = Math.max(520, Math.min(760, fig.width * 0.95));
  const poolH = poolW * 0.2;
  const coneTop = story ? -60 : -160;
  const coneTopW = 150;

  /* ---- type ---- */
  const title = (isResult && postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.62;
  const tSize = Math.max(11, Math.min(16 * (story ? 1.5 : 1), 620 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);

  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = shortName(oursName);
  const opp = f.opp ? shortName(typed ?? f.opp) : "";
  const pair = weHost ? [ours, opp] : [opp, ours];
  const fixture = ours && opp ? pair.join(isResult ? `   ${score}   ` : "   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.34;
  const fSize = Math.max(11, Math.min(15 * k, 860 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), isResult ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ") || titleCase(f.comp || f.round || "");
  const wSize = Math.max(13, Math.min(17 * k, 900 / Math.max(1, when.length * 0.52))) * ts;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });
  const pcx = fig.left + fig.width / 2;
  const lx = Math.max(300, Math.min(780, pcx));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: black, color: WHITE }}>
      {/* The floor: a faint club tint fading up into the dark. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: feetY - 260, bottom: 0, background: `linear-gradient(to bottom, ${black}, ${floorTint} 55%, ${black})` }} />

      {/* The cone from above. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, filter: "blur(38px)" }} aria-hidden>
        <defs>
          <linearGradient id="stage-cone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".17" />
            <stop offset=".55" stopColor="#fff" stopOpacity=".07" />
            <stop offset="1" stopColor="#fff" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <polygon points={`${lx - coneTopW / 2},${coneTop} ${lx + coneTopW / 2},${coneTop} ${lx + poolW * 0.56},${feetY + 20} ${lx - poolW * 0.56},${feetY + 20}`} fill="url(#stage-cone)" />
      </svg>
      {/* A soft halo where the light gathers around him. */}
      <div style={{ position: "absolute", left: lx - 380, top: fig.faceTop - 120, width: 760, height: Math.max(400, feetY - fig.faceTop + 60), borderRadius: "50%", background: `radial-gradient(closest-side, ${shade(club, -0.45)}66, transparent)`, filter: "blur(30px)" }} />

      {/* The pool of light on the floor. */}
      <div style={{ position: "absolute", left: lx - poolW / 2 - 60, top: feetY - poolH / 2 - 14, width: poolW + 120, height: poolH + 28, borderRadius: "50%", background: `radial-gradient(closest-side, ${shade(club, 0.55)}55, transparent)`, filter: "blur(14px)" }} />
      <div style={{ position: "absolute", left: lx - poolW / 2, top: feetY - poolH / 2, width: poolW, height: poolH, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,.34), rgba(255,255,255,.12) 62%, transparent)", filter: "blur(6px)" }} />
      {/* His contact shadow. */}
      {fig.feet && <div style={{ position: "absolute", left: pcx - fig.width * 0.32, top: feetY - 18, width: fig.width * 0.64, height: 34, borderRadius: "50%", background: "rgba(0,0,0,.6)", filter: "blur(10px)" }} />}

      {/* The player, natural colour, a touch of stage contrast. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.06) brightness(.97)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* The dark closing in at the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 70% at ${(lx / CANVAS_W) * 100}% 52%, transparent 55%, ${black}cc 100%)` }} />

      {/* Top: the title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK), opacity: 0.88 }}>{title}</div>

      {/* Foot: the fixture, then date · kick-off · ground. */}
      {fixture && <div style={{ position: "absolute", left: 60, right: 60, top: fixTop, ...caps(fSize, F_TRACK) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: 60, right: 60, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: wSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.66)" }}>{when}</div>}

      <AgencyLogo data={data} height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.24} />
    </div>
  );
}
