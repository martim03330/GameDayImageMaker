/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const WHITE = "#ffffff";
const DIM = "rgba(255,255,255,.58)";
const HAIR = "rgba(255,255,255,.7)";
/** Mono advance width in ems. */
const MONO_EM = 0.6;
const M = 64;

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = { a: 56.8, b: 61.8, c: 57.7, d: 61.8, e: 58.7, f: 34.4, g: 61.9, h: 60.2, i: 25.2, j: 25.2, k: 55.9, l: 25.2, m: 88.8, n: 60.1, o: 60.4, p: 61.8, q: 61.8, r: 39.8, s: 53.9, t: 33.7, u: 60.2, v: 57.5, w: 82.9, x: 55.7, y: 57.5, z: 55.9, A: 72.2, B: 65.7, C: 73.4, D: 72.2, E: 60.3, F: 58.9, G: 74.8, H: 74.4, I: 27.3, J: 57.5, K: 68.8, L: 56.5, M: 91.3, N: 75.6, O: 76.7, P: 64.2, Q: 76.9, R: 64.8, S: 64.6, T: 65.3, U: 74, V: 72.2, W: 102.4, X: 70.1, Y: 69.6, Z: 64.1, " ": 26.7, "'": 31.3, "-": 46.3 };
const interEm = (t: string, tracking = 0) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);

const MON: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };
const POS: [RegExp, string][] = [
  [/keeper/i, "GK"],
  [/right back/i, "RB"],
  [/left back/i, "LB"],
  [/centre back/i, "CB"],
  [/defensive/i, "DM"],
  [/attacking/i, "AM"],
  [/midfield/i, "CM"],
  [/right wing/i, "RW"],
  [/left wing/i, "LW"],
  [/wing/i, "W"],
  [/striker|forward/i, "ST"],
];

/** "MATCHDAY" → "Matchday", "MAN OF THE MATCH" → "Man of the match". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase();
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/** "SAT 17 OCT" → "17.10.26" (the year this edit is made). */
function stamp(date: string | undefined, fixtureDate?: string): string {
  const m = (date ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  const mon = MON[m[2]] ?? "";
  const fy = fixtureDate && fixtureDate.slice(5, 7) === mon ? fixtureDate.slice(2, 4) : String(new Date().getFullYear()).slice(2);
  return `${m[1].padStart(2, "0")}.${mon}.${fy}`;
}

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.toUpperCase().split(/\s+/).filter(Boolean);
  return (words.join(" ") || n.toUpperCase()).trim();
}

/** Mono size that keeps `t` inside `room` px. */
const fitMono = (t: string, room: number, max: number, min = 10, tracking = 0.08) => Math.max(min, Math.min(max, room / Math.max(1, t.length * (MONO_EM + tracking))));

/**
 * Micrographics: a calm photo-led sheet — the player in natural colour over his own photo melted soft (or a
 * flat club-dark ground), one clear sentence-case title, and around him tiny technical annotations: hairline
 * leader lines from the empty side to his head (number · position), his chest (club · founded) and his feet
 * (kick-off), a timestamp code, a fine tick ruler down the outer edge and a small mono spec block.
 */
