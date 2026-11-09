/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { cutMask, Film } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { maskUrl } from "./maskurl";

const GOLD = "#cdb98f";
const GROUND = "#141414";

type Layout = {
  /** Where the black-and-white photo sits: big beside him, huge behind the name, or not at all. */
  ghost: "left" | "right" | "top" | "none";
  /** The photo of him playing: laid over the portrait in the middle, large to one side, or not at all. */
  action: "center" | "side" | "none";
  /** The agency's own style: ‹ 23 YEARS › in brackets, WELCOME - NEW PLAYER - WELCOME. */
  brackets: boolean;
};

/**
 * Welcome: the agency presenting a new player. A dark ground, the welcome line small at the top, his
 * first name big in sand gold and his surname in white under it, his portrait large in the middle fading
 * into the dark. Either side of his head two quiet columns: age and position, then nationality and the
 * crests of the clubs he came through. The variants add the agency's other photos of him: one big in
 * black and white behind, and one of him playing laid over the portrait. The NEYOD logo at the foot.
 */
function WelcomeBase({ data, layout }: { data: RenderData; layout: Layout }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const archivo = FACES.archivo;
  const { brackets } = layout;

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
  const action = data.photo2Url && layout.action !== "none" ? layout.action : "none";
  const sizes = story ? { chest: 270, waist: 240, knees: 190, full: 150 } : { chest: 250, waist: 220, knees: 170, full: 130 };
  const faceX = 540;
  const gap = story ? 70 : 44;
  let faceTop = nameBottom + 200;
  for (let i = 0; i < 2; i++) faceTop += nameBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  const box = placeByFace(data, faceX, faceTop, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const eyes = box.top + (face[1] + face[3] * 0.45) * box.height;
  const chin = box.top + (face[1] + face[3]) * box.height;
  // With a player laid over him the portrait melts away sooner, so the one in front reads clearly.
  const fadeEnd = H - (story ? 330 : 170) - (action === "center" ? (story ? 120 : 90) : 0);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 320 : 280)}px, transparent ${fadeEnd}px)`;

  /* ---- the two columns beside his head ---- */
  const stat = (l: string) => content.stats.find((s) => s.label.toUpperCase() === l)?.value ?? "";
  const leftCol = [stat("AGE"), stat("POSITION")].filter(Boolean);
  const nation = stat("NATIONALITY");
  const crests = (content.career ?? []).filter((c) => c.crest).slice(0, 8);
  const colSize = (story ? 32 : 27) * ts * (brackets ? 1.08 : 1);
  const colTop = Math.max(nameBottom + (story ? 120 : 80), eyes - colSize * 1.4);
  const M = story ? 56 : 60;
  // Each column ends well clear of his head (the face box plus his ears and hair).
  const headHalf = (face[2] / 2) * box.width * 1.35;
  const colW = Math.min(story ? 290 : 270, faceX - headHalf - (story ? 34 : 26) - M);
  const crestSize = brackets ? (story ? 58 : 50) : story ? 62 : 54;
  /* Full career (more than 3 clubs): "‹ LAST TEAMS ›" level with the 2nd line on the left, then ONE row of
     crests that may run out towards the canvas edge so they stay big; the left column is centred against the
     right one and both rules sit at the same height (user, 22/10 — kept for every welcome post). */
  const career = brackets && crests.length > 3;
  const cGap = story ? 10 : 8;
  const cHang = M - (story ? 22 : 24);
  const cRowW = colW + cHang;
  // The whole right block sits a little in from the edge, so the last crest (his current club) never
  // touches it; that crest is drawn bigger, and the rule runs under the full row (user, 22/10).
  const cShift = career ? 36 : 0;
  const isNow = (c: { name: string }, i: number) => (content.currentClub ? c.name === content.currentClub : i === crests.length - 1);
  const NOW_SCALE = 1.15;
  // Each crest takes only its own width (most are ~0.85 as wide as tall), so they can be that much bigger.
  const cSize = Math.min(crestSize, (cRowW - cGap * (crests.length - 1)) / Math.max(1, (crests.length - 1 + NOW_SCALE) * 0.85));
  const cRowTop = colSize * 0.55;
  const rightH = colSize * 2.5 + cRowTop + cSize * NOW_SCALE;
  const leftH = colSize * 2.5;
  // Bottom-aligned: "RIGHT BACK" sits as close above its rule as the crests above theirs (user, 22/10).
  const leftShift = career ? rightH - leftH : 0;
  /* ---- the black-and-white photo ---- */
  const g = data.ghost ?? null;
  // The black-and-white photo beside him always goes on the left (the agency's rule).
  const ghostSide = !g ? "none" : layout.ghost === "right" ? "left" : layout.ghost;
  let ghostEl: ReactNode = null;
  if (g && ghostSide !== "none") {
    const gf = g.face ?? [0.4, 0.06, 0.2, 0.12];
    const aspect = g.aspect ?? 0.6;
    const huge = ghostSide === "top";
    const gScale = content.ghostScale ?? 1;
    const gFaceH = (huge ? (story ? 620 : 520) : story ? 360 : 320) * gScale;
    // No face found (a back view, a crop of his hair): sized by the photo itself, not by a guessed face —
    // the guess made it several canvases tall. Never taller than ~1.6 canvases either way.
    const gh = Math.min(g.face ? gFaceH / gf[3] : (huge ? H * 0.9 : story ? 1150 : 950) * gScale, H * 1.6 * gScale);
    const gw = gh * aspect;
    const gx = huge ? 540 : ghostSide === "left" ? (story ? 210 : 215) : CANVAS_W - (story ? 210 : 215);
    const gTop = huge ? top + (story ? 60 : 30) : colTop + colSize * 3 + (story ? 90 : 70);
    const left = g.face ? gx - gw * (gf[0] + gf[2] / 2) : gx - gw / 2;
    const topY = g.face ? gTop - gh * gf[1] : gTop - gh * 0.04;
    const toward = ghostSide === "left" ? "right" : "left";
    // Story: gone by y≈1440, well above the logo, so his shirt print and badge never reach the foot.
    const ghostFoot = story ? "linear-gradient(to bottom, #000 1020px, transparent 1440px)" : "linear-gradient(to bottom, #000 60%, transparent 92%)";
    const mask = huge
      ? `radial-gradient(48% 42% at 50% ${((gTop + gFaceH * 0.5) / H) * 100}%, #000 30%, transparent 100%)`
      : `linear-gradient(to ${toward}, #000 0, #000 28%, transparent 50%), ${ghostFoot}`;
    // The portrait's silhouette is cut out of the black-and-white photo: where his arms fade out at the foot,
    // the other photo must not show through them (it read as a double exposure).
    // The silhouette cut out of it stays whole while the portrait still shows and fades only after the portrait
    // has gone: faded together, the black-and-white collar showed through his half-faded sleeves as a grey
    // mark. Fading after it still leaves no hard edge below his arms.
    const holeFade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 60 : 40)}px, transparent ${fadeEnd + (story ? 200 : 160)}px)`;
    const cutout = data.photoUrl
      ? {
          // Bottom-up: the portrait's cutout, minus it from the foot fade, then intersect with the side fade.
          maskImage: `${mask}, url(${maskUrl(data.photoUrl)}), ${holeFade}`,
          maskPosition: `${huge ? "0 0" : "0 0, 0 0"}, ${box.left}px ${box.top}px, 0 0`,
          maskSize: `${huge ? "100% 100%" : "100% 100%, 100% 100%"}, ${box.width}px ${box.height}px, 100% 100%`,
          maskRepeat: "no-repeat",
          maskComposite: huge ? "subtract, intersect, add" : "intersect, subtract, intersect, add",
        }
      : { WebkitMaskImage: mask, maskImage: mask, WebkitMaskComposite: "source-in", maskComposite: "intersect" };
    ghostEl = (
      <div style={{ position: "absolute", inset: 0, ...(cutout as CSSProperties) }}>
        <img
          src={g.url}
          alt=""
          style={{ position: "absolute", left, top: topY, width: gw, height: gh, maxWidth: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", maskImage: "linear-gradient(to bottom, #000 50%, transparent 94%)", filter: "grayscale(1) contrast(1.1) brightness(.85)", opacity: huge ? 0.38 : 0.6 }}
        />
      </div>
    );
  }

  /* ---- the photo of him playing ---- */
  let actionEl: ReactNode = null;
  if (action !== "none") {
    const side = action === "side";
    const aBottom = story ? STORY_BOTTOM - 120 : H - 118;
    // In the middle his head sits on the portrait's chest, never over its face; to the side, under the columns.
    const aTop = side ? colTop + colSize * 4 + crestSize + (story ? 70 : 50) : chin + box.faceH * (story ? 0.6 : 0.5);
    const aH = Math.max(story ? 560 : 420, aBottom - aTop) * (content.actionScale ?? 1);
    // Over the middle of the portrait, or large on the right (the black-and-white photo has the left).
    const anchor: CSSProperties = side ? { right: 20 } : { left: "50%", transform: "translateX(-50%)" };
    actionEl = (
      <>
        <div
          style={{
            position: "absolute",
            ...(side ? { right: 60 } : { left: 290 }),
            width: side ? 420 : 500,
            top: aBottom - 30,
            height: 60,
            borderRadius: "50%",
            background: "rgba(0,0,0,.7)",
            filter: "blur(18px)",
          }}
        />
        <img
          src={data.photo2Url!}
          alt=""
          style={{ position: "absolute", ...anchor, top: aBottom - aH, height: aH, maxWidth: "none", filter: "drop-shadow(0 18px 30px rgba(0,0,0,.55)) contrast(1.04)" }}
        />
      </>
    );
  }

  const caps: CSSProperties = brackets
    ? { fontFamily: CONDENSED, fontWeight: 500, fontSize: colSize, letterSpacing: "0.01em", lineHeight: 1, color: "#fff", whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.6)" }
    : { fontFamily: CONDENSED, fontWeight: 600, fontSize: colSize, letterSpacing: "0.22em", lineHeight: 1, color: "#fff", whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,.6)" };
  const chev = (t: ReactNode) =>
    brackets ? (
      <>
        <span style={{ fontWeight: 400, margin: "0 .25em" }}>‹</span>
        {t}
        <span style={{ fontWeight: 400, margin: "0 .25em" }}>›</span>
      </>
    ) : (
      t
    );
  const rule = (side: "left" | "right"): CSSProperties => ({
    height: 1.5,
    marginTop: story ? 26 : 20,
    background: `linear-gradient(to ${side === "left" ? "left" : "right"}, rgba(255,255,255,.75), transparent)`,
  });

  const logoBottom = (story ? H - STORY_BOTTOM : 40) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 45% at 50% 42%, #2b2b2b, transparent 75%)" }} />

      {ghostEl}

      {/* The portrait. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, top: eyes, width: box.width * 0.7, height: box.height * 0.7, borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(70px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 360, background: `linear-gradient(to bottom, transparent, ${GROUND})` }} />

      {actionEl}

      {/* Top line and name. */}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: lineSize, letterSpacing: "0.42em", paddingLeft: "0.42em", lineHeight: 1, color: GOLD, whiteSpace: "pre" }}>
        {brackets ? (
          <>
            {kicker}
            {"   -   "}
            <span style={{ color: "#fff" }}>{sub}</span>
            {"   -   "}
            {kicker}
          </>
        ) : (
          `${kicker}  ·  ${sub}`
        )}
      </div>
      {[
        { t: first, size: firstSize, y: firstTop, color: GOLD },
        { t: last, size: lastSize, y: lastTop, color: "#fff" },
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
        <div style={{ position: "absolute", left: M, top: colTop + leftShift, width: colW, textAlign: brackets ? "center" : "right" }}>
          {leftCol.map((t, i) => (
            <div key={t} style={{ ...caps, marginTop: i ? colSize * 0.5 : 0, marginRight: brackets ? 0 : "-0.22em" }}>{chev(t)}</div>
          ))}
          {!career && <div style={rule("left")} />}
        </div>
      )}

      {/* Right column: nationality, the clubs he came through. */}
      {(nation || crests.length > 0) && (
        <div style={{ position: "absolute", right: M + cShift, top: colTop, width: colW, textAlign: brackets ? "center" : "left" }}>
          {nation && <div style={caps}>{chev(nation)}</div>}
          {crests.length > 0 &&
            (career ? (
              <>
                <div style={{ ...caps, marginTop: colSize * 0.5 }}>{chev("LAST TEAMS")}</div>
                {/* Oldest → newest, all the same size, in one row hanging out towards the edge. */}
                {/* All crests stand on one line (bottoms aligned; his current club's, bigger, grows upwards) and
                    each takes only its own width, so the gaps between them are really equal (user, 22/10). */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: cGap, marginTop: cRowTop, height: cSize * NOW_SCALE, width: cRowW, marginLeft: -cHang / 2, marginRight: -cHang / 2 }}>
                  {crests.map((c, i) => {
                    const s = cSize * (isNow(c, i) ? NOW_SCALE : 1);
                    return <img key={c.name} src={c.crest!} alt="" style={{ height: s, width: "auto", maxWidth: s, objectFit: "contain", objectPosition: "center bottom", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />;
                  })}
                </div>
              </>
            ) : brackets ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: story ? 10 : 8, marginTop: colSize * 0.45, height: crestSize, ...caps, fontSize: colSize * 0.62 }}>
                <span style={{ marginRight: 4 }}>LAST TEAMS</span>
                <span style={{ fontSize: colSize }}>‹</span>
                {crests.map((c) => (
                  <img key={c.name} src={c.crest!} alt="" style={{ width: crestSize * (c.name === content.currentClub ? 1.65 : 1), height: crestSize * (c.name === content.currentClub ? 1.65 : 1), objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
                ))}
                <span style={{ fontSize: colSize }}>›</span>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: colSize * 0.6, letterSpacing: "0.3em", lineHeight: 1, color: GOLD, marginTop: nation ? colSize * 0.62 : 0 }}>LAST TEAMS</div>
                <div style={{ display: "flex", alignItems: "center", gap: story ? 14 : 12, marginTop: colSize * 0.4, height: crestSize }}>
                  {crests.map((c) => (
                    <img key={c.name} src={c.crest!} alt="" style={{ width: crestSize * (c.name === content.currentClub ? 1.65 : 1), height: crestSize * (c.name === content.currentClub ? 1.65 : 1), objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.5))" }} />
                  ))}
                </div>
              </>
            ))}
          {!career && <div style={rule("right")} />}
        </div>
      )}

      {/* Full career: both rules drawn at the SAME whole-pixel height (in-flow they rounded 1px apart). */}
      {career &&
        (["left", "right"] as const).map((side) => (
          <div
            key={side}
            style={{
              ...rule(side),
              // Under the whole crest row (to past his current club's crest), still fading towards the edge.
              background: `linear-gradient(to ${side}, rgba(255,255,255,.75), rgba(255,255,255,.75) 55%, rgba(255,255,255,.3))`,
              marginTop: 0,
              height: 2,
              position: "absolute",
              top: Math.round(colTop + rightH + (story ? 26 : 20)),
              width: cRowW,
              // Centred under "LAST TEAMS" like the crest row (and mirrored on the left).
              ...(side === "left" ? { left: M + cShift - cHang / 2 } : { right: M + cShift - cHang / 2 }),
            }}
          />
        ))}

      <AgencyLogo data={data} height={26} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.35} />
    </div>
  );
}

/** Portrait, the black-and-white photo beside him. */
export const Welcome = ({ data }: { data: RenderData }) => <WelcomeBase data={data} layout={{ ghost: "left", action: "none", brackets: false }} />;
/** The agency's own layout: portrait, black-and-white photo on the left, him playing laid over the middle. */
export const Welcomeplay = ({ data }: { data: RenderData }) => <WelcomeBase data={data} layout={{ ghost: "left", action: "center", brackets: true }} />;
/** Portrait and him playing large to one side; no black-and-white photo. */
export const Welcomeduo = ({ data }: { data: RenderData }) => <WelcomeBase data={data} layout={{ ghost: "none", action: "side", brackets: false }} />;
/** His face huge in black and white behind the name, portrait, him playing over the middle. */
export const Welcomehalo = ({ data }: { data: RenderData }) => <WelcomeBase data={data} layout={{ ghost: "top", action: "center", brackets: true }} />;
