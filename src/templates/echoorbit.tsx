import { Film } from "./fx";
import { EchoFigure, echoFoot, EchoLogo, echoSetup, type EchoSetup } from "./echotitle";
import { placeByFace } from "./outline";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

/** Inter caps (500), roughly, per glyph with the tracking (em). */
const capsEm = (t: string, tracking: number) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.:]/.test(c) ? 0.3 : c === "M" || c === "W" ? 0.9 : 0.7) + tracking, 0);

export type Ring = { cx: number; cy: number; R: number };

/**
 * The ring around his head and shoulders (and a raised fist: the cutout's top), centred under his chin. The
 * ring's top sits at `ringTop`; the cutout's top (and its echo, `echoUp` higher) stays clear inside it. Places
 * the player (face centred on `faceX`), shrinking him if the ring would grow past `maxR`.
 */
export function placeInRing(data: RenderData, o: { faceX: number; ringTop: number; sizes: Record<string, number>; k: number; echoUp: number; maxR: number; minBottom: number; figure?: boolean }) {
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const p = data.params;
  const air = o.echoUp + 46 * o.k;
  const reach = face[1] + face[3];
  // His natural size (placeByFace also stretches him to reach the canvas foot; here the deep fade covers that).
  const base = placeByFace(data, o.faceX, o.ringTop + 300 * o.k, o.sizes);
  const radius = (h: number) => Math.max(1.3 * face[3] * h + 40 * o.k, reach * h + air);
  const at = (scale: number) => {
    const height = base.height * scale;
    const width = base.width * scale;
    const R = radius(height);
    const faceTop = o.ringTop + R - face[3] * height;
    const box = { left: o.faceX - width * (face[0] + face[2] / 2) + (p.playerX ?? 0), top: faceTop - face[1] * height + (p.playerY ?? 0), width, height, faceH: face[3] * height };
    return { box, R };
  };
  let scale = Math.min(1, (o.maxR - air) / Math.max(1, reach * base.height));
  // Never so small that the cutout's foot shows above the fade.
  for (let i = 0; i < 40 && scale < 1; i++) {
    const { box } = at(scale);
    if (box.top + box.height >= o.minBottom) break;
    scale = Math.min(1, scale * 1.03);
  }
  const { box, R } = at(scale);
  // Centred on his face, or (figure) between his face and the middle of the cutout, to take in a raised fist.
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const ring: Ring = { cx: o.figure ? (faceCx + box.left + box.width / 2) / 2 : faceCx, cy: o.ringTop + R, R };
  return { box, ring };
}

/**
 * The ring in halves: the back (upper) half behind him, the front (lower) half over his body, with one short
 * run of tiny spaced caps set outside the top of the ring, centred above his head.
 */
export function RingHalf({ id, ring, H, half, color, text, size, track, width = 1.6 }: { id: string; ring: Ring; H: number; half: "back" | "front"; color: string; text?: string; size: number; track: number; width?: number }) {
  const { cx, cy, R } = ring;
  const rt = R + size * 0.55;
  return (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <path d={half === "back" ? `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}` : `M ${cx - R} ${cy} A ${R} ${R} 0 0 0 ${cx + R} ${cy}`} fill="none" stroke={color} strokeWidth={width} />
      {half === "back" && text && (
        <>
          <path id={`${id}-arc`} d={`M ${cx - rt} ${cy} A ${rt} ${rt} 0 0 1 ${cx + rt} ${cy}`} fill="none" />
          <text fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={500} fontSize={size} letterSpacing={size * track} fill="#ffffff">
            <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
              {text}
            </textPath>
          </text>
        </>
      )}
    </svg>
  );
}

/** The ring's line: the echo's own tone, so ring and echo read as one drawing. */
export const ringInk = (s: Pick<EchoSetup, "white" | "echo">) => (s.white ? "rgba(255,255,255,.75)" : s.echo);

/** Size of the arc caps so the run stays within ~70° of the top. */
export function arcSize(text: string, R: number, track: number, max: number, min: number) {
  const span = R * 1.55;
  return Math.max(min, Math.min(max, span / Math.max(1, capsEm(text, track))));
}

/**
 * Echo orbit: echoline's player and hairline echo, and one hairline ring around his head and shoulders in the
 * echo's own tone — its back half behind him, its front half across his chest — with the title, date and
 * kick-off set in tiny spaced caps on its arc above his head. Crests, fixture and ground small at the foot.
 */
export function Echoorbit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 11);
  const f = matchFacts(data);
  const foot = echoFoot(data, s, [titleCase(f.venue)]);

  /* ---- the run on the arc ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const text = [title, niceDate(content.date).toUpperCase(), f.time].filter(Boolean).join("  ·  ");
  const TRACK = 0.36;

  /* ---- the player, centred; the ring around his head ---- */
  const sizes = s.story ? { chest: 330, waist: 280, knees: 220, full: 168 } : { chest: 236, waist: 200, knees: 160, full: 124 };
  const size0 = Math.max(11, 13.5 * s.k) * s.ts;
  const ringTop = (s.story ? STORY_TOP + size0 * 1.6 + 6 : 64 + size0 * 1.6 + 10) + (params.textY ?? 0);
  const { box, ring } = placeInRing(data, { faceX: 540, ringTop, sizes, k: s.k, echoUp: 34 * s.k, maxR: s.story ? 450 : 400, minBottom: s.story ? 1600 : 1290 });
  const size = arcSize(text, ring.R, TRACK, size0, s.story ? 14 : 11);
  const ink = ringInk(s);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: "#fff" }}>
      <EchoFigure data={data} s={s} box={box} id="echoorbit" light={[50, ((ring.cy - 60) / s.H) * 100]} behind={<RingHalf id="echoorbit" ring={ring} H={s.H} half="back" color={ink} text={text} size={size} track={TRACK} />} />
      <RingHalf id="echoorbit-f" ring={ring} H={s.H} half="front" color={ink} size={size} track={TRACK} />

      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
