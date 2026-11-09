/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, MONO, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { mix, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const KRAFT = "#d5b27a";
const KRAFT_BACK = "#c29b5f";
const KRAFT_INK = "#5b4426";
const LABEL = "#f8f6f0";
const TYPE = "#232220";

/** JetBrains Mono advances exactly 0.6em; plus the tracking. */
const monoW = (t: string, size: number, track: number) => t.length * size * (0.6 + track);

/**
 * Folder: the matchday filed away. On a calm, deep club-tone ground a manila folder fills the lower part
 * of the frame — its back flap's tab labelled MATCHDAY in small spaced caps — and the player rises big from
 * behind it. On the front a neat typed label: the fixture (home first, names as
 * stored), the date and kick-off, the ground; the NEYOD mark printed on the kraft under it. `params.side`
 * puts him left or right; the tab sits on the other side.
 */
export function Folder({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.34 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const f = matchFacts(data);
  const [home, away] = teamsOf(data);
  const left = params.side === "left"; // player on the left, tab and label on the right

  /* ---- the folder ---- */
  const fx = story ? 64 : 72;
  const fw = CANVAS_W - 2 * fx;
  const backTop = (story ? 1036 : 770) + ty;
  const frontTop = backTop + (story ? 72 : 56);
  const tabW = (story ? 360 : 300) * Math.min(1.2, params.textScale ?? 1);
  const tabH = story ? 76 : 60;
  const tabX = left ? fx + fw - (story ? 56 : 48) - tabW : fx + (story ? 56 : 48);
  const radius = story ? 22 : 18;
  const tabLabel = (content.kicker || "Matchday").toUpperCase();
  const tabSize = Math.min(18 * k, (tabW - 60) / Math.max(1, bodyW(tabLabel, 1) * 1.12 + tabLabel.length * 0.34));

  /* ---- the logo, printed on the kraft at the foot ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* ---- the typed label ---- */
  const labelX = left ? fx + fw - (story ? 64 : 60) : fx + (story ? 64 : 60); // its outer edge (right edge when left)
  const labelW = story ? 680 : 560;
  const padX = 34 * (story ? 1.3 : 1);
  const innerW = labelW - 2 * padX;
  const lines1 = [home, away ? `v ${away}` : ""].filter(Boolean).map((t) => t.toUpperCase());
  const nSize = Math.max(16, Math.min(30 * k, ...lines1.map((t) => innerW / Math.max(1, t.length * 0.66))));
  const when = [niceDate(content.date), f.time].filter(Boolean).join(" · ").toUpperCase();
  const venue = ((content.venue ?? "").trim() || titleCase(f.venue)).toUpperCase();
  const sSize = Math.max(11, Math.min(19 * k, ...[when, venue].filter(Boolean).map((t) => innerW / Math.max(1, monoW(t, 1, 0.06)))));
  const strip = 10 * (story ? 1.3 : 1);
  const padTop = 30 * (story ? 1.3 : 1);
  const nLead = nSize * 1.32;
  const sLead = sSize * 1.6;
  const ruleGap = 22 * (story ? 1.3 : 1);
  const labelH = strip + padTop + lines1.length * nLead + (when || venue ? ruleGap * 2 + 1 : 0) + (when ? sLead : 0) + (venue ? sLead : 0) + padTop * 0.8;
  // ~68px over the logo, never tighter than ~40px under the front's top edge.
  const labelTop = Math.max(frontTop + 40, logoTop - (story ? 70 : 66) - labelH);
  const lx = left ? labelX - labelW : labelX;

  /* ---- the player, rising big out of the folder ---- */
  const sizes = story ? { chest: 360, waist: 290, knees: 236, full: 196 } : { chest: 270, waist: 214, knees: 172, full: 142 };
  const faceX = left ? (story ? 360 : 350) : CANVAS_W - (story ? 360 : 350);
  const probe = placeByFace(data, faceX, 300, sizes);
  const box = placeByFace(data, faceX, Math.max(story ? STORY_TOP + 120 : 150, probe.faceH * 1.05 + 40), sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const chin = box.top + face[1] * box.height + box.faceH;

  const ground = mix(shade(club, -0.55), "#1c1d20", 0.35);
  const kraftGrain = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0 0.12 0 0 0 0.16 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')}")`;
  const typed = { fontFamily: MONO, whiteSpace: "nowrap" as const, lineHeight: 1, color: TYPE };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* Calm ground: a soft light where he stands. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(50% 40% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${mix(shade(club, -0.2), "#45464a", 0.3)}, transparent 80%)`, opacity: 0.9 }} />

      {/* The player, rising from behind the folder (cut at its back edge). */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 1.9, top: chin + box.faceH * 0.4, width: box.faceH * 3.8, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: `blur(${story ? 70 : 54}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px 0px ${H - backTop - 4}px 0px)` }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The back flap and its tab. */}
      <div style={{ position: "absolute", left: fx, top: backTop, width: fw, height: H - backTop + 40, background: KRAFT_BACK, backgroundImage: kraftGrain, borderTopLeftRadius: radius, borderTopRightRadius: radius, boxShadow: `0 ${-6 * k}px ${40 * k}px rgba(0,0,0,.25)` }} />
      <div style={{ position: "absolute", left: tabX, top: backTop - tabH + 2, width: tabW, height: tabH, background: KRAFT_BACK, backgroundImage: kraftGrain, borderTopLeftRadius: radius * 0.9, borderTopRightRadius: radius * 0.9, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: tabSize, letterSpacing: "0.34em", paddingLeft: "0.34em", lineHeight: 1, color: KRAFT_INK, whiteSpace: "nowrap" }}>{tabLabel}</span>
      </div>

      {/* The front flap, its edge casting a soft shade up onto him. */}
      <div style={{ position: "absolute", left: fx, right: fx, top: frontTop - 26, height: 26, background: "linear-gradient(to bottom, transparent, rgba(60,40,10,.25))" }} />
      <div style={{ position: "absolute", left: fx, top: frontTop, width: fw, height: H - frontTop + 40, background: `linear-gradient(to bottom, ${KRAFT}, ${shade(KRAFT, -0.08)})`, borderTopLeftRadius: 6, borderTopRightRadius: 6, boxShadow: "0 -1px 0 rgba(255,255,255,.35) inset, 0 -2px 10px rgba(0,0,0,.18)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: kraftGrain, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
      </div>

      {/* The typed label. */}
      <div style={{ position: "absolute", left: lx, top: labelTop, width: labelW, height: labelH, background: LABEL, borderRadius: 3, boxShadow: "0 2px 6px rgba(60,40,10,.18), 0 1px 1px rgba(60,40,10,.2)" }}>
        <div style={{ height: strip, background: club, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
        <div style={{ position: "absolute", left: padX, top: strip + padTop }}>
          {lines1.map((t, i) => (
            <div key={i} style={{ ...typed, height: nLead, fontSize: nSize, fontWeight: 700, letterSpacing: "0.04em" }}>
              {i === 1 ? (
                <>
                  <span style={{ fontWeight: 400, opacity: 0.55 }}>v </span>
                  {t.slice(2)}
                </>
              ) : (
                t
              )}
            </div>
          ))}
          {(when || venue) && <div style={{ width: innerW, height: 1, margin: `${ruleGap - nLead + nSize * 1.05}px 0 ${ruleGap}px`, borderTop: `1px dashed rgba(35,34,32,.35)` }} />}
          {when && <div style={{ ...typed, height: sLead, fontSize: sSize, fontWeight: 500, letterSpacing: "0.06em" }}>{when}</div>}
          {venue && <div style={{ ...typed, height: sLead, fontSize: sSize, fontWeight: 500, letterSpacing: "0.06em", opacity: 0.62 }}>{venue}</div>}
        </div>
      </div>

      <AgencyLogo data={data} height={22} onLight style={{ position: "absolute", ...(left ? { right: CANVAS_W - labelX } : { left: labelX }), bottom: logoBottom, transform: `scale(${logoScale})`, transformOrigin: left ? "right bottom" : "left bottom" }} />
      <Film strength={0.1} />
    </div>
  );
}
