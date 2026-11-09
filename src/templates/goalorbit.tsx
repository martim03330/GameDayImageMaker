/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph (em). */
const capsEm = (t: string, tracking: number) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The real logo height: AgencyLogo renders ~2× the asked height (min 52) in posts, ~1.7× that in stories. */
const logoH = (asked: number, story: boolean) => {
  const post = Math.max(52, Math.round(asked * (asked >= 40 ? 1.5 : 2)));
  return story ? Math.max(88, Math.round(post * 1.7)) : post;
};

/**
 * Goal orbit: the goal post of `orbit`. A calm ground (deep club tone or warm off-white), the celebrating
 * player centred and one hairline circle around him — passing behind his head, in front of his body lower
 * down — with one line running along the foot of the ring in spaced caps: "GOAL · name · home v away".
 * The title small at the top between small crests; the logo with room under the ring. Never a score.
 */
export function Goalorbit({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.4 : 1);
  const q = story ? 1.4 : 1;
  const r = rng(params.seed ?? 7);
  const light = r() < 0.5;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.22);
  const ground = light ? "#efebe4" : shade(club, -0.62);
  const ink = light ? "#1c1b1a" : "#ffffff";
  const inkA = (a: number) => (light ? `rgba(28,27,26,${a})` : `rgba(255,255,255,${a})`);

  const f = matchFacts(data);

  /* ---- the foot: the logo, then the line along the ring above it ---- */
  const logoAsk = story ? 24 : 18;
  const logoBottom = (story ? H - STORY_BOTTOM : 50) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH(logoAsk, story) * (params.logoScale ?? 1);
  const ringTextSize0 = 15 * q;
  // The lowest the ring may reach: its caps sit under it, then ≥ 60px of air above the logo.
  const ringFloor = logoTop - 64 - (14 + ringTextSize0) * 1.1;

  /* ---- the player, centred; the ring around his chest ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const placed = placeByFace(data, 540, story ? STORY_TOP + 250 : 250, story ? { chest: 270, waist: 246, knees: 206, full: 162 } : { chest: 196, waist: 182, knees: 152, full: 118 });
  const faceTop0 = placed.top + face[1] * placed.height;
  const fh = placed.faceH;
  const R = Math.max(story ? 330 : 280, Math.min(story ? 470 : 410, fh * 2.5, (ringFloor - faceTop0 - fh * 0.3) / 2));
  // A small ring would leave an empty band above the foot: the figure and ring settle lower, splitting the slack.
  const dy = Math.max(0, (ringFloor - (faceTop0 + fh * 0.3 + 2 * R)) * 0.5);
  let box = { ...placed, top: placed.top + dy };
  // Arms thrown to one side: centre the figure a little rather than the face (the ring follows the face).
  const lean = Math.max(-60, Math.min(60, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const faceTop = faceTop0 + dy;
  // The ring follows his face but never leaves the canvas (≥ 50px from either edge).
  const cx = Math.max(50 + R, Math.min(CANVAS_W - 50 - R, box.left + (face[0] + face[2] / 2) * box.width));
  const cy = faceTop + fh * 0.3 + R;
  // He fades out into the foot of the ring so the line along it reads on clean ground.
  const fadeEnd = cy + R * 0.92;
  const fadeLen = story ? 320 : 260;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - fadeLen - box.top}px, transparent ${fadeEnd - box.top}px)`;

  /* ---- the line along the foot of the ring ---- */
  const kicker = (content.kicker || "Goal").toUpperCase().replace(/’/g, "'");
  const ours = data.club?.name ?? "";
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = typed ?? titleCase(f.opp);
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);
  const teams = (weHost ? [ours, opp] : [opp, ours]).filter(Boolean);
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim();
  const ringText = [kicker, name, teams.join(" v ")].filter(Boolean).join("   ·   ").toUpperCase();
  const TRACK = 0.3;
  const ringR = R + 14;
  // The run spans the lower ~150° of the ring.
  const runLen = ringR * 2.6;
  const ringSize = Math.max(10.5, Math.min(ringTextSize0, (runLen * 0.94) / Math.max(1, capsEm(ringText, TRACK)))) * (params.textScale ?? 1);
  // Left to right along the bottom (counter-clockwise on screen): the caps stand upright under the ring.
  // The glyphs rise towards the centre from the baseline, so push the baseline out by a cap height.
  const textR = ringR + ringSize * 0.74;
  const tpt = (a: number) => `${(cx + textR * Math.cos(a)).toFixed(1)} ${(cy + textR * Math.sin(a)).toFixed(1)}`;
  const textPath = `M ${tpt(Math.PI - 0.2)} A ${textR} ${textR} 0 0 0 ${tpt(0.2)}`;

  /* ---- top: title between the crests, then the competition ---- */
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * ts, Math.min(20 * ts, (700 * (story ? params.textScale ?? 1 : ts)) / Math.max(1, capsEm(kicker, T_TRACK))));
  const titleTop = (story ? STORY_TOP + Math.max(0, 19 * q - tSize / 2) : 70) + (params.textY ?? 0);
  const titleW = capsEm(kicker, T_TRACK) * tSize;
  const crests = (weHost ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : light ? "grayscale(1) contrast(1.15) brightness(.82)" : "url(#goalorbit-mono)";
  const comp = titleCase(f.comp || f.round || "");
  const compSize = Math.max(10 * ts, Math.min(12 * ts, (story ? 620 : 520 * ts) / Math.max(1, capsEm(comp, 0.3))));
  const caps = (size: number, track: number, weight = 500): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    paddingLeft: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    textAlign: "center",
    textTransform: "uppercase",
    color: ink,
  });

  const arc = (half: "back" | "front") => (
    <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <path
        d={half === "back" ? `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}` : `M ${cx - R} ${cy} A ${R} ${R} 0 0 0 ${cx + R} ${cy}`}
        fill="none"
        stroke={inkA(light ? 0.7 : 0.75)}
        strokeWidth={1.5}
      />
      {half === "front" && ringText && (
        <>
          <path id="goalorbit-foot" d={textPath} fill="none" />
          <text fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={500} fontSize={ringSize} letterSpacing={ringSize * TRACK} fill={ink}>
            <textPath href="#goalorbit-foot" startOffset="50%" textAnchor="middle">
              {ringText}
            </textPath>
          </text>
        </>
      )}
    </svg>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="goalorbit-mono" ink={0.55} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: light
            ? `radial-gradient(60% 45% at 50% ${((cy - 80) / H) * 100}%, #f7f4ee, ${ground} 70%, #e6e1d8 100%)`
            : `radial-gradient(60% 45% at 50% ${((cy - 80) / H) * 100}%, ${shade(club, -0.42)}, ${ground} 70%, ${shade(club, -0.78)} 100%)`,
        }}
      />

      {/* The back of the ring, behind him. */}
      {arc("back")}

      {/* The celebrating player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The front of the ring, over him, with the line along its foot. */}
      {arc("front")}

      {/* Top: title between the crests, the competition under it. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{kicker}</div>
      {comp && <div style={{ position: "absolute", left: 60, right: 60, top: titleTop + tSize + 18 * q, ...caps(compSize, 0.3, 400), color: inkA(0.62) }}>{comp}</div>}
      {crests.map((c, i) => {
        const off = titleW / 2 + 46 * q;
        return (
          <img
            key={i}
            src={c}
            alt=""
            style={{ position: "absolute", left: 540 + (i === 0 ? -off - 38 * q : off), top: titleTop + tSize / 2 - 19 * q, width: 38 * q, height: 38 * q, objectFit: "contain", filter: crestFilter }}
          />
        );
      })}

      <AgencyLogo
        data={data}
        onLight={light}
        height={logoAsk}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={light ? 0.12 : 0.2} />
    </div>
  );
}
