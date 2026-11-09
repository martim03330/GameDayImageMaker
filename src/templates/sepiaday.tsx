/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance } from "@/lib/color";
import { ARCHIVO, cutMask } from "./fx";
import { rng } from "./kit";
import { crestsOf, OwnPhotoBlur, scoreOf } from "./outline";
import { cleanCompetition } from "./sepia";
import { matchFacts } from "./strokes";
import { DISPLAY } from "./shared";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** The warm palette of the print: paper cream, tan and the deep brown of the shadows. */
const CREAM = "#f2e8d8";
const GOLD = "#c2965d";
const BROWN = "#191310";

/** Anton: average advance of its capitals, relative to the font size. */
const ANTON_ADV = 0.48;
/** Archivo caps with wide tracking. */
const advCaps = (t: string, tracking: number) => t.length * (0.62 + tracking);

/** The sepia grade every photo in this look goes through. */
const SEPIA = "sepia(1) saturate(1.45) hue-rotate(-14deg) contrast(1.06) brightness(.94)";

/** "2026-10-10" → "10.10.26". */
function dotted(iso?: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  return m ? `${m[3]}.${m[2]}.${m[1].slice(2)}` : "";
}

/** A spaced caps line between two small squares, as in the reference. */
function Marked({ text, y, size, color, tracking = 0.16, weight = 600 }: { text: string; y: number; size: number; color: string; tracking?: number; weight?: number }) {
  if (!text) return null;
  const s = Math.min(size, 800 / advCaps(text, tracking));
  const sq = { width: s * 0.3, height: s * 0.3, background: color, opacity: 0.9 };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", alignItems: "center", justifyContent: "center", gap: s * 0.62 }}>
      <div style={sq} />
      <div style={{ fontFamily: ARCHIVO, fontWeight: weight, fontSize: s, letterSpacing: `${tracking}em`, color, whiteSpace: "nowrap", textIndent: `${tracking}em` }}>{text}</div>
      <div style={sq} />
    </div>
  );
}

