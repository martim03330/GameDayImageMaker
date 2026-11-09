/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { cardHeight, cardLines, cardMetrics, datesOf, PlayerCard } from "./nowplaying";
import { clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace, sceneOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal now playing: the goal as the track that just finished. A dark ground — his own photo melted into
 * deep, club-graded fields — with the celebrating player big and sharp under it. At the top one dark,
 * frosted player card: the crest as artwork, "Goal", his name as the artist, "SC Vianense SAD v Leixões"
 * under it (never the score), the progress bar run all the way to the end and a replay arrow between prev
 * and next. The NEYOD mark at the foot. Flips with params.side.
 */
export function Goalnowplaying({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.3 : 0.94) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";
  const sideX = playerLeft ? -1 : params.side === "right" ? 1 : 0;

  /* ---- the card, at the top ---- */
  const M = story ? 60 : 64;
  const cw = CANVAS_W - 2 * M;
  const title = sentenceCase(content.kicker || "Goal");
  const name = [content.firstName, content.lastName].map((s) => (s ?? "").trim()).filter(Boolean).join(" ");
  const fixture = teamsOf(data).join(" v ");
  const dates = datesOf(content.date);
  const cm = cardMetrics(k);
  const ch = cardHeight(k, cardLines(name, fixture, k, cw - 2 * cm.pad - cm.art - cm.artGap), Boolean(dates.short));
  const cy = (story ? STORY_TOP : 60) + (params.textY ?? 0);

  /* ---- the logo at the foot ---- */
  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);

  /* ---- the player: big, head clear under the card ---- */
  const faceX = 540 + sideX * (story ? 90 : 110);
  const sizes = story ? { chest: 300, waist: 252, knees: 204, full: 164 } : { chest: 236, waist: 188, knees: 148, full: 116 };
  const probe = placeByFace(data, faceX, 600, sizes);
  let box = placeByFace(data, faceX, cy + ch + (story ? 90 : 60) + probe.faceH * 0.55, sizes);
  // He melts away above the logo, so he needn't reach the bottom edge: keep a close-up from being blown up.
  {
    let want = ((sizes as Record<string, number>)[params.framing ?? "waist"] ?? sizes.waist) * (params.playerScale ?? 1);
    if (data.facePx > 0) want = Math.min(want, Math.max(96, data.facePx * 1.2));
    const fc = data.face ?? [0.38, 0.08, 0.24, 0.12];
    if (box.faceH > want * 1.3) {
      const r = (want * 1.3) / box.faceH;
      const ax = box.left + (fc[0] + fc[2] / 2) * box.width;
      const ay = box.top + fc[1] * box.height;
      box = { left: ax - (ax - box.left) * r, top: ay - (ay - box.top) * r, width: box.width * r, height: box.height * r, faceH: want * 1.3 };
    }
  }
  // Arms flung out to one side: centre the figure a little rather than the face.
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean * 0.6 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;
  // Raised arms run up behind the card; they fade out just above it rather than being cut by its edge.
  const fadeTop = cy + ch * 0.55 - box.top;
  // ...and he melts into the dark just above the logo, so the mark sits on clean ground.
  const logoTop = H - logoBottom - (story ? 88 : 52) * logoScale;
  const fadeEnd = Math.min(box.height - 4, Math.max(chin + box.faceH * 2.2, logoTop + 10) - box.top);
  const fadeIn = `linear-gradient(to bottom, transparent ${fadeTop}px, #000 ${fadeTop + (story ? 200 : 150)}px, #000 ${Math.max(fadeTop + 220, fadeEnd - (story ? 420 : 300))}px, transparent ${fadeEnd}px)`;

  const back = data.bgPhotoUrl ?? sceneOf(data);
  const deep = shade(club, -0.72);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: "#ffffff" }}>
      {/* The ground: his photo melted into soft, deep fields graded towards the club colour. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -180, top: -180, width: CANVAS_W + 360, height: H + 360, maxWidth: "none", objectFit: "cover", filter: "blur(70px) saturate(.7) brightness(.62)", opacity: 0.85 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(club, -0.35)}, ${shade(club, -0.8)})`, mixBlendMode: "multiply", opacity: 0.75 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(52% 32% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.2)}55, transparent 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 640 : 420, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.42))" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fadeIn, maskImage: fadeIn }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 300, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.4))" }} />

      <PlayerCard x={M} y={cy} w={cw} k={k} art={f.ourCrest} tone={club} title={title} artist={name} sub={fixture} progress={1} start={dates.short} end="" center="replay" dark />

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
