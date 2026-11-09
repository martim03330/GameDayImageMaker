/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Film base and the amber of the edge print. */
const BASE = "#17120e";
const AMBER = "#e98a2c";
const MONO_EM = 0.6;

/* The strip: a frame window with sprocket rows above and below; slivers of the next frames at the edges. */
const WIN_W = 920;
const WIN_H = 740;
const WIN_X = (CANVAS_W - WIN_W) / 2;
const RAIL = 74;
const GAP = 26;
const HOLE_W = 40;
const HOLE_H = 28;
const PITCH = 68;

const MON: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** "SAT 17 OCT" → "17.10.26". */
function stamp(date: string | undefined, fixtureDate?: string): string {
  const m = (date ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m) return "";
  const mon = MON[m[2]] ?? "";
  const fy = fixtureDate && fixtureDate.slice(5, 7) === mon ? fixtureDate.slice(2, 4) : String(new Date().getFullYear()).slice(2);
  return `${m[1].padStart(2, "0")}.${mon}.${fy}`;
}

/** "MATCHDAY" → "Matchday". */
function sentence(kicker: string): string {
  const k = kicker.replace(/’/g, "'").trim().toLowerCase();
  return k.charAt(0).toUpperCase() + k.slice(1);
}

const fitMono = (t: string, room: number, max: number, min = 10, tracking = 0.06) => Math.max(min, Math.min(max, room / Math.max(1, t.length * (MONO_EM + tracking))));

/**
 * Film frame: the picture as one 35mm frame on a near-black (or paper-white) sheet — a rounded window
 * holding the player over his own photo softened and warmed, sprocket rows above and below, tiny amber
 * edge print (made-up stock "NEYOD 400", frame numbers), and under the strip a typed caption: title,
 * fixture, date · kick-off, ground. Very restrained.
 */
