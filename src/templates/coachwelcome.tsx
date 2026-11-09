/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { coachRole } from "./coachhero";
import { cutMask, Film } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export type CoachWelcomeTheme = "dark" | "light";

/** Ground, name colours and soft tones of each theme. */
function palette(data: RenderData, theme: CoachWelcomeTheme) {
  if (theme === "light") {
    const { primary, accent } = data.params;
    const [main, second] = primary === "#10131c" ? [accent, primary] : [primary, accent];
    // The first name in the deep club colour: a white main colour hands over to the second, a light one deepens.
    const pale = (c: string) => luminance(c) > 0.4 && hueOf(c) === null;
    let club = pale(main) ? (pale(second) ? "#1d2430" : second) : main;
    if (luminance(club) > 0.4) club = shade(club, -0.5);
    else if (luminance(club) > 0.18) club = shade(club, -0.3);
    if (luminance(club) < 0.012) club = "#1d2430";
    const ink = "#141414";
    return {
      ground: "#f3f3f1",
      glow: "radial-gradient(60% 45% at 50% 42%, #ffffff, transparent 75%)",
      first: club,
      last: ink,
      ink,
      line: club,
      lineSub: ink,
      textShadow: "none",
      ruleColor: "rgba(20,20,20,.45)",
      blob: "rgba(0,0,0,.12)",
      crestShadow: "drop-shadow(0 2px 5px rgba(0,0,0,.18))",
      ghostFilter: "grayscale(1) contrast(.95) brightness(1.04)",
      ghostOpacity: 0.42,
      onLight: true,
      film: 0,
    };
  }
  const gold = "#cdb98f";
  return {
    ground: "#141414",
    glow: "radial-gradient(60% 45% at 50% 42%, #2b2b2b, transparent 75%)",
    first: gold,
    last: "#fff",
    ink: "#fff",
    line: gold,
    lineSub: "#fff",
    textShadow: "0 2px 14px rgba(0,0,0,.6)",
    ruleColor: "rgba(255,255,255,.6)",
    blob: "rgba(0,0,0,.55)",
    crestShadow: "drop-shadow(0 2px 8px rgba(0,0,0,.5))",
    ghostFilter: "grayscale(1) contrast(1.1) brightness(.85)",
    ghostOpacity: 0.42,
    onLight: false,
    film: 0.35,
  };
}

/** Rough width of a CONDENSED caps line, in em (Barlow Condensed ~0.5em a letter plus the tracking). */
const condEm = (s: string, track: number) => s.length * (0.5 + track);

/**
 * Coach welcome: the agency presenting a new head coach. "WELCOME - NEW HEAD COACH - WELCOME" small at the
 * top, his first name big (gold on dark / deep club colour on light) and his surname under it, his studio
 * portrait large in the middle fading into the ground, the second photo big and faint in black and white on
 * the left, age and nationality in ‹ › brackets either side of his head when known, then one clean line
 * "HEAD COACH · <club>" with the crest, and the NEYOD logo at the foot.
 */
