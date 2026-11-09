/* eslint-disable @next/next/no-img-element */
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace, type NatPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Tracking of the arc word (em). */
const ARC_TRACK = 0.3;

/**
 * The halo of type: the word on a gentle arc of a circle centred under his head, the middle of its baseline
 * ≥ 0.24 face-heights above his hair (hair top ≈ fy − 0.75·fs). Returns the circle (cx, cy, R), the word's
 * size and the top of its letters. The arc stays inside the canvas: the word shrinks before it would cross
 * a side margin.
 */
export function arcGeom(place: NatPlace, word: string, base: number, M: number, at?: { cx: number; bottom: number }) {
  const em = capsEm(word, ARC_TRACK);
  const cx = at ? at.cx : Math.min(Math.max(place.fx, M + 140), CANVAS_W - M - 140);
  // Width of the arc's chord ≈ 0.97 × its length: fit it between the side margins around cx.
  const room = 2 * Math.min(cx - M, CANVAS_W - M - cx);
  const size = Math.min(base, room / (em * 0.97));
  const len = em * size;
  // Gentle: the word spans ≤ ~26° of its circle (never a tight rainbow for a short word).
  const R = Math.max(len / 0.45, place.fs * 3.4);
  // Baseline at the top of the arc: over his hair — or (`at`) with the arc's ends resting at `at.bottom`.
  const drop = R * (1 - Math.cos(len / (2 * R)));
  const base0 = at ? at.bottom - drop : place.fy - place.fs * 0.75 - place.fs * 0.24;
  const cy = base0 + R;
  const capTop = base0 - size * 0.74;
  return { cx, cy, R, size, len, base0, capTop };
}

/**
 * natPlace + arcGeom together: when the photo's cover framing lifts his face so high that the halo would
 * leave the canvas (or crowd the logo at the top), ask for a closer framing (≤ 2×) — the deeper zoom lets
 * his face sit lower. `minTop` = where the letters may start with the logo at the top; failing that, the
 * halo only has to stay ≥ `floor` from the top edge (the logo then moves to the foot). No framing gives him
 * that headroom (his head at the very top of the original): `halo` is false and the look sets the arc over
 * its foot instead, on the plain framing.
 */
export function arcPlace(data: RenderData, H: number, want: { fx: number; fy: number; fs: number }, word: string, base: number, M: number, minTop: number, floor: number) {
  const tries = [1, 1.15, 1.3, 1.5, 1.75, 2].map((s) => {
    const place = natPlace(data, CANVAS_W, H, { ...want, fs: want.fs * s });
    return { place, arc: arcGeom(place, word, base, M) };
  });
  const t = tries.find((t) => t.arc.capTop >= minTop) ?? tries.find((t) => t.arc.capTop >= floor);
  return t ? { ...t, halo: true } : { ...tries[0], halo: false };
}

