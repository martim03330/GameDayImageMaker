/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { AgencyLogo, BEBAS, CONDENSED, factRows } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* ---------- small helpers shared by the poster looks of this batch (column, splitnumber, notebook, swoosh) ---------- */

/** Fine print grain for paper backgrounds (multiply it over light colours). */
export const PRINT_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** The club's colour as a usable "ink": the second colour for black clubs, never so light it vanishes on paper. */
export function clubInk(data: RenderData): string {
  const p = data.params;
  let c = vivid(p.primary === "#10131c" ? p.accent : p.primary);
  if (luminance(c) > 0.6) c = vivid(p.accent);
  if (luminance(c) > 0.6) c = "#1d2a44";
  return c;
}

/** The club's own primary as given (dark navy stays navy), falling back to the ink. */
export function clubDeep(data: RenderData): string {
  const p = data.params;
  const raw = p.primary === "#10131c" ? p.accent : p.primary;
  const l = luminance(raw);
  if (l > 0.5) return shade(clubInk(data), -0.35);
  return l < 0.1 ? raw : shade(raw, -0.2);
}

/** A second club colour clearly different from `first` (the accent, else black or white). */
export function secondOf(data: RenderData, first: string): string {
  const a = data.params.accent;
  const dist = Math.abs(luminance(a) - luminance(first));
  const hueFar = a.toLowerCase() !== first.toLowerCase();
  if (hueFar && (dist > 0.08 || vivid(a) !== vivid(first))) return a;
  return luminance(first) > 0.3 ? "#111111" : "#e9e6df";
}

/** Values worth printing: no empty cells, no zero-only rows when there are better ones. */
export function goodStats(data: RenderData) {
  return data.content.stats.filter((s) => s.value !== "" && s.value != null);
}

/** Label/value rows for a stats table, whatever the post type. */
export function tableRows(data: RenderData, max = 4): { label: string; value: string }[] {
  const { postType, content, player } = data;
  if ((postType === "stats" || postType === "potm") && goodStats(data).length) {
    const all = goodStats(data);
    const nonZero = all.filter((s) => String(s.value).trim() !== "0");
    // "GOALS 0" reads as a weakness on a celebration post: zeros go whenever anything else is left.
    return (nonZero.length ? nonZero : all).slice(0, max);
  }
  const rows = factRows(data).filter((r) => r.value && r.value !== "—");
  if (postType === "transfer" || postType === "renewal") {
    if (player.position) rows.push({ label: "Position", value: player.position });
    if (player.number) rows.push({ label: "Shirt", value: player.number });
  }
  if (!rows.length && content.stats.length) return content.stats.slice(0, max);
  return rows.slice(0, max);
}

/**
 * These poster looks always show the whole player (framing "full", as in the references); a photo cut above the
 * feet whose face can't be drawn big enough to reach the bottom edge: lift it
 * so the head sits where the layout wants it and let its lower part dissolve into the background instead.
 */
export function lift<T extends { top: number; height: number; feet: boolean; faceTop: number }>(data: RenderData, box: T, faceTop: number): { box: T; style: CSSProperties } {
  if (box.feet || box.faceTop <= faceTop + 10) return { box, style: cutMask(data.cut) };
  const dy = box.faceTop - faceTop;
  const bottomGap = box.top - dy + box.height;
  // A photo cut at the shins only needs its cut softened; one cut at the waist dissolves over a longer run.
  const fade = (data.cut?.bottom ?? 0) > 0 ? 0.14 : Math.min(0.4, Math.max(0.2, (CANVAS_H - bottomGap + 120) / box.height));
  const m = `linear-gradient(to top, transparent 0%, #000 ${Math.round(fade * 100)}%)`;
  return { box: { ...box, top: box.top - dy, faceTop }, style: { WebkitMaskImage: m, maskImage: m } };
}

/** "3 GOALS", "1 GOAL". */
export const statText = (s: { label: string; value: string }) => `${s.value} ${(String(s.value).trim() === "1" ? s.label.replace(/s$/i, "") : s.label).toUpperCase()}`;

/** Current year, for the "©2026" small print. */
export const YEAR = new Date().getFullYear();

/* ---------- the look ---------- */

/** Bebas Neue: average advance of its capitals relative to the size. */
const BEBAS_RATIO = 0.4;

/**
 * Minimal off-white poster (Désiré Doué, PSG): a tall column of club colour hangs from the top edge and
 * fades to white; the full-body player steps out of it with a soft floor shadow. Top corner: the name in two
 * tall condensed lines; the other corner: the crest in a thin ring. Bottom corner: a four-row stats table in
 * condensed caps, and a thin two-colour bar at the foot. Lots of air.
 */
