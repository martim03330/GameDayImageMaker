import { frameOf } from "./natfree4";
import { ObjectRow } from "./natfree23";
import { dropped } from "./natfree26";
import { clubInk } from "./trend2";
import type { RenderData } from "./types";

const DARK = "#1b1f26";
const SHADOW = "drop-shadow(0 8px 18px rgba(0,0,0,.45))";

/* ---------------- Alarm clock ---------------- */

/** A twin-bell alarm clock — wake up, it's matchday: a body in his club's colour, white face, dark bells, hammer and feet. */
function AlarmClock({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 140;
  return (
    <svg width={w} height={140 * s} viewBox="0 0 140 140" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 34 118 L 22 134 M 106 118 L 118 134" stroke={DARK} strokeWidth={9} strokeLinecap="round" />
      <path d="M 14 40 A 22 22 0 0 1 46 12 Z" fill={DARK} stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 126 40 A 22 22 0 0 0 94 12 Z" fill={DARK} stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 70 18 L 70 8 M 58 8 L 82 8" stroke={DARK} strokeWidth={6} strokeLinecap="round" />
      <circle cx={70} cy={76} r={52} fill={ink} stroke="#fff" strokeWidth={4} />
      <circle cx={70} cy={76} r={40} fill="#f7f7f4" />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1={70 + Math.sin((a * Math.PI) / 180) * 30} y1={76 - Math.cos((a * Math.PI) / 180) * 30} x2={70 + Math.sin((a * Math.PI) / 180) * 36} y2={76 - Math.cos((a * Math.PI) / 180) * 36} stroke={DARK} strokeWidth={5} strokeLinecap="round" />
      ))}
      <line x1={70} y1={76} x2={70} y2={50} stroke={DARK} strokeWidth={6} strokeLinecap="round" />
      <line x1={70} y1={76} x2={88} y2={86} stroke={ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={70} cy={76} r={5} fill={DARK} />
    </svg>
  );
}

/** Natural · despertador (matchday): a twin-bell alarm clock in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground. */
export function Natalarmclock({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 180 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w} gap={34 * k}>
      <AlarmClock data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Airliner ---------------- */

/** The away trip: an airliner seen from above, climbing — white with a dark outline, the tail and engines in his club's colour. */
function Plane({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 150;
  return (
    <svg width={w} height={150 * s} viewBox="0 0 150 150" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <g transform="rotate(40 75 75)">
        <path d="M 75 6 Q 84 6 84 22 L 84 60 L 142 92 L 142 104 L 84 86 L 84 120 L 104 134 L 104 144 L 75 136 L 46 144 L 46 134 L 66 120 L 66 86 L 8 104 L 8 92 L 66 60 L 66 22 Q 66 6 75 6 Z" fill="#f4f5f7" stroke={DARK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 46 134 L 66 120 L 66 128 L 75 136 L 84 128 L 84 120 L 104 134 L 104 144 L 75 136 L 46 144 Z" fill={ink} />
        <rect x={34} y={78} width={12} height={22} rx={5} fill={ink} stroke={DARK} strokeWidth={2.6} />
        <rect x={104} y={78} width={12} height={22} rx={5} fill={ink} stroke={DARK} strokeWidth={2.6} />
        <path d="M 70 18 Q 75 13 80 18 L 80 26 L 70 26 Z" fill={DARK} />
      </g>
    </svg>
  );
}

/** Natural · avião (matchday): an airliner with the tail in his club's colour — the away trip — beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Natplane({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 190 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w} gap={30 * k}>
      <Plane data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Traffic light ---------------- */

/** A traffic light on green — go: a housing in his club's colour edged in white, red and amber dark, the green lamp lit and glowing. */
function TrafficLight({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 80;
  return (
    <svg width={w} height={170 * s} viewBox="0 0 80 170" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={34} y={136} width={12} height={32} fill={DARK} stroke="#fff" strokeWidth={2.6} />
      <rect x={6} y={4} width={68} height={136} rx={16} fill={ink} stroke="#fff" strokeWidth={4} />
      <circle cx={40} cy={30} r={15} fill="#5a1d1d" stroke={DARK} strokeWidth={3} />
      <circle cx={40} cy={72} r={15} fill="#5a4a1a" stroke={DARK} strokeWidth={3} />
      <circle cx={40} cy={114} r={22} fill="#3ddc84" opacity={0.35} />
      <circle cx={40} cy={114} r={15} fill="#5dff9e" stroke={DARK} strokeWidth={3} />
      <circle cx={35} cy={109} r={4.5} fill="#fff" opacity={0.8} />
    </svg>
  );
}

/** Natural · semáforo (matchday): a traffic light on green in his club's colour — go — beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Nattrafficlight({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 88 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (170 / 80)} gap={44 * k}>
      <TrafficLight data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Boxing glove ---------------- */

/** A boxing glove in his club's colour edged in white — a knockout of a goal: the padded fist, the thumb, a white cuff with a stripe. */
function Glove({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 140;
  return (
    <svg width={w} height={120 * s} viewBox="0 0 140 120" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={4} y={34} width={36} height={58} rx={8} fill="#f4f5f7" stroke={DARK} strokeWidth={3.4} />
      <rect x={4} y={56} width={36} height={12} fill={ink} />
      <path d="M 38 28 Q 46 6 82 6 Q 136 6 136 56 Q 136 104 88 112 Q 52 116 38 96 Z" fill={ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 54 78 Q 50 58 70 56 Q 92 56 96 72 Q 98 84 84 88 Q 66 90 54 78 Z" fill={ink} stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 70 22 Q 98 16 118 34" fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
}

/** Golo natural · luva de boxe (goal): a boxing glove in his club's colour — a knockout — beside GOAL, his full name and exact club. */
export function Goalnatboxing({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (120 / 140)} gap={30 * k} goal>
      <Glove data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Gem ---------------- */

/** A cut gem in his club's colour, thick white facets and two sparkles — a gem of a goal. */
function Gem({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 140;
  const star = (cx: number, cy: number, r: number) => `M ${cx} ${cy - r} L ${cx + r * 0.28} ${cy - r * 0.28} L ${cx + r} ${cy} L ${cx + r * 0.28} ${cy + r * 0.28} L ${cx} ${cy + r} L ${cx - r * 0.28} ${cy + r * 0.28} L ${cx - r} ${cy} L ${cx - r * 0.28} ${cy - r * 0.28} Z`;
  return (
    <svg width={w} height={120 * s} viewBox="0 0 140 120" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 34 14 L 106 14 L 132 44 L 70 114 L 8 44 Z" fill={ink} stroke="#fff" strokeWidth={4.4} strokeLinejoin="round" />
      <path d="M 8 44 L 132 44 M 34 14 L 50 44 L 70 14 L 90 44 L 106 14 M 50 44 L 70 114 L 90 44" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 34 14 L 70 14 L 50 44 L 8 44 Z" fill="#fff" opacity={0.28} />
      <path d={star(126, 12, 12)} fill="#fff" />
      <path d={star(14, 92, 8)} fill="#fff" />
    </svg>
  );
}

/** Golo natural · gema (goal): a cut gem in his club's colour — a gem of a goal — beside GOAL, his full name and exact club. */
export function Goalnatgem({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (120 / 140)} gap={30 * k} goal>
      <Gem data={d} w={w} />
    </ObjectRow>
  );
}
