/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { shade } from "@/lib/color";
import { echoSetup } from "./echotitle";
import { cutMask, Film } from "./fx";
import { sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { capsEm, SilhouetteFx, type Box } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const WHITE = "#ffffff";
const M = 64;
const LAB_TRACK = 0.2;

/* ======================================================================================================
 * Shared by echohorizon / goalechohorizon: echoline's player and hairline echo on the deep club ground,
 * with horizon's one idea — a single hairline horizon across the canvas at his hips. He melts into the
 * darker floor at the line; everything else lives on it: the title sitting on the line on the free side,
 * small spaced-caps labels hanging from ticks under it, and the fixture (crests either side) below.
 * ==================================================================================================== */

/** The bottom block, measured up from the NEYOD logo (story: ~88px tall ending at STORY_BOTTOM; post: ~52px, 44 up). */
export function horizonGeometry(data: RenderData, story: boolean, k: number) {
  const p = data.params;
  const logoTop = story ? STORY_BOTTOM - 88 - (p.logoY ?? 0) : CANVAS_H - 44 - 52 - (p.logoY ?? 0);
  const CR = Math.round(34 * k);
  const rowBottom = logoTop - (story ? 66 : 62);
  const rowTop = rowBottom - CR;
  const labSize = (story ? 19 : 14) * (p.textScale ?? 1);
  const labBottom = rowTop - (story ? 62 : 46);
  const labTop = labBottom - labSize;
  const tick = Math.round(14 * (story ? 1.3 : 1));
  const hz = Math.round(labTop - tick * 2);
  return { logoTop, CR, rowTop, rowBottom, labSize, labTop, tick, hz };
}

/** Ground (above the line), the echo, the player melting into the line, the floor and the line itself. */
export function HorizonStage({ data, id, box, hz, H, deep, lift, echo, light, dx, dy, clipTop, fadeLen }: { data: RenderData; id: string; box: Box; hz: number; H: number; deep: string; lift: string; echo: string; light: [number, number]; dx: number; dy: number; clipTop: number; fadeLen: number }) {
  const fade = `linear-gradient(to bottom, #000 0, #000 ${hz - fadeLen - box.top}px, transparent ${hz - box.top}px)`;
  const floorTop = shade(deep, -0.25);
  const floorLow = shade(deep, -0.55);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${light[0]}% ${light[1]}%, ${lift}, ${deep} 80%)` }} />
      {/* A low, wide glow just over the line, brightest behind him. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: hz - 300, height: 300, background: `radial-gradient(60% 70% at ${light[0]}% 100%, rgba(255,255,255,.11), transparent 72%)` }} />
      {/* The echo, fading out with him towards the line. */}
      {data.photoUrl && (
        <SilhouetteFx
          id={id}
          url={data.photoUrl}
          box={{ ...box, left: box.left + dx, top: box.top + dy }}
          H={H}
          clipTop={clipTop}
          cut={data.cut}
          pad={16}
          mask={
            <>
              <defs>
                <linearGradient id={`${id}-hz`} gradientUnits="userSpaceOnUse" x1={0} y1={hz - fadeLen * 1.15} x2={0} y2={hz - fadeLen * 0.25}>
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <rect x={-20} y={-20} width={CANVAS_W + 40} height={H + 40} fill={`url(#${id}-hz)`} />
            </>
          }
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
          <feComponentTransfer in="s" result="a">
            <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
          </feComponentTransfer>
          <feMorphology in="a" operator="dilate" radius={2} result="d" />
          <feComposite in="d" in2="a" operator="out" result="ring" />
          <feGaussianBlur in="ring" stdDeviation={0.35} result="q" />
          <feFlood floodColor={echo} />
          <feComposite in2="q" operator="in" />
        </SilhouetteFx>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* The floor, under the line. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: hz, bottom: 0, background: `linear-gradient(to bottom, ${floorTop}, ${floorLow})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hz, height: 1, background: "rgba(255,255,255,.55)" }} />
    </>
  );
}

/** Room beside the figure on the free side (the cutout is trimmed to the player, so its box is his extent). */
export function freeBeside(box: Box, right: boolean) {
  return right ? box.left - M - 30 : CANVAS_W - M - 30 - (box.left + box.width);
}

/**
 * Make room for the title beside him at its preferred size: slide the figure (≤ 100px) towards his own side,
 * then, if still short, scale it down (≥ 0.84) about his face.
 */
export function clearFor<B extends Box>(box: B, kicker: string, right: boolean, pref: number, ts: number, face: number[]): B {
  const need = titleW(sentenceCase(kicker), pref * ts) * 0.985;
  let short = need - freeBeside(box, right);
  if (short <= 0) return box;
  const shift = Math.min(100, short);
  let b: B = { ...box, left: box.left + (right ? shift : -shift) };
  short -= shift;
  if (short > 0) {
    const fx = b.left + (face[0] + face[2] / 2) * b.width;
    const fy = b.top + face[1] * b.height;
    // The free-side edge moves by (edge distance from face) × (1 − f).
    const dist = right ? fx - b.left : b.left + b.width - fx;
    const f = Math.max(0.84, 1 - short / Math.max(1, dist));
    b = { ...b, left: fx - (fx - b.left) * f, top: fy - (fy - b.top) * f, width: b.width * f, height: b.height * f };
  }
  return b;
}

/** The title in medium Inter, sentence case, sitting on the line on the free side. */
export function horizonTitle(kicker: string, opts: { story: boolean; ts: number; hz: number; freeW: number; right: boolean; max: number }) {
  const title = sentenceCase(kicker);
  const size = Math.max(opts.max * 0.62, Math.min(opts.max * opts.ts, opts.freeW / Math.max(1, titleW(title, 1) * 0.985)));
  const gap = opts.story ? 24 : 18;
  // Inter's descent below the baseline is ~0.24em; the box bottom sits `gap` above the line.
  const top = opts.hz - gap - size * 0.97;
  const node: ReactNode = (
    <div style={{ position: "absolute", top, left: opts.right ? M : undefined, right: opts.right ? undefined : M, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: 1, letterSpacing: "-0.035em", whiteSpace: "nowrap", color: WHITE, marginLeft: opts.right ? -size * 0.04 : 0 }}>
      {title}
    </div>
  );
  return { node, size, top };
}

/** Labels hanging from ticks under the line, spread margin to margin (first left, last right). */
export function HangingLabels({ labels, hz, tick, size, first }: { labels: string[]; hz: number; tick: number; size: number; first?: boolean }) {
  const em = labels.reduce((a, l) => a + capsEm(l.toUpperCase(), LAB_TRACK), 0);
  const fit = Math.max(9, Math.min(size, (CANVAS_W - 2 * M - (labels.length - 1) * 40) / Math.max(1, em)));
  const label: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: fit, letterSpacing: `${LAB_TRACK}em`, textTransform: "uppercase", color: "rgba(255,255,255,.86)", whiteSpace: "nowrap", lineHeight: 1 };
  const one = labels.length === 1;
  return (
    <div style={{ position: "absolute", left: M, right: M, top: hz, display: "flex", justifyContent: one ? "center" : "space-between" }}>
      {labels.map((l, i) => {
        const align = one ? "center" : i === 0 ? "flex-start" : i === labels.length - 1 ? "flex-end" : "center";
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: align }}>
            <div style={{ width: 1, height: tick, background: "rgba(255,255,255,.55)" }} />
            <div style={{ ...label, marginTop: tick, marginRight: align === "flex-end" ? `-${LAB_TRACK}em` : 0, color: first && i === 0 ? WHITE : label.color, fontWeight: first && i === 0 ? 600 : 500 }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
}

/** The fixture centred (home first, names exactly as stored), a small crest either side of it. */
export function FixtureRow({ data, top, CR, k }: { data: RenderData; top: number; CR: number; k: number }) {
  const { content } = data;
  const f = matchFacts(data);
  const teams = teamsOf(data).map((t) => t.toUpperCase());
  const fixture = teams.length === 2 ? teams.join("   v   ") : (f.comp || "").toUpperCase();
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const gap = 22 * k;
  const TRACK = 0.28;
  const room = CANVAS_W - 2 * M - (crests.length ? 2 * (CR + gap) : 0);
  const size = Math.max(11, Math.min(17 * k, room / Math.max(1, capsEm(fixture, TRACK)))) * (data.params.textScale ?? 1);
  return (
    <div style={{ position: "absolute", left: M, right: M, top, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap }}>
      {crests[0] && <img src={crests[0]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
      {fixture && <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: `${TRACK}em`, paddingLeft: `${TRACK}em`, lineHeight: 1, whiteSpace: "nowrap", color: WHITE }}>{fixture}</div>}
      {crests[1] && <img src={crests[1]} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />}
    </div>
  );
}

export function HorizonLogo({ data, story, H }: { data: RenderData; story: boolean; H: number }) {
  const p = data.params;
  return <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 44) - (p.logoY ?? 0), transform: `translateX(-50%) scale(${p.logoScale ?? 1})`, transformOrigin: "center bottom" }} />;
}

/**
 * Echo horizon: echoline's player in natural colour with one hairline echo of his edge, on the deep club
 * ground — and horizon's single line across the canvas at his hips, where he melts into a darker floor.
 * "Matchday" sits on the line on the free side; date — kick-off — ground hang from ticks under it, and the
 * fixture (crests either side) runs centred below.
 */
export function Echohorizon({ data }: { data: RenderData }) {
  const { content } = data;
  const s = echoSetup(data, 11);
  const { story, k, H } = s;
  const f = matchFacts(data);
  const g = horizonGeometry(data, story, k);

  /* ---- the player, a little towards his side ---- */
  const fx = story ? (s.right ? 600 : 480) : s.right ? 600 : 480;
  const base = story ? placeByFace(data, fx, 340, { chest: 380, waist: 300, knees: 226, full: 170 }) : placeByFace(data, fx, 236, { chest: 280, waist: 224, knees: 168, full: 126 });
  const kicker = content.kicker || "MATCHDAY";
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const box = clearFor(base, kicker, s.right, story ? 84 : 64, s.ts, face);
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;

  /* ---- the title on the line, on the free side ---- */
  const t = horizonTitle(kicker, { story, ts: s.ts, hz: g.hz, freeW: freeBeside(box, s.right), right: s.right, max: story ? 84 : 64 });

  const labels = [niceDate(content.date), f.time, titleCase(f.venue)].filter(Boolean);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <HorizonStage
        data={data}
        id="echohorizon"
        box={box}
        hz={g.hz}
        H={H}
        deep={s.deep}
        lift={s.lift}
        echo={s.echo}
        light={[(fCx / CANVAS_W) * 100, story ? 34 : 36]}
        dx={(s.right ? -42 : 42) * k}
        dy={-34 * k}
        clipTop={0}
        fadeLen={story ? 320 : 240}
      />
      {t.node}
      {labels.length > 0 && <HangingLabels labels={labels} hz={g.hz} tick={g.tick} size={g.labSize} />}
      <FixtureRow data={data} top={g.rowTop} CR={g.CR} k={k} />
      <HorizonLogo data={data} story={story} H={H} />
      <Film strength={0.18} />
    </div>
  );
}
