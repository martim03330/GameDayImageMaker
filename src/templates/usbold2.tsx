/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { ANTON, em } from "./mist";
import { BEBAS, CONDENSED, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { CREST_HALO } from "./usgame1";
import { capsStyle, facts, fitFigure, frame, groundOf, Logo, Player, stackWords, wrapCaps } from "./usbold1";

/*
 * Round 76 · two more bold US gameday looks in the "Faixa lateral" / "Banda do emblema" / usbold1 family,
 * each adapting one real college soccer gameday graphic (Pinterest "d1 soccer game day graphic").
 * Laid out for 1080×1350; in the story (H/dy) the colour fields run the full height.
 */

/**
 * The player as a big half-figure rising from the canvas foot: the face at `faceH`, the head at `headTop`,
 * the body running off the bottom edge (a full-body photo is simply cropped by the edge). A photo that
 * ends above the edge is lowered until it reaches it, so he never floats.
 */
function bust(data: RenderData, o: { cx: number; headTop: number; faceH: number; H: number }) {
  const p = data.params;
  const face = data.face ?? [0.4, 0.06, 0.2, 0.12];
  const aspect = data.photoAspect ?? 0.5;
  const hair = Math.max(0, face[1] - face[3] * 0.6);
  const cap = data.facePx > 0 ? data.facePx * 2.1 : 400;
  let h = Math.min(o.faceH, cap) / face[3];
  h *= p.playerScale ?? 1;
  let top = o.headTop - hair * h;
  if (top + h < o.H) top = o.H - h;
  const w = h * aspect;
  const fx = face[0] + face[2] / 2;
  const left = o.cx - fx * w + (p.playerX ?? 0);
  top += p.playerY ?? 0;
  return { left, top, width: w, height: h, faceCx: left + fx * w, faceTop: top + face[1] * h, faceH: face[3] * h };
}

/* =============================================================================================================
 * 1 · Giant "GAME / DAY" (Georgia Southern women's soccer at ODU — Pinterest "d1 soccer game day graphic",
 * row 3 col 3): a soft white-to-grey ground; two colour blocks hanging from the top edge with the two crests;
 * one line of facts under them (date | kick-off | city); the kicker in two gigantic deep club-colour lines
 * that fill the width, the short second line spaced out to the same width; him big in front, from the
 * head just under the first line's top down off the canvas foot, covering the middle of both lines.
 * ========================================================================================================== */
export function Usgamegiant({ data }: { data: RenderData }) {
  const { H, dy, ts, logoTop } = frame(data);
  const { club, deep, ink } = groundOf(data);
  const f = facts(data);
  const story = H > CANVAS_H;

  // ---- the header: crest blocks hanging from the top edge ----
  const blockW = 172;
  const blockH = 128 + (story ? dy * 0.62 : 0);
  const crestS = 92;
  const crests = [f.ourCrest, f.oppCrest].filter(Boolean) as string[];
  const tint = luminance(club) > 0.5 ? shade(club, -0.2) : shade(club, 0.42);
  const blocks = crests.length ? crests : [""];
  const blocksLeft = CANVAS_W / 2 - (blocks.length * blockW) / 2;

  // ---- the facts line(s) ----
  const lineW = 940;
  const t1 = wrapCaps(f.ours, lineW, 30 * ts, 18, 0.06, 2, 0.58);
  const t2 = wrapCaps(`VS ${f.opp}`, lineW, 30 * ts, 18, 0.06, 2, 0.58);
  const tPx = Math.min(t1.px, t2.px);
  const teams = { px: tPx, lines: [...wrapCaps(f.ours, lineW, tPx, tPx, 0.06, 9, 0.58).lines, ...wrapCaps(`VS ${f.opp}`, lineW, tPx, tPx, 0.06, 9, 0.58).lines] };
  const when = [f.date, [f.time, f.second].filter(Boolean).join(" "), f.venue].filter(Boolean).join("  |  ");
  const whenW = wrapCaps(when, lineW, 27 * ts, 16, 0.06, 2, 0.58);
  const factsTop = blockH + 22;
  const factsH = teams.lines.length * teams.px * 1.18 + 6 + whenW.lines.length * whenW.px * 1.2;

  // ---- the words ----
  const words = stackWords(data.content.kicker);
  const W = CANVAS_W - 2 * 54;
  const px = Math.min(...words.map((w) => W / em(w, ANTON, 44)));
  const capK = 0.9; // Anton cap height / size (measured)
  const targetCap = story ? 420 : 380;
  const sy = Math.min(1.12, Math.max(1, targetCap / (px * capK)));
  const cap = px * capK * sy;
  const gap = 26;
  const wordsTop = factsTop + factsH + (story ? 44 : 30);
  const longest = Math.max(...words.map((w) => em(w, ANTON, 44)));

  // ---- him ----
  const faceH = story ? 168 : 150;
  const b0 = bust(data, { cx: CANVAS_W / 2, headTop: wordsTop + 18, faceH, H });
  // Centre the body, not the face (a side-on run would leave him half off the canvas), keeping the face central.
  const want = CANVAS_W / 2 - (b0.left + b0.width / 2);
  const shift = Math.max(330, Math.min(750, b0.faceCx + want)) - b0.faceCx;
  const b = { ...b0, left: b0.left + (data.params.playerX ? 0 : shift) };
  const hasFig = !!data.photoUrl;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#eceef2" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(75% 55% at 50% 42%, #ffffff, #f0f1f4 50%, #d6d9df 100%)" }} />

      {blocks.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: blocksLeft + i * blockW, top: 0, width: blockW, height: blockH, background: i === 0 ? deep : tint, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: (blockH - crestS) / 2 > 40 ? 18 : (blockH - crestS) / 2, boxSizing: "border-box" }}>
          {c && <img src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
      ))}

      <div style={{ position: "absolute", left: (CANVAS_W - lineW) / 2, top: factsTop, width: lineW, textAlign: "center" }}>
        {teams.lines.map((t, i) => (
          <div key={i} style={capsStyle(teams.px, 800, 0.06, ink, { lineHeight: 1.18 })}>
            {t}
          </div>
        ))}
        <div style={{ height: 6 }} />
        {whenW.lines.map((t, i) => (
          <div key={i} style={capsStyle(whenW.px, 600, 0.06, ink, { lineHeight: 1.2, opacity: 0.85 })}>
            {t}
          </div>
        ))}
      </div>

      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        {words.map((w, i) => {
          const base = wordsTop + cap + i * (cap + gap);
          const spaced = em(w, ANTON, 44) < longest * 0.85;
          return (
            <g key={i} transform={`translate(0 ${base.toFixed(1)}) scale(1 ${sy.toFixed(3)})`}>
              <text x={54} y={0} textLength={W} lengthAdjust={spaced ? "spacing" : "spacingAndGlyphs"} style={{ fontFamily: DISPLAY, fontSize: px }} fill={ink} stroke={ink} strokeWidth={px * 0.035} strokeLinejoin="round">
                {w}
              </text>
            </g>
          );
        })}
      </svg>

      {hasFig && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 22px 40px rgba(10,16,30,.28))" }}>
          <img src={data.photoUrl!} alt="" style={{ position: "absolute", left: b.left, top: b.top, width: b.width, height: b.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut ? { ...data.cut, bottom: b.top + b.height <= H + 2 ? 0 : data.cut.bottom } : undefined) }} />
        </div>
      )}

      <Logo data={data} top={logoTop} onLight />
    </div>
  );
}

