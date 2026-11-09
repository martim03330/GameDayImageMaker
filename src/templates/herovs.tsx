/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/**
 * Hero VS — the hero family's matchday versus: the off-white ground, the NEYOD logo and the player's spaced
 * name small at the top, then an enormous club-colour "VS" (exactly 40% of the canvas wide) with the home
 * club above-left and the away club below-right of it in spaced caps (exact names, crests beside them),
 * the big cutout right under it fading into the ground, and date · kick-off · ground quiet at the foot.
 */
export function Herovs({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const f = matchFacts(data);
  const k = story ? 1.36 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ink = "#1b1d22";
  const ground = "#f3f3f1";
  const M = 80;
  const face = FACES.barlow;

  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);

  /* ---- the top: logo, name ---- */
  const logoTop = (story ? STORY_TOP - 40 : 52) + (params.logoY ?? 0) * -1;
  const nameSize = Math.min((story ? 30 : 24) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);

  /* ---- the versus block: home line, VS, away line ---- */
  const crest = Math.round(44 * k);
  const cgap = Math.round(16 * k);
  const teamSp = 0.2;
  // Bold caps of the UI sans run ~0.72em plus the tracking; shrink to fit, never cut.
  const teamFit = (s: string) => (CANVAS_W - 2 * M - crest - cgap) / Math.max(1, s.length * (0.74 + teamSp));
  const teamSize = Math.min(28 * k * ts, teamFit(homeName), teamFit(awayName));
  const rowH = Math.max(crest, teamSize);
  const homeTop = nameTop + nameSize + (story ? 52 : 34) + (params.textY ?? 0);
  const vsW = CANVAS_W * 0.4 * ts;
  const size = vsW / wordEm(face, "VS");
  const capTop = homeTop + rowH + (story ? 26 : 18);
  const baseline = capTop + size * face.cap;
  const awayTop = baseline + (story ? 26 : 18);
  const blockBottom = awayTop + rowH;

  /* ---- the foot: date · kick-off · ground ---- */
  const footBottom = story ? STORY_BOTTOM : CANVAS_H - 54;
  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${f.timePt} ${f.timeRef || "PT"}` : "";
  const line = [dayMonth(content.date), time, pt, f.venue].filter(Boolean).join("  ·  ");
  const lineSize = Math.min(16.5 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, line.length * 0.92));
  const lineTop = footBottom - lineSize;

  /* ---- the player: his top just under the versus block, his head clear of the foot ---- */
  const base = story ? { chest: 430, waist: 370, knees: 270, full: 200 } : { chest: 310, waist: 270, knees: 196, full: 150 };
  const faceX = 600 + (params.side === "left" ? -80 : params.side === "right" ? 40 : 0);
  const gap = story ? 22 : 14;
  let box = placeByFace(data, faceX, blockBottom + 200, base);
  let faceTop = blockBottom + 200;
  for (let shrink = 1; shrink > 0.5; shrink -= 0.08) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    faceTop = blockBottom + 200;
    // (placeByFace adds the manual playerY nudge; leave it out here so the nudge still moves him.)
    for (let i = 0; i < 2; i++) faceTop += blockBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    if (faceTop + (params.playerY ?? 0) + box.faceH * 1.6 < lineTop - 40) break;
  }
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const fadeFrom = Math.max(faceTop + box.faceH * 1.6, lineTop - (story ? 300 : 220));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.18) ${lineTop - 50}px, transparent ${lineTop - 8}px)`;

  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : null;
  const team = (txt: string, url: string | null | undefined, top: number, right: boolean) => (
    <div style={{ position: "absolute", left: M, right: M, top, height: rowH, display: "flex", alignItems: "center", justifyContent: right ? "flex-end" : "flex-start", gap: cgap }}>
      {!right && crestImg(url)}
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: teamSize, lineHeight: 1, letterSpacing: `${teamSp}em`, marginRight: right ? `-${teamSp}em` : 0, color: ink, whiteSpace: "nowrap" }}>{txt}</div>
      {right && crestImg(url)}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 55%, #ffffff, transparent 75%)" }} />

      {/* VS, exactly 40% of the canvas wide. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + size * face.cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: "italic", fontSize: size, fill: club, letterSpacing: `${face.tracking ?? 0}em` }}
        >
          VS
        </text>
      </svg>

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: lineTop - (story ? 200 : 140), bottom: 0, background: `linear-gradient(to bottom, ${ground}00, ${ground}f2 70%, ${ground})` }} />

      {homeName && team(homeName, homeCrest, homeTop, false)}
      {awayName && team(awayName, awayCrest, awayTop, true)}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
      )}
      {line && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lineTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lineSize, lineHeight: 1, letterSpacing: "0.3em", paddingLeft: "0.3em", color: "rgba(27,29,34,.62)", whiteSpace: "nowrap" }}>{line}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
