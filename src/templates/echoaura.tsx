import { luminance, shade, vivid } from "@/lib/color";
import { keepHead } from "./doubleline";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { capsStyle, echoFoot, EchoFigure, EchoLogo, echoSetup } from "./echotitle";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_W, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** The second aura tone: the club accent when it reads on the deep ground, else a lighter step of the club colour. */
function second(data: RenderData, club: string): string {
  let b = vivid(data.params.accent);
  const bad = Math.abs(luminance(b) - luminance(club)) < 0.04 || luminance(b) > 0.6 || luminance(b) < 0.04;
  if (bad) b = shade(club, 0.38);
  return b;
}

/**
 * Aura glow, borrowed from `aura`: two soft blurred blooms in the club colours around his shoulders and one
 * warm neutral light just behind his head — no hard edge anywhere. (cx, cy) is his upper chest; `lean` (±1)
 * pulls the second bloom towards the side the echo leans to, so glow and line travel together.
 */
export function AuraGlow({ data, club, H, cx, cy, scale, lean, warm = false }: { data: RenderData; club: string; H: number; cx: number; cy: number; scale: number; lean: number; warm?: boolean }) {
  const b = second(data, club);
  const main = luminance(club) < 0.1 ? shade(club, 0.35) : club;
  const blob = (x: number, y: number, w: number, h: number, c: string, o: number) => (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: "50%", background: c, opacity: o }} />
  );
  const w = 640 * scale;
  // The goal light: peach on warm clubs (as in goalaura), a pale step of the club colour on cool ones (peach greys a blue).
  const rgb = [1, 3, 5].map((i) => parseInt(main.slice(i, i + 2), 16) || 0);
  const light = rgb[0] >= rgb[2] ? "#ffc58a" : shade(main, 0.55);
  return (
    <div data-bleed style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: H, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: -160, filter: `blur(${Math.round(96 * scale)}px)` }}>
        <div style={{ position: "absolute", left: 160, top: 160, width: CANVAS_W, height: H }}>
          {blob(cx - lean * 40 * scale, cy + 60 * scale, w * 1.15, w * 1.25, main, 0.5)}
          {blob(cx + lean * 170 * scale, cy - 70 * scale, w * 0.72, w * 0.8, b, 0.32)}
          {!warm && blob(cx, cy - 40 * scale, w * 0.55, w * 0.6, "#f3eee8", 0.24)}
        </div>
      </div>
      {/* Goal: a warm light screened over the club bloom (it brightens it instead of greying it). */}
      {warm && (
        <div style={{ position: "absolute", inset: -160, filter: `blur(${Math.round(90 * scale)}px)`, mixBlendMode: "screen" }}>
          <div style={{ position: "absolute", left: 160, top: 160, width: CANVAS_W, height: H }}>{blob(cx + lean * 30 * scale, cy - 100 * scale, w * 0.85, w * 0.85, light, 0.34)}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Echo aura: echoline's player and hairline echo on the deep club ground, with aura's soft light behind him —
 * a quiet bloom of the club colours and a warm core around his shoulders — and the echo drawn crisp on top
 * of the glow, so the soft light and the sharp line read together. Title small at the top; crests, fixture
 * and date · kick-off · ground small at the foot.
 */
export function Echoaura({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s0 = echoSetup(data, 11);
  // On the glow the echo needs more light than on the bare ground: white, or a pale club tint.
  const s = { ...s0, echo: s0.white ? "rgba(255,255,255,.82)" : shade(s0.club, luminance(s0.club) < 0.12 ? 0.62 : 0.5) };
  const f = matchFacts(data);
  const k = s.k;

  /* ---- title ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * k, Math.min((s.story ? 22 : 20) * k, 700 / Math.max(1, capsEm(title, T_TRACK)))) * s.ts;
  const titleTop = (s.story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- player, centred (echoline's placement) ---- */
  // His whole head (hair included) stays clear of the title.
  const box = keepHead(data, s.story ? placeByFace(data, 540, 330, { chest: 420, waist: 330, knees: 240, full: 180 }) : placeByFace(data, 540, 250, { chest: 290, waist: 228, knees: 170, full: 128 }), titleTop + tSize + 30 * k, true);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const cx = box.left + (face[0] + face[2] / 2) * box.width;
  const cy = box.top + face[1] * box.height + box.faceH * 1.7;
  const lean = s.right ? -1 : 1;

  const foot = echoFoot(data, s, [niceDate(content.date), f.time, titleCase(f.venue)]);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <EchoFigure
        data={data}
        s={s}
        box={box}
        id="echoaura"
        clipTop={titleTop + tSize + 34}
        light={[50, 40]}
        behind={<AuraGlow data={data} club={s.club} H={s.H} cx={cx} cy={cy} scale={s.story ? 1.3 : 1} lean={lean} />}
      />

      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...capsStyle(tSize, T_TRACK, 500) }}>{title}</div>
      {foot.el}
      <EchoLogo data={data} s={s} />
      <Film strength={0.2} />
    </div>
  );
}
