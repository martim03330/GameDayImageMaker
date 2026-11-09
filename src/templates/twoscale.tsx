/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { cutMask } from "./fx";
import { rng, SCRIPT } from "./kit";
import { AgencyLogo, CONDENSED, DISPLAY, SANS } from "./shared";
import { interWidth } from "./caption";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const INK = "#1b1c1f";
const GREY = "#5d6066";

type Photo = { url: string; face: [number, number, number, number] | null; aspect: number; cutBottom: boolean };

/** The small figure: another whole-body cutout (the second photo first), else the main one. */
function actionPhoto(data: RenderData, seed: number): Photo | null {
  const whole = (c: RenderData["cutouts"][number]) => !!c.face && !(c.cut?.bottom ?? 0) && !(c.cut?.left ?? 0) && !(c.cut?.right ?? 0) && !(c.cut?.top ?? 0);
  const others = data.cutouts.filter((c) => c.url !== data.photoUrl && whole(c));
  const pick = others.find((c) => c.url === data.photo2Url) ?? others[seed % Math.max(1, others.length)];
  if (pick) return { url: pick.url, face: pick.face, aspect: pick.aspect ?? 0.45, cutBottom: false };
  if (!data.photoUrl) return null;
  return { url: data.photoUrl, face: data.face, aspect: data.photoAspect ?? 0.45, cutBottom: (data.cut?.bottom ?? 0) > 0 };
}

type Row = { title: string; sub: string[] };

const up = (s: string) => s.toUpperCase();
/** "0.6" / "86": a per-game rate that reads as a number, not a fraction. */
const rate = (v: number, games: number) => {
  const x = v / games;
  return x >= 10 ? String(Math.round(x)) : x.toFixed(1).replace(/\.0$/, "");
};

/** The award-style list: bold title, light lines under it. */
function rowsOf(data: RenderData): Row[] {
  const c = data.content;
  const t = data.postType;
  const rows: Row[] = [];
  const comp = (c.subline.split("·")[0] ?? "").trim();
  const round = c.subline.split("·").slice(1).map((s) => s.trim()).filter((s) => s && !/^VS\b/i.test(s)).join(" · ");
  const pos = [data.player.position, data.player.number ? `No. ${data.player.number}` : ""].filter(Boolean).join(" · ");
  const games = Number(c.stats.find((s) => /^games?$/i.test(s.label))?.value ?? 0);
  const statRows = (): Row[] =>
    c.stats
      .filter((s) => !/^games?$/i.test(s.label) && s.value && Number(s.value) !== 0)
      .map((s) => {
        const n = Number(s.value);
        const label = up(s.label);
        return { title: `${s.value} ${n === 1 ? label.replace(/S$/, "") : label}`, sub: games > 0 && Number.isFinite(n) ? [`${rate(n, games)} per game`] : [] };
      });
  if (t === "stats" || t === "potm") {
    rows.push({ title: c.kicker, sub: [c.subline, games && !/games?/i.test(c.subline) ? `${games} game${games === 1 ? "" : "s"}` : ""].filter(Boolean) });
    rows.push(...statRows());
  } else if (t === "goal") {
    rows.push({ title: c.kicker || "Goal", sub: [comp, round].filter(Boolean) });
    if (c.homeTeam && c.awayTeam && c.homeGoals != null && c.homeGoals !== "") rows.push({ title: `${c.homeTeam} ${c.homeGoals}-${c.awayGoals} ${c.awayTeam}`, sub: ["Full time"] });
    rows.push(...statRows().filter((r) => !/^1 GOAL$/.test(r.title)).map((r) => ({ ...r, sub: ["In the game"] })));
  } else if (t === "renewal") {
    rows.push({ title: c.kicker || "New deal", sub: [data.club?.name ?? ""].filter(Boolean) });
    if (c.until) rows.push({ title: `Until ${c.until}`, sub: ["Contract extension"] });
    if (pos) rows.push({ title: data.player.position || "", sub: data.player.number ? [`Shirt No. ${data.player.number}`] : [] });
  } else if (t === "transfer") {
    const to = (data.toClub ?? data.club)?.name;
    rows.push({ title: c.kicker || "New signing", sub: [to ?? ""].filter(Boolean) });
    if (data.fromClub) rows.push({ title: `From ${data.fromClub.name}`, sub: [] });
    if (pos) rows.push({ title: data.player.position || "", sub: data.player.number ? [`Shirt No. ${data.player.number}`] : [] });
  } else {
    rows.push({ title: c.kicker, sub: [c.subline] });
    rows.push(...statRows());
  }
  return rows
    .filter((r) => r.title)
    .slice(0, 3)
    .map((r) => ({ title: up(r.title), sub: r.sub.map(up) }));
}

