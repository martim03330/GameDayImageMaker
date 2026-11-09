/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { FACES, wordEm } from "./goalhero";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** The word split in two around his head: at a space, "MATCHDAY" → MATCH | DAY, otherwise in the middle ("GO" | "AL"). */
export function flankSplit(word: string): [string, string] {
  const w = word.replace(/’/g, "'").trim().toUpperCase();
  const sp = w.indexOf(" ");
  if (sp > 0) return [w.slice(0, sp), w.slice(sp + 1).trim()];
  if (w === "MATCHDAY") return ["MATCH", "DAY"];
  const mid = Math.ceil(w.length / 2);
  return [w.slice(0, mid), w.slice(mid)];
}

const SMALL_SHADOW = "0 0 2px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.5)";

/**
 * The shared frame of the natural "flank" looks: his photo full-bleed (real grass, stands, light), and the
 * word split in two around his head — the first half left of it, the second right of it — big Anton caps
 * centred on his eye / forehead line, both halves set BEHIND the sharp cutout so his head sits in the gap
 * between them. The halves keep at least a quarter face-width (here half a face-width, for his hair and ears) clear of his face. His face is
 * placed so the two halves share the width in proportion to their length; when the photo cannot place him
 * there (head near an edge) both halves shrink equally down to 60%, below that the whole word goes above his
 * head instead (still behind him). The NEYOD logo alone at the top centre; the `foot` small at the bottom
 * over a soft local shade (never type straight on a white kit).
 */
