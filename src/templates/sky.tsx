/* eslint-disable @next/next/no-img-element */
import { hueOf, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask } from "./fx";
import { rng } from "./kit";
import { em, standing } from "./mist";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const ARCHIVO_W: Record<string, number> = { A: 77.8, B: 77.8, C: 77.8, D: 77.8, E: 72.2, F: 66.7, G: 83.3, H: 83.3, I: 38.9, J: 66.7, K: 83.3, L: 66.7, M: 94.4, N: 83.3, O: 83.3, P: 72.2, Q: 83.3, R: 77.8, S: 72.2, T: 72.2, U: 83.3, V: 77.8, W: 100, X: 77.8, Y: 77.8, Z: 72.2, "-": 33.3 };

/** Blend of two hex colours (t = share of `b`). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/**
 * Sky gameday (Oklahoma Sooners "ONE SATURDAY UNTIL KICKOFF"): a deep sky of scattered clouds where the
 * clouds themselves form the player's shirt number, one line of widely spaced white caps across the middle,
 * and the player big in the lower half — ideally from behind — with the stands peeking in at the corners.
 * Warm club colours can turn the sky to dusk.
 */
export function Sky({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 11;
  const r = rng(seed);
  const club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const hue = hueOf(club);
  const warm = hue != null && (hue < 45 || hue > 330) && r() < 0.6;
  const sky = warm
    ? { top: "#171538", mid: mix(club, "#3b2160", 0.55), low: mix(club, "#ff9a5c", 0.35), horizon: "#f8c08e", shadow: [0.62, 0.5, 0.6] }
    : { top: "#07235e", mid: "#1450b0", low: "#3f86d6", horizon: "#9cc6ee", shadow: [0.55, 0.64, 0.8] };

  // ---- What the clouds write: the shirt number, else the kicker's first word. ----
  const kickWords = content.kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").split(/\s+/);
  const glyphs = (data.player.number || kickWords[0] || "").slice(0, 8);
  const isNum = /^\d+$/.test(glyphs);
  const unit = em(glyphs, ARCHIVO_W, 66.7);
  const numCap = Math.min(isNum ? 420 : 340, ((940 / Math.max(0.6, unit)) * 0.688));
  const numSize = numCap / 0.688;
  const numY = 196 + (420 - numCap) * 0.5 + numCap;

  // ---- The line across the middle. ----
  const score = content.homeGoals != null && String(content.homeGoals) !== "" ? `${content.homeGoals}–${content.awayGoals}` : "";
  const clubName = (data.toClub ?? data.club)?.name?.toUpperCase() ?? "";
  const parts =
    postType === "matchday"
      ? [content.kicker, content.date, content.time]
      : postType === "goal"
        ? [content.kicker, score && content.homeTeam && content.awayTeam ? `${content.homeTeam} ${score} ${content.awayTeam}` : score]
        : postType === "potm"
          ? [content.kicker, content.subline]
          : postType === "renewal"
            ? [content.kicker, content.until ? `UNTIL ${content.until}` : clubName]
            : [content.kicker, clubName];
  const line = parts.filter(Boolean).join("   ·   ").toUpperCase();
  const lineSize = Math.min(27, 1000 / Math.max(12, line.length * 1.02));
  const lineY = 668;

  // ---- The player: big, from the waist or knees up, cropped by the bottom edge. ----
  const framing = params.framing === "chest" ? "chest" : params.framing === "waist" || params.framing === "knees" ? "waist" : "knees";
  const box = standing(data, { cx: 540 + (r() - 0.5) * 40, headTop: 720, floor: 1350, maxFace: 190, framing });

  const stands = (data.club?.stadiumImages ?? [])[0];
  // The number's own shade: a touch lighter than the scattered clouds, so it leads.
  const lift = sky.shadow.map((v) => v + (1 - v) * 0.3);
  const cloudSeed = Math.floor(r() * 90) + 1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: sky.top }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${sky.top} 0%, ${sky.mid} 42%, ${sky.low} 72%, ${sky.horizon} 100%)` }} />
      {/* Sun glow low behind the player. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 520, height: 700, background: "radial-gradient(closest-side, rgba(255,255,255,.28), rgba(255,255,255,0))" }} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* Scattered clouds: thresholded fractal noise, lit from above-left, flattened towards the horizon. */}
          <filter id="sky-clouds" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.0032 0.0072" numOctaves={6} seed={cloudSeed} result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.1 0 0 0 -1.72" result="cover" />
            <feGaussianBlur in="cover" stdDeviation="3" result="coverSoft" />
            <feDiffuseLighting in="coverSoft" surfaceScale={7} diffuseConstant={1.25} lightingColor="#fff" result="lit">
              <feDistantLight azimuth={235} elevation={52} />
            </feDiffuseLighting>
            <feComponentTransfer in="lit" result="toned">
              <feFuncR type="linear" slope={1 - sky.shadow[0]} intercept={sky.shadow[0]} />
              <feFuncG type="linear" slope={1 - sky.shadow[1]} intercept={sky.shadow[1]} />
              <feFuncB type="linear" slope={1 - sky.shadow[2]} intercept={sky.shadow[2]} />
            </feComponentTransfer>
            <feComposite in="toned" in2="coverSoft" operator="in" />
          </filter>
          {/* The number, made of cloud: blurred, pulled apart by noise, billowed, then lit like the others. */}
          <filter id="sky-number" x="-15%" y="-25%" width="130%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation={numCap * 0.03} result="soft" />
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={3} seed={cloudSeed + 7} result="warp" />
            <feDisplacementMap in="soft" in2="warp" scale={numCap * 0.13} xChannelSelector="R" yChannelSelector="G" result="warped" />
            <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves={3} seed={cloudSeed + 5} result="warp2" />
            <feDisplacementMap in="warped" in2="warp2" scale={numCap * 0.07} xChannelSelector="R" yChannelSelector="G" result="lumpy" />
            <feComponentTransfer in="lumpy" result="shapeSoft">
              <feFuncA type="table" tableValues="0 0.12 0.45 0.8 0.97 1" />
            </feComponentTransfer>
            {/* Billows only shape the relief (light and shade inside the cloud), never punch holes in it. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={cloudSeed + 3} result="billow" />
            <feColorMatrix in="billow" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="billowA" />
            <feComposite in="shapeSoft" in2="billowA" operator="arithmetic" k1={0.9} k2={0.45} k3={0} k4={0} result="height" />
            <feGaussianBlur in="height" stdDeviation={5} result="heightSoft" />
            <feDiffuseLighting in="heightSoft" surfaceScale={34} diffuseConstant={1.15} lightingColor="#fff" result="lit">
              <feDistantLight azimuth={235} elevation={42} />
            </feDiffuseLighting>
            <feComponentTransfer in="lit" result="toned">
              <feFuncR type="linear" slope={1 - lift[0]} intercept={lift[0]} />
              <feFuncG type="linear" slope={1 - lift[1]} intercept={lift[1]} />
              <feFuncB type="linear" slope={1 - lift[2]} intercept={lift[2]} />
            </feComponentTransfer>
            <feComposite in="toned" in2="shapeSoft" operator="in" result="cloud" />
            {/* A faint outer haze so the edges melt into the sky. */}
            <feGaussianBlur in="shapeSoft" stdDeviation={22} result="haze" />
            <feColorMatrix in="haze" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.45 0" result="hazeW" />
            <feMerge>
              <feMergeNode in="hazeW" />
              <feMergeNode in="cloud" />
            </feMerge>
          </filter>
          <linearGradient id="sky-cover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.55} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={0.9} />
            <stop offset="0.75" stopColor="#fff" stopOpacity={1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0.6} />
          </linearGradient>
          <mask id="sky-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={CANVAS_W} height={CANVAS_H}>
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#sky-cover)" />
          </mask>
        </defs>
        <g mask="url(#sky-mask)">
          <rect width={CANVAS_W} height={CANVAS_H} filter="url(#sky-clouds)" />
        </g>
        <g filter="url(#sky-number)">
          <text x={540} y={numY} textAnchor="middle" fill="#fff" stroke="#fff" strokeWidth={numCap * 0.05} strokeLinejoin="round" style={{ fontFamily: ARCHIVO_BLACK, fontSize: numSize, letterSpacing: isNum ? "-0.02em" : "0" }}>
            {glyphs}
          </text>
        </g>
      </svg>

      {/* Stands peeking in at the bottom corners. */}
      {stands ? (
        <img
          src={stands}
          alt=""
          style={{
            position: "absolute",
            left: -60,
            top: 900,
            width: CANVAS_W + 120,
            height: 520,
            objectFit: "cover",
            maxWidth: "none",
            objectPosition: "50% 70%",
            filter: "blur(5px) brightness(.55) saturate(.8)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 40%)",
            maskImage: "linear-gradient(to bottom, transparent, #000 40%)",
          }}
        />
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: `linear-gradient(to bottom, transparent, ${shade(sky.top, -0.3)}cc 55%, ${shade(sky.top, -0.5)})` }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: `linear-gradient(to bottom, transparent, ${shade(sky.top, -0.5)}99)` }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.06) saturate(1.02) drop-shadow(0 -6px 30px rgba(255,255,255,.18))",
            ...cutMask({ ...data.cut, bottom: 0 }),
          }}
        />
      )}

      {/* The one line of widely spaced caps. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: lineY, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: lineSize, letterSpacing: "0.5em", paddingLeft: "0.5em", color: "#fff", whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,20,60,.35)" }}>
        {line}
      </div>

      {/* Crest × agency, small, top centre; the name under them. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ height: 50, width: 50, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.3))" }} />}
        {data.club?.crestUrl && (data.agency.logoUrl || data.agency.name) && <span style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: 22, color: "#fff", opacity: 0.85 }}>×</span>}
        <AgencyLogo data={data} height={24} style={{ color: "#fff" }} />
      </div>
      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 112, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: 18, letterSpacing: "0.42em", paddingLeft: "0.42em", color: "#fff", opacity: 0.9 }}>{name}</div>
      )}
    </div>
  );
}
