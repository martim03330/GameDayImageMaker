/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { ReactNode } from "react";
import { cutMask, Film } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GOLD = "#cdb98f";
const GROUND = "#141414";

/**
 * Welcome, career: the welcome layout (dark ground, the welcome line small at the top, first name big in
 * sand gold over the surname in white, his portrait centred and fading into the dark, the black-and-white
 * photo faint on the left), with his details as one quiet line under the name and, across the foot, his
 * path: the crests of the clubs he came through, oldest to newest, strung on a thin gold hairline with
 * small dots, each with its name under it; the most recent one a little larger and marked LATEST.
 */
export function Welcomecareer({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const archivo = FACES.archivo;

  /* ---- the top: the line, the name, the details ---- */
  const top = (story ? STORY_TOP : 44) + (params.textY ?? 0);
  const kicker = (content.kicker || "WELCOME").toUpperCase();
  const sub = (content.subline || "NEW PLAYER").toUpperCase();
  const lineSize = (story ? 26 : 22) * ts;
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || "").toUpperCase();
  const firstSize = Math.min((story ? 180 : 150) * ts, (story ? 860 : 780) / Math.max(1, wordEm(archivo, first)));
  const lastSize = Math.min(firstSize * 0.6, (story ? 760 : 680) / Math.max(1, wordEm(archivo, last)));
  const firstTop = top + lineSize + (story ? 52 : 38);
  const lastTop = firstTop + firstSize * archivo.cap + firstSize * 0.16;
  const nameBottom = lastTop + lastSize * archivo.cap;

  const stat = (l: string) => content.stats.find((s) => s.label.toUpperCase() === l)?.value ?? "";
  const details = ["POSITION", "NATIONALITY", "AGE"].map(stat).filter(Boolean).map((s) => s.toUpperCase());
  const detailSize = (story ? 27 : 22) * ts;
  const detailTop = nameBottom + (story ? 34 : 26);
  const headBottom = details.length ? detailTop + detailSize : nameBottom;

  /* ---- the foot: logo, and the career line above it ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 40) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const logoTop = H - logoBottom - logoH;
  // Oldest to newest, left to right (the list is stored most recent first).
  const path = (content.career ?? []).filter((c) => c.crest || c.name).slice(0, 5).reverse();
  const n = path.length;
  const crestS = (story ? 74 : 60) * (n > 4 ? 0.88 : 1);
  const crestL = crestS * 1.3;
  const nameSize = (story ? 18 : 15) * ts;
  const tagSize = (story ? 16 : 13) * ts;
  const span = Math.min(story ? 860 : 820, n * (story ? 250 : 230));
  const slot = n ? span / n : 0;
  const x0 = (CANVAS_W - span) / 2 + slot / 2;
  // The names sit under the crests; the line runs through the crests' centres.
  const namesBottom = logoTop - (story ? 64 : 52);
  const namesTop = namesBottom - nameSize * 1.1;
  const lineY = namesTop - (story ? 20 : 16) - crestL / 2;
  const careerTop = lineY - crestL / 2 - tagSize - (story ? 14 : 10);

  /* ---- the portrait: centred, head just under the name, melting into the ground above the career line ---- */
  const sizes = story ? { chest: 270, waist: 240, knees: 190, full: 150 } : { chest: 240, waist: 210, knees: 165, full: 125 };
  const faceX = 540;
  const gap = story ? 70 : 46;
  let faceTop = headBottom + 200;
  for (let i = 0; i < 2; i++) faceTop += headBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const eyes = box.top + (face[1] + face[3] * 0.45) * box.height;
  const fadeEnd = n ? careerTop + (story ? 40 : 30) : H - (story ? 330 : 170);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 280)}px, transparent ${fadeEnd}px)`;

  /* ---- the black-and-white photo, always on the left ---- */
  const g = data.ghost ?? null;
  let ghostEl: ReactNode = null;
  if (g) {
    const gf = g.face ?? [0.4, 0.06, 0.2, 0.12];
    const gFaceH = story ? 360 : 300;
    const gh = gFaceH / gf[3];
    const gw = gh * (g.aspect ?? 0.6);
    const gx = story ? 200 : 200;
    const gTop = eyes + (story ? 60 : 50);
    const left = gx - gw * (gf[0] + gf[2] / 2);
    const fadeTo = Math.min(H, (n ? careerTop : H - 160) - 10);
    const mask = `linear-gradient(to right, #000 0, #000 28%, transparent 50%), linear-gradient(to bottom, #000 0, #000 ${fadeTo - 260}px, transparent ${fadeTo}px)`;
    ghostEl = (
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
        <img src={g.url} alt="" style={{ position: "absolute", left, top: gTop - gh * gf[1], width: gw, height: gh, maxWidth: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", maskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", filter: "grayscale(1) contrast(1.1) brightness(.85)", opacity: 0.55 }} />
      </div>
    );
  }

  const small = { fontFamily: CONDENSED, fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" } as const;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 45% at 50% 42%, #2b2b2b, transparent 75%)" }} />

      {ghostEl}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: eyes, width: box.width * 0.7, height: box.height * 0.7, borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(70px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - careerTop + (story ? 160 : 120), background: `linear-gradient(to bottom, transparent, ${GROUND} ${story ? 200 : 150}px)` }} />

      {/* Top line, name, details. */}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...small, fontSize: lineSize, letterSpacing: "0.42em", paddingLeft: "0.42em", color: GOLD, whiteSpace: "pre" }}>
        {`${kicker}  ·  ${sub}`}
      </div>
      {[
        { t: first, size: firstSize, y: firstTop, color: GOLD },
        { t: last, size: lastSize, y: lastTop, color: "#fff" },
      ].map(
        (nm) =>
          nm.t && (
            <svg key={nm.t + nm.y} width={CANVAS_W} height={nm.size} style={{ position: "absolute", left: 0, top: nm.y - nm.size * 0.2, overflow: "visible" }}>
              <text x={CANVAS_W / 2} y={nm.size * 0.2 + nm.size * archivo.cap} textAnchor="middle" style={{ fontFamily: archivo.family, fontSize: nm.size, letterSpacing: `${archivo.tracking}em`, fill: nm.color }}>
                {nm.t}
              </text>
            </svg>
          ),
      )}
      {details.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: detailTop, textAlign: "center", ...small, fontSize: detailSize, letterSpacing: "0.28em", paddingLeft: "0.28em", color: "rgba(255,255,255,.88)", whiteSpace: "pre" }}>
          {details.join("   ·   ")}
        </div>
      )}

      {/* The career line. */}
      {n > 0 && (
        <>
          {n > 1 && (
            <div style={{ position: "absolute", left: x0 - slot * 0.32, width: (n - 1) * slot + slot * 0.64, top: lineY - 0.5, height: 1, background: `linear-gradient(to right, transparent, ${GOLD} 12%, ${GOLD} 88%, transparent)`, opacity: 0.85 }} />
          )}
          {path.slice(1).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: x0 + slot * (i + 0.5) - 3.5, top: lineY - 3.5, width: 7, height: 7, borderRadius: "50%", background: GOLD }} />
          ))}
          {path.map((c, i) => {
            const latest = i === n - 1;
            const s = latest ? crestL : crestS;
            const cx = x0 + i * slot;
            const fs = Math.min(nameSize * (latest ? 1.1 : 1), (slot - 18) / Math.max(1, c.name.length * 0.62 + (c.name.length - 1) * 0.16));
            return (
              <div key={c.name + i}>
                {/* A dark disc behind each crest, so the hairline stops at its edge. */}
                <div style={{ position: "absolute", left: cx - s / 2 - 8, top: lineY - s / 2 - 8, width: s + 16, height: s + 16, borderRadius: "50%", background: GROUND }} />
                {c.crest ? (
                  <img src={c.crest} alt="" style={{ position: "absolute", left: cx - s / 2, top: lineY - s / 2, width: s, height: s, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
                ) : (
                  <div style={{ position: "absolute", left: cx - 5, top: lineY - 5, width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
                )}
                {latest && (
                  <div style={{ position: "absolute", left: cx - 100, width: 200, top: careerTop, textAlign: "center", ...small, fontSize: tagSize, letterSpacing: "0.34em", paddingLeft: "0.34em", color: GOLD }}>LATEST</div>
                )}
                <div style={{ position: "absolute", left: cx - slot / 2, width: slot, top: namesTop, textAlign: "center", ...small, fontSize: fs, letterSpacing: "0.16em", paddingLeft: "0.16em", color: latest ? "#fff" : "rgba(255,255,255,.72)" }}>
                  {c.name.toUpperCase()}
                </div>
              </div>
            );
          })}
        </>
      )}

      <AgencyLogo data={data} height={26} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.35} />
    </div>
  );
}
