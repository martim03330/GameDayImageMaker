/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { barMetrics, fitLine, SearchBar } from "./search";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal search: the goal typed into a search bar. A dark ground (his own photo melted away and graded down
 * into the club's deepest tone); at the top one white pill — a magnifier, "Moisés Conceição goal" and a
 * thin caret in the club colour — with two quiet result lines under it: "SC Vianense SAD v Leixões" and
 * the competition. Below, the celebrating player, big and sharp, rising towards it. No score.
 */
export function Goalsearch({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);
  const f = matchFacts(data);
  const M = story ? 56 : 60;

  /* ---- the bar and its results at the top ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const what = (content.kicker || "Goal").replace(/’/g, "'").trim().toLowerCase();
  const query = [name, what].filter(Boolean).join(" ");
  const fixture = teamsOf(data).join(" v ");
  const comp = [titleCase(f.comp), titleCase(f.round)].filter(Boolean).join(" · ");

  const bw = CANVAS_W - 2 * M;
  const bm = barMetrics(k);
  const by = (story ? STORY_TOP : 64) + (params.textY ?? 0);
  const resX = M + bm.padL;
  const resW = CANVAS_W - resX - M;
  const lines = [
    { t: fixture, s: fitLine(fixture, 30 * k, resW), w: 500, c: "#ffffff" },
    { t: comp, s: fitLine(comp, 24 * k, resW), w: 400, c: "rgba(235,235,245,.6)" },
  ].filter((l) => l.t);
  const resTop = by + bm.h + (story ? 36 : 28);
  const resH = lines.reduce((a, l) => a + l.s * 1.42, 0);
  const resBottom = resTop + resH;

  /* ---- the player, big, the whole head clear of the results ---- */
  const sizes = story ? { chest: 350, waist: 290, knees: 228, full: 172 } : { chest: 250, waist: 204, knees: 160, full: 130 };
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 50 : 0);
  const probe = placeByFace(data, faceX, 500, sizes);
  let box = placeByFace(data, faceX, resBottom + (story ? 60 : 44) + probe.faceH * 0.8, sizes);
  // Arms flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;

  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - (story ? 88 : 52) * logoScale;
  // His legs melt into the ground around the logo.
  const fadeEnd = logoTop + (story ? 50 : 34) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 340 : 240)}px, transparent ${fadeEnd}px)`;
  const back = data.bgPhotoUrl;
  const ground = shade(club, -0.8);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: his photo melted to soft fields, graded down into the club's darkest tone. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -180, top: -180, width: CANVAS_W + 360, height: H + 360, maxWidth: "none", objectFit: "cover", filter: "blur(80px) saturate(.6) brightness(.5)", opacity: 0.55 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.45 }} />
      {/* The light of the screen falling on him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(58% 36% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.15)}66, transparent 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 520 : 380, background: "linear-gradient(to bottom, rgba(0,0,0,.35), transparent)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 440 : 300, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.42))" }} />

      <SearchBar x={M} y={by} w={bw} k={k} query={query} caret={club} dark />

      <div style={{ position: "absolute", left: resX, top: resTop, fontFamily: SANS, letterSpacing: "-0.01em", textShadow: "0 1px 10px rgba(0,0,0,.35)" }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontWeight: l.w, fontSize: l.s, lineHeight: 1.42, color: l.c, whiteSpace: "nowrap" }}>
            {l.t}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
