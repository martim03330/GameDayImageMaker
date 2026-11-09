/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { hash, Paper, paperHeight, type Item } from "./receipt";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** "GOAL" → 1 x GOAL, "BRACE" → 2 x GOAL, "HAT-TRICK" → 3 x GOAL, anything else → 1 x <it>. */
function lineItem(kicker: string): string {
  const k = kicker.toUpperCase().trim();
  if (/BRACE/.test(k)) return "2 x GOAL";
  if (/HAT.?TRICK/.test(k)) return "3 x GOAL";
  return `1 x ${k || "GOAL"}`;
}

/**
 * Goal receipt: the goal, printed and handed over. A dark ground (his own photo melted away into the
 * club's deepest tone); the celebrating player big and sharp; low on one side, tilted a few degrees over
 * his body, a short thermal strip — grey crest, the kicker, "1 x GOAL", SCORER and MATCH (home first,
 * no score) with dotted leaders, "THANK YOU FOR THE GOAL" and a barcode. The NEYOD mark under the strip.
 */
export function Goalreceipt({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = clubTone(data);
  const f = matchFacts(data);
  const teams = teamsOf(data);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const left = params.side === "left"; // player to the left, strip low on the right

  const items: Item[] = [
    { t: "crest", url: f.ourCrest },
    { t: "title", text: content.kicker || "Goal" },
    ...(f.comp ? [{ t: "center", text: f.comp, dim: true } as Item] : []),
    { t: "rule" },
    { t: "left", text: lineItem(content.kicker), bold: true },
    ...(name ? [{ t: "row", label: "Scorer", value: name } as Item] : []),
    ...(teams.length ? [{ t: "row", label: "Match", value: teams.join("\nv ") } as Item] : []),
    ...(content.date ? [{ t: "row", label: "Date", value: [f.day, f.mon].filter(Boolean).join(" ") } as Item] : []),
    { t: "rule" },
    { t: "space" },
    { t: "center", text: "Thank you for the goal" },
    { t: "barcode", seed: hash((content.gameId ?? "") + name) },
  ];
  const ts = params.textScale ?? 1;
  const w = Math.round((story ? 540 : 420) * ts);
  const h = paperHeight(items, w);
  const tilt = left ? 4 : -4;

  /* ---- the strip low on one side, the logo under it ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  // Rotation lifts one lower corner by ~w·sin(4°)/2: count it in so the strip never sinks into the logo.
  const lift = (w / 2) * Math.sin((4 * Math.PI) / 180);
  const py = H - logoBottom - logoH - (story ? 66 : 58) - h - lift + (params.textY ?? 0);
  const M = story ? 70 : 64;
  const px = left ? CANVAS_W - M - w : M;
  const colCx = px + w / 2;

  /* ---- the player, big, the face above the strip ---- */
  const sizes = story ? { chest: 310, waist: 250, knees: 200, full: 160 } : { chest: 250, waist: 200, knees: 156, full: 124 };
  const faceX = 540 + (left ? -90 : 90);
  let box = placeByFace(data, faceX, story ? STORY_TOP + 150 : 120, sizes);
  // Arms flung to one side: centre the figure a little rather than the face.
  const lean = Math.max(-110, Math.min(110, (CANVAS_W + (left ? -180 : 180) - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;
  // His legs melt into the ground around the logo, so the mark always sits on the dark ground.
  const logoTop = H - logoBottom - logoH;
  const fadeEnd = logoTop + (story ? 50 : 36) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 260)}px, transparent ${fadeEnd}px)`;
  const back = data.bgPhotoUrl;
  const ground = shade(club, -0.78);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* The ground: his photo melted to soft fields, graded down into the club's darkest tone. */}
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -180, top: -180, width: CANVAS_W + 360, height: H + 360, maxWidth: "none", objectFit: "cover", filter: "blur(70px) saturate(.6) brightness(.55)", opacity: 0.55 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.4 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 36% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.15)}66, transparent 75%)` }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 640 : 440, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.5))" }} />

      <Paper items={items} x={px} y={py} w={w} rotate={tilt} shadow="rgba(0,0,0,.55)" />

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: colCx, bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.16} />
    </div>
  );
}
