/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const WHITE = "#ffffff";

/** A five-pointed star centred in a 100×100 box. */
const STAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 19 : 44;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(52 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
})();

/**
 * Goal unlock: the goal as a video-game "achievement unlocked" toast. A deep club-tone ground, the
 * celebrating player big and sharp, and low down — where games pop their trophies — one sleek dark pill:
 * a round club-tone badge with a white star, "ACHIEVEMENT UNLOCKED" in tiny spaced caps, the big word
 * ("Goal", "Brace", "Hat-trick") and "Moisés Conceição · SC Vianense SAD v Leixões" under it. No score,
 * no platform marks. The NEYOD logo on the clean ground below.
 */
export function Goalunlock({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);

  /* ---- the toast, centred low, 60–64px above the logo ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 48) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  const D = 104 * k; // the badge
  const inset = 20 * k;
  const ph = D + 2 * inset; // pill height
  const gap = 28 * k;
  const padR = 52 * k;
  const maxW = CANVAS_W - 2 * (story ? 48 : 64);
  const textMax = maxW - inset - D - gap - padR;

  const CAP_T = 0.2;
  const capLine = "ACHIEVEMENT UNLOCKED";
  const capW1 = titleW(capLine, 1) + capLine.length * CAP_T;
  const capS = Math.min(16 * k, textMax / capW1);
  const title = sentenceCase(content.kicker || "Goal");
  const tS = Math.min(52 * k, textMax / Math.max(1, titleW(title, 1) * 1.02));
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const line = [name, fixture].filter(Boolean).join("  ·  ");
  const lS = Math.max(15 * k, Math.min(23 * k, textMax / Math.max(1, bodyW(line, 1))));
  const textW = Math.min(textMax, Math.max(capW1 * capS, titleW(title, tS) * 1.02, bodyW(line, lS)));
  const pw = Math.round(inset + D + gap + textW + padR);
  const px = Math.round((CANVAS_W - pw) / 2);
  const py = Math.round(logoTop - (story ? 64 : 60) - ph + (params.textY ?? 0));

  /* ---- the player, big, face high and well clear of the toast ---- */
  const sizes = story ? { chest: 360, waist: 296, knees: 232, full: 176 } : { chest: 250, waist: 204, knees: 158, full: 122 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  let box = placeByFace(data, faceX, story ? 300 : 170, sizes);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;
  // His legs dissolve just before the toast, so it sits on clean ground.
  const fadeEnd = Math.min(py - 6, box.top + box.height - 6) - box.top;
  const fadeLen = story ? 480 : 360;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(10, fadeEnd - fadeLen)}px, transparent ${fadeEnd}px)`;

  const ground = shade(club, -0.74);
  const glow = shade(club, -0.18);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: one deep club tone, lit softly behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 40% at ${(faceCx / CANVAS_W) * 100}% ${((chin + box.faceH * 1.6) / H) * 100}%, ${glow}, transparent 78%)`, opacity: 0.9 }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 520, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.42))" }} />

      {/* A soft shade behind his shoulders instead of a drop shadow. */}
      <div style={{ position: "absolute", left: faceCx - box.faceH * 2.2, top: chin + box.faceH * 0.2, width: box.faceH * 4.4, height: box.faceH * 4.6, borderRadius: "50%", background: "rgba(0,0,0,.24)", filter: `blur(${story ? 80 : 60}px)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The toast's halo: the club colour glowing out from under it. */}
      <div style={{ position: "absolute", left: px + pw * 0.08, top: py + ph * 0.2, width: pw * 0.84, height: ph * 0.8, borderRadius: ph, background: club, opacity: 0.5, filter: `blur(${44 * k}px)` }} />

      {/* The toast. */}
      <div
        style={{
          position: "absolute",
          left: px,
          top: py,
          width: pw,
          height: ph,
          borderRadius: ph / 2,
          background: "linear-gradient(to bottom, rgba(30,31,36,.94), rgba(14,15,18,.96))",
          boxShadow: `0 ${20 * k}px ${50 * k}px rgba(0,0,0,.4), inset 0 0 0 ${1.5 * k}px rgba(255,255,255,.09), inset 0 ${1.5 * k}px 0 rgba(255,255,255,.08)`,
          fontFamily: SANS,
          color: WHITE,
        }}
      >
        {/* The badge: a club-tone medal with a white star. */}
        <div
          style={{
            position: "absolute",
            left: inset,
            top: inset,
            width: D,
            height: D,
            borderRadius: "50%",
            background: `linear-gradient(145deg, ${shade(club, 0.32)}, ${shade(club, -0.28)})`,
            boxShadow: `inset 0 0 0 ${3 * k}px rgba(255,255,255,.22), 0 0 ${26 * k}px ${shade(club, 0.1)}66`,
          }}
        >
          <div style={{ position: "absolute", inset: 11 * k, borderRadius: "50%", boxShadow: `inset 0 0 0 ${1.5 * k}px rgba(255,255,255,.32)` }} />
          <svg viewBox="0 0 100 100" width={D} height={D} style={{ position: "absolute", left: 0, top: 0 }}>
            <polygon points={STAR} transform="translate(50 52) scale(.62) translate(-50 -52)" fill={WHITE} strokeLinejoin="round" stroke={WHITE} strokeWidth={4} />
          </svg>
        </div>
        <div style={{ position: "absolute", left: inset + D + gap, top: 0, height: ph, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 4 * k, whiteSpace: "nowrap" }}>
          <div style={{ fontWeight: 600, fontSize: capS, letterSpacing: `${CAP_T}em`, lineHeight: 1, color: "rgba(255,255,255,.56)" }}>{capLine}</div>
          <div style={{ fontWeight: 700, fontSize: tS, letterSpacing: "-0.02em", lineHeight: 1.08, marginTop: 7 * k }}>{title}</div>
          {line && <div style={{ fontWeight: 400, fontSize: lS, lineHeight: 1.1, marginTop: 6 * k, color: "rgba(255,255,255,.74)" }}>{line}</div>}
        </div>
      </div>

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
