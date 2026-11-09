/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { shade, vivid } from "@/lib/color";
import { ARCHIVO, cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { competitionOf, crestsOf, placeByFace, roundOf, sceneOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const TIGHT = "0 2px 14px rgba(0,0,0,.55)";

/** "16:00" → "4:00PM" (the way the reference writes kick-off). */
export function twelveHour(t: string | undefined): string {
  const m = (t ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (!m) return (t ?? "").toUpperCase();
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]}${h < 12 ? "AM" : "PM"}`;
}

/** Big faces for an action frame: he fills the side of the post. */
const FACE_H: Record<string, number> = { chest: 250, waist: 200, knees: 160, full: 128 };

/** Crests as white marks: the darks keep a little grey so their drawing still reads. */
const WHITE_MARK = "grayscale(1) contrast(1.35) brightness(2.4) drop-shadow(0 4px 14px rgba(0,0,0,.35))";

/**
 * Club World Cup "ROUND OF 16" poster: one fast action frame, as if shot with a slow shutter while panning —
 * his own photo streaked into horizontal motion blur as the whole background, the cutout on top with a
 * directional ghost trail and blurred limbs (the face kept sharp), a cinematic grade and vignette; in the
 * middle a small serif caps line, the two crests as white marks (the score between them after the game)
 * and the teams in bold caps; the date line at the top and the agency mark at the foot.
 */
export function Motion({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 41;
  const r = rng(seed);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const right = params.side ? params.side !== "left" : r() < 0.6;
  const dir = right ? 1 : -1; // he runs towards the side he stands on; the trail streams behind him
  const id = `mo-${seed % 997}`;
  // Native story (1080×1920): the same frame drawn tall — his photo smeared over the whole height, so there is
  // no seam where a post would end; he and the block sit 285px lower (the post's 1350 centred in 1920).
  const H = data.canvasH ?? CANVAS_H;
  const story = H > CANVAS_H;
  const dy = story ? (H - CANVAS_H) / 2 : 0;

  // ---- the player ----
  const faceX = 540 + dir * (210 + r() * 50);
  const faceTop = 150 + r() * 50 + dy;
  const fig = placeByFace(data, faceX, faceTop, FACE_H);
  const box = { position: "absolute" as const, left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none" };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  // Sharp region around head and torso (in the cutout's own box, %).
  const fcx = (face[0] + face[2] / 2) * 100;
  const fcy = (face[1] + face[3] / 2) * 100;
  const sharpMask = `radial-gradient(ellipse ${face[2] * 190}% ${face[3] * 330}% at ${fcx}% ${fcy + face[3] * 110}%, #000 45%, transparent 100%)`;

  // ---- background: his own photo (or the ground) smeared by the pan ----
  const bg = data.bgPhotoUrl ?? sceneOf(data);

  // ---- texts ----
  const score = postType !== "matchday" ? scoreOf(data) : "";
  const crests = crestsOf(data);
  const when = [content.date, twelveHour(content.time)].filter(Boolean).join(" | ").toUpperCase();
  const round = roundOf(data);
  const topLine = postType === "matchday" ? when || round : postType === "result" ? ["FULL TIME", content.date || competitionOf(data)].filter(Boolean).join(" | ").toUpperCase() : round;
  const serifLine = (postType === "matchday" ? round.split("·").map((s) => s.trim()).pop() || competitionOf(data) || content.kicker : content.kicker).toUpperCase();
  const teams = [content.homeTeam, content.awayTeam].filter(Boolean).join(" X ").toUpperCase();
  const name = postType === "matchday" ? "" : [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const ts = params.textScale ?? 1;
  const serifSize = Math.min(68, 760 / Math.max(1, serifLine.length * 0.72)) * ts;
  const teamSize = Math.min(30, 760 / Math.max(1, teams.length * 0.68)) * ts;
  const crestSize = score ? 150 : 170;

  // Block in the middle, pushed below the face when a tight framing brings it down.
  const faceBottom = fig.top + (face[1] + face[3]) * fig.height;
  const blockTop = Math.max(500 + dy, faceBottom + 60);

  const cap: CSSProperties = { fontFamily: ARCHIVO, fontWeight: 600, color: WHITE, textShadow: TIGHT, whiteSpace: "nowrap", textTransform: "uppercase", lineHeight: 1 };
  const trail = [
    { dx: -dir * 230, o: 0.26, b: 60 },
    { dx: -dir * 110, o: 0.45, b: 32 },
  ];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: shade(accent, -0.82), color: WHITE }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id={`${id}-pan`} x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation={story ? "190 0" : "150 0"} edgeMode="duplicate" />
          </filter>
          {trail.map((t, i) => (
            <filter key={i} id={`${id}-t${i}`} x="-60%" y="-5%" width="220%" height="110%">
              <feGaussianBlur stdDeviation={`${t.b} 1.5`} />
            </filter>
          ))}
          <filter id={`${id}-limbs`} x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation="9 0.6" />
          </filter>
        </defs>
      </svg>

      {bg && (
        <img
          src={bg}
          alt=""
          style={{ position: "absolute", left: -200, top: -60, width: CANVAS_W + 400, height: H + 120, maxWidth: "none", objectFit: "cover", filter: `url(#${id}-pan) saturate(1.05) brightness(.8) contrast(1.1)` }}
        />
      )}
      {/* Cinematic grade: cool shadows, warm light, darker top and bottom for the type. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,170,90,.18), transparent 45%, rgba(20,60,90,.35))", mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.5), rgba(0,0,0,.12) 20%, rgba(0,0,0,.1) 62%, rgba(0,0,0,.55))" }} />

      {data.photoUrl && (
        <>
          {trail.map((t, i) => (
            <img key={i} src={data.photoUrl!} alt="" style={{ ...box, left: fig.left + t.dx, opacity: t.o, filter: `url(#${id}-t${i}) brightness(1.05)`, ...cutMask(data.cut) }} />
          ))}
          <img src={data.photoUrl} alt="" style={{ ...box, filter: `url(#${id}-limbs) contrast(1.05)`, ...cutMask(data.cut) }} />
          <div style={{ ...box, WebkitMaskImage: sharpMask, maskImage: sharpMask }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", display: "block", filter: "contrast(1.06) saturate(1.02)", ...cutMask(data.cut) }} />
          </div>
        </>
      )}
      {/* The same grade over him, and a vignette. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,170,90,.14), transparent 45%, rgba(20,60,90,.28))", mixBlendMode: "soft-light", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
      {/* Soft shade behind the middle block so it reads over a white kit. */}
      <div style={{ position: "absolute", left: 140, right: 140, top: blockTop - 60, height: 460, background: "radial-gradient(closest-side, rgba(0,0,0,.32), transparent)", pointerEvents: "none" }} />

      {topLine && (
        <div style={{ ...cap, position: "absolute", left: 0, right: 0, top: story ? STORY_TOP + 120 : 58, textAlign: "center", fontSize: Math.min(28, 900 / Math.max(1, topLine.length * 0.66)), letterSpacing: "0.01em" }}>{topLine}</div>
      )}

      <div style={{ position: "absolute", left: 60, right: 60, top: blockTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {serifLine && <div style={{ fontFamily: DMSERIF, fontSize: serifSize, lineHeight: 1, letterSpacing: "0.01em", color: WHITE, textShadow: TIGHT, whiteSpace: "nowrap" }}>{serifLine}</div>}
        {(crests.length > 0 || score) && (
          <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: score ? 38 : 30 }}>
            {crests[0] && <img src={crests[0]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: WHITE_MARK }} />}
            {score && <div style={{ fontFamily: DMSERIF, fontSize: score.length > 4 ? 96 : 120, lineHeight: 1, color: WHITE, textShadow: TIGHT, whiteSpace: "nowrap" }}>{score}</div>}
            {crests[1] && <img src={crests[1]} alt="" style={{ width: crestSize, height: crestSize, objectFit: "contain", filter: WHITE_MARK }} />}
          </div>
        )}
        {teams && <div style={{ ...cap, marginTop: 34, fontSize: teamSize, letterSpacing: "0.02em" }}>{teams}</div>}
        {name && <div style={{ ...cap, marginTop: 14, fontWeight: 400, fontSize: Math.min(22, 700 / Math.max(1, name.length * 0.7)), letterSpacing: "0.18em", opacity: 0.85 }}>{name}</div>}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: story ? 240 : 52, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={40} style={{ color: WHITE, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} />
      </div>
      <Film strength={0.8} />
    </div>
  );
}
