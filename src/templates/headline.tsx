/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { hueOf, shade, vivid } from "@/lib/color";
import { cutMask, Film, Grass } from "./fx";
import { opponentOf, rng, SCRIPT } from "./kit";
import { competitionOf, OwnPhotoBlur, placeByFace, sceneOf, scoreOf } from "./outline";
import { AgencyLogo, BEBAS, CONDENSED } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";
/** Little words set tiny and stacked between the big ones ("MAN [of the] MATCH"). */
const SMALL_WORDS = new Set(["OF", "THE", "BY", "IN", "ON", "TO", "A", "AN", "AT", "IT'S", "ITS"]);
/** Bebas Neue: average advance of a capital, relative to the font size. */
const BEBAS_RATIO = 0.405;
/** Bebas Neue capital height, relative to the font size. */
const CAP = 0.7;

const WEEKDAY: Record<string, string> = { SUN: "SUNDAY", MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY" };
const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "TH" : ["TH", "ST", "ND", "RD"][n % 10] ?? "TH"}`;

type Seg = { kind: "big"; text: string } | { kind: "stack"; lines: string[] } | { kind: "block"; lines: string[]; foot?: string };

/** "MAN OF THE MATCH" → MAN · [OF / THE] · MATCH. */
function titleSegs(kicker: string): Seg[] {
  const out: Seg[] = [];
  for (const w of kicker.toUpperCase().trim().split(/\s+/).filter(Boolean)) {
    const prev = out[out.length - 1];
    if (SMALL_WORDS.has(w)) {
      if (prev?.kind === "stack") prev.lines.push(w);
      else out.push({ kind: "stack", lines: [w] });
    } else if (prev?.kind === "big") prev.text += ` ${w}`;
    else out.push({ kind: "big", text: w });
  }
  // A title made only of little words stays big.
  return out.some((s) => s.kind === "big") ? out : [{ kind: "big", text: kicker.toUpperCase() }];
}

/** Widths of each segment for a big size `s`. */
function segWidth(seg: Seg, s: number): number {
  if (seg.kind === "big") return [...seg.text].length * s * BEBAS_RATIO;
  if (seg.kind === "stack") return Math.max(...seg.lines.map((l) => [...l].length)) * stackSize(seg, s) * BEBAS_RATIO;
  return Math.max(...seg.lines.map((l) => [...l].length)) * blockSize(seg, s) * BEBAS_RATIO;
}
const stackSize = (seg: Seg, s: number) => s * (seg.kind === "stack" && seg.lines.length === 1 ? 0.62 : 0.46);
/** One line (a score) sits big on top of its caption; two lines (date / time) share the cap height. */
const blockSize = (seg: Seg, s: number) => s * (seg.kind === "block" && seg.lines.length === 1 ? 0.64 : 0.4);

/** A texture of clouds: fractal noise turned into soft white wisps (and darker undersides when `dramatic`). */
function Clouds({ dramatic, seed }: { dramatic: boolean; seed: number }) {
  const url = (matrix: string, freq: string, oct: number) =>
    `url("data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='900'><filter id='c' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='${oct}' seed='${seed}'/><feColorMatrix values='${matrix}'/></filter><rect width='100%' height='100%' filter='url(#c)'/></svg>`,
    )}")`;
  // Noise → alpha with a threshold: only the brighter half of the noise becomes cloud.
  const white = url(`0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${dramatic ? "0 0 0 3.4 -1.4" : "0 0 0 2.8 -1.3"}`, "0.0024 0.0052", 6);
  const shadow = url("0 0 0 0 0.05  0 0 0 0 0.07  0 0 0 0 0.12  0 0 0 3 -1.6", "0.0045 0.009", 4);
  const fade: CSSProperties = { WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 92%)", maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 92%)" };
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: 900, ...fade }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: white, backgroundRepeat: "no-repeat", filter: "blur(1.5px)", opacity: dramatic ? 0.9 : 0.8 }} />
      {dramatic && <div style={{ position: "absolute", inset: 0, backgroundImage: shadow, backgroundPosition: "60px 40px", opacity: 0.55, mixBlendMode: "multiply" }} />}
    </div>
  );
}

/** Coarse print speckle for the dramatic take (ink specks and paper dust). */
const SPECKLE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' seed='9'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 4.2'/></filter><rect width='100%' height='100%' filter='url(#s)'/></svg>`,
)}")`;

