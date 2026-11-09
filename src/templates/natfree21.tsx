/* eslint-disable @next/next/no-img-element */
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { GoalText, SideText, sideTextH } from "./natfree20";
import { roundTitle } from "./natfree9";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/**
 * The capo's megaphone, mouth towards the type: a white cone with a band in his club's colour at the bell (edged
 * in white, so it holds on any sky), a dark grip under it and three thick sound arcs in front of the mouth.
 */
function Megaphone({ data, w, k }: { data: RenderData; w: number; k: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  const h = 78 * s;
  return (
    <svg width={w} height={h} viewBox="0 0 100 78" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 6px 16px rgba(0,0,0,.45))" }}>
      <path d="M 22 44 L 30 70 L 40 70 L 36 44 Z" fill="#2a2e35" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
      <rect x={4} y={24} width={14} height={20} rx={3} fill="#fff" />
      <path d="M 16 22 L 58 6 L 58 62 L 16 46 Z" fill="#fff" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
      <path d="M 50 9 L 62 4 L 62 64 L 50 59 Z" fill={ink} stroke="#fff" strokeWidth={2.4} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => {
        const r = 12 + i * 10;
        return <path key={i} d={`M ${66 + i * 4} ${34 - r * 0.7} A ${r} ${r} 0 0 1 ${66 + i * 4} ${34 + r * 0.7}`} fill="none" stroke="#fff" strokeWidth={Math.max(3.2, (6 * k) / s)} strokeLinecap="round" opacity={1 - i * 0.18} />;
      })}
    </svg>
  );
}

/**
 * Natural · megafone (matchday): the capo's megaphone, the voice of the stand, calling out MATCHDAY 14, the fixture
 * and date · kick-off · ground — one row above his head.
 */
export function Natmegaphone({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const mw = 210 * k;
  const gap = 28 * k;
  const tw = W - mw - gap;
  const blockH = Math.max(mw * 0.78, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Megaphone data={data} w={mw} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/** Golo natural · megafone (goal): the megaphone calling out GOAL, his name and exact club. */
export function Goalnatmegaphone({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const mw = 220 * k;
  const gap = 30 * k;
  return (
    <Top data={data} blockH={mw * 0.78} drop={310}>
      <Shade k={k} h={mw * 0.78}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Megaphone data={data} w={mw} k={k} />
          <GoalText data={data} k={k} ts={ts} w={W - mw - gap} />
        </div>
      </Shade>
    </Top>
  );
}

/**
 * The supporters' bass drum seen from the front: a thick rim in his club's colour edged in white, white lugs round
 * it, his club's crest big on the white head and two sticks crossed behind. Without a crest the head stays plain.
 */
function Drum({ data, d, k }: { data: RenderData; d: number; k: number }) {
  const ink = clubInk(data);
  const crest = data.club?.crestUrl;
  const rim = 22 * k;
  const pad = 30 * k;
  const size = d + 2 * pad;
  const c = size / 2;
  const lugs = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4 + Math.PI / 8);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[-1, 1].map((dir) => (
          <g key={dir}>
            <line x1={c - dir * d * 0.62} y1={-4 * k} x2={c + dir * d * 0.12} y2={c * 0.82} stroke="#fff" strokeWidth={10 * k} strokeLinecap="round" />
            <circle cx={c - dir * d * 0.62} cy={-4 * k} r={10 * k} fill="#fff" />
          </g>
        ))}
        <circle cx={c} cy={c} r={d / 2} fill={ink} stroke="#fff" strokeWidth={5 * k} />
        <circle cx={c} cy={c} r={d / 2 - rim} fill="#f6f6f3" stroke="#fff" strokeWidth={3 * k} />
        {lugs.map((a, i) => (
          <rect key={i} x={c - 6 * k} y={c - d / 2 - 8 * k} width={12 * k} height={rim + 6 * k} rx={4 * k} fill="#fff" transform={`rotate(${(a * 180) / Math.PI} ${c} ${c})`} />
        ))}
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: c - d * 0.3, top: c - d * 0.3, width: d * 0.6, height: d * 0.6, objectFit: "contain" }} />}
    </div>
  );
}

/**
 * Natural · bombo (matchday): the drum that beats the stand's rhythm, his club's crest on its head, beside
 * MATCHDAY 14, the fixture and date · kick-off · ground.
 */
export function Natdrum({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const d = 190 * k;
  const size = d + 60 * k;
  const gap = 18 * k;
  const tw = W - size - gap;
  const blockH = Math.max(size, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Drum data={data} d={d} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/** Golo natural · bombo (goal): the drum with his club's crest beside GOAL, his name and exact club. */
export function Goalnatdrum({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const d = 200 * k;
  const size = d + 60 * k;
  const gap = 22 * k;
  return (
    <Top data={data} blockH={size} drop={310}>
      <Shade k={k} h={size}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Drum data={data} d={d} k={k} />
          <GoalText data={data} k={k} ts={ts} w={W - size - gap} />
        </div>
      </Shade>
    </Top>
  );
}

/**
 * A supporter's bobble hat: the knit body in his club's colour edged in white, a white turned-up cuff with a band
 * of the club colour through it, a white pom-pom on top.
 */
function Beanie({ data, w, k }: { data: RenderData; w: number; k: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  return (
    <svg width={w} height={98 * s} viewBox="0 0 100 98" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 6px 16px rgba(0,0,0,.45))" }}>
      <path d="M 10 70 C 10 34, 28 18, 50 18 C 72 18, 90 34, 90 70 Z" fill={ink} stroke="#fff" strokeWidth={2.6} strokeLinejoin="round" />
      {[30, 42, 50, 58, 70].map((x) => (
        <path key={x} d={`M ${x} 24 C ${x + (x - 50) * 0.2} 40, ${x + (x - 50) * 0.3} 56, ${x + (x - 50) * 0.32} 68`} fill="none" stroke="#fff" strokeOpacity={0.28} strokeWidth={Math.max(1.6, (3 * k) / s)} />
      ))}
      <rect x={6} y={66} width={88} height={24} rx={5} fill="#fff" />
      <rect x={6} y={74} width={88} height={8} fill={ink} />
      <circle cx={50} cy={13} r={12} fill="#fff" />
    </svg>
  );
}

/** Natural · gorro (matchday): a supporter's bobble hat in his club's colour beside MATCHDAY 14, the fixture and date · kick-off · ground. */
export function Natbeanie({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const bw = 200 * k;
  const gap = 34 * k;
  const tw = W - bw - gap;
  const blockH = Math.max(bw * 0.98, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Beanie data={data} w={bw} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}
