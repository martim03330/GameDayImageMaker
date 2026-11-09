/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { cutMask, Film } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GOLD = "#cdb98f";
const GROUND = "#141414";

/**
 * Welcome, column: the agency presenting a new player as a magazine spread. His portrait large on the left
 * (~58% of the width) fading into the dark, the agency's black-and-white photo of him faint behind it on
 * the far left edge, and a quiet right column: the welcome line small in gold, his first name in gold over
 * his surname in white (fitted to the column), his details as label/value rows between hairlines, the
 * crests of the clubs he came through, the photo of him playing small at the foot when it fits, the logo.
 */
export function Welcomecolumn({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const archivo = FACES.archivo;

  /* ---- the column ---- */
  const colL = story ? 650 : 664;
  const colR = CANVAS_W - (story ? 56 : 60);
  const colW = colR - colL;
  const colCx = (colL + colR) / 2;
  const top = (story ? STORY_TOP + 10 : 70) + (params.textY ?? 0);

  const kicker = (content.kicker || "WELCOME").toUpperCase();
  const sub = (content.subline || "NEW PLAYER").toUpperCase();
  const lineSize = (story ? 25 : 20) * ts;
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || "").toUpperCase();
  const firstSize = Math.min((story ? 128 : 112) * ts, colW / Math.max(1, wordEm(archivo, first)));
  const lastSize = Math.min(firstSize, colW / Math.max(1, wordEm(archivo, last)));
  const firstTop = top + lineSize * 2 + lineSize * 0.7 + (story ? 50 : 38);
  const lastTop = firstTop + firstSize * archivo.cap + Math.max(14, firstSize * 0.17);
  const nameBottom = lastTop + lastSize * archivo.cap;

  /* ---- the rows: position, nationality, age (whichever are there) ---- */
  const stat = (l: string) => content.stats.find((s) => s.label.toUpperCase() === l)?.value ?? "";
  const rows = ["POSITION", "NATIONALITY", "AGE"].map((l) => ({ l, v: stat(l).toUpperCase() })).filter((r) => r.v);
  const rowH = (story ? 84 : 64) * ts;
  const labelSize = (story ? 19 : 15) * ts;
  const valueSize = (story ? 32 : 25) * ts;
  const rowsTop = nameBottom + (story ? 66 : 48);
  const rowsBottom = rowsTop + (rows.length ? rows.length * rowH : 0);

  const crests = (content.career ?? []).filter((c) => c.crest).slice(0, 4);
  const crestSize = story ? 70 : 54;
  const teamsTop = rowsBottom + (rows.length ? (story ? 56 : 40) : 0);
  const teamsBottom = crests.length ? teamsTop + labelSize + (story ? 22 : 16) + crestSize : rowsBottom;

  /* ---- the logo at the foot of the column ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const logoTop = H - logoBottom - logoH;

  /* ---- the photo of him playing, small at the foot, only if there's room for it ---- */
  const actionTop = teamsBottom + (story ? 70 : 50);
  const actionBottom = logoTop - (story ? 64 : 46);
  const actionH = actionBottom - actionTop;
  const showAction = !!data.photo2Url && actionH >= (story ? 440 : 330);

  /* ---- the portrait: large on the left, fading into the column and the ground ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const faceX = (story ? 300 : 300) + (params.playerX ?? 0);
  const faceTop = (story ? 470 : 250) + (params.playerY ?? 0);
  // As wide as the left part allows, the face never larger than a big bust, a full figure never past the foot.
  let faceH = Math.min(story ? 350 : 290, ((story ? 900 : 780) / aspect) * face[3], ((H - faceTop) * 1.25 / Math.max(0.3, 1 - face[1])) * face[3]);
  faceH *= params.playerScale ?? 1;
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  const ph = faceH / face[3];
  const pw = ph * aspect;
  const pLeft = faceX - pw * (face[0] + face[2] / 2);
  const pTop = faceTop - ph * face[1];
  const pBottom = pTop + ph;
  const eyes = faceTop + faceH * 0.45;
  // It melts away before the column (and before the canvas foot if the photo ends above it).
  const fadeR = colL - (story ? 30 : 24);
  const fadeB = Math.min(H - (story ? 220 : 120), pBottom - 10);
  const pMask = `linear-gradient(to right, #000 0, #000 ${fadeR - 110}px, transparent ${fadeR}px), linear-gradient(to bottom, #000 0, #000 ${fadeB - (story ? 420 : 320)}px, transparent ${fadeB}px)`;

  /* ---- the black-and-white photo: faint behind him on the far left edge ---- */
  const g = data.ghost ?? null;
  let ghostEl: ReactNode = null;
  if (g) {
    const gf = g.face ?? [0.4, 0.06, 0.2, 0.12];
    const gFaceH = story ? 380 : 300;
    const gh = gFaceH / gf[3];
    const gw = gh * (g.aspect ?? 0.6);
    const gx = story ? 70 : 60;
    const gTop = story ? STORY_TOP + 30 : 70;
    const left = gx - gw * (gf[0] + gf[2] / 2);
    const mask = `linear-gradient(to right, #000 0, #000 ${story ? 150 : 130}px, transparent ${story ? 420 : 380}px), linear-gradient(to bottom, #000 0, #000 ${gTop + gFaceH * 1.4}px, transparent ${gTop + gFaceH * 2.6}px)`;
    ghostEl = (
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
        <img src={g.url} alt="" style={{ position: "absolute", left, top: gTop - gh * gf[1], width: gw, height: gh, maxWidth: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", maskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", filter: "grayscale(1) contrast(1.1) brightness(.8)", opacity: 0.34 }} />
      </div>
    );
  }

  let actionEl: ReactNode = null;
  if (showAction) {
    const aH = Math.min(actionH, story ? 640 : 470);
    const aTop = actionBottom - aH;
    actionEl = (
      <>
        <div style={{ position: "absolute", left: colCx - 110, width: 220, top: actionBottom - 16, height: 30, borderRadius: "50%", background: "rgba(0,0,0,.75)", filter: "blur(12px)" }} />
        <img src={data.photo2Url!} alt="" style={{ position: "absolute", left: colCx, top: aTop, height: aH, maxWidth: "none", transform: "translateX(-50%)", filter: "contrast(1.04)" }} />
      </>
    );
  }

  const small: CSSProperties = { fontFamily: CONDENSED, fontWeight: 600, fontSize: labelSize, letterSpacing: "0.3em", lineHeight: 1, color: GOLD, whiteSpace: "nowrap" };
  const hair = "1px solid rgba(255,255,255,.22)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(48% 40% at 30% ${((eyes + 120) / H) * 100}%, #2a2a2a, transparent 75%)` }} />

      {ghostEl}

      {/* The portrait. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: pMask, maskImage: pMask, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
          <div style={{ position: "absolute", left: pLeft + pw * 0.15, top: eyes, width: pw * 0.7, height: ph * 0.6, borderRadius: "50%", background: "rgba(0,0,0,.5)", filter: "blur(70px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: pLeft, top: pTop, width: pw, height: ph, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The column. */}
      <div style={{ position: "absolute", left: colL, top, ...small, fontSize: lineSize }}>{kicker}</div>
      <div style={{ position: "absolute", left: colL, top: top + lineSize * 1.7, ...small, fontSize: lineSize, opacity: 0.7 }}>{sub}</div>
      {[
        { t: first, size: firstSize, y: firstTop, color: GOLD },
        { t: last, size: lastSize, y: lastTop, color: "#fff" },
      ].map(
        (n) =>
          n.t && (
            <svg key={n.t + n.y} width={colW + 40} height={n.size} style={{ position: "absolute", left: colL, top: n.y - n.size * 0.2, overflow: "visible" }}>
              <text x={0} y={n.size * 0.2 + n.size * archivo.cap} style={{ fontFamily: archivo.family, fontSize: n.size, letterSpacing: `${archivo.tracking}em`, fill: n.color }}>
                {n.t}
              </text>
            </svg>
          ),
      )}

      {rows.length > 0 && (
        <div style={{ position: "absolute", left: colL, top: rowsTop, width: colW, borderTop: hair }}>
          {rows.map((r) => (
            <div key={r.l} style={{ height: rowH, borderBottom: hair, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <span style={small}>{r.l}</span>
              <span style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: Math.min(valueSize, (colW * 0.62) / Math.max(1, r.v.length * 0.58)), letterSpacing: "0.06em", lineHeight: 1, color: "#fff", whiteSpace: "nowrap" }}>{r.v}</span>
            </div>
          ))}
        </div>
      )}

      {crests.length > 0 && (
        <div style={{ position: "absolute", left: colL, top: teamsTop, width: colW }}>
          <div style={small}>LAST TEAMS</div>
          <div style={{ display: "flex", alignItems: "center", gap: story ? 26 : 20, marginTop: story ? 22 : 16, height: crestSize }}>
            {crests.map((c) => (
              <img key={c.name} src={c.crest!} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
            ))}
          </div>
        </div>
      )}

      {actionEl}

      <AgencyLogo data={data} height={26} style={{ position: "absolute", left: colCx, bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.35} />
    </div>
  );
}
