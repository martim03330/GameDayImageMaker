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
/** Inter mixed case, a safe average per character in ems. */
const interEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z0-9]/.test(c) ? 0.68 : /[il.:'·]/.test(c) ? 0.28 : 0.55), 0);
const capsEm = (t: string, ls: number) => interEm(t.toUpperCase()) + [...t].length * ls;

/** Home first, names exactly as stored. */
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

/**
 * Frostband: the player big on a clean club-tone ground; a horizontal band of frosted glass (backdrop blur,
 * a light tint, hairline edges) crosses the canvas at his waist — never his face — and holds everything:
 * the title in serif, then the fixture (home first, full names; the score on result posts) and the
 * date, kick-off and ground in one quiet line.
 */
export function Frostband({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.84) : luminance(club) < 0.03 ? "#141518" : shade(club, -0.48);
  const low = shade(ground, -0.45);
  const glow = luminance(club) < 0.03 ? "#3a3d44" : shade(club, -0.1);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const showScore = postType === "result" && !!score;
  const { home, away } = fixtureOf(data);
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const title = titleCase(kicker);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const facts = [niceDate(content.date), f.time, titleCase(f.venue) || titleCase(f.comp || f.round || "")].filter(Boolean).join(" · ");

  /* ---- the band ---- */
  const M = story ? 72 : 64;
  const inner = CANVAS_W - 2 * M;
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 52;
  const bandH = (story ? 330 : 188) * Math.min(1.15, Math.max(0.9, ts));
  const bandTop = (story ? H - logoBottom - logoH - 64 - bandH : 846) + (params.textY ?? 0);
  const bandMid = bandTop + bandH / 2;

  /* ---- type: post = title left | hairline | two lines right; story = three centred rows ---- */
  const gap = story ? 0 : 40;
  const tWant = (story ? 112 : 70) * ts;
  const tSize = story ? Math.min(tWant, (inner - 40) / Math.max(1, dmEm(title))) : Math.min(tWant, (inner * 0.4) / Math.max(1, dmEm(title)));
  const titleW = story ? inner : dmEm(title) * tSize;
  const colW = story ? inner - 40 : inner - titleW - 2 * gap - 1;

  const fixture = home && away ? `${home}  ${showScore ? score : "v"}  ${away}` : home || away || name;
  const fxSize = Math.max(story ? 22 : 16, Math.min((story ? 36 : 26) * ts, colW / Math.max(1, interEm(fixture) + (showScore ? 0.4 : 0))));
  const capsLs = 0.24;
  const facSize = facts ? Math.min((story ? 15.5 : 12) * ts, colW / Math.max(1, capsEm(facts, capsLs))) : 0;

  /* ---- the player: waist on the band, face well above it ---- */
  const cx = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const wantFace = story ? (bandMid - 560) / 3.3 : (bandMid - 260) / 3.3;
  const flat = (v: number) => ({ chest: v, waist: v, knees: v, full: v });
  const probe = placeByFace(data, cx, bandMid - 3.3 * wantFace, flat(wantFace));
  const fh = probe.faceH;
  // A face that came out smaller (low-res photo) stays at the waist line; the face itself never meets the band.
  // (but not so low that the top turns into an empty field: then the band crosses his hips or thighs instead).
  const wantTop = bandMid - 3.3 * wantFace;
  const faceTop = Math.min(Math.max(bandMid - 3.3 * fh, fh * 0.9 + (story ? STORY_TOP : 60)), wantTop + (story ? 150 : 100), bandTop - fh * 1.6);
  const box = placeByFace(data, cx, faceTop, flat(fh / (params.playerScale ?? 1)));

  const soft: CSSProperties = { color: WHITE, whiteSpace: "pre", textShadow: "0 1px 14px rgba(0,0,0,.22)" };
  const scoreSpan = (s: string) => {
    if (!showScore || !home || !away) return s;
    const [a, b] = [`${home}  `, `  ${away}`];
    return (
      <>
        {a}
        <span style={{ fontWeight: 600 }}>{score}</span>
        {b}
      </>
    );
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* A clean ground: club tone, light behind him, deeper at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(68% 46% at ${cx / 10.8}% ${((faceTop + bandTop) / 2 / H) * 100}%, ${shade(glow, -0.2)}, ${ground} 62%, ${low} 100%)` }} />

      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, width: box.width * 0.7, top: H - 90, height: 120, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(40px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bandTop, background: `linear-gradient(to bottom, transparent, ${low}99)` }} />

      {/* The frosted band. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandTop,
          height: bandH,
          backdropFilter: "blur(24px) saturate(1.2)",
          WebkitBackdropFilter: "blur(24px) saturate(1.2)",
          background: "linear-gradient(to bottom, rgba(255,255,255,.17), rgba(255,255,255,.08))",
          borderTop: "1px solid rgba(255,255,255,.5)",
          borderBottom: "1px solid rgba(255,255,255,.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), 0 20px 50px rgba(0,0,0,.12)",
        }}
      />

      {story ? (
        <div style={{ position: "absolute", left: M, width: inner, top: bandTop, height: bandH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ ...soft, fontFamily: DMSERIF, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.005em" }}>{title}</div>
          <div style={{ ...soft, marginTop: 24, fontFamily: SANS, fontWeight: 400, fontSize: fxSize, lineHeight: 1.25 }}>{scoreSpan(fixture)}</div>
          {facts && <div style={{ ...soft, marginTop: 16, fontFamily: SANS, fontWeight: 500, fontSize: facSize, letterSpacing: `${capsLs}em`, marginRight: `-${capsLs}em`, textTransform: "uppercase", opacity: 0.72 }}>{facts}</div>}
        </div>
      ) : (
        <div style={{ position: "absolute", left: M, width: inner, top: bandTop, height: bandH, display: "flex", alignItems: "center" }}>
          <div style={{ ...soft, fontFamily: DMSERIF, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.005em", flexShrink: 0, paddingBottom: tSize * 0.06 }}>{title}</div>
          <div style={{ width: 1, alignSelf: "stretch", margin: `${bandH * 0.28}px ${gap}px`, background: "rgba(255,255,255,.45)", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
            <div style={{ ...soft, fontFamily: SANS, fontWeight: 400, fontSize: fxSize, lineHeight: 1.25 }}>{scoreSpan(fixture)}</div>
            {facts && <div style={{ ...soft, marginTop: 12, fontFamily: SANS, fontWeight: 500, fontSize: facSize, letterSpacing: `${capsLs}em`, textTransform: "uppercase", opacity: 0.72 }}>{facts}</div>}
          </div>
        </div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: logoBottom - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.14} />
    </div>
  );
}
