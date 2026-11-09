import { FACES, wordEm } from "./goalhero";
import { HeroFxFrame } from "./goalherobw";
import { heroBase, wordStyle } from "./goalheroshadow";
import { heroWord } from "./goalherosplit";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · exclaim — the goal-hero layout with the word in near-black ink followed by a huge "!" in the club
 * colour ("GOAL!", "HAT-TRICK!"), the whole thing set at exact width. Name wide-spaced in the club colour,
 * celebrating player under the word fading into the off-white ground. A word already ending in "!" keeps one.
 */
const INK = "#16181d";
const M = 80;

export function Goalheroexclaim({ data }: { data: RenderData }) {
  const face = FACES.anton;
  const word = heroWord(data).replace(/!+$/, "");
  const em = Math.max(0.5, wordEm(face, word));
  const bang = wordEm(face, "!"); // Anton is set solid (no tracking)
  // Reserve the "!" from the word's width so word + "!" spans exactly the canvas minus margins.
  const reserve = (bang * (CANVAS_W - 2 * M)) / (em + bang);
  const b0 = heroBase(data, { reserve });
  const b = { ...b0, word, wordLeft: (CANVAS_W - (em + bang) * b0.size) / 2 };
  return (
    <HeroFxFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={b.wordLeft} y={b.baseline} style={{ ...wordStyle(b), fill: INK }}>
            {word}
            <tspan style={{ fill: b.club }}>!</tspan>
          </text>
        </svg>
      }
    />
  );
}
