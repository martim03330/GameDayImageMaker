/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "inset" natural looks (a passe-partout): an off-white border all around and his real
 * photo inside it, untouched; in the wider bottom margin, in ink, the word in serif at the left and the details
 * and crest at the right; the dark NEYOD logo centred in the top margin.
 */
function NatInsetFrame({ data, word, lines, crest }: { data: RenderData; word: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const B = 36;
  const topM = story ? STORY_TOP + 60 : 110;
  const botM = story ? H - STORY_BOTTOM + 150 : 200;
  const pw = CANVAS_W - 2 * B;
  const ph = H - topM - botM;
  const place = natPlace(data, pw, ph, {
    fx: pw * (params.side === "left" ? 0.4 : params.side === "right" ? 0.6 : 0.5),
    fy: ph * 0.3,
    fs: story ? 230 : 150,
  });
  const ink = "#161616";
  const wPx = Math.min(68 * k * ts, 520 / Math.max(1, word.length * 0.52));
  const lPx = 16 * k * ts;
  const crestS = 54 * k;
  const footTop = topM + ph + 26 * k;
  const logoH = story ? 88 : 52;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: OFF_WHITE, color: ink }}>
      <div style={{ position: "absolute", left: B, top: topM, width: pw, height: ph, overflow: "hidden" }}>
        <NatGround place={place} W={pw} H={ph} />
        <NatFigure data={data} place={place} W={pw} H={ph} />
      </div>
      <div style={{ position: "absolute", left: B + 4, top: footTop, fontFamily: SERIF, fontWeight: 600, fontSize: wPx, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", right: B, top: footTop, display: "flex", alignItems: "flex-start", gap: 16 * k }}>
        <div style={{ textAlign: "right", fontFamily: SANS, fontWeight: 600, fontSize: lPx, lineHeight: 1.4 }}>
          {lines.filter(Boolean).map((l) => (
            <div key={l} style={{ whiteSpace: "nowrap" }}>
              {l}
            </div>
          ))}
        </div>
        {crest && <img src={crest} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />}
      </div>
      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", left: "50%", top: (topM - logoH) / 2 - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · moldura interior (matchday): his photo inside an off-white border; "Matchday" in serif, Home v Away and date · time, crest. */
export function Natinset({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "MATCHDAY";
  return (
    <NatInsetFrame
      data={data}
      word={w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()}
      lines={[`${fx.homeName} v ${fx.awayName}`, [fx.date, fx.kickoff].filter(Boolean).join(" · ")]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · moldura interior: his celebration inside the border; "Goal." in serif, his name and his club's exact name, crest. No score. */
export function Goalnatinset({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = data.content.kicker || "GOAL";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatInsetFrame data={data} word={`${w.charAt(0).toUpperCase()}${w.slice(1).toLowerCase()}.`} lines={[name, ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
