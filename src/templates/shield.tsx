/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, figureBox, Film, GradedFigure, GradientMapDefs, type Box } from "./fx";
import { AgencyLogo, CONDENSED, Crest, factRows, fitSize, SANS, SERIF } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* Shield geometry (canvas px). */
const SX0 = 214;
const SX1 = 866;
const SY0 = 262;
const SY_CURVE = 800;
const SY_TIP = 1142;
const R = 44;
const SCX = (SX0 + SX1) / 2;

/** Crest-shaped outline; `inset` shrinks it, `open` extends its top to the canvas edge (so a head can rise out of it). */
function shieldPath(inset = 0, open = false) {
  const x0 = SX0 + inset;
  const x1 = SX1 - inset;
  const y0 = SY0 + inset;
  const tip = SY_TIP - inset * 1.25;
  const yc = SY_CURVE;
  const r = Math.max(0, R - inset);
  const top = open ? `M ${x0} -10 L ${x1} -10` : `M ${x0} ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} L ${x1 - r} ${y0} Q ${x1} ${y0} ${x1} ${y0 + r}`;
  const start = open ? "" : "";
  return `${start}${top} L ${x1} ${yc} C ${x1} ${yc + 170} ${SCX + 170} ${tip - 80} ${SCX} ${tip} C ${SCX - 170} ${tip - 80} ${x0} ${yc + 170} ${x0} ${yc} Z`;
}

