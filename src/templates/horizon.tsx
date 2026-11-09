/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { placeByFace, scoreOf } from "./outline";
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
 * Horizon: a calm Swiss landscape. The canvas is split by a horizon line at 70%: above, a soft club-tinted sky
 * that brightens towards the line; below, a darker floor. The full-body player stands small on the line, on a
 * third, with a soft contact shadow. Along the line, four tiny spaced-caps labels (date — kick-off — ground —
 * v opponent) hang from hairline ticks. A medium Inter title at the top on the open side, crests small opposite.
 */
export function Horizon({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 11);
  const right = params.side !== "left";
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920): the same landscape over the tall band (STORY_TOP..STORY_BOTTOM), the line low,
  // type ~1.35× larger, the player taller.
  const HZ = story ? STORY_BOTTOM - 220 : HORIZON;
  const ts = (params.textScale ?? 1) * (story ? 1.35 : 1);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.3);

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, on a third, standing on the line ---- */
  const cx = right ? 720 + r() * 20 : 360 - r() * 20;
  // A full-body photo stands small on the line; a photo cut at the legs runs off the foot, a little larger.
  const whole = !(data.cut?.bottom ?? 0);
  const stand = standing(data, { cx, headTop: story ? 470 : 372, floor: HZ + 10, maxFace: story ? 176 : 110, framing: "full" });
  // A photo cut at the legs cannot stand on the line: he rises from the foot of the canvas instead, head well clear of the title.
  const box =
    whole && stand.feet
      ? stand
      : {
          ...placeByFace(
            data,
            cx,
            story ? 500 : 420,
            story ? { chest: 240, waist: 212, knees: 178, full: 156 } : { chest: 170, waist: 150, knees: 125, full: 110 },
          ),
          feet: false,
        };
  const faceCx = cx + (params.playerX ?? 0);
  const feetX = box.left + box.width * 0.5;

  /* ---- title, on the open side ---- */
  const title = sentence(content.kicker);
  const tw = story ? 720 : 600;
  const tracking = -0.035;
  const size = Math.min(88 * ts, tw / Math.max(1, interEm(title, tracking)));
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const comp = titleCase(f.comp || "");
  const round = titleCase(f.round || "");
  const sub = [comp, round].filter(Boolean).join(" · ");
  const subSize = Math.max(13, Math.min(story ? 26 : 19, tw / Math.max(1, interEm(sub))));

  /* ---- the labels along the horizon ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const labels = [niceDate(content.date), hasScore ? `FT ${score}` : f.time, titleCase(f.venue), opp ? `v ${opp}` : ""].filter(Boolean);
  // Where the labels may go: the whole width when his feet are on the line, the open side when his legs run off the foot.
  const freeL = box.feet || right ? MARGIN : Math.min(CANVAS_W - MARGIN - 300, faceCx + 330);
  const freeR = box.feet || !right ? CANVAS_W - MARGIN : Math.max(MARGIN + 300, faceCx - 330);
  const labTrack = 0.2;
  const widthOf = (ls: string[]) => ls.reduce((a, l) => a + interEm(l.toUpperCase(), labTrack), 0);
  // Too many for the open side: the ground goes first.
  // In the story, a figure running off the foot leaves a narrow open side: the labels stack down it instead.
  const stack = story && !box.feet;
  if (!stack && labels.length > 3 && widthOf(labels) * (story ? 14 : 10.5) + (labels.length - 1) * 36 > freeR - freeL)
    labels.splice(2, 1);
  const labW = widthOf(labels);
  const labSize = stack
    ? Math.max(11, Math.min(story ? 20 : 17, (freeR - freeL) / Math.max(1, ...labels.map((l) => interEm(l.toUpperCase(), labTrack)))))
    : Math.max(10, Math.min(story ? 19 : 14, (freeR - freeL - (labels.length - 1) * 36) / Math.max(1, labW)));
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

  // Story, stacked labels: the line rises so the stack ends ≥ 56px above the story-sized NEYOD mark (88px).
  const markH = 88 * (params.logoScale ?? 1);
  const hz = stack ? Math.min(HZ, STORY_BOTTOM - (params.logoY ?? 0) - markH - 64 - (36 + labels.length * labSize + (labels.length - 1) * 16)) : HZ;

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];

  const soft = calm(club, 0.38);
  const sky = `linear-gradient(to bottom, ${shade(soft, -0.6)} 0%, ${shade(soft, -0.4)} 40%, ${shade(soft, -0.1)} 80%, ${shade(calm(club, 0.55), 0.22)} 100%)`;
  const floor = `linear-gradient(to bottom, ${shade(soft, -0.66)} 0%, ${shade(soft, -0.78)} 45%, ${shade(soft, -0.85)} 100%)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(club, -0.8), color: WHITE }}>
      {/* Sky and floor. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: hz, background: sky }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: hz, bottom: 0, background: floor }} />
      {/* A low glow over the line, brightest behind him. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: hz - 260,
          height: 420,
          background: `radial-gradient(55% 50% at ${(feetX / CANVAS_W) * 100}% 62%, rgba(255,255,255,.16), transparent 70%)`,
        }}
      />

      {/* The horizon line. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: hz, height: 1, background: "rgba(255,255,255,.55)" }} />

      {/* Contact shadow, then the player. */}
      {data.photoUrl && box.feet && (
        <div
          style={{
            position: "absolute",
            left: feetX - box.width * 0.42,
            top: hz - 8,
            width: box.width * 0.84,
            height: 34,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(0,0,0,.55), rgba(0,0,0,.25) 55%, transparent)",
            filter: "blur(4px)",
          }}
        />
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.04) drop-shadow(0 10px 24px rgba(0,0,0,.25))",
            ...cutMask(data.cut),
          }}
        />
      )}

      {/* Labels hanging from ticks on the line. */}
      {stack ? (
        <div
          style={{
            position: "absolute",
            left: freeL,
            width: freeR - freeL,
            top: hz,
            display: "flex",
            flexDirection: "column",
            alignItems: right ? "flex-start" : "flex-end",
          }}
        >
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.55)" }} />
          {labels.map((l, i) => (
            <div key={i} style={{ ...label, marginTop: i === 0 ? 18 : 16, marginRight: right ? 0 : `-${labTrack}em` }}>
              {l}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: "absolute", left: freeL, width: freeR - freeL, top: hz, display: "flex", justifyContent: "space-between" }}>
          {labels.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: i === 0 ? "flex-start" : i === labels.length - 1 ? "flex-end" : "center",
              }}
            >
              <div style={{ width: 1, height: story ? 18 : 14, background: "rgba(255,255,255,.55)" }} />
              <div
                style={{
                  ...label,
                  marginTop: story ? 18 : 14,
                  paddingLeft: i === labels.length - 1 ? 0 : 0,
                  marginRight: i === labels.length - 1 ? `-${labTrack}em` : 0,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Title on the open side. */}
      <div
        style={{
          position: "absolute",
          top: titleTop,
          left: right ? MARGIN : undefined,
          right: right ? undefined : MARGIN,
          width: tw,
          textAlign: right ? "left" : "right",
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: `${tracking}em`,
            whiteSpace: "nowrap",
            marginLeft: right ? -size * 0.04 : 0,
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              marginTop: story ? 24 : 20,
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: subSize,
              color: "rgba(255,255,255,.7)",
              whiteSpace: "nowrap",
            }}
          >
            {sub}
          </div>
        )}
      </div>

      {/* Crests small, opposite the title. */}
      {crests.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: titleTop + 4,
            right: right ? MARGIN : undefined,
            left: right ? undefined : MARGIN,
            display: "flex",
            gap: 14,
            alignItems: "center",
          }}
        >
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: story ? 62 : 44, height: story ? 62 : 44, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* The agency mark at the foot of the open side, under the labels' first column. */}
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
