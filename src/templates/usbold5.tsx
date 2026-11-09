/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { ANTON, em } from "./mist";
import { Filled } from "./natref4";
import { NatFigure, natPlace } from "./natkit";
import { DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { Logo, capsStyle, facts, frame, groundOf, wrapCaps } from "./usbold1";
import { CREST_HALO } from "./usgame1";

/*
 * Round 80 · two bold looks, each after ONE real reference captured this round (Pinterest):
 *
 *   usresultframe      bold US RESULT after Texas football "37 || 10 FINAL" ("final score graphic design soccer
 *                      bold", row 5 col 3): a light paper card; his own photo framed in a window filling the top
 *                      ~60%, the ground graded towards the club colour (him cut out of it, then laid back sharp and
 *                      in full colour); a solid club-colour panel across the lower part, split down the middle by a
 *                      double white rule; the home / away goals huge white condensed figures either side, each
 *                      crest on a small dark tile at the outer edge; a black plaque with "FINAL" in heavy white
 *                      italic under the score; two short club-colour bars on the paper margins up top.
 *   agencynextmatch    agency-portrait MATCHDAY after Sporting CP "Next MATCH" (v Santa Clara; "player matchday
 *                      poster agency design", row 1 col 1): his photo with him filled out, blurred to a soft
 *                      studio wash in the club colour (lighter top left, deeper bottom right); him big, bust, on
 *                      the left, sharp and in colour; to the right of his face a thin script "Next" over a giant
 *                      white condensed "MATCH", the two crests split by a hairline, "HOME / VS AWAY" heavy caps and
 *                      the venue / time small, all right-aligned.
 *
 * Type never behind his hair or on his face: when his head is too high or too far right for the column beside
 * it, the block drops under his chin, in front of him, on a soft backing (as usbold3 / usbold4).
 */

const W = CANVAS_W;
const WIDE = "var(--font-archivo-black), 'Arial Black', sans-serif";
const VIBES = "var(--font-vibes), cursive";

/** A crest, or — with no crest — the club's exact name, wrapped (never cut). */
function CrestOr({ src, name, size, color, halo }: { src: string | null; name: string; size: number; color: string; halo?: boolean }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain", filter: halo ? CREST_HALO : undefined }} />;
  const w = wrapCaps(name, size * 1.5, size * 0.2, 9, 0.04, 4, 0.55);
  return (
    <div style={{ width: size * 1.5, textAlign: "center" }}>
      {w.lines.map((l, i) => (
        <div key={i} style={capsStyle(w.px, 700, 0.04, color, { lineHeight: 1.1 })}>
          {l}
        </div>
      ))}
    </div>
  );
}

/* ===== usresultframe — the photo in a window, the score on a club-colour panel ===== */

export function Usresultframe({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const { club, deep } = groundOf(data);
  const fx = facts(data).fx;
  const goals = [data.content.homeGoals ?? "–", data.content.awayGoals ?? "–"].map((g) => String(g).trim() || "–");

  const m = story ? 40 : 34;
  const panelTop = story ? 1170 : 850;
  const place = natPlace(data, W, H, { fx: W / 2, fy: story ? 560 : 400, fs: story ? 200 : 150 });
  const chin = place.fy + (place.nudge?.y ?? 0) + place.fs * 0.7;
  // the panel never covers his face: if his face sits low, the window grows (the panel slides down a little)
  const top = Math.max(panelTop, Math.min(chin + 40, story ? 1260 : 920));

  // ---- the score row ----
  const tile = story ? 118 : 96;
  const half = W / 2 - m - tile - (story ? 70 : 56);
  const digitPx = Math.min((story ? 300 : 230) * ts, ...goals.map((g) => half / Math.max(0.5, em(g, ANTON, 50))));
  const numTop = top + (story ? 54 : 40);
  const numCy = numTop + digitPx * 0.6;
  const plaqueTop = numTop + digitPx * 1.18 + (story ? 26 : 16);
  const plaqueH = story ? 92 : 72;
  const plaquePx = plaqueH * 0.62;
  const bar = story ? 9 : 7;
  const gap = story ? 12 : 10;

  const crest = (side: 0 | 1) => (
    <div style={{ position: "absolute", top: numCy - tile / 2, left: side === 0 ? m + 30 : undefined, right: side === 1 ? m + 30 : undefined, width: tile, height: tile, background: "#141414", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CrestOr src={side === 0 ? fx.homeCrest : fx.awayCrest} name={side === 0 ? fx.homeName : fx.awayName} size={tile * 0.72} color="#fff" />
    </div>
  );
  const num = (side: 0 | 1) => (
    <div style={{ position: "absolute", top: numTop, ...(side === 0 ? { right: W / 2 + gap / 2 + bar + (story ? 34 : 26) } : { left: W / 2 + gap / 2 + bar + (story ? 34 : 26) }), fontFamily: DISPLAY, fontSize: digitPx, lineHeight: 1.2, color: "#fff", whiteSpace: "nowrap", textShadow: "0 4px 22px rgba(0,0,0,.18)" }}>
      {goals[side]}
    </div>
  );

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#efefec" }}>
      {/* the two short bars on the paper margins (under the window) */}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: (story ? 300 : 210) + i * (story ? 74 : 56), height: story ? 26 : 20, background: club }} />
      ))}

      {/* the window: his photo, the ground graded towards the club colour, him sharp and in colour */}
      <div style={{ position: "absolute", left: m, top: m, width: W - 2 * m, height: H - 2 * m, overflow: "hidden", background: deep }}>
        <div style={{ position: "absolute", left: -m, top: -m, width: W, height: H }}>
          <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
            <div style={{ position: "absolute", inset: 0, filter: "saturate(.5) contrast(1.06) brightness(.97)" }}>
              <Filled place={place} H={H} />
            </div>
            <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "color", opacity: 0.6 }} />
            <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "soft-light", opacity: 0.45 }} />
          </div>
          <NatFigure data={data} place={place} W={W} H={H} clean />
        </div>
      </div>

      {/* the panel */}
      <div style={{ position: "absolute", left: m, right: m, top, bottom: m, background: `linear-gradient(to bottom, ${shade(deep, 0.1)}, ${deep} 55%, ${shade(deep, -0.12)})`, boxShadow: "0 -10px 40px rgba(0,0,0,.18)" }} />
      {[-1, 1].map((s) => (
        <div key={s} style={{ position: "absolute", top, height: Math.max(plaqueTop + plaqueH + 30, logoTop - 28) - top, left: W / 2 + (s < 0 ? -gap / 2 - bar : gap / 2), width: bar, background: "#fff" }} />
      ))}
      {num(0)}
      {num(1)}
      {crest(0)}
      {crest(1)}

      {/* FINAL on a black plaque */}
      <div style={{ position: "absolute", left: 0, right: 0, top: plaqueTop, display: "flex", justifyContent: "center" }}>
        <div style={{ height: plaqueH, padding: `0 ${plaqueH * 0.75}px`, background: "#161616", display: "flex", alignItems: "center", fontFamily: WIDE, fontStyle: "italic", fontSize: plaquePx, letterSpacing: "0.02em", color: "#fff", whiteSpace: "nowrap" }}>FINAL</div>
      </div>

      <Logo data={data} top={Math.max(logoTop, plaqueTop + plaqueH + 24)} onLight={false} />
    </div>
  );
}

