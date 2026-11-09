/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { opponentOf, rng, SCRIPT } from "./kit";
import { standing } from "./mist";
import { competitionOf, scoreOf } from "./outline";
import { cleanCompetition } from "./sepia";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** A saturated club colour white text can sit on: neon / pale shades are deepened, black becomes a soft charcoal. */
export function flatClubColour(primary: string, accent: string): string {
  let c = primary === "#10131c" || hueOf(primary) == null ? accent : primary;
  if (hueOf(c) == null) c = hueOf(primary) != null ? primary : "#2b2f38";
  if (hueOf(c) == null) return luminance(c) > 0.3 ? "#3a3d44" : "#26292f";
  c = vivid(c);
  for (let i = 0; i < 6 && luminance(c) > 0.2; i++) c = shade(c, -0.14);
  return c;
}

const CAP: CSSProperties = {
  position: "absolute",
  fontFamily: CONDENSED,
  fontWeight: 600,
  fontSize: 19,
  lineHeight: 1.18,
  letterSpacing: "0.02em",
  color: WHITE,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

/** Barlow semi-bold caps: average advance relative to the font size. */
const CAP_ADV = 0.5;

/**
 * Phil Foden "notes" poster: a flat saturated club-colour ground with grain, the whole player celebrating in
 * the middle on a soft oval shadow, his name across his chest in a fine white script, and tiny white caps
 * notes floating round him like a spec sheet (club, competition, position, number, the numbers of the post),
 * his shirt number scattered small; the agency mark in a corner. Lots of air.
 */
export function Notes({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 47);
  const bg = flatClubColour(params.primary, params.accent);
  const left = params.side === "left";

  // ---- the player ----
  const floor = 1110 + r() * 20;
  const cx = 540 + (left ? -1 : 1) * r() * 30;
  const box = standing(data, { cx, headTop: 290 + r() * 30, floor, maxFace: 110, framing: "full" });
  const right = box.left + box.width;
  const faceCx = box.faceCx;

  // ---- facts ----
  const up = (s: string) => s.toUpperCase().trim();
  const club = data.toClub ?? data.club;
  const clubName = up(club?.name ?? "");
  const comp = up(cleanCompetition(competitionOf(data)));
  const num = data.player.number;
  const pos = up(data.player.position ?? "");
  const score = scoreOf(data);
  const opp = up(opponentOf(data));
  const stats = content.stats.filter((s) => s.value && s.value !== "0" && !/-/.test(s.value));

  const kickerLines = (() => {
    const w = up(content.kicker).split(/\s+/).filter(Boolean);
    if (w.length <= 2) return [w.join(" ")];
    const h = Math.ceil(w.length / 2);
    return [w.slice(0, h).join(" "), w.slice(h).join(" ")];
  })();
  const headline = [...kickerLines, ...(postType === "potm" || postType === "stats" ? [up(content.subline)] : [])].filter(Boolean);
  // Player of the month / form posts carry a month or "LAST 5 GAMES" as caption, not a competition.
  const compShown = postType === "potm" || postType === "stats" ? "" : comp;
  const clubNote = [clubName, compShown && compShown !== clubName ? compShown : ""].filter(Boolean);
  const roleNote = [pos, num ? `NO. ${num}` : ""].filter(Boolean);
  let numbersNote: string[] = [];
  if ((postType === "goal" || postType === "result") && score) numbersNote = [`FULL TIME ${score}`, opp ? `V ${opp}` : ""].filter(Boolean);
  else if (postType === "transfer") numbersNote = [data.fromClub ? `FROM ${up(data.fromClub.name)}` : "", clubName ? `TO ${clubName}` : ""].filter(Boolean);
  else if (postType === "renewal") numbersNote = content.until ? ["CONTRACT", `UNTIL ${up(content.until)}`] : ["NEW", "CONTRACT"];
  if (postType !== "transfer" && postType !== "renewal") stats.slice(0, postType === "goal" || postType === "result" ? 1 : 3).forEach((s) => numbersNote.push(`${s.value} ${up(s.label).replace(/S$/, "")}${s.value === "1" ? "" : "S"}`));
  // A transfer names the club in the numbers note already: the club note keeps the competition only.
  const clubNoteShown = postType === "transfer" ? [compShown].filter(Boolean) : clubNote;

  // ---- name across the chest ----
  const cap1 = (t: string) => (t === t.toLowerCase() ? t.replace(/(^|\s)(\p{L})/gu, (m) => m.toUpperCase()) : t.replace(/\p{L}+/gu, (w) => (w === w.toUpperCase() && w.length > 2 ? w.charAt(0) + w.slice(1).toLowerCase() : w)));
  const name = cap1([content.firstName, content.lastName].filter(Boolean).join(" "));
  const nameSize = Math.min(104, 900 / Math.max(4, [...name].length * 0.42));
  const chestY = box.faceTop + box.faceH * 2.35;

  // Notes sit just outside the photo's box (never on the player), at head, shoulder, hip and boot height.
  const face = box.faceH;
  const headY = box.faceTop;
  const fits = (lines: string[], room: number) => Math.max(14, Math.min(19, room / Math.max(1, Math.max(...lines.map((l) => l.length)) * CAP_ADV)));
  const roomR = CANVAS_W - 64 - (right + 26);
  const roomL = box.left - 26 - 64;
  type Spot = { lines: string[]; side: "l" | "r"; y: number };
  const spots: Spot[] = [];
  const flip = (s: "l" | "r") => (left ? (s === "l" ? "r" : "l") : s);
  const shoulderY = headY + face * 1.9;
  const hipY = headY + face * 3.9 + r() * 30;
  const bootY = box.feet ? floor - face * 1.6 : 1030;
  if (headline.length) spots.push({ lines: headline, side: flip("r"), y: headY - face * 0.6 });
  if (roleNote.length) spots.push({ lines: roleNote, side: flip("l"), y: Math.min(shoulderY - 20, chestY - nameSize * 0.5 - 62) });
  if (clubNoteShown.length) spots.push({ lines: clubNoteShown, side: flip("l"), y: hipY });
  if (numbersNote.length) spots.push({ lines: numbersNote, side: flip("r"), y: bootY });

  const notes = spots.map((s, i) => {
    const room = s.side === "r" ? roomR : roomL;
    // Too little room outside the box: tuck the note in the corner margin instead.
    const size = fits(s.lines, Math.max(room, 150));
    const pos: CSSProperties =
      s.side === "r"
        ? { left: Math.min(right + 26, CANVAS_W - 64 - Math.max(...s.lines.map((l) => l.length)) * size * CAP_ADV) }
        : { right: Math.min(CANVAS_W - (box.left - 26), CANVAS_W - 64 - Math.max(...s.lines.map((l) => l.length)) * size * CAP_ADV) };
    return (
      <div key={i} style={{ ...CAP, ...pos, top: s.y, fontSize: size, textAlign: s.side === "r" ? "left" : "right" }}>
        {s.lines.map((l, j) => (
          <div key={j} style={{ paddingLeft: s.side === "r" && j > 0 && i === 0 ? size * 0.9 * (j % 2) : 0 }}>
            {l}
          </div>
        ))}
      </div>
    );
  });

  // The shirt number, small, scattered where the notes aren't.
  const numbers = num
    ? [
        { x: faceCx + (left ? -1 : 1) * face * 0.95, y: headY + face * 0.55 },
        { x: box.left + box.width * (left ? 0.72 : 0.28), y: headY + face * 3.05 },
        { x: faceCx + (left ? -1 : 1) * face * 0.3, y: headY + face * 4.6 },
      ]
    : [];


  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg }}>
      {/* A flat colour with the faintest light in the middle, and heavy grain. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 45%, ${shade(bg, 0.08)}, ${bg} 70%, ${shade(bg, -0.12)})` }} />

      {/* Soft oval shadow on the floor. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: faceCx - box.width * 0.34, top: floor - 18, width: box.width * 0.68, height: 36, borderRadius: "50%", background: shade(bg, -0.6), opacity: 0.55, filter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: faceCx - box.width * 0.2, top: floor - 10, width: box.width * 0.4, height: 18, borderRadius: "50%", background: shade(bg, -0.75), opacity: 0.6, filter: "blur(5px)" }} />
        </>
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.05)", ...cutMask(data.cut) }}
        />
      )}

      {/* His name, in a fine white script across the chest. */}
      {name && (
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: chestY - nameSize * 0.55,
            textAlign: "center",
            fontFamily: SCRIPT,
            fontSize: nameSize,
            lineHeight: 1.1,
            color: WHITE,
            whiteSpace: "nowrap",
            wordSpacing: "0.28em",
            textShadow: `0 2px 14px ${shade(bg, -0.5)}88`,
          }}
        >
          {name}
        </div>
      )}

      {notes}
      {numbers.map((n, i) => (
        <div key={`n${i}`} style={{ ...CAP, left: n.x - 20, width: 40, textAlign: "center", top: n.y, fontSize: 17, opacity: 0.95 }}>
          {num}
        </div>
      ))}

      <div style={{ position: "absolute", bottom: 54, [left ? "left" : "right"]: 60, transform: "rotate(-6deg)" }}>
        <AgencyLogo data={data} height={30} style={{ color: WHITE }} />
      </div>

      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.3, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundPosition: "40px 70px", opacity: 0.08, mixBlendMode: "soft-light", pointerEvents: "none" }} />
    </div>
  );
}
