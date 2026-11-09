/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask, DMSERIF, figureBox, Film, type Box } from "./fx";
import { AgencyLogo, CONDENSED, Crest, factRows, fitSize, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/* Card geometry. */
const CX0 = 150;
const CX1 = 930;
const CY0 = 196;
const CY1 = 1168;

const GOLD = "linear-gradient(100deg, #8c6523 0%, #d7ad52 14%, #fbe6a2 26%, #c9993c 40%, #f4d684 56%, #a87b2e 72%, #efcf7a 88%, #b48634 100%)";
const FOIL = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.006 0.028' numOctaves='2' seed='4'/><feColorMatrix values='.55 0 0 0 .22  .55 0 0 0 .22  .55 0 0 0 .22  0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
)}")`;

const goldText: CSSProperties = {
  backgroundImage: `${FOIL}, ${GOLD}`,
  backgroundBlendMode: "overlay",
  backgroundSize: "300px 300px, 100% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** The word of the wordmark: one short word per post ("GOAL", "WIN", "MVP"…). */
function wordOf(data: RenderData): string {
  const c = data.content;
  const k = c.kicker.trim().toUpperCase();
  if (data.postType === "result") {
    const hg = Number(c.homeGoals ?? 0);
    const ag = Number(c.awayGoals ?? 0);
    const ours = (data.club?.name ?? "").toLowerCase();
    const home = c.home ?? ((c.awayTeam ?? "").toLowerCase() !== ours);
    const [us, them] = home ? [hg, ag] : [ag, hg];
    return us > them ? "WIN" : us === them ? "DRAW" : "FULL TIME";
  }
  if (!/\s/.test(k) && k.length > 1 && k.length <= 9) return k;
  switch (data.postType) {
    case "goal":
      return "GOAL";
    case "potm":
      return "MVP";
    case "stats":
      return "NUMBERS";
    case "renewal":
      return "SIGNED";
    case "matchday":
      return "MATCHDAY";
    case "transfer":
      return "NEW SIGNING";
    default:
      return k.split(/\s+/).pop() ?? k;
  }
}

/** Which letter turns into the italic swash (a vowel about two-thirds into the word, like "GOaL"). */
function swashIndex(word: string): number {
  const letters = [...word];
  const target = 0.62 * (letters.length - 1);
  let best = -1;
  // Letters whose italic lowercase is a real flourish come first (a, e, g, l, r).
  letters.forEach((ch, i) => {
    if (i === 0 || !/[AEGLR]/.test(ch)) return;
    if (best < 0 || Math.abs(i - target) <= Math.abs(best - target)) best = i;
  });
  if (best >= 0) return best;
  letters.forEach((ch, i) => {
    if (i === 0 || !/[AEIOUÁÉÍÓÚÂÊÔÃÕ]/.test(ch)) return;
    if (best < 0 || Math.abs(i - target) <= Math.abs(best - target)) best = i;
  });
  return best < 0 ? Math.floor(letters.length / 2) : best;
}

/**
 * Premium "goal" card (Wolves / Doherty): near-black background with big faint chevrons, a tall photo card with the
 * player over a blurred club-colour scene, a huge gold-foil serif wordmark with one italic swash letter overlapping the
 * top of the card, the name spaced vertically on both sides and a two-colour scoreboard at the bottom.
 */
export function Gilded({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const deep = shade(accent, -0.6);
  const bg = "#131313";
  const scene = data.club?.stadiumImages?.[0] ?? data.bgPhotoUrl ?? data.club?.cityImages?.[0] ?? null;

  // Wordmark.
  const word = wordOf(data);
  const letters = [...word];
  const si = swashIndex(word);
  const wordSize = Math.min(300, Math.floor(880 / (letters.length * 0.74 + 0.25))) * (params.textScale ?? 1);

  // Player: fills the card, head just under the middle of the wordmark (never above it).
  let box: Box | null = null;
  const cut = { ...data.cut };
  if (data.photoUrl) {
    box = figureBox(data, 540, CANVAS_H - CY1, 1010);
    const [, fy, , fh] = data.face ?? [0.4, 0.07, 0.2, 0.12];
    const headTop = box.top + (fy - fh * 0.62) * box.height;
    const minHead = (cut.top ?? 0) > 0 ? CY0 + 20 : 262;
    if (headTop < minHead) box = { ...box, top: box.top + (minHead - headTop) };
    // Where the photo cut the player (an arm, a shoulder), put that edge on the card edge so the cut is hidden.
    const cl = cut.left ?? 0;
    const cr = cut.right ?? 0;
    if (cl > 0 || cr > 0) {
      const [fx, , fw] = data.face ?? [0.4, 0.07, 0.2, 0.12];
      const target = cr >= cl ? CX1 + 6 - box.width : CX0 - 6;
      const faceX = target + (fx + fw / 2) * box.width;
      if (faceX > CX0 + 170 && faceX < CX1 - 170) {
        box = { ...box, left: target };
        if (cr >= cl) cut.right = 0;
        else cut.left = 0;
      }
    }
    // A bust must still reach the bottom of the card.
    if (box.top + box.height < CY1 && (cut.bottom ?? 0) > 0) {
      const k = (CY1 + 40 - box.top) / box.height;
      box = { left: 540 - (box.width * k) / 2 + (params.playerX ?? 0), top: box.top, width: box.width * k, height: box.height * k };
    }
  }
  const open = !(cut.top ?? 0);
  const playerClip = `polygon(${CX0}px ${open ? 0 : CY0}px, ${CX1}px ${open ? 0 : CY0}px, ${CX1}px ${CY1}px, ${CX0}px ${CY1}px)`;
  const name = `${content.firstName} ${content.lastName}`.toUpperCase();

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: bg, color: "#fff" }}>
      {/* Big faint chevrons. */}
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 50% 0 0)", background: "repeating-linear-gradient(56deg, #0b0b0b 0 150px, transparent 150px 330px)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 0 50%)", background: "repeating-linear-gradient(-56deg, #0b0b0b 0 150px, transparent 150px 330px)" }} />
      <div style={{ position: "absolute", left: CX0 - 200, right: 1080 - CX1 - 200, top: CY0 - 100, bottom: 1350 - CY1 - 100, background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 22%, transparent), transparent)` }} />

      {/* Photo card. */}
      <div style={{ position: "absolute", left: CX0, top: CY0, width: CX1 - CX0, height: CY1 - CY0, overflow: "hidden", background: `radial-gradient(90% 70% at 55% 35%, ${shade(accent, -0.3)}, ${shade(accent, -0.78)})`, boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
        {scene && (
          <img
            src={scene}
            alt=""
            style={{ position: "absolute", left: -60, top: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(22px) grayscale(1) contrast(1.2)", opacity: 0.4, mixBlendMode: "luminosity" }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: shade(accent, -0.3), mixBlendMode: "color", opacity: 0.6 }} />
        {/* Bokeh. */}
        {[
          [120, 260, 160, 0.18],
          [640, 180, 220, 0.14],
          [680, 620, 130, 0.12],
          [60, 720, 110, 0.1],
        ].map(([x, y, r, o], i) => (
          <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,${o}), transparent 70%)` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,.35), transparent 30%, transparent 65%, rgba(0,0,0,.45))` }} />
      </div>

      {/* Wordmark, behind the player's head. */}
      <Wordmark letters={letters} si={si} size={wordSize} top={40} />

      {/* Player. */}
      {data.photoUrl && box && (
        <div style={{ position: "absolute", inset: 0, clipPath: playerClip }}>
          <div style={{ position: "absolute", ...box, ...cutMask(cut) }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", maxWidth: "none", filter: "contrast(1.05) saturate(1.05) drop-shadow(0 20px 30px rgba(0,0,0,.35))" }} />
          </div>
        </div>
      )}
      {!data.photoUrl && data.club?.crestUrl && (
        <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 540 - 220, top: 480, width: 440, height: 440, objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,.5))" }} />
      )}

      {/* Name spaced vertically on both sides. */}
      {[
        { x: 74, rot: "rotate(180deg)" },
        { x: 1080 - 74, rot: "none" },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x - 12,
            top: CY0,
            height: CY1 - CY0,
            width: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            writingMode: "vertical-rl",
            transform: s.rot,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: Math.min(17, Math.floor(820 / (name.length * 1.25))),
            letterSpacing: "0.55em",
            color: "rgba(255,255,255,.72)",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      ))}

      <Board data={data} accent={accent} />

      {/* Footer. */}
      <Footer data={data} />
      <Film strength={0.8} />
    </div>
  );
}

function Wordmark({ letters, si, size, top }: { letters: string[]; si: number; size: number; top: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        fontFamily: DMSERIF,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        filter: "drop-shadow(0 10px 18px rgba(0,0,0,.55))",
      }}
    >
      <div style={{ ...goldText, display: "flex", alignItems: "baseline", padding: "0 0.1em 0.12em" }}>
        {letters.map((ch, i) =>
          i === si ? (
            <span key={i} style={{ fontStyle: "italic", fontSize: "1.3em", lineHeight: 0.6, margin: "0 0.01em 0 -0.03em", textTransform: "lowercase" }}>
              {ch.toLowerCase()}
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
      </div>
    </div>
  );
}

/** Cell of the scoreboard. */
function Cell({ gold, children, width, style }: { gold?: boolean; children: ReactNode; width?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        height: 124,
        width,
        padding: "0 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        background: gold ? `${FOIL}, ${GOLD}` : "#0d0d0d",
        backgroundBlendMode: gold ? "overlay" : undefined,
        backgroundSize: gold ? "300px 300px, 100% 100%" : undefined,
        color: gold ? "#1a1408" : "#fff",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Num = ({ children, size = 92 }: { children: ReactNode; size?: number }) => <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: size, lineHeight: 1 }}>{children}</div>;

const Logo = ({ src, size = 84 }: { src?: string | null; size?: number }) =>
  src ? <img src={src} alt="" style={{ width: size, height: size, objectFit: "contain" }} /> : <div style={{ width: size * 0.8, height: size * 0.8, borderRadius: "50%", border: "3px solid currentColor", opacity: 0.35 }} />;

const Lab = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, letterSpacing: "0.26em", textTransform: "uppercase", opacity: 0.8, marginTop: 8, whiteSpace: "nowrap" }}>{children}</div>
);

/** Bottom scoreboard: score for goals/results, kick-off for a matchday, key numbers otherwise. */
function Board({ data, accent }: { data: RenderData; accent: string }) {
  const c = data.content;
  let body: ReactNode;
  switch (data.postType) {
    case "goal":
    case "result":
      body = (
        <>
          <Cell>
            <Logo src={c.homeCrest ?? data.club?.crestUrl} />
            <Num>{c.homeGoals ?? "0"}</Num>
          </Cell>
          <Cell gold>
            <Num>{c.awayGoals ?? "0"}</Num>
            <Logo src={c.awayCrest} />
          </Cell>
        </>
      );
      break;
    case "matchday":
      body = (
        <>
          <Cell>
            <Logo src={c.homeCrest} />
          </Cell>
          <Cell gold style={{ flexDirection: "column", gap: 0 }}>
            <Num size={62}>{c.time || "--:--"}</Num>
            <Lab>{c.date || "Today"}</Lab>
          </Cell>
          <Cell>
            <Logo src={c.awayCrest} />
          </Cell>
        </>
      );
      break;
    case "renewal":
      body = (
        <>
          <Cell style={{ flexDirection: "column", gap: 0 }}>
            <Lab>Contract until</Lab>
          </Cell>
          <Cell gold>
            <Num size={72}>{c.until || "—"}</Num>
            <Logo src={data.club?.crestUrl} size={72} />
          </Cell>
        </>
      );
      break;
    default: {
      const facts = factRows(data).slice(0, 4);
      body = facts.map((f, i) => (
        <Cell key={i} gold={i === facts.length - 1} width={facts.length > 3 ? 190 : 220} style={{ flexDirection: "column", gap: 0, padding: "0 12px" }}>
          <Num size={fitSize(String(f.value), 160, 62, 0.72)}>{f.value}</Num>
          <Lab>{f.label}</Lab>
        </Cell>
      ));
    }
  }
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: CY1 - 70, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", display: "flex", boxShadow: "0 24px 50px rgba(0,0,0,.55)", borderTop: `3px solid ${accent}` }}>
        {body}
        <div style={{ position: "absolute", left: "50%", bottom: -16, width: 0, height: 0, transform: "translateX(-50%)", borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "16px solid #e9c76f" }} />
      </div>
    </div>
  );
}

function Footer({ data }: { data: RenderData }) {
  const c = data.content;
  const line = [c.kicker, c.subline].filter(Boolean).join("  ·  ").toUpperCase();
  const W = 640;
  return (
    <>
      <AgencyLogo data={data} height={28} style={{ position: "absolute", left: 60, bottom: 48 }} />
      <div style={{ position: "absolute", left: (1080 - W) / 2, width: W, bottom: 52, textAlign: "center", fontFamily: CONDENSED, fontWeight: 600, fontSize: fitSize(line, W, 22, 0.5, 4), letterSpacing: 4, whiteSpace: "nowrap", color: "#d9b865" }}>
        {line}
      </div>
      <Crest club={data.club} size={60} style={{ position: "absolute", right: 56, bottom: 36 }} />
    </>
  );
}
