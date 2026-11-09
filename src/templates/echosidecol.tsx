/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { teamsOf } from "./notify";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { EchoFigure, echoSetup } from "./echotitle";

const WHITE = "#ffffff";
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter ExtraLight capitals: advance widths per 1px of font size (approximate, as in echotitle). */
const LIGHT_W: Record<string, number> = { A: 0.68, B: 0.64, C: 0.72, D: 0.72, E: 0.58, F: 0.56, G: 0.75, H: 0.73, I: 0.25, J: 0.53, K: 0.65, L: 0.53, M: 0.88, N: 0.74, O: 0.77, P: 0.62, Q: 0.77, R: 0.64, S: 0.62, T: 0.62, U: 0.72, V: 0.68, W: 0.98, X: 0.66, Y: 0.64, Z: 0.62, " ": 0.26, "'": 0.2, "-": 0.4 };
const lightEm = (t: string, tracking: number) => plain(t.toUpperCase()).reduce((a, c) => a + (LIGHT_W[c] ?? 0.66) + tracking, -tracking);
/** Inter, mixed case, roughly. */
const interEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? 0.7 : /[ilj'.]/.test(c) ? 0.26 : /[mw]/.test(c) ? 0.86 : 0.56), 0);

/** "MATCHDAY" → ["MATCH", "DAY"]; other kickers by words, at most three lines. */
function titleLines(kicker: string): string[] {
  const k = kicker.replace(/’/g, "'").trim().toUpperCase().replace(/^(MATCH|GAME)DAY$/, "$1 DAY");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return words;
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

/**
 * Echo side column: echoline's player and hairline echo, and on the free edge one narrow column — a shade
 * deeper than the ground, ruled off by a hairline in the echo's colour — holding all the type stacked: crests,
 * the title in tall ExtraLight caps, the fixture (home first, names as stored), and at its foot the date,
 * kick-off, ground, competition and the agency mark. He stands in the open part, the echo leaning away.
 */
export function Echosidecol({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 31);
  const f = matchFacts(data);
  const k = s.story ? 1.32 : 1;

  /* ---- the column ---- */
  const COL = s.story ? 384 : 312;
  const PAD = s.story ? 50 : 44;
  const inner = COL - PAD * 2;
  const colLeft = s.right ? 0 : CANVAS_W - COL;
  const edgeX = s.right ? COL : CANVAS_W - COL;
  const textLeft = colLeft + PAD;
  const TOP = (s.story ? STORY_TOP : 64) + (params.textY ?? 0);

  /* ---- the player, in the open part ---- */
  const open = CANVAS_W - COL;
  const fx = (s.right ? COL : 0) + open * (s.right ? 0.52 : 0.48);
  const box = s.story
    ? placeByFace(data, fx, 360, { chest: 330, waist: 262, knees: 200, full: 152 })
    : placeByFace(data, fx, 236, { chest: 250, waist: 198, knees: 150, full: 114 });

  /* ---- type ---- */
  const lines = titleLines(content.kicker || "MATCHDAY");
  const T_TRACK = 0.12;
  const tSize = Math.min(78 * k, inner / Math.max(1, ...lines.map((l) => lightEm(l, T_TRACK)))) * s.ts;
  const [first, second] = teamsOf(data);
  const fit = (t: string, max: number, min: number) => Math.max(min, Math.min(max * k, inner / Math.max(1, interEm(t)))) * s.ts;
  const date = niceDate(content.date);
  const facts = [date, f.time ? `Kick-off ${f.time}` : "", titleCase(f.venue || "")].filter(Boolean);
  const comp = (f.comp || "").toUpperCase();
  const round = (f.round || "").toUpperCase();
  // Competition and round share one size, small enough that the longer fits on a line (it wraps only past 10px).
  const capsPx = Math.max(10, Math.min(12.5 * k, ...[comp, round].filter(Boolean).map((t) => inner / Math.max(1, capsEm(t, 0.2))))) * s.ts;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const light: CSSProperties = { fontFamily: SANS, fontWeight: 300, color: "rgba(255,255,255,.82)", lineHeight: 1.32 };
  const smallCaps = (): CSSProperties => ({ fontFamily: SANS, fontWeight: 500, fontSize: capsPx, letterSpacing: "0.2em", lineHeight: 1.45, color: "rgba(255,255,255,.55)" });

  /* ---- the foot of the column: facts end 64px above the logo ---- */
  const logoH = s.story ? 88 : 52;
  const logoBottom = s.story ? s.H - STORY_BOTTOM : 56;
  const footBottom = (s.story ? STORY_BOTTOM - logoH : CANVAS_H - logoBottom - logoH) - 64;

  const rule = s.white ? "rgba(255,255,255,.42)" : s.echo;
  const Column = () => (
    <>
      <div style={{ position: "absolute", left: colLeft, top: 0, width: COL, height: s.H, background: "rgba(0,0,0,.26)" }} />
      <div style={{ position: "absolute", left: edgeX - 0.5, top: 0, width: 1, height: s.H, background: rule, opacity: 0.8 }} />
    </>
  );
  // The column's lower part is under echoline's deep fade: lay it again over the fade, below his body.
  const reveal = `linear-gradient(to bottom, transparent ${s.H - (s.story ? 900 : 560)}px, #000 ${s.H - (s.story ? 640 : 380)}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <EchoFigure data={data} s={s} box={box} id="echosidecol" outward light={[s.right ? 64 : 36, 40]} behind={<Column />} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: reveal, maskImage: reveal }}>
        <Column />
      </div>

      {/* Head of the column: crests, the title, a short rule, the fixture. */}
      <div style={{ position: "absolute", left: textLeft, top: TOP, width: inner }}>
        {crests.length > 0 && (
          <div style={{ display: "flex", gap: 16 * k, alignItems: "center", height: 44 * k, marginBottom: 54 * k }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: 42 * k, height: 42 * k, objectFit: "contain" }} />
            ))}
          </div>
        )}
        <div style={{ fontFamily: SANS, fontWeight: 200, fontSize: tSize, lineHeight: 1.02, letterSpacing: `${T_TRACK}em`, whiteSpace: "nowrap", color: WHITE, marginLeft: -tSize * 0.04 }}>
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 34 * k, width: 44 * k, height: 2, background: s.white ? "rgba(255,255,255,.8)" : s.echo }} />
        <div style={{ marginTop: 30 * k }}>
          {first && <div style={{ ...light, fontWeight: 500, color: WHITE, fontSize: fit(first, 21, 15) }}>{first}</div>}
          {second && <div style={{ ...light, fontWeight: 500, color: WHITE, fontSize: fit(`v ${second}`, 21, 15) }}>v {second}</div>}
        </div>
      </div>

      {/* Foot of the column: date, kick-off, ground; competition and round in small caps. */}
      <div style={{ position: "absolute", left: textLeft, bottom: s.H - footBottom, width: inner, display: "flex", flexDirection: "column" }}>
        {facts.map((t, i) => (
          <div key={i} style={{ ...light, fontSize: fit(t, 18, 13) }}>
            {t}
          </div>
        ))}
        {(comp || round) && <div style={{ height: 22 * k }} />}
        {comp && <div style={smallCaps()}>{comp}</div>}
        {round && round !== comp && <div style={smallCaps()}>{round}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={s.story ? 26 : 18}
        style={{ position: "absolute", left: textLeft, bottom: logoBottom - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
