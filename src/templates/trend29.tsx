import { frameOf } from "./natfree4";
import { ObjectRow } from "./natfree23";
import { dropped } from "./natfree26";
import { clubInk } from "./trend2";
import type { RenderData } from "./types";

const DARK = "#1b1f26";

/* ---------------- Lighthouse (Sunderland's 2025/26 hummel away kit, the Roker lighthouse) ---------------- */

/**
 * The Roker Pier lighthouse Sunderland's 2025/26 hummel away shirt paid homage to, drawn bold: a tower banded in his
 * club's colour and white, a dark lantern room with a warm light and two wide beams sweeping out.
 */
function Lighthouse({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 160;
  return (
    <svg width={w} height={160 * s} viewBox="0 0 160 160" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <path d="M 80 30 L 4 8 L 4 52 Z" fill="#ffe9a6" opacity={0.75} />
      <path d="M 80 30 L 156 8 L 156 52 Z" fill="#ffe9a6" opacity={0.75} />
      <path d="M 62 56 L 98 56 L 108 150 L 52 150 Z" fill="#fff" stroke={DARK} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 64.2 76 L 95.8 76 L 98 96 L 62 96 Z M 59.8 116 L 100.2 116 L 102.5 136 L 57.5 136 Z" fill={ink} />
      <rect x={60} y={20} width={40} height={30} rx={4} fill={DARK} stroke="#fff" strokeWidth={3} />
      <rect x={68} y={26} width={24} height={18} rx={3} fill="#ffd23e" />
      <path d="M 56 20 L 80 4 L 104 20 Z" fill={ink} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
      <rect x={54} y={48} width={52} height={9} rx={3} fill={DARK} stroke="#fff" strokeWidth={2.6} />
      <rect x={40} y={148} width={80} height={10} rx={3} fill={DARK} stroke="#fff" strokeWidth={2.6} />
    </svg>
  );
}

/** Farol (matchday): the lighthouse banded in his club's colour, beams out, beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground. */
export function Lighthousetower({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 190 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w} gap={30 * k}>
      <Lighthouse data={d} w={w} />
    </ObjectRow>
  );
}

/** Golo · farol (goal): the lighthouse in his club's colour, beams out, beside GOAL, his full name and exact club. */
export function Goallighthouse({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k } = frameOf(d);
  const w = 200 * k;
  return (
    <ObjectRow data={d} ow={w} oh={w} gap={30 * k} goal>
      <Lighthouse data={d} w={w} />
    </ObjectRow>
  );
}
