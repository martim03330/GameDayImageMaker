/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { GOTHIC, GradientMapDefs, cutMask } from "./fx";
import { BARLOW, BARLOW_CAP, barlowEm } from "./halfline";
import { rng } from "./kit";
import { AgencyLogo } from "./shared";
import { matchFacts, placeFace, shortFacts } from "./strokes";
import { bestLines, MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

const WHITE = "#ffffff";
const INK = "#08080a";

/** Blackletter caps: average advance relative to the font size (measured in the browser). */
const GOTHIC_W = 0.78;
const fitGothic = (t: string, width: number, max: number) => Math.max(18, Math.min(max, width / Math.max(1, [...t].length * GOTHIC_W)));

/** Very heavy film grain: coarse specks over fine noise, both deterministic. */
function grainUrl(freq: number, alpha: number, seed: number): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;
}

/**
 * Gritty two-tone "MATCH DAY" (Arsenal): a near-black, very grainy sheet with a huge side-profile of
 * the player printed in black and the club colour and bleeding off the right edge; the round, the two
 * crests and the kick-off stacked small and centred at the top in blackletter, a heavy condensed
 * title with a motion-blurred ghost cutting across him on the left, and the ground along the foot.
 */
export function Redgrain({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 71;
  const r = rng(seed);
  const raw = params.primary === "#10131c" ? params.accent : params.primary;
  let club = vivid(raw);
  // A near-white or near-black club colour would print as nothing against the ink.
  if (luminance(club) > 0.62) club = shade(club, -0.28);
  if (luminance(club) < 0.05) club = vivid(params.accent);
  if (luminance(club) < 0.05) club = "#c8102e";
  const f = matchFacts(data);
  const score = [content.homeGoals, content.awayGoals].every((g) => g != null && String(g) !== "") ? `${content.homeGoals}–${content.awayGoals}` : "";

  /* ---- the print: a side profile, huge, running off the right edge ---- */
  const right = params.side !== "left";
  const faceX = right ? 730 + r() * 50 : 350 - r() * 50;
  const want = ({ chest: 520, waist: 480, knees: 430, full: 385 } as Record<string, number>)[params.framing ?? "waist"] ?? 480;
  const fig = placeFace(data, faceX, 360 + r() * 30, want, CANVAS_H + 40);
  const chin = fig.top + (data.face ? (data.face[1] + data.face[3]) * fig.height : 700);

  /* ---- the title ---- */
  const tracking = -0.015;
  // It sits on the dark side of the frame and only grazes the edge of his head.
  const titleW = Math.min(548, right ? faceX - 140 : CANVAS_W - faceX - 140);
  const fit = bestLines(content.kicker, titleW, 440, {
    tracking,
    cap: BARLOW_CAP,
    pitch: BARLOW_CAP * 1.02,
    maxSize: 252,
    measure: (t) => barlowEm(t, tracking),
  });
  const lines = fit.lines;
  const size = fit.size * (params.textScale ?? 1);
  const widest = Math.max(...lines.map((l) => barlowEm(l, tracking)));
  const cap = size * BARLOW_CAP;
  const pitch = cap * 1.02;
  const blockH = cap + (lines.length - 1) * pitch;
  const titleTop = Math.max(580, Math.min(1090 - blockH, chin - blockH * 0.45));
  const titleX = right ? 72 : CANVAS_W - 72 - widest * size;

  /* ---- the small blackletter column at the top ---- */
  // Crests in the order the score reads: home first.
  const ours = (data.club?.name ?? "").toUpperCase();
  const weHost = content.home ?? ((content.homeTeam ?? "").toUpperCase() === ours ? true : (content.awayTeam ?? "").toUpperCase() === ours ? false : undefined);
  const crests = ((weHost === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]).slice(0, 2);
  const head = f.round || f.comp || ours;
  const stats = shortFacts(data, 2)
    .map((s) => `${s.value} ${s.label}`)
    .join("  ·  ");
  const under = postType === "matchday" ? (f.time ? `${f.time} HRS` : f.date) : score || stats || f.date;
  // Never the same line twice, and the shorter of the two: blackletter is hard work at 30 characters.
  const foot = f.venue || (ours && ours !== head ? ours : f.comp !== head ? f.comp : "");

  const titleStyle: CSSProperties = {
    position: "absolute",
    left: titleX,
    top: titleTop - size * (1 - BARLOW_CAP) * 0.62,
    fontFamily: BARLOW,
    fontWeight: 900,
    fontSize: size,
    lineHeight: `${pitch}px`,
    letterSpacing: `${tracking}em`,
    color: WHITE,
    whiteSpace: "nowrap",
    textAlign: right ? "left" : "right",
    width: widest * size,
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: INK, color: WHITE }}>
      <GradientMapDefs id={`redgrain-duo-${seed}`} dark="#080809" mid={shade(club, -0.3)} light={shade(club, 0.42)} />
      <MonoDefs id="redgrain-mono" ink={0.7} />
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        {/* Horizontal smear: the ghost of the letters, as a slow shutter would drag them. */}
        <filter id={`redgrain-smear-${seed}`} x="-40%" y="-25%" width="180%" height="150%">
          <feGaussianBlur stdDeviation="19 2.4" />
        </filter>
      </svg>

      {/* The sheet: near-black, faintly lit from the side by the club colour. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at ${right ? 72 : 28}% 46%, ${shade(club, -0.66)} 0%, #0c0c0f 46%, ${INK} 100%)` }} />

      {/* The player as a two-tone print, bleeding off the edge. */}
      {data.photoUrl && (
        <div data-bleed style={{ position: "absolute", inset: 0 }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{
              position: "absolute",
              left: fig.left,
              top: fig.top,
              width: fig.width,
              height: fig.height,
              maxWidth: "none",
              filter: `contrast(1.38) brightness(1.04) url(#redgrain-duo-${seed})`,
              ...cutMask(data.cut),
            }}
          />
          {/* Grain printed into the figure itself, so the enlargement never reads as soft. */}
          <div
            style={{
              position: "absolute",
              left: fig.left,
              top: fig.top,
              width: fig.width,
              height: fig.height,
              backgroundImage: grainUrl(0.85, 1, (seed % 41) + 3),
              backgroundSize: "560px 560px",
              mixBlendMode: "overlay",
              opacity: 0.75,
              WebkitMaskImage: `url(${maskUrl(data.photoUrl)})`,
              maskImage: `url(${maskUrl(data.photoUrl)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
          {/* The far side of him falls away into the black of the sheet. */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${right ? 100 : 260}deg, rgba(8,8,10,.94) 0%, rgba(8,8,10,.55) 22%, transparent 48%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,10,.8) 0%, transparent 18%, transparent 74%, rgba(8,8,10,.92) 100%)", pointerEvents: "none" }} />
        </div>
      )}

      {/* The title: a motion-blurred ghost, then the hard white letters over it. */}
      <div data-bleed style={{ ...titleStyle, filter: `url(#redgrain-smear-${seed})`, opacity: 0.62, transform: `translate(${right ? -26 : 26}px, 3px)` }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div data-bleed style={{ ...titleStyle, textShadow: "0 4px 26px rgba(0,0,0,.7)" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* Round, crests and kick-off, centred at the top in blackletter. */}
      <div style={{ position: "absolute", left: 120, right: 120, top: 62, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        {head && (
          <div style={{ fontFamily: GOTHIC, fontSize: fitGothic(head, 760, 54), lineHeight: 1.1, color: WHITE, textAlign: "center", textShadow: "0 3px 18px rgba(0,0,0,.8)" }}>{head}</div>
        )}
        {crests.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 98, height: 98, objectFit: "contain", filter: "drop-shadow(0 4px 14px rgba(0,0,0,.7))" }} />
            ))}
          </div>
        )}
        {under && (
          <div style={{ fontFamily: GOTHIC, fontSize: fitGothic(under, 620, 50), lineHeight: 1.1, color: WHITE, textAlign: "center", textShadow: "0 3px 18px rgba(0,0,0,.8)" }}>{under}</div>
        )}
      </div>

      {/* The ground along the foot. */}
      {foot && (
        <div style={{ position: "absolute", left: 110, right: 110, bottom: 62, textAlign: "center", fontFamily: GOTHIC, fontSize: fitGothic(foot, 820, 50), lineHeight: 1.1, color: WHITE, textShadow: "0 3px 18px rgba(0,0,0,.85)" }}>{foot}</div>
      )}

      {/* Very heavy grain over the whole sheet. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: grainUrl(0.7, 0.95, (seed % 53) + 11), backgroundSize: "700px 700px", opacity: 0.4, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: grainUrl(0.28, 0.8, (seed % 29) + 5), backgroundSize: "420px 420px", opacity: 0.22, mixBlendMode: "soft-light", pointerEvents: "none" }} />
      {/* Overlay noise dies in the blacks: this one lifts them, so the whole sheet is grainy. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: grainUrl(0.62, 1, (seed % 37) + 17), backgroundSize: "620px 620px", opacity: 0.16, mixBlendMode: "screen", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(118% 88% at 50% 45%, transparent 42%, rgba(0,0,0,.72) 100%)", pointerEvents: "none" }} />

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: 62, bottom: 58, opacity: 0.62, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.8))" }} />
    </div>
  );
}
