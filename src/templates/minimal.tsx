/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { rng } from "./kit";
import { lift } from "./column";
import { standing } from "./mist";
import { competitionOf, crestsOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour } from "./wall";
import { CrestMarkDefs } from "./profile";

const WHITE = "#ffffff";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** The club colour taken down to a deep, velvety ground (claret stays claret, yellow turns to ochre-brown). */
function deepGround(c: string): string {
  let g = c;
  for (let i = 0; i < 12 && luminance(g) > 0.038; i++) g = shade(g, -0.12);
  // A black club would be a void: lift it to a soft charcoal of its own hue.
  if (luminance(g) < 0.012) g = shade(g, 0.14);
  return g;
}

/** Small spaced caps, shrunk to stay inside `width`. */
function capsSize(text: string, width: number, max: number, tracking: number): number {
  return Math.min(max, width / Math.max(1, [...text].length * (0.52 + tracking)));
}

/**
 * Ultra-minimal club post (Aston Villa celebration): a flat, deep club-colour field with a faint vignette and
 * fine grain, a tiny white crest mark centred above, and the celebrating player small in the middle on a
 * soft oval shadow, lightly graded into the colour of the room. Nothing else but one discreet line of
 * spaced caps near the foot (MATCHDAY · V OPPONENT · SAT 10 OCT · 15:00), a fainter second line and a
 * tiny agency mark.
 */
