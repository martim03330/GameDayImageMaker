/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { Banner, bannerHeight, bannerMetrics, bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal notify: the goal arrives as a phone notification. A dark ground (his own photo melted away and
 * graded down into the club's deepest tone); at the very top one dark frosted iOS banner — the crest as
 * the app icon, "Goal", "Moisés Conceição scores · SC Vianense SAD v Leixões", the competition under it,
 * "now" opposite; below it the celebrating player, big and sharp, rising up towards it. No score.
 */
export function Goalnotify({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.3 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the banner at the top ---- */
  const M = story ? 48 : 52;
  const bw = CANVAS_W - 2 * M;
  const m = bannerMetrics(k);
  const textW = bw - 2 * m.padX - m.icon - m.gap;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teamsOf(data).join(" v ");
  const scores = name ? `${name} scores` : "";
  const one = [scores, fixture].filter(Boolean).join(" · ");
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ");
  // One line when it fits at ≥ 84% of the body size; else the scorer and the fixture on their own lines.
  const body = (bodyW(one, m.body * 0.84) <= textW || !scores || !fixture ? [one] : [scores, fixture]).filter(Boolean);
  if (comp && body.length < 2) body.push(comp);
  const by = (story ? STORY_TOP : 56) + (params.textY ?? 0);
  const bh = bannerHeight(k, body.length);

  /* ---- the player, big, head clear of the banner ---- */
  const sizes = story ? { chest: 340, waist: 280, knees: 220, full: 168 } : { chest: 236, waist: 190, knees: 148, full: 116 };
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const probe = placeByFace(data, faceX, 400, sizes);
  let box = placeByFace(data, faceX, by + bh + (story ? 44 : 40) + probe.faceH * 0.8, sizes);
  // Arms flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;

  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  // His legs melt into the ground around the logo.
  const logoTop = H - logoBottom - (story ? 88 : 52) * logoScale;
  const fadeEnd = logoTop + (story ? 60 : 40) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 320 : 230)}px, transparent ${fadeEnd}px)`;
  const back = data.bgPhotoUrl;
  const ground = shade(club, -0.78);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: his photo melted to soft fields, graded down into the club's darkest tone. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -180, top: -180, width: CANVAS_W + 360, height: H + 360, maxWidth: "none", objectFit: "cover", filter: "blur(70px) saturate(.65) brightness(.6)", opacity: 0.6 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.4 }} />
      {/* A soft light behind him, as if the screen lit up. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 38% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.1)}55, transparent 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 700 : 460, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.45))" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 420 : 300, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.4))" }} />

      <Banner x={M} y={by} w={bw} k={k} icon={f.ourCrest} title={sentenceCase(content.kicker || "Goal")} body={body} dark />

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
