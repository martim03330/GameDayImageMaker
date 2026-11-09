/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 60;
const WHITE = "#ffffff";
const INTER = "var(--font-inter), system-ui, sans-serif";
/** Inter Thin (100): advance widths per 1px of font size (proportional figures, capitals roughly). */
const THIN_W: Record<string, number> = { "0": 0.66, "1": 0.38, "2": 0.6, "3": 0.62, "4": 0.64, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.63, "9": 0.62, " ": 0.26, "-": 0.42, "'": 0.2, I: 0.26, J: 0.5, M: 0.86, W: 0.9 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const thinEm = (t: string, tracking = 0) => plain(t.toUpperCase()).reduce((a, c) => a + (THIN_W[c] ?? 0.66) + tracking, -tracking);
/** Inter caps (400–500), roughly, tracking included. */
const capsEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.9 : 0.69) + tracking, 0);
/** Cap / figure height of Inter, relative to the font size. */
const FIG = 0.727;

/**
 * Goalscore: the score is the hero. The two numbers set enormous in an ultra-thin sans behind the celebrating
 * player, one either side of his head — our number bright, theirs dim — each with its crest small beneath it.
 * The kicker small above, the scorer's name in wide-tracked capitals at the foot. Without a score, the kicker
 * itself is set enormous across the top, behind him.
 */
