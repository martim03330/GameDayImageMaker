/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film, GradientMapDefs } from "./fx";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** The frame's inset from the canvas edge. */
const IN = 44;
const LINE = "rgba(255,255,255,.62)";

/**
 * Goal inset: the goal post of `inset`. One deep club tone (his own photo blurred and mapped to the club
 * hue), the celebrating player in natural colour inside a hairline frame. The frame's top edge is broken by
 * "GOAL", its foot by the scorer's name; the fixture and the competition run vertically up the sides;
 * crests small inside the top corners, the agency mark in a bottom corner. No score.
 */
export function Goalinset({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.4 : 1;
  const TOP = story ? STORY_TOP + 12 : IN;
  const BOT = story ? H - STORY_BOTTOM + 11 : IN;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const dark = shade(club, -0.78);
  const mid = shade(club, -0.5);
  const light = shade(club, -0.18);

  const f = matchFacts(data);

  /* ---- the four labels ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) !== lc(ours) && t.toUpperCase() === f.opp);
  const opp = (typed ?? f.opp ?? "").toUpperCase();
  const us = ours.toUpperCase();
  const pair = weHost ? [us, opp] : [opp, us];
  const fixture = us && opp ? `${pair[0]}  v  ${pair[1]}` : "";
  const comp = [f.comp, f.round].map((t) => (t || "").toUpperCase()).find(Boolean) ?? "";

  // Tiny spaced caps, shrunk so a long label never fills more than its share of the edge.
  const ts = params.textScale ?? 1;
  const capsSize = (t: string, room: number, max: number) => Math.max(11, Math.min(max, room / Math.max(1, t.length * 1.12))) * ts * S;
  const caps = (size: number, spacing = 0.5): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${spacing}em`, color: WHITE, whiteSpace: "nowrap", lineHeight: 1 });
  const titleSize = capsSize(title, 560, 19);
  const footSize = capsSize(name, 620, 17);
  const sideSize = (t: string) => capsSize(t, story ? 900 : 700, 13);

  /* ---- the player, centred inside the frame, fading out above its foot ---- */
  let box = story
    ? placeByFace(data, 540 + (params.side === "left" ? -20 : 20), 440, { chest: 340, waist: 272, knees: 210, full: 166 })
    : placeByFace(data, 540 + (params.side === "left" ? -20 : 20), 250, { chest: 226, waist: 178, knees: 138, full: 108 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // A wide celebration (arms out) must stay inside the frame: shrink around the face, then drop the figure
  // so it still runs into the frame's foot.
  const maxW = CANVAS_W - 2 * IN - (story ? 150 : 120);
  if (box.width > maxW) {
    const k = maxW / box.width;
    const fx = box.left + (face[0] + face[2] / 2) * box.width;
    const ft = box.top + face[1] * box.height;
    const width = box.width * k;
    const height = box.height * k;
    const top = Math.max(ft - face[1] * height, H - BOT + 20 - height);
    box = { left: fx - (face[0] + face[2] / 2) * width, top, width, height, faceH: box.faceH * k };
  }
  // Arms thrown to one side: centre the figure rather than the face.
  const lean = (CANVAS_W - (2 * box.left + box.width)) / 2;
  box = { ...box, left: box.left + Math.max(-90, Math.min(90, lean)) };
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = H - BOT - 40;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 230 - box.top}px, transparent ${fadeEnd - box.top}px)`;

  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]) as (string | null)[];
  const crestFilter = params.crestColor ? "none" : "url(#goalinset-mono)";
  const hair = (style: CSSProperties) => <div style={{ background: LINE, flex: 1, ...style }} />;
  const gap = 22 * S;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: mid, color: WHITE }}>
      <GradientMapDefs id="goalinset-tone" dark={dark} mid={mid} light={light} />
      <MonoDefs id="goalinset-mono" ink={0.55} />

      {/* One deep tone: his photo, blurred and mapped to the club hue, contrast pressed flat. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -100, top: -100, width: CANVAS_W + 200, height: H + 200, maxWidth: "none", objectFit: "cover", filter: "blur(22px) url(#goalinset-tone) contrast(.8)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 40%, transparent, ${dark}88)` }} />

      {/* A soft shade under him instead of a drop shadow, then the player in natural colour. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: chin + box.faceH * 0.6, width: box.width * 0.6, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.24)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The frame: four hairlines, each broken by its label. */}
      <div style={{ position: "absolute", left: IN, right: IN, top: TOP, height: 1, display: "flex", alignItems: "center" }}>
        {hair({ height: 1 })}
        <span style={{ ...caps(titleSize, 0.7), padding: `0 ${gap}px 0 ${gap + titleSize * 0.7}px` }}>{title}</span>
        {hair({ height: 1 })}
      </div>
      <div style={{ position: "absolute", left: IN, right: IN, bottom: BOT, height: 1, display: "flex", alignItems: "center" }}>
        {hair({ height: 1 })}
        {name && <span style={{ ...caps(footSize, 0.42), padding: `0 ${gap}px 0 ${gap + footSize * 0.42}px` }}>{name}</span>}
        {hair({ height: 1 })}
      </div>
      {/* Sides: the fixture reads bottom-to-top on the left, the competition top-to-bottom on the right. */}
      <div style={{ position: "absolute", left: IN, top: TOP, bottom: BOT, width: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hair({ width: 1 })}
        {fixture && <span style={{ ...caps(sideSize(fixture), 0.36), writingMode: "vertical-rl", transform: "rotate(180deg)", padding: `${gap}px 0 ${gap + sideSize(fixture) * 0.36}px` }}>{fixture}</span>}
        {hair({ width: 1 })}
      </div>
      <div style={{ position: "absolute", right: IN, top: TOP, bottom: BOT, width: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {hair({ width: 1 })}
        {comp && <span style={{ ...caps(sideSize(comp), 0.36), writingMode: "vertical-rl", padding: `${gap + sideSize(comp) * 0.36}px 0 ${gap}px` }}>{comp}</span>}
        {hair({ width: 1 })}
      </div>

      {/* Crests, small, inside the top corners. */}
      {crests[0] && <img src={crests[0]} alt="" style={{ position: "absolute", left: IN + 30, top: TOP + (story ? 36 : 30), width: 50 * S, height: 50 * S, objectFit: "contain", filter: crestFilter }} />}
      {crests[1] && <img src={crests[1]} alt="" style={{ position: "absolute", right: IN + 30, top: TOP + (story ? 36 : 30), width: 50 * S, height: 50 * S, objectFit: "contain", filter: crestFilter }} />}

      <AgencyLogo data={data} height={story ? 28 : 18} style={{ position: "absolute", right: IN + 30, bottom: BOT + (story ? 78 : 28) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }} />
      <Film strength={0.2} />
    </div>
  );
}
