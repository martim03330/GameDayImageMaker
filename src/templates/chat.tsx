/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const NB = " ";
const INK = "#0b0b0d";
const GREY = "#8e8e93";
const INCOMING = "#e9e9eb";

/** Greedy lines of unbreakable units at `size` within `width`. */
function wrap(units: string[], size: number, width: number): string[] {
  const lines: string[] = [];
  for (const u of units) {
    const last = lines[lines.length - 1];
    if (last != null && bodyW(`${last} ${u}`, size) <= width) lines[lines.length - 1] = `${last} ${u}`;
    else lines.push(u);
  }
  return lines;
}

type Msg = { out: boolean; lines: string[] };

/**
 * Chat: the match as a short text thread. A clean, near-white ground with a faint club-coloured light
 * behind the player, who stands big and sharp in natural colour on one side. On the other side, low down,
 * a few messaging-app bubbles under a tiny date: a grey "Matchday?" coming in, then two answers in the club
 * colour — "SC Vianense SAD v Leixões, 15:00" and "Estádio Dr. José de Matos".
 * The NEYOD mark under the thread. Flips with params.side.
 */
export function Chat({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const M = story ? 60 : 64;
  // The player stands on params.side; the thread takes the other side.
  const playerLeft = params.side === "left";

  /* ---- the messages ---- */
  const teams = teamsOf(data).map((t) => t.replace(/ +/g, NB));
  const fs = 30 * k;
  const padX = 26 * k;
  const padY = 17 * k;
  const lh = fs * 1.26;
  const colW = (story ? 820 : 640) - M;
  const maxInner = colW * 0.9 - 2 * padX;
  const units: string[] = [];
  if (teams.length === 2) units.push(teams[0], `v${NB}${teams[1]}${f.time ? "," : ""}`);
  else if (teams[0]) units.push(teams[0] + (f.time ? "," : ""));
  if (f.time) units.push(f.time);
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(", ");
  const third = venue || comp;
  const msgs: Msg[] = [{ out: false, lines: [`${sentenceCase(content.kicker || "Matchday")}?`] }];
  if (units.length) msgs.push({ out: true, lines: wrap(units, fs, maxInner) });
  if (third) msgs.push({ out: true, lines: wrap(third.split(/ +/).reduce<string[]>((a, w) => (a.length && /^\p{Lu}\p{Ll}?\.$/u.test(a[a.length - 1]) ? [...a.slice(0, -1), a[a.length - 1] + NB + w] : [...a, w]), []), fs, maxInner) });
  const bubbleH = (m: Msg) => 2 * padY + m.lines.length * lh;
  const gapSame = 8 * k;
  const gapTurn = 22 * k;

  const date = niceDate(content.date);
  const head = date;
  const headS = 21 * k;

  /* ---- the foot: logo, the thread ~60px above it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const threadBottom = logoTop - (story ? 64 : 56) + (params.textY ?? 0);
  // Bottom-up: the bubbles, then the date.
  let y = threadBottom;
  const placed: { m: Msg; top: number; first: boolean; last: boolean }[] = [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    const h = bubbleH(m);
    const top = y - h;
    const prev = msgs[i - 1];
    const next = msgs[i + 1];
    placed.unshift({ m, top, first: !prev || prev.out !== m.out, last: !next || next.out !== m.out });
    y = top - (prev ? (prev.out === m.out ? gapSame : gapTurn) : 0);
  }
  const headTop = y - (head ? 18 * k + headS : 0);
  const colX = playerLeft ? CANVAS_W - M - colW : M;

  /* ---- the player: big, on his side, head high ---- */
  const sideX = playerLeft ? -1 : 1;
  const faceX = 540 + sideX * (story ? 220 : 240);
  const sizes = story ? { chest: 370, waist: 300, knees: 236, full: 180 } : { chest: 270, waist: 214, knees: 166, full: 128 };
  const probe = placeByFace(data, faceX, 300, sizes);
  const box = placeByFace(data, faceX, (story ? STORY_TOP + 70 : 80) + probe.faceH * 0.7, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = H - (story ? 120 : 40) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300)}px, transparent ${fadeEnd}px)`;

  const r = 34 * k;
  const rs = 10 * k;
  const radius = (out: boolean, first: boolean, last: boolean) => {
    // Corners on the sender's side tighten inside a run, and the last bubble of a run gets the small "tail" corner.
    const top = first ? r : rs;
    const bottom = last ? rs : rs;
    return out ? `${r}px ${top}px ${bottom}px ${r}px` : `${top}px ${r}px ${r}px ${bottom}px`;
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#f6f6f4" }}>
      {/* The ground: near white, a faint club-coloured light behind him, a touch deeper at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 46% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100 + 8}%, ${shade(club, 0.55)}55, transparent 72%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 700 : 480, background: "linear-gradient(to bottom, rgba(236,236,232,0), #ecece8)" }} />
      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.1, top: chin + box.faceH * 0.4, width: box.faceH * 4.2, height: box.faceH * 4.4, borderRadius: "50%", background: `${shade(club, -0.5)}1f`, filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The thread. */}
      <div style={{ position: "absolute", left: colX, top: 0, width: colW, height: H, fontFamily: SANS }}>
        {head && (
          <div style={{ position: "absolute", left: padX * 0.7, right: padX * 0.7, top: headTop, textAlign: playerLeft ? "right" : "left", fontWeight: 500, fontSize: headS, lineHeight: 1, color: GREY, letterSpacing: "0.01em", textShadow: "0 0 6px #f6f6f4, 0 0 14px #f6f6f4, 0 0 22px #f6f6f4" }}>{head}</div>
        )}
        {placed.map(({ m, top, first, last }, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top,
              [m.out ? "right" : "left"]: 0,
              padding: `${padY}px ${padX}px`,
              borderRadius: radius(m.out, first, last),
              background: m.out ? club : INCOMING,
              color: m.out ? "#ffffff" : INK,
              boxShadow: `0 ${6 * k}px ${22 * k}px rgba(20,22,30,.08)`,
              fontWeight: 400,
              fontSize: fs,
              lineHeight: `${lh}px`,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {m.lines.map((l, j) => (
              <div key={j}>{l}</div>
            ))}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", ...(playerLeft ? { right: M } : { left: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
