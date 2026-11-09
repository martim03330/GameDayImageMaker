/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "info box" natural looks: his real photo full-bleed and, in the lower corner away from
 * him, a compact off-white box with square corners: a bar of his club's colour along its top holding the word in
 * white, then the crest and two lines in dark ink. The NEYOD logo alone at the top.
 */
function NatInfobox2Frame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right";
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 460 : 620, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const colour = params.primary || "#e3001b";
  const ink = panelColour(params.primary, params.accent);
  const W = 400 * k;
  const pad = 22 * k;
  const barH = 50 * k;
  const crestS = 54 * k;
  const lPx = 17 * k * ts;
  const ls = lines.filter(Boolean);
  const bodyH = Math.max(crestS, ls.length * lPx * 1.35) + 2 * pad;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const top = bottom - barH - bodyH;
  const wPx = Math.min(22 * k * ts, (W - 2 * pad) / Math.max(1, word.length * 0.8));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", [right ? "right" : "left"]: 56, top, width: W, boxShadow: "0 12px 30px rgba(0,0,0,.3)" }}>
        <div style={{ height: barH, background: colour, color: params.text || "#fff", display: "flex", alignItems: "center", padding: `0 ${pad}px`, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.24em" }}>{word}</div>
        <div style={{ height: bodyH, background: OFF_WHITE, color: ink, display: "flex", alignItems: "center", gap: 18 * k, padding: `0 ${pad}px`, boxSizing: "border-box" }}>
          {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", flexShrink: 0 }} />}
          <div style={{ minWidth: 0, fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.35 }}>
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

/** Natural · caixa de informação (matchday): a compact box — MATCHDAY bar, crest, Home v Away, date · time (exact names). */
export function Natinfobox2({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatInfobox2Frame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}

/** Natural goal · caixa de informação: the box beside his celebration — GOAL bar, crest, his name, his club's exact name. No score. */
export function Goalnatinfobox2({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatInfobox2Frame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
