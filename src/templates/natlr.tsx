/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

type Side = { crest: string | null; label: string; name: string };

/**
 * The shared frame of the "left / right" natural looks: his real photo full-bleed; the two bottom corners each hold
 * a small crest over a tiny label and a bold name (home at the left, away at the right — on goals his crest and name
 * at the left, his club at the right); the word small in the middle between them. The NEYOD logo at the top.
 */
function NatLrFrame({ data, l, r, word }: { data: RenderData; l: Side; r: Side; word: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 700 : 510,
    fs: story ? 245 : 155,
  });
  const M = 56;
  const C = 54 * k;
  const tPx = 12 * k * ts;
  const colW = (CANVAS_W - 2 * M) / 2 - 90 * k;
  const nPx = Math.min(26 * k * ts, colW / Math.max(1, capsEm(l.name, 0)), colW / Math.max(1, capsEm(r.name, 0)));
  const wPx = 15 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const nameTop = bottom - nPx;
  const labTop = nameTop - 10 * k - tPx;
  const cTop = labTop - 14 * k - C;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const corner = (s: Side, side: "left" | "right") => (
    <div style={{ position: "absolute", [side]: M, top: cTop, textAlign: side, width: colW }}>
      {s.crest ? <img src={s.crest} alt="" style={{ width: C, height: C, objectFit: "contain", display: "block", marginLeft: side === "right" ? "auto" : 0 }} /> : <div style={{ height: C }} />}
      <div style={{ marginTop: 14 * k, fontFamily: SANS, fontWeight: 600, fontSize: tPx, letterSpacing: "0.24em", lineHeight: 1, opacity: 0.75 }}>{s.label}</div>
      <div style={{ marginTop: 10 * k, fontFamily: SANS, fontWeight: 800, fontSize: nPx, lineHeight: 1, whiteSpace: "nowrap" }}>{s.name}</div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cTop - 180 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      {corner(l, "left")}
      {corner(r, "right")}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: nameTop + nPx - wPx, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.28em", paddingLeft: "0.28em", lineHeight: 1, opacity: 0.88 }}>{word}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · esquerda e direita (matchday): HOME (crest + exact name) bottom-left, AWAY bottom-right, MATCHDAY · time between. */
export function Natlr({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.kickoff].filter(Boolean).join(" · ");
  return <NatLrFrame data={data} l={{ crest: fx.homeCrest, label: "HOME", name: fx.homeName }} r={{ crest: fx.awayCrest, label: "AWAY", name: fx.awayName }} word={word} />;
}

/** Natural goal · esquerda e direita: PLAYER bottom-left, CLUB (crest + exact name) bottom-right, GOAL between. No score. */
export function Goalnatlr({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLrFrame data={data} l={{ crest: null, label: "PLAYER", name }} r={{ crest: data.content.home === false ? fx.awayCrest : fx.homeCrest, label: "CLUB", name: ourClub(data) }} word={(data.content.kicker || "GOAL").toUpperCase()} />;
}
