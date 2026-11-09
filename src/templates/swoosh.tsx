/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, vivid } from "@/lib/color";
import { lift, PRINT_GRAIN, tableRows, YEAR } from "./column";
import { ARCHIVO } from "./fx";
import { opponentOf, rng } from "./kit";
import { standing } from "./mist";
import { MONO, SANS, SERIF } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const PAPER = "#efece6";
const INK = "#1c1c1c";

/** The swoosh colour: the club's brightest real colour (yellow stays yellow, navy becomes a clear blue). */
function swooshColour(data: RenderData): string {
  const p = data.params;
  const raw = p.primary === "#10131c" ? p.accent : p.primary;
  const l = luminance(raw);
  if (l > 0.85) return luminance(p.accent) < 0.85 ? (luminance(p.accent) < 0.02 ? "#1b1b1b" : vivid(p.accent)) : "#c9c3b8";
  if (l < 0.02) return "#1b1b1b";
  // Deep colours (navy, bottle green) are lifted to a clear tone; mid colours stay the club's own.
  return l < 0.07 ? vivid(raw) : raw;
}

/** "Diogo Tavares" from any casing. */
const title = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m) => m.toUpperCase());

/** A name as the data spells it ("USC Paredes"), title-cased only when it came in all caps. */
const nameCase = (s: string) => (s && s === s.toUpperCase() ? title(s) : s);

