/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { clubTone, sentenceCase, teamsOf, titleW } from "./notify";
import { placeByFace } from "./outline";
import { Checkbox, capsW, Note, NOTE_GREY, NOTE_INK, noteColour, noteTilt, w500 } from "./postit";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { mix, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Goal post-it: the goal sibling of `postit`. On a deep, calm club-tone ground, the same single sticky note
 * is stuck up near the top on one side — "Goal" with its box ticked by a drawn check, then his name and the
 * fixture (home first, names exactly as stored, never a score), the competition in small caps at its foot.
 * The celebrating player fills the other side and the lower half, sharp and in natural colour.
 */
export function Goalpostit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;
  const club = clubTone(data);
  const f = matchFacts(data);
  const playerLeft = params.side === "left";

  /* ---- the note, high on the text side ---- */
  const S = story ? 640 : 480;
  const tilt = -noteTilt(data);
  const slack = (S * Math.sin((Math.abs(tilt) * Math.PI) / 180)) / 2;
  const nx = playerLeft ? CANVAS_W - 64 - S : 64;
  const ny = (story ? STORY_TOP : 84) + slack + (params.textY ?? 0);
  const colour = noteColour(data);

  /* ---- what's written on it ---- */
  const pad = S * 0.1;
  const title = sentenceCase(content.kicker || "Goal");
  const box = S * 0.088;
  const tIndent = box + S * 0.045;
  const tSize = Math.min(S * 0.15 * ts, (S - 2 * pad - tIndent) / Math.max(1, titleW(title, 1)));
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const nSize = Math.max(S * 0.05, Math.min(S * 0.074 * ts, (S - 2 * pad) / Math.max(1, w500(name, 1) * 1.04)));
  const teams = teamsOf(data);
  const fix = teams.join(" v ");
  const fSize = Math.max(S * 0.036, Math.min(S * 0.048 * ts, (S - 2 * pad) / Math.max(1, w500(fix, 1))));
  const fixLines = w500(fix, S * 0.04) <= S - 2 * pad || teams.length < 2 ? [fix] : [teams[0], `v ${teams[1]}`];
  const fs = fixLines.length > 1 ? Math.min(S * 0.048 * ts, ...fixLines.map((t) => (S - 2 * pad) / Math.max(1, w500(t, 1)))) : fSize;
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const cSize = Math.max(9, Math.min(S * 0.024 * ts, (S - 2 * pad) / Math.max(1, capsW(comp, 1, 0.26))));

  const titleTop = S * 0.22;
  const nameTop = titleTop + tSize + S * 0.085;
  const fixTop = nameTop + nSize * 1.2 + S * 0.03;

  /* ---- the player, celebrating, filling the other side ---- */
  const sizes = story ? { chest: 340, waist: 280, knees: 214, full: 170 } : { chest: 240, waist: 200, knees: 152, full: 120 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const want = playerLeft ? (story ? 380 : 340) : CANVAS_W - (story ? 380 : 340);
  const faceTop = story ? STORY_TOP + 240 : 190;
  let pb = placeByFace(data, want, faceTop, sizes);
  // An arm flung wide: balance the figure on its side rather than the face, but keep his face clear of the note.
  const faceHalfW = (pb.faceH / face[3]) * (data.photoAspect ?? 0.6) * face[2] * 0.5;
  const noteEdge = playerLeft ? nx - 36 : nx + S + 36;
  const figMid = pb.left + pb.width / 2;
  let shift = Math.max(-90, Math.min(90, ((playerLeft ? 0.3 : 0.7) * CANVAS_W - figMid) * 0.5));
  const faceCx = want + shift;
  if (!playerLeft && faceCx - faceHalfW < noteEdge && faceTop < ny + S) shift += noteEdge - (faceCx - faceHalfW);
  if (playerLeft && faceCx + faceHalfW > noteEdge && faceTop < ny + S) shift -= faceCx + faceHalfW - noteEdge;
  pb = { ...pb, left: pb.left + shift };
  const fx = want + shift;
  const chin = pb.top + face[1] * pb.height + pb.faceH;

  /* ---- the logo, at the foot under the note's side ---- */
  const logoScale = params.logoScale ?? 1;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoX = playerLeft ? CANVAS_W - 64 : 64;

  const ground = mix(shade(club, -0.62), "#17181b", 0.35);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* Calm dark ground: a soft light behind him, a slow fall to the corners. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 45% at ${(fx / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${mix(shade(club, -0.25), "#45464b", 0.4)}, transparent 80%)`, opacity: 0.9 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.35))" }} />

      <div style={{ position: "absolute", left: fx - pb.faceH * 2.2, top: chin + pb.faceH * 0.4, width: pb.faceH * 4.4, height: pb.faceH * 5.5, borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: `blur(${story ? 80 : 60}px)` }} />
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: pb.left, top: pb.top, width: pb.width, height: pb.height, maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 340, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.3))" }} />

      <Note x={nx} y={ny} size={S} tilt={tilt} colour={colour} dark>
        <Checkbox x={pad} y={titleTop + tSize * 0.5 - box * 0.5} b={box} checked />
        <div style={{ position: "absolute", left: pad + tIndent, top: titleTop, fontFamily: SANS, fontWeight: 600, fontSize: tSize, lineHeight: 1, letterSpacing: "-0.025em", color: NOTE_INK, whiteSpace: "nowrap" }}>{title}</div>
        {name && <div style={{ position: "absolute", left: pad, top: nameTop, fontFamily: SANS, fontWeight: 600, fontSize: nSize, lineHeight: 1.2, letterSpacing: "-0.01em", color: NOTE_INK, whiteSpace: "nowrap" }}>{name}</div>}
        {fixLines.map((t, i) => (
          <div key={i} style={{ position: "absolute", left: pad, top: fixTop + i * fs * 1.3, fontFamily: SANS, fontWeight: 500, fontSize: fs, lineHeight: 1.3, color: "rgba(43,41,36,.72)", whiteSpace: "nowrap" }}>{t}</div>
        ))}
        {comp && <div style={{ position: "absolute", left: pad, bottom: pad * 0.95, fontFamily: SANS, fontWeight: 500, fontSize: cSize, lineHeight: 1, letterSpacing: "0.26em", color: NOTE_GREY, whiteSpace: "nowrap" }}>{comp}</div>}
      </Note>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: playerLeft ? undefined : logoX, right: playerLeft ? CANVAS_W - logoX : undefined, bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: playerLeft ? "right bottom" : "left bottom" }} />
      <Film strength={0.14} />
    </div>
  );
}
