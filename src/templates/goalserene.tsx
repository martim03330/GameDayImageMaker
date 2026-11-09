/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { VIBES } from "./panelscript";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** DM Serif Display italic: advance widths per 100px (measured in the browser). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
/** Great Vibes: advance widths per 100px. */
const VIBES_W: Record<string, number> = { a: 35.8, b: 32.7, c: 26.3, d: 37.2, e: 25.6, f: 19.4, g: 39.6, h: 33.6, i: 17.6, j: 17.8, k: 36, l: 21.3, m: 50.9, n: 33.8, o: 33.8, p: 33.6, q: 34.7, r: 25.9, s: 26.7, t: 20.1, u: 35.6, v: 30.9, w: 49.5, x: 33.4, y: 38.1, z: 34.3, " ": 17.1, "-": 40.4, A: 71.6, B: 104.7, C: 71.4, D: 105, E: 81.9, F: 105.3, G: 70.2, H: 139.5, I: 91.7, J: 97.2, K: 120.3, L: 71.6, M: 133.6, N: 104.4, O: 73, P: 92.5, Q: 75.6, R: 102.8, S: 92.6, T: 93.3, U: 94.7, V: 98, W: 135.1, X: 79.1, Y: 96.3, Z: 68.1 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const dmiEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
const vibesEm = (t: string) => plain(t).reduce((a, c) => a + (VIBES_W[c] ?? 34) / 100, 0);

/** "HAT-TRICK" → "Hat-trick", "GOAL" → "Goal", "GOLAZO!" → "Golazo!". */
const sentence = (t: string) => {
  const s = t.replace(/’/g, "'").trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** How far the script word slides under the serif one, in script ems. */
const OVERLAP = 0.06;

/**
 * Goal serene: the goal post of `serene` / `zoomburst`. His own photo melted into soft colour fields, the
 * celebrating player sharp in the middle, and across his lower body an elegant pair: the title in script
 * ("Goal", "Brace") sliding into his surname in italic serif. At the foot only the crests either side of
 * the score, and the competition in small spaced caps.
 */
export function Goalserene({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the foot on the reply bar's safe line, the pair and the crests a
  // size up, the player filling the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const S = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");

  /* ---- the foot (fixed, measured from the bottom) ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const tag = titleCase(f.comp || f.round || "").trim().toUpperCase();
  const tagSize = Math.max(11, Math.min(14 * S, 640 / Math.max(1, tag.length * 0.95)));
  const tagTop = story ? STORY_BOTTOM - 88 - 62 - tagSize : CANVAS_H - 44 - 60 - 46;
  const crestTop = tagTop - 30 * S - 60 * S;
  const crestSize = 54 * S;
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  /* ---- the player, centred, face high ---- */
  const sizes = story ? { chest: 330, waist: 258, knees: 202, full: 160 } : { chest: 230, waist: 182, knees: 142, full: 112 };
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  let box = placeByFace(data, faceX, story ? STORY_TOP + 150 : 190, sizes);
  // A fist raised to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop = box.top + face[1] * box.height;
  const chin = faceTop + box.faceH;

  /* ---- the pair: script title + italic serif surname, across his waist ---- */
  const first = sentence(content.kicker || "Goal");
  const surname = (content.lastName || content.firstName || "").trim();
  const second = surname ? surname.charAt(0).toUpperCase() + surname.slice(1) : "";
  let sv = 170 * S;
  let sd = 150 * S;
  const W = story ? 900 : 840;
  const total = (a: number, b: number) => vibesEm(first) * a * (1 - (second ? OVERLAP : 0)) + (second ? 0.3 * b + dmiEm(second) * b : 0);
  const k = Math.min(1, W / total(sv, sd)) * ts;
  sv *= k;
  sd *= k;
  const titleW = total(sv, sd);
  // Across his lower body: well under the chin, above the foot.
  const baseline = Math.min(crestTop - 70 * S, Math.max(chin + box.faceH * 2.4 + sd * 0.7, story ? 1260 : 820)) + (params.textY ?? 0);
  const titleLeft = (CANVAS_W - titleW) / 2;

  /* ---- the backdrop: his own photo melted into colour fields ---- */
  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);
  const fadeTo = crestTop - 20 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 300}px, transparent ${fadeTo}px)`;
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.35)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: shade(club, -0.55), color: WHITE }}>
      {/* Colour fields: the photo blurred to soft shapes, lifted and a touch desaturated. */}
      {back ? (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -140, top: -140, width: CANVAS_W + 280, height: CH + 280, maxWidth: "none", objectFit: "cover", filter: "blur(50px) saturate(.75) brightness(1.04) contrast(.9)" }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 42%, ${shade(club, 0.1)}, ${shade(club, -0.5)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(236,232,226,.1)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 620, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.4))" }} />

      {/* The player, sharp, natural colour, melting away above the foot; a soft shade under him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin + box.faceH * 0.6, width: box.width * 0.6, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.22)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 640 : 380, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.36))" }} />

      {/* The pair across his lower body. */}
      <div style={{ position: "absolute", left: titleLeft, top: baseline - sd * 0.95, display: "flex", alignItems: "baseline", whiteSpace: "nowrap", textShadow: "0 4px 26px rgba(0,0,0,.5), 0 1px 4px rgba(0,0,0,.22)" }}>
        <span style={{ fontFamily: VIBES, fontSize: sv, lineHeight: 1, marginRight: second ? -sv * OVERLAP : 0, position: "relative", top: sv * 0.04, color: WHITE }}>{first}</span>
        {second && <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: sd, lineHeight: 1, letterSpacing: "-0.01em", color: WHITE, marginLeft: sd * 0.3 }}>{second}</span>}
      </div>

      {/* Foot: crests either side of the score, then the competition. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: 60 * S, display: "flex", justifyContent: "center", alignItems: "center", gap: 32 * S }}>
          <img src={crests[0]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.35))" }} />
          {crests[1] && (
            <>
              <span style={{ ...soft, fontFamily: DMSERIF, fontStyle: "italic", fontSize: (score ? 40 : 28) * S, lineHeight: 1, minWidth: 30, textAlign: "center" }}>{score || "v"}</span>
              <img src={crests[1]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.35))" }} />
            </>
          )}
        </div>
      )}
      {tag && (
        <div style={{ position: "absolute", left: 56, right: 56, top: tagTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: tagSize, letterSpacing: "0.34em", paddingLeft: "0.34em", lineHeight: 1, ...soft }}>{tag}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.22} />
    </div>
  );
}
