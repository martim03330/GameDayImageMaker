/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { mix, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/* ------------------------------------------------------------------------------------------------ */
/* The printer's furniture, shared with goalcropmarks.tsx.                                          */
/* ------------------------------------------------------------------------------------------------ */

export type Trim = { x: number; y: number; w: number; h: number };

/** Process patches of a colour control strip: C M Y K, then the overprints and two tints of K. */
const PATCHES = ["#00a0e3", "#e6007e", "#ffed00", "#1d1d1b", "#e30613", "#009640", "#312783", "#878787", "#c6c6c6"];

/** A registration target: a thin circle with a cross through it. */
function Target({ cx, cy, r, ink, line }: { cx: number; cy: number; r: number; ink: string; line: number }) {
  const arm = r * 1.75;
  return (
    <>
      <div style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `${line}px solid ${ink}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: cx - r * 0.42, top: cy - r * 0.42, width: r * 0.84, height: r * 0.84, borderRadius: "50%", background: ink }} />
      <div style={{ position: "absolute", left: cx - arm, top: cy - line / 2, width: 2 * arm, height: line, background: ink }} />
      <div style={{ position: "absolute", left: cx - line / 2, top: cy - arm, width: line, height: 2 * arm, background: ink }} />
    </>
  );
}

/**
 * Crop marks at the four corners of the trim (short hairlines in the margin, a little off the corner),
 * registration targets, a CMYK control strip and the printer's slug, in tiny mono.
 * `slugAt`: "bottom" runs it along the bottom margin, "left" up the left margin (stories).
 */
export function ProofMarks({ trim, H, ink, slug, slugInk, story, targets, stripAt, slugAt }: { trim: Trim; H: number; ink: string; slug: string; slugInk: string; story: boolean; targets: { x: number; y: number }[]; stripAt: { x: number; y: number }; slugAt: "bottom" | "left" }) {
  const line = story ? 1.6 : 1.3;
  const off = story ? 16 : 13; // gap between the trim corner and the mark
  const len = story ? 46 : 38;
  const els: ReactNode[] = [];
  const corners = [
    [trim.x, trim.y, -1, -1],
    [trim.x + trim.w, trim.y, 1, -1],
    [trim.x, trim.y + trim.h, -1, 1],
    [trim.x + trim.w, trim.y + trim.h, 1, 1],
  ];
  corners.forEach(([x, y, sx, sy], i) => {
    // Horizontal mark on the trim's horizontal edge line, out to the side; vertical one up/down.
    els.push(<div key={`h${i}`} style={{ position: "absolute", left: sx < 0 ? x - off - len : x + off, top: y - line / 2, width: len, height: line, background: ink }} />);
    els.push(<div key={`v${i}`} style={{ position: "absolute", left: x - line / 2, top: sy < 0 ? y - off - len : y + off, width: line, height: len, background: ink }} />);
  });
  const r = story ? 13 : 10;
  const patch = story ? 20 : 16;
  const fs = story ? 15 : 12;
  // The slug fits its run (JetBrains Mono advances 0.6em; tracking 0.08em).
  const run = slugAt === "bottom" ? trim.w - 2 * (off + len) - 40 : Math.min(trim.h - 2 * (off + len) - 60, STORY_BOTTOM - STORY_TOP - 40);
  const slugSize = Math.max(8, Math.min(fs, run / Math.max(1, slug.length * 0.68)));
  const slugStyle = { position: "absolute" as const, fontFamily: MONO, fontWeight: 500, fontSize: slugSize, letterSpacing: "0.08em", lineHeight: 1, whiteSpace: "nowrap" as const, color: slugInk };
  return (
    <>
      {els}
      {targets.map((t, i) => (
        <Target key={i} cx={t.x} cy={t.y} r={r} ink={ink} line={line} />
      ))}
      <div style={{ position: "absolute", left: stripAt.x, top: stripAt.y, display: "flex", outline: `${line * 0.6}px solid ${ink}`, outlineOffset: 0 }}>
        {PATCHES.map((c, i) => (
          <div key={i} style={{ width: patch, height: patch, background: c }} />
        ))}
      </div>
      {slugAt === "bottom" ? (
        <div style={{ ...slugStyle, left: trim.x, width: trim.w, textAlign: "center", top: trim.y + trim.h + (H - trim.y - trim.h) / 2 - slugSize / 2 }}>{slug}</div>
      ) : (
        <div style={{ ...slugStyle, left: trim.x / 2, top: (STORY_TOP + STORY_BOTTOM) / 2, transform: "translate(-50%, -50%) rotate(-90deg)" }}>{slug}</div>
      )}
    </>
  );
}

/** "17 OCT" + "15:00" → "17 OCT 15:00". */
export const slugDate = (date?: string, time?: string) => [(date ?? "").toUpperCase().replace(/^[A-Z]{3}\s+(?=\d)/, "").trim(), (time ?? "").trim()].filter(Boolean).join(" ");

/* ------------------------------------------------------------------------------------------------ */

const PAPER = "#fbfbf9";
const INK = "#18191b";
const GREY = "#6b6d72";

/**
 * Cropmarks: the matchday as a printer's proof. A white sheet; on it the trimmed page — the player cutout
 * big on a pale, club-tinted ground, "Matchday" set calmly in Inter at the top, the fixture (home first,
 * names as stored), date and ground at the foot over the NEYOD mark. Around the trim only the printer's
 * furniture: hairline crop marks at the corners, two registration targets, a CMYK strip and a one-line slug.
 */
export function Cropmarks({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const f = matchFacts(data);
  const teams = teamsOf(data);

  /* ---- the sheet and the trim ---- */
  const trim: Trim = story ? { x: 64, y: 112, w: CANVAS_W - 128, h: H - 224 } : { x: 64, y: 64, w: CANVAS_W - 128, h: H - 128 };
  const tBottom = trim.y + trim.h;
  const padX = story ? 64 : 56;
  const colX = trim.x + padX;
  const colW = story ? 560 : 480;

  /* ---- the logo, at the foot of the trim ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : H - tBottom + 48) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* ---- type ---- */
  const kicker = sentenceCase(content.kicker || "Matchday");
  const tSize = Math.min((story ? 128 : 104) * (params.textScale ?? 1), (story ? 640 : 520) / Math.max(1, titleW(kicker, 1) * 0.97));
  const titleTop = (story ? STORY_TOP + 6 : trim.y + 58) + ty;

  const tag = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ").toUpperCase();
  const tagSize = Math.max(9, Math.min(13 * k, colW / Math.max(1, bodyW(tag, 1) * 1.12 + tag.length * 0.2)));
  const [home, away] = teams;
  const vs = away ? `v ${away}` : "";
  const nSize = Math.max(24, Math.min(44 * k, ...[home, vs].filter(Boolean).map((t) => colW / Math.max(1, bodyW(t, 1) * 1.04))));
  const when = [niceDate(content.date), f.time].filter(Boolean).join(" · ");
  const wSize = Math.min(26 * k, colW / Math.max(1, bodyW(when, 1)));
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const gSize = Math.min(21 * k, colW / Math.max(1, bodyW(venue, 1)));

  // The info block stacked upward from ~64px over the logo.
  const nLead = nSize * 1.16;
  let y = logoTop - (story ? 66 : 62) + ty;
  const venueTop = venue ? (y -= gSize) : y;
  if (venue) y -= 12 * k;
  const whenTop = when ? (y -= wSize) : y;
  if (when) y -= 30 * k;
  const nameLines = [home, vs].filter(Boolean);
  y -= nameLines.length * nLead;
  const namesTop = y;
  if (tag) y -= 20 * k + tagSize;
  const tagTop = y;

  /* ---- the player, big on the right, his head always clear of the title ---- */
  const sizes = story ? { chest: 330, waist: 270, knees: 216, full: 170 } : { chest: 250, waist: 200, knees: 160, full: 124 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceX = story ? 760 : 740;
  const probe = placeByFace(data, faceX, 300, sizes);
  const headHalf = (probe.faceH / face[3]) * (data.photoAspect ?? 0.6) * face[2] * 0.5 + probe.faceH * 0.35;
  const titleRight = colX + titleW(kicker, tSize) * 0.97;
  const titleBottom = titleTop + tSize * 1.02;
  let faceTop = story ? STORY_TOP + 200 : 212;
  // Hair runs ~0.75 face-heights above the face box: below the title wherever they share columns.
  if (faceX - headHalf < titleRight + 24) faceTop = Math.max(faceTop, titleBottom + 36 + probe.faceH * 0.75);
  const box = placeByFace(data, faceX, faceTop, sizes);
  const chin = box.top + face[1] * box.height + box.faceH;

  // The info column stays clean: the figure fades out to its left, below the face.
  const infoW = Math.max(tag ? bodyW(tag, tagSize) * 1.12 + tag.length * 0.2 * tagSize : 0, ...[home, vs].filter(Boolean).map((t) => bodyW(t, nSize) * 1.04), when ? bodyW(when, wSize) : 0, venue ? bodyW(venue, gSize) : 0);
  const fadeX = colX + infoW - 10 - box.left;
  const fadeY = Math.max(chin + box.faceH * 0.6, tagTop - 40) - box.top;
  const fadeMask = `linear-gradient(to bottom, #000 ${Math.max(fadeY - 260, chin - box.top + box.faceH * 0.3)}px, transparent ${fadeY}px), linear-gradient(to right, transparent ${fadeX}px, #000 ${fadeX + 190}px)`;

  const ground = mix(club, "#f3f2ef", 0.88);
  const slug = [content.kicker || "Matchday", teams.length === 2 ? `${home} v ${away}` : home, slugDate(content.date, f.time), venue].filter(Boolean).join(" — ").toUpperCase();
  const text = { position: "absolute" as const, left: colX, fontFamily: SANS, whiteSpace: "nowrap" as const, lineHeight: 1, color: INK };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER }}>
      {/* The trimmed page: pale club tint, a soft light where he stands, the cutout cut clean at the trim. */}
      <div style={{ position: "absolute", left: trim.x, top: trim.y, width: trim.w, height: trim.h, overflow: "hidden", background: ground }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${((box.left + box.width / 2 - trim.x) / trim.w) * 100}% ${((chin - trim.y) / trim.h) * 100}%, rgba(255,255,255,.7), transparent 75%)` }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 55%, ${shade(club, -0.2)}14)` }} />
        <div style={{ position: "absolute", left: box.left - trim.x + box.width * 0.22, top: chin - trim.y + box.faceH * 0.8, width: box.width * 0.56, height: box.faceH * 5, borderRadius: "50%", background: "rgba(20,30,50,.1)", filter: `blur(${story ? 70 : 54}px)` }} />
        {data.photoUrl && (
          <div style={{ position: "absolute", left: box.left - trim.x, top: box.top - trim.y, width: box.width, height: box.height, WebkitMaskImage: fadeMask, maskImage: fadeMask }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
          </div>
        )}
      </div>

      {/* Type, calm, on the trim's left column. */}
      <div style={{ ...text, top: titleTop, fontWeight: 500, fontSize: tSize, letterSpacing: "-0.035em", marginLeft: -tSize * 0.04 }}>{kicker}</div>
      {tag && <div style={{ ...text, top: tagTop, fontWeight: 500, fontSize: tagSize, letterSpacing: "0.2em", color: GREY }}>{tag}</div>}
      {nameLines.map((t, i) => (
        <div key={i} style={{ ...text, top: namesTop + i * nLead, height: nLead, fontWeight: 500, fontSize: nSize, letterSpacing: "-0.015em" }}>
          {i === 1 ? (
            <>
              <span style={{ fontWeight: 400, color: GREY }}>v </span>
              {away}
            </>
          ) : (
            t
          )}
        </div>
      ))}
      {when && <div style={{ ...text, top: whenTop, fontWeight: 400, fontSize: wSize }}>{when}</div>}
      {venue && <div style={{ ...text, top: venueTop, fontWeight: 400, fontSize: gSize, color: GREY }}>{venue}</div>}

      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", left: colX, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "left bottom" }} />

      <ProofMarks
        trim={trim}
        H={H}
        ink={INK}
        slug={slug}
        slugInk="#4a4c50"
        story={story}
        targets={story ? [{ x: CANVAS_W / 2, y: trim.y / 2 }, { x: CANVAS_W / 2, y: tBottom + (H - tBottom) / 2 }] : [{ x: trim.x / 2, y: H / 2 }, { x: CANVAS_W - trim.x / 2, y: H / 2 }]}
        stripAt={story ? { x: trim.x + trim.w - 9 * 20, y: trim.y / 2 - 10 } : { x: CANVAS_W / 2 - 4.5 * 16, y: trim.y / 2 - 8 }}
        slugAt={story ? "left" : "bottom"}
      />
      <Film strength={0.08} />
    </div>
  );
}
