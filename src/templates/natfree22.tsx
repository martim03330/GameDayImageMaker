import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { GoalText, SideText, sideTextH } from "./natfree20";
import { roundTitle } from "./natfree9";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/**
 * The supporter's foam finger: a big hand in his club's colour, index raised, three fingers folded over the palm and
 * the thumb across them, a white cuff at the wrist — edged in white so any club colour holds on any sky.
 */
function FoamFinger({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 100;
  const line = { fill: "none", stroke: "#fff", strokeOpacity: 0.55, strokeWidth: 2.4, strokeLinecap: "round" as const };
  return (
    <svg width={w} height={132 * s} viewBox="0 0 100 132" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <path
        d="M 38 62 L 38 15 A 11 11 0 0 1 60 15 L 60 46 L 76 46 A 8 8 0 0 1 76 62 A 8 8 0 0 1 76 78 A 8 8 0 0 1 76 94 L 76 100 Q 76 106 70 106 L 28 106 Q 16 106 16 94 L 16 74 Q 16 62 28 62 Z"
        fill={ink}
        stroke="#fff"
        strokeWidth={3.2}
        strokeLinejoin="round"
      />
      <path d="M 60 62 L 76 62 M 60 78 L 76 78" {...line} />
      <path d="M 20 76 Q 40 70 58 76 Q 64 81 57 87 L 26 88 Q 18 86 20 76 Z" fill={ink} stroke="#fff" strokeWidth={2.8} strokeLinejoin="round" />
      <rect x={20} y={104} width={58} height={24} rx={5} fill="#fff" />
    </svg>
  );
}

/** Natural · dedo de espuma (matchday): a foam finger in his club's colour raised beside MATCHDAY 14, the fixture and date · kick-off · ground. */
export function Natfoamfinger({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fw = 170 * k;
  const gap = 34 * k;
  const tw = W - fw - gap;
  const blockH = Math.max(fw * 1.32, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <FoamFinger data={data} w={fw} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/** Golo natural · dedo de espuma (goal): the foam finger beside GOAL, his name and exact club. */
export function Goalnatfoamfinger({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fw = 180 * k;
  const gap = 36 * k;
  return (
    <Top data={data} blockH={fw * 1.32} drop={310}>
      <Shade k={k} h={fw * 1.32}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <FoamFinger data={data} w={fw} />
          <GoalText data={data} k={k} ts={ts} w={W - fw - gap} />
        </div>
      </Shade>
    </Top>
  );
}

/**
 * A floodlight pylon: a dark lamp head with a grid of twelve lit lamps (each with its own glow) on a white lattice
 * mast — the night-match landmark of every ground.
 */
function FloodTower({ w, k }: { w: number; k: number }) {
  const s = w / 100;
  const lamps = Array.from({ length: 12 }, (_, i) => ({ x: 22 + (i % 4) * 18.7, y: 14 + Math.floor(i / 4) * 14 }));
  const braces = Array.from({ length: 6 }, (_, i) => 52 + i * 17);
  const at = (y: number, side: -1 | 1) => 50 + side * (12 + ((y - 50) / 108) * 10);
  return (
    <div style={{ position: "relative", width: w, height: 160 * s, flexShrink: 0 }}>
      <div style={{ position: "absolute", left: -w * 0.25, top: -w * 0.2, width: w * 1.5, height: w * 0.9, background: "radial-gradient(closest-side, rgba(255,246,214,.55), rgba(255,246,214,0))", pointerEvents: "none" }} />
      <svg width={w} height={160 * s} viewBox="0 0 100 160" style={{ position: "relative", display: "block", overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
        <line x1={at(50, -1)} y1={50} x2={at(158, -1)} y2={158} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        <line x1={at(50, 1)} y1={50} x2={at(158, 1)} y2={158} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        {braces.map((y, i) => (
          <line key={y} x1={at(y, i % 2 ? 1 : -1)} y1={y} x2={at(y + 17, i % 2 ? -1 : 1)} y2={y + 17} stroke="#fff" strokeWidth={Math.max(2.4, (3.2 * k) / s)} strokeLinecap="round" />
        ))}
        <rect x={8} y={4} width={84} height={46} rx={4} fill="#1d2127" stroke="#fff" strokeWidth={3} />
        {lamps.map((l, i) => (
          <circle key={i} cx={l.x} cy={l.y} r={5.6} fill="#fff8e2" style={{ filter: "drop-shadow(0 0 4px rgba(255,244,205,.95))" }} />
        ))}
      </svg>
    </div>
  );
}

/** Natural · torre de iluminação (matchday): a lit floodlight pylon beside MATCHDAY 14, the fixture and date · kick-off · ground. */
export function Natfloodtower({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const tw0 = 150 * k;
  const gap = 34 * k;
  const tw = W - tw0 - gap;
  const blockH = Math.max(tw0 * 1.6, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <FloodTower w={tw0} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/**
 * A football boot seen from the side: white upper with a dark outline, a stripe in his club's colour along the side,
 * laces, a dark sole and studs. With `ball`, a ball at the toe — the strike.
 */
function Boot({ data, w, ball = false }: { data: RenderData; w: number; ball?: boolean }) {
  const ink = clubInk(data);
  const vw = ball ? 160 : 120;
  const s = w / vw;
  return (
    <svg width={w} height={72 * s} viewBox={`0 0 ${vw} 72`} style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <path d="M 8 18 C 8 8, 20 4, 34 6 L 50 10 C 58 22, 76 28, 94 32 C 108 35, 116 42, 114 52 L 112 56 L 10 56 C 5 44, 5 30, 8 18 Z" fill="#f7f7f4" stroke="#1b1f26" strokeWidth={3} strokeLinejoin="round" />
      <path d="M 20 44 C 44 40, 70 36, 104 44" fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" />
      <path d="M 52 16 L 60 13 M 58 21 L 66 18 M 64 25 L 72 22" stroke="#1b1f26" strokeWidth={2.6} strokeLinecap="round" />
      <rect x={8} y={55} width={106} height={6} rx={3} fill="#1b1f26" />
      {[18, 34, 62, 82, 102].map((x) => (
        <rect key={x} x={x - 3} y={60} width={6} height={8} rx={2} fill="#1b1f26" />
      ))}
      {ball && (
        <g>
          <circle cx={138} cy={46} r={20} fill="#fff" stroke="#1b1f26" strokeWidth={3} />
          <polygon points="138,37 146.6,43.2 143.3,53.3 132.7,53.3 129.4,43.2" fill="#1b1f26" />
        </g>
      )}
    </svg>
  );
}

/** Natural · chuteira (matchday): his boot, laced up for the game, beside MATCHDAY 14, the fixture and date · kick-off · ground. */
export function Natboot({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const bw = 230 * k;
  const gap = 30 * k;
  const tw = W - bw - gap;
  const blockH = Math.max(bw * 0.6, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Boot data={data} w={bw} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/** Golo natural · remate (goal): the boot striking the ball, above GOAL, his name and exact club. */
export function Goalnatboot({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const bw = 330 * k;
  const bh = bw * (72 / 160);
  const gH = Math.min(120 * k * ts, W / 2.5) + 18 * k + 30 * k * ts + 10 * k + 22 * k * ts;
  const blockH = bh + 26 * k + gH;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Boot data={data} w={bw} ball />
        <div style={{ marginTop: 26 * k, display: "flex", justifyContent: "center" }}>
          <GoalText data={data} k={k} ts={ts} w={W} />
        </div>
      </Shade>
    </Top>
  );
}
