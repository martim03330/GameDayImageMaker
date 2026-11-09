import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "numero" natural looks (an issue number): his real photo full-bleed; at the foot-left
 * a small serif "N°" and, beside it, a large figure in serif (the day of the month; the word when there is no date), the word
 * in tracked caps above and two small lines below. The NEYOD logo alone at the top.
 */
function NatNumeroFrame({ data, figure, word, lines }: { data: RenderData; figure: string; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 600,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const fPx = Math.min(150 * k * ts, 520 / Math.max(1, figure.length * 0.6));
  const nPx = fPx * 0.32;
  const wPx = 15 * k * ts;
  const lPx = 17 * k * ts;
  const ls = lines.filter(Boolean);
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const linesTop = bottom - ls.length * lPx * 1.35;
  const fTop = linesTop - 14 * k - fPx * 0.82;
  const wTop = fTop - 14 * k - wPx;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M + 2, top: wTop, fontFamily: SANS, fontWeight: 700, fontSize: wPx, letterSpacing: "0.28em", lineHeight: 1, opacity: 0.9 }}>{word}</div>
      <div style={{ position: "absolute", left: M, top: fTop - fPx * 0.12, display: "flex", alignItems: "flex-start", gap: 10 * k, fontFamily: SERIF, lineHeight: 1, whiteSpace: "nowrap" }}>
        {/^\d+$/.test(figure) && <span style={{ fontSize: nPx, fontWeight: 500, marginTop: fPx * 0.16 }}>N°</span>}
        <span style={{ fontSize: fPx, fontWeight: 600, letterSpacing: "-0.04em" }}>{figure}</span>
      </div>
      <div style={{ position: "absolute", left: M + 2, right: M, top: linesTop, fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.92 }}>
        {ls.map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

const day = (date: string) => date.match(/^(\d{1,2})/)?.[1] ?? "";

/** Natural · número (matchday): MATCHDAY, "N° 25" in serif (the day), Home v Away and month · time under it (exact names). */
export function Natnumero({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const d = day(fx.date);
  const rest = fx.date.replace(/^\d{1,2}\s*/, "");
  return <NatNumeroFrame data={data} figure={d || (data.content.kicker || "MATCHDAY").toUpperCase()} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [rest, fx.kickoff].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · número: GOAL, "N° <day>" in serif (the match day — never a made-up goal count), his name and his club's exact name. No score. */
export function Goalnatnumero({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const word = (data.content.kicker || "GOAL").toUpperCase();
  return <NatNumeroFrame data={data} figure={day(fx.date) || word} word={word} lines={[name, ourClub(data)]} />;
}
