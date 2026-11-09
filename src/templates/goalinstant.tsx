/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, fitText, fixtureOf, PAPER_BG, placeInWindow, PRINT_GREY, PRINT_INK, PrintGround, PrintSheen, sentence } from "./instant";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM } from "./types";

/**
 * Goal instant: the goal sibling of `instant`. One instant print on a deep, plain club-toned ground, turned
 * the other way, a soft shadow under it. The celebrating player stands in its square window over his own
 * photo softened like instant film — and his head and raised arms break out over the window's top edge,
 * over the white border and onto the ground. On the thick margin in clean Inter: "Goal" (the kicker), his
 * name, the fixture (home first, names as stored, never the score). The NEYOD mark sits below the print.
 */
export function Goalinstant({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const club = clubTone(data);
  const ground = shade(club, -0.74);

  /* ---- the print ---- */
  const W = story ? 960 : 720;
  const side = Math.round(W * 0.05);
  const win = W - 2 * side;
  const foot = Math.round(W * 0.24);
  const PH = side + win + foot;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 48) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const top = (story ? logoTop - 96 - PH : logoTop - 112 - PH) + (params.textY ?? 0);
  const left = (CANVAS_W - W) / 2;
  const tilt = (params.seed ?? 0) % 2 === 0 ? 2 : -1.8;

  /* ---- the player: face just over the window's top edge ---- */
  const faceX = win / 2 + (params.side === "left" ? -win * 0.07 : params.side === "right" ? win * 0.07 : 0);
  const sizes = { chest: win * 0.2, waist: win * 0.165, knees: win * 0.135, full: win * 0.11 };
  const probe = placeInWindow(data, win, faceX, 0, sizes, 1.3);
  // Chin just over the edge: his whole head and raised arms break out of the picture, the edge never crosses his face.
  const wantFaceTop = -probe.faceH * 1.08;
  let box = placeInWindow(data, win, faceX, wantFaceTop, sizes, 1.3);
  // Keep everything he raises ≥ 40px (post) / clear of the story's top bar inside the canvas.
  const minTop = (story ? 150 : 40) - (top + side);
  const dy = Math.max(0, minTop - box.top);
  box = { ...box, top: box.top + dy, faceTop: box.faceTop + dy };
  // An arm flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-win * 0.1, Math.min(win * 0.1, (win - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean, faceCx: box.faceCx + lean };
  const chin = box.faceTop + box.faceH;

  /* ---- the margin ---- */
  const title = sentence(content.kicker || "Goal");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = fixtureOf(data).join("  v  ").toUpperCase();
  const room = win - 8;
  const k = (story ? 1.32 : 1) * ts;
  const tSize = fitText(title, room, 40 * k, 18);
  const nSize = fitText(name, room, 24 * k, 12);
  const fSize = fitText(fixture, room, 13 * k, 9, 0.68, 0.2);
  const g1 = 14 * k;
  const g2 = 16 * k;
  const blockH = tSize + (name ? g1 + nSize : 0) + (fixture ? g2 + fSize : 0);
  const blockTop = side + win + (foot - blockH) / 2 - 2 * k;

  const line = (size: number, weight: number, color: string, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color,
    ...extra,
  });

  const img = (extra?: CSSProperties) =>
    data.photoUrl ? (
      <img
        src={data.photoUrl}
        alt=""
        style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(.97)", ...cutMask(data.cut, 1.3), ...extra }}
      />
    ) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#fff" }}>
      {/* The ground: deep and plain, a quiet pool of light where the print lies. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 48% at 50% ${((top + PH * 0.42) / H) * 100}%, ${shade(club, -0.52)} 0%, transparent 80%)` }} />

      <div style={{ position: "absolute", left, top, width: W, height: PH, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
        {/* Its shadow. */}
        <div style={{ position: "absolute", left: 8, right: 8, top: 30, bottom: -22, background: "rgba(0,0,0,.55)", filter: `blur(${story ? 36 : 30}px)`, borderRadius: 8 }} />
        <div style={{ position: "absolute", inset: 0, background: PAPER_BG, borderRadius: 3, boxShadow: "0 1px 2px rgba(0,0,0,.3)" }} />

        {/* The window: his own photo, then him. */}
        <div style={{ position: "absolute", left: side, top: side, width: win, height: win, overflow: "hidden", background: shade(club, -0.4) }}>
          <PrintGround data={data} win={win} club={club} dark />
          <div style={{ position: "absolute", left: box.faceCx - box.faceH * 2.4, top: chin, width: box.faceH * 4.8, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.22)", filter: `blur(${Math.round(win * 0.06)}px)` }} />
          {img()}
          <PrintSheen />
        </div>

        {/* The breakout: only what rises above the window's top edge, drawn over the border and the ground. */}
        <div style={{ position: "absolute", left: side, top: side, width: win, height: win, clipPath: `polygon(-2000px -3000px, ${win + 2000}px -3000px, ${win + 2000}px 0px, -2000px 0px)` }}>
          {img()}
        </div>

        {/* The margin: title, name, fixture. */}
        <div style={{ position: "absolute", left: side + 4, top: blockTop, ...line(tSize, 600, PRINT_INK, { letterSpacing: "-0.015em" }) }}>{title}</div>
        {name && <div style={{ position: "absolute", left: side + 4, top: blockTop + tSize + g1, ...line(nSize, 400, PRINT_INK, { letterSpacing: "-0.005em" }) }}>{name}</div>}
        {fixture && (
          <div style={{ position: "absolute", left: side + 4, top: blockTop + tSize + (name ? g1 + nSize : 0) + g2, ...line(fSize, 500, PRINT_GREY, { letterSpacing: "0.2em" }) }}>{fixture}</div>
        )}
      </div>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
