/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
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
 * Goal lockup: the goal post of `lockup`. The celebrating player big and cropped in natural colour over his own
 * photo blurred dark (or a deep club tone), and one small centred lockup low on the canvas: crest · hairline ·
 * the title ("GOAL") in wide-tracked caps · hairline · his name · the fixture (home first, "v"). No score.
 */
export function Goallockup({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.4 : 1);
  const k = story ? 1.4 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const f = matchFacts(data);

  /* ---- the player, big ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  let box = placeByFace(data, faceX, story ? STORY_TOP + 110 : 130, story ? { chest: 430, waist: 360, knees: 285, full: 220 } : { chest: 340, waist: 285, knees: 225, full: 170 });
  // A fist raised to one side: centre the figure a little rather than the face.
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const back = data.bgPhotoUrl ?? sceneOf(data);

  /* ---- the lockup ---- */
  const title = (content.kicker || "Goal").toUpperCase().replace(/’/g, "'");
  const tTrack = 0.6;
  const tSize = Math.min(36 * ts, (story ? 900 : 760) / Math.max(1, capsEm(title, tTrack)));
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const nTrack = 0.3;
  const nSize = Math.min(18 * ts, (story ? 860 : 680) / Math.max(1, capsEm(name, nTrack)));
  const ours = shortName(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp);
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const pair = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const fixture = pair.join(" v ");
  const fTrack = 0.22;
  const fSize = Math.min(14 * ts, (story ? 820 : 640) / Math.max(1, capsEm(fixture, fTrack)));
  const crest = f.ourCrest;

  const logoBottom = (story ? H - STORY_BOTTOM : 46) - (params.logoY ?? 0);
  const lockBottom = (story ? H - STORY_BOTTOM + 152 : 150) - (params.textY ?? 0);
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
        <img src={back} alt="" style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(.8) brightness(.62) contrast(1.05)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 35%, ${shade(club, -0.45)}, ${shade(club, -0.8)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(club, -0.75)}55, transparent 40%)` }} />

      {/* A soft shade behind him instead of a drop shadow on the cutout. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: box.top + box.height * 0.2, width: box.width * 0.7, height: box.height * 0.7, borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: "blur(70px)" }} />
      {/* The player, big, natural colour. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.02)", ...cutMask(data.cut) }} />
      )}
      {/* Bottom gradient for the lockup. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 1020 : 580, background: story ? "linear-gradient(to bottom, transparent, rgba(0,0,0,.5) 24%, rgba(0,0,0,.8) 44%, rgba(0,0,0,.86) 70%)" : "linear-gradient(to bottom, transparent, rgba(0,0,0,.38) 40%, rgba(0,0,0,.8))" }} />

      {/* The lockup. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: lockBottom, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {crest && <img src={crest} alt="" style={{ width: 50 * k, height: 50 * k, objectFit: "contain", marginBottom: 26 * k, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />}
        <div style={rule(64 * k)} />
        <div style={{ ...caps(tSize, tTrack, 600), margin: `${24 * k}px 0` }}>{title}</div>
        <div style={rule(64 * k)} />
        {name && <div style={{ ...caps(nSize, nTrack, 500), marginTop: 24 * k }}>{name}</div>}
        {fixture && <div style={{ ...caps(fSize, fTrack, 400, { color: "rgba(255,255,255,.66)" }), marginTop: 14 * k }}>{fixture}</div>}
      </div>

      <AgencyLogo data={data} height={story ? 24 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.2} />
    </div>
  );
}
