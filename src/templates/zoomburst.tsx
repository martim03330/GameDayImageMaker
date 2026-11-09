/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { VIBES } from "./panelscript";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** DM Serif Display italic: advance widths per 100px (measured in the browser). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
/** Great Vibes: advance widths per 100px. */
const VIBES_W: Record<string, number> = { a: 35.8, b: 32.7, c: 26.3, d: 37.2, e: 25.6, f: 19.4, g: 39.6, h: 33.6, i: 17.6, j: 17.8, k: 36, l: 21.3, m: 50.9, n: 33.8, o: 33.8, p: 33.6, q: 34.7, r: 25.9, s: 26.7, t: 20.1, u: 35.6, v: 30.9, w: 49.5, x: 33.4, y: 38.1, z: 34.3, " ": 17.1, "-": 40.4, A: 71.6, B: 104.7, C: 71.4, D: 105, E: 81.9, F: 105.3, G: 70.2, H: 139.5, I: 91.7, J: 97.2, K: 120.3, L: 71.6, M: 133.6, N: 104.4, O: 73, P: 92.5, Q: 75.6, R: 102.8, S: 92.6, T: 93.3, U: 94.7, V: 98, W: 135.1, X: 79.1, Y: 96.3, Z: 68.1 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
const vibesEm = (t: string) => plain(t).reduce((a, c) => a + (VIBES_W[c] ?? 34) / 100, 0);

/** "MATCHDAY" → script "Match" + serif "Day"; "MAN OF THE MATCH" → "Man of the" + "Match"; one word: serif alone. */
function split(kicker: string): [string, string] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim().replace(/^(MATCH|GAME)DAY$/, "$1 DAY").replace(/^FULLTIME$/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean).map((w, i) => (i > 0 && /^(OF|THE|AND)$/.test(w) ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase()));
  if (words.length < 2) return ["", words[0] ?? ""];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

/** How many zoomed copies make the burst, and how far the last one is scaled. */
const STEPS = 16;
const REACH = 0.5;

/**
 * Zoom-burst matchday (Man United "Next Match"): his own photo exploded outwards in a radial zoom blur
 * from his chest, the player sharp in the middle of it; across his waist an elegant title, a script word
 * and an italic serif one with a small club-colour tag under it; at the foot the two teams either side of
 * their crests, then the date, kick-off and ground in a quiet sans.
 */
export function Zoomburst({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 61;
  const r = rng(seed);
  const right = params.side !== "left";
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920): his head up near STORY_TOP, the player larger, the title across his waist, the foot
  // built up from STORY_BOTTOM; type ~1.3×.
  const q = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");

  /* ---- the player, near the middle ---- */
  const cx = 540 + (right ? 1 : -1) * (20 + r() * 30);
  // Face high in the frame, body running off the foot; the framing sets how close he is.
  const box = placeByFace(data, cx, story ? STORY_TOP + 120 : 210, story ? { chest: 330, waist: 262, knees: 200, full: 160 } : { chest: 250, waist: 196, knees: 150, full: 120 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceTop = box.top + face[1] * box.height;
  // The burst explodes from his chest.
  const ox = faceCx;
  const oy = faceTop + box.faceH * 2.2;

  /* ---- the picture that gets burst: his own photo, laid exactly under the cutout ---- */
  const own = data.bgPhotoUrl;
  const scene = own ? null : sceneOf(data);
  const frame = (style?: CSSProperties) =>
    own ? (
      <img src={own} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...style }} />
    ) : scene ? (
      <img src={scene} alt="" style={{ position: "absolute", left: -40, top: -40, width: CANVAS_W + 80, height: H + 80, maxWidth: "none", objectFit: "cover", ...style }} />
    ) : null;

  /* ---- title across his waist ---- */
  const [first, second] = split(content.kicker);
  const W = 940;
  let sv = 150;
  let sd = 176;
  const gap = 30;
  const total = (a: number, b: number) => (first ? vibesEm(first) * a + gap : 0) + dmiEm(second) * b;
  const k = Math.min(1, W / total(sv, sd)) * (params.textScale ?? 1);
  sv *= k;
  sd *= k;
  const titleW = total(sv, sd);
  // Waist height, but always well clear of his chin and above the foot block.
  const waist = faceTop + box.faceH * 3.5;
  // In the story the foot is built up from STORY_BOTTOM: logo, ground, date, then the teams row.
  const whenSize = 24 * q;
  const venueText = titleCase(f.venue);
  const venueSize = Math.max(17, Math.min(22 * q, 760 / Math.max(1, venueText.length * 0.55)));
  const infoH = (whenSize + (venueText ? venueSize + 10 : 0)) * 1.2;
  const storyFoot = STORY_BOTTOM - 108 - 44 - infoH - 146;
  const baseline = (story ? Math.min(storyFoot - sd * 0.45 - 60, Math.max(faceTop + box.faceH * 1.6 + sd * 0.75, Math.min(waist, storyFoot - sd * 0.45 - 60))) : Math.min(970, Math.max(faceTop + box.faceH * 1.6 + sd * 0.75, 760, Math.min(waist, 960)))) + (params.textY ?? 0);
  const titleLeft = (CANVAS_W - titleW) / 2;
  const tag = (postType === "result" && score ? "Full Time" : titleCase(f.comp || f.round || "")).trim();
  const tagSize = Math.max(15, Math.min(22, 420 / Math.max(1, tag.length * 0.55))) * q;

  /* ---- the foot ---- */
  // The names as typed ("USC Paredes"), home first.
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const oppName = typed ?? titleCase(f.opp);
  const teams = content.home === false ? [oppName, ours] : [ours, oppName];
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]) as (string | null)[];
  const teamSize = (t: string) => Math.max(17, Math.min(26 * q, (story ? 360 : 330) / Math.max(1, [...t].length * 0.55)));
  const when = [niceDate(content.date), f.time].filter(Boolean).join("  |  ");
  const venue = venueText;
  const footTop = story ? storyFoot : Math.max(baseline + sd * 0.45 + 40, 1040);
  const small: CSSProperties = { fontFamily: SANS, fontWeight: 500, color: WHITE, whiteSpace: "nowrap", lineHeight: 1.2, textShadow: "0 2px 10px rgba(0,0,0,.55)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.75), color: WHITE }}>
      {/* Edges: the same photo, heavily blurred, wherever the burst does not reach. */}
      {own ? (
        <img src={own} alt="" style={{ position: "absolute", left: -80, top: -80, width: CANVAS_W + 160, height: H + 160, maxWidth: "none", objectFit: "cover", filter: "blur(40px) brightness(.7) saturate(1.1)" }} />
      ) : (
        !scene && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 40%, ${shade(club, -0.2)}, ${shade(club, -0.8)})` }} />
      )}

      {/* The burst: copies scaled out from his chest, each a little weaker, averaged into radial streaks. */}
      <div style={{ position: "absolute", inset: 0, filter: "saturate(1.12) contrast(1.05) brightness(.92)" }}>
        {Array.from({ length: STEPS }, (_, i) => {
          const sc = 1 + (REACH * i) / (STEPS - 1);
          return (
            <div key={i} style={{ position: "absolute", inset: 0, transform: `scale(${sc.toFixed(4)})`, transformOrigin: `${ox}px ${oy}px`, opacity: 1 / (i + 1) }}>
              {frame({ filter: "blur(3px)" })}
            </div>
          );
        })}
      </div>
      {/* Light blown out where the burst starts, cooler towards the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 45% at ${ox}px ${oy}px, rgba(255,245,230,.22), transparent 70%)`, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at ${ox}px ${oy}px, transparent 45%, ${shade(club, -0.85)}b0 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 640, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.35) 40%, rgba(0,0,0,.72))" }} />

      {/* The player, sharp in the middle of it. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05) drop-shadow(0 20px 40px rgba(0,0,0,.4))", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 780 : 420, background: story ? "linear-gradient(to bottom, transparent, rgba(0,0,0,.5) 35%, rgba(0,0,0,.62))" : "linear-gradient(to bottom, transparent, rgba(0,0,0,.5))" }} />

      {/* Title across his waist: script word, italic serif word, a club-colour tag under the script. */}
      <div style={{ position: "absolute", left: titleLeft, top: baseline - sd * 0.95, display: "flex", alignItems: "baseline", gap, whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(0,0,0,.45)" }}>
        {first && (
          <span style={{ position: "relative", fontFamily: VIBES, fontSize: sv, lineHeight: 1, color: WHITE }}>
            {first}
            {tag && (
              <span style={{ position: "absolute", right: sv * 0.05, top: "100%", marginTop: -sv * 0.12, background: club, color: WHITE, fontFamily: SANS, fontWeight: 600, fontSize: tagSize, lineHeight: 1, padding: story ? "7px 12px 8px" : "6px 10px 7px", borderRadius: 3, textShadow: "none", whiteSpace: "nowrap" }}>
                {tag}
              </span>
            )}
          </span>
        )}
        <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: sd, lineHeight: 1, letterSpacing: "-0.01em", color: WHITE }}>{second}</span>
      </div>
      {!first && tag && (
        <div style={{ position: "absolute", left: 0, right: 0, top: baseline + sd * 0.22 + (story ? 8 : 0), textAlign: "center" }}>
          <span style={{ background: club, color: WHITE, fontFamily: SANS, fontWeight: 600, fontSize: tagSize, lineHeight: 1, padding: story ? "7px 12px 8px" : "6px 10px 7px", borderRadius: 3 }}>{tag}</span>
        </div>
      )}

      {/* Foot: team · crest  crest · team (or the score between the crests), then date and ground. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: footTop, display: "grid", gridTemplateColumns: "1fr auto auto auto 1fr", alignItems: "center", columnGap: 26 }}>
        <span style={{ ...small, fontSize: teamSize(teams[0]), textAlign: "right" }}>{teams[0]}</span>
        {crests[0] ? <img src={crests[0]} alt="" style={{ width: 76 * q, height: 76 * q, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.5))" }} /> : <span />}
        <span style={{ ...small, fontFamily: DMSERIF, fontStyle: "italic", fontSize: (postType === "result" && score ? 44 : 26) * q }}>{postType === "result" && score ? score : "v"}</span>
        {crests[1] ? <img src={crests[1]} alt="" style={{ width: 76 * q, height: 76 * q, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.5))" }} /> : <span />}
        <span style={{ ...small, fontSize: teamSize(teams[1]), textAlign: "left" }}>{teams[1]}</span>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: footTop + (story ? 146 : 112), textAlign: "center", display: "flex", flexDirection: "column", gap: story ? 10 : 6, alignItems: "center" }}>
        {when && <div style={{ ...small, fontSize: whenSize }}>{when}</div>}
        {venue && <div style={{ ...small, fontSize: venueSize, opacity: 0.85 }}>{venue}</div>}
      </div>

      <AgencyLogo data={data} height={story ? 24 : 22} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
    </div>
  );
}
