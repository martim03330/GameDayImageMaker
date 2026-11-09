import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "chips" natural looks (app UI): his real photo full-bleed; at the foot-left the
 * word in bold and, under it, a row of small rounded chips — outlined in off-white, the first filled — each
 * holding one fact. The NEYOD logo alone at the top. A soft shade only under the type.
 */
function NatChipsFrame({ data, word, chips }: { data: RenderData; word: string; chips: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 560,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const cPx = 17 * k * ts;
  const chipH = cPx + 22 * k;
  const wPx = Math.min(84 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.62));
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const rowTop = bottom - chipH;
  const wTop = rowTop - 22 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 50%, rgba(0,0,0,.66))" }} />
      <div style={{ position: "absolute", left: M, top: wTop, fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: rowTop, height: chipH, display: "flex", gap: 10 * k, flexWrap: "nowrap", overflow: "hidden" }}>
        {chips.filter(Boolean).map((c, i) => (
          <span
            key={c + i}
            style={{
              flexShrink: i === 0 ? 0 : 1,
              minWidth: 0,
              height: chipH,
              display: "inline-flex",
              alignItems: "center",
              padding: `0 ${16 * k}px`,
              borderRadius: 999,
              border: `${1.5 * k}px solid ${OFF_WHITE}`,
              background: i === 0 ? OFF_WHITE : "rgba(0,0,0,.2)",
              color: i === 0 ? "#161616" : OFF_WHITE,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: cPx,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {c}
          </span>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · pastilhas (matchday): "Matchday" over chips: date · kick-off · v opponent (exact name). */
export function Natchips({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  const opp = data.content.home === false ? fx.homeName : fx.awayName;
  return <NatChipsFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} chips={[fx.date, fx.kickoff, opp ? `v ${opp}` : ""]} />;
}

/** Natural goal · pastilhas: "Goal" over chips: his name · his club's exact name, on his celebration. No score. */
export function Goalnatchips({ data }: { data: RenderData }) {
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatChipsFrame data={data} word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()} chips={[name, ourClub(data)]} />;
}
