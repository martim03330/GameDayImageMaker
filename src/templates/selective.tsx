/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { hueOf } from "@/lib/color";
import { ARCHIVO_BLACK } from "./fx";
import { rng } from "./kit";
import { clubInk, lift } from "./column";
import { dateParts, runner } from "./hollow";
import { crestsOf, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, SANS, sentence } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { initialsOf, KitPopDefs } from "./triangles";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const INK = "#1f2124";
const GREY = "#56595e";
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Inter at these weights, mixed case: average advance per em (to shrink long names into a column). */
const fitIn = (t: string, width: number, max: number, k = 0.56) => Math.min(max, width / Math.max(1, [...t].length * k));

type Row = { text: string; size: number; weight: number; color: string; tail?: string };

/**
 * Club "Gameday" (EC Vitória v SSA FC): the player's own photo as the whole ground, blurred and in black
 * and white with grain; the player in front, black and white too except his kit, which keeps the club
 * colour; giant thin white outline letters behind him; at the top a thin-ruled header like a match sheet:
 * kicker / our team / opponent / kick-off on the left, the two crests with the round in tiny spaced caps in
 * the middle, the competition / his name / club and number / ground on the right. Agency logo at the foot.
 */
export function Selective({ data }: { data: RenderData }) {
  // Native story (1080×1920): the backdrop runs the full height, the poster itself is centred (no stretched
  // post edges at the top and bottom).
  const H = data.canvasH ?? CANVAS_H;
  const dy = H > CANVAS_H ? (H - CANVAS_H) / 2 : 0;
  const { params, content, postType } = data;
  const seed = params.seed ?? 57;
  const r = rng(seed);
  const id = `selective-${seed}`;
  const club = clubInk(data);
  const m = matchFacts(data);
  const score = scoreOf(data, " – ");
  const ts = params.textScale ?? 1;

  // Kit hues that keep their colour.
  const hues = [hueOf(params.primary), hueOf(params.accent)].filter((h): h is number => h != null);

  // ---- the player ----
  const headTop = 300 + r() * 20;
  const floor = 1238;
  const cx = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : (r() - 0.5) * 60);
  const placed = runner(data, { cx, headTop, floor, maxFace: 128, minX: 40, maxX: 1040 });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.25);

  // ---- giant outline letters behind him ----
  const clubName = data.club?.name ?? "";
  const initials = initialsOf(clubName);
  const useNumber = !!data.player.number && (r() < 0.5 || initials.length > 4);
  const big = useNumber ? data.player.number : initials || data.player.number;
  const bigSize = Math.min(900, 1250 / Math.max(1, [...big].length * 0.78));
  const bigTop = 1350 - bigSize * 0.12 - bigSize * 0.72 - 40 - r() * 60;

  // ---- header ----
  const ours = clubName || "";
  const opp = m.opp ? teamCase(m.opp) : "";
  // Names typed all in lower case still read as names.
  const cap = (t: string) => (t && t === t.toLowerCase() ? t.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()) : titleCase(t));
  const name = cap([content.firstName, content.lastName].filter(Boolean).join(" "));
  const nameShort = content.lastName ? cap(`${(content.firstName || "").split(/\s+/)[0]} ${content.lastName}`.trim()) : name;
  const comp = m.comp ? titleCase(m.comp) : "";
  const venue = m.venue ? titleCase(m.venue) : "";
  const dp = dateParts(content.date);
  const kicker = sentence(content.kicker.trim().replace(/\s+/g, " "));
  const colW = 270;
  const K = (t: string): Row => ({ text: t, size: fitIn(t, colW, 24 * ts, 0.52), weight: 400, color: GREY });
  const C = (t: string): Row => ({ text: t, size: fitIn(t, colW, 30 * ts, 0.6), weight: 600, color: club });
  const P = (t: string, tail?: string): Row => ({ text: t, size: fitIn(t + (tail ? ` ${tail}` : ""), colW, 22 * ts, 0.54), weight: 400, color: INK, tail });
  const clubNo = [clubName, data.player.number ? `#${data.player.number}` : ""].filter(Boolean).join(" ");

  let left: Row[] = [];
  let right: Row[] = [];
  const when = [dp.dots, m.time].filter(Boolean).join(" / ");
  if (postType === "matchday") {
    left = [K(kicker), C(ours), P(opp), P(when, m.time ? "KICK OFF" : undefined)];
    right = [K(comp), C(nameShort), P(clubNo), P(venue)];
  } else if (postType === "potm") {
    const facts = shortFacts(data, 3);
    left = [K(kicker), C(nameShort), P(clubNo), P(titleCase(content.subline.split("·").slice(-1)[0]?.trim() ?? ""))];
    right = facts.length
      ? [K("In numbers"), C(`${facts[0].value} ${titleCase(facts[0].label)}`), P(facts[1] ? `${facts[1].value} ${titleCase(facts[1].label)}` : ""), P(facts[2] ? `${facts[2].value} ${titleCase(facts[2].label)}` : "")]
      : [K(comp), C(ours), P(data.player.position), P("")];
  } else {
    // The score is already between the crests: the last row is the date (and "full time" after the game).
    const tail = postType === "result" ? "FULL TIME" : undefined;
    const last = dp.dots || (score && !midScoreOf(data) ? score : "");
    left = [K(kicker), C(ours), P(opp), last ? P(last, tail) : P(tail ? "Full time" : "")];
    right = [K(comp), C(nameShort), P(clubNo), P(venue)];
  }

  // Centre: crests (our crest alone for the player of the month), the score between them after the game.
  const crests = postType === "matchday" ? ([m.ourCrest, m.oppCrest].filter(Boolean) as string[]) : postType === "potm" ? ([data.club?.crestUrl].filter(Boolean) as string[]) : crestsOf(data);
  const midScore = midScoreOf(data);
  const under = (postType === "potm" ? "" : m.round || (postType === "matchday" ? "" : "")).toUpperCase();
  const crestSize = midScore ? 96 : crests.length === 1 ? 120 : 108;

  const col = (rows: Row[], align: "left" | "right"): ReactNode => (
    <div style={{ position: "absolute", top: 148, [align]: 118, width: colW, display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : "flex-end", textAlign: align, fontFamily: SANS, color: INK }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "contents" }}>
          {i === 3 && <Dots />}
          <div style={{ fontSize: row.size, fontWeight: row.weight, color: row.color, lineHeight: 1.18, whiteSpace: "nowrap", letterSpacing: row.weight > 500 ? "-0.005em" : "0", minHeight: i === 3 ? 26 : undefined, marginTop: i === 0 ? 0 : i === 1 ? 10 : i === 3 ? 6 : 0 }}>
            {row.text}
            {row.tail && <span style={{ fontSize: row.size * 0.62, fontWeight: 600, letterSpacing: "0.02em", marginLeft: "0.4em" }}>{row.tail}</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const scene = data.bgPhotoUrl ?? sceneOf(data);
  const rule: CSSProperties = { position: "absolute", background: "rgba(30,32,36,.55)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#a9abad" }}>
      {hues.length > 0 && <KitPopDefs id={`${id}-pop`} hues={hues} />}
      {/* His own photo, never sharp: blurred, black and white, lifted to a soft grey. */}
      {scene && (
        <img
          src={scene}
          alt=""
          style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: H + 180, maxWidth: "none", objectFit: "cover", filter: "blur(26px) grayscale(1) contrast(.9) brightness(1.08)" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(236,236,236,.9) 0%, rgba(236,236,236,.72) 17%, rgba(236,236,236,.18) 34%, rgba(230,230,230,.08) 60%, rgba(20,20,22,.2) 100%)" }} />

      <div style={{ position: "absolute", left: 0, top: dy, width: CANVAS_W, height: CANVAS_H }}>
      {/* Giant outline letters. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", left: 0, top: 0 }} data-bleed>
        <text
          x={540}
          y={bigTop + bigSize * 0.72}
          textAnchor="middle"
          style={{ fontFamily: ARCHIVO_BLACK, fontSize: bigSize, letterSpacing: "0.04em" }}
          fill="none"
          stroke="rgba(255,255,255,.75)"
          strokeWidth={2.2}
        >
          {big}
        </text>
      </svg>

      {/* The player: black and white, the kit in colour. */}
      {data.photoUrl && box.feet && <div style={{ position: "absolute", left: box.left + box.width / 2 - 320, width: 640, top: floor - 40, height: 80, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.45), rgba(0,0,0,0))", filter: "blur(10px)" }} />}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 20px 36px rgba(0,0,0,.28))" }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: hues.length ? `url(#${id}-pop) contrast(1.06)` : "grayscale(1) contrast(1.12)", ...figMask }}
          />
        </div>
      )}

      {/* Header: rules, crosses at the corners, a faint grid behind the crests. */}
      <div style={{ ...rule, left: 70, right: 70, top: 130, height: 1.5 }} />
      <div style={{ ...rule, left: 100, top: 102, width: 1.5, height: 186 }} />
      <div style={{ ...rule, right: 100, top: 102, width: 1.5, height: 186 }} />
      <div
        style={{
          position: "absolute",
          left: 380,
          width: 320,
          top: 150,
          height: 118,
          backgroundImage: "linear-gradient(rgba(30,32,36,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(30,32,36,.12) 1px, transparent 1px)",
          backgroundSize: "40px 30px",
          WebkitMaskImage: "radial-gradient(closest-side, #000, transparent)",
          maskImage: "radial-gradient(closest-side, #000, transparent)",
        }}
      />
      {col(left, "left")}
      {col(right, "right")}

      <div style={{ position: "absolute", left: 390, width: 300, top: 72, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", gap: midScore ? 16 : 20 }}>
          {crests.map((c, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i === 1 && midScore && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: INK, whiteSpace: "nowrap" }}>{score}</div>}
              <img src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.18))" }} />
            </div>
          ))}
          {!crests.length && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: INK }}>{score || "v"}</div>}
        </div>
        {under && (
          <div style={{ marginTop: 8, fontFamily: SANS, fontWeight: 500, fontSize: Math.max(11, Math.min(15, 300 / Math.max(1, under.length * 1.5))), letterSpacing: "0.9em", marginRight: "-0.9em", color: INK, whiteSpace: "nowrap" }}>{under}</div>
        )}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={26} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.35))" }} />
      </div>
      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.16, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}

