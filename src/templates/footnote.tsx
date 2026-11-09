/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f2efe9";
const INK = "#16161a";
const M = 72;

/** DM Serif Display, mixed case: rough advance per glyph (em). */
const serifEm = (t: string) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.24 : /[A-Z]/.test(c) ? (c === "M" || c === "W" ? 0.86 : 0.64) : /[ijlft]/.test(c) ? 0.3 : c === "m" || c === "w" ? 0.78 : 0.5), 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
  return s || n;
}

const SUP = ["¹", "²", "³"];

/**
 * Footnote: an editorial page. The title set medium in DM Serif with superscript reference marks, the
 * player large on the other side, and at the foot — under a short hairline — the footnotes the marks point
 * to: the fixture, the date and kick-off, the ground and competition. Off-white paper or a deep club tone.
 */
export function Footnote({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 7);
  const dark = r() < 0.45;
  const right = params.side !== "left"; // the player's side
  // Native Instagram story (1080×1920): crests at STORY_TOP, logo ending at STORY_BOTTOM, footnotes just above it, type ~1.35×.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.35 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const ground = dark ? shade(club, -0.78) : PAPER;
  const ink = dark ? "#ffffff" : INK;
  const soft = dark ? "rgba(255,255,255,.72)" : "rgba(22,22,26,.68)";
  // The marks in the club colour on paper; a light tint of it on the deep tone.
  const mark = dark ? shade(club, 0.55) : luminance(club) > 0.3 ? shade(club, -0.35) : club;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the footnotes ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = typed && typed !== typed.toUpperCase() ? typed : titleCase(typed ?? f.opp);
  const ours = data.club?.name ?? "";
  const pair = (content.home === false ? [them, ours] : [ours, them]).filter(Boolean);
  const fixture = pair.length === 2 ? pair.join(isResult ? ` ${score} ` : " v ") : pair[0] ?? "";
  const when = [niceDate(content.date), isResult ? "" : f.time].filter(Boolean).join(", ");
  const comp = titleCase(f.comp || f.round || "");
  const place = [titleCase(f.venue), comp].filter(Boolean).join(" · ");
  const notes = [fixture, when, place].filter(Boolean);

  /* ---- the title ---- */
  const title = isResult && postType === "result" ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase());
  const colW = story ? 640 : 470;
  let tSize = Math.min(118 * k, colW / Math.max(1, serifEm(title) + 0.6)) * ts;
  const titleTop = (story ? STORY_TOP + 40 * k + 50 : 196) + (params.textY ?? 0);

  /* ---- the player, large, on his side ---- */
  const faceX = right ? 740 : 340;
  const box = story ? placeByFace(data, faceX, 530, { chest: 420, waist: 330, knees: 244, full: 184 }) : placeByFace(data, faceX, 210, { chest: 300, waist: 236, knees: 176, full: 130 });
  // Keep his head clear of the title: slide him towards his edge, then, if that is not enough, set the title smaller.
  {
    const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
    const fw = face[2] * box.width;
    const fc = box.left + (face[0] + face[2] / 2) * box.width;
    const titleW = (serifEm(title) + 0.35) * tSize;
    const near = right ? fc - fw * 1.35 : fc + fw * 1.35; // the head's edge towards the text
    // Story: when his head sits wholly below the title there is nothing to avoid.
    const headTop = box.top + (face[1] - face[3] * 0.25) * box.height;
    const clear = story && headTop > titleTop + tSize * 1.05;
    let need = clear ? 0 : right ? M + titleW + 30 - near : near - (CANVAS_W - M - titleW - 30);
    if (need > 0) {
      const room = Math.max(0, right ? CANVAS_W - 24 - (fc + fw * 0.6) : fc - fw * 0.6 - 24);
      const move = Math.min(need, room);
      box.left += right ? move : -move;
      need -= move;
      if (need > 0) tSize = Math.max(64, tSize * Math.max(0.5, (titleW - need) / titleW));
    }
  }
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const col: CSSProperties = right ? { left: M, textAlign: "left" } : { right: M, textAlign: "right" };
  const noteSize = Math.min(23 * k, Math.max(17, 22 * k * ts));
  const NW = story ? 620 : 470;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {dark && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(65% 55% at ${right ? 66 : 34}% 42%, ${shade(club, -0.62)}, transparent 75%)` }} />}

      {/* The player. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}
      {/* A quiet veil low on the text side so the footnotes always read. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 980 : 420, background: `linear-gradient(to bottom, transparent, ${ground}${dark ? "cc" : "d9"} ${story ? 42 : 70}%${story ? `, ${ground}${dark ? "cc" : "d9"}` : ""})` }} />

      {/* Top: the crests, small. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: (story ? STORY_TOP : 104) + (params.textY ?? 0), ...col, display: "flex", gap: 16 * k, flexDirection: right ? "row" : "row-reverse" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 40 * k, height: 40 * k, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* The title with its reference marks. */}
      <div style={{ position: "absolute", top: titleTop, ...col, fontFamily: DMSERIF, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: ink }}>
        {title}
        <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: tSize * 0.24, letterSpacing: "0.04em", verticalAlign: "top", position: "relative", top: tSize * 0.1, marginLeft: tSize * 0.02, color: mark }}>
          {notes.map((_, i) => i + 1).join(",")}
        </span>
      </div>

      {/* The footnotes. */}
      <div style={{ position: "absolute", bottom: (story ? H - STORY_BOTTOM + 150 : 150) - (params.textY ?? 0) * 0, ...col, width: NW, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end", gap: 10 * k }}>
        <div style={{ width: 56 * k, height: 1, background: soft, marginBottom: 10 * k }} />
        {notes.map((n, i) => (
          <div key={i} style={{ fontFamily: SANS, fontWeight: 400, fontSize: noteSize, lineHeight: 1.35, color: soft, display: "flex", gap: 8, flexDirection: right ? "row" : "row-reverse", maxWidth: NW }}>
            <span style={{ color: mark, fontWeight: 600, fontSize: noteSize * 0.9 }}>{SUP[i]}</span>
            <span style={{ color: i === 0 ? ink : soft, fontWeight: i === 0 ? 500 : 400 }}>{n}</span>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        onLight={!dark}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={dark ? 0.18 : 0.12} />
    </div>
  );
}
