import { Film } from "./fx";
import { arcSize, placeInRing, RingHalf } from "./echoorbit";
import { centredFoot, CentreLogo, EchoLine, echoTones, FootFade, footTexts, Player, WHITE } from "./goalechotitle";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo orbit: the celebrating player, sharp and in natural colour, with echoline's one hairline echo of his
 * edge — and one hairline ring around his head and raised fist in the echo's own tone, its back half behind him
 * (his arm crosses in front of it), its front half across his chest, "GOAL · <NAME>" set in tiny spaced caps on
 * its arc above his head. The fixture (home first, names as stored, no score) and competition small at the foot.
 */
export function Goalechoorbit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo, whiteEcho } = echoTones(data);
  const right = params.side !== "left";

  const foot = centredFoot(data, story, k, { name: false });

  /* ---- the run on the arc ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const name = footTexts(data, k).name;
  const text = [kicker, name].filter(Boolean).join("  ·  ");
  const TRACK = 0.36;

  /* ---- the player, centred; the ring around his head ---- */
  const sizes = story ? { chest: 270, waist: 224, knees: 184, full: 148 } : { chest: 216, waist: 178, knees: 142, full: 114 };
  const size0 = Math.max(11, 13.5 * k) * ts;
  const ringTop = (story ? STORY_TOP + size0 * 1.6 + 6 : 64 + size0 * 1.6 + 10) + (params.textY ?? 0);
  const placed = placeInRing(data, { faceX: 540, ringTop, sizes, k, echoUp: 26 * k, maxR: story ? 440 : 410, minBottom: story ? 1590 : 1300, figure: true });
  // Centre the figure (not the face) a little: his raised arm balances around the middle.
  const lean = Math.max(-90, Math.min(90, 540 - (placed.box.left + placed.box.width / 2))) * 0.6;
  const box = { ...placed.box, left: placed.box.left + lean };
  const ring = { ...placed.ring, cx: placed.ring.cx + lean };
  const R = ring.R;
  const size = arcSize(text, R, TRACK, size0, story ? 14 : 11);
  const ink = whiteEcho ? "rgba(255,255,255,.72)" : echo;
  const dx = (right ? 1 : -1) * 30 * k;
  const dy = -26 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 48% at 50% ${((ring.cy - 60) / H) * 100}%, ${lift}, ${deep} 82%)` }} />

      <RingHalf id="goalechoorbit" ring={ring} H={H} half="back" color={ink} text={text} size={size} track={TRACK} />
      <EchoLine id="goalechoorbit" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={ring.cy - R + 6} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />
      <RingHalf id="goalechoorbit-f" ring={ring} H={H} half="front" color={ink} size={size} track={TRACK} />

      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
