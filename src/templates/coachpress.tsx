/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { coachRole } from "./coachhero";
import { cutMask } from "./fx";
import { heroClub, heroName } from "./goalherosplit";
import { matchWord } from "./heroghost";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WALL = "#eef0f2";
const INK = "#16181d";

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Coach · press room — the pre-match interview frame: a light step-and-repeat wall behind him (a faint, evenly
 * staggered grid of small club crests alternating with small NEYOD marks, ~12% so it reads as a sponsor wall,
 * not a pattern), his studio bust in front with a soft shadow on the wall, and a clean broadcast lower-third at
 * chest height: a small "MATCHDAY" tag, his name in bold, "HEAD COACH · <club>" in small caps, and under the
 * bar a slim dark strip with the fixture (HOME v AWAY · date · kick-off). The NEYOD logo sits small top-left.
 */
export function Coachpress({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.32 : 1;
  const club = heroClub(data);
  const f = matchFacts(data);

  /* ---- the wall: a staggered grid, crest / NEYOD alternating ---- */
  const crestUrl = f.ourCrest ?? data.club?.crestUrl ?? null;
  const markUrl = data.agency.logoDarkUrl ?? data.agency.logoUrl;
  const cellW = story ? 196 : 170;
  const cellH = story ? 150 : 128;
  const cols = Math.ceil(CANVAS_W / cellW) + 2;
  const rows = Math.ceil(H / cellH) + 1;
  const tiles: { x: number; y: number; crest: boolean }[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = -1; c < cols; c++) {
      const x = c * cellW + (r % 2 ? cellW / 2 : 0) + cellW / 2 - 20;
      const y = r * cellH + cellH / 2 - 30;
      tiles.push({ x, y, crest: (c + r) % 2 === 0 });
    }

  /* ---- the bust: big, centred, face high ---- */
  const faceH0 = story ? 420 : 330;
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const faceTop = story ? 470 : 250;
  const box = placeByFace(data, faceX, faceTop, { chest: faceH0, waist: faceH0, knees: faceH0 * 0.8, full: faceH0 * 0.6, standing: faceH0, bust: faceH0 });
  const faceY = faceTop + (params.playerY ?? 0);

  /* ---- the lower third: under his chin (≥ 0.6 face clear), bottom-anchored where there is room ---- */
  const name = heroName(data);
  const role = [coachRole(data), data.club?.name].filter(Boolean).join("  ·  ").toUpperCase();
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const fixture = [[homeName, awayName].filter(Boolean).join(" v "), dayMonth(content.date), time, pt].filter(Boolean).join("  ·  ");

  const L = 56;
  const barW = CANVAS_W - 2 * L;
  const padX = 40 * k;
  const crest = Math.round(58 * k);
  const crestsW = homeCrest || awayCrest ? 2 * crest + 18 * k + padX : 0;
  const textW = barW - padX - 12 - crestsW - padX * 0.5;
  const nameSize = Math.min(66 * k * ts, textW / Math.max(1, name.length * 0.5));
  const roleSize = Math.min(17 * k * ts, textW / Math.max(1, role.length * 0.82));
  const tagSize = 15 * k * ts;
  const tagH = Math.round(tagSize * 2.1);
  const barH = Math.round(30 * k + nameSize * 0.95 + 16 * k + roleSize + 30 * k);
  const fixSize = Math.min(16 * k * ts, (barW - 2 * padX) / Math.max(1, fixture.length * 0.78));
  const stripH = Math.round(fixSize * 3.1);
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 70;
  const barTop = Math.max(faceY + box.faceH * 1.75 + tagH, bottom - stripH - barH) + (params.textY ?? 0);
  const stripTop = barTop + barH;
  const fadeEnd = Math.min(H, stripTop + stripH + (story ? 260 : 160));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${stripTop}px, transparent ${fadeEnd}px)`;

  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  // The wall stays clear around the agency logo (a sponsor mark half under it would read as a mistake).
  const logoH = (story ? 88 : 52) * (params.logoScale ?? 1);
  const clearR = L + logoH * 3.3 + 60;
  const clearB = logoTop + logoH + 50;
  const wall = tiles.filter((t) => !(t.x - 60 * k < clearR && t.y + 30 - 30 * k < clearB));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: WALL }}>
      {/* The step-and-repeat wall. */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, filter: "grayscale(0.35)" }}>
        {wall.map((t, i) =>
          t.crest ? (
            crestUrl ? <img key={i} src={crestUrl} alt="" style={{ position: "absolute", left: t.x - 26 * k, top: t.y - 26 * k + 30, width: 52 * k, height: 52 * k, objectFit: "contain" }} /> : null
          ) : markUrl ? (
            <img key={i} src={markUrl} alt="" style={{ position: "absolute", left: t.x - 55 * k, top: t.y - 15 * k + 30, height: 30 * k, width: 110 * k, objectFit: "contain" }} />
          ) : null,
        )}
      </div>
      {/* Studio light on the wall behind him, falling off to the edges. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${faceX}px ${faceY + box.faceH}px, rgba(255,255,255,.75), rgba(255,255,255,0) 70%), linear-gradient(to bottom, rgba(255,255,255,.25), rgba(0,0,0,.05))` }} />

      {/* Him, in front of the wall. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "drop-shadow(18px 12px 24px rgba(20,24,32,.16))", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* The lower third. */}
      <div style={{ position: "absolute", left: L, top: barTop - tagH, height: tagH, padding: `0 ${18 * k}px`, display: "flex", alignItems: "center", background: club, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: tagSize, letterSpacing: "0.24em", whiteSpace: "nowrap" }}>
        {matchWord(data)}
      </div>
      <div style={{ position: "absolute", left: L, top: barTop, width: barW, height: barH, background: "rgba(255,255,255,.97)", boxShadow: "0 18px 40px -18px rgba(10,14,22,.35)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: club }} />
        <div style={{ position: "absolute", left: padX + 12, top: 30 * k, fontFamily: CONDENSED, fontWeight: 800, fontSize: nameSize, lineHeight: 0.95, letterSpacing: "0.01em", color: INK, whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ position: "absolute", left: padX + 12, top: 30 * k + nameSize * 0.95 + 16 * k, fontFamily: SANS, fontWeight: 700, fontSize: roleSize, lineHeight: 1, letterSpacing: "0.2em", color: club, whiteSpace: "nowrap" }}>{role}</div>
        {crestsW > 0 && (
          <div style={{ position: "absolute", right: padX, top: 0, bottom: 0, display: "flex", alignItems: "center", gap: 18 * k }}>
            {[homeCrest, awayCrest].map((u, i) => (u ? <img key={i} src={u} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} /> : <div key={i} style={{ width: crest }} />))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: L, top: stripTop, width: barW, height: stripH, background: INK, display: "flex", alignItems: "center", paddingLeft: padX + 12, fontFamily: SANS, fontWeight: 600, fontSize: fixSize, letterSpacing: "0.16em", color: "rgba(255,255,255,.88)", whiteSpace: "nowrap" }}>
        {fixture}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: L, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" }}
      />
    </div>
  );
}
