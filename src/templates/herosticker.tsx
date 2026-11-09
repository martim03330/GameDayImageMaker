import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { DecoMatchFrame, decoMatchBase, decoWordStyle } from "./heroboxed";

/**
 * Hero · sticker (matchday) — goalherosticker carried to matchday: on the off-white ground the kicker
 * ("MATCHDAY") enormous in off-white on a solid club-colour rectangle slapped on at about −4° like a sticker,
 * hugging the word with generous padding, above the player's head (never over the face); the player big under
 * it fading out over heromatch's quiet fixture foot (crests, "HOME v AWAY" exact names, date · kick-off · ground).
 */
const TILT = -4;

export function Herosticker({ data }: { data: RenderData }) {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const padX = story ? 56 : 46;
  const padY = story ? 40 : 32;
  const rad = (Math.abs(TILT) * Math.PI) / 180;
  // Rotation widens the box by ~h·sin and lifts/drops its corners by ~w·sin/2.
  const estH = (story ? 400 : 330) + 2 * padY;
  const reserveW = 2 * padX + estH * Math.sin(rad);
  const lift = ((CANVAS_W - 160) * Math.sin(rad)) / 2;
  const b = decoMatchBase(data, { reserve: reserveW, lift: padY + lift, drop: padY + lift + (story ? 8 : 4), maxCap: story ? 400 : 330 });
  const w = b.wordW + 2 * padX;
  const h = b.capH + 2 * padY;
  const cx = CANVAS_W / 2;
  const cy = b.capTop + b.capH / 2;
  return (
    <DecoMatchFrame
      data={data}
      b={b}
      word={
        <svg width={CANVAS_W} height={b.H} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform={`rotate(${TILT} ${cx} ${cy})`}>
            <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill={b.club} />
            <text x={cx - b.wordW / 2} y={b.baseline} style={{ ...decoWordStyle(b), fill: "#f6f4ee" }}>
              {b.word}
            </text>
          </g>
        </svg>
      }
    />
  );
}
