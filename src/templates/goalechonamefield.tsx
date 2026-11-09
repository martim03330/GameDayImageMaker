import { shade } from "@/lib/color";
import { BODONI } from "./cover";
import { Film } from "./fx";
import { CentreLogo, caps, footTexts, EchoLine, echoTones, FootFade, goalBox, Player, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Bodoni Moda 500 lowercase: advance widths per 100px (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.5, d: 61.7, e: 52.6, f: 40.2, g: 60.8, h: 60.5, i: 31, j: 31.3, k: 61.6, l: 34.2, m: 87, n: 60.5, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 60.7, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, " ": 25, "-": 36, "'": 21.6 };
const bodEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BOD_W[c] ?? 58) / 100 + tracking, -tracking);

/**
 * Goal echo namefield: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and, from Namefield, his surname set enormous in a
 * thin lowercase Bodoni behind his head, running off both edges, barely lighter than the ground (tone on tone),
 * so his face and the echo read first. "GOAL" and the competition small at the top; his full name and the
 * fixture (home first, names exactly as stored, no score) small at the foot.
 */
export function Goalechonamefield({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { club, deep, lift, echo } = echoTones(data);
  const toRight = params.side !== "left";
  const nameTone = shade(club, -0.6);

  /* ---- top: the kicker, the competition under it ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.55;
  const kSize = Math.max(13 * k, Math.min(19 * k, 700 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const comp = (matchFacts(data).comp || "").trim().toUpperCase();
  const C_TRACK = 0.3;
  const cSize = Math.max(10, Math.min(12 * k, 760 / Math.max(1, capsEm(comp, C_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 76) + (params.textY ?? 0);
  const compTop = titleTop + kSize + 16 * k;
  const clipTop = (comp ? compTop + cSize : titleTop + kSize) + 30 * k;

  /* ---- foot: his name and the fixture (the competition is at the top) ---- */
  const ft = footTexts(data, k);
  const fixBottom = (story ? STORY_BOTTOM - 88 - 64 : CANVAS_H - 150) - (params.textY ?? 0);
  const fixTop = fixBottom - ft.fixSize;
  const nTop = (ft.fixture ? fixTop - 22 * k : fixBottom) - ft.nameSize;
  const footTop = ft.name ? nTop : fixTop;

  /* ---- the player ---- */
  const cx = 540 + (toRight ? 30 : -30);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 500 : 316, cx, maxW: story ? 900 : 880, story, sizes: story ? { chest: 300, waist: 246, knees: 196, full: 158 } : undefined, minHead: clipTop + (story ? 34 : 24) });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceY = box.top + face[1] * box.height;
  const faceH = face[3] * box.height;
  const dx = (toRight ? -1 : 1) * 28 * k;
  const dy = -24 * k;

  /* ---- the surname behind his head ---- */
  const surname = (content.lastName || content.firstName || "").toLowerCase().normalize("NFC");
  const TRACK = -0.02;
  const nameSize = Math.min(story ? 500 : 440, (CANVAS_W * 1.06) / Math.max(1, bodEm(surname, TRACK))) * ts;
  // Baseline a little below his chin: the x-height band runs across his face, ascenders above his head.
  const baseline = Math.min(faceY + faceH * 0.75, footTop - (story ? 160 : 110));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(64% ${story ? 42 : 48}% at 50% ${story ? 38 : 40}%, ${lift}, ${deep} 82%)` }} />

      {/* The surname, tone on tone, running off both edges. */}
      {surname && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" fontFamily={BODONI} fontWeight={500} fontSize={nameSize} letterSpacing={`${TRACK}em`} fill={nameTone}>
            {surname}
          </text>
        </svg>
      )}

      <EchoLine id="goalechonamefield" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={clipTop} color={echo} width={story ? 2.4 : 2} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* Top: kicker, competition. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(kSize, K_TRACK, 500) }}>{kicker}</div>
      {comp && <div style={{ position: "absolute", left: 64, right: 64, top: compTop, ...caps(cSize, C_TRACK, 500, { opacity: 0.6 }) }}>{comp}</div>}

      {ft.name && <div style={{ position: "absolute", left: 64, right: 64, top: nTop, ...caps(ft.nameSize, ft.N_TRACK, 600) }}>{ft.name}</div>}
      {ft.fixture && <div style={{ position: "absolute", left: 64, right: 64, top: fixTop, ...caps(ft.fixSize, ft.F_TRACK, 500, { opacity: 0.86 }) }}>{ft.fixture}</div>}
      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.16} />
    </div>
  );
}