/** The word along the top of the circle (cx, cy, R), centred, white with the natural looks' double shadow. */
export function ArcWord({ id, word, cx, cy, R, size, H, weight = 600 }: { id: string; word: string; cx: number; cy: number; R: number; size: number; H: number; weight?: number }) {
  // A long arc (±80°) so the path's length is known; the word sits centred on its top.
  const a = (80 * Math.PI) / 180;
  const x0 = cx - R * Math.sin(a);
  const x1 = cx + R * Math.sin(a);
  const y = cy - R * Math.cos(a);
  const L = 2 * a * R;
  // letter-spacing adds a trailing gap after the last letter: shift the anchor by half of it.
  const off = L / 2 + (ARC_TRACK * size) / 2;
  return (
    <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden>
      <defs>
        <path id={`${id}-p`} d={`M ${x0} ${y} A ${R} ${R} 0 0 1 ${x1} ${y}`} />
        <filter id={`${id}-sh`} x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
          <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
        </filter>
      </defs>
      <text filter={`url(#${id}-sh)`} style={{ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${ARC_TRACK}em`, fill: "#ffffff" }}>
        <textPath href={`#${id}-p`} startOffset={off} textAnchor="middle">
          {word}
        </textPath>
      </text>
    </svg>
  );
}

/**
 * Natural · arc (matchday): his own match photo full-bleed and almost untouched; "MATCHDAY" in medium caps on
 * a gentle arc centred over his head, like a halo of type, clear of his hair. At the foot, on a soft local
 * shade, the fixture: crests either side of HOME v AWAY (exact names), then date · kick-off · venue. The
 * NEYOD logo alone at the top (at the foot of the story / under the fixture if the halo needs the top).
 */
export function Natarc({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 64 : 56;

  /* ---- the photo and the halo over his head ---- */
  const lh = story ? 88 : 52;
  const logoTop0 = story ? STORY_TOP : 46;
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const want = { fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540, fy: story ? 680 : 540, fs: story ? 236 : 160 };
  const base = (story ? 84 : 62) * ts;
  const fit = arcPlace(data, H, want, word, base, M, logoTop0 + lh + 60, story ? STORY_TOP : 60);
  const { place, halo } = fit;
  const dy = params.textY ?? 0;

  /* ---- the logo: top centre if the halo (or, without one, his head) leaves it its clear space ---- */
  const logoUp = halo ? fit.arc.capTop + dy - (logoTop0 + lh) >= 56 : place.fy - place.fs * 0.8 - (logoTop0 + lh) >= 40;
  const bottomY = story ? STORY_BOTTOM : CANVAS_H - 50;

  /* ---- the foot, bottom-up ---- */
  const fx_ = natFixture(data);
  const footBottom = (logoUp ? bottomY : bottomY - lh - Math.round(56 * k)) - dy;
  const lineSize = Math.min(15 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(fx_.line, 0.24)));
  const lineTop = footBottom - lineSize;
  const crest = Math.round(44 * k);
  const fixture = `${fx_.homeName.toUpperCase()} v ${fx_.awayName.toUpperCase()}`;
  const fixSize = Math.min(20 * k * ts, (CANVAS_W - 120 - 2 * (crest + 20 * k)) / Math.max(1, capsEm(fixture, 0.1)));
  const rowTop = lineTop - (fx_.line ? 20 * k : 0) - crest;
  // No headroom for the halo: the arc closes over the fixture instead, centred, like a crest's arched title.
  const arc = halo ? fit.arc : arcGeom(place, word, base, M, { cx: CANVAS_W / 2, bottom: rowTop - Math.round(40 * k) });
  const shadeTop = (halo ? rowTop : arc.capTop) - (story ? 300 : 230);
  const logoTop = (logoUp ? logoTop0 : bottomY - lh) - (params.logoY ?? 0);

  const crestImg = (url: string | null) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* Soft, edgeless shades: a breath over the top (logo + halo), a local one at the foot for the fixture. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: halo ? Math.max(arc.base0 + dy + 60, logoTop + 200) : logoTop + 200, background: "linear-gradient(to bottom, rgba(0,0,0,.26), rgba(0,0,0,.1) 60%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.4) 40%, rgba(6,10,6,.64) 75%, rgba(6,10,6,.68))" }} />

      <div style={{ position: "absolute", left: 0, top: dy, width: CANVAS_W, height: H }}>
        <ArcWord id="na" word={word} cx={arc.cx} cy={arc.cy} R={arc.R} size={arc.size} H={H} />
      </div>

      {/* The fixture foot. */}
      <div style={{ position: "absolute", left: 50, right: 50, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k }}>
        {crestImg(fx_.homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: "0 1px 10px rgba(0,0,0,.45)" }}>
          {fx_.homeName.toUpperCase()}
          <span style={{ fontWeight: 400, opacity: 0.75, margin: "0 0.5em" }}>v</span>
          {fx_.awayName.toUpperCase()}
        </div>
        {crestImg(fx_.awayCrest)}
      </div>
      {fx_.line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.24em", paddingLeft: "0.24em", whiteSpace: "nowrap", opacity: 0.9, textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
          {fx_.line}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: logoUp ? "center top" : "center bottom" }}
      />
    </div>
  );
}
