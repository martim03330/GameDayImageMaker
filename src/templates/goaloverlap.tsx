/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { heavyW } from "./overlap";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const TRACK = -0.035;
const CAP = 0.727;
/** The second half's baseline under the first, in em: ~30% of the letters run into each other. */
const LEAD = 0.42;

/** The kicker cut in two halves: "Goal" → Go / al, "Hat-trick" → Hat- / trick, "Brace" → Bra / ce. */
function cut(kicker: string): [string, string] {
  const s = sentenceCase(kicker || "Goal").replace(/[.!]+$/, "");
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const i = Math.ceil(words.length / 2);
    return [words.slice(0, i).join(" "), words.slice(i).join(" ")];
  }
  const h = s.indexOf("-");
  if (h > 0 && h < s.length - 1) return [s.slice(0, h + 1), s.slice(h + 1)];
  const k = Math.ceil(s.length / 2);
  return [s.slice(0, k), s.slice(k)];
}

/**
 * Goal overlap: the goal post of `overlap`. The kicker cut in two halves ("Go" / "al") set huge with
 * negative leading on a deep club-tone ground, the top half white and the bottom half a club tint, both
 * screened, so where they cross the light adds up — an overprint in light instead of ink. The celebrating
 * player in natural colour in front, on the other side; his name and the fixture small at the foot.
 */
export function Goaloverlap({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const q = story ? 1.34 : 1;
  const right = params.side !== "left"; // the player's side

  const club = clubTone(data);
  const deep = shade(club, -0.74);
  const lift = shade(club, -0.55);
  // The tint: the club colour lifted to read as light on its own deep tone.
  const tint = luminance(club) < 0.1 ? shade(club, 0.42) : shade(club, 0.2);

  /* ---- the overprint ---- */
  const [h1, h2] = cut(content.kicker || "Goal");
  const M = 64;
  const colW = story ? 700 : 560;
  const size = Math.min(story ? 440 : 360, colW / Math.max(1, heavyW(h1), heavyW(h2))) * ts;
  const top = (story ? STORY_TOP : 76) + (params.textY ?? 0);
  const base1 = top + CAP * size;
  const base2 = base1 + LEAD * size;
  const anchor = right ? "start" : "end";
  const tx = right ? M - size * 0.04 : CANVAS_W - M + size * 0.02;

  /* ---- the player, on the other side, big ---- */
  const faceX = story ? (right ? 780 : 300) : right ? 720 : 360;
  const faceTop = story ? STORY_TOP + 400 : 250;
  const sizes = story ? { chest: 300, waist: 245, knees: 200, full: 160 } : { chest: 250, waist: 205, knees: 160, full: 124 };
  let box = placeByFace(data, faceX, faceTop, sizes);
  // A wide celebration (arms out) is drawn a little smaller, so it leaves the foot's column alone.
  const maxW = story ? 800 : 780;
  if (box.width > maxW) {
    const k = maxW / box.width;
    box = placeByFace(data, faceX, faceTop, Object.fromEntries(Object.entries(sizes).map(([n, v]) => [n, v * k])));
  }
  // A fist thrown out to the edge: pull the figure in a little (it stays in front of the type).
  const over = right ? box.left + box.width - CANVAS_W * 1.04 : -box.left - CANVAS_W * 0.04;
  if (over > 0) box = { ...box, left: box.left + (right ? -1 : 1) * Math.min(over, 130) };

  /* ---- the foot ---- */
  const logoAsked = story ? 22 : 18;
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixLines = teams.length === 2 ? (story ? [teams[0], `v  ${teams[1]}`] : [`${teams[0]}  v  ${teams[1]}`]) : teams[0] ? [`v ${teams[0]}`] : [];
  const infoW = story ? 440 : 470;
  const nameSize = Math.max(22 * q, Math.min(34 * q, infoW / Math.max(1, bodyW(name, 1) * 1.08))) * ts;
  const fixSize = Math.max(14 * q, Math.min(19 * q, infoW / Math.max(1, ...fixLines.map((l) => bodyW(l, 1))))) * ts;
  const comp = (f.comp || f.round || "").trim();
  const compSize = Math.max(10, Math.min(12.5 * q, infoW / Math.max(1, comp.length * 0.98))) * ts;
  const gap = story ? 66 : 62;
  const infoH = (comp ? compSize * 1.5 + 14 * q : 0) + (name ? nameSize * 1.2 + 10 * q : 0) + fixLines.length * fixSize * 1.3;
  const infoTop = logoTop - gap - infoH;

  const side: CSSProperties = right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const small: CSSProperties = { fontFamily: SANS, color: WHITE, whiteSpace: "nowrap", lineHeight: 1.25 };
  const half = (t: string, y: number, fill: string, op: number) => (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }} aria-hidden>
      <text x={tx} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize={size} letterSpacing={size * TRACK} fill={fill} fillOpacity={op}>
        {t}
      </text>
    </svg>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at ${faceX / 10.8}% ${((faceTop + 260) / H) * 100}%, ${lift}, ${deep} 78%)` }} />

      {/* The overprint in light: two halves, screened. */}
      {half(h1, base1, WHITE, 0.9)}
      {half(h2, base2, tint, 0.88)}

      {/* The player, natural colour, in front. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 520, background: `linear-gradient(to bottom, transparent, ${deep}b3 55%, ${deep}e6)` }} />

      {/* Foot, on the free side: competition, his name, the fixture (home first, no score). */}
      <div style={{ position: "absolute", top: infoTop, ...side, display: "flex", flexDirection: "column" }}>
        {comp && <div style={{ ...small, fontWeight: 500, fontSize: compSize, lineHeight: 1.5, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 14 * q, color: "rgba(255,255,255,.6)" }}>{comp}</div>}
        {name && <div style={{ ...small, fontWeight: 600, fontSize: nameSize, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 10 * q }}>{name}</div>}
        {fixLines.map((l, i) => (
          <div key={i} style={{ ...small, fontWeight: 400, fontSize: fixSize, lineHeight: 1.3, color: "rgba(255,255,255,.72)" }}>
            {l}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={logoAsked}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
