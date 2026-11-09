/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { place } from "./portraitstripes";
import { AgencyLogo, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { capsStyle, facts, groundOf, stackWords, wrapCaps } from "./usbold1";
import { logoTopOf } from "./trend2";

/*
 * Round 77 · agency portrait matchday story after ONE real reference (Visual ST, Beasain KE v CD Alfaro —
 * Pinterest "player management matchday poster", row 3 col 2):
 *
 *   agencyserifmatch   a deep night ground in the club colour with faint topographic contour lines and a
 *                      club-colour haze rising from the foot behind him (ground only); "MATCH" gigantic in a
 *                      high-contrast didone serif, white with a soft glow, across the top; under it the competition
 *                      and round tiny on the left and "DAY" tiny on the right; one row lower the date and a
 *                      highlighted kick-off tag on the left, both clubs' exact names right-aligned on the right,
 *                      beside his head; him big, chest up, centred, sharp and in colour, a club-colour light glowing
 *                      round his outline (behind him, never on him); both crests stacked in a framed club-colour
 *                      tab on the left; the agency mark at the agreed foot centre. Drawn natively at 1080×1920.
 */

const W = CANVAS_W;
const DIDONE = "var(--font-bodoni), Didot, serif";
/** Bodoni caps advance relative to the size (wide didone caps). */
const didEm = (t: string) => [...t].reduce((a, c) => a + (/[MW]/.test(c) ? 0.98 : /[I1]/.test(c) ? 0.4 : c === " " ? 0.28 : 0.72), 0);

/** Deterministic wobbly closed contours around a few centres: the topographic map behind him. */
function contours(H: number) {
  const centres: [number, number, number][] = [
    [180, 260, 9],
    [930, 620, 8],
    [260, 1280, 7],
    [880, 1600, 6],
  ];
  const paths: string[] = [];
  centres.forEach(([cx, cy, rings], ci) => {
    for (let r = 1; r <= rings; r++) {
      const R = r * 62;
      const pts: string[] = [];
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const wob = 1 + 0.16 * Math.sin(a * 3 + ci * 1.7 + r * 0.35) + 0.08 * Math.sin(a * 5 - ci + r * 0.2);
        pts.push(`${(cx + Math.cos(a) * R * wob * 1.25).toFixed(1)},${((cy + Math.sin(a) * R * wob * 0.9) * (H / CANVAS_H > 1 ? 1 : 0.72)).toFixed(1)}`);
      }
      paths.push(`M${pts.join(" L")} Z`);
    }
  });
  return paths;
}

