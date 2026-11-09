/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { mix, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export const NOTE_INK = "#2b2924";
export const NOTE_GREY = "rgba(43,41,36,.5)";
const YELLOW = "#f7e8a0";

/** The note's paper: soft yellow, or (by seed) a pale tint of the club colour. */
export function noteColour(data: RenderData): string {
  const seed = data.params.seed ?? 0;
  return seed % 3 === 2 ? mix(clubTone(data), "#fbfaf6", 0.8) : YELLOW;
}

/** A small tilt chosen by seed: −3.2° … +2.6°, never flat. */
export function noteTilt(data: RenderData): number {
  const s = Math.abs(data.params.seed ?? 0);
  const t = [-2.6, 2.2, -1.8, 2.8, -3.2, 1.9][s % 6];
  return t;
}

/**
 * One square sticky note, `size` px, turned `tilt` degrees: the glossier adhesive band across its top,
 * the paper lifting a touch at the bottom (a soft curl shadow under its corners and light on the lifted
 * edge). Children are laid out in the note's own coordinates.
 */
export function Note({ x, y, size, tilt, colour, dark = false, children }: { x: number; y: number; size: number; tilt: number; colour: string; dark?: boolean; children?: ReactNode }) {
  const s = size;
  const shadowA = dark ? 0.6 : 0.34;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: s, height: s, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
      {/* Curl shadows: the two bottom corners lift off the ground, the middle stays close. */}
      <div style={{ position: "absolute", left: s * 0.03, bottom: s * 0.015, width: s * 0.46, height: s * 0.26, background: `rgba(0,0,0,${shadowA})`, filter: `blur(${s * 0.025}px)`, transform: `translateY(${s * 0.028}px) rotate(-3deg) skewX(-6deg)`, borderRadius: "0 0 40% 50% / 0 0 60% 60%" }} />
      <div style={{ position: "absolute", right: s * 0.03, bottom: s * 0.015, width: s * 0.46, height: s * 0.26, background: `rgba(0,0,0,${shadowA})`, filter: `blur(${s * 0.025}px)`, transform: `translateY(${s * 0.028}px) rotate(3deg) skewX(6deg)`, borderRadius: "0 0 50% 40% / 0 0 60% 60%" }} />
      {/* A wide soft shade under the whole sheet. */}
      <div style={{ position: "absolute", left: s * 0.02, right: s * 0.02, top: s * 0.08, bottom: s * 0.02, background: `rgba(0,0,0,${dark ? 0.35 : 0.1})`, filter: `blur(${s * 0.04}px)`, transform: `translateY(${s * 0.03}px)` }} />
      {/* The paper. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, ${shade(colour, -0.035)} 0%, ${colour} 15%, ${colour} 72%, ${shade(colour, -0.045)} 100%)`,
          borderRadius: `${s * 0.004}px ${s * 0.004}px ${s * 0.012}px ${s * 0.012}px`,
          boxShadow: "0 1px 1.5px rgba(0,0,0,.14)",
          overflow: "hidden",
        }}
      >
        {/* The adhesive band: a faintly glossier strip with a soft lower edge. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: s * 0.15, background: "linear-gradient(to bottom, rgba(255,255,255,.16), rgba(255,255,255,.07))", borderBottom: "1px solid rgba(0,0,0,.035)" }} />
        {/* Light across the sheet and on the lifted bottom edge. */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(255,255,255,.18) 0%, transparent 42%, transparent 75%, rgba(0,0,0,.025) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: s * 0.09, background: "linear-gradient(to top, rgba(255,255,255,.28), rgba(0,0,0,.035) 55%, transparent)" }} />
      </div>
      {children}
    </div>
  );
}

