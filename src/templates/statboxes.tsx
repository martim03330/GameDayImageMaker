/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { cutMask } from "./fx";
import { rng } from "./kit";
import { ANTON, em, standing } from "./mist";
import { sceneOf, scoreOf } from "./outline";
import { AgencyLogo, DISPLAY, factRows } from "./shared";
import { inkOf, matchFacts, shortFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const WHITE = "#ffffff";

/** Fine woven texture for the boxes (printed banner fabric). */
const FABRIC = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.9' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.1'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`,
)}")`;

type Box = { value: string; label: string; crest?: string };

/** The numbers for the boxes: the score first after a game, then the player's own numbers (1–4 boxes). */
function boxesOf(data: RenderData): Box[] {
  const c = data.content;
  const score = scoreOf(data);
  const facts = shortFacts(data, 4).map((f) => ({ value: String(f.value), label: f.label }));
  let out: Box[];
  if (data.postType === "matchday") {
    // Kick-off facts: the round, the time, the day, the opponent's crest.
    const m = matchFacts(data);
    out = [];
    if (m.roundNo) out.push({ value: m.roundNo, label: "Matchday" });
    if (m.day && m.mon) out.push({ value: m.day, label: [m.dow, m.mon].filter(Boolean).join(" · ") });
    if (m.time) out.push({ value: m.time, label: "Kick off" });
    if (m.oppCrest) out.push({ value: "", label: m.opp ? `v ${m.opp}` : "", crest: m.oppCrest });
    else if (m.opp) out.push({ value: "v", label: m.opp });
    if (out.length) return out.slice(0, 4);
  }
  if ((data.postType === "result" || data.postType === "goal") && score) out = [{ value: score, label: data.postType === "goal" ? "Final score" : "Full time" }, ...facts].slice(0, 4);
  else if (facts.length) out = facts;
  else out = factRows(data).filter((f) => f.value && String(f.value).length <= 6).map((f) => ({ value: String(f.value), label: f.label })).slice(0, 4);
  if (!out.length && data.player.number) out = [{ value: data.player.number, label: "Shirt" }];
  if (!out.length) out = [{ value: (c.kicker.split(/\s+/)[0] ?? "").slice(0, 6), label: c.kicker.split(/\s+/).slice(1).join(" ") }];
  return out;
}

/**
 * Stat card (Bruno Fernandes "108 GAMES / 47 GOALS / 36 ASSISTS"): the ground in black and white, the
 * player in full colour, big, on one side; on the other a column of club-colour fabric boxes, each with a
 * huge white number and its label, the crest sitting on top of the column; a small white tab at the foot
 * carries the agency mark.
 */
export function Statboxes({ data }: { data: RenderData }) {
  const { params } = data;
  const seed = params.seed ?? 29;
  const r = rng(seed);
  const flip = params.side === "left";
  const { club: raw } = inkOf(data);
  // White numbers must read on the box: pale club colours get deepened.
  const box = luminance(raw) > 0.4 ? shade(raw, -0.45) : luminance(raw) > 0.25 ? shade(raw, -0.2) : raw;

  const items = boxesOf(data);
  const n = items.length;

  // ---- the column ----
  const colW = 300;
  const colX = flip ? CANVAS_W - 190 - colW : 190;
  const crest = data.club?.crestUrl;
  const top = crest ? 190 : 150;
  const bottom = 1150;
  const gap = 20;
  // Few boxes stay square-ish instead of stretching down the whole page.
  const boxH = Math.min(n === 1 ? 380 : n === 2 ? 340 : 310, (bottom - top - gap * (n - 1)) / n);
  const labelMax = (t: string) => (colW - 44) / Math.max(1.5, em(t.toUpperCase(), ANTON, 0.5));
  const numMax = (t: string) => (colW - 36) / Math.max(1, em(t, ANTON, 0.48));

  // ---- the player ----
  const figCx = flip ? 360 + (r() - 0.5) * 30 : 720 + (r() - 0.5) * 30;
  let fig = data.photoUrl ? standing(data, { cx: figCx, headTop: 92, floor: 1240, maxFace: 170 }) : null;
  // A tight framing of a small photo sinks the head down the page: show him whole instead.
  if (fig && fig.faceTop > 340) fig = standing(data, { cx: figCx, headTop: 92, floor: 1240, maxFace: 170, framing: "full" });

  const scene = sceneOf(data);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#5a5a5a", color: WHITE }}>
      {/* The ground in black and white (his own photo, blurred, when there is no ground photo). */}
      {scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -30, top: -30, width: CANVAS_W + 60, height: CANVAS_H + 60, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) contrast(1.05) brightness(1.08) blur(2px)" }} />
      ) : data.bgPhotoUrl ? (
        <img src={data.bgPhotoUrl} alt="" style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CANVAS_H + 180, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) blur(30px) brightness(.9)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#8a8a8a, #3c3c3c)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 80% at 50% 40%, transparent 50%, rgba(0,0,0,.35) 100%), linear-gradient(to bottom, rgba(255,255,255,.06), transparent 40%, rgba(0,0,0,.25))" }} />

      {/* The player, in colour */}
      {fig && data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 20px 30px rgba(0,0,0,.35))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none", filter: "contrast(1.06) saturate(1.1)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The column of boxes */}
      {items.map((it, i) => {
        const y = top + i * (boxH + gap);
        const value = it.value.toUpperCase();
        const label = it.label.toUpperCase();
        const numSize = Math.min(boxH * 0.6, numMax(value), 210);
        const labSize = Math.min(boxH * 0.22, labelMax(label), numSize * 0.5);
        return (
          <div key={i} style={{ position: "absolute", left: colX, top: y, width: colW, height: boxH, background: box, boxShadow: "0 16px 30px rgba(0,0,0,.35), 0 3px 8px rgba(0,0,0,.25)" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: FABRIC, opacity: 0.22, mixBlendMode: "multiply" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,.12), transparent 45%, rgba(0,0,0,.14))" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: boxH * 0.02 }}>
              {it.crest ? (
                <img src={it.crest} alt="" style={{ width: boxH * 0.52, height: boxH * 0.52, objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))" }} />
              ) : (
                <div style={{ fontFamily: DISPLAY, fontSize: numSize, lineHeight: 0.92, whiteSpace: "nowrap", textShadow: "0 3px 10px rgba(0,0,0,.2)" }}>{value}</div>
              )}
              {label && <div style={{ fontFamily: DISPLAY, fontSize: labSize, lineHeight: 1.02, whiteSpace: "nowrap", marginTop: boxH * 0.03, textShadow: "0 3px 10px rgba(0,0,0,.2)" }}>{label}</div>}
            </div>
          </div>
        );
      })}
      {crest && (
        <img src={crest} alt="" style={{ position: "absolute", left: colX + colW / 2 - 70, top: top - 116, width: 140, height: 140, objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.4))" }} />
      )}

      {/* White tab with the agency mark */}
      <div style={{ position: "absolute", left: 540 - 72, bottom: 0, width: 144, height: 96, background: WHITE, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 -4px 16px rgba(0,0,0,.2)" }}>
        <AgencyLogo data={data} height={30} onLight style={{ color: "#111", maxWidth: 116 }} />
      </div>
    </div>
  );
}
