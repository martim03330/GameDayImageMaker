import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "table rows" natural looks: his real photo full-bleed; on the side away from him at
 * the foot, the facts as the rows of a small table — each row a hairline over a tiny dim label on the left and
 * its value in bold on the right — under the word in bold. The NEYOD logo alone at the top.
 */
function NatRowsFrame({ data, word, rows }: { data: RenderData; word: string; rows: [string, string][] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 670 : 410, fy: story ? 690 : 500, fs: story ? 245 : 155 });
  const M = 56;
  const colW = 440 * k;
  const rs = rows.filter(([, v]) => v);
  const lbPx = 12 * k * ts;
  const vPx = Math.min(19 * k * ts, ...rs.map(([, v]) => (colW * 0.72) / Math.max(1, v.length * 0.56)));
  const rowH = Math.max(lbPx, vPx) + 22 * k;
  const wPx = Math.min(54 * k * ts, colW / Math.max(1, word.length * 0.66));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const tableTop = bottom - rs.length * rowH;
  const wTop = tableTop - 18 * k - wPx * 0.86;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const edge = left ? "left" : "right";
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.6), rgba(0,0,0,0) 72%)`, WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 35%)", maskImage: "linear-gradient(to bottom, transparent, #000 35%)" }} />
      <div style={{ position: "absolute", [edge]: M, width: colW, top: wTop - wPx * 0.12, textAlign: edge, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      {rs.map(([label, value], i) => (
        <div key={label} style={{ position: "absolute", [edge]: M, width: colW, top: tableTop + i * rowH, height: rowH, borderTop: `1.5px solid rgba(255,255,255,.55)`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 * k, fontFamily: SANS, lineHeight: 1 }}>
          <span style={{ fontWeight: 600, fontSize: lbPx, letterSpacing: "0.2em", opacity: 0.65, flexShrink: 0 }}>{label}</span>
          <span style={{ fontWeight: 700, fontSize: vPx, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
        </div>
      ))}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · linhas de tabela (matchday): MATCHDAY over rows JOGO / DATA / HORA / ESTÁDIO (exact names). */
export function Natrows({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatRowsFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      rows={[
        ["MATCH", `${fx.homeName} v ${fx.awayName}`],
        ["DATE", fx.date],
        ["KICK-OFF", fx.kickoff],
        ["VENUE", fx.venue],
      ]}
    />
  );
}

/** Natural goal · linhas de tabela: GOAL over rows PLAYER / CLUB — his name and his club's exact name. No score. */
export function Goalnatrows({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return (
    <NatRowsFrame
      data={data}
      word={(data.content.kicker || "GOAL").toUpperCase()}
      rows={[
        ["PLAYER", name],
        ["CLUB", ourClub(data)],
      ]}
    />
  );
}
