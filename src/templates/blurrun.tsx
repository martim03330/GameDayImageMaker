/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { INTER, mix, MonoDefs, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const SOFT = "0 2px 18px rgba(0,0,0,.55)";

/** Face height by framing: he fills the lower two thirds, as if caught mid-stride by a panning camera. */
const FACE_H: Record<string, number> = { chest: 230, waist: 175, knees: 140, full: 118 };

/**
 * Slow shutter (Malmö "MATCHDAG"): a dark night where the whole picture is movement — the ground streaked
 * into horizontal light, a green glow of pitch at the foot, and the player himself smeared across the frame
 * by a panning slow exposure: a string of blurred, fading ghosts trailing behind him and one softer copy
 * holding his shape, the head and face fully sharp (they must stand out: it is a player's post). At the top, very quiet: a small white crest, an elegant
 * serif "MATCHDAY" and the teams in a light sans.
 */
export function Blurrun({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 73;
  const r = rng(seed);
  const id = `br-${seed % 997}`;
  const ts = params.textScale ?? 1;
  // Native Instagram story (1080×1920): same picture, taller; type and mark kept out of the zones the
  // app covers (profile bar on top, message box at the foot).
  const H = data.canvasH ?? CANVAS_H;
  const story = H > CANVAS_H;
  const drop = story ? 250 : 0;
  // He runs towards the side he stands on; the ghosts stream out behind him.
  const right = params.side ? params.side !== "left" : r() < 0.5;
  const dir = right ? 1 : -1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.8) club = vivid(params.accent);
  const night = mix(shade(club, -0.82), "#070b16", 0.78);
  const tint = mix(club, "#3a6ec8", 0.72);
  const grass = "#2f7a3a";

  // ---- the player ----
  const faceTop = 470 + drop + r() * 50;
  const faceX = 540 + dir * (40 + r() * 50);
  const fig = placeByFace(data, faceX, faceTop, FACE_H);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const box: CSSProperties = { position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none" };
  const fcx = (face[0] + face[2] / 2) * 100;
  const fcy = (face[1] + face[3] / 2) * 100;
  // Head, neck and top of the shoulders fully sharp, fading into the blurred body below.
  const headMask = `radial-gradient(ellipse ${face[2] * 210}% ${face[3] * 290}% at ${fcx}% ${fcy + face[3] * 45}%, #000 58%, transparent 100%)`;
  const ghosts = Array.from({ length: 8 }, (_, i) => ({
    dx: -dir * (26 + i * (34 + r() * 8)),
    blur: 10 + i * 7,
    o: 0.3 - i * 0.03,
  }));

  // ---- background: the ground (or his own photo) streaked by the pan ----
  const scene = sceneOf(data);
  // A backdrop photo the user picked for this edit always wins over the ground.
  const bg = content.backdropPhotoId && data.bgPhotoUrl ? data.bgPhotoUrl : scene && (!data.bgPhotoUrl || r() < 0.6) ? scene : data.bgPhotoUrl ?? scene;

  // ---- texts ----
  const f = matchFacts(data);
  const score = postType !== "matchday" ? scoreOf(data, "–") : "";
  const home = titleCase((content.homeTeam ?? "").trim());
  const away = titleCase((content.awayTeam ?? "").trim());
  // Speed post: the figure takes the title's place, "Top Speed" the teams' line ("Só a velocidade": the figure alone).
  const speed = postType === "speed" ? `${(content.speed ?? "").replace(",", ".").match(/\d+(\.\d+)?/)?.[0] ?? "00.0"} KM/H` : "";
  const only = postType === "speed" && !!content.speedOnly;
  const teams = speed ? (only ? "" : titleCase(content.kicker || "TOP SPEED")) : home && away ? (score ? `${home}  ${score}  ${away}` : `${home} — ${away}`) : "";
  const title = speed || content.kicker.toUpperCase().replace(/’/g, "'").trim();
  const titleSize = Math.min(64, 860 / Math.max(1, [...title].length * 0.74)) * ts;
  const teamsSize = Math.min(34, 860 / Math.max(1, [...teams].length * 0.52)) * ts;
  // Names typed all in lower case still get their capitals.
  const typed = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const name = typed === typed.toLowerCase() ? typed.replace(/(^|\s)(\p{L})/gu, (m) => m.toUpperCase()) : typed;
  // Speed post: under the figure, only his name (also with "Só a velocidade").
  const small = speed
    ? name
    : postType === "matchday"
      ? [niceDate(content.date), content.time, titleCase(f.venue)].filter(Boolean).join("  ·  ")
      : [name, titleCase(f.comp)].filter(Boolean).join("  ·  ");
  // On a speed post the name is the only line under the figure: it gets real size.
  // Speed post: the game it happened in, under his name, without the score ("SC Vianense SAD vs USC Paredes").
  const game = speed && home && away ? `${home}  vs  ${away}` : "";
  const gameSize = Math.min(24, 820 / Math.max(1, [...game].length * 0.52)) * ts;
  const smallSize = speed ? Math.min(34, 820 / Math.max(1, [...small].length * 0.52)) * ts : Math.min(19, 820 / Math.max(1, [...small].length * 0.52));
  const crest = data.club?.crestUrl;

  // The type block ends well above the hair (a tight framing lifts the head).
  const hairTop = fig.top + (face[1] - face[3] * 0.6) * fig.height;
  const blockBottom = Math.min(hairTop - 50, 440 + drop);
  const blockH = 70 + 26 + titleSize + 22 + teamsSize + 18 + smallSize + (game ? 14 + gameSize : 0);
  const blockTop = Math.max(70 + drop, blockBottom - blockH - 40);

  // A blurred copy inside a wide padded layer, so the long horizontal blur is never clipped at the photo's edge.
  const PAD = 420;
  const smear = (dx: number, filter: string, opacity: number, blend: CSSProperties["mixBlendMode"] = "normal") => (
    <div style={{ position: "absolute", left: fig.left + dx - PAD, top: fig.top, width: fig.width + PAD * 2, height: fig.height, filter, opacity, mixBlendMode: blend }}>
      <img src={data.photoUrl!} alt="" style={{ position: "absolute", left: PAD, top: 0, width: fig.width, height: fig.height, maxWidth: "none", ...cutMask(data.cut) }} />
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: night, color: WHITE }}>
      <MonoDefs id={`${id}-mono`} ink={0.5} />
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id={`${id}-pan`} x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="90 5" edgeMode="duplicate" />
          </filter>
          {ghosts.map((g, i) => (
            <filter key={i} id={`${id}-g${i}`} x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation={`${g.blur} 2`} />
            </filter>
          ))}
          <filter id={`${id}-body`} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="7 1.2" />
          </filter>
        </defs>
      </svg>

      {/* The ground smeared into streaks of light. */}
      {bg && (
        <img
          src={bg}
          alt=""
          style={{ position: "absolute", left: -260, top: -40, width: CANVAS_W + 520, height: H + 80, maxWidth: "none", objectFit: "cover", filter: `url(#${id}-pan) saturate(.8) brightness(.62) contrast(1.15)` }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: tint, mixBlendMode: "color", opacity: 0.6 }} />
      {/* Night: near-black above, the streaked stands in the middle, pitch glow below. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${night} 0%, ${night}f2 22%, ${night}88 40%, ${night}40 58%, ${night}66 80%, ${night}aa 100%)` }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: H - 310, height: 560, background: `radial-gradient(60% 50% at 50% 62%, ${grass}ee, ${grass}55 55%, transparent)`, filter: "blur(18px)" }} />
      {/* A few horizontal light streaks (floodlights and hoardings passing). */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -100,
            right: -100,
            top: 560 + drop + i * 150 + r() * 60,
            height: 16 + r() * 24,
            background: `linear-gradient(to right, transparent, rgba(190,210,255,${0.1 + r() * 0.08}) ${20 + r() * 30}%, transparent)`,
            filter: "blur(10px)",
          }}
        />
      ))}

      {/* The slow exposure: ghosts trailing, a soft body, a sharp head on top of everything. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "saturate(.85)" }}>
          {ghosts
            .slice()
            .reverse()
            .map((g, k) => {
              const i = ghosts.length - 1 - k;
              return <div key={i}>{smear(g.dx, `url(#${id}-g${i}) brightness(1.05)`, g.o, "screen")}</div>;
            })}
          {smear(0, `url(#${id}-body) contrast(1.05)`, 0.95)}
          {/* Leading edge: a faint ghost ahead of him too, as the shutter closes (under the head, so it never hazes the face). */}
          {smear(dir * 22, `url(#${id}-g1)`, 0.16, "screen")}
          <div style={{ ...box, WebkitMaskImage: headMask, maskImage: headMask }}>
            <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", display: "block", filter: "contrast(1.1) brightness(1.06) saturate(1.08)", ...cutMask(data.cut) }} />
          </div>
        </div>
      )}
      {/* Cool night grade over everything, a touch of club colour in the light. */}
      <div style={{ position: "absolute", inset: 0, background: tint, mixBlendMode: "soft-light", opacity: 0.5, pointerEvents: "none" }} />
      {/* Pitch light bouncing up at the foot, over him too. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: `linear-gradient(to top, ${grass}88, ${grass}22 55%, transparent)`, mixBlendMode: "screen", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(115% 85% at 50% 55%, transparent 50%, rgba(0,0,0,.6) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: blockTop + blockH + 120, background: `linear-gradient(to bottom, ${night}dd, ${night}99 70%, transparent)`, pointerEvents: "none" }} />

      {/* The quiet top block. */}
      <div style={{ position: "absolute", left: 40, right: 40, top: blockTop + (params.textY ?? 0), display: "flex", flexDirection: "column", alignItems: "center", textShadow: SOFT }}>
        {crest && <img src={crest} alt="" style={{ width: 70, height: 70, objectFit: "contain", filter: `url(#${id}-mono)`, opacity: 0.95 }} />}
        <div style={{ marginTop: 26, fontFamily: DMSERIF, fontSize: titleSize, lineHeight: 1, letterSpacing: "0.05em", paddingLeft: "0.05em", whiteSpace: "nowrap" }}>{title}</div>
        {teams && <div style={{ marginTop: 22, fontFamily: INTER, fontWeight: 400, fontSize: teamsSize, lineHeight: 1.1, whiteSpace: "nowrap", opacity: 0.95 }}>{teams}</div>}
        {small && <div style={{ marginTop: speed ? 22 : 18, fontFamily: INTER, fontWeight: speed ? 500 : 300, fontSize: smallSize, lineHeight: 1.1, letterSpacing: "0.04em", whiteSpace: "nowrap", opacity: speed ? 0.95 : 0.7 }}>{small}</div>}
        {game && <div style={{ marginTop: 14, fontFamily: INTER, fontWeight: 400, fontSize: gameSize, lineHeight: 1.1, letterSpacing: "0.04em", whiteSpace: "nowrap", opacity: 0.8 }}>{game}</div>}
      </div>

      {/* The agency mark, centred at the foot and clearly visible (the agency's own posts). */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: (story ? 300 : 56 - (params.logoScale && params.logoScale < 1 ? 16 : 0)) - (params.logoY ?? 0), display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={(story ? 66 : 50) * (params.logoScale ?? 1)} style={{ maxWidth: "none", color: WHITE, filter: "drop-shadow(0 3px 14px rgba(0,0,0,.75))" }} />
      </div>
      {/* Grain, as in a high-ISO night frame. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
          )}")`,
        }}
      />
    </div>
  );
}
