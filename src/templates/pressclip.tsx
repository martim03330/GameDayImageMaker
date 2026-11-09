/* eslint-disable @next/next/no-img-element */
import { cutMask, DMSERIF } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { PAPER_GRAIN, clubOnLight, linesAt, pressArticles, pressDateLabel, sourceLabel } from "./presskit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Press · clippings: an off-white paper ground, his cutout large on one side, and on the other the
 * articles as newspaper clippings — cut paper strips, each slightly turned (±2°) with a soft shadow, the
 * headline in a serif exactly as published, the outlet and date on a small line; one clipping carries its
 * article's photo. "IN THE NEWS" at the top over a thin rule, the NEYOD logo opposite.
 */
export function Pressclip({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.28 : 1;
  const left = params.side === "left"; // he stands on this side
  const r = rng(params.seed ?? 7);
  const M = story ? 60 : 54;
  const ink = "#16161a";
  const club = clubOnLight(params);

  const top = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const bottom = story ? STORY_BOTTOM : CANVAS_H - 50;

  /* ---- him: big, head under the logo line, fading at the cut ---- */
  const sizes = story ? { chest: 300, waist: 250, knees: 200, full: 160 } : { chest: 230, waist: 196, knees: 156, full: 124 };
  const faceX = left ? (story ? 300 : 300) : story ? 790 : 790;
  const headClear = top + (story ? 230 : 150);
  let faceTop = headClear + 120;
  for (let i = 0; i < 2; i++) faceTop += headClear - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  const box = placeByFace(data, faceX, faceTop, sizes);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 380 : 260)}px, transparent ${H - 10}px)`;

  /* ---- the clippings ---- */
  const arts = pressArticles(data, 6);
  const n = arts.length;
  const colW = story ? 600 : 540;
  const pad = Math.round(22 * k);
  // No photo thumbnail inside a clipping (the user found it looked wrong) — text-only strips.
  const withImg = -1;
  const imgW = Math.round((story ? 150 : 128) * (n > 4 ? 0.85 : 1));
  const imgH = Math.round(imgW * 0.72);
  const metaSize = Math.round(11.5 * k);
  const gap = Math.round((n > 4 ? 20 : 28) * k);
  const colTop = top + (story ? 150 : 118);
  const room = bottom - colTop;
  const textW = (i: number) => colW - 2 * pad - (i === withImg ? imgW + 18 * k : 0);
  const colH = (size: number) =>
    arts.reduce((h, a, i) => h + 2 * pad + Math.max(i === withImg ? imgH : 0, linesAt(a.title, size, textW(i), 0.47) * size * 1.1 + metaSize + 12 * k), 0) + (n - 1) * gap;
  let size = (n <= 2 ? 46 : n === 3 ? 41 : n === 4 ? 37 : n === 5 ? 33 : 29) * k * ts;
  while (size > 16 * k && colH(size) > room) size -= 1;
  const turns = arts.map((_, i) => (i % 2 ? 1 : -1) * (0.8 + r() * 1.2));
  // A ragged cut along the strip's short edges and a slightly uneven long edge (scissors, not a guillotine).
  const cut = () => {
    const pts: string[] = [];
    const j = () => (r() * 0.9).toFixed(2);
    pts.push(`0% ${j()}%`, `${(30 + r() * 20).toFixed(1)}% 0%`, `100% ${j()}%`);
    for (let y = 18; y < 100; y += 18 + r() * 10) pts.push(`${(100 - r() * 0.7).toFixed(2)}% ${y.toFixed(1)}%`);
    pts.push(`100% ${(100 - +j()).toFixed(2)}%`, `${(40 + r() * 20).toFixed(1)}% 100%`, `0% ${(100 - +j()).toFixed(2)}%`);
    for (let y = 82; y > 0; y -= 18 + r() * 10) pts.push(`${(r() * 0.7).toFixed(2)}% ${y.toFixed(1)}%`);
    return `polygon(${pts.join(", ")})`;
  };
  const cuts = arts.map(() => cut());

  const kicker = (content.kicker || "IN THE NEWS").toUpperCase();
  const sub = (content.subline || "").toUpperCase();
  const kSize = Math.round(20 * k * ts);
  const side = left ? "right" : "left";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#ece8df", color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 50% 45%, #f6f3ec, transparent 80%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_GRAIN, opacity: 0.22, mixBlendMode: "multiply" }} />

      {/* Him, behind the clippings' edge. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "drop-shadow(0 18px 30px rgba(40,30,20,.18))", ...cutMask(data.cut) }}
          />
        </div>
      )}

      {/* Masthead: the kicker over a thin rule, the subline at its end. */}
      <div style={{ position: "absolute", top: top + 4 * k, [side]: M, width: colW }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: kSize, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap", textAlign: left ? "right" : "left", marginRight: left ? "-0.3em" : 0 }}>{kicker}</div>
        <div style={{ height: 2, background: ink, marginTop: 16 * k, opacity: 0.85 }} />
        {sub && (
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: Math.round(12 * k * ts), letterSpacing: "0.22em", marginTop: 10 * k, color: club, whiteSpace: "nowrap", textAlign: left ? "right" : "left", marginRight: left ? "-0.22em" : 0 }}>{sub}</div>
        )}
      </div>

      {/* The clippings, centred in the column below the masthead. */}
      <div style={{ position: "absolute", top: colTop, height: room, [side]: M, width: colW, display: "flex", flexDirection: "column", justifyContent: "center", gap }}>
        {arts.map((a, i) => (
          <div key={i} style={{ transform: `rotate(${turns[i].toFixed(2)}deg)`, filter: "drop-shadow(0 2px 2px rgba(40,30,20,.16)) drop-shadow(0 8px 14px rgba(40,30,20,.16))" }}>
            <div style={{ clipPath: cuts[i], background: "#fbfaf6", padding: pad, display: "flex", gap: 18 * k, alignItems: "flex-start" }}>
              {i === withImg && <img src={a.image!} alt="" style={{ width: imgW, height: imgH, objectFit: "cover", flexShrink: 0, filter: "grayscale(.25) contrast(1.05)" }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: DMSERIF, fontSize: size, lineHeight: 1.1, letterSpacing: "-0.005em" }}>{a.title}</div>
                <div style={{ fontFamily: SANS, fontSize: metaSize, fontWeight: 700, letterSpacing: "0.18em", lineHeight: 1, marginTop: 12 * k, whiteSpace: "nowrap", color: "#6d6a63" }}>
                  <span style={{ color: club }}>{sourceLabel(a)}</span>
                  {a.date && <span style={{ fontWeight: 600 }}>{`\u2002—\u2002${pressDateLabel(a.date)}`}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        onLight
        style={{ position: "absolute", top, [left ? "left" : "right"]: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: left ? "left top" : "right top" }}
      />
    </div>
  );
}