/** A drawn checkbox (empty, or ticked with a hand-free stroke check) of side `b`, in ink. */
export function Checkbox({ x, y, b, checked = false, ink = NOTE_INK }: { x: number; y: number; b: number; checked?: boolean; ink?: string }) {
  const w = Math.max(1.6, b * 0.085);
  return (
    <svg width={b * 1.5} height={b * 1.5} viewBox={`0 0 ${b * 1.5} ${b * 1.5}`} style={{ position: "absolute", left: x, top: y - b * 0.5, overflow: "visible" }}>
      <rect x={w / 2} y={b * 0.5 + w / 2} width={b - w} height={b - w} rx={b * 0.14} fill="none" stroke={ink} strokeOpacity={checked ? 0.9 : 0.6} strokeWidth={w} />
      {checked && <path d={`M ${b * 0.2} ${b * 1.0} L ${b * 0.44} ${b * 1.25} L ${b * 1.08} ${b * 0.22}`} fill="none" stroke={ink} strokeWidth={w * 1.7} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/** Inter 500 is ~1.5% wider than the 400 table. */
export const w500 = (t: string, size: number) => bodyW(t, size) * 1.02;
/** Spaced caps (Inter 500) at `size` with `track` em of tracking. */
export const capsW = (t: string, size: number, track: number) => w500(t, size) * 1.05 + t.length * track * size;

/**
 * Post-it: one idea — a single square sticky note, slightly turned, stuck on a calm plain ground. On it, in
 * clean Inter (never handwriting) like a little to-do list: "Matchday", then an empty drawn checkbox before
 * the fixture (home first, names exactly as stored), "17 October · 15:00" and the ground; the competition in
 * small caps at its foot. The player stands big beside it in natural colour. Not `sticker` (a die-cut
 * player sticker with hand lettering) — here the note is the paper, he is untouched.
 */
export function Postit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";

  /* ---- the logo, under the note ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* ---- the note ---- */
  const S = story ? 690 : 580;
  const tilt = noteTilt(data);
  const slack = (S * Math.sin((Math.abs(tilt) * Math.PI) / 180)) / 2; // the turned corner
  const nx = playerLeft ? CANVAS_W - 60 - S : 60;
  const ny = logoTop - (story ? 66 : 62) - slack - S + (params.textY ?? 0);
  const colour = noteColour(data);

  /* ---- what's written on it ---- */
  const pad = S * 0.1;
  const title = sentenceCase(content.kicker || "Matchday");
  const tSize = Math.min(S * 0.13 * ts, (S - 2 * pad) / Math.max(1, titleW(title, 1)));
  const rSize = S * 0.058 * ts;
  const box = rSize * 0.8;
  const indent = box + rSize * 0.62;
  const room = S - 2 * pad - indent;
  const fit = (t: string) => Math.max(rSize * 0.7, Math.min(rSize, room / Math.max(1, w500(t, 1))));
  const [home, away] = teamsOf(data);
  const rows: string[][] = [];
  if (home && away) rows.push(w500(`${home} v ${away}`, rSize * 0.88) <= room ? [`${home} v ${away}`] : [home, `v ${away}`]);
  else if (home) rows.push([home]);
  const when = [niceDate(content.date), f.time].filter(Boolean).join(" · ");
  if (when) rows.push([when]);
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  if (venue) rows.push([venue]);
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const cSize = Math.max(9, Math.min(S * 0.022 * ts, (S - 2 * pad) / Math.max(1, capsW(comp, 1, 0.26))));

  const lead = rSize * 1.32;
  // The writing sits in the middle of the paper between the adhesive band and the competition line.
  const blockH = tSize + S * 0.075 + rows.reduce((a, l) => a + l.length * lead + rSize * 0.62, 0) - rSize * 0.62;
  const titleTop = Math.max(S * 0.2, S * 0.15 + (S * (comp ? 0.8 : 0.85) - S * 0.15 - blockH) / 2);
  let yy = titleTop + tSize * 1.0 + S * 0.075;
  const laid = rows.map((lines) => {
    const top = yy;
    yy += lines.length * lead + rSize * 0.62;
    return { lines, top };
  });

  /* ---- the player, big, beside the note ---- */
  const faceX = playerLeft ? (story ? 360 : 300) : CANVAS_W - (story ? 360 : 300);
  const sizes = story ? { chest: 320, waist: 262, knees: 204, full: 164 } : { chest: 250, waist: 200, knees: 156, full: 124 };
  const pb = placeByFace(data, faceX, story ? STORY_TOP + 120 : 175, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = pb.top + face[1] * pb.height + pb.faceH;

  const ground = mix(club, "#e8e5df", 0.93);
  const cx = nx + S / 2;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* A calm plain ground: a soft light where he stands, the corners a shade deeper. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.55), transparent 75%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(60,55,48,.16))" }} />

      {/* The player, a soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - pb.faceH * 2, top: chin + pb.faceH * 0.3, width: pb.faceH * 4, height: pb.faceH * 6, borderRadius: "50%", background: "rgba(40,36,30,.16)", filter: `blur(${story ? 80 : 60}px)` }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: pb.left, top: pb.top, width: pb.width, height: pb.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
      )}

      <Note x={nx} y={ny} size={S} tilt={tilt} colour={colour}>
        <div style={{ position: "absolute", left: pad, top: titleTop, fontFamily: SANS, fontWeight: 600, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.02em", color: NOTE_INK, whiteSpace: "nowrap" }}>{title}</div>
        {laid.map((r, i) => (
          <div key={i}>
            <Checkbox x={pad} y={r.top + (lead - box) / 2} b={box} />
            {r.lines.map((t, j) => (
              <div key={j} style={{ position: "absolute", left: pad + indent, top: r.top + j * lead, height: lead, display: "flex", alignItems: "center", fontFamily: SANS, fontWeight: 500, fontSize: fit(t), letterSpacing: "-0.005em", color: NOTE_INK, whiteSpace: "nowrap" }}>
                {t}
              </div>
            ))}
          </div>
        ))}
        {comp && <div style={{ position: "absolute", left: pad, bottom: pad * 0.95, fontFamily: SANS, fontWeight: 500, fontSize: cSize, lineHeight: 1, letterSpacing: "0.26em", color: NOTE_GREY, whiteSpace: "nowrap" }}>{comp}</div>}
      </Note>

      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", left: cx, bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.12} />
    </div>
  );
}
