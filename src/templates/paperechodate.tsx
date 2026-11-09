/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, PaperEdge, PaperTooth, paperTones } from "./paperecho";
import { capsEm, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { CAP } from "./echotitle";

const M = 64;

/* ------------------------------------------------------------------------------------------------------------
 * The paper-echo base, shared by the paper hybrids (paperechodate, paperechotime, paperechoname): paperecho's
 * warm paper, the player in natural colour melting into it above the foot, a soft contact shade, one hairline
 * echo of his edge in deep club colour or ink, all text in ink / club tones, the dark NEYOD logo.
 * ---------------------------------------------------------------------------------------------------------- */

export type PaperSetup = ReturnType<typeof paperSetup>;

export function paperSetup(data: RenderData) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const t = paperTones(data);
  // A deep club tone for small accents (month, colon) that always reads on paper.
  let accent = luminance(t.club) > 0.1 ? shade(t.club, -0.3) : t.club;
  if (luminance(accent) > 0.18) accent = shade(accent, -0.35);
  return { H, story, k: story ? 1.4 : 1, ts: params.textScale ?? 1, right: params.side !== "left", ...t, accent };
}

export const inkCaps = (s: PaperSetup, size: number, track: number, weight = 500): CSSProperties => ({
  fontFamily: SANS,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: `${track}em`,
  paddingLeft: `${track}em`,
  lineHeight: 1,
  whiteSpace: "nowrap",
  color: s.ink,
  textAlign: "center",
});

/**
 * The foot, centred: crests (optional), the fixture (home first, names exactly as stored), then one line of
 * `when` parts. In the story the last line ends 64px above the ~88px logo (top at STORY_BOTTOM − 88).
 */
export function paperFoot(data: RenderData, s: PaperSetup, when: string[], withCrests = true) {
  const { content } = data;
  const f = matchFacts(data);
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * s.k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * s.ts;
  const line = when.filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * s.k, 900 / Math.max(1, line.length * 0.5))) * s.ts;
  const crests = withCrests ? ((content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[]) : [];
  const whenTop = (s.story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize);
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
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...inkCaps(s, fixSize, F_TRACK) }}>{fixture}</div>}
      {line && (
        <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: s.ink, opacity: 0.72 }}>
          {line}
        </div>
      )}
    </>
  );
  return { el, top };
}

/**
 * Paper, big type behind (optional), contact shade, hairline echo and the player in natural colour, melting
 * into the paper above `fadeEnd`. The echo leans towards the free side (or `outward`, towards his own side).
 */
