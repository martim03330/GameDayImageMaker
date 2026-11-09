/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const GROUND = "#f3f3f1";

/**
 * Hero behind: the magazine-cover member of the hero family. Off-white ground, the name small and spaced at
 * the top, then "MATCHDAY" enormous in club-colour Barlow italic set BEHIND the player at head and shoulder
 * height — his head and shoulders stand in front of the letters (the face always over the word, never under
 * it). The player fades into the ground above a quiet fixture foot.
 */
export function Herobehind({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const S = story ? 1.32 : 1;
  const face = FACES.barlow;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.4) club = shade(club, -0.35);
  if (luminance(club) < 0.02) club = shade(club, 0.15);
  const ink = shade(club, -0.55);
  const M = 64;

  /* ---- the top: logo, name ---- */
  const logoTop = (story ? STORY_TOP : 52) - (params.logoY ?? 0);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = Math.min((story ? 32 : 24) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 102);
  const nameBottom = nameTop + nameSize;

  /* ---- the word, and his head rising into its lower half (the cutout's top is his hair) ---- */
  const word = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const size = Math.min((CANVAS_W - 2 * M - 40) / Math.max(0.5, wordEm(face, word)), (story ? 460 : 380) / face.cap) * ts;
  const cap = size * face.cap;
  const capTop = nameBottom + (story ? 50 : 40) + (params.textY ?? 0);
  const sizes = story ? { chest: 360, waist: 300, knees: 220, full: 170 } : { chest: 270, waist: 228, knees: 170, full: 130 };
  const faceX = 540 + (params.side === "left" ? -50 : params.side === "right" ? 30 : 0);
  const OVER = 0.4; // how far into the letters his hair reaches
  let faceTop = capTop + cap;
  for (let i = 0; i < 3; i++) faceTop += capTop + cap * OVER - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
  let box = placeByFace(data, faceX, faceTop, sizes);
  const lean = Math.max(-110, Math.min(110, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  // Where the photo cut him (an arm): slide the more-cut edge towards the canvas edge, and fade what remains.
  const cut = data.cut ?? {};
  const cl = cut.left ?? 0;
  const cr = cut.right ?? 0;
  if (cr > 0 && cr >= cl) box = { ...box, left: box.left + Math.max(0, Math.min(90, CANVAS_W + 4 - (box.left + box.width))) };
  else if (cl > 0) box = { ...box, left: box.left - Math.max(0, Math.min(90, box.left + 4)) };
  const vcut = { top: cut.top, bottom: cut.bottom, left: box.left > 0 ? cl : 0, right: box.left + box.width < CANVAS_W ? cr : 0 };

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
  const fadeEnd = footTop - (story ? 30 : 16);
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - (story ? 420 : 300)}px, transparent ${fadeEnd}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 50%, #ffffff, transparent 75%)" }} />

      {/* The word, behind him. */}
      <svg width={CANVAS_W} height={size * 1.25} style={{ position: "absolute", left: 0, top: capTop - size * (1 - face.cap) * 0.9, overflow: "visible" }}>
        <text
          x={CANVAS_W / 2}
          y={size * (1 - face.cap) * 0.9 + cap}
          textAnchor="middle"
          style={{ fontFamily: face.family, fontWeight: face.weight, fontStyle: "italic", fontSize: size, fill: club, letterSpacing: `${face.tracking}em` }}
        >
          {word}
        </text>
      </svg>

      {/* The player, in front of the word. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(vcut, 1.8) }} />
        </div>
      )}

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.55em", paddingLeft: "0.55em", color: club, whiteSpace: "nowrap" }}>{name}</div>
      )}

      {/* The fixture, quiet. */}
      {hasTeams && (
        <div style={{ position: "absolute", left: 40, right: 40, top: teamsTop, height: crest, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 * S, color: ink, fontFamily: SANS, fontWeight: 700, fontSize: teamSize, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          {homeCrest && <img src={homeCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
          <span>
            {homeName}
            <span style={{ fontWeight: 400, color: club, margin: "0 0.7em" }}>v</span>
            {awayName}
          </span>
          {awayCrest && <img src={awayCrest} alt="" style={{ width: crest, height: crest, objectFit: "contain" }} />}
        </div>
      )}
      {info && (
        <div style={{ position: "absolute", left: 56, right: 56, top: infoTop, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: infoSize, lineHeight: 1, letterSpacing: "0.22em", paddingLeft: "0.22em", color: ink, opacity: 0.7, whiteSpace: "nowrap" }}>{info}</div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 24}
        onLight
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }}
      />
    </div>
  );
}
