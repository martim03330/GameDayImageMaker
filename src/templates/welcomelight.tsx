/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

export type WelcomeTheme = "light" | "club";

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The club's two colours: the main one (skipping the "dark tone" placeholder) and the second. */
function clubPair(data: RenderData): [string, string] {
  const { primary, accent } = data.params;
  return primary === "#10131c" ? [accent, primary] : [primary, accent];
}

/** The palette of each theme: ground, the two name colours, the info ink and the soft tones. */
function palette(data: RenderData, theme: WelcomeTheme) {
  const [main, second] = clubPair(data);
  if (theme === "light") {
    // The first name in the deep club colour: a light / yellow club falls back to its second colour, then darkens.
    // A white main colour hands over to the second; a coloured light one (yellow) deepens into its own hue.
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
      ruleColor: "rgba(20,20,20,.55)",
      blob: "rgba(0,0,0,.14)",
      crestShadow: "drop-shadow(0 2px 5px rgba(0,0,0,.18))",
      ghostFilter: "grayscale(1) contrast(.92) brightness(1.08)",
      ghostOpacity: 0.5,
      actionShadow: "drop-shadow(0 16px 24px rgba(0,0,0,.22)) contrast(1.04)",
      floor: "rgba(0,0,0,.22)",
      onLight: true,
      film: 0,
    };
  }
  // Club ground: deep navy / red stay deep; light or yellow clubs (and pale greys) get a charcoal ground.
  let ground = main;
  const l = luminance(ground);
  if (l > 0.3) ground = luminance(second) < 0.12 && luminance(second) > 0.008 ? second : "#1c1d21";
  else if (l > 0.09) ground = shade(ground, -0.35);
  else if (l < 0.008) ground = "#1c1d21";
  if (luminance(ground) > 0.09) ground = shade(ground, -0.3);
  // A touch deeper still, so even a royal blue reads as a deep club ground.
  if (ground !== "#1c1d21") ground = shade(ground, -0.18);
  const white = "#f4f2ec";
  // The surname in the club's second colour when it reads on the ground (and isn't the ground itself), else off-white.
  const sec = second === ground || second === main ? white : second;
  const last = contrast(sec, ground) >= 3.2 ? sec : white;
  return {
    ground,
    glow: `radial-gradient(60% 45% at 50% 42%, ${shade(ground, 0.16)}, transparent 75%)`,
    first: white,
    last,
    ink: white,
    line: last === white ? white : last,
    lineSub: white,
    textShadow: "0 2px 14px rgba(0,0,0,.45)",
    ruleColor: "rgba(255,255,255,.7)",
    blob: "rgba(0,0,0,.4)",
    crestShadow: "drop-shadow(0 2px 8px rgba(0,0,0,.45))",
    ghostFilter: "grayscale(1) contrast(1.1) brightness(.9)",
    ghostOpacity: 0.68,
    actionShadow: "drop-shadow(0 18px 30px rgba(0,0,0,.5)) contrast(1.04)",
    floor: "rgba(0,0,0,.55)",
    onLight: false,
    film: 0.3,
  };
}

/**
 * The agency's welcome layout (portrait in the middle, the black-and-white photo on the left, him playing
 * laid over the portrait's chest, bracketed info, "WELCOME - NEW PLAYER - WELCOME") set on another ground:
 * the light off-white of the hero family, or the club's own deep colour.
 */
