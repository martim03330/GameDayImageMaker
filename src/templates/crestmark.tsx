/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { opponentOf, rng } from "./kit";
import { standing } from "./mist";
import { competitionOf, scoreOf } from "./outline";
import { cleanCompetition } from "./sepia";
import { AgencyLogo, GROTESK } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** A vivid club colour that still carries white lettering (pale / neon shades are deepened a little). */
function skyColour(primary: string, accent: string): string {
  let c = primary === "#10131c" || hueOf(primary) == null ? accent : primary;
  if (hueOf(c) == null) c = hueOf(primary) != null ? primary : "#2a2e36";
  if (hueOf(c) == null) return "#2a2e36";
  c = vivid(c);
  for (let i = 0; i < 6 && luminance(c) > 0.3; i++) c = shade(c, -0.12);
  return c;
}

/** Space Grotesk medium, lower case: average advance relative to the font size. */
const ADV = 0.56;

/**
 * Greenwood / OM "crest" poster: a vivid club colour fading to white, a huge pale glowing silhouette of the
 * club crest behind the player, the whole player running in front of it on a soft floor shadow, and two
 * sparse lower-case rows — first name · the score or a number · last name on top, the numbers of the post
 * and the competition underneath in the club colour. Airy and premium.
 */
export function Crestmark({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 58);
  const c = skyColour(params.primary, params.accent);
  const deep = shade(c, -0.25);
  const left = params.side === "left";

  // ---- the player ----
  const floor = 1060 + r() * 20;
  const cx = 540 + (left ? -1 : 1) * r() * 24;
  const box = standing(data, { cx, headTop: 380 + r() * 20, floor, maxFace: 96, framing: "full" });
  const fxFrac = (box.faceCx - box.left) / box.width;

  // ---- the crest ----
  const club = data.toClub ?? data.club;
  const crest = club?.crestUrl ?? null;
  const crestSize = 640 + r() * 60;
  const crestCy = 560;

  // ---- the words ----
  const low = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const score = scoreOf(data);
  const comp = low(cleanCompetition(competitionOf(data)));
  // The numbers that make the post first (goals, assists…), games and minutes last; "1 games" → "1 game".
  const rank = (l: string) => (/goal/i.test(l) ? 0 : /assist/i.test(l) ? 1 : /game|match|minute/i.test(l) ? 3 : 2);
  // Numbers already named by the caption ("LAST 5 GAMES") are not repeated.
  const caption = low(content.subline);
  const stats = content.stats
    .filter((s) => s.value && s.value !== "0" && !/-/.test(s.value) && !caption.includes(low(s.label).replace(/s$/, "")))
    .sort((a, b) => rank(a.label) - rank(b.label));
  const stat = (i: number) => (stats[i] ? `${stats[i].value} ${low(stats[i].label).replace(/s$/, "") + (stats[i].value === "1" ? "" : "s")}` : "");
  const opp = low(opponentOf(data));
  const first = low(content.firstName);
  const last = low(content.lastName);
  const num = data.player.number;

  let middle = "";
  let bottom: string[] = [];
  switch (postType) {
    case "goal":
      middle = score || low(content.kicker);
      bottom = [stat(0) || low(content.kicker), comp, opp ? `v ${opp}` : num ? `no. ${num}` : ""];
      break;
    case "result":
      middle = score || "full time";
      bottom = [low(content.kicker), comp, stat(0) || (opp ? `v ${opp}` : "")];
      break;
    case "matchday":
      middle = content.time || low(content.date ?? "") || "matchday";
      bottom = [low(content.date ?? ""), comp, opp ? `v ${opp}` : ""];
      break;
    case "potm":
      middle = low(content.subline);
      bottom = [stat(0), low(content.kicker), stat(1)];
      break;
    default:
      middle = low(content.subline);
      bottom = [stat(0), low(content.kicker), stat(1)];
  }
  // Single names ("kaka") sit in the middle of the top row, the number / score beside it.
  const top = first && last ? [first, middle, last] : [middle ? (num ? `no. ${num}` : "") : "", first || last, middle];
  bottom = bottom.filter(Boolean);
  if (bottom.length === 2) bottom = [bottom[0], "·", bottom[1]];

  const COL = 300;
  const size = (t: string, max: number) => Math.max(16, Math.min(max, (COL - 20) / Math.max(1, [...t].length * ADV)));
  const row = (items: string[], y: number, color: string, max: number) => {
    const s = Math.min(...items.filter((t) => t && t !== "·").map((t) => size(t, max)));
    return items.map((t, i) => (
      <div key={`${y}-${i}`} style={{ position: "absolute", top: y, left: 540 + (i - 1) * COL - COL / 2, width: COL, textAlign: "center", fontFamily: GROTESK, fontWeight: 500, fontSize: s, lineHeight: 1.2, letterSpacing: "-0.01em", color, whiteSpace: "nowrap" }}>
        {t}
      </div>
    ));
  };

  const crestStyle: CSSProperties = {
    position: "absolute",
    left: 540 - crestSize / 2,
    top: crestCy - crestSize / 2,
    width: crestSize,
    height: crestSize,
    objectFit: "contain",
  };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#fbf8f6" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        {/* The crest as a pale silhouette: white, its dark parts more solid than its light ones so the design still reads. */}
        <filter id="crestmark-ghost" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.21 -0.5 -0.08 1 0" result="w" />
          <feGaussianBlur in="w" stdDeviation="18" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="w" />
          </feMerge>
        </filter>
      </svg>
      {/* Vivid club colour at the top, fading through a pale band to white. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, ${c} 0%, ${shade(c, 0.06)} 34%, ${shade(c, 0.35)} 48%, ${shade(c, 0.72)} 58%, ${shade(c, 0.9)} 68%, #fbf8f6 84%)`,
        }}
      />
      {/* Fine halftone dots in the colour band. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${shade(c, -0.35)} 1.1px, transparent 1.4px)`,
          backgroundSize: "7px 7px",
          opacity: 0.16,
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.6) 40%, transparent 62%)",
          maskImage: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.6) 40%, transparent 62%)",
        }}
      />

      {crest ? (
        <img src={crest} alt="" style={{ ...crestStyle, filter: "url(#crestmark-ghost)", opacity: 0.55 }} />
      ) : (
        num && (
          <div style={{ position: "absolute", left: 0, right: 0, top: crestCy - 330, textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 600, lineHeight: 1, color: "#fff", opacity: 0.4, textShadow: "0 0 40px rgba(255,255,255,.8)" }}>
            {num}
          </div>
        )
      )}

      {/* Floor shadow, then the player. */}
      {data.photoUrl && box.feet && (
        <div
          style={{
            position: "absolute",
            left: box.left + box.width * (fxFrac - 0.36),
            top: floor - 16,
            width: box.width * 0.72,
            height: 32,
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${shade(c, -0.55)}88, ${shade(c, -0.4)}22 65%, transparent)`,
            filter: "blur(6px)",
          }}
        />
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {/* A cut photo melts into the white floor. */}
      {data.photoUrl && !box.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 360, background: "linear-gradient(to bottom, rgba(251,248,246,0), #fbf8f6 70%)" }} />}

      {row(top, 190, "#ffffff", 30)}
      {row(bottom, 1150, deep, 28)}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={22} onLight style={{ color: deep, opacity: 0.75 }} />
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.12, mixBlendMode: "overlay", pointerEvents: "none" }} />
    </div>
  );
}