/**
 * College awards poster (Ohio State, CJ Stroud): light grey studio, a huge soft black-and-white head and
 * shoulders of the player in profile high in the frame, a faint giant shirt number behind it, and in
 * front a small full-colour action cutout of him running across the lower middle with a ground shadow;
 * the name in wide thin caps crossing behind the small figure with a signature over it; bottom left an
 * award list (bold condensed title, light lines); crest and agency bottom right.
 */
export function Twoscale({ data }: { data: RenderData }) {
  const { params, content } = data;
  const r = rng(params.seed ?? 37);
  const right = params.side !== "left";
  const sgn = right ? 1 : -1;
  const ts = params.textScale ?? 1;

  // ---- the big head: same cutout, enlarged, never past what its pixels hold (softened instead) ----
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const aspect = data.photoAspect ?? 0.6;
  const want = 330 * (params.playerScale ?? 1);
  const bigFace = data.facePx > 0 ? Math.min(want, Math.max(200, data.facePx * 2.8)) : want;
  const mag = data.facePx > 0 ? (bigFace * 2) / data.facePx : 2;
  const soft = Math.min(6, Math.max(0.6, 0.6 + (mag - 2.6) * 0.9));
  const bh = bigFace / face[3];
  const bw = bh * aspect;
  const bcx = 540 + sgn * (50 + r() * 30) + (params.playerX ?? 0);
  const bcy = 430 + r() * 30 + (params.playerY ?? 0);
  const bigBox = { left: bcx - (face[0] + face[2] / 2) * bw, top: bcy - (face[1] + face[3] / 2) * bh, width: bw, height: bh };
  // Head and shoulders only: fades out below the collar and at the far sides.
  const fadeTop = bcy + bigFace * 0.6;
  const bigMask = `linear-gradient(to bottom, #000 ${Math.round(fadeTop)}px, transparent ${Math.round(fadeTop + bigFace * 0.95)}px), radial-gradient(${Math.round(bigFace * 2.1)}px ${Math.round(bigFace * 2.6)}px at ${Math.round(bcx)}px ${Math.round(bcy)}px, #000 55%, transparent 100%)`;

  // ---- the small action figure ----
  const act = actionPhoto(data, params.seed ?? 0);
  const floor = 1045 + r() * 20;
  const smallH = act?.cutBottom ? 600 : 520;
  const aFace = act?.face ?? [0.4, 0.06, 0.2, 0.12];
  const aw = smallH * (act?.aspect ?? 0.45);
  const acx = 540 - sgn * (70 + r() * 40);
  const smallBox = { left: acx - (aFace[0] + aFace[2] / 2) * aw, top: floor - smallH, width: aw, height: smallH };

  // ---- name, signature, number ----
  const first = content.firstName.trim();
  const last = content.lastName.trim();
  const name = up([first, last].filter(Boolean).join(" "));
  const nameSize = Math.min(34, 940 / Math.max(1, interWidth(name, 1, 0.9) * 1.02)) * ts;
  // Short names spread wider, so the letters still reach out past the small figure.
  const nameTrack = Math.min(2.4, Math.max(0.9, (780 / nameSize - interWidth(name, 1, 0)) / Math.max(1, [...name].length)));
  const nameY = floor - smallH * 0.36;
  const sigWord = (last.split(/\s+/).pop() || first.split(/\s+/)[0] || "").replace(/^\p{Ll}/u, (m) => m.toUpperCase());
  const sigSize = Math.min(105, 480 / Math.max(3, sigWord.length * 0.42));
  const number = data.player.number || "";
  const numSize = number.length > 1 ? 900 : 1000;

  // ---- award list ----
  const rows = rowsOf(data);
  const listW = 400;
  const titleSize = (t: string) => Math.min(34, listW / Math.max(1, t.length * 0.47)) * ts;
  const subSize = (t: string) => Math.min(25, listW / Math.max(1, interWidth(t, 1, 0.01))) * ts;
  const listStyle: CSSProperties = right ? { left: 62, alignItems: "flex-start", textAlign: "left" } : { right: 62, alignItems: "flex-end", textAlign: "right" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#e4e4e5", color: INK }}>
      {/* High-key studio: light top-left, soft grey towards the corners. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 35% 22%, #fbfbfb 0%, #eeeeef 40%, #d9d9db 100%)" }} />

      {/* Giant faint number behind everything. */}
      {number && (
        <div
          data-bleed
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            // Anton at line-height 1: caps run from 0.06em to 0.93em below the box top.
            top: bcy + 90 - numSize * 0.49,
            textAlign: "center",
            fontFamily: DISPLAY,
            fontSize: numSize,
            lineHeight: 1,
            letterSpacing: "0.02em",
            color: "rgba(0,0,0,.065)",
            WebkitTextStroke: "2px rgba(0,0,0,.07)",
            transform: `translateX(${-sgn * 30}px)`,
          }}
        >
          {number}
        </div>
      )}

      {/* The big head, black and white, soft. */}
      {data.photoUrl && data.photoIsCutout && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: bigMask, maskImage: bigMask, WebkitMaskComposite: "source-in", maskComposite: "intersect" } as CSSProperties}>
          <img
            src={data.photoUrl}
            alt=""
            style={{ position: "absolute", ...bigBox, maxWidth: "none", filter: `grayscale(1) contrast(1.04) brightness(1.1) blur(${soft.toFixed(1)}px)`, opacity: 0.92, ...cutMask(data.cut) }}
          />
        </div>
      )}
      {/* A white veil over the lower part of the head, so the small figure reads in front of it. */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent ${Math.round(nameY - 260)}px, rgba(236,236,237,.55) ${Math.round(nameY)}px, rgba(230,230,231,.9) ${Math.round(floor + 40)}px)` }} />

      {/* Name in wide thin caps, behind the small figure. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: nameY - nameSize * 0.6, textAlign: "center", fontFamily: SANS, fontWeight: 300, fontSize: nameSize, lineHeight: 1.2, letterSpacing: `${nameTrack.toFixed(2)}em`, paddingLeft: `${nameTrack.toFixed(2)}em`, color: INK, whiteSpace: "nowrap" }}>
        {name}
      </div>

      {/* Ground shadow, then the small full-colour figure. */}
      {act && (
        <>
          <div style={{ position: "absolute", left: acx - aw * 0.75, width: aw * 1.5, top: floor - 16, height: 32, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,.34), rgba(0,0,0,.12) 60%, transparent)", filter: "blur(4px)" }} />
          <div style={{ position: "absolute", left: 120, right: 120, top: floor + 6, height: 2, background: "linear-gradient(to right, transparent, rgba(0,0,0,.12), transparent)" }} />
          <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 22px rgba(0,0,0,.18))" }}>
            <img src={act.url} alt="" style={{ position: "absolute", ...smallBox, maxWidth: "none", filter: "contrast(1.06) saturate(1.1)", ...(act.cutBottom ? cutMask({ bottom: 1 }, 2) : {}) }} />
          </div>
        </>
      )}

      {/* Signature scribbled over the name. */}
      {sigWord && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameY - sigSize * 0.72, textAlign: "center", fontFamily: SCRIPT, fontSize: sigSize, lineHeight: 1, color: INK, opacity: 0.5, whiteSpace: "nowrap", transform: `translateX(${sgn * 40}px) rotate(${-9 + r() * 4}deg)` }}>
          {sigWord}
        </div>
      )}

      {/* Award list. */}
      <div style={{ position: "absolute", bottom: 64, width: listW, display: "flex", flexDirection: "column", gap: 30, ...listStyle }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-start" : "flex-end" }}>
            <div style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: titleSize(row.title), lineHeight: 1, letterSpacing: "0.01em", color: INK, whiteSpace: "nowrap" }}>{row.title}</div>
            {row.sub.map((s, j) => (
              <div key={j} style={{ fontFamily: SANS, fontWeight: 300, fontSize: subSize(s), lineHeight: 1.05, letterSpacing: "0.01em", color: GREY, whiteSpace: "nowrap", marginTop: j === 0 ? 4 : 0 }}>
                {s}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Crest and agency, small, bottom corner. */}
      <div style={{ position: "absolute", bottom: 66, [right ? "right" : "left"]: 62, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {data.club?.crestUrl && <img src={data.club.crestUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain", filter: "grayscale(1) contrast(1.1)", opacity: 0.8 }} />}
        <AgencyLogo data={data} onLight height={22} style={{ opacity: 0.75, color: INK, filter: data.agency.logoDarkUrl ? undefined : "brightness(0)" }} />
      </div>
    </div>
  );
}
