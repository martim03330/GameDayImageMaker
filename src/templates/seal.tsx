/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** DM Serif Display (roman): advance widths per 100px. */
const DM_W: Record<string, number> = { a: 50, b: 53, c: 44, d: 53, e: 46, f: 31, g: 49, h: 54, i: 27, j: 26, k: 50, l: 27, m: 80, n: 54, o: 50, p: 53, q: 52, r: 39, s: 40, t: 32, u: 54, v: 48, w: 72, x: 49, y: 48, z: 43, " ": 22, "-": 34, "'": 22 };
const dmEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (DM_W[c] ?? (c === c.toUpperCase() ? 66 : 52)) / 100, 0);
/** Inter 300/400 mixed case, a safe average per character in ems. */
const interEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? 0.68 : /[il.:'·]/.test(c) ? 0.28 : 0.55), 0);

/** Home first, names exactly as stored (only the case may change elsewhere, never here). */
function fixtureOf(data: RenderData): { home: string; away: string } {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const opp = (weHost ? c.awayTeam : c.homeTeam) || titleCase(f.opp);
  const us = (weHost ? c.homeTeam : c.awayTeam) || ours;
  return weHost ? { home: us, away: opp } : { home: opp, away: us };
}

/** The round seal: a thin double ring, the words running around it, the crest small in the middle. */
function SealMark({ d, words, lead, crest, id }: { d: number; words: string; lead: number; crest: string | null; id: string }) {
  const c = d / 2;
  const fs = d * 0.068;
  const rText = c - d * 0.07 - fs * 0.74;
  // Start so the first word ("MATCHDAY", `lead` of the line) sits centred on top of the ring.
  const a0 = -Math.PI / 2 - Math.PI * lead;
  const pt = (a: number) => `${c + rText * Math.cos(a)},${c + rText * Math.sin(a)}`;
  const path = `M ${pt(a0)} A ${rText},${rText} 0 1,1 ${pt(a0 + Math.PI)} A ${rText},${rText} 0 1,1 ${pt(a0 + 2 * Math.PI)}`;
  const circ = 2 * Math.PI * rText;
  const inner = rText - fs * 0.62;
  const crestSize = inner * 1.12;
  return (
    <div style={{ position: "relative", width: d, height: d }}>
      <svg data-bleed width={d} height={d} viewBox={`0 0 ${d} ${d}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <path id={id} d={path} />
        </defs>
        <circle cx={c} cy={c} r={c - 0.75} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth={1.3} />
        <circle cx={c} cy={c} r={c - d * 0.035} fill="none" stroke="rgba(255,255,255,.6)" strokeWidth={0.9} />
        <circle cx={c} cy={c} r={inner} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={0.8} />
        <text fill="rgba(255,255,255,.92)" style={{ fontFamily: SANS, fontWeight: 500, fontSize: fs, letterSpacing: "0.1em" }}>
          <textPath href={`#${id}`} textLength={circ - fs * 0.4} lengthAdjust="spacing">
            {words}
          </textPath>
        </text>
      </svg>
      {crest && (
        <img
          src={crest}
          alt=""
          style={{ position: "absolute", left: c - crestSize / 2, top: c - crestSize / 2, width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.3))" }}
        />
      )}
    </div>
  );
}

/**
 * Seal: the player on a clean, deep club-tone ground; top left a medium serif title with the fixture
 * (home first, full names) and the ground under it in small type; top right one small round seal — a thin
 * double ring with "MATCHDAY · 17 OCTOBER · 15:00 ·" running around it and the club crest in its centre.
 */
export function Seal({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#121316" : shade(club, -0.5);
  const low = shade(ground, -0.4);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const showScore = postType === "result" && !!score;
  const { home, away } = fixtureOf(data);
  const fixture = home && away ? `${home}  ${showScore ? score : "v"}  ${away}` : home || away || [content.firstName, content.lastName].filter(Boolean).join(" ");
  const venue = titleCase(f.venue);
  const comp = titleCase(f.comp || f.round || "");

  /* ---- the seal ---- */
  const M = story ? 72 : 64;
  const top = (story ? STORY_TOP : M) + (params.textY ?? 0);
  const D = story ? 272 : 196;
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const date = niceDate(content.date).toUpperCase();
  const words = [kicker, date, f.time].filter(Boolean).join(" · ") + " · ";
  const crest = f.ourCrest ?? data.club?.crestUrl ?? null;

  /* ---- the title block, top left ---- */
  const title = titleCase(kicker);
  const colW = CANVAS_W - 2 * M - D - (story ? 48 : 40);
  const tSize = Math.min((story ? 128 : 92) * ts, colW / Math.max(1, dmEm(title)));
  const fxSize = Math.max(story ? 22 : 17, Math.min((story ? 34 : 26) * ts, colW / Math.max(1, interEm(fixture))));
  const capsSize = 12.5 * S;
  const sub = [venue, comp && !venue ? comp : ""].filter(Boolean)[0] ?? "";
  const subSize = Math.min(capsSize, colW / Math.max(1, interEm(sub.toUpperCase()) * 1.1 + sub.length * 0.3));
  const titleH = tSize * 1.02;
  const blockBottom = top + titleH + 22 * S + fxSize * 1.25 + (sub ? 14 * S + subSize * 1.3 : 0);

  /* ---- the player, centred a touch towards his side, his head clear of the block ---- */
  const cx = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const faceTop = Math.max(blockBottom + (story ? 130 : 70), Math.max(top + D + (story ? 80 : 50), story ? 560 : 380));
  const box = placeByFace(data, cx, faceTop, story ? { chest: 330, waist: 268, knees: 210, full: 170 } : { chest: 230, waist: 184, knees: 144, full: 114 });

  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", textShadow: "0 1px 12px rgba(0,0,0,.25)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The ground: flat, a breath of light behind him and a quiet fall-off to the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 52% at ${cx / 10.8}% ${story ? 52 : 50}%, ${shade(ground, 0.16)}, ${ground} 58%, ${low} 100%)` }} />

      {/* Contact shadow, then the player in natural colour. */}
      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, width: box.width * 0.7, top: H - 90, height: 120, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(40px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 320, background: `linear-gradient(to bottom, transparent, ${low}aa)` }} />

      {/* Title, fixture, ground. */}
      <div style={{ position: "absolute", left: M, top, width: colW, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ ...soft, fontFamily: DMSERIF, fontSize: tSize, lineHeight: 1.02, letterSpacing: "-0.005em", height: titleH }}>{title}</div>
        <div style={{ width: 56 * S, height: 1, background: "rgba(255,255,255,.6)", marginTop: 14 * S, marginBottom: 8 * S }} />
        <div style={{ ...soft, fontFamily: SANS, fontWeight: 400, fontSize: fxSize, lineHeight: 1.25, whiteSpace: "pre" }}>{fixture}</div>
        {sub && (
          <div style={{ ...soft, marginTop: 14 * S, fontFamily: SANS, fontWeight: 500, fontSize: subSize, lineHeight: 1.3, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.68 }}>{sub}</div>
        )}
      </div>

      {/* The seal, top right. */}
      <div style={{ position: "absolute", right: M, top: top + (story ? 0 : -4) }}>
        <SealMark d={D} words={words} lead={kicker.length / words.length} crest={crest} id={story ? "seal-ring-s" : "seal-ring"} />
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
