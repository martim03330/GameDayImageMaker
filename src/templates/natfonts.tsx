import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Five natural looks that are one quiet layout set in five typefaces (the voice changes, the layout does not):
 * his real photo full-bleed; on the side away from him at the foot, the word large, a short rule in his club's
 * colour, two quiet lines in Inter; the NEYOD logo alone at the top.
 *
 *   bebas      Bebas Neue — tall condensed caps (a stadium board)
 *   bodoni     Bodoni Moda — high-contrast fashion serif, in title case
 *   unbounded  Unbounded — wide geometric
 *   grotesk    Space Grotesk — technical, tight
 *   slab       Alfa Slab One — heavy slab serif
 *   anton      Anton — poster condensed
 *   barlow     Barlow Condensed 800 — sporty condensed, slightly tracked
 *   archivo    Archivo Black — round heavy grotesque
 *   dela       Dela Gothic One — chunky, Japanese-poster feel
 *   italicserif DM Serif Display italic, in title case — soft editorial
 *   montserrat Montserrat 600 — clean geometric, tracked wide
 *   fraunces   Fraunces 600 — warm old-style serif, title case
 *   archivolight Archivo 300 — thin and airy caps
 *   rubikmono  Rubik Mono One — heavy monospaced caps
 *   frauncesit Fraunces italic 500 — warm italic, title case
 */
type Face = "bebas" | "bodoni" | "unbounded" | "grotesk" | "slab" | "anton" | "barlow" | "archivo" | "dela" | "italicserif" | "montserrat" | "fraunces" | "archivolight" | "rubikmono" | "frauncesit";

const FACES: Record<Face, { family: string; weight: number; em: number; track: string; caps: boolean; cap: number; italic?: boolean }> = {
  // em: average advance per letter (of the font size), for fitting; cap: cap height, for vertical placement.
  bebas: { family: "var(--font-bebas), Impact, sans-serif", weight: 400, em: 0.42, track: "0.02em", caps: true, cap: 0.7 },
  bodoni: { family: "var(--font-bodoni), Didot, serif", weight: 600, em: 0.56, track: "0", caps: false, cap: 0.68 },
  unbounded: { family: "var(--font-unbounded), sans-serif", weight: 700, em: 0.82, track: "-0.01em", caps: true, cap: 0.72 },
  grotesk: { family: "var(--font-grotesk), sans-serif", weight: 700, em: 0.62, track: "-0.03em", caps: true, cap: 0.7 },
  slab: { family: "var(--font-slab), Rockwell, serif", weight: 400, em: 0.74, track: "0", caps: true, cap: 0.72 },
  anton: { family: "var(--font-anton), Impact, sans-serif", weight: 400, em: 0.5, track: "0.01em", caps: true, cap: 0.74 },
  barlow: { family: "var(--font-barlow), sans-serif", weight: 800, em: 0.5, track: "0.04em", caps: true, cap: 0.7 },
  archivo: { family: "var(--font-archivo-black), sans-serif", weight: 400, em: 0.74, track: "-0.02em", caps: true, cap: 0.72 },
  dela: { family: "var(--font-dela), sans-serif", weight: 400, em: 0.94, track: "0", caps: true, cap: 0.72 },
  italicserif: { family: "var(--font-dmserif), Georgia, serif", weight: 400, em: 0.48, track: "0", caps: false, cap: 0.68, italic: true },
  montserrat: { family: "var(--font-montserrat), sans-serif", weight: 600, em: 1.05, track: "0.18em", caps: true, cap: 0.7 },
  fraunces: { family: "var(--font-fraunces), Georgia, serif", weight: 600, em: 0.56, track: "-0.01em", caps: false, cap: 0.7 },
  archivolight: { family: "var(--font-archivo), sans-serif", weight: 300, em: 0.78, track: "0.12em", caps: true, cap: 0.72 },
  rubikmono: { family: "var(--font-rubikmono), monospace", weight: 400, em: 0.86, track: "0", caps: true, cap: 0.72 },
  frauncesit: { family: "var(--font-fraunces), Georgia, serif", weight: 500, em: 0.5, track: "0", caps: false, cap: 0.7, italic: true },
};

