/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film, type Box } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 60;

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/** His silhouette filled with one colour (the cutout used as a mask), blurred into light. */
function Silhouette({ url, box, color, blur, opacity, grow = 1, dy = 0, mask }: { url: string; box: Box; color: string; blur: number; opacity: number; grow?: number; dy?: number; mask?: (top: number) => string }) {
  const w = box.width * grow;
  const h = box.height * grow;
  const shape = `url("${url}")`;
  // The fade sits on a wrapper well larger than the figure, so it never clips the blur into a rectangle.
  const pad = blur * 3;
  return (
    <div style={{ position: "absolute", left: box.left - (w - box.width) / 2 - pad, top: box.top - (h - box.height) * 0.35 + dy - pad, width: w + 2 * pad, height: h + 2 * pad, WebkitMaskImage: mask?.(box.top - (h - box.height) * 0.35 + dy - pad), maskImage: mask?.(box.top - (h - box.height) * 0.35 + dy - pad), opacity }}>
      <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
        <div style={{ position: "absolute", left: pad, top: pad, width: w, height: h, background: color, WebkitMaskImage: shape, maskImage: shape, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }} />
      </div>
    </div>
  );
}

/**
 * Goallight: a goal at night. A near-black ground, the player rim-lit by a strong club-coloured light from
 * behind (his own silhouette tinted and blurred into a glow hugging him), a faint beam falling from the top.
 * The title small in wide-tracked white caps at the top; the score between the crests at the foot.
 */
export function Goallight({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the title under the profile bar, the foot on the reply bar's safe
  // line, a size up, the player filling the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const S = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.5) club = vivid(params.accent);
  if (luminance(club) > 0.6) club = shade(club, -0.3);
  if (luminance(club) < 0.04) club = shade(club, 0.35);
  // The light: the club colour, lifted so it glows even for deep navies and maroons.
  const light = luminance(club) < 0.12 ? shade(club, 0.38) : shade(club, 0.12);
  const core = shade(club, 0.55);
  const night = shade(club, -0.9);

  const f = matchFacts(data);
  // Home side first: from content.home, else from the typed team names against our club.
  const lc = (t?: string) => (t ?? "").toLowerCase().trim();
  const oursName = data.club?.name ?? "";
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const score = scoreOf(data, " – ");

  /* ---- the title ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.62;
  const tSize = Math.max(18, Math.min(46 * S, 900 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP - tSize * 0.2 : 92) + (params.textY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const N_TRACK = 0.42;
  const nSize = Math.max(11, Math.min(14 * S, 700 / Math.max(1, capsEm(name, N_TRACK)))) * ts;

  /* ---- the foot ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const compTop = story ? STORY_BOTTOM - 88 - 60 - 18 : CANVAS_H - 44 - 52 - 40 - 12;
  const crests = (!weHost ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = !weHost ? [opp, ours] : [ours, opp];
  const teams = opp && ours ? `${pair[0]}  ·  ${pair[1]}` : "";
  const comp = [f.comp, f.round].filter(Boolean).join(" · ");
  const line = [teams, comp].filter(Boolean).join("   ·   ") || comp;
  const L_TRACK = 0.26;
  const lSize = Math.max(10, Math.min(13 * S, 940 / Math.max(1, capsEm(line, L_TRACK)))) * ts;
  // Story: the teams get their own, larger line above the competition (one long line reads too small).
  const split = story && !!teams && !!comp;
  const tLine = Math.max(12, Math.min(16 * S, 900 / Math.max(1, capsEm(teams, L_TRACK)))) * ts;
  const cLine = Math.max(10, Math.min(13 * S, 900 / Math.max(1, capsEm(comp, L_TRACK)))) * ts;
  const teamsTop = compTop - tLine - 16 * S;
  const rowTop = (split ? teamsTop : compTop) - 78 * S;

  /* ---- the player ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const faceTop = titleTop + tSize + (story ? 220 : 150);
  // The light's source: just above the top, or (story) just under the profile bar so its flare shows.
  const sky = story ? 170 : 0;
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 340, waist: 266, knees: 206, full: 160 } : { chest: 250, waist: 196, knees: 150, full: 116 });
  const fadeEnd = rowTop - 20 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 340}px, transparent ${fadeEnd}px)`;
  // Glow fades by canvas height (its wrappers start at different tops).
  const glowEndY = rowTop - 60;
  const glowFade = (top: number) => `linear-gradient(to bottom, #000 0, #000 ${glowEndY - 400 - top}px, transparent ${glowEndY - top}px)`;

  const caps = (size: number, track: number, weight: number): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: "#050608", color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at ${faceX}px 52%, ${night}, #050608 100%)` }} />

      {/* The beam: a soft shaft of light falling from the top onto him, and its flare. */}
      <div style={{ position: "absolute", left: faceX - 520, top: -120 + sky, width: 1040, height: faceTop - sky + 560, filter: "blur(30px)", opacity: 0.7 }}>
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 80,
            width: 840,
            height: faceTop - sky + 400,
            clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)",
            background: `linear-gradient(to bottom, ${core}88, ${light}2a 55%, transparent)`,
          }}
        />
      </div>
      <div style={{ position: "absolute", left: faceX - 260, top: -170 + sky, width: 520, height: 300, borderRadius: "50%", background: `radial-gradient(closest-side, ${core}aa, ${light}33 55%, transparent)` }} />

      {/* The rim light: his silhouette in the club colour, wide and soft, then tight around his edges. */}
      {data.photoUrl && (
        <>
          <Silhouette url={data.photoUrl} box={box} color={light} blur={90} opacity={0.55} grow={1.16} mask={glowFade} />
          <Silhouette url={data.photoUrl} box={box} color={light} blur={34} opacity={0.85} grow={1.05} mask={glowFade} />
          <Silhouette url={data.photoUrl} box={box} color={core} blur={8} opacity={0.9} grow={1.012} dy={-4} mask={glowFade} />
        </>
      )}

      {/* The player, natural colour, a touch darker as if lit from behind. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "brightness(.9) contrast(1.08) saturate(.95)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the title, a hairline, his name. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 600), textShadow: `0 0 30px ${light}66` }}>{title}</div>
      {name && (
        <>
          <div style={{ position: "absolute", left: 540 - 22 * S, top: titleTop + tSize + 26 * S, width: 44 * S, height: 1, background: "rgba(255,255,255,.55)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: titleTop + tSize + 50 * S, ...caps(nSize, N_TRACK, 400), color: "rgba(255,255,255,.72)" }}>{name}</div>
        </>
      )}

      {/* Foot: crests either side of the score, then teams and competition. */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: rowTop, height: 52 * S, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 * S }}>
        {crests[0] && <img src={crests[0]} alt="" style={{ width: 46 * S, height: 46 * S, objectFit: "contain" }} />}
        {score && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 40 * S * ts, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>{score}</div>}
        {crests[1] && <img src={crests[1]} alt="" style={{ width: 46 * S, height: 46 * S, objectFit: "contain" }} />}
      </div>
      {split ? (
        <>
          <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: teamsTop, ...caps(tLine, L_TRACK, 500), color: "rgba(255,255,255,.86)" }}>{teams}</div>
          <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: compTop, ...caps(cLine, L_TRACK, 500), color: "rgba(255,255,255,.58)" }}>{comp}</div>
        </>
      ) : (
        line && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: compTop, ...caps(lSize, L_TRACK, 500), color: "rgba(255,255,255,.62)" }}>{line}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.2} />
    </div>
  );
}
