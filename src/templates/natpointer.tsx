import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "pointer" natural looks (an annotated photo): his real photo full-bleed; on the side
 * away from him, at the foot, a small label — the word in bold over two lines — and a thin leader line from the
 * label to a dot on his shorts (never near his face). The NEYOD logo alone at the top.
 */
function NatPointerFrame({ data, word, lines }: { data: RenderData; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const left = params.side !== "left";
  const place = natPlace(data, CANVAS_W, H, { fx: left ? 640 : 440, fy: story ? 640 : 460, fs: story ? 230 : 145 });
  const M = 60;
  const wPx = Math.min(46 * k * ts, 380 / Math.max(1, word.length * 0.62));
  const lPx = 17 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const blockH = wPx + 12 * k + ls.length * lPx * 1.35;
  const top = bottom - blockH;
  // On his body, at the shorts (~4.4 face-heights under the face centre, straight below it): the boots are
  // often out of frame, and a dot beside him floated in the air.
  const footY = Math.min(place.fy + place.fs * 4.4, top - 30 * k);
  const footX = place.fx;
  const labelX = left ? M + 360 * k : CANVAS_W - M - 360 * k;
  const elbowY = top + wPx / 2;
  const D = 12 * k;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const side = left ? { left: M, textAlign: "left" as const } : { right: M, textAlign: "right" as const };
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.45) 50%, rgba(0,0,0,.6))" }} />
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} aria-hidden>
        <polyline points={`${labelX},${elbowY} ${(labelX + footX) / 2},${elbowY} ${footX},${footY}`} fill="none" stroke={OFF_WHITE} strokeWidth={1.6 * k} opacity={0.9} />
        <circle cx={footX} cy={footY} r={D / 2} fill={OFF_WHITE} />
      </svg>
      <div style={{ position: "absolute", ...side, top, width: 360 * k - 16 * k }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
        <div style={{ marginTop: 12 * k, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.92 }}>
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

/** Natural · seta-legenda (matchday): a label "Matchday · Home v Away · date" with a leader line to him (exact names). */
export function Natpointer({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return <NatPointerFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[fx.homeName, `v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · seta-legenda: a label "Goal · his name · his club" with a leader line to him. No score. */
export function Goalnatpointer({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatPointerFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} lines={[name, ourClub(data)]} />;
}
