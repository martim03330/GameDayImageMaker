/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { ObjectRow } from "./natfree23";
import { caps } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { clubInk } from "./trend2";
import { GoalStack, goalOf, stackOf } from "./trend24";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const CREST_HALO = "drop-shadow(0 0 1.5px rgba(255,255,255,.75)) drop-shadow(0 2px 6px rgba(0,0,0,.35))";
const flat = (px: number, tracking: number, weight = 800): CSSProperties => ({ ...caps(px, tracking), fontWeight: weight, textShadow: "none" });

/* ---------------- Citadel (LOSC Lille 2025/26 third kit, the Citadel of Lille) ---------------- */

/**
 * The star-shaped bastion fort seen from above — the 17th-century Citadel of Lille that New Balance's 2025/26 LOSC
 * third kit paid tribute to: five arrow-head bastions in his club's colour, edged in white, a white inner wall, and
 * the round number in the courtyard (goal: his club's crest).
 */
function StarFort({ data, w, center }: { data: RenderData; w: number; center: ReactNode }) {
  const ink = clubInk(data);
  const pts = (R: number) => {
    const out: string[] = [];
    const p = (r: number, deg: number) => `${(60 + r * Math.cos((deg * Math.PI) / 180)).toFixed(2)},${(60 + r * Math.sin((deg * Math.PI) / 180)).toFixed(2)}`;
    for (let i = 0; i < 5; i++) {
      const a = -90 + 72 * i;
      out.push(p(R * 0.7, a - 36), p(R * 0.7, a - 20), p(R * 0.8, a - 24), p(R, a), p(R * 0.8, a + 24), p(R * 0.7, a + 20));
    }
    return out.join(" ");
  };
  return (
    <div style={{ position: "relative", width: w, height: w, flexShrink: 0, filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <svg width={w} height={w} viewBox="0 0 120 120" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <polygon points={pts(60)} fill="rgba(255,255,255,.28)" />
        <polygon points={pts(52)} fill={ink} stroke="#fff" strokeWidth={3.6} strokeLinejoin="miter" />
        <circle cx={60} cy={60} r={22} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={2.6} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{center}</div>
    </div>
  );
}

/** Cidadela (matchday): the star fort with the round number in its courtyard beside MATCHDAY 14, both crests, HOME X AWAY and the kick-off. */
export function Citadel({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const w = 180 * k;
  const no = matchFacts(data).roundNo;
  const center = no ? (
    <div style={{ fontFamily: DISPLAY, fontSize: (no.length > 1 ? 0.3 : 0.36) * w, lineHeight: 1, color: "#fff", marginTop: 0.03 * w }}>{no}</div>
  ) : data.club?.crestUrl ? (
    <img src={data.club.crestUrl} alt="" style={{ width: 0.3 * w, height: 0.3 * w, objectFit: "contain", filter: CREST_HALO }} />
  ) : null;
  return (
    <ObjectRow data={data} ow={w} oh={w} gap={34 * k}>
      <StarFort data={data} w={w} center={center} />
    </ObjectRow>
  );
}

/** Golo · cidadela (goal): the star fort with his club's crest in the courtyard beside GOAL, his full name and exact club. */
export function Goalcitadel({ data }: { data: RenderData }) {
  const { k } = frameOf(data);
  const fx = natFixture(data);
  const crest = (data.content.home === false ? fx.awayCrest : fx.homeCrest) ?? data.club?.crestUrl ?? null;
  const w = 190 * k;
  return (
    <ObjectRow data={data} ow={w} oh={w} gap={34 * k} goal>
      <StarFort data={data} w={w} center={crest ? <img src={crest} alt="" style={{ width: 0.32 * w, height: 0.32 * w, objectFit: "contain", filter: CREST_HALO }} /> : null} />
    </ObjectRow>
  );
}

/* ---------------- Holographic foil (Toulouse FC 2025/26 third kit, Nike) ---------------- */

const HOLO = "linear-gradient(100deg, #ffc9ec 0%, #c9b6ff 22%, #9fe8ff 44%, #b9ffd6 64%, #fff0a8 82%, #ffc9ec 100%)";
const holoText: CSSProperties = { backgroundImage: HOLO, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" };

/**
 * A black card with a holographic-foil rim and the headline printed in iridescent foil — after Toulouse's 2025/26
 * Nike third shirt, black with iridescent badge and print that shift colour with the light. The rest stays plain white.
 */
function HoloCard({ k, w, h, children }: { k: number; w: number; h: number; children: ReactNode }) {
  const b = 5 * k;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 26 * k, background: HOLO, padding: b, boxSizing: "border-box", boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 26 * k - b, background: "linear-gradient(160deg, #15171c, #0b0c0f)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>{children}</div>
    </div>
  );
}

/** Holográfico (matchday): MATCHDAY 14 in iridescent foil between both crests, HOME X AWAY and the kick-off in white, on a black card with a foil rim. */
export function Holofoil({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const s = stackOf(data, k, ts, W - 110 * k);
  const h = s.h + 2 * 38 * k;
  const crest = (c: string | null) => (c && s.cH ? <img src={c} alt="" style={{ height: s.cH, width: s.cH, objectFit: "contain", filter: CREST_HALO }} /> : null);
  return (
    <Top data={data} blockH={h} drop={290}>
      <Shade k={k} h={h}>
        <HoloCard k={k} w={W} h={h}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 * k }}>
            {crest(s.fx.homeCrest)}
            <div style={{ fontFamily: DISPLAY, fontSize: s.tPx, lineHeight: 1.04, whiteSpace: "nowrap", ...holoText }}>{s.title}</div>
            {crest(s.fx.awayCrest)}
          </div>
          {s.versus && <div style={{ ...flat(s.fPx, 0.08), color: "#fff", marginTop: 16 * k }}>{s.versus}</div>}
          {s.rows.map((l, i) => (
            <div key={i} style={{ ...flat(s.wPx, 0.1, 700), color: "#fff", opacity: 0.86, marginTop: 10 * k }}>{l}</div>
          ))}
        </HoloCard>
      </Shade>
    </Top>
  );
}

/** Golo · holográfico (goal): GOAL in iridescent foil, his full name and exact club in white on the black foil-rimmed card. */
export function Goalholofoil({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const g = goalOf(data, k, ts, W - 120 * k);
  const h = g.h + 2 * 40 * k;
  return (
    <Top data={data} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <HoloCard k={k} w={W} h={h}>
          <div style={{ fontFamily: DISPLAY, fontSize: g.gPx, letterSpacing: "0.04em", paddingLeft: "0.04em", lineHeight: 1.04, whiteSpace: "nowrap", ...holoText }}>{g.word}</div>
          <div style={{ ...flat(g.nPx, 0.1), color: "#fff", marginTop: 18 * k }}>{g.name}</div>
          {g.club && <div style={{ ...flat(g.cPx, 0.18, 700), color: "#fff", opacity: 0.88, marginTop: 12 * k }}>{g.club}</div>}
        </HoloCard>
      </Shade>
    </Top>
  );
}

/* ---------------- Azulejo (Cádiz CF 2025/26 away kit, Macron) ---------------- */

/**
 * One big glazed tile, the azulejo Cádiz's 2025/26 Macron away shirt paid tribute to: white glaze, a border band in
 * his club's colour and a bold quarter-flower in each corner, the lettering painted in the same colour.
 */
function Azulejo({ data, k, w, h, children }: { data: RenderData; k: number; w: number; h: number; children: ReactNode }) {
  const ink = clubInk(data);
  const b = 12 * k;
  const c = 58 * k;
  const corner = (rot: number, style: CSSProperties) => (
    <svg width={c} height={c} viewBox="0 0 60 60" style={{ position: "absolute", ...style, transform: `rotate(${rot}deg)` }}>
      <path d="M 0 0 L 46 0 A 46 46 0 0 1 0 46 Z" fill={ink} />
      <path d="M 0 0 L 24 0 A 24 24 0 0 1 0 24 Z" fill="#f7f5ee" />
      <circle cx={0} cy={0} r={11} fill={ink} />
    </svg>
  );
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 8 * k, background: "#f7f5ee", boxShadow: "0 16px 40px rgba(0,0,0,.45), inset 0 0 0 1px rgba(0,0,0,.08)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 14 * k, border: `${b}px solid ${ink}`, borderRadius: 4 * k }} />
      {corner(0, { left: 14 * k + b, top: 14 * k + b })}
      {corner(90, { right: 14 * k + b, top: 14 * k + b })}
      {corner(180, { right: 14 * k + b, bottom: 14 * k + b })}
      {corner(270, { left: 14 * k + b, bottom: 14 * k + b })}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,0) 35%)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: ink }}>{children}</div>
    </div>
  );
}

/** Golo · azulejo (goal): GOAL, his full name and exact club painted in his club's colour on one big glazed tile. */
export function Goalazulejo({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const g = goalOf(data, k, ts, W - 220 * k);
  const h = g.h + 2 * 58 * k;
  return (
    <Top data={data} blockH={h} drop={310}>
      <Shade k={k} h={h}>
        <Azulejo data={data} k={k} w={W} h={h}>
          <GoalStack g={g} k={k} color={clubInk(data)} />
        </Azulejo>
      </Shade>
    </Top>
  );
}
