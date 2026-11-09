/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { mix } from "./heroghost";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#f3f3f1";
const INK = "#1b1d22";
const SOFT = "rgba(27,29,34,.58)";

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/** Inter (bold caps), roughly, in ems. */
const capsEm = (t: string, sp = 0) =>
  [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + sp + (c === " " ? 0.28 : /[MW]/.test(c) ? 0.92 : /[IJ1.'·]/.test(c) ? 0.34 : /[0-9]/.test(c) ? 0.64 : 0.72), 0);

/** "MATCHDAY" → ["MATCH", "DAY"]; other kickers by words, at most two lines. */
function titleLines(kicker: string): string[] {
  const k = kicker.replace(/’/g, "'").trim().toUpperCase();
  const m = /^(MATCH|GAME)\s*DAY$/.exec(k);
  if (m) return [m[1], "DAY"];
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [k];
  // Split where the two lines come out most even.
  let best = [k];
  let score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const s = Math.max(a.length, b.length);
    if (s < score) [best, score] = [[a, b], s];
  }
  return best;
}

/**
 * Coach · touchline (matchday) — a card in two: a light column (~42%) closed by a club-colour hairline holds
 * "HEAD COACH", his name, "MATCH / DAY" big in the club colour and the fixture stacked in a clean grid (home
 * crest + name, v, away crest + name, then date · kick-off and the ground), the NEYOD mark at its foot; the
 * other side is his bust, large, turned towards the column, fading into a pale club-tinted ground.
 */
export function Coachtouchline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.32 : 1;
  const f = matchFacts(data);
  const colRight = params.side === "left"; // the coach on the left → the column on the right

  // A deep club colour stays as it is (navy stays navy); a mid one is brightened, a light one darkened.
  const raw = params.primary === "#10131c" ? params.accent : params.primary;
  let club = luminance(raw) < 0.1 && luminance(raw) > 0.02 ? raw : vivid(raw);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const panel = mix(club, "#e9eaec", 0.1);
  const panelLow = mix(club, "#dcdee2", 0.16);

  /* ---- the column ---- */
  const COL_W = story ? 500 : 454;
  const PAD = story ? 58 : 56;
  const inner = COL_W - PAD * 2;
  const colLeft = colRight ? CANVAS_W - COL_W : 0;
  const x0 = colLeft + PAD;
  const top = story ? STORY_TOP : 70;
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 60;

  const label = (data.player?.position || "Head Coach").toUpperCase();
  const labelSize = Math.min(15 * S * ts, inner / Math.max(1, capsEm(label, 0.32)));
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || "").toUpperCase();
  const nameLines = [first, last].filter(Boolean);
  const nameSize = Math.min(40 * S * ts, ...nameLines.map((l) => inner / Math.max(1, capsEm(l, 0.01))));
  const face = FACES.anton;
  const lines = titleLines(content.kicker || "MATCHDAY");
  const titleSize = Math.min((inner * ts) / Math.max(0.5, ...lines.map((l) => wordEm(face, l))), (150 * S * ts) / face.cap);
  const titleLead = titleSize * face.cap + 16 * S;

  const topH = labelSize + 22 * S + nameLines.length * nameSize * 1.08 + 40 * S + 3;
  const titleH = titleLead * lines.length - 16 * S;

  /* ---- the fixture, bottom-up above the mark ---- */
  const logoH = story ? 88 : 52;
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(46 * S);
  const gutter = Math.round(18 * S);
  const nameW = inner - crest - gutter;
  const teamSize = Math.min(21 * S * ts, ...[homeName, awayName].filter(Boolean).map((n) => nameW / Math.max(1, capsEm(n, 0.04))));
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const when = [dayMonth(content.date), time, pt].filter(Boolean).join("  ·  ");
  const venue = f.venue;
  const factSize = (t: string) => Math.min(16 * S * ts, inner / Math.max(1, capsEm(t, 0.14)));
  const comp = [f.comp, f.round].filter(Boolean).join(" · ");
  const compSize = Math.min(12.5 * S * ts, inner / Math.max(1, capsEm(comp, 0.16)));
  const footH =
    (comp ? compSize + 26 * S : 0) + crest * 2 + 34 * S + 30 * S + (when ? factSize(when) * 1.5 : 0) + (venue ? factSize(venue) * 1.5 : 0) + (story ? 64 : 50) + logoH;
  // The title sits in the middle of the room left between the name and the fixture.
  const roomTop = top + topH;
  const roomBottom = bottom - footH;
  const titleTop = Math.max(roomTop + 40 * S, roomTop + (roomBottom - roomTop - titleH) * 0.42) + (params.textY ?? 0);

  /* ---- the coach: big, turned towards the column, fading at the foot ---- */
  const panelLeft = colRight ? 0 : COL_W;
  const panelW = CANVAS_W - COL_W;
  const fbox = data.face ?? [0.38, 0.06, 0.26, 0.2];
  const aspect = data.photoAspect ?? 0.6;
  const fc = fbox[0] + fbox[2] / 2;
  // His face right of his body's middle: he is turned to the left (and the other way round).
  const turned = fc > 0.52 ? "left" : fc < 0.48 ? "right" : "front";
  const flip = (turned === "left" && colRight) || (turned === "right" && !colRight);
  const fcx = flip ? 1 - fc : fc;
  const faceTopWant = (story ? 360 : 168) + (params.playerY ?? 0);
  let h = (H - (story ? 40 : 20) - faceTopWant) / Math.max(0.2, 1 - fbox[1]);
  const maxFace = data.facePx > 0 ? data.facePx * (story ? 1.35 : 1.25) : Infinity;
  h = Math.min(h, maxFace / fbox[3]) * (params.playerScale ?? 1);
  const w = h * aspect;
  // His body centred in the panel, nudged towards the column.
  const nudge = (colRight ? 1 : -1) * panelW * 0.04;
  let left = panelLeft + (panelW - w) / 2 + nudge + (params.playerX ?? 0);
  const faceCx = left + w * fcx;
  // Keep his face well inside the panel.
  const minFace = panelLeft + panelW * 0.3;
  const maxFaceX = panelLeft + panelW * 0.7;
  if (faceCx < minFace) left += minFace - faceCx;
  if (faceCx > maxFaceX) left -= faceCx - maxFaceX;
  const imgTop = faceTopWant - h * fbox[1];
  const imgBottom = imgTop + h;
  const fadeEnd = Math.min(H, imgBottom - 10);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300)}px, transparent ${fadeEnd}px)`;
  const headCx = left + w * fcx;
  const headCy = faceTopWant + fbox[3] * h * 0.5;

  const text = (fs: number, extra: CSSProperties = {}): CSSProperties => ({ fontFamily: SANS, fontSize: fs, lineHeight: 1, whiteSpace: "nowrap", color: INK, ...extra });
  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, height: crest, flexShrink: 0 }} />;
  const teamRow = (url: string | null | undefined, n: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: gutter, height: crest }}>
      {crestImg(url)}
      <div style={text(teamSize, { fontWeight: 700, letterSpacing: "0.04em" })}>{n}</div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER }}>
      {/* The coach's side. */}
      <div style={{ position: "absolute", left: panelLeft, top: 0, width: panelW, height: H, overflow: "hidden", background: `linear-gradient(to bottom, ${panel}, ${panelLow})` }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${panelW * 0.7}px ${H * 0.36}px at ${headCx - panelLeft}px ${headCy + 120 * S}px, rgba(255,255,255,.75), transparent 80%)` }} />
        {data.photoUrl && (
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
            <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 20px 36px rgba(20,24,34,.22))" }}>
              <img
                src={data.photoUrl}
                alt=""
                style={{ position: "absolute", left: left - panelLeft, top: imgTop, width: w, height: h, maxWidth: "none", transform: flip ? "scaleX(-1)" : undefined, ...cutMask(data.cut) }}
              />
            </div>
          </div>
        )}
      </div>

      {/* The column, closed by a club-colour hairline. */}
      <div style={{ position: "absolute", left: colLeft, top: 0, width: COL_W, height: H, background: PAPER }} />
      <div style={{ position: "absolute", left: colRight ? colLeft : colLeft + COL_W - 3, top: 0, width: 3, height: H, background: club }} />

      {/* Top: label, name, title. */}
      <div style={{ position: "absolute", left: x0, top, width: inner }}>
        <div style={text(labelSize, { fontWeight: 700, letterSpacing: "0.32em", color: club })}>{label}</div>
        <div style={{ marginTop: 22 * S }}>
          {nameLines.map((l, i) => (
            <div key={i} style={text(nameSize, { fontWeight: 800, letterSpacing: "0.01em", lineHeight: 1.08 })}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 * S, width: 54 * S, height: 3, background: club }} />
      </div>
      <div style={{ position: "absolute", left: x0, top: titleTop, width: inner }}>
        <svg width={inner} height={titleLead * lines.length} style={{ display: "block", overflow: "visible" }}>
          {lines.map((l, i) => (
            <text key={i} x={-titleSize * 0.012} y={titleSize * face.cap + i * titleLead} style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: titleSize, fill: club }}>
              {l}
            </text>
          ))}
        </svg>
      </div>

      {/* Foot: competition, fixture grid, date and ground, the mark. */}
      <div style={{ position: "absolute", left: x0, bottom: H - bottom, width: inner, display: "flex", flexDirection: "column" }}>
        {comp && <div style={text(compSize, { fontWeight: 600, letterSpacing: "0.16em", color: SOFT, marginBottom: 26 * S })}>{comp}</div>}
        {teamRow(homeCrest, homeName)}
        <div style={{ display: "flex", alignItems: "center", gap: gutter, height: 34 * S }}>
          <div style={{ width: crest, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 1.5, height: 22 * S, background: "rgba(27,29,34,.18)" }} />
          </div>
          <div style={text(17 * S * ts, { fontWeight: 500, color: club })}>v</div>
        </div>
        {teamRow(awayCrest, awayName)}
        <div style={{ height: 30 * S }} />
        {when && <div style={text(factSize(when), { fontWeight: 600, letterSpacing: "0.14em", lineHeight: 1.5 })}>{when}</div>}
        {venue && <div style={text(factSize(venue), { fontWeight: 500, letterSpacing: "0.14em", color: SOFT, lineHeight: 1.5 })}>{venue}</div>}
        <div style={{ height: (story ? 64 : 50) }} />
        <div style={{ height: logoH, display: "flex", alignItems: "flex-end" }}>
          <AgencyLogo data={data} onLight height={24} style={{ position: "relative", marginBottom: -(params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left bottom" }} />
        </div>
      </div>
    </div>
  );
}
