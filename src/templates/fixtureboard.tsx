/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** a → b by t (hex colours). */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.replace("#", "").padEnd(6, "0").slice(i - 1, i + 1), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Inter 700 capitals per 100px (measured); Inter 600 runs ~2.5% narrower. */
const I7: Record<string, number> = { A: 76, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 76, W: 105.7, X: 73.8, Y: 73.1, Z: 66.4, "-": 46.8, " ": 23.7, "'": 26, ".": 28, "/": 40 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (I7[c] ?? 66) / 100 + tracking, 0);

/** Home first, names exactly as stored. */
function fixtureOf(data: RenderData) {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const opp = (weHost ? c.awayTeam : c.homeTeam) || titleCase(f.opp);
  const us = (weHost ? c.homeTeam : c.awayTeam) || ours;
  const a = { name: us, crest: f.ourCrest, ours: true };
  const b = { name: opp, crest: f.oppCrest, ours: false };
  return (weHost ? [a, b] : [b, a]).filter((t) => t.name);
}

/**
 * Fixtureboard: a typographic fixture. On a quiet graphite ground the two full club names stacked large in
 * Inter, home first, each with its small crest beside it and a thin "v" in club colour between them; the
 * player below in natural colour; at the foot only date, kick-off and ground in small type.
 */
export function Fixtureboard({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) < 0.06) club = vivid(params.accent);
  if (luminance(club) < 0.06) club = "#d8d8d8";
  const ground = mix("#14161a", club, 0.07);
  const low = shade(ground, -0.45);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const showScore = postType === "result" && !!score;
  const teams = fixtureOf(data);

  /* ---- the names: one common size, as large as the longest allows ---- */
  const M = story ? 72 : 64;
  const tracking = -0.02;
  const crestK = 0.74; // crest height relative to the font size
  const gapK = 0.26;
  const room = CANVAS_W - 2 * M;
  const widest = Math.max(1, ...teams.map((t) => capsEm(t.name, tracking) + (t.crest ? crestK + gapK : 0)));
  const size = Math.min((story ? 168 : 138) * ts, (room * 0.985) / widest);
  const crest = Math.min(story ? 104 : 84, size * crestK);
  const top = (story ? STORY_TOP : 64) + (params.textY ?? 0);
  const labelSize = 13 * S;
  const comp = titleCase(f.comp || f.round || "");
  const kicker = titleCase((content.kicker || "MATCHDAY").toUpperCase());
  const namesTop = top + labelSize + (story ? 44 : 34);
  const vSize = Math.max(26, size * 0.42) * (showScore ? 1.2 : 1);
  const rowH = size * 0.98;
  const vGap = vSize * 1.25;
  const namesBottom = namesTop + rowH * teams.length + (teams.length > 1 ? vGap : 0);

  /* ---- the player below, his head clear of the names ---- */
  const cx = 540 + (params.side === "left" ? -80 : params.side === "right" ? 80 : 0);
  const faceTop = namesBottom + (story ? 170 : 115);
  const box = placeByFace(data, cx, faceTop, story ? { chest: 300, waist: 236, knees: 186, full: 150 } : { chest: 206, waist: 164, knees: 128, full: 102 });

  /* ---- the foot ---- */
  const facts = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const factSize = Math.max(14, Math.min(20 * S, 560 / Math.max(1, facts.length * 0.5)));
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);

  const name: CSSProperties = { fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: `${tracking}em`, lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap", color: WHITE };
  const small: CSSProperties = { fontFamily: SANS, color: WHITE, whiteSpace: "nowrap", lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${cx / 10.8}% ${story ? 66 : 70}%, ${shade(ground, 0.14)}, ${ground} 62%, ${low} 100%)` }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 330, background: `linear-gradient(to bottom, transparent, ${low}e0)` }} />

      {/* Label line. */}
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", justifyContent: "space-between", gap: 40 }}>
        <span style={{ ...small, fontWeight: 600, fontSize: labelSize, letterSpacing: "0.32em", textTransform: "uppercase" }}>{kicker}</span>
        {comp && <span style={{ ...small, fontWeight: 400, fontSize: labelSize, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, overflow: "hidden", textOverflow: "clip" }}>{comp}</span>}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: top + labelSize + (story ? 20 : 15), height: 1, background: "rgba(255,255,255,.22)" }} />

      {/* The fixture. */}
      {teams.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: M, top: namesTop + i * (rowH + vGap), height: rowH, display: "flex", alignItems: "center", gap: size * gapK }}>
          {t.crest && <img src={t.crest} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} />}
          <span style={{ ...name, position: "relative", top: size * 0.02 }}>{t.name}</span>
        </div>
      ))}
      {teams.length > 1 && (
        <div style={{ position: "absolute", left: M + (teams[0].crest ? crest + size * gapK : 0), top: namesTop + rowH + vGap / 2 - vSize * 0.55, display: "flex", alignItems: "center", gap: 18 * S }}>
          <span style={{ ...small, fontWeight: showScore ? 500 : 200, fontSize: vSize, color: club }}>{showScore ? score : "v"}</span>
          <span style={{ width: 80 * S, height: 1, background: club, opacity: 0.7 }} />
        </div>
      )}

      {/* Foot: date, kick-off, ground; the agency mark on the right. */}
      {facts && (
        <div style={{ position: "absolute", left: M, bottom: logoBottom + (story ? 34 : 22), ...small, fontWeight: 400, fontSize: factSize, letterSpacing: "0.04em", textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{facts}</div>
      )}
      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", right: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
