/* eslint-disable @next/next/no-img-element */
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { ObjectRow } from "./natfree23";
import { dropped } from "./natfree26";
import { clubInk } from "./trend2";
import type { RenderData } from "./types";

const DARK = "#1b1f26";
const SHADOW = "drop-shadow(0 8px 18px rgba(0,0,0,.45))";
const HALO = "drop-shadow(0 0 1.5px rgba(255,255,255,.8))";

const ourCrest = (data: RenderData) => {
  const fx = natFixture(data);
  return (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
};

/* ---------------- Battery ---------------- */

/** A battery fully charged for the game: white shell edged dark, four bars in his club's colour, a white bolt over them. */
function Battery({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 170;
  return (
    <svg width={w} height={84 * s} viewBox="0 0 170 84" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={4} y={4} width={146} height={76} rx={14} fill="#f4f5f7" stroke={DARK} strokeWidth={4} />
      <rect x={150} y={26} width={14} height={32} rx={4} fill={DARK} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={14 + i * 33.5} y={14} width={27} height={56} rx={5} fill={ink} />
      ))}
      <path d="M 86 10 L 64 46 L 80 46 L 72 74 L 100 36 L 84 36 L 94 10 Z" fill="#fff" stroke={DARK} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

/** Natural · bateria (matchday): a battery fully charged in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground. */
export function Natbattery({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 230 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (84 / 170)} gap={30 * k}>
      <Battery data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Hourglass ---------------- */

/** An hourglass counting down to kick-off: dark caps and posts, white glass, the sand in his club's colour mostly run through. */
function Hourglass({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  return (
    <svg width={w} height={150 * s} viewBox="0 0 100 150" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 18 14 L 82 14 Q 82 52 54 75 Q 82 98 82 136 L 18 136 Q 18 98 46 75 Q 18 52 18 14 Z" fill="rgba(235,244,252,.92)" stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 34 44 L 66 44 Q 62 58 50 68 Q 38 58 34 44 Z" fill={ink} />
      <path d="M 50 70 L 50 104" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M 22 132 Q 26 104 50 100 Q 74 104 78 132 Z" fill={ink} />
      <rect x={4} y={2} width={92} height={14} rx={5} fill={DARK} stroke="#fff" strokeWidth={3} />
      <rect x={4} y={134} width={92} height={14} rx={5} fill={DARK} stroke="#fff" strokeWidth={3} />
      <rect x={8} y={16} width={7} height={118} fill={DARK} stroke="#fff" strokeWidth={2} />
      <rect x={85} y={16} width={7} height={118} fill={DARK} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

/** Natural · ampulheta (matchday): an hourglass with the sand in his club's colour, counting down, beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Nathourglass({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 120 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * 1.5} gap={40 * k}>
      <Hourglass data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Crown ---------------- */

/** A bold crown in his club's colour edged in white, white balls on its points and his club's crest on the band. */
function Crown({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 150;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 110 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={110 * s} viewBox="0 0 150 110" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 12 30 L 42 58 L 75 16 L 108 58 L 138 30 L 128 84 L 22 84 Z" fill={ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
        <rect x={20} y={82} width={110} height={24} rx={5} fill={ink} stroke="#fff" strokeWidth={4} />
        {[
          [12, 28],
          [75, 13],
          [138, 28],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={9} fill="#fff" />
        ))}
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 60 * s, top: 46 * s, width: 30 * s, height: 32 * s, objectFit: "contain", filter: HALO }} />}
    </div>
  );
}

/** Golo natural · coroa (goal): a crown in his club's colour with the crest on it beside GOAL, his full name and exact club. */
export function Goalnatcrown({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (110 / 150)} gap={32 * k} goal>
      <Crown data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Goal siren ---------------- */

/** The goal siren: a beacon dome in his club's colour on a dark base, a white highlight, bold rays of light either side. */
function Siren({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 160;
  const rays = [
    [26, 30, 8, 18],
    [20, 62, 2, 62],
    [134, 30, 152, 18],
    [140, 62, 158, 62],
    [80, 8, 80, -8],
  ];
  return (
    <svg width={w} height={112 * s} viewBox="0 0 160 112" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      {rays.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      ))}
      <path d="M 40 86 L 40 58 A 40 40 0 0 1 120 58 L 120 86 Z" fill={ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 56 56 A 24 24 0 0 1 74 36" fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" />
      <rect x={28} y={84} width={104} height={24} rx={6} fill={DARK} stroke="#fff" strokeWidth={3.4} />
    </svg>
  );
}

/** Golo natural · sirene (goal): the goal siren lit in his club's colour beside GOAL, his full name and exact club. */
export function Goalnatsiren({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 210 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (112 / 160)} gap={30 * k} goal>
      <Siren data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Party popper ---------------- */

/** A party popper going off: a striped cone in his club's colour and white, a burst of chunky confetti and streamers. */
function Popper({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 150;
  const bits: [number, number, number, string][] = [
    [96, 18, 20, "#fff"],
    [124, 34, -30, ink],
    [110, 60, 45, "#ffd23e"],
    [138, 70, 10, "#fff"],
    [76, 10, 60, "#ffd23e"],
  ];
  return (
    <svg width={w} height={120 * s} viewBox="0 0 150 120" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 70 44 Q 92 30 88 8" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <path d="M 80 54 Q 110 46 132 52" fill="none" stroke="#ffd23e" strokeWidth={6} strokeLinecap="round" />
      {bits.map(([x, y, r, c], i) => (
        <rect key={i} x={x - 6} y={y - 9} width={12} height={18} rx={3} fill={c} stroke={DARK} strokeWidth={2} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <path d="M 8 114 L 44 40 L 82 78 Z" fill={ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      <path d="M 26 77 L 59 100 M 36 57 L 68 83" stroke="#fff" strokeWidth={8} />
      <ellipse cx={63} cy={59} rx={27} ry={10} transform="rotate(45 63 59)" fill={DARK} stroke="#fff" strokeWidth={3} />
    </svg>
  );
}

/** Golo natural · lança-confetes (goal): a party popper in his club's colour going off beside GOAL, his full name and exact club. */
export function Goalnatpopper({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (120 / 150)} gap={30 * k} goal>
      <Popper data={d} w={w} />
    </ObjectRow>
  );
}