/** "3 games, 2 goals and 1 assist" from label/value rows. */
function statSentence(rows: { label: string; value: string }[]): string {
  const parts = rows.map((s) => {
    const label = s.label.toLowerCase();
    return `${s.value} ${s.value === "1" ? label.replace(/s$/, "") : label}`;
  });
  if (!parts.length) return "";
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * Borussia Dortmund "same club new era": off-white grainy paper, a huge sickle-shaped swoosh in the club colour
 * with an airbrushed, stippled edge and a smaller dark one below, sweeping behind the running player; a trail of
 * coloured dust fading behind him. Top centre, a serif headline mixing italic and bold with a short paragraph;
 * two tiny colour squares in the corner; name and club in spaced mono bottom-left; crest, three short value
 * lines and "CLUB | ©YEAR" bottom-right.
 */
export function Swoosh({ data }: { data: RenderData }) {
  const { params, content, postType, player } = data;
  const seed = params.seed ?? 9;
  const r = rng(seed);
  const id = `sw-${seed % 997}`;
  const mirror = params.side === "left";
  const big = swooshColour(data);
  let small = params.accent;
  if (Math.abs(luminance(small) - luminance(big)) < 0.12 || luminance(small) > 0.5) small = luminance(big) < 0.05 ? "#8f8a80" : "#161616";

  // ---- texts ----
  const club = postType === "transfer" ? (data.toClub ?? data.club) : data.club;
  const clubName = club?.name ?? "";
  const name = title([content.firstName, content.lastName].filter(Boolean).join(" "));
  const words = content.kicker.toLowerCase().replace(/’/g, "'").split(/\s+/).filter(Boolean);
  let italic = words.length > 1 ? words.slice(0, -1).join(" ") : "";
  let bold = words[words.length - 1] ?? "";
  // "matchday" → *match*day: the italic half runs straight into the bold one.
  let joined = false;
  if (postType === "matchday" && /^.{3,}day$/.test(bold)) {
    italic = `${italic ? `${italic} ` : ""}${bold.slice(0, -3)}`;
    bold = "day";
    joined = true;
  }
  const ts = params.textScale ?? 1;
  const headSize = Math.min(54, 760 / Math.max(6, content.kicker.length * 0.46)) * ts;

  const rows = tableRows(data, 4).filter((s) => /^\d/.test(String(s.value)) && !/minute/i.test(s.label));
  const nonZero = rows.filter((s) => String(s.value).trim() !== "0");
  // Only worth a sentence when there is more than a count of games.
  const statsLine = nonZero.some((s) => !/game|match|app|minute/i.test(s.label)) ? statSentence(nonZero) : "";
  const pos = player.position ? player.position.toLowerCase() : "player";
  const period = content.subline ? title(content.subline.split("·")[0].trim()) : "";
  const paragraph = (() => {
    switch (postType) {
      case "matchday": {
        const m = matchFacts(data);
        const opp = nameCase(opponentOf(data) || m.opp);
        const comp = title(m.comp).replace(/(?<=\s)(De|Da|Do|Dos|Das|Of|The|And)\b/g, (w) => w.toLowerCase());
        const round = m.round.toLowerCase();
        const when = [title(m.longDate), m.time && `kick-off at ${m.time}`].filter(Boolean).join(", ");
        const us = clubName || "The team";
        return `${us} ${opp ? `take on ${opp}` : "are back in action"}${comp ? ` in the ${comp}` : ""}${round ? `, ${round}` : ""}.${when ? ` ${when}` : ""}${m.venue ? `${when ? " at" : " At"} ${nameCase((content.venue ?? "").trim())}` : ""}${when || m.venue ? "." : ""} ${name} and the squad are ready: one game, full focus.`;
      }
      case "transfer":
        return `${name} joins ${clubName}${data.fromClub ? ` from ${data.fromClub.name}` : ""}. A ${pos} with drive, composure and ambition, he brings fresh energy to the squad. ${clubName} stands for identity, development and belief. A new chapter starts now.`;
      case "renewal":
        return `${name} commits his future to ${clubName}${content.until ? ` until ${content.until}` : ""}. Consistent, composed and relentless in his work, he stays at the heart of the project. Same club. Same hunger. A new chapter.`;
      case "potm":
        return `${name} is ${clubName}'s player of the month${period ? ` for ${period}` : ""}.${statsLine ? ` ${statsLine.charAt(0).toUpperCase() + statsLine.slice(1)}.` : ""} Decisive, consistent and hungry for more, he leads by example.`;
      default:
        return `${statsLine ? `${statsLine.charAt(0).toUpperCase() + statsLine.slice(1)}${period && !/game|match/i.test(period) ? ` (${period.toLowerCase()})` : ""}. ` : ""}${name} keeps building his season at ${clubName}: hard work, belief and a hunger for more. Numbers that tell the story.`;
    }
  })();
  const paraSize = paragraph.length > 230 ? 15 : 16;

  // ---- the player: running, feet on the floor ----
  const cx = 500 + (mirror ? 80 : -20) + (r() - 0.5) * 30;
  const floor = 1165;
  const headTop = 420 + r() * 20;
  const placed = standing(data, { cx, headTop, floor, maxFace: 105, framing: "full" });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.25);

  // ---- the shapes (drawn for the right-hand layout, mirrored for the left) ----
  const wob = (v: number, a = 20) => v + (r() - 0.5) * a;
  const tip = wob(846);
  const bigPath = `M ${tip} 150 C ${wob(955)} 285, 1015 470, ${wob(955)} 625 C 895 765, 745 822, 612 842 C 560 790, 600 600, 690 546 C 805 522, 858 380, ${tip} 150 Z`;
  const tailPath = `M 720 540 C 520 566, 250 552, -30 552 L -30 780 L 420 1080 C 470 985, 540 900, 650 840 Z`;
  const smallPath = `M 560 836 C 700 812, 850 818, ${wob(940)} 848 C 872 905, 790 978, 650 994 C 610 998, 580 990, 560 980 Z`;
  const flipT = mirror ? `translate(${CANVAS_W} 0) scale(-1 1)` : undefined;

  const squares = [big, small];
  const credit = { fontFamily: ARCHIVO, fontWeight: 600, fontSize: 12.5, letterSpacing: "0.04em", color: INK, lineHeight: 1.3, textTransform: "uppercase" } as CSSProperties;
  const md = postType === "matchday" ? matchFacts(data) : null;
  const values = md
    ? [md.opp && `v ${md.opp}.`, md.date && `${title(md.date)}.`, md.time && `Kick-off ${md.time}.`, "One team."].filter(Boolean)
    : ["True passion.", "One team.", "One club.", "One family."];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(100% 80% at 50% 40%, rgba(255,255,255,.35), transparent 60%), radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(80,70,50,.08))" }} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {/* Airbrush on grainy paper: the alpha is softened, then partial alpha turns into a stipple of dots. */}
          {(
            [
              ["big", big, 1.2],
              ["tail", big, 10],
              ["small", small, 1.2],
              ["dust", big, 20],
              ["shadow", "#2a2620", 6],
            ] as [string, string, number][]
          ).map(([k, c, soft]) => (
            <filter key={k} id={`${id}-f${k}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceAlpha" stdDeviation={soft} result="a" />
              <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={(seed % 40) + k.length} result="n" />
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.4 -1.2" result="nb" />
              <feComposite in="a" in2="nb" operator="arithmetic" k1={0} k2={4.5} k3={-3.8} k4={0} result="d" />
              <feFlood floodColor={c} />
              <feComposite operator="in" in2="d" />
            </filter>
          ))}
          <linearGradient id={`${id}-gtail`} x1="0" y1="0" x2={CANVAS_W} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.22" stopColor="#fff" stopOpacity={0.05} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={0.38} />
            <stop offset="0.62" stopColor="#fff" stopOpacity={0.92} />
            <stop offset="1" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <linearGradient id={`${id}-gsmall`} x1="540" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0.6} />
            <stop offset="1" stopColor="#fff" stopOpacity={1} />
          </linearGradient>
          <radialGradient id={`${id}-gdust`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff" stopOpacity={0.75} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={flipT}>
          {/* The trail: a wedge of dust fading out to the left. */}
          <g filter={`url(#${id}-ftail)`}>
            <path d={tailPath} fill={`url(#${id}-gtail)`} />
          </g>
          <g filter={`url(#${id}-fbig)`}>
            <path d={bigPath} fill="#fff" />
          </g>
          <g filter={`url(#${id}-fsmall)`}>
            <path d={smallPath} fill={`url(#${id}-gsmall)`} />
          </g>
          {/* Dust kicked up behind the player, low along the ground. */}
          <g filter={`url(#${id}-fdust)`}>
            <ellipse cx={(mirror ? CANVAS_W - box.faceCx : box.faceCx) - 170} cy={floor - 130} rx={260} ry={110} fill={`url(#${id}-gdust)`} opacity={0.32} />
          </g>
        </g>
        {/* Grainy floor shadow. */}
        {box.feet && (
          <g filter={`url(#${id}-fshadow)`}>
            <ellipse cx={box.faceCx + (mirror ? 40 : -40)} cy={floor - 4} rx={250} ry={28} fill={`url(#${id}-gdust)`} opacity={0.6} />
          </g>
        )}
      </svg>

      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.02)", ...figMask }} />
      )}

      {/* Two colour squares. */}
      <div style={{ position: "absolute", left: 72, top: 82, display: "flex", flexDirection: "column", gap: 10 }}>
        {squares.map((c, i) => (
          <div key={i} style={{ width: 18, height: 18, background: c }} />
        ))}
      </div>

      {/* Headline and paragraph. */}
      <div style={{ position: "absolute", left: 150, right: 150, top: 190, textAlign: "center", color: INK }}>
        <div style={{ fontSize: headSize, lineHeight: 1.1, whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
          {italic && <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500 }}>{joined ? italic : `${italic} `}</span>}
          <span style={{ fontFamily: SERIF, fontWeight: 600 }}>{bold}</span>
        </div>
        <div style={{ margin: "22px auto 0", width: 470, fontFamily: SANS, fontSize: paraSize, lineHeight: 1.5, color: "#3a3833" }}>{paragraph}</div>
      </div>

      {/* Name and club. */}
      <div style={{ position: "absolute", left: 72, bottom: 72, fontFamily: MONO, color: INK }}>
        <div style={{ width: 30, height: 3, background: big, marginBottom: 18 }} />
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.32em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ marginTop: 6, fontSize: 14, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", whiteSpace: "nowrap", color: "#55524b" }}>{clubName}</div>
      </div>

      {/* Crest, values, credit. */}
      <div style={{ position: "absolute", right: 72, bottom: 64, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {club?.crestUrl && <img src={club.crestUrl} alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />}
          {md?.oppCrest && <img src={md.oppCrest} alt="" style={{ width: 56, height: 56, objectFit: "contain", marginLeft: -4 }} />}
          <div style={{ ...credit, fontWeight: 700 }}>
            {values.map((v) => (
              <div key={v}>{v}</div>
            ))}
          </div>
        </div>
        <div style={{ ...credit, fontWeight: 400, fontSize: 13, whiteSpace: "nowrap" }}>
          {clubName.toUpperCase()} | ©{YEAR}
        </div>
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.09, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
