/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")];
/** Inter caps, roughly, with the tracking added per glyph (em). */
const capsEm = (t: string, tracking: number) =>
  plain(t).reduce((a, c) => a + (c === " " ? 0.27 : /[\d·–-]/.test(c) ? 0.6 : /[IJ.]/.test(c) ? 0.32 : c === "M" || c === "W" ? 0.92 : 0.7) + tracking, 0);

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  return (words.join(" ") || n).trim();
}

/**
 * Orbit: a calm ground (deep club tone or warm off-white), the player centred and one hairline circle
 * orbiting him — centred on his chest, passing behind his head and in front of his body lower down. The
 * fixture runs along the front of the ring in tiny spaced caps; the title small at the top, crests small.
 */
export function Orbit({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  // The story (1080×1920): title at STORY_TOP, logo ending at STORY_BOTTOM, the player and ring larger, type ~1.4×.
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
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the player, centred; the ring around his chest ---- */
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const placed = placeByFace(data, 540, story ? 500 : 330, story ? { chest: 280, waist: 256, knees: 214, full: 168 } : { chest: 205, waist: 190, knees: 160, full: 124 });
  const faceTop0 = placed.top + face[1] * placed.height;
  const fh = placed.faceH;
  // In the story the ring's foot stays clear of the logo at STORY_BOTTOM.
  const R = story ? Math.max(340, Math.min(540, fh * 2.05, (STORY_BOTTOM - 120 - faceTop0 - fh * 0.3) / 2)) : Math.max(300, Math.min(430, fh * 2.05));
  // A small ring (a small face) would leave an empty band above the logo: the figure and ring settle lower, splitting the slack.
  const dy = story ? Math.max(0, (STORY_BOTTOM - 120 - (faceTop0 + fh * 0.3 + 2 * R)) * 0.5) : 0;
  const box = { ...placed, top: placed.top + dy };
  const faceTop = faceTop0 + dy;
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const cx = faceCx;
  // The ring's top passes behind his forehead; its centre lands on the chest.
  const cy = faceTop + fh * 0.3 + R;
  // Fade him out below the ring so its front reads cleanly.
  const fadeEnd = story ? Math.min(STORY_BOTTOM - 120, cy + R + 50) : Math.min(CANVAS_H - 160, cy + R + 110);
  const fadeLen = story ? 300 : 260;
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - fadeLen - box.top}px, transparent ${fadeEnd - box.top}px)`;

  /* ---- the lines along the ring: date and kick-off up its left side, ground and opponent down its right,
     both just outside it and parted around his head ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const opp = shortName(typed ?? titleCase(f.opp));
  const ours = shortName(data.club?.name ?? "");
  const pair = content.home === false ? [opp, ours] : [ours, opp];
  const vs = isResult && opp && ours ? `${pair[0]} ${score} ${pair[1]}` : opp ? `v ${opp}` : "";
  const SEP = "   ·   ";
  const compLine = titleCase(f.comp || f.round || "");
  const dateLine = [niceDate(content.date), f.time && !isResult ? `Kick-off ${f.time}` : ""].filter(Boolean).join(SEP);
  // No date (a result without one): the competition takes the left run instead of the top.
  const leftText = (dateLine || compLine).toUpperCase();
  const rightText = [titleCase(f.venue), vs].filter(Boolean).join(SEP).toUpperCase();
  const TRACK = 0.34;
  const ringR = R + 16;
  // The head's half-width seen from the ring centre, plus air: the angle each run stops short of the top.
  const gap = Math.asin(Math.min(0.9, (fh * 0.62 + 26) / ringR));
  const runLen = ringR * (Math.PI / 2 - gap + 0.17);
  const fitRun = (t: string) => Math.max(10.5, Math.min(14 * q, (runLen * 0.9) / Math.max(1, capsEm(t, TRACK))));
  const ringSize = Math.min(fitRun(leftText), fitRun(rightText)) * (params.textScale ?? 1);
  const pt = (a: number) => `${(cx + ringR * Math.cos(a)).toFixed(1)} ${(cy + ringR * Math.sin(a)).toFixed(1)}`;
  // Angles on screen: -PI/2 is the top; clockwise paths keep the glyphs upright and outside the ring.
  const leftPath = `M ${pt(Math.PI - 0.7)} A ${ringR} ${ringR} 0 0 1 ${pt(-Math.PI / 2 - gap)}`;
  const rightPath = `M ${pt(-Math.PI / 2 + gap)} A ${ringR} ${ringR} 0 0 1 ${pt(0.7)}`;

  /* ---- top: title, then the crests ---- */
  const title = (isResult && postType === "result" ? "Full Time" : content.kicker || "Matchday").toUpperCase().replace(/’/g, "'");
  const T_TRACK = 0.55;
  const tSize = Math.max(13 * ts, Math.min(20 * ts, (700 * (story ? params.textScale ?? 1 : ts)) / Math.max(1, capsEm(title, T_TRACK))));
  // In the story the crests (taller than the caps) start right at STORY_TOP.
  const titleTop = (story ? STORY_TOP + Math.max(0, 19 * q - tSize / 2) : 70) + (params.textY ?? 0);
  const titleW = capsEm(title, T_TRACK) * tSize;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestFilter = params.crestColor ? "none" : light ? "grayscale(1) contrast(1.15) brightness(.82)" : "url(#orbit-mono)";
  const comp = dateLine ? compLine : "";
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
      {half === "front" && (
        <>
          <path id="orbit-left" d={leftPath} fill="none" />
          <path id="orbit-right" d={rightPath} fill="none" />
          {[["orbit-left", leftText, "end", "100%"], ["orbit-right", rightText, "start", "0%"]].map(([id, t, anchor, offset]) =>
            t ? (
              <text key={id} fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={500} fontSize={ringSize} letterSpacing={ringSize * TRACK} fill={ink}>
                <textPath href={`#${id}`} startOffset={offset} textAnchor={anchor as "start" | "end"}>
                  {t}
                </textPath>
              </text>
            ) : null,
          )}
        </>
      )}
    </svg>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <MonoDefs id="orbit-mono" ink={0.55} />
      {/* The ground: flat, a breath of light behind him. */}
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

      {/* Soft contact shadow and the player, natural colour. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The front of the ring, over him, with the fixture running along it. */}
      {arc("front")}

      {/* Top: title, competition, the crests. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleTop, ...caps(tSize, T_TRACK, 500) }}>{title}</div>
      {comp && <div style={{ position: "absolute", left: 60, right: 60, top: titleTop + tSize + 18 * q, ...caps(compSize, 0.3, 400), color: inkA(0.62) }}>{comp}</div>}
      {crests.map((c, i) => {
        // Home crest left of the title, away crest right of it (a single crest sits left).
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
        height={story ? 24 : 18}
        style={{ position: "absolute", left: "50%", bottom: (story ? H - STORY_BOTTOM : 50) - (params.logoY ?? 0), transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={light ? 0.12 : 0.2} />
    </div>
  );
}
