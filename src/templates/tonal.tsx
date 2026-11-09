/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
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
 * Tonal: a fashion-campaign monochrome. The ground one flat deep club tone; the player rendered in the same
 * hue through a smooth gradient map — shadows a darker shade, highlights a near-white tint of the club colour —
 * melting into the ground at the foot. The title in the lightest tint, wide-tracked and light, at the top;
 * the fixture, date and ground small at the foot, crests as pale marks.
 */
export function Tonal({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  // Native 9:16 story: title under the profile bar, the foot above the reply bar, a bigger figure between.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const r = rng(params.seed ?? 7);

  // One clear club hue; white / yellow / near-black clubs fall back to the accent, then to a muted tone.
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const ground = shade(club, -0.66);
  const lift = shade(club, -0.5);
  const low = shade(club, -0.78);
  const tint = shade(club, 0.86);
  const stops = [shade(club, -0.86), shade(club, -0.62), shade(club, -0.3), shade(club, 0.1), shade(club, 0.55), tint];

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, centred, big ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const box = story
    ? placeByFace(data, faceX, STORY_TOP + 270, { chest: 400, waist: 320, knees: 240, full: 176 })
    : placeByFace(data, faceX, 290, { chest: 300, waist: 240, knees: 180, full: 132 });
  const fadeFrom = story ? 1250 : 930;
  const fadeTo = story ? 1480 : 1130;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  /* ---- the title, top ---- */
  const title = (postType === "result" && isResult ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.42;
  const titleSize = Math.min(44 * k, 900 / Math.max(1, capsEm(title, T_TRACK))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(11, Math.min(13 * k, 700 / Math.max(1, capsEm(comp, 0.34))));

  /* ---- the foot ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? titleCase(f.opp));
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? (isResult ? `${pair[0]}  ${score}  ${pair[1]}` : `${pair[0]}  v  ${pair[1]}`) : opp ? `v ${opp}` : "";
  const fixSize = Math.max(18, Math.min(26 * k, (story ? 860 : 620) / Math.max(1, fixture.length * 0.52))) * ts;
  const when = [niceDate(content.date), isResult ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const whenSize = Math.max(13, Math.min(16 * k, (story ? 860 : 620) / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : "url(#tonal-mono)";
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
      <ToneMap id="tonal-map" stops={stops} contrast={1.12} lift={0.05} />
      <MonoDefs id="tonal-mono" ink={0.5} />

      {/* The ground: one flat deep tone, a breath of light behind him, darker at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 46% at ${faceX / 10.8}% 40%, ${lift}, ${ground} 72%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 420, background: `linear-gradient(to bottom, transparent, ${low})` }} />

      {/* The player in the club's own hue, melting into the ground. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#tonal-map)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top: the competition, a hairline, the title. */}
      {comp && <div style={{ position: "absolute", left: M, right: M, top: titleTop, ...caps(compSize, 0.34, 500, { opacity: 0.7 }) }}>{comp}</div>}
      <div style={{ position: "absolute", left: 540 - 20, top: titleTop + 32 * k, width: 40 * k, height: 1, background: tint, opacity: 0.55 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop + 58 * k, ...caps(titleSize, T_TRACK, 200) }}>{title}</div>

      {/* Foot: the fixture, then date · kick-off · ground; crests as pale marks on one side, the logo on the other. */}
      <div style={{ position: "absolute", left: M, right: M, bottom: story ? H - STORY_BOTTOM + 152 : 132, display: "flex", flexDirection: "column", alignItems: "center", gap: story ? 18 : 14 }}>
        {fixture && <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: fixSize, lineHeight: 1.1, whiteSpace: "nowrap", color: tint }}>{fixture}</div>}
        {when && <div style={{ ...caps(whenSize, 0.16, 400, { opacity: 0.68, textTransform: "none" }) }}>{when}</div>}
      </div>
      {crests.length > 0 && (
        <div style={{ position: "absolute", bottom: story ? H - STORY_BOTTOM + 4 : 54, [crestsLeft ? "left" : "right"]: M, display: "flex", gap: story ? 22 : 18, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 52 : 38, height: story ? 52 : 38, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={story ? 24 : 18}
        style={{
          position: "absolute",
          [crests.length && crestsLeft ? "right" : crests.length ? "left" : "left"]: crests.length ? M : undefined,
          ...(crests.length ? {} : { left: "50%", translate: "-50% 0" }),
          bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: crests.length ? (crestsLeft ? "right bottom" : "left bottom") : "center bottom",
        }}
      />
      <Film strength={0.16} />
    </div>
  );
}
