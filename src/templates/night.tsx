/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask, Film, Grass } from "./fx";
import { rng, SCRIPT } from "./kit";
import { titleWords } from "./chrome";
import { standing } from "./mist";
import { competitionOf, roundOf, scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const NAVY = "#0a1638";

const MONTHS: Record<string, string> = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

/** "SAT 10 OCT" → "10.10" (the European way of writing a fixture date). */
function dotDate(d: string | undefined): string {
  if (!d) return "";
  const m = d.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m && MONTHS[m[2]] ? `${m[1].padStart(2, "0")}.${MONTHS[m[2]]}` : d.toUpperCase();
}

/** "MAN OF THE" → "Man of the": handwriting is written in sentence case. */
const handwritten = (s: string) => s.toLowerCase().replace(/(^|\s)(\S)/, (_, a, b) => a + b.toUpperCase());

/** A crest on a square tile (club colour for us, deep navy with a hairline for the other side). */
function Tile({ src, bg, size }: { src?: string | null; bg: string; size: number }) {
  return (
    <div style={{ width: size, height: size, background: bg, border: "1.5px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 34px rgba(0,0,0,.45)" }}>
      {src && <img src={src} alt="" style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.35))" }} />}
    </div>
  );
}

/**
 * European night (Arsenal "MATCH Day", Champions League): a deep navy, blurred crowd and stadium, a strip of
 * floodlit pitch at the foot; the player full length in action, sharp against the soft background; at the
 * top a very wide heavy white "MATCH" with "Day" handwritten across it in the club colour, then both crests
 * on square tiles with the competition between them, and the date, kick-off and ground.
 */