/** Blend of two hex colours (t = share of b), as "rrggbb". */
function mixHex(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

const STAR = "M50 0 L61.8 35.4 L99 35.4 L69 57.3 L80.3 92.7 L50 70.8 L19.7 92.7 L31 57.3 L1 35.4 L38.2 35.4 Z";

/** Box of any cutout, bottom-anchored (the chosen photo keeps the edit's framing/nudges). */
function boxOf(data: RenderData, c: { url: string; aspect: number | null }, cx: number, bottom: number, height: number): Box {
  if (c.url === data.photoUrl) return figureBox(data, cx, bottom, height);
  const w = height * (c.aspect ?? 0.5);
  return { left: cx - w / 2, top: CANVAS_H - bottom - height, width: w, height };
}

/**
 * National-team crest poster (Lamine Yamal / Spain): a big shield in the club's deep colour with a bright border,
 * a duotone bust rising out of its top, emblem art behind it, the full-body player small in front; spaced serif name
 * with a star, pale background with a huge faint watermark.
 */
export function Shield({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.58);
  const border = luminance(params.accent) > 0.16 && params.accent.toLowerCase() !== params.primary.toLowerCase() ? params.accent : "#d4a73c";
  const ink = shade(accent, -0.68);
  const paper = `color-mix(in srgb, ${accent} 5%, #f1f0ed)`;
  const crest = data.club?.crestUrl;

  // Photos: a head-and-shoulders crop for the bust, the full-body cutout small in front.
  const isBust = (f: [number, number, number, number] | null) => (f?.[3] ?? 0) > 0.24;
  const main = data.cutouts.find((c) => c.url === data.photoUrl) ?? data.cutouts[0];
  const fullC = data.cutouts.find((c) => c.face && !isBust(c.face) && !(c.cut.bottom && c.cut.bottom > 0.5));
  const bustC = data.cutouts.find((c) => isBust(c.face) && !(c.cut.top && c.cut.top > 0)) ?? main;

  // Bust: face centred in the upper shield; head may rise out of the top, never above y≈205.
  let bustBox: Box | null = null;
  let chin = 0;
  if (bustC) {
    const [fx, fy, fw, fh] = bustC.face ?? [0.4, 0.08, 0.2, 0.12];
    const alone = !fullC;
    const faceW = alone ? 300 : 236;
    const w = faceW / fw;
    const h = w / (bustC.aspect ?? 0.5);
    let cy = alone ? 520 : 452;
    const faceH = fh * h;
    const headTop = cy - faceH / 2 - faceH * 0.62;
    const minHead = (bustC.cut.top ?? 0) > 0 ? SY0 + 40 : 205;
    if (headTop < minHead) cy += minHead - headTop;
    bustBox = { left: SCX - (fx + fw / 2) * w, top: cy - (fy + fh / 2) * h, width: w, height: h };
    chin = cy + faceH / 2;
  }

  // Full body in front, feet on the ground line; its head always sits below the bust's chin.
  let fullBox: Box | null = null;
  if (fullC) {
    let height = 640 * (params.playerScale ?? 1);
    const minTop = chin + 40;
    if (1350 - 150 - height < minTop) height = 1350 - 150 - minTop;
    fullBox = boxOf(data, fullC, SCX + 20, 150, Math.max(420, height));
  }

  // Name: first name ★ last name, spaced serif.
  const first = content.firstName.toUpperCase();
  const last = content.lastName.toUpperCase();
  const sideW = 1080 / 2 - 58 - 60;
  const nameSize = Math.min(fitSize(first, sideW, 66, 0.78, 6), fitSize(last, sideW, 66, 0.78, 6), 66) * (params.textScale ?? 1);

  const clip = (d: string): CSSProperties => ({ clipPath: `path('${d}')` });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: paper, color: ink }}>
      <GradientMapDefs id="shd-duo" dark={shade(deep, -0.45)} mid={`#${mixHex(shade(accent, -0.3), "#6f7174", 0.35)}`} light="#f7f4ee" />

      {/* Huge faint watermark: the shirt number (or initials) in outline. */}
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 150,
          textAlign: "center",
          fontFamily: DMSERIF,
          fontSize: 1180,
          lineHeight: 1,
          letterSpacing: -40,
          color: "transparent",
          WebkitTextStroke: `3px color-mix(in srgb, ${ink} 9%, transparent)`,
          whiteSpace: "nowrap",
        }}
      >
        {data.player.number || `${first[0] ?? ""}${last[0] ?? ""}`}
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 45%, rgba(255,255,255,.75), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 22, border: `1px solid color-mix(in srgb, ${ink} 14%, transparent)` }} />

      {/* Shield drop shadow + border + fill. */}
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="shd-fill" cx="50%" cy="28%" r="75%">
            <stop offset="0" stopColor={shade(accent, -0.3)} />
            <stop offset="0.55" stopColor={deep} />
            <stop offset="1" stopColor={shade(deep, -0.35)} />
          </radialGradient>
          <filter id="shd-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="26" stdDeviation="26" floodColor={ink} floodOpacity="0.28" />
          </filter>
        </defs>
        <path d={shieldPath(-18)} fill={border} filter="url(#shd-shadow)" />
        <path d={shieldPath(0)} fill="url(#shd-fill)" />
      </svg>

      {/* Emblem art inside the shield: the crest, tone-on-tone, with fine pinstripes. */}
      <div style={{ position: "absolute", inset: 0, ...clip(shieldPath(0)) }}>
        <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 2px, transparent 2px 26px)` }} />
        {crest && bustC && (
          <img
            src={crest}
            alt=""
            style={{ position: "absolute", left: SCX - 330, top: 300, width: 660, height: 660, objectFit: "contain", filter: "grayscale(1) brightness(1.6)", mixBlendMode: "soft-light", opacity: 0.55 }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 55%, ${shade(deep, -0.4)} 100%)` }} />
      </div>
      <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0 }}>
        <path d={shieldPath(14)} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth={1.5} />
      </svg>

      {/* Duotone bust, rising out of the top of the shield. */}
      {bustC && bustBox && (
        <div style={{ position: "absolute", inset: 0, ...clip(shieldPath(0, true)) }}>
          <div style={{ position: "absolute", ...bustBox, ...cutMask({ top: bustC.cut.top, left: bustC.cut.left, right: bustC.cut.right }, 1.6) }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, #000 56px, #000 ${Math.min(92, ((1000 - bustBox.top) / bustBox.height) * 100)}%, transparent ${Math.min(100, ((1110 - bustBox.top) / bustBox.height) * 100)}%)`,
              maskImage: `linear-gradient(to bottom, transparent 0px, #000 56px, #000 ${Math.min(92, ((1000 - bustBox.top) / bustBox.height) * 100)}%, transparent ${Math.min(100, ((1110 - bustBox.top) / bustBox.height) * 100)}%)`,
            }}
          >
            <img src={bustC.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", filter: "url(#shd-duo) contrast(1.06)" }} />
          </div>
          </div>
        </div>
      )}
      {!bustC && crest && (
        <img src={crest} alt="" style={{ position: "absolute", left: SCX - 220, top: 430, width: 440, height: 440, objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,.45))" }} />
      )}

      {/* Full-body player, small, in front of the shield. */}
      {fullC && fullBox && (
        <>
          <div style={{ position: "absolute", left: fullBox.left + fullBox.width * 0.1, width: fullBox.width * 0.8, top: 1350 - 150 - 22, height: 40, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(14px)" }} />
          <GradedFigure data={data} src={fullC.url} box={fullBox} shadow={false} />
        </>
      )}

      {/* Name with a star. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ flex: 1, textAlign: "right", paddingRight: 28, fontFamily: SERIF, fontWeight: 500, fontSize: nameSize, letterSpacing: 6, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{first}</div>
        <svg width={62} height={62} viewBox="0 0 100 100" style={{ flex: "none" }}>
          <path d={STAR} fill={border} stroke={shade(border, -0.25)} strokeWidth={2} />
        </svg>
        <div style={{ flex: 1, textAlign: "left", paddingLeft: 28, fontFamily: SERIF, fontWeight: 500, fontSize: nameSize, letterSpacing: 6, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{last}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 172, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <span style={{ width: 46, height: 1.5, background: ink, opacity: 0.35 }} />
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 17, letterSpacing: "0.42em", textTransform: "uppercase", color: shade(accent, -0.25), paddingLeft: "0.42em" }}>{content.kicker}</span>
        <span style={{ width: 46, height: 1.5, background: ink, opacity: 0.35 }} />
      </div>

      <SideInfo data={data} ink={ink} accent={shade(accent, -0.2)} />

      {/* Bottom line + corners. */}
      <BottomLine data={data} ink={ink} />
      <AgencyLogo data={data} onLight height={30} style={{ position: "absolute", left: 60, bottom: 62 }} />
      {crest && <Crest club={data.club} size={78} style={{ position: "absolute", right: 56, bottom: 44, filter: "drop-shadow(0 6px 12px rgba(0,0,0,.18))" }} />}
      {postType === "transfer" && !crest && null}
      <Film strength={0.7} />
    </div>
  );
}

/** A column item at the side of the shield. */
function Col({ x, top, children }: { x: number; top: number; children: ReactNode }) {
  return <div style={{ position: "absolute", left: x - 85, width: 170, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 44, textAlign: "center" }}>{children}</div>;
}

function Fact({ value, label, ink, accent }: { value: string; label: string; ink: string; accent: string }) {
  const v = value.toUpperCase();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ fontFamily: DMSERIF, fontSize: fitSize(v, 160, 78, 0.62), lineHeight: 0.9, color: ink, whiteSpace: "nowrap" }}>{v}</div>
      <div style={{ width: 26, height: 2, background: accent }} />
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: "0.28em", textTransform: "uppercase", color: ink, opacity: 0.75, paddingLeft: "0.28em", lineHeight: 1.35, maxWidth: 160 }}>{label}</div>
    </div>
  );
}