export function Column({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 29);
  const mirror = params.side === "left";
  const ink = clubDeep(data);
  const ink2 = secondOf(data, ink);
  const bar2 = luminance(ink2) > 0.6 ? shade(ink, luminance(ink) < 0.03 ? 0.6 : 0.5) : ink2;
  const bg = "#f3f1f0";
  const text = luminance(ink) > 0.25 ? shade(ink, -0.45) : ink;

  // ---- the column ----
  const colW = 440 + r() * 40;
  const colX = 540 - colW / 2 + (mirror ? 18 : -18);
  const colH = 850 + r() * 40;
  const top = luminance(ink) < 0.03 ? shade(ink, 0.08) : ink;

  // ---- the player: steps out of the column, feet on the floor ----
  const cx = 540 + (mirror ? 20 : -20) + (r() - 0.5) * 40;
  const floor = 1150;
  const placed = standing(data, { cx, headTop: 350, floor, maxFace: 110, framing: "full" });
  const { box, style: figMask } = lift(data, placed, 350 + placed.faceH * 0.2);

  // ---- name (top corner) ----
  const first = (content.firstName || "").toUpperCase();
  const last = (content.lastName || content.firstName || "").toUpperCase();
  const lines = first && last !== first ? [first, last] : [last];
  const nameRoom = colX - 96 - 24;
  const ts = params.textScale ?? 1;
  const nameSize = Math.min(118 * ts, ...lines.map((l) => nameRoom / Math.max(2.5, [...l].length * BEBAS_RATIO)));
  const kicker = content.kicker.toUpperCase();
  const kickSize = Math.min(19, nameRoom / Math.max(1, kicker.length * 0.62));
  const side = (x: number): CSSProperties => (mirror ? { right: x } : { left: x });
  const other = (x: number): CSSProperties => (mirror ? { left: x } : { right: x });

  // ---- stats table (bottom corner) ----
  // Matchday: a fixture card instead of numbers (opponent with his crest, day, kick-off; the ground under it).
  const md = postType === "matchday" ? matchFacts(data) : null;
  const rows: { label: string; value: string; crest?: string | null }[] = md
    ? [
        md.opp ? { label: "Vs", value: md.opp, crest: md.oppCrest } : null,
        md.date ? { label: "Date", value: md.date } : null,
        md.time ? { label: "Kick off", value: md.time } : null,
      ].filter((x): x is { label: string; value: string; crest?: string | null } => !!x)
    : tableRows(data, 4);
  const longest = Math.max(1, ...rows.map((s) => s.label.length + String(s.value).length + 2 + (s.crest ? 2.4 : 0)));
  const rowSize = Math.min(44, (md ? 360 : 300) / (longest * 0.42));
  const venueSize = md?.venue ? Math.min(17, 380 / Math.max(1, md.venue.length * 0.62)) : 0;
  // A wide pose would run into the bottom table: the fixture then moves up under the crest.
  const tableW = Math.max(...rows.map((s) => (s.label.length + String(s.value).length + 2 + (s.crest ? 2.4 : 0)) * rowSize * 0.42), venueSize * (md?.venue.length ?? 0) * 0.62);
  const reach = mirror ? CANVAS_W - box.left : box.left + box.width;
  const stacked = !!md && (box.width / box.height > 0.62 || reach > CANVAS_W - 92 - tableW + box.width * 0.25);
  const subs = md ? [md.comp, md.round].filter(Boolean) : [(postType === "transfer" ? (data.toClub ?? data.club)?.name : content.subline)?.toUpperCase() ?? ""].filter(Boolean);
  const subSize = (t: string) => Math.min(17, nameRoom / Math.max(1, t.length * 0.62));

  const crest = (postType === "transfer" ? data.toClub?.crestUrl : null) ?? data.club?.crestUrl;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg }}>
      {/* Soft vignette, the paper a touch darker at the corners. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 75% at 50% 45%, transparent 55%, rgba(60,50,60,.07) 100%)" }} />
      {/* The column, dark at the top and dissolving into the paper. */}
      <div
        style={{
          position: "absolute",
          left: colX,
          top: 0,
          width: colW,
          height: colH,
          background: `linear-gradient(to bottom, ${top} 0%, ${shade(ink, 0.2)} 22%, ${shade(ink, 0.55)} 48%, ${shade(ink, 0.85)} 74%, ${bg} 100%)`,
        }}
      />
      <div style={{ position: "absolute", left: colX, top: 0, width: colW, height: colH, background: "linear-gradient(to right, rgba(0,0,0,.06), transparent 20%, transparent 80%, rgba(0,0,0,.06))" }} />

      {/* Floor shadow: a wide soft pool and a tight contact under the boots. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 330, width: 660, top: floor - 60, height: 120, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,35,45,.22), rgba(40,35,45,0))", filter: "blur(10px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 170, width: 340, top: floor - 22, height: 40, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,18,25,.45), rgba(20,18,25,0))", filter: "blur(6px)" }} />
        </>
      )}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(.97)", ...figMask }}
        />
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: `linear-gradient(to bottom, ${bg}00, ${bg}cc 60%, ${bg})` }} />}

      {/* Name, two tall condensed lines. */}
      <div style={{ position: "absolute", top: 96, ...side(96), textAlign: mirror ? "right" : "left", color: text }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: BEBAS, fontSize: nameSize, lineHeight: 0.88, whiteSpace: "nowrap", letterSpacing: "0.005em" }}>
            {l}
          </div>
        ))}
        {kicker && (
          <div style={{ marginTop: 22, fontFamily: CONDENSED, fontWeight: 600, fontSize: kickSize, letterSpacing: "0.22em", whiteSpace: "nowrap", opacity: 0.85 }}>{kicker}</div>
        )}
        {subs.map((t, i) => (
          <div key={i} style={{ marginTop: i ? 2 : 6, fontFamily: CONDENSED, fontWeight: 500, fontSize: subSize(t), letterSpacing: "0.22em", whiteSpace: "nowrap", opacity: 0.55 }}>
            {t}
          </div>
        ))}
      </div>

      {/* Crest in a thin ring. */}
      <div
        style={{
          position: "absolute",
          top: 92,
          ...other(92),
          width: 136,
          height: 136,
          borderRadius: "50%",
          border: `2.5px solid ${text}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,.35)",
        }}
      >
        {crest ? (
          <img src={crest} alt="" style={{ width: 86, height: 86, objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: BEBAS, fontSize: 70, color: text, lineHeight: 1 }}>{data.player.number}</span>
        )}
      </div>

      {/* Matchday, wide pose (a kick, arms out): the fixture stacks under the crest, clear of the player. */}
      {stacked && md && (
        <div style={{ position: "absolute", top: 262, ...other(92), width: 230, textAlign: mirror ? "left" : "right", color: text }}>
          {rows.map((s, i) => {
            const size = Math.min(40, 226 / Math.max(3, String(s.value).length * 0.42 + (s.crest ? 1.2 : 0)));
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: 15, letterSpacing: "0.22em", opacity: 0.6, textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.label}</div>
                <div style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: size, lineHeight: 1.05, whiteSpace: "nowrap", textTransform: "uppercase" }}>
                  {s.crest && <img src={s.crest} alt="" style={{ height: size * 0.95, width: size * 0.95, display: "inline-block", objectFit: "contain", verticalAlign: "-0.12em", marginRight: size * 0.2 }} />}
                  {s.value}
                </div>
              </div>
            );
          })}
          {md.venue && (
            <div style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: Math.min(15, 230 / Math.max(1, md.venue.length * 0.62)), letterSpacing: "0.2em", whiteSpace: "nowrap", opacity: 0.6 }}>{md.venue}</div>
          )}
        </div>
      )}

      {/* Stats table. */}
      {rows.length > 0 && !stacked && (
        <div style={{ position: "absolute", bottom: md?.venue ? 88 + venueSize * 1.2 + 16 : 88, ...other(92), display: "grid", gridTemplateColumns: "auto auto", columnGap: rowSize * 0.5, rowGap: rowSize * 0.12, color: text, alignItems: "baseline" }}>
          {rows.map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              <span style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: rowSize, lineHeight: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{s.label}</span>
              <span style={{ fontFamily: CONDENSED, fontWeight: 500, fontSize: rowSize, lineHeight: 1, textAlign: "right", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                {s.crest && <img src={s.crest} alt="" style={{ height: rowSize * 0.95, width: rowSize * 0.95, display: "inline-block", objectFit: "contain", verticalAlign: "-0.12em", marginRight: rowSize * 0.22 }} />}
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
      {md?.venue && !stacked && (
        <div style={{ position: "absolute", bottom: 88, ...other(92), fontFamily: CONDENSED, fontWeight: 500, fontSize: venueSize, letterSpacing: "0.2em", whiteSpace: "nowrap", color: text, opacity: 0.6 }}>
          {md.venue}
        </div>
      )}

      {/* Two-colour bar at the foot. */}
      <div style={{ position: "absolute", left: 540 - 140, bottom: 52, width: 280, height: 13, display: "flex" }}>
        <div style={{ flex: 1, background: ink }} />
        <div style={{ flex: 1, background: bar2 }} />
      </div>
      <AgencyLogo data={data} height={24} onLight style={{ position: "absolute", bottom: 48, ...side(96), color: text, opacity: 0.8 }} />

      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.045, mixBlendMode: "multiply", pointerEvents: "none" }} />
    </div>
  );
}
