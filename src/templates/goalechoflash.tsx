import { Film } from "./fx";
import { caps, centredFoot, CentreLogo, EchoLine, echoTones, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { capsEm, SilhouetteFx } from "./rippleecho";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo flash: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and goalflash's camera flash, translated quietly: one
 * soft bloom of light just behind his head, where the flash catches the echo. Inside the bloom the hairline
 * turns white, and on the echo's crown a single thin four-point glint. "GOAL" small and wide-tracked over the
 * centred foot (name, fixture home first with names as stored, competition). No score.
 */
export function Goalechoflash({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo, whiteEcho } = echoTones(data);
  const right = params.side !== "left";

  /* ---- foot: GOAL small over name / fixture / competition ---- */
  const foot = centredFoot(data, story, k);
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.62;
  const kSize = Math.max(22 * k, Math.min(44 * k, 640 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const kTop = foot.top - 34 * k - kSize * 0.86;

  /* ---- the player, slightly to his side ---- */
  const cx = 540 + (right ? 1 : -1) * (story ? 40 : 50);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 440 : 280, cx, maxW: story ? 960 : 900, story, minHead: (story ? STORY_TOP : 60) + 30 });
  const dx = (right ? -1 : 1) * 30 * k;
  const dy = -26 * k;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceH = face[3] * box.height;
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceTop = box.top + face[1] * box.height;

  /* ---- the flash: on the echo's crown (his crown, offset like the echo) ---- */
  const gx = faceCx + dx;
  const gy = Math.max(box.top, faceTop - faceH * 0.34) + dy - 3 - faceH * 0.06;
  const bloomR = faceH * (story ? 2.6 : 2.7);
  const ray = faceH * 0.85;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% 46% at ${right ? 58 : 42}% ${story ? 36 : 38}%, ${lift}, ${deep} 82%)` }} />
      {/* The bloom: a soft white light behind his head, as if the flash went off just there. */}
      <div style={{ position: "absolute", left: gx - bloomR, top: gy - bloomR, width: bloomR * 2, height: bloomR * 2, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,255,255,.2), rgba(255,255,255,.07) 45%, rgba(255,255,255,0) 100%)" }} />

      <EchoLine id="goalechoflash" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={story ? STORY_TOP - 60 : 30} color={echo} />
      {/* Where the flash catches it, the hairline turns white (a touch brighter when the echo is already white). */}
      {data.photoUrl && (
        <SilhouetteFx
          id="goalechoflash-lit"
          url={data.photoUrl}
          box={{ ...box, left: box.left + dx, top: box.top + dy }}
          H={H}
          clipTop={story ? STORY_TOP - 60 : 30}
          cut={data.cut}
          pad={16}
          mask={
            <>
              <defs>
                <radialGradient id="goalechoflash-litg" gradientUnits="userSpaceOnUse" cx={gx} cy={gy} r={bloomR * 0.8}>
                  <stop offset="0" stopColor="#fff" stopOpacity={1} />
                  <stop offset="0.35" stopColor="#fff" stopOpacity={0.85} />
                  <stop offset="1" stopColor="#fff" stopOpacity={0} />
                </radialGradient>
              </defs>
              <rect x={0} y={0} width={CANVAS_W} height={H} fill="url(#goalechoflash-litg)" />
            </>
          }
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation={2.2} result="s" />
          <feComponentTransfer in="s" result="a">
            <feFuncA type="discrete" tableValues="0 0 1 1 1 1" />
          </feComponentTransfer>
          <feMorphology in="a" operator="dilate" radius={whiteEcho ? 2.5 : 2} result="d" />
          <feComposite in="d" in2="a" operator="out" result="ring" />
          <feGaussianBlur in="ring" stdDeviation={0.4} result="q" />
          <feFlood floodColor="#ffffff" />
          <feComposite in2="q" operator="in" />
        </SilhouetteFx>
      )}

      {/* The glint: one thin four-point star on the echo's crown. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id="goalechoflash-h" gradientUnits="userSpaceOnUse" x1={gx - ray} y1={gy} x2={gx + ray} y2={gy}>
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="goalechoflash-v" gradientUnits="userSpaceOnUse" x1={gx} y1={gy - ray * 0.62} x2={gx} y2={gy + ray * 0.62}>
            <stop offset="0" stopColor="#fff" stopOpacity={0} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="goalechoflash-c">
            <stop offset="0" stopColor="#fff" stopOpacity={1} />
            <stop offset="0.3" stopColor="#fff" stopOpacity={0.55} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={gx} cy={gy} r={14 * k} fill="url(#goalechoflash-c)" />
        <rect x={gx - ray} y={gy - 0.9 * k} width={ray * 2} height={1.8 * k} fill="url(#goalechoflash-h)" />
        <rect x={gx - 0.9 * k} y={gy - ray * 0.62} width={1.8 * k} height={ray * 1.24} fill="url(#goalechoflash-v)" />
      </svg>

      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />
      {/* A little more ground under the small type, so "GOAL" never sits on his kit. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: kTop - 160 * k, height: 260 * k, background: `linear-gradient(to bottom, transparent, ${deep}b3 62%, ${deep}d9)` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: kTop, ...caps(kSize, K_TRACK, 300) }}>{kicker}</div>
      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
