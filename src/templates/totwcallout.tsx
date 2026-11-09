/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo } from "./shared";
import { caps, capsEm, dmiEm, fitGraphic, INK, LeagueGraphic, PAPER, SOFT, totwTitle, totwTone } from "./totwkit";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Callout: a very pale gallery ground, the official league graphic hung on one side like a print, the
 * player standing large on the other. One hairline leader runs from his highlighted circle out of the
 * graphic to a small dot on his shoulder, where his name sits like an annotation. A quiet italic title
 * and the round in spaced caps at the top; the NEYOD logo under the graphic.
 */
export function Totwcallout({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const tone = totwTone(data);
  const accent = vivid(params.accent);
  const hl = content.insetHighlight;
  const M = story ? 64 : 60;

  // The leader leaves the graphic through its nearer side: the player stands on that side.
  const left = hl ? hl.x < 50 : params.side !== "right";
  const X = (x: number) => (left ? x : CANVAS_W - x);

  /* ---- the graphic ---- */
  const g = fitGraphic(story ? 590 : 580, story ? 1040 : 900);
  const Ty = (story ? STORY_TOP + 250 : 205) + (params.textY ?? 0) * 0.5;
  const Lx = CANVAS_W - M - g.w; // its near edge, in player-left coordinates
  const ring = Math.round(g.w * (hl?.r ? (hl.r * 2) / 100 : 0.19));
  const Ay = Ty + ((hl?.y ?? 50) / 100) * g.h; // assumed; everything that touches the graphic is drawn in its own %

  /* ---- the player ---- */
  const faceTop = story ? 880 : 330;
  const box = placeByFace(data, X(story ? 130 : 150), faceTop, story ? { chest: 230, waist: 190, knees: 160, full: 135 } : { chest: 200, waist: 165, knees: 140, full: 120 });
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const faceH = box.faceH;
  const faceCx = left ? box.left + (face[0] + face[2] / 2) * box.width : CANVAS_W - (box.left + (face[0] + face[2] / 2) * box.width);
  // The dot: on his near shoulder.
  const Bx = Math.min(faceCx + faceH * 0.95, Lx - 170 * S);
  const By = faceTop + faceH * 1.25;

  /* ---- the annotation ---- */
  const first = content.firstName || "";
  const last = content.lastName || "";
  const nameW = Lx - 34 * S - (Bx + 22 * S);
  const nameSize = Math.max(22, Math.min(40 * S * ts, nameW / Math.max(1, dmiEm(first), dmiEm(last))));
  const club = data.club?.name ?? "";
  const clubSize = Math.max(10, Math.min(13 * S, nameW / Math.max(1, capsEm(club, 0.2))));
  const Kx = Lx - 24 * S; // the knee where the shelf turns towards the graphic

  /* ---- the title ---- */
  const title = totwTitle(content.kicker);
  const titleSize = Math.min(56 * S, (CANVAS_W - 2 * M) / Math.max(1, dmiEm(title))) * ts;
  const titleTop = (story ? STORY_TOP : 62) + (params.textY ?? 0);
  const sub = (content.subline || "").trim();
  const subSize = Math.max(11, Math.min(14 * S, (CANVAS_W - 2 * M) / Math.max(1, capsEm(sub, 0.26))));

  const near = left ? "left" : "right";
  const far = left ? "right" : "left";
  const hxNear = hl ? (left ? hl.x : 100 - hl.x) : 0;
  const Byr = By - Ty;
  const down = Ay > By; // the graphic end of the diagonal lies below the knee
  const line = "rgba(34,32,29,.78)";

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% 45%, rgba(255,255,255,.6), transparent 75%)" }} />
      <div style={{ position: "absolute", inset: 0, background: tone, opacity: 0.045, mixBlendMode: "color" }} />

      {/* The player, large, natural colour; a soft floor shadow only. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
        />
      )}

      {/* The graphic, hung like a print, with the leader drawn in its own coordinates. */}
      <LeagueGraphic
        data={data}
        maxW={CANVAS_W - M - Lx}
        maxH={g.h}
        ring={ring}
        accent={accent}
        style={{ position: "absolute", [near]: Lx, top: Ty, boxShadow: "0 30px 60px -20px rgba(40,30,20,.35), 0 2px 6px rgba(40,30,20,.12)" }}
      >
        {hl && (
          <>
            {/* inside the graphic: a white hairline from the ring to its edge */}
            <div style={{ position: "absolute", [near]: 0, top: `${hl.y}%`, width: `calc(${hxNear}% - ${ring / 2 + 4}px)`, height: 0, borderTop: "1.5px solid rgba(255,255,255,.9)" }} />
            {/* outside: the diagonal from the graphic's edge to the knee */}
            <div style={{ position: "absolute", [near]: -(Lx - Kx), width: Lx - Kx, top: `min(${hl.y}%, ${Byr}px)`, bottom: `calc(100% - max(${hl.y}%, ${Byr}px))` }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1={left ? 0 : 100} y1={down ? 0 : 100} x2={left ? 100 : 0} y2={down ? 100 : 0} stroke={line} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </>
        )}
      </LeagueGraphic>

      {hl && (
        <>
          {/* the shelf from the knee to the dot on his shoulder */}
          <div style={{ position: "absolute", left: left ? Bx : CANVAS_W - Kx, width: Kx - Bx, top: By, height: 0, borderTop: `1.5px solid ${line}` }} />
          <div style={{ position: "absolute", left: X(Bx) - 7 * S, top: By - 7 * S, width: 14 * S, height: 14 * S, borderRadius: "50%", background: INK, boxShadow: "0 0 0 3px rgba(255,255,255,.9)" }} />
        </>
      )}

      {/* The annotation: his name on the shelf, the club under it. */}
      <div style={{ position: "absolute", [near]: Bx + 22 * S, bottom: H - By + 12 * S, textAlign: left ? "left" : "right", color: INK }}>
        {club && <div style={{ ...caps(clubSize, SOFT, 0.2), marginBottom: 10 * S }}>{club}</div>}
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: nameSize, lineHeight: 1.02, whiteSpace: "nowrap" }}>{first}</div>
        <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: nameSize, lineHeight: 1.02, whiteSpace: "nowrap" }}>{last}</div>
      </div>

      {/* Title and round. */}
      <div style={{ position: "absolute", [near]: M, top: titleTop, fontFamily: DMSERIF, fontStyle: "italic", fontSize: titleSize, lineHeight: 1.05, whiteSpace: "nowrap", color: INK }}>{title}</div>
      {sub && <div style={{ position: "absolute", [near]: M + 2, top: titleTop + titleSize * 1.2 + 6 * S, ...caps(subSize, SOFT, 0.26) }}>{sub}</div>}

      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 22}
        style={{
          position: "absolute",
          [far]: M,
          bottom: (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0),
          transform: `scale(${params.logoScale ?? 1})`,
          transformOrigin: `${far} bottom`,
        }}
      />
      <Film strength={0.15} />
    </div>
  );
}
