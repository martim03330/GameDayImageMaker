/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { ARCHIVO, cutMask } from "./fx";
import { opponentOf, rng } from "./kit";
import { competitionOf, placeByFace, roundOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#d9d4cc";
const INK = "#3a2f27";

/** Face height per framing: a waist-up action shot by default, never blown past the photo's own pixels. */
const FACE_H: Record<string, number> = { chest: 230, waist: 185, knees: 150, full: 118 };

/** Sponsor tails that only clutter a competition name ("Taça de Portugal Generali Tranquilidade"). */
const SPONSORS = /\b(generali|tranquilidade|placard|meu super|betclic|bwin|opening|sabseg|allianz|nos|bet)\b/gi;

export function cleanCompetition(name: string): string {
  const s = name.replace(SPONSORS, " ").replace(/\s+/g, " ").trim();
  return s || name;
}

/** "SEPTEMBER 2026" → "September 2026", "LIGA 3" stays as it is. */
const title = (s: string) =>
  s
    .toLowerCase()
    .split(/(\s+)/)
    .map((w) => (/^[a-zà-ÿ]/i.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join("")
    .replace(/\b(Fc|Sc|Cf|Cd|Ud|Afc|Oaf|Ii|Iii)\b/g, (m) => m.toUpperCase())
    .replace(/(?<=\S\s+)\b(De|Da|Do|Dos|Das|Of|The|And|In)\b/g, (m) => m.toLowerCase());

/** Two lines out of a name: everything but the last word, then the last word. */
function split2(s: string): [string, string] | [string] {
  const w = s.split(/\s+/).filter(Boolean);
  if (w.length < 2) return [s];
  // Keep lines balanced: "Taça de" / "Portugal" rather than a lonely short word.
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length);
    if (d < diff) [diff, best] = [d, i];
  }
  return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
}

type Line = { text: ReactNode; chars: number; bold?: boolean; small?: boolean; caps?: boolean };

/** Archivo: average advance of mixed-case text, relative to the font size. */
const ADV = 0.56;

/**
 * One annotation: a few lines of clean sans in dark brown with thin corner brackets (┌ top-left / ┘ bottom-right).
 * `align` says which side the block hangs from (x is its left or right edge). Text shrinks to `maxW`.
 */
function Note({ x, y, align, lines, corners, maxW, size = 31 }: { x: number; y: number; align: "left" | "right"; lines: Line[]; corners: ("tl" | "br")[]; maxW: number; size?: number }) {
  const longest = Math.max(1, ...lines.map((l) => l.chars * (l.small ? 0.72 : 1) * (l.bold ? 1.06 : 1) * (l.caps ? 1.22 : 1)));
  const s = Math.max(17, Math.min(size, maxW / (longest * ADV)));
  const arm = 24;
  // Brackets hang on the outer corners: ┌ … ┘ for left-set text, mirrored (┐ … └) for right-set text.
  const bracket = (c: "tl" | "br") => {
    const common: CSSProperties = { position: "absolute", background: INK, opacity: 0.85 };
    const h = (c === "tl") === (align === "left") ? "left" : "right";
    const v = c === "tl" ? "top" : "bottom";
    const off = c === "tl" ? -14 : -12;
    return (
      <div key={c}>
        <div style={{ ...common, [h]: -18, [v]: off, width: arm, height: 2 }} />
        <div style={{ ...common, [h]: -18, [v]: off, width: 2, height: arm + 6 }} />
      </div>
    );
  };
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        [align]: align === "left" ? x : CANVAS_W - x,
        textAlign: align,
        fontFamily: ARCHIVO,
        color: INK,
        lineHeight: 1.08,
        whiteSpace: "nowrap",
      }}
    >
      {corners.map(bracket)}
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: l.small ? s * 0.72 : s, fontWeight: l.bold ? 600 : 400, marginTop: l.small && i > 0 ? s * 0.18 : 0, letterSpacing: l.small ? "0.02em" : "-0.005em" }}>
          {l.text}
        </div>
      ))}
    </div>
  );
}