export function Minimal({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 41);
  const club = clubColour(data);
  const ground = deepGround(club);
  const top = shade(ground, 0.07);
  const bottom = shade(ground, -0.38);

  // ---- the player: small, centred, feet on an invisible floor ----
  const cx = 540 + (r() - 0.5) * 30;
  const headTop = 452 + (r() - 0.5) * 20;
  const floor = 1060 + (r() - 0.5) * 16;
  const placed = standing(data, { cx, headTop, floor, maxFace: 92, framing: "full" });
  const { box, style: figMask } = lift(data, placed, headTop + placed.faceH * 0.2);
  // A very wide pose (arms out) would dwarf the frame: keep the whole figure inside ~70% of the width.
  let fig = box;
  if (fig.width > 760) {
    const k = 760 / fig.width;
    const floorY = fig.top + fig.height;
    fig = { ...fig, width: fig.width * k, height: fig.height * k, left: cx - (cx - fig.left) * k, top: floorY - fig.height * k, faceCx: fig.faceCx, faceTop: floorY - (floorY - fig.faceTop) * k, faceH: fig.faceH * k };
  }
  const floorY = fig.top + fig.height;

  // ---- the mark above ----
  const md = postType === "matchday" || postType === "result" || postType === "goal" ? matchFacts(data) : null;
  const score = scoreOf(data, "–");
  const both = crestsOf(data);
  const transferCrest = postType === "transfer" ? (data.toClub ?? data.club)?.crestUrl ?? null : null;
  const pair = (postType === "matchday" || postType === "result") && both.length === 2 ? both : null;
  const single = transferCrest ?? data.club?.crestUrl ?? both[0] ?? null;
  const markSize = 62;
  const markTop = Math.max(250, Math.min(330, fig.top - 150)) - markSize / 2;
  const between = postType === "result" && score ? score : "v";

  // ---- the one line of words ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const kicker = content.kicker.toUpperCase().trim();
  const until = (content.until ?? "").toUpperCase().trim();
  const vsOpp = md?.opp ? `V ${md.opp}` : "";
  const facts = shortFacts(data, 3).map((s) => `${s.value} ${s.label}`.toUpperCase());
  const comp = md ? [md.comp || competitionOf(data), md.round].filter(Boolean).join(" · ") : competitionOf(data);
  let line: string[];
  let sub: string[];
  switch (postType) {
    case "matchday":
      line = [kicker || "MATCHDAY", vsOpp, md?.date ?? "", md?.time ?? ""];
      sub = [comp, md?.venue ?? ""];
      break;
    case "result":
      line = [kicker || "FULL TIME", score && content.homeTeam && content.awayTeam ? `${content.homeTeam} ${score} ${content.awayTeam}` : score && md?.opp ? `${score} V ${md.opp}` : score || vsOpp];
      sub = [comp, md?.date ?? ""];
      break;
    case "goal":
      line = [kicker || "GOAL", score, vsOpp];
      sub = [name, comp];
      break;
    case "renewal":
      line = [kicker || "NEW DEAL", until ? (/^\d{4}$/.test(until) ? `UNTIL ${until}` : until.startsWith("UNTIL") ? until : `UNTIL ${until}`) : ""];
      sub = [name];
      break;
    case "transfer":
      line = [kicker || "WELCOME", (data.toClub ?? data.club)?.name.toUpperCase() ?? ""];
      sub = [name];
      break;
    default:
      line = [kicker, facts.join(" · ") || vsOpp];
      sub = [name, comp];
  }
  const lineText = line.filter(Boolean).join("  ·  ");
  const subText = sub.filter(Boolean).join("  ·  ");
  const ts = params.textScale ?? 1;
  const lineSize = capsSize(lineText, 860, 21 * ts, 0.32);
  const subSize = capsSize(subText, 820, 15 * ts, 0.34);
  const textBottom = 136;

  const caps: CSSProperties = { position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: CONDENSED, color: WHITE, whiteSpace: "nowrap", textTransform: "uppercase" };
  const mono: CSSProperties = { width: markSize, height: markSize, objectFit: "contain", filter: "url(#minimal-mono)", opacity: 0.94 };

  // Ambient grade: the room's colour washed softly over the kit and skin, strongest at the feet.
  const tintMask = data.photoUrl
    ? ({ WebkitMaskImage: `url("${data.photoUrl}")`, maskImage: `url("${data.photoUrl}")`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" } as CSSProperties)
    : {};

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ground }}>
      <CrestMarkDefs id="minimal-mono" />
      {/* The field: lighter above, sinking into shadow below, a faint vignette. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${top} 0%, ${ground} 45%, ${bottom} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 45% at 50% 50%, ${shade(club, -0.35)}33, transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 42%, transparent 52%, rgba(0,0,0,.34) 100%)" }} />

      {/* Crest mark (or the two crests either side of a small v / the score). */}
      <div style={{ position: "absolute", left: 0, right: 0, top: markTop, height: markSize, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        {pair ? (
          <>
            <img src={pair[0]} alt="" style={mono} />
            <span style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: between === "v" ? 24 : 30, letterSpacing: "0.12em", color: WHITE, opacity: 0.9, lineHeight: 1 }}>{between}</span>
            <img src={pair[1]} alt="" style={mono} />
          </>
        ) : single ? (
          <img src={single} alt="" style={mono} />
        ) : null}
      </div>

      {/* Floor shadow: a wide soft oval and a tighter core under the boots. */}
      {data.photoUrl && fig.feet && (
        <>
          <div style={{ position: "absolute", left: fig.faceCx - 300, width: 600, top: floorY - 46, height: 92, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.42), rgba(0,0,0,0))", filter: "blur(12px)" }} />
          <div style={{ position: "absolute", left: fig.faceCx - 150, width: 300, top: floorY - 16, height: 30, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.55), rgba(0,0,0,0))", filter: "blur(5px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, ...figMask }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", filter: "contrast(1.05) saturate(.92) brightness(.97)" }} />
          <div style={{ position: "absolute", inset: 0, ...tintMask, background: `linear-gradient(to bottom, ${club} 0%, ${ground} 100%)`, mixBlendMode: "soft-light", opacity: 0.5 }} />
          <div style={{ position: "absolute", inset: 0, ...tintMask, background: `linear-gradient(to bottom, transparent 55%, ${bottom} 100%)`, mixBlendMode: "multiply", opacity: 0.45 }} />
        </div>
      )}
      {!fig.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: `linear-gradient(to bottom, transparent, ${bottom} 75%)` }} />}

      {lineText && (
        <div style={{ ...caps, bottom: textBottom + (subText ? subSize * 1.3 + 12 : 0), fontWeight: 600, fontSize: lineSize, letterSpacing: "0.32em", opacity: 0.95 }}>{lineText}</div>
      )}
      {subText && <div style={{ ...caps, bottom: textBottom, fontWeight: 500, fontSize: subSize, letterSpacing: "0.34em", opacity: 0.55 }}>{subText}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={18} style={{ color: WHITE, opacity: 0.6 }} />
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}
