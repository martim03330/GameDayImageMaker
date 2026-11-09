/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { dmEm } from "./superscript";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** ¹ a goal, ² a brace, ³ a hat-trick (from the kicker the user chose). */
function countOf(kicker: string): string {
  const k = kicker.toUpperCase().replace(/[^A-Z]/g, "");
  if (/HATTRICK|HATRICK|TRIS|TRICK/.test(k)) return "3";
  if (/BRACE|BIS|DOUBLE/.test(k)) return "2";
  if (/POKER/.test(k)) return "4";
  return "1";
}

/**
 * Goal superscript: the goal sibling of `superscript`. "Goal" set big in DM Serif, white on a deep club
 * tone, with a raised count after it in the club colour — ¹ for a goal, ² for a brace, ³ for a hat-trick.
 * At the foot the footnote: a short hairline, the same small number hung in the margin, his name and the
 * fixture (home first, names as stored, never a score), the agency logo at the other end of the line.
 * The celebrating player big on the other side, natural colour, melting into the ground above the foot.
 */
export function Goalsuperscript({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const q = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";

  const club = clubTone(data);
  const ground = shade(club, -0.66);
  const lift = shade(club, -0.38);
  // The mark: the club colour, lifted until it reads on its own deep tone.
  let markC = club;
  for (let i = 0; i < 6 && luminance(markC) < 0.27; i++) markC = shade(markC, 0.16);

  /* ---- the title ---- */
  const M = story ? 72 : 64;
  const word = "Goal";
  const mark = countOf(content.kicker || "GOAL");
  const SUP = 0.4;
  const tSize = Math.min((story ? 360 : 300) * ts, (CANVAS_W * (story ? 0.7 : 0.62)) / (dmEm(word) + 0.05 + SUP * 0.504));
  const titleTop = (story ? STORY_TOP - tSize * 0.13 : 46) + (params.textY ?? 0);
  const capTop = tSize * 0.17;

  /* ---- the player, big, on the other side ---- */
  const faceX = right ? (story ? 700 : 708) : story ? 420 : 380;
  // His hair starts around the title's baseline: the raised fist may cross the word, the face never does.
  const faceTop = titleTop + tSize * (story ? 1.12 : 1.02);
  const box = placeByFace(data, faceX, faceTop, story ? { chest: 330, waist: 280, knees: 220, full: 170 } : { chest: 240, waist: 200, knees: 158, full: 120 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fTop = box.top + face[1] * box.height;

  /* ---- the footnote, along the foot, the logo at the other end ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const noteW = story ? 600 : 680;
  const longest = Math.max(name.length * 0.58, fixture.length * 0.53, 1);
  const noteSize = Math.max(13, Math.min(21 * q * ts, (noteW - 30 * q) / longest));
  const lines = (name ? 1 : 0) + (fixture ? 1 : 0);
  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const noteTop = H - logoBottom - lines * noteSize * 1.42 - 24 * q;
  const fadeEnd = noteTop - 40 * q;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 260) - box.top}px, transparent ${fadeEnd - box.top}px)`;
  const hang = noteSize * 0.95;

  const side: CSSProperties = right ? { left: M } : { right: M };
  const note: CSSProperties = { fontFamily: SANS, fontSize: noteSize, lineHeight: 1.42, color: "#ffffff", whiteSpace: "nowrap", letterSpacing: "-0.005em" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#ffffff" }}>
      {/* The ground: a deep club tone, lit softly behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 46% at ${(faceX / CANVAS_W) * 100}% ${((fTop + box.faceH * 2) / H) * 100}%, ${lift}, ${ground} 72%)` }} />

      {/* The title and its count. */}
      <div style={{ position: "absolute", top: titleTop, ...side, display: "flex", alignItems: "flex-start", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: DMSERIF, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.012em", color: "#ffffff" }}>{word}</span>
        <span style={{ fontFamily: DMSERIF, fontSize: tSize * SUP, lineHeight: 1, color: markC, marginLeft: tSize * 0.05, marginTop: capTop - tSize * SUP * 0.16 }}>{mark}</span>
      </div>

      {/* The player, natural colour, melting into the ground above the foot. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: fTop + box.faceH * 1.2, width: box.width * 0.6, height: box.faceH * 4.5, borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The footnote. */}
      <div style={{ position: "absolute", bottom: logoBottom, ...side, maxWidth: noteW, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ width: 96 * q, height: story ? 2 : 1.5, background: "#ffffff", opacity: 0.75, marginBottom: 22 * q }} />
        <div style={{ position: "relative", paddingLeft: hang }}>
          <span style={{ position: "absolute", left: 0, top: -noteSize * 0.08, fontFamily: SANS, fontWeight: 600, fontSize: noteSize * 0.68, lineHeight: 1, color: markC }}>{mark}</span>
          {name && <div style={{ ...note, fontWeight: 500 }}>{name}</div>}
          {fixture && <div style={{ ...note, fontWeight: 400, color: "rgba(255,255,255,.62)" }}>{fixture}</div>}
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={22}
        style={{ position: "absolute", ...(right ? { right: M } : { left: M }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: right ? "right bottom" : "left bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
