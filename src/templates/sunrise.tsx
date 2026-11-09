/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/**
 * Sunrise: a large half-disc in the club colour rising from the bottom edge behind the player, like a sun
 * on the horizon, on a pale tint of the same colour. The player stands in front in natural colour and
 * settles into the disc; the title in medium Inter at the top; the fixture, date and ground small in white
 * on the disc, over the agency logo. Two colours and the photo.
 */
export function Sunrise({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;

  /* ---- the two colours: the club colour (deep enough for white type) and a pale tint of it ---- */
  let sun = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(sun) > 0.5) sun = vivid(params.accent);
  if (luminance(sun) > 0.3) sun = shade(sun, -0.35);
  else if (luminance(sun) > 0.2) sun = shade(sun, -0.15);
  if (luminance(sun) < 0.015) sun = "#1d1f26";
  const ground = shade(sun, 0.9);
  const ink = shade(sun, -0.72);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = postType === "result" && !!score;

  /* ---- the sun: centred on the bottom edge ---- */
  const R = story ? 600 : 520;
  const sunTop = H - R;

  /* ---- the player: centred, his chest rising over the disc ---- */
  const flip = params.side === "left";
  const faceX = 540 + (flip ? -24 : 24);
  const sizes = story ? { chest: 360, waist: 290, knees: 228, full: 168 } : { chest: 240, waist: 190, knees: 146, full: 110 };
  // His head (hair included) stays clear under the title block, whatever the crop of the photo.
  const headRoom = story ? STORY_TOP + 230 : 220;
  let faceTop = story ? STORY_TOP + 340 : 268;
  let box = placeByFace(data, faceX, faceTop, sizes);
  for (let i = 0; i < 3 && faceTop - box.faceH * 0.75 < headRoom; i++) {
    faceTop = headRoom + box.faceH * 0.75;
    box = placeByFace(data, faceX, faceTop, sizes);
  }

  /* ---- type ---- */
  const kicker = hasScore ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase());
  const tSize = Math.min(76 * k * ts, (CANVAS_W * 0.7) / Math.max(1, kicker.length * 0.56));
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(12 * k, Math.min(15 * k * ts, 820 / Math.max(1, comp.length * 0.62)));
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const infoW = story ? 820 : 700;
  const fit = (t: string, max: number, em = 0.52) => Math.max(12 * k, Math.min(max * k * ts, infoW / Math.max(1, t.length * em)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const cS = Math.round(34 * k);
  const fixSize = fit(fixture, 22, crests.length === 2 ? 0.6 : 0.52);
  const whenSize = Math.min(fixSize * 0.8, fit(when, 17));

  /* ---- the foot, on the disc: logo at the bottom, the info above it ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 40) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const footBottom = (story ? H - STORY_BOTTOM + logoH + 62 : 40 + logoH + 30) - (params.textY ?? 0);
  // Where the info sits, the disc is a solid club colour: his legs fade into it there.
  const fadeFrom = H - footBottom - (story ? 340 : 260);
  const fadeTo = H - footBottom - (story ? 70 : 50);
  const pct = (y: number) => `${Math.max(0, Math.min(100, ((y - sunTop) / (2 * R)) * 100)).toFixed(2)}%`;
  const disc: CSSProperties = { position: "absolute", left: 540 - R, top: sunTop, width: 2 * R, height: 2 * R, borderRadius: "50%" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* The sun on the horizon. */}
      <div style={{ ...disc, background: sun }} />
      {/* A soft contact shadow where he meets the disc. */}
      <div style={{ position: "absolute", left: faceX - 300, top: sunTop - 40, width: 600, height: 260, background: "radial-gradient(closest-side, rgba(0,0,0,.12), transparent)", filter: "blur(26px)" }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}
      {/* He settles into the disc low down (inside the disc only), so the foot reads clean. */}
      <div style={{ ...disc, background: `linear-gradient(to bottom, ${sun}00 ${pct(fadeFrom)}, ${sun} ${pct(fadeTo)})` }} />

      {/* Title: medium Inter, centred at the top, the competition small under it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: (story ? STORY_TOP : 58) + (params.textY ?? 0), display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * k }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.03em", whiteSpace: "nowrap", color: ink }}>{kicker}</div>
        {comp && (
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: compSize, letterSpacing: "0.22em", paddingLeft: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap", color: sun, lineHeight: 1 }}>{comp}</div>
        )}
      </div>

      {/* Foot, white on the disc: crest · fixture · crest, then date · kick-off · ground. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2, color: WHITE }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * k }}>
          {crests.length === 2 && <img src={crests[0]} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />}
          <div style={{ fontSize: fixSize, fontWeight: 500 }}>{fixture}</div>
          {crests.length === 2 && <img src={crests[1]} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />}
        </div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 400, opacity: 0.78 }}>{when}</div>}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: logoBottom, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={story ? 26 : 20} style={{ transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      </div>
      <Film strength={0.1} />
    </div>
  );
}