/* ===== agencynextmatch — script "Next" over a giant MATCH, beside his face ===== */

export function Agencynextmatch({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const k = story ? 1.3 : 1;
  const f = facts(data);
  const { club } = groundOf(data);
  const l = luminance(club);
  const hue = l < 0.06 ? shade(club, 0.35) : l > 0.7 ? shade(club, -0.35) : club;
  const deep = shade(hue, -0.5);

  // ---- him: big, bust, on the left ----
  const place = natPlace(data, W, H, { fx: story ? 270 : 250, fy: story ? 720 : 470, fs: story ? 290 : 220 });
  const faceCx = place.fx + (place.nudge?.x ?? 0);
  const faceCy = place.fy + (place.nudge?.y ?? 0);

  // ---- the words: script + giant caps ----
  const kick = (data.content.kicker || "").toUpperCase().replace(/\s+/g, " ").trim();
  const isDefault = !kick || /^(MATCH ?DAY|NEXT MATCH|GAME ?DAY)$/.test(kick);
  const parts = isDefault ? ["Next", "MATCH"] : kick.split(" ").length > 1 ? [kick.split(" ").slice(0, -1).join(" ").toLowerCase().replace(/^./, (c) => c.toUpperCase()), kick.split(" ").slice(-1)[0]] : ["", kick];
  const [script, caps] = parts;

  // clear of his face AND his hair (hair and a profile run well past the face box)
  const colX0 = Math.round(faceCx + Math.max(place.faceW * 0.9, place.fs * 0.95) + 60);
  const colX1 = W - (story ? 60 : 54);
  const colW = colX1 - colX0;
  const minTop = story ? 250 : 100;
  // the column beside his face is too narrow, or his head sits high: the block goes under his chin, in front of him
  const side = colW >= 360 && faceCy - place.fs * 0.5 > minTop + (story ? 200 : 140);
  const chinY = Math.round(faceCy + place.fs * 0.8 + 30);
  const blockW = side ? colW : W - 140;
  const small = [f.venue, [f.time, f.date].filter(Boolean).join("  |  "), f.comp].filter(Boolean);

  /** The block at a scale: every size and its height. */
  const measure = (s: number) => {
    const capsPx = Math.min((side ? 260 : 200) * k * ts * s, blockW / Math.max(1, em(caps, ANTON, 50)));
    const scriptPx = capsPx * 0.62;
    const crestPx = Math.round((story ? 120 : 92) * ts * Math.max(0.75, s));
    const names = wrapCaps(`${f.ours}`, blockW, 40 * ts * k * 0.85 * Math.max(0.8, s), 16, 0.01, 2, 0.56);
    const vs = wrapCaps(`VS ${f.opp}`, blockW, 40 * ts * k * 0.85 * Math.max(0.8, s), 16, 0.01, 2, 0.56);
    const nameLH = Math.max(names.px, vs.px) * 1.08;
    const smallW = small.map((t) => wrapCaps(t, blockW, 19 * ts * k * 0.85, 11, 0.12, 2, 0.56));
    const hScript = script ? scriptPx * 0.8 : 0;
    const hCrest = crestPx + (story ? 56 : 40) * s;
    const hNames = (names.lines.length + vs.lines.length) * nameLH + (story ? 30 : 22);
    const hSmall = smallW.reduce((a, w) => a + w.lines.length * w.px * 1.4, 0);
    return { capsPx, scriptPx, crestPx, names, vs, nameLH, namePx: Math.min(names.px, vs.px), smallW, hScript, hCrest, blockH: hScript + capsPx * 0.9 + hCrest + hNames + hSmall };
  };
  // beside him: MATCH starts at his eyes (the script at his forehead); under him: below his chin. Shrinks to fit
  // above the logo.
  const want = (b: ReturnType<typeof measure>) => (side ? Math.max(minTop, faceCy - place.fs * 0.2 - b.hScript) : chinY);
  let b = measure(1);
  for (let s = 0.95; s >= 0.55 && want(b) + b.blockH > logoTop - 40; s -= 0.05) b = measure(s);
  const { capsPx, scriptPx, crestPx, names, vs, nameLH, namePx, smallW, hScript, hCrest, blockH } = b;
  let top = want(b);
  if (top + blockH > logoTop - 40) top = Math.max(side ? minTop : chinY - 30, logoTop - 40 - blockH);
  const align = side ? "right" : "center";
  const x = side ? { left: colX0, width: colW } : { left: 70, width: W - 140 };
  const shadow = "0 3px 24px rgba(0,0,0,.28)";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: deep, color: "#fff" }}>
      {/* the ground: his photo without him, blurred into a soft studio wash of the club colour */}
      <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
        <div style={{ position: "absolute", inset: -60, filter: "blur(30px) grayscale(1) contrast(.85) brightness(1.05)" }}>
          <div style={{ position: "absolute", inset: 0, background: "#3a3a3a" }} />
          <div style={{ position: "absolute", left: 60, top: 60, width: W, height: H }}>
            <Filled place={place} H={H} />
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: hue, mixBlendMode: "color" }} />
        <div style={{ position: "absolute", inset: 0, background: hue, mixBlendMode: "multiply", opacity: 0.55 }} />
      </div>
      {/* studio light: lighter top left, deeper bottom right */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,0) 45%, ${deep}99)` }} />

      {place.frame.fig && <img src={`${place.frame.fig}&clean=1`} alt="" style={{ position: "absolute", left: 0, top: 0, width: W, height: H, maxWidth: "none", filter: "brightness(0) drop-shadow(0 0 12px #000) drop-shadow(0 0 26px #000) blur(12px)", opacity: 0.8 }} />}
      <NatFigure data={data} place={place} W={W} H={H} clean />

      {!side && <div style={{ position: "absolute", left: -80, right: -80, top: top - 60, height: blockH + 120, background: `radial-gradient(closest-side, ${deep}d0, ${deep}80 60%, rgba(0,0,0,0))` }} />}

      <div style={{ position: "absolute", top, ...x, textAlign: align, textShadow: shadow }}>
        {script && <div style={{ fontFamily: VIBES, fontSize: scriptPx, lineHeight: 0.8, height: hScript, color: "#fff", textAlign: side ? "left" : "center", paddingLeft: side ? capsPx * 0.04 : 0, whiteSpace: "nowrap", position: "relative", top: scriptPx * 0.12 }}>{script}</div>}
        <div style={{ fontFamily: DISPLAY, fontSize: capsPx, lineHeight: 0.9, letterSpacing: "0.005em", whiteSpace: "nowrap", textAlign: side ? "left" : "center" }}>{caps}</div>
        <div style={{ height: hCrest, display: "flex", alignItems: "center", justifyContent: "center", gap: story ? 34 : 26 }}>
          <CrestOr src={f.ourCrest} name={f.ours} size={crestPx} color="#fff" halo />
          <div style={{ width: 2, height: crestPx * 1.05, background: "rgba(255,255,255,.75)" }} />
          <CrestOr src={f.oppCrest} name={f.opp} size={crestPx} color="#fff" halo />
        </div>
        <div style={{ paddingTop: story ? 10 : 8, paddingBottom: story ? 20 : 14 }}>
          {[...names.lines, ...vs.lines].map((t, i) => (
            <div key={i} style={capsStyle(namePx, 800, 0.01, "#fff", { lineHeight: `${nameLH}px` })}>
              {t.startsWith("VS ") && i >= names.lines.length ? (
                <>
                  <span style={{ fontWeight: 500 }}>VS </span>
                  {t.slice(3)}
                </>
              ) : (
                t
              )}
            </div>
          ))}
        </div>
        {smallW.map((w, i) =>
          w.lines.map((t, j) => (
            <div key={`${i}-${j}`} style={capsStyle(w.px, 600, 0.12, "rgba(255,255,255,.88)", { lineHeight: 1.4 })}>
              {t}
            </div>
          )),
        )}
      </div>

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}
