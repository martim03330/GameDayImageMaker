/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { circlePath, closeRing, ringEm } from "./circletext";
import { cutMask, Film } from "./fx";
import { clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const FONT = "var(--font-inter), system-ui, sans-serif";

/**
 * Goal circle text: the goal post of `circletext`. A deep club-tone ground and two concentric rings made of
 * words alone, centred on the celebrating player's chest: the outer one in small white tracked caps —
 * "GOAL · FIRST LAST · HOME V AWAY ·" (no score), repeated to close evenly — reading clockwise; the inner one
 * the title alone ("GOAL", "BRACE") a size up and wider-spaced in a pale club tint, one word centred over his head. His raised
 * arms and shoulders cut through both turns; the NEYOD logo under him.
 */
export function Goalcircletext({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = params.textScale ?? 1;

  const club = clubTone(data);
  const ground = shade(club, -0.64);

  /* ---- the words ---- */
  const kicker = (content.kicker || "Goal").replace(/’/g, "'").trim().toUpperCase();
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const teams = teamsOf(data);
  // Goal posts never carry the score: the teams either side of a "v".
  const fixture = (teams.length === 2 ? `${teams[0]} v ${teams[1]}` : teams[0] ? `v ${teams[0]}` : "").toUpperCase();
  const SEP = "  ·  ";
  const outerCopy = [kicker, name, fixture].filter(Boolean).join(SEP) + SEP;
  const innerCopy = kicker + SEP;

  /* ---- the rings ---- */
  const R = story ? 452 : 436;
  const r2 = R * 0.8;
  const ringTop = (story ? STORY_TOP + 64 : 104) + (params.textY ?? 0);
  const cx = 540;
  const cy = ringTop + R;
  const TRACK = 0.3;
  const outer = closeRing(outerCopy, 2 * Math.PI * R, (story ? 21 : 16.5) * ts, TRACK, 2);
  const I_TRACK = 0.5;
  const inner = closeRing(innerCopy, 2 * Math.PI * r2, (story ? 44 : 36) * ts, I_TRACK, 3);
  // One title word centred over his head, the others spaced evenly round the turn.
  const wordShare = (ringEm(kicker, I_TRACK) - I_TRACK) / ringEm(innerCopy, I_TRACK);
  const innerStart = -Math.PI / 2 - (Math.PI / inner.n) * wordShare;

  /* ---- the player, head inside the inner ring ---- */
  const sizes = story ? { chest: 236, waist: 200, knees: 168, full: 136 } : { chest: 228, waist: 186, knees: 150, full: 118 };
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const b0 = placeByFace(data, cx, 400, sizes);
  const hair = 400 - b0.top;
  // Raised fists may run above the rings; his hair stays clear of the inner turn.
  const innerTop = cy - r2;
  let box = placeByFace(data, cx, Math.max(innerTop + Math.max(0.75 * b0.faceH, 100), ringTop + hair + (story ? 56 : 44)), sizes);
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  // Face on the axis, then nudged towards the figure's middle when an arm reaches out to one side.
  const lean = Math.max(-70, Math.min(70, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + (cx - faceCx) * 0.6 + lean * 0.4 };
  const faceTop = box.top + face[1] * box.height;

  const logoBottom = (story ? H - STORY_BOTTOM : 46) - (params.logoY ?? 0);
  const logoTop = story ? STORY_BOTTOM - 88 : CANVAS_H - 46 - 52;
  const fadeEnd = Math.max(faceTop + box.faceH * 3, logoTop - (story ? 70 : 44));
  const fadeLen = Math.max(140, Math.min(story ? 380 : 300, fadeEnd - (cy + R + 24)));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - fadeLen - box.top}px, transparent ${fadeEnd - box.top}px)`;

  const inkOuter = "rgba(255,255,255,.92)";
  const inkInner = shade(club, 0.38);
  const kLen = kicker.length;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(52% 38% at 50% ${(cy / H) * 100}%, ${shade(club, -0.34)}, transparent 78%), linear-gradient(to bottom, transparent 55%, ${shade(club, -0.8)})`,
        }}
      />

      {/* The two rings of words, behind him: outer with the facts, inner the title alone. */}
      <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <path id="gct-outer" d={circlePath(cx, cy, R, -Math.PI / 2 - Math.PI / outer.n)} fill="none" />
        <path id="gct-inner" d={circlePath(cx, cy, r2, innerStart)} fill="none" />
        <text fontFamily={FONT} fontWeight={500} fontSize={outer.size} letterSpacing={outer.size * TRACK} fill={inkOuter}>
          <textPath href="#gct-outer" textLength={2 * Math.PI * R - outer.size * TRACK} lengthAdjust="spacing">
            {Array.from({ length: outer.n }, (_, i) => (
              <tspan key={i}>
                <tspan fontWeight={700}>{outerCopy.slice(0, kLen)}</tspan>
                {outerCopy.slice(kLen)}
              </tspan>
            ))}
          </textPath>
        </text>
        <text fontFamily={FONT} fontWeight={600} fontSize={inner.size} letterSpacing={inner.size * I_TRACK} fill={inkInner} opacity={0.6}>
          <textPath href="#gct-inner" textLength={2 * Math.PI * r2 - inner.size * I_TRACK} lengthAdjust="spacing">
            {Array.from({ length: inner.n }, () => innerCopy).join("")}
          </textPath>
        </text>
      </svg>

      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.04) saturate(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      <AgencyLogo
        data={data}
        height={story ? 26 : 20}
        style={{ position: "absolute", left: "50%", bottom: logoBottom, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
      <Film strength={0.2} />
    </div>
  );
}