function Team({ crest, name, goals, ink }: { crest?: string | null; name?: string; goals?: string; ink: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {crest ? (
        <img src={crest} alt="" style={{ width: 104, height: 104, objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,.2))" }} />
      ) : (
        <div style={{ width: 96, height: 96, borderRadius: "50%", border: `2px solid ${ink}`, opacity: 0.25 }} />
      )}
      {goals !== undefined && <div style={{ fontFamily: DMSERIF, fontSize: 104, lineHeight: 0.9, color: ink }}>{goals}</div>}
      {name && (
        <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 21, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.1, color: ink, maxWidth: 170 }}>{name}</div>
      )}
    </div>
  );
}

/** What each post type shows in the two columns left and right of the shield. */
function SideInfo({ data, ink, accent }: { data: RenderData; ink: string; accent: string }) {
  const c = data.content;
  const L = 112;
  const Rx = 1080 - 112;
  switch (data.postType) {
    case "goal":
    case "result":
      return (
        <>
          <Col x={L} top={560}>
            <Team crest={c.homeCrest} goals={c.homeGoals ?? "0"} ink={ink} />
          </Col>
          <Col x={Rx} top={560}>
            <Team crest={c.awayCrest} goals={c.awayGoals ?? "0"} ink={ink} />
          </Col>
        </>
      );
    case "matchday":
      return (
        <>
          <Col x={L} top={560}>
            <Team crest={c.homeCrest} name={c.homeTeam} ink={ink} />
          </Col>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560 }} />
          <Col x={Rx} top={560}>
            <Team crest={c.awayCrest} name={c.awayTeam} ink={ink} />
          </Col>
        </>
      );
    case "transfer": {
      const to = data.toClub ?? data.club;
      return (
        <>
          <Col x={L} top={560}>
            {data.fromClub ? (
              <>
                <Label ink={ink}>From</Label>
                <Team crest={data.fromClub.crestUrl} name={data.fromClub.name} ink={ink} />
              </>
            ) : (
              <>
                <Fact value={data.player.number || "—"} label={data.player.position || "Number"} ink={ink} accent={accent} />
              </>
            )}
          </Col>
          <Col x={Rx} top={560}>
            <Label ink={ink}>{data.fromClub ? "To" : "Signing"}</Label>
            <Team crest={to?.crestUrl} name={to?.name} ink={ink} />
          </Col>
        </>
      );
    }
    case "renewal":
      return (
        <>
          <Col x={L} top={600}>
            <Fact value={c.until || "—"} label="Contract until" ink={ink} accent={accent} />
          </Col>
          <Col x={Rx} top={580}>
            <Team crest={data.club?.crestUrl} name={data.club?.name} ink={ink} />
          </Col>
        </>
      );
    default: {
      const facts = factRows(data).slice(0, 4);
      const left = facts.filter((_, i) => i % 2 === 0);
      const right = facts.filter((_, i) => i % 2 === 1);
      const top = (n: number) => (n > 1 ? 470 : 600);
      return (
        <>
          <Col x={L} top={top(left.length)}>
            {left.map((f, i) => (
              <Fact key={i} value={f.value} label={f.label} ink={ink} accent={accent} />
            ))}
          </Col>
          <Col x={Rx} top={top(right.length)}>
            {right.map((f, i) => (
              <Fact key={i} value={f.value} label={f.label} ink={ink} accent={accent} />
            ))}
          </Col>
        </>
      );
    }
  }
}

