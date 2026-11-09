/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo } from "./shared";
import { caps, capsEm, dmiEm, fitGraphic, INK, LeagueGraphic, PAPER, SOFT, totwTitle, totwTone } from "./totwkit";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Stack: the official league graphic as the hero, hung large and centred on a pale wall like a framed
 * print; the player cutout stands in front of one of its lower corners — the one away from his highlighted
 * circle, so the ring always stays clear. A small italic title above, his name and club below.
 */
export function Totwstack({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.3 : 1;
  const ts = params.textScale ?? 1;
  const tone = totwTone(data);
  const accent = vivid(params.accent);
  const hl = content.insetHighlight;
  const M = story ? 64 : 60;

  // The player covers a lower corner: lower-left unless his circle sits there (then lower-right).
  // With no highlight, params.side picks.
  const right = hl ? hl.x < 50 : params.side === "right";
  const near = right ? "right" : "left"; // the player's side
  const far = right ? "left" : "right"; // the name's side
  const X = (x: number) => (right ? CANVAS_W - x : x); // player-left coordinates → canvas

  /* ---- title ---- */
  const title = totwTitle(content.kicker);
  const titleSize = Math.min((story ? 76 : 54) * ts, (CANVAS_W - 2 * M) / Math.max(1, dmiEm(title)));
  const titleTop = (story ? STORY_TOP : 54) + (params.textY ?? 0);
  const sub = (content.subline || "").trim();
  const subSize = Math.max(11, Math.min(14 * S, (CANVAS_W - 2 * M) / Math.max(1, capsEm(sub, 0.26))));
  const subTop = titleTop + titleSize * 1.18 + 4 * S;

  /* ---- foot: name, club, logo (bottom-up) ---- */
  const first = content.firstName || "";
  const last = content.lastName || "";
  const name = [first, last].filter(Boolean).join(" ");
  const club = data.club?.name ?? "";
  const logoBottom = (story ? H - STORY_BOTTOM : 50) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - (story ? 88 : 52);
  const clubSize = Math.max(10, Math.min(14 * S, 420 * S / Math.max(1, capsEm(club, 0.22))));

  /* ---- the graphic ---- */
  const Ty = subTop + subSize * 1.2 + (story ? 60 : 38);
  const nameRoom = story ? 560 : 440; // the foot column beside the player
  const nameSize = Math.min((story ? 62 : 46) * ts, nameRoom / Math.max(1, dmiEm(name)));
  const clubTop = logoTop - (story ? 64 : 40) - clubSize * 1.2;
  const nameTop = clubTop - 10 * S - nameSize * 1.08;
  const g = fitGraphic(story ? 780 : 640, nameTop - (story ? 44 : 30) - Ty);
  const gL = (CANVAS_W - g.w) / 2; // assumed edges, only for placing the player
  const ring = Math.round(g.w * 0.19);

  /* ---- the player, in front of the lower corner ---- */
  const faceTop = Ty + g.h * (story ? 0.53 : 0.56);
  const box = placeByFace(data, X(gL + g.w * 0.01), faceTop, story ? { chest: 190, waist: 160, knees: 136, full: 118 } : { chest: 150, waist: 120, knees: 104, full: 90 });
  const foot = gL + (story ? 4 : 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER, color: INK }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(65% 50% at 50% 42%, rgba(255,255,255,.65), transparent 78%)" }} />
      <div style={{ position: "absolute", inset: 0, background: tone, opacity: 0.045, mixBlendMode: "color" }} />

      {/* Title and round, centred. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: titleSize, lineHeight: 1.05, whiteSpace: "nowrap", color: INK }}>{title}</div>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: subTop, textAlign: "center", paddingLeft: "0.26em", ...caps(subSize, SOFT, 0.26) }}>{sub}</div>}

      {/* The graphic, centred, hung like a print. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: Ty, display: "flex", justifyContent: "center" }}>
        <LeagueGraphic
          data={data}
          maxW={g.w}
          maxH={g.h}
          ring={ring}
          accent={accent}
          style={{ boxShadow: "0 34px 70px -24px rgba(40,30,20,.42), 0 2px 8px rgba(40,30,20,.14)" }}
        />
      </div>

      {/* A soft shadow where he stands against the print, then the player. */}
      {data.photoUrl && (
        <>
          <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: faceTop + 120 * S, width: box.width * 0.7, height: H, borderRadius: "40%", background: "rgba(30,24,18,.18)", filter: `blur(${34 * S}px)` }} />
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03) saturate(1.02)", ...cutMask(data.cut) }}
          />
        </>
      )}

      {/* Foot: name and club on the free side, the logo under them. */}
      <div style={{ position: "absolute", [far]: foot, top: nameTop, fontFamily: DMSERIF, fontStyle: "italic", fontSize: nameSize, lineHeight: 1.08, whiteSpace: "nowrap", color: INK }}>{name}</div>
      {club && <div style={{ position: "absolute", [far]: foot + 2, top: clubTop, ...caps(clubSize, SOFT, 0.22) }}>{club}</div>}
      <AgencyLogo
        data={data}
        onLight
        height={story ? 26 : 20}
        style={{ position: "absolute", [far]: foot, bottom: logoBottom, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: `${far} bottom` }}
      />
      <Film strength={0.15} />
    </div>
  );
}
