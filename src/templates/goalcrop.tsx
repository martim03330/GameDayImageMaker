/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 64;

/** Inter capitals (500–700): advance widths per 100px. */
const IC: Record<string, number> = { A: 76, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 76, W: 105.7, X: 73.8, Y: 73.1, Z: 66.4, "-": 46.8, " ": 23.7, "'": 26, ".": 28, "!": 30 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, tracking = 0) => plain(t).reduce((a, c) => a + (IC[c] ?? 66) / 100 + tracking, 0);
const fit = (t: string, w: number, max: number, tracking: number) => Math.min(max, w / Math.max(1, capsEm(t, tracking)));

/**
 * Goal crop: photo-led. The celebration cropped very big (chest up, the face large but never past what the
 * photo's own pixels hold), pushed to one side over his own photo melted into a deep tone. In the free
 * margin the title runs small and vertical; at the foot his name in tracked caps and the fixture, tiny.
 */
export function Goalcrop({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // A native 9:16 story (1080×1920): the logo starts at STORY_TOP, the foot ends at STORY_BOTTOM, type a
  // size larger, and the crop fills the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const deep = shade(club, -0.78);

  const f = matchFacts(data);
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const ours = (weHost ? content.homeTeam : content.awayTeam) || oursName;
  const opp = (weHost ? content.awayTeam : content.homeTeam) || f.opp;
  const fixture = (opp ? (weHost ? [ours, opp] : [opp, ours]).filter(Boolean).join("  v  ") : "").toUpperCase();
  const comp = (f.comp || f.round || "").trim().toUpperCase();

  /* ---- the crop: the face big, honouring the photo's resolution ---- */
  const right = params.side !== "left"; // the player sits right, the margin is left (flip with side)
  const want = (story ? 380 : 300) * (params.playerScale ?? 1);
  const faceH = data.facePx > 0 ? Math.min(want, Math.max(170, data.facePx * 2.2)) : want;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  // Never so small that the photo stops short of the foot.
  const faceTop = (story ? 400 : 250) + (params.playerY ?? 0);
  const reach = (H + 30 - faceTop) / Math.max(0.2, 1 - face[1]);
  let h = Math.max(faceH / face[3], reach);
  // A raised fist or arm must stay whole: where the cutout is not cut by its own frame, keep its edge
  // >= PAD inside the canvas. First slide him towards the centre, then (if still too wide) shrink a little,
  // never below the face-size floor or the height that reaches the foot.
  const PAD = 40;
  const freeL = !((data.cut?.left ?? 0) > 0);
  const freeR = !((data.cut?.right ?? 0) > 0);
  const hFloor = Math.max(reach, Math.min(faceH, 170) / face[3]);
  const room = CANVAS_W - (freeL ? PAD : -4000) - (freeR ? PAD : -4000);
  if (h * aspect > room) h = Math.max(hFloor, room / aspect);
  const w = h * aspect;
  const fH = face[3] * h;
  const anchor = face[0] + face[2] / 2;
  let faceCx = (right ? 640 : 440) + (params.playerX ?? 0);
  const minCx = freeL ? PAD + w * anchor : -Infinity; // left edge >= PAD
  const maxCx = freeR ? CANVAS_W - PAD - w * (1 - anchor) : Infinity; // right edge <= W - PAD
  if (minCx <= maxCx) faceCx = Math.max(minCx, Math.min(maxCx, faceCx));
  else faceCx = (minCx + maxCx) / 2; // still too wide at the floor: split the overhang evenly
  const box = { left: faceCx - w * anchor, top: faceTop - h * face[1], width: w, height: h };
  const faceLeft = box.left + face[0] * w;
  const faceRight = faceLeft + face[2] * w;

  /* ---- the vertical title in the free margin ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const kTrack = 0.7;
  const kLen = story ? 860 : 700;
  const kSize = fit(kicker, kLen, 30 * k, kTrack) * ts;
  const kX = right ? MARGIN : CANVAS_W - MARGIN; // the edge the title hugs

  /* ---- the foot ---- */
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = (first ? `${first} ${last}` : last).toUpperCase();
  const colW = story ? 760 : 600;
  const nameSize = fit(name, colW, 24 * k, 0.3) * ts;
  const fixSize = fit(fixture, colW, 13 * k, 0.28) * ts;
  const compSize = fit(comp, colW, 11 * k, 0.32) * ts;
  const footBottom = (story ? H - STORY_BOTTOM : 66) - (params.textY ?? 0);

  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);

  const caps = (size: number, weight: number, track: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: WHITE,
    ...extra,
  });
  const align = right ? "flex-start" : "flex-end";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      {/* His own photo, melted into a deep tone. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(46px) saturate(.6) brightness(.46)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: deep, opacity: 0.38 }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${right ? "to right" : "to left"}, ${deep}e6 0%, ${deep}99 34%, ${deep}33 70%, transparent)` }} />

      {/* The crop, big and sharp; a soft shade behind instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceLeft - fH * 0.6, top: faceTop + fH * 0.6, width: faceRight - faceLeft + fH * 1.2, height: fH * 4, borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 360, background: story ? `linear-gradient(to bottom, transparent, ${deep}99 30%, ${deep}e6 50%, ${deep}f2 62%)` : `linear-gradient(to bottom, transparent, ${deep}d9)` }} />

      {/* The title, small and vertical, reading upwards along the free edge. */}
      <div
        style={{
          position: "absolute",
          left: kX,
          top: story ? STORY_TOP + 170 : 300,
          transformOrigin: "left top",
          transform: right ? "rotate(-90deg) translateX(-100%)" : "rotate(90deg)",
          ...caps(kSize, 600, kTrack),
        }}
      >
        <span style={{ display: "inline-block", width: 40 * k, height: 2, background: WHITE, opacity: 0.7, verticalAlign: "middle", marginRight: "1.1em", position: "relative", top: -2 }} />
        {kicker}
      </div>

      {/* The foot: name and fixture. */}
      <div style={{ position: "absolute", [right ? "left" : "right"]: MARGIN, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: align, gap: 12 * k * ts }}>
        <div style={caps(nameSize, 600, 0.3)}>{name}</div>
        {fixture && <div style={caps(fixSize, 500, 0.28, { opacity: 0.82 })}>{fixture}</div>}
        {comp && <div style={caps(compSize, 500, 0.32, { opacity: 0.58 })}>{comp}</div>}
      </div>

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", [right ? "left" : "right"]: MARGIN, top: (story ? STORY_TOP : 64) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left top" : "right top" }} />
      <Film strength={0.2} />
    </div>
  );
}
