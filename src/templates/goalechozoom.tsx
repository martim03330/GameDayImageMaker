import { luminance, shade } from "@/lib/color";
import { BurstRays, SilhouetteBurst } from "./echozoom";
import { Film } from "./fx";
import { caps, CentreLogo, centredFoot, echoTones, EchoLine, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo zoom: the celebrating player, sharp and in natural colour, on echoline's deep club ground, with
 * zoomburst's idea held low — faint radial streaks of his own silhouette and fine hairline rays bursting from
 * his chest — and one crisp hairline echo of his edge slipped up and away on top. "GOAL" in light wide-tracked
 * capitals at the top; his name, the fixture (home first, names as stored, no score) and the competition small
 * at the foot.
 */
export function Goalechozoom({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { club, deep, lift, echo, whiteEcho } = echoTones(data);
  const right = params.side !== "left";

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const TRACK = 0.5;
  const size = Math.min((story ? 46 : 40) * k * ts, (story ? 860 : 780) / Math.max(1, capsEm(kicker, TRACK)));
  const titleTop = (story ? STORY_TOP : 88) + (params.textY ?? 0);
  const titleBottom = titleTop + size * 0.75;

  /* ---- foot ---- */
  const foot = centredFoot(data, story, k);

  /* ---- the player, centred, arms balanced around the middle ---- */
  const box = goalBox(data, { faceX: 540, faceTop: story ? 470 : 300, cx: 540, maxW: story ? 940 : 1000, story, minHead: titleBottom + (story ? 60 : 44) });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const ox = box.left + (face[0] + face[2] / 2) * box.width;
  const oy = box.top + face[1] * box.height + box.faceH * 2.2;
  const dx = (right ? -1 : 1) * 32 * k;
  const dy = -28 * k;
  const streak = whiteEcho ? "#ffffff" : shade(club, luminance(club) < 0.12 ? 0.55 : 0.4);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 50% at 50% ${story ? 36 : 38}%, ${lift}, ${deep} 82%)` }} />
      <SilhouetteBurst id="goalechozoom-burst" data={data} box={box} H={H} ox={ox} oy={oy} color={streak} strength={0.26} reachPx={story ? 1100 : 880} />
      <BurstRays id="goalechozoom-rays" H={H} ox={ox} oy={oy} color={streak} seed={params.seed ?? 7} r0={story ? 300 : 230} r1={story ? 1060 : 780} count={90} alpha={whiteEcho ? 0.18 : 0.24} />

      <EchoLine id="goalechozoom" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={titleBottom + 24} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(size, TRACK, 300, { color: "rgba(255,255,255,.94)" }) }}>{kicker}</div>

      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.2} />
    </div>
  );
}