const L = (text: string, bold = false, small = false): Line => ({ text, chars: [...text].length, bold, small, caps: text === text.toUpperCase() && /[A-Z]{2}/.test(text) });

/** "GOALS" + "2" → GOALS **2**. */
const statLine = (label: string, value: string): Line => ({
  text: (
    <>
      {label.toUpperCase()} <span style={{ fontWeight: 600 }}>{value}</span>
    </>
  ),
  chars: label.length + 1 + value.length,
  caps: true,
});

/** Paper scratches: fine vertical hairlines, some dark, some light, of random lengths. */
function Scratches({ seed }: { seed: number }) {
  const r = rng(seed * 7 + 3);
  const lines = Array.from({ length: 46 }, () => {
    const x = r() * CANVAS_W;
    const y = -40 + r() * CANVAS_H * 0.7;
    const len = 120 + r() * 1100;
    const dark = r() < 0.7;
    return { x, y, len, dark, w: 0.6 + r() * 1.3, o: 0.05 + r() * 0.16, wob: (r() - 0.5) * 6 };
  });
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} data-bleed>
      {lines.map((l, i) => (
        <path key={i} d={`M${l.x} ${l.y} q ${l.wob} ${l.len / 2} 0 ${l.len}`} stroke={l.dark ? "#4a3d33" : "#f6f1ea"} strokeWidth={l.w} opacity={l.o} fill="none" />
      ))}
    </svg>
  );
}

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Sepia grade (shadows dark brown, highlights warm paper) + optional horizontal smear with streaks. */
function Defs() {
  const tone = (
    <>
      <feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" />
      <feComponentTransfer result="t">
        <feFuncR type="table" tableValues="0.13 0.50 0.93" />
        <feFuncG type="table" tableValues="0.10 0.45 0.90" />
        <feFuncB type="table" tableValues="0.08 0.40 0.86" />
      </feComponentTransfer>
    </>
  );
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="sepia-tone" colorInterpolationFilters="sRGB">
        {tone}
      </filter>
      {[1, 2, 3, 4].map((k) => (
        <filter key={k} id={`sepia-smear-${k}`} x="-60%" y="-5%" width="220%" height="110%" colorInterpolationFilters="sRGB">
          {tone}
          {/* Rows displaced sideways by different amounts: the streaks of a slow shutter. */}
          <feTurbulence type="fractalNoise" baseFrequency={`0.0008 ${0.05 + k * 0.01}`} numOctaves={2} seed={k * 5} result="n" />
          <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1" result="nx" />
          <feDisplacementMap in="t" in2="nx" scale={40 + k * 30} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={`${6 + k * 9} 1.5`} />
        </filter>
      ))}
    </svg>
  );
}

/**
 * Mbappé hat-trick poster: warm grey paper with fine vertical scratches and grain, the player in monochrome
 * sepia with a long horizontal motion-blur trail (smeared copies fading to his back) and only his head and
 * front kept sharp; around him small annotation blocks with thin corner brackets (name / number, club,
 * opponent or the month, competition, the numbers) in a clean sans, and the agency mark in a corner.
 */
