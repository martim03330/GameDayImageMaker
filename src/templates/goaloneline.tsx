/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { capsW, I500 } from "./bleedword";
import { placeFree } from "./fadeword";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { OneLineText, oneLineSize } from "./oneline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

/**
 * Goal oneline: the goal post of `oneline`. One single run of small spaced white caps straight across the
 * whole width — "GOAL — FIRST LAST — HOME V AWAY" (names as stored, no score) — this time in FRONT of the
 * celebrating player at his waist, so it reads whole. A deep club tone, softly lifted behind him; the player
 * big and sharp in natural colour, melting into the ground above the logo. Nothing else.
 */
export function Goaloneline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const M = 56;
  const club = clubTone(data);
  const ground = shade(club, -0.62);
  const lift = shade(club, -0.3);

  /* ---- the line ---- */
  const kicker = (content.kicker || "GOAL").replace(/’/g, "'").trim();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const line = [kicker, name, teamsOf(data).join(" v ")]
    .filter(Boolean)
    .map((t) => t.toUpperCase())
    .join("  —  ");
  const track = story ? 0.12 : 0.16;
  const span = CANVAS_W - 2 * M;
  const size = oneLineSize(line, span, track, (story ? 34 : 28) * ts);
  const lineW = Math.min(span, capsW(line, I500, track) * size);

  /* ---- the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottom = story ? H - STORY_BOTTOM : 48;
  const logoTop = H - logoBottom - logoH;

  /* ---- the player, big, centred ---- */
  const FRAME = story ? { chest: 300, waist: 250, knees: 204, full: 164 } : { chest: 250, waist: 210, knees: 166, full: 128 };
  const faceH0 = FRAME[(params.framing ?? "waist") as keyof typeof FRAME] ?? FRAME.waist;
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const fadeEnd = logoTop - (story ? 70 : 50);
  // Reaching just past where he has melted away: a bust photo is not blown up further than it needs.
  let box = placeFree(data, faceX, story ? 400 : 230, faceH0, fadeEnd + 4);
  // A fist raised to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + (face[1] + face[3]) * box.height;
  const capH = size * 0.727;
  // His waist: about three faces under the chin; kept well above the logo.
  const baseline = Math.max(story ? 1000 : 720, Math.min(logoTop - (story ? 200 : 150), chin + box.faceH * 3)) + capH / 2 + (params.textY ?? 0);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300) - box.top}px, transparent ${fadeEnd - box.top}px)`;
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 42% at ${(fCx / CANVAS_W) * 100}% ${((chin + box.faceH) / H) * 100}%, ${lift}, ${ground} 75%)` }} />

      {/* The player, sharp, natural colour, melting into the ground above the logo. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The one line, in front of him. */}
      <OneLineText
        x={(CANVAS_W - lineW) / 2}
        y={baseline}
        width={lineW}
        text={line}
        track={track}
        maxSize={size}
        weight={600}
        fill="#ffffff"
        shadow="drop-shadow(0 1px 2px rgba(0,0,0,.45)) drop-shadow(0 2px 10px rgba(0,0,0,.45))"
      />

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: logoBottom - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