export function WelcomeThemed({ data, theme }: { data: RenderData; theme: WelcomeTheme }) {
  const { params, content } = data;
  const P = palette(data, theme);
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const archivo = FACES.archivo;

  /* ---- the top: the line, then the name ---- */
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

  /* ---- the portrait: centred, head just under the name, fading into the ground ---- */
  const action = data.photo2Url ? "center" : "none";
  const sizes = story ? { chest: 270, waist: 240, knees: 190, full: 150 } : { chest: 250, waist: 220, knees: 170, full: 130 };
  const faceX = 540;
  const gap = story ? 70 : 44;
  let faceTop = nameBottom + 200;
  for (let i = 0; i < 2; i++) faceTop += nameBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const eyes = box.top + (face[1] + face[3] * 0.45) * box.height;
  const chin = box.top + (face[1] + face[3]) * box.height;
  const fadeEnd = H - (story ? 330 : 170) - (action === "center" ? (story ? 120 : 90) : 0);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 320 : 280)}px, transparent ${fadeEnd}px)`;

  /* ---- the two columns beside his head ---- */
  const stat = (l: string) => content.stats.find((s) => s.label.toUpperCase() === l)?.value ?? "";
  const leftCol = [stat("AGE"), stat("POSITION")].filter(Boolean);
  const nation = stat("NATIONALITY");
  const crests = (content.career ?? []).filter((c) => c.crest).slice(0, 4);
  const colSize = (story ? 32 : 27) * ts * 1.08;
  const colTop = Math.max(nameBottom + (story ? 120 : 80), eyes - colSize * 1.4);
  const M = story ? 56 : 60;
  const headHalf = (face[2] / 2) * box.width * 1.35;
  const colW = Math.min(story ? 290 : 270, faceX - headHalf - (story ? 34 : 26) - M);
  const crestSize = story ? 46 : 40;

  /* ---- the black-and-white photo: always on the left ---- */
  const g = data.ghost ?? null;
  let ghostEl: ReactNode = null;
  if (g) {
    const gf = g.face ?? [0.4, 0.06, 0.2, 0.12];
    const aspect = g.aspect ?? 0.6;
    const gFaceH = story ? 360 : 320;
    const gh = gFaceH / gf[3];
    const gw = gh * aspect;
    const gx = story ? 210 : 215;
    const gTop = colTop + colSize * 3 + (story ? 90 : 70);
    const left = gx - gw * (gf[0] + gf[2] / 2);
    const topY = gTop - gh * gf[1];
    // In the story the photo melts away well above the logo, so its lower part (shirt text, badges) never shows.
    const down = story ? "#000 1060px, transparent 1440px" : "#000 60%, transparent 92%";
    const mask = `linear-gradient(to right, #000 0, #000 28%, transparent 50%), linear-gradient(to bottom, ${down})`;
    ghostEl = (
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
        <img src={g.url} alt="" style={{ position: "absolute", left, top: topY, width: gw, height: gh, maxWidth: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", maskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", filter: P.ghostFilter, opacity: P.ghostOpacity }} />
      </div>
    );
  }

  /* ---- the photo of him playing, over the portrait's chest ---- */
  let actionEl: ReactNode = null;
  if (action !== "none") {
    const aBottom = story ? STORY_BOTTOM - 120 : H - 118;
    const aTop = chin + box.faceH * (story ? 0.6 : 0.5);
    const aH = Math.max(story ? 560 : 420, aBottom - aTop);
    actionEl = (
      <>
        <div style={{ position: "absolute", left: 290, width: 500, top: aBottom - 30, height: 60, borderRadius: "50%", background: P.floor, filter: "blur(18px)" }} />
        <img src={data.photo2Url!} alt="" style={{ position: "absolute", left: "50%", transform: "translateX(-46%)", top: aBottom - aH, height: aH, maxWidth: "none", filter: P.actionShadow }} />
      </>
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
  const rule = (side: "left" | "right"): CSSProperties => ({
    height: 1.5,
    marginTop: story ? 26 : 20,
    background: `linear-gradient(to ${side}, ${P.ruleColor}, transparent)`,
  });

  const logoBottom = (story ? H - STORY_BOTTOM : 40) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: P.ground }}>
      <div style={{ position: "absolute", inset: 0, background: P.glow }} />

      {ghostEl}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: eyes, width: box.width * 0.7, height: box.height * 0.7, borderRadius: "50%", background: P.blob, filter: "blur(70px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 360, background: `linear-gradient(to bottom, transparent, ${P.ground})` }} />

      {actionEl}

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

      {/* Left column: age, position. */}
      {leftCol.length > 0 && (
        <div style={{ position: "absolute", left: M, top: colTop, width: colW, textAlign: "center" }}>
          {leftCol.map((t, i) => (
            <div key={t} style={{ ...caps, marginTop: i ? colSize * 0.5 : 0 }}>{chev(t)}</div>
          ))}
          <div style={rule("left")} />
        </div>
      )}

      {/* Right column: nationality, the clubs he came through. */}
      {(nation || crests.length > 0) && (
        <div style={{ position: "absolute", right: M, top: colTop, width: colW, textAlign: "center" }}>
          {nation && <div style={caps}>{chev(nation)}</div>}
          {crests.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: story ? 10 : 8, marginTop: colSize * 0.45, height: crestSize, ...caps, fontSize: colSize * 0.62 }}>
              <span style={{ marginRight: 4 }}>LAST TEAMS</span>
              <span style={{ fontSize: colSize }}>‹</span>
              {crests.map((c) => (
                <img key={c.name} src={c.crest!} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: P.crestShadow }} />
              ))}
              <span style={{ fontSize: colSize }}>›</span>
            </div>
          )}
          <div style={rule("right")} />
        </div>
      )}

      <AgencyLogo
        data={data}
        height={26}
        onLight={P.onLight}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      {P.film > 0 && <Film strength={P.film} />}
    </div>
  );
}

/** The agency's welcome layout on the light off-white ground: first name in the deep club colour, surname in ink. */
export function Welcomelight({ data }: { data: RenderData }) {
  return <WelcomeThemed data={data} theme="light" />;
}
