/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "glass card" natural looks: his real photo full-bleed and, centred at the foot, one
 * rounded dark translucent card (frosted, thin light border) holding the crest at its left, the word in bold and
 * two small lines. The NEYOD logo alone at the top.
 */
function NatGlasscardFrame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 680 : 480,
    fs: story ? 240 : 150,
  });
  const W = 760 * k > CANVAS_W - 100 ? CANVAS_W - 100 : 760 * k;
  const pad = 26 * k;
  const crestS = 72 * k;
  const wPx = Math.min(40 * k * ts, (W - crestS - 3 * pad) / Math.max(1, word.length * 0.64));
  const lPx = 17 * k * ts;
  const ls = lines.filter(Boolean);
  const CH = Math.max(crestS, wPx + 10 * k + ls.length * lPx * 1.35) + 2 * pad;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          left: (CANVAS_W - W) / 2,
          top: bottom - CH,
          width: W,
          height: CH,
          borderRadius: 26 * k,
          background: "rgba(14,16,14,.5)",
          backdropFilter: "blur(14px) saturate(1.1)",
          WebkitBackdropFilter: "blur(14px) saturate(1.1)",
          border: "1px solid rgba(255,255,255,.22)",
          boxShadow: "0 14px 34px rgba(0,0,0,.3)",
          display: "flex",
          alignItems: "center",
          gap: pad,
          padding: `0 ${pad}px`,
          boxSizing: "border-box",
        }}
      >
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", flexShrink: 0 }} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.04em", lineHeight: 1 }}>{word}</div>
          <div style={{ marginTop: 10 * k, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.9 }}>
            {ls.map((l) => (
              <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

/** Natural · cartão de vidro (matchday): a frosted card — crest, MATCHDAY, Home v Away, date · time (exact names). */
export function Natglasscard({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatGlasscardFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · cartão de vidro: the frosted card under his celebration — crest, GOAL, his name, his club's exact name. No score. */
export function Goalnatglasscard({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatGlasscardFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
