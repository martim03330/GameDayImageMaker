/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

const OFF = "#f1efe9";

/**
 * Coach · tactics board (matchday) — a deep club-colour ground with a faint hairline pitch drawn on it like a
 * tactics board (outline, halfway line, centre circle, boxes), a few chalk X / O marks and one dashed run; the
 * NEYOD mark at the top, "HEAD COACH" and his name small and spaced, "MATCHDAY" across the width in off-white
 * condensed caps, his bust large in front of the word's foot, fading into the ground under a quiet fixture foot.
 */
export function Coachboard({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const f = matchFacts(data);
  const r = rng(params.seed ?? 11);

  /* ---- the ground: a deep club colour, never light, never flat black ---- */
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.3) club = vivid(params.accent);
  let deep = club;
  for (let i = 0; i < 6 && luminance(deep) > 0.06; i++) deep = shade(deep, -0.2);
  if (luminance(deep) < 0.012) deep = shade(deep, 0.12);
  const lift = shade(deep, 0.14);
  const low = shade(deep, -0.35);
  let accent = params.accent && params.accent !== params.primary ? params.accent : OFF;
  if (luminance(accent) < 0.25) accent = OFF;

  /* ---- the top: logo, label, name, word ---- */
  const M = story ? 70 : 80;
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_TOP : 54) - (params.logoY ?? 0);
  const label = (data.player?.position || "Head Coach").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const labelSize = 15 * k * ts;
  const labelTop = (story ? STORY_TOP : 54) + logoH + (story ? 62 : 44);
  const nameSize = Math.min(27 * k * ts, 820 / Math.max(1, name.length * 1.1));
  const nameTop = labelTop + labelSize + 14 * k;
  const face = FACES.anton;
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const size = Math.min(((CANVAS_W - 2 * M) * ts) / Math.max(0.5, wordEm(face, word)), ((story ? 250 : 210) * ts) / face.cap);
  const capTop = nameTop + nameSize + (story ? 40 : 30) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  /* ---- the foot, bottom-up ---- */
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 56;
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = Math.min(15.5 * k * ts, (CANVAS_W - 2 * 80) / Math.max(1, line.length * 0.92));
  const lineTop = footBottom - lineSize;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(50 * k);
  const fixture = [homeName, awayName].filter(Boolean).join(" v ");
  const fixAvail = CANVAS_W - 2 * 60 - 2 * (crest + 22 * k);
  const fixSize = Math.min(21 * k * ts, fixAvail / Math.max(1, fixture.length * 0.8));
  const rowTop = lineTop - (line ? 24 * k : 0) - crest;
  const footTop = rowTop;

  /* ---- the coach: his crown just over the word's foot, big, the whole head clear of the foot ---- */
  const base = story ? { chest: 400, waist: 400, knees: 360, full: 320 } : { chest: 300, waist: 300, knees: 270, full: 240 };
  const faceX = CANVAS_W / 2 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const overlap = story ? 34 : 26; // his crown overlaps the word's foot a little: he stands in front of it
  let box = placeByFace(data, faceX, baseline + 100, base);
  let faceTop = baseline + 100;
  for (let shrink = 1; shrink > 0.5; shrink -= 0.06) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    faceTop = baseline + 100;
    for (let i = 0; i < 3; i++) faceTop += baseline - overlap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    if (faceTop + (params.playerY ?? 0) + box.faceH * 1.6 < footTop - 30) break;
  }
  // Centre his body (not his face) on the canvas, within reason.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const headBottom = faceTop + (params.playerY ?? 0) + box.faceH * 1.5;
  const fadeFrom = Math.max(headBottom, footTop - (story ? 260 : 190));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.3) ${footTop + crest * 0.6}px, transparent ${Math.min(H, footBottom + 30)}px)`;
  const bodyCx = box.left + box.width / 2;

  /* ---- the board: a hairline pitch, top-down, filling the canvas ---- */
  const px = 64;
  const pw = CANVAS_W - 2 * px;
  const py = story ? 110 : 70;
  const ph = H - 2 * py;
  const midY = py + ph / 2;
  const boxW = pw * 0.6;
  const boxH = ph * 0.15;
  const sixW = pw * 0.28;
  const sixH = ph * 0.055;
  const circle = pw * 0.17;
  const chalk = "rgba(241,239,233,.11)";
  const sw = story ? 2.4 : 2;

  // Marks, in the free side bands left and right of him (a back line of O's, their X's, one run).
  const leftBand = Math.max(110, Math.min(220, box.left + box.width * 0.1 - 40));
  const rightBand = Math.min(CANVAS_W - 110, Math.max(CANVAS_W - 220, box.left + box.width * 0.9 + 40));
  const y0 = baseline + (story ? 170 : 120);
  const span = Math.max(200, footTop - 120 - y0);
  const jitter = () => (r() - 0.5) * 30;
  const markS = story ? 30 : 24;
  const marks: { kind: "x" | "o"; x: number; y: number }[] = [
    { kind: "o", x: Math.min(leftBand, 170) + jitter(), y: y0 + span * 0.18 },
    { kind: "x", x: Math.min(leftBand, 170) - 40 + jitter(), y: y0 + span * 0.62 },
    { kind: "o", x: Math.max(rightBand, CANVAS_W - 170) + jitter(), y: y0 + span * 0.42 },
  ];
  const a = marks[1];
  const b = { x: marks[0].x + 30, y: marks[0].y + markS * 1.6 };
  const ctrl = { x: a.x - 70, y: (a.y + b.y) / 2 };
  // The arrow head at b, along the curve's last tangent.
  const ang = Math.atan2(b.y - ctrl.y, b.x - ctrl.x);
  const ah = story ? 18 : 14;
  const head = [ang - 0.45, ang + 0.45].map((t) => `${b.x - Math.cos(t) * ah},${b.y - Math.sin(t) * ah}`);
  const markInk = "rgba(241,239,233,.34)";

  const spaced = (fs: number, sp: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: SANS,
    fontSize: fs,
    lineHeight: 1,
    letterSpacing: `${sp}em`,
    paddingLeft: `${sp}em`,
    whiteSpace: "nowrap",
    ...extra,
  });
  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} /> : <div style={{ width: crest, flexShrink: 0 }} />;

  const heroTop = capTop - size * (1 - face.cap) * 0.9;
  const heroY = size * (1 - face.cap) * 0.9 + size * face.cap;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 42% at ${(bodyCx / CANVAS_W) * 100}% ${((faceTop + box.faceH) / H) * 100}%, ${lift}, transparent 75%), linear-gradient(to bottom, transparent 55%, ${low})` }} />

      {/* The board. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke={chalk} strokeWidth={sw}>
          <rect x={px} y={py} width={pw} height={ph} />
          <line x1={px} y1={midY} x2={px + pw} y2={midY} />
          <circle cx={CANVAS_W / 2} cy={midY} r={circle} />
          <rect x={CANVAS_W / 2 - boxW / 2} y={py} width={boxW} height={boxH} />
          <rect x={CANVAS_W / 2 - sixW / 2} y={py} width={sixW} height={sixH} />
          <rect x={CANVAS_W / 2 - boxW / 2} y={py + ph - boxH} width={boxW} height={boxH} />
          <rect x={CANVAS_W / 2 - sixW / 2} y={py + ph - sixH} width={sixW} height={sixH} />
          <path d={`M ${CANVAS_W / 2 - circle * 0.75} ${py + boxH} A ${circle} ${circle} 0 0 0 ${CANVAS_W / 2 + circle * 0.75} ${py + boxH}`} />
          <path d={`M ${CANVAS_W / 2 - circle * 0.75} ${py + ph - boxH} A ${circle} ${circle} 0 0 1 ${CANVAS_W / 2 + circle * 0.75} ${py + ph - boxH}`} />
        </g>
        <circle cx={CANVAS_W / 2} cy={midY} r={4} fill={chalk} />
        <g fill="none" stroke={markInk} strokeWidth={story ? 3.2 : 2.6} strokeLinecap="round">
          {marks.map((m, i) =>
            m.kind === "o" ? (
              <circle key={i} cx={m.x} cy={m.y} r={markS / 2} />
            ) : (
              <path key={i} d={`M ${m.x - markS / 2} ${m.y - markS / 2} L ${m.x + markS / 2} ${m.y + markS / 2} M ${m.x + markS / 2} ${m.y - markS / 2} L ${m.x - markS / 2} ${m.y + markS / 2}`} />
            ),
          )}
          <path d={`M ${a.x} ${a.y - markS} Q ${ctrl.x} ${ctrl.y} ${b.x} ${b.y}`} strokeDasharray={story ? "9 10" : "7 8"} strokeWidth={story ? 2.4 : 2} />
          <polyline points={`${head[0]} ${b.x},${b.y} ${head[1]}`} strokeWidth={story ? 2.4 : 2} />
        </g>
      </svg>

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: heroTop, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={heroY} textAnchor="middle" style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: OFF, letterSpacing: 0 }}>
          {word}
        </text>
      </svg>

      {/* The coach, in front of the word's foot, fading out under the fixture. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          {/* (the shadow sits on a wrapper: on the masked img itself it would be clipped to the img's box) */}
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 40px rgba(0,0,0,.45))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - (story ? 220 : 160), bottom: 0, background: `linear-gradient(to bottom, ${low}00, ${low}cc ${story ? 170 : 125}px, ${low})` }} />

      {/* Label and name. */}
      <div style={spaced(labelSize, 0.5, { top: labelTop, fontWeight: 700, color: accent })}>{label}</div>
      {name && <div style={spaced(nameSize, 0.42, { top: nameTop, fontWeight: 800, color: OFF })}>{name}</div>}

      {/* The fixture foot. */}
      <div style={{ position: "absolute", left: 60, right: 60, top: rowTop, height: crest, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 * k }}>
        {crestImg(homeCrest)}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: fixSize, letterSpacing: "0.1em", color: OFF, whiteSpace: "nowrap" }}>
          {homeName}
          <span style={{ color: accent, fontWeight: 500, margin: "0 0.45em" }}>v</span>
          {awayName}
        </div>
        {crestImg(awayCrest)}
      </div>
      {line && <div style={spaced(lineSize, 0.3, { top: lineTop, fontWeight: 600, color: "rgba(241,239,233,.66)" })}>{line}</div>}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
