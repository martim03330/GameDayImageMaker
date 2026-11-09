/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask } from "./fx";
import { rng } from "./kit";
import { competitionOf } from "./outline";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** One game in the row of circles. */
type Game = { crest: string | null; name: string; date: string; time: string };

/** "2026-10-10" → "10.10"; "SAT 10 OCT" → "10.10"; anything else as it is. */
function shortDate(d: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (iso) return `${iso[3]}.${iso[2]}`;
  const named = /(\d{1,2})\s+([A-Za-z]{3})/.exec(d);
  if (named) {
    const m = MONTHS.indexOf(named[2].toUpperCase());
    if (m >= 0) return `${named[1].padStart(2, "0")}.${String(m + 1).padStart(2, "0")}`;
  }
  return d.toUpperCase();
}

/** The next games (up to three); the edit's own match when the calendar has none. */
function gamesOf(data: RenderData): Game[] {
  const fx = data.fixtures.slice(0, 3).map((f) => ({ crest: f.opponentCrest, name: f.opponent, date: shortDate(f.date), time: f.time }));
  if (fx.length) return fx;
  const c = data.content;
  const ours = (data.club?.name ?? "").toLowerCase();
  const awayIsUs = c.home === false || (c.home == null && (c.awayTeam ?? "").toLowerCase() === ours);
  const name = (awayIsUs ? c.homeTeam : c.awayTeam) ?? "";
  const crest = (awayIsUs ? c.homeCrest : c.awayCrest) ?? null;
  if (!name && !crest && !c.date) return [];
  return [{ crest, name, date: shortDate(c.date ?? ""), time: c.time ?? "" }];
}

/** Mottled paint / concrete texture (multiplied over the club colour). */
const MOTTLE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1100' height='1100'><filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='5' seed='11'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.35'/></filter><rect width='100%' height='100%' filter='url(#m)'/></svg>`,
)}")`;
/** Small blotches: the dry, stained look of a printed poster. */
const BLOTCH = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='b'><feTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 3.3'/></filter><rect width='100%' height='100%' filter='url(#b)'/></svg>`,
)}")`;
const SPECK = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' seed='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -9 6.1'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;

/**
 * College "UP NEXT" schedule post (Ohio State): a grungy club-colour wall with a faint grid, the club
 * crest as a giant dark silhouette bleeding off the top-left, the player's face in a huge close-up cut
 * by the right edge, and on the left a small crest row, a heavy extended "UP / NEXT", and the next
 * opponents' crests in outlined circles with the date and kick-off under each.
 */
