/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film, GradientMapDefs } from "./fx";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** The frame's inset from the canvas edge, and the gap its labels leave in the line. */
const IN = 44;
const LINE = "rgba(255,255,255,.62)";

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/**
 * Museum label: the whole ground one deep club tone (his own photo blurred and gradient-mapped to that
 * single hue, low contrast), the player in natural colour inside a thin hairline frame. The frame's top
 * edge is broken by the title in spaced caps, its foot by "OURS — THEM", its sides by the date and the
 * kick-off running vertically; crests small inside the top corners, the agency logo in a bottom corner.
 */
export function Inset({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  // Native story (1080×1920): the frame runs from STORY_TOP to STORY_BOTTOM (its labels centred on the lines);
  // the ground continues above and below it; type, crests and player a size up.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.4 : 1;
  const TOP = story ? STORY_TOP + 12 : IN;
  const BOT = story ? H - STORY_BOTTOM + 11 : IN;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const dark = shade(club, -0.78);
  const mid = shade(club, -0.5);
  const light = shade(club, -0.18);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the four labels ---- */
  const title = (isResult && postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const foot = opp && ours ? (isResult ? `${pair[0]}  ${score}  ${pair[1]}` : `${pair[0]}  —  ${pair[1]}`) : name;
  const left = niceDate(content.date).toUpperCase() || (f.comp || "").toUpperCase();
  const right = f.time ? `KICK-OFF ${f.time}` : [f.comp, f.round].map((t) => (t || "").toUpperCase()).find((t) => t && t !== left) ?? "";

  // Tiny spaced caps, shrunk so a long label never fills more than its share of the edge.
  const ts = params.textScale ?? 1;
  const capsSize = (t: string, room: number, max: number) => Math.max(11, Math.min(max, room / Math.max(1, t.length * 1.12))) * ts * S;
  const caps = (size: number, spacing = 0.5): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${spacing}em`, color: WHITE, whiteSpace: "nowrap", lineHeight: 1 });
  const titleSize = capsSize(title, 560, 17);
  const footSize = capsSize(foot, 620, 15);
  const sideSize = (t: string) => capsSize(t, 520, 13);

  /* ---- the player, centred inside the frame, fading out above its foot ---- */
  const box = story
    ? placeByFace(data, 540 + (params.side === "left" ? -20 : 20), 430, { chest: 340, waist: 272, knees: 210, full: 166 })
    : placeByFace(data, 540 + (params.side === "left" ? -20 : 20), 260, { chest: 220, waist: 172, knees: 134, full: 104 });
  const fadeEnd = H - BOT - 40;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 230 - box.top}px, transparent ${fadeEnd - box.top}px)`;

  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]) as (string | null)[];
  const crestFilter = params.crestColor ? "none" : "url(#inset-mono)";
  const hair = (style: CSSProperties) => <div style={{ background: LINE, flex: 1, ...style }} />;
  const gap = 22 * S;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: mid, color: WHITE }}>
      <GradientMapDefs id="inset-tone" dark={dark} mid={mid} light={light} />
      <MonoDefs id="inset-mono" ink={0.55} />

      {/* One deep tone: his photo, blurred and mapped to the club hue, contrast pressed flat. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -100, top: -100, width: CANVAS_W + 200, height: H + 200, maxWidth: "none", objectFit: "cover", filter: "blur(22px) url(#inset-tone) contrast(.8)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 40%, transparent, ${dark}88)` }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) drop-shadow(0 22px 44px rgba(0,0,0,.35))", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The frame: four hairlines, each broken by its label. */}
      <div style={{ position: "absolute", left: IN, right: IN, top: TOP, height: 1, display: "flex", alignItems: "center" }}>
        {hair({ height: 1 })}
        <span style={{ ...caps(titleSize, 0.6), padding: `0 ${gap}px 0 ${gap + titleSize * 0.6}px` }}>{title}</span>
        {hair({ height: 1 })}
      </div>
      <div style={{ position: "absolute", left: IN, right: IN, bottom: BOT, height: 1, display: "flex", alignItems: "center" }}>
        {hair({ height: 1 })}
        {foot && <span style={{ ...caps(footSize, 0.42), padding: `0 ${gap}px 0 ${gap + footSize * 0.42}px` }}>{foot}</span>}
        {hair({ height: 1 })}
      </div>
      {/* Sides: read bottom-to-top on the left, top-to-bottom on the right. */}
      <div style={{ position: "absolute", left: IN, top: TOP, bottom: BOT, width: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hair({ width: 1 })}
        {left && <span style={{ ...caps(sideSize(left), 0.42), writingMode: "vertical-rl", transform: "rotate(180deg)", padding: `${gap}px 0 ${gap + sideSize(left) * 0.42}px` }}>{left}</span>}
        {hair({ width: 1 })}
      </div>
      <div style={{ position: "absolute", right: IN, top: TOP, bottom: BOT, width: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hair({ width: 1 })}
        {right && <span style={{ ...caps(sideSize(right), 0.42), writingMode: "vertical-rl", padding: `${gap + sideSize(right) * 0.42}px 0 ${gap}px` }}>{right}</span>}
        {hair({ width: 1 })}
      </div>

      {/* Crests, small, inside the top corners. */}
      {crests[0] && <img src={crests[0]} alt="" style={{ position: "absolute", left: IN + 30, top: TOP + (story ? 36 : 30), width: 50 * S, height: 50 * S, objectFit: "contain", filter: crestFilter }} />}
      {crests[1] && <img src={crests[1]} alt="" style={{ position: "absolute", right: IN + 30, top: TOP + (story ? 36 : 30), width: 50 * S, height: 50 * S, objectFit: "contain", filter: crestFilter }} />}

      <AgencyLogo data={data} height={story ? 28 : 18} style={{ position: "absolute", right: IN + 30, bottom: BOT + (story ? 77 : 28) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }} />
      <Film strength={0.2} />
    </div>
  );
}
