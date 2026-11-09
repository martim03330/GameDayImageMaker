/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng, SCRIPT } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { VIBES } from "./panelscript";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Great Vibes and Mr Dafoe: advance widths per 100px (measured in the browser). */
const VIBES_W: Record<string, number> = { a: 35.8, b: 32.7, c: 26.3, d: 37.2, e: 25.6, f: 22.2, g: 39.6, h: 33.6, i: 17.6, j: 17.8, k: 36, l: 21.3, m: 50.9, n: 33.8, o: 33.8, p: 31.8, q: 34.7, r: 25.9, s: 26.7, t: 21.4, u: 35.6, v: 30.9, w: 49.5, x: 33.4, y: 38.1, z: 33.5, " ": 17.1, "-": 40.4, "'": 10.6, ".": 20.5, A: 71.6, B: 104.7, C: 71.4, D: 105, E: 81.9, F: 105.3, G: 70.2, H: 139.5, I: 91.7, J: 97.2, K: 120.3, L: 71.6, M: 146.1, N: 104.4, O: 73, P: 92.5, Q: 75.6, R: 102.8, S: 92.6, T: 93.3, U: 94.7, V: 98, W: 135.1, X: 79.1, Y: 96.3, Z: 68.1 };
const DAFOE_W: Record<string, number> = { a: 39, b: 35.3, c: 37.1, d: 44.7, e: 36.4, f: 26.6, g: 32, h: 41, i: 30, j: 16, k: 39.3, l: 32.9, m: 64.3, n: 46, o: 32.8, p: 40.5, q: 31.4, r: 41, s: 34.6, t: 31.3, u: 40.4, v: 29, w: 45.8, x: 42.2, y: 32.9, z: 34.4, " ": 25, "-": 56.3, "'": 24.9, ".": 12.6, A: 45.4, B: 69.1, C: 51.1, D: 77.6, E: 49.3, F: 44.2, G: 55.1, H: 55.5, I: 38.5, J: 42, K: 49.6, L: 59.5, M: 66.7, N: 50.3, O: 49.7, P: 57.8, Q: 55.4, R: 65, S: 56.6, T: 22.8, U: 57.3, V: 45.6, W: 82, X: 44.9, Y: 60.2, Z: 50 };
const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
const widthEm = (t: string, table: Record<string, number>) => plain(t).reduce((a, c) => a + (table[c] ?? 36) / 100, 0);

/** "MOISÉS" → "Moisés"; names typed in caps become proper case, others stay as typed. */
const proper = (s: string) => (s && s === s.toUpperCase() ? s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()) : s);

/** "SC Vianense SAD" → "Vianense". */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
  return s || n;
}

/**
 * Autograph: a signed photo card. The player in natural colour on a clean ground (off-white or a deep
 * club tone, by seed); his full name written across his lower body as a large handwritten signature,
 * slightly rotated, never near the face; under it one tiny line of spaced caps (title · date · kick-off),
 * the crests small at the top, the agency logo at the foot.
 */
export function Autograph({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 5);
  const light = r() < 0.5;
  const dafoe = r() < 0.4;
  const tilt = -(5 + r() * 4);
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const deep = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#111215" : shade(club, -0.58);
  const ground = light ? "#efede8" : deep;
  const ink = light ? "#151517" : "#ffffff";
  const soft = light ? "rgba(21,21,23,.62)" : "rgba(255,255,255,.72)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, centred, big ---- */
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const box = placeByFace(data, faceX, 220, { chest: 280, waist: 220, knees: 170, full: 130 });
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceBottom = box.top + (face[1] + face[3]) * box.height;

  /* ---- the signature ---- */
  const name = proper([content.firstName, content.lastName].filter(Boolean).join(" ") || content.lastName || "");
  const table = dafoe ? DAFOE_W : VIBES_W;
  const nameW = widthEm(name, table);
  const size = Math.min((dafoe ? 150 : 170) * ts, 860 / Math.max(1, nameW));
  // The ink sits well clear of the face: the capitals' tops below the chin, with room for the neck.
  const capTop = dafoe ? 0.72 : 0.8;
  const base = Math.min(CANVAS_H - 250, Math.max(faceBottom + box.faceH * 1.1 + size * capTop + Math.sin((-tilt * Math.PI) / 180) * 430, 880)) + (params.textY ?? 0);
  const sigW = nameW * size;

  /* ---- the tiny line and the crests ---- */
  const title = (isResult && postType === "result" ? "Full time" : content.kicker || "Matchday").toUpperCase().replace(/’/g, "'");
  const ours = shortName(data.club?.name ?? "");
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed ?? f.opp).toUpperCase();
  const pair = (content.home === false ? [them, ours.toUpperCase()] : [ours.toUpperCase(), them]).filter(Boolean);
  const facts = isResult ? [title, pair.length === 2 ? pair.join(` ${score} `) : score] : [title, niceDate(content.date).toUpperCase(), f.time];
  const line = facts.filter(Boolean).join("   ·   ");
  const lineSize = Math.max(11, Math.min(14, 900 / Math.max(1, line.length * 0.98)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = light || params.crestColor ? "none" : "url(#autograph-mono)";

  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, fontSize: lineSize, letterSpacing: "0.34em", paddingLeft: "0.34em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, color: soft, textAlign: "center" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="autograph-mono" ink={0.55} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light ? `radial-gradient(65% 50% at 50% 40%, #f8f7f4, ${ground} 70%, #e4e1da 100%)` : `radial-gradient(65% 50% at 50% 38%, ${shade(deep, 0.12)}, ${deep} 65%, ${shade(deep, -0.35)} 100%)`,
        }}
      />

      {/* The player, natural colour. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      {/* Fade the figure into the ground at the foot, so the signature and the caps sit on calm ground. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 380, background: `linear-gradient(to bottom, transparent, ${light ? "#e4e1da" : shade(deep, -0.35)} 92%)` }} />

      {/* Crests, small, at the top. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 38, height: 38, objectFit: "contain", filter: crestFilter }} />
          ))}
        </div>
      )}

      {/* The signature, across his lower body. */}
      {name && (
        <div
          style={{
            position: "absolute",
            left: 540 - sigW / 2 - 40,
            width: sigW + 80,
            top: base - size,
            height: size * 1.3,
            transform: `rotate(${tilt}deg)`,
            transformOrigin: `50% ${size}px`,
            fontFamily: dafoe ? SCRIPT : VIBES,
            fontSize: size,
            lineHeight: 1,
            textAlign: "center",
            whiteSpace: "nowrap",
            color: ink,
            textShadow: light ? "none" : "0 2px 10px rgba(0,0,0,.3), 0 4px 30px rgba(0,0,0,.2)",
          }}
        >
          {name}
        </div>
      )}

      {/* One tiny line of spaced caps. */}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 150, ...caps }}>{line}</div>

      <AgencyLogo
        data={data}
        height={18}
        onLight={light}
        style={{ position: "absolute", left: "50%", bottom: 54 - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.15} />
    </div>
  );
}
