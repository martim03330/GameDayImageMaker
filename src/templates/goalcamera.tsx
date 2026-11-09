/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { Segments, STAMP, fixtureOf, stampOf, fitInter } from "./datestamp";
import { cutMask, Film } from "./fx";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/**
 * Goal camera: the date-stamp idea for a goal. The celebrating player large and sharp on his own photo,
 * softly blurred and graded warm like a disposable-camera print; in the top-right corner the imprint reads
 * "GOAL" over the date, both glowing orange-red seven-segment. At the foot, centred and small in Inter, his
 * name and the fixture (home first, never the score), the NEYOD mark under them.
 */
export function Goalcamera({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);

  const { f, teams } = fixtureOf(data);
  const st = stampOf(content.date, f.time);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/[’']/g, "").replace(/!/g, "").trim();

  /* ---- the stamp, top-right ---- */
  const M = story ? 72 : 60;
  const dateH = (story ? 50 : 38) * ts;
  const wordH = dateH * 0.8;
  const pad = dateH * 0.3;
  const stampTop = (story ? STORY_TOP : 64) + ty;

  /* ---- the foot: name + fixture over the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TR = 0.2;
  const nSize = fitInter(name, story ? 860 : 760, 28 * S * ts, N_TR, 15);
  const fixture = teams.join("  v  ");
  const fxSize = fitInter(fixture, story ? 880 : 800, 18 * S * ts, 0, 12);
  const fixBottom = (story ? STORY_BOTTOM : CANVAS_H - 44) - logoH - (story ? 62 : 40);
  const fixTop = fixBottom - fxSize * 1.1;
  const nameTop = fixTop - (story ? 18 : 14) - nSize;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player, large, centred on the figure ---- */
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  let box = placeByFace(data, faceX, story ? STORY_TOP + 230 : 190, story ? { chest: 340, waist: 268, knees: 210, full: 166 } : { chest: 240, waist: 190, knees: 148, full: 116 });
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeTo = footTop - (story ? 40 : 30) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 340 : 260)}px, transparent ${fadeTo}px)`;

  const back = data.bgPhotoUrl ?? sceneOf(data);
  const grade = "sepia(.16) saturate(1.12) contrast(1.06) brightness(1.02)";
  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,.45)", textAlign: "center" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.6), color: WHITE }}>
      {back ? (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: H + 180, maxWidth: "none", objectFit: "cover", filter: `blur(${story ? 28 : 24}px) ${grade} brightness(.88)` }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 42%, ${shade(club, 0.05)}, ${shade(club, -0.55)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,170,90,.10)", mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(200deg, rgba(255,214,160,.14), transparent 45%, rgba(40,10,0,.2))" }} />

      {/* Soft shade behind him, then the sharp figure melting away above the foot. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: box.top + box.height * 0.18, width: box.width * 0.6, height: box.height * 0.55, borderRadius: "50%", background: "rgba(0,0,0,.24)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: grade, ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(20,8,0,.42) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 700 : 460, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.38))" }} />

      {/* The imprint: GOAL over the date, top-right. */}
      <div style={{ position: "absolute", right: M - pad, top: stampTop - pad, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: dateH * 0.12 }}>
        {/* The word in real letters (seven segments turned "GOAL" into "COAL"), same burnt-in orange glow. */}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: wordH * 0.95, lineHeight: 1, letterSpacing: "0.14em", color: STAMP, transform: "skewX(-7deg)", filter: `blur(${Math.max(0.5, wordH * 0.012)}px)`, textShadow: `0 0 ${wordH * 0.08}px rgba(255,110,40,.9), 0 0 ${wordH * 0.25}px rgba(255,70,20,.5)` }}>{word}</div>
        <Segments text={st.date} h={dateH} />
      </div>

      {/* Foot: his name and the fixture, small and centred. */}
      {name && <div style={{ position: "absolute", left: 50, right: 50, top: nameTop, ...soft, fontFamily: SANS, fontWeight: 600, fontSize: nSize, letterSpacing: `${N_TR}em`, paddingLeft: `${N_TR}em`, lineHeight: 1 }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: 50, right: 50, top: fixTop, ...soft, fontFamily: SANS, fontWeight: 400, fontSize: fxSize, lineHeight: 1.1, color: "rgba(255,255,255,.8)" }}>{fixture}</div>}

      <AgencyLogo data={data} height={story ? 24 : 20} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.3} />
    </div>
  );
}