export function Goalscore({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the title under the profile bar, the foot on the reply bar's safe
  // line, a size up, the player filling the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const S = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.88) : luminance(club) < 0.03 ? "#101114" : shade(club, -0.55);
  const low = shade(ground, -0.4);

  const f = matchFacts(data);
  const hg = String(content.homeGoals ?? "").trim();
  const ag = String(content.awayGoals ?? "").trim();
  const hasScore = /^\d{1,2}$/.test(hg) && /^\d{1,2}$/.test(ag);
  const weHost = content.home ?? ((content.homeTeam ?? "").toUpperCase() !== f.opp);
  const crestL = weHost ? f.ourCrest : f.oppCrest;
  const crestR = weHost ? f.oppCrest : f.ourCrest;
  const crestFilter = params.crestColor ? "none" : "url(#goalscore-mono)";

  /* ---- the foot ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const compBottom = logoBottom + (story ? 140 : 84);
  const nameBottom = compBottom + 34 * S;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const NAME_TRACK = 0.42;
  const nameSize = Math.max(16, Math.min(30 * S * ts, 900 / Math.max(1, capsEm(name, NAME_TRACK))));
  const comp = titleCase(f.comp || f.round || "");
  const COMP_TRACK = 0.3;
  const compSize = Math.max(10, Math.min(12 * S * ts, 820 / Math.max(1, capsEm(comp, COMP_TRACK))));
  const fadeTo = CH - nameBottom - nameSize - 34 * S;

  /* ---- the player ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  // Without a score the kicker goes enormous across the top and he stands under it.
  const kTrack = -0.01;
  const kSize = hasScore ? 0 : Math.min(360, (CANVAS_W - 2 * M) / Math.max(1, thinEm(kicker, kTrack))) * ts;
  const kTop = (story ? STORY_TOP + 6 : 150) + (params.textY ?? 0);
  const kBase = kTop + kSize * FIG;
  const faceTop = hasScore ? (story ? STORY_TOP + 280 : 300) : Math.max(story ? STORY_TOP + 240 : 300, kBase - kSize * FIG * 0.12);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 330, waist: 256, knees: 204, full: 160 } : { chest: 230, waist: 180, knees: 144, full: 112 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fW = face[2] * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - 240 - box.top}px, transparent ${fadeTo - box.top}px)`;

  /* ---- the numbers, either side of his head ---- */
  const headHalf = fW * 0.74;
  const leftEnd = fCx - headHalf - 26;
  const rightStart = fCx + headHalf + 26;
  const nTrack = -0.03;
  const roomL = leftEnd - M + 10;
  const roomR = CANVAS_W - M + 10 - rightStart;
  const nSize = hasScore ? Math.max(200, Math.min(640 * ts, roomL / thinEm(hg, nTrack), roomR / thinEm(ag, nTrack))) : 0;
  const figH = nSize * FIG;
  // The figures run from his brow down past his shoulders.
  const nTop = Math.max(story ? STORY_TOP + 110 : 150, fTop + fH * 0.2 + (params.textY ?? 0));
  const nBase = Math.min(CH - nameBottom - 160, nTop + figH);
  const lW = thinEm(hg, nTrack) * nSize;
  const rW = thinEm(ag, nTrack) * nSize;
  const ourFill = "rgba(255,255,255,.96)";
  const theirFill = "rgba(255,255,255,.3)";
  const fillL = weHost ? ourFill : theirFill;
  const fillR = weHost ? theirFill : ourFill;
  const crestY = nBase + 34;

  const numbers = (front: boolean) => (
    <>
      <text x={leftEnd} y={nBase} textAnchor="end" fontFamily={INTER} fontWeight={100} fontSize={nSize} letterSpacing={nSize * nTrack} fill={front ? WHITE : fillL}>
        {hg}
      </text>
      <text x={rightStart} y={nBase} fontFamily={INTER} fontWeight={100} fontSize={nSize} letterSpacing={nSize * nTrack} fill={front ? WHITE : fillR}>
        {ag}
      </text>
    </>
  );

  const caps = (s: number, track: number, weight: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: s,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    lineHeight: 1,
    color: WHITE,
    textAlign: "center",
    ...extra,
  });
  const KICK_TRACK = 0.55;
  const kickSmall = Math.max(12, Math.min(17 * S * ts, 700 / Math.max(1, capsEm(kicker, KICK_TRACK))));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="goalscore-mono" ink={0.55} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 50% at ${(fCx / CANVAS_W) * 100}% ${((fTop + fH * 2) / CH) * 100}%, ${shade(ground, 0.16)}, ${ground} 62%, ${low} 100%)` }} />

      {/* The hero: the score (or the kicker), ultra thin, enormous, behind him. */}
      <svg data-bleed width={CANVAS_W} height={CH} style={{ position: "absolute", inset: 0 }} aria-hidden>
        {hasScore ? (
          numbers(false)
        ) : (
          <text x={540} y={kBase} textAnchor="middle" fontFamily={INTER} fontWeight={100} fontSize={kSize} letterSpacing={kSize * kTrack} fill="rgba(255,255,255,.94)">
            {kicker}
          </text>
        )}
      </svg>
      {hasScore && (
        <>
          {crestL && <img src={crestL} alt="" style={{ position: "absolute", left: leftEnd - lW / 2 - 20 * S, top: crestY, width: 40 * S, height: 40 * S, objectFit: "contain", filter: crestFilter }} />}
          {crestR && <img src={crestR} alt="" style={{ position: "absolute", left: rightStart + rW / 2 - 20 * S, top: crestY, width: 40 * S, height: 40 * S, objectFit: "contain", filter: crestFilter }} />}
        </>
      )}

      {/* The player, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The figures again, faint, in front: what a raised arm hides still reads — never over his head. */}
      {hasScore && (
        <svg data-bleed width={CANVAS_W} height={CH} style={{ position: "absolute", inset: 0, opacity: 0.14 }} aria-hidden>
          <defs>
            <mask id="goalscore-head" maskUnits="userSpaceOnUse" x={0} y={0} width={CANVAS_W} height={CH}>
              <rect width={CANVAS_W} height={CH} fill="#fff" />
              <ellipse cx={fCx} cy={fTop + fH * 0.45} rx={headHalf + 30} ry={fH * 0.95} fill="#000" />
            </mask>
          </defs>
          <g mask="url(#goalscore-head)">{numbers(true)}</g>
        </svg>
      )}

      {/* Top: the kicker, small (when the score is the hero). */}
      {hasScore && (
        <div style={{ position: "absolute", left: 0, right: 0, top: (story ? STORY_TOP : 70) + (params.textY ?? 0) * 0.3, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={caps(kickSmall, KICK_TRACK, 500)}>{kicker}</div>
          <div style={{ width: 40, height: 1, background: "rgba(255,255,255,.55)" }} />
        </div>
      )}

      {/* Foot: the scorer, the competition (and the crests when there is no score), the agency. */}
      {name && <div style={{ position: "absolute", left: M, right: M, bottom: nameBottom, ...caps(nameSize, NAME_TRACK, 300) }}>{name}</div>}
      {(comp || (!hasScore && (crestL || crestR))) && (
        <div style={{ position: "absolute", left: M, right: M, bottom: compBottom, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          {!hasScore && crestL && <img src={crestL} alt="" style={{ width: 26 * S, height: 26 * S, objectFit: "contain", filter: crestFilter }} />}
          {comp && <div style={caps(compSize, COMP_TRACK, 400, { color: "rgba(255,255,255,.62)" })}>{comp}</div>}
          {!hasScore && crestR && <img src={crestR} alt="" style={{ width: 26 * S, height: 26 * S, objectFit: "contain", filter: crestFilter }} />}
        </div>
      )}
      <AgencyLogo
        data={data}
        height={story ? 26 : 18}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
