/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

const GROUND = "#efede8";
const INK = "#111111";

/** Barlow Condensed 800 capitals: advance widths per 100px (measured in the browser). */
const BC_W: Record<string, number> = { A: 51.4, B: 47.6, C: 47, D: 47.9, E: 44.1, F: 42.7, G: 47.3, H: 48.3, I: 23.5, J: 46.2, K: 50.5, L: 43.7, M: 55.8, N: 52.2, O: 47.9, P: 47.4, Q: 46.7, R: 48.1, S: 45.4, T: 48.5, U: 48, V: 50.6, W: 70.7, X: 49, Y: 49.2, Z: 41.9, " ": 20, "-": 29.7, "'": 18.8, "!": 28.9, ".": 23.5 };
/** Inter capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28, "·": 28 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const bcEm = (t: string, tracking = 0) => plain(t).reduce((a, c) => a + (BC_W[c] ?? 47) / 100 + tracking, 0);
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (CAPS_W[c] ?? 62) / 100 + tracking, 0);

/** The title in at most three lines: words first, then a long hyphenated word at its hyphen ("HAT-" / "TRICK"). */
function titleLines(t: string): string[] {
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length === 1 && words[0].includes("-") && bcEm(words[0]) > 3.2) {
    const [a, ...rest] = words[0].split("-");
    return [`${a}-`, rest.join("-")];
  }
  if (words.length <= 3) return words.length > 1 && bcEm(words.join(" ")) <= 3.4 ? [words.join(" ")] : words;
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

/**
 * Goal offset: the celebrating player in natural colour on a light ground, with ONE hard, flat shadow of
 * his own silhouette in the club colour, offset towards the free side (no blur). On that free side the
 * title big in heavy condensed black, his name and the fixture small beneath it, the mark at the foot.
 * params.side puts the player left or right (right by default).
 */
export function Goaloffset({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.32 : 1;
  const right = params.side !== "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.55) club = vivid(params.accent);
  if (luminance(club) > 0.55) club = shade(club, -0.4);

  const f = matchFacts(data);

  /* ---- the player, big, on his side, bleeding off the foot ---- */
  const faceX = right ? (story ? 720 : 735) : story ? 360 : 345;
  const sizes = story ? { chest: 300, waist: 236, knees: 184, full: 140 } : { chest: 250, waist: 196, knees: 152, full: 116 };
  const box = placeByFace(data, faceX, story ? STORY_TOP + 230 : 210, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const dx = (story ? 46 : 38) * (right ? -1 : 1);
  const dy = story ? 30 : 24;

  /* ---- the free side: title, name, fixture, mark (measured from the foot) ---- */
  const M = 64;
  const colW = story ? 450 : 430;
  const colLeft = right ? M : CANVAS_W - M - colW;
  const align: CSSProperties["textAlign"] = right ? "left" : "right";
  const logoH = story ? 88 : 52;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = oursName.trim();
  const opp = (typed ?? f.opp ?? "").trim();
  const [home, away] = weHost ? [ours, opp] : [opp, ours];
  const fixLines = home && away ? [home.toUpperCase(), `v  ${away.toUpperCase()}`] : [(f.comp || "").toUpperCase()].filter(Boolean);
  const F_TRACK = 0.16;
  const fSize = Math.max(11, Math.min(17 * S, colW / Math.max(1, ...fixLines.map((l) => capsEm(l, F_TRACK))))) * ts;
  const fLead = fSize * 1.45;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const N_TRACK = 0.08;
  const nSize = Math.max(15, Math.min(26 * S, colW / Math.max(1, capsEm(name, N_TRACK)))) * ts;

  const title = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const lines = titleLines(title);
  const T_TRACK = -0.005;
  const tSize = Math.min((story ? 300 : 232) * ts, colW / Math.max(1, ...lines.map((l) => bcEm(l, T_TRACK))));
  const tLead = tSize * 0.86;

  const fixTop = logoTop - (story ? 62 : 44) - (fixLines.length - 1) * fLead - fSize;
  const nameTop = fixTop - (story ? 22 : 18) - nSize;
  // The title's cap line sits a little under the em box top; its baseline ~ top + 0.86 em.
  let titleTop = nameTop - (story ? 40 : 32) - (lines.length - 1) * tLead - tSize * 0.9 + (params.textY ?? 0);
  // Never level with his face: at least well under his chin.
  titleTop = Math.max(titleTop, chin + box.faceH * 0.5 - tSize * 0.1);

  const caps = (size: number, track: number, weight: number): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: INK, textAlign: align });
  // The silhouette as a mask, faded where the photo frame cuts him (like cutMask), so the shadow ends with him.
  const cut = data.cut ?? {};
  // At a cut edge the photo fades out; the shadow must be gone wherever the photo is not fully opaque
  // (it would show through), so it stays clear of the whole fade, plus its own offset, then ramps in.
  const edge = (dir: string, a: number, extent: number, push = 0) =>
    `linear-gradient(${dir}, transparent 0px, transparent ${Math.round(push + a * extent)}px, #000 ${Math.round(push + a * extent * 1.8)}px)`;
  const layers = [
    data.photoUrl ? `url("${data.photoUrl}")` : "",
    (cut.bottom ?? 0) > 0 ? edge("to top", 0.16, box.height, dy) : "",
    (cut.top ?? 0) > 0 ? edge("to bottom", 0.07, box.height) : "",
    (cut.left ?? 0) > 0 ? edge("to right", 0.12, box.width, Math.max(0, -dx)) : "",
    (cut.right ?? 0) > 0 ? edge("to left", 0.12, box.width, Math.max(0, dx)) : "",
  ].filter(Boolean);
  const m = layers.join(", ");
  const photoMask = {
    WebkitMaskImage: m,
    maskImage: m,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskComposite: layers.length > 1 ? "source-in" : undefined,
    maskComposite: layers.length > 1 ? "intersect" : undefined,
  } as CSSProperties;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND, color: INK }}>
      {/* The one flat shadow: his silhouette in the club colour, offset, no blur. */}
      {data.photoUrl && <div style={{ position: "absolute", left: box.left + dx, top: box.top + dy, width: box.width, height: box.height, background: club, ...photoMask }} />}

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
      )}

      {/* The free side: the title, big. */}
      <div style={{ position: "absolute", left: colLeft, width: colW, top: titleTop, fontFamily: CONDENSED, fontWeight: 800, fontSize: tSize, lineHeight: `${tLead}px`, letterSpacing: `${T_TRACK}em`, color: INK, textAlign: align, whiteSpace: "nowrap" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* His name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: colLeft, width: colW, top: nameTop, ...caps(nSize, N_TRACK, 700) }}>{name}</div>}
      {fixLines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: colLeft, width: colW, top: fixTop + i * fLead, ...caps(fSize, F_TRACK, 500), color: "rgba(17,17,17,.62)" }}>
          {l}
        </div>
      ))}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 24 : 20}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
    </div>
  );
}
