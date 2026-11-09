/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const ON = "#34c759"; // the iOS "on" green
const INK = "#ffffff";
const DIM = "rgba(235,235,245,.6)";
const RULE = "rgba(235,235,245,.2)";

/** An iOS switch, turned on: a pill track and a white knob at its right end. */
function Switch({ x, y, h, color }: { x: number; y: number; h: number; color: string }) {
  const w = h * 1.645;
  const pad = h * 0.065;
  const knob = h - 2 * pad;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: h / 2, background: color }}>
      <div
        style={{
          position: "absolute",
          right: pad,
          top: pad,
          width: knob,
          height: knob,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: `0 ${h * 0.04}px ${h * 0.1}px rgba(0,0,0,.18), 0 ${h * 0.04}px ${h * 0.02}px rgba(0,0,0,.08)`,
        }}
      />
    </div>
  );
}

/**
 * Goal toggle: the goal switched on. A dark ground with a breath of the club colour behind the celebrating
 * player, who stands big and sharp and melts away above a settings-style block at the foot: "Goal" in
 * Inter 600 with a big iOS switch turned on (green track, white knob) at the right end of its row, then
 * two tiny rows under hairlines — "Scorer · Moisés Conceição", "Match · SC Vianense SAD v Leixões" (no
 * score). Flips the player with params.side; the NEYOD mark under the rows.
 */
export function Goaltoggle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const M = story ? 72 : 64;
  const W = CANVAS_W - 2 * M;

  /* ---- the foot: logo, then the rows ~62px above it, then the switch row ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const teams = teamsOf(data);
  const rows = [
    { label: "Scorer", value: name },
    { label: "Match", value: teams.join(" v ") },
  ].filter((r) => r.value);
  const rowText = 27 * k;
  const rowH = 74 * k;
  const labelRoom = Math.max(...rows.map((r) => bodyW(r.label, rowText)), 0) + 40 * k;
  const fitted = rows.map((r) => ({ ...r, size: Math.max(rowText * 0.66, Math.min(rowText, (W - labelRoom) / Math.max(1, bodyW(r.value, 1)))) }));

  const lastTextBottom = logoTop - (story ? 66 : 60) + ty;
  const lastCenter = lastTextBottom - rowText * 0.5;
  const firstCenter = lastCenter - (fitted.length - 1) * rowH;
  const topRule = firstCenter - rowH / 2;

  const title = sentenceCase(content.kicker || "Goal");
  const swH = 96 * k;
  const swW = swH * 1.645;
  const titleSize = Math.max(56 * k, Math.min(124 * k, (W - swW - 48 * k) / Math.max(1, titleW(title, 1))));
  const goalRowH = Math.max(swH, titleSize) + 52 * k;
  const goalCenter = topRule - goalRowH / 2;
  const goalTop = goalCenter - goalRowH / 2;

  /* ---- the player: big, face high, on his side ---- */
  const dir = params.side === "left" ? -1 : params.side === "right" ? 1 : 0;
  const faceX = 540 + dir * (story ? 60 : 120);
  const sizes = story ? { chest: 340, waist: 270, knees: 212, full: 168 } : { chest: 250, waist: 196, knees: 152, full: 118 };
  const probe = placeByFace(data, faceX, 300, sizes);
  let box = placeByFace(data, faceX, (story ? STORY_TOP + 40 : 60) + probe.faceH * 0.6, sizes);
  // A fist raised to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W + dir * 200 - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;
  // He melts into the dark just above the switch row.
  const fadeEnd = goalTop + 30 * k - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 260)}px, transparent ${fadeEnd}px)`;

  const ground = "#0b0c0f";
  const caps = { fontFamily: SANS, whiteSpace: "nowrap" as const, lineHeight: 1 };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      {/* A breath of the club colour behind him, nothing else. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% ${story ? 34 : 42}% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, -0.15)}88, ${shade(club, -0.6)}33 55%, transparent 80%)` }} />
      <div style={{ position: "absolute", left: faceCx - box.faceH * 2.4, top: chin + box.faceH * 0.3, width: box.faceH * 4.8, height: box.faceH * 4.2, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: goalTop - 200 * k, bottom: 0, background: `linear-gradient(to bottom, transparent, ${ground}cc ${200 * k}px, ${ground} ${280 * k}px)` }} />

      {/* The switch row. */}
      <div style={{ position: "absolute", left: M, top: goalCenter - titleSize * 0.56, ...caps, fontWeight: 600, fontSize: titleSize, letterSpacing: "-0.025em", lineHeight: `${titleSize * 1.12}px`, height: titleSize * 1.12 }}>{title}</div>
      <Switch x={CANVAS_W - M - swW} y={goalCenter - swH / 2} h={swH} color={ON} />

      {/* The settings rows under hairlines. */}
      {fitted.map((r, i) => {
        const cy = firstCenter + i * rowH;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: M, width: W, top: cy - rowH / 2, height: story ? 1.5 : 1, background: RULE }} />
            <div style={{ position: "absolute", left: M, top: cy - rowText * 0.6, height: rowText * 1.2, ...caps, fontWeight: 400, fontSize: rowText, lineHeight: `${rowText * 1.2}px`, letterSpacing: "-0.01em", color: INK }}>{r.label}</div>
            <div style={{ position: "absolute", right: M, top: cy - r.size * 0.6, height: r.size * 1.2, ...caps, fontWeight: 400, fontSize: r.size, lineHeight: `${r.size * 1.2}px`, letterSpacing: "-0.01em", color: DIM, textAlign: "right" }}>{r.value}</div>
          </div>
        );
      })}

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: M - 4, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "left bottom" }} />
      <Film strength={0.12} />
    </div>
  );
}
