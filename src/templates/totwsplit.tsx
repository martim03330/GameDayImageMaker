/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo } from "./shared";
import { caps, capsEm, dmiEm, fitGraphic, INK, LeagueGraphic, PAPER, SOFT, totwTitle, totwTone } from "./totwkit";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Split: a clean vertical split. One side a flat club-tone panel holding the official league graphic,
 * centred and large, with his circle ringed; the other side pale, with the player cutout, a stacked italic
 * title at the top and his name, club and the NEYOD logo at the foot.
 */
export function Totwsplit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const tone = totwTone(data);
  const accent = vivid(params.accent);
  const M = story ? 60 : 56;

  // The player's half follows params.side (left by default); the panel takes the other.
  const left = params.side !== "right";
  const near = left ? "left" : "right";
  const far = left ? "right" : "left";
  const X = (x: number) => (left ? x : CANVAS_W - x);

  /* ---- the panel and its graphic ---- */
  const half = story ? 430 : 450; // width of the pale side
  const panelW = CANVAS_W - half;
  const g = fitGraphic(panelW - (story ? 70 : 84), story ? 1240 : 1060);
  const ring = Math.round(g.w * 0.19);

  /* ---- the type on the pale side ---- */
  const words = totwTitle(content.kicker).split(" ");
  // Stack the title on two lines, the break before "of"/"the" when there is one.
  const cut = words.length > 2 ? Math.max(1, words.findIndex((w, i) => i > 0 && /^(the)$/i.test(w))) : 1;
  const lines = words.length > 1 ? [words.slice(0, cut).join(" "), words.slice(cut).join(" ")] : words;
  const colW = half - 2 * M;
  const titleSize = Math.min(70 * S, colW / Math.max(1, ...lines.map(dmiEm))) * ts;
  const titleTop = (story ? STORY_TOP : 60) + (params.textY ?? 0);
  const sub = (content.subline || "").trim();
  const subSize = Math.max(11, Math.min(14 * S, (panelW - 80) / Math.max(1, capsEm(sub, 0.22))));
  const subTop = titleTop + titleSize * 1.08 * lines.length;

  const first = content.firstName || "";
  const last = content.lastName || "";
  const nameSize = Math.min(50 * S, colW / Math.max(1, dmiEm(first), dmiEm(last))) * ts;
  const club = data.club?.name ?? "";
  const clubSize = Math.max(10, Math.min(13 * S, colW / Math.max(1, capsEm(club, 0.22))));
  const logoH = story ? 26 : 20; // renders ~88 (story) / 52 (post)
  const logoBottom = (story ? H - STORY_BOTTOM : 50) - (params.logoY ?? 0);
  const clubTop = H - logoBottom - (story ? 88 : 52) - (story ? 66 : 44) - clubSize * 1.2;
  const nameTop = clubTop - 12 * S - nameSize * 1.02 * 2;

  /* ---- the player: centred on the pale side, fading out above the name ---- */
  const faceTop = story ? Math.max(subTop + 210, 600) : Math.max(subTop + 120, 330);
  const box = placeByFace(data, X(half / 2 + 6), faceTop, story ? { chest: 200, waist: 165, knees: 140, full: 120 } : { chest: 150, waist: 125, knees: 108, full: 94 });
  const fadeTo = nameTop - 30 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeTo - (story ? 300 : 220)}px, transparent ${fadeTo}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", [near]: 0, top: 0, width: half, height: H, background: "radial-gradient(90% 60% at 50% 45%, rgba(255,255,255,.55), transparent 80%)" }} />

      {/* The panel: flat club tone, a whisper of light, the graphic centred. */}
      <div
        style={{
          position: "absolute",
          [far]: 0,
          top: 0,
          width: panelW,
          height: H,
          background: `linear-gradient(to bottom, ${shade(tone, -0.36)}, ${shade(tone, -0.48)})`,
          flexDirection: "column",
          gap: story ? 56 : 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LeagueGraphic data={data} maxW={g.w} maxH={g.h} ring={ring} accent={accent} style={{ boxShadow: "0 30px 70px -20px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.2)", marginTop: sub ? subSize * 1.2 + (story ? 56 : 34) : 0 }} />
        {sub && <div style={{ ...caps(subSize, "rgba(255,255,255,.82)", 0.22) }}>{sub}</div>}
      </div>

      {/* The player, sharp, in natural colour, dissolving into the ground above the name. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Title and round. */}
      <div style={{ position: "absolute", [near]: M, top: titleTop, fontFamily: DMSERIF, fontStyle: "italic", fontSize: titleSize, lineHeight: 1.08, color: INK, whiteSpace: "nowrap", textAlign: left ? "left" : "right" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>

      {/* Name, club, logo. */}
      <div style={{ position: "absolute", [near]: M, top: nameTop, fontFamily: DMSERIF, fontStyle: "italic", fontSize: nameSize, lineHeight: 1.02, color: INK, whiteSpace: "nowrap", textAlign: left ? "left" : "right" }}>
        <div>{first}</div>
        <div>{last}</div>
      </div>
      {club && <div style={{ position: "absolute", [near]: M + 2, top: clubTop, ...caps(clubSize, SOFT, 0.22) }}>{club}</div>}
      <AgencyLogo
        data={data}
        onLight
        height={logoH}
        style={{ position: "absolute", [near]: M, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: `${near} bottom` }}
      />
      <Film strength={0.15} />
    </div>
  );
}
