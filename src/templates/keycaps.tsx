/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { datesOf } from "./nowplaying";
import { bodyW, clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export type CapTone = { top: string; top2: string; skirt: string; skirt2: string; ink: string; rim: string };

/** Soft off-white keys. */
export const PALE_CAP: CapTone = { top: "#ffffff", top2: "#f3f2ee", skirt: "#e6e4df", skirt2: "#cfccc5", ink: "#2a2a2e", rim: "rgba(0,0,0,.06)" };

/** A key in `color`: a lighter top face over a darker skirt, white legend. */
export function clubCap(color: string): CapTone {
  return { top: shade(color, 0.12), top2: shade(color, 0.02), skirt: shade(color, -0.18), skirt2: shade(color, -0.4), ink: "#ffffff", rim: "rgba(0,0,0,.12)" };
}

/**
 * One keycap seen from a little above: a rounded skirt (the sides, darker, deeper at the front), a dished
 * top face inset into it (lighter), the legend centred on the face and a tiny soft shadow under it.
 * `pressed` sinks it: less skirt showing, a tighter shadow.
 */
export function Keycap({ x, y, w, h, char, tone, size, pressed, weight = 500, shadow = "rgba(40,36,30,.22)" }: { x: number; y: number; w: number; h: number; char: string; tone: CapTone; size: number; pressed?: boolean; weight?: number; shadow?: string }) {
  const r = h * 0.17;
  const dy = pressed ? h * 0.07 : 0;
  const front = pressed ? 0.1 : 0.17; // how much skirt shows under the top face
  return (
    <div style={{ position: "absolute", left: x, top: y + dy, width: w, height: h - dy }}>
      {/* the shadow it casts on the ground */}
      <div style={{ position: "absolute", left: w * 0.04, right: w * 0.04, top: h * 0.3, bottom: -h * (pressed ? 0.02 : 0.06), borderRadius: r, background: shadow, filter: `blur(${h * (pressed ? 0.04 : 0.08)}px)` }} />
      {/* the skirt */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          background: `linear-gradient(to bottom, ${tone.skirt} 0, ${tone.skirt} 55%, ${tone.skirt2} 100%)`,
          boxShadow: `inset 0 0 0 1px ${tone.rim}, inset 0 -${h * 0.02}px ${h * 0.03}px rgba(0,0,0,.08)`,
        }}
      />
      {/* the top face */}
      <div
        style={{
          position: "absolute",
          left: w * 0.085,
          right: w * 0.085,
          top: h * 0.045,
          bottom: h * front,
          borderRadius: r * 0.8,
          background: `linear-gradient(to bottom, ${tone.top}, ${tone.top2})`,
          boxShadow: `0 ${h * 0.012}px ${h * 0.02}px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.55)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SANS,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1,
          color: tone.ink,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ position: "relative", top: -size * 0.02 }}>{char}</span>
      </div>
    </div>
  );
}

/**
 * Keycaps: the kick-off time spelled on a row of soft keyboard keys — [1][5][:][0][0] — off-white caps with
 * a lighter top face over a darker skirt and a tiny shadow, the colon key in the club colour. Above the row
 * "Matchday" and the fixture (home first, exact names) in small Inter; under it the date and the ground.
 * The player big and sharp on the other side of a pale ground. Flips with params.side.
 */
export function Keycaps({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";
  const M = 64;

  /* ---- the keys: the time, else the date ---- */
  const dates = datesOf(content.date);
  const raw = (f.timeLocal || f.time || content.time || "").replace(/[^\d:]/g, "") || dates.short.toUpperCase().replace(/\s+/g, "");
  const chars = [...raw].slice(0, 7);
  const accentAt = chars.indexOf(":") >= 0 ? chars.indexOf(":") : chars.length - 1;

  const colW = story ? CANVAS_W - 2 * M : 560;
  const colX = story ? M : playerLeft ? CANVAS_W - M - colW : M;
  const gapR = 0.12;
  const narrow = 0.62; // the colon key is narrower, like a punctuation key
  const units = chars.reduce((a, c) => a + (c === ":" ? narrow : 1), 0) + gapR * (chars.length - 1);
  const keyH = Math.min(story ? 178 : 112, colW / units);
  const gap = keyH * gapR;
  const rowW = units * keyH;
  const rowX = story ? (CANVAS_W - rowW) / 2 : playerLeft ? colX + colW - rowW : colX;
  const legend = keyH * 0.42;

  /* ---- text ---- */
  const teams = teamsOf(data).join(" v ");
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const comp = titleCase(f.comp);
  const dateLine = [dates.long, f.timePt ? `${f.timePt} ${f.timeRef || "PT"}` : "", comp].filter(Boolean).join(" · ");
  const fit = (t: string, base: number) => Math.max(base * 0.7, Math.min(base, colW / Math.max(1, bodyW(t, 1))));
  const labelS = 15 * k;
  const teamS = fit(teams, 30 * k);
  const dateS = fit(dateLine, 23 * k);
  const venueS = fit(venue, 23 * k);

  /* ---- the foot: logo, then the info stacked up from it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const venueTop = logoTop - (story ? 66 : 56) - venueS * 1.2 + ty;
  const dateTop = (venue ? venueTop - 10 * k : venueTop + venueS * 1.2) - dateS * 1.2;
  const keysTop = dateTop - 40 * k - keyH;
  const teamTop = keysTop - 40 * k - teamS * 1.2;
  const labelTop = teamTop - 14 * k - labelS * 1.2;

  /* ---- the player: big, on his side ---- */
  const sideX = playerLeft ? -1 : 1;
  const faceX = 540 + sideX * (story ? 90 : 230);
  const sizes = story ? { chest: 380, waist: 300, knees: 236, full: 182 } : { chest: 262, waist: 206, knees: 160, full: 124 };
  const probe = placeByFace(data, faceX, 300, sizes);
  const box = placeByFace(data, faceX, (story ? STORY_TOP + 30 : 70) + probe.faceH * 0.55, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = (story ? labelTop + 40 : H - 20) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 280)}px, transparent ${fadeEnd}px)`;
  const bg = "#f1f0ec";
  const line = (s: number, weight: number, color: string, extra?: CSSProperties): CSSProperties => ({
    position: "absolute",
    left: colX,
    width: colW,
    textAlign: story ? "center" : playerLeft ? "right" : "left",
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: s,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    color,
    whiteSpace: "nowrap",
    ...extra,
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: bg }}>
      {/* A pale, still ground: soft light behind him, the faintest breath of the club colour. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 40% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.82)}99, rgba(241,240,236,0) 72%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(38% 26% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.8), rgba(255,255,255,0) 75%)` }} />
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.1, top: chin + box.faceH * 0.5, width: box.faceH * 4.2, height: box.faceH * 4.2, borderRadius: "50%", background: `${shade(club, -0.5)}18`, filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* Clean ground under the info: in the story across the width, in the post on the text side. */}
      {story ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: labelTop - 200, bottom: 0, background: `linear-gradient(to bottom, rgba(241,240,236,0), ${bg} 200px)` }} />
      ) : (
        <div
          style={{
            position: "absolute",
            top: labelTop - 140,
            bottom: 0,
            ...(playerLeft ? { right: 0, width: colW + M + 200 } : { left: 0, width: colW + M + 200 }),
            background: `linear-gradient(to ${playerLeft ? "left" : "right"}, ${bg} 0, ${bg} ${colW + M}px, rgba(241,240,236,0) 100%)`,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 140px)",
            maskImage: "linear-gradient(to bottom, transparent 0, #000 140px)",
            opacity: 0.9,
          }}
        />
      )}

      <div style={line(labelS, 600, club, { top: labelTop, letterSpacing: "0.2em", textTransform: "uppercase", ...(story ? { paddingLeft: "0.2em" } : playerLeft ? { paddingRight: 0 } : {}) })}>Matchday</div>
      <div style={line(teamS, 500, "#141416", { top: teamTop })}>{teams}</div>

      {chars.map((c, i) => {
        const before = chars.slice(0, i).reduce((a, ch) => a + (ch === ":" ? narrow : 1) * keyH + gap, 0);
        const w = (c === ":" ? narrow : 1) * keyH;
        return <Keycap key={i} x={rowX + before} y={keysTop} w={w} h={keyH} char={c} size={legend} tone={i === accentAt ? clubCap(club) : PALE_CAP} />;
      })}

      {dateLine && <div style={line(dateS, 400, "#3c3c40", { top: dateTop })}>{dateLine}</div>}
      {venue && <div style={line(venueS, 400, "#8a8a8f", { top: venueTop })}>{venue}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{
          position: "absolute",
          ...(story ? { left: "50%" } : playerLeft ? { right: M - 4 } : { left: M - 4 }),
          bottom: logoBottom,
          transform: `${story ? "translateX(-50%) " : ""}scale(${logoScale})`,
          transformOrigin: story ? "center bottom" : playerLeft ? "right bottom" : "left bottom",
        }}
      />
      <Film strength={0.1} />
    </div>
  );
}
