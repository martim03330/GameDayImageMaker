/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Inter 600 capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 64) / 100 + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .replace(/^[\s/·-]+|[\s/·-]+$/g, "");
  return s || n;
}

/**
 * Lockup: a sportswear-campaign poster. The player big and cropped in natural colour over his own photo blurred
 * dark (or a deep club tone), and nothing else but one small, carefully built centred lockup low on the canvas:
 * crest · hairline · the title in wide-tracked caps · hairline · "OURS v THEM" · date and kick-off.
 */
export function Lockup({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920): his head up near STORY_TOP, the player taller, the lockup ~1.4× larger,
  // its logo ending at STORY_BOTTOM.
  const ts = (params.textScale ?? 1) * (story ? 1.4 : 1);
  const k = story ? 1.4 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, big ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const box = placeByFace(data, faceX, story ? STORY_TOP + 120 : 150, story ? { chest: 450, waist: 380, knees: 300, full: 230 } : { chest: 360, waist: 300, knees: 240, full: 180 });
  const back = data.bgPhotoUrl ?? sceneOf(data);

  /* ---- the lockup ---- */
  const title = content.kicker.toUpperCase().replace(/’/g, "'");
  const tTrack = 0.52;
  const tSize = Math.min(34 * ts, (story ? 900 : 760) / Math.max(1, capsEm(title, tTrack)));
  const ours = shortName(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp);
  const mid = hasScore ? ` ${score} ` : " v ";
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(mid) : pair[0] ?? "";
  const fTrack = 0.3;
  const fSize = Math.min(16 * ts, (story ? 820 : 640) / Math.max(1, capsEm(fixture, fTrack)));
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const wSize = Math.min(14 * ts, (story ? 760 : 600) / Math.max(1, capsEm(when, 0.2)));
  const crest = f.ourCrest;

  const logoBottom = (story ? H - STORY_BOTTOM : 46) - (params.logoY ?? 0);
  const lockBottom = (story ? H - STORY_BOTTOM + 150 : 150) - (params.textY ?? 0);
  const caps = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: WHITE,
    ...extra,
  });
  const rule = (w: number): CSSProperties => ({ width: w, height: 1, background: "rgba(255,255,255,.7)" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.72), color: WHITE }}>
      {back ? (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(.8) brightness(.62) contrast(1.05)" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 35%, ${shade(club, -0.45)}, ${shade(club, -0.8)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(club, -0.75)}55, transparent 40%)` }} />

      {/* The player, big, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.02) drop-shadow(0 30px 60px rgba(0,0,0,.4))", ...cutMask(data.cut) }}
        />
      )}
      {/* Bottom gradient for the lockup. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 1020 : 560, background: story ? "linear-gradient(to bottom, transparent, rgba(0,0,0,.5) 24%, rgba(0,0,0,.8) 44%, rgba(0,0,0,.86) 70%)" : "linear-gradient(to bottom, transparent, rgba(0,0,0,.35) 40%, rgba(0,0,0,.78))" }} />

      {/* The lockup. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: lockBottom, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {crest && <img src={crest} alt="" style={{ width: 50 * k, height: 50 * k, objectFit: "contain", marginBottom: 26 * k, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />}
        <div style={rule(64 * k)} />
        <div style={{ ...caps(tSize, tTrack, 600), margin: `${24 * k}px 0` }}>{title}</div>
        <div style={rule(64 * k)} />
        {fixture && <div style={{ ...caps(fSize, fTrack, 500), marginTop: 24 * k }}>{fixture}</div>}
        {when && <div style={{ ...caps(wSize, 0.2, 400, { color: "rgba(255,255,255,.66)" }), marginTop: 14 * k }}>{when}</div>}
      </div>

      <AgencyLogo data={data} height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.2} />
    </div>
  );
}
