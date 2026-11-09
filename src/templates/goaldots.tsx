/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const MARGIN = 64;
const PAPER = "#f2efe9";
const INKC = "#121418";

/** Inter 600 capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "!": 30 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter 800 is a touch wider than 600. */
const boldEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + ((CAPS_W[c] ?? 66) * 0.98) / 100 + tracking, 0);
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/** How many goals he scored: the "Goals" stat, else read from the title. */
function goalsOf(data: RenderData): number {
  const stat = data.content.stats.find((s) => /^goals?$/i.test(s.label.trim()));
  const n = stat ? parseInt(String(stat.value), 10) : NaN;
  if (Number.isFinite(n) && n > 0) return Math.min(n, 6);
  const k = data.content.kicker.toUpperCase();
  if (/HAT[\s-]?TRICK/.test(k)) return 3;
  if (/BRACE|DOUBLE/.test(k)) return 2;
  return 1;
}

/**
 * Goaldots: counts the goals. A calm ground (off-white or deep club tone by seed), the title in a heavy clean
 * sans at the top left and beside it a row of solid club-coloured circles, one per goal he scored. The
 * celebrating player large below; the score between the crests and the competition small at the foot.
 */
export function Goaldots({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): the title under the profile bar, the foot on the reply bar's safe
  // line, a size up, the player filling the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const S = story ? 1.3 : 1;
  // Seed parity picks the ground (the first draw of rng() barely moves for small seeds).
  const dark = Math.abs(Math.round(params.seed ?? 1)) % 2 === 0;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const ground = dark ? shade(club, -0.74) : PAPER;
  const ink = dark ? "#ffffff" : INKC;
  const soft = dark ? "rgba(255,255,255,.66)" : "rgba(18,20,24,.6)";
  // The dots: the club colour, lifted on the dark ground so they read.
  const dot = dark ? (luminance(club) < 0.16 ? shade(club, 0.32) : club) : club;

  const f = matchFacts(data);
  // Home side first: from content.home, else from the typed team names against our club.
  const lc = (t?: string) => (t ?? "").toLowerCase().trim();
  const oursName = data.club?.name ?? "";
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const score = scoreOf(data, "–");
  const goals = goalsOf(data);

  /* ---- the title and its dots ---- */
  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const TRACK = -0.025;
  const avail = CANVAS_W - 2 * MARGIN;
  const dotsEm = (n: number) => 0.727 * 0.62 * (n + (n - 1) * 0.42) + 0.2; // in title ems, with the gap before them
  let size = Math.min(150 * S * ts, avail / (boldEm(title, TRACK) + dotsEm(goals)));
  let below = false;
  if (size < 104 * S * ts) {
    // Too long for one line: the dots go under the title instead.
    below = true;
    size = Math.min(150 * S * ts, avail / boldEm(title, TRACK));
  }
  const capH = size * 0.727;
  const d = Math.max(26, capH * 0.62);
  const titleTop = (story ? STORY_TOP - size * 0.2 : 84) + (params.textY ?? 0);
  // Inter's cap top sits ~0.2em under the line box top at lineHeight 1.
  const capTop = titleTop + size * 0.2;
  const dotsTop = below ? capTop + capH + 28 * S : capTop + (capH - d) / 2;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const N_TRACK = 0.34;
  const nSize = Math.max(11, Math.min(15 * S, 640 / Math.max(1, capsEm(name, N_TRACK)))) * ts;
  const nameTop = (below ? dotsTop + d : capTop + capH) + 30 * S;
  const label = `${goals} ${goals === 1 ? "GOAL" : "GOALS"}`;

  /* ---- the foot ---- */
  const logoBottom = (story ? CH - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const compTop = story ? STORY_BOTTOM - 88 - 60 - 18 : CANVAS_H - 44 - 52 - 40 - 12;
  const rowTop = compTop - 60 * S;
  const crests = (!weHost ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const ours = shortName(data.club?.name ?? "");
  const pair = !weHost ? [opp, ours] : [ours, opp];
  const fixture = opp && ours ? `${pair[0]}   ${score || "v"}   ${pair[1]}` : score;
  const FIX_TRACK = 0.28;
  const fixSize = Math.max(11, Math.min(16 * S, 760 / Math.max(1, capsEm(fixture, FIX_TRACK)))) * ts;
  const comp = [f.comp, f.round].filter(Boolean).join(" · ");
  const COMP_TRACK = 0.3;
  const compSize = Math.max(10, Math.min(12.5 * S, 900 / Math.max(1, capsEm(comp, COMP_TRACK)))) * ts;

  /* ---- the player, large, clear of the title ---- */
  const faceX = 600 + (params.side === "left" ? -120 : params.side === "right" ? 60 : 0);
  const faceTop = nameTop + nSize + (story ? 170 : 120);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 370, waist: 290, knees: 224, full: 172 } : { chest: 270, waist: 214, knees: 164, full: 126 });
  const fadeEnd = rowTop - 24 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 260}px, transparent ${fadeEnd}px)`;

  const caps = (sz: number, track: number, weight: number): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: sz, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: ground, color: ink }}>
      {dark ? (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${faceX}px 55%, ${shade(club, -0.55)}, ${ground})` }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${faceX}px 55%, #f8f6f2, ${PAPER})` }} />
      )}

      {/* The player, large, natural colour, melting into the ground above the foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The title, and one solid circle per goal. */}
      <div style={{ position: "absolute", left: MARGIN, top: titleTop, display: "flex", flexDirection: below ? "column" : "row", alignItems: "flex-start", gap: below ? 0 : size * 0.2 }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: `${TRACK}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{title}</div>
        <div style={{ marginTop: dotsTop - titleTop - (below ? size : 0), marginLeft: below ? 4 : 0, height: d, display: "flex", gap: d * 0.42 }}>
          {Array.from({ length: goals }, (_, i) => (
            <div key={i} style={{ width: d, height: d, borderRadius: "50%", background: dot, flexShrink: 0 }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: MARGIN + 3, top: nameTop, display: "flex", gap: 18, alignItems: "center", ...caps(nSize, N_TRACK, 500) }}>
        <span>{name}</span>
        <span style={{ width: 28, height: 1, background: soft }} />
        <span style={{ color: soft }}>{label}</span>
      </div>

      {/* Foot: crests either side of the score, then the competition. */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: rowTop - 10 * S, height: fixSize + 20 * S, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * S }}>
        {crests[0] && <img src={crests[0]} alt="" style={{ width: 34 * S, height: 34 * S, objectFit: "contain" }} />}
        {fixture && <div style={{ ...caps(fixSize, FIX_TRACK, 600), textAlign: "center" }}>{fixture}</div>}
        {crests[1] && <img src={crests[1]} alt="" style={{ width: 34 * S, height: 34 * S, objectFit: "contain" }} />}
      </div>
      {comp && <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: compTop, ...caps(compSize, COMP_TRACK, 400), color: soft, textAlign: "center" }}>{comp}</div>}

      <AgencyLogo data={data} height={story ? 26 : 20} onLight={!dark} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={dark ? 0.18 : 0.12} />
    </div>
  );
}
