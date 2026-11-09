/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import type { StatItem, TemplateParams } from "@/lib/types";
import { cutMask } from "./fx";
import { CANVAS_H, CANVAS_W, type RenderClub, type RenderData } from "./types";

export const DISPLAY = "var(--font-anton), Impact, sans-serif";
export const CONDENSED = "var(--font-barlow), 'Arial Narrow', sans-serif";

const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

const GRUNGE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.06' numOctaves='4'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 3.1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

/** Rough width of uppercase Anton glyphs relative to font size. */
const ANTON_RATIO = 0.56;

/** Font size that fits `text` on one line inside `width`, capped at `max`. */
export function fitSize(text: string, width: number, max: number, ratio = ANTON_RATIO, letterSpacing = 0): number {
  const len = Math.max(1, [...text].length);
  return Math.floor(Math.min(max, (width / len - letterSpacing) / ratio));
}

/** Italic condensed caption line (e.g. "LIGA 3 · MATCHDAY 5"), shrunk to stay on one line. */
export function Subline({ text, width, color, max = 42 }: { text: string; width: number; color: string; max?: number }) {
  const t = text.toUpperCase();
  return (
    <div
      style={{
        fontFamily: CONDENSED,
        fontWeight: 800,
        fontStyle: "italic",
        fontSize: fitSize(t, width, max, 0.5, 5),
        letterSpacing: 5,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {t}
    </div>
  );
}

export function Canvas({ children, params }: { children: ReactNode; params: TemplateParams }) {
  return (
    <div
      style={{
        position: "relative",
        width: CANVAS_W,
        height: CANVAS_H,
        overflow: "hidden",
        background: `color-mix(in srgb, ${params.primary} 35%, #05070d)`,
        color: params.text,
        fontFamily: CONDENSED,
      }}
    >
      {children}
      {/* Fine noise always on (dithers gradients so they never band); stronger when "grain" is chosen. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: NOISE,
          opacity: params.grain ? 0.09 : 0.035,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function Background({ data }: { data: RenderData }) {
  const { params, bgPhotoUrl } = data;
  const deep = `color-mix(in srgb, ${params.primary} 35%, #05070d)`;
  const mid = `color-mix(in srgb, ${params.primary} 70%, #05070d)`;
  const lightSide = params.side === "right" ? "78%" : "22%";

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(130% 90% at ${lightSide} 28%, ${mid} 0%, color-mix(in srgb, ${params.primary} 52%, #05070d) 28%, ${deep} 55%, color-mix(in srgb, ${params.primary} 18%, #04050a) 78%, #04050a 100%)`,
        }}
      />

      {params.bgStyle === "photo" && bgPhotoUrl && (
        <img
          src={bgPhotoUrl}
          alt=""
          style={{
            position: "absolute",
            inset: -40,
            width: "calc(100% + 80px)",
            height: "calc(100% + 80px)",
            objectFit: "cover",
            filter: "grayscale(1) blur(6px) contrast(1.1)",
            opacity: 0.35,
            mixBlendMode: "luminosity",
          }}
        />
      )}

      {params.bgStyle === "rays" && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: -400,
                left: params.side === "right" ? 620 + i * 150 : 120 + i * 150,
                width: 26 - i * 7,
                height: 2400,
                transform: `rotate(${params.side === "right" ? 28 : -28}deg)`,
                background: `linear-gradient(180deg, transparent, ${params.accent} 45%, transparent)`,
                boxShadow: `0 0 60px 10px color-mix(in srgb, ${params.accent} 50%, transparent)`,
                opacity: 0.55 - i * 0.12,
              }}
            />
          ))}
          {params.templateId === "spotlight" && (
            <StadiumLights accent={params.accent} side={params.side === "right" ? "left" : "right"} />
          )}
        </>
      )}

      {params.bgStyle === "pitch" && <PitchLines color={params.text} />}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(150% 110% at 50% 40%, transparent 50%, rgba(0,0,0,.18) 68%, rgba(0,0,0,.42) 85%, rgba(0,0,0,.6) 100%)",
        }}
      />
    </div>
  );
}

function StadiumLights({ accent, side }: { accent: string; side: "left" | "right" }) {
  const dots = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", top: 170, [side]: 30, width: 150, display: "flex", flexWrap: "wrap", gap: 12, opacity: 0.8 }}>
      {dots.map((i) => (
        <span
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 99,
            background: "#fff",
            boxShadow: `0 0 18px 6px color-mix(in srgb, ${accent} 70%, #fff)`,
            opacity: 0.4 + ((i * 37) % 60) / 100,
          }}
        />
      ))}
    </div>
  );
}

function PitchLines({ color }: { color: string }) {
  const line = `3px solid color-mix(in srgb, ${color} 14%, transparent)`;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 60, bottom: 60, border: line }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: "50%", borderTop: line }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 360, height: 360, marginLeft: -180, marginTop: -180, borderRadius: "50%", border: line }} />
      <div style={{ position: "absolute", left: 300, right: 300, top: 60, height: 180, border: line, borderTop: "none" }} />
    </div>
  );
}

/** Extra zoom for knees / waist / chest framings inside a PlayerFigure box. */
function framingZoom(data: RenderData): number {
  const depths: Record<string, number> = { knees: 5.6, waist: 3.9, chest: 2.5 };
  const depth = depths[data.params.framing ?? ""] ?? 0;
  const f = data.face;
  if (!depth || !f) return 1;
  const crop = Math.min(0.98, f[1] + f[3] * depth);
  const headTop = Math.max(0, f[1] - f[3] * 0.75);
  return Math.max(1, (1 - headTop) / (crop - headTop));
}

/** The player: a transparent cutout anchored to the bottom, or the raw photo faded out. */
export function PlayerFigure({
  data,
  box,
  ghost = false,
}: {
  data: RenderData;
  box: { left: number; width: number; top: number; bottom?: number };
  ghost?: boolean;
}) {
  const { photoUrl, photoIsCutout, params } = data;
  const style: CSSProperties = {
    position: "absolute",
    left: box.left,
    width: box.width,
    top: box.top,
    bottom: box.bottom ?? 0,
    transform: ghost
      ? undefined
      : `translate(${params.playerX ?? 0}px, ${params.playerY ?? 0}px) scale(${(params.playerScale ?? 1) * framingZoom(data)})`,
    // Tighter framings grow the player downwards from the head, so the crop falls off the bottom edge.
    transformOrigin: params.framing && params.framing !== "full" ? "50% 0%" : "center bottom",
  };

  if (!photoUrl) {
    return (
      <div
        style={{
          ...style,
          border: `4px dashed color-mix(in srgb, ${params.text} 35%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          fontWeight: 700,
          color: `color-mix(in srgb, ${params.text} 55%, transparent)`,
          textAlign: "center",
          padding: 40,
        }}
      >
        FOTO DO JOGADOR
      </div>
    );
  }

  if (!photoIsCutout) {
    const fadeTo = params.side === "right" ? "to left" : "to right";
    return (
      <img
        src={photoUrl}
        alt=""
        style={{
          ...style,
          objectFit: "cover",
          WebkitMaskImage: `linear-gradient(${fadeTo}, #000 55%, transparent), linear-gradient(to top, transparent, #000 25%)`,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />
    );
  }

  if (ghost) {
    return (
      <img
        src={photoUrl}
        alt=""
        style={{
          ...style,
          objectFit: "contain",
          objectPosition: "center top",
          filter: "grayscale(1) brightness(1.3) blur(1.5px)",
          opacity: 0.13,
          mixBlendMode: "screen",
          // Dissolve every edge so the oversized copy never shows a hard cut.
          WebkitMaskImage: "radial-gradient(ellipse 55% 50% at 50% 38%, #000 30%, rgba(0,0,0,.45) 60%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 55% 50% at 50% 38%, #000 30%, rgba(0,0,0,.45) 60%, transparent 85%)",
        }}
      />
    );
  }

  return (
    <img
      src={photoUrl}
      alt=""
      style={{
        ...style,
        ...cutMask(data.cut),
        objectFit: "contain",
        objectPosition: `${params.side === "right" ? "right" : "left"} bottom`,
        filter: `drop-shadow(0 0 2px color-mix(in srgb, ${params.accent} 60%, transparent)) drop-shadow(0 30px 40px rgba(0,0,0,.55))`,
      }}
    />
  );
}

export function Crest({ club, size, style }: { club: RenderClub | null; size: number; style?: CSSProperties }) {
  if (!club?.crestUrl) return null;
  return (
    <img
      src={club.crestUrl}
      alt=""
      style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.5))", ...style }}
    />
  );
}

/** Agency logo; `onLight` switches to the dark version for light backgrounds. */
/**
 * How far a story layout that keeps the logo's place at its foot (title at STORY_TOP, foot just above the
 * logo) should come down when there is no logo (the user's own clients: hideAgency): the foot would end
 * ~390px from the bottom against 170px at the top, so the picture and its type looked pushed up. Half the
 * difference centres them in the 1920. 0 on posts and when the logo is there.
 */
export function noLogoDrop(data: RenderData): number {
  const story = (data.canvasH ?? CANVAS_H) > 1400;
  const logo = !!(data.agency.logoUrl || data.agency.logoDarkUrl || data.agency.name || data.agency.studio);
  return story && !logo ? 110 : 0;
}

export function AgencyLogo({ data, height: asked, style, onLight = false }: { data: RenderData; height: number; style?: CSSProperties; onLight?: boolean }) {
  const { agency } = data;
  // The agency wants its mark clearly visible in every look (as in the weekend's "Corrida desfocada" edits):
  // twice what each look asks for, never under 52px, and lifted off the photo by a soft shadow.
  const postHeight = Math.max(52, Math.round(asked * (asked >= 40 ? 1.5 : 2)));
  // Stories are seen full-screen on a phone, where the post size reads tiny: ~1.7× there (never under 88px).
  const height = (data.canvasH ?? 1350) > 1400 ? Math.max(88, Math.round(postHeight * 1.7)) : postHeight;
  const lift = onLight ? "drop-shadow(0 1px 6px rgba(255,255,255,.55))" : "drop-shadow(0 3px 12px rgba(0,0,0,.6))";
  style = { ...style, filter: [style?.filter, lift].filter(Boolean).join(" ") };
  const url = onLight ? agency.logoDarkUrl ?? agency.logoUrl : agency.logoUrl;
  if (url && agency.tagline) {
    // The NEYOD file has its tagline removed: in the image it was ~4px tall in an export and unreadable on a
    // phone. Here it is real text (crisp at any zoom), a little larger and heavier, where it sat in the logo
    // (from 31% of the width, baseline at 83% of the height).
    const fs = height * 0.1;
    return (
      <div data-agency-logo style={{ position: "relative", display: "inline-block", height, flexShrink: 0, ...style }}>
        <img src={url} alt="" style={{ height, display: "block", maxWidth: "none" }} />
        <div
          data-keep-shadow
          style={{
            position: "absolute",
            left: "31.2%",
            top: height * 0.835 - fs * 0.86,
            fontFamily: "var(--font-montserrat), 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 600,
            fontSize: fs,
            lineHeight: 1,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            color: onLight ? "#111111" : "#ffffff",
            // Its own dark halo: on a white kit behind it the thin line would otherwise vanish.
            textShadow: onLight ? "none" : "0 0 2px rgba(0,0,0,.7), 0 1px 4px rgba(0,0,0,.55)",
          }}
        >
          {agency.tagline}
        </div>
      </div>
    );
  }
  if (url) {
    return <img data-agency-logo src={url} alt="" style={{ height, objectFit: "contain", ...style }} />;
  }
  if (agency.studio) {
    // The studio mark (the pitch's centre circle with its lime spot) over the handle: deliberately quiet,
    // about two-thirds of the agency logo's height (bigger after the user saw Fermin's), still a signature.
    const ink = onLight ? "#111111" : "#f3f0e8";
    const ring = Math.round(height * 0.46);
    return (
      <div data-agency-logo style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: Math.round(height * 0.08), opacity: 0.92, flexShrink: 0, ...style }}>
        <svg width={ring} height={ring} viewBox="0 0 100 100" style={{ display: "block" }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke={ink} strokeWidth="4" />
          <circle cx="50" cy="50" r="7" fill={onLight ? "#2e7d32" : "#c8ff3e"} />
        </svg>
        <div style={{ fontFamily: "var(--font-archivo), 'Helvetica Neue', Arial, sans-serif", fontWeight: 300, fontSize: Math.round(height * 0.23), letterSpacing: "0.12em", color: ink, whiteSpace: "nowrap", lineHeight: 1 }}>{agency.studio}</div>
      </div>
    );
  }
  return (
    <div data-agency-logo style={{ fontFamily: CONDENSED, fontWeight: 900, fontSize: height * 0.8, letterSpacing: 1, lineHeight: 1, ...style }}>
      {agency.name}
    </div>
  );
}

/** Slanted banner, as in "TEAM OF THE WEEK". */
export function Kicker({ text, params, fontSize = 58 }: { text: string; params: TemplateParams; fontSize?: number }) {
  return (
    <div style={{ display: "inline-block", transform: "skewX(-14deg)", background: params.accent, padding: "6px 34px 4px" }}>
      <div
        style={{
          transform: "skewX(14deg)",
          fontFamily: CONDENSED,
          fontWeight: 800,
          fontStyle: "italic",
          fontSize,
          letterSpacing: 2,
          color: "#fff",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Heavy display text with a worn/grunge texture. */
export function GrungeText({ children, size, color, style }: { children: ReactNode; size: number; color: string; style?: CSSProperties }) {
  // inline-block so the mask covers the glyphs even when they are wider than the column
  return (
    <div
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.9,
        color,
        textTransform: "uppercase",
        WebkitMaskImage: GRUNGE,
        WebkitMaskSize: "400px 400px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Diameter of the highlight ring: r is the ring's own radius (% of the graphic's width) when the click snapped to his photo + labels, else the look's fallback size. */
export function ringSize(hl: { r?: number } | null | undefined, fallback: number | string): number | string {
  return hl?.r ? `${(hl.r * 2).toFixed(2)}%` : fallback;
}

/** The post-type specific block: official graphic, stats, transfer, etc. */
export function ContentBlock({
  data,
  width,
  height,
  framed = false,
}: {
  data: RenderData;
  width: number;
  height: number;
  framed?: boolean;
}) {
  const { content, params, postType, insetUrl } = data;
  const frame: CSSProperties = framed
    ? {
        border: `5px solid ${params.accent}`,
        boxShadow: `0 0 50px 6px color-mix(in srgb, ${params.accent} 45%, transparent), 0 30px 60px rgba(0,0,0,.6)`,
        borderRadius: 10,
        overflow: "hidden",
      }
    : {};

  if (insetUrl && (postType === "totw" || postType === "potm")) {
    const hl = content.insetHighlight;
    return (
      // The wrapper shrinks to the image so the highlight percentages match the graphic.
      <div style={{ position: "relative", display: "inline-block", verticalAlign: "bottom", ...frame }}>
        <img src={insetUrl} alt="" style={{ maxWidth: width, maxHeight: height, display: "block" }} />
        {hl && (
          <div
            style={{
              position: "absolute",
              left: `${hl.x}%`,
              top: `${hl.y}%`,
              width: ringSize(hl, Math.min(width, height) * 0.24),
              aspectRatio: "1",
              boxSizing: "border-box",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `5px solid ${params.accent}`,
              boxShadow: `0 0 30px 8px ${params.accent}, inset 0 0 20px 4px color-mix(in srgb, ${params.accent} 60%, transparent)`,
            }}
          />
        )}
      </div>
    );
  }

  if (postType === "totw" && !insetUrl) {
    return (
      <div
        style={{
          width,
          height,
          border: `4px dashed color-mix(in srgb, ${params.text} 40%, transparent)`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          fontWeight: 700,
          textAlign: "center",
          padding: 30,
          color: `color-mix(in srgb, ${params.text} 60%, transparent)`,
        }}
      >
        GRÁFICO OFICIAL DA LIGA
      </div>
    );
  }

  if (postType === "transfer") {
    return (
      <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
        {data.fromClub && (
          <>
            <ClubBadge club={data.fromClub} size={Math.min(190, width / 3.2)} dim />
            <div style={{ fontFamily: DISPLAY, fontSize: 110, color: params.accent, lineHeight: 1 }}>›</div>
          </>
        )}
        <ClubBadge club={data.toClub ?? data.club} size={Math.min(data.fromClub ? 190 : 240, width / 2.4)} />
      </div>
    );
  }

  if (postType === "renewal") {
    return (
      <div style={{ width, height, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: 54, letterSpacing: 6, color: params.accent }}>
          CONTRATO ATÉ
        </div>
        <div style={{ fontFamily: DISPLAY, fontSize: Math.min(260, height * 0.8), lineHeight: 0.9 }}>{content.until || "20XX"}</div>
      </div>
    );
  }

  if (postType === "result") {
    return (
      <div style={{ width, height, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, fontFamily: DISPLAY }}>
          <span style={{ fontSize: 46, flex: 1, textAlign: "right", textTransform: "uppercase" }}>{content.homeTeam}</span>
          <span style={{ fontSize: 120, color: params.accent, lineHeight: 1 }}>
            {content.homeGoals ?? 0}-{content.awayGoals ?? 0}
          </span>
          <span style={{ fontSize: 46, flex: 1, textTransform: "uppercase" }}>{content.awayTeam}</span>
        </div>
        {content.stats.length > 0 && <StatsGrid data={data} width={width} compact />}
      </div>
    );
  }

  return <StatsGrid data={data} width={width} />;
}

function StatsGrid({ data, width, compact = false }: { data: RenderData; width: number; compact?: boolean }) {
  const { content, params } = data;
  const stats = content.stats.slice(0, 4);
  if (stats.length === 0) return null;
  const cols = stats.length;
  const cell = width / cols;
  return (
    <div style={{ display: "flex", width }}>
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            width: cell,
            padding: "0 12px",
            borderLeft: i === 0 ? "none" : `3px solid color-mix(in srgb, ${params.text} 25%, transparent)`,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontSize: compact ? 90 : Math.min(170, cell * 0.75), lineHeight: 1, color: params.text }}>
            {s.value}
          </div>
          <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontStyle: "italic", fontSize: compact ? 28 : 36, letterSpacing: 3, color: params.accent, textTransform: "uppercase" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClubBadge({ club, size, dim = false }: { club: RenderClub | null; size: number; dim?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: dim ? 0.75 : 1 }}>
      {club?.crestUrl ? (
        <img src={club.crestUrl} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 10px 20px rgba(0,0,0,.5))" }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: "50%", border: "4px dashed rgba(255,255,255,.35)" }} />
      )}
      <div style={{ fontFamily: CONDENSED, fontWeight: 800, fontSize: 32, letterSpacing: 3, textTransform: "uppercase", textAlign: "center", maxWidth: size * 1.6 }}>
        {club?.name ?? "—"}
      </div>
    </div>
  );
}

export const BEBAS = "var(--font-bebas), Impact, sans-serif";
export const GROTESK = "var(--font-grotesk), var(--font-inter), sans-serif";
export const MONO = "var(--font-mono), ui-monospace, monospace";
export const SERIF = "var(--font-fraunces), Georgia, serif";
export const SANS = "var(--font-inter), system-ui, sans-serif";

/** Safe margin: keeps key elements inside Instagram's grid crop and away from edges. */
export const M = 72;

/** The other team's name (works for home and away games). */
function opponent(data: RenderData): string {
  const c = data.content;
  const ours = (data.club?.name ?? "").toLowerCase();
  if (c.home === true) return c.awayTeam ?? "";
  if (c.home === false) return c.homeTeam ?? "";
  if ((c.homeTeam ?? "").toLowerCase() === ours) return c.awayTeam ?? "";
  if ((c.awayTeam ?? "").toLowerCase() === ours) return c.homeTeam ?? "";
  return c.awayTeam ?? c.homeTeam ?? "";
}

/** The key facts of a post as value/label pairs, whatever its type. */
export function factRows(data: RenderData): StatItem[] {
  const c = data.content;
  switch (data.postType) {
    case "result":
      return [{ value: `${c.homeGoals ?? 0}-${c.awayGoals ?? 0}`, label: "Result" }, ...c.stats].slice(0, 4);
    case "matchday":
      // Kick-off and the opponent: "home / away" and city names read like a fixture list, not a poster.
      return [
        { value: c.time || "—", label: c.date || "Today" },
        { value: opponent(data) || c.venue || "—", label: "Opponent" },
      ];
    case "transfer":
      return [
        ...(data.fromClub ? [{ value: data.fromClub.name, label: "From" }] : []),
        { value: (data.toClub ?? data.club)?.name ?? "—", label: data.fromClub ? "To" : "New club" },
      ];
    case "renewal":
      return [{ value: c.until || "—", label: "Contract until" }];
    default:
      return c.stats.slice(0, 4);
  }
}

// English codes (positions arrive in English from positionEn; Portuguese kept as a fallback).
const POSITION_ABBR: [RegExp, string][] = [
  [/goalkeeper|guarda|gr\b/i, "GK"],
  [/right back|lateral direit|defesa direit/i, "RB"],
  [/left back|lateral esquerd|defesa esquerd/i, "LB"],
  [/centre back|back|central|defesa|defender/i, "CB"],
  [/defensive mid|trinco|m[eé]dio defensivo/i, "DM"],
  [/attacking mid|m[eé]dio ofensivo/i, "AM"],
  [/midfield|m[eé]dio/i, "CM"],
  [/right wing|extremo direit|ala direit/i, "RW"],
  [/left wing|extremo esquerd|ala esquerd/i, "LW"],
  [/wing|extremo|ala\b/i, "W"],
  [/striker|forward|avan[cç]ado|ponta de lan/i, "ST"],
];

export const positionAbbr = (position: string) => POSITION_ABBR.find(([re]) => re.test(position))?.[1] ?? "";

/** Sentence case for editorial headlines: "NEW DEAL" → "New deal". */
export const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/** Crest (or placeholder ring) with an optional name underneath. */
export function TeamBadge({ name, crestUrl, size, color }: { name?: string; crestUrl?: string | null; size: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: size * 1.5 }}>
      {crestUrl ? (
        <img src={crestUrl} alt="" style={{ width: size, height: size, objectFit: "contain", filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: "50%", border: `3px solid color-mix(in srgb, ${color} 35%, transparent)` }} />
      )}
      {name && (
        <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: 24, letterSpacing: 3, textTransform: "uppercase", textAlign: "center", color, lineHeight: 1.1 }}>
          {name}
        </div>
      )}
    </div>
  );
}
