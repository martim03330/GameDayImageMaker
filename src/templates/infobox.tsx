/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { PRINT_GRAIN } from "./column";
import { rng } from "./kit";
import { scoreOf } from "./outline";
import { dateParts, orderedCrests, paperInk, teamsOf } from "./roughname";
import { AgencyLogo, CONDENSED } from "./shared";
import { fadeBelow, matchFacts, placeFace } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { MonoDefs } from "./wall";

const DAYS: Record<string, string> = { MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY" };
const INK = "#1b1b1d";
const PAPER = "#f1f0ee";

/** Barlow Condensed ExtraBold capitals: average advance relative to the size. */
const BARLOW_W = 0.47;
const fitBarlow = (t: string, w: number, max: number, ratio = BARLOW_W) => Math.min(max, w / Math.max(1, [...t].length * ratio));

/** Triangle wave over the noise value: `peaks` ridges between 0 and 1. */
const tri = (peaks: number) => Array.from({ length: peaks * 2 + 1 }, (_, i) => (i % 2 ? 1 : 0)).join(" ");

/** Wavy zebra bands: low-frequency noise folded into equal bands, coloured `color` on white. */
function ZebraDefs({ id, color, seed, peaks = 8 }: { id: string; color: string; seed: number; peaks?: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0036 0.005" numOctaves={1} seed={seed} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -0.6" result="v" />
      <feGaussianBlur in="v" stdDeviation="3" result="vs" />
      <feComponentTransfer in="vs" result="bands">
        <feFuncA type="table" tableValues={tri(peaks)} />
      </feComponentTransfer>
      {/* A steep, anti-aliased cut at the middle of each fold. */}
      <feComponentTransfer in="bands" result="cut">
        <feFuncA type="linear" slope={34} intercept={-16.5} />
      </feComponentTransfer>
      <feFlood floodColor={color} />
      <feComposite in2="cut" operator="in" />
    </filter>
  );
}

/** Thin topographic contour lines: the outlines of the same folded bands. */
function TopoDefs({ id, seed }: { id: string; seed: number }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0017 0.0023" numOctaves={2} seed={seed} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.9 0 0 0 -0.45" result="v" />
      <feGaussianBlur in="v" stdDeviation="5" result="vs" />
      <feComponentTransfer in="vs" result="bands">
        <feFuncA type="table" tableValues={tri(11)} />
      </feComponentTransfer>
      <feComponentTransfer in="bands" result="cut">
        <feFuncA type="linear" slope={30} intercept={-14.5} />
      </feComponentTransfer>
      {/* Keep only a hairline around each band. */}
      <feMorphology in="cut" operator="dilate" radius={1} result="fat" />
      <feComposite in="fat" in2="cut" operator="out" result="lines" />
      <feFlood floodColor="#8d8c89" />
      <feComposite in2="lines" operator="in" />
    </filter>
  );
}

/**
 * Brazilian matchday card (Atlético-MG vs São Paulo): white paper with faint topographic contours, a club
 * colour square of bold wavy zebra bands behind the player's head, the player waist-up celebrating, a tall
 * club-colour tab with both crests as white marks, and a club-colour block under a white info card, both
 * with offset black shadow blocks. The card holds the date, the two teams ("VS." in the club colour) and
 * the kick-off; the competition and the agency sit along the foot.
 */
