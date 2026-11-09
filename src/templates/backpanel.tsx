/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { Paper, rng } from "./kit";
import { AgencyLogo, BEBAS, CONDENSED, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Heavy poster grain (the photocopied-print texture of the reference). */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Bebas Neue advance widths (per 100px), measured in the browser, and its cap height. */
const BEBAS_ADV: Record<string, number> = { A: 40.1, B: 40.4, C: 38.3, D: 40.6, E: 36.3, F: 34.4, G: 39.1, H: 42, I: 19.2, J: 26.5, K: 41.4, L: 34.4, M: 53.8, N: 42.7, O: 40, P: 38.6, Q: 40, R: 40.3, S: 37.2, T: 36.4, U: 40.2, V: 38.2, W: 55.7, X: 40.6, Y: 39.4, Z: 36.2, " ": 16, "'": 18.8, "-": 27, ".": 18.8 };
const bebasEm = (t: string) => [...t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")].reduce((a, c) => a + (BEBAS_ADV[c] ?? (/\d/.test(c) ? 36 : 40)), 0) / 100;
const BEBAS_CAP = 0.7;
/** In a line box of line-height 1, Bebas's baseline sits at 0.8em. */
const BEBAS_BASE = 0.8;

/** English position abbreviations (RW, CM, GK…), whatever language the position is stored in. */
const POS: [RegExp, string][] = [
  [/keeper|guarda|\bgr\b/i, "GK"],
  [/right[- ]?back|lateral direito|defesa direito/i, "RB"],
  [/left[- ]?back|lateral esquerdo|defesa esquerdo/i, "LB"],
  [/wing[- ]?back|\bala\b/i, "WB"],
  [/cent(re|er)[- ]?back|central|defender|defesa/i, "CB"],
  [/defensive mid|m[eé]dio defensivo|trinco/i, "DM"],
  [/attacking mid|m[eé]dio ofensivo|playmaker/i, "AM"],
  [/right wing|extremo direito|right mid/i, "RW"],
  [/left wing|extremo esquerdo|left mid/i, "LW"],
  [/wing|extremo/i, "W"],
  [/mid|m[eé]dio/i, "CM"],
  [/striker|forward|avan[cç]ado|ponta de lan[cç]a/i, "ST"],
];
const posAbbr = (p: string) => POS.find(([re]) => re.test(p))?.[1] ?? "";

/** "SUN 11 OCT" → "Sun 11 Oct". */
const title = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

/** "3 games, 1 goal and 270 minutes": the non-zero numbers, in words. */
function numbers(stats: { label: string; value: string }[]): string {
  const parts = stats
    .filter((s) => s.value && Number(s.value) !== 0 && !/-/.test(s.value))
    .map((s) => {
      const l = s.label.toLowerCase();
      const one = Number(s.value) === 1;
      return `${s.value} ${one ? l.replace(/s$/, "") : l}`;
    });
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** The small serif paragraph under the crest: two or three lines saying what the post is about. */
function blurb(data: RenderData): string {
  const c = data.content;
  const name = title([c.firstName, c.lastName].filter(Boolean).join(" "));
  const club = (data.toClub ?? data.club)?.name ?? "";
  // "5 games … over the last 5 games" says it twice: the period already counts the games.
  const nums = numbers(data.postType === "stats" && /game|match/i.test(c.subline) ? c.stats.filter((s) => !/game|match/i.test(s.label)) : c.stats);
  switch (data.postType) {
    case "potm":
      return `${name} is ${club ? `${club}'s` : "the"} player of the month for ${title(c.subline)}${nums ? `, with ${nums} to his name` : ""}.`;
    case "stats":
      return `${name} ${nums ? `has ${nums}` : "is in form"} over the ${c.subline.toLowerCase() || "last games"}${club ? ` for ${club}` : ""}.`;
    case "renewal":
      return `${name} has signed a new deal with ${club || "the club"}${c.until ? `, committing his future until ${c.until}` : ""}.`;
    case "transfer":
      return `${name} joins ${club || "his new club"}${data.fromClub ? ` from ${data.fromClub.name}` : ""}. A new chapter starts now: welcome, ${name.split(" ")[0]}.`;
    case "matchday": {
      const comp = (c.subline.split("·")[0] ?? "").trim();
      const teams = c.homeTeam && c.awayTeam ? `${c.homeTeam} v ${c.awayTeam}` : "";
      const when = [c.date ? title(c.date) : "", c.time].filter(Boolean).join(", ");
      return `${teams || name}${comp ? ` in the ${comp}` : ""}.${when ? ` Kick-off ${when}.` : ""}`;
    }
    default:
      return `${name}${club ? `, ${club}` : ""}.`;
  }
}

/**
 * Minimal print poster (Bukayo Saka): grainy light-grey paper, the first name huge at the top left and the
 * surname offset right, both in the club's darkest colour; below, a big square panel of the same colour with
 * the player (ideally from behind, name and number on his back) breaking out of its top edge over the name.
 * A few colour swatches at the panel's corner; at the foot, "7 [crest] RW" between two rules and a short
 * serif paragraph.
 */
export function Backpanel({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 35);
  const flip = params.side === "left";
  const base = params.primary === "#10131c" ? params.accent : params.primary;
  // The ink: the club colour taken very dark (teal-navy for blue clubs, oxblood for red), never pure black.
  let ink = hueOf(base) == null ? "#1f2a30" : shade(base, -0.55);
  for (let i = 0; i < 4 && luminance(ink) > 0.035; i++) ink = shade(ink, -0.25);
  const light = hueOf(base) == null ? "#9aa6ad" : luminance(base) > 0.5 ? shade(base, -0.15) : shade(base, 0.35);
  const swatches = [ink, shade(ink, 0.25), hueOf(base) == null ? "#56636b" : base, light];

  // ---- names ----
  const first = (content.lastName ? content.firstName : "").toUpperCase();
  const last = (content.lastName || content.firstName).toUpperCase();
  const L = 66;
  const R = CANVAS_W - 66;
  const fitName = (t: string, w: number) => w / Math.max(1.2, bebasEm(t));
  // The surname leaves ~250px on its left for his head.
  const S = Math.min(255, fitName(first, 760), fitName(last, first ? R - L - 250 : 760)) * (params.textScale ?? 1);
  const cap = S * BEBAS_CAP;
  const top1 = 58;
  const panelTop = Math.max(330, top1 + (first ? cap * 2 + 14 : cap) + 18);
  const panelBottom = 1112;
  const nameStyle: CSSProperties = { position: "absolute", fontFamily: BEBAS, fontSize: S, lineHeight: 1, whiteSpace: "nowrap", color: ink, WebkitTextStroke: `${Math.max(1, S / 110)}px ${ink}`, letterSpacing: "0.005em" };

  // ---- the player, breaking out of the panel's top edge ----
  const p = params;
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * 0.65);
  // The panel crops him anyway: a full-body framing still stops at the knees.
  const depth: Record<string, number> = { full: 5.6, knees: 5.6, waist: 3.9, chest: 2.5 };
  const headTop = (first ? top1 + cap * 0.86 : top1 + cap * 0.35) + r() * 16;
  const crop = Math.min(1, face[1] + face[3] * (depth[p.framing ?? "waist"] ?? 3.9));
  let h = (panelBottom + ((data.cut?.bottom ?? 0) > 0 || crop < 1 ? 30 : -30) - headTop) / Math.max(0.2, crop - hair);
  // Never blown up past the photo's own resolution (export is 2×) nor into a giant head.
  const maxFace = Math.min(330, data.facePx > 0 ? data.facePx * 2.1 : 330);
  if (h * face[3] > maxFace) h = maxFace / face[3];
  h *= p.playerScale ?? 1;
  // His head sits in the gap between the two names, hiding only a sliver of the surname's first letter:
  // a head too big for that gap is taken down a little.
  const lastStart = R - bebasEm(last) * S;
  const gapW = lastStart + S * 0.1 - (L + 30);
  if (first && face[2] * h * aspect * 1.35 > gapW) h *= Math.max(0.75, gapW / (face[2] * h * aspect * 1.35));
  const w = h * aspect;
  const headW = face[2] * w * 1.35;
  const want = first ? lastStart + S * 0.1 - headW / 2 : lastStart - headW / 2 - 40;
  const cx = Math.max(L + headW / 2 + 40, Math.min(640, want)) + (r() - 0.5) * 20;
  const faceCx = flip ? CANVAS_W - cx : cx;
  const box = {
    left: faceCx - (face[0] + face[2] / 2) * w + (p.playerX ?? 0),
    top: headTop - hair * h + (p.playerY ?? 0),
    width: w,
    height: h,
  };

  // ---- small print ----
  const number = data.player.number;
  const pos = posAbbr(data.player.position ?? "");
  const text = blurb(data);
  const kick = [content.kicker, postType === "matchday" ? content.date : postType === "potm" ? content.subline : ""].filter(Boolean).join(" · ").toUpperCase();
  const panelH = panelBottom - panelTop;
  const kickSize = Math.min(17, (panelH - 40) / Math.max(1, [...kick].length * 0.78));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: ink }}>
      <Paper color="#d9d9d6" strength={1.2} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.32, mixBlendMode: "multiply" }} />

      {/* Names: first top-left, surname offset right, resting on the panel. */}
      {first && <div style={{ ...nameStyle, top: top1 - S * (BEBAS_BASE - BEBAS_CAP), [flip ? "right" : "left"]: L - S * 0.02 }}>{first}</div>}
      <div style={{ ...nameStyle, top: panelTop - 16 - S * BEBAS_BASE, [flip ? "left" : "right"]: L - S * 0.02 }}>{last}</div>

      {/* The panel, with its own grain. */}
      <div style={{ position: "absolute", left: L, top: panelTop, width: R - L, height: panelBottom - panelTop, background: ink, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.22, mixBlendMode: "screen" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 70% at 50% 35%, rgba(255,255,255,.07), transparent 70%)" }} />
      </div>

      {/* Colour swatches by the panel's top corner, then the kicker. */}
      <div style={{ position: "absolute", top: panelTop - 34, [flip ? "right" : "left"]: L, display: "flex", flexDirection: flip ? "row-reverse" : "row", alignItems: "center", gap: 0 }}>
        {swatches.map((c, i) => (
          <div key={i} style={{ width: 26, height: 18, background: c }} />
        ))}
      </div>

      {/* The kicker runs up the margin beside the panel. */}
      {kick && (
        <div style={{ position: "absolute", top: panelTop, height: panelH, [flip ? "right" : "left"]: 0, width: L, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `rotate(${flip ? 90 : -90}deg)`, fontFamily: CONDENSED, fontWeight: 700, fontSize: kickSize, letterSpacing: "0.3em", whiteSpace: "nowrap", color: ink }}>{kick}</div>
        </div>
      )}

      {/* The player: clipped to the panel's sides and bottom, free above it. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${CANVAS_W - R}px ${CANVAS_H - panelBottom}px ${L}px)` }}>
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 30px rgba(0,0,0,.35))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", ...box, maxWidth: "none", filter: "contrast(1.06) saturate(.92) brightness(.97) sepia(.08)", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}
      {/* Print grain over the photo too. */}
      <div style={{ position: "absolute", left: L, top: 0, width: R - L, height: panelBottom, backgroundImage: GRAIN, opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none" }} />

      {/* Foot: rules either side of number · crest · position. */}
      <div style={{ position: "absolute", left: L, right: L, top: panelBottom + 34, height: 76, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1, height: 2, background: ink }} />
        {number && <div style={{ fontFamily: BEBAS, fontSize: 46, lineHeight: 1, paddingTop: 6, WebkitTextStroke: `1px ${ink}` }}>{number}</div>}
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 70, height: 70, objectFit: "contain" }} />}
        {pos && <div style={{ fontFamily: BEBAS, fontSize: 46, lineHeight: 1, paddingTop: 6, WebkitTextStroke: `1px ${ink}` }}>{pos}</div>}
        <div style={{ flex: 1, height: 2, background: ink }} />
      </div>
      <div style={{ position: "absolute", left: 250, right: 250, top: panelBottom + 124, textAlign: "center", fontFamily: SERIF, fontWeight: 500, fontSize: Math.min(19, Math.max(15, 2000 / Math.max(1, text.length))), lineHeight: 1.35, color: shade(ink, 0.1) }}>{text}</div>
      <AgencyLogo data={data} onLight height={20} style={{ position: "absolute", bottom: 40, [flip ? "right" : "left"]: L, opacity: 0.75 }} />
    </div>
  );
}
