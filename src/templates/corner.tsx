/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (/\d/.test(c) ? 60 : CAPS_W[c] ?? 64) / 100 + tracking, 0);
/** Inter mixed case, roughly 0.55em per glyph. */
const textEm = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").length * 0.55;

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
  return titleCase(s || n);
}

/**
 * Corner: photo-led. The player big and cropped in natural colour on a deep club-tone ground (or his own
 * photo melted dark), and every word packed into one small, tightly set block in the free bottom corner —
 * two tiny crests, the title in tracked caps, a hairline, the fixture, date · kick-off, the ground.
 */
export function Corner({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 7);
  const playerRight = params.side !== "left";
  const useOwn = !!data.bgPhotoUrl && r() < 0.5;
  // Native Instagram story (1080×1920): logo at STORY_TOP, the block ending at STORY_BOTTOM, ~1.4× type, a bigger player.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const deep = shade(club, -0.7);
  const deeper = shade(club, -0.84);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player: big, cropped, pushed to his side ---- */
  const faceX = playerRight ? (story ? 712 : 640) : story ? 368 : 440;
  const box = story ? placeByFace(data, faceX, 340, { chest: 440, waist: 370, knees: 320, full: 280 }) : placeByFace(data, faceX, 130, { chest: 340, waist: 300, knees: 260, full: 240 });
  // A photo cut on his side runs off that edge of the canvas (face kept well inside); a cut on the free side
  // melts softly into the ground.
  const faceCx = box.left + box.width * ((data.face?.[0] ?? 0.38) + (data.face?.[2] ?? 0.24) / 2);
  if (playerRight && (data.cut?.right ?? 0) > 0 && box.left + box.width < CANVAS_W) box.left += Math.max(0, Math.min(CANVAS_W - box.left - box.width, CANVAS_W - 220 - faceCx));
  if (!playerRight && (data.cut?.left ?? 0) > 0 && box.left > 0) box.left -= Math.max(0, Math.min(box.left, faceCx - 220));

  /* ---- the block ---- */
  const BW = 380 * k; // the block's measure
  const title = (postType === "result" && hasScore ? "Full Time" : content.kicker || "Matchday").toUpperCase().replace(/’/g, "'");
  const tTrack = 0.34;
  const tSize = Math.min(34 * k * ts, BW / Math.max(1, capsEm(title, tTrack)));
  const ours = shortName(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp);
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const fSize = Math.min(24 * k * ts, BW / Math.max(1, textEm(fixture)));
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const wSize = Math.min(19 * k * ts, BW / Math.max(1, textEm(when)));
  const venue = titleCase(f.venue);
  const comp = titleCase(f.comp || "");
  const small = (t: string, max: number) => Math.min(max * k * ts, BW / Math.max(1, textEm(t)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const side: CSSProperties = playerRight ? { left: M, alignItems: "flex-start", textAlign: "left" } : { right: M, alignItems: "flex-end", textAlign: "right" };
  const line = (size: number, weight: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.15, whiteSpace: "nowrap", color: WHITE, ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      {useOwn ? (
        <img
          src={data.bgPhotoUrl!}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(44px) saturate(.7) brightness(.5)" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at ${playerRight ? 64 : 36}% 34%, ${shade(club, -0.5)}, ${deep} 55%, ${deeper} 100%)` }} />
      )}

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut, 2.4) }}
        />
      )}
      {/* A low shade on the free corner, so the block reads over any arm or ball. */}
      <div style={{ position: "absolute", inset: 0, background: story ? `radial-gradient(80% 32% at ${playerRight ? 0 : 100}% 80%, ${deeper}f0, ${deeper}99 50%, transparent 100%)` : `radial-gradient(60% 42% at ${playerRight ? 0 : 100}% 100%, ${deeper}e6, ${deeper}66 55%, transparent 100%)` }} />

      {/* The block. */}
      <div style={{ position: "absolute", bottom: (story ? H - STORY_BOTTOM : M + 6) - (params.textY ?? 0), ...side, display: "flex", flexDirection: "column", maxWidth: BW + 20 }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 14 * k, marginBottom: 26 * k }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 34 * k, height: 34 * k, objectFit: "contain" }} />
            ))}
          </div>
        )}
        <div style={line(tSize, 600, { letterSpacing: `${tTrack}em`, marginRight: `-${tTrack}em`, lineHeight: 1 })}>{title}</div>
        <div style={{ width: 48 * k, height: 1, background: "rgba(255,255,255,.65)", margin: `${22 * k}px 0 ${20 * k}px` }} />
        {fixture && <div style={line(fSize, 500, { letterSpacing: "-0.01em" })}>{fixture}</div>}
        {when && <div style={line(wSize, 300, { marginTop: 8 * k, opacity: 0.88 })}>{when}</div>}
        {(venue || comp) && (
          <div style={{ marginTop: 16 * k, display: "flex", flexDirection: "column", gap: 4 * k, alignItems: "inherit" }}>
            {comp && <div style={line(small(comp, 15), 400, { opacity: 0.6 })}>{comp}</div>}
            {venue && <div style={line(small(venue, 15), 400, { opacity: 0.6 })}>{venue}</div>}
          </div>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", [playerRight ? "left" : "right"]: M, top: (story ? STORY_TOP : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: playerRight ? "left top" : "right top" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
