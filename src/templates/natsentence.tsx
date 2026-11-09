import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-dmserif), Georgia, serif";

/**
 * The shared frame of the "sentence" natural looks: his real photo full-bleed; at the foot one sentence in a
 * large serif, set like a magazine standfirst over two or three lines, its key words in italic. Nothing else
 * but the NEYOD logo at the top and a soft shade under the sentence.
 */
function NatSentenceFrame({ data, parts }: { data: RenderData; parts: { t: string; i?: boolean }[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 430 : params.side === "right" ? 650 : 540,
    fy: story ? 640 : 470,
    fs: story ? 240 : 150,
  });
  const M = 64;
  const len = parts.reduce((n, p) => n + p.t.length, 0);
  // Three lines at most: the size follows the sentence's length.
  const sPx = Math.min(58 * k * ts, ((CANVAS_W - 2 * M) * 3) / Math.max(1, len * 0.48));
  const lines = Math.ceil((len * 0.48 * sPx) / (CANVAS_W - 2 * M));
  const bottom = (story ? STORY_BOTTOM : H - 64) - (params.textY ?? 0);
  const top = bottom - lines * sPx * 1.12;
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 240 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.5) 45%, rgba(0,0,0,.68))" }} />
      <div style={{ position: "absolute", left: M, right: M, top, fontFamily: SERIF, fontSize: sPx, lineHeight: 1.12, letterSpacing: "-0.01em", textShadow: "0 2px 14px rgba(0,0,0,.35)" }}>
        {parts.map((p, i) => (
          <span key={i} style={{ fontStyle: p.i ? "italic" : "normal" }}>
            {p.t}
          </span>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · frase (matchday): "It's matchday: Home v Away, date at time." — the word and the teams in italic (exact names). */
export function Natsentence({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = (data.content.kicker || "matchday").toLowerCase();
  const when = [fx.date && `, ${fx.date}`, fx.time && ` at ${fx.kickoff}`].filter(Boolean).join("");
  return <NatSentenceFrame data={data} parts={[{ t: "It's " }, { t: w, i: true }, { t: ": " }, { t: `${fx.homeName} v ${fx.awayName}`, i: true }, { t: `${when}.` }]} />;
}

/** Natural goal · frase: "A goal for SC Vianense SAD, by Moisés Conceição." — club and name in italic (exact club name). No score. */
export function Goalnatsentence({ data }: { data: RenderData }) {
  const w = (data.content.kicker || "goal").toLowerCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatSentenceFrame data={data} parts={[{ t: `A ${w} for ` }, { t: ourClub(data), i: true }, { t: ", by " }, { t: name, i: true }, { t: "." }]} />;
}
