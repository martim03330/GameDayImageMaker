/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { ARCHIVO, Film } from "./fx";
import { rng, SCRIPT } from "./kit";
import { standing } from "./mist";
import { scoreOf } from "./outline";
import { AgencyLogo } from "./shared";
import { matchFacts } from "./strokes";
import { KitPopDefs } from "./triangles";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { titleCase } from "./wall";

const BG = "#ebebeb";
const GREY = "#4b4b4d";
const SOFT = "#7a7a7c";

/** The crest redrawn in one flat colour: its dark and coloured parts in `ink`, its pale parts left out. */
function CrestInkDefs({ id, ink }: { id: string; ink: string }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.55 -1 -0.2 1.8 -0.1" result="a" />
        <feColorMatrix in="a" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3 -0.9" result="thr" />
        <feFlood floodColor={ink} />
        <feComposite in2="thr" operator="in" />
      </filter>
      {/* White silhouette for the giant watermark. */}
      <filter id={`${id}-w`} colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
      </filter>
    </svg>
  );
}

/** "SAT 10 OCT" → "10 OCT". */
const dayMonth = (d: string) => d.replace(/^[A-Z]{3}\s+/, "");

/** Bold grotesk caps (Archivo 800): average advance relative to the size. */
const W = 0.66;
const fit = (t: string, width: number, max: number, ratio = W) => Math.min(max, width / Math.max(1, [...t].length * ratio));

/**
 * Minimal light matchday (Flamengo "Copa Rio"): pale grey studio with a huge faint white crest and a
 * huge faint script name behind, a vertical grey panel down the middle and thin club-colour rules at
 * the corners. Top: the crest in club colour, the competition, "HOME vs" small over the other side big,
 * date | kick-off and venue. The player in action, black and white with only the club colour kept,
 * stands on a glossy floor that mirrors him; underneath, his name in spaced caps, a thin club-colour
 * rule and the logo row.
 */