export function Upnext({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 61);
  const club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // White type has to hold on it: light club colours (yellow, sky blue) are deepened.
  const lum = luminance(club);
  const bg = lum < 0.035 ? "#2f3034" : lum > 0.42 ? shade(club, -0.45) : lum > 0.28 ? shade(club, -0.3) : lum > 0.18 ? shade(club, -0.12) : club;
  const deep = shade(bg, -0.55);
  const ts = params.textScale ?? 1;

  // ---- the close-up: face cut by the right edge, never blown past the photo's real resolution ----
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let faceH = 540 * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(250, data.facePx * 2.2));
  const h = faceH / face[3];
  const w = h * aspect;
  const faceW = face[2] * w;
  // Face centre: near the right edge (about a third of the face off canvas), but its left edge clear of the text.
  const cx = Math.max(650 + faceW / 2, CANVAS_W - faceW * (0.18 + r() * 0.1));
  const cy = 720 + (r() - 0.5) * 40;
  const box = {
    left: cx - (face[0] + face[2] / 2) * w + (params.playerX ?? 0),
    top: cy - (face[1] + face[3] / 2) * h + (params.playerY ?? 0),
    width: w,
    height: h,
  };
  const mag = data.facePx > 0 ? (faceH * 2) / data.facePx : 2;
  const soften = mag > 3 ? `blur(${Math.min(1.2, (mag - 3) * 0.5).toFixed(2)}px) ` : "";
  const photo = data.photoUrl && (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // An original photo (not a cutout) is only shown as a tight crop around the face, fading into the wall.
        ...(data.photoIsCutout
          ? {}
          : {
              WebkitMaskImage: `radial-gradient(${Math.round(faceW * 1.5)}px ${Math.round(faceH * 1.5)}px at ${Math.round(cx)}px ${Math.round(cy)}px, #000 55%, transparent 100%)`,
              maskImage: `radial-gradient(${Math.round(faceW * 1.5)}px ${Math.round(faceH * 1.5)}px at ${Math.round(cx)}px ${Math.round(cy)}px, #000 55%, transparent 100%)`,
            }),
      }}
    >
      {/* Shadow on a wrapper: mask + drop-shadow on one img draws a box. */}
      <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(-24px 10px 40px rgba(0,0,0,.45))" }}>
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", ...box, maxWidth: "none", filter: `${soften}contrast(1.06) saturate(1.02)`, ...(data.photoIsCutout ? cutMask(data.cut) : {}) }}
        />
      </div>
    </div>
  );

  // ---- left column ----
  const games = gamesOf(data);
  const L = 84;
  const upSize = 152 * ts;
  const up = { fontFamily: ARCHIVO_BLACK, fontSize: upSize, lineHeight: 0.8, color: WHITE, letterSpacing: "0.01em", whiteSpace: "nowrap" as const, transform: "scaleX(1.12)", transformOrigin: "0 0" };
  const upTop = 530;
  const nextTop = upTop + upSize * 0.86;
  const small: CSSProperties = { fontFamily: MONO, fontWeight: 500, color: WHITE, letterSpacing: "0.26em", whiteSpace: "nowrap", textTransform: "uppercase" };
  const circle = games.length === 3 ? 116 : 132;
  const gap = games.length === 3 ? 34 : 44;
  const rowTop = nextTop + upSize * 0.8 + 70;
  const comp = (data.fixtures[0]?.competition || competitionOf(data)).toUpperCase();
  const legendComp = comp;
  const legendSize = Math.min(21, 560 / Math.max(1, ([...comp].length + 9) * 0.86));
  const ours = data.club?.crestUrl;
  const vertical = Array.from({ length: 5 }, () => (data.club?.name ?? content.lastName).toUpperCase()).join("   ·   ");
  const bigName = (content.lastName || content.firstName).toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg, color: WHITE }}>
      {/* Wall: uneven paint, blotches, specks and a faint grid. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 30% 35%, ${shade(bg, 0.08)}, ${bg} 55%, ${shade(bg, -0.25)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: MOTTLE, backgroundPosition: `${Math.round(r() * 400)}px ${Math.round(r() * 400)}px`, opacity: 0.5, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: BLOTCH, backgroundPosition: `${Math.round(r() * 300)}px 0`, opacity: 0.12, mixBlendMode: "multiply" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(0,0,0,.09) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(0,0,0,.09) 1.5px, transparent 1.5px)",
          backgroundSize: "96px 96px",
          backgroundPosition: "40px 22px",
        }}
      />

      {/* The crest as a giant dark silhouette, off the top-left corner. */}
      {ours && (
        <img
          src={ours}
          alt=""
          data-bleed
          style={{
            position: "absolute",
            left: -250 - r() * 60,
            top: -200 - r() * 50,
            width: 860,
            height: 860,
            objectFit: "contain",
            filter: "brightness(0)",
            opacity: 0.6,
            mixBlendMode: "multiply",
            transform: `rotate(${-10 + r() * 8}deg)`,
          }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, backgroundImage: SPECK, opacity: 0.07, mixBlendMode: "screen" }} />

      {/* Tiny vertical club line up the left edge. */}
      <div
        data-bleed
        style={{ position: "absolute", left: 22, top: 0, height: CANVAS_H, writingMode: "vertical-rl", transform: "rotate(180deg)", ...small, fontSize: 12, letterSpacing: "0.34em", opacity: 0.4, overflow: "hidden" }}
      >
        {vertical}
      </div>

      {/* Surname in faint giant letters, running off the bottom. */}
      <div
        data-bleed
        style={{ position: "absolute", left: L - 10, top: CANVAS_H - 170, fontFamily: ARCHIVO_BLACK, fontSize: 250, lineHeight: 1, color: "transparent", WebkitTextStroke: `2px rgba(255,255,255,.22)`, whiteSpace: "nowrap", transform: "scaleX(1.12)", transformOrigin: "0 0" }}
      >
        {bigName}
      </div>

      {photo}
      {/* Deepen the wall under the text and at the foot. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${deep}aa, transparent 22%)`, pointerEvents: "none" }} />

      {/* Crest row: club × agency. */}
      <div style={{ position: "absolute", left: L, top: upTop - 128, height: 80, display: "flex", alignItems: "center", gap: 26 }}>
        {ours && <img src={ours} alt="" style={{ width: 78, height: 78, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.35))" }} />}
        {ours && (data.agency.logoUrl || data.agency.name) && <div style={{ ...small, fontSize: 22, letterSpacing: 0, opacity: 0.8 }}>×</div>}
        <AgencyLogo data={data} height={34} style={{ color: WHITE, opacity: 0.95 }} />
      </div>

      {/* UP / NEXT */}
      <div style={{ position: "absolute", left: L, top: upTop, ...up }}>UP</div>
      <div style={{ position: "absolute", left: L + upSize * 1.72 * 1.12 + 34, top: upTop + upSize * 0.04, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ ...small, fontSize: 22, opacity: 0.78 }}>UPCOMING</div>
        <div style={{ ...small, fontSize: 22, opacity: 0.78 }}>{games.length > 1 ? "MATCHUPS" : "MATCHUP"}</div>
      </div>
      <div style={{ position: "absolute", left: L, top: nextTop, ...up }}>NEXT</div>

      {/* The next opponents. */}
      <div style={{ position: "absolute", left: L, top: rowTop, display: "flex", gap }}>
        {games.map((g, i) => (
          <div key={i} style={{ width: circle, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: circle,
                height: circle,
                borderRadius: "50%",
                border: `3px solid ${WHITE}`,
                background: "rgba(0,0,0,.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(0,0,0,.18)",
              }}
            >
              {g.crest ? (
                <img src={g.crest} alt="" style={{ width: circle * 0.64, height: circle * 0.64, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.3))" }} />
              ) : (
                <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: circle * 0.3, color: WHITE }}>{g.name.replace(/[^A-Za-z ]/g, "").split(/\s+/).filter(Boolean).map((s) => s[0]).join("").slice(0, 3).toUpperCase() || "?"}</div>
              )}
            </div>
            {g.date && <div style={{ ...small, marginTop: 22, fontSize: g.date.length > 6 ? 17 : 25, fontWeight: 700, letterSpacing: "0.1em" }}>{g.date}</div>}
            <div style={{ ...small, marginTop: 8, fontSize: 15, letterSpacing: "0.14em", opacity: 0.85 }}>{g.time || "TBC"}</div>
          </div>
        ))}
      </div>

      {/* Legend: how many games, then the competition, faded. */}
      <div style={{ position: "absolute", left: L, bottom: 150, display: "flex", gap: 22, ...small, fontSize: legendSize }}>
        <span>{games.length > 1 ? `NEXT ${games.length}` : "NEXT GAME"}</span>
        {legendComp && <span style={{ opacity: 0.55 }}>{legendComp}</span>}
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: SPECK, opacity: 0.04, mixBlendMode: "screen", pointerEvents: "none" }} />
    </div>
  );
}
