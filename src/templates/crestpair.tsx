/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/**
 * Crestpair: both crests as very large, very faint watermarks on a deep club ground — home on the left,
 * away on the right — the player centred in front of them in natural colour, and a small "v" between the
 * two marks just above his head. The title small at the top; the fixture, date · kick-off · ground small
 * at the foot, centred over the agency logo.
 */
export function Crestpair({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#111216" : shade(club, -0.55);
  const low = shade(ground, -0.4);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = postType === "result" && !!score;

  /* ---- the watermarks: home left, away right ---- */
  const home = content.home === false ? f.oppCrest : f.ourCrest;
  const away = content.home === false ? f.ourCrest : f.oppCrest;
  const cSize = story ? 620 : 560;
  const cy = story ? STORY_TOP + 470 : 400;
  const coloured = !!params.crestColor;

  /* ---- the player, centred, his head just under the "v" ---- */
  const faceTop = story ? cy + 150 : cy + 120;
  const box = story ? placeByFace(data, 540, faceTop, { chest: 330, waist: 262, knees: 200, full: 150 }) : placeByFace(data, 540, faceTop, { chest: 250, waist: 196, knees: 150, full: 112 });
  const headTop = faceTop - box.faceH * 0.85;
  const vSize = 40 * k * ts;
  const vY = Math.min(cy, headTop - vSize * 1.4);

  /* ---- type ---- */
  const title = hasScore ? "FULL TIME" : (content.kicker || "MATCHDAY").toUpperCase();
  const comp = titleCase(f.comp || f.round || "");
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const W = story ? 860 : 800;
  const fit = (t: string, max: number, em = 0.53) => Math.max(12 * k, Math.min(max * k * ts, W / Math.max(1, t.length * em)));
  const fixSize = fit(fixture, 22);
  const whenSize = Math.min(fixSize * 0.8, fit(when, 17));
  const compSize = Math.min(14 * k * ts, fit(comp, 14, 0.8));

  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const footBottom = (story ? H - STORY_BOTTOM + logoH + 62 : 44 + logoH + 34) - (params.textY ?? 0);
  const fadeTop = H - footBottom - (story ? 520 : 380);
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.34em", paddingLeft: "0.34em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  const mark = (url: string | null | undefined, cx: number) =>
    url ? (
      <img
        data-bleed
        src={url}
        alt=""
        style={{ position: "absolute", left: cx - cSize / 2, top: cy - cSize / 2, width: cSize, height: cSize, objectFit: "contain", opacity: coloured ? 0.07 : 0.08, filter: coloured ? "grayscale(.2)" : "url(#crestpair-mono)" }}
      />
    ) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="crestpair-mono" ink={0.55} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 50% at 50% ${Math.round((cy / H) * 100)}%, ${shade(ground, 0.12)}, ${ground} 60%, ${low} 100%)` }} />

      {mark(home, story ? 250 : 255)}
      {mark(away, story ? 830 : 825)}

      {/* The small "v" between the two marks. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: vY - vSize * 0.55, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: vSize, lineHeight: 1, color: "rgba(255,255,255,.8)" }}>v</div>

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: fadeTop, bottom: 0, background: `linear-gradient(to bottom, ${low}00, ${low}f2 ${story ? 300 : 240}px, ${low} ${story ? 420 : 320}px)` }} />

      {/* Title: small, top centre, the competition under it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: (story ? STORY_TOP : 60) + (params.textY ?? 0), display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
        <div style={{ ...caps, fontSize: 18 * k * ts }}>{title}</div>
        {comp && <div style={{ ...caps, fontWeight: 400, letterSpacing: "0.2em", paddingLeft: "0.2em", fontSize: compSize, opacity: 0.6 }}>{comp}</div>}
      </div>

      {/* Foot: the fixture, then date · kick-off · ground. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: "center", gap: 9 * k, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        <div style={{ fontSize: fixSize, fontWeight: 500 }}>{fixture}</div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 300, opacity: 0.72 }}>{when}</div>}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: logoBottom, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={story ? 26 : 20} style={{ transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      </div>
      <Film strength={0.18} />
    </div>
  );
}
