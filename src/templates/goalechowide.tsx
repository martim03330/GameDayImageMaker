import { luminance, shade } from "@/lib/color";
import { WideText, CAP, STRETCH, thinEm, TRACK } from "./echowidetitle";
import { Film } from "./fx";
import { CentreLogo, centredFoot, echoTones, EchoLine, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const M = 60;

/**
 * Goal echo wide: the celebrating player, sharp and in natural colour, with echoline's one hairline echo of
 * his edge on the deep club ground — and widetitle's ultra-thin extended capitals: "GOAL" whole, margin to
 * margin across the top in a quiet club tint, his raised fist and head rising to just under it (the echo
 * stops below the word, so no letter is crossed or hidden). Name, fixture (home first, no score) and the
 * competition small at the foot.
 */
export function Goalechowide({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { club, deep, lift, echo, whiteEcho } = echoTones(data);
  const right = params.side !== "left";

  /* ---- the word, whole, across the top ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const span = CANVAS_W - 2 * M;
  const chars = [...kicker].length;
  const em = (thinEm(kicker) + Math.max(0, chars - 1) * TRACK) * STRETCH;
  const size = Math.min((story ? 230 : 172) * ts, span / Math.max(1, em));
  const capH = size * CAP;
  const top = (story ? STORY_TOP : 70) + (params.textY ?? 0);
  const base = top + capH;
  // Short words run the full width (wider tracking); long ones keep their natural width, centred.
  const width = Math.min(span, Math.max(em * size, chars <= 6 ? span : 0));
  const x = (CANVAS_W - width) / 2;
  const ink = whiteEcho ? "rgba(255,255,255,.66)" : luminance(club) < 0.12 ? shade(club, 0.55) : shade(club, 0.32);

  /* ---- the celebrating player: his highest point (fist or hair) just under the word ---- */
  const foot = centredFoot(data, story, k);
  const gap = story ? 40 : 30;
  const box = goalBox(data, {
    faceX: 540 + (right ? 30 : -30),
    faceTop: story ? 380 : 230,
    cx: 540,
    maxW: story ? 920 : 960,
    story,
    minHead: base + gap,
    sizes: story ? { chest: 300, waist: 250, knees: 200, full: 160 } : { chest: 236, waist: 192, knees: 152, full: 122 },
  });
  const dx = (right ? -1 : 1) * 30 * k;
  const dy = -26 * k;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fTop = box.top + face[1] * box.height;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 50% at ${(fCx / CANVAS_W) * 100}% ${(fTop / H) * 100 + 4}%, ${lift}, ${deep} 82%)` }} />

      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <WideText x={x} y={base} width={width} size={size} fill={ink} text={kicker} />
      </svg>

      <EchoLine id="goalechowide" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={base + gap * 0.45} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