const WORDS = new Set(["RIO", "AVE", "SÃO", "SAO", "VAL", "MAR", "SAN", "SUR", "NEW", "LOS", "LAS", "DEL", "REAL", "VILA"]);

/** "USC PAREDES" → "USC Paredes", "RIO AVE FC" → "Rio Ave FC": title case that keeps club initials. */
function teamCase(t: string): string {
  const up = t.split(/\s+/);
  return titleCase(t)
    .split(/\s+/)
    .map((w, i) => (up[i] && up[i].length <= 3 && /^\p{Lu}+\.?$/u.test(up[i]) && !WORDS.has(up[i]) && !/^(DE|DA|DO|E|OF)$/.test(up[i]) ? up[i] : w))
    .join(" ");
}

/** Result and goal posts print the score between the two crests. */
function midScoreOf(data: RenderData): boolean {
  return (data.postType === "result" || data.postType === "goal") && !!scoreOf(data) && crestsOf(data).length === 2;
}

/** The dotted rule of the reference: short runs of dots with gaps. */
function Dots() {
  return (
    <div style={{ display: "flex", gap: 12, margin: "8px 0 2px" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ width: 26, height: 2, backgroundImage: "radial-gradient(circle, rgba(30,32,36,.7) 0.9px, transparent 1.2px)", backgroundSize: "5px 2px" }} />
      ))}
    </div>
  );
}
