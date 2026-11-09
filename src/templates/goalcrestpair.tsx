/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { MonoDefs, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";

/** The club name exactly as stored (e.g. "SC Vianense SAD") — never shortened; only the case may change. */
const clean = (n: string) => n.split(/\s+/).filter(Boolean).join(" ") || n;

/**
 * Goal crestpair: the goal post of `crestpair`. Both crests as very large, very faint watermarks on a deep
 * club ground — home on the left, away on the right — the celebrating player centred in front of them in
 * natural colour. "GOAL" small at the top; at the foot his name and the fixture (never a score).
 */
export function Goalcrestpair({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const ts = params.textScale ?? 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  const bright = luminance(club) > 0.4;
  const ground = bright ? shade(club, -0.86) : luminance(club) < 0.03 ? "#111216" : shade(club, -0.55);
  const low = shade(ground, -0.4);

  const f = matchFacts(data);
  const ours = clean(data.club?.name ?? "");
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(ours) ? true : lc(content.awayTeam) === lc(ours) ? false : true);

  /* ---- the watermarks: home left, away right ---- */
  const home = weHost ? f.ourCrest : f.oppCrest;
  const away = weHost ? f.oppCrest : f.ourCrest;
  const cSize = story ? 620 : 560;
  const cy = story ? STORY_TOP + 480 : 470;
  const coloured = !!params.crestColor;

  /* ---- the player, centred, celebrating in front of the marks ---- */
  const faceTop = story ? STORY_TOP + 380 : 330;
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 60 : 0);
  let box = story ? placeByFace(data, faceX, faceTop, { chest: 290, waist: 228, knees: 176, full: 134 }) : placeByFace(data, faceX, faceTop, { chest: 250, waist: 196, knees: 150, full: 112 });
  // Arms up to one side: centre the figure a little rather than the face.
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };

  /* ---- type ---- */
  const title = (content.kicker || "GOAL").toUpperCase();
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) !== lc(ours));
  const them = clean(typed ?? titleCase(f.opp ?? ""));
  const pair = (weHost ? [ours, them] : [them, ours]).filter(Boolean);
  const fixture = pair.join("  v  ");
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").trim().toUpperCase();
  const W = story ? 900 : 820;
  const em = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").length;
  const fit = (t: string, max: number, per = 0.53) => Math.max(12 * k, Math.min(max * k * ts, W / Math.max(1, em(t) * per)));
  const nameSize = fit(name, 30, 0.95);
  const fixSize = Math.min(nameSize * 0.72, fit(fixture, 21));

  const logoBottom = (story ? H - STORY_BOTTOM : 44) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const footBottom = (story ? H - STORY_BOTTOM + logoH + 62 : 44 + logoH + 34) - (params.textY ?? 0);
  const fadeTop = H - footBottom - (story ? 560 : 400);
  const caps: CSSProperties = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.34em", paddingLeft: "0.34em", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 };

  const mark = (url: string | null | undefined, cx: number) =>
    url ? (
      <img
        data-bleed
        src={url}
        alt=""
        style={{ position: "absolute", left: cx - cSize / 2, top: cy - cSize / 2, width: cSize, height: cSize, objectFit: "contain", opacity: coloured ? 0.07 : 0.08, filter: coloured ? "grayscale(.2)" : "url(#goalcrestpair-mono)" }}
      />
    ) : null;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: WHITE }}>
      <MonoDefs id="goalcrestpair-mono" ink={0.55} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 50% at 50% ${Math.round((cy / H) * 100)}%, ${shade(ground, 0.12)}, ${ground} 60%, ${low} 100%)` }} />

      {mark(home, story ? 250 : 255)}
      {mark(away, story ? 830 : 825)}

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }}
        />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: fadeTop, bottom: 0, background: `linear-gradient(to bottom, ${low}00, ${low}f2 ${story ? 320 : 250}px, ${low} ${story ? 440 : 330}px)` }} />

      {/* Title: small, top centre. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: (story ? STORY_TOP : 64) + (params.textY ?? 0), textAlign: "center", ...caps, fontSize: 18 * k * ts }}>{title}</div>

      {/* Foot: his name, then the fixture. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: footBottom, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k, whiteSpace: "nowrap" }}>
        {name && <div style={{ ...caps, letterSpacing: "0.2em", paddingLeft: "0.2em", fontSize: nameSize }}>{name}</div>}
        {fixture && <div style={{ fontFamily: SANS, fontSize: fixSize, fontWeight: 300, lineHeight: 1.2, opacity: 0.75 }}>{fixture}</div>}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: logoBottom, display: "flex", justifyContent: "center" }}>
        <AgencyLogo data={data} height={story ? 26 : 20} style={{ transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }} />
      </div>
      <Film strength={0.18} />
    </div>
  );
}
