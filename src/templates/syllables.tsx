/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade, vivid } from "@/lib/color";
import { CAVEAT, figureBox, Film, GradedFigure, type Box } from "./fx";
import { AgencyLogo, CONDENSED, Crest, fitSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const CLUSTERS = new Set(["BR", "CR", "DR", "FR", "GR", "PR", "TR", "VR", "BL", "CL", "FL", "GL", "PL", "CH", "LH", "NH"]);
/** Vowel test on the base letter, so Ã, É, Ü… count too. */
const isVowel = (c: string) => /[AEIOUY]/.test(c.normalize("NFD")[0] ?? "");

/** One word in rough syllables: break before consonant + vowel, keeping clusters like "DR" together. */
function wordSyllables(s: string): string[] {
  const letters = [...s];
  const parts: string[] = [];
  let cur = "";
  letters.forEach((c, i) => {
    const next = letters[i + 1] ?? "";
    const prev = letters[i - 1] ?? "";
    if (i > 0 && cur && !isVowel(c) && isVowel(next)) {
      if (!isVowel(prev) && CLUSTERS.has(prev + c) && cur.length > 1) {
        parts.push(cur.slice(0, -1));
        cur = prev;
      } else {
        parts.push(cur);
        cur = "";
      }
    }
    cur += c;
  });
  parts.push(cur);
  return parts.filter(Boolean);
}

/** "CONCEIÇÃO" → CON / CEI / ÇÃO, "KAKA" → KA / KA: rough syllables of 2–5 letters, at most 4 rows. */
export function syllables(name: string): string[] {
  const words = name
    .toUpperCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);
  const all = words.join("");
  const len = (r: string) => [...r].length;
  if (len(all) <= 3) return [all];
  let rows = words.flatMap(wordSyllables);
  const join = (j: number) => {
    rows = [...rows.slice(0, j), rows[j] + rows[j + 1], ...rows.slice(j + 2)];
  };
  // Lone letters join their shorter neighbour.
  while (rows.length > 2 && rows.some((r) => len(r) === 1)) {
    const i = rows.findIndex((r) => len(r) === 1);
    join(i === 0 ? 0 : i === rows.length - 1 ? i - 1 : len(rows[i - 1]) <= len(rows[i + 1]) ? i - 1 : i);
  }
  // At most 4 rows: join the shortest neighbours.
  while (rows.length > 4) {
    let best = 0;
    for (let i = 1; i < rows.length - 1; i++) if (len(rows[i]) + len(rows[i + 1]) < len(rows[best]) + len(rows[best + 1])) best = i;
    join(best);
  }
  // Unpronounceable or very long chunks: even chunks of 2–3 letters instead.
  if (rows.length < 2 || rows.some((r) => len(r) > 5)) {
    const letters = [...all];
    const n = Math.min(4, Math.max(2, Math.round(letters.length / 2.6)));
    const size = Math.ceil(letters.length / n);
    rows = [];
    for (let i = 0; i < letters.length; i += size) rows.push(letters.slice(i, i + size).join(""));
  }
  return rows;
}

/** Where the player stands: full body on the floor, cut photos from the bottom edge, busts in the corner. */
function place(data: RenderData, right: boolean): { box: Box; kind: "full" | "cut" | "bust" } {
  const aspect = data.photoAspect ?? 0.5;
  const faceH = data.face?.[3] ?? 0.12;
  const dir = right ? 1 : -1;
  if (aspect > 0.8 || faceH > 0.22) {
    const h = Math.min(760 / aspect, 860);
    const w = h * aspect;
    return { box: figureBox(data, 540 + dir * (540 - w / 2 + w * 0.06), 190, h), kind: "bust" };
  }
  if ((data.cut.bottom ?? 0) > 0.3) {
    const h = 960;
    const w = h * aspect;
    return { box: figureBox(data, 540 + dir * (540 - w / 2 - 70), 190, h), kind: "cut" };
  }
  const h = 940;
  const w = h * aspect * (data.params.playerScale ?? 1);
  const outerCut = (right ? data.cut.right : data.cut.left) ?? 0;
  return { box: figureBox(data, outerCut > 0.15 ? 540 + dir * (560 - w / 2) : 540 + dir * 90, 150, h), kind: "full" };
}

