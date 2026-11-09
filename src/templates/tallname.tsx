/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, SelectiveColorDefs } from "./fx";
import { opponentOf, rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { competitionOf, scoreOf } from "./outline";
import { AgencyLogo, DISPLAY } from "./shared";
import { CrumpledPaper, fadeBelow, inkOf, matchFacts, placeFace, secondPhoto, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Archivo Black capitals: average advance and cap height relative to the font size. */
const AB_W = 0.76;
const AB_CAP = 0.7;

const an = (w: string) => (/^[AEIOU]/i.test(w) ? "AN" : "A");

/** "5 GAMES, 3 GOALS AND 4 ASSISTS" */
function listOf(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} AND ${items[items.length - 1]}`;
}

/** A short bold caps paragraph about the player, written from the post's own data (English only). */
function bioOf(data: RenderData): string {
  const c = data.content;
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = (data.club?.name ?? "").toUpperCase();
  const pos = (data.player.position || "").toUpperCase();
  const num = data.player.number;
  const comp = competitionOf(data);
  const facts = shortFacts(data, 4).map((f) => `${f.value} ${(Number(f.value) === 1 ? f.label.replace(/s$/i, "") : f.label).toUpperCase()}`);
  const who = pos ? `${an(pos)} ${pos}` : "A PLAYER";
  const intro = club ? `${name}${num ? `, NUMBER ${num}` : ""}, IS ${who} FOR ${club}` : `${name} IS ${who}`;
  switch (data.postType) {
    case "transfer": {
      const to = (data.toClub ?? data.club)?.name?.toUpperCase();
      const from = data.fromClub?.name?.toUpperCase();
      return `${name} JOINS ${to ?? "HIS NEW CLUB"}${from ? ` FROM ${from}` : ""}.${pos || num ? ` THE ${pos || "NEW SIGNING"}${num ? ` WILL WEAR THE NUMBER ${num} SHIRT` : " IS READY TO GO"}.` : ""} A NEW CHAPTER STARTS NOW.`;
    }
    case "renewal":
      return `${name} HAS EXTENDED HIS CONTRACT${club ? ` WITH ${club}` : ""}${c.until ? ` UNTIL ${c.until}` : ""}. ${pos ? `THE ${pos}` : "HE"} STAYS WHERE HE BELONGS, READY FOR WHAT COMES NEXT.`;
    case "goal": {
      const score = scoreOf(data);
      const opp = opponentOf(data).toUpperCase();
      return `${intro}. ON THE SCORESHEET${opp ? ` AGAINST ${opp}` : ""}${score ? `, ${score} AT THE FINAL WHISTLE` : ""}${comp ? ` IN THE ${comp}` : ""}. ${facts.length ? `${listOf(facts)} SO FAR.` : "ANOTHER DAY, ANOTHER GOAL."}`;
    }
    case "matchday": {
      const m = matchFacts(data);
      const who = club ? `${name} AND ${club}` : name;
      const vs = m.opp ? ` TAKE ON ${m.opp}` : " ARE BACK IN ACTION";
      const where = [m.comp && `THE ${m.comp}`, m.round].filter(Boolean).join(", ");
      const when = [m.longDate, m.time && `KICK-OFF ${m.time}`].filter(Boolean).join(", ");
      return `${who}${vs}${where ? ` IN ${where}` : ""}.${when ? ` ${when}` : ""}${m.venue ? ` AT ${m.venue}` : ""}${when || m.venue ? "." : ""} ${c.kicker.toUpperCase()}, AND WE GO AGAIN.`;
    }
    default: {
      const sub = c.subline.toUpperCase().trim();
      const period = data.postType === "potm" ? sub : /^LAST\b/.test(sub) ? `THE ${sub}` : comp ? `THIS SEASON` : "";
      const tally = facts.length ? `${period ? `${period}: ` : ""}${listOf(facts)}. ` : "";
      return `${intro}${comp && data.postType !== "potm" && !/^LAST\b/.test(comp) ? ` IN THE ${comp}` : ""}. ${tally}${c.kicker.toUpperCase()}, AND THE BEST IS STILL TO COME.`;
    }
  }
}

/**
 * Tall poster on crumpled paper (Dybala / Roma by itx.azif): crest at the top, first and last name set
 * huge and vertical in two interlocking columns of dark club colour; a large black-and-white second
 * photo (only the kit keeps its colour) rising behind, the player in full colour in front with his ball
 * and shadow; "+" and "▪" marks, thin vertical side texts, a bold caps bio and a thin colour bar at the foot.
 */
export function Tallname({ data }: { data: RenderData }) {
  const { params, content } = data;
  const seed = params.seed ?? 27;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number) => (flip ? CANVAS_W - x : x);
  const { club } = inkOf(data);
  // The names: a deep, slightly muted club colour (Roma's maroon from its red).
  const deep = luminance(club) > 0.2 ? shade(club, -0.55) : shade(club, -0.28);
  const accent = (() => {
    const a = vivid(params.accent);
    const same = Math.abs((hueOf(a) ?? -99) - (hueOf(club) ?? 99)) < 25;
    const pick = same || luminance(a) > 0.75 || luminance(a) < 0.03 ? "#c9933e" : a;
    return luminance(pick) > 0.45 ? shade(pick, -0.25) : pick;
  })();
  const ts = params.textScale ?? 1;

  // ---- vertical names ----
  const first = content.lastName ? content.firstName.toUpperCase().trim() : "";
  const last = (content.lastName || content.firstName).toUpperCase().trim();
  const lenL = [...last].length;
  const lenF = [...first].length;
  // Short names in wide Archivo Black (the reference); long ones in Anton, so the columns stay heavy.
  const anton = Math.max(lenL, lenF) >= 7;
  const font = anton ? DISPLAY : ARCHIVO_BLACK;
  const adv = (t: string) => (anton ? em(t, ANTON, 0.46) : [...t].length * AB_W);
  const capR = anton ? 0.87 : AB_CAP;
  const maxL = 940;
  const maxF = 800;
  const size = Math.min(anton ? 250 : 240, maxL / Math.max(2.4, adv(last)), first ? maxF / Math.max(2.4, adv(first)) : 999) * ts;
  const thick = size * capR;
  // Rotated, a surname's accents (Ã, É) reach towards the first name, and the first name's cedilla
  // (Ç) reaches towards the surname: open the gap for them.
  const above = /[À-ÖÙ-Ý]/.test(last) && !/^[Ç]+$/.test(last.replace(/[^À-ÖÙ-Ý]/g, "")) ? size * (anton ? 0.21 : 0.19) : 0;
  const below = /[ÇQJ]/.test(first) ? size * (anton ? 0.2 : 0.16) : 0;
  const gap = Math.max(10, size * 0.07) + above + below;
  const cx = X(672 + (r() - 0.5) * 24);
  const lastBottom = 1112;
  const lenLast = Math.min(maxL, adv(last) * size);
  const lenFirst = Math.min(maxF, adv(first) * size);
  // The first name sits a little lower down the page than the surname's top, like two interlocking bars.
  const firstBottom = lastBottom - Math.min(140, Math.max(50, (lenLast - lenFirst) * 0.35 + 40));
  const cols = first
    ? [
        { text: first, x0: cx - gap / 2 - thick, bottom: firstBottom, len: lenFirst },
        { text: last, x0: cx + gap / 2, bottom: lastBottom, len: lenLast },
      ]
    : [{ text: last, x0: cx - thick / 2, bottom: lastBottom, len: lenLast }];

  // ---- players ----
  const second = secondPhoto(data, seed + 1);
  const hue = hueOf(club);
  const up = second
    ? placeFace(
        { ...data, face: second.face, photoAspect: second.aspect, facePx: 0, params: { ...params, playerScale: 1, playerX: 0, playerY: 0 } },
        X(370 + (r() - 0.5) * 30),
        205 + r() * 25,
        138,
        960,
      )
    : null;
  const main = data.photoUrl ? standing(data, { cx: X(430 + (r() - 0.5) * 30), headTop: 560, floor: 1228, maxFace: 120, framing: "full" }) : null;

  // ---- side texts ----
  const full = [content.firstName, content.lastName].filter(Boolean).join("  ").toUpperCase();
  const words = content.kicker.toUpperCase().split(/\s+/).filter(Boolean);
  const hot = words.length - 1;
  const side: CSSProperties = { position: "absolute", top: 0, height: CANVAS_H, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" };
  const vText: CSSProperties = { transform: "rotate(-90deg)", whiteSpace: "nowrap", fontFamily: ARCHIVO_BLACK, letterSpacing: "0.16em", lineHeight: 1 };
  const sideSize = (t: string) => Math.min(24, 520 / Math.max(1, [...t].length * 0.95));

  const bio = bioOf(data);
  const bioSize = Math.min(16.5, Math.sqrt((360 * 118) / Math.max(60, bio.length)) * 0.9);

  // Marks hug the far side of the names, away from the players.
  const colsL = Math.min(...cols.map((c) => c.x0));
  const colsR = Math.max(...cols.map((c) => c.x0 + thick));
  const tail = /[ÇQJ]/.test(last) ? size * 0.2 : 0;
  const plusX = flip ? colsL - 60 : colsR + 34 + tail;
  const marks = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#ece7e4", color: deep }}>
      <CrumpledPaper color="#ece7e4" seed={(seed % 40) + 3} id="tall-paper" strength={1.15} />
      {hue != null && <SelectiveColorDefs id="tall-pop" hue={hue} />}

      {data.club?.crestUrl && (
        <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 540 - 50, top: 34, width: 100, height: 100, objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.18))" }} />
      )}

      {/* "+" column and square marks */}
      <div style={{ position: "absolute", left: plusX, top: 238, display: "flex", flexDirection: "column", gap: 20 }}>
        {marks.map((i) => (
          <svg key={i} width={28} height={28}>
            <path d="M14 3 V25 M3 14 H25" stroke={deep} strokeWidth={4} />
          </svg>
        ))}
      </div>
      <div style={{ position: "absolute", left: flip ? colsL : colsR - 102, top: lastBottom + 26, display: "flex", gap: 10 }}>
        {marks.map((i) => (
          <div key={i} style={{ width: 18, height: 18, background: deep }} />
        ))}
      </div>

      {/* The big second photo: black and white, the kit keeps its colour; dissolves before the feet. */}
      {second && up && (
        <img
          src={second.url}
          alt=""
          style={{
            position: "absolute",
            left: up.left,
            top: up.top,
            width: second.aspect ? up.width : "auto",
            height: up.height,
            maxWidth: "none",
            filter: hue != null ? "url(#tall-pop) saturate(.8) contrast(1.1)" : "grayscale(1) contrast(1.1)",
            ...fadeBelow(up, 800, 1000),
          }}
        />
      )}

      {/* The names, bottom to top: over the grey photo, under the player in colour */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        {cols.map((c, i) => (
          <text
            key={i}
            transform={`translate(${(c.x0 + thick).toFixed(1)} ${c.bottom}) rotate(-90)`}
            x={0}
            y={0}
            textLength={c.len}
            lengthAdjust="spacingAndGlyphs"
            style={{ fontFamily: font, fontSize: size }}
            fill={deep}
          >
            {c.text}
          </text>
        ))}
      </svg>

      {/* The player in colour, on the paper, with the ball and a soft floor shadow. */}
      {main && data.photoUrl && (
        <>
          {main.feet && (
            <div style={{ position: "absolute", left: main.faceCx - main.width * 0.55, top: 1206, width: main.width * 1.1, height: 46, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.35), transparent)", filter: "blur(4px)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 12px 18px rgba(0,0,0,.2))" }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", left: main.left, top: main.top, width: main.width, height: main.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05)" }} />
          </div>
        </>
      )}

      {/* Thin vertical side texts */}
      <div style={{ ...side, left: 52, width: 40 }}>
        <div style={{ ...vText, fontSize: sideSize(full), color: deep }}>{full}</div>
      </div>
      <div style={{ ...side, right: 52, width: 40 }}>
        <div style={{ ...vText, fontSize: sideSize(content.kicker), color: deep }}>
          {words.map((w, i) => (
            <span key={i} style={{ color: i === hot && words.length > 1 ? accent : deep }}>
              {i ? " " : ""}
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div
        style={{
          position: "absolute",
          [flip ? "left" : "right"]: 60,
          bottom: 64,
          width: 360,
          fontFamily: ARCHIVO_BLACK,
          fontSize: bioSize,
          lineHeight: 1.32,
          letterSpacing: "0.03em",
          textAlign: "justify",
          textAlignLast: "left",
          color: deep,
        }}
      >
        {/* Scores never break at their dash. */}
        {bio.split(/(\d+-\d+)/).map((part, i) => (i % 2 ? <span key={i} style={{ whiteSpace: "nowrap" }}>{part}</span> : part))}
      </div>

      <div style={{ position: "absolute", [flip ? "right" : "left"]: 60, bottom: 50, display: "flex", alignItems: "center", gap: 10 }}>
        <AgencyLogo data={data} height={30} onLight style={{ color: deep }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: deep }} />
    </div>
  );
}
