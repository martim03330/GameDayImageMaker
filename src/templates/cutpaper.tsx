/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { lift } from "./column";
import { Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CrumpledPaper, matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, INTER, interEm, MonoDefs } from "./wall";

const WHITE = "#ffffff";
const BORDER = "#f3f1ec";

/** The poster colour: the club's, saturated and a touch deep; white clubs get a charcoal sheet. */
function sheetOf(data: RenderData): string {
  const c = clubColour(data);
  const l = luminance(c);
  if (hueOf(c) === null) return l > 0.35 ? "#1d1d20" : c;
  return l > 0.3 ? shade(c, -Math.min(0.55, 0.18 + (l - 0.3) * 0.9)) : c;
}

/** The rough white margin of the print: a torn inner edge, displaced so it never looks ruled. */
function RoughBorder({ seed }: { seed: number }) {
  const r = rng(seed * 13 + 3);
  const inset = 26;
  const pts: string[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 18);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const j = (r() - 0.5) * 7 + (r() < 0.06 ? (r() - 0.3) * 16 : 0);
      const nx = y1 === y0 ? 0 : 1;
      const ny = y1 === y0 ? 1 : 0;
      pts.push(`${(x0 + (x1 - x0) * t + nx * j).toFixed(1)},${(y0 + (y1 - y0) * t + ny * j).toFixed(1)}`);
    }
  };
  edge(inset, inset, CANVAS_W - inset, inset);
  edge(CANVAS_W - inset, inset, CANVAS_W - inset, CANVAS_H - inset);
  edge(CANVAS_W - inset, CANVAS_H - inset, inset, CANVAS_H - inset);
  edge(inset, CANVAS_H - inset, inset, inset);
  return (
    <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="cutpaper-rough" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves={3} seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="cutpaper-borderfibre" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={seed + 4} />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.53  0 0 0 0 0.5  0 0 0 0.35 -0.08" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <path d={`M-20 -20H${CANVAS_W + 20}V${CANVAS_H + 20}H-20Z M${pts.join(" L")}Z`} fillRule="evenodd" fill={BORDER} filter="url(#cutpaper-rough)" />
      <path d={`M-20 -20H${CANVAS_W + 20}V${CANVAS_H + 20}H-20Z M${pts.join(" L")}Z`} fillRule="evenodd" fill={BORDER} filter="url(#cutpaper-borderfibre)" />
    </svg>
  );
}

/** Worn print on the colour: long diagonal scuffs and creases, speckles and a faint screen of dots. */
function Wear({ seed }: { seed: number }) {
  const r = rng(seed * 5 + 11);
  const scuffs = Array.from({ length: 16 }, () => {
    const x = r() * CANVAS_W * 1.2 - 100;
    const y = r() * CANVAS_H * 1.1;
    const len = 220 + r() * 620;
    const a = (-28 - r() * 16) * (Math.PI / 180);
    return { x1: x, y1: y, x2: x + Math.cos(a) * len, y2: y + Math.sin(a) * len, w: 1 + r() * 5, o: 0.05 + r() * 0.12 };
  });
  // Two long folds running up to the right, like a poster that was once folded and carried.
  const creases = Array.from({ length: 2 }, (_, i) => {
    const y = 380 + i * 520 + (r() - 0.5) * 200;
    const tilt = -(380 + r() * 200);
    return { y, tilt };
  });
  const dots = `radial-gradient(circle, rgba(0,0,0,.34) 1.1px, transparent 1.7px)`;
  return (
    <div data-bleed style={{ position: "absolute", inset: 0 }}>
      {/* Screen of fine dots, patchy like a worn print. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: dots,
          backgroundSize: "7px 7px",
          opacity: 0.32,
          WebkitMaskImage: "radial-gradient(60% 40% at 30% 30%, #000, transparent), radial-gradient(55% 45% at 75% 75%, #000, transparent), radial-gradient(40% 30% at 80% 20%, rgba(0,0,0,.6), transparent)",
          maskImage: "radial-gradient(60% 40% at 30% 30%, #000, transparent), radial-gradient(55% 45% at 75% 75%, #000, transparent), radial-gradient(40% 30% at 80% 20%, rgba(0,0,0,.6), transparent)",
        }}
      />
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="cutpaper-scuff" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6 0.05" numOctaves={2} seed={seed + 2} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={10} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation="0.8" />
          </filter>
          <filter id="cutpaper-speck" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={1} seed={seed + 7} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -6.1" />
          </filter>
          <filter id="cutpaper-speckd" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={1} seed={seed + 9} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 9 -6.2" />
          </filter>
        </defs>
        <g filter="url(#cutpaper-scuff)" strokeLinecap="round">
          {scuffs.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={WHITE} strokeWidth={s.w} opacity={s.o} />
          ))}
        </g>
        {/* Folds: a light ridge with its shadow just below. */}
        {creases.map((c, i) => (
          <g key={i} filter="url(#cutpaper-scuff)">
            <line x1={-40} y1={c.y} x2={CANVAS_W + 40} y2={c.y + c.tilt} stroke={WHITE} strokeWidth={3} opacity={0.12} />
            <line x1={-40} y1={c.y + 4} x2={CANVAS_W + 40} y2={c.y + c.tilt + 4} stroke="#000" strokeWidth={5} opacity={0.07} />
          </g>
        ))}
        <rect width={CANVAS_W} height={CANVAS_H} filter="url(#cutpaper-speck)" opacity={0.55} />
        <rect width={CANVAS_W} height={CANVAS_H} filter="url(#cutpaper-speckd)" opacity={0.3} />
      </svg>
    </div>
  );
}

/** "SAT 10 OCT" stays short caps; "V OPPONENT" etc. */
const caps = (s: string) => s.toUpperCase().replace(/\s+/g, " ").trim();

