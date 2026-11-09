import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, MONO, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const MONTHS: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/**
 * The shared frame of the "date stack" natural looks: his real photo full-bleed; on the side away from him, at
 * the foot, the day and the month as two stacked two-digit numbers in heavy mono ("25" over "10") with a
 * hairline between them, and beside the stack the word in bold over two small lines. The NEYOD logo at the top.
 */
function NatDatestackFrame({ data, day, month, word, lines }: { data: RenderData; day: string; month: string; word: string; lines: string[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 620,
    fy: story ? 690 : 500,
    fs: story ? 245 : 155,
  });
  const M = 60;
  const nPx = 92 * k * ts;
  const stackW = nPx * 1.24;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const stackH = nPx * 2 + 18 * k;
  const top = bottom - stackH;
  const x = M + stackW + 30 * k;
  const wPx = Math.min(44 * k * ts, (CANVAS_W - x - M) / Math.max(1, word.length * 0.62));
  const lPx = 18 * k * ts;
  const ls = lines.filter(Boolean);
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const num = { position: "absolute", left: M, width: stackW, fontFamily: MONO, fontWeight: 700, fontSize: nPx, letterSpacing: "-0.06em", lineHeight: 1, textAlign: "center" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 200 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.52) 50%, rgba(0,0,0,.68))" }} />
      <div style={{ ...num, top }}>{day}</div>
      <div style={{ position: "absolute", left: M, top: top + nPx + 8 * k, width: stackW, height: 2, background: OFF_WHITE }} />
      <div style={{ ...num, top: top + nPx + 18 * k }}>{month}</div>
      <div style={{ position: "absolute", left: x, right: M, top, height: stackH, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: wPx, letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap" }}>{word}</div>
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

const dayMonth = (date: string): [string, string] => {
  const m = date.toUpperCase().match(/^(\d{1,2})\s+([A-Z]{3})/);
  return m ? [m[1].padStart(2, "0"), MONTHS[m[2]] ?? "--"] : ["--", "--"];
};

/** Natural · data empilhada (matchday): "25 / 10" stacked in mono; MATCHDAY, Home v Away and kick-off · venue beside it (exact names). */
export function Natdatestack({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const [d, m] = dayMonth(fx.date);
  return <NatDatestackFrame data={data} day={d} month={m} word={(data.content.kicker || "MATCHDAY").toUpperCase()} lines={[`${fx.homeName} v ${fx.awayName}`, [fx.kickoff, fx.venue].filter(Boolean).join(" · ")]} />;
}

/** Natural goal · data empilhada: the date stacked; GOAL, his name and his club's exact name beside it. No score. */
export function Goalnatdatestack({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const word = (data.content.kicker || "GOAL").toUpperCase();
  // No date on the edit: the stack spells the word instead of "-- / --".
  const [d, m] = fx.date ? dayMonth(fx.date) : [word.slice(0, 2), word.slice(2, 4)];
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatDatestackFrame data={data} day={d} month={m} word={word} lines={[name, ourClub(data)]} />;
}
