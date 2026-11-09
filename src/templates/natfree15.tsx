/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { Top } from "./natfree10";
import { caps, fit, fixtureOf, fullName, placed, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const INK = "#15181d";
const MIST = "rgba(244,245,247,";

/** Dark caps for the light mist (no shadow: the mist already lifts them off the photo). */
const darkCaps = (px: number, tracking: number): CSSProperties => ({ ...caps(px, tracking), color: INK, textShadow: "none" });

/**
 * The light counterpart of Top: the block above his head sits in a pale mist instead of a dark shade — a soft
 * white haze that fades out before his hair, so the type is dark ink. When his head stays high and the block
 * moves to the foot, it sits on a pale panel of its own.
 */
function MistTop({ data, blockH, drop, children }: { data: RenderData; blockH: number; drop: number; children: ReactNode }) {
  const { H, k } = frameOf(data);
  const { place, y, foot } = placed(data, blockH, drop);
  const mist = foot
    ? { left: 36, right: 36, top: y - 34 * k, height: blockH + 68 * k, borderRadius: 26 * k, background: `${MIST}.9)` }
    : {
        left: 0,
        right: 0,
        top: 0,
        height: y + blockH + 70 * k,
        background: `linear-gradient(to bottom, ${MIST}.92), ${MIST}.84) 78%, ${MIST}0))`,
      };
  return (
    <PoolFrame data={data} place={place} H={H} pool={null}>
      <div style={{ position: "absolute", ...mist }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </PoolFrame>
  );
}

/**
 * Natural · névoa clara (matchday): the top of his real photo washed in a pale mist, MATCHDAY 14 in dark Anton,
 * the fixture (exact names) and date · kick-off · ground in dark caps, all above his head. Made for bright days.
 */
export function Natmistlight({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tPx = Math.min(96 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 28 * k * ts, W, 0.1);
  const when = whenRows(data, 22 * k * ts, W * 0.9, 0.16);
  const wPx = Math.min(22 * k * ts, ...when.map((l) => fit(l, 22 * k * ts, W * 0.9, 0.16)));
  const wH = when.length ? when.length * wPx + (when.length - 1) * 10 * k : 0;
  const blockH = tPx + (fixture ? 28 * k + fPx : 0) + (wH ? 18 * k + wH : 0);
  return (
    <MistTop data={data} blockH={blockH} drop={300}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", color: INK }}>{title}</div>
      {fixture && <div style={{ ...darkCaps(fPx, 0.1), fontWeight: 800, marginTop: 28 * k }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...darkCaps(wPx, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 18 * k, opacity: 0.82 }}>{l}</div>
      ))}
    </MistTop>
  );
}

/** Golo natural · névoa clara (goal): the same pale mist over his celebration, GOAL in dark Anton, his name and exact club. */
export function Goalnatmistlight({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(150 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 24 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <MistTop data={data} blockH={blockH} drop={310}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", color: INK }}>{word}</div>
      <div style={{ ...darkCaps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
      {club && <div style={{ ...darkCaps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.8 }}>{club}</div>}
    </MistTop>
  );
}

/** A white disc holding a crest, with a soft drop shadow (the two clubs as two coins). */
function Coin({ src, size, z }: { src: string | null; size: number; z: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#fff", boxShadow: "0 8px 26px rgba(0,0,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: z, flexShrink: 0 }}>
      {src && <img src={src} alt="" style={{ width: size * 0.64, height: size * 0.64, objectFit: "contain" }} />}
    </div>
  );
}

/**
 * Natural · moedas (matchday): the two crests on white discs that overlap like two coins, home in front, above his
 * head; MATCHDAY 14 in Anton, the fixture (exact names) and date · kick-off · ground under them. One crest missing:
 * a single coin.
 */
export function Natcrestcoins({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const coins = [fx.homeCrest, fx.awayCrest].filter(Boolean) as string[];
  const c = 92 * k;
  const tPx = Math.min(62 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const wPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  const wH = when.length ? when.length * wPx + (when.length - 1) * 10 * k : 0;
  const blockH = (coins.length ? c + 22 * k : 0) + tPx + (fixture ? 26 * k + fPx : 0) + (wH ? 16 * k + wH : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      {coins.length > 0 && (
        <div style={{ display: "flex", marginBottom: 22 * k }}>
          {coins.map((s, i) => (
            <div key={i} style={{ marginLeft: i ? -c * 0.24 : 0 }}>
              <Coin src={s} size={c} z={coins.length - i} />
            </div>
          ))}
        </div>
      )}
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 26 * k }}>{fixture}</div>}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 16 * k, opacity: 0.94 }}>{l}</div>
      ))}
    </Top>
  );
}

/** Text on a white marker bar, as if picked out with a highlighter (dark ink, slight overhang). */
function Marked({ text, px, tracking, k }: { text: string; px: number; tracking: number; k: number }) {
  return (
    <span style={{ ...caps(px, tracking), fontWeight: 800, color: INK, textShadow: "none", background: "#fff", padding: `${px * 0.22}px ${px * 0.4}px`, borderRadius: 4 * k, display: "inline-block" }}>{text}</span>
  );
}

/**
 * Natural · marcador (matchday): MATCHDAY 14 in Anton above his head and the fixture under it, the opponent's exact
 * name picked out on a white marker bar in dark ink; date · kick-off · ground below. No opponent: no bar.
 */
export function Nathighlight({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fx = natFixture(data);
  const title = roundTitle(data);
  const opp = (data.content.home === false ? fx.homeName : fx.awayName).toUpperCase();
  const ours = (data.content.home === false ? fx.awayName : fx.homeName).toUpperCase();
  const tPx = Math.min(84 * k * ts, W / Math.max(1, title.length * 0.5));
  const lead = ours ? (data.content.home === false ? "" : `${ours}  V`) : "";
  const tail = ours && data.content.home === false ? `V  ${ours}` : "";
  const line = [lead, opp, tail].filter(Boolean).join("  ");
  const fPx = fit(line, 28 * k * ts, W - 40 * k, 0.1);
  const when = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const wPx = Math.min(21 * k * ts, ...when.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  const wH = when.length ? when.length * wPx + (when.length - 1) * 10 * k : 0;
  const blockH = tPx + (opp ? 30 * k + fPx * 1.44 : 0) + (wH ? 22 * k + wH : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {opp && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 * k, marginTop: 30 * k }}>
          {lead && <span style={{ ...caps(fPx, 0.1), fontWeight: 800 }}>{lead}</span>}
          <Marked text={opp} px={fPx} tracking={0.1} k={k} />
          {tail && <span style={{ ...caps(fPx, 0.1), fontWeight: 800 }}>{tail}</span>}
        </div>
      )}
      {when.map((l, i) => (
        <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 22 * k, opacity: 0.94 }}>{l}</div>
      ))}
    </Top>
  );
}

/** Golo natural · marcador (goal): GOAL in Anton above his head and his name picked out on a white marker bar; his exact club under it. */
export function Goalnathighlight({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(140 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 34 * k * ts, W - 60 * k, 0.1);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 28 * k + nPx * 1.44 + (club ? 18 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      {name && (
        <div style={{ marginTop: 28 * k }}>
          <Marked text={name} px={nPx} tracking={0.1} k={k} />
        </div>
      )}
      {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 18 * k, opacity: 0.94 }}>{club}</div>}
    </Top>
  );
}

