/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph. */
const capsEm = (t: string, tracking: number) => plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);
/** Inter, mixed case, roughly: em per glyph. */
const textEm = (t: string) => plain(t).reduce((a, c) => a + (c === " " ? 0.26 : /[ilIj.,'·:]/.test(c) ? 0.27 : /[mwMW]/.test(c) ? 0.85 : /[A-Z]/.test(c) ? 0.66 : /\d/.test(c) ? 0.6 : 0.53), 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/** The ticket outline: a rounded rectangle with a semicircle notch top and bottom at the perforation. */
function ticketPath(x0: number, y0: number, x1: number, y1: number, px: number, rad: number, n: number): string {
  return [
    `M${x0 + rad} ${y0}`,
    `H${px - n}`,
    `A${n} ${n} 0 0 0 ${px + n} ${y0}`,
    `H${x1 - rad}`,
    `A${rad} ${rad} 0 0 1 ${x1} ${y0 + rad}`,
    `V${y1 - rad}`,
    `A${rad} ${rad} 0 0 1 ${x1 - rad} ${y1}`,
    `H${px + n}`,
    `A${n} ${n} 0 0 0 ${px - n} ${y1}`,
    `H${x0 + rad}`,
    `A${rad} ${rad} 0 0 1 ${x0} ${y1 - rad}`,
    `V${y0 + rad}`,
    `A${rad} ${rad} 0 0 1 ${x0 + rad} ${y0}`,
    "Z",
  ].join(" ");
}

/**
 * Stub: the player on a clean deep club-tone ground and, at the foot, a match ticket drawn in hairlines —
 * a rounded rectangle split by a perforated line with a notch top and bottom. The main part holds the
 * fixture (home first) and the competition over a row of date, kick-off and ground; the stub says
 * "MATCHDAY" with one tiny serial. The title small at the top.
 */
export function Stub({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  // Native Instagram story (1080×1920): title at STORY_TOP, logo ending at STORY_BOTTOM, ticket just above it, type ~1.4×.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const ground = shade(club, -0.72);
  const lift = shade(club, -0.5);
  const low = shade(club, -0.82);
  const ink = "#ffffff";
  const soft = "rgba(255,255,255,.62)";
  const hair = "rgba(255,255,255,.55)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the ticket ---- */
  const X0 = story ? 48 : 64;
  const X1 = CANVAS_W - X0;
  const TH = story ? 330 : 236;
  const logoBottom = (story ? H - STORY_BOTTOM : 42) - (params.logoY ?? 0);
  const Y1 = (story ? STORY_BOTTOM - 104 : CANVAS_H - 120) + Math.min(0, params.textY ?? 0);
  const Y0 = Y1 - TH;
  const PX = X1 - (story ? 262 : 210); // perforation
  const NOTCH = story ? 20 : 15;
  const IN = story ? 50 : 40; // inner padding

  /* ---- the player, centred, melting into the ground above the ticket ---- */
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const box = story ? placeByFace(data, faceX, 330, { chest: 400, waist: 320, knees: 236, full: 180 }) : placeByFace(data, faceX, 196, { chest: 260, waist: 200, knees: 156, full: 120 });
  const fadeEnd = Y0 - 10;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${Math.max(0, fadeEnd - 240 - box.top)}px, transparent ${fadeEnd - box.top}px)`;

  /* ---- type ---- */
  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.5;
  const tSize = Math.max(11 * k, Math.min((story ? 17 : 15) * k, 620 / Math.max(1, capsEm(title, T_TRACK)))) * ts;
  const titleTop = (story ? STORY_TOP : 64) + Math.max(0, params.textY ?? 0);

  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = shortName(oursName);
  const them = shortName(typed ?? titleCase(f.opp));
  const pair = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const fixture = pair.length === 2 ? pair.join(hasScore ? `  ${score}  ` : "  v  ") : pair[0] ?? "";
  const mainW = PX - X0 - 2 * IN;
  const CR = 32 * k;
  const crestRoom = crests.length ? crests.length * CR + (crests.length - 1) * 8 * k + 22 * k : 0;
  const fixSize = Math.max(18, Math.min(34 * k, (mainW - crestRoom) / Math.max(1, textEm(fixture)))) * ts;
  const comp = titleCase([f.comp, f.round].filter(Boolean).join(" · "));
  const compSize = Math.max(11, Math.min(13 * k, (mainW * 0.98) / Math.max(1, capsEm(comp, 0.2))));

  const cols = [
    { k: "Date", v: niceDate(content.date) },
    { k: "Kick-off", v: f.time },
    { k: "Ground", v: titleCase(f.venue) },
  ].filter((c) => c.v);
  const colW = story ? [196, 166, mainW - 362] : [150, 130, mainW - 280];
  const venueSize = Math.max(13, Math.min(18 * k, (colW[2] - 4) / Math.max(1, textEm(titleCase(f.venue)))));

  const serial = `No ${String(1000 + Math.floor(r() * 9000))}`;
  const stubLabel = "MATCHDAY";

  const caps = (size: number, track: number, weight = 500, extra?: CSSProperties): CSSProperties => ({ fontFamily: SANS, fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, lineHeight: 1, whiteSpace: "nowrap", textTransform: "uppercase", color: ink, ...extra });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% 34%, ${lift}, ${ground} 62%, ${low} 100%)` }} />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Title. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", ...caps(tSize, T_TRACK), paddingLeft: `${T_TRACK}em` }}>{title}</div>

      {/* The ticket, in hairlines. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <path d={ticketPath(X0, Y0, X1, Y1, PX, 18, NOTCH)} fill="rgba(255,255,255,.03)" stroke={hair} strokeWidth={1.2} />
        <line x1={PX} y1={Y0 + NOTCH + 8} x2={PX} y2={Y1 - NOTCH - 8} stroke={hair} strokeWidth={1.2} strokeDasharray="2 7" strokeLinecap="round" />
      </svg>

      {/* Main part: fixture with crests, competition, then date / kick-off / ground. */}
      <div style={{ position: "absolute", left: X0 + IN, top: Y0 + 34 * k, width: mainW, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 * k, height: 40 * k }}>
          {crests.length > 0 && (
            <div style={{ display: "flex", gap: 8 * k }}>
              {crests.map((c, i) => (
                <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
              ))}
            </div>
          )}
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: fixSize, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{fixture}</div>
        </div>
        {comp && <div style={{ ...caps(compSize, 0.2, 500, { color: soft }), marginTop: 18 * k }}>{comp}</div>}
        <div style={{ height: 1, background: "rgba(255,255,255,.18)", margin: `${26 * k}px 0 ${20 * k}px` }} />
        <div style={{ display: "flex" }}>
          {cols.map((c, i) => (
            <div key={c.k} style={{ width: c.k === "Ground" ? undefined : colW[i], flex: c.k === "Ground" ? 1 : undefined, display: "flex", flexDirection: "column", gap: 10 * k, minWidth: 0 }}>
              <div style={caps(10.5 * k, 0.26, 500, { color: soft })}>{c.k}</div>
              <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: c.k === "Ground" ? venueSize : 18 * k, lineHeight: 1, whiteSpace: "nowrap" }}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The stub: MATCHDAY and one tiny serial. */}
      <div style={{ position: "absolute", left: PX, width: X1 - PX, top: Y0, height: TH, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        <div style={caps(18 * k, 0.3, 600, { paddingLeft: "0.3em" })}>{stubLabel}</div>
        <div style={{ fontFamily: MONO, fontSize: 11 * k, letterSpacing: "0.18em", color: soft, whiteSpace: "nowrap" }}>{serial}</div>
      </div>

      <AgencyLogo data={data} height={story ? 26 : 18} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      <Film strength={0.18} />
    </div>
  );
}
