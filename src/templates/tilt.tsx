/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { hueOf, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { competitionOf, crestsOf, OwnPhotoBlur, placeByFace, roundOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const TIGHT = "0 2px 10px rgba(0,0,0,.55)";
/** Anton: cap height and where the caps start inside a line box of line-height 1 (relative to the font size). */
const CAP = 0.86;
const CAP_TOP = 0.065;
/** How much the letters are stretched upwards: the tall condensed poster letter. */
const TALL = 1.5;

/** Rain: thin vertical streaks, sparse, over the whole night scene. */
const RAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='0.75 0.011' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 5 -3.1'/></filter><rect width='100%' height='100%' filter='url(#r)'/></svg>`,
)}")`;
/** Fine speckle (drops caught by the floodlights). */
const SPECK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' seed='11' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -6.4'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;

/** Single words that read better broken in two when stacked. */
const COMPOUNDS: [RegExp, number][] = [
  [/^(MATCH|GAME)DAY$/, 5],
  [/^FULLTIME$/, 4],
];

/** The kicker as two stacked lines ("MATCH" / "DAY", "MAN OF" / "THE MATCH"); short words get the surname below. */
function titleLines(data: RenderData): string[] {
  const k = data.content.kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").trim();
  const words = k.split(/\s+/).filter(Boolean);
  const joined = words.join("");
  const c = COMPOUNDS.find(([re]) => re.test(joined));
  if (c) return [joined.slice(0, c[1]), joined.slice(c[1])];
  if (words.length === 1) {
    return [joined];
  }
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Anton advance of a line, relative to the font size (tracking included). */
const widthOf = (t: string, track: number) => em(t, ANTON, 47) + track * [...t].length;

/** A hand-drawn loop around a label: two slightly different strokes, like a marker circle on a print. */
function HandCircle({ w, h, color, seed }: { w: number; h: number; color: string; seed: number }) {
  const r = rng(seed);
  const loop = (k: number) => {
    const j = () => (r() - 0.5) * 8;
    const rx = w / 2 + k;
    const ry = h / 2 + k * 0.4;
    const cx = w / 2 + 14;
    const cy = h / 2 + 10;
    return `M ${cx - rx + 18 + j()} ${cy - ry + 4 + j()} C ${cx - rx * 0.2} ${cy - ry - 10 + j()}, ${cx + rx} ${cy - ry + j()}, ${cx + rx + j()} ${cy + j()} S ${cx + rx * 0.2} ${cy + ry + 8 + j()}, ${cx - rx * 0.4} ${cy + ry + j()} S ${cx - rx - 6} ${cy + 4 + j()}, ${cx - rx + 26 + j()} ${cy - ry - 2 + j()}`;
  };
  return (
    <svg width={w + 28} height={h + 20} style={{ position: "absolute", left: -14, top: -10, overflow: "visible", transform: `rotate(${-3 + r() * 2}deg)` }}>
      <path d={loop(0)} fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      <path d={loop(6)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
}

/**
 * Night-match poster (Man City "MATCH DAY"): a rainy stadium at night with a strip of floodlit pitch, the
 * kicker in giant tall condensed white letters, tilted as if pinned at an angle, and the player running
 * in front of it with one letter back in front of him for depth. Small furniture on top (arrow, plus,
 * crest), and at the foot the crests in corner brackets, the kick-off circled by hand, the date and the
 * ground's coordinates.
 */
export function Tilt({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 34);
  const flip = params.side === "left";
  const sgn = flip ? -1 : 1;
  const club = params.primary === "#10131c" ? params.accent : params.primary;
  // The hand-drawn circle and the "+" in the club colour; black / white clubs get an icy floodlight blue.
  const ink = hueOf(club) == null ? (hueOf(params.accent) == null ? "#9fd8ff" : shade(vivid(params.accent), 0.2)) : shade(vivid(club), 0.2);
  const scene = data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? null;
  // Native Instagram story (1080×1920): taller letters and a bigger player fill the height; furniture
  // and foot stay out of the zones the app covers (profile bar on top, message box at the foot).
  const H = data.canvasH ?? CANVAS_H;
  const story = H > CANVAS_H;
  const tall = story ? 1.75 : TALL;
  const top0 = story ? 230 : 0;
  const pitchTop = story ? 1330 : 1040;

  // ---- the title ----
  const lines = titleLines(data);
  const track = -0.01;
  const theta = (7 + r() * 4) * sgn;
  const rad = (theta * Math.PI) / 180;
  const widest = Math.max(...lines.map((l) => widthOf(l, track)));
  const S = Math.min(330, (800 / widest) * (params.textScale ?? 1));
  const pitchPre = 0.93 * S; // line pitch before the vertical stretch
  const P = pitchPre * tall;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // Unflipped geometry, lines left-aligned at the container's origin, rotated about it.
  const ws = lines.map((l) => widthOf(l, track) * S);
  const xs = lines.map((_, i) => -i * P * Math.abs(sin));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs.map((x, i) => x + ws[i] * cos));
  const blockH = lines.length * P * cos + ws[0] * Math.abs(sin);
  const X0 = 540 - (minX + maxX) / 2 - 10;
  const Y0 = story ? Math.max(330, 900 - blockH / 2) : Math.max(130, 560 - blockH / 2 - 20);
  const titleBottom = Y0 + blockH;

  // ---- the player: running across the title, feet on the pitch ----
  const cx = 560 + sgn * (30 + r() * 30);
  const capH = CAP * S * tall;
  // A single word is read whole above his head; stacked lines let his head cross the first one.
  const feetFig = standing(data, { cx, headTop: lines.length > 1 ? Math.max(230, Y0 + 90) : Y0 + blockH * 0.62, floor: pitchTop + 100, maxFace: 230 });
  // A photo cut above the feet: placed by the face instead, the body running off the bottom edge.
  const fig = feetFig.feet
    ? feetFig
    : (() => {
        // A closer crop is a bigger body: his head only crosses the lower half of the last line.
        const b = placeByFace(data, cx, Math.min(620 + top0, Math.max(300 + top0, titleBottom - capH * 0.45)), { chest: 220, waist: 190, knees: 160, full: 160 });
        const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
        return { ...b, feet: false, faceCx: b.left + (f[0] + f[2] / 2) * b.width, faceTop: b.top + f[1] * b.height, faceH: b.faceH };
      })();

  // One letter comes back in front of him: on the last line, near his body, well away from his face.
  const face = { x0: fig.faceCx - fig.faceH * 1.1, x1: fig.faceCx + fig.faceH * 1.1, y0: fig.faceTop - fig.faceH * 0.9, y1: fig.faceTop + fig.faceH * 1.5 };
  const boxes = lines.flatMap((line, li) => {
    const letters = [...line];
    return letters.map((ch, j) => {
      const lw = ((ANTON[ch] ?? 47) / 100) * S;
      const fromLeft = em(letters.slice(0, j).join(""), ANTON, 47) * S + track * S * j;
      // Flipped, the lines are right-aligned and mirrored: measure the letter from the line's right end.
      const lx = flip ? ws[li] - fromLeft - lw : fromLeft;
      const ly = li * P + CAP_TOP * S * tall;
      const corners = [
        [lx, ly],
        [lx + lw, ly],
        [lx, ly + CAP * S * tall],
        [lx + lw, ly + CAP * S * tall],
      ].map(([x, y]) => {
        const X = X0 + x * cos - y * Math.abs(sin);
        const Y = Y0 + x * Math.abs(sin) + y * cos;
        return [flip ? CANVAS_W - X : X, Y];
      });
      const bx = corners.map((c) => c[0]);
      const by = corners.map((c) => c[1]);
      return { li, j, ch, x0: Math.min(...bx), x1: Math.max(...bx), y0: Math.min(...by), y1: Math.max(...by) };
    });
  });
  // His torso and legs: a column about his face, from the shoulders down to the feet.
  const torso = { x0: fig.faceCx - fig.faceH * 1.6, x1: fig.faceCx + fig.faceH * 1.6, y0: fig.faceTop + fig.faceH * 1.6, y1: fig.top + fig.height * 0.92 };
  const overlap = (b: { x0: number; x1: number; y0: number; y1: number }) =>
    Math.max(0, Math.min(b.x1, torso.x1) - Math.max(b.x0, torso.x0)) * Math.max(0, Math.min(b.y1, torso.y1) - Math.max(b.y0, torso.y0));
  const candidates = boxes.filter((b) => b.ch !== " " && !(b.x1 > face.x0 && b.x0 < face.x1 && b.y1 > face.y0 && b.y0 < face.y1) && overlap(b) > 0);
  // The letter crossing the most of his body, so the depth reads.
  const pick = candidates.length ? candidates.reduce((a, c) => (overlap(c) > overlap(a) ? c : a)) : null;
  const front = pick ? { li: pick.li, j: pick.j } : null;

  const title = (only: { li: number; j: number } | null) => (
    <div
      style={{
        position: "absolute",
        top: Y0,
        [flip ? "right" : "left"]: X0,
        width: 0,
        height: 0,
        transformOrigin: flip ? "100% 0" : "0 0",
        transform: `rotate(${theta}deg) scaleY(${tall})`,
      }}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i * pitchPre,
            [flip ? "right" : "left"]: 0,
            fontFamily: DISPLAY,
            fontSize: S,
            lineHeight: 1,
            letterSpacing: `${track}em`,
            whiteSpace: "nowrap",
            color: only == null ? WHITE : "transparent",
            textShadow: only == null ? "0 0 40px rgba(0,0,0,.25)" : undefined,
          }}
        >
          {only == null ? l : i === only.li ? [...l].map((ch, j) => <span key={j} style={{ color: j === only.j ? WHITE : "transparent" }}>{ch}</span>) : l}
        </div>
      ))}
    </div>
  );

  // ---- the foot ----
  const crests = crestsOf(data);
  const comp = competitionOf(data);
  const round = roundOf(data).split("·").slice(1).join("·").trim();
  const score = scoreOf(data, "-");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const circled = postType === "matchday" ? (content.time ? `KO → ${content.time}` : "") : score ? `FT → ${score}` : "";
  const left = postType === "matchday" ? (content.date ?? "").toUpperCase() || name : name;
  const right = (data.club?.coords ?? content.venue ?? data.club?.stadium ?? "").toUpperCase();
  const tiny: CSSProperties = { fontFamily: CONDENSED, fontWeight: 600, fontSize: 21, letterSpacing: "0.16em", color: WHITE, textShadow: TIGHT, whiteSpace: "nowrap" };
  const fitTiny = (t: string, w: number) => Math.min(21, w / Math.max(1, [...t].length * 0.62));
  const midText = [comp || round].filter(Boolean);
  const crestEl = (src: string, k: number) => <img key={k} src={src} alt="" style={{ width: 58, height: 58, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.45))" }} />;
  let crestRow: ReactNode = null;
  if (crests.length || midText.length) {
    const inner = (
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 26px" }}>
        {crests[0] && crestEl(crests[0], 0)}
        {midText.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, maxWidth: 190 }}>
            {midText.map((t, i) => (
              <div key={i} style={{ ...tiny, fontSize: 15, lineHeight: 1.25, fontWeight: 800, letterSpacing: "0.14em", whiteSpace: "normal", textAlign: "center", width: 170 }}>
                {t}
              </div>
            ))}
          </div>
        )}
        {crests[1] && crestEl(crests[1], 1)}
      </div>
    );
    crestRow = inner;
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#0b0f16", color: WHITE }}>
      {/* The ground at night, out of focus. */}
      {scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -40, top: -40, width: CANVAS_W + 80, height: H + 80, maxWidth: "none", objectFit: "cover", filter: "blur(9px) saturate(.85) brightness(.62) contrast(1.08)" }} />
      ) : (
        <OwnPhotoBlur data={data} blur={40} style={{ filter: "blur(40px) saturate(.9) brightness(.6)" }} />
      )}
      {/* Cold night grade + floodlight haze high up. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(6,12,24,.55), rgba(6,12,24,.15) 40%, rgba(6,12,24,.35) 70%, rgba(0,0,0,.2))" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 30% at 70% 8%, rgba(190,215,255,.16), transparent 70%)", mixBlendMode: "screen" }} />
      {/* Floodlit pitch along the bottom, soft at its far edge. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          left: -60,
          right: -60,
          top: pitchTop,
          bottom: -20,
          background: "linear-gradient(to bottom, #2c6b2e, #3f8d38 35%, #3a8534 70%, #2f7030)",
          transform: `rotate(${-1.5 * sgn}deg)`,
          filter: "blur(2px)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 70px)",
          maskImage: "linear-gradient(to bottom, transparent, #000 70px)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(100deg, rgba(255,255,255,.05) 0 120px, rgba(0,0,0,.06) 120px 240px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 50% 0%, rgba(255,255,255,.14), transparent 70%)" }} />
      </div>
      {/* Advertising-board glow where the stands meet the pitch. */}
      <div data-bleed style={{ position: "absolute", left: -40, right: -40, top: pitchTop - 35, height: 34, background: `linear-gradient(90deg, transparent, ${shade(ink, -0.3)}55 20%, #ffffff30 50%, ${shade(ink, -0.3)}55 80%, transparent)`, filter: "blur(10px)", transform: `rotate(${-1.5 * sgn}deg)` }} />

      {title(null)}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.45))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.05) brightness(.97)", ...cutMask(data.cut) }} />
        </div>
      )}
      {front && title(front)}

      {/* The foot darkens over him too, so the small print reads on any kit. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 76%, rgba(0,0,0,.5) 92%, rgba(0,0,0,.62))", pointerEvents: "none" }} />
      {/* Rain in the floodlights. */}
      <div data-bleed style={{ position: "absolute", left: -200, top: -200, width: CANVAS_W + 400, height: H + 400, backgroundImage: RAIN, opacity: 0.1, transform: `rotate(${6 * sgn}deg)`, mixBlendMode: "screen", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: SPECK, opacity: 0.28, mixBlendMode: "screen", pointerEvents: "none" }} />

      {/* Top furniture: arrow, plus, crest. */}
      <svg width={46} height={46} viewBox="0 0 46 46" style={{ position: "absolute", top: 50 + top0, [flip ? "right" : "left"]: 62, transform: flip ? "scaleX(-1)" : undefined }}>
        <path d="M6 6 L38 38 M38 12 L38 38 L12 38" fill="none" stroke={WHITE} strokeWidth={7} strokeLinecap="square" />
      </svg>
      <AgencyLogo data={data} height={20} style={{ position: "absolute", top: 62 + top0, [flip ? "right" : "left"]: 128, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 540 - 14, top: 44 + top0, width: 28, height: 28 }}>
        <div style={{ position: "absolute", left: 13, top: 0, width: 2, height: 28, background: ink }} />
        <div style={{ position: "absolute", left: 0, top: 13, width: 28, height: 2, background: ink }} />
      </div>
      {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ position: "absolute", top: 40 + top0, [flip ? "left" : "right"]: 58, width: 66, height: 66, objectFit: "contain", filter: "drop-shadow(0 3px 10px rgba(0,0,0,.5))" }} />}

      {/* Foot: crests in brackets, the circled kick-off, date and coordinates. */}
      {crestRow && (
        <div style={{ position: "absolute", left: 0, right: 0, top: story ? Math.min(1540, Math.max(titleBottom + 20, 1520)) : Math.min(1165, Math.max(titleBottom + 20, 1158)), display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            {crestRow}
            <BracketsFit />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: story ? 230 : 46, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ ...tiny, fontSize: fitTiny(left, 300), width: 300, overflow: "visible" }}>{left}</div>
        {circled ? (
          <div style={{ position: "relative", padding: "6px 22px" }}>
            <div style={{ ...tiny, fontSize: 21, letterSpacing: "0.14em" }}>{circled}</div>
            <HandCircleFit color={ink} seed={(params.seed ?? 3) + 7} text={circled} />
          </div>
        ) : (
          <div />
        )}
        <div style={{ ...tiny, fontSize: fitTiny(right, 300), width: 300, textAlign: "right" }}>{right}</div>
      </div>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 82%, rgba(0,0,0,.35))", pointerEvents: "none" }} />
      <Film strength={1.1} />
    </div>
  );
}

/** Brackets sized to their parent (drawn with percentages). */
function BracketsFit() {
  const a = 16;
  const s: CSSProperties = { position: "absolute", width: a, height: a, borderColor: "rgba(255,255,255,.9)", borderStyle: "solid", borderWidth: 0 };
  return (
    <>
      <div style={{ ...s, left: 0, top: 0, borderLeftWidth: 2, borderTopWidth: 2 }} />
      <div style={{ ...s, right: 0, top: 0, borderRightWidth: 2, borderTopWidth: 2 }} />
      <div style={{ ...s, left: 0, bottom: 0, borderLeftWidth: 2, borderBottomWidth: 2 }} />
      <div style={{ ...s, right: 0, bottom: 0, borderRightWidth: 2, borderBottomWidth: 2 }} />
    </>
  );
}

/** The hand-drawn loop, sized from the label's length. */
function HandCircleFit({ color, seed, text }: { color: string; seed: number; text: string }) {
  const w = [...text].length * 21 * 0.62 + 44;
  return (
    <div style={{ position: "absolute", left: 0, top: -2 }}>
      <HandCircle w={w} h={40} color={color} seed={seed} />
    </div>
  );
}

