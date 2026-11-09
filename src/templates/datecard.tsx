/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const INK = "#16181d";
const CARD = "#fbfaf7";

/** Inter mixed case, a safe average per character in ems. */
const interEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? 0.68 : /[il.:'·]/.test(c) ? 0.28 : 0.55), 0);
/** Inter caps with tracking `ls` (em). */
const capsEm = (t: string, ls: number) => interEm(t.toUpperCase()) + [...t].length * ls;

/** Home first, names exactly as stored. */
function fixtureOf(data: RenderData): { home: string; away: string } {
  const c = data.content;
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = c.home ?? (lc(c.homeTeam) === lc(ours) ? true : lc(c.awayTeam) === lc(ours) ? false : true);
  const opp = (weHost ? c.awayTeam : c.homeTeam) || titleCase(f.opp);
  const us = (weHost ? c.homeTeam : c.awayTeam) || ours;
  return weHost ? { home: us, away: opp } : { home: opp, away: us };
}

/** The tear-off calendar leaf: a club-colour header with the month, the day large, the kick-off under it. */
function Leaf({ w, month, day, time, club, S }: { w: number; month: string; day: string; time: string; club: string; S: number }) {
  const headH = w * 0.29;
  const dayFs = w * 0.56;
  const bodyH = w * 0.66;
  const footH = time ? w * 0.24 : w * 0.06;
  const r = w * 0.09;
  const headInk = luminance(club) > 0.5 ? INK : WHITE;
  return (
    <div style={{ position: "relative", width: w, height: headH + bodyH + footH, borderRadius: r, background: CARD, boxShadow: `0 ${18 * S}px ${44 * S}px rgba(0,0,0,.32), 0 ${2 * S}px ${6 * S}px rgba(0,0,0,.18)`, overflow: "hidden" }}>
      <div style={{ height: headH, background: club, color: headInk, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: headH * 0.42, letterSpacing: "0.22em", paddingLeft: "0.22em" }}>
        {month}
      </div>
      <div style={{ height: bodyH, display: "flex", alignItems: "center", justifyContent: "center", color: INK, fontFamily: SANS, fontWeight: 600, fontSize: dayFs, letterSpacing: "-0.045em", lineHeight: 1, fontVariantNumeric: "tabular-nums", paddingRight: "0.04em" }}>
        {day}
      </div>
      {time && (
        <div style={{ position: "relative", height: footH, display: "flex", alignItems: "flex-start", justifyContent: "center", color: INK, fontFamily: SANS, fontWeight: 500, fontSize: footH * 0.46, letterSpacing: "0.06em", opacity: 0.72 }}>
          <div style={{ position: "absolute", top: 0, left: w * 0.3, right: w * 0.3, height: Math.max(1, 1.2 * S), background: "rgba(22,24,29,.18)" }} />
          <span style={{ marginTop: footH * 0.22 }}>{time}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Datecard: the player big on a deep club-tone ground; in one top corner a small, crisp tear-off calendar
 * leaf (month in a club-colour header, the day large, the kick-off under it), and beside it, small, the
 * title, the fixture (home first, full names) and the ground. params.side puts the player on that side
 * and the card in the opposite corner.
 */
export function Datecard({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;
  const flip = params.side === "left";

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#121316" : shade(club, -0.52);
  const low = shade(ground, -0.42);
  // The card header: the club colour itself, unless it melts into near-black.
  const head = luminance(club) < 0.03 ? vivid(params.accent) : club;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const showScore = postType === "result" && !!score;
  const { home, away } = fixtureOf(data);
  const sep = showScore ? score : "v";
  const kicker = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const venue = titleCase(f.venue) || titleCase(f.comp || f.round || "");
  const month = (f.mon || "").slice(0, 3).toUpperCase();
  const hasCard = !!f.day;

  /* ---- geometry ---- */
  const M = story ? 72 : 64;
  const top = (story ? STORY_TOP : M) + (params.textY ?? 0);
  const cardW = (story ? 236 : 168) * Math.min(1.15, ts);
  const cardH = cardW * (0.29 + 0.66 + (f.time ? 0.24 : 0.06));
  const gap = story ? 44 : 34;
  const colW = CANVAS_W - 2 * M - (hasCard ? cardW + gap : 0);
  const colX = hasCard && !flip ? M + cardW + gap : M;
  const align = flip && hasCard ? "flex-end" : "flex-start";

  // Fixture: one line when it fits at a decent size, else home / v away on two lines.
  const one = home && away ? `${home}  ${sep}  ${away}` : home || away || [content.firstName, content.lastName].filter(Boolean).join(" ");
  const want = (story ? 34 : 25) * ts;
  const min = story ? 26 : 19;
  const oneFs = Math.min(want, colW / Math.max(1, interEm(one)));
  const twoLines = oneFs < min && !!home && !!away;
  const lines = twoLines ? [home, `${sep}  ${away}`] : [one];
  const fxFs = twoLines ? Math.min(want, ...lines.map((l) => colW / Math.max(1, interEm(l)))) : oneFs;

  const kFs = Math.min(12.5 * S * ts, colW / Math.max(1, capsEm(kicker, 0.34)));
  const vFs = venue ? Math.min(11.5 * S * ts, colW / Math.max(1, capsEm(venue, 0.26))) : 0;
  // A score-less card (no date): the kick-off goes into the venue line.
  const sub = [venue, !hasCard && f.time ? f.time : ""].filter(Boolean).join("  ·  ");

  /* ---- the player: on his side, head clear of the corner block ---- */
  const cx = 540 + (flip ? -1 : 1) * (story ? 70 : 90);
  const blockH = hasCard ? cardH : kFs * 2 + fxFs * 1.3 * lines.length + vFs * 3;
  const sizes = story ? { chest: 350, waist: 284, knees: 222, full: 184 } : { chest: 238, waist: 192, knees: 150, full: 118 };
  const blockBottom = top + blockH + (hasCard ? 7 * S : 0);
  const first = placeByFace(data, cx, Math.max(blockBottom + (story ? 120 : 70), story ? 560 : 330), sizes);
  // Hair rises well above the face box: keep about a face height of air between the block and his face.
  const faceTop = Math.max(blockBottom + Math.max(story ? 120 : 70, first.faceH * 1.05), story ? 560 : 330);
  const box = placeByFace(data, cx, faceTop, sizes);

  const soft: CSSProperties = { color: WHITE, whiteSpace: "pre", textShadow: "0 1px 12px rgba(0,0,0,.28)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      {/* The ground: flat club tone, a breath of light behind him, a quiet fall-off to the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(72% 54% at ${cx / 10.8}% ${story ? 54 : 52}%, ${shade(ground, 0.17)}, ${ground} 58%, ${low} 100%)` }} />

      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", left: box.left + box.width * 0.15, width: box.width * 0.7, top: H - 90, height: 120, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(40px)" }} />
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 560 : 320, background: `linear-gradient(to bottom, transparent, ${low}b0)` }} />

      {/* The calendar leaf in the corner. */}
      {hasCard && (
        <div style={{ position: "absolute", top, ...(flip ? { right: M } : { left: M }) }}>
          {/* the pad: the next leaf peeking out under this one */}
          <div style={{ position: "absolute", left: cardW * 0.035, right: cardW * 0.035, top: cardH * 0.5, height: cardH * 0.5 + 7 * S, borderRadius: cardW * 0.09, background: "#e6e3dc", boxShadow: `0 ${10 * S}px ${26 * S}px rgba(0,0,0,.28)` }} />
          <Leaf w={cardW} month={month} day={f.day} time={f.time} club={head} S={S} />
        </div>
      )}

      {/* Beside it: title, fixture, ground — small. */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top,
          width: colW,
          height: hasCard ? cardH : undefined,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: align,
          textAlign: flip && hasCard ? "right" : "left",
        }}
      >
        <div style={{ ...soft, fontFamily: SANS, fontWeight: 600, fontSize: kFs, letterSpacing: "0.34em", marginRight: flip && hasCard ? "-0.34em" : 0, lineHeight: 1.2, opacity: 0.9 }}>{kicker}</div>
        <div style={{ width: 40 * S, height: Math.max(1, 1.2 * S), background: "rgba(255,255,255,.55)", margin: `${14 * S}px 0 ${12 * S}px` }} />
        {lines.map((l, i) => (
          <div key={i} style={{ ...soft, fontFamily: SANS, fontWeight: 400, fontSize: fxFs, lineHeight: 1.28 }}>
            {l}
          </div>
        ))}
        {sub && (
          <div style={{ ...soft, marginTop: 14 * S, fontFamily: SANS, fontWeight: 500, fontSize: vFs || 11.5 * S, letterSpacing: "0.26em", marginRight: flip && hasCard ? "-0.26em" : 0, textTransform: "uppercase", lineHeight: 1.3, opacity: 0.66 }}>
            {sub}
          </div>
        )}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.16} />
    </div>
  );
}
