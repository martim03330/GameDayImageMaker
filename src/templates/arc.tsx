/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade } from "@/lib/color";
import { Film } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { lift } from "./column";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { bestLines, clubColour, INTER, interEm, mix } from "./wall";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
const PAPER = "#f6f3f0";

/** Width-fitted size for a line of heavy Inter caps with the given tracking. */
const fitInter = (t: string, width: number, max: number, tracking = 0) => Math.min(max, width / Math.max(1, interEm(t, tracking)));

/**
 * Soft liquid marble: large swirling contour bands from displaced noise, drawn very faintly in the club tint
 * over warm white paper, with a shading pass so the sheet has some body.
 */
function Marble({ tint, seed, id }: { tint: string; seed: number; id: string }) {
  return (
    <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <defs>
        <filter id={`${id}-m`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0016 0.0032" numOctaves={4} seed={seed} result="n" />
          <feDisplacementMap in="n" in2="n" scale={260} xChannelSelector="G" yChannelSelector="B" result="d" />
          <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.2" result="a" />
          <feComponentTransfer in="a" result="bands">
            <feFuncA type="table" tableValues="0 .75 0 .5 0 .8 0 .45 0 .7 0 .5 0" />
          </feComponentTransfer>
          <feGaussianBlur in="bands" stdDeviation="2.2" result="soft" />
          <feFlood floodColor={tint} result="c" />
          <feComposite in="c" in2="soft" operator="in" />
        </filter>
        <filter id={`${id}-s`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.004" numOctaves={3} seed={seed + 5} result="n" />
          <feDiffuseLighting in="n" surfaceScale={5} diffuseConstant={1.05} lightingColor="#ffffff">
            <feDistantLight azimuth={235} elevation={58} />
          </feDiffuseLighting>
        </filter>
      </defs>
      <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-s)`} opacity={0.22} style={{ mixBlendMode: "multiply" }} />
      <rect width={CANVAS_W} height={CANVAS_H} filter={`url(#${id}-m)`} opacity={0.24} />
    </svg>
  );
}

/**
 * Monaco "MATCHDAY": the top half is the club colour, a dark, grainy wash of ghosted giant crests and the
 * player's own photo (blurred) with light specks; a big convex white arc cuts across the middle into soft
 * marbled white paper. The full-body player stands centred, chest over the colour, legs over the white.
 * Top centre: one huge wide heavy word, the fixture in spaced bold caps and a small kick-off line.
 */
export function Arc({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 38);
  let club = clubColour(data);
  // Very light club colours would lose the white type: take them down until the white reads.
  if (luminance(club) > 0.42) club = shade(club, -0.35);
  const deep = shade(club, -0.55);
  const tint = mix(club, "#c9c3bf", 0.35);
  const m = matchFacts(data);
  const score = scoreOf(data, " – ");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();

  // ---- text ----------------------------------------------------------------------------------------
  const home = (content.homeTeam ?? "").toUpperCase().trim();
  const away = (content.awayTeam ?? "").toUpperCase().trim();
  let teams = "";
  let info = "";
  if (postType === "matchday") {
    teams = home && away ? `${home} V ${away}` : home || away || (data.club?.name ?? "").toUpperCase();
    info = [[m.date, m.time].filter(Boolean).join(" · "), m.venue].filter(Boolean).join(", ");
  } else if (postType === "result") {
    teams = name;
    info = home && away ? (score ? `${home} ${score} ${away}` : `${home} V ${away}`) : m.comp;
  } else if (postType === "goal") {
    teams = name;
    info = home && away ? (score ? `${home} ${score} ${away}` : `${home} V ${away}`) : m.comp;
  } else {
    teams = name;
    const facts = content.stats.filter((s) => s.value && String(s.value).trim() !== "0").slice(0, 3);
    info = [content.subline.toUpperCase(), ...facts.map((s) => `${s.value} ${s.label.toUpperCase()}`)].filter(Boolean).join(" · ");
  }
  const title = bestLines(content.kicker.replace(/^IT'?S\s+/i, "") || "MATCHDAY", 960 * (params.textScale ?? 1), 330, { tracking: -0.01, pitch: 0.92, cap: 0.73, maxSize: 196 });
  // Short titles stay on one line (MATCHDAY, GAME DAY): bestLines may split them when that is bigger.
  const short = content.kicker.trim().toUpperCase().replace(/^IT'?S\s+/, "");
  const oneWord = !!short && [...short.replace(/\s+/g, "")].length <= 10;
  const lines = oneWord ? [short] : title.lines;
  const tSize = oneWord ? fitInter(lines[0], 960 * (params.textScale ?? 1), 196, -0.01) : title.size;
  const titleTop = 108;
  const titleBottom = titleTop + tSize * (0.8 + (lines.length - 1) * 0.92);
  const teamsSize = fitInter(teams, 900, 46, 0.1);
  const teamsTop = titleBottom + 26;
  const infoSize = fitInter(info, 860, 23, 0.14);
  const infoTop = teamsTop + teamsSize * 1.02 + 16;
  const textBottom = infoTop + (info ? infoSize * 1.2 : 0);

  // ---- the player: centred, full length, head under the text block ---------------------------------
  const headTop = Math.max(430, textBottom + 50) + r() * 16;
  const floor = 1262;
  const placed = lift(data, standing(data, { cx: 540 + (r() - 0.5) * 30, headTop, floor, maxFace: 150, framing: "full" }), headTop + 40);
  const fig = placed.box;
  // The arc crosses the body a little under the waist: the chest sits on colour, the legs on white.
  const sag = 95 + r() * 40;
  const arcMid = Math.min(900, Math.max(700, fig.feet ? fig.top + fig.height * 0.52 : 780));
  const R = (540 * 540 + sag * sag) / (2 * sag);
  const cy = arcMid - R;

  // ---- the ghosted wash: crests and his own photo, darkened into the colour ---------------------------
  const crests = [m.ourCrest, m.oppCrest].filter(Boolean) as string[];
  const flip = r() < 0.5;
  const ghostCrest = (src: string, i: number): CSSProperties => {
    const left = (i === 0) !== flip;
    return {
      position: "absolute",
      [left ? "left" : "right"]: -170 + r() * 60,
      top: 150 + (i ? 110 : 0) + r() * 60,
      width: 640,
      height: 640,
      objectFit: "contain",
      transform: `rotate(${(left ? -1 : 1) * (6 + r() * 6)}deg)`,
      filter: "grayscale(1) contrast(1.2) blur(5px)",
      mixBlendMode: "multiply",
      opacity: 0.34,
    };
  };
  const specks = Array.from({ length: 70 }, () => ({ x: r() * CANVAS_W, y: r() * arcMid, s: 1 + r() * r() * 5, o: 0.25 + r() * 0.7, b: r() < 0.3 }));

  const figureStyle: CSSProperties = { position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.05)", ...placed.style };
  const small: CSSProperties = { fontFamily: INTER, fontWeight: 800, color: club, textTransform: "uppercase", whiteSpace: "nowrap" };
  const feetY = fig.feet ? fig.top + fig.height * 0.985 : null;
  const round = [m.comp, m.round].filter(Boolean);
  const foot = postType === "potm" ? ([data.club?.crestUrl].filter(Boolean) as string[]) : crestsOf(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: PAPER, color: WHITE }}>
      {/* The white marbled paper under everything. */}
      <Marble tint={tint} seed={Math.floor(r() * 90) + 3} id="arc-marble" />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 60% at 50% 100%, rgba(255,255,255,.7), transparent 70%)" }} />

      {/* The coloured dome, clipped to a great circle: its edge is the white arc. */}
      <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 10px 26px ${shade(club, -0.3)}55)` }}>
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${R.toFixed(0)}px at 540px ${cy.toFixed(0)}px)`, background: club, overflow: "hidden" }}>
          {data.bgPhotoUrl && (
            <img
              src={data.bgPhotoUrl}
              alt=""
              style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: arcMid + 120, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) contrast(1.35) blur(14px)", mixBlendMode: "soft-light", opacity: 0.9 }}
            />
          )}
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={ghostCrest(c, i)} />
          ))}
          {/* Deep at the top and edges, the colour glowing through in the middle. */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 55% at 50% ${arcMid * 0.7}px, transparent 20%, ${deep}e6 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${deep}c8, ${deep}40 34%, transparent 60%)` }} />
          {/* A warm lens glow in one top corner. */}
          <div style={{ position: "absolute", [flip ? "left" : "right"]: -220, top: -120 + r() * 120, width: 620, height: 620, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.55), rgba(255,255,255,.12) 40%, transparent 70%)", mixBlendMode: "screen" }} />
          <svg width={CANVAS_W} height={arcMid} style={{ position: "absolute", left: 0, top: 0 }} aria-hidden>
            <defs>
              <filter id="arc-speck-blur">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
            </defs>
            {specks.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={WHITE} opacity={s.o} filter={s.b ? "url(#arc-speck-blur)" : undefined} />
            ))}
          </svg>
          <Film strength={2.6} />
        </div>
      </div>
      {/* A thin bright rim along the arc. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <filter id="arc-rim">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <circle cx={540} cy={cy} r={R + 4} fill="none" stroke={WHITE} strokeWidth={10} opacity={0.8} filter="url(#arc-rim)" />
      </svg>

      {/* Title block. */}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: 44, transform: "translateX(-50%)", opacity: 0.9 }} />
      {lines.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: titleTop + i * tSize * 0.92 - tSize * 0.12,
            textAlign: "center",
            fontFamily: INTER,
            fontWeight: 900,
            fontSize: tSize,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            textShadow: "0 10px 40px rgba(0,0,0,.25)",
          }}
        >
          {l}
        </div>
      ))}
      {teams && (
        <div style={{ position: "absolute", left: 0, right: 0, top: teamsTop, textAlign: "center", fontFamily: INTER, fontWeight: 800, fontSize: teamsSize, lineHeight: 1, letterSpacing: "0.1em", whiteSpace: "nowrap", textShadow: "0 4px 18px rgba(0,0,0,.3)" }}>
          {teams}
        </div>
      )}
      {info && (
        <div style={{ position: "absolute", left: 0, right: 0, top: infoTop, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: infoSize, lineHeight: 1.2, letterSpacing: "0.14em", whiteSpace: "nowrap", textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>
          {info}
        </div>
      )}

      {/* The player, with a soft light around him and his shadow on the paper. */}
      {feetY != null && (
        <div style={{ position: "absolute", left: fig.left + fig.width / 2 - 230, top: feetY - 34, width: 460, height: 64, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,20,20,.38), rgba(40,20,20,.12) 60%, transparent)", filter: "blur(6px)" }} />
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 34px rgba(255,255,255,.35)) drop-shadow(0 18px 30px rgba(0,0,0,.18))" }}>
          <img src={data.photoUrl} alt="" style={figureStyle} />
        </div>
      )}

      {/* Foot of the page, on the white: competition and round left, the two crests right. */}
      {round.length > 0 && postType !== "potm" && (
        <div style={{ position: "absolute", left: 60, bottom: 52, display: "flex", flexDirection: "column", gap: 8 }}>
          {round.map((t, i) => (
            <div key={i} style={{ ...small, fontSize: Math.min(i ? 15 : 18, 300 / Math.max(1, interEm(t, 0.16))), letterSpacing: "0.16em", opacity: i ? 0.75 : 1 }}>
              {t}
            </div>
          ))}
        </div>
      )}
      {postType === "potm" && data.club?.name && (
        <div style={{ ...small, position: "absolute", left: 60, bottom: 54, fontSize: Math.min(18, 300 / Math.max(1, interEm(data.club.name.toUpperCase(), 0.16))), letterSpacing: "0.16em" }}>{data.club.name}</div>
      )}
      {foot.length > 0 && (
        <div style={{ position: "absolute", right: 60, bottom: 46, display: "flex", alignItems: "center", gap: 14 }}>
          {foot.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {i > 0 && <span style={{ ...small, fontSize: 18, fontWeight: 700 }}>V</span>}
              <img src={c} alt="" style={{ width: 62, height: 62, objectFit: "contain", filter: "drop-shadow(0 4px 10px rgba(0,0,0,.18))" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