/* =============================================================================================================
 * 2 · Mixed-scale "GAME" + "DAY" (Harvard women's soccer v Boston University — Pinterest "d1 soccer game day
 * graphic", row 5 col 4): a dark slate ground with the club colour glowing up from the foot; his club's exact
 * name small in the club colour at the top; the first kicker word tall, thin and condensed in the club colour,
 * the second small, bold and pale beside its foot with the two crests above it; the teams in white spaced caps
 * ("vs." small), the kick-off, ground and date under them; him full-body (crouched or standing) below, with his
 * name and position in white caps beside his shoulder.
 * ========================================================================================================== */
export function Usgamemixed({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const { club } = groundOf(data);
  const f = facts(data);
  const story = H > CANVAS_H;
  const l = luminance(club);
  const accent = l < 0.1 ? shade(club, 0.5) : l > 0.6 ? shade(club, -0.3) : club;
  const glow = l < 0.06 ? shade(club, 0.35) : club;
  const slate = "#1c212d";
  const pale = "#c9ccd3";
  const top0 = story ? 170 : 0;

  // ---- the club name, top centre ----
  const clubW = wrapCaps((data.club?.name || f.ours).toUpperCase(), 800, 40 * ts, 20, 0.04, 2, 0.58);
  const clubTop = 74 + top0;
  const subTop = clubTop + clubW.lines.length * clubW.px * 1.05 + 2;

  // ---- the words: big word, the small word beside its foot, the crests above the small word ----
  const words = stackWords(data.content.kicker);
  const big = words[0];
  const small = words.slice(1).join(" ");
  const bigCap = 268;
  const bigPx = bigCap / 0.7; // Bebas cap height ≈ 0.7 em
  const bigNat = em(big, ANTON, 44) * 0.8 * bigPx;
  const smallPx = 140;
  const smallCap = smallPx * 0.7;
  const smallW = small ? Math.max(214, em(small, ANTON, 44) * 0.86 * smallPx * 0.86) : 0;
  const gapX = 22;
  const maxBig = CANVAS_W - 120 - (small ? smallW + gapX : 0);
  const bigW = Math.min(maxBig, bigNat * 0.8);
  const blockW = bigW + (small ? gapX + smallW : 0);
  const x0 = (CANVAS_W - blockW) / 2;
  const baseline = subTop + 60 + bigCap;
  const crests = [f.ourCrest, f.oppCrest].filter(Boolean) as string[];
  const crestS = Math.min(104, (Math.max(smallW, 200) - 16 * (crests.length - 1)) / Math.max(1, crests.length));
  const crestX = small ? x0 + bigW + gapX : x0 + bigW + gapX;
  const crestTop = small ? baseline - smallCap - 34 - crestS : baseline - crestS;

  // ---- teams and facts ----
  const lineW = 960;
  const teams = wrapCaps(`${f.ours} VS. ${f.opp}`, lineW, 40 * ts, 22, 0.05, 3, 0.6);
  const when = [f.date, [f.time, f.second].filter(Boolean).join(" "), f.venue].filter(Boolean).join("  |  ");
  const whenW = wrapCaps(when, lineW, 23 * ts, 14, 0.1, 2, 0.58);
  const teamsTop = baseline + 30;
  const whenTop = teamsTop + teams.lines.length * teams.px * 1.15 + 8;
  const factsBottom = whenTop + whenW.lines.length * whenW.px * 1.3;

  // ---- him ----
  const floor = Math.min(logoTop - 34, story ? 1620 : 1290);
  const headTop = Math.max(factsBottom + (story ? 44 : 60), floor - (story ? 1000 : 660));
  const fig = fitFigure(data, { cx: CANVAS_W / 2, headTop, floor, maxFace: story ? 150 : 112, minLeft: 24, maxRight: CANVAS_W - 24, minCx: 420, maxCx: 660 });

  // ---- his name beside the shoulder (on the side with more room) ----
  const first = (data.content.firstName || "").toUpperCase();
  const last = (data.content.lastName || "").toUpperCase();
  const name = [first, last].filter(Boolean).join(" ");
  // clear of his arms: two and a half face-heights out from the face centre
  const reach = fig.face.h * 2.5;
  const edgeR = Math.max(fig.face.cx + reach, fig.box.left + fig.box.width * 0.86);
  const edgeL = Math.min(fig.face.cx - reach, fig.box.left + fig.box.width * 0.14);
  const roomR = CANVAS_W - 44 - edgeR;
  const roomL = edgeL - 44;
  const onRight = roomR >= roomL;
  const nameRoom = Math.max(180, Math.min(330, onRight ? roomR : roomL));
  const nameW = wrapCaps(name, nameRoom, 30 * ts, 18, 0.05, 2, 0.6);
  const pos = [data.player.position, data.player.number ? `NO. ${data.player.number}` : ""].filter(Boolean).join("  |  ").toUpperCase();
  const nameTop = fig.face.top + fig.face.h * 1.5;
  const nameX = onRight ? Math.min(CANVAS_W - 44 - nameRoom, edgeR) : Math.max(44, edgeL - nameRoom);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: slate }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${slate} 0%, #222836 55%, ${shade(glow, -0.62)} 88%, ${shade(glow, -0.5)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(62% 34% at 14% 100%, ${glow}, rgba(0,0,0,0) 100%)`, opacity: 0.8 }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 22% at 50% 100%, ${glow}, rgba(0,0,0,0) 100%)`, opacity: 0.3 }} />

      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: clubTop, textAlign: "center" }}>
        {clubW.lines.map((t, i) => (
          <div key={i} style={capsStyle(clubW.px, 800, 0.04, accent, { lineHeight: 1.05 })}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: subTop, textAlign: "center", ...capsStyle(15, 700, 0.32, "rgba(255,255,255,.75)") }}>SOCCER</div>

      <svg width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={x0} y={baseline} textLength={bigW} lengthAdjust="spacingAndGlyphs" style={{ fontFamily: BEBAS, fontSize: bigPx }} fill={accent}>
          {big}
        </text>
        {small && (
          <text x={x0 + bigW + gapX} y={baseline} textLength={smallW} lengthAdjust="spacingAndGlyphs" style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: smallPx }} fill={pale}>
            {small}
          </text>
        )}
      </svg>
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: crestX, top: crestTop, display: "flex", gap: 16 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain", filter: CREST_HALO }} />
          ))}
        </div>
      )}

      <div style={{ position: "absolute", left: (CANVAS_W - lineW) / 2, top: teamsTop, width: lineW, textAlign: "center" }}>
        {teams.lines.map((t, i) => (
          <div key={i} style={capsStyle(teams.px, 800, 0.05, "#ffffff", { lineHeight: 1.15 })}>
            {t.split(/(\bVS\.)/).map((s, j) =>
              s === "VS." ? (
                <span key={j} style={{ fontSize: "0.62em", fontWeight: 600, textTransform: "lowercase", letterSpacing: "0.02em", opacity: 0.9 }}>
                  vs.
                </span>
              ) : (
                s
              ),
            )}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: (CANVAS_W - lineW) / 2, top: whenTop, width: lineW, textAlign: "center" }}>
        {whenW.lines.map((t, i) => (
          <div key={i} style={capsStyle(whenW.px, 600, 0.1, "rgba(255,255,255,.88)", { lineHeight: 1.3 })}>
            {t}
          </div>
        ))}
      </div>

      <Player data={data} cx={fig.cx} headTop={fig.headTop} floor={floor} maxFace={story ? 150 : 112} shadow="rgba(0,0,0,.5)" />

      {name && (
        <div style={{ position: "absolute", left: nameX, top: nameTop, width: nameRoom, textAlign: onRight ? "left" : "right" }}>
          {nameW.lines.map((t, i) => (
            <div key={i} style={capsStyle(nameW.px, 800, 0.05, "#ffffff", { lineHeight: 1.1 })}>
              {t}
            </div>
          ))}
          {pos && <div style={{ marginTop: 6, ...capsStyle(15, 600, 0.18, "rgba(255,255,255,.72)") }}>{pos}</div>}
        </div>
      )}

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}
