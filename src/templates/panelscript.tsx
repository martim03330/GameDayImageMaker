/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { Barcode, cutMask } from "./fx";
import { rng } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo, CONDENSED } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

export const ORBITRON = "var(--font-orbitron), 'Arial Black', sans-serif";
export const VIBES = "var(--font-vibes), 'Snell Roundhand', cursive";

/** Orbitron 900: advance widths per 100px of font size (measured in the browser). */
const ORB_W: Record<string, number> = { "0": 83.4, "1": 39.1, "2": 83, "3": 82.6, "4": 73, "5": 83, "6": 82, "7": 66, "8": 83.4, "9": 82.8, A: 83.6, B: 83.2, C: 82.2, D: 83.4, E: 76.6, F: 72.3, G: 83, H: 85.1, I: 21.4, J: 78, K: 79.7, L: 77.9, M: 92.8, N: 83.2, O: 82.8, P: 79.1, Q: 88.4, R: 82.5, S: 82.8, T: 75.9, U: 82.8, V: 100.3, W: 117.9, X: 81.2, Y: 80.6, Z: 82.1, " ": 32.2, "-": 51.7, "'": 25.1, ".": 23.3, ":": 24.7, "/": 52.1, "&": 93.8 };
const orbEm = (t: string, tracking: number) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (ORB_W[c] ?? 84) / 100 + tracking, -tracking);
const CAP = 0.72;

/** "MATCHDAY" → block "MATCH" + script "Day"; "FULL TIME" → "FULL" + "Time"; one word stays a block. */
function split(kicker: string): [string, string] {
  const k = kicker.toUpperCase().replace(/’/g, "'").trim().replace(/^(MATCH|GAME)DAY$/, "$1 DAY").replace(/^FULLTIME$/, "FULL TIME");
  const words = k.split(/\s+/).filter(Boolean);
  if (words.length < 2) return [k, ""];
  const last = words[words.length - 1];
  return [words.slice(0, -1).join(" "), last.charAt(0) + last.slice(1).toLowerCase()];
}

/** Concrete / paper wall: soft cloudy blotches. */
function wallUrl(seed: number): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.008 0.012' numOctaves='5' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .4  0 0 0 0 .45  0 0 0 1.4 -0.45'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`,
  )}")`;
}
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/**
 * Pale panel matchday (Bologna at Inter, Martin Erlić story): a cold, cloudy grey wall with a lighter
 * panel standing on it, the title in wide square techno caps in the club's dark colour with its last
 * word handwritten across it in the second colour; the fixture, the competition and the kick-off running
 * up the left edge, the two crests stacked beside it, the player big on the right, and an out-of-focus
 * crest in the foreground at the edge, as if shot past a corner flag. Heavy fine grain over it all.
 */
