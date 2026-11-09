/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, cutMask, GradientMapDefs } from "./fx";
import { BODONI } from "./cover";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts, placeFace } from "./strokes";
import { MonoDefs, mix } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Bodoni Moda 500: advance widths per 100px of font size (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.5, d: 61.7, e: 52.6, f: 40.2, g: 60.8, h: 60.5, i: 31, j: 31.3, k: 61.6, l: 34.2, m: 87, n: 60.5, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 60.7, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, ".": 21.6, " ": 25, "-": 36, "'": 21.6 };
const bodEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BOD_W[c] ?? 58) / 100 + tracking, -tracking);

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/**
 * Album-cover portrait (Kendrick Lamar "pride."): the player's face huge and sharp, the whole picture
 * pushed through a deep club-colour gradient map; one eye picked out by a thin white square in which the
 * photo keeps its natural colour; tiny spaced caps running round all four edges (date · name · fixture ·
 * competition), and the title as one lowercase serif word with a full stop, low on his chest.
 */
export function Pride({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 29;
  const r = rng(seed);

  // The club colour, deep enough to carry a duotone: white / yellow clubs fall back to their other colour.
  let tint = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(tint) > 0.45) tint = vivid(params.accent);
  if (luminance(tint) > 0.45) tint = shade(tint, -0.45);
  if (luminance(tint) < 0.03) tint = shade(tint, 0.2);
  const dark = shade(tint, -0.86);
  const mid = shade(tint, -0.12);
  const light = mix(tint, WHITE, 0.72);

  const f = matchFacts(data);
  const score = scoreOf(data, " – ");

  /* ---- the face: huge, eye line a third of the way down ---- */
  const want = 540;
  const faceX = 540 + (r() - 0.5) * 30;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // placeFace caps the face at its real resolution; work out the size first so the eyes land in place.
  const probe = placeFace(data, faceX, 0, want);
  const fh = probe.faceH;
  // A big face sits with its eyes ~35% down; a smaller one (low-res photo) goes higher, so no empty sky above him.
  const eyeLine = 340 + Math.max(0, Math.min(1, (fh - 200) / 280)) * 130;
  const faceTop = eyeLine - fh * 0.42;
  const box = placeFace(data, faceX, faceTop, want);
  const fw = face[2] * box.width;
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceY = box.top + face[1] * box.height;

  /* ---- the framed eye: the one on the side he looks towards (side "right" = he looks left, into the picture) ---- */
  const eyeSide = params.side === "left" ? 1 : -1;
  const sq = Math.max(110, fw * 0.4);
  const ex = faceCx + eyeSide * fw * 0.215;
  const ey = faceY + box.faceH * 0.42;
  const sqL = ex - sq / 2;
  const sqT = ey - sq / 2;

  /* ---- title: lowercase serif with a full stop, below his chin ---- */
  const word = `${content.kicker.trim().toLowerCase().replace(/’/g, "'").replace(/[.!]+$/, "")}.`;
  const tracking = -0.02;
  const size = Math.min(150, 640 / bodEm(word, tracking)) * (params.textScale ?? 1);
  const chin = faceY + box.faceH * 1.12;
  const baseline = Math.min(1120, Math.max(chin + size * 0.8, 900)) + (params.textY ?? 0);

  /* ---- what runs round the edges ---- */
  const ours = (data.club?.name ?? "").toUpperCase();
  const name = `${content.firstName} ${content.lastName}`.trim().toUpperCase() || ours;
  const fixture = f.opp ? (content.home === false ? `${f.opp} V ${ours}` : `${ours} V ${f.opp}`) : ours;
  // Match posts carry the fixture; an award / a new deal carries the club and the caption instead.
  const isMatch = postType === "matchday" || postType === "result";
  const caption = [f.comp, f.round].filter(Boolean).join(" ");
  const date = (isMatch ? f.longDate || (content.date ?? "").toUpperCase() : "") || caption || ours;
  const facts = content.stats.filter((x) => x.value && String(x.value).length <= 5 && Number(x.value) !== 0).slice(0, 3).map((x) => `${x.value} ${x.label}`.toUpperCase()).join(" · ");
  const third = postType === "result" && score ? `FULL TIME ${score.replace(/\s/g, "")}` : [f.time ? `KICK-OFF ${f.time}` : "", f.venue].filter(Boolean).join(" · ");
  const sides = isMatch
    ? { top: name, bottom: caption || ours, left: fixture, right: third || fixture }
    : { top: name, bottom: date === ours ? (data.agency.name || "").toUpperCase() : ours, left: ours, right: facts || (content.kicker || "").toUpperCase() };
  const INSET = 26;
  const microFit = (t: string, room: number) => Math.max(10, Math.min(14.5, room / Math.max(1, [...t].length * 0.84)));
  const micro = (fs: number): CSSProperties => ({ fontFamily: ARCHIVO, fontWeight: 600, fontSize: fs, letterSpacing: "0.16em", lineHeight: 1, whiteSpace: "nowrap", color: WHITE, opacity: 0.92, textShadow: "0 1px 6px rgba(0,0,0,.55)" });
  const edge = (pos: "top" | "bottom" | "left" | "right") => {
    const horizontal = pos === "top" || pos === "bottom";
    const len = (horizontal ? CANVAS_W : CANVAS_H) - 2 * 64;
    const centre = sides[pos];
    const fs = Math.min(microFit(date, 200), microFit(centre, len - 2 * (date.length * 13 + 60)));
    const place: CSSProperties = horizontal
      ? { position: "absolute", left: 64, right: 64, [pos]: INSET, height: 16 }
      : { position: "absolute", top: 64, bottom: 64, [pos]: INSET, width: 16, writingMode: "vertical-rl", transform: pos === "left" ? "rotate(180deg)" : undefined };
    return (
      <div key={pos} style={{ ...place, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {[date, centre, date].map((t, i) => (
          <span key={i} style={micro(fs)}>
            {t}
          </span>
        ))}
      </div>
    );
  };

  /* ---- under the title: the crests and, for a result, the score ---- */
  const crests = (isMatch ? (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]) : [f.ourCrest]).filter(Boolean) as string[];
  const crestFilter = `${params.crestColor ? "" : "url(#pride-mono) "}drop-shadow(0 2px 8px rgba(0,0,0,.5))`;
  const middle = postType === "result" && score ? score : "v";

  const photo: CSSProperties = { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(tint, -0.6), color: WHITE }}>
      <GradientMapDefs id="pride-map" dark={dark} mid={mid} light={light} />
      <MonoDefs id="pride-mono" ink={0.6} />

      {/* The backdrop: a soft wash of the club colour, darker at the edges, his own shape melted into it. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 60% at 50% 38%, ${shade(tint, -0.25)} 0%, ${shade(tint, -0.55)} 55%, ${shade(tint, -0.82)} 100%)` }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ ...photo, left: box.left - box.width * 0.1, top: box.top - box.height * 0.04, width: box.width * 1.2, height: box.height * 1.2, filter: "url(#pride-map) blur(46px)", opacity: 0.55 }} />
      )}

      {/* The portrait, in the club-colour duotone. */}
      {data.photoUrl && <img src={data.photoUrl} alt="" style={{ ...photo, filter: "url(#pride-map) contrast(1.08)", ...cutMask(data.cut) }} />}

      {/* Fall-off into shadow under the title. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: `linear-gradient(to bottom, transparent, ${dark}99 55%, ${dark}e0)` }} />

      {/* A pool of shadow behind the title, so it reads on a white shirt too. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: baseline - size * 1.5, height: size * 2.6, background: `radial-gradient(60% 50% at 50% 50%, ${dark}b8, ${dark}55 60%, transparent 100%)` }} />

      {/* The framed eye, in natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: sqL, top: sqT, width: sq, height: sq, overflow: "hidden", outline: `2px solid ${WHITE}`, boxShadow: "0 0 0 1px rgba(0,0,0,.15), 0 10px 30px rgba(0,0,0,.25)" }}>
          <img src={data.photoUrl} alt="" style={{ ...photo, left: box.left - sqL, top: box.top - sqT, filter: "contrast(1.04) saturate(1.05)" }} />
        </div>
      )}

      {/* Title. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: baseline - size * 0.93,
          textAlign: "center",
          fontFamily: BODONI,
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: `${tracking}em`,
          whiteSpace: "nowrap",
          color: WHITE,
          textShadow: "0 4px 30px rgba(0,0,0,.35)",
        }}
      >
        {word}
      </div>

      {/* Crests either side of a small "v" (or the score). */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: baseline + size * 0.32 + 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          <img src={crests[0]} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: crestFilter }} />
          {crests[1] && (
            <>
              <span style={{ fontFamily: BODONI, fontWeight: 500, fontStyle: "italic", fontSize: middle === "v" ? 30 : 40, lineHeight: 1, color: WHITE, whiteSpace: "nowrap" }}>{middle}</span>
              <img src={crests[1]} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: crestFilter }} />
            </>
          )}
        </div>
      )}

      {(["top", "bottom", "left", "right"] as const).map(edge)}

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: 70, bottom: 64 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom", opacity: 0.95 }} />

      {/* Heavy print grain and a dark rim. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.2, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(0,0,0,.42) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
