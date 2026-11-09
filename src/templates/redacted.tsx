/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { longDate } from "./superscript";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#efece5";
const INK = "#141518";

/** JetBrains Mono: every glyph advances 0.6em; ascent 1.02, cap height 0.73 (per 1px of font size). */
const ADV = 0.6;
const ASC = 1.02;
const CAP = 0.73;

type Mode = "matchday" | "goal";
/** One word of the memo: shown (key info) or blacked out. Words of one shown phrase share a group. */
type Tok = { t: string; show: boolean; group: number };

const upper = (s: string) => s.toUpperCase();

/** The memo's words: generic filler (redacted) around the key facts (left readable). */
function memoOf(data: RenderData, mode: Mode, n: number): Tok[] {
  const { content } = data;
  const seed = (data.params.seed ?? 0) >>> 0;
  const toks: Tok[] = [];
  let g = 0;
  const hide = (s: string) => s.split(/\s+/).filter(Boolean).forEach((t) => toks.push({ t, show: false, group: -1 }));
  const show = (s: string) => {
    g++;
    s.split(/\s+/).filter(Boolean).forEach((t) => toks.push({ t, show: true, group: g }));
  };
  const [home = "", away = ""] = teamsOf(data);
  const fixture = home && away ? `${upper(home)} V ${upper(away)}` : upper(home || away);
  // A fixture too long for one line breaks before the "V", never inside a club's name.
  const showFixture = (end = "") => {
    if (home && away && fixture.length + end.length > n) {
      show(upper(home));
      show(`V ${upper(away)}${end}`);
    } else show(`${fixture}${end}`);
  };
  if (mode === "goal") {
    const kicker = upper((content.kicker || "GOAL").replace(/[.!]+$/, "").trim()) || "GOAL";
    const name = upper([content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" "));
    show(`${kicker}.`);
    hide(seed % 2 ? "At the decisive moment the ball was struck by" : "The report confirms the goal was scored by");
    if (name) show(name);
    if (fixture) {
      hide(seed % 2 ? "and the goal was recorded in" : "who found the net in");
      showFixture(".");
    }
    hide("Further details remain classified.");
    return toks;
  }
  const f = matchFacts(data);
  const date = upper(longDate(content.date));
  const venue = upper((content.venue ?? "").trim() || titleCase(f.venue));
  show(`${upper((content.kicker || "MATCHDAY").replace(/[.!]+$/, "").trim()) || "MATCHDAY"}.`);
  hide(seed % 2 ? "The next fixture is confirmed:" : "The squad is ready for");
  if (fixture) showFixture();
  if (date) {
    hide("will be played on");
    show(date);
  }
  if (f.time) {
    hide("with kick-off at");
    show(f.time);
  }
  if (venue) {
    hide("at the ground known as");
    show(venue);
  }
  toks[toks.length - 1] = { ...toks[toks.length - 1], t: toks[toks.length - 1].t.replace(/[.,:]?$/, ".") };
  hide("Further details remain classified.");
  return toks;
}

/** Breaks the memo into lines of at most `n` characters; a shown phrase stays on one line when it fits. */
function breakLines(toks: Tok[], n: number): Tok[][] {
  // Chunks: each shown phrase whole (when it fits a line), every hidden word alone.
  const chunks: Tok[][] = [];
  for (const tk of toks) {
    const last = chunks[chunks.length - 1];
    if (tk.show && last && last[0].show && last[0].group === tk.group) last.push(tk);
    else chunks.push([tk]);
  }
  const split = chunks.flatMap((c) => (c.map((t) => t.t).join(" ").length > n ? c.map((t) => [t]) : [c]));
  const lines: Tok[][] = [];
  let cur: Tok[] = [];
  let len = 0;
  for (const c of split) {
    const w = c.map((t) => t.t).join(" ").length;
    if (cur.length && len + 1 + w > n) {
      lines.push(cur);
      cur = [];
      len = 0;
    }
    len += (cur.length ? 1 : 0) + w;
    cur.push(...c);
  }
  if (cur.length) lines.push(cur);
  return lines;
}

/**
 * The shared page of `redacted` / `goalredacted`: one idea — a short typewritten memo in JetBrains Mono, set
 * ragged like a declassified document, where every filler word is blacked out by a neat solid bar exactly the
 * word's width and only the key facts stay readable. Matchday: dark ink on pale paper, the memo opening the
 * free side; goal: white type and white bars on a deep club-tone ground, the memo at the foot.
 */