export function Sepia({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 29);
  const right = params.side !== "left";
  const dir = right ? -1 : 1; // the trail runs this way
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];

  // ---- the player ----
  const faceCx = 540 + (right ? -1 : 1) * (r() * 40);
  const faceTop = 235 + r() * 45;
  const box = placeByFace(data, faceCx, faceTop, FACE_H);
  const faceH = box.faceH;
  const faceW = face[2] * box.width;
  const cx = box.left + (face[0] + face[2] / 2) * box.width;

  // Sharp only from just behind the head to the front.
  const sharpFrom = right ? cx - box.left - Math.max(faceW, faceH * 0.75) * 0.95 : box.left + box.width - cx - Math.max(faceW, faceH * 0.75) * 0.95;
  const fade = box.width * 0.22;
  const sharpMask = `linear-gradient(${right ? "to right" : "to left"}, transparent ${Math.round(sharpFrom - fade)}px, #000 ${Math.round(sharpFrom)}px)`;
  const img = (style: CSSProperties, key?: string) =>
    data.photoUrl && <img key={key} src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", ...style }} />;
  const trailStep = 38 + r() * 18;

  // ---- the notes ----
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || "").toUpperCase();
  const nameLines: Line[] = [];
  if (first && last) nameLines.push(L(first), L(last, true));
  else nameLines.push(L(first || last, true));
  if (data.player.number) nameLines.push({ text: <>no. <span style={{ fontWeight: 600 }}>{data.player.number}</span></>, chars: 4 + data.player.number.length });

  const clubName = data.club?.name ? title(data.club.name) : "";
  const clubParts = split2(clubName);
  const clubLines: Line[] = clubName ? (clubParts.length === 2 ? [L(clubParts[0]), L(clubParts[1], true)] : [L(clubParts[0], true)]) : [];

  const comp = cleanCompetition(title(competitionOf(data)));
  const round = roundOf(data).split("·").slice(1).join(" ").trim();
  const opp = opponentOf(data);
  const score = scoreOf(data);

  let secondLines: Line[] = [];
  let compLines: Line[] = [];
  const numbers: Line[] = [];
  // Numbers already named by the caption ("LAST 5 GAMES") are not repeated.
  const caption = content.subline.toLowerCase();
  const stats = content.stats.filter((s) => s.value && s.value !== "0" && !/-/.test(s.value) && !caption.includes(s.label.toLowerCase().replace(/s$/, "")));
  if (postType === "goal" || postType === "result") {
    if (opp) {
      const p = split2(title(opp));
      secondLines = p.length === 2 ? [L(p[0], true), L(p[1])] : [L(p[0], true)];
    }
    if (comp) {
      const p = split2(comp);
      compLines = p.length === 2 ? [L(p[0], true), L(p[1])] : [L(p[0], true)];
    }
    if (round) compLines.push(L(title(round), false, true));
    numbers.push(L(content.kicker.toUpperCase(), true));
    if (score) numbers.push(statLine("Result", score));
    stats
      .filter((s) => !new RegExp(`^${s.label}S?$`, "i").test(content.kicker.trim()))
      .slice(0, 2)
      .forEach((s) => numbers.push(statLine(s.label, s.value)));
  } else {
    const k = split2(title(content.kicker));
    secondLines = k.length === 2 ? [L(k[0]), L(k[1], true)] : [L(k[0], true)];
    if (content.subline) secondLines.push(L(title(content.subline), false, true));
    const pos = data.player.position ? split2(title(data.player.position)) : [];
    compLines = pos.length === 2 ? [L(pos[0], true), L(pos[1])] : pos.length ? [L(pos[0], true)] : [];
    stats.slice(0, 4).forEach((s) => numbers.push(statLine(s.label, s.value)));
  }

  // Two columns clear of the body: the front one (where he runs to) and the back one, over the trail.
  const M = 72;
  const bodyHalf = Math.max(faceH * 1.5, faceW * 2.4);
  const frontEdge = right ? Math.min(cx + bodyHalf + 24, CANVAS_W - M - 200) : Math.max(cx - bodyHalf - 24, M + 200);
  const frontW = right ? CANVAS_W - M - frontEdge : frontEdge - M;
  const backW = Math.max(200, Math.min(330, right ? cx - bodyHalf - 20 - M : CANVAS_W - M - (cx + bodyHalf + 20)));
  const frontAlign = right ? "left" : "right";
  const backAlign = right ? "left" : "right";
  const backX = right ? M + 16 : CANVAS_W - M - 16;
  const rowH = 36;

  const notes: ReactNode[] = [];
  const nameTop = Math.max(150, faceTop + faceH * 0.05);
  notes.push(<Note key="n" x={backX} y={nameTop} align={backAlign} lines={nameLines} corners={["tl"]} maxW={backW} size={34} />);
  // Club and opponent close to the face, above the shoulders; pushed to the body-clear column when they'd reach them.
  const nearX = right ? cx + Math.max(faceW * 1.05, faceH * 0.8) + 50 : cx - Math.max(faceW * 1.05, faceH * 0.8) - 50;
  const nearW = right ? CANVAS_W - M - nearX : nearX - M;
  const shoulders = faceTop + faceH * 1.0;
  const clubTop = Math.max(120, faceTop - faceH * 0.35);
  const secondTop = clubTop + (clubLines.length ? clubLines.length * rowH + 48 : 0);
  const secondNear = secondTop + secondLines.length * rowH < shoulders;
  if (clubLines.length) notes.push(<Note key="c" x={nearX} y={clubTop} align={frontAlign} lines={clubLines} corners={["tl", "br"]} maxW={nearW - 30} />);
  if (secondLines.length) {
    const x = secondNear ? nearX - (right ? 24 : -24) : frontEdge;
    notes.push(<Note key="o" x={x} y={secondNear ? secondTop : Math.max(secondTop, shoulders)} align={frontAlign} lines={secondLines} corners={["tl", "br"]} maxW={(secondNear ? nearW + 24 : frontW) - 30} />);
  }
  const numH = numbers.length * rowH;
  const numTop = CANVAS_H - 120 - numH - r() * 50;
  const compTop = Math.min(numTop - 60, Math.max(nameTop + nameLines.length * rowH + 260, 700 + r() * 60));
  if (compLines.length) notes.push(<Note key="k" x={backX} y={compTop} align={backAlign} lines={compLines} corners={["tl"]} maxW={backW} size={30} />);
  if (numbers.length) notes.push(<Note key="s" x={right ? CANVAS_W - M - 18 : M + 18} y={numTop} align={right ? "right" : "left"} lines={numbers} corners={["br"]} maxW={Math.min(330, Math.max(frontW, 280))} size={30} />);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER }}>
      <Defs />
      {/* Paper: soft uneven light, darker at the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at ${right ? 60 : 40}% 40%, #e2ddd5, ${PAPER} 60%, #c9c3b9)` }} />
      <Scratches seed={params.seed ?? 29} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height }}>
          {/* The trail: copies further back are more smeared and fainter. */}
          {[4, 3, 2, 1].map((k) => (
            <div key={k} style={{ position: "absolute", inset: 0, transform: `translateX(${dir * trailStep * k}px)`, opacity: 0.62 - k * 0.1, ...cutMask(data.cut) }}>
              {img({ filter: `url(#sepia-smear-${k})` })}
            </div>
          ))}
          {/* The body in place, lightly smeared, under the sharp front. */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.9, ...cutMask(data.cut) }}>{img({ filter: "url(#sepia-smear-1)" })}</div>
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: sharpMask, maskImage: sharpMask }}>
            <div style={{ position: "absolute", inset: 0, ...cutMask(data.cut) }}>{img({ filter: "url(#sepia-tone) contrast(1.08)" })}</div>
          </div>
        </div>
      )}
      {/* The print fades into the paper at the very bottom. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: `linear-gradient(to bottom, transparent, ${PAPER}99)` }} />

      {notes}

      <div style={{ position: "absolute", bottom: 62, [right ? "left" : "right"]: M }}>
        <AgencyLogo data={data} height={30} onLight style={{ color: INK, opacity: 0.85, filter: "sepia(1) brightness(.9)" }} />
      </div>

      {/* Film grain and a few lighter scratches over everything, the photo included. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.22, mixBlendMode: "multiply", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundPosition: "60px 90px", opacity: 0.12, mixBlendMode: "screen", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 100% at 50% 45%, transparent 62%, rgba(60,45,30,.2))", pointerEvents: "none" }} />
    </div>
  );
}
