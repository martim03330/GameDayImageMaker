/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade } from "@/lib/color";
import { clubInk, lift } from "./column";
import { rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, CONDENSED, DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const GOLD = "#c9a24b";
const STUDIO = "#e7e7e5";

const rgb = (hex: string) => [0, 2, 4].map((i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16) / 255);

/**
 * A crest turned into one flat colour: its coloured / dark parts solid, its white parts knocked out, so the
 * emblem keeps its drawing (a lion, a ship) instead of becoming a plain shield.
 */
export function InkFilter({ id, color, opacity = 1 }: { id: string; color: string; opacity?: number }) {
  const [r, g, b] = rgb(color);
  const k = 1.9 * opacity;
  return (
    <filter id={id} colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
      <feColorMatrix type="matrix" values={`0 0 0 0 ${r.toFixed(3)}  0 0 0 0 ${g.toFixed(3)}  0 0 0 0 ${b.toFixed(3)}  ${(-0.3 * k).toFixed(3)} ${(-0.59 * k).toFixed(3)} ${(-0.11 * k).toFixed(3)} 0 ${(1.75 * opacity).toFixed(3)}`} result="ink" />
      <feComposite in="ink" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

/** Barlow caps: average advance relative to the size (before tracking). */
const BARLOW = 0.56;
const fitCaps = (t: string, width: number, max: number, tracking = 0) => Math.min(max, width / Math.max(1, [...t].length * (BARLOW + tracking)));

/** A title on one or two balanced lines, as big as the width allows. */
function heading(text: string, width: number, max: number): { lines: string[]; size: number } {
  const k = text.toUpperCase().replace(/’/g, "'").trim();
  const words = k.split(/\s+/).filter(Boolean);
  let best = { lines: [k], size: Math.min(max, width / Math.max(1, em(k, ANTON, 44))) };
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const size = Math.min(max * 0.86, ...lines.map((l) => width / Math.max(1, em(l, ANTON, 44))));
    if (size > best.size * 1.15) best = { lines, size };
  }
  return best;
}

/**
 * Crest band (Chelsea, Jorginho): a light grey studio; a wide band tilted across the middle in the club
 * colour, with thin pinstripes along its edges; inside it the crest blown up as a flat single-colour mark on
 * a pale roundel with a gold ring, an offset grey shadow behind it, cropped by the band. The full-body
 * player stands in front. A column of four small crest marks down one edge, the crest small at the top,
 * the name in small bold caps sitting on the band's top edge, a stack of tiny chevrons, and the post's own
 * facts (fixture, numbers, move) in a quiet block in the free corner.
 */
export function Band({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 42);
  const mirror = params.side === "left";
  const X = (x: number) => (mirror ? CANVAS_W - x : x);
  const side = (x: number): CSSProperties => (mirror ? { right: x } : { left: x });
  const far = (x: number): CSSProperties => (mirror ? { left: x } : { right: x });
  const club = clubInk(data);
  const ink = luminance(club) > 0.3 ? shade(club, -0.4) : club;
  const crest = (postType === "transfer" ? (data.toClub ?? data.club)?.crestUrl : data.club?.crestUrl) ?? null;
  const ts = params.textScale ?? 1;

  // ---- the band (in its own frame: x along it, y across, origin at its centre) ---------------------------
  const angle = (12 + (r() - 0.5) * 2) * (mirror ? 1 : -1);
  const tan = Math.tan((angle * Math.PI) / 180);
  const bcx = 540;
  const bcy = 640 + (r() - 0.5) * 30;
  const T = 226;
  const vT = T / Math.cos((angle * Math.PI) / 180);
  /** Canvas y of the band's top / bottom edge at canvas x. */
  const edgeTop = (x: number) => bcy + (x - bcx) * tan - vT;
  const edgeBot = (x: number) => bcy + (x - bcx) * tan + vT;
  const R = 440;
  const discX = -10 + (r() - 0.5) * 40;
  const crestBox = 780;

  // ---- the player ---------------------------------------------------------------------------------
  const floor = 1246;
  let cx = 520 + (r() - 0.5) * 30;
  const place = () => standing(data, { cx: X(cx), headTop: 292, floor, maxFace: 112, framing: "full" });
  let placed = place();

  // ---- the info block, bottom corner away from the player -------------------------------------------
  const md = postType === "matchday" ? matchFacts(data) : null;
  const score = scoreOf(data, "–");
  const blockW = 330;
  const head = heading(content.kicker || "MATCHDAY", blockW, 84 * ts);
  const rows: { node: ReactNode; h: number }[] = [];
  const line = (text: string, size: number, weight: number, tracking: number, opacity = 1, color = ink) =>
    rows.push({
      h: size * 1.25,
      node: <div style={{ fontFamily: CONDENSED, fontWeight: weight, fontSize: size, lineHeight: 1.25, letterSpacing: `${tracking}em`, whiteSpace: "nowrap", opacity, color }}>{text}</div>,
    });
  const crestRow = (items: (string | null | undefined)[], mid: string, size = 58) => {
    const list = items.filter(Boolean) as string[];
    if (!list.length) return;
    rows.push({
      h: size + 16,
      node: (
        <div style={{ display: "flex", alignItems: "center", gap: 14, height: size + 16, justifyContent: mirror ? "flex-start" : "flex-end" }}>
          {list.map((c, i) => (
            <div key={i} style={{ display: "contents" }}>
              {i > 0 && mid && <span style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: size * 0.42, color: ink, opacity: 0.7 }}>{mid}</span>}
              <img src={c} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.18))" }} />
            </div>
          ))}
        </div>
      ),
    });
  };
  const stat = (value: string, label: string) =>
    rows.push({
      h: 56,
      node: (
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, justifyContent: mirror ? "flex-start" : "flex-end", color: ink, height: 56 }}>
          <span style={{ fontFamily: DISPLAY, fontSize: 48, lineHeight: 1 }}>{value}</span>
          <span style={{ fontFamily: CONDENSED, fontWeight: 600, fontSize: 19, letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
        </div>
      ),
    });
  const facts = content.stats.filter((s) => s.value !== "" && s.value != null && String(s.value).length <= 6);
  const nonZero = facts.filter((s) => String(s.value).trim() !== "0");

  if (md) {
    crestRow([md.ourCrest, md.oppCrest], "v");
    if (md.opp) line(`V ${md.opp}`, fitCaps(`V ${md.opp}`, blockW, 30 * ts, 0.04), 800, 0.04);
    const when = [md.date, md.time].filter(Boolean).join("  ·  ");
    if (when) line(when, fitCaps(when, blockW, 24 * ts, 0.1), 700, 0.1);
    if (md.venue) line(md.venue, fitCaps(md.venue, blockW, 20 * ts, 0.08), 600, 0.08, 0.8);
    const comp = [md.comp, md.round].filter(Boolean).join(" · ");
    if (comp) line(comp, fitCaps(comp, blockW, 18 * ts, 0.08), 600, 0.08, 0.6);
  } else if (postType === "goal" || postType === "result") {
    crestRow([content.homeCrest ?? data.club?.crestUrl, content.awayCrest], score, 58);
    const teams = [content.homeTeam, content.awayTeam].filter(Boolean).join(" v ").toUpperCase();
    if (teams) line(teams, fitCaps(teams, blockW, 22 * ts, 0.06), 700, 0.06);
    const sub = content.subline.toUpperCase();
    if (sub) line(sub, fitCaps(sub, blockW, 18 * ts, 0.08), 600, 0.08, 0.6);
  } else if (postType === "transfer") {
    crestRow([data.fromClub?.crestUrl, (data.toClub ?? data.club)?.crestUrl], "›", 62);
    const to = ((data.toClub ?? data.club)?.name ?? "").toUpperCase();
    if (to) line(to, fitCaps(to, blockW, 24 * ts, 0.06), 800, 0.06);
    if (content.until) line(`UNTIL ${content.until}`, 19, 600, 0.14, 0.75);
  } else if (postType === "renewal") {
    const until = content.until ? `UNTIL ${content.until}` : "";
    if (until) line(until, fitCaps(until, blockW, 30 * ts, 0.08), 800, 0.08);
    const name = (data.club?.name ?? "").toUpperCase();
    if (name) line(name, fitCaps(name, blockW, 18 * ts, 0.14), 500, 0.14, 0.7);
  } else {
    const sub = content.subline.toUpperCase();
    if (sub) line(sub, fitCaps(sub, blockW, 22 * ts, 0.1), 700, 0.1);
    (nonZero.length ? nonZero : facts).slice(0, postType === "stats" ? 4 : 3).forEach((s) => stat(String(s.value), Number(s.value) === 1 ? s.label.replace(/s$/i, "") : s.label));
  }
  const headH = head.lines.length * head.size * 0.95;
  const blockH = headH + 14 + rows.reduce((a, x) => a + x.h, 0);
  const blockBottom = 96;
  const blockTop = CANVAS_H - blockBottom - blockH;
  const blockLeft = CANVAS_W - 64 - blockW;

  // The player keeps clear of the block: he steps away, then (only if still needed) gets smaller.
  // A wide pose (a kick, arms out) counts with its whole width; an upright one only with its body.
  const nearRight = (p: typeof placed) => {
    const edge = p.width / p.height > 0.58 ? (mirror ? CANVAS_W - p.left : p.left + p.width) : (mirror ? CANVAS_W - p.faceCx : p.faceCx) + p.faceH * 1.9;
    return edge;
  };
  const textRight = Math.max(...head.lines.map((l) => em(l, ANTON, 44) * head.size)) + 20;
  const blockNear = CANVAS_W - 64 - Math.min(blockW, Math.max(textRight, 240));
  if (nearRight(placed) > blockNear - 16) {
    cx -= Math.min(130, nearRight(placed) - blockNear + 16);
    placed = place();
  }
  const { box, style: figMask } = lift(data, placed, 292 + placed.faceH * 0.2);
  const fig = data.photoUrl;

  // ---- the name on the band's top edge, right of his head ---------------------------------------------
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase() || data.content.lastName.toUpperCase();
  const faceNear = mirror ? CANVAS_W - placed.faceCx : placed.faceCx;
  const cos = Math.cos((angle * Math.PI) / 180);
  // A hand raised beside the head would sit on the name: it then runs along the bottom edge, far corner.
  const raised = placed.top < placed.faceTop - placed.faceH * 0.6;
  const lowRoom = faceNear - placed.faceH * 2.4 - 64;
  const nameLow = raised && lowRoom > 200;
  const nameX0 = nameLow ? 64 : Math.max(faceNear + placed.faceH * 1.5 + 30, 640);
  const nameSize = fitCaps(name, (nameLow ? lowRoom : 1030 - nameX0) / cos, 30, 0.08);

  // ---- column of small crests, chevrons -------------------------------------------------------------
  const colSize = 62;
  const colTop = 136;
  const colCount = Math.max(0, Math.min(4, Math.floor((edgeTop(X(70)) - 40 - colTop + 14) / (colSize + 14))));
  const chevTop = edgeBot(X(990)) + 40;
  const chevBottom = blockTop - 30;
  const chevCount = Math.max(0, Math.min(6, Math.floor((chevBottom - chevTop) / 20)));

  const ringInk = shade(club, 0.14);
  const markColor = luminance(club) < 0.04 ? shade(club, 0.25) : shade(club, 0.1);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: STUDIO }}>
      {/* Studio: soft light from above, the floor a darker grey dissolving into the wall. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 70% at 50% 30%, #f1f1ef, #e2e2e0 60%, #d6d6d4 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, bottom: 0, background: "linear-gradient(to bottom, rgba(90,90,92,0), rgba(90,90,92,.22) 45%, rgba(70,70,72,.38))" }} />

      <svg data-bleed width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <InkFilter id="band-ink" color={ringInk} />
          <InkFilter id="band-shadow" color="#9d9d9f" opacity={0.95} />
          <InkFilter id="band-mark" color={markColor} />
          <clipPath id="band-clip">
            <rect x={-1000} y={-T} width={2000} height={T * 2} />
          </clipPath>
        </defs>
        <g transform={`translate(${bcx} ${bcy.toFixed(1)}) rotate(${angle.toFixed(2)})`}>
          {/* Pinstripes outside the band. */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <rect x={-1000} y={s < 0 ? -T - 20 : T + 14} width={2000} height={6} fill={club} />
              <rect x={-1000} y={s < 0 ? -T - 36 : T + 30} width={2000} height={3} fill={club} />
            </g>
          ))}
          <rect x={-1000} y={-T} width={2000} height={T * 2} fill={club} />
          <g clipPath="url(#band-clip)">
            {/* The pale roundel with its gold ring, the crest as a flat mark with an offset grey shadow. */}
            <circle cx={mirror ? -discX : discX} cy={0} r={R} fill="#e3e3e1" />
            <circle cx={mirror ? -discX : discX} cy={0} r={R - 7} fill="none" stroke={GOLD} strokeWidth={12} />
            <circle cx={mirror ? -discX : discX} cy={0} r={R - 26} fill="none" stroke={club} strokeWidth={2} opacity={0.35} />
            {crest ? (
              <>
                <image href={crest} x={(mirror ? -discX : discX) - crestBox / 2 + 26} y={-crestBox / 2 + 14} width={crestBox} height={crestBox} preserveAspectRatio="xMidYMid meet" filter="url(#band-shadow)" opacity={0.75} />
                <image href={crest} x={(mirror ? -discX : discX) - crestBox / 2} y={-crestBox / 2} width={crestBox} height={crestBox} preserveAspectRatio="xMidYMid meet" filter="url(#band-ink)" />
              </>
            ) : (
              <text x={mirror ? -discX : discX} y={T * 0.62} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: T * 2.1 }} fill={ringInk}>
                {data.player.number || ""}
              </text>
            )}
            {/* Thin white rule just inside each edge. */}
            <rect x={-1000} y={-T + 12} width={2000} height={3} fill="#ffffff" opacity={0.9} />
            <rect x={-1000} y={T - 15} width={2000} height={3} fill="#ffffff" opacity={0.9} />
          </g>
          {/* The name, small bold caps sitting on the top edge (or hanging from the bottom one). */}
          {name && (
            <text
              x={((nameX0 - 540) / cos) * (mirror ? -1 : 1)}
              y={nameLow ? T + 44 + nameSize * 0.75 : -T - 46}
              textAnchor={mirror ? "end" : "start"}
              style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: nameSize, letterSpacing: "0.08em" }}
              fill={club}
            >
              {name}
            </text>
          )}
        </g>
      </svg>

      {/* Crest small at the top, and a column of marks down the edge. */}
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: 540 - 36, top: 36, width: 72, height: 72, objectFit: "contain", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.15))" }} />}
      {crest && colCount > 0 && (
        <svg width={colSize + 20} height={colCount * (colSize + 14)} style={{ position: "absolute", top: colTop, ...side(40) }}>
          {Array.from({ length: colCount }, (_, i) => (
            <image key={i} href={crest} x={10} y={i * (colSize + 14)} width={colSize} height={colSize} preserveAspectRatio="xMidYMid meet" filter="url(#band-mark)" />
          ))}
        </svg>
      )}

      {/* Contact shadow, then the player. */}
      {fig && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.faceCx - 300, width: 600, top: floor - 50, height: 100, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(30,30,35,.28), rgba(30,30,35,0))", filter: "blur(8px)" }} />
          <div style={{ position: "absolute", left: box.faceCx - 170, width: 340, top: floor - 18, height: 34, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,20,25,.5), rgba(20,20,25,0))", filter: "blur(5px)" }} />
        </>
      )}
      {fig && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 16px 26px rgba(0,0,0,.22))" }}>
          <img src={fig} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.02)", ...figMask }} />
        </div>
      )}

      {/* Tiny repeated chevrons under the band. */}
      {chevCount >= 3 && (
        <svg width={70} height={chevCount * 20} style={{ position: "absolute", top: chevTop, ...far(58) }}>
          {Array.from({ length: chevCount }, (_, i) => (
            <path key={i} d={mirror ? `M4 ${i * 20 + 4} Q 30 ${i * 20 + 16} 66 ${i * 20 + 2}` : `M66 ${i * 20 + 4} Q 40 ${i * 20 + 16} 4 ${i * 20 + 2}`} fill="none" stroke={club} strokeWidth={3} strokeLinecap="round" />
          ))}
        </svg>
      )}

      {/* The post's facts, quiet, in the free corner. */}
      <div style={{ position: "absolute", top: blockTop, width: blockW, ...(mirror ? { left: 64 } : { left: blockLeft }), textAlign: mirror ? "left" : "right", color: ink }}>
        {head.lines.map((t, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontSize: head.size, lineHeight: 0.95, whiteSpace: "nowrap", color: club }}>
            {t}
          </div>
        ))}
        <div style={{ height: 14 }} />
        {rows.map((x, i) => (
          <div key={i}>{x.node}</div>
        ))}
      </div>

      <AgencyLogo data={data} height={24} onLight style={{ position: "absolute", bottom: 44, ...side(60), color: ink, opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 95% at 50% 45%, transparent 65%, rgba(0,0,0,.1) 100%)", pointerEvents: "none" }} />
    </div>
  );
}
