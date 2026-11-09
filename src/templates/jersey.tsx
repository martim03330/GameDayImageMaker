/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, figureBox, Film, GradedFigure, type Box } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY, fitSize, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const OFF = "#eeece7";
const INK = "#15161a";
/** Where the club colour meets the off-white floor. */
const SPLIT = 830;

/** The number on the back: shirt number, else the goals scored, else the initials. */
function shirtNumber(data: RenderData): string {
  const n = data.player.number?.trim();
  if (n) return n;
  if (data.postType === "goal") {
    const g = data.content.stats.find((s) => /golo/i.test(s.label))?.value;
    if (g && /^\d{1,2}$/.test(g)) return g;
  }
  return `${data.content.firstName[0] ?? ""}${data.content.lastName[0] ?? ""}`.toUpperCase();
}

/** Where the player stands: full body on the floor, cut photos anchored to the bottom edge, busts in the corner. */
function place(data: RenderData, right: boolean): { box: Box; kind: "full" | "cut" | "bust" } {
  const aspect = data.photoAspect ?? 0.5;
  const faceH = data.face?.[3] ?? 0.12;
  const dir = right ? 1 : -1;
  if (aspect > 0.8 || faceH > 0.22) {
    const h = Math.min(800 / aspect, 980);
    const w = h * aspect;
    return { box: figureBox(data, 540 + dir * (540 - w / 2 + w * 0.08), 0, h), kind: "bust" };
  }
  if ((data.cut.bottom ?? 0) > 0.3) {
    const h = 1120;
    const w = h * aspect;
    return { box: figureBox(data, 540 + dir * (540 - w / 2 - 90), 0, h), kind: "cut" };
  }
  // An arm cut by the photo frame on the outer side leaves the canvas there instead of fading in mid-air.
  const outerCut = (right ? data.cut.right : data.cut.left) ?? 0;
  const w = 990 * (data.params.playerScale ?? 1) * aspect;
  const cx = outerCut > 0.15 ? 540 + dir * (550 - w / 2) : 540 + dir * 70;
  return { box: figureBox(data, cx, 175, 990), kind: "full" };
}

/** The facts under the name, per post type. */
function detailLines(data: RenderData): string[] {
  const c = data.content;
  const up = (s?: string) => (s ?? "").toUpperCase();
  switch (data.postType) {
    case "goal":
    case "result":
      if (c.homeTeam && c.awayTeam) return [`${up(c.homeTeam)}  ${c.homeGoals ?? 0}–${c.awayGoals ?? 0}  ${up(c.awayTeam)}`];
      return c.stats.slice(0, 2).map((s) => `${s.value} ${up(s.label)}`);
    case "matchday":
      return [[c.date, c.time].filter(Boolean).join("  ·  ").toUpperCase(), opponentOf(data) ? `VS ${up(opponentOf(data))}` : ""].filter(Boolean);
    case "renewal":
      return [c.until ? `CONTRATO ATÉ ${up(c.until)}` : up(data.club?.name)];
    default:
      return [c.stats.slice(0, 3).map((s) => `${s.value} ${up(s.label)}`).join("  ·  ")].filter(Boolean);
  }
}

/** Halftone dot patch, fading out diagonally. */
function Dots({ w, h, color, style }: { w: number; h: number; color: string; style: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        backgroundImage: `radial-gradient(${color} 2.4px, transparent 2.8px)`,
        backgroundSize: "22px 22px",
        WebkitMaskImage: "linear-gradient(135deg, #000 10%, transparent 80%)",
        maskImage: "linear-gradient(135deg, #000 10%, transparent 80%)",
        ...style,
      }}
    />
  );
}

/**
 * Giant shirt number (Højlund / Pogba): club colour over an off-white floor, the number switching colour
 * across the split, the player in front, the name small beside his legs.
 */
