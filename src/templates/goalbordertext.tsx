/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { Tape } from "./bordertext";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter 600 title case, roughly, per 1px of font size (with the tight tracking below). */
const wordEm = (t: string) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.25 : /[il!']/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.88 : /[MW]/.test(c) ? 0.95 : /[A-Z]/.test(c) ? 0.72 : c === "-" ? 0.46 : 0.6) - 0.04, 0);

/**
 * Goal bordertext: the goal post of `bordertext`. On a deep club-tone ground one line of tiny tracked white
 * caps — "GOAL · FIRST LAST · HOME V AWAY" looping, no score — runs clockwise round the edge like a tape frame,
 * a small square at each corner. Inside, the celebrating player big (a raised fist may break the top line)
 * and one big quiet "Goal" at his feet, the NEYOD logo under it.
 */
export function Goalbordertext({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;

  const club = clubTone(data);
  const ground = shade(club, -0.62);
  const ink = "rgba(255,255,255,.88)";

  /* ---- the tape ---- */
  const kicker = sentenceCase(content.kicker || "Goal");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const teams = teamsOf(data);
  const fixture = teams.length === 2 ? `${teams[0]} v ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const items = [kicker, name, fixture].filter(Boolean).map((s) => s.toUpperCase());

  const inset = story ? 46 : 38;
  const y0 = story ? STORY_TOP + 10 : inset;
  const y1 = story ? STORY_BOTTOM - 10 : CANVAS_H - inset;
  const x0 = inset;
  const x1 = CANVAS_W - inset;

  /* ---- the foot: logo above the bottom line, the big word above the logo ---- */
  const logoH = story ? 88 : 52;
  const logoBottomY = y1 - (story ? 48 : 40);
  const logoTop = logoBottomY - logoH;
  const maxW = story ? 860 : 820;
  const wSize = Math.min((story ? 330 : 250) * ts, maxW / Math.max(1, wordEm(kicker)));
  // The word's baseline sits ~64px above the logo (no descenders in "Goal"; the cap height is ~0.73em).
  const baseline = logoTop - (story ? 70 : 62) + (params.textY ?? 0);
  const capTop = baseline - wSize * 0.73;

  /* ---- the player, big and centred; his raised arms may break the top line ---- */
  const sizes = story ? { chest: 360, waist: 305, knees: 250, full: 205 } : { chest: 250, waist: 205, knees: 165, full: 130 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceTop0 = story ? STORY_TOP + 200 : 170;
  let box = placeByFace(data, 540, faceTop0, sizes);
  // Only the raised fist may break the frame: keep the figure's width inside the side lines.
  const room = x1 - x0 - 30;
  if (box.width > room) {
    const k = room / box.width;
    const smaller = Object.fromEntries(Object.entries(sizes).map(([key, v]) => [key, v * k]));
    box = placeByFace(data, 540, faceTop0 + (story ? 60 : 30) * (1 - k) * 4, smaller);
  }
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const faceTop = box.top + face[1] * box.height;
  // He melts into the ground behind the word, so the word reads cleanly.
  const fadeEnd = Math.max(faceTop + box.faceH * 3.2, capTop + wSize * 0.2);
  const fadeLen = story ? 460 : 340;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - fadeLen - box.top}px, transparent ${fadeEnd - box.top}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#fff" }}>
      {/* The ground: deep club tone, a soft light behind his chest, darker at the foot. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(62% 44% at 50% ${((faceTop + box.faceH * 2) / H) * 100}%, ${shade(club, -0.3)}, transparent 78%), linear-gradient(to bottom, transparent 55%, ${shade(club, -0.78)})`,
        }}
      />

      {/* The tape, behind him so a raised fist breaks the top line. */}
      <Tape id="goalbordertext" x0={x0} y0={y0} x1={x1} y1={y1} items={items} base={(story ? 17 : 13.5) * ts} tracking={0.3} ink={ink} gap={story ? 22 : 18} dot={story ? 7 : 6} />

      {/* The player, natural colour, melting away into the ground above the word. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: faceTop + box.faceH * 1.6, width: box.width * 0.6, height: box.faceH * 4, borderRadius: "50%", background: "rgba(0,0,0,.25)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The one big word at his feet. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: baseline - wSize * 0.864,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: wSize,
          lineHeight: 1,
          height: wSize,
          letterSpacing: "-0.04em",
          whiteSpace: "nowrap",
          color: "#fff",
        }}
      >
        {kicker}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: H - logoBottomY - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
