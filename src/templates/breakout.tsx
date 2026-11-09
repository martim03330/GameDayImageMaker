/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { ARCHIVO_BLACK } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { crestsOf, roundOf, sceneOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { inkOf, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const INK = "#121212";

/** Archivo Black capitals: average advance and cap height relative to the font size. */
const AB_W = 0.83;
const AB_CAP = 0.72;

/** White sheet with grey, scuffed edges (a scanned print). */
function GrungeSheet({ seed }: { seed: number }) {
  const speck = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='5' seed='${seed}'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.45  0 0 0 0 0.45  0 0 0 -3.2 1.9'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
  )}")`;
  const fine = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='${seed + 3}'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 0 0.3  0 0 0 -4 2.3'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
  )}")`;
  const edge = "radial-gradient(ellipse 75% 70% at 50% 48%, transparent 62%, #000 100%)";
  return (
    <div data-bleed style={{ position: "absolute", inset: 0, background: "#f7f7f5" }}>
      {/* Grey scuffs, only towards the edges */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: speck, backgroundSize: "600px 600px", opacity: 0.9, WebkitMaskImage: edge, maskImage: edge }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: fine, opacity: 0.35, WebkitMaskImage: edge, maskImage: edge }} />
      {/* A thin rough grey band hugging the border */}
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 26px 6px rgba(120,120,120,.35), inset 0 0 90px 10px rgba(150,150,150,.18)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: fine, opacity: 0.12 }} />
    </div>
  );
}

/**
 * Matchday card on scuffed white paper (Feyenoord – PEC Zwolle): a heavy wide title and the fixture in
 * small spaced caps, both crests, then a dark black-and-white photo panel with the player in full colour
 * breaking out of it — feet and ball below its bottom edge, shadow on the paper. His surname runs up
 * the left side in outlined club-colour letters, venue and kick-off down the right.
 */
