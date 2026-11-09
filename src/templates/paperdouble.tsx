/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { keepHead } from "./doubleline";
import { cutMask } from "./fx";
import { teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { ContactShade, PaperTooth, paperTones } from "./paperecho";
import { fadeMask, paperDeep } from "./paperripple";
import { capsEm, SilhouetteFx } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const M = 64;

type Box = { left: number; top: number; width: number; height: number };

/**
 * One hairline echo of his edge slipped `dx` sideways, for paper: his alpha smoothed harder than echoline's
 * (a cutout's ragged fringe reads as noise in dark ink on a light ground), dilated, minus itself, and minus his
 * own body where he really stands — so the line never shows through the fade of his lower body. Drawn through
 * SilhouetteFx (the photo frame's cuts fade out instead of drawing a line), faded in under the title and out
 * above the foot.
 */
export function SoftEdge({ id, url, box, H, dx, color, clipTop, cut, fadeEnd, span, width = 2 }: { id: string; url: string; box: Box; H: number; dx: number; color: string; clipTop: number; cut?: RenderData["cut"]; fadeEnd: number; span: number; width?: number }) {
  return (
    <SilhouetteFx id={id} url={url} box={{ ...box, left: box.left + dx }} H={H} clipTop={clipTop} cut={cut} pad={Math.abs(dx) + 16} mask={fadeMask(id, clipTop, fadeEnd, span, H)}>
      <feGaussianBlur in="SourceAlpha" stdDeviation={3.2} result="s" />
      <feComponentTransfer in="s" result="a">
        <feFuncA type="discrete" tableValues="0 0 0 1 1 1" />
      </feComponentTransfer>
      <feMorphology in="a" operator="dilate" radius={width} result="d" />
      <feComposite in="d" in2="a" operator="out" result="ring" />
      <feOffset in="a" dx={-dx} dy={0} result="body" />
      <feComposite in="ring" in2="body" operator="out" result="free" />
      <feGaussianBlur in="free" stdDeviation={0.4} result="q" />
      <feFlood floodColor={color} />
      <feComposite in2="q" operator="in" />
    </SilhouetteFx>
  );
}

/**
 * Paper double: doubleline on light warm paper — the player centred in natural colour with a soft shade where
 * he meets the paper, and two hairline echoes of his own edge, one slipped left in the deep club colour, one
 * slipped right in near-black ink, the same distance each side — two plates printed slightly out of register.
 * The title small and tracked in ink at the top; crests, the fixture (home first, names exactly as stored) and
 * date · kick-off · ground small at the foot.
 */
export function Paperdouble({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;
  const { paper, light, edge, ink } = paperTones(data);
  const deep = paperDeep(data);

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + tSize + 34 * k;

  /* ---- foot ---- */
  const f = matchFacts(data);
  const fixture = teamsOf(data).join("   v   ").toUpperCase() || (f.comp || "").toUpperCase();
  const F_TRACK = 0.3;
  const fixSize = Math.max(12, Math.min(17 * k, 820 / Math.max(1, capsEm(fixture, F_TRACK)))) * ts;
  const when = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean).join("   ·   ");
  const whenSize = Math.max(14, Math.min(19 * k, 900 / Math.max(1, when.length * 0.5))) * ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  // Story: the logo (~88px) ends at STORY_BOTTOM (top 1592); the date line ends 64px above it.
  const whenTop = (story ? STORY_BOTTOM - 88 - 64 - whenSize * 1.2 : CANVAS_H - 150 - whenSize) - (params.textY ?? 0);
  const fixTop = whenTop - fixSize - 22 * k;
  const CR = 40 * k;
  const crestTop = fixTop - CR - 28 * k;

  /* ---- the player, centred, and the two slips ---- */
  const box = keepHead(data, story ? placeByFace(data, 540, 360, { chest: 400, waist: 316, knees: 230, full: 172 }) : placeByFace(data, 540, 250, { chest: 286, waist: 224, knees: 168, full: 126 }), titleTop + tSize + (story ? 64 : 44));
  const dx = story ? 30 : 22;
  // He and his lines melt into the paper above the foot.
  const fadeEnd = crestTop - 26 * k;
  const span = story ? 380 : 300;
  const fade = `linear-gradient(to bottom, #000 ${Math.round(fadeEnd - span - box.top)}px, transparent ${Math.round(fadeEnd - box.top)}px)`;

  const caps = (size: number, track: number, weight = 500): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, paddingLeft: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", color: ink, textAlign: "center" });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: paper, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 56% at 50% 40%, ${light}, ${paper} 62%, ${edge})` }} />

      <ContactShade box={box} H={H} bottom={fadeEnd} ink={ink} toLeft={false} />

      {data.photoUrl && (
        <>
          <SoftEdge id="paperdouble-l" url={data.photoUrl} box={box} H={H} dx={-dx} color={deep} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd - 70 * k} span={span} width={story ? 2.2 : 1.8} />
          <SoftEdge id="paperdouble-r" url={data.photoUrl} box={box} H={H} dx={dx} color={ink} clipTop={clipTop} cut={data.cut} fadeEnd={fadeEnd - 70 * k} span={span} width={story ? 2.8 : 2.3} />
        </>
      )}

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
          ))}
        </div>
      )}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, ...caps(fixSize, F_TRACK) }}>{fixture}</div>}
      {when && <div style={{ position: "absolute", left: M, right: M, top: whenTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: whenSize, letterSpacing: "0.04em", lineHeight: 1.2, whiteSpace: "nowrap", color: ink, opacity: 0.72 }}>{when}</div>}

      <AgencyLogo data={data} onLight height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <PaperTooth />
    </div>
  );
}
