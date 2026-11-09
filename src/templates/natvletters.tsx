import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "vertical letters" natural looks (a hotel sign): his real photo full-bleed; down the edge
 * away from him the word's letters stacked one per line, upright, in heavy caps, evenly spaced from under the logo
 * to the foot; at the foot on the other side of the column, two small lines. The NEYOD logo alone at the top.
 */
function NatVlettersFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 630 : 450, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const M = 56;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const top = logoTop + (story ? 88 : 52) + 50 * k;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const letters = [...word];
  const step = (bottom - top) / Math.max(1, letters.length);
  const lPx = Math.min(step * 0.82, 110 * k * ts);
  const colW = lPx * 0.9;
  const dPx = 17 * k * ts;
  const ls = lines.filter(Boolean);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [left ? "left" : "right"]: 0, width: colW + 2 * M + 120, background: `linear-gradient(to ${left ? "right" : "left"}, rgba(0,0,0,.5), rgba(0,0,0,0))` }} />
      {letters.map((c, i) => (
        <div key={i} style={{ position: "absolute", [left ? "left" : "right"]: M, width: colW, top: top + i * step + (step - lPx) / 2, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: lPx, lineHeight: 1 }}>
          {c}
        </div>
      ))}
      <div style={{ position: "absolute", [left ? "left" : "right"]: M + colW + 30 * k, top: bottom - ls.length * dPx * 1.4, fontFamily: SANS, fontWeight: 500, fontSize: dPx, lineHeight: 1.4, textAlign: left ? "left" : "right", textShadow: "0 1px 8px rgba(0,0,0,.5)" }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · letras verticais (matchday): M-A-T-C-H-D-A-Y stacked down the edge; Home v Away and date · time at the foot (exact names). */
export function Natvletters({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatVlettersFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · letras verticais: G-O-A-L stacked down the edge beside his celebration; his name and his club's exact name. No score. */
export function Goalnatvletters({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatVlettersFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
