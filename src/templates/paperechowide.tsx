import { keepHead } from "./doubleline";
import { CAP, partEm, splitWide, STRETCH, thinEm, WideText } from "./echowidetitle";
import { placeByFace } from "./outline";
import { PaperTooth } from "./paperecho";
import { PaperFigure, paperFoot, PaperGround, PaperLogo, paperSetup } from "./paperechoserif";
import { noLogoDrop } from "./shared";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

const M = 60;

/**
 * Paper echo wide: echowidetitle on warm paper — the player in natural colour with a soft shade where he meets
 * the paper and one hairline echo of his edge (deep club or ink), and "MATCH  DAY" in ultra-thin extended
 * capitals right across the canvas at his brow, split so the gap falls exactly on his head and its echo — no
 * letter hides — in the deep club colour behind him. Crests, fixture and date · kick-off · ground in ink.
 */
export function Paperechowide({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = paperSetup(data);
  const { story, k, H } = s;
  const foot = paperFoot(data, s);

  /* ---- the split: MATCH | DAY at one size, the gap exactly on his head (and his echo) ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  let parts = splitWide(title);
  const faceTop = story ? 340 : 262;
  const sizes = story ? { chest: 330, waist: 262, knees: 204, full: 156 } : { chest: 262, waist: 206, knees: 156, full: 120 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const probe = placeByFace(data, 540, faceTop, sizes);
  const fW = face[2] * probe.width;
  const echoDx = (s.right ? -42 : 42) * k;
  const echoDy = -34 * k;
  const pad = 32 * (story ? 1.15 : 1);
  const headHalf = fW * 0.88;
  const gapL = headHalf + pad + (echoDx < 0 ? -echoDx : 0);
  const gapR = headHalf + pad + (echoDx > 0 ? echoDx : 0);
  const span = CANVAS_W - 2 * M;
  let size = 0;
  let faceX = 540;
  if (parts) {
    const [e0, e1] = [partEm(parts[0]), partEm(parts[1])];
    size = Math.min(150 * k * s.ts, (span - gapL - gapR) / (e0 + e1));
    faceX = Math.max(400, Math.min(680, M + e0 * size + gapL));
    size = Math.min(size, (faceX - gapL - M) / e0, (CANVAS_W - M - faceX - gapR) / e1);
    if (size < (story ? 50 : 44)) parts = null;
  }
  if (!parts) size = Math.min(120 * k, (span * 0.9) / STRETCH / Math.max(1, thinEm(title))) * s.ts;
  let box = placeByFace(data, parts ? faceX : 540, faceTop, sizes);
  const wholeBase = (story ? STORY_TOP : 72) + size * CAP + (params.textY ?? 0);
  if (!parts) {
    const crown = box.top + Math.max(0, face[1] - face[3] * 0.85) * box.height;
    box = keepHead(data, { ...box, top: box.top + wholeBase + 44 * k - crown }, wholeBase + 30 * k);
  }
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;
  const eyeY = fTop + fH * 0.42;
  const bandY = fTop + fH * 0.08;
  const leftEnd = fCx - gapL;
  const rightStart = fCx + gapR;
  const capH = size * CAP;
  const minBase = (story ? STORY_TOP : 72) + capH;
  const base = parts ? Math.max(minBase, bandY + capH / 2 + (params.textY ?? 0)) : minBase + (params.textY ?? 0);
  const fill = (t: string, room: number) => Math.min(room, partEm(t) * size * 1.06);
  const aW = parts ? fill(parts[0], leftEnd - M) : 0;
  const bW = parts ? fill(parts[1], CANVAS_W - M - rightStart) : 0;
  const fadeEnd = foot.top - 24 * k;
  const drop = noLogoDrop(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: s.paper, color: s.ink }}>
      <PaperGround s={s} at={[(fCx / CANVAS_W) * 100, ((eyeY + drop) / H) * 100]} />
      {/* Title, player and foot, centred in the story when there is no logo at the foot. */}
      <div style={{ position: "absolute", inset: 0, transform: drop ? `translateY(${drop}px)` : undefined }}>
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          {parts ? (
            <>
              <WideText x={leftEnd - aW} y={base} width={aW} size={size} fill={s.clubInk} text={parts[0]} />
              <WideText x={rightStart} y={base} width={bW} size={size} fill={s.clubInk} text={parts[1]} />
            </>
          ) : (
            <WideText x={M} y={base} width={span} size={size} fill={s.clubInk} text={title} />
          )}
        </svg>

        <PaperFigure
          data={data}
          s={s}
          box={box}
          id="paperechowide"
          dx={echoDx}
          dy={echoDy}
          clipTop={parts ? 0 : base + 18 * k}
          fadeEnd={fadeEnd}
          toLeft={echoDx < 0}
        />

        {foot.el}
      </div>
      <PaperLogo data={data} s={s} />
      <PaperTooth />
    </div>
  );
}
