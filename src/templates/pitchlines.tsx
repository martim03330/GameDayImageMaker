/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** Dark green-grey, for clubs whose colour makes a poor deep ground (white, yellow, grey, black). */
const TURF = "#1b2420";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/**
 * Pitch lines: a flat deep club tone with the markings of a pitch drawn as fine, faint hairlines seen from
 * straight above — touchlines, the halfway line and the centre circle around his head and chest, and at the
 * foot the top of a penalty area with its arc, which frames the info. The player in natural colour; title
 * and info small and precise.
 */
export function Pitchlines({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const nudge = params.side === "left" ? -1 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const neutral = hueOf(club) == null || luminance(club) > 0.42;
  const ground = neutral ? TURF : shade(club, -0.6);
  const low = shade(ground, -0.45);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = postType === "result" && !!score;

  /* ---- the player, centred; the centre circle around his head and chest ---- */
  const M = 64;
  const cx = 540 + nudge * 12;
  const faceTop = story ? 560 : 330;
  const box = story ? placeByFace(data, cx, faceTop, { chest: 320, waist: 256, knees: 196, full: 150 }) : placeByFace(data, cx, faceTop, { chest: 236, waist: 186, knees: 142, full: 108 });
  const R = story ? 380 : 300;
  const cy = faceTop + (params.playerY ?? 0) + Math.min(box.faceH * 0.95, R * 0.8);

  /* ---- type ---- */
  const title = hasScore ? "Full Time" : titleCase(content.kicker || "MATCHDAY");
  const comp = titleCase(f.comp || f.round || "");
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const W = story ? 820 : 760;
  const fit = (t: string, max: number, e = 0.54) => Math.max(12 * k, Math.min(max * k * ts, W / Math.max(1, t.length * e)));
  const fixSize = fit(fixture, 23);
  const whenSize = Math.min(fixSize * 0.78, fit(when, 17));
  const compSize = Math.min(13 * k * ts, fit(comp, 13, 0.9));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const cS = story ? 56 : 42;

  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const footBottom = (story ? H - STORY_BOTTOM + logoH + 62 : 44 + logoH + 30) - (params.textY ?? 0);
  const blockH = fixSize * 1.2 + (when ? whenSize * 1.2 + 9 * k : 0);
  const topY = (story ? STORY_TOP : 60) + (params.textY ?? 0);

  /* ---- the markings (top view, stylised scale): penalty area top edge just above the info, arc above it ---- */
  const line = "rgba(255,255,255,.2)";
  const sw = story ? 2 : 1.6;
  const tl = 40; // touchlines
  const boxTop = H - footBottom - blockH - (story ? 70 : 50);
  const boxW = story ? 820 : 780;
  const arcR = boxW * 0.227; // 9.15 m on a 40.3 m wide area
  const spotY = boxTop + boxW * 0.136; // the spot 5.5 m inside the area
  const arcDy = Math.sqrt(Math.max(0, arcR * arcR - (spotY - boxTop) ** 2));
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 55% at 50% ${Math.round((cy / H) * 100)}%, ${shade(ground, 0.07)}, ${ground} 60%, ${low} 100%)` }} />

      {/* Touchlines, halfway line, centre circle and spot — under the player. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke={line} strokeWidth={sw}>
          <line x1={tl} y1={-10} x2={tl} y2={H + 10} />
          <line x1={CANVAS_W - tl} y1={-10} x2={CANVAS_W - tl} y2={H + 10} />
          <line x1={tl} y1={cy} x2={CANVAS_W - tl} y2={cy} />
          <circle cx={540} cy={cy} r={R} />
        </g>
        <circle cx={540} cy={cy} r={story ? 6 : 5} fill={line} />
      </svg>

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {/* His lower body settles into the ground before the penalty area. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: boxTop - (story ? 520 : 360), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}f0 ${story ? 440 : 300}px, ${ground})` }} />

      {/* The penalty area's top edge and its arc, over the fade: they frame the info. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke={line} strokeWidth={sw}>
          <line x1={tl} y1={-10} x2={tl} y2={H + 10} />
          <line x1={CANVAS_W - tl} y1={-10} x2={CANVAS_W - tl} y2={H + 10} />
          <path d={`M ${540 - boxW / 2} ${H + 10} L ${540 - boxW / 2} ${boxTop} L ${540 + boxW / 2} ${boxTop} L ${540 + boxW / 2} ${H + 10}`} />
          <path d={`M ${540 - arcDy} ${boxTop} A ${arcR} ${arcR} 0 0 1 ${540 + arcDy} ${boxTop}`} />
        </g>
      </svg>

      {/* Top: title + competition left, crests right. */}
      <div style={{ position: "absolute", left: M + 8, top: topY, display: "flex", flexDirection: "column", gap: 14 * k }}>
        <div style={{ ...caps, fontSize: 17 * k * ts }}>{title}</div>
        {comp && <div style={{ ...caps, fontWeight: 400, letterSpacing: "0.22em", fontSize: compSize, opacity: 0.6 }}>{comp}</div>}
      </div>
      <div style={{ position: "absolute", right: M + 8, top: topY - 4, display: "flex", gap: 16 * k, alignItems: "center" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />
        ))}
      </div>

      {/* Foot, inside the penalty area: the fixture, then date · kick-off · ground. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: "center", gap: 9 * k, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        <div style={{ fontSize: fixSize, fontWeight: 500 }}>{fixture}</div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 300, opacity: 0.7 }}>{when}</div>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: logoBottom, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={story ? 26 : 20} style={{ transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      </div>
      <Film strength={0.16} />
    </div>
  );
}