export function Jersey({ data }: { data: RenderData }) {
  const { params, content } = data;
  const right = params.side !== "left";
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.55);
  const scale = params.textScale ?? 1;
  const { box, kind } = place(data, right);
  const num = shirtNumber(data);
  const stadium = data.club?.stadium && data.club.stadium.length <= 30 ? data.club.stadium : data.club?.name ?? "";
  const sideCut = (data.cut.left ?? 0) > 0.05 || (data.cut.right ?? 0) > 0.05;

  // Number: as tall as possible inside ~860px of width.
  const numSize = Math.min(820, fitSize(num, 820, 820, 0.5));
  const numTop = 250;
  const numCx = 540 + (right ? -30 : 30);

  // Text column on the side away from the player.
  const edgeGap = kind === "full" ? box.width * 0.1 : kind === "cut" ? box.width * 0.04 : 0;
  const inner = right ? box.left + edgeGap : CANVAS_W - (box.left + box.width) + edgeGap;
  const colW = Math.max(230, Math.min(420, inner - 72 - 26));
  const side = (x: number): CSSProperties => (right ? { left: x } : { right: x });
  const align = right ? "left" : "right";

  const first = content.firstName.toUpperCase();
  const last = content.lastName.toUpperCase();
  const lastSize = Math.min(78 * scale, fitSize(last, colW, 78 * scale, 0.78, 1));
  const firstSize = Math.min(30, fitSize(first, colW, 30, 0.72, 4));
  const lines = detailLines(data);
  const clubTag = (data.club?.name ?? "")
    .toUpperCase()
    .replace(/\b(FC|CF|SC|CD|FK|AC)\b/g, "")
    .replace(/[^A-Z0-9À-Ü]/g, "");
  const numLayer = (color: string): CSSProperties => ({
    position: "absolute",
    left: numCx - 600,
    width: 1200,
    top: numTop,
    textAlign: "center",
    fontFamily: DISPLAY,
    fontSize: numSize,
    lineHeight: 0.86,
    letterSpacing: "-0.02em",
    color,
    transform: "skewX(-8deg)",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: OFF, color: INK }}>
      {/* Club colour, lit from the centre. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: SPLIT,
          background: `radial-gradient(70% 60% at 50% 55%, ${shade(accent, 0.08)} 0%, ${accent} 55%, ${shade(accent, -0.22)} 100%)`,
        }}
      />
      {/* Off-white floor with a soft horizon. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: SPLIT, bottom: 0, background: `linear-gradient(to bottom, #e3e1dc, ${OFF} 22%, #f4f3ef 100%)` }} />

      {/* Ornaments (Pogba): halftone, crosses, stripes, chevrons. */}
      <Dots w={300} h={240} color={shade(accent, 0.3)} style={{ top: 150, ...(right ? { right: -30, transform: "scaleX(-1)" } : { left: -30 }), opacity: 0.5 }} />
      <Dots w={260} h={220} color={shade(accent, 0.18)} style={{ top: SPLIT - 250, ...(right ? { right: -10, transform: "scale(-1)" } : { left: -10, transform: "scaleY(-1)" }), opacity: 0.45 }} />
      <div
        style={{
          position: "absolute",
          top: 190,
          ...(right ? { right: 64 } : { left: 64 }),
          display: "grid",
          gridTemplateColumns: "repeat(3, 22px)",
          gap: 8,
          fontFamily: ARCHIVO_BLACK,
          fontSize: 22,
          lineHeight: "22px",
          color: OFF,
          opacity: 0.9,
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ textAlign: "center" }}>
            ×
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: SPLIT - 70,
          ...(right ? { left: 0 } : { right: 0 }),
          width: 110,
          height: 40,
          background: `repeating-linear-gradient(-45deg, ${OFF} 0 7px, transparent 7px 17px)`,
          opacity: 0.85,
        }}
      />

      {/* Giant number: off-white on the club colour, club colour on the floor. */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${CANVAS_H - SPLIT}px 0)` }}>
        <div style={numLayer(OFF)}>{num}</div>
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${SPLIT}px 0 0 0)` }}>
        <div style={numLayer(accent)}>{num}</div>
      </div>

      {/* Thin frame bracket on the free side, with the position (Pogba). */}
      <div style={{ position: "absolute", top: 180, ...side(72), display: "flex", alignItems: "center", flexDirection: right ? "row" : "row-reverse", gap: 14 }}>
        <span style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 24, letterSpacing: "0.22em", color: OFF, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {data.player.position || data.club?.name}
        </span>
        <span style={{ width: 120, height: 2, background: OFF, opacity: 0.8 }} />
      </div>
      <div style={{ position: "absolute", top: 222, ...side(72), width: 2, height: 440, background: `linear-gradient(to bottom, ${OFF}cc, ${OFF}00)` }} />
      {stadium && (
        <div
          style={{
            position: "absolute",
            top: 470,
            ...(right ? { right: 72 } : { left: 72 }),
            writingMode: "vertical-rl",
            fontFamily: MONO,
            fontSize: Math.max(12, Math.min(14, fitSize(stadium, 330, 14, 0.62, 4))),
            letterSpacing: "0.3em",
            color: OFF,
            opacity: 0.85,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {stadium}
        </div>
      )}

      {/* Player. */}
      <GradedFigure
        data={data}
        box={box}
        shadow={kind === "full"}
        style={{ filter: sideCut ? undefined : "drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff)" }}
      />
      {kind === "full" && (
        <div
          style={{
            position: "absolute",
            left: box.left + box.width * 0.05,
            width: box.width * 0.9,
            top: box.top + box.height - 14,
            height: 30,
            borderRadius: "50%",
            background: "rgba(0,0,0,.18)",
            filter: "blur(14px)",
          }}
        />
      )}

      {/* Top row: agency, hashtag, crest. */}
      <AgencyLogo data={data} height={26} style={{ position: "absolute", top: 70, ...side(72) }} />
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: ARCHIVO_BLACK,
          fontSize: 20,
          letterSpacing: "0.24em",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: OFF }}>#SOMOS</span>
        {clubTag && <span style={{ color: deep }}>{clubTag}</span>}
      </div>
      <Crest club={data.club} size={62} style={{ position: "absolute", top: 52, ...(right ? { right: 72 } : { left: 72 }), filter: "drop-shadow(0 4px 10px rgba(0,0,0,.3))" }} />

      {/* Name beside the legs, then the facts. */}
      <div style={{ position: "absolute", ...side(72), width: colW, bottom: 76, textAlign: align }}>
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: firstSize, letterSpacing: 4, lineHeight: 1, color: accent }}>{first}</div>
        <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: lastSize, letterSpacing: 1, lineHeight: 1.02, color: INK, marginTop: 6, whiteSpace: "nowrap" }}>{last}</div>
        <div style={{ display: "flex", justifyContent: right ? "flex-start" : "flex-end", margin: "22px 0 20px" }}>
          <span style={{ width: 54, height: 5, background: accent }} />
        </div>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 34, lineHeight: 1, letterSpacing: "0.06em", textTransform: "uppercase", color: INK }}>{content.kicker}</div>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: CONDENSED,
              fontWeight: 600,
              fontSize: Math.min(24, fitSize(l, colW, 24, 0.46, 1.5)),
              letterSpacing: "0.06em",
              lineHeight: 1.25,
              marginTop: i ? 0 : 8,
              color: shade(INK, 0.25),
              whiteSpace: "nowrap",
            }}
          >
            {l}
          </div>
        ))}
        {content.subline && (
          <div
            style={{
              fontFamily: MONO,
              fontSize: Math.min(14, fitSize(content.subline, colW, 14, 0.62, 2.5)),
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: shade(INK, 0.45),
              marginTop: 14,
              whiteSpace: "nowrap",
            }}
          >
            {content.subline}
          </div>
        )}
      </div>

      {/* Chevrons on the floor, player side. */}
      {kind === "full" && <div
        style={{
          position: "absolute",
          bottom: 70,
          ...(right ? { right: 72 } : { left: 72, transform: "scaleX(-1)" }),
          fontFamily: ARCHIVO_BLACK,
          fontSize: 26,
          letterSpacing: 4,
          color: accent,
          opacity: 0.9,
        }}
      >
        ›››
      </div>}
      <Film strength={0.5} />
    </div>
  );
}