export function CoachWelcomeBase({ data, theme }: { data: RenderData; theme: CoachWelcomeTheme }) {
  const { params, content } = data;
  const P = palette(data, theme);
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const archivo = FACES.archivo;

  /* ---- the top: the line, then the name ---- */
  const top = (story ? STORY_TOP : 44) + (params.textY ?? 0);
  const kicker = (content.kicker || "WELCOME").toUpperCase();
  const sub = (content.subline || "NEW HEAD COACH").toUpperCase();
  const lineText = `${kicker}   -   ${sub}   -   ${kicker}`;
  const lineSize = Math.min((story ? 26 : 22) * ts, (CANVAS_W - 120) / Math.max(1, condEm(lineText, 0.42)));
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || "").toUpperCase();
  const firstSize = Math.min((story ? 180 : 150) * ts, (story ? 860 : 780) / Math.max(1, wordEm(archivo, first)));
  const lastSize = Math.min(firstSize * 0.6, (story ? 760 : 680) / Math.max(1, wordEm(archivo, last)));
  const firstTop = top + lineSize + (story ? 52 : 38);
  const lastTop = firstTop + firstSize * archivo.cap + firstSize * 0.16;
  const nameBottom = lastTop + lastSize * archivo.cap;

  /* ---- the foot: logo, and the role · club line above it ---- */
  const logoAsked = 26;
  const logoPostH = Math.max(52, Math.round(logoAsked * 2));
  const logoH = story ? Math.max(88, Math.round(logoPostH * 1.7)) : logoPostH;
  const logoBottom = (story ? H - STORY_BOTTOM : 40) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;
  const crest = data.club?.crestUrl ?? null;
  const crestSize = story ? 76 : 58;
  const role = coachRole(data).toUpperCase();
  const clubName = (data.club?.name || content.homeTeam || "").toUpperCase();
  const roleText = clubName ? `${role}  ·  ${clubName}` : role;
  const roleTrack = 0.24;
  const roleRoom = CANVAS_W - 2 * 70 - (crest ? crestSize + 22 : 0);
  const roleSize = Math.min((story ? 34 : 27) * ts, roleRoom / Math.max(1, condEm(roleText, roleTrack)));
  const rowH = Math.max(crest ? crestSize : 0, roleSize);
  const rowBottom = logoTop - (story ? 64 : 50);
  const rowTop = rowBottom - rowH;

  /* ---- the portrait: centred, head just under the name, fading out above the role line ---- */
  const sizes = story ? { chest: 300, waist: 270, knees: 220, full: 180 } : { chest: 250, waist: 230, knees: 180, full: 140 };
  const faceX = 540;
  const gap = story ? 70 : 44;
  let faceTop = nameBottom + 200;
  for (let i = 0; i < 2; i++) faceTop += nameBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const eyes = box.top + (face[1] + face[3] * 0.45) * box.height;
  const fadeEnd = rowTop - (story ? 30 : 20);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 280)}px, transparent ${fadeEnd}px)`;

  /* ---- age and nationality beside his head, only when known ---- */
  const stat = (l: string) => content.stats.find((s) => s.label.toUpperCase() === l)?.value ?? "";
  const age = stat("AGE");
  const nation = stat("NATIONALITY");
  const colSize = (story ? 34 : 29) * ts;
  const colTop = Math.max(nameBottom + (story ? 120 : 80), eyes - colSize * 0.5);
  const M = story ? 56 : 60;
  const headHalf = (face[2] / 2) * box.width * 1.25;
  const colW = Math.min(story ? 290 : 270, faceX - headHalf - (story ? 30 : 24) - M);

  /* ---- the second photo: big, faint, black and white, always on the left ---- */
  const g = data.ghost ?? null;
  let ghostEl: ReactNode = null;
  if (g) {
    const gf = g.face ?? [0.4, 0.06, 0.2, 0.12];
    const aspect = g.aspect ?? 0.6;
    const gFaceH = story ? 460 : 380;
    const gh = gFaceH / gf[3];
    const gw = gh * aspect;
    const gx = story ? 190 : 190;
    const gTop = (age || nation ? colTop + colSize * 2.6 : nameBottom + (story ? 150 : 110)) + (story ? 40 : 20);
    const left = gx - gw * (gf[0] + gf[2] / 2);
    const topY = gTop - gh * gf[1];
    const mask = `linear-gradient(to right, #000 0, #000 22%, transparent 46%), linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 340)}px, transparent ${fadeEnd - 30}px)`;
    ghostEl = (
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
        <img src={g.url} alt="" style={{ position: "absolute", left, top: topY, width: gw, height: gh, maxWidth: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", maskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", filter: P.ghostFilter, opacity: P.ghostOpacity }} />
      </div>
    );
  }

  const caps: CSSProperties = { fontFamily: CONDENSED, fontWeight: 500, fontSize: colSize, letterSpacing: "0.01em", lineHeight: 1, color: P.ink, whiteSpace: "nowrap", textShadow: P.textShadow };
  const chev = (t: ReactNode) => (
    <>
      <span style={{ fontWeight: 400, margin: "0 .25em" }}>‹</span>
      {t}
      <span style={{ fontWeight: 400, margin: "0 .25em" }}>›</span>
    </>
  );
  const rule = (side: "left" | "right"): CSSProperties => ({ height: 1.5, marginTop: story ? 24 : 18, background: `linear-gradient(to ${side}, ${P.ruleColor}, transparent)` });
  const column = (t: string, side: "left" | "right") => (
    <div style={{ position: "absolute", [side]: M, top: colTop, width: colW, textAlign: "center" }}>
      <div style={caps}>{chev(t)}</div>
      <div style={rule(side)} />
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: P.ground }}>
      <div style={{ position: "absolute", inset: 0, background: P.glow }} />

      {ghostEl}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: eyes, width: box.width * 0.7, height: box.height * 0.6, borderRadius: "50%", background: P.blob, filter: "blur(70px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Top line and name. */}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: lineSize, letterSpacing: "0.42em", paddingLeft: "0.42em", lineHeight: 1, color: P.line, whiteSpace: "pre" }}>
        {kicker}
        {"   -   "}
        <span style={{ color: P.lineSub }}>{sub}</span>
        {"   -   "}
        {kicker}
      </div>
      {[
        { t: first, size: firstSize, y: firstTop, color: P.first },
        { t: last, size: lastSize, y: lastTop, color: P.last },
      ].map(
        (n) =>
          n.t && (
            <svg key={n.t + n.y} width={CANVAS_W} height={n.size} style={{ position: "absolute", left: 0, top: n.y - n.size * 0.2, overflow: "visible" }}>
              <text x={CANVAS_W / 2} y={n.size * 0.2 + n.size * archivo.cap} textAnchor="middle" style={{ fontFamily: archivo.family, fontSize: n.size, letterSpacing: `${archivo.tracking}em`, fill: n.color }}>
                {n.t}
              </text>
            </svg>
          ),
      )}

      {age && column(age, "left")}
      {nation && column(nation, "right")}

      {/* HEAD COACH · club, with the crest. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop, height: rowH, display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
        {crest && <img src={crest} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: P.crestShadow }} />}
        <div style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: roleSize, letterSpacing: `${roleTrack}em`, marginRight: `-${roleTrack}em`, lineHeight: 1, whiteSpace: "pre", color: P.ink, textShadow: P.textShadow }}>
          <span style={{ color: P.line }}>{role}</span>
          {clubName && `  ·  ${clubName}`}
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={logoAsked}
        onLight={P.onLight}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      {P.film > 0 && <Film strength={P.film} />}
    </div>
  );
}

/** The agency's dark welcome style for a new head coach. */
export function Coachwelcome({ data }: { data: RenderData }) {
  return <CoachWelcomeBase data={data} theme="dark" />;
}
