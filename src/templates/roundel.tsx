/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade, vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure } from "./fx";
import { opponentOf } from "./kit";
import { AgencyLogo, CONDENSED, Crest, DISPLAY, fitSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const P = { l: 56, t: 64, r: 1024, b: 1286 }; // dark panel

/** "JORNADA 6" → 6, "2.ª ELIMINATÓRIA" → 2.ª, "MEIAS-FINAIS" → MF… plus what the number counts. */
function roundOf(subline: string): { num: string; label: string } | null {
  const s = subline.toUpperCase();
  const j = s.match(/MATCHDAY\s*(\d+)/) ?? s.match(/ROUND\s*(\d+)/);
  if (j) return { num: j[1], label: "MATCHDAY" };
  const e = s.match(/(\d+)\s*\.?\s*([ªº])?\s*(ELIMINAT[ÓO]RIA|FASE|MÃO|RONDA)/);
  if (e) return { num: `${e[1]}.${e[2] ?? "ª"}`, label: e[3] };
  if (/MEIA/.test(s)) return { num: "½", label: "MEIA-FINAL" };
  if (/QUARTOS/.test(s)) return { num: "¼", label: "QUARTOS" };
  if (/\bFINAL\b/.test(s)) return { num: "F", label: "FINAL" };
  return null;
}

/** The competition part of the subline ("Liga 3 · JORNADA 6 · VS X" → "Liga 3"). */
const competitionOf = (subline: string) =>
  subline
    .split("·")
    .map((p) => p.trim())
    .filter((p) => p && !/MATCHDAY|ROUND|FINAL|PLAY-OFF|^VS\b/i.test(p))
    .join(" · ");

/** Club-colour grunge poster: hatched dark panel, giant initial, circular matchday stamp around the round number (Bellingham, BVB × Bayern). */
export function Roundel({ data: raw }: { data: RenderData }) {
  // No chosen photo: fall back to another cutout of the player, if there is one.
  const alt = !raw.photoUrl ? raw.cutouts[0] : undefined;
  const data: RenderData = alt ? { ...raw, photoUrl: alt.url, photoIsCutout: true, face: alt.face, photoAspect: alt.aspect, cut: alt.cut } : raw;
  const hasPhoto = !!data.photoUrl;
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const panel = shade(accent, -0.86);
  const isMatch = postType === "matchday";
  const round = roundOf(content.subline);
  const competition = competitionOf(content.subline);
  const opponent = opponentOf(data);

  // Player.
  const box = figureBox(data, 500, 0, 1170);
  const face = data.face
    ? {
        l: box.left + data.face[0] * box.width,
        r: box.left + (data.face[0] + data.face[2]) * box.width,
        t: box.top + data.face[1] * box.height,
        b: box.top + (data.face[1] + data.face[3]) * box.height,
      }
    : { l: 400, r: 600, t: 150, b: 400 };
  // Keep the face clear of the left column and of the stamp.
  if (face.l < 270) {
    const d = 270 - face.l;
    box.left += d;
    face.l += d;
    face.r += d;
  }

  // Stamp: top right, next to the head — pushed right, then lower, if the head (hair included) is in the way.
  const fw = face.r - face.l;
  const fh = face.b - face.t;
  const head = { l: face.l - fw * 0.45, r: face.r + fw * 0.45, t: face.t - fh * 0.75, b: face.b + fh * 0.2 };
  let R = 118;
  let cx = 800;
  let cy = 330;
  const hits = () => hasPhoto && head.r > cx - R - 40 && head.l < cx + R + 40 && head.b > cy - R - 40 && head.t < cy + R + 40;
  if (hits()) {
    // Squeeze it between the head and the panel edge…
    const fit = Math.floor((P.r - 40 - head.r - 14) / 2) - 40;
    if (fit >= 84) {
      R = Math.min(R, fit);
      cx = head.r + 14 + R + 40;
      cy = Math.max(P.t + 96 + R + 36, Math.min(cy, (head.t + head.b) / 2));
    } else {
      // …or drop it under the head as a solid stamp.
      cy = head.b + R + 50;
    }
  }
  const ringR = R + 28;

  const hg = content.homeGoals ?? "0";
  const ag = content.awayGoals ?? "0";
  const centre = isMatch ? (round?.num ?? (content.time || "VS")) : `${hg}-${ag}`;
  const centreSize = Math.min(fitSize(centre, R * 1.35, 150, 0.52), Math.round(R * 1.1));
  const centreLabel = isMatch ? (round?.label ?? "") : round ? `${round.label} ${round.num}` : "";
  const ringWord = isMatch ? content.kicker || "MATCHDAY" : postType === "goal" ? content.kicker || "GOAL" : "FULL TIME";
  const ringFont = Math.round(R / 4);
  const reps = Math.max(2, Math.round((2 * Math.PI * R) / (ringFont * 0.58 * (ringWord.length + 3))));
  const ringText = Array.from({ length: reps }, () => `${ringWord.toUpperCase()} · `).join("");

  // Giant letter behind the player: his initial.
  const initial = (content.lastName.trim()[0] ?? "N").toUpperCase();

  // Vertical word on the right: the opponent (matchday / result) or the scorer (goal).
  const side = (postType === "goal" ? content.lastName : opponent || content.lastName).toUpperCase();
  const sideTop = Math.max(cy + ringR + 40, 470);
  const sideLen = P.b - 110 - sideTop;
  const sideSize = Math.min(118, fitSize(side, sideLen, 118, 0.5));
  // With a big bust the ring sits low: no room left for a readable vertical word, so it is left out.
  const showSide = sideSize >= 56;

  // Outlined info boxes down the left column.
  const home = content.home !== false;
  const boxes: { label: string; text: string }[] = isMatch
    ? home || content.venue
      ? [
          { label: "Competition", text: competition },
          { label: "Stadium", text: content.venue || data.club?.stadium || "" },
        ]
      : [
          { label: "Competition", text: competition },
          { label: "Kick-off", text: [content.date, content.time].filter(Boolean).join(" · ") },
        ]
    : content.stats.length
      ? content.stats.slice(0, 2).map((s) => ({ label: s.label, text: s.value }))
      : [{ label: "Competition", text: competition }];

  const homeCrest = content.homeCrest ?? (home ? data.club?.crestUrl : null);
  const awayCrest = content.awayCrest ?? (!home ? data.club?.crestUrl : null);
  const crest = (src: string | null | undefined, key: string) =>
    src ? <img key={key} src={src} alt="" style={{ width: 104, height: 104, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(0,0,0,.5))" }} /> : null;

  const bottomLeft = isMatch ? [content.time, competition].filter(Boolean).join("  ·  ") : competition;
  const bottomRight = isMatch ? content.date ?? "" : `${content.firstName} ${content.lastName}`;

  const vText = (children: ReactNode, style: CSSProperties) => (
    <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap", ...style }}>{children}</div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: accent, color: "#fff", fontFamily: CONDENSED }}>
      {/* Paper-ish unevenness on the club colour. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 30% 20%, ${shade(accent, 0.12)}, transparent 70%), radial-gradient(70% 60% at 80% 90%, ${shade(accent, -0.18)}, transparent 70%)` }} />

      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="rd-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="rd-spray" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="4" seed="3" result="f" />
            <feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  18 0 0 0 -9.6" result="dots" />
            <feComposite in="SourceGraphic" in2="dots" operator="in" />
          </filter>
          <filter id="rd-spray2" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="4" seed="11" result="f" />
            <feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  18 0 0 0 -10.4" result="dots" />
            <feComposite in="SourceGraphic" in2="dots" operator="in" />
          </filter>
          <pattern id="rd-l1" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="22" fill="rgba(255,255,255,.075)" />
          </pattern>
          <pattern id="rd-l2" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <rect width="8" height="22" fill="rgba(255,255,255,.075)" />
          </pattern>
          <pattern id="rd-chk" width="360" height="360" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
            <rect width="180" height="180" fill="#fff" />
            <rect x="180" y="180" width="180" height="180" fill="#fff" />
          </pattern>
          <mask id="rd-mask">
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#rd-chk)" />
          </mask>
          <radialGradient id="rd-fade" cx="0.5" cy="0.45" r="0.6">
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.25" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </radialGradient>
          <mask id="rd-edge">
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#rd-fade)" />
          </mask>
        </defs>

        {/* Dark panel with torn / sprayed edges. */}
        <g filter="url(#rd-rough)">
          <rect x={P.l} y={P.t} width={P.r - P.l} height={P.b - P.t} fill={panel} />
        </g>
        <rect x={P.l} y={P.t} width={P.r - P.l} height={P.b - P.t} fill="none" stroke={panel} strokeWidth={56} filter="url(#rd-spray)" />
        <rect x={P.l + 22} y={P.t + 22} width={P.r - P.l - 44} height={P.b - P.t - 44} fill="none" stroke={accent} strokeWidth={40} filter="url(#rd-spray2)" opacity={0.75} />

        {/* Hatching in alternating directions, stronger towards the edges. */}
        <g mask="url(#rd-edge)">
          <rect x={P.l + 14} y={P.t + 14} width={P.r - P.l - 28} height={P.b - P.t - 28} fill="url(#rd-l1)" />
          <rect x={P.l + 14} y={P.t + 14} width={P.r - P.l - 28} height={P.b - P.t - 28} fill="url(#rd-l2)" mask="url(#rd-mask)" />
        </g>

        {/* Club-colour notches biting into the panel edges. */}
        {[
          [P.l - 20, 300, 1, 110],
          [P.l - 20, 880, 1, 80],
          [P.r + 20, 180, -1, 90],
          [P.r + 20, 560, -1, 120],
          [P.r + 20, 1080, -1, 70],
        ].map(([x, y, dir, w], i) => (
          <polygon key={i} points={`${x},${y} ${x + dir * w},${y + w * 0.9} ${x + dir * w},${y + w * 0.9 + 34} ${x},${y + 34}`} fill={accent} />
        ))}
      </svg>

      {/* Giant initial behind the player. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 110,
          textAlign: "center",
          fontFamily: DISPLAY,
          fontSize: 1180,
          lineHeight: 1,
          color: "transparent",
          backgroundImage: `linear-gradient(to bottom, transparent 55%, ${panel}66 100%), repeating-linear-gradient(-45deg, transparent 0 18px, ${panel}40 18px 24px), linear-gradient(${accent}, ${accent})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          transform: `translateX(${hasPhoto ? box.left + box.width / 2 - 540 : -40}px)`,
        }}
      >
        {initial}
      </div>

      {hasPhoto ? (
        <GradedFigure data={data} box={box} grade={accent} gradeStrength={0.18} />
      ) : (
        <div style={{ position: "absolute", left: 250, width: 420, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
          {[homeCrest, awayCrest].map((c, i) =>
            c ? (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
                {i === 1 && <div style={{ fontFamily: DISPLAY, fontSize: 44, lineHeight: 1, color: panel }}>VS</div>}
                <img src={c} alt="" style={{ width: 250, height: 250, objectFit: "contain", filter: "drop-shadow(0 16px 30px rgba(0,0,0,.55))" }} />
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Stamp. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <path id="rd-ring" d={`M ${cx - R},${cy} a ${R},${R} 0 1,1 ${2 * R},0 a ${R},${R} 0 1,1 ${-2 * R},0`} />
        </defs>
        <circle cx={cx} cy={cy} r={ringR + 8} fill={panel} opacity={0.88} />
        <circle cx={cx} cy={cy} r={ringR + 8} fill="none" stroke={accent} strokeWidth={2} />
        <text data-bleed fontFamily={CONDENSED} fontWeight={600} fontSize={ringFont} fill="#fff" letterSpacing={3}>
          <textPath href="#rd-ring" textLength={2 * Math.PI * R - 6} lengthAdjust="spacing">
            {ringText}
          </textPath>
        </text>
        <circle cx={cx} cy={cy} r={R - ringFont - 2} fill="none" stroke={accent} strokeWidth={2} />
      </svg>
      <div style={{ position: "absolute", left: cx - R, top: cy - R, width: 2 * R, height: 2 * R, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: centreSize, lineHeight: 0.95, color: "#fff" }}>{centre}</div>
        {centreLabel && <div style={{ fontWeight: 700, fontSize: Math.min(15, Math.floor((1.45 * (R - ringFont)) / (centreLabel.length * 0.66))), letterSpacing: "0.22em", color: accent, marginTop: 4 }}>{centreLabel}</div>}
      </div>

      {/* Crests stacked on the left (they move to the centre when there is no photo). */}
      <div style={{ position: "absolute", left: 104, top: 120, visibility: hasPhoto || !(homeCrest || awayCrest) ? "visible" : "hidden", display: "flex", flexDirection: "column", gap: 22, alignItems: "center", width: 110 }}>
        {homeCrest || awayCrest ? [crest(homeCrest, "h"), crest(awayCrest, "a")] : <Crest club={data.club} size={104} />}
      </div>

      {/* Outlined rotated boxes. */}
      <div style={{ position: "absolute", left: 104, top: hasPhoto || !(homeCrest || awayCrest) ? 400 : 140, display: "flex", flexDirection: "column", gap: 22 }}>
        {boxes
          .filter((b) => b.text)
          .map((b, i) => {
            const t = b.text.toUpperCase();
            const fs = Math.min(30, Math.floor(300 / Math.max(1, t.length * 0.52)));
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                {vText(b.label, { fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: accent })}
                <div style={{ border: `2px solid ${accent}`, padding: "18px 10px" }}>{vText(t, { fontWeight: 600, fontSize: fs, lineHeight: 1, letterSpacing: "0.04em" })}</div>
              </div>
            );
          })}
      </div>

      {/* Opponent / scorer, huge and vertical on the right. */}
      {showSide && (
        <div style={{ position: "absolute", right: 70, top: sideTop, height: sideLen, display: "flex", alignItems: "flex-end" }}>
          {vText(side, { fontFamily: DISPLAY, fontSize: sideSize, lineHeight: 0.9, color: accent, textShadow: "0 6px 24px rgba(0,0,0,.45)" })}
        </div>
      )}
      {isMatch && showSide && (
        <div style={{ position: "absolute", right: 70 + sideSize * 0.9 + 12, top: sideTop, height: sideLen, display: "flex", alignItems: "flex-end" }}>
          {vText(home ? "Hosting" : "Away to", { fontWeight: 700, fontSize: 16, letterSpacing: "0.3em", textTransform: "uppercase", color: "#fff", opacity: 0.85 })}
        </div>
      )}

      <AgencyLogo data={data} height={30} style={{ position: "absolute", right: 96, top: 106 }} />

      {/* Bottom line. */}
      <div style={{ position: "absolute", left: 104, right: 96, bottom: 98, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 600, fontSize: 24, letterSpacing: "0.12em", textTransform: "uppercase", textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>
        <span>{bottomLeft}</span>
        <span>{bottomRight}</span>
      </div>

      <Film strength={0.9} />
    </div>
  );
}
