/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const MARGIN = 64;
/** The horizon: 70% down the canvas. */
const HORIZON = 945;

/** Inter 500: advance widths per 100px (measured in the browser). */
const INTER_W: Record<string, number> = {
  a: 56.8,
  b: 61.8,
  c: 57.7,
  d: 61.8,
  e: 58.7,
  f: 34.4,
  g: 61.9,
  h: 60.2,
  i: 25.2,
  j: 25.2,
  k: 55.9,
  l: 25.2,
  m: 88.8,
  n: 60.1,
  o: 60.4,
  p: 61.8,
  q: 61.8,
  r: 39.8,
  s: 53.9,
  t: 33.7,
  u: 60.2,
  v: 57.5,
  w: 82.9,
  x: 55.7,
  y: 57.5,
  z: 55.9,
  A: 72.2,
  B: 65.7,
  C: 73.4,
  D: 72.2,
  E: 60.3,
  F: 58.9,
  G: 74.8,
  H: 74.4,
  I: 27.3,
  J: 57.5,
  K: 68.8,
  L: 56.5,
  M: 91.3,
  N: 75.6,
  O: 76.7,
  P: 64.2,
  Q: 76.9,
  R: 64.8,
  S: 64.6,
  T: 65.3,
  U: 74,
  V: 72.2,
  W: 102.4,
  X: 70.1,
  Y: 69.6,
  Z: 64.1,
  " ": 26.7,
  "'": 31.3,
  "-": 46.3,
  ".": 27,
  ":": 27,
  "–": 50,
};
const interEm = (t: string, tracking = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (INTER_W[c] ?? 62) / 100 + tracking, 0);

