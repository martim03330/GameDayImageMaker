/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, DMSERIF } from "./fx";
import { opponentOf, rng } from "./kit";
import { competitionOf, crestsOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** DM Serif Display: average advance of its capitals, relative to the font size. */
const SERIF_CAPS = 0.66;

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * Chelsea "MATCHDAY" (Champions League night): high-key white studio, the player's head and shoulders
 * almost a silhouette against it (curves crush everything but the lit side of the face, cool shadows),
 * the club crest as a huge faint watermark over the chest, two small crests and one wide, elegant serif
 * word across the body, with a small caps line or two underneath.
 */
export function Backlit({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 11);
  const sgn = params.side === "left" ? -1 : 1;

  /* ---------- the player ---------- */
  const face = data.face ?? [0.38, 0.1, 0.24, 0.14];
  const aspect = data.photoAspect ?? 0.7;
  // Mostly shadow, so a little softness never shows; still capped by the photo's own pixels.
  const want = 260 * (params.playerScale ?? 1);
  const faceH = data.facePx > 0 ? Math.min(want, Math.max(230, data.facePx * 2.6)) : want;
  const faceTop = 250 - (want - faceH) * 0.3 + (params.playerY ?? 0);
  // Head and shoulders: the body always runs off the bottom edge.
  // A photo cut at the waist fades out over its last ~16%: that fade goes below the bottom edge.
  const below = (data.cut?.bottom ?? 0) > 0 ? 0.17 : 0.02;
  const h = Math.max(faceH / face[3], (CANVAS_H - faceTop) / Math.max(0.2, 1 - face[1] - below));
  const w = h * aspect;
  const faceCx = 540 + sgn * (30 + r() * 50) + (params.playerX ?? 0);
  const box = { left: faceCx - (face[0] + face[2] / 2) * w, top: faceTop - face[1] * h, width: w, height: h };
  const edgeFade = "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)";
  const id = `blt${hash(`${data.photoUrl}|${Math.round(faceH)}`)}`;

  /* ---------- the words ---------- */
  const kicker = content.kicker.toUpperCase();
  const size = Math.min(172, 960 / Math.max(4, kicker.length * SERIF_CAPS)) * (params.textScale ?? 1);
  const width = Math.min(960, kicker.length * SERIF_CAPS * size * 1.12);
  const baseline = 1168;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const opp = opponentOf(data).toUpperCase();
  const venue = (content.venue || "").toUpperCase();
  const comp = competitionOf(data);
  let lines: string[];
  if (postType === "matchday") {
    lines = [
      [content.date, content.time, venue].filter(Boolean).join("  |  ").toUpperCase(),
      [comp, opp && `V ${opp}`].filter(Boolean).join("  |  "),
    ];
  } else if (postType === "transfer") {
    const to = (data.toClub ?? data.club)?.name.toUpperCase();
    lines = [name, [data.fromClub ? `FROM ${data.fromClub.name.toUpperCase()}` : "", to ? `TO ${to}` : ""].filter(Boolean).join("  |  ")];
  } else if (postType === "renewal") {
    lines = [name, content.until ? `UNTIL ${content.until}` : (data.club?.name ?? "").toUpperCase()];
  } else {
    lines = [name, content.subline.toUpperCase().replace(/\s*·\s*/g, "  |  ")];
  }
  lines = lines.filter(Boolean);
  const lineSize = (t: string) => Math.min(30, 900 / Math.max(10, t.length * 0.52));

  // Crests: the fixture on match posts, from → to on a transfer, the club alone otherwise.
  const crests =
    postType === "matchday"
      ? crestsOf(data)
      : postType === "transfer"
        ? ([data.fromClub?.crestUrl, (data.toClub ?? data.club)?.crestUrl].filter(Boolean) as string[])
        : ([data.club?.crestUrl].filter(Boolean) as string[]);
  const mark = (postType === "transfer" ? (data.toClub ?? data.club) : data.club)?.crestUrl;

  // White over the dark body, dark over the white studio: the text inverts whatever is behind it.
  const invert: CSSProperties = { mixBlendMode: "difference", color: "#ffffff" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f3f3f2", color: "#111" }}>
      {/* High-key studio: white glow behind the head, soft grey falling off to the corners. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(60% 48% at ${Math.round((faceCx / CANVAS_W) * 100)}% 30%, #ffffff 0%, #fbfbfb 40%, #e9e9e8 78%, #d9d9d8 100%)`,
        }}
      />
      {/* The crest, huge and faint on the studio wall. */}
      {mark && (
        <img
          src={mark}
          alt=""
          style={{
            position: "absolute",
            left: 540 - 330,
            top: 1010 - 330,
            width: 660,
            height: 660,
            objectFit: "contain",
            filter: "grayscale(1) contrast(.7)",
            opacity: 0.07,
          }}
        />
      )}

      {data.photoUrl && (
        // Photo borders (an arm or the torso cut by the frame) never show as hard vertical edges.
        <div style={{ position: "absolute", ...box, WebkitMaskImage: edgeFade, maskImage: edgeFade }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              ...cutMask(data.cut),
              ...(data.photoIsCutout
                ? {}
                : ({
                    WebkitMaskImage: `radial-gradient(${Math.round(w * 0.5)}px ${Math.round(h * 0.55)}px at ${Math.round(faceCx - box.left)}px ${Math.round(faceTop - box.top + faceH)}px, #000 55%, transparent 100%)`,
                    maskImage: `radial-gradient(${Math.round(w * 0.5)}px ${Math.round(h * 0.55)}px at ${Math.round(faceCx - box.left)}px ${Math.round(faceTop - box.top + faceH)}px, #000 55%, transparent 100%)`,
                  } as CSSProperties)),
            }}
          >
            <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <defs>
                <filter id={id} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  {/* Levels: crush everything but the brightest, lit side; shadows lean cool. */}
                  <feColorMatrix type="saturate" values="0.45" />
                  <feComponentTransfer>
                    <feFuncR type="table" tableValues="0 0.01 0.02 0.045 0.15 0.62" />
                    <feFuncG type="table" tableValues="0.004 0.014 0.027 0.052 0.16 0.62" />
                    <feFuncB type="table" tableValues="0.018 0.034 0.05 0.08 0.19 0.64" />
                  </feComponentTransfer>
                </filter>
                <filter id={`${id}s`} x="0" y="0" width={w} height={h} filterUnits="userSpaceOnUse">
                  <feFlood floodColor="#06080d" />
                  <feComposite in2="SourceAlpha" operator="in" />
                </filter>
                {/* The light comes from one side: the far side of the body sinks into shadow. */}
                <linearGradient id={`${id}l`} x1={sgn > 0 ? 1 : 0} y1="0" x2={sgn > 0 ? 0 : 1} y2="0.25">
                  <stop
                    offset={Math.max(0, Math.min(1, ((sgn > 0 ? box.left + w - faceCx : faceCx - box.left) - faceH * 0.2) / w)).toFixed(3)}
                    stopColor="#fff"
                    stopOpacity="0"
                  />
                  <stop
                    offset={Math.max(0, Math.min(1, ((sgn > 0 ? box.left + w - faceCx : faceCx - box.left) + faceH * 0.45) / w)).toFixed(3)}
                    stopColor="#fff"
                    stopOpacity="0.85"
                  />
                </linearGradient>
                <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
                  <rect x="0" y="0" width={w} height={h} fill={`url(#${id}l)`} />
                </mask>
              </defs>
              <image href={data.photoUrl} x={0} y={0} width={w} height={h} preserveAspectRatio="none" filter={`url(#${id})`} />
              <g mask={`url(#${id}m)`}>
                <image href={data.photoUrl} x={0} y={0} width={w} height={h} preserveAspectRatio="none" filter={`url(#${id}s)`} />
              </g>
            </svg>
          </div>
        </div>
      )}
      {/* The same crest in front: lighter grey where it crosses the dark body. */}
      {mark && (
        <img
          src={mark}
          alt=""
          style={{
            position: "absolute",
            left: 540 - 330,
            top: 1010 - 330,
            width: 660,
            height: 660,
            objectFit: "contain",
            // A flat silhouette (like the starball in the reference): the crest's own lettering and
            // details, lightened over the dark body, read as stray letters.
            filter: "brightness(0) invert(1)",
            opacity: 0.09,
            mixBlendMode: "screen",
          }}
        />
      )}

      {crests.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: baseline - size * 0.74 - 128,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 26,
          }}
        >
          {crests.map((c, i) => (
            <img
              key={i}
              src={c}
              alt=""
              style={{ width: 88, height: 88, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.35))" }}
            />
          ))}
        </div>
      )}

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, ...invert }}>
        <text
          x={540}
          y={baseline}
          textAnchor="middle"
          textLength={width}
          lengthAdjust="spacing"
          fill="#ffffff"
          style={{ fontFamily: DMSERIF, fontSize: size }}
        >
          {kicker}
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: baseline + 26,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          ...invert,
        }}
      >
        {lines.map((t, i) => (
          <div
            key={i}
            style={{
              fontFamily: CONDENSED,
              fontWeight: 500,
              fontSize: lineSize(t),
              lineHeight: 1.1,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", left: 60, top: 60, opacity: 0.85, color: "#111" }} />
    </div>
  );
}
