/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GROUND = "#0d0e11";

/** Inter advance per 1px of font size for the usual words (measured in the browser), else a rough guess. */
const I700: Record<string, number> = { Goal: 2.225, Brace: 2.82, "Hat-trick": 4.362 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const guess = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[il!'.]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.88 : /[MW]/.test(c) ? 0.95 : /[A-Z]/.test(c) ? 0.72 : c === "-" ? 0.46 : 0.6), 0);

/** A round dot sitting on the baseline of a line-height-1 Inter line of `size`. */
function Dot({ d, gap, color, size }: { d: number; gap: number; color: string; size: number }) {
  return <span style={{ display: "inline-block", flexShrink: 0, width: d, height: d, borderRadius: "50%", background: color, marginLeft: gap, alignSelf: "flex-end", marginBottom: size * (1 - 0.864) }} />;
}

/**
 * Goal ellipsis: anticipation, then release. Low on the free side of a near-black ground, a small grey
 * "And" trailing off into three round dots… and under it, big and white, the answer with a full stop in
 * the club colour: "Goal." (or "Brace." / "Hat-trick." / what the user typed). Under that, small, his
 * name and the fixture (home first, names as stored, never a score), then the agency logo. The
 * celebrating player big on the other side, sinking into the dark at the foot. Flips with params.side.
 */
export function Goalellipsis({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  const club = clubTone(data);
  // The full stop: the club colour, lifted until it reads on the dark; white if it never does.
  let stop = club;
  for (let i = 0; i < 6 && luminance(stop) < 0.16; i++) stop = shade(stop, 0.16);
  if (luminance(stop) < 0.1) stop = "#ffffff";

  /* ---- the foot: logo, then (≥ 56px above it) the name and fixture ---- */
  const M = story ? 72 : 64;
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const infoW = story ? 700 : 620;
  const nameSize = Math.max(16, Math.min(26 * q, infoW / Math.max(1, name.length * 0.6))) * ts;
  const fixSize = Math.max(14, Math.min(21 * q, infoW / Math.max(1, fixture.length * 0.54))) * ts;
  const infoBottom = logoBottom + logoH + (story ? 66 : 56) - (params.textY ?? 0);
  const infoH = (name ? nameSize * 1.25 : 0) + (fixture ? fixSize * 1.3 + 4 * q : 0);

  /* ---- the pair: "And…" then the answer ---- */
  const answer = sentenceCase(content.kicker || "GOAL").replace(/[.!…]+$/, "") || "Goal";
  const stopD = 0.2; // the full stop's diameter, in ems
  const boldEm = (I700[answer] ?? guess(answer) * 1.04) - 0.04 * ([...answer].length - 1) + 0.06 + stopD;
  const colW = CANVAS_W - 2 * M - (story ? 40 : 60);
  const sG = Math.min((story ? 290 : 240) * ts, colW / boldEm);
  const sA = sG * 0.36;
  const goalTop = H - infoBottom - infoH - 40 * q - sG;
  const andTop = goalTop - sA * 1.12;

  /* ---- the player, big, on the other side ---- */
  const faceX = right ? (story ? 670 : 720) : story ? 410 : 360;
  const faceTop = story ? STORY_TOP + 110 : 160;
  let box = placeByFace(data, faceX, faceTop, story ? { chest: 310, waist: 256, knees: 204, full: 158 } : { chest: 250, waist: 210, knees: 166, full: 126 });
  // A fist flung out to the edge: ease the figure back in a little (never towards the words by much).
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (right ? Math.max(0, lean) : Math.min(80, Math.max(0, lean))) };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;
  // He sinks into the dark above the words, so the pair reads cleanly over his lower body.
  const darkFrom = Math.max(fTop + box.faceH * 2, andTop - 260 * q);
  const darkAt = Math.max(200, andTop + sA * 1.3 - darkFrom); // ~90% dark by the top of the answer

  const side: CSSProperties = right ? { left: M, alignItems: "flex-start", textAlign: "left" } : { right: M, alignItems: "flex-end", textAlign: "right" };
  const small: CSSProperties = { fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "-0.005em" };
  const grey = "rgba(255,255,255,.42)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: "#ffffff" }}>
      {/* The ground: near black, a breath of the club colour behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 42% at ${(faceX / CANVAS_W) * 100}% ${((fTop + box.faceH * 2.2) / H) * 100}%, ${shade(club, -0.5)}, transparent 75%)`, opacity: 0.85 }} />

      {/* The player. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: darkFrom, bottom: 0, background: `linear-gradient(to bottom, rgba(13,14,17,0), rgba(13,14,17,.9) ${darkAt}px, ${GROUND} ${darkAt + 240 * q}px)` }} />

      {/* Anticipation: "And" trailing off into three dots. */}
      <div style={{ position: "absolute", top: andTop, height: sA, ...side, display: "flex", alignItems: "flex-start" }}>
        <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: sA, lineHeight: 1, letterSpacing: "-0.01em", color: grey, whiteSpace: "nowrap" }}>And</span>
        {[0, 1, 2].map((i) => (
          <Dot key={i} d={sA * 0.13} gap={sA * (i === 0 ? 0.1 : 0.16)} color={grey} size={sA} />
        ))}
      </div>
      {/* Release: the answer, with a club-colour full stop. */}
      <div style={{ position: "absolute", top: goalTop, height: sG, ...side, display: "flex", alignItems: "flex-start" }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: sG, lineHeight: 1, letterSpacing: "-0.04em", color: "#ffffff", whiteSpace: "nowrap", marginLeft: right ? -sG * 0.05 : 0 }}>{answer}</span>
        <Dot d={sG * stopD} gap={sG * 0.05} color={stop} size={sG} />
      </div>

      {/* Name and fixture, small. */}
      <div style={{ position: "absolute", bottom: infoBottom, ...side, display: "flex", flexDirection: "column", gap: 4 * q }}>
        {name && <div style={{ ...small, fontWeight: 500, fontSize: nameSize, lineHeight: 1.25 }}>{name}</div>}
        {fixture && <div style={{ ...small, fontWeight: 400, fontSize: fixSize, lineHeight: 1.3, color: "rgba(255,255,255,.6)" }}>{fixture}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
