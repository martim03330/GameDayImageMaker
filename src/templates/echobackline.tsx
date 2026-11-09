import { Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";
import { CAP, capsStyle, EchoFigure, echoFoot, EchoLogo, echoSetup } from "./echotitle";

const M = 64;
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter SemiBold figures: advance widths per 1px of font size. */
const NUM_W: Record<string, number> = { "0": 0.62, "1": 0.4, "2": 0.6, "3": 0.61, "4": 0.63, "5": 0.58, "6": 0.6, "7": 0.56, "8": 0.62, "9": 0.6 };

/**
 * Echo backline: echoline's player and hairline echo, with backline's idea — his shirt number set huge behind
 * him as a second, quieter hairline (an outline, never filled), and his surname in wide-tracked light caps
 * above him with a short rule and the title under it. Crests, fixture and date · kick-off · ground small at
 * the foot. The number leans to the free side, the echo with it.
 */
export function Echobackline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 17);
  const f = matchFacts(data);

  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  /* ---- top: surname, rule, title ---- */
  const surname = (content.lastName || content.firstName || "").toUpperCase();
  const N_TRACK = 0.62;
  const nameSize = Math.min(30 * s.k, 820 / Math.max(1, capsEm(surname, N_TRACK))) * s.ts;
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.5;
  const tSize = Math.max(11 * s.k, Math.min(14 * s.k, 640 / Math.max(1, capsEm(title, T_TRACK)))) * s.ts;
  const nameTop = (s.story ? STORY_TOP : 74) + (params.textY ?? 0);
  const ruleY = nameTop + nameSize + 26 * s.k;
  const titleTop = ruleY + 24 * s.k;
  const headEnd = titleTop + tSize;

  /* ---- the player, a touch towards his side ---- */
  const fx = s.right ? 570 : 510;
  const sizes = s.story ? { chest: 400, waist: 316, knees: 232, full: 172 } : { chest: 280, waist: 220, knees: 164, full: 124 };
  // His hair (about 0.75 of a face above the face box) clears the title by a calm gap.
  const faceH0 = placeByFace(data, fx, 400, sizes).faceH;
  const box = placeByFace(data, fx, headEnd + (s.story ? 70 : 48) + faceH0 * 0.75, sizes);

  /* ---- the number, a hairline outline, huge behind him ---- */
  const num = (data.player.number || "").replace(/\D/g, "").slice(0, 2);
  const numEm = plain(num).reduce((a, c) => a + (NUM_W[c] ?? 0.6), 0);
  const numSize = Math.min(s.story ? 1240 : 1000, (s.story ? 1000 : 900) / Math.max(0.5, numEm));
  // The numeral's cap top a little under the title, so it frames his head and shoulders.
  const numTop = headEnd + (s.story ? 70 : 44);
  const numBase = numTop + numSize * CAP;
  const numX = 540 + (s.right ? -36 : 36);
  const stroke = s.white ? "rgba(255,255,255,.34)" : s.echo;

  const rule = s.white ? "rgba(255,255,255,.7)" : s.echo;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echobackline"
        clipTop={headEnd + 20}
        light={[50, 42]}
        behind={
          num && (
            <svg data-bleed width={CANVAS_W} height={s.H} style={{ position: "absolute", inset: 0 }} aria-hidden>
              <text
                x={numX}
                y={numBase}
                textAnchor="middle"
                fontFamily="var(--font-inter), system-ui, sans-serif"
                fontWeight={600}
                fontSize={numSize}
                letterSpacing={-numSize * 0.02}
                fill="none"
                stroke={stroke}
                strokeOpacity={s.white ? 1 : 0.42}
                strokeWidth={1.5}
              >
                {num}
              </text>
            </svg>
          )
        }
      />

      {/* Top: surname, a short rule in the echo's colour, the title. */}
      {surname && <div style={{ position: "absolute", left: M, right: M, top: nameTop, ...capsStyle(nameSize, N_TRACK, 300) }}>{surname}</div>}
      <div style={{ position: "absolute", left: 540 - 22 * s.k, top: ruleY, width: 44 * s.k, height: 1.5, background: rule }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...capsStyle(tSize, T_TRACK), opacity: 0.75 }}>{title}</div>

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
