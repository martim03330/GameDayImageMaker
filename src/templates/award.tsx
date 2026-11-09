/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { Paper, rng } from "./kit";
import { competitionOf, roundOf } from "./outline";
import { AgencyLogo, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#f3f2ef";

/** The award in one short word: "PLAYER OF THE MONTH" → "POTM", "TEAM OF THE WEEK" → "TOTW", "NEW DEAL" stays. */
export function awardWord(data: RenderData): { word: string; full: string } {
  const k = data.content.kicker.toUpperCase().replace(/[^A-Z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  const t = data.postType;
  if (/\bOF THE\b/.test(k)) {
    if (/^XI\b/.test(k)) return { word: "TOTW", full: k };
    const initials = k.split(" ").map((w) => w[0]).join("");
    return { word: initials.slice(0, 5), full: k };
  }
  if (k && [...k].length <= 8) return { word: k, full: "" };
  const fallback: Record<string, string> = { stats: "IN FORM", renewal: "SIGNED", potm: "POTM", totw: "TOTW", result: "MOTM", goal: "GOAL", transfer: "SIGNED", matchday: "MATCHDAY" };
  return { word: fallback[t] ?? k.split(" ")[0], full: k };
}

/**
 * Colour pop kept to the kit: like fx's SelectiveColorDefs, but only strongly saturated pixels of the
 * club hue keep their colour, so skin next to a red or orange shirt goes grey too.
 */
function KitColorDefs({ id, hue }: { id: string; hue: number }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="hueRotate" values={String(-hue)} result="rot" />
        <feColorMatrix in="rot" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 -1.5 -1.5 0 -0.75" result="sel" />
        <feGaussianBlur in="sel" stdDeviation="1.2" result="selSoft" />
        <feComposite in="SourceGraphic" in2="selSoft" operator="in" result="colour" />
        <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="grey" />
        <feComponentTransfer in="grey" result="greyC">
          <feFuncR type="linear" slope="1.15" intercept="-0.04" />
          <feFuncG type="linear" slope="1.15" intercept="-0.04" />
          <feFuncB type="linear" slope="1.15" intercept="-0.04" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="greyC" />
          <feMergeNode in="colour" />
        </feMerge>
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * High-school / college award graphic ("MVP", Brandon Bruce-Bey): white paper with rough dry-brush
 * club-colour edges, a thin-lined photo frame the player's head breaks out of, the player in black and
 * white with only the club colour left on his kit, then a tiny spaced competition line, a giant serif
 * award word, the name in serif caps between two rules and a small row of logos.
 */
export function Award({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 41;
  const r = rng(seed);
  const flip = params.side === "left";
  const club0 = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const lum = luminance(club0);
  // On white the colour has to hold: very light colours are deepened, black becomes a soft ink.
  const club = lum < 0.03 ? "#1f2126" : lum > 0.4 ? shade(club0, -0.42) : lum > 0.25 ? shade(club0, -0.25) : club0;
  const deep = shade(club, -0.35);
  const hue = hueOf(club0);
  const ts = params.textScale ?? 1;
  const id = `aw-${seed}`;

  // ---- frame and player ----
  const frame = { left: 150, top: 140, width: 780, height: 770 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const SIZES: Record<string, number> = { chest: 250, waist: 195, knees: 150, full: 120 };
  let faceH = (SIZES[params.framing ?? "waist"] ?? 195) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(110, data.facePx * 1.25));
  // Cutout: the head rises out of the frame; an original photo stays inside it.
  const breakout = data.photoIsCutout;
  const faceTop = breakout ? -8 + r() * 26 : 120;
  const h = Math.max(faceH / face[3], (frame.height + 20 - faceTop) / Math.max(0.2, 1 - face[1]));
  const w = h * aspect;
  const faceCx = frame.width / 2 + (flip ? -1 : 1) * (40 + r() * 50);
  const fig = {
    left: faceCx - w * (face[0] + face[2] / 2) + (params.playerX ?? 0),
    top: faceTop - h * face[1] + (params.playerY ?? 0),
    width: w,
    height: h,
  };
  const playerFilter = hue != null ? `url(#${id}-sel) contrast(1.12) brightness(1.02)` : "grayscale(1) contrast(1.2)";

  // ---- words ----
  const { word, full } = awardWord(data);
  const wordSize = Math.min(180, 820 / Math.max(2.2, [...word].length * 0.66)) * ts;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min(40, 560 / Math.max(1, [...name].length * 0.72));
  const comp = competitionOf(data);
  const extra =
    postType === "renewal" && content.until
      ? `CONTRACT UNTIL ${content.until}`
      : postType === "potm"
        ? content.subline.toUpperCase()
        : postType === "totw"
          ? roundOf(data)
          : comp;
  const small = [full, extra].filter(Boolean).join(" · ") || (data.club?.name ?? "").toUpperCase();
  const smallSize = Math.min(19, 760 / Math.max(1, [...small].length * 1.05));
  const wordTop = frame.top + frame.height + 40 + smallSize;

  // ---- dry-brush border ----
  const bleedV = 56 + r() * 14;
  const bleedH = 46 + r() * 10;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: deep }}>
      {hue != null && <KitColorDefs id={`${id}-sel`} hue={hue} />}
      <Paper color={PAPER} strength={1.2} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} data-bleed>
        <defs>
          {/* Dry brush: paint solid at the edge, thinning inwards; streak noise decides where it breaks up. */}
          {(["v", "h"] as const).map((o) => (
            <filter key={o} id={`${id}-${o}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency={o === "v" ? "0.11 0.005" : "0.005 0.11"} numOctaves={4} seed={(seed % 83) + (o === "v" ? 1 : 7)} result="n" />
              <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na" />
              <feComposite in="SourceGraphic" in2="na" operator="arithmetic" k1={0} k2={1} k3={1.1} k4={-0.55} result="sum" />
              <feColorMatrix in="sum" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 16 -8" result="thr" />
              <feFlood floodColor={club} result="paint" />
              <feComposite in="paint" in2="thr" operator="in" />
            </filter>
          ))}
          {(
            [
              ["l", 0, 0, 1, 0, bleedV],
              ["r", 1, 0, 0, 0, bleedV],
              ["t", 0, 0, 0, 1, bleedH],
              ["b", 0, 1, 0, 0, bleedH],
            ] as const
          ).map(([k, x1, y1, x2, y2]) => (
            <linearGradient key={k} id={`${id}-g${k}`} x1={x1} y1={y1} x2={x2} y2={y2}>
              <stop offset="0" stopColor="#fff" stopOpacity={1} />
              <stop offset="0.25" stopColor="#fff" stopOpacity={0.75} />
              <stop offset="1" stopColor="#fff" stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <rect x={0} y={0} width={bleedV * 2.3} height={CANVAS_H} fill={`url(#${id}-gl)`} filter={`url(#${id}-v)`} />
        <rect x={CANVAS_W - bleedV * 2.3} y={0} width={bleedV * 2.3} height={CANVAS_H} fill={`url(#${id}-gr)`} filter={`url(#${id}-v)`} />
        <rect x={0} y={0} width={CANVAS_W} height={bleedH * 2.3} fill={`url(#${id}-gt)`} filter={`url(#${id}-h)`} />
        <rect x={0} y={CANVAS_H - bleedH * 2.3} width={CANVAS_W} height={bleedH * 2.3} fill={`url(#${id}-gb)`} filter={`url(#${id}-h)`} />
      </svg>

      {/* Photo frame: dark studio wall with a soft grid, his own photo faint and blurred in it. */}
      <div style={{ position: "absolute", ...frame, overflow: "hidden", background: `radial-gradient(70% 60% at ${flip ? 40 : 60}% 28%, #5d5f64, #1d1e21 70%, #0f1012)` }}>
        {data.bgPhotoUrl && (
          <img src={data.bgPhotoUrl} alt="" style={{ position: "absolute", left: -60, top: -60, width: frame.width + 120, height: frame.height + 120, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) blur(22px) brightness(.8)", opacity: 0.45 }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            backgroundPosition: "18px 26px",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,.45))" }} />
      </div>
      <div style={{ position: "absolute", left: frame.left - 14, top: frame.top - 14, width: frame.width + 28, height: frame.height + 28, border: `2px solid ${club}` }} />

      {/* The player: clipped by the frame on three sides, free to rise over the top edge. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", ...frame, clipPath: breakout ? "inset(-400px 0 0 0)" : "inset(0)" }}>
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 20px 30px rgba(0,0,0,.35))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", ...fig, maxWidth: "none", filter: playerFilter, ...(data.photoIsCutout ? cutMask(data.cut) : {}) }} />
          </div>
          {/* Coarse print dots over the photo. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(0,0,0,.5) 0.9px, transparent 1.4px)",
              backgroundSize: "5px 5px",
              mixBlendMode: "soft-light",
              opacity: 0.6,
              clipPath: "inset(0)",
            }}
          />
        </div>
      )}

      {/* Words under the frame. */}
      <div style={{ position: "absolute", left: 100, right: 100, top: frame.top + frame.height + 30, textAlign: "center", fontFamily: SERIF, fontWeight: 500, fontSize: smallSize, letterSpacing: "0.42em", paddingLeft: "0.42em", color: club, whiteSpace: "nowrap" }}>
        {small}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DMSERIF, fontSize: wordSize, lineHeight: 0.86, color: club, WebkitTextStroke: `${Math.round(wordSize / 70)}px ${club}`, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
        {word}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop + wordSize * 0.86 + 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
        <div style={{ width: 54, height: 2, background: deep }} />
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: nameSize, letterSpacing: "0.04em", color: deep, whiteSpace: "nowrap", lineHeight: 1 }}>{name}</div>
        <div style={{ width: 54, height: 2, background: deep }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop + wordSize * 0.86 + 16 + nameSize + 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />}
        {data.club?.crestUrl && (data.agency.logoUrl || data.agency.name) && <div style={{ width: 1.5, height: 26, background: deep, opacity: 0.4 }} />}
        <AgencyLogo data={data} onLight height={22} style={{ color: deep, opacity: 0.9 }} />
      </div>
      <Film strength={0.5} />
    </div>
  );
}