function Label({ children, ink }: { children: ReactNode; ink: string }) {
  return <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: "0.3em", textTransform: "uppercase", color: ink, opacity: 0.6, marginBottom: -26 }}>{children}</div>;
}

/** Centred caption under the player's feet (date/time for a matchday, the competition otherwise). */
function BottomLine({ data, ink }: { data: RenderData; ink: string }) {
  const c = data.content;
  const main = (data.postType === "matchday" ? [c.date, c.time].filter(Boolean).join("  ·  ") : c.subline).toUpperCase();
  const sub = (data.postType === "matchday" ? [c.subline, c.venue].filter(Boolean).join(" · ") : [data.club?.name, data.player.position].filter(Boolean).join(" · ")).toUpperCase();
  const W = 640;
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2, width: W, top: 1228, textAlign: "center", color: ink }}>
      <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: fitSize(main, W, 30, 0.5, 5), letterSpacing: 5, whiteSpace: "nowrap", lineHeight: 1.1 }}>{main}</div>
      {sub && <div style={{ marginTop: 8, fontFamily: SANS, fontWeight: 500, fontSize: fitSize(sub, W, 14, 0.66, 4), letterSpacing: 4, whiteSpace: "nowrap", opacity: 0.6 }}>{sub}</div>}
    </div>
  );
}
