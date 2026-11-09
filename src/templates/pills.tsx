/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const PAPER = "#efede8";
const INK = "#15161a";
const M = 64;

/** The club name exactly as stored (clubs.short_name, e.g. "SC Vianense SAD") — never shortened; only the case may change. */
function shortName(n: string): string {
  const words = n.split(/\s+/).filter(Boolean);
  const s = words.join(" ") || n;
  return s;
}

/**
 * Pills: modern app-UI chips. The player big on a clean ground (off-white or a deep club tone), and the
 * information as a tidy flowing row of rounded tags — the title filled in the club colour, then a pill with
 * the two small crests and "Home v Away", the date, kick-off, ground and competition — near the foot or the top.
 */
export function Pills({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const ts = params.textScale ?? 1;
  const r = rng(params.seed ?? 5);
  const dark = r() < 0.5;
  const atTop = r() < 0.3;
  const centred = r() < 0.4;
  // Native Instagram story (1080×1920): logo/chips span STORY_TOP…STORY_BOTTOM, ~1.4× type, a bigger player filling the middle.
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.4 : 1;

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.6) club = shade(club, -0.45);
  if (luminance(club) < 0.03) club = shade(club, 0.2);
  const ground = dark ? shade(club, -0.8) : PAPER;
  const ink = dark ? "#ffffff" : INK;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");
  const isResult = (postType === "result" || postType === "goal") && !!score;

  /* ---- the pills ---- */
  const typed = [content.homeTeam, content.awayTeam].find((t) => t && t.toUpperCase() === f.opp);
  const them = shortName(typed && typed !== typed.toUpperCase() ? typed : titleCase(typed ?? f.opp));
  const ours = shortName(data.club?.name ?? "");
  const home = content.home !== false;
  const pair = (home ? [ours, them] : [them, ours]).filter(Boolean);
  const crestPair = (home ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]) as (string | null)[];
  const label = isResult && postType === "result" ? "Full Time" : titleCase((content.kicker || "Matchday").toUpperCase());
  const date = f.day ? `${f.day} ${titleCase(f.mon)}` : "";
  const comp = titleCase(f.comp || f.round || "");
  const fs = 23 * k * ts;

  const pillBase: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    height: fs * 2.15,
    padding: `0 ${fs * 0.95}px`,
    borderRadius: 999,
    fontFamily: SANS,
    fontWeight: 500,
    fontSize: fs,
    letterSpacing: "-0.005em",
    lineHeight: 1,
    whiteSpace: "nowrap",
    color: ink,
    background: dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.86)",
    border: `1px solid ${dark ? "rgba(255,255,255,.3)" : "rgba(21,22,26,.16)"}`,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };
  const onClub = luminance(club) > 0.5 ? INK : "#ffffff";
  const pills: { key: string; node: ReactNode; style?: CSSProperties }[] = [
    { key: "label", node: label, style: { background: club, border: `1px solid ${club}`, color: onClub, fontWeight: 600 } },
  ];
  if (pair.length) {
    const crest = (c: string | null, i: number) => (c ? <img key={i} src={c} alt="" style={{ width: fs * 1.15, height: fs * 1.15, objectFit: "contain" }} /> : null);
    pills.push({
      key: "fixture",
      node: (
        <>
          {crest(crestPair[0], 0)}
          <span>{pair.length === 2 ? `${pair[0]} ${isResult ? score : "v"} ${pair[1]}` : pair[0]}</span>
          {crest(crestPair[1], 1)}
        </>
      ),
      style: { paddingLeft: crestPair[0] ? fs * 0.55 : undefined, paddingRight: crestPair[1] ? fs * 0.55 : undefined },
    });
  }
  if (date) pills.push({ key: "date", node: date });
  if (f.time && !isResult) pills.push({ key: "time", node: f.time });
  if (f.venue) pills.push({ key: "venue", node: titleCase(f.venue) });
  if (comp) pills.push({ key: "comp", node: comp });

  /* ---- layout ---- */
  const gap = story ? 14 : 12;
  const rowH = fs * 2.15;
  // Rows the cluster will take (rough): Inter 500 ≈ 0.55em per character.
  let rows = 1;
  let x = 0;
  const textOf = (k: string) => (k === "label" ? label : k === "fixture" ? `${pair.join(" v ")}xxxxx` : k === "date" ? date : k === "time" ? f.time : k === "venue" ? f.venue : comp);
  for (const p of pills) {
    const w = textOf(p.key).length * fs * 0.56 + fs * 1.9;
    if (x > 0 && x + w > CANVAS_W - 2 * M) {
      rows++;
      x = 0;
    }
    x += w + gap;
  }
  const clusterH = rows * rowH + (rows - 1) * gap;
  const clusterTop = atTop ? (story ? STORY_TOP : 168) + (params.textY ?? 0) : (story ? STORY_BOTTOM : CANVAS_H - 150) - clusterH + (params.textY ?? 0);

  const faceTop = atTop ? clusterTop + clusterH + (story ? 90 : 64) : story ? 330 : 170;
  const box = story ? placeByFace(data, 540, faceTop, { chest: 430, waist: 340, knees: 250, full: 190 }) : placeByFace(data, 540, faceTop, { chest: 330, waist: 262, knees: 196, full: 146 });
  // Story: he melts into the ground just before the chips (or the logo), so nothing of him runs on under them.
  const fadeEnd = atTop ? STORY_BOTTOM - 120 : clusterTop + clusterH * 0.4;
  const melt = story ? `linear-gradient(to bottom, #000 0, #000 ${fadeEnd - 320}px, transparent ${fadeEnd}px)` : undefined;
  const logoEdge = story ? (atTop ? H - STORY_BOTTOM : STORY_TOP) : 52;

  const logoStyle: CSSProperties = atTop
    ? { position: "absolute", left: centred ? "50%" : M, bottom: logoEdge - (params.logoY ?? 0), transform: `${centred ? "translateX(-50%) " : ""}scale(${params.logoScale ?? 1})`, transformOrigin: centred ? "center bottom" : "left bottom" }
    : { position: "absolute", left: M, top: logoEdge - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "left top" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: dark ? `radial-gradient(70% 55% at 50% 42%, ${shade(club, -0.6)}, ${ground} 80%)` : `radial-gradient(70% 55% at 50% 40%, #f7f6f2, ${PAPER} 75%)`,
        }}
      />

      {/* The player, big, natural colour. */}
      {data.photoUrl &&
        (melt ? (
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: melt, maskImage: melt }}>
            <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
          </div>
        ) : (
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.04)", ...cutMask(data.cut) }} />
        ))}
      {!atTop && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 380, background: `linear-gradient(to bottom, transparent, ${ground}${dark ? "b3" : "8c"})` }} />}

      {/* The chips. */}
      <div style={{ position: "absolute", left: M, right: M, top: clusterTop, display: "flex", flexWrap: "wrap", gap, justifyContent: centred ? "center" : "flex-start" }}>
        {pills.map((p) => (
          <div key={p.key} style={{ ...pillBase, ...p.style }}>
            {p.node}
          </div>
        ))}
      </div>

      <AgencyLogo data={data} height={story ? 26 : 20} onLight={!dark} style={logoStyle} />
      <Film strength={dark ? 0.16 : 0.1} />
    </div>
  );
}
