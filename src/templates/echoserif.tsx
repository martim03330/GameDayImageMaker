import { DMSERIF, Film } from "./fx";
import { EchoFigure, echoFoot, EchoLogo, echoSetup } from "./echotitle";
import { placeByFace } from "./outline";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

const M = 64;

/** DM Serif Display italic: advance widths per 100px (measured in the browser, as in serene.tsx). */
const DMI_W: Record<string, number> = { a: 55.9, b: 51.2, c: 45.4, d: 55.3, e: 45.6, f: 33.2, g: 52.2, h: 54.5, i: 28.5, j: 28.3, k: 49, l: 27.5, m: 82.3, n: 55.3, o: 52.3, p: 52.3, q: 52.6, r: 42.6, s: 40.7, t: 34.2, u: 55.5, v: 51.2, w: 78, x: 56.5, y: 52.1, z: 48.9, " ": 22.1, "-": 33.7, "'": 27.4, A: 65.9, B: 60.4, C: 60, D: 66.3, E: 55.8, F: 52.7, G: 64.9, H: 70.1, I: 31.5, J: 39.3, K: 64, L: 53.7, M: 84.3, N: 62.5, O: 66.7, P: 55.9, Q: 66.7, R: 64.2, S: 49.9, T: 59.9, U: 62.2, V: 60.3, W: 87.6, X: 62.3, Y: 57, Z: 54.3 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Width (em) of DM Serif Display italic, with the slant's overhang on the last glyph. */
export const serifEm = (t: string) => plain(t).reduce((a, c) => a + (DMI_W[c] ?? 55) / 100, 0) + 0.06;

/** "MATCHDAY" → ["Match", "day"]; "MAN OF THE MATCH" → ["Man of", "the Match"]; one word stays one line. */
export function serifLines(kicker: string): string[] {
  const k = kicker.replace(/’/g, "'").trim().toUpperCase();
  const m = /^(MATCH|GAME)\s?DAY$/.exec(k);
  if (m) return [m[1].charAt(0) + m[1].slice(1).toLowerCase(), "day"];
  const words = k
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i > 0 && /^(OF|THE|AND|V|VS)$/.test(w) ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase()));
  if (words.length < 3) return words.length ? [words.join(" ")] : [];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

/**
 * Echo serif: echoline's player and hairline echo (the echo leaning to his own side), and on the free side one
 * calm italic serif title — "Match / day" in DM Serif Display, medium-large, white — with a short hairline and
 * the competition in tiny spaced caps beneath it. Crests, fixture and date · kick-off · ground small at the foot.
 */
export function Echoserif({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 11);
  const f = matchFacts(data);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];

  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  /* ---- the player, towards his side ---- */
  const fx = s.story ? (s.right ? 650 : 430) : s.right ? 640 : 440;
  const box = s.story
    ? placeByFace(data, fx, 360, { chest: 380, waist: 300, knees: 226, full: 172 })
    : placeByFace(data, fx, 230, { chest: 280, waist: 222, knees: 166, full: 126 });
  const faceL = box.left + face[0] * box.width;
  const faceR = faceL + face[2] * box.width;

  /* ---- the serif title on the free side ---- */
  const lines = serifLines(content.kicker || "MATCHDAY");
  const colW = Math.max(300, Math.min(s.story ? 520 : 440, s.right ? faceL - 56 - M : CANVAS_W - M - faceR - 56));
  const widest = Math.max(1, ...lines.map(serifEm));
  const size = Math.max(s.story ? 110 : 80, Math.min(s.story ? 184 : 136, colW / widest)) * s.ts;
  const lead = size * 0.9;
  const titleTop = (s.story ? STORY_TOP : 84) + (params.textY ?? 0);
  // DM Serif's ascender sits ~0.2em above the caps: pull the block up so the caps start at titleTop.
  const blockTop = titleTop - size * 0.2;
  const titleBottom = titleTop + size * 0.72 + lead * (lines.length - 1) + size * 0.22;
  const ruleY = titleBottom + 30 * s.k;
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const compSize = Math.max(10.5, Math.min(13 * s.k, (colW * 1.6) / Math.max(1, comp.length * 1.02))) * s.ts;
  const align = s.right ? "left" : "right";
  const side = s.right ? { left: M } : { right: M };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echoserif"
        outward
        light={[s.right ? 58 : 42, 40]}
        behind={
          <>
            <div style={{ position: "absolute", ...side, top: blockTop, width: colW + 40, textAlign: align, fontFamily: DMSERIF, fontStyle: "italic", fontSize: size, lineHeight: `${lead}px`, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: "rgba(255,255,255,.95)" }}>
              {lines.map((l, i) => (
                <div key={i} style={{ height: lead, paddingTop: i === 0 ? 0 : 0 }}>
                  {l}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", ...side, top: ruleY, width: 56 * s.k, height: 1, background: s.white ? "rgba(255,255,255,.7)" : s.echo }} />
            {comp && (
              <div style={{ position: "absolute", ...side, top: ruleY + 22 * s.k, width: colW, textAlign: align, fontFamily: SANS, fontWeight: 500, fontSize: compSize, letterSpacing: "0.3em", lineHeight: 1.7, color: "rgba(255,255,255,.7)" }}>
                {comp}
              </div>
            )}
          </>
        }
      />

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
