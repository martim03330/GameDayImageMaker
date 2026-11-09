/* eslint-disable @next/next/no-img-element */
import { cutMask } from "./fx";
import { clubOnDark, linesAt, pressArticles, pressDateLabel, sourceLabel } from "./presskit";
import type { PressArticle } from "@/lib/types";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Press · wall: a dark ground with a faint glow in the club colour, his cutout centred, and the headlines
 * set around him as small typographic tiles on a grid — outlet in the club colour, headline in white exactly
 * as published, the date. With an odd count the lead article sits wider at the foot. "IN THE NEWS" centred
 * at the top, the NEYOD logo at the foot.
 */
export function Presswall({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 56 : 50;
  const club = clubOnDark(params);
  const ground = "#0b0d12";

  const top = (story ? STORY_TOP : 46) + (params.textY ?? 0);
  const kSize = Math.round(20 * k * ts);
  const sub = (content.subline || "").toUpperCase();
  const kickBottom = top + kSize + (sub ? 12 * k + 13 * k : 0);
  const logoH = story ? 88 : 52;
  const logoTop = (story ? STORY_BOTTOM : CANVAS_H - 48) - logoH - (params.logoY ?? 0);

  /* ---- him, centred between the tile columns (only a little under them), head under the kicker ---- */
  const colW = story ? 284 : 268;
  const sizes: Record<string, number> = story ? { chest: 250, waist: 220, knees: 180, full: 140 } : { chest: 190, waist: 170, knees: 140, full: 110 };
  const headClear = kickBottom + (story ? 90 : 60);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  let faceH = (sizes[params.framing ?? "waist"] ?? sizes.waist) * (params.playerScale ?? 1);
  if (data.facePx > 0) faceH = Math.min(faceH, Math.max(96, data.facePx * 1.2));
  // The cutout is trimmed to him: its width is his. Keep it within the gap between the columns (+40px a side).
  const maxW = CANVAS_W - 2 * M - 2 * colW + 80;
  // Big enough to reach the foot (where he fades), but never much wider than the gap.
  const bh = Math.min(Math.max(faceH / face[3], (H * 0.6) / Math.max(0.3, 1 - face[1])), (maxW * 1.1) / aspect);
  const bw = bh * aspect;
  const box = {
    left: CANVAS_W / 2 - bw * (face[0] + face[2] / 2) + (params.playerX ?? 0),
    top: headClear + (params.playerY ?? 0),
    width: bw,
    height: bh,
  };
  const faceTop = box.top + face[1] * bh;
  const fadeEnd = logoTop - 40;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300)}px, transparent ${fadeEnd}px)`;

  /* ---- the tiles ---- */
  const arts = pressArticles(data, 6);
  const footLead = arts.length % 2 === 1;
  const lead = footLead ? arts[0] : null;
  const sideArts = footLead ? arts.slice(1) : arts;
  const rows = Math.ceil(sideArts.length / 2);
  const pad = Math.round(18 * k);
  const leadW = story ? 720 : 640;
  // The tiles start under his chin: his head (and a raised arm) stay free above them.
  const gridTop = Math.max(headClear + (story ? 60 : 40), faceTop + face[3] * bh * 1.25);
  const metaSize = Math.round(11.5 * k);
  const tileH = (a: PressArticle, s: number, w: number) => 2 * pad + 3 + 14 * k + metaSize + 12 * k + linesAt(a.title, s, w - 2 * pad, 0.52) * s * 1.2 + (a.date ? 10 * k + metaSize : 0);
  const leadH = (s: number) => (lead ? tileH(lead, s * 1.15, leadW) : 0);
  const gridBottom = (s: number) => logoTop - 56 * k - (lead ? leadH(s) + 28 * k : 0);
  const gridH = (s: number) => {
    let h = 0;
    for (let r = 0; r < rows; r++) h += Math.max(...sideArts.slice(r * 2, r * 2 + 2).map((a) => tileH(a, s, colW)));
    return h + (rows - 1) * 24 * k;
  };
  let size = (rows <= 1 ? 26 : rows === 2 ? 24 : 21) * k * ts;
  while (size > 13 * k && gridH(size) > gridBottom(size) - gridTop) size -= 1;

  const Tile = ({ a, w, s }: { a: PressArticle; w: number; s: number }) => (
    <div style={{ width: w, padding: pad, background: "rgba(16,19,26,.92)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 3, boxSizing: "border-box" }}>
      <div style={{ width: 34 * k, height: 3, background: club }} />
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: metaSize, letterSpacing: "0.18em", lineHeight: 1, color: club, marginTop: 14 * k, whiteSpace: "nowrap" }}>{sourceLabel(a)}</div>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: s, lineHeight: 1.2, letterSpacing: "-0.005em", color: "#fff", marginTop: 12 * k }}>{a.title}</div>
      {a.date && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: metaSize, letterSpacing: "0.18em", lineHeight: 1, color: "rgba(255,255,255,.5)", marginTop: 10 * k }}>{pressDateLabel(a.date)}</div>}
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: "#fff" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(42% 36% at 50% ${Math.round(((faceTop + 260 * k) / H) * 100)}%, ${club}38, transparent 75%)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Kicker, centred at the top. */}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: kSize, letterSpacing: "0.34em", paddingLeft: "0.34em", lineHeight: 1, whiteSpace: "nowrap" }}>{(content.kicker || "IN THE NEWS").toUpperCase()}</div>
        {sub && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: Math.round(13 * k * ts), letterSpacing: "0.26em", paddingLeft: "0.26em", marginTop: 12 * k, color: club, lineHeight: 1, whiteSpace: "nowrap" }}>{sub}</div>}
      </div>

      {/* The grid either side of him: rows aligned across, spread over the height. */}
      <div
        style={{
          position: "absolute",
          left: M,
          right: M,
          top: gridTop,
          height: gridBottom(size) - gridTop,
          display: "grid",
          gridTemplateColumns: `${colW}px 1fr ${colW}px`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          alignContent: "space-between",
          rowGap: 24 * k,
        }}
      >
        {sideArts.map((a, i) => (
          <div key={i} style={{ gridColumn: i % 2 ? 3 : 1, gridRow: Math.floor(i / 2) + 1 }}>
            <Tile a={a} w={colW} s={size} />
          </div>
        ))}
      </div>

      {lead && (
        <div style={{ position: "absolute", left: (CANVAS_W - leadW) / 2, bottom: H - (logoTop - 56 * k) }}>
          <Tile a={lead} w={leadW} s={size * 1.15} />
        </div>
      )}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
