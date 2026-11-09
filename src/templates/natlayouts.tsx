import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Five natural looks that differ in WHERE the type goes (his real photo full-bleed, face untouched, NEYOD logo
 * at the top in all of them):
 *
 *   freecol     the free side as one column: the word high under the logo, the two lines at the foot, a thin
 *               vertical rule in his club's colour joining them
 *   cutoff      the word very large at the foot, behind him (he stands on it), its lower part cut by the bottom
 *               edge; the lines above it
 *   cornerpair  the word big in the free top corner, the two lines in the free bottom corner
 *   mirror      the word with a faint upside-down reflection under it, as on wet grass; lines below
 * Every layout's word also comes in other voices — `big`: solid (default), outline (only
 * the letters' edge), colour (his club's colour), serif (DM Serif, title case), tall (Bebas Neue, taller),
 * bodoni (Bodoni Moda caps — the club-poster serif caps trend), grotesk (Space Grotesk, tight).
 *
 *   behind      the word large BEHIND him (between the photo and his sharp figure), at the height of the top of
 *               his head: only his head covers it, so it still reads
 */
type Layout = "freecol" | "cutoff" | "cornerpair" | "mirror" | "behind";
type Big = "solid" | "outline" | "colour" | "serif" | "tall" | "bodoni" | "grotesk";

