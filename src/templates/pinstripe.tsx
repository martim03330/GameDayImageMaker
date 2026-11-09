/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f2f0eb";
const INK = "#15161a";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/** A club colour that still reads as a fine line on paper: white / pale / yellow ones are deepened. */
function onPaper(c: string): string {
  let x = vivid(c);
  if (luminance(x) > 0.55) x = shade(x, -0.55);
  else if (luminance(x) > 0.38) x = shade(x, -0.3);
  return x;
}

/**
 * Pinstripe: a clean paper ground with one panel of very fine vertical pinstripes in the two club colours —
 * like the cloth of a classic kit — set behind his upper body; the player in front in natural colour. The
 * title in medium Inter above, the crests small opposite, the fixture small at the foot. Restrained.
 */
export function Pinstripe({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const M = story ? 72 : 64;
  const flip = params.side === "left";

  /* ---- the two club colours, as fine lines ---- */
  const base = params.primary === "#10131c" ? params.accent : params.primary;
  let c1 = onPaper(base);
  let c2 = onPaper(base === params.accent ? params.primary : params.accent);
  if (luminance(c1) < 0.02) c1 = "#24262c";
  if (luminance(c2) < 0.02) c2 = "#24262c";
  // Two near-identical colours: the second becomes a lighter tint, so the rhythm still reads.
  if (Math.abs(luminance(c1) - luminance(c2)) < 0.02 && c1.toLowerCase() === c2.toLowerCase()) c2 = shade(c1, 0.45);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = postType === "result" && !!score;

  /* ---- the player and the panel behind his upper body ---- */
  const faceX = 540 + (flip ? -30 : 30);
  const faceTop = story ? STORY_TOP + 360 : 250;
  const box = story ? placeByFace(data, faceX, faceTop, { chest: 330, waist: 262, knees: 200, full: 150 }) : placeByFace(data, faceX, faceTop, { chest: 250, waist: 196, knees: 148, full: 112 });
  const faceH = box.faceH;
  const panelW = story ? 780 : 660;
  const panelX = Math.max(M, Math.min(CANVAS_W - M - panelW, faceX - panelW / 2));
  const panelTop = faceTop - faceH * (story ? 0.9 : 0.75);
  const panelH = story ? 900 : 640;
  const pitch = story ? 12 : 10; // one pair of lines every `pitch * 2` px
  const lw = story ? 1.6 : 1.3;
  const stripes = `repeating-linear-gradient(90deg, ${c1} 0 ${lw}px, transparent ${lw}px ${pitch}px, ${c2} ${pitch}px ${pitch + lw}px, transparent ${pitch + lw}px ${pitch * 2}px)`;

  /* ---- type ---- */
  const kicker = hasScore ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase());
  const tSize = Math.min(64 * k * ts, (CANVAS_W * 0.56) / Math.max(1, kicker.length * 0.56));
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time].filter(Boolean).join("  ·  ");
  const where = [titleCase(f.venue), titleCase(f.comp || f.round || "")].filter(Boolean).join("  ·  ");
  const infoW = story ? 600 : 560;
  const fit = (t: string, max: number) => Math.max(12 * k, Math.min(max * k * ts, infoW / Math.max(1, t.length * 0.52)));
  const fixSize = fit(fixture, 22);
  const whenSize = Math.min(fixSize * 0.82, fit(when, 17));
  const whereSize = Math.min(whenSize, fit(where, 17));

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const cS = Math.round(44 * k);

  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const infoBottom = (story ? H - STORY_BOTTOM : 56) - (params.textY ?? 0) * 0;
  const textSide: CSSProperties = flip ? { right: M, textAlign: "right", alignItems: "flex-end" } : { left: M, textAlign: "left", alignItems: "flex-start" };
  const otherSide: CSSProperties = flip ? { left: M } : { right: M };
  const fadeTop = H - (story ? 780 : 420);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* The pinstripe panel: the cloth of the kit, very fine, faint at the foot. */}
      <div
        style={{
          position: "absolute",
          left: panelX,
          top: panelTop,
          width: panelW,
          height: panelH,
          background: `${stripes}, ${c1}0d`,
          opacity: 0.5,
          WebkitMaskImage: "linear-gradient(to bottom, #000 0, #000 62%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 0, #000 62%, transparent 100%)",
        }}
      />
      {/* A soft contact shadow under the figure against the panel. */}
      <div style={{ position: "absolute", left: faceX - 260, top: panelTop + panelH * 0.25, width: 520, height: panelH * 0.7, background: "radial-gradient(closest-side, rgba(0,0,0,.10), transparent)", filter: "blur(30px)" }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}
      {/* He settles into the paper low down, so the foot reads clean. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: fadeTop, bottom: 0, background: `linear-gradient(to bottom, ${PAPER}00, ${PAPER} ${story ? 300 : 230}px)` }} />

      {/* Title: medium Inter, top. */}
      <div style={{ position: "absolute", top: (story ? STORY_TOP : M - 10) + (params.textY ?? 0), ...textSide, display: "flex", flexDirection: "column", gap: 14 * k }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.025em", whiteSpace: "nowrap", color: INK }}>{kicker}</div>
        <div style={{ display: "flex", gap: 6 * k, flexDirection: flip ? "row-reverse" : "row" }}>
          <div style={{ width: 22 * k, height: 3 * k, background: c1 }} />
          <div style={{ width: 22 * k, height: 3 * k, background: c2 }} />
        </div>
      </div>

      {/* Crests: small, the opposite top corner. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: story ? STORY_TOP + 4 : M - 6, ...otherSide, display: "flex", gap: 16 * k, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* Foot: the fixture, then date · kick-off, then ground · competition. */}
      <div style={{ position: "absolute", bottom: infoBottom, ...textSide, display: "flex", flexDirection: "column", gap: 8 * k, maxWidth: infoW, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        <div style={{ fontSize: fixSize, fontWeight: 500, color: INK }}>{fixture}</div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 400, color: "rgba(21,22,26,.72)" }}>{when}</div>}
        {where && <div style={{ fontSize: whereSize, fontWeight: 400, color: "rgba(21,22,26,.55)" }}>{where}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight
        style={{ position: "absolute", ...otherSide, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: flip ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}