export function Micro({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 31);
  const right = params.side !== "left";
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  // Native story (1080×1920): crests, code and title from STORY_TOP, spec block and mark ending at
  // STORY_BOTTOM, the player larger in the tall middle with the ruler running beside him; type a size up.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.6) club = vivid(params.accent);
  if (luminance(club) < 0.04) club = shade(club, 0.3);
  // The accent must read on a dark ground: lift deep blues and reds a touch.
  const acc = luminance(club) < 0.12 ? shade(club, 0.32) : club;
  const ground = shade(luminance(club) > 0.6 ? vivid(params.accent) : club, -0.8);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? f.opp);
  const pair = content.home === false ? [opp, shortName(ours)] : [shortName(ours), opp];

  /* ---- title ---- */
  const title = sentence(content.kicker || "Matchday");
  const tracking = -0.035;
  let size = 96 * S * ts;
  const titleRoom = CANVAS_W - M * 2 - 140;
  size = Math.min(size, titleRoom / Math.max(1, interEm(title, tracking)));
  const code = [stamp(content.date, data.fixtures?.[0]?.date), hasScore ? `FT ${score}` : f.time].filter(Boolean).join(" — ");
  const codeTop = (story ? STORY_TOP + 6 * S : 66) + ty;
  const titleTop = codeTop + 34 * S;
  const tag = [f.comp, f.round].filter(Boolean).join(" / ");
  const tagSize = fitMono(tag, CANVAS_W - M * 2 - 20, 14 * S);
  const tagTop = titleTop + size * 1.06 + 14 * S;

  /* ---- the player, on one side ---- */
  const faceX = (right ? 700 + r() * 40 : 380 - r() * 40) + (story ? (right ? 40 : -40) : 0);
  const faceTop = story ? Math.max(500, tagTop + 150) : Math.max(320, tagTop + 120);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 350, waist: 280, knees: 215, full: 168 } : { chest: 236, waist: 184, knees: 142, full: 110 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fx0 = box.left + face[0] * box.width;
  const fx1 = fx0 + face[2] * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = box.faceH;
  const fCx = (fx0 + fx1) / 2;

  /* ---- the spec block (bottom, text side) ---- */
  const date = stamp(content.date, data.fixtures?.[0]?.date);
  const rows: [string, string][] = (
    [
      ["FIXTURE", opp ? (hasScore ? `${pair[0]} ${score} ${pair[1]}` : `${pair[0]} — ${pair[1]}`) : ""],
      // Story: the fixture breaks after the dash (second line under the first value), so the block stays narrow.
      ...(story && opp && !hasScore ? ([["", ""]] as [string, string][]) : []),
      ["COMP", (f.comp || f.round || "").toUpperCase()],
      ["GROUND", f.venue],
      ["DATE", [date, f.time].filter(Boolean).join(" · ")],
    ] as [string, string][]
  ).filter(([k, v]) => v || (story && !k));
  if (story && opp && !hasScore) {
    rows[0] = ["FIXTURE", `${pair[0]} —`];
    rows[1] = ["", pair[1]];
  }
  const specW = story ? 500 : 470;
  const LABEL_W = 100 * S;
  const specRowH = 26 * S;
  const specBottom = story ? H - STORY_BOTTOM + 95 + 44 : 64 + 22 + 30;
  const specTop = H - specBottom - rows.length * specRowH;
  const sx = right ? M : CANVAS_W - M - specW;

  /* ---- leader annotations: head, chest, feet ---- */
  const pos = POS.find(([re]) => re.test(data.player.position))?.[1] ?? "";
  const num = data.player.number ? `No. ${data.player.number}` : "";
  const name = (content.lastName || content.firstName || "").toUpperCase();
  const head = [num, pos].filter(Boolean).join(" · ") || name;
  const founded = data.club?.founded ? `EST. ${data.club.founded}` : "";
  const chest = [shortName(ours), founded].filter(Boolean).join(" · ");
  const feetY = box.top + box.height * 0.965;
  const feetVisible = !(data.cut?.bottom ?? 0) && feetY < specTop - 40;
  const lowY = feetVisible ? feetY - 10 : Math.min(fTop + fH * 4.6, specTop - 70);
  const kick = hasScore ? (postType === "goal" ? "GOAL" : `FULL TIME ${score}`) : f.time ? `KICK-OFF ${f.time}` : date;
  type Note = { idx: string; text: string; y: number; ax: number };
  const away = (dx: number) => (right ? -dx : dx);
  const notes: Note[] = [
    // Ends short of the face, never across it.
    { idx: "01", text: head, y: fTop + fH * 0.5, ax: (right ? fx0 : fx1) + away(26) },
    { idx: "02", text: chest, y: fTop + fH * 1.74, ax: fCx - away(fH * 0.6) },
    { idx: "03", text: kick, y: lowY, ax: fCx + away(fH * 0.1) },
  ].filter((n) => n.text && n.y > tagTop + 60 && n.y < specTop - 40);
  const noteSize = 14 * S * Math.min(1.15, ts);
  const labelX = right ? M + 26 : CANVAS_W - M - 26;

  /* ---- ruler down the outer edge ---- */
  const rx = right ? 26 : CANVAS_W - 26;
  const ticks: number[] = [];
  for (let y = story ? 500 : 300; y <= (story ? Math.min(1500, specTop - 70) : 1100); y += 20) ticks.push(y);

  /* ---- background ---- */
  const own = data.bgPhotoUrl ?? sceneOf(data);
  const usePhoto = !!own && (params.seed ?? 31) % 3 !== 2;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const mono = (s: number, color = WHITE, spacing = 0.08): CSSProperties => ({ fontFamily: MONO, fontSize: s, letterSpacing: `${spacing}em`, color, lineHeight: 1, whiteSpace: "nowrap", textTransform: "uppercase" });
  const fade = story
    ? `linear-gradient(to bottom, #000 0, #000 ${specTop - 260 - box.top}px, transparent ${specTop + 40 - box.top}px)`
    : `linear-gradient(to bottom, #000 0, #000 ${CANVAS_H - 160 - box.top}px, transparent ${CANVAS_H - box.top}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        {/* Drops the faint haze some cutouts carry around the figure. */}
        <filter id="micro-clean" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.1" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
      </svg>
      {usePhoto ? (
        <>
          <img src={own!} alt="" style={{ position: "absolute", left: -120, top: -120, width: CANVAS_W + 240, height: H + 240, maxWidth: "none", objectFit: "cover", filter: "blur(36px) saturate(.8) brightness(.62)" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${right ? "to right" : "to left"}, ${ground}d0 0%, ${ground}80 45%, ${ground}30 100%)` }} />
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 66 : 34}% 42%, ${shade(ground, 0.12)}, ${ground} 75%)` }} />
      )}

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "url(#micro-clean) contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 640 : 300, background: `linear-gradient(to bottom, transparent, ${ground}cc)` }} />

      {/* Timestamp code, title, competition. */}
      <div style={{ position: "absolute", left: M, top: codeTop, ...mono(14 * S, DIM, 0.14) }}>
        <span style={{ display: "inline-block", width: 8 * S, height: 8 * S, background: acc, marginRight: 12 * S, verticalAlign: 1 }} />
        {code}
      </div>
      <div style={{ position: "absolute", left: M, top: titleTop, fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${tracking}em`, lineHeight: 1.06, whiteSpace: "nowrap", marginLeft: -size * 0.04 }}>{title}</div>
      {tag && <div style={{ position: "absolute", left: M, top: tagTop, ...mono(tagSize, DIM, 0.08) }}>{tag}</div>}

      {/* Crests, small, top corner. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", right: M, top: codeTop - 6 * S, display: "flex", alignItems: "center", gap: 12 * S }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 40 * S, height: 40 * S, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* Leader lines to the player. */}
      {notes.map((n) => {
        const s = fitMono(n.text, 300 * S, noteSize, 10, 0.1);
        const textW = n.text.length * s * (MONO_EM + 0.1) + 34;
        const x0 = right ? labelX + textW + 12 : labelX - textW - 12;
        const len = right ? n.ax - x0 : x0 - n.ax;
        const showLine = len > 40;
        return (
          <div key={n.idx}>
            <div style={{ position: "absolute", [right ? "left" : "right"]: right ? labelX : CANVAS_W - labelX, top: n.y - s / 2, display: "flex", gap: 10, flexDirection: right ? "row" : "row-reverse", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
              <span style={mono(s * 0.9, acc, 0.06)}>{n.idx}</span>
              <span style={mono(s, WHITE, 0.1)}>{n.text}</span>
            </div>
            {showLine && (
              <>
                <div style={{ position: "absolute", left: Math.min(x0, n.ax), top: n.y, width: len, height: 1, background: HAIR }} />
                <div style={{ position: "absolute", left: n.ax - 4, top: n.y - 4, width: 8, height: 8, borderRadius: 8, border: `1.5px solid ${WHITE}`, boxSizing: "border-box", background: acc }} />
              </>
            )}
          </div>
        );
      })}

      {/* Tick ruler down the outer edge. */}
      {ticks.map((y, i) => (
        <div key={y} style={{ position: "absolute", left: right ? rx : rx - (i % 5 === 0 ? 12 : 6), top: y + ty * 0, width: i % 5 === 0 ? 12 : 6, height: 1, background: i % 5 === 0 ? HAIR : "rgba(255,255,255,.35)" }} />
      ))}
      {ticks
        .filter((_, i) => i % 10 === 0)
        .map((y) => (
          <div key={`n${y}`} style={{ position: "absolute", left: right ? rx + 18 : rx - 18 - 30, top: y - 5, width: 30, textAlign: right ? "left" : "right", ...mono(10 * S, DIM, 0.04) }}>
            {String(Math.round(y / 10)).padStart(3, "0")}
          </div>
        ))}

      {/* Spec block. */}
      <div style={{ position: "absolute", left: sx, top: specTop - 18, width: specW, height: 1, background: "rgba(255,255,255,.4)" }} />
      {rows.map(([k, v], i) => (
        <div key={i} style={{ position: "absolute", left: sx, top: specTop + i * specRowH, width: specW, display: "flex" }}>
          <span style={{ ...mono(12.5 * S, DIM, 0.12), width: LABEL_W }}>{k}</span>
          <span style={mono(fitMono(v, specW - LABEL_W, 14 * S, 10, 0.06), WHITE, 0.06)}>{v}</span>
        </div>
      ))}

      <AgencyLogo
        data={data}
        height={story ? 26 : 22}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: (story ? H - STORY_BOTTOM : 64) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.2} />
    </div>
  );
}
