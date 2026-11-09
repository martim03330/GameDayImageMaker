/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const CREAM = "#efe8dc";
const HEAVY = "var(--font-inter), system-ui, sans-serif";

/**
 * The shared frame of the "circle" natural looks (reference: the Alabama "it's game week." poster — a warm
 * cream sheet, the photo inside a big circle, a tight lowercase heavy headline above it): his real photo,
 * untouched, framed inside a big circle (its own canvas, so his face always lands inside it); above, a
 * stacked lowercase headline in heavy Inter in his club's colour; under the circle two small lines and the
 * crests, and the dark NEYOD logo.
 */
export function NatCircleFrame({ data, head, lines, crests }: { data: RenderData; head: string[]; lines: string[]; crests: (string | null)[] }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const ink = panelColour(params.primary, params.accent);
  const top = (story ? STORY_TOP : 70) - (params.textY ?? 0);
  const longest = Math.max(1, ...head.map((h) => h.length));
  const hPx = Math.min(78 * k * ts, 520 / (longest * 0.6));
  const headH = head.length * hPx * 0.9;
  const D = story ? 900 : 700;
  const cTop = top + headH + 26 * k;
  const cLeft = (CANVAS_W - D) / 2;
  // The photo is framed for the circle's own square: his face in its upper middle.
  const fs = D * 0.2;
  const fx0 = params.side === "left" ? D * 0.42 : params.side === "right" ? D * 0.58 : D / 2;
  const place = natPlace(data, D, D, { fx: fx0, fy: D * 0.36, fs });
  const lPx = 20 * k * ts;
  const crestH = 40 * k;
  const linesTop = cTop + D + 26 * k;
  const footY = (story ? STORY_BOTTOM : H - 40) - (params.textY ?? 0);
  const logoH = story ? 88 : 52;
  const logoW = logoH * (2466 / 807) * (params.logoScale ?? 1);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: CREAM, color: ink }}>
      <div style={{ position: "absolute", left: cLeft, top: cTop, width: D, height: D, borderRadius: "50%", overflow: "hidden", boxShadow: "0 18px 50px rgba(60,40,20,.18)" }}>
        <NatGround place={place} W={D} H={D} />
        <NatFigure data={data} place={place} W={D} H={D} />
      </div>
      {head.map((h, i) => (
        <div key={h + i} style={{ position: "absolute", left: 0, width: CANVAS_W, top: top + i * hPx * 0.9, textAlign: "center", fontFamily: HEAVY, fontWeight: 800, fontSize: hPx, lineHeight: 1, letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>
          {h}
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: linesTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: lPx, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
        {lines.filter(Boolean).map((l) => (
          <div key={l} style={{ whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: linesTop + lines.filter(Boolean).length * lPx * 1.2 + 14 * k, height: crestH, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 * k }}>
        {crests.filter(Boolean).map((c, i) => (
          <img key={i} src={c!} alt="" style={{ height: crestH, width: crestH, objectFit: "contain" }} />
        ))}
      </div>
      <AgencyLogo data={data} height={24} onLight style={{ position: "absolute", left: (CANVAS_W - logoW) / 2, top: footY - logoH - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }} />
    </div>
  );
}

const low = (s: string) => s.toLowerCase();

/**
 * Natural · círculo (matchday): warm cream sheet, his real photo inside a big circle; above it "it's / match /
 * day." stacked in heavy lowercase Inter in his club's colour; under it the venue and date · kick-off in small
 * lowercase, both crests (home first), the dark NEYOD logo.
 */
export function Natcircle({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const w = low(data.content.kicker || "matchday");
  const head = w === "matchday" ? ["it's", "match", "day."] : ["it's", `${w}.`];
  return <NatCircleFrame data={data} head={head} lines={[low(fx.venue), [low(fx.date), fx.kickoff].filter(Boolean).join(" · ")]} crests={[fx.homeCrest, fx.awayCrest]} />;
}

/**
 * Natural goal · círculo: cream sheet, his real celebration photo inside a big circle; "what a / goal." in
 * heavy lowercase in his club's colour above; his name and his club's exact name in small lowercase under it,
 * his club's crest, the dark NEYOD logo. No score.
 */
export function Goalnatcircle({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const crest = data.content.home === false ? fx.awayCrest : fx.homeCrest;
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatCircleFrame data={data} head={["what a", `${low(data.content.kicker || "goal")}.`]} lines={[low(name), ourClub(data)]} crests={[crest]} />;
}