export function Infobox({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 60;
  const r = rng(seed);
  const club = paperInk(data);
  const facts = matchFacts(data);
  const flip = params.side === "left";
  // Mirror a box (left-based) when the layout is flipped.
  const X = (x: number, w: number) => (flip ? CANVAS_W - x - w : x);
  const sh = flip ? -1 : 1;

  // ---- blocks (reference coordinates ×1.25) ----
  const jit = () => (r() - 0.5) * 24;
  const zebra = { x: 150 + jit(), y: 118 + jit(), w: 532, h: 536 };
  const tab = { x: 764, y: 206 + jit() * 0.5, w: 156 };
  const block = { x: 184, y: 642, w: 510, h: 308 };
  const card = { x: 350, y: 704, w: 536, h: 324 };

  // ---- the player, waist-up, behind the card ----
  const fig = placeFace(data, X(588, 0) + jit() * 0.5, 150 + r() * 16, 168 * (params.framing === "chest" ? 1.15 : params.framing === "full" ? 0.8 : 1), 1110);
  const figFade = fadeBelow(fig, 990, 1050);
  // Beside the card (past its shadow) the player fades out above the card's top edge: an arm there reads as tucked behind it.
  const edge = card.x + card.w + 18;
  const sideMask = `linear-gradient(${flip ? "to left" : "to right"}, #000 ${edge}px, transparent ${edge + 1}px), linear-gradient(to bottom, #000 ${card.y - 120}px, transparent ${card.y}px)`;
  const figClip: CSSProperties = { WebkitMaskImage: sideMask, maskImage: sideMask };

  // ---- crests (white marks on the tab) ----
  const crests = orderedCrests(data);
  const crestSize = 116;
  const tabH = crests.length > 1 ? 336 : crests.length ? 200 : 0;

  // ---- card text ----
  const [home, away] = teamsOf(data);
  const score = scoreOf(data);
  const withScore = (postType === "result" || postType === "goal") && !!score;
  const [hg, ag] = withScore ? score.split("-") : ["", ""];
  const d = dateParts(data);
  const dateLine = d ? `${d.dd}/${d.mm}/${d.yyyy}` : (content.date ?? "").toUpperCase();
  const textW = card.w - 100 - (withScore ? 70 : 0);
  const teamSize = Math.min(fitBarlow(home || "—", textW, 62), fitBarlow(`VS. ${away || "—"}`, textW, 62));
  const lastLine =
    postType === "result" ? content.kicker.toUpperCase() : postType === "goal" ? [content.kicker.toUpperCase(), content.time ? `AT ${content.time}` : ""].filter(Boolean)[0] : content.time ? `AT ${content.time}` : facts.venue;
  const SMALL: CSSProperties = { fontFamily: CONDENSED, fontWeight: 500, fontSize: 27, letterSpacing: "0.03em", color: INK, lineHeight: 1, whiteSpace: "nowrap" };
  const TEAM: CSSProperties = { fontFamily: CONDENSED, fontWeight: 800, fontSize: teamSize, lineHeight: 1.02, color: INK, whiteSpace: "nowrap", letterSpacing: "0.005em" };
  const goals = (g: string) => (withScore ? <span style={{ fontWeight: 800, color: club, marginLeft: "auto", paddingLeft: 18 }}>{g}</span> : null);

  const topLine = postType === "result" ? (dateLine ? `FULL TIME · ${dateLine}` : "FULL TIME") : dateLine;

  // ---- foot ----
  const comp = facts.comp;
  const round = facts.round;
  const footRight: ReactNode = (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      {round && <div style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: 21, letterSpacing: "0.04em", color: INK, whiteSpace: "nowrap" }}>{round}</div>}
      {(data.agency.logoUrl || data.agency.name) && (
        <div style={{ background: club, padding: "12px 22px", display: "flex", alignItems: "center", boxShadow: `${sh * 6}px 7px 0 ${INK}` }}>
          <AgencyLogo data={data} height={26} style={{ color: "#fff" }} />
        </div>
      )}
    </div>
  );

  const box = (x: number, y: number, w: number, h: number, style: CSSProperties) => <div style={{ position: "absolute", left: X(x, w), top: y, width: w, height: h, ...style }} />;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <TopoDefs id="infobox-topo" seed={seed % 89} />
          <ZebraDefs id="infobox-zebra" color={club} seed={(seed % 71) + 5} />
        </defs>
      </svg>
      <MonoDefs id="infobox-mono" ink={0.62} />

      {/* Topographic paper. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <rect width={CANVAS_W} height={CANVAS_H} filter="url(#infobox-topo)" />
      </svg>

      {/* Zebra square behind the head. */}
      <svg width={zebra.w} height={zebra.h} style={{ position: "absolute", left: X(zebra.x, zebra.w), top: zebra.y }}>
        <rect width={zebra.w} height={zebra.h} fill="#fbfbfa" />
        <rect width={zebra.w} height={zebra.h} filter="url(#infobox-zebra)" />
      </svg>

      {/* Club block under the card. */}
      {box(block.x, block.y, block.w, block.h, { background: club })}

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, ...figClip }}>
          <div style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, filter: "drop-shadow(0 20px 26px rgba(0,0,0,.28))" }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...figFade }} />
          </div>
        </div>
      )}

      {/* Crest tab with its shadow block. */}
      {tabH > 0 && (
        <>
          {box(tab.x + 16, tab.y + 30, tab.w, tabH, { background: INK })}
          {box(tab.x, tab.y, tab.w, tabH, { background: club, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", paddingBlock: 18 })}
          <div style={{ position: "absolute", left: X(tab.x, tab.w), top: tab.y, width: tab.w, height: tabH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: "url(#infobox-mono)" }} />
            ))}
          </div>
        </>
      )}

      {/* Info card with its shadow block. */}
      {box(card.x + 18, card.y + 34, card.w, card.h, { background: INK })}
      <div
        style={{
          position: "absolute",
          left: X(card.x, card.w),
          top: card.y,
          width: card.w,
          height: card.h,
          background: "#f4f3f1",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
          padding: "0 50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {topLine && <div style={{ ...SMALL, fontSize: fitBarlow(topLine, card.w - 100, 27, 0.44), marginBottom: 22 }}>{topLine}</div>}
        <div style={{ ...TEAM, display: "flex" }}>
          <span>{home || (data.club?.name ?? "").toUpperCase()}</span>
          {goals(hg)}
        </div>
        <div style={{ ...TEAM, display: "flex" }}>
          <span>
            <span style={{ color: club }}>VS. </span>
            {away}
          </span>
          {goals(ag)}
        </div>
        <div style={{ height: 24 }} />
        {lastLine && (
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ ...SMALL, fontSize: fitBarlow(lastLine, 300, 27, 0.44) }}>{lastLine}</div>
            <div style={{ flex: 1, height: 2, background: INK, opacity: 0.8 }} />
          </div>
        )}
      </div>

      {/* Foot: competition left, agency pill right. */}
      <div style={{ position: "absolute", left: 196, right: 160, top: 1178, display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: flip ? "row-reverse" : "row", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          {facts.ourCrest && <img src={facts.ourCrest} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />}
          {comp && <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: fitBarlow(comp, 330, 31), color: INK, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{comp}</div>}
        </div>
        {footRight}
      </div>

      <div data-bleed style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.12, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
