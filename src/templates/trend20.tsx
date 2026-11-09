/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { HALO } from "./natfree19";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;
const INK = "#16181d";

/**
 * A 48-sheet roadside billboard: a white panel in a dark frame, the faint seams where its sheets were pasted up,
 * the type in dark ink and his club's colour.
 */
function Billboard({ k, w, h, children }: { k: number; w: number; h: number; children: ReactNode }) {
  const seams = Array.from({ length: 5 }, (_, i) => ((i + 1) * w) / 6);
  return (
    <div style={{ position: "relative", width: w, height: h, background: "#f7f7f4", border: `${7 * k}px solid #1d2026`, boxSizing: "border-box", boxShadow: "0 12px 34px rgba(0,0,0,.45)" }}>
      {seams.map((x) => (
        <div key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 2, background: "rgba(0,0,0,.09)" }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(0,0,0,.07)" }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/**
 * Billboard (matchday), after Heavenly's 48-sheet poster run for Fulham about the rituals of a matchday: the game
 * pasted up on a roadside billboard in the sky — MATCHDAY 14 in his club's colour, the fixture in dark ink — with
 * date · kick-off · ground under it.
 */
export function Billboard48({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const iw = W - 80 * k;
  const tPx = Math.min(84 * k * ts, iw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 28 * k * ts, iw, 0.08);
  const bh = 40 * k + tPx + (fixture ? 16 * k + fPx : 0) + 40 * k;
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  const blockH = bh + (rows.length ? 20 * k + rows.length * wPx + (rows.length - 1) * 8 * k + 16 * k : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <Billboard k={k} w={W} h={bh}>
          <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{title}</div>
          {fixture && <div style={{ ...caps(fPx, 0.08), fontWeight: 800, marginTop: 16 * k, color: INK, textShadow: "none" }}>{fixture}</div>}
        </Billboard>
        {rows.length > 0 && (
          <div style={{ marginTop: 20 * k, padding: `${8 * k}px ${20 * k}px`, borderRadius: 999, background: "rgba(10,12,16,.55)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
            {rows.map((l, i) => (
              <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, textShadow: "none" }}>{l}</div>
            ))}
          </div>
        )}
      </Shade>
    </Top>
  );
}

/** Golo · billboard (goal): GOAL in his club's colour on the billboard, his name in dark ink, his exact club under it. */
export function Goalbillboard({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const iw = W - 80 * k;
  const gPx = Math.min(120 * k * ts, iw / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, iw, 0.1);
  const cPx = fit(club, 22 * k * ts, W * 0.9, 0.2);
  const bh = 36 * k + gPx + 16 * k + nPx + 36 * k;
  const blockH = bh + (club ? 20 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Billboard k={k} w={W} h={bh}>
          <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{word}</div>
          <div style={{ ...caps(nPx, 0.1), fontWeight: 800, marginTop: 16 * k, color: INK, textShadow: "none" }}>{name}</div>
        </Billboard>
        {club && <div style={{ ...caps(cPx, 0.2), fontWeight: 700, marginTop: 20 * k, opacity: 0.96, textShadow: HALO }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Five slanted stripes in a row — his club's colour and white in turn, each edged so it holds on any sky — the
 * "dynamic" take on a striped shirt.
 */
function Slash({ data, w, h, k }: { data: RenderData; w: number; h: number; k: number }) {
  const ink = clubInk(data);
  const n = 5;
  const lean = h * 0.45;
  const sw = (w - lean) / n;
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 6px 16px rgba(0,0,0,.4))" }}>
      {Array.from({ length: n }, (_, i) => {
        const x = i * sw;
        const own = i % 2 === 0;
        return <path key={i} d={`M ${x + lean} 0 L ${x + lean + sw} 0 L ${x + sw} ${h} L ${x} ${h} Z`} fill={own ? ink : "#fff"} stroke={own ? "#fff" : ink} strokeWidth={3 * k} strokeLinejoin="round" />;
      })}
    </svg>
  );
}

/**
 * Riscas dinâmicas (matchday), after Dragon Rouge's refresh for Southampton (one asset, the stripes, drawn in a
 * "core", a "positive" and a "dynamic" version): five slanted stripes in his club's colour and white beside
 * MATCHDAY 14, with the fixture and date · kick-off · ground flush left.
 */
export function Dynamicstripes({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const sw = 190 * k;
  const sh = 150 * k;
  const gap = 36 * k;
  const tw = W - sw - gap;
  const tPx = Math.min(66 * k * ts, tw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, tw, 0.08);
  const rows = whenRows(data, 21 * k * ts, tw, 0.12);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, tw, 0.12)));
  const textH = tPx + (fixture ? 18 * k + fPx : 0) + rows.length * (wPx + 10 * k);
  const blockH = Math.max(sh, textH);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <Slash data={data} w={sw} h={sh} k={k} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
            {fixture && <div style={{ ...caps(fPx, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: 18 * k, textShadow: HALO }}>{fixture}</div>}
            {rows.map((l, i) => (
              <div key={i} style={{ ...caps(wPx, 0.12), paddingLeft: 0, fontWeight: 600, marginTop: 10 * k, opacity: 0.94, textShadow: HALO }}>{l}</div>
            ))}
          </div>
        </div>
      </Shade>
    </Top>
  );
}

/** Golo · riscas dinâmicas (goal): the five slanted stripes above GOAL, his name and exact club. */
export function Goaldynamicstripes({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const sw = 230 * k;
  const sh = 70 * k;
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.2);
  const blockH = sh + 26 * k + gPx + 22 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <Slash data={data} w={sw} h={sh} k={k} />
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW, marginTop: 26 * k }}>{word}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 22 * k, textShadow: HALO }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.2), fontWeight: 700, marginTop: 12 * k, opacity: 0.96, textShadow: HALO }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Cartaz emoldurado (matchday), after 1. FC Union Berlin's matchday posters (one artist's print per home game,
 * sold as collector's posters): the game as a framed print hung on a nail by its string — a dark frame, a white
 * mount, and inside it his club's crest with MATCHDAY 14 and the fixture on his club's colour; date · kick-off ·
 * ground under the frame.
 */
export function Framedprint({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const crest = data.club?.crestUrl;
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const fw = W - 60 * k;
  const frame = 7 * k;
  const mount = 14 * k;
  const pad = 16 * k;
  const crestD = 80 * k;
  const iw = fw - 2 * (frame + mount + pad) - (crest ? crestD + 26 * k : 0);
  const tPx = Math.min(56 * k * ts, iw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 24 * k * ts, iw, 0.06);
  const innerH = 2 * pad + Math.max(crest ? crestD : 0, tPx + (fixture ? 12 * k + fPx : 0));
  const fh = innerH + 2 * (frame + mount);
  const stringH = 34 * k;
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  const blockH = stringH + fh + (rows.length ? 20 * k + rows.length * wPx + (rows.length - 1) * 8 * k + 16 * k : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <svg width={fw} height={stringH} style={{ display: "block", overflow: "visible" }}>
          <path d={`M ${fw * 0.2} ${stringH} L ${fw / 2} ${8 * k} L ${fw * 0.8} ${stringH}`} fill="none" stroke="#fff" strokeWidth={3 * k} strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,.6))" }} />
          <circle cx={fw / 2} cy={8 * k} r={7 * k} fill="#fff" stroke="rgba(0,0,0,.35)" strokeWidth={2} />
        </svg>
        <div style={{ width: fw, height: fh, background: "#14161a", padding: frame, boxSizing: "border-box", boxShadow: "0 14px 34px rgba(0,0,0,.5)", transform: "rotate(-1.2deg)" }}>
          <div style={{ width: "100%", height: "100%", background: "#f6f4ef", padding: mount, boxSizing: "border-box" }}>
            <div style={{ width: "100%", height: "100%", background: ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 * k, padding: `0 ${pad}px`, boxSizing: "border-box" }}>
              {crest && <img src={crest} alt="" style={{ width: crestD, height: crestD, objectFit: "contain", flexShrink: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.35))" }} />}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", color: "#fff" }}>
                <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap" }}>{title}</div>
                {fixture && <div style={{ ...caps(fPx, 0.06), paddingLeft: 0, fontWeight: 800, marginTop: 12 * k, textShadow: "none" }}>{fixture}</div>}
              </div>
            </div>
          </div>
        </div>
        {rows.length > 0 && (
          <div style={{ marginTop: 20 * k, padding: `${8 * k}px ${20 * k}px`, borderRadius: 999, background: "rgba(10,12,16,.55)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
            {rows.map((l, i) => (
              <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, textShadow: "none" }}>{l}</div>
            ))}
          </div>
        )}
      </Shade>
    </Top>
  );
}
