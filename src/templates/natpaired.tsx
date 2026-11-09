import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "pairs" natural looks (a spec sheet): his real photo full-bleed; at the foot the word
 * small in tracked caps, then a row of label / value pairs side by side — each label tiny and dim, each value in
 * bold — divided by thin vertical hairlines, each column as wide as its text. The NEYOD logo alone at the top.
 */
function NatPairedFrame({ data, word, pairs }: { data: RenderData; word: string; pairs: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 490,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const ps = pairs.filter(([, v]) => v);
  const gap = 28 * k;
  // Each column is only as wide as its text, packed from the left, so the row stays off him when it can.
  const lbPx = 12 * k * ts;
  const need = (px: number) => ps.map(([l, v]) => Math.max(l.length * 0.8 * lbPx, v.length * 0.58 * px));
  const room = CANVAS_W - 2 * M - gap * 2 * (ps.length - 1);
  const base = 22 * k * ts;
  const sum = need(base).reduce((a, b) => a + b, 0);
  const vPx = sum > room ? (base * room) / sum : base;
  const widths = need(vPx);
  const wPx = 15 * k * ts;
  const rowH = lbPx + 10 * k + vPx;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const rowTop = bottom - rowH;
  const wTop = rowTop - 26 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  let x = M;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.55) 50%, rgba(0,0,0,.7))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.26em", lineHeight: 1 }}>{word}</div>
      {ps.map(([label, value], i) => {
        const left = x;
        x += widths[i] + gap * 2;
        return (
          <div key={label}>
            {i > 0 && <div style={{ position: "absolute", left: left - gap, top: rowTop, width: 1.5, height: rowH, background: OFF_WHITE, opacity: 0.5 }} />}
            <div style={{ position: "absolute", left, width: widths[i], top: rowTop, fontFamily: SANS, lineHeight: 1 }}>
              <div style={{ fontWeight: 600, fontSize: lbPx, letterSpacing: "0.2em", opacity: 0.65 }}>{label}</div>
              <div style={{ marginTop: 10 * k, fontWeight: 700, fontSize: vPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
            </div>
          </div>
        );
      })}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · pares (matchday): MATCHDAY over HOME / AWAY / KICK-OFF label-value pairs (exact names). */
export function Natpaired({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatPairedFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      pairs={[
        ["HOME", fx.homeName],
        ["AWAY", fx.awayName],
        ["KICK-OFF", [fx.date, fx.kickoff].filter(Boolean).join(" · ")],
      ]}
    />
  );
}

/** Natural goal · pares: GOAL over PLAYER / CLUB pairs — his name and his club's exact name. No score. */
export function Goalnatpaired({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatPairedFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      pairs={[
        ["PLAYER", name],
        ["CLUB", ourClub(data)],
      ]}
    />
  );
}
