/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask } from "./fx";
import { Paper, rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Archivo Black advance widths (per 100px), measured in the browser, like Anton's in mist.tsx. */
const ARCHIVO: Record<string, number> = { A: 77.8, B: 77.8, C: 77.8, D: 77.8, E: 72.2, F: 66.7, G: 83.3, H: 83.3, I: 38.9, J: 66.7, K: 83.3, L: 66.7, M: 94.4, N: 83.3, O: 83.3, P: 72.2, Q: 83.3, R: 77.8, S: 72.2, T: 72.2, U: 83.3, V: 77.8, W: 100, X: 77.8, Y: 77.8, Z: 72.2, "!": 33.3, "'": 27.8, "-": 33.3, "–": 50, " ": 33.3, "1": 66.7 };
const FACES = {
  anton: { font: DISPLAY, table: ANTON, digit: 49.4, cap: 0.86 },
  archivo: { font: ARCHIVO_BLACK, table: ARCHIVO, digit: 66.7, cap: 0.688 },
};

const SMALL = new Set(["OF", "THE", "A", "IS", "TO", "IT'S", "ITS", "ON"]);

/**
 * The kicker as two giant lines plus the small words tucked beside them:
 * "IT'S MATCHDAY" → IT'S · MATCH / DAY!, "GOAL" → GO / AL!, "MAN OF THE MATCH" → MAN · OF THE / MATCH,
 * "HAT-TRICK" → HAT- / TRICK!. Leading small words go in front of line 1, inner ones after it.
 */
export function giantLines(kicker: string, shout: boolean): { lines: string[]; lead: string; inner: string } {
  const words = kicker.toUpperCase().replace(/’/g, "'").split(/\s+/).filter(Boolean);
  let i = 0;
  const lead: string[] = [];
  while (i < words.length - 1 && SMALL.has(words[i])) lead.push(words[i++]);
  const rest = words.slice(i);
  const big = rest.filter((w) => !SMALL.has(w));
  const innerWords = rest.filter((w) => SMALL.has(w));
  let lines: string[];
  if (big.length >= 2) {
    // Balance the words over two lines.
    let best = 1;
    let score = Infinity;
    for (let k = 1; k < big.length; k++) {
      const d = Math.abs(big.slice(0, k).join(" ").length - big.slice(k).join(" ").length);
      if (d < score) [score, best] = [d, k];
    }
    lines = [big.slice(0, best).join(" "), big.slice(best).join(" ")];
  } else {
    const w = big[0] ?? "";
    const day = w.match(/^(.+?)(DAY)$/);
    if (day) lines = [day[1], day[2]];
    else if (w.includes("-")) lines = [w.slice(0, w.indexOf("-") + 1), w.slice(w.indexOf("-") + 1)];
    else if (w.length >= 4) lines = [w.slice(0, Math.ceil(w.length / 2)), w.slice(Math.ceil(w.length / 2))];
    else lines = [w];
  }
  if (shout && lines.length === 2 && !/[!?.]$/.test(lines[1])) lines[1] += "!";
  return { lines, lead: lead.join(" "), inner: innerWords.join(" ") };
}

/** A readable ink in the club colour: dark enough to carry giant letters on off-white paper. */
function clubInk(data: RenderData): string {
  const { primary, accent } = data.params;
  let c = vivid(primary === "#10131c" ? accent : primary);
  if (luminance(c) > 0.85 || luminance(c) < 0.004) c = vivid(accent);
  if (luminance(c) > 0.85) c = "#1c1d22";
  for (let k = 0; k < 6 && luminance(c) > 0.2; k++) c = shade(c, -0.18);
  return c;
}

const PRINT_ID = "gd-print";

/**
 * College gameday poster (Louisiana Ragin' Cajuns "IT'S GAME DAY!"): off-white paper, the kicker as two
 * gigantic condensed lines in the club colour filling the sheet, the player standing in front of them
 * with a soft floor shadow, and a ruled ticket table in the corner (club name · crests · teams · kick-off /
 * score · date · ground). The agency mark sits under his feet.
 */
export function Gameday({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 23);
  const ink = clubInk(data);
  const dark = "#17181c";
  const paper = "#f1ede4";
  const left = params.side !== "right";

  // ---- The giant words -------------------------------------------------------------------------
  const { lines, lead, inner } = giantLines(content.kicker, postType !== "result");
  const X0 = 30;
  const W = CANVAS_W - 2 * X0;
  const areaTop = 34;
  const areaH = 930;
  const gap = 18;
  const tagW = 74;
  const n = lines.length;
  // Condensed Anton for most words; the wider heavy face when the lines are short ("GO / AL!").
  const pick = (f: (typeof FACES)["anton"]) => {
    const capMax = n === 2 ? (areaH - gap) / 2 : Math.min(areaH * 0.62, 620);
    const widths = lines.map((l, i) => W - (i === 0 && (lead || inner) ? tagW : 0));
    // Largest cap height at which the widest line still only needs compressing to ≥ 0.62.
    let cap = capMax;
    lines.forEach((l, i) => {
      const nat = (em(l, f.table, f.digit) / f.cap) * cap;
      if (nat * 0.62 > widths[i]) cap = Math.min(cap, (widths[i] / 0.62 / em(l, f.table, f.digit)) * f.cap);
    });
    const squeeze = lines.map((l, i) => widths[i] / ((em(l, f.table, f.digit) / f.cap) * cap));
    return { f, cap, widths, squeeze };
  };
  const a = pick(FACES.anton);
  const b = pick(FACES.archivo);
  const stretchA = Math.max(...a.squeeze);
  const g = stretchA > 1.18 && Math.min(...b.squeeze) >= 0.62 ? b : a;
  // Never stretch a line wider than 1.15× its natural width: shorter lines are centred instead.
  const lineW = g.widths.map((w, i) => (g.squeeze[i] > 1.15 ? w * (1.15 / g.squeeze[i]) : w));
  const cap = g.cap;
  const fontSize = cap / g.f.cap;
  const blockH = n * cap + (n - 1) * gap;
  const top0 = areaTop + Math.max(0, (areaH - blockH) / 2) * (n === 1 ? 1 : 0);
  const baselines = lines.map((_, i) => top0 + cap * (i + 1) + gap * i);

  // ---- The player ------------------------------------------------------------------------------
  const tableW = 540;
  const tableX = left ? CANVAS_W - 40 - tableW : 40;
  const tableTop = 1000;
  const cx0 = left ? 300 + r() * 40 : CANVAS_W - 300 - r() * 40;
  let box = standing(data, { cx: cx0, headTop: 250 + r() * 40, floor: 1290, maxFace: 170, framing: params.framing === "full" || !params.framing ? "full" : "knees" });
  const fxFrac = (box.faceCx - box.left) / box.width;
  // Keep the body clear of the ticket table: slide him outwards, then shrink if he is still too wide.
  // Cutouts are trimmed to the player, so the box edge is his hand or elbow: he fits between the outer edge
  // of the canvas and the table, shrinking if he has to.
  // A photo already cut at that side (an arm running out of frame) may run off the canvas instead.
  const outer = ((left ? data.cut?.left : data.cut?.right) ?? 0) > 0 ? -box.width * 0.12 : 16;
  const spanL = left ? outer : tableX + tableW + 12;
  const spanR = left ? tableX - 12 : CANVAS_W - outer;
  if (box.width > spanR - spanL) {
    const nw = spanR - spanL;
    const bottom = box.feet ? box.top + box.height : 1350;
    const frac = (bottom - box.top) / box.height;
    const h = (box.height * nw) / box.width;
    box = { ...box, width: nw, height: h, top: bottom - frac * h };
  }
  box = { ...box, left: Math.min(Math.max(box.left, spanL), spanR - box.width) };
  const feet = box.feet;

  // ---- Words for the ticket --------------------------------------------------------------------
  const score = content.homeGoals != null && String(content.homeGoals) !== "" ? `${content.homeGoals}–${content.awayGoals}` : "";
  const big = postType === "matchday" ? content.time || "TBC" : score || content.time || "";
  const vertical = postType === "matchday" ? (content.date ?? "").toUpperCase() : postType === "result" ? "FULL TIME" : "";
  const competition = (content.subline.split("·")[0] ?? "").trim().toUpperCase();
  const place = (postType === "matchday" ? content.venue || competition : competition).toUpperCase();
  const teams = [content.homeTeam, content.awayTeam].filter(Boolean).map((t) => t!.toUpperCase());
  const clubWords = (data.club?.name ?? content.homeTeam ?? "")
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);
  const slogan = [clubWords.join(" ")].filter(Boolean);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const crests = [content.homeCrest ?? data.club?.crestUrl, content.awayCrest].filter(Boolean) as string[];

  const hasAgency = !!(data.agency.logoDarkUrl || data.agency.logoUrl || data.agency.name);
  const line: CSSProperties = { position: "absolute", background: dark };
  const cell = (x: number, y: number, w: number, h: number): CSSProperties => ({ position: "absolute", left: x, top: y, width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" });
  const T = { x: tableX, y: tableTop, w: tableW, h: 268 };
  const colL = 168;
  const rx = T.x + colL;
  const rw = T.w - colL;
  const sx = T.x;
  const rowA = 96;
  const rowB = 48;
  const rowC = T.h - rowA - rowB;
  const bigW = vertical ? 196 : rw - (place ? 150 : 0);
  const bigEm = em(big.toUpperCase(), ANTON, 49.4);
  const bigSize = Math.min(118, (bigW - 22) / Math.max(0.5, bigEm));
  const vertW = vertical ? 50 : 0;
  const placeW = rw - bigW - vertW;
  const teamText = teams.length === 2 ? `${teams[0]}  V  ${teams[1]}` : teams[0] ?? name;
  const teamSize = Math.min(26, (rw - 30) / Math.max(4, teamText.length * 0.5));
  const sloganSize = (s: string) => Math.min(44, (colL - 22) / Math.max(2, s.length * 0.47));
  const placeSize = Math.min(19, Math.max(13, (placeW - 18) / Math.max(6, Math.max(...place.split(" ").map((w) => w.length)) * 0.5)));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: paper }}>
      <Paper color={paper} strength={1.6} />
      {/* Print wear on the giant ink: speckles where the paper shows through. */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={PRINT_ID} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={2} seed={(params.seed ?? 3) % 97} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -18 14.2" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" />
        </filter>
      </svg>

      {/* data-bleed: the giant words are fitted inside the sheet by textLength, but a text Range reports their
          natural (uncompressed) width, so the layout checker would read them as running off the edge. */}
      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <g filter={`url(#${PRINT_ID})`}>
          {lines.map((l, i) => {
            const reserve = i === 0 && (lead || inner) ? tagW : 0;
            const x = X0 + (lead && i === 0 ? reserve : 0) + (W - reserve - lineW[i]) / 2;
            return (
              <text key={i} x={x} y={baselines[i]} textLength={lineW[i]} lengthAdjust="spacingAndGlyphs" fill={ink} style={{ fontFamily: g.f.font, fontSize, letterSpacing: 0 }}>
                {l}
              </text>
            );
          })}
        </g>
      </svg>
      {/* Small words tucked in the notch beside line 1, set on their side. */}
      {(lead || inner) && (
        <div
          style={{
            position: "absolute",
            left: lead ? X0 : X0 + W - tagW,
            top: top0,
            width: tagW,
            height: cap,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: lead ? "rotate(180deg)" : undefined,
              fontFamily: CONDENSED,
              fontWeight: 800,
              fontSize: Math.min(64, (cap * 0.9) / Math.max(2, (lead || inner).length * 0.5)),
              letterSpacing: "0.06em",
              lineHeight: 1,
              color: dark,
              whiteSpace: "nowrap",
            }}
          >
            {lead || inner}
          </div>
        </div>
      )}

      {/* Floor shadow, then the player in front of the letters. */}
      {data.photoUrl && feet && (
        <div
          style={{
            position: "absolute",
            left: box.left + box.width * ((fxFrac + 0.5) / 2 - 0.34),
            top: box.top + box.height - 26,
            width: box.width * 0.68,
            height: 44,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(20,16,12,.55), rgba(20,16,12,.18) 60%, transparent)",
            filter: "blur(6px)",
          }}
        />
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.05) saturate(1.04) drop-shadow(14px 18px 22px rgba(40,20,10,.28))",
            ...cutMask(data.cut),
          }}
        />
      )}

      {/* ---- Ticket table ---- */}
      <div style={{ ...line, left: T.x, top: T.y, width: T.w, height: 3 }} />
      <div style={{ ...line, left: T.x, top: T.y + T.h - 3, width: T.w, height: 3 }} />
      <div style={{ ...line, left: T.x + colL, top: T.y, width: 2, height: T.h }} />
      <div style={{ ...line, left: rx, top: T.y + rowA, width: rw, height: 2 }} />
      {/* Slogan, stacked condensed caps, with the player's name under a rule. */}
      <div style={{ position: "absolute", left: sx, top: T.y + 16, width: colL, bottom: CANVAS_H - (T.y + T.h) + 14, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 2, paddingRight: 14 }}>
        <div>
          {slogan.map((s, i) => (
            <div key={i} style={{ fontFamily: CONDENSED, fontWeight: 900, fontSize: sloganSize(s), lineHeight: 0.92, color: i === slogan.length - 1 ? ink : dark, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
              {s}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `2px solid ${dark}`, paddingTop: 8, width: "100%" }}>
          {data.player.number && <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 17, letterSpacing: "0.16em", color: ink }}>NO. {data.player.number}</div>}
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: Math.min(22, (colL - 20) / Math.max(6, name.length * 0.46)), lineHeight: 1.05, letterSpacing: "0.04em", color: dark }}>{name}</div>
        </div>
      </div>
      {/* Crests side by side. */}
      <div style={cell(rx, T.y + 3, rw, rowA - 3)}>
        {crests.length ? (
          crests.map((c, i) => (
            <div key={i} style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: i ? `2px solid ${dark}` : undefined }}>
              <img src={c} alt="" style={{ height: rowA - 26, width: rw / crests.length - 30, objectFit: "contain" }} />
            </div>
          ))
        ) : (
          <AgencyLogo data={data} height={40} onLight />
        )}
      </div>
      {/* Teams bar. */}
      <div style={{ ...cell(rx, T.y + rowA + 2, rw, rowB), background: ink, color: paper, fontFamily: CONDENSED, fontWeight: 800, fontSize: teamSize, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{teamText}</div>
      {/* Kick-off (or score), date on its side, ground. */}
      <div style={{ ...line, left: rx, top: T.y + rowA + rowB, width: rw, height: 2 }} />
      <div style={cell(rx, T.y + rowA + rowB + 2, bigW, rowC - 5)}>
        <div style={{ fontFamily: DISPLAY, fontSize: bigSize, lineHeight: 1, color: dark, whiteSpace: "nowrap", paddingTop: 6 }}>{big.toUpperCase()}</div>
      </div>
      {vertical && (
        <>
          <div style={{ ...line, left: rx + bigW, top: T.y + rowA + rowB, width: 2, height: rowC }} />
          <div style={cell(rx + bigW + 2, T.y + rowA + rowB + 2, vertW - 2, rowC - 5)}>
            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: CONDENSED, fontWeight: 800, fontSize: Math.min(22, (rowC - 20) / Math.max(4, vertical.length * 0.5)), letterSpacing: "0.12em", color: ink, whiteSpace: "nowrap" }}>{vertical}</div>
          </div>
        </>
      )}
      {place && placeW > 60 && (
        <>
          <div style={{ ...line, left: rx + bigW + vertW, top: T.y + rowA + rowB, width: 2, height: rowC }} />
          <div style={{ ...cell(rx + bigW + vertW + 2, T.y + rowA + rowB + 2, placeW - 2, rowC - 5), justifyContent: "flex-start", padding: "0 12px" }}>
            <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: placeSize, lineHeight: 1.08, letterSpacing: "0.08em", color: dark }}>{place}</div>
          </div>
        </>
      )}

      {/* Club × agency, under the table. */}
      <div style={{ position: "absolute", left: T.x, width: T.w, top: T.y + T.h + 16, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ height: 34, width: 34, objectFit: "contain" }} />}
        {data.club?.crestUrl && hasAgency && <span style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: 20, color: dark }}>×</span>}
        <AgencyLogo data={data} height={22} onLight style={{ color: dark }} />
      </div>
    </div>
  );
}
