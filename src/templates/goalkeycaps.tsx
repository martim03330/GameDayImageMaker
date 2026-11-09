/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubCap, Keycap, type CapTone } from "./keycaps";
import { bodyW, clubTone, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Graphite keys for the dark ground. */
const DARK_CAP: CapTone = { top: "#4a4b52", top2: "#3a3b41", skirt: "#25262a", skirt2: "#111215", ink: "#f4f4f2", rim: "rgba(255,255,255,.07)" };

/**
 * Goal keycaps: the word typed out on a row of graphite keyboard keys across the top of a dark ground —
 * [G][O][A][L] (or the kicker, letters only) — the last key pressed down in the club colour. The
 * celebrating player big and sharp under the row, melting into the dark; at the foot only his name and
 * the fixture (home first, exact names, never the score).
 */
export function Goalkeycaps({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  let club = clubTone(data);
  if (luminance(club) < 0.08) club = shade(club, 0.3);
  const M = 64;
  const W = CANVAS_W - 2 * M;

  /* ---- the keys ---- */
  const letters = [...(content.kicker || "GOAL").normalize("NFC").toUpperCase()].filter((c) => /\p{L}/u.test(c)).slice(0, 9);
  const chars = letters.length ? letters : ["G", "O", "A", "L"];
  const gapR = 0.1;
  const units = chars.length + gapR * (chars.length - 1);
  const keyH = Math.min(story ? 206 : 168, (story ? CANVAS_W - 2 * 56 : W) / units);
  const gap = keyH * gapR;
  const rowW = units * keyH;
  const rowX = (CANVAS_W - rowW) / 2;
  const keysTop = story ? STORY_TOP : 64;
  const legend = keyH * 0.4;

  /* ---- the foot ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 48) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const nameS = Math.max(24 * k, Math.min(40 * k, W / Math.max(1, titleW(name, 1))));
  const fixS = Math.max(17 * k, Math.min(24 * k, W / Math.max(1, bodyW(fixture, 1))));
  const fixTop = logoTop - (story ? 64 : 50) - fixS * 1.2 + ty;
  const nameTop = (fixture ? fixTop - 8 * k : fixTop + fixS * 1.2) - nameS * 1.2;
  const footTop = name ? nameTop : fixTop;

  /* ---- the player: big, centred under the row ---- */
  const dir = params.side === "left" ? -1 : params.side === "right" ? 1 : 0;
  const faceX = 540 + dir * 60;
  const sizes = story ? { chest: 330, waist: 262, knees: 206, full: 162 } : { chest: 236, waist: 186, knees: 146, full: 114 };
  let box = placeByFace(data, faceX, keysTop + keyH + (story ? 120 : 70), sizes);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = footTop - (story ? 40 : 24) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300)}px, transparent ${fadeEnd}px)`;
  const ground = "#0d0e11";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#ffffff" }}>
      {/* A breath of the club colour behind him; the rest stays dark. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% ${story ? 34 : 42}% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, -0.2)}80, ${shade(club, -0.65)}30 55%, transparent 80%)` }} />
      <div style={{ position: "absolute", left: faceCx - box.faceH * 2.4, top: chin + box.faceH * 0.3, width: box.faceH * 4.8, height: box.faceH * 4.2, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The row of keys across the top, a soft dark under it so it reads over a raised arm. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: keysTop + keyH + 60, background: `linear-gradient(to bottom, ${ground}cc, ${ground}99 70%, transparent)` }} />
      {chars.map((c, i) => (
        <Keycap
          key={i}
          x={rowX + i * (keyH + gap)}
          y={keysTop}
          w={keyH}
          h={keyH}
          char={c}
          size={legend}
          weight={500}
          pressed={i === chars.length - 1}
          tone={i === chars.length - 1 ? clubCap(club) : DARK_CAP}
          shadow="rgba(0,0,0,.65)"
        />
      ))}

      {/* Foot: his name, then the fixture. */}
      {name && <div style={{ position: "absolute", left: M, right: M, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: nameS, lineHeight: 1.2, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{name}</div>}
      {fixture && <div style={{ position: "absolute", left: M, right: M, top: fixTop, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: fixS, lineHeight: 1.2, letterSpacing: "-0.005em", color: "rgba(235,235,245,.6)", whiteSpace: "nowrap" }}>{fixture}</div>}

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.12} />
    </div>
  );
}
