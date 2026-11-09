/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { mix } from "./circletext";
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f3f0ea";
const INK = "#171615";
const GREY = "#7d7a74";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Bodoni Moda 500, roughly (per 1px of size): "Matchday." measures 4.75 in the browser. */
const bodoniEm = (t: string) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.25 : /[.,!']/.test(c) ? 0.25 : /[il]/.test(c) ? 0.3 : /[mw]/.test(c) ? 0.8 : /[MW]/.test(c) ? 0.9 : /[A-Z]/.test(c) ? 0.72 : 0.52), 0);

/* Bodoni Moda “ and ” ink, per 1px of size, measured in the browser: from 0.038 to 0.404 across, 0.776 to 0.499 above the baseline. */
const Q_LEFT = 0.038;
const Q_RIGHT = 0.404;
const Q_TOP = 0.776;
const Q_BOTTOM = 0.499;
const Q_H = Q_TOP - Q_BOTTOM;
/** Bodoni Moda cap height. */
const CAP = 0.75;

/**
 * Quotes: one typographic idea on pale paper — two giant Bodoni quotation marks in the club colour framing a
 * single word, “Matchday.”, set in the same refined serif. Under it, like the attribution of a quote, an em
 * dash and the fixture (home team first, names exactly as stored), then date · kick-off · ground small and
 * grey. The player stands big on the other side (params.side), in natural colour; the NEYOD logo under the
 * words. Nothing is put in the player's mouth: the only words inside the marks are the title.
 */
export function Quotes({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.32 : 1;
  const ts = params.textScale ?? 1;
  const right = params.side !== "left";
  const club = clubTone(data);
  // Light marks: the club colour thinned into the paper, so they frame the word without shouting over it.
  const mark = mix(PAPER, club, 0.62);

  /* ---- the words ---- */
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const score = scoreOf(data, "–");
  const isResult = postType === "result" && !!score;
  const word = (isResult ? "Full time" : sentenceCase(content.kicker || "Matchday")).replace(/[.!]+$/, "") + ".";
  const fixture = teams.length === 2 ? `${teams[0]} ${isResult ? score : "v"} ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "";
  const facts = [niceDate(content.date), isResult ? "" : f.time, titleCase(f.venue)].filter(Boolean).join("  ·  ");
  const extra = titleCase(f.comp || f.round || "");

  /* ---- the quote block, measured from its top-left ---- */
  const M = 72;
  const colMax = story ? 700 : 580;
  let sz = Math.min((story ? 150 : 120) * ts, colMax / bodoniEm(word));
  sz = Math.max(60, sz);
  const W = bodoniEm(word) * sz;
  const Q = sz * 4.3;
  const qW = (Q_RIGHT - Q_LEFT) * Q;
  const markGap = sz * 0.12;
  const blockW = Math.min(CANVAS_W - 2 * M, W + markGap + qW);
  const T = (story ? STORY_TOP : 92) + (params.textY ?? 0);
  // The attribution: the dash hangs, the fixture and the facts align after it.
  const a1 = fixture ? `— ${fixture}` : "";
  const a1Size = Math.max(17, Math.min(27 * S * ts, (story ? 760 : 600) / Math.max(1, titleW(a1, 1) * 0.94)));
  const dash = titleW("— ", a1Size) * 0.94;
  const a2Size = Math.max(14, Math.min(20 * S * ts, ((story ? 760 : 600) - dash) / Math.max(1, bodyW(facts, 1))));
  const a3Size = Math.max(12, Math.min(14 * S * ts, ((story ? 760 : 600) - dash) / Math.max(1, bodyW(extra.toUpperCase(), 1) * 1.28)));
  const attrW = Math.max(titleW(a1, a1Size) * 0.94, dash + bodyW(facts, a2Size), dash + bodyW(extra.toUpperCase(), a3Size) * 1.28);
  const L = right ? M : CANVAS_W - M - Math.max(blockW, attrW);

  const openTop = T;
  const capTop = openTop + Q_H * Q + sz * 0.34;
  const base = capTop + CAP * sz;
  const closeX = L + W + markGap;
  const closeBottom = capTop + Q_H * Q;
  const a1Base = base + sz * 0.62 + a1Size * 0.4;
  const a2Base = a1Base + a2Size * 1.75;
  const a3Base = a2Base + a3Size * 2.3;
  const blockBottom = Math.max(closeBottom, (extra ? a3Base : facts ? a2Base : a1Base) + 8);

  /* ---- the player, big, on the other side, his head below the words ---- */
  const faceX = right ? (story ? 760 : 770) : story ? 320 : 310;
  const sizes = story ? { chest: 310, waist: 262, knees: 210, full: 166 } : { chest: 268, waist: 220, knees: 184, full: 150 };
  const b0 = placeByFace(data, faceX, 600, sizes);
  const hair = 600 - b0.top;
  const box = placeByFace(data, faceX, Math.max(blockBottom + hair + (story ? 50 : 34), story ? 760 : 520), sizes);

  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      {/* Paper: flat, a soft light from his side. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at ${right ? 72 : 28}% 62%, rgba(255,255,255,.6), transparent 72%)` }} />

      {/* The marks and the word. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <text x={L - Q_LEFT * Q} y={openTop + Q_TOP * Q} fontFamily={BODONI} fontWeight={500} fontSize={Q} fill={mark}>
          “
        </text>
        <text x={L - sz * 0.03} y={base} fontFamily={BODONI} fontWeight={500} fontSize={sz} letterSpacing={-sz * 0.012} fill={INK}>
          {word}
        </text>
        <text x={closeX - Q_LEFT * Q} y={capTop + Q_TOP * Q} fontFamily={BODONI} fontWeight={500} fontSize={Q} fill={mark}>
          ”
        </text>
      </svg>

      {/* The player, natural colour, in front of the marks, his head below them. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}

      {/* The attribution. */}
      {a1 && (
        <div style={{ position: "absolute", left: L, top: a1Base - a1Size * 0.92, fontFamily: SANS, fontWeight: 600, fontSize: a1Size, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: INK }}>
          {a1}
        </div>
      )}
      {facts && (
        <div style={{ position: "absolute", left: L + dash, top: a2Base - a2Size * 0.92, fontFamily: SANS, fontWeight: 400, fontSize: a2Size, lineHeight: 1, whiteSpace: "nowrap", color: GREY }}>
          {facts}
        </div>
      )}
      {extra && (
        <div style={{ position: "absolute", left: L + dash, top: a3Base - a3Size * 0.92, fontFamily: SANS, fontWeight: 500, fontSize: a3Size, lineHeight: 1, letterSpacing: "0.22em", textTransform: "uppercase", whiteSpace: "nowrap", color: GREY, opacity: 0.85 }}>
          {extra}
        </div>
      )}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{ position: "absolute", [right ? "left" : "right"]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.1} />
    </div>
  );
}