export function Agencyserifmatch({ data }: { data: RenderData }) {
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const dy = story ? 0 : -150;
  const ts = data.params.textScale ?? 1;
  const logoTop = logoTopOf(data, H);
  const f = facts(data);
  const { club } = groundOf(data);
  const glow = luminance(club) < 0.05 ? shade(club, 0.45) : luminance(club) > 0.6 ? shade(club, -0.2) : club;
  const night = shade(glow, -0.78);
  const mid = shade(glow, -0.45);

  // ---- the word ----
  const words = stackWords(data.content.kicker || "MATCHDAY");
  const big = words[0];
  const tail = words.slice(1).join(" ");
  const bigPx = Math.min(300 * ts, (W - 150) / Math.max(1, didEm(big)));
  const wordTop = (story ? 200 : 60) + 0;
  const underTop = wordTop + bigPx * 0.86 + 18;
  const compW = wrapCaps(f.comp, 520, 19 * ts, 12, 0.18, 2, 0.6);

  // ---- him ----
  const hairTop = Math.max(underTop + 120, (story ? 470 : 360) + dy * 0.2);
  // The reference's portrait is big but not huge: a touch smaller than the shared placement, so the face stays crisp.
  const fig = data.photoUrl ? place({ ...data, params: { ...data.params, playerScale: (data.params.playerScale ?? 1) * 0.82 } }, H, hairTop) : null;
  const figMask = fig?.short ? ({ WebkitMaskImage: "linear-gradient(to top, transparent 0%, #000 22%)", maskImage: "linear-gradient(to top, transparent 0%, #000 22%)" } as CSSProperties) : cutMask({ ...data.cut, bottom: 0 }, 2.2);
  const faceHalf = fig ? fig.faceH * 0.95 : 150;
  const sideW = Math.max(220, W / 2 - faceHalf - 70);

  // ---- the row beside his head ----
  const rowTop = underTop + compW.lines.length * compW.px * 1.3 + 46;
  const datePx = Math.min(26 * ts, sideW / Math.max(1, [...f.date].length * 0.62));
  const ko = [f.time && `${f.time} KICK OFF`, f.second].filter(Boolean).join(" ");
  const koW = wrapCaps(ko, sideW - 20, 21 * ts, 12, 0.08, 2, 0.6);
  const homeW = wrapCaps(f.ours, sideW, 25 * ts, 13, 0.06, 3, 0.6);
  const awayW = wrapCaps(`VS. ${f.opp}`, sideW, 25 * ts, 13, 0.06, 3, 0.6);
  const teamPx = Math.min(homeW.px, awayW.px);
  const home = wrapCaps(f.ours, sideW, teamPx, teamPx, 0.06, 9, 0.6).lines;
  const away = wrapCaps(`VS. ${f.opp}`, sideW, teamPx, teamPx, 0.06, 9, 0.6).lines;

  // ---- the crest tab ----
  const crests = [f.ourCrest, f.oppCrest].filter(Boolean) as string[];
  const tabW = 150;
  const cs = 104;
  const tabH = crests.length * (cs + 26) + 30;
  const tabTop = (story ? 800 : 640) + dy * 0.4;
  const tabX = 64;

  const lines = contours(H);
  const glowText = "0 0 18px rgba(255,255,255,.35), 0 0 46px rgba(255,255,255,.18)";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: night, color: "#fff" }}>
      {/* ground: night club colour, lighter low down, the contour map, a haze rising behind him */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(night, -0.3)} 0%, ${night} 40%, ${mid} 100%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#cfd8ff" strokeWidth={1.2} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 34% at 50% 100%, ${glow}cc 0%, ${glow}55 45%, rgba(0,0,0,0) 100%), radial-gradient(40% 30% at 8% 70%, ${glow}66 0%, rgba(0,0,0,0) 100%), radial-gradient(40% 30% at 95% 62%, ${glow}55 0%, rgba(0,0,0,0) 100%)` }} />
      <div style={{ position: "absolute", left: 0, width: 26, top: H * 0.28, height: H * 0.24, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${glow}, rgba(0,0,0,0))`, opacity: 0.45 }} />
      <div style={{ position: "absolute", right: 0, width: 22, top: H * 0.12, height: H * 0.2, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${glow}, rgba(0,0,0,0))`, opacity: 0.4 }} />

      {/* the word */}
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DIDONE, fontWeight: 500, fontSize: bigPx, lineHeight: 0.92, whiteSpace: "nowrap", textShadow: glowText }}>{big}</div>
      <div style={{ position: "absolute", left: 76, top: underTop }}>
        {compW.lines.map((l, i) => (
          <div key={i} style={capsStyle(compW.px, 600, 0.18, "rgba(255,255,255,.85)", { lineHeight: 1.3 })}>
            {l}
          </div>
        ))}
      </div>
      {tail && <div style={{ position: "absolute", right: 76, top: underTop, ...capsStyle(19 * ts, 700, 0.18, "rgba(255,255,255,.9)") }}>{tail}</div>}

      {/* him: sharp, in colour, a club-colour light round his outline (behind him) */}
      {fig && data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 18px ${glow}99) drop-shadow(0 0 48px ${glow}55)` }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...figMask }} />
        </div>
      )}

      {/* the row beside his head */}
      <div style={{ position: "absolute", left: 76, top: rowTop, width: sideW }}>
        {f.date && <div style={capsStyle(datePx, 600, 0.06, "rgba(255,255,255,.92)")}>{f.date}</div>}
        {koW.lines.length > 0 && (
          <div style={{ display: "inline-block", marginTop: 8, padding: "3px 10px 1px", background: `linear-gradient(90deg, ${glow}, ${shade(glow, 0.2)})`, boxShadow: `0 0 18px ${glow}88` }}>
            {koW.lines.map((l, i) => (
              <div key={i} style={capsStyle(koW.px, 800, 0.08, "#fff")}>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", right: 76, top: rowTop, width: sideW, textAlign: "right" }}>
        {home.map((l, i) => (
          <div key={`h${i}`} style={capsStyle(teamPx, 800, 0.06, "#fff", { fontStyle: "italic" })}>
            {l}
          </div>
        ))}
        {away.map((l, i) => (
          <div key={`a${i}`} style={capsStyle(teamPx, 500, 0.06, "rgba(255,255,255,.72)", { fontFamily: CONDENSED })}>
            {l}
          </div>
        ))}
      </div>

      {/* the framed crest tab */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: tabX, top: tabTop, width: tabW, height: tabH, padding: 3, boxSizing: "border-box", background: `linear-gradient(180deg, ${shade(glow, 0.5)}, ${glow} 50%, ${shade(glow, 0.3)})`, boxShadow: `0 0 30px ${glow}99, 0 14px 30px rgba(0,0,0,.5)` }}>
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(180deg, ${shade(glow, -0.1)}, ${shade(glow, -0.5)})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: cs, height: cs, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.5))" }} />
            ))}
          </div>
        </div>
      )}

      {/* the foot: a soft darkening over the shirt, the agency mark at the agreed spot */}
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - 220, bottom: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${night}cc)` }} />
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${data.params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
