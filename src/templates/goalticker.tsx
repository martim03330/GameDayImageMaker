/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, CONDENSED, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
/** The board's lit colour: a warm stadium white. */
const LIT = "#fff4df";

/** A dark grid laid over the lit letters so they read as LED dots. */
const dots = (pitch: number, board: string): CSSProperties => ({
  position: "absolute",
  inset: 0,
  backgroundImage: `radial-gradient(circle at center, transparent ${pitch * 0.38}px, ${board}e6 ${pitch * 0.55}px)`,
  backgroundSize: `${pitch}px ${pitch}px`,
  pointerEvents: "none",
});

/**
 * Goal ticker: a clean deep club ground with the celebrating player big in the middle, framed by two thin
 * LED ribbon boards running edge to edge — the top one repeats the kicker ("GOAL · GOAL · GOAL ·"), the bottom
 * one his name — like the advertising boards round a stadium. Only his name and the fixture sit small at the foot.
 */
export function Goalticker({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const ty = params.textY ?? 0;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.35 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const deep = shade(club, -0.72);
  const lift = shade(club, -0.28);
  const board = "#07080b";

  const f = matchFacts(data);

  /* ---- the two boards ---- */
  const bandH = Math.round(48 * S);
  const pitch = story ? 4 : 3;
  const topBand = story ? STORY_TOP : 52;
  const botBand = story ? STORY_BOTTOM - bandH : CANVAS_H - 52 - bandH;
  const kicker = (content.kicker || "GOAL").replace(/’/g, "'").toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const run = (word: string) => Array.from({ length: 14 }, () => word).join("   ·   ") + "   ·   ";
  const tickSize = Math.round(27 * S);
  // Each board starts at a different offset so the two runs never line up.
  const tick = (text: string, top: number, shift: number) => (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: bandH, background: board, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
      <div
        data-bleed
        style={{ position: "absolute", left: -shift, top: 0, height: bandH, display: "flex", alignItems: "center", whiteSpace: "nowrap", fontFamily: CONDENSED, fontWeight: 700, fontSize: tickSize, letterSpacing: "0.32em", lineHeight: 1, color: LIT, textShadow: `0 0 6px ${LIT}aa, 0 0 18px ${vivid(club)}` }}
      >
        {text}
      </div>
      <div style={dots(pitch, board)} />
    </div>
  );

  /* ---- the foot: name, then the fixture with tiny crests ---- */
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) !== lc(ours) && t.toUpperCase() === f.opp);
  const opp = (typed ?? f.opp ?? "").toUpperCase();
  const us = ours.toUpperCase();
  const pair = weHost ? [us, opp] : [opp, us];
  const fixture = us && opp ? `${pair[0]}  v  ${pair[1]}` : "";
  const comp = titleCase(f.comp || f.round || "").toUpperCase();
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];

  const M = 64;
  const nameSize = Math.max(20, Math.min(34 * S, (story ? 760 : 640) / Math.max(1, name.length * 0.62))) * ts;
  const fixSize = Math.max(11, Math.min(15 * S, 560 / Math.max(1, fixture.length * 0.74))) * ts;
  const compSize = Math.max(10, Math.min(12 * S, 560 / Math.max(1, comp.length * 0.8))) * ts;
  const crestS = Math.round(22 * S);
  const footGap = story ? 60 : 40;
  const compTop = botBand - footGap - (comp ? compSize : 0) + ty;
  const fixTop = (comp ? compTop - 14 * S : botBand - footGap + ty) - Math.max(crestS, fixSize);
  const nameTop = fixTop - 18 * S - nameSize;

  /* ---- the player, big, centred between the boards ---- */
  const faceX = 540 + (params.side === "left" ? -40 : params.side === "right" ? 40 : 0);
  let box = story
    ? placeByFace(data, faceX, topBand + bandH + 190, { chest: 350, waist: 280, knees: 216, full: 170, bust: 380 })
    : placeByFace(data, faceX, topBand + bandH + 110, { chest: 248, waist: 196, knees: 152, full: 118, bust: 270 });
  // Arms thrown to one side: centre the figure a little rather than the face.
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;
  const fadeEnd = botBand - 10 - box.top;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 360 : 260)}px, transparent ${fadeEnd}px)`;
  const glowX = box.left + (face[0] + face[2] / 2) * box.width;

  const soft: CSSProperties = { color: WHITE, whiteSpace: "nowrap", lineHeight: 1, textShadow: "0 1px 16px rgba(0,0,0,.4)" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      {/* The ground: one deep tone, lifted softly behind him like floodlight haze. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 46% at ${(glowX / CANVAS_W) * 100}% ${((chin + 40) / H) * 100}%, ${lift}, ${shade(club, -0.55)} 55%, ${deep})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * 0.45, background: `linear-gradient(to bottom, transparent, ${shade(club, -0.82)})` }} />

      {/* A soft shade under him instead of a drop shadow. */}
      <div style={{ position: "absolute", left: box.left + box.width * 0.18, top: chin + box.faceH * 0.5, width: box.width * 0.64, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.25)", filter: "blur(60px)" }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.04)", ...cutMask(data.cut) }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: nameTop - 160, bottom: H - botBand, background: `linear-gradient(to bottom, transparent, ${shade(club, -0.8)}cc)` }} />

      {/* The two ribbon boards. */}
      {tick(run(kicker), topBand, 30)}
      {name && tick(run(name), botBand, 210)}

      {/* Foot: name, fixture, competition — small, left on the margin. */}
      {name && <div style={{ ...soft, position: "absolute", left: M, top: nameTop, fontFamily: SANS, fontWeight: 600, fontSize: nameSize, letterSpacing: "0.06em" }}>{name}</div>}
      {fixture && (
        <div style={{ position: "absolute", left: M, top: fixTop, height: Math.max(crestS, fixSize), display: "flex", alignItems: "center", gap: 10 * S }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />
          ))}
          <span style={{ ...soft, marginLeft: 6 * S, fontFamily: SANS, fontWeight: 500, fontSize: fixSize, letterSpacing: "0.2em" }}>{fixture}</span>
        </div>
      )}
      {comp && <div style={{ ...soft, position: "absolute", left: M, top: compTop, fontFamily: SANS, fontWeight: 400, fontSize: compSize, letterSpacing: "0.3em", opacity: 0.7 }}>{comp}</div>}

      <AgencyLogo
        data={data}
        height={story ? 24 : 18}
        style={{ position: "absolute", right: M, bottom: H - botBand + footGap - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right bottom" }}
      />
      <Film strength={0.22} />
    </div>
  );
}
