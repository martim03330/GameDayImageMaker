/* eslint-disable @next/next/no-img-element */
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { ObjectRow } from "./natfree23";
import { SANS } from "./shared";
import { clubInk } from "./trend2";
import type { RenderData } from "./types";

const DARK = "#1b1f26";
const SHADOW = "drop-shadow(0 8px 18px rgba(0,0,0,.45))";
const HALO = "drop-shadow(0 0 1.5px rgba(255,255,255,.8))";

/** His own club's crest (the side he plays for in this game). */
const ourCrest = (data: RenderData) => {
  const fx = natFixture(data);
  return (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
};

/* ---------------- Water bottle ---------------- */

/** A squeeze bottle in his club's colour: white sport cap, a white band with his crest, edged in white. */
function Bottle({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 70;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: 160 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={160 * s} viewBox="0 0 70 160" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={29} y={2} width={12} height={14} rx={4} fill="#f4f5f7" stroke={DARK} strokeWidth={2.6} />
        <path d="M 18 30 L 22 16 L 48 16 L 52 30 Z" fill="#f4f5f7" stroke={DARK} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M 10 40 Q 10 30 20 30 L 50 30 Q 60 30 60 40 L 60 74 Q 54 80 54 88 Q 54 96 60 102 L 60 148 Q 60 158 50 158 L 20 158 Q 10 158 10 148 L 10 102 Q 16 96 16 88 Q 16 80 10 74 Z" fill={ink} stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
        <rect x={10} y={108} width={50} height={36} fill="#fff" />
        <path d="M 18 42 L 18 66" stroke="#fff" strokeOpacity={0.55} strokeWidth={4} strokeLinecap="round" />
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 23 * s, top: 112 * s, width: 24 * s, height: 28 * s, objectFit: "contain" }} />}
    </div>
  );
}

/** Natural · garrafa (matchday): his water bottle in the club colour with the crest on its band beside MATCHDAY 14, both crests, HOME X AWAY and date · kick-off · ground. */
export function Natbottle({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 104 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (160 / 70)} gap={44 * k}>
      <Bottle data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Training cone ---------------- */

/** A warm-up cone in his club's colour on a square base, two white reflective bands, edged in white. */
function Cone({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 120;
  return (
    <svg width={w} height={124 * s} viewBox="0 0 120 124" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={4} y={104} width={112} height={16} rx={4} fill={ink} stroke="#fff" strokeWidth={3.4} />
      <path d="M 50 4 L 70 4 L 98 106 L 22 106 Z" fill={ink} stroke="#fff" strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M 43.2 30 L 76.8 30 L 82.3 50 L 37.7 50 Z" fill="#fff" />
      <path d="M 33.6 66 L 86.4 66 L 91.9 86 L 28.1 86 Z" fill="#fff" />
    </svg>
  );
}

/** Natural · cone de treino (matchday): the warm-up cone in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Natcone({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 170 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (124 / 120)} gap={34 * k}>
      <Cone data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Binoculars ---------------- */

/** A pair of binoculars, the scout's view of the game: two chunky barrels in his club's colour, white lenses, a dark bridge. */
function Binoculars({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 160;
  const barrel = (x: number) => (
    <g key={x}>
      <rect x={x} y={34} width={56} height={62} rx={14} fill={ink} stroke="#fff" strokeWidth={3.4} />
      <rect x={x + 8} y={8} width={40} height={30} rx={8} fill={DARK} stroke="#fff" strokeWidth={3} />
      <circle cx={x + 28} cy={78} r={15} fill="#e6eef6" stroke={DARK} strokeWidth={4} />
      <path d={`M ${x + 20} ${72} Q ${x + 24} ${66} ${x + 31} ${66}`} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={w} height={100 * s} viewBox="0 0 160 100" style={{ display: "block", flexShrink: 0, overflow: "visible", filter: SHADOW }}>
      <rect x={60} y={40} width={40} height={30} rx={6} fill={DARK} stroke="#fff" strokeWidth={3} />
      <circle cx={80} cy={34} r={8} fill="#e9ecef" stroke={DARK} strokeWidth={3} />
      {[6, 98].map(barrel)}
    </svg>
  );
}

/** Natural · binóculos (matchday): a pair of binoculars in his club's colour beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Natbinoculars({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 230 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (100 / 160)} gap={30 * k}>
      <Binoculars data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- VAR monitor ---------------- */

/** The pitch-side VAR monitor on its stand: a dark screen ringed in his club's colour with a big green tick, "VAR" on the hood. */
function VarMonitor({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 140;
  return (
    <div style={{ position: "relative", width: w, height: 150 * s, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={150 * s} viewBox="0 0 140 150" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={62} y={100} width={16} height={40} fill={DARK} stroke="#fff" strokeWidth={3} />
        <rect x={34} y={136} width={72} height={12} rx={4} fill={DARK} stroke="#fff" strokeWidth={3} />
        <rect x={4} y={4} width={132} height={26} rx={6} fill={DARK} stroke="#fff" strokeWidth={3} />
        <rect x={4} y={28} width={132} height={76} rx={8} fill={ink} stroke="#fff" strokeWidth={3.4} />
        <rect x={14} y={38} width={112} height={56} rx={4} fill="#11151b" />
        <path d="M 46 66 L 62 81 L 94 49" fill="none" stroke="#3ddc84" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 6 * s, height: 22 * s, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 17 * s, letterSpacing: "0.2em", paddingLeft: "0.2em", color: "#fff" }}>VAR</div>
    </div>
  );
}

/** Golo natural · VAR (goal): the pitch-side VAR monitor with a big green tick — goal stands — beside GOAL, his full name and exact club. */
export function Goalnatvar({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 200 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w * (150 / 140)} gap={34 * k} goal>
      <VarMonitor data={data} w={w} />
    </ObjectRow>
  );
}

/* ---------------- Target ---------------- */

/** A target in his club's colour and white rings, the ball dead in the bullseye — right on target. */
function Target({ data, w }: { data: RenderData; w: number }) {
  const ink = clubInk(data);
  const s = w / 120;
  const crest = ourCrest(data);
  return (
    <div style={{ position: "relative", width: w, height: w, flexShrink: 0, filter: SHADOW }}>
      <svg width={w} height={w} viewBox="0 0 120 120" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {[58, 46, 34, 22].map((r, i) => (
          <circle key={r} cx={60} cy={60} r={r} fill={i % 2 ? "#fff" : ink} stroke="#fff" strokeWidth={i ? 0 : 3.4} />
        ))}
        <circle cx={60} cy={60} r={14} fill="#fff" stroke={DARK} strokeWidth={3} />
        <polygon points="60,52.5 67.1,57.7 64.4,66.1 55.6,66.1 52.9,57.7" fill={DARK} />
      </svg>
      {crest && <img src={crest} alt="" style={{ position: "absolute", right: -6 * s, top: -6 * s, width: 34 * s, height: 34 * s, objectFit: "contain", filter: HALO }} />}
    </div>
  );
}

/** Golo natural · alvo (goal): a target in his club's colours with the ball in the bullseye beside GOAL, his full name and exact club. */
export function Goalnattarget({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 180 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w} gap={36 * k} goal>
      <Target data={data} w={w} />
    </ObjectRow>
  );
}