export function Night({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 61);
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // The script must glow against navy: black / navy clubs write in their accent, else white.
  const club = luminance(base) < 0.07 ? (luminance(vivid(params.accent)) > 0.07 ? vivid(params.accent) : "#e8e8ea") : base;
  const ts = params.textScale ?? 1;
  const flip = params.side === "left";

  // ---- scene ----
  const scene = params.scene ?? data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? null;
  const floor = 1292;

  // ---- title ----
  const { front, back, stacked } = titleWords(content.kicker, content.lastName || content.firstName || "");
  const frontW = Math.min(960, Math.max(520, [...front].length * 190)) * ts;
  const frontSize = Math.min(200 * ts, frontW / Math.max(1, [...front].length * 0.86));
  const titleTop = 58;
  const capH = frontSize * 0.72;
  const script = handwritten(back);
  const scriptSize = Math.min(stacked ? 150 : 230, (stacked ? 820 : 640) / Math.max(1, [...script].length * 0.34)) * ts;

  // ---- fixture row ----
  const score = scoreOf(data, " - ");
  const showScore = (postType === "result" || postType === "goal") && !!score;
  const homeCrest = content.homeCrest ?? (content.awayCrest ? null : data.club?.crestUrl);
  const awayCrest = content.awayCrest;
  const ours = (data.club?.name ?? "").toLowerCase();
  const homeIsUs = content.home !== false && (!content.homeTeam || content.homeTeam.toLowerCase() === ours || content.home === true);
  const comp = competitionOf(data);
  const round = roundOf(data).split("·").slice(1).join("·").trim();
  const rowTop0 = titleTop + capH + 110;
  const tile = 150;
  // Neon club colours (lime, cyan) calmed down for a solid tile.
  const tileBg = luminance(club) > 0.3 ? shade(club, -0.3) : club;
  const when = [dotDate(content.date), content.time].filter(Boolean).join("  -  ");
  const venue = content.venue || "";

  // ---- the player: full length, feet on the pitch ----
  const headTop0 = rowTop0 + tile + (when || venue ? 120 : 50);
  const cx = 540 + (flip ? -30 : 30) + (r() - 0.5) * 40;
  // A tight framing the photo can't hold (small face) would sink his head: widen the framing instead.
  const order = ["chest", "waist", "knees", "full"];
  const tries = order.slice(Math.max(0, order.indexOf(params.framing ?? "full")));
  let fig = standing(data, { cx, headTop: headTop0, floor, maxFace: 150, framing: tries[0] });
  for (const f of tries.slice(1)) {
    if (fig.faceTop - fig.faceH * 0.6 - headTop0 < 120) break;
    fig = standing(data, { cx, headTop: headTop0, floor, maxFace: 150, framing: f });
  }
  // A small photo that can't be enlarged leaves his head low: the fixture block comes down to meet him halfway.
  const hair = fig.faceTop - fig.faceH * 0.6;
  const drop = Math.max(0, Math.min(260, (hair - headTop0) * 0.5));
  const rowTop = rowTop0 + drop;

  const compWords = comp.split(/\s+/).filter(Boolean);
  const compLines = comp.length > 14 && compWords.length > 1 ? [compWords.slice(0, Math.ceil(compWords.length / 2)).join(" "), compWords.slice(Math.ceil(compWords.length / 2)).join(" ")] : [comp];
  const compSize = Math.min(30, 300 / Math.max(1, Math.max(...compLines.map((l) => l.length)) * 0.62));
  const infoCol: CSSProperties = { fontFamily: CONDENSED, color: WHITE, textAlign: "center", whiteSpace: "nowrap", textShadow: "0 2px 10px rgba(0,0,0,.5)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: NAVY, color: WHITE }}>
      {/* Blurred crowd and stands, pushed into deep navy. */}
      {scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: CANVAS_H + 120, maxWidth: "none", objectFit: "cover", filter: "blur(14px) saturate(.7) brightness(.8)" }} />
      ) : data.bgPhotoUrl ? (
        <img src={data.bgPhotoUrl} alt="" style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CANVAS_H + 180, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(.7)" }} />
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: "#13245c", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: "#1a2f78", mixBlendMode: "color", opacity: 0.55 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 40% at 18% 6%, rgba(90,130,255,.28), transparent 70%), linear-gradient(to bottom, rgba(6,12,32,.55), rgba(6,12,32,.15) 40%, rgba(6,12,32,.35) 78%)` }} />

      {/* Advertising boards, out of focus, then the floodlit pitch. */}
      <div data-bleed style={{ position: "absolute", left: -20, right: -20, top: floor - 190, height: 70, background: `linear-gradient(to right, ${shade(club, -0.55)}cc, #2a1d4acc 30%, #1c1640cc 70%, ${shade(club, -0.55)}cc)`, filter: "blur(5px)" }} />
      <div data-bleed style={{ position: "absolute", left: -20, right: -20, top: floor - 190, height: 70, filter: "blur(9px)", opacity: 0.5 }}>
        {[0.08, 0.34, 0.62, 0.86].map((x, i) => (
          <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: 18, width: 120 + i * 20, height: 34, borderRadius: 30, background: i % 2 ? "rgba(255,255,255,.5)" : `${club}aa` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: floor - 122, bottom: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, filter: "blur(1.6px) brightness(.62) saturate(.85)" }}>
          <Grass base="#2d5f2e" />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,14,30,.75), rgba(8,14,30,.1) 45%, rgba(8,14,30,.35))" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, height: 3, background: "rgba(255,255,255,.35)", filter: "blur(1px)" }} />
      </div>

      {/* Contact shadow and the player, crisp. */}
      {fig.feet && <div style={{ position: "absolute", left: fig.faceCx - 190, top: floor - 22, width: 380, height: 44, borderRadius: "50%", background: "rgba(0,0,0,.55)", filter: "blur(12px)" }} />}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 1.2px rgba(190,210,255,.55)) drop-shadow(0 24px 40px rgba(0,0,0,.5))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.08) saturate(1.06) brightness(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* "MATCH", very wide and heavy, with "Day" written across it. */}
      <svg width={CANVAS_W} height={capH + 60} style={{ position: "absolute", left: 0, top: titleTop - 20, overflow: "visible", filter: "drop-shadow(0 10px 26px rgba(0,0,0,.45))" }}>
        <defs>
          <linearGradient id="nt-w" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dfe4ee" />
          </linearGradient>
        </defs>
        <text x={540 - frontW / 2} y={20 + capH} textLength={frontW} lengthAdjust="spacingAndGlyphs" fill="url(#nt-w)" style={{ fontFamily: ARCHIVO_BLACK, fontSize: frontSize }}>
          {front}
        </text>
      </svg>
      {script && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: stacked ? titleTop - scriptSize * 0.55 : titleTop + capH * 0.5 - scriptSize * 0.62,
            paddingLeft: stacked ? 0 : 180,
            textAlign: "center",
            fontFamily: SCRIPT,
            fontSize: scriptSize,
            lineHeight: 1.1,
            color: club,
            whiteSpace: "nowrap",
            transform: `rotate(${-7 + r() * 3}deg)`,
            textShadow: `0 0 18px ${shade(club, -0.4)}88, 0 4px 10px rgba(0,0,0,.35)`,
          }}
        >
          {script}
        </div>
      )}

      {/* Crest tiles, competition (or score) between them. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: rowTop, display: "flex", justifyContent: "center", alignItems: "center", gap: 70 }}>
        {homeCrest ? <Tile src={homeCrest} bg={homeIsUs ? tileBg : shade(NAVY, 0.12)} size={tile} /> : <div style={{ width: tile }} />}
        <div style={{ width: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          {showScore ? (
            <>
              {comp && <div style={{ ...infoCol, fontWeight: 600, fontSize: Math.min(20, compSize), letterSpacing: "0.14em", opacity: 0.85 }}>{comp}</div>}
              <div style={{ ...infoCol, fontFamily: ARCHIVO_BLACK, fontSize: 84, lineHeight: 1 }}>{score}</div>
              <div style={{ ...infoCol, fontWeight: 700, fontSize: 20, letterSpacing: "0.22em" }}>FULL TIME</div>
            </>
          ) : (
            <>
              {compLines.map((l, i) => (
                <div key={i} style={{ ...infoCol, fontWeight: 700, fontSize: compSize, lineHeight: 1.05, letterSpacing: "0.08em" }}>
                  {l}
                </div>
              ))}
              {round && <div style={{ ...infoCol, fontWeight: 500, fontSize: 18, letterSpacing: "0.2em", opacity: 0.8, marginTop: 4 }}>{round}</div>}
            </>
          )}
        </div>
        {awayCrest ? <Tile src={awayCrest} bg={!homeIsUs ? tileBg : shade(NAVY, 0.12)} size={tile} /> : <div style={{ width: tile }} />}
      </div>

      {/* Date, kick-off and ground. */}
      {(when || venue) && (
        <div style={{ position: "absolute", left: 60, right: 60, top: rowTop + tile + 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {when && !showScore && <div style={{ ...infoCol, fontWeight: 700, fontSize: 34, letterSpacing: "0.04em" }}>{when}</div>}
          {venue && <div style={{ ...infoCol, fontWeight: 600, fontSize: Math.min(26, 700 / Math.max(1, venue.length * 0.5)) }}>{venue}</div>}
        </div>
      )}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", right: 50, bottom: 34, opacity: 0.85 }} />
      <Film strength={0.9} />
    </div>
  );
}