function NatFontFrame({ data, face, word, lines }: { data: RenderData; face: Face; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const f = FACES[face];
  const text = f.caps ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  const M = 56;
  const colW = Math.min(500 * k, CANVAS_W * 0.52);
  const ls = lines.filter(Boolean);
  const wPx = Math.min((face === "bebas" || face === "anton" || face === "barlow" ? 92 : face === "bodoni" || face === "italicserif" || face === "fraunces" || face === "frauncesit" ? 80 : face === "montserrat" || face === "archivolight" ? 50 : 66) * k * ts, colW / Math.max(1, text.length * f.em));
  const lPx = 18 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.4;
  const ruleTop = linesTop - 14 * k - 3 * k;
  const wTop = ruleTop - 14 * k - wPx * f.cap;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      {/* The line box is 1em; the cap height sits ~(1 - cap)/2 below its top in these faces. */}
      <div style={{ position: "absolute", [edge]: M, width: colW, top: wTop - wPx * ((1 - f.cap) * 0.6), textAlign: edge, fontFamily: f.family, fontWeight: f.weight, fontStyle: f.italic ? "italic" : "normal", fontSize: wPx, letterSpacing: f.track, lineHeight: 1, whiteSpace: "nowrap" }}>{text}</div>
      <div style={{ position: "absolute", [edge]: M, top: ruleTop, width: 44 * k, height: 3 * k, background: colour }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: linesTop, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const matchday = (data: RenderData, face: Face) => {
  const fx = natFixture(data);
  return <NatFontFrame data={data} face={face} word={data.content.kicker || "Matchday"} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
};
// Goals: his celebration, the word, his name and his club's exact name. No score.
const goal = (data: RenderData, face: Face) => {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatFontFrame data={data} face={face} word={data.content.kicker || "Goal"} lines={[name, ourClub(data)]} />;
};

export const Natbebas = ({ data }: { data: RenderData }) => matchday(data, "bebas");
export const Goalnatbebas = ({ data }: { data: RenderData }) => goal(data, "bebas");
export const Natbodoni = ({ data }: { data: RenderData }) => matchday(data, "bodoni");
export const Goalnatbodoni = ({ data }: { data: RenderData }) => goal(data, "bodoni");
export const Natunbounded = ({ data }: { data: RenderData }) => matchday(data, "unbounded");
export const Goalnatunbounded = ({ data }: { data: RenderData }) => goal(data, "unbounded");
export const Natgrotesk = ({ data }: { data: RenderData }) => matchday(data, "grotesk");
export const Goalnatgrotesk = ({ data }: { data: RenderData }) => goal(data, "grotesk");
export const Natalfaslab = ({ data }: { data: RenderData }) => matchday(data, "slab");
export const Goalnatalfaslab = ({ data }: { data: RenderData }) => goal(data, "slab");
export const Natanton = ({ data }: { data: RenderData }) => matchday(data, "anton");
export const Goalnatanton = ({ data }: { data: RenderData }) => goal(data, "anton");
export const Natbarlow = ({ data }: { data: RenderData }) => matchday(data, "barlow");
export const Goalnatbarlow = ({ data }: { data: RenderData }) => goal(data, "barlow");
export const Natarchivo = ({ data }: { data: RenderData }) => matchday(data, "archivo");
export const Goalnatarchivo = ({ data }: { data: RenderData }) => goal(data, "archivo");
export const Natdela = ({ data }: { data: RenderData }) => matchday(data, "dela");
export const Goalnatdela = ({ data }: { data: RenderData }) => goal(data, "dela");
export const Natitalicserif = ({ data }: { data: RenderData }) => matchday(data, "italicserif");
export const Goalnatitalicserif = ({ data }: { data: RenderData }) => goal(data, "italicserif");
export const Natmontserrat = ({ data }: { data: RenderData }) => matchday(data, "montserrat");
export const Goalnatmontserrat = ({ data }: { data: RenderData }) => goal(data, "montserrat");
export const Natfraunces = ({ data }: { data: RenderData }) => matchday(data, "fraunces");
export const Goalnatfraunces = ({ data }: { data: RenderData }) => goal(data, "fraunces");
export const Natarchivolight = ({ data }: { data: RenderData }) => matchday(data, "archivolight");
export const Goalnatarchivolight = ({ data }: { data: RenderData }) => goal(data, "archivolight");
export const Natrubikmono = ({ data }: { data: RenderData }) => matchday(data, "rubikmono");
export const Goalnatrubikmono = ({ data }: { data: RenderData }) => goal(data, "rubikmono");
export const Natfrauncesit = ({ data }: { data: RenderData }) => matchday(data, "frauncesit");
export const Goalnatfrauncesit = ({ data }: { data: RenderData }) => goal(data, "frauncesit");
