/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { coachRole } from "./coachhero";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { mix } from "./heroghost";
import { AgencyLogo, CONDENSED, MONO } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#1b1d22";
const SOFT = "rgba(27,29,34,.52)";
const RULE = "rgba(27,29,34,.16)";
/** JetBrains Mono advance per em. */
const MONO_EM = 0.6;

/** Portuguese month abbreviations as English ones ("20 SET" → "20 SEP"). */
const EN_MON: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function dayMonth(d?: string): string {
  const m = (d ?? "").toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  return m ? `${m[1]} ${EN_MON[m[2]] ?? m[2]}` : "";
}

/** Barlow Condensed caps, in ems (goalhero's measured table; accents ignored). */
const condEm = (t: string) => wordEm(FACES.barlow, t.toUpperCase().replace(/[^A-Z\-!' ]/g, "A"));

/**
 * Coach · clipboard (matchday) — his studio bust big on a light ground on one side; on the other, a clean white
 * team sheet turned ~2°, held by a small club-colour clip at the top and lifted off the ground by a soft contact
 * shadow. The sheet is typeset like a team sheet: "MATCHDAY" title, "HEAD COACH" and his name, the fixture
 * (crests, exact names, home first), then date, kick-off, venue and competition · round in mono rows over thin
 * rules. The NEYOD mark small on the ground above the sheet.
 */
export function Coachclipboard({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.24 : 1;
  const f = matchFacts(data);
  const coachLeft = params.side === "left"; // the coach on the left → the sheet on the right

  // A deep club colour stays as it is (navy stays navy); a mid one is brightened, a light one darkened.
  const raw = params.primary === "#10131c" ? params.accent : params.primary;
  let club = luminance(raw) < 0.1 && luminance(raw) > 0.02 ? raw : vivid(raw);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ground = mix(club, "#eeeeec", 0.05);
  const groundLow = mix(club, "#e2e3e4", 0.1);

  /* ---- the sheet ---- */
  const SW = story ? 590 : 540;
  const SX = coachLeft ? CANVAS_W - SW - (story ? 60 : 64) : story ? 60 : 64;
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const logoH = story ? 88 : 52;
  const ST = logoTop + logoH + (story ? 84 : 58);
  const SB = story ? STORY_BOTTOM : H - 64;
  const SH = SB - ST;
  const rot = coachLeft ? 2 : -2;
  const PX = Math.round(42 * k);
  const inner = SW - 2 * PX;

  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'").trim();
  const titleSize = Math.min(130 * k * ts, (inner * 0.97) / Math.max(0.5, condEm(word)));
  const role = coachRole(data).toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min(44 * k * ts, (inner * 0.97) / Math.max(1, condEm(name)));
  const homeName = (content.homeTeam || (content.home === false ? f.opp : data.club?.name) || "").toUpperCase();
  const awayName = (content.awayTeam || (content.home === false ? data.club?.name : f.opp) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (content.home === false ? f.oppCrest : f.ourCrest);
  const awayCrest = content.awayCrest ?? (content.home === false ? f.ourCrest : f.oppCrest);
  const crest = Math.round(66 * k);
  const teamW = inner - crest - 18 * k;
  const teamSize = Math.min(50 * k * ts, ...[homeName, awayName].filter(Boolean).map((t) => (teamW * 0.97) / Math.max(1, condEm(t))));

  const time = f.timeLocal || f.time;
  const pt = f.timePt && f.timePt !== time ? `${time}  (${f.timePt} ${f.timeRef || "PT"})` : time;
  const comp = [f.comp, f.round].filter(Boolean).join(" · ");
  const rows = [
    ["DATE", dayMonth(content.date)],
    ["KICK-OFF", pt],
    ["VENUE", f.venue],
    ["COMP.", comp],
  ].filter(([, v]) => v) as [string, string][];
  const labelW = Math.round(124 * k);
  const valueW = inner - labelW;
  const monoMax = 19 * k * ts;
  // Values wrap to two lines at most: each is sized so its longest half still fits.
  const rowSize = (v: string) => {
    const one = valueW / Math.max(1, v.length * (MONO_EM + 0.04));
    if (one >= monoMax * 0.82) return Math.min(monoMax, one);
    const words = v.split(" ");
    let best = v.length;
    for (let i = 1; i < words.length; i++) best = Math.min(best, Math.max(words.slice(0, i).join(" ").length, words.slice(i).join(" ").length));
    return Math.min(monoMax, valueW / Math.max(1, best * (MONO_EM + 0.04)));
  };
  const labelSize = 13.5 * k * ts;

  /* ---- the coach: big on his side, fading into the ground ---- */
  const fbox = data.face ?? [0.38, 0.06, 0.26, 0.2];
  const aspect = data.photoAspect ?? 0.6;
  const faceTop0 = story ? STORY_TOP + 150 : 150;
  let h = (H - faceTop0) / Math.max(0.3, 1 - fbox[1]) + h0(story);
  const maxFace = Math.min(story ? 360 : 300, data.facePx > 0 ? Math.max(96, data.facePx * 1.25) : Infinity);
  if (h * fbox[3] > maxFace) h = maxFace / fbox[3];
  h *= params.playerScale ?? 1;
  // A short bust is lowered (a little) so it still runs into the canvas foot instead of ending mid-air.
  const faceTop = Math.min(faceTop0 + (story ? 220 : 160), Math.max(faceTop0, H + h0(story) - h * (1 - fbox[1]))) + (params.playerY ?? 0);
  const w = h * aspect;
  const faceW = w * fbox[2];
  // His face centred in the room beside the sheet, kept clear of it.
  const room = coachLeft ? [0, SX] : [SX + SW, CANVAS_W];
  let faceCx = (room[0] + room[1]) / 2 + (coachLeft ? 10 : -10) + (params.playerX ?? 0);
  const clear = 40;
  if (!coachLeft && faceCx - faceW / 2 < SX + SW + clear) faceCx = SX + SW + clear + faceW / 2;
  if (coachLeft && faceCx + faceW / 2 > SX - clear) faceCx = SX - clear - faceW / 2;
  const left = faceCx - w * (fbox[0] + fbox[2] / 2);
  const imgTop = faceTop - h * fbox[1];
  const imgBottom = imgTop + h;
  const cutBottom = (data.cut?.bottom ?? 0) > 0;
  const fadeEnd = Math.min(H, cutBottom ? imgBottom - 6 : H);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 280)}px, transparent ${fadeEnd}px)`;

  const mono = (fs: number, extra: CSSProperties = {}): CSSProperties => ({ fontFamily: MONO, fontWeight: 500, fontSize: fs, lineHeight: 1.3, color: INK, ...extra });
  const cond = (fs: number, extra: CSSProperties = {}): CSSProperties => ({ fontFamily: CONDENSED, fontWeight: 700, fontSize: fs, lineHeight: 1, color: INK, whiteSpace: "nowrap", textTransform: "uppercase", ...extra });
  const rule = (extra: CSSProperties = {}) => <div style={{ height: 1, background: RULE, ...extra }} />;
  const crestImg = (url: string | null | undefined) =>
    url ? <img src={url} alt="" style={{ width: crest, height: crest, objectFit: "contain", flexShrink: 0 }} /> : <div style={{ width: crest, height: crest, flexShrink: 0 }} />;
  const team = (url: string | null | undefined, t: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * k, height: crest }}>
      {crestImg(url)}
      <div style={cond(teamSize, { letterSpacing: "0.01em" })}>{t}</div>
    </div>
  );
  const clipW = Math.round(150 * k);
  const clipH = Math.round(44 * k);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: `linear-gradient(to bottom, ${ground}, ${groundLow})` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(${CANVAS_W * 0.45}px ${H * 0.4}px at ${faceCx}px ${faceTop + 260 * k}px, rgba(255,255,255,.8), transparent 80%)`,
        }}
      />

      {/* The coach. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left, top: imgTop, width: w, height: h, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The sheet's contact shadow (its own blurred shape), then the sheet. */}
      <div
        style={{
          position: "absolute",
          left: SX + 10,
          top: ST + 22,
          width: SW - 12,
          height: SH - 10,
          background: "rgba(22,26,36,.26)",
          filter: `blur(${Math.round(22 * k)}px)`,
          transform: `rotate(${rot}deg)`,
        }}
      />
      <div style={{ position: "absolute", left: SX, top: ST, width: SW, height: SH, transform: `rotate(${rot}deg)`, background: "#ffffff" }}>
        <div style={{ position: "absolute", left: PX, right: PX, top: Math.round(70 * k), bottom: Math.round(40 * k), display: "flex", flexDirection: "column" }}>
          {/* Title. */}
          <div style={mono(labelSize, { color: SOFT, letterSpacing: "0.2em", lineHeight: 1 })}>TEAM SHEET</div>
          <div style={cond(titleSize, { fontWeight: 800, color: club, marginTop: 14 * k, letterSpacing: "0.005em" })}>{word}</div>
          <div style={{ height: 3 * k, background: club, marginTop: 16 * k }} />

          {/* Head coach. */}
          <div style={{ marginTop: 26 * k }}>
            <div style={mono(labelSize, { color: club, fontWeight: 700, letterSpacing: "0.2em", lineHeight: 1 })}>{role}</div>
            <div style={cond(nameSize, { marginTop: 12 * k, letterSpacing: "0.02em" })}>{name}</div>
          </div>
          {rule({ marginTop: 26 * k })}

          {/* The fixture, home first. */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 * k }}>
            {team(homeCrest, homeName)}
            <div style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
              <div style={{ width: crest, display: "flex", justifyContent: "center" }}>
                <div style={mono(18 * k * ts, { color: club, fontWeight: 700, lineHeight: 1 })}>v</div>
              </div>
              <div style={{ flex: 1, height: 1, background: RULE }} />
            </div>
            {team(awayCrest, awayName)}
          </div>

          {/* The facts, in ruled rows. */}
          {rows.map(([label, value]) => (
            <div key={label}>
              {rule()}
              <div style={{ display: "flex", alignItems: "baseline", padding: `${18 * k}px 0` }}>
                <div style={mono(labelSize, { width: labelW, flexShrink: 0, color: SOFT, letterSpacing: "0.12em" })}>{label}</div>
                <div style={mono(rowSize(value), { flex: 1, fontWeight: 700, letterSpacing: "0.04em" })}>{value}</div>
              </div>
            </div>
          ))}
          {rule()}
        </div>
      </div>

      {/* The clip, centred on the sheet's top edge (turned with it). */}
      <div style={{ position: "absolute", left: SX, top: ST, width: SW, height: SH, transform: `rotate(${rot}deg)`, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: (SW - clipW) / 2,
            top: -clipH * 0.42,
            width: clipW,
            height: clipH,
            borderRadius: 10 * k,
            background: `linear-gradient(to bottom, ${shade(club, 0.12)}, ${club})`,
            boxShadow: "0 4px 8px rgba(20,24,34,.22)",
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: clipH * 0.32, width: clipW * 0.42, height: Math.max(6, clipH * 0.2), transform: "translateX(-50%)", borderRadius: 99, background: "rgba(255,255,255,.28)" }} />
        </div>
      </div>

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{
          position: "absolute",
          left: coachLeft ? undefined : SX,
          right: coachLeft ? CANVAS_W - SX - SW : undefined,
          top: logoTop,
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: coachLeft ? "right top" : "left top",
        }}
      />
    </div>
  );
}

/** A little extra length so a bust's cut edge falls under the canvas. */
function h0(story: boolean) {
  return story ? 60 : 40;
}