/** Top-right headline: two teams with a handwritten "x", or the post's title in two lines. */
function headline(data: RenderData): { lines: [string, string]; mark: string } {
  const c = data.content;
  const up = (s?: string) => (s ?? "").toUpperCase();
  // Club names exactly as stored ("SC Vianense SAD"), never shortened.
  const short = (s?: string) => up(s).trim();
  if ((data.postType === "matchday" || data.postType === "result" || data.postType === "goal") && c.homeTeam && c.awayTeam) {
    const g = data.postType !== "matchday" && c.homeGoals != null && c.awayGoals != null;
    return { lines: [`${short(c.homeTeam)}${g ? ` ${c.homeGoals}` : ""}`, `${short(c.awayTeam)}${g ? ` ${c.awayGoals}` : ""}`], mark: "x" };
  }
  if (data.postType === "transfer") {
    const to = (data.toClub ?? data.club)?.name;
    if (data.fromClub && to) return { lines: [short(data.fromClub.name), short(to)], mark: "›" };
  }
  // Balanced two-line title: "PLAYER OF / THE MONTH".
  const words = c.kicker.toUpperCase().split(/\s+/).filter(Boolean);
  let best: [string, string] = [words.join(" "), ""];
  let score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    if (Math.max(a.length, b.length) < score) {
      score = Math.max(a.length, b.length);
      best = [a, b];
    }
  }
  return { lines: best, mark: "" };
}

/** Bottom line, spaced like "25 NOV - 9:30". */
function footer(data: RenderData): { main: string; sub: string } {
  const c = data.content;
  switch (data.postType) {
    case "matchday":
      return { main: [c.date, c.time].filter(Boolean).join("  -  ") || c.kicker, sub: [c.kicker, c.subline].filter(Boolean).join("  ·  ") };
    case "goal":
    case "result":
      return { main: c.kicker, sub: c.subline };
    case "transfer":
      return { main: c.kicker, sub: [c.subline, c.until && `ATÉ ${c.until}`].filter(Boolean).join("  ·  ") };
    default: {
      const stats = c.stats.slice(0, 4).map((s) => `${s.value} ${s.label}`).join("  ·  ");
      return { main: stats || c.subline || c.kicker, sub: [c.kicker, stats ? c.subline : ""].filter(Boolean).join("  ·  ") };
    }
  }
}

/**
 * Surname cut into huge stacked syllables in a pale club tint (Kovačić): light background, the player
 * running in front, a flat club-colour ball as the full stop, fixture top right, date spaced at the bottom.
 */
