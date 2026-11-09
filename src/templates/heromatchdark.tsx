/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#f3f1ec";

/** The club colour for a dark ground: vivid, never white/yellow (accent instead), never black. */
function clubTones(primary: string, accent: string): { club: string; ground: string; glow: string } {
  let club = vivid(primary === "#10131c" ? accent : primary);
  if (luminance(club) > 0.45) club = vivid(accent);
  // Both light (white / yellow club): a neutral deep ground, warm light.
  if (luminance(club) > 0.45) return { club, ground: "#15171c", glow: "#2a2c33" };
  // Black club: a charcoal ground with a little lift.
  if (luminance(club) < 0.02) return { club, ground: "#141519", glow: "#2b2d33" };
  return { club, ground: shade(club, -0.66), glow: shade(club, -0.28) };
}

/**
 * Hero matchday, dark: the goalhero composition inverted. A deep club-colour ground with a soft light behind
 * the player, the name in wide-spaced off-white caps, "MATCHDAY" enormous in off-white Anton at the exact
 * canvas width, the player under it fading into the ground, and a quiet fixture foot.
 */
export function Heromatchdark({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.32 : 1;
  const face = FACES.anton;
  const { ground, glow } = clubTones(params.primary, params.accent);
  const M = 80;

  /* ---- the top: logo, name, word ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const size = Math.min((CANVAS_W - 2 * M) / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const capTop = nameTop + nameSize + (story ? 36 : 26) + (params.textY ?? 0);
  const baseline = capTop + size * face.cap;

  /* ---- the foot: teams with crests, then date · time · venue ---- */
  const f = matchFacts(data);
  const ours = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const homeName = (content.homeTeam || (weHost ? ours : f.opp) || "").toUpperCase();
  const awayName = (content.awayTeam || (weHost ? f.opp : ours) || "").toUpperCase();
  const homeCrest = content.homeCrest ?? (weHost ? f.ourCrest : f.oppCrest);
  const awayCrest = content.awayCrest ?? (weHost ? f.oppCrest : f.ourCrest);
  const crest = 46 * S;
  const teamsChars = homeName.length + awayName.length + 3;
  const crestRoom = (homeCrest ? crest + 22 * S : 0) + (awayCrest ? crest + 22 * S : 0);
  const teamSize = Math.max(12, Math.min(22 * S, (CANVAS_W - 2 * 64 - crestRoom) / Math.max(1, teamsChars * 0.76)));
  const info = [f.longDate, f.time, f.venue].filter(Boolean).join("  ·  ");
  const infoSize = Math.max(11, Math.min(15 * S, (CANVAS_W - 2 * 72) / Math.max(1, info.length * 0.82)));
  const infoTop = (story ? STORY_BOTTOM : H - 58) - infoSize;
  const teamsTop = infoTop - (story ? 30 : 24) - crest;
  const hasTeams = !!(homeName || awayName);
  const footTop = hasTeams ? teamsTop : infoTop;

  /* ---- the player: head just under the word, big, fading into the ground above the foot ---- */
  const sizes = story ? { chest: 420, waist: 360, knees: 260, full: 190 } : { chest: 320, waist: 270, knees: 200, full: 150 };
  const faceX = 560 + (params.side === "left" ? -60 : params.side === "right" ? 30 : 0);
  const gap = story ? 26 : 18;
  let faceTop = baseline + 200;
  for (let i = 0; i < 2; i++) faceTop += baseline + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-120, Math.min(120, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  // A side where the photo cut him (an arm): slide that edge towards the canvas edge, and fade it wide.
  const cut = data.cut ?? {};
  if ((cut.right ?? 0) > 0) box = { ...box, left: box.left + Math.max(0, Math.min(50, CANVAS_W + 6 - (box.left + box.width))) };
  else if ((cut.left ?? 0) > 0) box = { ...box, left: box.left - Math.max(0, Math.min(50, box.left + 6)) };
  const fadeEnd = footTop - (story ? 30 : 16);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 380 : 280)}px, transparent ${fadeEnd}px)`;
  const glowY = Math.round(((box.top + box.faceH * 3) / H) * 100);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* A soft light behind him. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% ${story ? 38 : 46}% at 50% ${glowY}%, ${glow}, transparent 78%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 520, background: `linear-gradient(to bottom, transparent, ${shade(ground, -0.25)})` }} />

      {/* The word, pinned to the canvas width. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={size * (1 - face.cap) * 0.9 + size * face.cap} textAnchor="middle" style={{ fontFamily: face.family, fontWeight: face.weight, fontSize: size, fill: INK }}>
          {word}
        </text>
      </svg>

      {/* The player, in front of the word's foot. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut, 2.4) }} />
        </div>
      )}

      {/* Name, wide-spaced, off-white. */}
      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: INK, whiteSpace: "nowrap" }}>{name}</div>
      )}

      {/* The fixture, quiet. */}
      {hasTeams && (
        <div style={{ position: "absolute", left: 40, right: 40, top: teamsTop, height: crest, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * S, color: INK, fontFamily: SANS, fontWeight: 700, fontSize: teamSize, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          {homeCrest && <img src={homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          <span>
            {homeName}
            <span style={{ fontWeight: 400, opacity: 0.6, margin: "0 0.7em" }}>v</span>
            {awayName}
          </span>
          {awayCrest && <img src={awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
        </div>
      )}
      {info && (
        <div style={{ position: "absolute", left: 56, right: 56, top: infoTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: infoSize, lineHeight: 1, letterSpacing: "0.22em", paddingLeft: "0.22em", color: INK, opacity: 0.72, whiteSpace: "nowrap" }}>{info}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
