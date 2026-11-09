/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "sticker" natural looks: his real photo full-bleed and, on the lower side away from
 * him, one rounded rectangle sticker in his club's colour, tilted a few degrees, with a thin white edge — the
 * crest, the word in bold and one small line inside. Nothing else but the NEYOD logo at the top.
 */
function NatStickerFrame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right";
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 450 : 630, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const ink = params.text || "#ffffff";
  const W = 420 * k;
  const ls = lines.filter(Boolean);
  const pad = 26 * k;
  const crestS = 54 * k;
  const wPx = Math.min(46 * k * ts, (W - 2 * pad - crestS - 18 * k) / Math.max(1, word.length * 0.64));
  const lPx = 15 * k * ts;
  const SH = pad * 2 + Math.max(crestS, wPx + 10 * k + ls.length * lPx * 1.3);
  const bottom = (story ? STORY_BOTTOM : H - 70) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          [right ? "right" : "left"]: 60,
          top: bottom - SH,
          width: W,
          height: SH,
          background: colour,
          color: ink,
          borderRadius: 22 * k,
          border: `${5 * k}px solid ${OFF_WHITE}`,
          boxShadow: "0 12px 30px rgba(0,0,0,.35)",
          transform: `rotate(${right ? -4 : 4}deg)`,
          display: "flex",
          alignItems: "center",
          gap: 18 * k,
          padding: `0 ${pad}px`,
          boxSizing: "border-box",
        }}
      >
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", flexShrink: 0 }} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1 }}>{word}</div>
          <div style={{ marginTop: 10 * k }}>
            {ls.map((l) => (
              <div key={l} style={{ fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.92 }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · autocolante (matchday): a tilted sticker in his club's colour — crest, MATCHDAY, date · time v opponent. */
export function Natsticker({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const opp = data.content.home === false ? fx.homeName : fx.awayName;
  return (
    <NatStickerFrame
      data={data}
      word={(data.content.kicker || "MATCHDAY").toUpperCase()}
      lines={[[fx.date, fx.kickoff].filter(Boolean).join(" · "), opp ? `v ${opp}` : ""]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · autocolante: a tilted sticker beside his celebration — crest, GOAL, his name. No score. */
export function Goalnatsticker({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatStickerFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
