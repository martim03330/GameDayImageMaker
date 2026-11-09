/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
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

/** How far the script word slides under the serif one, in script ems. */
const OVERLAP = 0.04;

/**
 * Serene: the calm sibling of the zoom burst. His own photo melted into soft colour fields, lifted and
 * gently desaturated; the player sharp and centred in natural colour. A small script + italic serif title
 * at the top with a hairline and the competition in spaced caps; at the foot only the crests either side
 * of a "v" (or the score) and one quiet line of date, kick-off and ground.
 */
export function Serene({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  // Native story (1080×1920): title from STORY_TOP, logo ending at STORY_BOTTOM, bigger type and player.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.25 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const showScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- title: small, at the top centre ---- */
  const [first, second] = split(content.kicker);
  const ts = params.textScale ?? 1;
  const TS = story ? 1.5 : 1;
  let sv = 92 * ts * TS;
  let sd = 78 * ts * TS;
  const total = (a: number, b: number) => (first ? vibesEm(first) * a * (1 - OVERLAP) : 0) + dmiEm(second) * b;
  const k = Math.min(1, (story ? 860 : 620) / total(sv, sd));
  sv *= k;
  sd *= k;
  const titleTop = (story ? STORY_TOP : 86) + (params.textY ?? 0);
  const ruleY = titleTop + sd * 1.12;
  const tag = (f.comp || f.round || "").trim();
  const tagSize = Math.max(11, Math.min(14, 640 / Math.max(1, tag.length * 0.95))) * (story ? 1.35 : 1);
  const titleBottom = ruleY + (tag ? (story ? 58 : 42) : 10);

  /* ---- the player, centred, his head clear of the title ---- */
  const faceTop = story ? Math.max(titleBottom + 80, 500) : Math.max(titleBottom + 70, 330);
  const box = placeByFace(data, 540, faceTop, story ? { chest: 350, waist: 285, knees: 220, full: 178 } : { chest: 240, waist: 188, knees: 146, full: 116 });

  /* ---- the backdrop: his own photo melted into colour fields ---- */
  const own = data.bgPhotoUrl;
  const scene = own ? null : sceneOf(data);
  const back = own ?? scene;

  /* ---- the foot ---- */
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const line = facts.length ? facts.join("   ·   ") : name;
  const lineSize = story ? Math.max(20, Math.min(30, 940 / Math.max(1, line.length * 0.53))) : Math.max(15, Math.min(21, 860 / Math.max(1, line.length * 0.52)));
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const crestSize = story ? 96 : 60;
  const lineTop = story ? STORY_BOTTOM - 115 - 44 - Math.round(lineSize * 1.2) : 1350 - 44 - 60 - 52;
  const crestTop = lineTop - (story ? 146 : 96);
  // He melts away above the foot, so the crests and facts sit on the colour fields, never on his legs.
  const fadeTo = crestTop - 24 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 260}px, transparent ${fadeTo}px)`;
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.35)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.55), color: WHITE }}>
      {/* Colour fields: the photo blurred to soft shapes, lifted and a touch desaturated. */}
      {back ? (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -140, top: -140, width: CANVAS_W + 280, height: H + 280, maxWidth: "none", objectFit: "cover", filter: "blur(46px) saturate(.72) brightness(1.06) contrast(.9)" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 42%, ${shade(club, 0.1)}, ${shade(club, -0.5)})` }} />
      )}
      {/* A milky lift, then a quiet darkening at the top and the foot so the white type sits calmly. */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(236,232,226,.12)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 700 : 420, background: "linear-gradient(to bottom, rgba(0,0,0,.26), transparent)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 520, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.42))" }} />

      {/* The player, sharp, in natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) drop-shadow(0 24px 50px rgba(0,0,0,.28))", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 560 : 380, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.38))" }} />

      {/* Title: script word sliding under the italic serif word, hairline, competition. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, display: "flex", justifyContent: "center", alignItems: "baseline", whiteSpace: "nowrap", ...soft }}>
        {first && <span style={{ fontFamily: VIBES, fontSize: sv, lineHeight: 1, marginRight: -sv * OVERLAP, position: "relative", top: sv * 0.06 }}>{first}</span>}
        <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: sd, lineHeight: 1, letterSpacing: "-0.01em" }}>{second}</span>
      </div>
      <div style={{ position: "absolute", left: 540 - (story ? 90 : 70), top: ruleY, width: story ? 180 : 140, height: 1, background: "rgba(255,255,255,.75)" }} />
      {tag && (
        <div style={{ position: "absolute", left: 0, right: 0, top: ruleY + (story ? 22 : 18), textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: tagSize, letterSpacing: "0.34em", paddingLeft: "0.34em", lineHeight: 1, textTransform: "uppercase", ...soft }}>
          {tag}
        </div>
      )}

      {/* Foot: crests either side of a "v" (or the score), then one line of facts. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crestSize + 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 34 * S }}>
          <img src={crests[0]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.35))" }} />
          {crests[1] && (
            <>
              <span style={{ ...soft, fontFamily: DMSERIF, fontStyle: "italic", fontSize: (showScore ? 40 : 28) * (story ? 1.4 : 1), lineHeight: 1, minWidth: 30, textAlign: "center" }}>{showScore ? score : "v"}</span>
              <img src={crests[1]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.35))" }} />
            </>
          )}
        </div>
      )}
      {line && (
        <div style={{ position: "absolute", left: 56, right: 56, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: lineSize, letterSpacing: "0.06em", lineHeight: 1.2, ...soft }}>{line}</div>
      )}

      <AgencyLogo data={data} height={story ? 28 : 20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.25} />
    </div>
  );
}