export function Reflect({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 49;
  const r = rng(seed);
  const ts = params.textScale ?? 1;
  const id = `rfl-${seed}`;
  const m = matchFacts(data);

  // ---- colours ----
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.6) club = vivid(params.accent);
  const lum = luminance(club);
  const rule = lum < 0.03 ? "#2a2a2c" : lum > 0.45 ? shade(club, -0.3) : club;
  const hues = [hueOf(club), hueOf(params.primary), hueOf(params.accent)].filter((h): h is number => h != null);
  const hue = hues[0] ?? null;

  // ---- words ----
  const now = new Date();
  const y = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const comp =
    postType === "transfer" || postType === "renewal"
      ? `SEASON ${y}/${String((y + 1) % 100).padStart(2, "0")}`
      : [m.comp, m.round].filter(Boolean).join(" · ") || content.subline.toUpperCase();
  const home = (content.homeTeam ?? "").toUpperCase();
  const away = (content.awayTeam ?? "").toUpperCase();
  const ours = (data.club?.name ?? "").toUpperCase();
  const score = scoreOf(data, " - ");
  const when = [dayMonth(m.date), m.time].filter(Boolean);
  let small = "";
  let big = "";
  let info: string[] = [];
  let under = m.venue ? titleCase(m.venue).toUpperCase() : "";
  if (postType === "matchday") {
    small = home && away ? `${home} vs` : content.kicker.toUpperCase();
    big = home && away ? away : m.opp ? `VS ${m.opp}` : ours;
    info = when;
  } else if (postType === "result" || postType === "goal") {
    small = home && away ? `${home} vs ${away}` : m.opp ? `VS ${m.opp}` : ours;
    big = postType === "result" ? score || content.kicker.toUpperCase() : content.kicker.toUpperCase();
    info = postType === "result" ? ["FULL TIME", dayMonth(m.date)].filter(Boolean) : [score, dayMonth(m.date)].filter(Boolean);
  } else {
    const to = data.toClub ?? data.club;
    small = content.kicker.toUpperCase();
    big = (to?.name ?? ours).toUpperCase();
    info = [data.fromClub ? `FROM ${data.fromClub.name.toUpperCase()}` : "", content.until ? `UNTIL ${content.until}` : ""].filter(Boolean);
    under = data.player.position.toUpperCase();
  }
  const bigSize = fit(big, 760, big.length <= 4 ? 110 : 84) * ts;
  const smallSize = fit(small, 700, 40) * ts;
  const infoText = info.join("  |  ");
  const infoSize = fit(infoText, 640, 30, 0.72);
  const compSize = fit(comp, 560, 21, 0.8);
  const underSize = fit(under, 520, 20, 0.78);

  // ---- vertical rhythm ----
  const crestTop = 52;
  const crestSize = 112;
  const compTop = crestTop + crestSize + 26;
  const smallTop = compTop + compSize + 26;
  const bigTop = smallTop + smallSize * 1.05;
  const infoTop = bigTop + bigSize * 1.02;
  const underTop = infoTop + (infoText ? infoSize * 1.3 : 0);
  const textBottom = underTop + (under ? underSize * 1.4 : 0);

  // ---- the player, standing on the mirror ----
  const floor = 1092;
  const headTop = Math.max(textBottom + 36, 420) + r() * 16;
  // Always the whole figure: the mirror needs his feet (a photo cut at the legs falls back below).
  let box = standing(data, { cx: 540 + (r() - 0.5) * 70, headTop, floor, maxFace: 110, framing: "full" });
  const feet = box.feet;
  // No feet in the photo: nothing to mirror. He is scaled down so his cut ends just past the floor line,
  // where it dissolves into the glossy floor, leaving the foot of the page to the name.
  if (!feet) {
    const s = (floor + 40 - headTop) / Math.max(1, CANVAS_H - headTop);
    const w = box.width * s;
    const left = box.faceCx - (box.faceCx - box.left) * s;
    const top = headTop + (box.top - headTop) * s;
    box = { ...box, left, top, width: w, height: box.height * s, faceTop: headTop + (box.faceTop - headTop) * s, faceH: box.faceH * s };
  }
  const fadeFrom = feet ? 1 : (floor - 120 - box.top) / box.height;
  const fadeTo = feet ? 1 : (floor + 30 - box.top) / box.height;
  const popFilter = hue != null ? `url(#${id}-pop) contrast(1.06)` : "grayscale(1) contrast(1.1)";
  const imgStyle: CSSProperties = { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none" };

  // ---- foot ----
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const nameSize = fit(name, 560, 40, 0.95) * ts;
  const script = titleCase((content.lastName || content.firstName).toUpperCase());
  const scriptSize = Math.min(360, 1150 / Math.max(3, [...script].length * 0.52));

  const panel = { left: 330, width: 420 };
  const ruleBar = (s: CSSProperties) => <div style={{ position: "absolute", height: 4, background: rule, ...s }} />;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: BG, color: GREY }}>
      <CrestInkDefs id={`${id}-ink`} ink={rule} />
      {hue != null && <KitPopDefs id={`${id}-pop`} hues={hues} />}

      {/* Studio: light from above, halftone dots fading in the top corners. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 35%, #f7f7f7, transparent 75%)" }} />
      <div
        data-bleed
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(0,0,0,.09) 1.6px, transparent 2.2px)",
          backgroundSize: "12px 12px",
          WebkitMaskImage: "radial-gradient(38% 24% at 0% 0%, #000, transparent), radial-gradient(38% 24% at 100% 0%, #000, transparent)",
          maskImage: "radial-gradient(38% 24% at 0% 0%, #000, transparent), radial-gradient(38% 24% at 100% 0%, #000, transparent)",
        }}
      />

      {/* Giant white crest and giant faint script name. */}
      {data.club?.crestUrl && (
        <img
          src={data.club.crestUrl}
          alt=""
          data-bleed
          style={{ position: "absolute", left: 540 - 720 + (r() - 0.5) * 120, top: 170, width: 1440, height: 1240, objectFit: "contain", filter: `url(#${id}-ink-w)`, opacity: 0.75 }}
        />
      )}
      <div
        data-bleed
        style={{ position: "absolute", left: -200, right: -200, top: 640 - scriptSize * 0.62, textAlign: "center", fontFamily: SCRIPT, fontSize: scriptSize, lineHeight: 1.2, color: "rgba(60,60,64,.1)", whiteSpace: "nowrap", transform: "rotate(-4deg)" }}
      >
        {script}
      </div>

      {/* Central panel: darker at the head of the page, then a pale column down to the floor. */}
      <div style={{ position: "absolute", left: panel.left, width: panel.width, top: 0, height: compTop - 14, background: "rgba(0,0,0,.075)" }} />
      <div style={{ position: "absolute", left: panel.left, width: panel.width, top: compTop - 14, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.05), rgba(0,0,0,.035) 70%, rgba(0,0,0,.06))" }} />
      <div style={{ position: "absolute", left: 84, right: 84, top: smallTop - 20, height: floor - smallTop + 20, background: "rgba(255,255,255,.28)" }} />

      {/* Club-colour rules in the corners. */}
      {ruleBar({ left: 58, width: 266, top: 32 })}
      {ruleBar({ right: 58, width: 266, top: 32 })}
      {ruleBar({ left: 58, width: 266, bottom: 32 })}
      {ruleBar({ right: 58, width: 266, bottom: 32 })}

      {/* Header. */}
      {data.club?.crestUrl && (
        <img src={data.club.crestUrl} alt="" style={{ position: "absolute", left: 540 - crestSize / 2, top: crestTop, width: crestSize, height: crestSize, objectFit: "contain", filter: `url(#${id}-ink)` }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: compTop, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 700, fontSize: compSize, letterSpacing: "0.08em", color: GREY, whiteSpace: "nowrap" }}>{comp}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: smallTop, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: smallSize, lineHeight: 1, color: GREY, whiteSpace: "nowrap" }}>
        {small.endsWith(" vs") ? (
          <>
            {small.slice(0, -3)} <span style={{ fontWeight: 600, fontSize: smallSize * 0.78, textTransform: "none" }}>vs</span>
          </>
        ) : (
          small
        )}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: bigTop, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: bigSize, lineHeight: 1, color: GREY, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>{big}</div>
      {infoText && (
        <div style={{ position: "absolute", left: 0, right: 0, top: infoTop, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 600, fontSize: infoSize, lineHeight: 1, color: GREY, whiteSpace: "pre", letterSpacing: "0.06em" }}>
          {infoText}
        </div>
      )}
      {under && (
        <div style={{ position: "absolute", left: 0, right: 0, top: underTop, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 400, fontSize: underSize, lineHeight: 1, color: SOFT, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>{under}</div>
      )}

      {/* Glossy floor: a faint horizon line and a brighter band. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: floor - 2, height: 260, background: "linear-gradient(to bottom, rgba(255,255,255,.55), rgba(255,255,255,0) 60%)" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: floor - 1, height: 1, background: "linear-gradient(to right, transparent, rgba(0,0,0,.08), transparent)" }} />

      {/* Reflection: the player flipped at his soles, fading out. */}
      {data.photoUrl && feet && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: floor,
            width: CANVAS_W,
            height: CANVAS_H - floor,
            overflow: "hidden",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,.5), transparent 78%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,.5), transparent 78%)",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: -floor, width: CANVAS_W, height: floor * 2, transform: "scaleY(-1)", transformOrigin: `50% ${floor}px` }}>
            <img src={data.photoUrl} alt="" style={{ ...imgStyle, filter: `${popFilter} blur(1.2px)` }} />
          </div>
        </div>
      )}
      {/* Contact shadow. */}
      {feet && <div style={{ position: "absolute", left: box.faceCx - box.width * 0.32, width: box.width * 0.64, top: floor - 14, height: 28, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.35), transparent)" }} />}

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 24px rgba(0,0,0,.18))" }}>
          <img src={data.photoUrl} alt="" style={{ ...imgStyle, filter: popFilter, ...(feet ? {} : { WebkitMaskImage: `linear-gradient(to bottom, #000 ${(fadeFrom * 100).toFixed(1)}%, transparent ${(fadeTo * 100).toFixed(1)}%)`, maskImage: `linear-gradient(to bottom, #000 ${(fadeFrom * 100).toFixed(1)}%, transparent ${(fadeTo * 100).toFixed(1)}%)` }) }} />
        </div>
      )}

      {/* Foot: name, rule, logos. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontFamily: ARCHIVO, fontWeight: 800, fontSize: nameSize, letterSpacing: "0.16em", paddingLeft: "0.16em", color: GREY, whiteSpace: "nowrap", lineHeight: 1 }}>
        {name}
      </div>
      <div style={{ position: "absolute", left: 540 - 130, width: 260, top: 1170 + nameSize + 14, height: 3, background: rule }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170 + nameSize + 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 34 }}>
        <AgencyLogo data={data} height={34} onLight style={{ opacity: 0.85 }} />
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ height: 40, width: 40, objectFit: "contain", filter: "grayscale(1) brightness(.6) contrast(1.3)", opacity: 0.8 }} />}
      </div>

      <Film strength={0.3} />
    </div>
  );
}
