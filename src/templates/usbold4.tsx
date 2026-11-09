/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { ANTON, em } from "./mist";
import { Filled } from "./natref4";
import { NatFigure, natPlace } from "./natkit";
import { DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { Logo, capsStyle, facts, frame, groundOf, wrapCaps } from "./usbold1";

/*
 * Round 79 · two looks after the references round 78 chose (Pinterest):
 *
 *   usgameside        bold US matchday after Temple women's soccer "GAME / DAY" ("college soccer gameday graphic
 *                     2026", row 1 col 3): his own photo, the ground blurred and washed in the club colour, him
 *                     sharp and in colour on the left; GAME / DAY giant condensed white caps stacked to the right
 *                     of his face, a small "time | venue" line over it; the club's exact name as a large faded
 *                     word at the foot, behind him.
 *   goalnatrefoutline goal after Juventus "GOAL" (Kenan Yildiz — "goal graphic design football player name", row 2
 *                     col 2): the ground dark and drained of colour, a solid white GOAL above his hair, the word
 *                     repeated in club-colour outline behind his body from under his chin down (no row ever
 *                     reaches his face), his name small at the foot. No minute, no score.
 *
 * Both: the ground is the photo with him filled out (Filled), so he is never doubled; he goes on top sharp and in
 * colour (NatFigure clean). When the type cannot sit beside / above his head (head high in the photo, face too far
 * right) it drops under his chin, in front of him, over a soft backing — never behind his hair, never on his face.
 */

const W = CANVAS_W;
const WIDE = "var(--font-archivo-black), 'Arial Black', sans-serif";
/** Archivo Black caps: rough advance relative to the size (as usbold3). */
const wideEm = (t: string) => [...t].reduce((a, c) => a + (/[MW]/.test(c) ? 1.02 : /[I1]/.test(c) ? 0.42 : c === " " ? 0.3 : 0.78), 0);

/** The wash colour: the club colour, lifted when too dark to tint anything, darkened when too light. */
function hueOf(data: RenderData) {
  const { club } = groundOf(data);
  const l = luminance(club);
  return l < 0.06 ? shade(club, 0.35) : l > 0.7 ? shade(club, -0.35) : club;
}

/* ===== usgameside — GAME / DAY stacked beside his face ===== */

export function Usgameside({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const k = story ? 1.3 : 1;
  const f = facts(data);
  const hue = hueOf(data);
  const deep = shade(hue, -0.55);

  // ---- him: on the left, big ----
  const place = natPlace(data, W, H, { fx: story ? 330 : 320, fy: story ? 760 : 500, fs: story ? 200 : 150 });
  const nx = place.nudge?.x ?? 0;
  const ny = place.nudge?.y ?? 0;
  const faceCx = place.fx + nx;
  const faceCy = place.fy + ny;

  // ---- the word: its column starts clear of his face and hair ----
  const words = (data.content.kicker || "GAME DAY").toUpperCase().replace(/’/g, "'").replace(/\s+/g, " ").trim();
  const m = /^(\S+)\s?(DAY)$/.exec(words);
  const lines = m ? [m[1], m[2]] : words.split(" ").length > 1 ? [words.split(" ").slice(0, -1).join(" "), words.split(" ").slice(-1)[0]] : [words];
  const widest = Math.max(...lines.map((l) => em(l, ANTON, 40)));
  // clear of his face AND his hair (a profile's hair runs well behind the face box)
  const colX0 = Math.round(faceCx + Math.max(place.faceW * 0.75, place.fs * 0.85) + 40);
  const colX1 = W - 54;
  const colW = colX1 - colX0;

  // ---- the info line: time | venue (date when there is no time) ----
  const info = [f.time || f.date, f.venue].filter(Boolean).join("  |  ");

  // ---- the foot: the club's exact name, big and faded ----
  const clubW = wrapCaps(f.ours, W - 80, 230 * ts * (story ? 1 : 0.8), 40, 0.01, 2, 0.5);
  const clubLH = clubW.px * 0.98;
  const clubTop = logoTop - 34 - clubW.lines.length * clubLH;

  const minTop = story ? 250 : 110;
  const side = colW >= 360 && faceCy - place.fs * 0.5 > minTop + 40;
  let wordPx: number;
  let wordTop: number;
  let infoW: ReturnType<typeof wrapCaps>;
  let infoTop: number;
  let blockBottom: number;
  if (side) {
    wordPx = Math.min(330 * k * ts, colW / Math.max(1, widest));
    infoW = wrapCaps(info, colW, 24 * ts * k * 0.85, 13, 0.08, 2, 0.5);
    const infoH = infoW.lines.length * infoW.px * 1.25;
    // GAME's caps start at his eyes, the info line at his forehead (as in the reference).
    wordTop = Math.max(minTop + infoH + 16, faceCy - place.fs * 0.45);
    infoTop = wordTop - infoH - 6 - wordPx * 0.04;
    blockBottom = wordTop + wordPx * 0.92 * lines.length;
  } else {
    // His face sits too far right or too high: the word (one line) drops under his chin, in front of him.
    const one = lines.join(" ");
    wordPx = Math.min(240 * k * ts, (W - 120) / Math.max(1, em(one, ANTON, 40)));
    infoW = wrapCaps(info, W - 160, 24 * ts * k * 0.85, 13, 0.08, 2, 0.5);
    const infoH = infoW.lines.length * infoW.px * 1.25;
    infoTop = Math.round(faceCy + place.fs * 0.85 + 40);
    wordTop = infoTop + infoH + 8;
    blockBottom = wordTop + wordPx * 0.92;
    lines.splice(0, lines.length, one);
  }
  const shadow = "0 3px 26px rgba(0,0,0,.3)";
  const wordStyle = { fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 0.92, letterSpacing: "0.005em", whiteSpace: "nowrap" as const, color: "#fff", textShadow: shadow };

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: deep, color: "#fff" }}>
      {/* the ground: his photo without him, blurred, B&W and washed in the club colour */}
      <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
        <div style={{ position: "absolute", inset: -40, filter: "blur(9px) grayscale(1) contrast(1.1) brightness(1.02)" }}>
          {/* solid under the ground: no transparent hole for the wash to turn into a bright rim around him */}
          <div style={{ position: "absolute", inset: 0, background: "#141414" }} />
          <div style={{ position: "absolute", left: 40, top: 40, width: W, height: H }}>
            <Filled place={place} H={H} />
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: hue, mixBlendMode: "color" }} />
        <div style={{ position: "absolute", inset: 0, background: hue, mixBlendMode: "multiply", opacity: 0.45 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(130% 80% at 30% 45%, rgba(0,0,0,0) 40%, ${deep}a6 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: clubTop - 220, bottom: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${deep}99)` }} />

      {/* the blurred ground keeps a fringe of his own bright pixels round the hole (his hair, skin), which the wash
          turns into a glowing rim: a soft dark copy of his silhouette right behind him swallows it */}
      {place.frame.fig && <img src={`${place.frame.fig}&clean=1`} alt="" style={{ position: "absolute", left: 0, top: 0, width: W, height: H, maxWidth: "none", filter: "brightness(0) drop-shadow(0 0 8px #000) drop-shadow(0 0 14px #000) blur(6px)", opacity: 0.92 }} />}
      <NatFigure data={data} place={place} W={W} H={H} clean />

      {/* the club's exact name, big and faded, in front of him (never hidden by his legs) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: clubTop, textAlign: "center" }}>
        {clubW.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: clubW.px, lineHeight: `${clubLH}px`, letterSpacing: "0.01em", whiteSpace: "nowrap", color: "rgba(255,255,255,.26)" }}>
            {l}
          </div>
        ))}
      </div>

      {/* the type, in front of him: beside his face, or under his chin over a soft backing */}
      {!side && <div style={{ position: "absolute", left: -80, right: -80, top: infoTop - 50, height: blockBottom - infoTop + 110, background: `radial-gradient(closest-side, ${deep}c0, ${deep}70 60%, rgba(0,0,0,0))` }} />}
      {info && (
        <div style={{ position: "absolute", left: side ? colX0 + wordPx * 0.03 : 0, right: side ? undefined : 0, top: infoTop, textAlign: side ? "left" : "center", textShadow: shadow }}>
          {infoW.lines.map((l, i) => (
            <div key={i} style={capsStyle(infoW.px, 700, 0.08, "#fff", { lineHeight: 1.25 })}>
              {l}
            </div>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", left: side ? colX0 : 0, right: side ? undefined : 0, top: wordTop, textAlign: side ? "left" : "center" }}>
        {lines.map((l, i) => (
          <div key={i} style={wordStyle}>
            {l}
          </div>
        ))}
      </div>

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}

/* ===== goalnatrefoutline — solid GOAL over his hair, outlined GOALs behind his body ===== */

export function Goalnatrefoutline({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const k = story ? 1.3 : 1;
  const { club } = groundOf(data);
  // The outline colour must read on near-black: dark club colours are lifted.
  const l = luminance(club);
  const line = l < 0.12 ? shade(club, 0.45) : l > 0.75 ? shade(club, -0.2) : club;

  const place = natPlace(data, W, H, { fx: W / 2, fy: story ? 820 : 560, fs: story ? 210 : 160 });
  const ny = place.nudge?.y ?? 0;
  const faceCy = place.fy + ny;
  const hair = faceCy - place.fs * 1.05;
  const chin = faceCy + place.fs * 0.62;

  const word = (data.content.kicker || "GOAL").trim().toUpperCase();
  const top = story ? 230 : 70;
  const fitPx = Math.min(330 * k * ts, (W - 90) / Math.max(1, wideEm(word) * 0.97));
  // Archivo Black caps stand ~0.74 of the size; the div's box is 0.86 tall at lineHeight .86.
  const capH = 0.74;
  const room = hair - 26 - top;
  const above = room / capH >= fitPx * 0.55;
  const solidPx = above ? Math.min(fitPx, room / capH) : Math.min(fitPx, 240 * k * ts);

  // ---- the name at the foot ----
  const first = (data.content.firstName || "").trim().toUpperCase();
  const last = (data.content.lastName || "").trim().toUpperCase();
  const name = [first, last].filter(Boolean).join(" ");
  const nameW = wrapCaps(name, W - 160, 30 * ts * k * 0.85, 15, 0.22, 2, 0.5);
  const nameTop = logoTop - 44 - nameW.lines.length * nameW.px * 1.3;

  // ---- solid word: above his hair, or under his chin in front of him ----
  const solidTop = above ? hair - 26 - solidPx * capH - solidPx * 0.06 : chin + 30;
  // ---- outline rows: from under his chin (or under the dropped solid word) to the name ----
  const rowPx = fitPx;
  const rowH = rowPx * 0.86;
  const start = above ? Math.max(chin + 14, solidTop + solidPx * 0.86) : solidTop + solidPx * 0.86 + 6;
  const rows: number[] = [];
  for (let y = start; y + rowH * 0.8 < nameTop - 20; y += rowH) {
    // never a row over his face (rows start under the chin; this guards nudges and odd crops)
    if (y < chin && y + rowH > hair) continue;
    rows.push(y);
  }
  const stroke = Math.max(2, rowPx * 0.011);

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#0b0b0c", color: "#fff" }}>
      {/* the ground: his photo without him, dark and drained of colour */}
      <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) brightness(.42) contrast(1.15)" }}>
        <Filled place={place} H={H} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 75% at 50% 42%, rgba(0,0,0,0) 35%, rgba(0,0,0,.7) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop - 260, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.7))" }} />

      {/* the outlined repeats in the club colour, behind his body */}
      {rows.map((y, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: WIDE, fontSize: rowPx, lineHeight: 0.86, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: "transparent", WebkitTextStroke: `${stroke}px ${line}`, opacity: Math.max(0.45, 1 - i * 0.14) }}>
          {word}
        </div>
      ))}
      {above && <div style={{ position: "absolute", left: 0, right: 0, top: solidTop, textAlign: "center", fontFamily: WIDE, fontSize: solidPx, lineHeight: 0.86, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: "#fff", textShadow: "0 3px 28px rgba(0,0,0,.35)" }}>{word}</div>}

      <NatFigure data={data} place={place} W={W} H={H} clean />

      {!above && (
        <>
          <div style={{ position: "absolute", left: -80, right: -80, top: solidTop - 50, height: solidPx * 0.86 + 100, background: "radial-gradient(closest-side, rgba(0,0,0,.7), rgba(0,0,0,.4) 60%, rgba(0,0,0,0))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: solidTop, textAlign: "center", fontFamily: WIDE, fontSize: solidPx, lineHeight: 0.86, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: "#fff", textShadow: "0 3px 28px rgba(0,0,0,.4)" }}>{word}</div>
        </>
      )}

      {name && (
        // a soft dark backing: the name sits over his kit (sponsors, numbers) and must still read
        <div style={{ position: "absolute", left: 120, right: 120, top: nameTop - 40, height: nameW.lines.length * nameW.px * 1.3 + 80, background: "radial-gradient(closest-side, rgba(0,0,0,.72), rgba(0,0,0,.4) 60%, rgba(0,0,0,0))" }} />
      )}
      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", textShadow: "0 2px 16px rgba(0,0,0,.6)" }}>
          {nameW.lines.map((t, i) => (
            <div key={i} style={capsStyle(nameW.px, 700, 0.22, "#fff", { lineHeight: 1.3, paddingLeft: "0.22em" })}>
              {t}
            </div>
          ))}
        </div>
      )}

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}
