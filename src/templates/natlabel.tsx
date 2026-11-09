/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, natFixture, natPlace } from "./natkit";
import { panelColour } from "./natpanel";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";

/**
 * The shared frame of the "label" natural looks: his real photo full-bleed, untouched, shown like a print on
 * a gallery wall — and, in the lower corner away from him, a small white museum label: a tiny tag in his
 * club's colour, the title in serif, a hairline, then two lines of small text. Nothing else on the photo but
 * the NEYOD logo at the top.
 */
function NatLabelFrame({ data, tag, title, lines, crest }: { data: RenderData; tag: string; title: string; lines: string[]; crest: string | null }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const right = params.side !== "right"; // the label sits away from him
  const place = natPlace(data, CANVAS_W, H, { fx: right ? 470 : 610, fy: story ? 700 : 520, fs: story ? 250 : 160 });
  const ink = panelColour(params.primary, params.accent);
  const W = 400 * k;
  const pad = 26 * k;
  const bottom = (story ? STORY_BOTTOM : H - 56) - (params.textY ?? 0);
  const tPx = Math.min(40 * k * ts, (W - 2 * pad) / Math.max(1, title.length * 0.5));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.28), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", [right ? "right" : "left"]: 56, bottom: H - bottom, width: W, background: "#fbfaf7", color: "#161616", padding: pad, boxShadow: "0 10px 30px rgba(0,0,0,.28)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 13 * k, letterSpacing: "0.22em", color: "#fff", background: ink, padding: `${5 * k}px ${9 * k}px` }}>{tag}</span>
          {crest && <img src={crest} alt="" style={{ width: 40 * k, height: 40 * k, objectFit: "contain" }} />}
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: tPx, lineHeight: 1.08, marginTop: 16 * k, letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ height: 1, background: "#161616", opacity: 0.3, margin: `${14 * k}px 0 ${12 * k}px` }} />
        {lines.filter(Boolean).map((l) => (
          <div key={l} style={{ fontFamily: SANS, fontSize: 15 * k * ts, lineHeight: 1.5, opacity: 0.78, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l}
          </div>
        ))}
      </div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Natural · etiqueta (matchday): the label reads MATCHDAY / "Home v Away" / date · time / venue. */
export function Natlabel({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  return (
    <NatLabelFrame
      data={data}
      tag={(data.content.kicker || "MATCHDAY").toUpperCase()}
      title={`${fx.homeName} v ${fx.awayName}`}
      lines={[[fx.date, fx.kickoff].filter(Boolean).join(" · "), fx.venue]}
      crest={data.content.home === false ? fx.awayCrest : fx.homeCrest}
    />
  );
}

/** Natural goal · etiqueta: his celebration photo; the label reads GOAL / his name / his club's exact name. No score. */
export function Goalnatlabel({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  return <NatLabelFrame data={data} tag={(data.content.kicker || "GOAL").toUpperCase()} title={name} lines={[ourClub(data)]} crest={data.content.home === false ? fx.awayCrest : fx.homeCrest} />;
}
