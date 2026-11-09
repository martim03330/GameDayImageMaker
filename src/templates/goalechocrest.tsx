/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { Film } from "./fx";
import { CentreLogo, caps, centredFoot, EchoLine, echoTones, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { MonoDefs } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo crest: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and his club crest very large and very faint, a
 * watermark in white, on the free side behind his raised fist (he stands on params.side; by default away from
 * his raised arm, read from where his face sits in the cutout). "GOAL" small and wide-tracked at the top; his name,
 * the fixture (home first, names exactly as stored, no score) and the competition small at the foot.
 */
export function Goalechocrest({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo } = echoTones(data);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // The raised arm: the bulk of the cutout beside his face (the face sits off-centre, away from the arm).
  const rel = face[0] + face[2] / 2;
  // He stands on params.side (default: away from his raised arm), the crest fills the free side behind the fist.
  const toRight = params.side === "right" ? true : params.side === "left" ? false : rel >= 0.5;

  /* ---- title ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.6;
  const kSize = Math.max(15 * k, Math.min(26 * k, 760 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  const clipTop = titleTop + kSize + 34 * k;

  const foot = centredFoot(data, story, k);

  /* ---- the player, a little towards his side ---- */
  const cx = 540 + (toRight ? 1 : -1) * (story ? 80 : 70);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 450 : 300, cx, maxW: story ? 880 : 840, story, minHead: clipTop + (story ? 28 : 20) });
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceCy = box.top + (face[1] + face[3] / 2) * box.height;
  const crestLeft = toRight;

  /* ---- the crest watermark ---- */
  const crest = data.club?.crestUrl ?? (content.home === false ? content.awayCrest : content.homeCrest) ?? null;
  const CS = story ? 900 : 700;
  const crestCx = Math.max(CS * 0.32, Math.min(CANVAS_W - CS * 0.32, faceCx + (crestLeft ? -1 : 1) * (story ? 330 : 280)));
  const crestCy = Math.min(foot.top - CS * 0.45, faceCy + box.faceH * (story ? 1.1 : 1.0));
  const dx = (crestLeft ? -1 : 1) * 28 * k;
  const dy = -24 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <MonoDefs id="goalechocrest-mono" ink={0.35} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 48% at ${crestLeft ? 42 : 58}% ${story ? 40 : 42}%, ${lift}, ${deep} 82%)` }} />

      {/* The crest, huge and faint, behind the raised fist. */}
      {crest && <img data-bleed src={crest} alt="" style={{ position: "absolute", left: crestCx - CS / 2, top: crestCy - CS / 2, width: CS, height: CS, objectFit: "contain", filter: "url(#goalechocrest-mono)", opacity: 0.075 }} />}

      <EchoLine id="goalechocrest" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={clipTop} color={echo} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 400) }}>{kicker}</div>
      {foot.node}

      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
