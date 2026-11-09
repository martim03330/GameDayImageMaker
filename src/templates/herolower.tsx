import { ARCHIVO_BLACK } from "./fx";
import { HeroWordMatchday } from "./heroserif";
import type { RenderData } from "./types";

/** Archivo Black lowercase: advance widths per 100px (measured in the browser; as in goalherolower.tsx). */
const AL_W: Record<string, number> = { a: 66.7, b: 66.7, c: 66.7, d: 66.7, e: 66.7, f: 38.9, g: 66.7, h: 66.7, i: 33.3, j: 33.3, k: 66.7, l: 33.3, m: 100, n: 66.7, o: 66.7, p: 66.7, q: 66.7, r: 44.4, s: 61.1, t: 44.4, u: 66.7, v: 61.1, w: 94.4, x: 66.7, y: 61.1, z: 55.6, "-": 33.3, "!": 33.3, "'": 27.8, ".": 33.3, " ": 33.3 };
const TRACK = -0.04;
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const alEm = (t: string) => plain(t).reduce((a, c) => a + (AL_W[c] ?? 66.7) / 100, 0) + (plain(t).length - 1) * TRACK;
const ASC = 0.725;
const XH = 0.528;
const DESC = 0.21;
const inkTop = (t: string) => plain(t).reduce((a, c) => Math.max(a, /[bdfhklij!'0-9]/.test(c) ? ASC : c === "t" ? 0.66 : XH), 0);
const lsb = (t: string) => (/^[bhiklmnpru]/.test(plain(t)[0] ?? "") ? 0.06 : 0.005);
const DOT_RSB = 0.06;
const INK = "#16181d";

/**
 * Hero lower — the matchday hero said quietly: "matchday." in heavy lowercase Archivo Black, near-black ink
 * closed by a club-colour full stop, set huge and exactly across the canvas, the player big under it, the
 * quiet fixture foot.
 */
export function Herolower({ data }: { data: RenderData }) {
  const word = (data.content.kicker || "MATCHDAY").replace(/’/g, "'").trim().toLowerCase().replace(/[.!]+$/, "");
  const full = word + ".";
  return (
    <HeroWordMatchday
      data={data}
      hero={(story) => ({
        inkEm: Math.max(0.5, alEm(full) - lsb(full) - DOT_RSB),
        leftIn: lsb(full),
        inkTop: inkTop(word),
        descent: /[gjpqy]/.test(word) ? DESC : 0,
        maxSize: story ? 600 : 500,
        render: (x, y, size, club) => (
          <text x={x} y={y} style={{ fontFamily: ARCHIVO_BLACK, fontWeight: 400, fontSize: size, fill: INK, letterSpacing: `${TRACK}em` }}>
            {word}
            <tspan fill={club}>.</tspan>
          </text>
        ),
      })}
    />
  );
}
