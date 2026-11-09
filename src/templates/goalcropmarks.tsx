/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { ProofMarks, type Trim } from "./cropmarks";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { mix } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SHEET = "#121315";
const WHITE = "#ffffff";

/**
 * Goal cropmarks: the goal as a printer's proof, in reverse. A near-black sheet with white crop marks,
 * registration targets, a CMYK strip and the slug ("GOAL — MOISÉS CONCEIÇÃO — SC VIANENSE SAD V LEIXÕES");
 * inside the trim a deep club-tone page with the celebrating player big in the middle — his raised fist
 * may break out over the top edge — and at its foot "Goal", his name and the fixture, over the NEYOD mark.
 * Never a score.
 */
export function Goalcropmarks({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const teams = teamsOf(data);

  /* ---- sheet and trim ---- */
  const trim: Trim = story ? { x: 64, y: 112, w: CANVAS_W - 128, h: H - 224 } : { x: 64, y: 64, w: CANVAS_W - 128, h: H - 128 };
  const tBottom = trim.y + trim.h;
  const cx = CANVAS_W / 2;
  const innerW = trim.w - (story ? 120 : 112);

  /* ---- the logo, centred at the foot of the trim ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : H - tBottom + 44) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* ---- type, stacked up from ~64px over the logo ---- */
  const kicker = sentenceCase(content.kicker || "Goal");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const fixture = teams.length === 2 ? `${teams[0]} v ${teams[1]}` : teams[0] ?? "";
  const tSize = Math.min(150 * k, innerW / Math.max(1, titleW(kicker, 1) * 0.96));
  const nSize = Math.min(44 * k, innerW / Math.max(1, bodyW(name, 1) * 1.05));
  const fSize = Math.min(20 * k, innerW / Math.max(1, bodyW(fixture.toUpperCase(), 1) * 1.1 + fixture.length * 0.22));
  let y = logoTop - (story ? 66 : 60) + ty;
  const fixTop = fixture ? (y -= fSize) : y;
  if (fixture) y -= 24 * k;
  const nameTop = name ? (y -= nSize) : y;
  if (name) y -= 22 * k;
  const titleTop = (y -= tSize * 0.98);

  /* ---- the player, centred, face high; the fist may cross the top trim ---- */
  const sizes = story ? { chest: 310, waist: 246, knees: 192, full: 152 } : { chest: 230, waist: 182, knees: 142, full: 112 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const probe = placeByFace(data, cx, 300, sizes);
  const faceTop = Math.max(story ? STORY_TOP + 150 : trim.y + 140, trim.y + probe.faceH * 0.8 + 30);
  let box = placeByFace(data, cx + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0), faceTop, sizes);
  // A fist raised to one side: centre the figure a little rather than the face.
  const lean = Math.max(-90, Math.min(90, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const chin = box.top + face[1] * box.height + box.faceH;
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;

  const page = mix(shade(club, -0.42), "#16171a", 0.22);
  // The figure is cut at the trim's sides and foot, open above (where a fist may reach into the margin).
  const clip = `inset(0px ${CANVAS_W - trim.x - trim.w}px ${H - tBottom}px ${trim.x}px)`;
  const slug = [content.kicker || "Goal", name, teams.length === 2 ? `${teams[0]} v ${teams[1]}` : teams[0]].filter(Boolean).join(" — ").toUpperCase();
  const text = { position: "absolute" as const, left: trim.x, width: trim.w, textAlign: "center" as const, fontFamily: SANS, whiteSpace: "nowrap" as const, lineHeight: 1, color: WHITE };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: SHEET }}>
      {/* The trimmed page: deep club tone, a soft light behind him, darker at the foot for the type. */}
      <div style={{ position: "absolute", left: trim.x, top: trim.y, width: trim.w, height: trim.h, background: page, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 42% at ${((faceCx - trim.x) / trim.w) * 100}% ${((chin - trim.y) / trim.h) * 100}%, ${shade(club, 0.05)}, transparent 78%)`, opacity: 0.75 }} />
        <div style={{ position: "absolute", left: faceCx - trim.x - box.faceH * 2, top: chin - trim.y + box.faceH * 0.5, width: box.faceH * 4, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: `blur(${story ? 70 : 54}px)` }} />
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: clip }}>
        {data.photoUrl && (
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        )}
        <div style={{ position: "absolute", left: trim.x, width: trim.w, top: titleTop - (story ? 360 : 260), height: tBottom - titleTop + (story ? 360 : 260), background: "linear-gradient(to bottom, transparent, rgba(8,10,14,.62) 55%, rgba(8,10,14,.78))" }} />
      </div>

      <div style={{ ...text, top: titleTop, fontWeight: 600, fontSize: tSize, letterSpacing: "-0.04em" }}>{kicker}</div>
      {name && <div style={{ ...text, top: nameTop, fontWeight: 500, fontSize: nSize, letterSpacing: "-0.01em" }}>{name}</div>}
      {fixture && <div style={{ ...text, top: fixTop, fontWeight: 500, fontSize: fSize, letterSpacing: "0.22em", paddingLeft: "0.22em", color: "rgba(255,255,255,.66)" }}>{fixture.toUpperCase()}</div>}

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: cx, bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />

      <ProofMarks
        trim={trim}
        H={H}
        ink="rgba(255,255,255,.9)"
        slug={slug}
        slugInk="rgba(255,255,255,.62)"
        story={story}
        targets={story ? [{ x: CANVAS_W / 2, y: trim.y / 2 }, { x: CANVAS_W / 2, y: tBottom + (H - tBottom) / 2 }] : [{ x: trim.x / 2, y: H / 2 }, { x: CANVAS_W - trim.x / 2, y: H / 2 }]}
        stripAt={story ? { x: trim.x + trim.w - 9 * 20, y: trim.y / 2 - 10 } : { x: CANVAS_W / 2 - 4.5 * 16, y: trim.y / 2 - 8 }}
        slugAt={story ? "left" : "bottom"}
      />
      <Film strength={0.14} />
    </div>
  );
}