export function RedactedPage({ data, mode }: { data: RenderData; mode: Mode }) {
  const { params } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const goal = mode === "goal";
  const club = clubTone(data);

  const ground = goal ? shade(club, -0.66) : PAPER;
  const ink = goal ? "#ffffff" : INK;
  const bar = goal ? "#ecebe6" : INK;

  /* ---- the memo ---- */
  const M = story ? 84 : 72;
  const size = (story ? (goal ? 40 : 44) : goal ? 30 : 28) * ts;
  const L = Math.round(size * 1.72);
  const colMax = story ? CANVAS_W - 2 * M : goal ? 560 : 452;
  const n = Math.max(14, Math.floor(colMax / (ADV * size)));
  const lines = breakLines(memoOf(data, mode, n), n);
  const longest = Math.max(...lines.map((ln) => ln.map((t) => t.t).join(" ").length));
  const colW = longest * ADV * size;
  const blockH = lines.length * L;
  // Line box → baseline: (L − content)/2 + ascent; content area of the font is 1.32em.
  const base = (L - 1.32 * size) / 2 + ASC * size;
  const capTop = base - CAP * size;

  /* ---- the foot ---- */
  const logoAsked = 22;
  const logoH = story ? Math.max(88, Math.round(Math.max(52, logoAsked * 2) * 1.7)) : Math.max(52, logoAsked * 2);
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  // Last line's baseline-ish (bars reach 0.12em under it) sits ≥ 56px above the logo.
  const lastInk = (blockH - L) + base + 0.14 * size;

  const colTop = (goal ? logoTop - (story ? 68 : 62) - lastInk : (story ? STORY_TOP : 104) - capTop) + (params.textY ?? 0);
  const colBottom = colTop + blockH;
  const colLeft = right ? M : CANVAS_W - M - colW;

  /* ---- the player ---- */
  let box;
  if (goal) {
    const faceX = right ? (story ? 680 : 740) : story ? 400 : 340;
    const faceTop = story ? STORY_TOP + 120 : 150;
    box = placeByFace(data, faceX, faceTop, story ? { chest: 300, waist: 246, knees: 196, full: 152 } : { chest: 236, waist: 196, knees: 156, full: 120 });
    const lean = Math.max(-80, Math.min(80, (CANVAS_W - (2 * box.left + box.width)) / 2));
    box = { ...box, left: box.left + (right ? Math.max(0, lean) : Math.min(0, lean)) };
  } else {
    const faceX = right ? (story ? 690 : 810) : story ? 390 : 270;
    const faceTop = story ? Math.max(colBottom + 170, 760) : 250;
    box = placeByFace(data, faceX, faceTop, story ? { chest: 340, waist: 270, knees: 214, full: 168 } : { chest: 262, waist: 214, knees: 168, full: 132 });
  }
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;
  const fadeFrom = goal ? Math.max(fTop + box.faceH * 2.2, colTop - (story ? 360 : 300)) : 0;

  const line: CSSProperties = { height: L, lineHeight: `${L}px`, fontFamily: MONO, fontSize: size, whiteSpace: "pre", color: ink, letterSpacing: 0 };
  const g0 = goal ? "rgba(0,0,0,0)" : "rgba(239,236,229,0)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* The ground: flat, a breath of light behind him. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: goal
            ? `radial-gradient(60% 45% at ${right ? 66 : 34}% ${((fTop + box.faceH * 2) / H) * 100}%, ${shade(club, -0.42)}, ${ground} 70%)`
            : `radial-gradient(70% 55% at ${right ? 70 : 30}% 55%, ${shade(PAPER, 0.4)}, ${PAPER} 62%, ${shade(PAPER, -0.05)} 100%)`,
        }}
      />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", display: "block", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}
      {goal && (
        <div style={{ position: "absolute", left: 0, right: 0, top: fadeFrom, bottom: 0, background: `linear-gradient(to bottom, ${g0}, ${shade(ground, 0)}d0 ${story ? 300 : 260}px, ${ground} ${story ? 560 : 480}px)` }} />
      )}

      {/* The memo. */}
      <div style={{ position: "absolute", left: colLeft, top: colTop, width: colW }}>
        {lines.map((ln, i) => (
          <div key={i} style={line}>
            {ln.map((tk, k) => (
              <span key={k}>
                {k > 0 ? " " : ""}
                {tk.show ? (
                  <span style={{ fontWeight: 700 }}>{tk.t}</span>
                ) : (
                  <span style={{ position: "relative", color: "transparent", fontWeight: 500 }}>
                    {tk.t}
                    <span
                      aria-hidden
                      style={{ position: "absolute", left: -0.04 * size, right: -0.04 * size, top: (ASC - CAP - 0.1) * size, height: (CAP + 0.1 + 0.14) * size, background: bar }}
                    />
                  </span>
                )}
              </span>
            ))}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight={!goal}
        height={logoAsked}
        style={{ position: "absolute", ...(right ? { left: M } : { right: M }), bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={goal ? 0.16 : 0.1} />
    </div>
  );
}

/**
 * Redacted: the matchday post as a declassified memo. On pale paper, a few lines of JetBrains Mono where every
 * filler word is blacked out and only "MATCHDAY.", the fixture (home first, names as stored), "17 OCTOBER",
 * "15:00" and the ground are left readable. The player big on the other side.
 */
export function Redacted({ data }: { data: RenderData }) {
  return <RedactedPage data={data} mode="matchday" />;
}