/** `hex` pulled `t` of the way towards its own grey: a calmer, dustier version of the club colour. */
function calm(hex: string, t: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const g = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
  return (
    "#" +
    c
      .map((v) =>
        Math.round(v + (g - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** "MATCHDAY" → "Matchday", "MAN OF THE MATCH" → "Man of the match". */
function sentence(kicker: string): string {
  const k = kicker
    .replace(/’/g, "'")
    .trim()
    .toLowerCase()
    .replace(/^full ?time$/, "full time");
  return k.charAt(0).toUpperCase() + k.slice(1);
}

/**
 * Goal horizon: the goal post of `horizon`. The same calm landscape split by a horizon line — a soft
 * club-tinted sky over a darker floor — the celebrating player standing on the line on a third (or rising
 * from the foot when the photo is cut at the legs). Along the line three spaced-caps labels hang from
 * hairline ticks: his name, v the opponent, the competition. "Goal" (the kicker) in medium Inter top on the
 * open side with the date under it; the crests small opposite. No score.
 */
export function Goalhorizon({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 11);
  const right = params.side !== "left";
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const HZ = story ? STORY_BOTTOM - 210 : HORIZON;
  const ts = (params.textScale ?? 1) * (story ? 1.35 : 1);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  const f = matchFacts(data);

  /* ---- the title first: the player's head and raised arms keep clear of it ---- */
  const title = sentence(content.kicker || "Goal");
  const tw = story ? 720 : 600;
  const tracking = -0.035;
  const size = Math.min(88 * ts, tw / Math.max(1, interEm(title, tracking)));
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const sub = niceDate(content.date);
  const subSize = story ? 26 : 19;
  const titleBottom = titleTop + size + (sub ? (story ? 24 : 20) + subSize : 0);

  /* ---- the player, on a third, standing on the line ---- */
  const cx = right ? 715 + r() * 20 : 365 - r() * 20;
  const whole = !(data.cut?.bottom ?? 0);
  // Celebrations throw the arms up over the head: the head sits lower than in `horizon` to leave them room.
  const stand = standing(data, { cx, headTop: story ? Math.max(470, titleBottom + 260) : Math.max(370, titleBottom + 230), floor: HZ + 10, maxFace: story ? 170 : 104, framing: "full" });
  const box =
    whole && stand.feet
      ? stand
      : {
          ...placeByFace(
            data,
            cx,
            story ? Math.max(560, titleBottom + 300) : Math.max(440, titleBottom + 230),
            story ? { chest: 230, waist: 205, knees: 172, full: 150 } : { chest: 165, waist: 146, knees: 122, full: 108 },
          ),
          feet: false,
        };
  const faceCx = cx + (params.playerX ?? 0);
  const feetX = box.left + box.width * 0.5;

  /* ---- the labels along the horizon: name · v opponent · competition ---- */
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) !== lc(oursName) && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const comp = titleCase(f.comp || f.round || "");
  const labels = [name, opp ? `v ${opp}` : "", comp].filter(Boolean);
  const freeL = box.feet || right ? MARGIN : Math.min(CANVAS_W - MARGIN - 300, faceCx + 330);
  const freeR = box.feet || !right ? CANVAS_W - MARGIN : Math.max(MARGIN + 300, faceCx - 330);
  const labTrack = 0.2;
  const emOf = (l: string) => interEm(l.toUpperCase(), labTrack);
  const widthOf = (ls: string[]) => ls.reduce((a, l) => a + emOf(l), 0);
  // His legs run off the foot: the open side is narrow, so the labels stack down it.
  const stack = !box.feet;
  const labSize = stack
    ? Math.max(10, Math.min(story ? 20 : 15, (freeR - freeL) / Math.max(1, ...labels.map(emOf))))
    : Math.max(9, Math.min(story ? 19 : 14, (freeR - freeL - (labels.length - 1) * 40) / Math.max(1, widthOf(labels))));
  const label: CSSProperties = {
    fontFamily: SANS,
    fontWeight: 500,
    fontSize: labSize,
    letterSpacing: `${labTrack}em`,
    textTransform: "uppercase",
    color: "rgba(255,255,255,.88)",
    whiteSpace: "nowrap",
    lineHeight: 1,
  };

  // The NEYOD mark: story ≥ 88px tall ending at STORY_BOTTOM; post ~52px, 60 from the foot.
  const markH = (story ? 88 : 52) * (params.logoScale ?? 1);
  const markBottom = (story ? STORY_BOTTOM : CANVAS_H - 60) - (params.logoY ?? 0);
  const tick = story ? 18 : 14;
  const stackH = tick + 18 + labels.length * labSize + (labels.length - 1) * 16;
  const flatH = tick * 2 + labSize;
  const hz = Math.min(HZ, markBottom - markH - 64 - (stack ? stackH : flatH));

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const soft = calm(club, 0.38);
  const sky = `linear-gradient(to bottom, ${shade(soft, -0.6)} 0%, ${shade(soft, -0.4)} 40%, ${shade(soft, -0.1)} 80%, ${shade(calm(club, 0.55), 0.22)} 100%)`;
  const floor = `linear-gradient(to bottom, ${shade(soft, -0.66)} 0%, ${shade(soft, -0.78)} 45%, ${shade(soft, -0.85)} 100%)`;
  // A figure running off the foot sinks into the floor rather than ending on a hard edge.
  const fade = box.feet ? undefined : `linear-gradient(to bottom, #000 0, #000 ${H - 220 - box.top}px, transparent ${H - 20 - box.top}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.8), color: WHITE }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: hz, background: sky }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hz, bottom: 0, background: floor }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: hz - 300,
          height: 480,
          background: `radial-gradient(55% 50% at ${(feetX / CANVAS_W) * 100}% 62%, rgba(255,255,255,.18), transparent 70%)`,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: hz, height: 1, background: "rgba(255,255,255,.55)" }} />

      {data.photoUrl && box.feet && (
        <div
          style={{
            position: "absolute",
            left: feetX - box.width * 0.4,
            top: hz - 8,
            width: box.width * 0.8,
            height: 34,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(0,0,0,.55), rgba(0,0,0,.25) 55%, transparent)",
            filter: "blur(4px)",
          }}
        />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}

      {stack ? (
        <div style={{ position: "absolute", left: freeL, width: freeR - freeL, top: hz, display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
          <div style={{ width: 1, height: tick, background: "rgba(255,255,255,.55)" }} />
          {labels.map((l, i) => (
            <div key={i} style={{ ...label, marginTop: i === 0 ? 18 : 16, marginRight: right ? 0 : `-${labTrack}em`, color: i === 0 ? WHITE : label.color }}>
              {l}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: "absolute", left: freeL, width: freeR - freeL, top: hz, display: "flex", justifyContent: "space-between" }}>
          {labels.map((l, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === labels.length - 1 ? "flex-end" : "center" }}>
              <div style={{ width: 1, height: tick, background: "rgba(255,255,255,.55)" }} />
              <div style={{ ...label, marginTop: tick, marginRight: i === labels.length - 1 ? `-${labTrack}em` : 0, color: i === 0 ? WHITE : label.color }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "absolute", top: titleTop, left: right ? MARGIN : undefined, right: right ? undefined : MARGIN, width: tw, textAlign: right ? "left" : "right" }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: 1, letterSpacing: `${tracking}em`, whiteSpace: "nowrap", marginLeft: right ? -size * 0.04 : 0 }}>{title}</div>
        {sub && <div style={{ marginTop: story ? 24 : 20, fontFamily: SANS, fontWeight: 400, fontSize: subSize, color: "rgba(255,255,255,.7)", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>

      {crests.length > 0 && (
        <div style={{ position: "absolute", top: titleTop + 4, right: right ? MARGIN : undefined, left: right ? undefined : MARGIN, display: "flex", gap: 14, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 62 : 44, height: story ? 62 : 44, objectFit: "contain" }} />
          ))}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 24 : 20}
        style={{
          position: "absolute",
          left: right ? MARGIN : undefined,
          right: right ? undefined : MARGIN,
          bottom: (story ? H - STORY_BOTTOM : 60) - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: right ? "left bottom" : "right bottom",
        }}
      />
      <Film strength={0.2} />
    </div>
  );
}
