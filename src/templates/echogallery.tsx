/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { DMSERIF, Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { sentenceCase, teamsOf } from "./notify";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { EchoFigure, echoSetup } from "./echotitle";

const PAPER = "#ece9e4";
const INK = "#24221f";
const M = 64;

/** DM Serif Display italic: advance widths per 100px (as in gallery.tsx). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const dmiEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0);
/** Inter, mixed case, roughly. */
const interEm = (t: string, w = 0.56) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? 0.7 : /[ilj'.]/.test(c) ? 0.26 : /[mw]/.test(c) ? 0.86 : w), 0);

/**
 * Echo gallery: echoline's player and hairline echo towards his side, and on the free side one small museum
 * label — an off-white card with the title in italic serif, a club-colour hairline, the fixture (home first,
 * names as stored), date, kick-off and ground in quiet Inter, and the agency mark under it on the same edge;
 * only the competition, in tiny caps, as a corner note at the top.
 */
export function Echogallery({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 29);
  const f = matchFacts(data);
  const k = s.story ? 1.32 : 1;

  /* ---- the player, towards his side; the echo leans away from the label ---- */
  const fx = s.story ? (s.right ? 710 : 370) : s.right ? 680 : 400;
  const box = s.story
    ? placeByFace(data, fx, 340, { chest: 380, waist: 300, knees: 226, full: 170 })
    : placeByFace(data, fx, 210, { chest: 290, waist: 228, knees: 170, full: 128 });

  /* ---- the label ---- */
  const CW = (s.story ? 420 : 330) * s.ts;
  const PAD = 30 * k;
  const inner = CW - PAD * 2;
  const title = sentenceCase(content.kicker || "Matchday");
  const tSize = Math.min(46 * k, inner / Math.max(1, dmiEm(title))) * s.ts;
  const [first, second] = teamsOf(data);
  const fit = (t: string, max: number, min: number, w?: number) => Math.max(min, Math.min(max * k, inner / Math.max(1, interEm(t, w)))) * s.ts;
  const date = niceDate(content.date);
  const when = [date, f.time].filter(Boolean).join("  ·  ");
  const venue = titleCase(f.venue || "");
  const comp = (f.comp || f.round || "").toUpperCase();
  const compSize = Math.max(11, Math.min(13 * k, CW / Math.max(1, capsEm(comp, 0.22)))) * s.ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const light: CSSProperties = { fontFamily: SANS, fontWeight: 300, color: INK, lineHeight: 1.35, whiteSpace: "nowrap" };

  /* ---- the agency mark under the label, same edge; the label ends 64px above it ---- */
  const logoH = s.story ? 88 : 52;
  const logoBottom = s.story ? s.H - STORY_BOTTOM : 56;
  const cardBottom = (s.story ? STORY_BOTTOM - logoH : CANVAS_H - logoBottom - logoH) - 64 + (params.textY ?? 0);
  const side: CSSProperties = s.right ? { left: M } : { right: M };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure data={data} s={s} box={box} id="echogallery" outward light={[s.right ? 58 : 42, 40]} />

      {/* The label: a small paper card, softly lifted off the wall. */}
      <div
        style={{
          position: "absolute",
          ...side,
          bottom: s.H - cardBottom,
          width: CW,
          padding: `${PAD}px ${PAD}px ${PAD * 1.05}px`,
          boxSizing: "border-box",
          background: PAPER,
          boxShadow: "0 18px 46px rgba(0,0,0,.38), 0 2px 6px rgba(0,0,0,.25)",
          color: INK,
        }}
      >
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 12 * k, alignItems: "center", height: 34 * k, marginBottom: 22 * k }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 32 * k, height: 32 * k, objectFit: "contain" }} />
            ))}
          </div>
        )}
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: tSize, lineHeight: 1.05, whiteSpace: "nowrap", letterSpacing: "-0.005em" }}>{title}</div>
        <div style={{ marginTop: 18 * k, width: 36 * k, height: 2, background: s.club }} />
        <div style={{ marginTop: 18 * k }}>
          {first && <div style={{ ...light, fontWeight: 500, fontSize: fit(first, 18, 13) }}>{first}</div>}
          {second && <div style={{ ...light, fontWeight: 500, fontSize: fit(`v ${second}`, 18, 13) }}>v {second}</div>}
        </div>
        <div style={{ marginTop: 10 * k }}>
          {when && <div style={{ ...light, fontSize: fit(when, 16, 12) }}>{when}</div>}
          {venue && <div style={{ ...light, fontSize: fit(venue, 16, 12) }}>{venue}</div>}
        </div>
      </div>

      {/* The competition, a gallery corner note at the top of the free side. */}
      {comp && (
        <div style={{ position: "absolute", ...side, top: (s.story ? STORY_TOP : M) + (params.textY ?? 0), maxWidth: CW, textAlign: s.right ? "left" : "right", fontFamily: SANS, fontWeight: 500, fontSize: compSize, letterSpacing: "0.22em", ...(s.right ? {} : { marginRight: "-0.22em" }), lineHeight: 1.5, color: "rgba(255,255,255,.62)" }}>{comp}</div>
      )}

      <AgencyLogo
        data={data}
        height={s.story ? 26 : 18}
        style={{ position: "absolute", ...side, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: s.right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
