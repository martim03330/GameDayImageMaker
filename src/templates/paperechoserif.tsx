/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { serifEm, serifLines } from "./echoserif";
import { footTexts } from "./goalechotitle";
import { cutMask, DMSERIF } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, mix, PaperEdge, PaperTooth, paperTones } from "./paperecho";
import { capsEm, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

/* ------------------------------------------------------------------------------------------------------------
 * Paper base shared by the paper echo hybrids (paperechoserif / paperechowide and their goal versions):
 * paperecho's warm paper, the player melting into it above the foot, one hairline echo in deep club or ink.
 * ---------------------------------------------------------------------------------------------------------- */

export type PaperSetup = ReturnType<typeof paperSetup>;

export function paperSetup(data: RenderData, goal = false) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const t = paperTones(data);
  // Deep club for type on paper (near-black / pale clubs fall back to ink).
  const deepClub = luminance(t.club) > 0.1 ? shade(t.club, -0.35) : t.club;
  const clubInk = luminance(deepClub) < 0.02 || luminance(t.club) > 0.75 ? t.ink : deepClub;
  return { ...t, H, story, k: story ? (goal ? 1.38 : 1.4) : 1, ts: params.textScale ?? 1, right: params.side !== "left", clubInk };
}

/** Paper ground: off-white with a lighter pool of light at (x%, y%). */
export function PaperGround({ s, at }: { s: PaperSetup; at: [number, number] }) {
  return <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 56% at ${at[0]}% ${at[1]}%, ${s.light}, ${s.paper} 62%, ${s.edge})` }} />;
}

/** Shade, hairline echo and the player (natural colour), who melts into the paper by `fadeEnd`. */
export function PaperFigure({ data, s, box, id, dx, dy, clipTop, fadeEnd, toLeft }: { data: RenderData; s: PaperSetup; box: Box; id: string; dx: number; dy: number; clipTop: number; fadeEnd: number; toLeft: boolean }) {
  const run = s.story ? 380 : 300;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - run - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;
  return (
    <>
      <ContactShade box={box} H={s.H} bottom={fadeEnd} ink={s.ink} toLeft={toLeft} />
      {data.photoUrl && <PaperEdge id={id} url={data.photoUrl} box={box} H={s.H} dx={dx} dy={dy} color={s.echo} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd} width={s.story ? 2.2 : 1.8} />}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
    </>
  );
}

export const inkCaps = (ink: string, size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center", ...extra });

/**
 * Matchday foot in ink, centred: crests, the fixture (home first, names exactly as stored), then date · kick-off
 * · ground. Story: the last line ends 64px above the ~88px logo (logo top STORY_BOTTOM − 88).
 */
export function paperFoot(data: RenderData, s: PaperSetup) {
  const { content, params } = data;
  const f = matchFacts(data);
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * s.k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * s.ts;
  const line = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * s.k, 900 / Math.max(1, line.length * 0.5))) * s.ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const whenTop = (s.story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize) - (params.textY ?? 0);
  const fixTop = line ? whenTop - fixSize - 22 * s.k : whenTop + whenSize * 0.2;
  const CR = 42 * s.k;
  const crestTop = fixTop - CR - 28 * s.k;
  const top = crests.length ? crestTop : fixture ? fixTop : whenTop;
  const el: ReactNode = (
    <>
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR + 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * s.k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...inkCaps(s.ink, fixSize, F_TRACK) }}>{fixture}</div>}
      {line && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: s.ink, opacity: 0.72 }}>{line}</div>}
    </>
  );
  return { el, top };
}

/** Goal foot in ink, centred: name, fixture (home first, as stored, no score), competition. */
export function paperGoalFoot(data: RenderData, s: PaperSetup) {
  const t = footTexts(data, s.k);
  const lastBottom = (s.story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (data.params.textY ?? 0);
  const compTop = lastBottom - t.compSize;
  const fixTop = (t.comp ? compTop - 18 * s.k : lastBottom) - t.fixSize;
  const nameTop = t.name ? fixTop - 22 * s.k - t.nameSize : fixTop;
  const el: ReactNode = (
    <>
      {t.name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...inkCaps(s.ink, t.nameSize, t.N_TRACK, 600) }}>{t.name}</div>}
      {t.fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...inkCaps(s.ink, t.fixSize, t.F_TRACK, 500, { opacity: 0.82 }) }}>{t.fixture}</div>}
      {t.comp && <div style={{ position: "absolute", left: M, right: M, top: compTop, ...inkCaps(s.ink, t.compSize, t.F_TRACK, 500, { opacity: 0.56 }) }}>{t.comp}</div>}
    </>
  );
  return { el, top: t.fixture || t.name ? nameTop : compTop };
}

/** The dark NEYOD logo, centred at the foot (honours logoScale / logoY). */
export function PaperLogo({ data, s }: { data: RenderData; s: PaperSetup }) {
  const p = data.params;
  return <AgencyLogo data={data} onLight height={s.story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (s.story ? s.H - STORY_BOTTOM : 44) - (p.logoY ?? 0), transform: `translateX(-50%) scale(${p.logoScale ?? 1})`, transformOrigin: "center bottom" }} />;
}

/**
 * Paper echo serif: echoserif on paperecho's warm paper — the player in natural colour towards his side, a soft
 * shade where he meets the paper, one hairline echo of his edge leaning to his own side (deep club or ink), and
 * on the free side one calm italic serif title ("Match / day", DM Serif Display) in ink, a short hairline in the
 * echo's colour and the competition in tiny spaced caps. Crests, fixture and date · kick-off · ground in ink.
 */
export function Paperechoserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = paperSetup(data);
  const f = matchFacts(data);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const foot = paperFoot(data, s);

  /* ---- the player, towards his side ---- */
  const fx = s.story ? (s.right ? 650 : 430) : s.right ? 640 : 440;
  const box = s.story
    ? placeByFace(data, fx, 360, { chest: 380, waist: 300, knees: 226, full: 172 })
    : placeByFace(data, fx, 230, { chest: 280, waist: 222, knees: 166, full: 126 });
  const faceL = box.left + face[0] * box.width;
  const faceR = faceL + face[2] * box.width;
  // The echo leans to his own side, away from the title.
  const dx = (s.right ? 42 : -42) * s.k;
  const dy = -34 * s.k;

  /* ---- the serif title on the free side ---- */
  const lines = serifLines(content.kicker || "MATCHDAY");
  const colW = Math.max(300, Math.min(s.story ? 520 : 440, s.right ? faceL - 56 - M : CANVAS_W - M - faceR - 56));
  const widest = Math.max(1, ...lines.map(serifEm));
  const size = Math.max(s.story ? 110 : 80, Math.min(s.story ? 184 : 136, colW / widest)) * s.ts;
  const lead = size * 0.9;
  const titleTop = (s.story ? STORY_TOP : 84) + (params.textY ?? 0);
  const blockTop = titleTop - size * 0.2;
  const titleBottom = titleTop + size * 0.72 + lead * (lines.length - 1) + size * 0.22;
  const ruleY = titleBottom + 30 * s.k;
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const compSize = Math.max(10.5, Math.min(13 * s.k, (colW * 1.6) / Math.max(1, comp.length * 1.02))) * s.ts;
  const align = s.right ? "left" : "right";
  const side = s.right ? { left: M } : { right: M };
  const fadeEnd = foot.top - 24 * s.k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperGround s={s} at={[s.right ? 58 : 42, 40]} />

      {/* The title behind him: his shoulder may pass in front of it. */}
      <div style={{ position: "absolute", ...side, top: blockTop, width: colW + 40, textAlign: align, fontFamily: DMSERIF, fontStyle: "italic", fontSize: size, lineHeight: `${lead}px`, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: s.ink }}>
        {lines.map((l, i) => (
          <div key={i} style={{ height: lead }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", ...side, top: ruleY, width: 56 * s.k, height: s.story ? 2 : 1.5, background: s.echo }} />
      {comp && <div style={{ position: "absolute", ...side, top: ruleY + 22 * s.k, width: colW, textAlign: align, fontFamily: SANS, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", lineHeight: 1.7, color: mix(s.ink, s.paper, 0.35) }}>{comp}</div>}

      <PaperFigure data={data} s={s} box={box} id="paperechoserif" dx={dx} dy={dy} clipTop={0} fadeEnd={fadeEnd} toLeft={!s.right} />

      {foot.el}
      <PaperLogo data={data} s={s} />
      <PaperTooth />
    </div>
  );
}
