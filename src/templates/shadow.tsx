/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;
const FLOOR = 1150;

/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (/\d/.test(c) ? 60 : CAPS_W[c] ?? 64) / 100 + tracking, 0);
const textEm = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").length * 0.55;

function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
  return titleCase(s || n);
}

/**
 * Shadow: late-afternoon light. The player standing full length on a pale warm floor (sand, or a deep club
 * tone by seed), the low sun throwing his long soft shadow diagonally across the ground towards the free
 * side. The title small at the top, the fixture, date · kick-off and ground small at the foot of the free side.
 */
export function Shadow({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  const right = params.side !== "left"; // the player's side; the shadow runs to the other one
  const dir = right ? -1 : 1;
  const dark = r() < 0.3;
  // Native Instagram story (1080×1920): a taller figure on a lower floor, title at STORY_TOP, the
  // foot block, then the logo under it on the free side ending at STORY_BOTTOM, type ~1.35×.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.35 : 1;
  const floor = story ? 1540 : FLOOR;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);

  const ink = dark ? "#ffffff" : "#2b241b";
  const soft = dark ? "rgba(255,255,255,.66)" : "rgba(43,36,27,.62)";
  const g0 = dark ? shade(club, -0.3) : "#f3ece0";
  const g1 = dark ? shade(club, -0.46) : "#e6d7bf";
  const g2 = dark ? shade(club, -0.6) : "#d9c6a8";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, standing on the floor ---- */
  const cx = right ? 700 + r() * 20 : 380 - r() * 20;
  const stand = standing(data, { cx, headTop: story ? 300 : 300, floor, maxFace: story ? 168 : 120, framing: "full" });
  const box = stand.feet ? stand : { ...placeByFace(data, cx, story ? 340 : 330, story ? { chest: 330, waist: 270, knees: 220, full: 168 } : { chest: 220, waist: 180, knees: 150, full: 120 }), feet: false };
  const footY = stand.feet ? floor : H + 10;
  const footX = stand.feet ? stand.faceCx : box.left + box.width / 2;

  /* ---- the cast shadow: his cutout, flattened onto the floor and thrown across it ---- */
  const lean = 58 + r() * 6;
  const flat = 0.4;
  const shadowA = dark ? 0.62 : 0.3;
  const shadowFade = "linear-gradient(to top, #000 0%, rgba(0,0,0,.75) 35%, rgba(0,0,0,.25) 85%, rgba(0,0,0,.12) 100%)";
  const castStyle = (blur: number, opacity: number, mask: string): CSSProperties => ({
    position: "absolute",
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    transformOrigin: `${footX - box.left}px ${footY - box.top}px`,
    transform: `skewX(${dir * -lean}deg) scaleY(${flat})`,
    opacity,
    WebkitMaskImage: mask,
    maskImage: mask,
  });

  /* ---- type ---- */
  const title = (postType === "result" && hasScore ? "Full Time" : content.kicker || "Matchday").toUpperCase().replace(/’/g, "'");
  const tTrack = 0.42;
  const tSize = Math.min(20 * k * ts, 440 / Math.max(1, capsEm(title, tTrack)));
  const BW = 400 * k;
  const ours = shortName(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp);
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const fSize = Math.min(22 * k * ts, BW / Math.max(1, textEm(fixture)));
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  ·  ");
  const wSize = Math.min(18 * k * ts, BW / Math.max(1, textEm(when)));
  const venue = titleCase(f.venue);
  const vSize = Math.min(14 * k * ts, BW / Math.max(1, textEm(venue)));
  const comp = titleCase(f.comp || "");
  const cSize = Math.min(12 * k * ts, 380 / Math.max(1, capsEm(comp, 0.22)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const free: CSSProperties = right ? { left: M, alignItems: "flex-start", textAlign: "left" } : { right: M, alignItems: "flex-end", textAlign: "right" };
  const his: CSSProperties = right ? { right: M, alignItems: "flex-end", textAlign: "right" } : { left: M, alignItems: "flex-start", textAlign: "left" };
  const topY = (story ? STORY_TOP : M + 4) + (params.textY ?? 0);
  const line = (size: number, weight: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.2, whiteSpace: "nowrap", color: ink, ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: g1 }}>
      {/* The ground: the low sun warming the corner it comes from. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${g0} 0%, ${g1} 62%, ${g2} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 60% at ${right ? 100 : 0}% 30%, ${dark ? "rgba(255,226,180,.16)" : "rgba(255,248,232,.7)"}, transparent 70%)` }} />

      {/* The long shadow: crisp at his feet, softening and fading as it runs away. */}
      {data.photoUrl && (
        <>
          <div style={castStyle(0, shadowA, `${shadowFade}`)}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "brightness(0) blur(10px)" }} />
          </div>
          <div style={castStyle(0, shadowA * 0.9, `linear-gradient(to top, #000 0%, #000 12%, transparent 40%)`)}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "brightness(0) blur(3px)" }} />
          </div>
        </>
      )}
      {/* Contact shade under his feet. */}
      {stand.feet && (
        <div style={{ position: "absolute", left: footX - box.width * 0.32, top: floor - 14, width: box.width * 0.64, height: 28, borderRadius: "50%", background: `rgba(0,0,0,${dark ? 0.45 : 0.28})`, filter: "blur(10px)" }} />
      )}

      {/* The player, natural colour, warmed a touch by the low sun. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.02) sepia(.06)", ...cutMask(data.cut) }}
        />
      )}

      {/* Top: the title, small, with the competition opposite. */}
      <div style={{ position: "absolute", top: topY, ...free, display: "flex", flexDirection: "column" }}>
        <div style={line(tSize, 600, { letterSpacing: `${tTrack}em`, marginRight: `-${tTrack}em`, lineHeight: 1 })}>{title}</div>
        <div style={{ width: 40 * k, height: 1, background: soft, marginTop: 18 * k }} />
      </div>
      {comp && (
        <div style={{ position: "absolute", top: topY + (tSize - cSize) / 2, ...his, ...line(cSize, 500, { letterSpacing: "0.22em", textTransform: "uppercase", color: soft, lineHeight: 1 }) }}>{comp}</div>
      )}

      {/* Foot of the free side: crests, fixture, date · kick-off, ground. */}
      <div style={{ position: "absolute", bottom: story ? H - STORY_BOTTOM + 152 : 60, ...free, display: "flex", flexDirection: "column" }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 12 * k, marginBottom: 20 * k }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 32 * k, height: 32 * k, objectFit: "contain" }} />
            ))}
          </div>
        )}
        {fixture && <div style={line(fSize, 500, { letterSpacing: "-0.01em" })}>{fixture}</div>}
        {when && <div style={line(wSize, 300, { marginTop: 6 * k })}>{when}</div>}
        {venue && <div style={line(vSize, 400, { marginTop: 10 * k, color: soft })}>{venue}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight={!dark}
        style={{ position: "absolute", [right !== story ? "right" : "left"]: M, bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right !== story ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
