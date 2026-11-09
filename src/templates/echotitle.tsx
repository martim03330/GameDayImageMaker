/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, SilhouetteFx, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter ExtraLight (200) capitals: advance widths per 1px of font size (approximate). */
const LIGHT_W: Record<string, number> = { A: 0.68, B: 0.64, C: 0.72, D: 0.72, E: 0.58, F: 0.56, G: 0.75, H: 0.73, I: 0.25, J: 0.53, K: 0.65, L: 0.53, M: 0.88, N: 0.74, O: 0.77, P: 0.62, Q: 0.77, R: 0.64, S: 0.62, T: 0.62, U: 0.72, V: 0.68, W: 0.98, X: 0.66, Y: 0.64, Z: 0.62, " ": 0.26, "'": 0.2, "-": 0.4 };
const lightEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (LIGHT_W[c] ?? 0.66) + tracking, -tracking);
/** Cap height of Inter relative to its size. */
export const CAP = 0.727;

/* ------------------------------------------------------------------------------------------------------------
 * The echoline base, shared by the echo hybrids (echotitle, echodate, echotime): the deep club ground, the
 * player in natural colour, one hairline echo of his edge offset behind him, and the small centred foot.
 * ---------------------------------------------------------------------------------------------------------- */

export type EchoSetup = {
  H: number;
  story: boolean;
  k: number;
  ts: number;
  /** The player stands on the right (the free side is the left). */
  right: boolean;
  club: string;
  deep: string;
  lift: string;
  echo: string;
  /** A quiet club tint for big light type on the deep ground. */
  tint: string;
  white: boolean;
};

export function echoSetup(data: RenderData, seed: number): EchoSetup {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const r = rng(params.seed ?? seed);
  const white = r() < 0.4;
  const club = clubTone(data);
  const deep = shade(club, -0.8);
  const lift = shade(club, -0.6);
  const echo = white ? "rgba(255,255,255,.75)" : luminance(club) < 0.12 ? shade(club, 0.4) : shade(club, 0.12);
  const tint = luminance(club) < 0.12 ? shade(club, 0.5) : shade(club, 0.28);
  return { H, story, k: story ? 1.4 : 1, ts: params.textScale ?? 1, right: params.side !== "left", club, deep, lift, echo, tint, white };
}