export function Panelscript({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 37;
  const r = rng(seed);
  const right = params.side !== "left";

  // Ink: the club colour pulled dark (navy for a blue club); script: the other colour, deep and warm.
  let ink = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  // Always deep (the reference's navy): a mid blue would read washed out on the pale wall.
  ink = luminance(ink) > 0.06 ? shade(ink, -0.5) : ink;
  if (luminance(ink) > 0.12) ink = "#1d3557";
  let pen = vivid(params.accent);
  if (luminance(pen) > 0.45 || Math.abs(luminance(pen) - luminance(ink)) < 0.04) pen = shade(vivid(params.primary), 0.1);
  if (luminance(pen) > 0.45) pen = "#9b1b3a";
  const paper = "#dde2e6";

  const f = matchFacts(data);
  const score = scoreOf(data, "-");

  /* ---- title ---- */
  const [block, script] = split(content.kicker);
  const L = 96;
  const tracking = 0.01;
  const size = Math.min(210, (CANVAS_W - L - 110) / orbEm(block, tracking)) * (params.textScale ?? 1);
  const titleTop = 178 + (params.textY ?? 0);
  const blockW = orbEm(block, tracking) * size;
  const scriptSize = Math.min(250, Math.max(180, size * 1.3));
  // Great Vibes: ~0.5em per lower-case letter, ~1em for the swashed capital (with the 6° tilt).
  const scriptW = scriptSize * (1 + Math.max(0, script.length - 1) * 0.5);
  // A short block ("MATCH") takes the script across its right half; a long one ("MAN OF THE") would be
  // illegible under it, so the script hangs below the block instead, ending at the panel's edge.
  const under = [...block].length > 6;
  const scriptLeft = under ? Math.max(L + 120, CANVAS_W - 110 - scriptW) : Math.max(L + blockW * 0.3, Math.min(L + blockW * 0.52, CANVAS_W - 40 - scriptW));
  const scriptTop = under ? titleTop + size * CAP * 0.75 : titleTop + size * CAP * 0.05;

  /* ---- the player ---- */
  const cx = right ? 650 + r() * 40 : 430 - r() * 40;
  const headTop = Math.max(titleTop + size * CAP + 90, script && under ? scriptTop + scriptSize * 0.8 : 0);
  const box = standing(data, { cx, headTop, floor: 1310, maxFace: 230 });
  // The blurred crest stands at the edge only where he leaves it free.
  const reach = box.faceH * 2.4;
  const edgeFree = right ? box.faceCx + reach < CANVAS_W - 170 : box.faceCx - reach > 170;

  /* ---- the vertical line and the crests ---- */
  const ours = (data.club?.name ?? "").toUpperCase();
  const fixture = f.opp ? (content.home === false ? `${f.opp} VS ${ours}` : `${ours} VS ${f.opp}`) : ours;
  const third = postType === "result" && score ? `FULL TIME ${score}` : f.time ? `KICK OFF - ${f.time.replace(":", ".")}` : f.longDate;
  const vertical = [fixture, [f.comp, f.round || (postType === "matchday" ? "MATCHDAY" : "")].filter(Boolean).join(" "), third].filter(Boolean);
  // Barlow Condensed 700 caps with 0.18em tracking: ~0.63em a character; the column must fit its edge.
  const vTop = titleTop + size * CAP + 70;
  const vRoom = CANVAS_H - 150 - vTop;
  const vSize = Math.max(14, Math.min(22, (vRoom - 54 * (vertical.length - 1)) / Math.max(1, vertical.join("").length * 0.63)));
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestX = right ? 190 : CANVAS_W - 190 - 150;
  const blurCrest = f.oppCrest ?? f.ourCrest;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: paper, color: ink }}>
      {/* The wall, then the lighter panel standing on it. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: wallUrl((seed % 60) + 4), backgroundSize: "1100px 1100px", opacity: 0.5, mixBlendMode: "multiply" }} />
      <div
        style={{
          position: "absolute",
          left: right ? 120 : 140,
          right: right ? 140 : 120,
          top: 70,
          bottom: -10,
          background: "linear-gradient(180deg, #eef1f3, #e5e9ec)",
          boxShadow: "0 10px 50px rgba(30,40,55,.18)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: wallUrl((seed % 60) + 19), backgroundSize: "900px 900px", opacity: 0.22, mixBlendMode: "multiply" }} />
      </div>

      {/* Barcode furniture on the panel's corner. */}
      <div style={{ position: "absolute", left: right ? 150 : undefined, right: right ? undefined : 170, top: 92, opacity: 0.75 }}>
        <Barcode width={120} height={34} color={ink} />
      </div>

      {/* Title: square block caps, the last word written across it. */}
      <div data-bleed style={{ position: "absolute", left: L - 10, top: titleTop - size * (1 - CAP) * 0.9, fontFamily: ORBITRON, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: `${tracking}em`, whiteSpace: "nowrap", color: ink }}>
        {block}
      </div>
      {script && (
        <div
          data-bleed
          style={{
            position: "absolute",
            left: scriptLeft,
            top: scriptTop,
            fontFamily: VIBES,
            fontSize: scriptSize,
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: pen,
            transform: "rotate(-6deg)",
            transformOrigin: "left center",
            WebkitTextStroke: `2.5px ${pen}`,
          }}
        >
          {script}
        </div>
      )}

      {/* Fixture · competition · kick-off, reading up the edge. */}
      <div
        style={{
          position: "absolute",
          [right ? "left" : "right"]: 92,
          bottom: 150,
          top: vTop,
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 54,
          fontFamily: CONDENSED,
          fontWeight: 700,
          fontSize: vSize,
          letterSpacing: "0.18em",
          whiteSpace: "nowrap",
          color: ink,
        }}
      >
        {vertical.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>

      {/* Crests stacked beside it. */}
      <div style={{ position: "absolute", left: crestX, top: titleTop + size * CAP + 170, display: "flex", flexDirection: "column", gap: 60, alignItems: "center" }}>
        {crests.map((c, i) => (
          <img key={i} src={c} alt="" style={{ width: 150, height: 150, objectFit: "contain", filter: "drop-shadow(0 6px 14px rgba(20,30,45,.25))" }} />
        ))}
      </div>

      {/* The player, with a soft shadow on the wall. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            maxWidth: "none",
            filter: "contrast(1.04) saturate(.88) drop-shadow(18px 22px 30px rgba(30,40,60,.3))",
            ...cutMask(data.cut),
          }}
        />
      )}

      {/* Foreground: a crest far out of focus at the edge, like a corner flag right by the lens. */}
      {blurCrest && edgeFree && (
        <img
          data-bleed
          src={blurCrest}
          alt=""
          style={{
            position: "absolute",
            [right ? "right" : "left"]: -150,
            top: 640 + r() * 80,
            width: 420,
            height: 420,
            objectFit: "contain",
            filter: "blur(16px) saturate(.8)",
            opacity: 0.7,
            transform: `rotate(${right ? -8 : 8}deg)`,
          }}
        />
      )}

      <AgencyLogo data={data} onLight height={24} style={{ position: "absolute", [right ? "left" : "right"]: 150, bottom: 52 - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }} />

      {/* Heavy fine grain and a cold, slightly faded finish. */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: 0.22, mixBlendMode: "overlay", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(200,215,230,.06)", mixBlendMode: "screen", pointerEvents: "none" }} />
    </div>
  );
}
