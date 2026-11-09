/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { bodEm, BOD, caps, Guides, MetaRows, monoW, specimenFade } from "./specimen";
import { matchFacts } from "./strokes";
import { mix, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#f1eee7";
const DIM = "rgba(241,238,231,.5)";
const RULE = "rgba(241,238,231,.2)";

/**
 * Goal specimen: the goal sheet of `specimen`, printed in reverse on a deep, calm ground. The sample word is
 * "Goal" (or the kicker: "Brace", "Hat-trick"), set huge in Bodoni across the whole width with its cap-height,
 * x-height and baseline guides; the celebrating player stands under it on one side, his raised arms free to cross it. On the
 * other side, the character set and the specimen metadata in tiny mono caps between hairlines:
 * SCORER — MOISÉS CONCEIÇÃO, MATCH — SC VIANENSE SAD V LEIXÕES (never a score).
 */
export function Goalspecimen({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.22 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";

  const X = 64;
  const W = CANVAS_W - 2 * X;

  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* ---- header ---- */
  const hSize = 13 * k;
  const top0 = (story ? STORY_TOP : 64) + (params.textY ?? 0);
  const left = "TYPE SPECIMEN";
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const compSize = Math.min(hSize, (W - monoW(left, hSize, 0.14) - 40) / Math.max(1, monoW(comp, 1, 0.14)));
  const hRule = top0 + hSize + 16 * k;

  /* ---- the sample word, across the width; the guide labels on the player's far side ---- */
  const word = sentenceCase(content.kicker || "Goal");
  const lab = 10 * k;
  const room = W - 70;
  const gSize = Math.min(story ? 470 : 420, room / Math.max(1, bodEm(word)));
  const gTop = hRule + 18 * k - gSize * 0.06;
  const gBase = gTop + BOD.base * gSize;
  const wordX = playerLeft ? X : X + W - bodEm(word) * gSize; // the labels sit in the space left on his far side

  /* ---- the text column (opposite the player), metadata anchored over the logo ---- */
  const colW = story ? 520 : 470;
  const colX = playerLeft ? X + W - colW : X;
  const [home, away] = teamsOf(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const rows = [
    ...(name ? [{ label: "SCORER", value: caps(name) }] : []),
    ...(home ? [{ label: "MATCH", value: caps(away ? `${home} v ${away}` : home) }] : []),
    ...(f.day ? [{ label: "DATE", value: `${f.day} ${f.mon}`.trim() }] : []),
  ];
  const rowH = 44 * k;
  const rowsTop = logoTop - (story ? 64 : 60) - rows.length * rowH;

  const set = ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ", "abcdefghijklm", "nopqrstuvwxyz", "0123456789&?!"];
  const sSize = Math.min(42 * k, ...set.map((t) => (colW * 0.92) / bodEm(t)));
  const sLead = sSize * 1.16;
  const setH = set.length * sLead;
  const setTop = gBase + (rowsTop - gBase - setH) * 0.5;
  const showSet = rowsTop - gBase - setH > 80 * k;

  /* ---- the player, celebrating, under the word ---- */
  const sizes = story ? { chest: 300, waist: 244, knees: 192, full: 154 } : { chest: 220, waist: 180, knees: 142, full: 114 };
  const faceX = playerLeft ? (story ? 280 : 270) : CANVAS_W - (story ? 280 : 270);
  const faceTop = gBase + (story ? 56 : 44); // his head under the baseline: the word stays whole and legible
  const pb = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = pb.top + face[1] * pb.height + pb.faceH;
  const sideFade = specimenFade(pb.left, pb.width, colX, colW, playerLeft, story ? 150 : 100);

  const ground = mix(shade(club, -0.7), "#121214", 0.45);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 45% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${mix(shade(club, -0.35), "#3c3d41", 0.45)}, transparent 80%)`, opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 100% at 50% 40%, transparent 60%, rgba(0,0,0,.35))" }} />

      {/* Header */}
      <div style={{ position: "absolute", left: X, top: top0, fontFamily: MONO, fontWeight: 500, fontSize: hSize, lineHeight: 1, letterSpacing: "0.14em", color: INK, whiteSpace: "nowrap" }}>{left}</div>
      {comp && <div style={{ position: "absolute", left: X + W - monoW(comp, compSize, 0.14), top: top0 + (hSize - compSize), fontFamily: MONO, fontWeight: 500, fontSize: compSize, lineHeight: 1, letterSpacing: "0.14em", color: DIM, whiteSpace: "nowrap" }}>{comp}</div>}
      <div style={{ position: "absolute", left: X, top: hRule, width: W, height: 1, background: INK, opacity: 0.7 }} />

      {/* The sample word with its guides, behind him. */}
      <Guides x={X} w={W} top={gTop} size={gSize} rule={RULE} dim={DIM} label={lab} labelLeft={!playerLeft} xLine />
      <div style={{ position: "absolute", left: wordX - gSize * 0.01, top: gTop, fontFamily: BODONI, fontWeight: 500, fontSize: gSize, lineHeight: 1, color: INK, whiteSpace: "nowrap" }}>{word}</div>

      {/* The player, rising in front of the word; a soft shade behind his shoulders. */}
      <div style={{ position: "absolute", left: faceX - pb.faceH * 2.2, top: chin + pb.faceH * 0.4, width: pb.faceH * 4.4, height: pb.faceH * 6, borderRadius: "50%", background: "rgba(0,0,0,.32)", filter: `blur(${story ? 80 : 60}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: pb.left, top: pb.top, width: pb.width, height: pb.height, WebkitMaskImage: sideFade, maskImage: sideFade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The character set and the metadata. */}
      {showSet &&
        set.map((t, i) => (
          <div key={t} style={{ position: "absolute", left: colX, top: setTop + i * sLead, fontFamily: BODONI, fontWeight: 500, fontSize: sSize, lineHeight: 1, letterSpacing: "0.02em", color: i < 2 ? INK : "rgba(241,238,231,.72)", whiteSpace: "nowrap" }}>{t}</div>
        ))}
      <MetaRows rows={rows} x={colX} y={rowsTop} w={colW} size={14.5 * k} rowH={rowH} ink={INK} dim={DIM} rule={RULE} />

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: colX, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: "left bottom" }} />
      <Film strength={0.12} />
    </div>
  );
}