/** Ground, echo and player (natural colour), with echoline's deep fade over his lower body. */
export function EchoFigure({ data, s, box, id, clipTop = 0, light, behind, outward }: { data: RenderData; s: EchoSetup; box: Box; id: string; clipTop?: number; light: [number, number]; behind?: ReactNode; outward?: boolean }) {
  // The echo leans towards the free side, or (outward) towards his own side, away from type on the free edge.
  const dx = (s.right !== !!outward ? -42 : 42) * s.k;
  const dy = -34 * s.k;
  const eb = { left: box.left + dx, top: box.top + dy, width: box.width, height: box.height };
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${light[0]}% ${light[1]}%, ${s.lift}, ${s.deep} 80%)` }} />
      {behind}
      {data.photoUrl && (
        <SilhouetteFx id={id} url={data.photoUrl} box={eb} H={s.H} clipTop={clipTop} cut={data.cut} pad={8}>
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
          <feComponentTransfer in="s" result="a">
            <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
          </feComponentTransfer>
          <feMorphology in="a" operator="dilate" radius={2} result="d" />
          <feComposite in="d" in2="a" operator="out" result="ring" />
          <feFlood floodColor={s.echo} />
          <feComposite in2="ring" operator="in" />
        </SilhouetteFx>
      )}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: s.story ? 880 : 520,
          background: s.story ? `linear-gradient(to bottom, transparent, ${s.deep}e0 30%, ${s.deep} 52%)` : `linear-gradient(to bottom, transparent, ${s.deep}d9 55%, ${s.deep})`,
        }}
      />
    </>
  );
}

export const capsStyle = (size: number, track: number, weight = 500): CSSProperties => ({
  fontFamily: SANS,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: `${track}em`,
  paddingLeft: `${track}em`,
  lineHeight: 1,
  whiteSpace: "nowrap",
  color: WHITE,
  textAlign: "center",
});

/**
 * The foot, centred: crests (optional), the fixture (home first, names exactly as stored), then one light
 * line of `when` parts. In the story the last line ends 64px above the ~88px logo (top at STORY_BOTTOM − 88).
 * Returns the elements and the top of the block.
 */
export function echoFoot(data: RenderData, s: EchoSetup, when: string[], withCrests = true) {
  const { content } = data;
  const f = matchFacts(data);
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * s.k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * s.ts;
  const line = when.filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * s.k, 900 / Math.max(1, line.length * 0.5))) * s.ts;
  const crests = withCrests ? ((content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]) : [];
  const whenTop = s.story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize;
  const fixTop = line ? whenTop - fixSize - 22 * s.k : whenTop + whenSize * 0.2;
  const CR = 42 * s.k;
  const crestTop = fixTop - CR - 28 * s.k;
  const top = crests.length ? crestTop : fixture ? fixTop : whenTop;
  const el = (
    <>
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR + 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * s.k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...capsStyle(fixSize, F_TRACK) }}>{fixture}</div>}
      {line && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: "rgba(255,255,255,.78)" }}>
          {line}
        </div>
      )}
    </>
  );
  return { el, top };
}

export function EchoLogo({ data, s }: { data: RenderData; s: EchoSetup }) {
  const p = data.params;
  return (
    <AgencyLogo
      data={data}
      height={s.story ? 26 : 18}
      style={{ position: "absolute", left: "50%", bottom: (s.story ? s.H - STORY_BOTTOM : 44) - (p.logoY ?? 0), transform: `translateX(-50%) scale(${p.logoScale ?? 1})`, transformOrigin: "center bottom" }}
    />
  );
}

/**
 * Echo title: echoline's player and hairline echo, with the title ("MATCHDAY") set vertically up the free
 * edge — tall, ExtraLight, wide-tracked, in a quiet club tint (white when the echo is white). Crests, fixture
 * and date · kick-off · ground small at the foot.
 */
export function Echotitle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 11);
  const f = matchFacts(data);

  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  /* ---- the title, vertical, bottom to top ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const TRACK = s.story ? 0.42 : 0.46;
  const wordBottom = foot.top - 64 * s.k + (params.textY ?? 0);
  const wordTop = s.story ? STORY_TOP : M + 8;
  const maxLen = wordBottom - wordTop;
  const size = Math.min(s.story ? 132 : 104, maxLen / Math.max(1, lightEm(title, TRACK))) * s.ts;
  const len = lightEm(title, TRACK) * size;
  const capH = size * CAP;
  const hasMarks = title !== plain(title).join("");
  const markRoom = hasMarks ? size * 0.2 : 0;
  // Rotated -90°: glyph tops face left. On the left edge the baseline is the inner edge; on the right edge it
  // sits on the outer margin and the tops face inwards.
  const wordX = s.right ? M + markRoom + capH : CANVAS_W - M;
  // Centre the word's run in the band (it is usually shorter than the band).
  const wordY = wordBottom - (maxLen - Math.min(maxLen, len)) / 2;
  const ink = s.white ? "rgba(255,255,255,.62)" : s.tint;

  /* ---- the player, a little towards his side ---- */
  const fx = s.story ? (s.right ? 620 : 460) : s.right ? 600 : 480;
  const box = s.story
    ? placeByFace(data, fx, 320, { chest: 390, waist: 310, knees: 230, full: 174 })
    : placeByFace(data, fx, 210, { chest: 290, waist: 228, knees: 170, full: 128 });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echotitle"
        outward
        light={[s.right ? 56 : 44, 40]}
        behind={
          /* The title, up the free edge, behind him. */
          <svg data-bleed width={CANVAS_W} height={s.H} style={{ position: "absolute", inset: 0 }} aria-hidden>
            <text transform={`translate(${wordX} ${wordY}) rotate(-90)`} fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={200} fontSize={size} letterSpacing={`${TRACK}em`} fill={ink}>
              {title}
            </text>
          </svg>
        }
      />

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
