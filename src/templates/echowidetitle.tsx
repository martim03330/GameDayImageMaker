import { echoFoot, EchoFigure, EchoLogo, echoSetup } from "./echotitle";
import { Film } from "./fx";
import { matchFacts } from "./strokes";
import { keepHead } from "./doubleline";
import { placeByFace } from "./outline";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

const M = 60;
/** Horizontal stretch of the thin capitals: Inter has no width axis, so the line is drawn extended. */
export const STRETCH = 1.3;
/** Tracking between the thin capitals, in em (before the stretch). */
export const TRACK = 0.34;
export const CAP = 0.727;

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter Thin capitals, advance per 1px of font size (approximate). */
export const thinEm = (t: string) =>
  plain(t.toUpperCase()).reduce((a, c) => a + (c === " " ? 0.26 : /[\d–-]/.test(c) ? 0.58 : /[IJ]/.test(c) ? 0.26 : c === "M" || c === "W" ? 0.86 : c === "'" ? 0.2 : c === "!" ? 0.28 : 0.66), 0);
/** One part's advance per 1px of font size, tracking and stretch included. */
export const partEm = (t: string) => (thinEm(t) + Math.max(0, [...t].length - 1) * TRACK) * STRETCH;

/** One run of extended thin capitals, exactly `width` wide from `x` (baseline `y`). */
export function WideText({ x, y, width, size, fill, text }: { x: number; y: number; width: number; size: number; fill: string; text: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${STRETCH} 1)`}>
      <text x={0} y={0} textLength={width / STRETCH} lengthAdjust="spacing" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={100} fontSize={size} fill={fill}>
        {text}
      </text>
    </g>
  );
}

/** The title in two parts: between words (MATCH | DAY), else in the middle of the word (GO | AL). */
export function splitWide(title: string): [string, string] | null {
  const words = title.replace(/\b(MATCH|GAME)DAY\b/, "$1 DAY").split(/[\s-]+/).filter(Boolean);
  if (words.length >= 2) {
    let best = 1;
    const diff = (i: number) => Math.abs(thinEm(words.slice(0, i).join(" ")) - thinEm(words.slice(i).join(" ")));
    for (let i = 2; i < words.length; i++) if (diff(i) < diff(best)) best = i;
    return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const chars = [...title];
  if (chars.length < 2) return null;
  const k = Math.ceil(chars.length / 2);
  return [chars.slice(0, k).join(""), chars.slice(k).join("")];
}

/**
 * Echo wide title: echoline's player in natural colour with one hairline echo of his edge, on the deep club
 * ground — and widetitle's one idea: "MATCH  DAY" in ultra-thin extended capitals right across the canvas at
 * his eye line, split so the gap falls exactly on his head (and his echo) — no letter hides — in a quiet
 * club tint behind him. Crests, the fixture and date · kick-off · ground small at the foot.
 */
export function Echowidetitle({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 11);
  const { story, k, H } = s;
  const f = matchFacts(data);
  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  /* ---- the split: MATCH | DAY at one size, the gap exactly on his head (and his echo) ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  let parts = splitWide(title);
  const faceTop = story ? 340 : 262;
  const sizes = story ? { chest: 330, waist: 262, knees: 204, full: 156 } : { chest: 262, waist: 206, knees: 156, full: 120 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const probe = placeByFace(data, 540, faceTop, sizes);
  const fW = face[2] * probe.width;
  const echoDx = (s.right ? -42 : 42) * k;
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
    // His head goes where the gap falls (kept near the centre), then the size re-fits either side.
    faceX = Math.max(400, Math.min(680, M + e0 * size + gapL));
    size = Math.min(size, (faceX - gapL - M) / e0, (CANVAS_W - M - faceX - gapR) / e1);
    if (size < (story ? 50 : 44)) parts = null;
  }
  // No room beside his head: the whole line across the width, above his head.
  if (!parts) size = Math.min(120 * k, (span * 0.9) / STRETCH / Math.max(1, thinEm(title))) * s.ts;
  let box = placeByFace(data, parts ? faceX : 540, faceTop, sizes);
  // The whole line goes above his head: his hair (and its echo) starts below it.
  const wholeBase = (story ? STORY_TOP : 72) + size * CAP + (params.textY ?? 0);
  if (!parts) {
    // His crown (estimated from the face box) set just under the line, up or down.
    const crown = box.top + Math.max(0, face[1] - face[3] * 0.85) * box.height;
    box = keepHead(data, { ...box, top: box.top + wholeBase + 44 * k - crown }, wholeBase + 30 * k);
  }
  const fCx = box.left + (face[0] + face[2] / 2) * box.width;
  const fTop = box.top + face[1] * box.height;
  const fH = face[3] * box.height;
  const eyeY = fTop + fH * 0.42;
  // The band sits across his brow and hair: above the shoulders even when his head is bowed.
  const bandY = fTop + fH * 0.08;
  const leftEnd = fCx - gapL;
  const rightStart = fCx + gapR;
  const capH = size * CAP;
  const minBase = (story ? STORY_TOP : 72) + capH;
  const base = parts ? Math.max(minBase, bandY + capH / 2 + (params.textY ?? 0)) : minBase + (params.textY ?? 0);
  // Each part runs out towards its margin (a little extra tracking, never gaping).
  const fill = (t: string, room: number) => Math.min(room, partEm(t) * size * 1.06);
  const aW = parts ? fill(parts[0], leftEnd - M) : 0;
  const bW = parts ? fill(parts[1], CANVAS_W - M - rightStart) : 0;
  const ink = s.white ? "rgba(255,255,255,.6)" : s.tint;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: s.deep, color: "#ffffff" }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echowidetitle"
        clipTop={parts ? 0 : base + 18 * k}
        light={[(fCx / CANVAS_W) * 100, (eyeY / H) * 100]}
        behind={
          <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
            {parts ? (
              <>
                <WideText x={leftEnd - aW} y={base} width={aW} size={size} fill={ink} text={parts[0]} />
                <WideText x={rightStart} y={base} width={bW} size={size} fill={ink} text={parts[1]} />
              </>
            ) : (
              <WideText x={M} y={base} width={span} size={size} fill={ink} text={title} />
            )}
          </svg>
        }
      />
      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
