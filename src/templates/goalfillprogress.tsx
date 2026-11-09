/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { CAP900, FillWord, fillWordW } from "./fillprogress";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/**
 * Goal fillprogress: the goal post of `fillprogress`. "GOAL" in white black-weight capitals across the top
 * of a deep club-tone ground, filling letter by letter — the G a bare hairline, the O and A filled a third
 * and two thirds up, the L solid. The celebrating player in natural colour in front of it (his head under
 * the word, his arms free to rise across it); his name and the fixture small at the foot, no score.
 */
export function Goalfillprogress({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.36 : 1;
  const id = `goalfillprogress-${params.seed ?? 0}`;
  const club = clubTone(data);
  const deep = shade(club, -0.74);
  const lift = shade(club, -0.52);

  /* ---- the word ---- */
  const word = (content.kicker || "Goal").toUpperCase().replace(/’/g, "'").replace(/[.!]+$/, "");
  const M = story ? 56 : 60;
  const maxW = CANVAS_W - 2 * M;
  const size = Math.min(story ? 340 : 290, maxW / Math.max(1, fillWordW(word))) * ts;
  const wordW = fillWordW(word) * size;
  const top = (story ? STORY_TOP + 10 : 80) + (params.textY ?? 0);
  const baseline = top + CAP900 * size;
  const hair = Math.max(1.5, size * 0.009);

  /* ---- the player, in front, his head under the word ---- */
  const sizes = story ? { chest: 320, waist: 262, knees: 206, full: 164 } : { chest: 240, waist: 200, knees: 156, full: 122 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const below = (faceH: number) => baseline + Math.max(story ? 130 : 90, faceH * 0.8 + 30);
  let box = placeByFace(data, faceX, below(0), sizes);
  box = placeByFace(data, faceX, below(box.faceH), sizes);
  // A fist thrown out to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };

  /* ---- the foot ---- */
  const logoAsked = story ? 22 : 18;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teams.length === 2 ? `${teams[0]}  v  ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const colW = CANVAS_W - 2 * (story ? 80 : 110);
  const nameSize = Math.max(22 * q, Math.min(34 * q, colW / Math.max(1, bodyW(name, 1) * 1.08))) * ts;
  const fixSize = Math.max(14 * q, Math.min(19 * q, colW / Math.max(1, bodyW(fixture, 1)))) * ts;
  const comp = (f.comp || f.round || "").trim();
  const compSize = Math.max(10, Math.min(12.5 * q, colW / Math.max(1, comp.length * 0.98))) * ts;
  const gap = story ? 66 : 62;
  const fixTop = logoTop - gap - fixSize * 1.25;
  const nameTop = fixTop - 10 * q - nameSize * 1.2;
  const compTop = nameTop - 20 * q - compSize * 1.25;

  // He melts into the ground above the foot, so the small type never sits on his kit.
  const fadeTo = (comp ? compTop : nameTop) - 26 * q;
  const fadeFrom = fadeTo - (story ? 300 : 220);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom - box.top}px, transparent ${fadeTo - box.top}px)`;

  const small: CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: SANS, color: WHITE, whiteSpace: "nowrap", lineHeight: 1.25 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% ${((baseline + 420) / H) * 100}%, ${lift}, ${deep} 78%)` }} />

      <FillWord id={id} text={word} x={(CANVAS_W - wordW) / 2} baseline={baseline} size={size} color={WHITE} hair={hair} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {comp && <div style={{ ...small, top: compTop, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", paddingLeft: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>{comp}</div>}
      {name && <div style={{ ...small, top: nameTop, fontWeight: 600, fontSize: nameSize, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{name}</div>}
      {fixture && <div style={{ ...small, top: fixTop, fontWeight: 400, fontSize: fixSize, color: "rgba(255,255,255,.72)" }}>{fixture}</div>}

      <AgencyLogo
        data={data}
        height={logoAsked}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
