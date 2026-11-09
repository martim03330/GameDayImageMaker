/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/** Inter capitals, roughly, per 1px of font size, with the tracking added per glyph. */
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, tracking: number) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/**
 * A soft gradient map through any number of stops: the photo goes to luminance, a gentle S-curve keeps the
 * face's mid-tones apart (so it stays detailed), then every tone lands on a shade of the one club hue.
 */
function ToneMap({ id, stops, contrast, lift = 0 }: { id: string; stops: string[]; contrast: number; lift?: number }) {
  const c = stops.map(rgb);
  const table = (i: number) => c.map((s) => s[i].toFixed(3)).join(" ");
  const k = contrast;
  const off = (0.5 - 0.5 * k + lift).toFixed(3);
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.28 0.6 0.12 0 0  0.28 0.6 0.12 0 0  0.28 0.6 0.12 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={k} intercept={off} />
          <feFuncG type="linear" slope={k} intercept={off} />
          <feFuncB type="linear" slope={k} intercept={off} />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table(0)} />
          <feFuncG type="table" tableValues={table(1)} />
          <feFuncB type="table" tableValues={table(2)} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

/**
 * Goaltonal: the goal post of `tonal`. A fashion-campaign monochrome: the ground one deep club tone, the
 * celebrating player rendered in the same hue through a soft gradient map (the face's mid-tones kept apart so
 * it stays readable) and melting into the ground at the foot. The title ("GOAL", "BRACE") in the lightest tint,
 * wide-tracked and light, at the top under the competition; at the foot his name, home score away in a
 * light sans, crests as pale marks on one side and the agency logo on the other.
 */
export function Goaltonal({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 7);
  // A native 9:16 story (1080×1920): the type runs from STORY_TOP to STORY_BOTTOM, a size larger, and the
  // player fills the extra height.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;

  // One clear club hue; white / yellow / near-black clubs fall back to the accent, then to a muted tone.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const ground = shade(club, -0.66);
  const lift = shade(club, -0.46);
  const low = shade(club, -0.8);
  const tint = shade(club, 0.86);
  const stops = [shade(club, -0.86), shade(club, -0.6), shade(club, -0.26), shade(club, 0.14), shade(club, 0.58), tint];

  /* ---- facts: home first ---- */
  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const oppName = titleCase(f.opp);
  const homeName = shortName(content.homeTeam?.trim() || (weHost ? oursName : oppName));
  const awayName = shortName(content.awayTeam?.trim() || (weHost ? oppName : oursName));
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  /* ---- the title, top ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.46;
  const titleSize = Math.min(78 * k, 900 / Math.max(1, capsEm(title, T_TRACK))) * ts;
  const titleTop = (story ? STORY_TOP : 84) + (params.textY ?? 0);
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(11 * k, Math.min(13 * k, (story ? 800 : 700) / Math.max(1, capsEm(comp, 0.34))));
  const titleY = titleTop + (comp ? 62 * k : 0);
  const titleBottom = titleY + titleSize * 0.75;

  /* ---- the player, centred, big; the top of the cutout (a raised fist) clears the title ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const sizes = story ? { chest: 380, waist: 300, knees: 232, full: 176 } : { chest: 290, waist: 226, knees: 176, full: 130 };
  let box = placeByFace(data, faceX, titleBottom + (story ? 180 : 140), sizes);
  // The story's bigger figure: a wide pose (arm out) is scaled back so it stays on the canvas.
  const wide = Math.min(1, 1000 / box.width);
  if (story && wide < 1) box = placeByFace(data, faceX, titleBottom + 180, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * wide])));
  const clear = titleBottom + 40 - box.top;
  if (clear > 0) box = { ...box, top: box.top + clear };
  // A fist raised to one side: centre the figure a little rather than the face alone.
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeFrom = story ? 1200 : 900;
  const fadeTo = story ? 1460 : 1110;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  const fc = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceMask = `radial-gradient(${fc[2] * box.width * 0.85}px ${fc[3] * box.height * 0.8}px at ${(fc[0] + fc[2] / 2) * box.width}px ${(fc[1] + fc[3] / 2) * box.height}px, #000 45%, transparent 100%)`;

  /* ---- the foot ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const nameSize = Math.max(11 * k, Math.min(14 * k, 640 / Math.max(1, capsEm(name, 0.36)))) * ts;
  const line = homeName && awayName ? `${homeName}  ${score || "v"}  ${awayName}` : "";
  const fixSize = Math.max(20, Math.min(30 * k, (story ? 900 : 620) / Math.max(1, line.length * 0.52))) * ts;
  const footY = story ? H - STORY_BOTTOM : 52;
  const crestFilter = params.crestColor ? "none" : "url(#goaltonal-mono)";
  const crestsLeft = r() < 0.5;

  const caps = (size: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: tint,
    textAlign: "center",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: tint }}>
      <ToneMap id="goaltonal-map" stops={stops} contrast={1.1} lift={0.06} />
      <ToneMap id="goaltonal-face" stops={stops} contrast={1.0} lift={0.13} />
      <MonoDefs id="goaltonal-mono" ink={0.5} />

      {/* The ground: one deep tone, a breath of light behind him, darker at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 46% at ${faceX / 10.8}% 42%, ${lift}, ${ground} 72%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 900 : 460, background: `linear-gradient(to bottom, transparent, ${low})` }} />

      {/* The player in the club's own hue, melting into the ground. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#goaltonal-map)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The face lifted a touch (same hue), so it reads at a glance; feathered into the figure. */}
      {data.photoUrl && data.face && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: faceMask, maskImage: faceMask }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#goaltonal-face)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the competition, a hairline, the title. */}
      {comp && <div style={{ position: "absolute", left: M, right: M, top: titleTop, ...caps(compSize, 0.34, 500, { opacity: 0.7 }) }}>{comp}</div>}
      {comp && <div style={{ position: "absolute", left: 540 - 20, top: titleTop + 32 * k, width: 40, height: 1, background: tint, opacity: 0.55 }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleY, ...caps(titleSize, T_TRACK, 200) }}>{title}</div>

      {/* Foot: his name, then home score away; crests as pale marks on one side, the logo on the other. */}
      <div style={{ position: "absolute", left: M, right: M, bottom: story ? footY + 150 : 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * k }}>
        {name && <div style={{ ...caps(nameSize, 0.36, 500, { opacity: 0.75 }) }}>{name}</div>}
        {line && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: fixSize, lineHeight: 1.1, whiteSpace: "pre", color: tint }}>{line}</div>}
      </div>
      {crests.length > 0 && (
        <div style={{ position: "absolute", bottom: footY + 4, [crestsLeft ? "left" : "right"]: M, display: "flex", gap: 18 * k, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 38 * k, height: 38 * k, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={story ? 24 : 18}
        style={{
          position: "absolute",
          ...(crests.length ? { [crestsLeft ? "right" : "left"]: M } : { left: "50%", translate: "-50% 0" }),
          bottom: footY - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: crests.length ? (crestsLeft ? "right bottom" : "left bottom") : "center bottom",
        }}
      />
      <Film strength={0.16} />
    </div>
  );
}
