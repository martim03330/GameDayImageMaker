/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { datesOf } from "./nowplaying";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#111114";
const GREY = "#8a8a8f";
const HAIR = "rgba(60,60,67,.2)";

/** An iOS switch, on: a pill track in `color`, the white knob at the right end. */
export function Switch({ w, h, color }: { w: number; h: number; color: string }) {
  const inset = h * 0.07;
  const knob = h - 2 * inset;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: h / 2, background: color, flexShrink: 0, boxShadow: `inset 0 0 0 1px ${shade(color, -0.25)}22` }}>
      <div
        style={{
          position: "absolute",
          top: inset,
          left: w - inset - knob,
          width: knob,
          height: knob,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: `0 ${h * 0.05}px ${h * 0.14}px rgba(0,0,0,.16), 0 ${h * 0.02}px ${h * 0.02}px rgba(0,0,0,.08)`,
        }}
      />
    </div>
  );
}

/**
 * Toggle: matchday switched on. A pale, quiet ground; the player big and sharp in natural colour on his
 * side. On the other side, low down, one big iOS switch turned ON — club-colour track, white knob — next
 * to "Matchday", and under it a short settings list split by hairlines: "SC Vianense SAD v Leixões",
 * "17 October · 15:00", the ground. The NEYOD mark under the list. In the story the list spans the width
 * under him. Flips with params.side.
 */
export function Toggle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";
  const M = story ? 64 : 64;

  /* ---- the list ---- */
  const colW = story ? CANVAS_W - 2 * M : 500;
  const colX = story ? M : playerLeft ? CANVAS_W - M - colW : M;
  const label = sentenceCase(content.kicker || "Matchday");
  const swH = (story ? 104 : 96) * k;
  const swW = swH * 1.66;
  const gap = 30 * k;
  const labelS = Math.min(74 * k, (colW - swW - gap) / Math.max(1, titleW(label, 1)));
  const dates = datesOf(content.date);
  const venue = (content.venue ?? "").trim() || titleCase(f.venue);
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ");
  const rows = [teamsOf(data).join(" v "), [dates.long, f.time].filter(Boolean).join(" · "), venue || comp].filter(Boolean);
  const rowBase = 31 * k;
  const rowH = 88 * k;
  const sizes = rows.map((t) => Math.max(rowBase * 0.7, Math.min(rowBase, colW / Math.max(1, bodyW(t, 1)))));
  const headGap = 40 * k; // switch row → first hairline
  const listH = swH + headGap + rows.length * rowH;

  /* ---- the foot: logo, the list ~60px above it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  // The last row's text sits mid-row: measure the gap from the text, not the row box.
  const listBottom = logoTop - (story ? 64 : 58) + (rowH - rowBase * 1.2) / 2 + (params.textY ?? 0);
  const listTop = listBottom - listH;

  /* ---- the player: big, on his side (in the story above the list) ---- */
  const sideX = playerLeft ? -1 : 1;
  const faceX = 540 + sideX * (story ? 120 : 250);
  const sizes2 = story ? { chest: 380, waist: 306, knees: 240, full: 184 } : { chest: 272, waist: 214, knees: 166, full: 128 };
  const probe = placeByFace(data, faceX, 300, sizes2);
  const box = placeByFace(data, faceX, (story ? STORY_TOP + 40 : 70) + probe.faceH * 0.7, sizes2);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = (story ? listTop + swH * 0.5 : H - 30) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 320)}px, transparent ${fadeEnd}px)`;
  const bg = "#f2f2ef";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: bg }}>
      {/* The ground: pale and still, a soft light behind him and the faintest breath of the club colour. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(56% 40% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.8)}aa, rgba(242,242,239,0) 72%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(40% 26% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, rgba(255,255,255,.85), rgba(255,255,255,0) 75%)` }} />
      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 2.1, top: chin + box.faceH * 0.4, width: box.faceH * 4.2, height: box.faceH * 4.2, borderRadius: "50%", background: `${shade(club, -0.5)}1c`, filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      {/* In the story the list sits on clean ground under him. */}
      {story && <div style={{ position: "absolute", left: 0, right: 0, top: listTop - 160, bottom: 0, background: `linear-gradient(to bottom, rgba(242,242,239,0), ${bg} 160px)` }} />}

      {/* In the post the list sits on a breath of clean ground that his arm melts into. */}
      {!story && (
        <div
          style={{
            position: "absolute",
            top: listTop - 120,
            bottom: 0,
            ...(playerLeft ? { right: 0, width: CANVAS_W - colX + 170 } : { left: 0, width: colX + colW + 170 }),
            background: `linear-gradient(to ${playerLeft ? "left" : "right"}, ${bg} 0, ${bg} ${colW + M + 10}px, rgba(242,242,239,0) 100%)`,
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 120px)",
            maskImage: "linear-gradient(to bottom, transparent 0, #000 120px)",
            opacity: 0.92,
          }}
        />
      )}

      {/* The switch and its label. */}
      <div style={{ position: "absolute", left: colX, top: listTop, width: colW, height: swH, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: SANS }}>
        <span style={{ fontWeight: 600, fontSize: labelS, lineHeight: 1, letterSpacing: "-0.025em", color: INK, whiteSpace: "nowrap" }}>{label}</span>
        <Switch w={swW} h={swH} color={club} />
      </div>

      {/* The settings rows, split by hairlines. */}
      <div style={{ position: "absolute", left: colX, top: listTop + swH + headGap, width: colW, fontFamily: SANS }}>
        {rows.map((t, i) => (
          <div key={i} style={{ height: rowH, borderTop: `${Math.max(1, 1.5 * k)}px solid ${HAIR}`, boxSizing: "border-box", display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 400, fontSize: sizes[i], lineHeight: 1.2, letterSpacing: "-0.01em", color: i === 0 ? INK : i === 1 ? "#3a3a3e" : GREY, whiteSpace: "nowrap" }}>{t}</span>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight
        height={22}
        style={{ position: "absolute", ...(story || !playerLeft ? { left: colX - 4 * k } : { right: M - 4 * k }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: story || !playerLeft ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
