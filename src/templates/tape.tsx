/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng, TornSheet } from "./kit";
import { OwnPhotoBlur, scoreOf } from "./outline";
import { AgencyLogo, BEBAS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { photoOval, portraitBox } from "./versus";

const INK = "#141416";
const PAPER = "#f1efe9";

/** Bebas Neue: average advance of its capitals relative to the font size. */
const BEBAS_W = 0.4;
const fitBebas = (t: string, width: number, max: number) => Math.min(max, width / Math.max(1, [...t].length * BEBAS_W));

const DAYS: Record<string, string> = { MON: "MONDAY", TUE: "TUESDAY", WED: "WEDNESDAY", THU: "THURSDAY", FRI: "FRIDAY", SAT: "SATURDAY", SUN: "SUNDAY" };
const MONTHS: Record<string, string> = { JAN: "JANUARY", FEB: "FEBRUARY", MAR: "MARCH", APR: "APRIL", MAY: "MAY", JUN: "JUNE", JUL: "JULY", AUG: "AUGUST", SEP: "SEPTEMBER", OCT: "OCTOBER", NOV: "NOVEMBER", DEC: "DECEMBER" };

/** "SAT 10 OCT" → ["SATURDAY", "10 OCTOBER"]. */
function dayLines(d: string | undefined): string[] {
  if (!d) return [];
  const m = d.toUpperCase().match(/^(?:[A-Z]{3}\s+)?(\d{1,2})\s+([A-Z]{3})/);
  // No day of the week: the day number, then the month.
  return m ? [m[1], MONTHS[m[2]] ?? m[2]] : [d.toUpperCase()];
}

/** SVG filters: the paper sticker border, the sketched face and the worn print. */
function Defs({ seed }: { seed: number }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      {/* White torn-paper border around the cutout: its silhouette grown, roughened, filled with paper. */}
      <filter id="tp-sticker" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" radius="20" result="grown" />
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed={seed} result="wobble" />
        <feDisplacementMap in="grown" in2="wobble" scale="26" xChannelSelector="R" yChannelSelector="G" result="torn" />
        <feFlood floodColor="#f3f1eb" result="white" />
        <feTurbulence type="fractalNoise" baseFrequency="0.014 0.022" numOctaves="4" seed={seed + 2} result="crumple" />
        <feColorMatrix in="crumple" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.24  0 0 0 0 0.22  0.6 0 0 0 -0.22" result="creases" />
        <feComposite in="creases" in2="white" operator="over" result="paperShade" />
        <feComposite in="paperShade" in2="torn" operator="in" result="paper" />
        <feMerge>
          <feMergeNode in="paper" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {/* Sketch: greyscale, strong unsharp mask (drawn edges), then a hard contrast curve. */}
      <filter id="tp-sketch" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="grey" />
        <feGaussianBlur in="grey" stdDeviation="2.4" result="soft" />
        <feComposite in="grey" in2="soft" operator="arithmetic" k1="0" k2="3.2" k3="-2.2" k4="0" result="edges" />
        <feGaussianBlur in="grey" stdDeviation="9" result="wide" />
        <feComposite in="edges" in2="wide" operator="arithmetic" k1="0" k2="1.5" k3="-0.5" k4="0.02" result="local" />
        <feComponentTransfer in="local" result="curve">
          <feFuncR type="table" tableValues="0 0.12 0.4 0.72 0.93 1" />
          <feFuncG type="table" tableValues="0 0.12 0.4 0.72 0.93 1" />
          <feFuncB type="table" tableValues="0 0.12 0.4 0.72 0.93 1" />
        </feComponentTransfer>
        <feComposite in="curve" in2="SourceAlpha" operator="in" />
      </filter>
      {/* Worn letterpress: fine speckle holes and a few bigger scuffs. */}
      <filter id="tp-worn" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed={seed + 5} result="fine" />
        <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -9 0 0 0 6.9" result="fineMask" />
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed={seed + 9} result="coarse" />
        <feColorMatrix in="coarse" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -7 0 0 0 5.5" result="coarseMask" />
        <feComposite in="fineMask" in2="coarseMask" operator="in" result="mask" />
        <feComposite in="SourceGraphic" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

/** A strip of translucent masking tape with torn ends. */
function TapeStrip({ x, y, w = 130, rotate }: { x: number; y: number; w?: number; rotate: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - 19,
        width: w,
        height: 38,
        transform: `rotate(${rotate}deg)`,
        background: "linear-gradient(to bottom, rgba(236,232,220,.78), rgba(222,217,202,.72))",
        clipPath: "polygon(0 8%, 5% 0, 9% 10%, 14% 2%, 86% 0, 91% 9%, 96% 1%, 100% 10%, 100% 90%, 95% 100%, 90% 91%, 85% 100%, 12% 98%, 7% 90%, 3% 100%, 0 92%)",
        boxShadow: "0 2px 6px rgba(0,0,0,.15)",
      }}
    />
  );
}

