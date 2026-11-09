import type { ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { PoolFrame } from "./natfree5";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { caps, column, fit, fixtureOf, fullName, placed, pool, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

function whenOf(data: RenderData, k: number, ts: number, w = W * 0.9) {
  const rows = whenRows(data, 21 * k * ts, w, 0.16);
  const px = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.16)));
  return { rows, px, h: rows.length ? rows.length * px + (rows.length - 1) * 10 * k : 0 };
}

/** Nationalities as stored (Portuguese names, from zerozero) → ISO country code for the flag. */
const ISO: Record<string, string> = {
  portugal: "PT", brasil: "BR", "suécia": "SE", espanha: "ES", "frança": "FR", "itália": "IT", alemanha: "DE", inglaterra: "GB",
  "reino unido": "GB", "países baixos": "NL", holanda: "NL", "bélgica": "BE", "suíça": "CH", "bulgária": "BG", "grécia": "GR",
  argentina: "AR", uruguai: "UY", "colômbia": "CO", venezuela: "VE", eua: "US", "estados unidos": "US", angola: "AO",
  "cabo verde": "CV", "guiné-bissau": "GW", "moçambique": "MZ", "são tomé e príncipe": "ST", "nigéria": "NG", gana: "GH",
  senegal: "SN", "costa do marfim": "CI", marrocos: "MA", "japão": "JP", "dinamarca": "DK", noruega: "NO", "polónia": "PL",
};

/** His first nationality as a flag emoji ("Portugal" → 🇵🇹); none when the country isn't known. */
export function flagOf(data: RenderData): string {
  const first = (data.player?.nationality ?? "").split(/[,/]/)[0].trim().toLowerCase();
  const iso = ISO[first];
  return iso ? String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "";
}

/** "DAVID TELES" with his flag after it, the flag a touch smaller than the caps. */
function NameFlag({ name, flag, px, k }: { name: string; flag: string; px: number; k: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
      <div style={{ fontFamily: DISPLAY, fontSize: px, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{name}</div>
      {flag && <div style={{ fontSize: px * 0.72, lineHeight: 1, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }}>{flag}</div>}
    </div>
  );
}

/**
 * Natural · nacionalidade (matchday): his name in Anton with his country's flag beside it above his head — for
 * players abroad, home comes with him — MATCHDAY 14 small over it, the fixture and date · kick-off · ground under
 * it. Nationality unknown: the name stands alone.
 */
export function Natnation({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const flag = flagOf(data);
  const name = fullName(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const lPx = fit(title, 26 * k * ts, W, 0.24);
  const nPx = Math.min(82 * k * ts, (W - (flag ? 90 * k : 0)) / Math.max(1, name.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = lPx + 20 * k + nPx + (fixture ? 24 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ ...caps(lPx, 0.24), fontWeight: 800 }}>{title}</div>
        <div style={{ marginTop: 20 * k }}>
          <NameFlag name={name} flag={flag} px={nPx} k={k} />
        </div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 24 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
        ))}
      </Shade>
    </Top>
  );
}

/** Golo natural · nacionalidade (goal): GOAL in Anton, his name with his flag, his exact club under it. */
export function Goalnatnation({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const flag = flagOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(130 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = Math.min(44 * k * ts, (W - (flag ? 60 * k : 0)) / Math.max(1, name.length * 0.5));
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 24 * k + nPx + (club ? 14 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        <div style={{ marginTop: 24 * k }}>
          <NameFlag name={name} flag={flag} px={nPx} k={k} />
        </div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 14 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}

/**
 * Night under the floodlights: the photo cooled and deepened at the edges, a soft white floodlight glow high in
 * the sky. Only a grade over his real photo — nothing is added to the scene.
 */
function FloodGrade() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,28,58,.42), rgba(14,28,58,.12) 45%, rgba(8,14,30,.3))", mixBlendMode: "multiply", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(120,170,255,.26), rgba(120,170,255,0) 60%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(55% 22% at 50% 0%, rgba(235,244,255,.34), rgba(235,244,255,0) 75%)", mixBlendMode: "screen", pointerEvents: "none" }} />
    </>
  );
}

/** Top (natfree10) with the floodlight grade laid over the photo, under the type. */
function GradedTop({ data, blockH, drop, children }: { data: RenderData; blockH: number; drop: number; children: ReactNode }) {
  const { H, k } = frameOf(data);
  const { place, y, foot } = placed(data, blockH, drop);
  return (
    <PoolFrame data={data} place={place} H={H} pool={foot ? null : pool(y, blockH)}>
      <FloodGrade />
      {foot && (
        <div style={{ position: "absolute", left: 36, right: 36, top: y - 34 * k, height: blockH + 68 * k, borderRadius: 26 * k, background: "rgba(12,14,18,.66)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.14)" }} />
      )}
      <div style={column(y)}>{children}</div>
    </PoolFrame>
  );
}

/**
 * Natural · holofotes (matchday): his real photo graded to a night game — cooler, deeper edges, a floodlight glow
 * at the top. MATCHDAY 14 in Anton above his head, the fixture and date · kick-off · ground.
 */
export function Natfloodlit({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const tPx = Math.min(92 * k * ts, W / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, W, 0.1);
  const when = whenOf(data, k, ts);
  const blockH = tPx + (fixture ? 24 * k + fPx : 0) + (when.h ? 14 * k + when.h : 0);
  return (
    <GradedTop data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
        {fixture && <div style={{ ...caps(fPx, 0.1), fontWeight: 800, marginTop: 24 * k }}>{fixture}</div>}
        {when.rows.map((l, i) => (
          <div key={i} style={{ ...caps(when.px, 0.16), fontWeight: 600, marginTop: i ? 10 * k : 14 * k, opacity: 0.94 }}>{l}</div>
        ))}
      </Shade>
    </GradedTop>
  );
}

/** Golo natural · holofotes (goal): the same night grade on his celebration; GOAL in Anton, his name and exact club. */
export function Goalnatfloodlit({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(140 * k * ts, W / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 32 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 24 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <GradedTop data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 24 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </GradedTop>
  );
}

/**
 * Golo natural · em direto (goal): a broadcast "live" tag — a red dot and GOAL in heavy sans on one line, like the
 * moment the graphic hits the screen — then his name and exact club in caps. The dot carries a white ring so it
 * holds on any sky.
 */
export function Goalnatlive({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const dot = 44 * k;
  const gPx = Math.min(124 * k * ts, (W - dot - 30 * k) / Math.max(1, word.length * 0.7));
  const nPx = fit(name, 34 * k * ts, W, 0.12);
  const cPx = fit(club, 22 * k * ts, W, 0.22);
  const blockH = gPx + 26 * k + nPx + (club ? 12 * k + cPx : 0);
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 * k }}>
          <div style={{ width: dot, height: dot, borderRadius: "50%", background: "#e5242b", border: `${4 * k}px solid #fff`, boxSizing: "border-box", boxShadow: "0 0 18px rgba(229,36,43,.6), 0 3px 10px rgba(0,0,0,.4)" }} />
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: gPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
        </div>
        <div style={{ ...caps(nPx, 0.12), fontWeight: 800, marginTop: 26 * k }}>{name}</div>
        {club && <div style={{ ...caps(cPx, 0.22), fontWeight: 600, marginTop: 12 * k, opacity: 0.94 }}>{club}</div>}
      </Shade>
    </Top>
  );
}