export function Filmframe({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 17;
  const r = rng(seed);
  const paper = seed % 2 === 0;
  const sheet = paper ? "#eeeae3" : "#0b0a09";
  const ink = paper ? "#1b1916" : "#f1ede6";
  const dim = paper ? "rgba(27,25,22,.55)" : "rgba(241,237,230,.55)";
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const hasScore = (postType === "result" || postType === "goal") && !!score;

  /* ---- the strip ---- */
  const stripTop = 100;
  const winTop = stripTop + RAIL;
  const stripH = WIN_H + RAIL * 2;
  const stripBottom = stripTop + stripH;
  const frameNo = 8 + Math.floor(r() * 24);

  /* ---- the player in the window ---- */
  const sideShift = params.side === "left" ? -40 : 40;
  const box = placeByFace(data, CANVAS_W / 2 + sideShift, winTop + 150, { chest: 200, waist: 158, knees: 124, full: 98, bust: 230 });
  const back = data.bgPhotoUrl ?? sceneOf(data);

  /* ---- caption ---- */
  const title = sentence(content.kicker || "Matchday");
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = (typed ?? f.opp).toUpperCase();
  const pair = content.home === false ? [opp, ours.toUpperCase()] : [ours.toUpperCase(), opp];
  const fixture = opp ? (hasScore ? `${pair[0]}  ${score}  ${pair[1]}` : `${pair[0]}  v  ${pair[1]}`) : [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const date = stamp(content.date, data.fixtures?.[0]?.date);
  const when = [date, f.time ? `KICK-OFF ${f.time}` : ""].filter(Boolean).join("  ·  ");
  const comp = [f.comp, f.round].filter(Boolean).join(" / ");
  const lines = [fixture, when, f.venue, comp].filter(Boolean).slice(0, 4);
  const capX = WIN_X;
  const capW = WIN_W - 150;
  const capTop = stripBottom + 64 + ty;
  const titleSize = 40 * ts;

  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const edge = (s: number): CSSProperties => ({ fontFamily: MONO, fontSize: s, letterSpacing: "0.12em", color: AMBER, lineHeight: 1, whiteSpace: "nowrap", opacity: 0.92 });

  // Sprocket holes, phase-locked to the window so the strip reads as real stock.
  const holes: number[] = [];
  for (let x = WIN_X - PITCH * 2 + 14; x < CANVAS_W; x += PITCH) holes.push(x);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: sheet, color: ink }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        {/* Drops the faint haze some cutouts carry around the figure. */}
        <filter id="film-clean" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.1" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
      </svg>
      {/* Film base. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: stripTop, height: stripH, background: paper ? BASE : "#211a15", boxShadow: paper ? "0 18px 40px rgba(0,0,0,.18)" : "none" }} />
      {/* Sprocket rows. */}
      {[stripTop + 12, stripBottom - 12 - HOLE_H].map((y, row) =>
        holes.map((x) => <div key={`${row}-${x}`} data-bleed style={{ position: "absolute", left: x, top: y, width: HOLE_W, height: HOLE_H, borderRadius: 6, background: sheet }} />),
      )}
      {/* The neighbouring frames, just their edges. */}
      <div data-bleed style={{ position: "absolute", left: WIN_X - GAP - WIN_W, top: winTop, width: WIN_W, height: WIN_H, borderRadius: 18, background: "#2a2420" }} />
      <div data-bleed style={{ position: "absolute", left: WIN_X + WIN_W + GAP, top: winTop, width: WIN_W, height: WIN_H, borderRadius: 18, background: "#2a2420" }} />

      {/* The frame window. */}
      <div style={{ position: "absolute", left: WIN_X, top: winTop, width: WIN_W, height: WIN_H, borderRadius: 18, overflow: "hidden", background: "#3a2f27" }}>
        {back && (
          <img
            src={back}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: WIN_W + 120, height: WIN_H + 120, maxWidth: "none", objectFit: "cover", filter: "blur(16px) sepia(.22) saturate(.9) brightness(.86) contrast(.94)" }}
          />
        )}
        {data.photoUrl && (
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left - WIN_X, top: box.top - winTop, width: box.width, height: box.height, maxWidth: "none", filter: "url(#film-clean) sepia(.12) saturate(.96) contrast(1.02)", ...cutMask(data.cut) }}
          />
        )}
        {/* Warm film grade, lifted blacks, soft vignette. */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,160,80,.07)", mixBlendMode: "soft-light" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(40,24,10,.08)", mixBlendMode: "lighten" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 80% at 50% 45%, transparent 60%, rgba(20,10,4,.35) 100%)" }} />
        <Film strength={0.3} />
      </div>

      {/* Edge print. */}
      <div style={{ position: "absolute", left: WIN_X + 18, top: stripTop + 50, ...edge(12) }}>NEYOD 400</div>
      <div style={{ position: "absolute", left: WIN_X + WIN_W / 2 + 60, top: stripTop + 50, ...edge(12) }}>{`5063  ${frameNo}`}</div>
      <div style={{ position: "absolute", left: WIN_X + 18, top: stripBottom - 62, ...edge(12) }}>{`${frameNo}`}</div>
      <div style={{ position: "absolute", left: WIN_X + WIN_W / 2 - 30, top: stripBottom - 62, ...edge(12) }}>{`▸ ${frameNo}A`}</div>
      <div style={{ position: "absolute", left: WIN_X + WIN_W - 40, top: stripBottom - 62, ...edge(12) }}>{`${frameNo + 1}`}</div>

      {/* Typed caption. */}
      <div style={{ position: "absolute", left: capX, top: capTop, fontFamily: SANS, fontWeight: 500, fontSize: titleSize, letterSpacing: "-0.01em", lineHeight: 1, color: ink, whiteSpace: "nowrap" }}>{title}</div>
      {lines.map((l, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: capX, top: capTop + titleSize + 26 + i * 28, fontFamily: MONO, fontSize: fitMono(l, capW, 15 * ts, 10.5), letterSpacing: "0.06em", lineHeight: 1, color: i === 0 ? ink : dim, whiteSpace: "nowrap" }}
        >
          {l}
        </div>
      ))}
      {crests.length > 0 && (
        <div style={{ position: "absolute", right: WIN_X, top: capTop - 4, display: "flex", gap: 12, alignItems: "center" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 42, height: 42, objectFit: "contain" }} />
          ))}
        </div>
      )}

      <AgencyLogo
        data={data}
        onLight={paper}
        height={20}
        style={{ position: "absolute", right: WIN_X, bottom: 58 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
    </div>
  );
}