export function Breakout({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 28;
  const r = rng(seed);
  const flip = params.side === "left";
  const { club: raw } = inkOf(data);
  // Outline and side text must hold on white: deepen light club colours.
  const club = luminance(raw) > 0.3 ? shade(raw, -0.4) : luminance(raw) > 0.18 ? shade(raw, -0.15) : raw;

  // ---- header ----
  const title = content.kicker.toUpperCase().trim();
  const titleSize = Math.min(104, 820 / Math.max(4, [...title].length * AB_W * 1.04)) * (params.textScale ?? 1);
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const fixture = home && away ? `${home} - ${away}` : postType === "potm" ? content.subline.toUpperCase() : name;
  const fixSize = Math.min(24, 820 / Math.max(6, [...fixture].length * 1.02));
  const titleTop = 56;
  const fixTop = titleTop + titleSize * 0.98 + 8;

  const score = postType === "result" || postType === "goal" ? scoreOf(data) : "";
  const crests = postType === "potm" ? ([data.club?.crestUrl].filter(Boolean) as string[]) : crestsOf(data);
  const crestTop = fixTop + fixSize + 30;
  const crestSize = 104;

  // ---- the panel ----
  const panelTop = crestTop + crestSize + 34;
  const panelBottom = Math.min(1120, panelTop + 790);
  const panelL = 200;
  const panelR = 880;
  const panelH = panelBottom - panelTop;
  const scene = data.bgPhotoUrl ?? sceneOf(data);

  // The player: head inside the panel, feet and ball on the paper below it.
  const floor = panelBottom + 132;
  const fig = data.photoUrl ? standing(data, { cx: 540 + (flip ? 40 : -40) + (r() - 0.5) * 40, headTop: panelTop + 42, floor, maxFace: 130, framing: "full" }) : null;

  // ---- side texts ----
  const surname = (content.lastName || content.firstName).toUpperCase();
  const sideLen = panelH - 40;
  const sSize = Math.min(170, sideLen / Math.max(3, [...surname].length * AB_W * 1.06));
  const sThick = sSize * AB_CAP;
  const sX = flip ? panelR + 70 - sThick / 2 : panelL - 70 - sThick / 2;
  const facts = shortFacts(data, 3);
  const when = [content.venue, content.time].filter(Boolean).join(" - ");
  const round = roundOf(data).split("·").map((t) => t.trim()).filter(Boolean);
  // The first option that still prints at a readable size down the side.
  const options = (
    postType === "matchday"
      ? [when, [content.date, content.time].filter(Boolean).join(" - "), content.time]
      : postType === "potm"
        ? [facts.map((f) => `${f.value} ${f.label}`).join(" - "), facts.slice(0, 2).map((f) => `${f.value} ${f.label}`).join(" - "), content.subline, name]
        : [[round.join(" - "), content.date].filter(Boolean).join(" - "), [round[round.length - 1], content.date].filter(Boolean).join(" - "), round[round.length - 1] ?? "", content.date]
  )
    .filter(Boolean)
    .map((t) => (t as string).toUpperCase());
  const fits = (t: string) => (panelH - 40) / Math.max(6, [...t].length * 1.08);
  const right = options.find((t) => fits(t) >= 17) ?? options[options.length - 1] ?? "";
  const rSize = Math.min(24, fits(right));

  const vertical: CSSProperties = { position: "absolute", top: panelTop, height: panelH, width: 60, display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#f7f7f5", color: INK }}>
      <GrungeSheet seed={(seed % 30) + 2} />

      {/* Title and fixture */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", fontFamily: ARCHIVO_BLACK, fontSize: titleSize, lineHeight: 1, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{title}</div>
      {fixture && (
        <div style={{ position: "absolute", left: 0, right: 0, top: fixTop, textAlign: "center", fontFamily: ARCHIVO_BLACK, fontSize: fixSize, letterSpacing: "0.3em", whiteSpace: "nowrap" }}>{fixture}</div>
      )}

      {/* Crests (with the score between them after the game) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: crestSize, display: "flex", alignItems: "center", justifyContent: "center", gap: score ? 40 : 64 }}>
        {crests[0] && <img src={crests[0]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />}
        {score && <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: 64, lineHeight: 1, color: INK, whiteSpace: "nowrap" }}>{score}</div>}
        {crests[1] && <img src={crests[1]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain" }} />}
      </div>

      {/* The dark photo panel: his own picture, blurred, in black and white */}
      <div style={{ position: "absolute", left: panelL, top: panelTop, width: panelR - panelL, height: panelH, overflow: "hidden", background: "#2a2a2a", boxShadow: "0 18px 40px rgba(0,0,0,.25)" }}>
        {scene && (
          <img
            src={scene}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: panelR - panelL + 120, height: panelH + 120, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) blur(14px) contrast(1.15) brightness(.62)" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25), transparent 35%, transparent 70%, rgba(0,0,0,.3))" }} />
      </div>

      {/* Outlined surname up the side, over the panel's edge */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <text
          transform={`translate(${(sX + sThick).toFixed(1)} ${panelBottom - 20}) rotate(-90)`}
          textLength={Math.min(sideLen, [...surname].length * sSize * AB_W * 1.06)}
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: ARCHIVO_BLACK, fontSize: sSize, letterSpacing: "0.06em" }}
          fill="none"
          stroke={club}
          strokeWidth={Math.max(2.5, sSize * 0.022)}
          strokeLinejoin="round"
        >
          {surname}
        </text>
      </svg>

      {/* Venue and kick-off, down the other side */}
      {right && (
        <div style={{ ...vertical, [flip ? "left" : "right"]: 1080 - 880 - 130 }}>
          <div style={{ transform: "rotate(90deg)", whiteSpace: "nowrap", fontFamily: ARCHIVO_BLACK, fontSize: rSize, letterSpacing: "0.3em", color: club }}>{right}</div>
        </div>
      )}

      {/* The player breaking out of the frame, with his shadow on the paper */}
      {fig && data.photoUrl && (
        <>
          {fig.feet && (
            <div style={{ position: "absolute", left: fig.faceCx - 190, top: floor - 26, width: 380, height: 52, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,.12) 60%, transparent)", filter: "blur(3px)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 14px 22px rgba(0,0,0,.28))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.08)" }} />
          </div>
        </>
      )}

      <div style={{ position: "absolute", [flip ? "left" : "right"]: 64, bottom: 54 }}>
        <AgencyLogo data={data} height={26} onLight style={{ opacity: 0.85, color: INK }} />
      </div>
    </div>
  );
}
