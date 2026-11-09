/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { NAT_SERIF } from "./natserif";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** DM Serif Display: cap height (em) and a rough advance of a capital (em). */
const CAP = 0.7;
const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

/**
 * Natural goal · initial: his real celebration photo full-bleed — real grass, stands and light, only the
 * light grade — and one typographic idea: the first letter of his surname, huge, in the elegant Didone
 * serif, white with the natural looks' double shadow, set BEHIND him (the photo, the letter, then his sharp
 * cutout exactly over his figure), his head over only the letter's lower third. At the foot, small and
 * centred: "GOAL", his full name, his club's exact name. No score. The NEYOD logo alone at the top.
 */
export function Goalnatinitial({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const k = story ? 1.36 : 1;

  /* ---- the photo, his face placed ---- */
  const place = natPlace(data, W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 820 : 600,
    fs: story ? 250 : 160,
  });

  /* ---- the logo at the top, the letter under it, his head over its lower third ---- */
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const minTop = logoTop + logoH + (story ? 64 : 56);
  const surname = (content.lastName || content.firstName || "G").trim();
  const letter = surname.charAt(0).toUpperCase();
  const hairTop = place.fy - place.fs * 0.78;
  const target = (story ? 820 : 600) * ts;
  // Above him: as tall as the band over his head allows (his hair covers at most its lower third).
  const capAbove = Math.min(target, (hairTop - minTop) / 0.66);
  // No headroom (a raised, close celebration): the letter stands beside his head instead, in the wider
  // free side, still behind him (a raised arm may cross it). A Didone capital is about as wide as it is tall.
  const M = story ? 76 : 66;
  const leftFree = place.fx - 0.62 * place.fs - 36 - M;
  const rightFree = W - M - (place.fx + 0.62 * place.fs + 36);
  const onLeft = leftFree >= rightFree;
  const free = Math.max(leftFree, rightFree);
  const capBeside = Math.min(target, free / 1.02);
  const beside = capAbove < target * 0.75 && capBeside > Math.max(capAbove, 0) * 1.15;
  const capH = beside ? capBeside : Math.max(story ? 360 : 260, capAbove);
  const size = capH / CAP;
  const capTop = (beside ? Math.max(minTop, place.fy - capH * 0.6) : Math.max(minTop, hairTop - capH * 0.66)) + (params.textY ?? 0);
  const baseline = capTop + capH;
  const letterX = beside ? (onLeft ? M + free / 2 : W - M - free / 2) : W / 2;

  /* ---- the foot, bottom-up: club, name, GOAL ---- */
  const footBottom = (story ? STORY_BOTTOM : H - 52) - (params.textY ?? 0);
  const maxW = W - 2 * M;
  const club = ourClub(data).toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kicker = (content.kicker || "GOAL").toUpperCase().trim();
  const clubPx = Math.min(20 * k * ts, maxW / Math.max(1, capsEm(club, 0.24)));
  const namePx = Math.min(38 * k * ts, maxW / Math.max(1, capsEm(name, 0.08)));
  const kickPx = Math.min(20 * k * ts, maxW / Math.max(1, capsEm(kicker, 0.5)));
  const clubTop = footBottom - clubPx;
  const nameTop = clubTop - 16 * k - namePx;
  const kickTop = nameTop - 20 * k - kickPx;
  const shadeTop = kickTop - (story ? 300 : 230);

  const line = (text: string, top: number, px: number, weight: number, tracking: number, opacity = 1) =>
    text ? (
      <div
        style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: SANS, fontWeight: weight, fontSize: px, lineHeight: 1, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, whiteSpace: "nowrap", opacity, textShadow: SMALL_SHADOW }}
      >
        {text}
      </div>
    ) : null;

  const fid = story ? "gni-soft-s" : "gni-soft";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />

      {/* A soft shade at the top for the logo and the letter. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: baseline + (story ? 120 : 80), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,.14) 60%, rgba(0,0,0,0))" }} />

      {/* The initial, behind him. */}
      <svg width={W} height={size * 1.3} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={fid} x="-20%" y="-30%" width="140%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <text x={letterX} y={size} textAnchor="middle" filter={`url(#${fid})`} style={{ fontFamily: NAT_SERIF, fontWeight: 400, fontSize: size, fill: "#ffffff" }}>
          {letter}
        </text>
      </svg>

      {/* He steps in front of it: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={W} H={H} />

      {/* Soft local shade under the foot lines. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.42) 45%, rgba(6,10,6,.7))" }} />

      {line(kicker, kickTop, kickPx, 700, 0.5, 0.92)}
      {line(name, nameTop, namePx, 700, 0.08)}
      {line(club, clubTop, clubPx, 600, 0.24, 0.9)}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
