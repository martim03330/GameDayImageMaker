/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Words into lines no wider than `max` at `size` (Inter 400). */
function wrapW(text: string, size: number, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${w}` : w;
    if (!cur || bodyW(next, size) <= max) cur = next;
    else out.push(cur), (cur = w);
  }
  if (cur) out.push(cur);
  return out;
}

type Bubble = { text: string; out: boolean };

/**
 * Goal chat: the goal told as a dark-mode message thread. A near-black ground with a soft club-coloured
 * light; stacked at the top, three rounded bubbles — a grey incoming "Did he score?", then in the club
 * colour "Goal. Moisés Conceição." and "SC Vianense SAD v Leixões" (home first, exact names, no score),
 * a quiet "Delivered" under them. Below, the celebrating player big and sharp, melting into the ground
 * above the NEYOD mark. No app branding.
 */
export function Goalchat({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.36 : 1) * (params.textScale ?? 1);
  const club = clubTone(data);

  /* ---- the thread ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const kick = sentenceCase(content.kicker || "Goal");
  const teams = teamsOf(data);
  const bubbles: Bubble[] = [
    { text: "Did he score?", out: false },
    { text: name ? `${kick}. ${name}.` : `${kick}.`, out: true },
    ...(teams.length ? [{ text: teams.join(" v "), out: true }] : []),
  ];
  const M = story ? 52 : 56;
  const size = 34 * k;
  const padY = 19 * k;
  const padX = 30 * k;
  const maxInner = CANVAS_W * 0.72 - 2 * padX;
  const laid = bubbles.map((b) => {
    // Shrink a little before wrapping; wrap only when it still doesn't fit.
    const s = Math.max(size * 0.86, Math.min(size, maxInner / Math.max(1, bodyW(b.text, 1))));
    const lines = wrapW(b.text, s, maxInner);
    const w = Math.max(...lines.map((l) => bodyW(l, s))) + 2 * padX + 2;
    const h = lines.length * s * 1.28 + 2 * padY;
    return { ...b, s, lines, w, h };
  });
  const top = (story ? STORY_TOP : 60) + (params.textY ?? 0);
  const label = 19 * k;
  let y = top + label * 1.2 + 22 * k;
  const placed = laid.map((b, i) => {
    if (i > 0) y += laid[i - 1].out === b.out ? 8 * k : 18 * k;
    const at = { ...b, y, last: i === laid.length - 1 || laid[i + 1].out !== b.out };
    y += b.h;
    return at;
  });
  const deliveredTop = y + 10 * k;
  const blockBottom = deliveredTop + 17 * k * 1.2;

  /* ---- the player, big, head clear of the thread ---- */
  const sizes = story ? { chest: 330, waist: 270, knees: 214, full: 166 } : { chest: 236, waist: 190, knees: 148, full: 116 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  const probe = placeByFace(data, faceX, 400, sizes);
  let box = placeByFace(data, faceX, blockBottom + (story ? 50 : 36) + probe.faceH * 0.35, sizes);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const chin = box.top + face[1] * box.height + box.faceH;

  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 52) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - (story ? 88 : 52) * logoScale;
  const fadeEnd = logoTop + (story ? 16 : 10) - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 260)}px, transparent ${fadeEnd}px)`;
  const ground = shade(club, -0.86);
  const back = data.bgPhotoUrl;
  const r = 38 * k;
  const tail = 10 * k;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, fontFamily: SANS }}>
      {back && (
        <img
          src={back}
          alt=""
          style={{ position: "absolute", left: -180, top: -180, width: CANVAS_W + 360, height: H + 360, maxWidth: "none", objectFit: "cover", filter: "blur(80px) saturate(.5) brightness(.45)", opacity: 0.45 }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: club, mixBlendMode: "multiply", opacity: 0.35 }} />
      {/* A soft club-coloured light behind him, as if from the screen. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 36% at ${(faceCx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${shade(club, 0.05)}66, transparent 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: blockBottom + 120, background: "linear-gradient(to bottom, rgba(0,0,0,.35), transparent)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 420 : 300, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.4))" }} />

      {/* The thread. */}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontSize: label, fontWeight: 500, lineHeight: 1.2, color: "rgba(235,235,245,.5)", letterSpacing: "0.01em" }}>Today</div>
      {placed.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.y,
            left: b.out ? undefined : M,
            right: b.out ? M : undefined,
            width: b.w,
            height: b.h,
            padding: `${padY}px ${padX}px`,
            boxSizing: "border-box",
            borderRadius: b.last ? (b.out ? `${r}px ${r}px ${tail}px ${r}px` : `${r}px ${r}px ${r}px ${tail}px`) : r,
            background: b.out ? `linear-gradient(to bottom, ${shade(club, 0.1)}, ${club})` : "#2a2a2e",
            color: "#ffffff",
            fontSize: b.s,
            lineHeight: 1.28,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          }}
        >
          {b.lines.map((l, j) => (
            <div key={j} style={{ whiteSpace: "nowrap" }}>
              {l}
            </div>
          ))}
        </div>
      ))}
      <div style={{ position: "absolute", right: M + 8 * k, top: deliveredTop, fontSize: 17 * k, fontWeight: 500, lineHeight: 1.2, color: "rgba(235,235,245,.45)" }}>Delivered</div>

      <AgencyLogo data={data} height={story ? 26 : 22} style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