function NatLayoutFrame({ data, layout, word, lines, big = "solid" }: { data: RenderData; layout: Layout; word: string; lines: string[]; big?: Big }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const edge = left ? "left" : "right";
  const colW = Math.min(500 * k, CANVAS_W * 0.5);
  const ls = lines.filter(Boolean);
  const lPx = 18 * k * ts;
  const colour = params.accent && params.accent.toLowerCase() !== "#ffffff" ? params.accent : params.primary || "#e3001b";
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesH = ls.length * lPx * 1.4;
  const bold = { fontFamily: SANS, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" as const };
  const linesBlock = (top: number, extra?: object) => (
    <div style={{ position: "absolute", [edge]: M, width: colW, top, textAlign: edge, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.4, ...extra }}>
      {ls.map((l) => (
        <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {l}
        </div>
      ))}
    </div>
  );
  const topShade = (h: number) => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />;
  const footShade = (from: number) => <div style={{ position: "absolute", left: 0, right: 0, top: from, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />;

  // The big word's voice: its text (serif is title case), its font and how wide one letter is for fitting.
  const bigText = big === "serif" ? word.charAt(0) + word.slice(1).toLowerCase() : word;
  const bigEm = big === "tall" ? 0.44 * bigText.length : big === "serif" ? 0.5 * bigText.length : big === "bodoni" ? 0.74 * bigText.length : big === "grotesk" ? 0.64 * bigText.length : capsEm(bigText, -0.02);
  const bigStyle = (wPx: number): React.CSSProperties => ({
    ...bold,
    fontSize: wPx,
    ...(big === "serif" ? { fontFamily: "var(--font-dmserif), Georgia, serif", fontWeight: 400, letterSpacing: "-0.01em" } : {}),
    ...(big === "tall" ? { fontFamily: "var(--font-bebas), Impact, sans-serif", fontWeight: 400, letterSpacing: "0.01em" } : {}),
    // A soft shadow keeps a thin outline visible on a busy photo (stands, a fence).
    ...(big === "bodoni" ? { fontFamily: "var(--font-bodoni), Didot, serif", fontWeight: 600, letterSpacing: "-0.01em" } : {}),
    ...(big === "grotesk" ? { fontFamily: "var(--font-grotesk), sans-serif", fontWeight: 700, letterSpacing: "-0.04em" } : {}),
    ...(big === "outline" ? { color: "transparent", WebkitTextStroke: `${Math.max(2.5, wPx * 0.014)}px ${OFF_WHITE}`, filter: "drop-shadow(0 1px 5px rgba(0,0,0,.55))" } : {}),
    // His club's colour can be the photo's too (blue on blue): a soft dark halo keeps it apart.
    ...(big === "colour" ? { color: colour, textShadow: "0 1px 10px rgba(0,0,0,.45)" } : {}),
  });
  let back: React.ReactNode = null; // drawn between the photo and his figure
  let front: React.ReactNode = null;
  if (layout === "freecol" || layout === "cornerpair") {
    const wPx = Math.min((layout === "cornerpair" ? 70 : 54) * (big === "tall" ? 1.35 : big === "serif" ? 1.4 : 1) * k * ts, colW / Math.max(1, bigEm));
    const wTop = logoTop + (story ? 150 : 100);
    const linesTop = bottom - linesH;
    // The top word goes BEHIND him: in goal photos a raised fist is often right there, and him covering the
    // word reads better than the word covering his hand.
    back = (
      <>
        {topShade(wTop + wPx + 220 * k)}
        <div style={{ ...bigStyle(wPx), position: "absolute", [edge]: M, top: wTop - wPx * 0.12 }}>{bigText}</div>
      </>
    );
    front = (
      <>
        {footShade(linesTop - 220 * k)}
        {layout === "freecol" && <div style={{ position: "absolute", [edge]: M + 1, top: wTop + wPx * 0.86 + 24 * k, width: 2.5 * k, height: linesTop - 24 * k - (wTop + wPx * 0.86 + 24 * k), background: `linear-gradient(to bottom, ${colour}, ${colour} 30%, rgba(255,255,255,.25))` }} />}
        {linesBlock(linesTop)}
      </>
    );
  } else if (layout === "cutoff") {
    const wPx = Math.min((big === "tall" ? 280 : 190) * k * ts, (CANVAS_W - 2 * M + 40) / Math.max(1, bigEm));
    const canvasBottom = H;
    // Only the top ~62 % of the capitals shows above the bottom edge; a title-case serif is mostly x-height,
    // so it shows ~90 % or it stops reading.
    const wTop = canvasBottom - wPx * 0.86 * (big === "serif" ? 0.9 : 0.62);
    const linesTop = wTop - 26 * k - linesH;
    back = (
      <>
        {footShade(linesTop - 220 * k)}
        <div style={{ ...bigStyle(wPx), position: "absolute", left: 0, width: CANVAS_W, top: wTop - wPx * 0.12, textAlign: "center", opacity: 0.92 }}>{bigText}</div>
      </>
    );
    front = (
      <>
        {topShade(logoTop + (story ? 230 : 160))}
        {linesBlock(linesTop, { textShadow: "0 1px 8px rgba(0,0,0,.6)" })}
      </>
    );
  } else if (layout === "mirror") {
    const wPx = Math.min(64 * (big === "tall" ? 1.35 : big === "serif" ? 1.25 : 1) * k * ts, colW / Math.max(1, bigEm));
    const linesTop = bottom - linesH;
    const mTop = linesTop - 16 * k - wPx * 0.5;
    const wTop = mTop - 4 * k - wPx * 0.86;
    const fade = "linear-gradient(to bottom, rgba(0,0,0,.75), transparent 75%)";
    front = (
      <>
        {topShade(logoTop + (story ? 230 : 160))}
        {footShade(wTop - 220 * k)}
        <div style={{ ...bigStyle(wPx), position: "absolute", [edge]: M, top: wTop - wPx * 0.12 }}>{bigText}</div>
        <div style={{ position: "absolute", [edge]: M, top: mTop, height: wPx * 0.5, overflow: "hidden", WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ ...bigStyle(wPx), transform: "scaleY(-1)", transformOrigin: "center", marginTop: -wPx * 0.02 }}>{word}</div>
        </div>
        {linesBlock(linesTop)}
      </>
    );
  } else {
    // behind: the word across his chest, under his sharp figure; the lines at the foot on the free side.
    const wPx = Math.min((big === "tall" ? 300 : 210) * k * ts, (CANVAS_W - 60) / Math.max(1, bigEm));
    // Cap line just below the top of his head (face centre - ~0.75 face heights), never into the logo band.
    const wTop = Math.max(logoTop + (story ? 100 : 64), place.fy - place.fs * 0.6 - wPx * 0.86 * 0.55);
    const linesTop = bottom - linesH;
    back = <div style={{ ...bigStyle(wPx), position: "absolute", left: 0, width: CANVAS_W, top: wTop - wPx * 0.12, textAlign: "center", opacity: big === "colour" ? 1 : 0.9 }}>{bigText}</div>;
    front = (
      <>
        {topShade(logoTop + (story ? 230 : 160))}
        {footShade(linesTop - 200 * k)}
        <div style={{ position: "absolute", [edge]: M, top: linesTop - 14 * k - 3 * k, width: 40 * k, height: 3 * k, background: colour }} />
        {linesBlock(linesTop)}
      </>
    );
  }

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {back}
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {front}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const matchday = (data: RenderData, layout: Layout, big?: Big) => {
  const fx = natFixture(data);
  return <NatLayoutFrame data={data} layout={layout} big={big} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
};
// Goals: his celebration, the word, his name and his club's exact name. No score.
const goal = (data: RenderData, layout: Layout, big?: Big) => {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLayoutFrame data={data} layout={layout} big={big} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
};

export const Natfreecol = ({ data }: { data: RenderData }) => matchday(data, "freecol");
export const Goalnatfreecol = ({ data }: { data: RenderData }) => goal(data, "freecol");
export const Natcutoff = ({ data }: { data: RenderData }) => matchday(data, "cutoff");
export const Goalnatcutoff = ({ data }: { data: RenderData }) => goal(data, "cutoff");
export const Natcornerpair = ({ data }: { data: RenderData }) => matchday(data, "cornerpair");
export const Goalnatcornerpair = ({ data }: { data: RenderData }) => goal(data, "cornerpair");
export const Natmirror = ({ data }: { data: RenderData }) => matchday(data, "mirror");
export const Goalnatmirror = ({ data }: { data: RenderData }) => goal(data, "mirror");
export const Natbehindword = ({ data }: { data: RenderData }) => matchday(data, "behind");
export const Goalnatbehindword = ({ data }: { data: RenderData }) => goal(data, "behind");
export const Natbehindoutline = ({ data }: { data: RenderData }) => matchday(data, "behind", "outline");
export const Goalnatbehindoutline = ({ data }: { data: RenderData }) => goal(data, "behind", "outline");
export const Natbehindcolor = ({ data }: { data: RenderData }) => matchday(data, "behind", "colour");
export const Goalnatbehindcolor = ({ data }: { data: RenderData }) => goal(data, "behind", "colour");
export const Natbehindserif = ({ data }: { data: RenderData }) => matchday(data, "behind", "serif");
export const Goalnatbehindserif = ({ data }: { data: RenderData }) => goal(data, "behind", "serif");
export const Natbehindtall = ({ data }: { data: RenderData }) => matchday(data, "behind", "tall");
export const Goalnatbehindtall = ({ data }: { data: RenderData }) => goal(data, "behind", "tall");
export const Natcutoffoutline = ({ data }: { data: RenderData }) => matchday(data, "cutoff", "outline");
export const Goalnatcutoffoutline = ({ data }: { data: RenderData }) => goal(data, "cutoff", "outline");
export const Natcutoffcolor = ({ data }: { data: RenderData }) => matchday(data, "cutoff", "colour");
export const Goalnatcutoffcolor = ({ data }: { data: RenderData }) => goal(data, "cutoff", "colour");
export const Natcutofftall = ({ data }: { data: RenderData }) => matchday(data, "cutoff", "tall");
export const Goalnatcutofftall = ({ data }: { data: RenderData }) => goal(data, "cutoff", "tall");
export const Natcutoffserif = ({ data }: { data: RenderData }) => matchday(data, "cutoff", "serif");
export const Goalnatcutoffserif = ({ data }: { data: RenderData }) => goal(data, "cutoff", "serif");
export const Natbehindbodoni = ({ data }: { data: RenderData }) => matchday(data, "behind", "bodoni");
export const Goalnatbehindbodoni = ({ data }: { data: RenderData }) => goal(data, "behind", "bodoni");
export const Natbehindgrotesk = ({ data }: { data: RenderData }) => matchday(data, "behind", "grotesk");
export const Goalnatbehindgrotesk = ({ data }: { data: RenderData }) => goal(data, "behind", "grotesk");
export const Natcornerbodoni = ({ data }: { data: RenderData }) => matchday(data, "cornerpair", "bodoni");
export const Goalnatcornerbodoni = ({ data }: { data: RenderData }) => goal(data, "cornerpair", "bodoni");
export const Natcornertall = ({ data }: { data: RenderData }) => matchday(data, "cornerpair", "tall");
export const Goalnatcornertall = ({ data }: { data: RenderData }) => goal(data, "cornerpair", "tall");
export const Natmirrorserif = ({ data }: { data: RenderData }) => matchday(data, "mirror", "serif");
export const Goalnatmirrorserif = ({ data }: { data: RenderData }) => goal(data, "mirror", "serif");
export const Natmirrorcolor = ({ data }: { data: RenderData }) => matchday(data, "mirror", "colour");
export const Goalnatmirrorcolor = ({ data }: { data: RenderData }) => goal(data, "mirror", "colour");
export const Natfreecolserif = ({ data }: { data: RenderData }) => matchday(data, "freecol", "serif");
export const Goalnatfreecolserif = ({ data }: { data: RenderData }) => goal(data, "freecol", "serif");
export const Natcorneroutline = ({ data }: { data: RenderData }) => matchday(data, "cornerpair", "outline");
export const Goalnatcorneroutline = ({ data }: { data: RenderData }) => goal(data, "cornerpair", "outline");
export const Natcornercolor = ({ data }: { data: RenderData }) => matchday(data, "cornerpair", "colour");
export const Goalnatcornercolor = ({ data }: { data: RenderData }) => goal(data, "cornerpair", "colour");
export const Natfreecolbodoni = ({ data }: { data: RenderData }) => matchday(data, "freecol", "bodoni");
export const Goalnatfreecolbodoni = ({ data }: { data: RenderData }) => goal(data, "freecol", "bodoni");
export const Natfreecoltall = ({ data }: { data: RenderData }) => matchday(data, "freecol", "tall");
export const Goalnatfreecoltall = ({ data }: { data: RenderData }) => goal(data, "freecol", "tall");
export const Natmirrorbodoni = ({ data }: { data: RenderData }) => matchday(data, "mirror", "bodoni");
export const Goalnatmirrorbodoni = ({ data }: { data: RenderData }) => goal(data, "mirror", "bodoni");