export function Syllables({ data }: { data: RenderData }) {
  const { params, content } = data;
  const right = params.side !== "left";
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.35);
  const tint = shade(accent, 0.42);
  const bg = shade(accent, 0.94);
  const { box, kind } = place(data, right);
  const rows = syllables(content.lastName || content.firstName);
  const scale = params.textScale ?? 1;

  // Barlow Condensed Black: caps ≈ 0.7em tall, ≈ 0.5em wide. Accented rows (ÇÃO…) get room for the marks.
  const top = 250;
  const bottom = 1140;
  const pitch = 0.76;
  const extra: number[] = rows.map((r, i) => (i > 0 && /[\u0300-\u030f]/.test(r.normalize("NFD")) ? 0.17 : 0));
  const ems = rows.length * pitch + extra.reduce((a, b) => a + b, 0);
  const ball = kind === "cut";
  const longest = Math.max(...rows.map((r, i) => [...r].length + (i === rows.length - 1 && ball ? 0.7 : 0)));
  // Text may run behind the player, except a bust, whose head would swallow the last letters.
  const faceX = data.face ? data.face[0] : 0.35;
  const headNear = right ? box.left + box.width * faceX : CANVAS_W - box.left - box.width * (faceX + (data.face?.[2] ?? 0.3));
  const textW = kind === "bust" ? Math.max(380, headNear - 58 - 30) : 940;
  const size = Math.min((bottom - top) / ems, textW / (longest * 0.52)) * scale;
  const blockH = ems * size;
  const blockTop = top + (bottom - top - blockH) / 2;
  const edge: CSSProperties = right ? { left: 58 } : { right: 58 };
  const far: CSSProperties = right ? { right: 72 } : { left: 72 };

  const head = headline(data);
  const headSize = Math.min(64, ...head.lines.map((l) => fitSize(l, 400, 64, 0.43)));
  const foot = footer(data);
  const footMain = foot.main.toUpperCase();
  const footLs = footMain.length > 22 ? 6 : 14;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg, color: deep }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 55% 45%, #ffffff 0%, ${bg} 70%, ${shade(accent, 0.86)} 100%)` }} />

      {/* First name above the syllables. */}
      <div
        style={{
          position: "absolute",
          top: blockTop - 58,
          ...edge,
          marginLeft: right ? size * 0.03 : 0,
          marginRight: right ? 0 : size * 0.03,
          fontFamily: CONDENSED,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "0.32em",
          color: deep,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {content.firstName}
        {data.player.number && <span style={{ color: accent, marginLeft: 18 }}>{data.player.number}</span>}
      </div>

      {/* Syllables. */}
      <div
        style={{
          position: "absolute",
          top: blockTop,
          ...edge,
          display: "flex",
          flexDirection: "column",
          alignItems: right ? "flex-start" : "flex-end",
          fontFamily: CONDENSED,
          fontWeight: 900,
          fontSize: size,
          lineHeight: pitch,
          letterSpacing: "-0.01em",
          color: tint,
        }}
      >
        {rows.map((r, i) => (
          <div key={i} style={{ height: size * (pitch + extra[i]), display: "flex", alignItems: "flex-end", whiteSpace: "nowrap" }}>
            <span style={{ display: "block", transform: `translateY(${size * 0.05}px)` }}>{r}</span>
            {i === rows.length - 1 && ball && (
              <span
                style={{
                  display: "block",
                  flex: "none",
                  width: size * 0.3,
                  height: size * 0.3,
                  marginLeft: size * 0.06,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%, ${shade(accent, 0.25)} 0%, ${accent} 55%, ${shade(accent, -0.2)} 100%)`,
                  boxShadow: `0 ${size * 0.08}px ${size * 0.08}px -${size * 0.04}px rgba(0,0,0,.25)`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mist at the floor. */}
      <div style={{ position: "absolute", left: -100, right: -100, bottom: -60, height: 360, background: "radial-gradient(50% 50% at 50% 60%, rgba(255,255,255,.9), rgba(255,255,255,0) 70%)" }} />

      {/* Floor shadow + player. */}
      {kind === "full" && (
        <div
          style={{
            position: "absolute",
            left: box.left + box.width * 0.1,
            width: box.width * 0.8,
            top: box.top + box.height - 18,
            height: 34,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${shade(accent, -0.5)}55, transparent)`,
            filter: "blur(6px)",
          }}
        />
      )}
      <GradedFigure data={data} box={box} shadow={false} />

      {/* Top: crest centred, agency top corner, fixture on the far side. */}
      <Crest club={data.club} size={86} style={{ position: "absolute", top: 46, left: CANVAS_W / 2 - 43, filter: "drop-shadow(0 6px 12px rgba(0,0,0,.18))" }} />
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", top: 76, ...edge, marginLeft: right ? 14 : 0, marginRight: right ? 0 : 14 }} />
      <div style={{ position: "absolute", top: 70, ...far, textAlign: right ? "right" : "left", fontFamily: CONDENSED, fontWeight: 800, fontSize: headSize, lineHeight: 0.92, color: accent, textTransform: "uppercase" }}>
        <div style={{ position: "relative" }}>
          {head.lines[0]}
          {head.mark && (
            <span
              style={{
                position: "absolute",
                left: -headSize * 0.3,
                top: headSize * 0.52,
                fontFamily: CAVEAT,
                fontWeight: 400,
                fontSize: headSize * 1.15,
                lineHeight: 1,
                color: deep,
                zIndex: 1,
              }}
            >
              {head.mark}
            </span>
          )}
        </div>
        <div>{head.lines[1]}</div>
      </div>

      {/* Bottom: spaced date line. */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 58, textAlign: "center" }}>
        <div
          style={{
            fontFamily: CONDENSED,
            fontWeight: 600,
            fontSize: Math.min(40, fitSize(footMain, 900, 40, 0.5, footLs)),
            letterSpacing: footLs,
            color: accent,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {footMain}
        </div>
        {foot.sub && (
          <div
            style={{
              marginTop: 10,
              fontFamily: CONDENSED,
              fontWeight: 600,
              fontSize: Math.min(18, fitSize(foot.sub, 900, 18, 0.48, 5)),
              letterSpacing: 5,
              color: shade(deep, 0.2),
              opacity: 0.8,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            {foot.sub}
          </div>
        )}
      </div>
      <Film strength={0.35} />
    </div>
  );
}
