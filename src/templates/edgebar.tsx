/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData, STORY_BOTTOM, STORY_TOP } from "./types";

/** Inter 600 capitals: advance widths per 100px (approximate). */
const CAPS_W: Record<string, number> = { A: 73, B: 67, C: 74, D: 73, E: 61, F: 59, G: 76, H: 75, I: 28, J: 58, K: 70, L: 57, M: 92, N: 76, O: 78, P: 65, Q: 78, R: 66, S: 65, T: 66, U: 74, V: 73, W: 103, X: 71, Y: 70, Z: 65, " ": 27, "'": 31, "-": 47, "–": 55, ".": 28, ":": 28 };
const capsEm = (t: string, tracking: number) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (CAPS_W[c] ?? 64) / 100 + tracking, 0);
/** Inter mixed case, roughly, per em. */
const textEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (c === " " ? 0.27 : /[A-Z]/.test(c) ? 0.68 : /[il.,'·]/.test(c) ? 0.26 : /[mw]/.test(c) ? 0.86 : /\d/.test(c) ? 0.6 : 0.56), 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const s = n
    .split(/\s+/)
    .filter(Boolean)
    .join(" ")
    .trim();
  return s || n;
}

/**
 * Edgebar: a thin vertical bar running the full height of one edge, a smooth gradient of the two club
 * colours. Beside it, aligned to it, a clean Inter stack — the title, then fixture, date, kick-off and
 * ground under small labels. The player on the other side, on an off-white or deep-tone ground.
 * Swiss-precise; flips with params.side (the side the player stands on).
 */
export function Edgebar({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts0 = params.textScale ?? 1;
  // Native 9:16 story: title under the profile bar, the facts above the reply bar, type ~1.2× and a bigger figure.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = ts0 * (story ? 1.32 : 1);
  const r = rng(params.seed ?? 1);
  const light = r() < 0.5;
  // The bar and text on the left, the player on the right — unless he is asked to stand on the left.
  const barLeft = params.side !== "left";

  /* ---- colours ---- */
  const prim = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const acc = vivid(params.primary === "#10131c" ? params.primary : params.accent);
  let c1 = luminance(prim) > 0.55 ? acc : prim;
  let c2 = c1 === prim ? acc : prim;
  if (luminance(c1) < 0.03) c1 = shade(c1, 0.3);
  // A white / yellow / near-black second colour: run the bar into a lighter or darker tone of the first.
  const l2 = luminance(c2);
  if ((light && l2 > 0.6) || (!light && l2 < 0.04) || Math.abs(l2 - luminance(c1)) < 0.03) c2 = light ? shade(c1, 0.45) : l2 < 0.04 ? shade(c1, 0.5) : c2;
  if (light && luminance(c1) > 0.6) c1 = shade(c1, -0.4);

  const deepBase = luminance(prim) > 0.45 ? (luminance(acc) > 0.45 ? shade(prim, -0.6) : acc) : prim;
  const ground = light ? "#efece6" : shade(deepBase, -0.74);
  const ink = light ? "#15171c" : "#ffffff";
  const soft = light ? "rgba(21,23,28,.5)" : "rgba(255,255,255,.55)";

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- geometry ---- */
  const BAR = 18;
  const GAP = 44;
  const colX = BAR + GAP; // distance of the text column from the bar's edge of the canvas
  const COL = story ? 470 : 360;
  const top = (story ? STORY_TOP : 92) + (params.textY ?? 0);

  /* ---- the player on the other side ---- */
  const faceX = barLeft ? (story ? 745 : 735) : story ? 335 : 345;
  const box = story
    ? placeByFace(data, faceX, STORY_TOP + 150, { chest: 330, waist: 262, knees: 204, full: 160 })
    : placeByFace(data, faceX, 210, { chest: 250, waist: 196, knees: 150, full: 116 });

  /* ---- the stack ---- */
  const title = (isResult && postType === "result" ? "FULL TIME" : content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const tSize = Math.min(60 * ts, COL / Math.max(1, capsEm(title, -0.01)));
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const ours = shortName(oursName);
  const opp = f.opp ? shortName(typed ?? titleCase(f.opp)) : "";
  const pair = (weHost ? [ours, opp] : [opp, ours]).filter(Boolean);
  const fix = pair.length === 2 ? (isResult ? pair : [pair[0], `v  ${pair[1]}`]) : pair;
  const goals = isResult && pair.length === 2 ? [String(content.homeGoals ?? ""), String(content.awayGoals ?? "")] : [];
  const vSize = (t: string, max: number) => Math.max(14, Math.min(max * ts, COL / Math.max(1, textEm(t))));
  const rows: { label: string; value: string }[] = [
    { label: "Date", value: niceDate(content.date) },
    { label: isResult ? "" : "Kick-off", value: isResult ? "" : f.time },
    { label: "Ground", value: titleCase(f.venue) },
  ].filter((x) => x.value);
  const comp = titleCase(f.comp || f.round || "");

  const align: CSSProperties = barLeft ? { left: colX, textAlign: "left", alignItems: "flex-start" } : { right: colX, textAlign: "right", alignItems: "flex-end" };
  const base: CSSProperties = { fontFamily: SANS, color: ink, whiteSpace: "nowrap", lineHeight: 1.15 };
  const label: CSSProperties = { ...base, fontWeight: 500, fontSize: (story ? 12 : 11) * ts, letterSpacing: "0.22em", textTransform: "uppercase", color: soft, marginBottom: 8 };
  const rule: CSSProperties = { width: COL, height: 1, background: light ? "rgba(21,23,28,.18)" : "rgba(255,255,255,.2)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      {/* A breath of light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: light ? `radial-gradient(60% 50% at ${barLeft ? 68 : 32}% 38%, #f7f5f1, transparent 70%)` : `radial-gradient(60% 50% at ${barLeft ? 68 : 32}% 38%, ${shade(deepBase, -0.5)}, transparent 72%)` }} />

      {/* The player, natural colour; a soft shade behind him. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.2, top: box.top + box.height * 0.3, width: box.width * 0.6, height: box.height * 0.6, borderRadius: "50%", background: light ? "rgba(60,50,40,.12)" : "rgba(0,0,0,.28)", filter: "blur(70px)" }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
      )}

      {/* The bar. */}
      <div style={{ position: "absolute", top: 0, bottom: 0, [barLeft ? "left" : "right"]: 0, width: BAR, background: `linear-gradient(to bottom, ${c1}, ${c2})` }} />

      {/* The stack. */}
      <div style={{ position: "absolute", top, width: COL, display: "flex", flexDirection: "column", ...align }}>
        <div style={{ ...base, fontWeight: 600, fontSize: tSize, letterSpacing: "-0.01em", lineHeight: 0.9, marginLeft: barLeft ? -tSize * 0.04 : 0 }}>{title}</div>
        {comp && <div style={{ ...label, marginTop: 18, marginBottom: 0, fontSize: Math.min(11 * ts, (COL / Math.max(1, capsEm(comp, 0.22))) ) }}>{comp}</div>}
      </div>
      <div style={{ position: "absolute", bottom: (story ? H - STORY_BOTTOM + 150 : 176) - (params.textY ?? 0), width: COL, display: "flex", flexDirection: "column", ...align }}>
        <div style={{ ...rule, marginBottom: 26 }} />
        {fix.map((t, i) => (
          <div key={i} style={{ display: "flex", width: COL, justifyContent: goals.length ? "space-between" : barLeft ? "flex-start" : "flex-end", alignItems: "baseline", gap: 16, flexDirection: barLeft ? "row" : "row-reverse" }}>
            <span style={{ ...base, fontWeight: 500, fontSize: vSize(t, story ? 30 : 26) * (goals.length ? 0.9 : 1), lineHeight: 1.2 }}>{t}</span>
            {goals[i] && <span style={{ ...base, fontWeight: 600, fontSize: 26 * ts, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>{goals[i]}</span>}
          </div>
        ))}
        {rows.length > 0 && <div style={{ ...rule, marginTop: 28, marginBottom: 24 }} />}
        {rows.map((x, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", ...(barLeft ? { alignItems: "flex-start" } : { alignItems: "flex-end" }), marginTop: i ? 22 : 0 }}>
            <div style={label}>{x.label}</div>
            <div style={{ ...base, fontWeight: 400, fontSize: vSize(x.value, story ? 25 : 22) }}>{x.value}</div>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={story ? 24 : 18}
        onLight={light}
        style={{ position: "absolute", bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0), [barLeft ? "left" : "right"]: colX, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: barLeft ? "left bottom" : "right bottom" }}
      />
      <Film strength={light ? 0.1 : 0.18} />
    </div>
  );
}
