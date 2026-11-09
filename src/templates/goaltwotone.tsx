/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { crestsOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { heavyEm, placeClear, TwoToneWord } from "./twotone";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;

/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/**
 * Goaltwotone: the goal version of Twotone. The celebrating player big and in natural colour on a deep club
 * ground; the kicker ("GOAL", "BRACE" …) in heavy Inter 800, as wide as the canvas allows, across his chest /
 * waist in front of him — white on the ground, switching inside his silhouette to two flat tones taken from
 * his own pixels (club colour over a dark kit, deep tone over a light one). Competition small at the top;
 * his name and the fixture small at the foot. No score.
 */
export function Goaltwotone({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;

  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.55);
  let onDark = club;
  if (luminance(onDark) < 0.1) onDark = shade(onDark, 0.35);

  const f = matchFacts(data);

  /* ---- the top line ---- */
  const top = [f.comp, f.round].filter(Boolean).join("  ·  ");
  const T_TRACK = 0.36;
  const tSize = Math.max(11, Math.min(15 * k, (CANVAS_W - 2 * M) / Math.max(1, capsEm(top, T_TRACK)))) * ts;
  const titleTop = story ? STORY_TOP : 84;

  /* ---- the player: big, his head clear of the top line (raised arms may run past it) ---- */
  const sizes = story ? { chest: 330, waist: 270, knees: 210, full: 160 } : { chest: 250, waist: 196, knees: 150, full: 112 };
  const box = placeClear(data, sizes, story ? 400 : 270, titleTop + tSize + (story ? 60 : 46), false);
  const faceY = box.top + (data.face?.[1] ?? 0.08) * box.height;
  const chin = faceY + box.faceH;

  /* ---- the word ---- */
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const wordW = CANVAS_W - 2 * (story ? 52 : 60);
  const wSize = Math.min((story ? 330 : 270) * ts, wordW / Math.max(1, heavyEm(word) * 0.99));
  const capH = wSize * 0.727;
  const textW = Math.min(wordW, heavyEm(word) * wSize * 0.99);

  /* ---- the foot: name, then the fixture with its crests ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const N_TRACK = 0.2;
  const nSize = Math.max(14, Math.min(26 * k, (CANVAS_W - 2 * M) / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (teams[0] ?? "");
  const F_TRACK = 0.24;
  const crests = crestsOf(data).slice(0, 2);
  const CR = 30 * k;
  const crestRoom = crests.length === 2 ? 2 * (CR + 20 * k) : 0;
  const fixSize = Math.max(10, Math.min(14 * k, (CANVAS_W - 2 * M - crestRoom) / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 44 - 52;
  const fixRowTop = logoTop - (story ? 64 : 48) - Math.max(CR, fixSize);
  const nameTop = fixRowTop - 20 * k - nSize;

  // Across his chest / waist, below the chin, kept clear of the name.
  const wordTop = Math.max(chin + box.faceH * 0.55, Math.min(chin + box.faceH * 1.0, nameTop - 110 * k - capH)) + (params.textY ?? 0);
  const base = wordTop + capH;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 52% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 84%)` }} />

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - nameTop + (story ? 300 : 220), background: `linear-gradient(to bottom, transparent, ${deep}e6 45%, ${deep} 70%)` }} />

      <TwoToneWord id="goaltwotone" word={word} base={base} width={textW} size={wSize} H={H} k={k} photoUrl={data.photoUrl} box={box} ground={WHITE} onDark={onDark} onLight={deep} />

      {top && <div style={{ position: "absolute", left: M, right: M, top: titleTop, ...caps(tSize, T_TRACK, 500), color: "rgba(255,255,255,.82)" }}>{top}</div>}

      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...caps(nSize, N_TRACK, 600) }}>{name}</div>}
      {fixture && (
        <div style={{ position: "absolute", left: M, right: M, top: fixRowTop, height: Math.max(CR, fixSize), display: "flex", justifyContent: "center", alignItems: "center", gap: 20 * k }}>
          {crests.length === 2 && <img src={crests[0]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
          <div style={{ ...caps(fixSize, F_TRACK, 400), color: "rgba(255,255,255,.8)" }}>{fixture}</div>
          {crests.length === 2 && <img src={crests[1]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
        </div>
      )}

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
