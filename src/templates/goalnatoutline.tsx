/* eslint-disable @next/next/no-img-element */
import { FACES, wordEm } from "./goalhero";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · outline: his real celebration photo full-bleed (light grade only) with "GOAL" huge as
 * OUTLINE-only letters — a thin white stroke, no fill — across the sky / stands above him, set between the
 * photo and the sharp cutout laid exactly over his figure, so his head overlaps only the word's lower edge
 * (it always stays readable). At the foot, small: his name in wide caps and his club's exact name under it.
 * The NEYOD logo alone at the top. No score.
 */
export function Goalnatoutline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const W = CANVAS_W;

  /* ---- the word: as wide as the margins allow, capped in height ---- */
  const face = FACES.anton;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const size0 = Math.min((W - 120) / Math.max(0.5, wordEm(face, word)), (story ? 380 : 300) / face.cap) * ts;
  const cap0 = size0 * face.cap;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const logoBottom = logoTop + (story ? 88 : 52);
  const capTopMin = logoBottom + (story ? 70 : 60);

  /* ---- the photo: his hair just under the word's lower third ---- */
  // The top of his head relative to the face: the cutout's real top (curly hair, a raised fist), but never
  // read further than 1.7 face-heights up nor closer than the usual 0.75.
  const headUp = (p: { fy: number; fs: number; box: { top: number } }) => Math.min(1.7, Math.max(0.75, (p.fy - p.box.top) / p.fs));
  const fs = story ? 240 : 160;
  const fx0 = params.side === "left" ? 440 : params.side === "right" ? 640 : 540;
  const first = natPlace(data, W, H, { fx: fx0, fy: Math.round(capTopMin + cap0 * 0.72 + fs * 0.75), fs });
  const up = headUp(first);
  const place = natPlace(data, W, H, { fx: fx0, fy: Math.round(capTopMin + cap0 * 0.72 + fs * up), fs });
  const hairTop = place.fy - place.fs * up;
  // The photo can't always slide that low (it must cover the canvas): then the word gets smaller, so his
  // head still overlaps only its lower ~third (never its middle).
  const capH = Math.min(cap0, Math.max(cap0 * 0.5, (hairTop - capTopMin) / 0.7));
  const size = capH / face.cap;
  const baseline = Math.max(hairTop + capH * 0.3, capTopMin + capH) + (params.textY ?? 0);
  const stroke = (story ? 4 : 3.2) * (size / 350);

  /* ---- the foot, bottom-up ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 56) - (params.textY ?? 0);
  const clubSize = Math.min(15 * k * ts, (W - 160) / Math.max(1, capsEm(club, 0.3)));
  const clubTop = bottom - clubSize;
  const nameSize = Math.min(26 * k * ts, (W - 140) / Math.max(1, capsEm(name, 0.36)));
  const nameTop = clubTop - 18 * k - nameSize;
  const shadeTop = nameTop - (story ? 300 : 230);

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />

      {/* Soft local shade where the type sits — top for the logo and the word, foot for the name. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: baseline + 40, background: "linear-gradient(to bottom, rgba(0,0,0,.30), rgba(0,0,0,.12) 70%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.4) 45%, rgba(6,10,6,.66))" }} />

      {/* The outline word, behind him. */}
      <svg width={W} height={size * 1.2} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id="gno-soft" x="-10%" y="-40%" width="120%" height="180%">
            {/* A tight shadow hugging the stroke and a wide soft one: the thin letters stand out on light skies. */}
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.42" />
            <feDropShadow dx="0" dy="6" stdDeviation="16" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>
        <text
          x={W / 2}
          y={size}
          textAnchor="middle"
          filter="url(#gno-soft)"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "none", stroke: "#ffffff", strokeWidth: stroke, strokeLinejoin: "round" }}
        >
          {word}
        </text>
      </svg>

      {/* He steps in front of it. */}
      <NatFigure data={data} place={place} W={W} H={H} />

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.36em", paddingLeft: "0.36em", whiteSpace: "nowrap", textShadow: "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.55)" }}>
          {name}
        </div>
      )}
      {club && (
        <div style={{ position: "absolute", left: 0, right: 0, top: clubTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: clubSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", whiteSpace: "nowrap", opacity: 0.86, textShadow: "0 1px 6px rgba(0,0,0,.55)" }}>
          {club}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
