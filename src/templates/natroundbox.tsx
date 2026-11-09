import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "round box" natural looks: his real photo full-bleed; at the foot, centred, a rounded
 * hairline outline (no fill but a faint dark tint) around a small block — the word in bold, then two lines. The
 * NEYOD logo alone at the top.
 */
function NatRoundboxFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const W = Math.min(CANVAS_W - 120, 700 * k);
  const pad = 26 * k;
  const wPx = Math.min(48 * k * ts, (W - 2 * pad) / Math.max(1, word.length * 0.66));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const BH = wPx + 12 * k + ls.length * lPx * 1.35 + 2 * pad;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: (CANVAS_W - W) / 2, top: bottom - BH, width: W, height: BH, borderRadius: 30 * k, border: "2px solid rgba(244,241,234,.85)", background: "rgba(10,12,10,.58)", backdropFilter: "blur(4px)", boxSizing: "border-box", padding: pad, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.04em", lineHeight: 1 }}>{word}</div>
        <div style={{ marginTop: 12 * k, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35 }}>
          {ls.map((l) => (
            <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · contorno redondo (matchday): a rounded outline around MATCHDAY, Home v Away, date · time (exact names). */
export function Natroundbox({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatRoundboxFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · contorno redondo: the rounded outline around GOAL, his name, his club's exact name. No score. */
export function Goalnatroundbox({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatRoundboxFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
