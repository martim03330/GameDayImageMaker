import { luminance, shade } from "@/lib/color";
import { Filled } from "./natref4";
import { NatFigure, natPlace } from "./natkit";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { Logo, capsStyle, facts, frame, groundOf, wrapCaps } from "./usbold1";

/*
 * Round 77 · bold US gameday look after ONE real college graphic (Nebraska soccer v Creighton — Pinterest
 * "college soccer gameday graphic", row 1 col 5):
 *
 *   usduotone   photo treatment first: his own match photo full-bleed, the ground (everything but him) turned
 *               into a club-colour monochrome — B&W, then the club hue laid over it in "color" blend, so the
 *               grass, stands and boards keep their light and texture but read in one colour; he stays sharp
 *               and fully in colour on top (the ground's copy of him is cut out and filled, Filled/without).
 *               Type: his club's exact name tiny and widely tracked at the top, GAME DAY gigantic in wide black
 *               caps centred under it, the kick-off big under the word with a small AM/PM-style suffix, "VS" +
 *               the opponent's exact name small under it — the whole block above his head; at the foot only the
 *               date and the ground, small, over a soft colour fade.
 */

const W = CANVAS_W;
const WIDE = "var(--font-archivo-black), 'Arial Black', sans-serif";
/** Archivo Black caps: rough advance relative to the size. */
const wideEm = (t: string, tracking = 0) => [...t].reduce((a, c) => a + (/[MW]/.test(c) ? 1.02 : /[I1]/.test(c) ? 0.42 : c === " " ? 0.3 : /[:.·]/.test(c) ? 0.34 : 0.78), 0) + [...t].length * tracking;

/** The duotone hue: the club colour, lifted when it is too dark to tint anything. */
function hueOf(data: RenderData) {
  const { club } = groundOf(data);
  const l = luminance(club);
  return l < 0.06 ? shade(club, 0.35) : l > 0.7 ? shade(club, -0.35) : club;
}

