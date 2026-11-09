import { Film } from "./fx";
import { CentreLogo, caps, centredFoot, EchoLine, echoTones, FootFade, goalBox, Player, plain, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/** Barlow Condensed SemiBold capitals: advance widths per 1px of font size (approximate). */
const BC: Record<string, number> = { A: 0.5, B: 0.5, C: 0.47, D: 0.51, E: 0.43, F: 0.42, G: 0.5, H: 0.53, I: 0.23, J: 0.38, K: 0.5, L: 0.41, M: 0.66, N: 0.53, O: 0.51, P: 0.49, Q: 0.51, R: 0.5, S: 0.46, T: 0.43, U: 0.52, V: 0.5, W: 0.72, X: 0.5, Y: 0.48, Z: 0.43, " ": 0.2, "'": 0.18, "-": 0.32 };
const condEm = (t: string, track: number) => plain(t).reduce((a, c) => a + (BC[c] ?? 0.5) + track, -track);
/** Barlow Condensed cap height relative to its size. */
const BC_CAP = 0.7;

/**
 * Goal echo name: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and his surname set very large across the canvas
 * behind him as an outline only, drawn with the same hairline and colour as the echo, so the word and his
 * echo read as one drawing and his body hides part of it. "GOAL" small and wide-tracked at the top; the fixture
 * (home first, names exactly as stored, no score) and the competition small at the foot.
 */
export function Goalechoname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo } = echoTones(data);
  const toRight = params.side !== "left";

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(15 * k, Math.min(26 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + 34 * k;

  /* ---- foot: his full name (the surname is half hidden), the fixture, the competition ---- */
  const foot = centredFoot(data, story, k);

  /* ---- the player, a touch off centre towards his side ---- */
  const cx = 540 + (toRight ? 40 : -40);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 450 : 300, cx, maxW: story ? 800 : 860, story, sizes: story ? { chest: 270, waist: 222, knees: 182, full: 148 } : undefined, minHead: clipTop + (story ? 28 : 20) });
  const faceH = box.faceH;
  const faceBottom = box.top + ((data.face?.[1] ?? 0.08) + (data.face?.[3] ?? 0.12)) * box.height;
  const dx = (toRight ? -1 : 1) * 28 * k;
  const dy = -24 * k;

  /* ---- the surname, outline only, as wide as the canvas allows ---- */
  const surname = (content.lastName || content.firstName || "").toUpperCase().normalize("NFC");
  const TRACK = 0.04;
  const maxW = CANVAS_W - 2 * (story ? 56 : 48);
  const size = Math.min((story ? 420 : 340) * ts, maxW / Math.max(1, condEm(surname, TRACK)));
  const capH = size * BC_CAP;
  // Behind his chest: the cap line a little under his chin, never into the foot.
  const baseline = Math.min(foot.top - (story ? 110 : 70), faceBottom + faceH * 0.45 + capH);
  const stroke = story ? 2.4 : 2;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 48% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 82%)` }} />

      {/* The surname, a hairline outline behind him. */}
      {surname && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" fontFamily={CONDENSED} fontWeight={600} fontSize={size} letterSpacing={`${TRACK}em`} fill="none" stroke={echo} strokeWidth={stroke} strokeLinejoin="round">
            {surname}
          </text>
        </svg>
      )}

      <EchoLine id="goalechoname" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={clipTop} color={echo} width={story ? 2.4 : 2} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>
      {foot.node}

      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
