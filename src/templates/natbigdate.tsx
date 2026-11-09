import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "big date" natural looks (a calendar page): his real photo full-bleed; at the
 * foot-left the day of the month huge in heavy sans, and beside it, stacked to its height, the month in bold
 * caps and two small lines. The NEYOD logo alone at the top. Without a date, the word takes the big slot.
 */
function NatBigdateFrame({ data, big, month, lines }: { data: RenderData; big: string; month: string; lines: string[] }) {
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
  const M = 56;
  // Digits ~0.6 em; a word instead of a date (no date set) is measured as caps and kept to ~400px, so the
  // lines beside it never run under it.
  const digits = /^\d+$/.test(big);
  const em = digits ? big.length * 0.6 : capsEm(big, -0.06);
  const bPx = Math.min(200 * k * ts, (digits ? 520 : 400) / Math.max(1, em));
  const mPx = 34 * k * ts;
  const lPx = 17 * k * ts;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const top = bottom - bPx * 0.78;
  const x = M + em * bPx + 26 * k;
  const ls = lines.filter(Boolean);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 220 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M - bPx * 0.04, top: top - bPx * 0.12, fontFamily: SANS, fontWeight: 800, fontSize: bPx, letterSpacing: "-0.06em", lineHeight: 1, whiteSpace: "nowrap" }}>{big}</div>
      <div style={{ position: "absolute", left: x, right: M, top, height: bPx * 0.78, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: mPx, letterSpacing: "0.08em", lineHeight: 1 }}>{month}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: lPx, lineHeight: 1.35, opacity: 0.92 }}>
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

const split = (date: string) => {
  const m = date.match(/^(\d{1,2})\s+(.+)$/);
  return m ? { day: m[1], month: m[2].toUpperCase() } : null;
};

/** Natural · data grande (matchday): the day huge ("25"), OCT beside it with Home v Away and kick-off · venue (exact names). */
export function Natbigdate({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const d = split(fx.date);
  const word = (data.content.kicker || "MATCHDAY").toUpperCase();
  return <NatBigdateFrame data={data} big={d?.day ?? word} month={d ? `${d.month} · ${word}` : ""} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · data grande: the day huge, the month and GOAL beside it, his name and his club's exact name. No score. */
export function Goalnatbigdate({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const d = split(fx.date);
  const word = (data.content.kicker || "GOAL").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatBigdateFrame data={data} big={d?.day ?? word} month={d ? `${d.month} · ${word}` : ""} lines={[name, ourClub(data)]} />;
}
