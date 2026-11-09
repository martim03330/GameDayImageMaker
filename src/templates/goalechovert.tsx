import { Film } from "./fx";
import { CAP, CentreLogo, caps, centredFoot, EchoLine, echoTones, FootFade, goalBox, lightEm, M, Player, plain, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Goal echo vert: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and, from Vertname, his surname set vertically
 * (reading bottom to top) up the free edge in tall, thin, wide-tracked ExtraLight capitals. "GOAL" small and
 * wide-tracked at the top over his side; the fixture (home first, names exactly as stored, no score) and the
 * competition small at the foot.
 */
export function Goalechovert({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo } = echoTones(data);
  // He stands on params.side; his name runs up the other edge.
  const right = params.side !== "left";

  /* ---- foot: fixture and competition (his name is the vertical) ---- */
  const foot = centredFoot(data, story, k, { name: false });

  /* ---- the name, vertical: the band's height, never thicker than a slim column ---- */
  const name = (content.lastName || content.firstName || "").toUpperCase().normalize("NFC");
  const vTop = (story ? STORY_TOP : 76) + (params.textY ?? 0);
  const vBottom = foot.top - (story ? 80 : 60);
  const L = vBottom - vTop;
  const chars = plain(name).length;
  const base = lightEm(name);
  const MIN_T = 0.14;
  let size = Math.min((story ? 150 : 132) * ts, L / Math.max(1, base + (chars - 1) * MIN_T));
  // Short names get their tracking opened up (to 0.6em) so they still run most of the height.
  const track = chars > 1 ? Math.max(MIN_T, Math.min(0.6, (L / size - base) / (chars - 1))) : 0;
  const len = (base + (chars - 1) * track) * size;
  if (len > L) size *= L / len;
  const nameLen = Math.min(L, (base + (chars - 1) * track) * size);
  const capH = size * CAP;
  const hasMarks = name !== plain(name).join("");
  const markRoom = hasMarks ? size * 0.2 : 0;
  // Rotated -90°: glyph tops (and accents) face left. Left edge: baseline is the column's inner edge.
  const textX = right ? M + markRoom + capH : CANVAS_W - M;
  const inner = right ? textX : CANVAS_W - M - capH - markRoom;
  const textBottom = vTop + nameLen + (L - nameLen) / 2;

  /* ---- the free side: the player, "GOAL" above him ---- */
  const free = right ? [inner + 36, CANVAS_W] : [0, inner - 36];
  const cx = (free[0] + free[1]) / 2;
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.55;
  const kSize = Math.max(13 * k, Math.min(19 * k, ((free[1] - free[0]) * 0.8) / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const kTop = vTop;
  const clipTop = kTop + kSize + 34 * k;
  const box = goalBox(data, { faceX: cx, faceTop: story ? 440 : 290, cx, maxW: (free[1] - free[0]) * (story ? 1.05 : 1.08), story, minHead: clipTop + (story ? 26 : 18) });
  // The echo slips away from the name, never into it.
  const dx = (right ? 1 : -1) * 26 * k;
  const dy = -26 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 48% at ${right ? 60 : 40}% ${story ? 38 : 40}%, ${lift}, ${deep} 82%)` }} />

      <EchoLine id="goalechovert" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={clipTop} color={echo} width={story ? 2.4 : 2} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* His name, vertical, bottom to top, up the free edge. */}
      {name && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text transform={`translate(${textX} ${textBottom}) rotate(-90)`} fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={200} fontSize={size} letterSpacing={`${track}em`} fill="rgba(255,255,255,.9)">
            {name}
          </text>
        </svg>
      )}

      {/* "GOAL", small, over his side. */}
      <div style={{ position: "absolute", left: free[0], width: free[1] - free[0], top: kTop, ...caps(kSize, K_TRACK, 500) }}>{kicker}</div>

      {foot.node}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
