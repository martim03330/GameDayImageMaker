/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { Film } from "./fx";
import { placeByFace } from "./outline";
import { capsEm } from "./rippleecho";
import { SANS } from "./shared";
import { matchFacts } from "./strokes";
import { teamsOf } from "./notify";
import { niceDate } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";
import { EchoFigure, EchoLogo, echoSetup } from "./echotitle";

const WHITE = "#ffffff";
const DIM = "rgba(255,255,255,.56)";
const M = 64;

/**
 * Echo micro: echoline's player and hairline echo fill the sheet; every word is tiny, wide-tracked caps
 * pinned to the corners and edges (micro's idea). Top free corner: a short hairline in the echo's colour and
 * the title, the competition under it; top other corner: the two crests, small. Bottom corners: the fixture
 * (home first, names as stored) and date · kick-off · ground, level with the centred agency mark. Up the
 * free edge, very small, his number and surname.
 */
export function Echomicro({ data }: { data: RenderData }) {
  const { params, content } = data;
  const s = echoSetup(data, 23);
  const f = matchFacts(data);
  const k = s.story ? 1.36 : 1;
  const ty = params.textY ?? 0;

  /* ---- the player, a little towards his side, bigger than echoline (no title over him) ---- */
  const fx = s.story ? (s.right ? 600 : 480) : s.right ? 590 : 490;
  const box = s.story
    ? placeByFace(data, fx, 340, { chest: 430, waist: 340, knees: 248, full: 186 })
    : placeByFace(data, fx, 212, { chest: 300, waist: 236, knees: 176, full: 134 });

  /* ---- corners ---- */
  const top = (s.story ? STORY_TOP : M) + ty;
  // Bottom corners sit level with the agency mark (beside it, never stacked over it).
  const bottom = s.story ? s.H - STORY_BOTTOM : 44;
  // Each corner block keeps clear of the centred mark (~3.1× its height wide).
  const logoW = (s.story ? 88 : 52) * 3.1;
  const room = CANVAS_W / 2 - logoW / 2 - 60 - M;
  const fit = (t: string, max: number, track: number, min = 10) => Math.max(min, Math.min(max * k, room / Math.max(1, capsEm(t, track)))) * s.ts;
  const caps = (size: number, track: number, color = WHITE, weight = 500): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    color,
    // Tracking trails the last glyph: pull it back on the right-aligned side.
    ...(s.right ? {} : { marginRight: `-${track}em` }),
  });
  const free: CSSProperties = s.right ? { left: M, textAlign: "left", alignItems: "flex-start" } : { right: M, textAlign: "right", alignItems: "flex-end" };
  const own: CSSProperties = s.right ? { right: M, textAlign: "right", alignItems: "flex-end" } : { left: M, textAlign: "left", alignItems: "flex-start" };
  const ownCaps = (size: number, track: number, color = WHITE, weight = 500): CSSProperties => ({ ...caps(size, track, color, weight), ...(s.right ? { marginRight: `-${track}em` } : { marginRight: 0 }) });

  const title = (content.kicker || "MATCHDAY").toUpperCase().replace(/’/g, "'");
  const comp = [f.comp, f.round && f.round !== f.comp ? f.round : ""].filter(Boolean);
  // Competition and round share one size (the longer one fits).
  const compSize = Math.min(...comp.map((c) => fit(c, 11, 0.3, 9)), 11 * k * s.ts);
  const [home, away] = teamsOf(data).map((t) => t.toUpperCase());
  const when = [niceDate(content.date).toUpperCase(), f.time ? `KICK-OFF ${f.time}` : "", (f.venue || "").toUpperCase()].filter(Boolean);
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const CR = 34 * k;
  const gap = 12 * k;
  const hair = s.white ? "rgba(255,255,255,.8)" : s.echo;

  /* ---- up the free edge: number and surname ---- */
  const num = (data.player.number || "").replace(/\D/g, "");
  const surname = (content.lastName || content.firstName || "").toUpperCase();
  // Only where the free edge is clear of him (a wide action photo can reach it).
  const edgeClear = s.right ? box.left > 90 : box.left + box.width < CANVAS_W - 90;
  const edge = edgeClear ? [num ? `NO. ${num}` : "", surname].filter(Boolean).join("   ·   ") : "";
  const eSize = 11 * k * s.ts;
  const ex = s.right ? 34 * k : CANVAS_W - 34 * k;

  const block = (side: CSSProperties, anchor: CSSProperties, children: ReactNode) => (
    <div style={{ position: "absolute", ...side, ...anchor, display: "flex", flexDirection: "column" }}>{children}</div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: s.H, overflow: "hidden", background: s.deep, color: WHITE }}>
      <EchoFigure data={data} s={s} box={box} id="echomicro" light={[s.right ? 56 : 44, 40]} />

      {/* Top, free corner: hairline, title, competition. */}
      {block(
        free,
        { top },
        <>
          <div style={{ width: 36 * k, height: 1.5, background: hair, marginBottom: 22 * k }} />
          <div style={caps(fit(title, 15, 0.5, 12), 0.5, WHITE, 600)}>{title}</div>
          {comp.map((c, i) => (
            <div key={i} style={{ ...caps(compSize, 0.3, DIM), marginTop: (i ? 9 : 16) * k }}>
              {c}
            </div>
          ))}
        </>,
      )}

      {/* Top, his corner: the crests, small. */}
      {crests.length > 0 &&
        block(
          own,
          { top: top - 4 * k },
          <div style={{ display: "flex", gap, flexDirection: s.right ? "row" : "row-reverse" }}>
            {crests.map((c, i) => (
              <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain" }} />
            ))}
          </div>,
        )}

      {/* Bottom, free corner: the fixture. */}
      {home &&
        block(
          free,
          { bottom },
          <>
            <div style={caps(fit(home, 14, 0.22, 10), 0.22)}>{home}</div>
            {away && <div style={{ ...caps(fit(`V  ${away}`, 14, 0.22, 10), 0.22), marginTop: 9 * k }}>V&nbsp;&nbsp;{away}</div>}
          </>,
        )}

      {/* Bottom, his corner: date, kick-off, ground. */}
      {when.length > 0 &&
        block(
          own,
          { bottom },
          <>
            {when.map((t, i) => (
              <div key={i} style={{ ...ownCaps(fit(t, i === 0 ? 14 : 12, 0.22, 9), 0.22, i === 0 ? WHITE : "rgba(255,255,255,.8)", i === 0 ? 500 : 400), marginTop: i ? 9 * k : 0 }}>
                {t}
              </div>
            ))}
          </>,
        )}

      {/* Up the free edge, very small. */}
      {edge && (
        <svg data-bleed width={CANVAS_W} height={s.H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text
            transform={`translate(${ex} ${(s.story ? (STORY_TOP + STORY_BOTTOM) / 2 : CANVAS_H / 2) + ty}) rotate(${s.right ? -90 : 90})`}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-inter), system-ui, sans-serif"
            fontWeight={500}
            fontSize={eSize}
            letterSpacing={`${0.42}em`}
            fill={DIM}
          >
            {edge}
          </text>
        </svg>
      )}

      <EchoLogo data={data} s={s} />
      <Film strength={0.18} />
    </div>
  );
}
