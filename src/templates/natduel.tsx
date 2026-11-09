/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

type Side = { crest: string | null; name: string };

/**
 * The shared frame of the "duel" natural looks: his real photo full-bleed; at the foot two big crests face
 * each other across a small centred word (the "v" and the kicker), each with its exact name in small caps
 * under it; a single line of details below. The NEYOD logo alone at the top. A soft shade under the foot.
 */
function NatDuelFrame({ data, left, right, centre, line }: { data: RenderData; left: Side; right: Side | null; centre: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 240 : 150,
  });
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const C = 110 * k;
  const nPx = 14 * k * ts;
  const lPx = Math.min(14 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const lineTop = bottom - lPx;
  const rowTop = lineTop - 30 * k - (C + 14 * k + nPx);
  const cx = right ? 250 * k : CANVAS_W / 2;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const unit = (s: Side, x: number) => (
    <div style={{ position: "absolute", left: x - 180 * k, width: 360 * k, top: rowTop, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
      {s.crest ? <img src={s.crest} alt="" style={{ width: C, height: C, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.4))" }} /> : <div style={{ height: C }} />}
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: nPx, letterSpacing: "0.18em", whiteSpace: "nowrap", textAlign: "center" }}>{s.name.toUpperCase()}</div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 45%, rgba(0,0,0,.68))" }} />
      {unit(left, right ? CANVAS_W / 2 - cx : CANVAS_W / 2)}
      {right && unit(right, CANVAS_W / 2 + cx)}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: right ? rowTop + C / 2 - 26 * k : rowTop - 60 * k, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40 * k * ts, letterSpacing: "0.06em", lineHeight: 1 }}>{centre}</div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap", opacity: 0.88 }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · duelo (matchday): both crests face to face with "V" between, the exact names under them; MATCHDAY · date · time below. */
export function Natduel({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const line = [(data.content.kicker || "MATCHDAY").toUpperCase(), fx.date.toUpperCase(), fx.kickoff, fx.venue.toUpperCase()].filter(Boolean).join("  ·  ");
  return <NatDuelFrame data={data} left={{ crest: fx.homeCrest, name: fx.homeName }} right={{ crest: fx.awayCrest, name: fx.awayName }} centre="V" line={line} />;
}

/** Natural goal · duelo: his club's crest alone with "GOAL" above it and his club's exact name under it; his name below. No score. */
export function Goalnatduel({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDuelFrame data={data} left={{ crest: data.content.home === false ? fx.awayCrest : fx.homeCrest, name: ourClub(data) }} right={null} centre={(data.content.kicker || "GOAL").toUpperCase()} line={name.toUpperCase()} />;
}
