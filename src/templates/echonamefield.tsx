import { shade } from "@/lib/color";
import { BODONI } from "./cover";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";
import { capsStyle, EchoFigure, echoFoot, EchoLogo, echoSetup } from "./echotitle";

const M = 64;
/** Bodoni Moda 500 lowercase: advance widths per 100px (measured in the browser, as in namefield). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.5, d: 61.7, e: 52.6, f: 40.2, g: 60.8, h: 60.5, i: 31, j: 31.3, k: 61.6, l: 34.2, m: 87, n: 60.5, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 60.7, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, " ": 25, "-": 36, "'": 21.6 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const bodEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (BOD_W[c] ?? 58) / 100 + tracking, -tracking);

/**
 * Echo namefield: echoline's player and hairline echo, with namefield's idea — his surname enormous in a
 * lowercase Bodoni behind his head, running off both edges, only a shade lighter than the deep ground (tone
 * on tone), so the face and the echo still read first. The title and competition small at the top; crests,
 * fixture and date · kick-off · ground small at the foot.
 */
export function Echonamefield({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 19);
  const f = matchFacts(data);

  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  /* ---- top: title, competition ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.52;
  const tSize = Math.max(12 * s.k, Math.min(16 * s.k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * s.ts;
  const comp = (f.comp || f.round || "").toUpperCase();
  const C_TRACK = 0.3;
  const cSize = Math.max(10 * s.k, Math.min(12 * s.k, 760 / Math.max(1, capsEm(comp, C_TRACK)))) * s.ts;
  const titleTop = (s.story ? STORY_TOP : 66) + (params.textY ?? 0);
  const headEnd = titleTop + tSize + (comp ? 16 * s.k + cSize : 0);

  /* ---- the player, a touch towards his side ---- */
  const fx = s.right ? 566 : 514;
  const sizes = s.story ? { chest: 390, waist: 310, knees: 230, full: 172 } : { chest: 276, waist: 218, knees: 162, full: 124 };
  // His hair (about 0.8 of a face above the face box) clears the title block.
  const faceH0 = placeByFace(data, fx, 400, sizes).faceH;
  const box = placeByFace(data, fx, Math.max(s.story ? 470 : 300, headEnd + (s.story ? 90 : 60) + faceH0 * 0.8), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceY = box.top + face[1] * box.height;

  /* ---- the surname behind his head ---- */
  const surname = (content.lastName || content.firstName || "").toLowerCase();
  const TRACK = -0.02;
  const nameSize = Math.min(s.story ? 500 : 440, (CANVAS_W * 1.16) / Math.max(1, bodEm(surname, TRACK))) * s.ts;
  // Baseline a little below his chin: the x-height band across his face, the ascenders above his head.
  const baseline = Math.min(faceY + box.faceH * 0.7, s.story ? 1180 : 860);
  const nameTop = baseline - nameSize * 0.98;
  const tone = s.white ? "rgba(255,255,255,.075)" : shade(s.club, -0.6);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echonamefield"
        clipTop={headEnd + 24}
        light={[50, s.story ? 34 : 38]}
        behind={
          surname && (
            <div
              data-bleed
              style={{ position: "absolute", left: -400, right: -400, top: nameTop, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: nameSize, lineHeight: 1.2, letterSpacing: `${TRACK}em`, whiteSpace: "nowrap", color: tone }}
            >
              {surname}
            </div>
          )
        }
      />

      {/* Top: title, competition. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...capsStyle(tSize, T_TRACK) }}>{title}</div>
      {comp && <div style={{ position: "absolute", left: M, right: M, top: titleTop + tSize + 16 * s.k, ...capsStyle(cSize, C_TRACK), color: "rgba(255,255,255,.62)" }}>{comp}</div>}

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
