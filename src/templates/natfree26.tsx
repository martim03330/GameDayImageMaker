/* eslint-disable @next/next/no-img-element */
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { ObjectRow } from "./natfree23";
import { noLogoDrop } from "./shared";
import { clubInk } from "./trend2";
import type { RenderData } from "./types";

const DARK = "#1b1f26";
const SHADOW = "drop-shadow(0 8px 18px rgba(0,0,0,.45))";
const HALO = "drop-shadow(0 0 1.5px rgba(255,255,255,.8))";

/**
 * On a story with no agency logo (hideAgency), the foot space kept for the logo would leave the layout pushed up: the
 * whole layout (type and the photo framed under it) comes down by noLogoDrop, through the same nudge the "move text"
 * adjustment uses.
 */
export function dropped(data: RenderData): RenderData {
  const drop = noLogoDrop(data);
  return drop ? { ...data, params: { ...data.params, textY: (data.params.textY ?? 0) - drop } } : data;
}

/** His own club's crest (the side he plays for in this game). */
const ourCrest = (data: RenderData) => {
  const fx = natFixture(data);
  return (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
};

/* ---------------- Headphones ---------------- */

/** Over-ear headphones in his club's colour, the arrival look of every matchday: a thick white-edged band, big cups with white cushions. */
function Headphones({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 150;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 120 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={120 * s} viewBox="0 0 150 120" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 22 78 L 22 64 A 53 53 0 0 1 128 64 L 128 78" fill="none" stroke="#fff" strokeWidth={17} strokeLinecap="round" />
        <path d="M 22 78 L 22 64 A 53 53 0 0 1 128 64 L 128 78" fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" />
        {[6, 108].map((x) => (
          <g key={x}>
            <rect x={x} y={62} width={36} height={54} rx={14} fill={ink} stroke="#fff" strokeWidth={3.4} />
            <rect x={x === 6 ? x + 26 : x - 6} y={68} width={16} height={42} rx={7} fill={DARK} stroke="#fff" strokeWidth={2.6} />
          </g>
        ))}
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 10 * s, top: 74 * s, width: 22 * s, height: 30 * s, objectFit: "contain", filter: HALO }} />}
    </div>
  );
}

/** Natural · auscultadores (matchday): his arrival headphones in the club colour beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground. */
export function Natheadphones({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (120 / 150)} gap={32 * k}>
      <Headphones data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Dugout ---------------- */

/** The dugout seen from the front: a curved clear roof edged in his club's colour, a row of seats in the club colour, white frame. */
function Dugout({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 170;
  return (
    <svg width={w} height={100 * s} viewBox="0 0 170 100" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 8 96 L 8 34 Q 8 6 40 6 L 130 6 Q 162 6 162 34 L 162 96" fill="rgba(210,232,248,.38)" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      <path d="M 14 34 Q 14 12 40 12 L 130 12 Q 156 12 156 34" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" />
      {[20, 48, 76, 104, 132].map((x) => (
        <g key={x}>
          <rect x={x} y={50} width={20} height={26} rx={5} fill={ink} stroke="#fff" strokeWidth={2.6} />
          <rect x={x - 2} y={74} width={24} height={9} rx={3} fill={ink} stroke="#fff" strokeWidth={2.6} />
        </g>
      ))}
      <rect x={4} y={92} width={162} height={7} rx={3} fill="#fff" />
    </svg>
  );
}

/** Natural · banco de suplentes (matchday): the dugout with a row of seats in the club colour beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Natdugout({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 240 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (100 / 170)} gap={30 * k}>
      <Dugout data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Rocket ---------------- */

/** A rocket — a rocket of a shot: white body edged dark, a window, fins and nose in his club's colour, a bold flame. */
function Rocket({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 140;
  return (
    <svg width={w} height={110 * s} viewBox="0 0 140 110" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <g transform="rotate(-38 70 55)">
        <path d="M 6 55 Q 20 40 28 46 L 28 64 Q 20 70 6 55 Z" fill="#ffb02e" stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
        <path d="M 14 55 Q 22 48 28 51 L 28 59 Q 22 62 14 55 Z" fill="#fff3c4" />
        <path d="M 32 40 L 22 26 L 46 38 Z M 32 70 L 22 84 L 46 72 Z" fill={ink} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
        <path d="M 28 40 L 98 40 Q 122 42 134 55 Q 122 68 98 70 L 28 70 Z" fill="#f4f5f7" stroke={DARK} strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M 104 41 Q 124 44 134 55 Q 124 66 104 69 Z" fill={ink} />
        <circle cx={76} cy={55} r={10} fill="#bfe3ff" stroke={DARK} strokeWidth={3.4} />
      </g>
    </svg>
  );
}

/** Golo natural · foguetão (goal): a rocket with nose and fins in his club's colour — a rocket of a goal — beside GOAL, his full name and exact club. */
export function Goalnatrocket({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 210 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (110 / 140)} gap={28 * k} goal>
      <Rocket data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Lightning bolt ---------------- */

/** A bold lightning bolt in his club's colour edged in white — the strike. */
function Bolt({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 90;
  return (
    <svg width={w} height={140 * s} viewBox="0 0 90 140" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <path d="M 56 4 L 8 78 L 40 78 L 28 136 L 84 52 L 50 52 L 66 4 Z" fill={ink} stroke="#fff" strokeWidth={4.4} strokeLinejoin="round" />
      <path d="M 54 14 L 22 66" stroke="#fff" strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

/** Golo natural · relâmpago (goal): a lightning bolt in his club's colour beside GOAL, his full name and exact club. */
export function Goalnatbolt({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 110 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (140 / 90)} gap={40 * k} goal>
      <Bolt data={d} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Heart ---------------- */

/** The heart the scorer makes with his hands: a bold heart in his club's colour edged in white, his club's crest in it. */
function Heart({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 120;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 108 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={108 * s} viewBox="0 0 120 108" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 60 104 C 20 76, 4 56, 4 32 C 4 14, 18 4, 33 4 C 46 4, 55 12, 60 22 C 65 12, 74 4, 87 4 C 102 4, 116 14, 116 32 C 116 56, 100 76, 60 104 Z" fill={ink} stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
        <path d="M 20 28 Q 22 16 34 14" fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={4.4} strokeLinecap="round" />
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 40 * s, top: 28 * s, width: 40 * s, height: 44 * s, objectFit: "contain", filter: HALO }} />}
    </div>
  );
}

/** Golo natural · coração (goal): the scorer's heart in his club's colour with the crest in it beside GOAL, his full name and exact club. */
export function Goalnatheart({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 170 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w * (108 / 120)} gap={34 * k} goal>
      <Heart data={d} w={w} />
    </ObjectRow>
  );
}
