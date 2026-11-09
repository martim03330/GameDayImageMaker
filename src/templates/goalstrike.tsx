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
const I300: Record<string, number> = { Almost: 3.187, Goal: 2.129, Brace: 2.697 };
const I700: Record<string, number> = { Goal: 2.225, Brace: 2.82, "Hat-trick": 4.362 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const guess = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[il!'.]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.88 : /[MW]/.test(c) ? 0.95 : /[A-Z]/.test(c) ? 0.72 : c === "-" ? 0.46 : 0.6), 0);

/** The pair: the word struck through, then the right one. A goal corrects "Almost", a brace corrects "Goal", a hat-trick "Brace". */
function pairOf(kicker: string): [string, string] {
  const k = kicker.toUpperCase().replace(/[^A-Z]/g, "");
  if (/HATTRICK|HATRICK/.test(k)) return ["Brace", "Hat-trick"];
  if (/BRACE/.test(k)) return ["Goal", "Brace"];
  if (!k || k === "GOAL" || k === "GOLO" || k === "GOLAZO") return ["Almost", "Goal"];
  return ["Almost", sentenceCase(kicker).replace(/[.]+$/, "")];
}

/**
 * Goal strike: one typographic correction. On a dark ground, low on the free side, a word in light grey
 * struck through with a clean club-colour line — "Almost" — and under it the right word, big and bold:
 * "Goal" (a brace strikes "Goal" for "Brace", a hat-trick "Brace" for "Hat-trick"). Under that, small,
 * his name and the fixture (home first, names as stored, never a score), then the agency logo. The
 * celebrating player big on the other side, sinking into the dark at the foot.
 */
export function Goalstrike({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  const club = clubTone(data);
  // The line: the club colour, lifted until it reads on the dark; white if it never does.
  let line = club;
  for (let i = 0; i < 6 && luminance(line) < 0.16; i++) line = shade(line, 0.16);
  if (luminance(line) < 0.1) line = "#ffffff";

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

  /* ---- the pair ---- */
  const [wrong, rightWord] = pairOf(content.kicker || "GOAL");
  const boldEm = (I700[rightWord] ?? guess(rightWord) * 1.04) - 0.04 * ([...rightWord].length - 1);
  const lightEm = I300[wrong] ?? guess(wrong);
  const colW = CANVAS_W - 2 * M - (story ? 40 : 60);
  const sG = Math.min((story ? 300 : 250) * ts, colW / boldEm);
  const sA = Math.min(sG * 0.44, (colW * 0.8) / lightEm);
  const goalTop = H - infoBottom - infoH - 34 * q - sG * 1.0;
  const almostTop = goalTop - sA * 0.92;

  /* ---- the player, big, on the other side ---- */
  const faceX = right ? (story ? 670 : 720) : story ? 410 : 360;
  const faceTop = story ? STORY_TOP + 110 : 160;
  let box = placeByFace(data, faceX, faceTop, story ? { chest: 310, waist: 256, knees: 204, full: 158 } : { chest: 250, waist: 210, knees: 166, full: 126 });
  // A fist flung out to the edge: ease the figure back in a little (never towards the words by much).
  const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (right ? Math.max(0, lean) : Math.min(80, Math.max(0, lean))) };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;
  // He sinks into the dark under the struck word, so the pair reads cleanly over his lower body.
  const darkFrom = Math.max(fTop + box.faceH * 2, almostTop - 280 * q);

  const side: CSSProperties = right ? { left: M, alignItems: "flex-start", textAlign: "left" } : { right: M, alignItems: "flex-end", textAlign: "right" };
  const small: CSSProperties = { fontFamily: SANS, color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "-0.005em" };

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
      <div style={{ position: "absolute", left: 0, right: 0, top: darkFrom, bottom: 0, background: `linear-gradient(to bottom, rgba(13,14,17,0), rgba(13,14,17,.8) ${story ? 330 : 320}px, ${GROUND} ${story ? 620 : 560}px)` }} />

      {/* The correction. */}
      <div style={{ position: "absolute", top: almostTop, ...side, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: SANS, fontWeight: 300, fontSize: sA, lineHeight: 1, letterSpacing: "-0.01em", color: "rgba(255,255,255,.42)", whiteSpace: "nowrap" }}>
          {wrong}
          <span style={{ position: "absolute", left: -sA * 0.05, right: -sA * 0.05, top: sA * 0.58, height: Math.max(3, sA * 0.06), background: line }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: goalTop, ...side, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: sG, lineHeight: 1, letterSpacing: "-0.04em", color: "#ffffff", whiteSpace: "nowrap", marginLeft: right ? -sG * 0.05 : 0, marginRight: right ? 0 : -sG * 0.01 }}>{rightWord}</div>
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
