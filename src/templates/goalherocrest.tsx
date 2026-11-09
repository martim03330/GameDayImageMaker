/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { wordEm } from "./goalhero";
import { HERO_FACE, HeroFrame, heroBase, wordStyle } from "./goalheroshadow";
import { heroWord } from "./goalherosplit";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Goal hero · crest — the goal-hero layout with the first "O" of the enormous club-colour word swapped for the
 * club crest, sized to the cap height and standing on the baseline; the whole word keeps the exact canvas
 * width. No "O" or no crest → the plain word. Celebrating player under it; logo small, name spaced, no score.
 */
const M = 80;

export function Goalherocrest({ data }: { data: RenderData }) {
  const crest = data.club?.crestUrl ?? null;
  const word = heroWord(data);
  const at = crest ? word.indexOf("O") : -1;
  const face = HERO_FACE;
  // Stored crests are square PNGs with the crest fitted to ~96% of the longer side and centred, so the image is
  // drawn as a square whose tall crests stand exactly cap-high on the baseline. The slot (in place of the O) is
  // a little narrower than the square (wide crests use ~87% of it) plus a little air, so nothing touches the letters.
  const squareEm = face.cap / 0.96;
  const crestEm = squareEm * 0.88;
  const sideEm = 0.025;
  const slotEm = crestEm + 2 * sideEm;
  const pre = at >= 0 ? word.slice(0, at) : word;
  const post = at >= 0 ? word.slice(at + 1) : "";
  const em = Math.max(0.5, wordEm(face, word));
  const emC = at >= 0 ? (pre ? wordEm(face, pre) : 0) + slotEm + (post ? wordEm(face, post) : 0) : em;
  // heroBase sizes the plain word; reserve the difference so the crested word fills the same width.
  const reserve = at >= 0 ? (CANVAS_W - 2 * M) * (1 - em / emC) : 0;
  const b = heroBase(data, { reserve });
  const total = emC * b.size;
  const left = (CANVAS_W - total) / 2;
  const capH = b.size * face.cap;
  const preW = pre ? wordEm(face, pre) * b.size : 0;
  const slotX = left + preW;
  const sq = squareEm * b.size;

  return (
    <HeroFrame
      data={data}
      b={b}
      word={
        <>
          <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
            {at < 0 ? (
              <text x={b.wordLeft} y={b.baseline} style={{ ...wordStyle(b), fill: b.club }}>
                {b.word}
              </text>
            ) : (
              <>
                {pre && (
                  <text x={left} y={b.baseline} style={{ ...wordStyle(b), fill: b.club }}>
                    {pre}
                  </text>
                )}
                {post && (
                  <text x={slotX + slotEm * b.size} y={b.baseline} style={{ ...wordStyle(b), fill: b.club }}>
                    {post}
                  </text>
                )}
              </>
            )}
          </svg>
          {at >= 0 && crest && (
            <img
              src={crest}
              alt=""
              style={{ position: "absolute", left: slotX + (slotEm * b.size - sq) / 2, top: b.capTop + (capH - sq) / 2, width: sq, height: sq, objectFit: "contain", maxWidth: "none" }}
            />
          )}
        </>
      }
    />
  );
}
