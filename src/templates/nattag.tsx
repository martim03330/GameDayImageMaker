import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "tag" natural looks (a luggage / price tag): his real photo full-bleed; on the side
 * away from him, in the lower half, an off-white tag with a pointed end and a punched hole, holding the word
 * in bold in his club's colour and two small lines. The NEYOD logo alone at the top.
 */
function NatTagFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right"; // the tag sits away from him
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 450 : 630, fy: story ? 700 : 510, fs: story ? 245 : 155 });
  const ink = panelColour(params.primary, params.accent);
  const W = 400 * k;
  const point = 54 * k;
  const pad = 28 * k;
  const wPx = Math.min(46 * k * ts, (W - point - 2 * pad) / Math.max(1, word.length * 0.64));
  const lPx = 16 * k * ts;
  const ls = lines.filter(Boolean);
  const TH = pad * 2 + wPx + 12 * k + ls.length * lPx * 1.35;
  const bottom = (story ? STORY_BOTTOM : H - 64) - (params.textY ?? 0);
  const top = bottom - TH;
  const x = right ? CANVAS_W - 48 - W : 48;
  const shape = right
    ? `polygon(${point}px 0, 100% 0, 100% 100%, ${point}px 100%, 0 50%)`
    : `polygon(0 0, calc(100% - ${point}px) 0, 100% 50%, calc(100% - ${point}px) 100%, 0 100%)`;
  const hole = 14 * k;
  const textLeft = right ? point + pad : pad;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: x, top, width: W, height: TH, filter: "drop-shadow(0 10px 24px rgba(0,0,0,.35))" }}>
        <div style={{ position: "absolute", inset: 0, background: OFF_WHITE, clipPath: shape }} />
        <div style={{ position: "absolute", left: right ? point * 0.62 - hole / 2 : W - point * 0.62 - hole / 2, top: TH / 2 - hole / 2, width: hole, height: hole, borderRadius: "50%", background: "#2b3a2a", opacity: 0.85 }} />
        <div style={{ position: "absolute", left: textLeft, top: pad, width: W - point - 2 * pad, color: ink }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1 }}>{word}</div>
          <div style={{ marginTop: 12 * k }}>
            {ls.map((l) => (
              <div key={l} style={{ fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

/** Natural · etiqueta de preço (matchday): a tag reading MATCHDAY, Home v Away, date · time (exact names). */
export function Nattag({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return <NatTagFrame data={data} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · etiqueta de preço: a tag reading GOAL, his name, his club's exact name, beside his celebration. No score. */
export function Goalnattag({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatTagFrame data={data} word={(data.content.kicker || "GOAL").toUpperCase()} lines={[name, ourClub(data)]} />;
}