/** Thin corner brackets around a crest. */
function Bracketed({ x, y, size, children }: { x: number; y: number; size: number; children: React.ReactNode }) {
  const arm = size * 0.24;
  const b = (h: "left" | "right", v: "top" | "bottom") => (
    <div key={`${h}${v}`}>
      <div style={{ position: "absolute", [h]: 0, [v]: 0, width: arm, height: 2, background: CREAM, opacity: 0.7 }} />
      <div style={{ position: "absolute", [h]: 0, [v]: 0, width: 2, height: arm, background: CREAM, opacity: 0.7 }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      {b("left", "top")}
      {b("right", "top")}
      {b("left", "bottom")}
      {b("right", "bottom")}
      <div style={{ position: "absolute", inset: size * 0.17, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/** The kicker as one or two lines; everything but the last word is gold, the last word cream-white. */
function titleLines(kicker: string): string[] {
  const k = (kicker || "MATCH DAY").toUpperCase().replace(/\b(MATCH|GAME)DAY\b/, "$1 DAY").replace(/\bFULLTIME\b/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return [words.join(" ")];
  // Three words or more: balance the two lines by length.
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d <= diff) [diff, best] = [d, i];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/**
 * Warm sepia match-day print (Angers SCO): the player graded golden-brown over the whole canvas with a
 * soft out-of-focus shape in front of him, fine grain and thin cream crop lines; a tiny fixture line at
 * the top, the two teams in spaced caps and a huge condensed title — half gold, half white — flanked by
 * the crests in corner brackets; kick-off, the club crest and the small print at the foot.
 */
export function Sepiaday({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 67);
  const f = matchFacts(data);
  const uid = `sd${(params.seed ?? 67) % 997}`;
  const dir = params.side === "left" ? -1 : 1;

  /* ---------- the player ---------- */
  const face = data.face ?? [0.4, 0.08, 0.22, 0.13];
  const aspect = data.photoAspect ?? 0.55;
  const faceH = Math.min(306, data.facePx > 0 ? Math.max(160, data.facePx * 1.9) : 306) * (params.playerScale ?? 1);
  // Two lines of title need more room above the head.
  const twoLine = titleLines(content.kicker).length > 1;
  const faceTop = (twoLine ? 502 : 424) + Math.round(r() * 22);
  const h = faceH / face[3];
  const w = h * aspect;
  const faceCx = 540 + dir * (26 + r() * 26);
  const left = faceCx - (face[0] + face[2] / 2) * w + (params.playerX ?? 0);
  const top = faceTop - face[1] * h + (params.playerY ?? 0);
  const box = { left, top, width: w, height: h };
  // A bust that stops short of the bottom edge dissolves into the warm dark instead of ending on a line.
  const short = top + h < CANVAS_H + 10;
  const dissolve = short ? "linear-gradient(to bottom, #000 84%, transparent 99%)" : undefined;
  const mask: CSSProperties = dissolve ? { WebkitMaskImage: dissolve, maskImage: dissolve } : cutMask(data.cut);

  /* ---------- the lines of type ---------- */
  const comp = cleanCompetition(f.comp || content.subline.split("·")[0]?.trim() || "").toUpperCase();
  const when = dotted(data.fixtures?.[0]?.date) || f.date || (content.date ?? "").toUpperCase();
  const venue = (content.venue || data.club?.stadium || "").toUpperCase();
  const playerName = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  const fixture = postType === "matchday" || postType === "result";
  const teams = fixture
    ? [content.homeTeam, content.awayTeam].filter(Boolean).join(" - ").toUpperCase() || [data.club?.name, f.opp].filter(Boolean).join(" - ").toUpperCase()
    : playerName;
  const score = scoreOf(data, "-");
  const stat = content.stats.find((s) => String(s.value ?? "").trim() !== "");
  const foot =
    postType === "result"
      ? score
        ? `FULL TIME - ${score}`
        : ""
      : postType === "matchday"
        ? f.time
          ? `KICK-OFF - ${f.time}`
          : when
            ? `KICK-OFF - ${when}`
            : ""
        : postType === "renewal"
          ? content.until
            ? `SIGNED UNTIL - ${content.until.toUpperCase()}`
            : ""
          : stat
            ? `${stat.label.toUpperCase()} - ${String(stat.value).toUpperCase()}`
            : comp;

  // Both crests or none: one crest alone on the left of the title just looks like a mistake.
  const all = fixture ? crestsOf(data) : [];
  const crests = all.length === 2 ? all : [];
  const lines = titleLines(content.kicker);
  // The title runs between the crests (or nearly edge to edge when there are none).
  const titleW = crests.length ? 594 : 800;
  const size = Math.min(
    lines.length > 1 ? 162 : 198,
    ...lines.map((l) => titleW / (l.length * ANTON_ADV)),
  );
  // "MATCHDAY" is set as one word in two colours, as in the reference; a longer title keeps its spaces.
  const glued = lines.length === 1 && lines[0].split(" ").length === 2;
  const titleTop = 222;
  const titleH = size * (lines.length > 1 ? 1.62 : 0.78);
  const crestY = titleTop + titleH / 2;
  const topLine = (fixture ? [comp, when, venue] : [(data.club?.name ?? "").toUpperCase(), cleanCompetition(content.subline).toUpperCase()])
    .filter(Boolean)
    .join(", ");

  // A black kit swallows the whole print: open it up a stop.
  const dark = luminance(params.primary === "#10131c" ? params.accent : params.primary) < 0.1;
  const blob = `radial-gradient(62% 54% at ${dir > 0 ? 34 : 66}% 74%, #000 38%, rgba(0,0,0,.55) 62%, transparent 82%)`;

  const img = (style: CSSProperties, filter: string, key?: string) =>
    data.photoUrl ? (
      <img key={key} src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter, ...mask, ...style }} />
    ) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: BROWN, color: CREAM }}>
      <MonoDefs id={`${uid}mono`} ink={0.5} />

      {/* His own photo, heavily blurred and graded warm, as the light of the scene. */}
      <OwnPhotoBlur data={data} blur={52} style={{ filter: `blur(52px) ${SEPIA}`, opacity: 0.85 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(74% 50% at ${((faceCx / CANVAS_W) * 100).toFixed(1)}% ${(((faceTop + faceH * 0.6) / CANVAS_H) * 100).toFixed(1)}%, rgba(214,174,120,.42), rgba(25,19,16,.18) 52%, rgba(20,15,12,.72) 100%)`,
        }}
      />

      {/* The player. */}
      {img({}, `${SEPIA} contrast(1.1) brightness(${dark ? 1.16 : 1})`)}

      {/* Out-of-focus warm shape in front of him: the same body, enlarged and thrown out of focus. */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: dir > 0 ? -w * 0.72 : CANVAS_W - w * 0.98,
            top: box.top + h * 0.6,
            width: w * 1.7,
            height: h * 1.7,
            filter: "blur(48px) saturate(1.15) brightness(.46)",
            opacity: 0.94,
            // A soft blob rather than a second figure: only the out-of-focus mass near the bottom corner.
            WebkitMaskImage: blob,
            maskImage: blob,
          }}
        >
          {data.photoUrl && (
            <img src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", filter: SEPIA }} />
          )}
        </div>
      </div>

      {/* Everything photographic pulled into one warm hue. */}
      <div style={{ position: "absolute", inset: 0, background: "#a0703d", mixBlendMode: "color", opacity: 0.62, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(60,40,24,.3), rgba(24,17,12,.45))", mixBlendMode: "multiply", pointerEvents: "none" }} />

      {/* Warm scrims so the type always reads. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(23,17,13,.82) 0%, rgba(23,17,13,.24) 30%, rgba(23,17,13,0) 46%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(23,17,13,.7) 0%, rgba(23,17,13,.12) 22%, rgba(23,17,13,0) 34%)" }} />

      {/* Crop lines: a thin cream grid, as on a printer's sheet. */}
      {[200, 880].map((x) => (
        <div key={x} style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 1, background: CREAM, opacity: 0.16 }} />
      ))}
      {[232, 1032].map((y) => (
        <div key={y} style={{ position: "absolute", top: y, left: 0, right: 0, height: 1, background: CREAM, opacity: 0.16 }} />
      ))}

      {/* Top: the fixture in tiny caps. */}
      {topLine && (
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 54,
            textAlign: "center",
            fontFamily: ARCHIVO,
            fontWeight: 500,
            fontSize: Math.min(17, 880 / advCaps(topLine, 0.14)),
            letterSpacing: "0.14em",
            color: CREAM,
            opacity: 0.85,
            whiteSpace: "nowrap",
          }}
        >
          {topLine}
        </div>
      )}

      {/* The two teams (or the player). */}
      <Marked text={teams} y={150} size={31} color={CREAM} tracking={0.15} />

      {/* The title: everything but the last word gold, the last word white. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", fontFamily: DISPLAY, fontSize: size, lineHeight: lines.length > 1 ? 0.84 : 0.78, letterSpacing: "-0.005em" }}>
        {lines.map((l, i) => {
          const words = l.split(" ");
          const last = words.length > 1 && i === lines.length - 1;
          return (
            <div key={i} style={{ whiteSpace: "nowrap" }}>
              {last ? (
                <>
                  <span style={{ color: GOLD }}>{words.slice(0, -1).join(" ") + (glued ? "" : " ")}</span>
                  <span style={{ color: "#fbf7ef" }}>{words[words.length - 1]}</span>
                </>
              ) : (
                <span style={{ color: i === lines.length - 1 ? "#fbf7ef" : GOLD }}>{l}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* The crests, flanking the title inside corner brackets. */}
      {crests.map((c, i) => (
        <Bracketed key={i} x={i === 0 ? 148 : CANVAS_W - 148} y={crestY} size={168}>
          <img src={c} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: `url(#${uid}mono) drop-shadow(0 4px 10px rgba(0,0,0,.45))` }} />
        </Bracketed>
      ))}

      {/* Foot: kick-off, the club crest, the small print. */}
      <Marked text={foot} y={1020} size={25} color={CREAM} tracking={0.15} />
      {data.club?.crestUrl && (
        <img
          src={data.club.crestUrl}
          alt=""
          style={{ position: "absolute", left: 540 - 62, top: 1068, width: 124, height: 124, objectFit: "contain", filter: `url(#${uid}mono) drop-shadow(0 6px 16px rgba(0,0,0,.5))` }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 60,
          textAlign: "center",
          fontFamily: ARCHIVO,
          fontWeight: 500,
          fontSize: 13,
          letterSpacing: "0.22em",
          color: CREAM,
          opacity: 0.45,
        }}
      >
        {(data.club?.name ?? data.agency.name).toUpperCase()} ALL RIGHTS RESERVED
      </div>

      {/* Heavy fine grain. */}
      <Grain />
    </div>
  );
}

/** Coarse film grain over the whole print. */
function Grain() {
  const noise = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .95 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundImage: noise, backgroundSize: "260px 260px", opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: noise, backgroundSize: "130px 130px", opacity: 0.1, mixBlendMode: "soft-light", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(125% 92% at 50% 45%, transparent 55%, rgba(12,8,6,.55) 100%)", pointerEvents: "none" }} />
    </>
  );
}