export function Usduotone({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const k = story ? 1.3 : 1;
  const f = facts(data);
  const hue = hueOf(data);
  const deep = shade(hue, -0.55);

  // ---- him: big, low, the type block over his head ----
  const place = natPlace(data, W, H, { fx: data.params.side === "left" ? 460 : 560, fy: story ? 930 : 650, fs: story ? 190 : 140 });
  const headTop = place.fy - place.fs * 1.05 + (place.nudge?.y ?? 0);

  // ---- the block: club, the word, the kick-off, the opponent ----
  let top = story ? 210 : 70;
  const clubW = wrapCaps(f.ours, W - 200, 22 * ts, 14, 0.42, 2, 0.6);
  const word = (data.content.kicker || "GAME DAY").toUpperCase().replace(/’/g, "'").replace(/\s+/g, " ").trim();
  // Archivo Black runs ~0.85 of the generic wide estimate: the word fills the width like the reference's.
  let wordPx = Math.min(200 * k * ts, (W - 100) / Math.max(1, wideEm(word, -0.02) * 0.95));
  const m = /^(\d{1,2}:\d{2})\s*([AP]M)?$/i.exec(f.time.trim());
  const tMain = m ? m[1] : f.time;
  const tSuf = m?.[2]?.toUpperCase() ?? "";
  let timePx = Math.min(130 * ts, (W - 300) / Math.max(1, wideEm(tMain) * 0.95));
  const oppW = wrapCaps(`VS ${f.opp}`, W - 200, 26 * ts, 15, 0.18, 2, 0.6);
  const blockH = (wpx: number, tpx: number) => clubW.lines.length * clubW.px * 1.3 + 14 + wpx * 1.0 + (f.time ? 10 + tpx * 1.02 : 0) + 12 + oppW.lines.length * oppW.px * 1.25;
  // Off his head: shrink the word and the time together until the block ends above his hair.
  const room = headTop - 24 - top;
  const need = blockH(wordPx, timePx);
  // His head sits high in the photo (no room for the block above it even at 60%): the whole block drops to just
  // under his chin and is drawn IN FRONT of him — over his chest, never his face, and no line hidden by his hair.
  const below = need * 0.6 > room;
  if (below) top = Math.round(place.fy + place.fs * 0.85 + 40);
  else if (need > room && room > 120) {
    const s = Math.max(0.6, (room - (need - wordPx - timePx * 1.02)) / (wordPx + timePx * 1.02));
    wordPx *= s;
    timePx *= s;
  }
  const wordTop = top + clubW.lines.length * clubW.px * 1.3 + 14;
  const timeTop = wordTop + wordPx * 1.0 + 10;
  const oppTop = (f.time ? timeTop + timePx * 1.02 : wordTop + wordPx) + 12;

  // ---- the foot ----
  const foot = [f.date, f.venue].filter(Boolean).join("  ·  ");
  const footW = wrapCaps(foot, W - 160, 22 * ts, 14, 0.2, 2, 0.6);
  const footTop = logoTop - 46 - footW.lines.length * footW.px * 1.3;
  const shadow = "0 2px 24px rgba(0,0,0,.28)";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: deep, color: "#fff" }}>
      {/* the ground in one colour: B&W with a contrast lift, the club hue laid over in "color", a soft deep vignette */}
      <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
        <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) contrast(1.12) brightness(1.04)" }}>
          <Filled place={place} H={H} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: hue, mixBlendMode: "color" }} />
        <div style={{ position: "absolute", inset: 0, background: hue, mixBlendMode: "multiply", opacity: 0.35 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 70% at 50% 45%, rgba(0,0,0,0) 45%, ${deep}99 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: oppTop + 220, background: `linear-gradient(to bottom, ${deep}8c, rgba(0,0,0,0))` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 260, bottom: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${deep}b3)` }} />

      {!below && (
        <>
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: WIDE, fontSize: wordPx, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: "#fff", textShadow: shadow }}>{word}</div>
      {f.time && (
        <div style={{ position: "absolute", left: 0, right: 0, top: timeTop, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: timePx * 0.06, textShadow: shadow }}>
          <span style={{ fontFamily: WIDE, fontSize: timePx, lineHeight: 1.02, whiteSpace: "nowrap" }}>{tMain}</span>
          {(tSuf || f.second) && <span style={{ ...capsStyle(Math.max(16, timePx * 0.24), 800, 0.04, "#fff"), marginTop: timePx * 0.16 }}>{tSuf || f.second}</span>}
        </div>
      )}
        </>
      )}
      {/* him, sharp and in colour, IN FRONT of the block: when his head sits high in the photo the word passes
          behind his hair instead of over his face */}
      <NatFigure data={data} place={place} W={W} H={H} clean />
      {below && (
        <>
          {/* the block over his body: a soft dark backing behind the type only, so white type reads on a white kit */}
          <div style={{ position: "absolute", left: -80, right: -80, top: top - 40, height: oppTop + oppW.lines.length * oppW.px * 1.25 - top + 90, background: `radial-gradient(closest-side, ${deep}b8, ${deep}66 60%, rgba(0,0,0,0))` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: WIDE, fontSize: wordPx, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: "#fff", textShadow: shadow }}>{word}</div>
      {f.time && (
        <div style={{ position: "absolute", left: 0, right: 0, top: timeTop, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: timePx * 0.06, textShadow: shadow }}>
          <span style={{ fontFamily: WIDE, fontSize: timePx, lineHeight: 1.02, whiteSpace: "nowrap" }}>{tMain}</span>
          {(tSuf || f.second) && <span style={{ ...capsStyle(Math.max(16, timePx * 0.24), 800, 0.04, "#fff"), marginTop: timePx * 0.16 }}>{tSuf || f.second}</span>}
        </div>
      )}
        </>
      )}

      {/* his club's exact name: in front of him, so his hair never cuts it */}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", textShadow: shadow }}>
        {clubW.lines.map((l, i) => (
          <div key={i} style={capsStyle(clubW.px, 700, 0.42, "rgba(255,255,255,.92)", { lineHeight: 1.3, paddingLeft: "0.42em" })}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: oppTop, textAlign: "center", textShadow: shadow }}>
        {oppW.lines.map((l, i) => (
          <div key={i} style={capsStyle(oppW.px, 700, 0.18, "#fff", { lineHeight: 1.25 })}>
            {l}
          </div>
        ))}
        {tSuf && f.second && <div style={capsStyle(Math.max(13, oppW.px * 0.72), 600, 0.14, "rgba(255,255,255,.8)", { marginTop: 4 })}>{f.second}</div>}
      </div>


      {/* the foot */}
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop, textAlign: "center" }}>
        {footW.lines.map((l, i) => (
          <div key={i} style={capsStyle(footW.px, 700, 0.2, "rgba(255,255,255,.9)", { lineHeight: 1.3 })}>
            {l}
          </div>
        ))}
      </div>

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}