export function NatFlankFrame({ data, word, foot }: { data: RenderData; word: string; foot: (o: { story: boolean; k: number; bottom: number }) => { node: ReactNode; height: number } }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.34 : 1;
  const W = CANVAS_W;
  const M = story ? 54 : 48;
  const face = FACES.anton;
  const [left, right] = flankSplit(word);
  const emL = wordEm(face, left);
  const emR = wordEm(face, right);
  const maxSize = (story ? 270 : 240) * ts;

  /* ---- where his face should be: the halves share the width in proportion to their length ---- */
  const fs0 = story ? 184 : 146;
  const faceW0 = fs0 * 0.78;
  const gap0 = faceW0 * 0.5;
  const ideal0 = Math.min(maxSize, (W - 2 * M - 2 * gap0 - faceW0) / Math.max(0.5, emL + emR));
  const fxWant = params.side === "left" ? 430 : params.side === "right" ? 650 : Math.round(Math.min(720, Math.max(360, M + emL * ideal0 + gap0 + faceW0 / 2)));
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  // His eye line low enough that the word's caps clear the logo's space.
  const fyWant = Math.max(story ? 820 : 590, logoTop + logoH + 70 + (ideal0 * face.cap) / 2 + fs0 * 0.22);
  const place = natPlace(data, W, H, { fx: fxWant, fy: fyWant, fs: fs0 });

  /* ---- the halves, fitted to where his face really is ---- */
  const faceW = place.faceW || place.fs * 0.78;
  // From his face's edge: his hair and ears stand out past it, the letters must stay clear of them too.
  const gap = Math.max(faceW * 0.5, 30);
  const ideal = Math.min(maxSize, (W - 2 * M - 2 * gap - faceW) / Math.max(0.5, emL + emR));
  const roomL = place.fx - faceW / 2 - gap - M;
  const roomR = W - M - (place.fx + faceW / 2 + gap);
  const fit = Math.min(maxSize, roomL / Math.max(0.3, emL), roomR / Math.max(0.3, emR));
  const flank = !!right && fit >= ideal * 0.6;

  const lineCentre = place.fy - place.fs * 0.22 + (params.textY ?? 0);
  const minBase = logoTop + logoH + 50;
  const whole = `${left}${right}`;
  const emW = wordEm(face, whole);
  const hairTop = place.fy - place.fs * 0.8;
  const aboveSize = Math.min((W - 2 * M) / Math.max(0.5, emW), (story ? 300 : 250) / face.cap) * ts;
  // Fallbacks: the whole word above his head when the photo has headroom, else the whole word on the wider
  // side of his head at the same eye line (still behind him, still clear of his face).
  const roomSide = Math.max(roomL, roomR);
  const sideSize = Math.min(maxSize, roomSide / Math.max(0.5, emW));
  const mode: "flank" | "above" | "side" = flank ? "flank" : hairTop - 30 - minBase >= aboveSize * face.cap * 0.8 || sideSize < ideal * 0.6 ? "above" : "side";
  let size: number;
  let baseline: number;
  if (mode === "flank" || mode === "side") {
    size = mode === "flank" ? fit : sideSize;
    baseline = Math.max(lineCentre + (size * face.cap) / 2, minBase + size * face.cap);
  } else {
    size = aboveSize;
    baseline = Math.max(Math.min(hairTop - 30, hairTop + size * face.cap * 0.3), minBase + size * face.cap) + (params.textY ?? 0);
  }

  const f = foot({ story, k, bottom: story ? STORY_BOTTOM : CANVAS_H - 50 });
  const footTop = (story ? STORY_BOTTOM : CANVAS_H - 50) - f.height;
  const id = story ? "nf-soft-s" : "nf-soft";

  const text = (t: string, x: number, anchor: "start" | "middle" | "end") => (
    <text x={x} y={size} textAnchor={anchor} filter={`url(#${id})`} style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: "#ffffff" }}>
      {t}
    </text>
  );

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={W} H={H} />

      {/* The two halves, behind him. */}
      <svg width={W} height={size * 1.2} style={{ position: "absolute", left: 0, top: baseline - size, overflow: "visible" }} aria-hidden>
        <defs>
          <filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-size} width={W + 400} height={size * 3}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" result="tight" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        {mode === "flank" ? (
          <>
            {text(left, place.fx - faceW / 2 - gap, "end")}
            {text(right, place.fx + faceW / 2 + gap, "start")}
          </>
        ) : mode === "side" ? (
          roomL >= roomR ? text(whole, place.fx - faceW / 2 - gap, "end") : text(whole, place.fx + faceW / 2 + gap, "start")
        ) : (
          text(whole, W / 2, "middle")
        )}
      </svg>

      {/* He steps in front: the sharp cutout exactly over his figure in the photo. */}
      <NatFigure data={data} place={place} W={W} H={H} />

      {/* Soft local shades: the top for the logo, the foot for the small type. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + logoH + (story ? 200 : 140), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 300 : 230), bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.42) 40%, rgba(6,10,6,.7) 75%, rgba(6,10,6,.74))" }} />

      {f.node}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}

export { SMALL_SHADOW as FLANK_SHADOW };

/**
 * Natural · flank (matchday): his own match photo full-bleed and "MATCH" | "DAY" split around his head, big
 * caps at his eye line, behind him. At the foot, small: crests either side of HOME v AWAY (exact names, home
 * first), then date · kick-off · venue. The NEYOD logo alone at the top.
 */
export function Natflank({ data }: { data: RenderData }) {
  const ts = data.params.textScale ?? 1;
  const fx_ = natFixture(data);
  return (
    <NatFlankFrame
      data={data}
      word={data.content.kicker || "MATCHDAY"}
      foot={({ k, bottom }) => {
        const lineSize = Math.min(18 * k * ts, (CANVAS_W - 120) / Math.max(1, capsEm(fx_.line, 0.2)));
        const lineTop = bottom - lineSize;
        const crest = Math.round(46 * k);
        const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
        const fixSize = Math.min(23 * k * ts, (CANVAS_W - 110 - 2 * (crest + 18 * k)) / Math.max(1, capsEm(fixture, 0.1)));
        const rowTop = lineTop - (fx_.line ? 20 * k : 0) - crest;
        const crestImg = (url: string | null) =>
          url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;
        return {
          height: bottom - rowTop,
          node: (
            <>
              <div style={{ position: "absolute", left: 40, right: 40, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
                {crestImg(fx_.homeCrest)}
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: SMALL_SHADOW }}>
                  {fx_.homeName.toUpperCase()}
                  <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
                  {fx_.awayName.toUpperCase()}
                </div>
                {crestImg(fx_.awayCrest)}
              </div>
              {fx_.line && (
                <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.2em", paddingLeft: "0.2em", whiteSpace: "nowrap", opacity: 0.92, textShadow: SMALL_SHADOW }}>
                  {fx_.line}
                </div>
              )}
            </>
          ),
        };
      }}
    />
  );
}