/**
 * Minimal cut-out poster (Mikel Oyarzabal, Real Sociedad): one flat saturated club colour worn like an
 * old print (creases, scuffs, speckles, a faint dot screen, a rough white margin), the jumping player in
 * hard black & white with a thin white paper-cut edge, a tiny white crest at the top and his name in small
 * spaced white caps at the foot. Matchday adds one discreet line under the name and both crests up top.
 */
export function Cutpaper({ data }: { data: RenderData }) {
  // Native story (1080×1920): the backdrop runs the full height, the poster itself is centred (no stretched
  // post edges at the top and bottom).
  const H = data.canvasH ?? CANVAS_H;
  const dy = H > CANVAS_H ? (H - CANVAS_H) / 2 : 0;
  const { params, content, postType } = data;
  const seed = params.seed ?? 66;
  const r = rng(seed);
  const sheet = sheetOf(data);
  const ts = params.textScale ?? 1;
  const md = matchFacts(data);

  // ---- the player: whole body, centred, floating between the crest and the name ----
  const cx = 540 + (r() - 0.5) * 40 + (params.side === "left" ? -10 : 10);
  const floor = 1150;
  const placed = standing(data, { cx, headTop: 250 + Math.round(r() * 20), floor, maxFace: 110, framing: "full" });
  const { box, style: figMask } = lift(data, placed, 250 + placed.faceH * 0.2);

  // ---- the lines at the foot ----
  const name = caps([content.firstName, content.lastName].filter(Boolean).join(" ") || content.lastName);
  const nameSize = Math.min(30 * ts, 720 / Math.max(1, interEm(name, 0.12) * 0.72));
  const score = scoreOf(data, "-");
  let line = "";
  if (postType === "matchday") {
    line = [md.opp ? `V ${md.opp}` : "", md.date, md.time].filter(Boolean).join(" · ");
  } else if (postType === "result" || postType === "goal") {
    const teams = content.homeTeam && content.awayTeam && score ? `${caps(content.homeTeam)} ${score} ${caps(content.awayTeam)}` : md.opp ? `V ${md.opp}` : "";
    line = [caps(content.kicker || (postType === "goal" ? "GOAL" : "FULL TIME")), teams].filter(Boolean).join(" · ");
  } else if (postType === "stats") {
    const facts = shortFacts(data, 3).map((s) => `${s.value} ${s.label}`.toUpperCase());
    line = facts.length ? facts.join(" · ") : caps(content.kicker);
  } else {
    line = [caps(content.kicker), md.opp ? `V ${md.opp}` : ""].filter(Boolean).join(" · ");
  }
  const lineSize = Math.min(17 * ts, 760 / Math.max(1, interEm(line, 0.2) * 0.72));

  // ---- the marks at the top: our crest alone, or both teams (home first) on match posts ----
  const matchPost = postType === "matchday" || postType === "result" || postType === "goal";
  const marks = matchPost ? crestsOf(data) : data.club?.crestUrl ? [data.club.crestUrl] : [];
  const markSize = marks.length > 1 ? 70 : 92;

  // A thin white paper-cut edge: the cutout's own shape pushed out a few px in every direction.
  const edge = [
    [5, 0], [-5, 0], [0, 5], [0, -5], [3.6, 3.6], [-3.6, 3.6], [3.6, -3.6], [-3.6, -3.6],
  ]
    .map(([x, y]) => `drop-shadow(${x}px ${y}px 0 ${WHITE})`)
    .join(" ");

  const text: CSSProperties = { position: "absolute", left: 60, right: 60, textAlign: "center", fontFamily: INTER, color: WHITE, whiteSpace: "nowrap" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: BORDER }}>
      <div style={{ position: "absolute", left: 0, top: dy, width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: sheet }}>
      <MonoDefs id="cutpaper-mono" ink={0.45} />
      <CrumpledPaper color={sheet} seed={seed % 97} strength={0.16} id="cutpaper-crumple" />
      {/* Uneven ink: big soft lighter and darker clouds. */}
      <div data-bleed style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 35% at ${20 + r() * 30}% ${25 + r() * 20}%, rgba(255,255,255,.07), transparent), radial-gradient(45% 40% at ${60 + r() * 25}% ${60 + r() * 25}%, rgba(0,0,0,.1), transparent)` }} />
      <Wear seed={seed % 89} />

      {/* The player, hard black & white, with a paper-cut edge and a whisper of lift off the sheet. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, ...figMask }}>
          <div style={{ width: "100%", height: "100%", filter: `${edge} drop-shadow(0 8px 10px rgba(0,0,0,.28))` }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", display: "block", filter: "grayscale(1) contrast(1.45) brightness(1.06)" }} />
          </div>
        </div>
      )}

      {/* Crest mark(s), tiny and white. */}
      {marks.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 86, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          {marks.map((m, i) => (
            <img key={i} src={m} alt="" style={{ width: markSize, height: markSize, objectFit: "contain", filter: "url(#cutpaper-mono)", opacity: 0.95 }} />
          ))}
        </div>
      )}

      {/* Name, small spaced caps, and at most one quiet line under it. */}
      <div style={{ ...text, bottom: line ? 118 : 96, fontSize: nameSize, fontWeight: 500, letterSpacing: "0.12em", lineHeight: 1.2 }}>{name}</div>
      {line && <div style={{ ...text, bottom: 86, fontSize: lineSize, fontWeight: 500, letterSpacing: "0.2em", opacity: 0.78, lineHeight: 1.2 }}>{line}</div>}
      <AgencyLogo data={data} height={20} style={{ position: "absolute", right: 64, top: 62, opacity: 0.8 }} />

      <RoughBorder seed={seed % 83} />
      <Film strength={0.8} />
      </div>
    </div>
  );
}
