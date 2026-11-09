/* eslint-disable @next/next/no-img-element */
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { ObjectRow } from "./natfree23";
import { clubInk } from "./trend2";
import type { RenderData } from "./types";

const DARK = "#1b1f26";
const SHADOW = "drop-shadow(0 8px 18px rgba(0,0,0,.45))";

/** His own club's crest (the side he plays for in this game). */
const ourCrest = (data: RenderData) => {
  const fx = natFixture(data);
  return (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
};

/* ---------------- Team coach ---------------- */

/** The team coach seen from the side: a body in his club's colour edged in white, a row of windows, a white stripe, two dark wheels. */
function Coach({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 160;
  return (
    <svg width={w} height={92 * s} viewBox="0 0 160 92" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 4 18 Q 4 6 16 6 L 140 6 Q 152 6 154 18 L 156 64 Q 156 72 148 72 L 12 72 Q 4 72 4 64 Z" fill={ink} stroke="#fff" strokeWidth={3.6} strokeLinejoin="round" />
      {[12, 42, 72, 102].map((x) => (
        <rect key={x} x={x} y={15} width={25} height={24} rx={4} fill="#e6eef6" />
      ))}
      <path d="M 132 15 L 144 15 Q 149 15 150 21 L 151 46 L 132 46 Z" fill="#e6eef6" />
      <rect x={4} y={50} width={152} height={7} fill="#fff" />
      {[36, 122].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={74} r={14} fill={DARK} stroke="#fff" strokeWidth={3} />
          <circle cx={cx} cy={74} r={5.5} fill="#c9ced4" />
        </g>
      ))}
    </svg>
  );
}

/** Natural · autocarro (matchday): the team coach in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground — on the road to the game. */
export function Natbus({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 250 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (92 / 160)} gap={30 * k}>
      <Coach data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Kit bag ---------------- */

/** A kit bag (duffel) in his club's colour: white straps, a thick zip along the top and his club's crest on the side. */
function KitBag({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 150;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 100 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={100 * s} viewBox="0 0 150 100" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 52 34 C 52 8, 98 8, 98 34" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
        <rect x={6} y={30} width={138} height={66} rx={30} fill={ink} stroke="#fff" strokeWidth={3.6} />
        <path d="M 30 42 L 120 42" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <rect x={112} y={38} width={12} height={9} rx={2} fill="#fff" />
        <path d="M 22 36 Q 12 63 22 90 M 128 36 Q 138 63 128 90" fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} />
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 57 * s, top: 52 * s, width: 36 * s, height: 36 * s, objectFit: "contain", filter: "drop-shadow(0 0 1.5px rgba(255,255,255,.8))" }} />}
    </div>
  );
}

/** Natural · saco de equipamento (matchday): his kit bag with the club crest beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Natkitbag({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 230 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (100 / 150)} gap={30 * k}>
      <KitBag data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Flash-interview microphone ---------------- */

/** The flash-interview microphone: a dark grille head, a cube flag in his club's colour with his crest, a dark handle. */
function Mic({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 160 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={160 * s} viewBox="0 0 100 160" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 40 100 L 60 100 L 56 156 Q 50 160 44 156 Z" fill={DARK} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
        <circle cx={50} cy={32} r={28} fill="#3a4049" stroke="#fff" strokeWidth={3.4} />
        <circle cx={50} cy={32} r={19} fill="none" stroke="#5c6470" strokeWidth={5} />
        <path d="M 34 20 Q 42 10 54 9" fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
        <rect x={18} y={56} width={64} height={48} rx={5} fill={ink} stroke="#fff" strokeWidth={3.4} />
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 34 * s, top: 62 * s, width: 32 * s, height: 36 * s, objectFit: "contain", filter: "drop-shadow(0 0 1.5px rgba(255,255,255,.8))" }} />}
    </div>
  );
}

/** Golo natural · microfone (goal): the flash-interview mic with his club's crest on its flag beside GOAL, his full name and exact club. */
export function Goalnatmic({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 140 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * 1.6} gap={40 * k} goal>
      <Mic data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Stopwatch ---------------- */

/** A referee's stopwatch: crown and side button, a white face ringed in his club's colour, twelve bold ticks and one hand. */
function Stopwatch({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  const ticks = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);
  return (
    <svg width={w} height={118 * s} viewBox="0 0 100 118" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={41} y={2} width={18} height={12} rx={3} fill="#e9ecef" stroke={DARK} strokeWidth={3} />
      <rect x={46} y={12} width={8} height={10} fill={DARK} />
      <g transform="rotate(40 50 70)">
        <rect x={45} y={16} width={10} height={9} rx={2} fill="#e9ecef" stroke={DARK} strokeWidth={2.6} />
      </g>
      <circle cx={50} cy={70} r={45} fill={ink} stroke="#fff" strokeWidth={3.6} />
      <circle cx={50} cy={70} r={36} fill="#f7f7f4" />
      {ticks.map((a, i) => (
        <line key={i} x1={50 + Math.sin(a) * 29} y1={70 - Math.cos(a) * 29} x2={50 + Math.sin(a) * (i % 3 ? 33 : 34)} y2={70 - Math.cos(a) * (i % 3 ? 33 : 34)} stroke={DARK} strokeWidth={i % 3 ? 3 : 4.4} strokeLinecap="round" />
      ))}
      <line x1={50} y1={70} x2={67} y2={50} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <circle cx={50} cy={70} r={5} fill={DARK} />
    </svg>
  );
}

/** Golo natural · cronómetro (goal): the referee's stopwatch ringed in his club's colour beside GOAL, his full name and exact club. */
export function Goalnatstopwatch({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 170 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * 1.18} gap={36 * k} goal>
      <Stopwatch data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Air horn ---------------- */

/** A supporters' air horn: a can in his club's colour edged in white, a dark cap and a big white trumpet, three bold sound arcs. */
function AirHorn({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 170;
  return (
    <svg width={w} height={110 * s} viewBox="0 0 170 110" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={8} y={44} width={48} height={62} rx={9} fill={ink} stroke="#fff" strokeWidth={3.6} />
      <rect x={14} y={30} width={36} height={16} rx={3} fill={DARK} stroke="#fff" strokeWidth={2.6} />
      <path d="M 42 30 L 60 22 L 124 4 Q 132 2 132 10 L 132 62 Q 132 70 124 68 L 60 44 L 42 40 Z" fill="#f4f5f7" stroke={DARK} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 90 16 L 90 56" stroke={DARK} strokeOpacity={0.2} strokeWidth={4} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${142 + i * 9} ${22 - i * 6} Q ${150 + i * 11} 36, ${142 + i * 9} ${50 + i * 6}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      ))}
    </svg>
  );
}

/** Golo natural · buzina (goal): the supporters' air horn in his club's colour, sounding, beside GOAL, his full name and exact club. */
export function Goalnathorn({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 230 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (110 / 170)} gap={30 * k} goal>
      <AirHorn data={data} w={w} />
    </ObjectRow>
  );
}