export function PaperFigure({ data, s, box, id, clipTop = 0, fadeEnd, light, behind, outward, width }: { data: RenderData; s: PaperSetup; box: Box; id: string; clipTop?: number; fadeEnd: number; light: [number, number]; behind?: ReactNode; outward?: boolean; width?: number }) {
  const dx = (s.right !== !!outward ? -40 : 40) * s.k;
  const dy = -32 * s.k;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - (s.story ? 380 : 300) - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 56% at ${light[0]}% ${light[1]}%, ${s.light}, ${s.paper} 62%, ${s.edge})` }} />
      {behind}
      <ContactShade box={box} H={s.H} bottom={fadeEnd} ink={s.ink} toLeft={!s.right} />
      {data.photoUrl && <PaperEdge id={id} url={data.photoUrl} box={box} H={s.H} dx={dx} dy={dy} color={s.echo} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd} width={width ?? (s.story ? 2.2 : 1.8)} />}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
    </>
  );
}

export function PaperLogo({ data, s }: { data: RenderData; s: PaperSetup }) {
  const p = data.params;
  return (
    <AgencyLogo
      data={data}
      onLight
      height={s.story ? 26 : 18}
      style={{ position: "absolute", left: "50%", bottom: (s.story ? s.H - STORY_BOTTOM : 44) - (p.logoY ?? 0), transform: `translateX(-50%) scale(${p.logoScale ?? 1})`, transformOrigin: "center bottom" }}
    />
  );
}

export function PaperFinish() {
  return <PaperTooth />;
}

/** Inter Thin (100): advance widths of the figures per 1px of font size (proportional figures). */
const THIN_W: Record<string, number> = { "0": 0.66, "1": 0.38, "2": 0.6, "3": 0.62, "4": 0.64, "5": 0.6, "6": 0.62, "7": 0.55, "8": 0.63, "9": 0.62, ":": 0.24 };
export const thinEm = (t: string, tracking: number) => [...t].reduce((a, c) => a + (THIN_W[c] ?? 0.6) + tracking, -tracking);

/** "SAT 17 OCT" / "17 OCT" → ["17", "OCT"]. */
function dayMonth(d?: string): [string, string] {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? [m[1].padStart(2, "0"), m[2]] : ["", ""];
}

/**
 * Paper echo date: echodate on paperecho's warm paper — the match day in big Inter Thin ink figures on the
 * free side, behind him, the month small and wide-tracked under it in deep club colour after a short rule, the
 * title small above. The player in natural colour with his hairline echo (deep club colour or ink); crests,
 * fixture and kick-off · ground small in ink at the foot; dark NEYOD logo.
 */
export function Paperechodate({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = paperSetup(data);
  const f = matchFacts(data);
  const [day, mon] = dayMonth(content.date);

  const foot = paperFoot(data, s, [f.time ? `Kick-off ${f.time}` : "", titleCase(f.venue)]);

  /* ---- the date: day enormous and thin, month small under it ---- */
  const TR = -0.03;
  const size = Math.min(s.story ? 520 : 460, (s.story ? 460 : 430) / Math.max(0.5, thinEm(day, TR))) * s.ts;
  const figTop = (s.story ? STORY_TOP + 90 : M + 106) + (params.textY ?? 0);
  const figBottom = figTop + size * CAP;
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const tSize = Math.max(12 * s.k, Math.min(15 * s.k, 300 / Math.max(1, capsEm(title, 0.42)))) * s.ts;
  const mSize = 30 * s.k * s.ts;
  const side: CSSProperties = s.right ? { left: M } : { right: M };

  /* ---- the player, towards his side ---- */
  const fx = s.story ? (s.right ? 740 : 340) : s.right ? 700 : 380;
  const box = s.story ? placeByFace(data, fx, 430, { chest: 340, waist: 272, knees: 204, full: 158 }) : placeByFace(data, fx, 230, { chest: 270, waist: 214, knees: 160, full: 122 });
  const fadeEnd = foot.top - 24 * s.k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperFigure
        data={data}
        s={s}
        box={box}
        id="paperechodate"
        fadeEnd={fadeEnd}
        light={[s.right ? 60 : 40, 40]}
        behind={
          day && (
            <div
              style={{
                position: "absolute",
                ...(s.right ? { left: M - size * 0.05 } : { right: M - size * 0.05 }),
                top: figTop - size * (0.864 - CAP),
                fontFamily: SANS,
                fontWeight: 100,
                fontSize: size,
                lineHeight: 1,
                letterSpacing: `${TR}em`,
                whiteSpace: "nowrap",
                color: s.ink,
                opacity: 0.9,
                fontVariantNumeric: "proportional-nums",
              }}
            >
              {day}
            </div>
          )
        }
      />

      {/* The title above, the month under the figures. */}
      <div style={{ position: "absolute", ...side, top: figTop - 54 * s.k - tSize, fontFamily: SANS, fontWeight: 500, fontSize: tSize, letterSpacing: "0.42em", lineHeight: 1, whiteSpace: "nowrap", color: s.ink, opacity: 0.78, ...(s.right ? {} : { marginRight: "-0.42em" }) }}>
        {title}
      </div>
      {mon && (
        <div style={{ position: "absolute", ...side, top: figBottom + 34 * s.k, display: "flex", alignItems: "center", gap: 22 * s.k, flexDirection: s.right ? "row" : "row-reverse" }}>
          <div style={{ width: 40 * s.k, height: 1.5, background: s.accent }} />
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: mSize, letterSpacing: "0.5em", lineHeight: 1, whiteSpace: "nowrap", color: s.accent, ...(s.right ? {} : { marginRight: "-0.5em" }) }}>{mon}</div>
        </div>
      )}

      {foot.el}
      <PaperLogo data={data} s={s} />
      <PaperFinish />
    </div>
  );
}
