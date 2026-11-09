/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { hueOf } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { capsEm } from "./mirrorecho";
import { teamsOf } from "./notify";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { SilhouetteFill, twinPair, wordTone, type Box } from "./typesilhouette";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** A uniform dot-matrix screen: small round dots on a fixed pitch. */
export function DotScreen({ color, pitch, radius }: { color: string; pitch: number; radius: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle at ${pitch / 2}px ${pitch / 2}px, ${color} 0px, ${color} ${radius - 0.6}px, transparent ${radius + 0.4}px)`,
        backgroundSize: `${pitch}px ${pitch}px`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

/** His own crest, tiny and evenly tiled (brick-offset rows), greyed and tinted towards the club colour. */
export function CrestScreen({ url, twin, size, gap, tint, opacity }: { url: string; twin: Box; size: number; gap: number; tint: string; opacity: number }) {
  const step = size + gap;
  const rowH = step * 0.92;
  const rows = Math.ceil(twin.height / rowH) + 1;
  const cols = Math.ceil(twin.width / step) + 2;
  const cells: ReactNode[] = [];
  for (let i = 0; i < rows; i++) {
    const off = i % 2 ? step / 2 : 0;
    for (let j = -1; j < cols; j++) {
      cells.push(<img key={`${i}-${j}`} src={url} alt="" style={{ position: "absolute", left: j * step + off + gap / 2, top: i * rowH + gap / 2, width: size, height: size, objectFit: "contain" }} />);
    }
  }
  // Grey the crest, then pull it to the club hue: sepia sits at ~38°, hue-rotate takes it the rest of the way.
  const h = hueOf(tint);
  const tone = h == null ? "grayscale(1) brightness(1.3)" : `grayscale(1) sepia(1) hue-rotate(${Math.round(h - 38)}deg) saturate(2.2) brightness(1.15)`;
  return <div style={{ position: "absolute", inset: 0, opacity, filter: tone }}>{cells}</div>;
}

/**
 * The shared body of the dot / crest silhouette looks: the player in natural colour on a deep, clean
 * club-tone ground and beside him a twin of his own silhouette (same placement as typesilhouette), filled
 * with a pattern — a dot-matrix screen, or a tiny tiled pattern of his own club crest. Matchday: the title
 * small at the top, fixture and date · kick-off · ground at the foot. Goal: "GOAL" at the top, his name and
 * the fixture (never the score) at the foot. Flips with params.side.
 */
export function PatternSilhouette({ data, fill, goal }: { data: RenderData; fill: "dots" | "crest"; goal?: boolean }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? (fill === "dots" ? 37 : 41));
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const onLeft = params.side === "left" ? true : params.side === "right" ? false : r() < 0.5;
  const { deep, lift, word, club } = wordTone(data, r() < 0.55);
  const f = matchFacts(data);
  const crest = fill === "crest" ? f.ourCrest ?? data.club?.crestUrl ?? null : null;
  const mode = crest ? "crest" : "dots";

  /* ---- title ---- */
  const title = (content.kicker || (goal ? "GOAL" : "MATCHDAY")).toUpperCase().replace(/’/g, "'");
  const T_TRACK = goal ? 0.6 : 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- foot ---- */
  const teams = teamsOf(data);
  const fixture = teams.join("   v   ").toUpperCase() || (goal ? "" : (f.comp || "").toUpperCase());
  const F_TRACK = goal ? 0.28 : 0.3;
  const fixSize = Math.max(goal ? 11 : 12, Math.min((goal ? 15 : 17) * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const date = niceDate(content.date);
  const when = goal ? "" : [date, f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const name = goal ? [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ") : "";
  const nameSize = Math.min(32 * k, (CANVAS_W - 2 * M) / Math.max(1, name.length * 0.56)) * ts;
  // The logo (52px post / 88px story) ends at its bottom line; the foot sits ~64px above its top.
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  let fixTop: number, whenTop = 0, nameTop = 0;
  if (goal) {
    fixTop = logoTop - 64 - fixSize - (params.textY ?? 0);
    nameTop = fixTop - 20 * k - nameSize;
  } else {
    whenTop = logoTop - 64 - whenSize * 1.2 - (params.textY ?? 0);
    fixTop = whenTop - fixSize - 22 * k;
  }
  const footTop = goal && name ? nameTop : fixTop;

  /* ---- the pair ---- */
  const pair = twinPair(data, {
    onLeft,
    faceTop: story ? 420 : 270,
    sizes: goal
      ? story ? { chest: 300, waist: 240, knees: 184, full: 140 } : { chest: 244, waist: 190, knees: 146, full: 114 }
      : story ? { chest: 320, waist: 254, knees: 190, full: 138 } : { chest: 262, waist: 206, knees: 156, full: 120 },
    minHead: titleTop + tSize + (story ? 80 : 56),
    twinMinHead: titleTop + tSize + (story ? 60 : 42),
    wholeTop: goal,
    lift: story ? 36 : 26,
  });
  // The twin stays whole on the canvas (a celebrating arm can reach past the edge): slide the pair inwards a
  // little, then tuck the twin closer to him.
  let { box, twin } = pair;
  {
    const d = pair.dir; // +1: twin to the right
    const twinOut = (b: Box) => (d > 0 ? b.left + b.width - (CANVAS_W - 28) : 28 - b.left);
    // Only the visible silhouette counts, not the PNG's transparent margin: cutouts are trimmed to it, so ~1%.
    const over = twinOut(twin) - twin.width * 0.01;
    if (over > 0) {
      // ...as far as his own outer edge allows (unless the photo frame already cut him there).
      const frameCut = (d > 0 ? data.cut?.left : data.cut?.right) ?? 0;
      const room = frameCut ? 999 : (d > 0 ? box.left : CANVAS_W - box.left - box.width) + box.width * 0.01 - 16;
      const slide = Math.max(0, Math.min(over, story ? 70 : 56, room));
      const tuck = Math.min(over - slide, Math.abs(twin.left - box.left) - 110);
      box = { ...box, left: box.left - d * slide };
      twin = { ...twin, left: twin.left - d * (slide + Math.max(0, tuck)) };
    }
  }

  /* ---- the pattern ---- */
  const pitch = story ? 12 : 9.5;
  const radius = story ? 2.9 : 2.3;
  const tint = club;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 55% at 50% 40%, ${lift}, ${deep} 80%)` }} />

      {data.photoUrl && (
        <SilhouetteFill url={data.photoUrl} twin={twin} cut={data.cut} clipTop={titleTop + tSize + (story ? 44 : 30)} fadeEnd={footTop - (story ? 50 : 36)} H={H} base={`${club}${mode === "crest" ? "22" : "1f"}`}>
          {mode === "crest" && crest ? (
            <CrestScreen url={crest} twin={twin} size={(story ? 44 : 34) * ts} gap={story ? 22 : 17} tint={tint} opacity={0.62} />
          ) : (
            <DotScreen color={word} pitch={pitch} radius={radius} />
          )}
        </SilhouetteFill>
      )}

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 860 : 500, background: story ? `linear-gradient(to bottom, transparent, ${deep}e0 32%, ${deep} 55%)` : `linear-gradient(to bottom, transparent, ${deep}d9 55%, ${deep})` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK), color: goal ? "rgba(255,255,255,.72)" : WHITE }}>{fixture}</div>}
      {when && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>{when}</div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}

/**
 * Dot silhouette: the player in natural colour on a deep, clean club-tone ground, and beside him a twin of his
 * own silhouette made only of a uniform grid of small round dots (club colour or white) — a dot-matrix echo.
 * The title small at the top, the fixture and date · kick-off · ground small at the foot. Flips with params.side.
 */
export function Dotsilhouette({ data }: { data: RenderData }) {
  return <PatternSilhouette data={data} fill="dots" />;
}
