/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#15171c";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/** Like cutMask, but the shadow is gone before the player's own fade starts, so a cut edge never shows. */
function shadowMask(cut: RenderData["cut"]): CSSProperties {
  if (!cut) return {};
  const layers: string[] = [];
  const fade = (dir: string, from: number, to: number) => `linear-gradient(${dir}, transparent 0%, transparent ${from}%, #000 ${to}%)`;
  if ((cut.bottom ?? 0) > 0) layers.push(fade("to top", 4, 22));
  if ((cut.top ?? 0) > 0) layers.push(fade("to bottom", 3, 10));
  if ((cut.left ?? 0) > 0) layers.push(fade("to right", 14, 22));
  if ((cut.right ?? 0) > 0) layers.push(fade("to left", 14, 22));
  if (!layers.length) return {};
  const m = layers.join(", ");
  const many = layers.length > 1;
  return { WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: many ? "source-in" : undefined, maskComposite: many ? "intersect" : undefined } as CSSProperties;
}

/**
 * Offset shadow: a clean pop poster. A flat off-white ground with a breath of the club tint, the player in
 * natural colour and ONE hard, flat copy of his silhouette filled solid in the club colour, offset down and
 * to one side (params.side) — no blur. The title medium Inter top-left, crests small top-right, the fixture
 * and date · kick-off · ground small at the foot.
 */
export function Offsetshadow({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  // The shadow falls towards params.side — unless the photo is cut on that side, where the offset copy would
  // show the photo's straight edge: then it falls the other way (cut on both sides → mostly straight down).
  const cutL = (data.cut?.left ?? 0) > 0;
  const cutR = (data.cut?.right ?? 0) > 0;
  const toRight = cutR && !cutL ? false : cutL && !cutR ? true : params.side !== "left";
  const bothCut = cutL && cutR;

  // The shadow colour: the club colour, vivid; too light for a light ground (yellow / white) → the accent,
  // else a deepened version of it; near-black stays a soft black.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.42) club = vivid(params.accent);
  if (luminance(club) > 0.42) club = shade(club, -0.38);
  if (luminance(club) < 0.02) club = "#1d1f24";
  const ground = shade(club, 0.93);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = postType === "result" && !!score;

  /* ---- the player, a little off-centre away from his shadow ---- */
  const M = 64;
  const dx = (bothCut ? (story ? 30 : 24) : story ? 40 : 32) * (toRight ? 1 : -1);
  const dy = bothCut ? (story ? 42 : 34) : story ? 34 : 28;
  const cx = (toRight ? 515 : 565) + (story ? (toRight ? -10 : 10) : 0);
  const faceTop = story ? 540 : 330;
  const box = story ? placeByFace(data, cx, faceTop, { chest: 310, waist: 250, knees: 196, full: 150 }) : placeByFace(data, cx, faceTop, { chest: 240, waist: 190, knees: 146, full: 112 });

  /* ---- type ---- */
  const title = hasScore ? "Full Time" : titleCase(content.kicker || "MATCHDAY");
  const comp = titleCase(f.comp || f.round || "");
  const ours = clean(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = clean(typed ?? titleCase(f.opp));
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const when = [niceDate(content.date), hasScore ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const W = story ? CANVAS_W - 2 * M : 640;
  const fit = (t: string, max: number, em = 0.54) => Math.max(12 * k, Math.min(max * k * ts, W / Math.max(1, t.length * em)));
  const fixSize = fit(fixture, 26);
  const whenSize = Math.min(fixSize * 0.78, fit(when, 18));
  const titleSize = Math.min(58 * k * ts, (CANVAS_W * 0.6) / Math.max(1, title.length * 0.6));
  const compSize = Math.min(13 * k * ts, fit(comp, 13, 0.9));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const cS = story ? 62 : 46;

  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  // Story: the info sits above the logo (≥ 56px clear); post: info bottom-left, logo bottom-right.
  const infoBottom = (story ? H - STORY_BOTTOM + logoH + 64 : 56) - (params.textY ?? 0);
  const top = (story ? STORY_TOP : 60) + (params.textY ?? 0);
  // The paper fade: fully back to the ground just above the info block.
  const blockH = 11 * k + fixSize * 1.2 + 10 * k + (when ? whenSize * 1.2 + 10 * k : 0);
  const fadeH = infoBottom + blockH + (story ? 380 : 260);
  const solid = fadeH - infoBottom - blockH - (story ? 30 : 60);
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };
  const placed: CSSProperties = { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      {/* The hard shadow: his silhouette filled flat in the club colour, offset, no blur. */}
      {data.photoUrl && (
        <div style={{ ...placed, left: box.left + dx, top: box.top + dy, ...shadowMask(data.cut) }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: club,
              WebkitMaskImage: `url("${data.photoUrl}")`,
              maskImage: `url("${data.photoUrl}")`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
        </div>
      )}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ ...placed, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />}
      {/* The foot melts back into the paper so the info reads. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: fadeH, background: `linear-gradient(to bottom, ${ground}00, ${ground}eb ${Math.round(solid)}px, ${ground})` }} />

      {/* Title top-left, the competition under it. */}
      <div style={{ position: "absolute", left: M, top, display: "flex", flexDirection: "column", gap: 16 * k }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: titleSize, letterSpacing: "-0.025em", lineHeight: 0.9, whiteSpace: "nowrap" }}>{title}</div>
        {comp && <div style={{ ...caps, fontSize: compSize, opacity: 0.55 }}>{comp}</div>}
      </div>

      {/* Crests, small, top-right (home first). */}
      <div style={{ position: "absolute", right: M, top: top + 2, display: "flex", gap: 16 * k, alignItems: "center" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: cS, height: cS, objectFit: "contain" }} />
        ))}
      </div>

      {/* Foot: a short club-colour rule, the fixture, then date · kick-off · ground. */}
      <div style={{ position: "absolute", left: M, bottom: infoBottom, display: "flex", flexDirection: "column", gap: 10 * k, fontFamily: SANS, whiteSpace: "nowrap", lineHeight: 1.2 }}>
        <div style={{ width: 40 * k, height: 3 * k, background: club, marginBottom: 8 * k }} />
        <div style={{ fontSize: fixSize, fontWeight: 500, letterSpacing: "-0.01em" }}>{fixture}</div>
        {when && <div style={{ fontSize: whenSize, fontWeight: 400, opacity: 0.6 }}>{when}</div>}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={20}
        style={{ position: "absolute", [story ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: story ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.12} />
    </div>
  );
}