/** Condensed worn caps. */
function Worn({ children, size, color, style }: { children: ReactNode; size: number; color: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: BEBAS, fontSize: size, lineHeight: 0.92, color, whiteSpace: "nowrap", filter: "url(#tp-worn)", paddingTop: size * 0.06, ...style }}>{children}</div>;
}

/**
 * Palace v City paper cut-outs: a dark black-and-white stadium; the player's head and shoulders cut out as a
 * sticker with a thick torn white paper edge, his face drawn in sketchy black and white while the kit keeps
 * its colour; torn paper labels held by tape — "MATCHDAY" on the club colour, "HOME vs AWAY" on white,
 * the crests on two paper squares at the top — and a big torn accent-colour block with day, date and kick-off.
 */
export function Tape({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 17;
  const r = rng(seed);
  const flip = params.side === "left";
  const X = (x: number, w = 0) => (flip ? CANVAS_W - x - w : x);
  const base = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const club = luminance(base) < 0.05 ? "#e9e7e1" : base;
  const clubInk = luminance(club) > 0.5 ? INK : "#ffffff";
  // The block and the second crest square use the accent; too close to the club colour → a warm paper orange.
  const acc0 = vivid(params.accent);
  const near = Math.abs(luminance(acc0) - luminance(club)) < 0.04 || luminance(acc0) < 0.04;
  const accent = near ? "#f39a1e" : acc0;
  const accentInk = luminance(accent) > 0.35 ? INK : "#ffffff";
  const ts = params.textScale ?? 1;
  const scene = params.scene ?? data.club?.stadiumImages?.[0] ?? data.club?.backdrops?.[0] ?? null;

  // ---- the sticker: head and shoulders, big, on the far side ----
  const sizes = { chest: 300, waist: 270, knees: 240, full: 220 };
  const want = ((sizes as Record<string, number>)[params.framing ?? "waist"] ?? 270) * (params.playerScale ?? 1);
  const faceH0 = data.facePx > 0 ? Math.min(want, Math.max(110, data.facePx * 1.5)) : want;
  // Chin around y≈700 so the labels overlap the shoulders, not the face.
  const faceTop = Math.max(300, 700 - faceH0 * 1.05);
  // Not stretched to the bottom edge: a tight bust simply ends in a torn paper edge.
  const fig = portraitBox(data, X(650), faceTop, sizes, 1.5, false);
  const endsAbove = fig.top + fig.height < CANVAS_H;
  const chinY = fig.faceTop + fig.faceH * 1.05;
  // Sketch layer: head and neck; fades out onto the kit, which keeps its colour.
  const sketchMask = `linear-gradient(to bottom, #000 ${Math.round(chinY + fig.faceH * 0.25)}px, transparent ${Math.round(chinY + fig.faceH * 0.75)}px)`;
  const imgBase: CSSProperties = { position: "absolute", left: fig.left, top: fig.top, width: fig.width, height: fig.height, maxWidth: "none" };
  // Where the sticker ends above the canvas edge the photo's own cut stays hard: the paper tears there.
  const mask = data.photoIsCutout ? cutMask(endsAbove ? { ...data.cut, bottom: 0 } : data.cut) : photoOval(fig);

  // ---- words ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const short = (s: string) => {
    // Club names exactly as stored ("SC Vianense SAD"), never shortened.
    return s.toUpperCase().replace(/\s+/g, " ").trim();
  };
  const home = short(content.homeTeam || "");
  const away = short(content.awayTeam || "");
  const score = scoreOf(data, "-");
  const kicker = content.kicker.toUpperCase().replace(/^IT'S\s+/, "");

  // Strip 1 (club colour): the kicker.
  const k1Size = fitBebas(kicker, 520, 170) * ts;
  // Strip 2 (white): "HOME vs AWAY", the score, or the name.
  const ours = (data.club?.name ?? "").toUpperCase();
  const oursIsAway = !!away && ours.includes(away);
  const teamLine = postType === "matchday" || postType === "result";
  const left2 = teamLine && home && away ? home : (content.firstName || "").toUpperCase();
  const right2 = teamLine && home && away ? away : (content.lastName || "").toUpperCase();
  const mid2 = teamLine && home && away ? (postType === "result" && score ? score : "vs") : "";
  const leftBig = teamLine ? !oursIsAway && ours.includes(left2) : false;
  const s2 = Math.min(fitBebas(`${left2}${right2}`, 470 - mid2.length * 30, 150), 150) * ts;
  const sizeL = leftBig ? s2 * 1.15 : s2 * 0.82;
  const sizeR = leftBig ? s2 * 0.82 : s2 * 1.15;

  // Crest squares (top).
  let squares: { src?: string | null; text?: string }[] = [];
  if (postType === "transfer") squares = [{ src: data.fromClub?.crestUrl }, { src: (data.toClub ?? data.club)?.crestUrl }];
  else if (postType === "potm") squares = [{ src: data.club?.crestUrl }, { text: data.player.number ? `#${data.player.number}` : "" }];
  else squares = [{ src: content.homeCrest ?? (content.awayCrest ? null : data.club?.crestUrl) }, { src: content.awayCrest }];
  squares = squares.filter((q) => q.src || q.text);

  // Bottom block.
  const [dayName, dayDate] = dayLines(content.date);
  const hrs = content.time ? `${content.time.replace(/\D/g, "").padStart(4, "0")}HRS` : "";
  const venue = (content.venue || "").toUpperCase();
  const pos = (data.player.position || "").toUpperCase();
  let blockLines: string[] = [];
  let blockBig = "";
  let blockSide = "";
  if (postType === "matchday") {
    blockLines = [dayName, dayDate].filter(Boolean) as string[];
    blockBig = hrs;
    blockSide = venue;
  } else if (postType === "result") {
    const comp = (content.subline.split("·")[0] ?? "").trim().toUpperCase();
    const days = [dayName, dayDate].filter(Boolean) as string[];
    blockLines = days.length ? days : [comp];
    blockBig = "FULL TIME";
    blockSide = days.length ? comp : "";
  } else if (postType === "transfer") {
    blockLines = [pos, content.until ? "CONTRACT UNTIL" : ""].filter(Boolean);
    blockBig = content.until ? String(content.until).toUpperCase() : data.player.number ? `#${data.player.number}` : "";
    blockSide = (data.toClub ?? data.club)?.name?.toUpperCase() ?? "";
  } else {
    const facts = content.stats.filter((s) => s.value && String(s.value) !== "0").slice(0, 3);
    blockLines = facts.slice(0, 2).map((f) => `${f.value} ${f.label}`.toUpperCase());
    blockBig = (content.subline.split("·").pop() ?? "").trim().toUpperCase() || name;
    blockSide = facts[2] ? `${facts[2].value} ${facts[2].label}`.toUpperCase() : "";
  }
  const sideWords = blockSide.split(/\s+/).filter(Boolean);
  const sideLines = sideWords.length > 2 ? [sideWords.slice(0, Math.ceil(sideWords.length / 2)).join(" "), sideWords.slice(Math.ceil(sideWords.length / 2)).join(" ")] : sideWords.length ? [sideWords.join(" ")] : [];
  const bigSize = Math.min(118, 330 / Math.max(1, [...blockBig].length * BEBAS_W));
  const sideSize = Math.min(52, Math.max(26, 220 / Math.max(1, Math.max(...sideLines.map((l) => [...l].length), 1) * BEBAS_W)));
  const lineSize = Math.min(56, 520 / Math.max(1, Math.max(...blockLines.map((l) => [...l].length), 1) * BEBAS_W));

  const stickerBottom = fig.top + fig.height;
  const rot = (a: number) => (flip ? -a : a) + (r() - 0.5) * 1.2;

  // Layout rows.
  const k1Top = Math.max(chinY + 40, 720);
  const s2Top = k1Top + k1Size * 0.95 + 24;
  // The block's text must end above the bottom edge (its paper runs off it).
  const blockNeed = 34 + 20 + blockLines.length * lineSize * 0.98 + (blockBig || sideLines.length ? Math.max(bigSize, sideLines.length * sideSize) * 0.98 + 4 : 0) + 50;
  const blockTop = Math.min(Math.max(s2Top + Math.max(sizeL, sizeR) + 60, 1060), CANVAS_H - blockNeed);
  const cardTop = endsAbove && stickerBottom < 1060 && data.player.number && postType !== "potm" ? Math.min(Math.max(stickerBottom + 10, s2Top + 150), CANVAS_H - 330) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#16171a", color: INK }}>
      <Defs seed={seed % 50} />
      {/* Dark black-and-white stadium. */}
      {scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -30, top: -30, width: CANVAS_W + 60, height: CANVAS_H + 60, maxWidth: "none", objectFit: "cover", filter: "grayscale(1) contrast(1.15) brightness(.42) blur(1.5px)" }} />
      ) : (
        <OwnPhotoBlur data={data} blur={30} style={{ filter: "blur(30px) grayscale(1) contrast(1.1) brightness(.45)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,10,12,.2), rgba(10,10,12,.35) 50%, rgba(10,10,12,.75))" }} />
      <Film strength={2.2} />

      {/* The paper sticker: colour cutout + sketched head, with the torn white edge around both. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 26px rgba(0,0,0,.55))" }}>
          <div style={{ position: "absolute", inset: 0, filter: "url(#tp-sticker)" }}>
            <img src={data.photoUrl} alt="" style={{ ...imgBase, filter: "contrast(1.08) saturate(1.12)", ...mask }} />
            <div style={{ position: "absolute", inset: 0, WebkitMaskImage: sketchMask, maskImage: sketchMask }}>
              <img src={data.photoUrl} alt="" style={{ ...imgBase, filter: "url(#tp-sketch)", ...mask }} />
            </div>
          </div>
        </div>
      )}

      {/* Crests on two paper squares, top. */}
      {squares.length > 0 && (
        <div style={{ position: "absolute", left: X(squares.length > 1 ? 250 : 340, squares.length > 1 ? 380 : 200), top: 70, width: squares.length > 1 ? 380 : 200, height: 220 }}>
          {squares.map((q, i) => {
            const bg = i === 0 ? PAPER : accent;
            return (
              <TornSheet key={i} x={i * 176} y={i ? 8 : 0} w={200} h={200} color={bg} rotate={i ? 2.5 : -2} seed={seed + i * 11} edges={{ top: true, bottom: true, left: i === 1, right: i === 0 }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {q.src ? (
                    <img src={q.src} alt="" style={{ width: 138, height: 138, objectFit: "contain", filter: i ? "drop-shadow(0 2px 3px rgba(0,0,0,.25))" : "none" }} />
                  ) : (
                    <Worn size={110} color={i ? accentInk : INK}>{q.text}</Worn>
                  )}
                </div>
              </TornSheet>
            );
          })}
          <TapeStrip x={squares.length > 1 ? 190 : 100} y={2} rotate={rot(-6)} />
        </div>
      )}

      {/* Strip 1: the kicker on the club colour, running off the edge. */}
      <TornSheet x={X(-40, 660)} y={k1Top} w={660} h={k1Size * 0.95 + 20} color={club} rotate={rot(-1.5)} seed={seed + 3} edges={{ top: true, bottom: true, left: flip, right: !flip }}>
        <Worn size={k1Size} color={clubInk} style={{ position: "absolute", top: 10, [flip ? "right" : "left"]: 90 }}>
          {kicker}
        </Worn>
      </TornSheet>

      {/* Strip 2: white paper, "HOME vs AWAY". */}
      {(left2 || right2) && (
        <div style={{ position: "absolute", left: X(170, 640), top: s2Top, width: 640 }}>
          <TornSheet x={0} y={0} w={640} h={Math.max(sizeL, sizeR) * 0.95 + 36} color={PAPER} rotate={rot(1.2)} seed={seed + 5} edges={{ top: true, bottom: true, left: true, right: true }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, paddingTop: 6 }}>
              <Worn size={sizeL} color={leftBig ? club : INK}>{left2}</Worn>
              {mid2 && (
                <div style={{ background: accent, color: accentInk, fontFamily: BEBAS, fontSize: mid2 === "vs" ? 40 : 62, lineHeight: 1, padding: mid2 === "vs" ? "5px 8px 1px" : "6px 12px 0", alignSelf: "center" }}>{mid2}</div>
              )}
              <Worn size={sizeR} color={leftBig || luminance(club) > 0.6 ? INK : club}>{right2}</Worn>
            </div>
          </TornSheet>
          <TapeStrip x={flip ? 600 : 40} y={10} w={110} rotate={rot(-38)} />
        </div>
      )}

      {/* Bottom block: accent paper, day / date / kick-off. */}
      <TornSheet x={X(-30, 700)} y={blockTop} w={700} h={CANVAS_H - blockTop + 40} color={accent} rotate={rot(-1)} seed={seed + 8} edges={{ top: true, bottom: false, left: flip, right: !flip }}>
        <div style={{ position: "absolute", top: 34, [flip ? "right" : "left"]: 92, display: "flex", flexDirection: "column", alignItems: flip ? "flex-end" : "flex-start" }}>
          <div style={{ width: 120, height: 4, background: accentInk, marginBottom: 16, opacity: 0.9 }} />
          {blockLines.map((l, i) => (
            <Worn key={i} size={lineSize} color={accentInk}>
              {l}
            </Worn>
          ))}
          {(blockBig || sideLines.length > 0) && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexDirection: flip ? "row-reverse" : "row", marginTop: 4 }}>
              {blockBig && (
                <Worn size={bigSize} color={accentInk}>
                  {blockBig}
                </Worn>
              )}
              {sideLines.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", paddingBottom: bigSize * 0.08, alignItems: flip ? "flex-end" : "flex-start" }}>
                  {sideLines.map((l, i) => (
                    <Worn key={i} size={sideSize} color={accentInk}>
                      {l}
                    </Worn>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </TornSheet>

      {/* A tight bust ends high: a taped number card fills the empty corner under it. */}
      {cardTop != null && (
        <div style={{ position: "absolute", left: X(730, 290), top: cardTop, width: 290, height: 250 }}>
          <TornSheet x={0} y={0} w={290} h={250} color={PAPER} rotate={rot(3)} seed={seed + 21} edges={{ top: true, bottom: true, left: true, right: true }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Worn size={150} color={INK}>
                {data.player.number}
              </Worn>
              {pos && <Worn size={Math.min(40, 250 / Math.max(1, [...pos].length * BEBAS_W))} color={luminance(club) > 0.6 ? INK : club}>{pos}</Worn>}
            </div>
          </TornSheet>
          <TapeStrip x={145} y={4} w={120} rotate={rot(4)} />
        </div>
      )}
      <AgencyLogo data={data} height={26} style={{ position: "absolute", bottom: 46, [flip ? "left" : "right"]: 56, opacity: 0.9, filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }} />
      <Film strength={0.8} />
    </div>
  );
}
