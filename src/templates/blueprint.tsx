/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng, SCRIPT } from "./kit";
import { ANTON, em } from "./mist";
import { competitionOf, crestsOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, DISPLAY, SANS } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { interEm, titleCase } from "./wall";

const WHITE = "#ffffff";
const PAPER = "#f8fafc";

/** Anton cap height, relative to the font size. */
const CAP = 0.86;

/** Fine grunge for the dark band (light specks, screen it). */
const SPECKS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' seed='14' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -9 6.2'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;
/** Large soft blotches, for a worn, printed band. */
const CLOUDS = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.006 0.012' numOctaves='4' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -.55'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`,
)}")`;

/** The kicker as one tall word, or two balanced lines when it is long. */
function titleLines(kicker: string): string[] {
  const k = kicker.toUpperCase().replace(/’/g, "'").replace(/^IT'S\s+/, "").trim() || "GOAL";
  const joined = /DAY$/.test(k.replace(/\s+/g, "")) && k.replace(/\s+/g, "").length <= 9 ? k.replace(/\s+/g, "") : k;
  if (em(joined, ANTON, 47) <= 5.2) return [joined];
  const words = joined.split(/\s+/);
  if (words.length === 1) return [joined];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(em(words.slice(0, i).join(" "), ANTON, 47) - em(words.slice(i).join(" "), ANTON, 47));
    if (d < diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** "↘" drawn as a heavy corner arrow. */
function Arrow({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: "absolute", left: x, top: y }}>
      <path d="M6 10 L10 6 L28 24 L28 10 L34 10 L34 34 L10 34 L10 28 L24 28 Z" fill={color} />
    </svg>
  );
}

/**
 * Man City "GOAL" (Cherki) poster: the top sixty percent is white graph paper (fine grid in a tint of the club
 * colour, dashed construction lines, a "+" and a corner arrow), one huge tall condensed word in the club's
 * light colour, and the player's head-and-shoulders big in the middle, his head in front of the letters.
 * The lower forty percent is a dark club band with worn texture and diagonal light stripes; on it, the shirt
 * number big in the light colour and the name in white sentence case, the crest in the corner and a thin
 * signature. Matchday puts the crests and date · kick-off there instead.
 */
export function Blueprint({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 44);
  const flip = params.side === "right";

  // ---- colours ----
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.8) club = vivid(params.accent);
  if (luminance(club) > 0.8) club = "#3a6fb0";
  const l = luminance(club);
  // The word on white: the club colour, deepened a touch when it is too pale to hold (yellow, sky).
  const title = l > 0.55 ? shade(club, -0.28) : l > 0.42 ? shade(club, -0.12) : club;
  const band = l < 0.06 ? shade(club, -0.15) : shade(club, l > 0.3 ? -0.74 : l > 0.12 ? -0.6 : -0.45);
  // On the dark band: the light version of the colour.
  const light = l > 0.3 ? club : shade(club, l > 0.12 ? 0.4 : 0.55);
  const grid = shade(club, 0.72);

  // ---- layout constants ----
  const bandTop = 820 + Math.round(r() * 16);
  const titleTop = 112;
  const titleBottom = bandTop - 78;

  // ---- the title ----
  const lines = titleLines(content.kicker);
  const measure = 920 * (params.textScale ?? 1);
  const gapT = 26;
  const slot = (titleBottom - titleTop - gapT * (lines.length - 1)) / lines.length;
  const widest = Math.max(...lines.map((t) => em(t, ANTON, 47)));
  let size = measure / widest;
  let stretch = slot / (size * CAP);
  if (stretch < 1) {
    size = slot / CAP;
    stretch = 1;
  }
  stretch = Math.min(stretch, lines.length > 1 ? 1.9 : 2.3);
  const lineH = size * CAP * stretch;
  const blockH = lineH * lines.length + gapT * (lines.length - 1);
  // Short blocks (two lines, capped stretch) sit low, their feet just above the band's gap.
  const firstBase = titleBottom - blockH + lineH;

  // ---- the player: head and shoulders, chin just above the band ----
  const cutout = !!data.photoUrl && data.photoIsCutout;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let fh = 262 * (params.playerScale ?? 1);
  // Exported at 2×: never much past ~1.9× the real face pixels.
  if (data.facePx > 0) fh = Math.min(fh, Math.max(120, data.facePx * 1.9));
  const chin = bandTop - 22 - r() * 16;
  const faceX = 540 + (flip ? -1 : 1) * (8 + r() * 18);
  // The shoulders should run off the bottom: a short bust may grow (within the face's real resolution), the chin
  // staying put; whatever is still missing dissolves into the band.
  const maxFh = Math.min(380 * (params.playerScale ?? 1), data.facePx > 0 ? data.facePx * 1.9 : 380, fh * 1.4);
  let h = fh / face[3];
  for (let i = 0; i < 3; i++) {
    const need = (CANVAS_H + 40 - (chin - face[3] * h)) / Math.max(0.2, 1 - face[1]);
    h = Math.max(fh / face[3], Math.min(need, maxFh / face[3]));
  }
  const faceTop = chin - face[3] * h;
  const short = faceTop + (1 - face[1]) * h < CANVAS_H + 20;
  const w = h * aspect;
  const box = {
    left: faceX - w * (face[0] + face[2] / 2) + (params.playerX ?? 0),
    top: faceTop - h * face[1] + (params.playerY ?? 0),
    width: w,
    height: h,
  };

  // ---- band content ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  // Sentence-cased words ("kaka" → "Kaka"), all-caps names made readable.
  const nameText = titleCase(name.toUpperCase()).replace(/(^|\s)(\p{Ll})/gu, (_, a: string, b: string) => a + b.toUpperCase());
  const colW = 380;
  const nameSize = Math.min(54, colW / Math.max(1, interEm(nameText) * 0.9));
  const number = data.player.number;
  const facts = matchFacts(data);
  const score = scoreOf(data, "–");
  const crests = crestsOf(data);
  const comp = competitionOf(data);
  const round = roundOf(data);
  const ourCrest = (data.toClub ?? data.club)?.crestUrl ?? null;
  const edge = 62;
  const side: CSSProperties = flip ? { right: edge, alignItems: "flex-end", textAlign: "right" } : { left: edge, alignItems: "flex-start", textAlign: "left" };
  const other: CSSProperties = flip ? { left: edge, alignItems: "flex-start", textAlign: "left" } : { right: edge, alignItems: "flex-end", textAlign: "right" };
  const caps: CSSProperties = { fontFamily: CONDENSED, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: WHITE, whiteSpace: "nowrap", lineHeight: 1.25 };
  const shadow = "0 2px 14px rgba(0,0,0,.45)";
  const fitCaps = (t: string, room: number, max: number) => Math.min(max, room / Math.max(1, [...t].length * 0.62));
  // Long small print breaks at its "·" (or mid-way) rather than shrinking below ~14px.
  const capLines = (t: string, room: number): string[] => {
    if (fitCaps(t, room, 17) >= 14) return [t];
    const parts = t.split(/\s+·\s+/);
    if (parts.length > 1) return parts;
    const words = t.split(/\s+/);
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  };

  const crestImg = (src: string | null | undefined, s: number, key?: number) =>
    src ? <img key={key} src={src} alt="" style={{ width: s, height: s, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.45))" }} /> : null;

  // Number + name block (every type).
  const numSize = number ? Math.min(150, 300 / Math.max(1, number.length * 0.62)) : 0;
  const nameBlock = (
    <div style={{ position: "absolute", top: bandTop + 58, display: "flex", flexDirection: "column", gap: 4, ...side }}>
      {number && (
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: numSize, lineHeight: 0.9, letterSpacing: "-0.04em", color: light, textShadow: "0 4px 24px rgba(0,0,0,.35)" }}>{number}</div>
      )}
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1.05, letterSpacing: "-0.02em", color: WHITE, whiteSpace: "nowrap", textShadow: shadow, marginTop: number ? 6 : 0 }}>{nameText}</div>
    </div>
  );

  // The other corner, per post type.
  const sigWord = (content.lastName || content.firstName).split(/\s+/).pop() ?? "";
  const signature = sigWord ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8 }}>
      <div style={{ fontFamily: SCRIPT, fontSize: Math.min(58, 300 / Math.max(3, sigWord.length * 0.5)), lineHeight: 1, color: light, opacity: 0.95, transform: "rotate(-6deg)", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,.3)" }}>
        {sigWord.charAt(0).toUpperCase() + sigWord.slice(1).toLowerCase()}
      </div>
      <div style={{ width: 190, borderTop: `2px dotted ${light}`, opacity: 0.8, marginTop: 2 }} />
    </div>
  ) : null;

  let corner: ReactNode = null;
  let under: string[] = [];
  if (postType === "matchday") {
    const pair = crests.length ? crests : ([facts.ourCrest, facts.oppCrest].filter(Boolean) as string[]);
    const when = [facts.date, facts.time].filter(Boolean).join("  ·  ");
    const where = [facts.venue, [comp, facts.round].filter(Boolean).join(" · ")].filter(Boolean);
    corner = (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, ...other, position: "absolute", bottom: 70 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {crestImg(pair[0], 104)}
          {pair.length > 1 && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: light }}>v</div>}
          {crestImg(pair[1], 104)}
        </div>
        {when && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: Math.min(36, 330 / Math.max(1, when.length * 0.56)), color: WHITE, letterSpacing: "-0.01em", whiteSpace: "nowrap", textShadow: shadow }}>{when}</div>}
        {where
          .flatMap((t, i) => capLines(t, 330).map((x) => [x, i] as const))
          .slice(0, 3)
          .map(([t, i], k) => (
            <div key={k} style={{ ...caps, fontSize: Math.max(13, fitCaps(t, 330, 17)), opacity: i ? 0.75 : 0.95, marginTop: k ? -8 : 0, textShadow: shadow }}>{t}</div>
          ))}
      </div>
    );
    under = facts.opp ? [`vs ${titleCase(facts.opp)}`] : [];
  } else if (postType === "result") {
    const pair = crests;
    corner = (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, ...other, position: "absolute", bottom: 74 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {crestImg(pair[0], 96)}
          {score && <div style={{ fontFamily: DISPLAY, fontSize: 84, lineHeight: 1, color: light, letterSpacing: "0.01em", textShadow: "0 4px 22px rgba(0,0,0,.4)" }}>{score}</div>}
          {crestImg(pair[1], 96)}
        </div>
        <div style={{ ...caps, fontSize: 18, textShadow: shadow }}>FULL TIME</div>
        {capLines(round, 330).slice(0, 2).map((t, i) => (
          <div key={i} style={{ ...caps, fontSize: Math.max(13, fitCaps(t, 330, 16)), opacity: 0.75, marginTop: -8, textShadow: shadow }}>{t}</div>
        ))}
      </div>
    );
  } else if (postType === "transfer") {
    const from = data.fromClub?.crestUrl;
    corner = (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, ...other, position: "absolute", bottom: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {from && crestImg(from, 84)}
          {from && (
            <svg width={34} height={20} viewBox="0 0 34 20">
              <path d="M0 10 H30 M22 2 L31 10 L22 18" stroke={light} strokeWidth={3} fill="none" />
            </svg>
          )}
          {crestImg(ourCrest, from ? 120 : 150)}
        </div>
        {data.fromClub && <div style={{ ...caps, fontSize: fitCaps(`FROM ${data.fromClub.name}`, 330, 17), opacity: 0.85, textShadow: shadow }}>FROM {data.fromClub.name}</div>}
      </div>
    );
    under = [data.player.position].filter(Boolean);
  } else {
    // goal / potm: the crest and a signature, like the reference.
    corner = (
      <div style={{ display: "flex", flexDirection: "column", ...other, position: "absolute", bottom: 58 }}>
        {crestImg(ourCrest, 150)}
        {signature}
      </div>
    );
    if (postType === "goal") {
      const opp = facts.opp ? `vs ${titleCase(facts.opp)}${score ? `  ${score}` : ""}` : "";
      under = [opp, round].filter(Boolean);
    } else {
      under = [content.subline, shortFacts(data, 3).map((s) => `${s.value} ${s.label}`).join(" · ")].filter(Boolean).map((t) => t.toUpperCase());
    }
  }

  // Small caps under the name.
  const underBlock = under.length ? (
    <div style={{ position: "absolute", top: bandTop + 58 + (number ? numSize * 0.9 + 10 : 0) + nameSize * 1.05 + 22, display: "flex", flexDirection: "column", gap: 6, ...side }}>
      {under
        .flatMap((t, i) => capLines(t, colW).map((x) => [x, i] as const))
        .slice(0, 3)
        .map(([t, i], k) => (
          <div key={k} style={{ ...caps, fontSize: Math.max(13, fitCaps(t, colW, 17)), opacity: i ? 0.72 : 0.92, textShadow: shadow }}>{t}</div>
        ))}
    </div>
  ) : null;

  // ---- construction lines ----
  const vx = [286 + Math.round(r() * 20), 794 - Math.round(r() * 20)];
  const hy = 150 + Math.round(r() * 20);
  const hy2 = Math.round(titleTop + (titleBottom - titleTop) * (0.44 + r() * 0.08));
  const dash = { stroke: shade(club, 0.35), strokeWidth: 2, strokeDasharray: "8 7", opacity: 0.55 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER }}>
      {/* Graph paper. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: bandTop,
          backgroundImage: [
            `linear-gradient(to right, ${grid} 1.5px, transparent 1.5px)`,
            `linear-gradient(to bottom, ${grid} 1.5px, transparent 1.5px)`,
            `linear-gradient(to right, ${grid}88 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${grid}88 1px, transparent 1px)`,
          ].join(","),
          backgroundSize: "135px 135px, 135px 135px, 27px 27px, 27px 27px",
          backgroundPosition: "-1px -1px",
        }}
      />
      {/* Paper light: whiter in the middle, faint grey at the edges. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bandTop, background: "radial-gradient(80% 70% at 50% 45%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%, rgba(0,20,40,.05))" }} />
      <svg width={CANVAS_W} height={bandTop} style={{ position: "absolute", left: 0, top: 0 }}>
        {vx.map((x) => (
          <line key={x} x1={x} x2={x} y1={0} y2={bandTop} {...dash} />
        ))}
        <line x1={0} x2={CANVAS_W} y1={hy2} y2={hy2} {...dash} />
        <line x1={vx[0]} x2={vx[1]} y1={hy} y2={hy} {...dash} />
        <line x1={vx[0]} x2={vx[1]} y1={bandTop - 40} y2={bandTop - 40} {...dash} />
        {/* Registration ticks at the crossings. */}
        {vx.flatMap((x) => [hy, hy2].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill={shade(club, 0.2)} opacity={0.6} />))}
      </svg>

      {/* The tall word, fitted by textLength and stretched upwards (data-bleed: the checker measures it unscaled). */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {lines.map((t, i) => {
          const base = firstBase + i * (lineH + gapT);
          const natural = em(t, ANTON, 47) * size;
          return (
            <text
              key={i}
              x={540}
              y={base}
              textAnchor="middle"
              textLength={Math.min(measure, natural * 1.02)}
              lengthAdjust="spacingAndGlyphs"
              transform={`translate(0 ${base}) scale(1 ${stretch}) translate(0 ${-base})`}
              style={{ fontFamily: DISPLAY, fontSize: size }}
              fill={title}
            >
              {t}
            </text>
          );
        })}
      </svg>

      {/* The dark band. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, bottom: 0, background: `linear-gradient(to bottom, ${shade(band, 0.1)}, ${band} 40%, ${shade(band, -0.35)})` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: CLOUDS, opacity: 0.12, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: SPECKS, opacity: 0.18, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(115deg, transparent 0 22px, rgba(255,255,255,.035) 22px 24px)` }} />
        {/* Two broad kit-like light stripes. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(${flip ? 64 : 116}deg, transparent 58%, ${light}24 58%, ${light}24 63%, transparent 63%, transparent 66%, ${light}14 66%, ${light}14 68%, transparent 68%)`,
          }}
        />
      </div>

      {/* The player, head in front of the word. */}
      {cutout ? (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 22px 40px rgba(0,0,0,.28))" }}>
          <img src={data.photoUrl!} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "contrast(1.05) saturate(1.05)", ...cutMask(short ? { ...data.cut, bottom: 1 } : data.cut, short ? 1.8 : 1) }} />
        </div>
      ) : data.photoUrl ? (
        // An uncut photo: a tight print of the head and shoulders pinned on the grid.
        <div style={{ position: "absolute", left: faceX - 250, top: Math.max(250, faceTop - 150), width: 500, bottom: 0, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,.3)" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left - (faceX - 250), top: box.top - Math.max(250, faceTop - 150), width: box.width, height: box.height, maxWidth: "none" }} />
        </div>
      ) : null}
      {/* The band's shade over his shirt, so the white type holds. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, bottom: 0, background: `linear-gradient(to bottom, transparent 0%, ${band}33 40%, ${band}aa 100%)` }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandTop,
          bottom: 0,
          background: `linear-gradient(${flip ? 64 : 116}deg, transparent 58%, rgba(255,255,255,.1) 58%, rgba(255,255,255,.1) 63%, transparent 63%)`,
          mixBlendMode: "soft-light",
        }}
      />

      {/* Corner furniture. */}
      <Arrow x={flip ? CANVAS_W - 62 - 42 : 62} y={52} size={42} color={shade(band, 0.05)} />
      <svg width={26} height={26} style={{ position: "absolute", left: 540 - 13, top: 60 }}>
        <path d="M13 2 V24 M2 13 H24" stroke={shade(band, 0.05)} strokeWidth={2.5} />
      </svg>
      <AgencyLogo data={data} height={38} onLight style={{ position: "absolute", top: 54, [flip ? "left" : "right"]: 62, maxWidth: 200 }} />

      {nameBlock}
      {underBlock}
      {corner}
      {postType !== "goal" && postType !== "potm" && postType !== "matchday" && signature && (
        <div style={{ position: "absolute", bottom: 26, [flip ? "right" : "left"]: edge, opacity: 0.8, transform: "scale(.75)", transformOrigin: flip ? "right bottom" : "left bottom" }}>{signature}</div>
      )}
    </div>
  );
}
