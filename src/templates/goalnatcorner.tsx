"use client";
/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { FACES, wordEm } from "./goalhero";
import { clearSpot, layPhoto, originalOf, spanAt, useNatAlign } from "./goalnatalign";
import { deepClub, inkFor, logoPx, nameOf, photoStyle } from "./goalnatword";
import { AgencyLogo, DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const INK = "#f4f1ea";

/**
 * Natural goal · corner — his celebration photo dominant and untouched (real grass, stands and light,
 * natural colour), with quiet editorial type in one bottom corner over a soft local shade on the grass:
 * a small "GOAL", his name, the two crests small with "v" between them (no score) and the competition in
 * tiny caps. The NEYOD logo top-right. The corner flips to the side he isn't on.
 */
export function Goalnatcorner({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const W = CANVAS_W;
  const k = story ? 1.4 : 1;
  const club = deepClub(data);
  const orig = originalOf(data);
  const { align } = useNatAlign(data);

  /* ---- the photo ---- */
  const faceH = (story ? 150 : 112) * (params.playerScale ?? 1);
  const pref = params.side === "left" ? -1 : params.side === "right" ? 1 : 0;
  // He stands a little off-centre, away from the type.
  const lay = align && data.face ? layPhoto(align, data.face, W, H, W / 2 + (pref || 1) * 120 + (params.playerX ?? 0), H * (story ? 0.3 : 0.29) + (params.playerY ?? 0), faceH, 2.4) : null;

  /* ---- the type block, from the foot up (q scales it down when the corner is tight) ---- */
  const M = story ? 72 : 64;
  const base = story ? STORY_BOTTOM : H - 64;
  const f = matchFacts(data);
  const weHostFalse = f.ourCrest && content.awayCrest === f.ourCrest && content.homeCrest === f.oppCrest;
  const crests = (weHostFalse ? [f.oppCrest, f.ourCrest] : [content.homeCrest ?? f.ourCrest, content.awayCrest ?? f.oppCrest]).filter((c): c is string => !!c);
  const name = nameOf(data);
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const block = (q: number, bottom = base) => {
    const kq = k * q;
    // Competition (and round) in tiny caps: one line when it fits the corner, else the round under it.
    const compSize = 15 * kq * ts;
    const maxW = (story ? 600 : 450) * q;
    const one = [f.comp, f.round].filter(Boolean).join(" · ");
    const compLines = one.length * compSize * 0.86 <= maxW ? [one].filter(Boolean) : [f.comp, f.round].filter(Boolean);
    const compFont = Math.min(compSize, ...compLines.map((t) => maxW / Math.max(1, t.length * 0.86)));
    const crestH = 40 * kq;
    const nameSize = Math.min(30 * kq * ts, (600 * q) / Math.max(1, name.length * 0.86));
    const wordSize = Math.min(96 * kq * ts, (560 * q) / Math.max(1, wordEm(FACES.anton, word)));
    const compTop = bottom - compFont * compLines.length - 8 * (compLines.length - 1);
    const crestTop = (compLines.length ? compTop - 18 * kq : bottom) - crestH;
    const nameTop = (crests.length ? crestTop - 30 * kq : compLines.length ? compTop - 30 * kq : bottom) - nameSize;
    const wordTop = nameTop - 14 * kq - wordSize * 0.86 + (params.textY ?? 0);
    const width = Math.max(
      wordSize * wordEm(FACES.anton, word),
      name.length * nameSize * 0.86,
      ...compLines.map((t) => t.length * compFont * 0.86),
      crests.length * crestH + 40 * kq,
    );
    return { kq, compLines, compFont, crestH, nameSize, wordSize, wordTop, width, bottom };
  };
  // The corner he leaves most room in (his preferred side first), measured on his silhouette; when his legs
  // fill the foot, the block rises (a little) to where there is room beside him.
  let left = lay ? lay.face.x + lay.face.w / 2 >= W / 2 : pref >= 0;
  let B = block(1);
  if (align && lay) {
    const freeAt = (b: ReturnType<typeof block>, l: boolean) => {
      const [lo, hi] = spanAt(align, lay.fig, b.wordTop - 10, b.bottom + 10);
      return l ? lo - M - 28 : W - M - 28 - hi;
    };
    const rise = story ? 520 : 200;
    let best = { score: -1, l: left, b: B };
    for (let up = 0; up <= rise; up += 20) {
      const b = block(1, base - up);
      for (const l of [left, !left]) {
        // Fit first, then staying low, then his preferred side.
        const fit = Math.min(1, freeAt(b, l) / b.width);
        const score = fit - up / 4000 - (l === left ? 0 : 0.02);
        if (score > best.score) best = { score, l, b };
      }
      if (best.score >= 0.98) break;
    }
    left = best.l;
    B = best.b;
    const q = Math.max(0.74, Math.min(1, freeAt(B, left) / B.width));
    if (q < 1) B = block(q, B.bottom);
  }
  const bottom = B.bottom;
  const { kq, compLines, compFont, crestH, nameSize, wordSize, wordTop } = B;

  const ink = align && lay ? inkFor(align, lay, left ? 0 : W / 2, wordTop - 20, left ? W / 2 : W, bottom + 20, club) : INK;
  const dark = ink !== INK;
  const sub = dark ? "#1d2024" : INK;
  const logoH = logoPx(24, story);
  // Top-right, unless his head or a raised arm is there: then top-left.
  const logoTop = (story ? STORY_TOP : 56) - (params.logoY ?? 0);
  const logoW = logoH * 3;
  const logoLeft = align && lay ? clearSpot(align, lay.fig, [{ x: W - M - logoW, y: logoTop, w: logoW, h: logoH }, { x: M, y: logoTop, w: logoW, h: logoH }]) === 1 : false;
  const lx = logoLeft ? M : W - M - logoW;
  const logoInk = align && lay ? inkFor(align, lay, lx, logoTop, lx + logoW, logoTop + logoH, club) !== INK : false;

  const align0 = left ? "flex-start" : "flex-end";
  const pos = left ? { left: M } : { right: M };

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#1b1d1a" }}>
      {align && lay ? (
        <>
          <img src={orig!} alt="" style={photoStyle(lay, align, "contrast(1.03) saturate(1.03)")} />
          {/* His own sharp cutout laid exactly over him (the photo upscaled alone goes soft on the face). */}
          {data.photoUrl && <img src={data.photoUrl} alt="" style={{ position: "absolute", left: lay.fig.x, top: lay.fig.y, width: lay.fig.w, height: lay.fig.h, maxWidth: "none", filter: "contrast(1.03) saturate(1.03)" }} />}
        </>
      ) : (
        orig && <img src={orig} alt="" style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", objectPosition: "50% 25%" }} />
      )}

      {/* Soft local shade on the grass under the type. */}
      {!dark && (
        <div
          style={{
            position: "absolute",
            [left ? "left" : "right"]: -200,
            top: wordTop - 260,
            width: 1000,
            height: H - wordTop + 460,
            background: `radial-gradient(closest-side at ${left ? "28%" : "72%"} 62%, rgba(0,0,0,.52), rgba(0,0,0,.22) 60%, transparent)`,
          }}
        />
      )}

      <div style={{ position: "absolute", ...pos, top: wordTop, display: "flex", flexDirection: "column", alignItems: align0, textAlign: left ? "left" : "right", color: sub }}>
        <div style={{ fontFamily: DISPLAY, fontSize: wordSize, lineHeight: 0.86, letterSpacing: "0.01em", color: dark ? club : INK, textShadow: dark ? undefined : "0 3px 22px rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>{word}</div>
        {name && (
          <div style={{ marginTop: 14 * kq, fontFamily: SANS, fontWeight: 600, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.24em", marginRight: left ? 0 : "-0.24em", whiteSpace: "nowrap", textShadow: dark ? undefined : "0 2px 12px rgba(0,0,0,.4)" }}>
            {name}
          </div>
        )}
        {crests.length > 0 && (
          <div style={{ marginTop: 30 * kq, height: crestH, display: "flex", alignItems: "center", gap: 14 * kq }}>
            <img src={crests[0]} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.3))" }} />
            {crests[1] && (
              <>
                <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 18 * kq, opacity: 0.85 }}>v</span>
                <img src={crests[1]} alt="" style={{ height: crestH, width: crestH, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.3))" }} />
              </>
            )}
          </div>
        )}
        {compLines.map((t, i) => (
          <div key={i} style={{ marginTop: i ? 8 : 18 * kq, fontFamily: SANS, fontWeight: 500, fontSize: compFont, lineHeight: 1, letterSpacing: "0.2em", marginRight: left ? 0 : "-0.2em", opacity: 0.82, whiteSpace: "nowrap" }}>
            {t}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        onLight={logoInk}
        style={{ position: "absolute", [logoLeft ? "left" : "right"]: M, top: logoTop, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: logoLeft ? "left top" : "right top" }}
      />
    </div>
  );
}