/**
 * College "COACH OF THE YEAR" / "FRIDAY AUG 29TH" poster: sky and clouds over the real ground, the player
 * in front of one enormous condensed title (tiny stacked words between the big ones, a stacked date or
 * score block at its end), his name signed across the title's corner in the club colour, a round badge,
 * film grain. Two takes: sunny and washed (grass band at the foot) or dramatic and grungy.
 */
export function Headline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 71);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const dramatic = r() < 0.45;
  const cloudSeed = 1 + Math.floor(r() * 50);
  const scene = sceneOf(data);

  // ---- the title ----
  let segs: Seg[];
  let above = competitionOf(data);
  /** Tiny lines beside the badge. */
  let caption: string[] = [];
  const score = scoreOf(data);
  const opp = opponentOf(data).toUpperCase();
  const dm = /^()(\d{1,2})\s+([A-Z]{3})/.exec((content.date ?? "").toUpperCase());
  if (postType === "matchday") {
    const lines = dm ? [`${dm[3]} ${ordinal(Number(dm[2]))}`, content.time ?? ""].filter(Boolean) : [content.date ?? "", content.time ?? ""].filter(Boolean);
    const foot = (content.venue ?? "").toUpperCase();
    segs = [{ kind: "big", text: content.kicker.toUpperCase().replace(/\s+/g, "") }];
    if (lines.length) segs.push({ kind: "block", lines, foot });
    above = [opp ? `VS. ${opp}` : ""].filter(Boolean).join("  ·  ") || above;
  } else {
    segs = titleSegs(content.kicker);
    const bigCount = segs.filter((s) => s.kind === "big").length;
    const facts = content.stats.filter((s) => s.value && !/-/.test(s.value) && Number(s.value) !== 0).slice(0, 2);
    // Short titles get a stacked block at the end: the score, the numbers or the contract year.
    if (bigCount === 1 && segs.length <= 2) {
      if (postType === "goal" && score) segs.push({ kind: "block", lines: [score], foot: opp ? `VS ${opp}` : "" });
      else if (postType === "renewal" && content.until) segs.push({ kind: "block", lines: ["UNTIL", content.until] });
    }
    if (postType === "stats" || postType === "potm") caption = facts.map((f) => `${f.value} ${f.label}`.toUpperCase());
    if (postType === "potm" || postType === "stats") above = content.subline.toUpperCase() || above;
    if (postType === "renewal") above = (data.club?.name ?? "").toUpperCase();
  }

  const W = 950 * (params.textScale ?? 1);
  const gapK = 0.1;
  const coef = segs.reduce((a, sg) => a + segWidth(sg, 1), 0) + gapK * (segs.length - 1);
  const S = Math.max(110, Math.min(360, W / coef));
  const widths = segs.map((sg) => segWidth(sg, S));
  const total = widths.reduce((a, b) => a + b, 0) + gapK * S * (segs.length - 1);
  const x0 = 540 - total / 2;
  const xs = widths.map((_, i) => x0 + widths.slice(0, i).reduce((a, b) => a + b, 0) + gapK * S * i);
  const capH = S * CAP;
  const titleTop = 250 + r() * 20;

  // ---- the player: his head over the lower half of the widest big word ----
  let widest = 0;
  segs.forEach((sg, i) => {
    if (sg.kind === "big" && widths[i] > (segs[widest].kind === "big" ? widths[widest] : 0)) widest = i;
  });
  const lean = params.side === "left" ? -0.18 : params.side === "right" ? 0.18 : 0;
  // Two words in one big run ("NEW DEAL"): the head goes in the gap between them.
  const big = segs[widest].kind === "big" ? (segs[widest] as { text: string }).text : "";
  const space = big.indexOf(" ", Math.floor(big.length / 2) - 2);
  const faceX = Math.min(
    820,
    Math.max(260, space > 0 ? xs[widest] + (space + 0.5) * S * BEBAS_RATIO : xs[widest] + widths[widest] * (0.5 + lean)),
  );
  // The hair just reaches into the lower half of the letters.
  const faceTop = titleTop + capH * (params.framing === "chest" ? 1 : 0.92);
  const fig = placeByFace(data, faceX, faceTop, { chest: 180, waist: 140, knees: 112, full: 92 });

  // ---- signature: across the title's lower corner, away from the face ----
  const full = [content.firstName, content.lastName].filter(Boolean).join(" ");
  const sig = full.length <= 16 ? full : content.lastName || content.firstName;
  const sigLeft = faceX > 540;
  // Room beside the face (with the hair and ears): the signature is sized to that gap, never across the face.
  const faceHalf = fig.faceH * 0.75;
  const edge = sigLeft ? Math.max(60, xs[0] - 10) : Math.max(60, CANVAS_W - (x0 + total) - 10);
  const room = sigLeft ? faceX - faceHalf - edge : CANVAS_W - edge - (faceX + faceHalf);
  const sigS = Math.min(132, room / Math.max(4, [...sig].length * 0.4));
  // Under the block's caption when it signs on that side.
  // Blue clubs sign in white: their colour would vanish into the sky.
  const h = hueOf(accent);
  const sigColor = h != null && h >= 185 && h <= 255 && !dramatic ? WHITE : accent;
  // The badge sits in the bottom corner away from the player.
  const badgeRight = faceX <= 540;
  const blockSide = segs[segs.length - 1].kind === "block" && !sigLeft;
  // Just under the title, its tall strokes brushing the letters' feet.
  const last = segs[segs.length - 1];
  const blockBottom = last.kind === "block" ? titleTop + last.lines.length * blockSize(last, S) * 0.9 + (last.foot ? 36 : 0) : 0;
  const sigY = blockSide ? Math.max(titleTop + capH * 1.02, blockBottom + 8) : titleTop + capH * 1.02;

  // Stormy blue-grey with a breath of the club colour (a club-coloured sky reads as a filter, not weather).
  const tint = (base: string, k: number) => (hueOf(accent) == null ? base : `color-mix(in srgb, ${base} ${100 - k}%, ${accent})`);
  const skyTop = dramatic ? tint("#0b1422", 14) : "#1d5bb4";
  const skyMid = dramatic ? tint("#2b4466", 12) : "#4089d8";
  const skyLow = dramatic ? tint("#9aabbf", 8) : "#a8d2f3";

  const tiny: CSSProperties = { fontFamily: CONDENSED, fontWeight: 700, color: WHITE, letterSpacing: "0.3em", whiteSpace: "nowrap", textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,20,60,.35)" };
  const aboveSize = Math.min(28, 700 / Math.max(1, [...above].length * 0.72));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: skyTop, color: WHITE }}>
      {/* Sky and clouds. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 38%, ${skyLow} 62%, ${skyLow} 100%)` }} />
      <Clouds dramatic={dramatic} seed={cloudSeed} />
      {/* The ground, rising from the bottom and fading into the sky. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, bottom: 0, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 30%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 30%)" }}>
        {scene ? (
          <img src={scene} alt="" style={{ position: "absolute", left: -20, top: -20, width: CANVAS_W + 40, height: "calc(100% + 40px)", maxWidth: "none", objectFit: "cover", objectPosition: "50% 62%", filter: dramatic ? "saturate(.55) contrast(1.25) brightness(.72) blur(1.5px)" : "saturate(.9) brightness(1.02) blur(5px)" }} />
        ) : (
          <OwnPhotoBlur data={data} blur={30} style={{ left: -60, top: -60, width: CANVAS_W + 120, height: "calc(100% + 120px)" }} />
        )}
        {dramatic && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent, ${shade(accent, -0.8)}aa)`, mixBlendMode: "multiply" }} />}
      </div>
      {!dramatic && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 45%)", maskImage: "linear-gradient(to bottom, transparent, #000 45%)" }}>
          <Grass base="#3f7d33" />
        </div>
      )}

      {/* Line above the title. */}
      {above && (
        <div style={{ ...tiny, position: "absolute", left: 0, right: 0, top: titleTop - 58, textAlign: "center", fontSize: aboveSize }}>
          {above}
        </div>
      )}

      {/* The title, behind the player. */}
      {segs.map((sg, i) => {
        if (sg.kind === "big")
          return (
            // The box hugs the capitals (line height = cap height), so nothing measures empty space as text.
            <div key={i} style={{ position: "absolute", left: xs[i], top: titleTop + S * 0.05, height: capH, fontFamily: BEBAS, fontSize: S, lineHeight: `${capH}px`, color: WHITE, whiteSpace: "nowrap", textShadow: "0 10px 40px rgba(0,20,60,.22)" }}>
              {sg.text}
            </div>
          );
        if (sg.kind === "stack") {
          const k = stackSize(sg, S);
          const lineH = capH / sg.lines.length;
          return (
            <div key={i} style={{ position: "absolute", left: xs[i], top: titleTop + (sg.lines.length === 1 ? capH - k * CAP : 0), display: "flex", flexDirection: "column", alignItems: "center", width: widths[i] }}>
              {sg.lines.map((l, j) => (
                <div key={j} style={{ fontFamily: BEBAS, fontSize: k, lineHeight: `${lineH}px`, height: sg.lines.length === 1 ? k * CAP : lineH, color: WHITE, whiteSpace: "nowrap" }}>
                  {l}
                </div>
              ))}
            </div>
          );
        }
        const b = blockSize(sg, S);
        return (
          <div key={i} style={{ position: "absolute", left: xs[i], top: titleTop - b * 0.07, width: widths[i], display: "flex", flexDirection: "column" }}>
            {sg.lines.map((l, j) => (
              <div key={j} style={{ fontFamily: BEBAS, fontSize: b, lineHeight: 0.9, color: WHITE, whiteSpace: "nowrap" }}>
                {l}
              </div>
            ))}
            {sg.foot && (
              <div style={{ ...tiny, fontSize: Math.min(20, (widths[i] + 60) / Math.max(1, [...sg.foot].length * 0.78)), letterSpacing: "0.18em", marginTop: 8 }}>
                {sg.foot}
              </div>
            )}
          </div>
        );
      })}

      {/* The player. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: `contrast(1.05) saturate(${dramatic ? 0.95 : 1.02}) drop-shadow(0 24px 40px rgba(0,10,30,.35))`, ...cutMask(data.cut) }}
        />
      )}

      {/* Signed across the title's corner. */}
      {sig && sigS >= 64 && (
        <div
          style={{
            position: "absolute",
            top: sigY,
            [sigLeft ? "left" : "right"]: edge,
            fontFamily: SCRIPT,
            fontSize: sigS,
            lineHeight: 1,
            color: sigColor,
            whiteSpace: "nowrap",
            transform: "rotate(-7deg)",
            transformOrigin: "100% 60%",
            textShadow: "0 3px 0 rgba(0,0,0,.12), 0 8px 24px rgba(0,0,0,.25)",
          }}
        >
          {sig}
        </div>
      )}

      {/* Round badge with a tiny caption. */}
      <div style={{ position: "absolute", [badgeRight ? "right" : "left"]: 64, bottom: 64, display: "flex", flexDirection: badgeRight ? "row" : "row-reverse", alignItems: "center", gap: 16 }}>
        <div style={{ ...tiny, fontSize: 17, letterSpacing: "0.2em", lineHeight: 1.35, textAlign: badgeRight ? "right" : "left" }}>
          {postType === "result" && score ? (
            <>
              <div>FULL TIME</div>
              <div style={{ fontFamily: BEBAS, fontSize: 40, letterSpacing: "0.06em", lineHeight: 1 }}>{score}</div>
            </>
          ) : (
            (caption.length ? caption : [data.player.number ? `NO. ${data.player.number}` : "", (data.club?.name ?? "").toUpperCase()]).map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
        {data.club?.crestUrl && (
          <div style={{ width: 104, height: 104, borderRadius: "50%", background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,.3)", border: `4px solid ${accent}` }}>
            <img src={data.club.crestUrl} alt="" style={{ width: 70, height: 70, objectFit: "contain" }} />
          </div>
        )}
      </div>
      <AgencyLogo data={data} height={26} style={{ position: "absolute", [badgeRight ? "left" : "right"]: 64, bottom: 70, opacity: 0.92 }} />

      {/* Washed film (sunny) or heavy print texture (dramatic). */}
      {dramatic ? (
        <div style={{ position: "absolute", inset: 0, backgroundImage: SPECKLE, opacity: 0.1, mixBlendMode: "multiply", pointerEvents: "none" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,244,225,.10), rgba(255,236,210,.06))", mixBlendMode: "screen", pointerEvents: "none" }} />
      )}
      <Film strength={dramatic ? 2.2 : 1.5} />
    </div>
  );
}
